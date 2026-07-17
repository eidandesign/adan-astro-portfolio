// Vercel serverless function: guarda/lee cotizaciones para links cortos.
//
// El link que se manda al cliente pasó de llevar la cotización entera
// codificada en el hash a llevar solo un id corto
// (/cotizador/ver?id=nfb-2026-001-juan-perez); esta función guarda y
// devuelve el JSON completo en Supabase, amarrado a ese id.
//
//   GET  /api/quotes?id=<id>   → { data }            (público: el link es la credencial, igual que /api/comentarios)
//   POST /api/quotes           → { id }              (requiere la clave del cotizador)
//
// Setup (Vercel → Project → Settings → Environment Variables):
//   SUPABASE_URL              = https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY = service_role key (Supabase → Settings → API)
//   COTIZADOR_KEY_HASH        = sha256 hex de la clave del cotizador (misma que api/cotizar.js)
// Tabla: correr supabase/cotizador-quotes.sql en el SQL Editor.
// Sin las dos primeras, el endpoint responde 501 y el botón de copiar link
// cae de vuelta al link largo (hash) de antes.

import { createHash, timingSafeEqual } from "node:crypto";

const MAX_DATA_BYTES = 300_000;
const TABLE = "cotizador_quotes";

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

export default async function handler(req, res) {
  const cfg = config();
  if (!cfg) {
    res.status(501).json({ error: "not-configured" });
    return;
  }

  if (req.method === "GET") {
    const id = String((req.query && req.query.id) || "").slice(0, 200);
    if (!id) {
      res.status(400).json({ error: "missing-id" });
      return;
    }
    try {
      const r = await sb(cfg, `?id=eq.${encodeURIComponent(id)}&select=data&limit=1`);
      const rows = await r.json();
      if (!rows.length) {
        res.status(404).json({ error: "not-found" });
        return;
      }
      res.setHeader("Cache-Control", "no-store");
      res.status(200).json({ data: rows[0].data });
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
  if (!checkClave(body.clave)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const id = String(body.id || "").slice(0, 200);
  const numero = String((body.data && body.data.meta && body.data.meta.numero) || "").slice(0, 200);
  const cliente = String(
    (body.data && body.data.meta && (body.data.meta.nombre || body.data.meta.empresa)) || ""
  ).slice(0, 200);

  if (!id || !body.data) {
    res.status(400).json({ error: "missing-fields" });
    return;
  }
  if (JSON.stringify(body.data).length > MAX_DATA_BYTES) {
    res.status(413).json({ error: "too-large" });
    return;
  }

  try {
    await sb(cfg, "?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({
        id,
        numero: numero || null,
        cliente: cliente || null,
        data: body.data,
        updated_at: new Date().toISOString(),
      }),
    });
    res.status(200).json({ id });
  } catch (e) {
    res.status(502).json({ error: "upstream" });
  }
}
