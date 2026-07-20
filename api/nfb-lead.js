// Vercel serverless function: solicitudes de cotización de la landing
// de No Flag Brand (/noflagbrand).
//
//   POST /api/nfb-lead → valida, guarda el lead en Supabase, envía el
//   correo con toda la información y avisa por WhatsApp.
//
// El correo destino vive aquí (servidor), nunca en el código del frontend
// que procesa el formulario — requisito de la landing.
//
// Setup (Vercel → Project → Settings → Environment Variables):
//   SUPABASE_URL              = ya configurada (misma del cotizador)
//   SUPABASE_SERVICE_ROLE_KEY = ya configurada
//   CALLMEBOT_PHONE           = ya configurada (aviso por WhatsApp)
//   CALLMEBOT_APIKEY          = ya configurada
//   RESEND_API_KEY            = api key de resend.com (para el correo)
//   NFB_LEAD_TO               = opcional, correo destino (default design.adan@gmail.com)
//   NFB_LEAD_FROM             = opcional, remitente verificado en Resend
//                               (ej. "No Flag Brand <hola@adancareta.com>").
//                               Solo con remitente verificado se envía también
//                               el correo de confirmación al cliente.
// Tabla: correr supabase/nfb-leads.sql en el SQL Editor.
//
// El endpoint responde éxito si el lead quedó guardado O el correo salió;
// el aviso de WhatsApp y la confirmación al cliente son best-effort y nunca
// tumban el envío.

const TABLE = "nfb_leads";
const LEAD_TO = process.env.NFB_LEAD_TO || "design.adan@gmail.com";
const MAX_SHORT = 300;
const MAX_LONG = 3000;

// Etiquetas legibles para el correo, en el orden del formulario.
const FIELDS = [
  ["nombre", "Nombre completo"],
  ["empresa", "Empresa o proyecto"],
  ["email", "Correo electrónico"],
  ["telefono", "Teléfono / WhatsApp"],
  ["sitio", "Sitio / redes actuales"],
  ["servicios", "¿Qué necesita?"],
  ["proyecto", "Sobre el proyecto"],
  ["problema", "Problema a resolver"],
  ["resultado", "Resultado esperado"],
  ["usuarios", "Usuarios o clientes"],
  ["existente", "Diseño / producto existente"],
  ["referencias", "Referencias"],
  ["inicio", "Cuándo quiere comenzar"],
  ["lanzamiento", "Fecha ideal de lanzamiento"],
  ["presupuesto", "Presupuesto estimado"],
  ["extra", "Algo más"],
  ["origen", "Cómo conoció el estudio"],
];

const SERVICIOS_VALIDOS = [
  "Branding e identidad",
  "Diseño de producto UX/UI",
  "Sitio web",
  "Desarrollo",
  "Design system",
  "Auditoría o consultoría",
  "Marketing y comunicación",
  "Presentación o pitch deck",
  "Packaging",
  "Otro",
];

function clean(value, max) {
  return String(value == null ? "" : value).trim().slice(0, max);
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { rest: `${url.replace(/\/+$/, "")}/rest/v1/${TABLE}`, key };
}

async function saveLead(lead) {
  const cfg = supabaseConfig();
  if (!cfg) return false;
  const res = await fetch(cfg.rest, {
    method: "POST",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      nombre: lead.nombre,
      empresa: lead.empresa || null,
      email: lead.email,
      telefono: lead.telefono || null,
      servicios: lead.servicios,
      presupuesto: lead.presupuesto,
      datos: lead, // el formulario completo, por si cambia el esquema
    }),
  });
  return res.ok;
}

async function sendEmail(lead) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const rows = FIELDS.map(([key, label]) => {
    const value = key === "servicios" ? lead.servicios.join(", ") : lead[key];
    if (!value) return "";
    return `<tr>
      <td style="padding:8px 16px 8px 0;color:#6d7a93;font-size:12px;text-transform:uppercase;letter-spacing:1px;vertical-align:top;white-space:nowrap;">${esc(label)}</td>
      <td style="padding:8px 0;color:#0c1015;font-size:15px;line-height:1.5;">${esc(value).replace(/\n/g, "<br/>")}</td>
    </tr>`;
  }).join("");

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;">
    <div style="background:#0b53e7;border-radius:10px 10px 0 0;padding:24px 28px;">
      <span style="color:#fff;font-size:18px;letter-spacing:2px;">NO FLAG BRAND</span>
      <div style="color:#c8d8ff;font-size:13px;margin-top:6px;">Nueva solicitud de cotización · ${esc(
        lead.recibido
      )}</div>
    </div>
    <div style="border:1px solid #e3e7ef;border-top:none;border-radius:0 0 10px 10px;padding:20px 28px;">
      <table style="border-collapse:collapse;width:100%;">${rows}</table>
    </div>
  </div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.NFB_LEAD_FROM || "No Flag Brand <onboarding@resend.dev>",
      to: [LEAD_TO],
      reply_to: lead.email,
      subject: `Nueva solicitud No Flag Brand — ${lead.empresa || lead.nombre}`,
      html,
    }),
  });
  return res.ok;
}

