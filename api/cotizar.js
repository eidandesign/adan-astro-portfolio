// Vercel serverless function: generates a proposal with OpenAI using a key
// stored in the OPENAI_API_KEY env var, so no key ever lives in the browser.
// Access is gated by the builder's own access key: the client sends it in
// plain text (over HTTPS) and we compare its SHA-256 against the
// COTIZADOR_KEY_HASH env var — same hash as PASS_HASH in the builder page.
//
// Setup (Vercel dashboard → Project → Settings → Environment Variables):
//   OPENAI_API_KEY      = sk-…
//   COTIZADOR_KEY_HASH  = sha256 hex of the access key
import { createHash } from "node:crypto";
import { buildPrompts, callOpenAI } from "../src/lib/cotizador-prompt.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method-not-allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const expectedHash = process.env.COTIZADOR_KEY_HASH;
  if (!apiKey || !expectedHash) {
    // Tells the client to fall back to a browser-side key.
    res.status(501).json({ error: "not-configured" });
    return;
  }

  const body = req.body || {};
  const claveHash = createHash("sha256").update(String(body.clave || "")).digest("hex");
  if (claveHash !== expectedHash) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const ctx = String(body.ctx || "").slice(0, 8000);
  if (!ctx.trim()) {
    res.status(400).json({ error: "missing-context" });
    return;
  }

  const { system, user } = buildPrompts({
    ctx,
    nombre: String(body.nombre || "").slice(0, 200),
    empresa: String(body.empresa || "").slice(0, 200),
    rate: Number(body.rate) || 40,
    moneda: ["USD", "MXN", "EUR"].includes(body.moneda) ? body.moneda : "USD",
    lang: body.lang === "en" ? "en" : "es",
  });

  try {
    const text = await callOpenAI({ apiKey, system, user });
    res.status(200).json({ text });
  } catch (e) {
    res.status(502).json({ error: "upstream" });
  }
}
