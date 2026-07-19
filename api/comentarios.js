// Vercel serverless function: comentarios de clientes sobre una cotización.
//
// La cotización sigue viajando entera en el hash del link (sin backend); lo
// único que se guarda aquí es el hilo de comentarios, amarrado al `id` de la
// cotización (genId() en src/lib/cotizador.js).
//
//   GET    /api/comentarios?quote=<id>   → { comentarios: [...] }
//   POST   /api/comentarios              → { comentario } + aviso por WhatsApp
//   DELETE /api/comentarios              → borra los comentarios de aprobación
//                                          (requiere la clave del cotizador;
//                                          regresa la cotización a "no aprobada")
//
// Quien tenga el link puede leer y escribir comentarios de esa cotización:
// el link es la credencial, igual que para ver la cotización misma. Quitar
// una aprobación sí pide la clave: solo el admin puede revertir ese estado.
//
// Setup (Vercel → Project → Settings → Environment Variables):
//   SUPABASE_URL              = https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY = service_role key (Supabase → Settings → API)
//   COTIZADOR_KEY_HASH        = sha256 hex de la clave del cotizador (misma que api/cotizar.js)
//   CALLMEBOT_PHONE           = +52155… (número con lada, el que registraste)
//   CALLMEBOT_APIKEY          = la key que te dio CallMeBot por WhatsApp
// Tabla: correr supabase/cotizador-comentarios.sql en el SQL Editor.
// Sin las dos primeras, el endpoint responde 501 y el panel de comentarios
// simplemente no aparece. Sin las de CallMeBot los comentarios se guardan
// igual, solo no llega el aviso.

import { createHash, timingSafeEqual } from "node:crypto";

const MAX_TEXTO = 2000;
const MAX_AUTOR = 80;
const MAX_META = 200;
// Tope por cotización: sin esto un link filtrado se puede llenar de basura.
const MAX_POR_COTIZACION = 200;
const TABLE = "cotizador_comentarios";
// Prefijos del comentario de aprobación (LABELS.aprobadaComentario en
// src/lib/cotizador.js, ambos idiomas). Las funciones de api/ no importan de
// src/, así que van duplicados; si cambian allá, cambiarlos aquí también.
const APROBACION_MARKS = ["✅ Cotización aprobada", "✅ Quote approved"];
// Prefijos del comentario de rechazo (LABELS.rechazadaComentario, ambos
// idiomas). Mismo trato que las de aprobación: si cambian en src/, aquí también.
const RECHAZO_MARKS = ["🚫 Cotización rechazada", "🚫 Quote declined"];

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { rest: `${url.replace(/\/+$/, "")}/rest/v1/${TABLE}`, key };
}