// Confirmación al cliente: solo con remitente verificado (NFB_LEAD_FROM);
// con el remitente sandbox de Resend el envío a terceros rebota.
async function sendConfirmation(lead) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NFB_LEAD_FROM;
  if (!apiKey || !from) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [lead.email],
        subject: "Recibimos tu proyecto — No Flag Brand",
        html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0c1015;">
          <p>Hola ${esc(lead.nombre)},</p>
          <p>Gracias por compartir tu proyecto con <strong>No Flag Brand</strong>. Revisaremos la información y te
          contactaremos para conocer más detalles y definir los siguientes pasos.</p>
          <p style="color:#6d7a93;">— Adán Careta · No Flag Brand</p>
        </div>`,
      }),
    });
  } catch (e) {
    // Best-effort: la confirmación nunca tumba el envío principal.
  }
}

// Aviso por WhatsApp (CallMeBot, mismas env vars del cotizador). Best-effort.
async function notifyWhatsApp(lead, host) {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) return;

  const msg = [
    `🚩 Nueva solicitud No Flag Brand`,
    `De: ${[lead.nombre, lead.empresa].filter(Boolean).join(" · ")}`,
    `Correo: ${lead.email}`,
    lead.telefono ? `Tel: ${lead.telefono}` : "",
    `Necesita: ${lead.servicios.join(", ")}`,
    `Presupuesto: ${lead.presupuesto}`,
    "",
    lead.proyecto.length > 400 ? lead.proyecto.slice(0, 400) + "…" : lead.proyecto,
  ]
    .filter(Boolean)
    .join("\n");

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
    // Ignorado a propósito.
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method-not-allowed" });
    return;
  }

  const body = req.body || {};

  // --- Antispam: honeypot lleno o envío inhumanamente rápido.
  // Se responde éxito falso para no darle pistas al bot.
  const elapsed = Number(body.elapsedMs);
  if (clean(body.nfb_hp, 50) || !Number.isFinite(elapsed) || elapsed < 3000) {
    res.status(200).json({ ok: true });
    return;
  }

  // --- Validación de servidor (espejo de la del frontend).
  const lead = {
    nombre: clean(body.nombre, 120),
    empresa: clean(body.empresa, 120),
    email: clean(body.email, 160),
    telefono: clean(body.telefono, 40),
    sitio: clean(body.sitio, MAX_SHORT),
    servicios: Array.isArray(body.servicios)
      ? body.servicios.map((s) => clean(s, 60)).filter((s) => SERVICIOS_VALIDOS.includes(s))
      : [],
    proyecto: clean(body.proyecto, MAX_LONG),
    problema: clean(body.problema, MAX_LONG),
    resultado: clean(body.resultado, MAX_LONG),
    usuarios: clean(body.usuarios, MAX_LONG),
    existente: clean(body.existente, MAX_LONG),
    referencias: clean(body.referencias, MAX_LONG),
    inicio: clean(body.inicio, 120),
    lanzamiento: clean(body.lanzamiento, 120),
    presupuesto: clean(body.presupuesto, 60),
    extra: clean(body.extra, MAX_LONG),
    origen: clean(body.origen, 200),
    consentimiento: body.consentimiento === "si",
    pagina: clean(body.pagina, MAX_SHORT),
    // Fecha y hora del registro (además del created_at de la base)
    recibido: new Date().toLocaleString("es-MX", { timeZone: "America/Mexico_City" }),
  };

  const errors = [];
  if (lead.nombre.length < 2) errors.push("nombre");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email)) errors.push("email");
  if (!lead.servicios.length) errors.push("servicios");
  if (lead.proyecto.length < 10) errors.push("proyecto");
  if (!lead.presupuesto) errors.push("presupuesto");
  if (!lead.consentimiento) errors.push("consentimiento");
  if (errors.length) {
    res.status(400).json({ error: "invalid-fields", fields: errors });
    return;
  }

  // --- Guardar + correo. Cada canal falla por separado; con que uno
  // funcione, la solicitud no se pierde.
  let saved = false;
  let emailed = false;
  try {
    saved = await saveLead(lead);
  } catch (e) {
    saved = false;
  }
  try {
    emailed = await sendEmail(lead);
  } catch (e) {
    emailed = false;
  }

  if (!saved && !emailed) {
    res.status(502).json({ error: "delivery-failed" });
    return;
  }

  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "adancareta.com");
  await notifyWhatsApp(lead, host);
  await sendConfirmation(lead);

  res.status(200).json({ ok: true });
}