async function sb(cfg, query, init = {}) {
  const res = await fetch(cfg.rest + query, {
    ...init,
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`supabase-${res.status}`);
  return res;
}

// Misma verificación que api/quotes.js: la clave del cotizador viaja en el
// body y se compara por hash contra COTIZADOR_KEY_HASH.
function checkClave(clave) {
  const expectedHash = process.env.COTIZADOR_KEY_HASH;
  if (!expectedHash) return false;
  const claveHash = createHash("sha256").update(String(clave || "")).digest();
  let expected;
  try {
    expected = Buffer.from(expectedHash, "hex");
  } catch (e) {
    expected = Buffer.alloc(0);
  }
  return expected.length === claveHash.length && timingSafeEqual(claveHash, expected);
}

// El aviso a WhatsApp nunca debe tumbar el guardado: si CallMeBot falla, el
// comentario ya quedó en la base y el cliente no tiene por qué enterarse.
async function notificar({ autor, texto, numero, cliente, host }) {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) return;

  const quien = [autor, cliente].filter(Boolean).join(" · ") || "Cliente";
  const corto = texto.length > 600 ? texto.slice(0, 600) + "…" : texto;
  const msg = [
    `💬 Nuevo comentario en la cotización ${numero || ""}`.trim(),
    `De: ${quien}`,
    "",
    corto,
    "",
    `Ábrela en https://${host}/cotizador`,
  ].join("\n");

  const url =
    "https://api.callmebot.com/whatsapp.php" +
    `?phone=${encodeURIComponent(phone)}` +
    `&apikey=${encodeURIComponent(apikey)}` +
    `&text=${encodeURIComponent(msg)}`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    await fetch(url, { signal: ctrl.signal });
  } catch (e) {
    // Ignorado a propósito — ver comentario arriba.
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  const cfg = config();
  if (!cfg) {
    // El front esconde el panel de comentarios cuando ve esto.
    res.status(501).json({ error: "not-configured" });
    return;
  }

  if (req.method === "GET") {
    const quote = String((req.query && req.query.quote) || "").slice(0, 100);
    if (!quote) {
      res.status(400).json({ error: "missing-quote" });
      return;
    }
    try {
      const r = await sb(
        cfg,
        `?quote_id=eq.${encodeURIComponent(quote)}` +
          `&select=id,autor,texto,created_at&order=created_at.asc&limit=${MAX_POR_COTIZACION}`
      );
      res.setHeader("Cache-Control", "no-store");
      res.status(200).json({ comentarios: await r.json() });
    } catch (e) {
      res.status(502).json({ error: "upstream" });
    }
    return;
  }

  if (req.method === "DELETE") {
    const body = req.body || {};
    if (!checkClave(body.clave)) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    const quote = String(body.quote || "").slice(0, 100);
    if (!quote) {
      res.status(400).json({ error: "missing-quote" });
      return;
    }
    // `tipo` decide qué comentarios de estado se borran; default = aprobación
    // (compatible con las llamadas previas). El hilo del cliente nunca se toca.
    const tipo = String(body.tipo || "aprobacion");
    const marks =
      tipo === "rechazo"
        ? RECHAZO_MARKS
        : tipo === "todos"
          ? [...APROBACION_MARKS, ...RECHAZO_MARKS]
          : APROBACION_MARKS;
    try {
      // Solo se borran los comentarios de estado — el hilo del cliente queda
      // intacto. Filtrado aquí (no en SQL) para no pelear con el encoding de
      // los prefijos en PostgREST.
      const r = await sb(
        cfg,
        `?quote_id=eq.${encodeURIComponent(quote)}&select=id,texto&limit=${MAX_POR_COTIZACION}`
      );
      const rows = await r.json();
      const ids = rows
        .filter((c) => marks.some((m) => String(c.texto || "").startsWith(m)))
        .map((c) => c.id);
      if (ids.length) {
        await sb(cfg, `?id=in.(${ids.join(",")})`, { method: "DELETE" });
      }
      res.status(200).json({ eliminados: ids.length });
    } catch (e) {
      res.status(502).json({ error: "upstream" });
    }
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "method-not-allowed" });
    return;
  }

  const body = req.body || {};
  const quote = String(body.quote || "").slice(0, 100);
  const texto = String(body.texto || "").trim().slice(0, MAX_TEXTO);
  const autor = String(body.autor || "").trim().slice(0, MAX_AUTOR);
  const numero = String(body.numero || "").slice(0, MAX_META);
  const cliente = String(body.cliente || "").slice(0, MAX_META);

  if (!quote) {
    res.status(400).json({ error: "missing-quote" });
    return;
  }
  if (!texto) {
    res.status(400).json({ error: "missing-texto" });
    return;
  }

  try {
    const count = await sb(cfg, `?quote_id=eq.${encodeURIComponent(quote)}&select=id`, {
      method: "HEAD",
      headers: { Prefer: "count=exact", Range: "0-0" },
    });
    const total = Number((count.headers.get("content-range") || "").split("/")[1] || 0);
    if (total >= MAX_POR_COTIZACION) {
      res.status(429).json({ error: "too-many" });
      return;
    }

    const r = await sb(cfg, "", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        quote_id: quote,
        quote_numero: numero || null,
        cliente: cliente || null,
        autor,
        texto,
      }),
    });
    const rows = await r.json();
    const comentario = Array.isArray(rows) ? rows[0] : rows;

    await notificar({
      autor,
      texto,
      numero,
      cliente,
      host: String(req.headers["x-forwarded-host"] || req.headers.host || "adancareta.com"),
    });

    res.status(200).json({ comentario });
  } catch (e) {
    res.status(502).json({ error: "upstream" });
  }
}
