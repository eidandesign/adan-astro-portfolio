// Guarda y lee cotizaciones en /api/quotes para los links cortos
// (/cotizador/ver?id=...). Lo usan el cotizador (guarda) y el visor (lee).

// El endpoint responde 501 cuando faltan las env vars de Supabase — se
// distingue del resto de errores para poder caer de vuelta al link largo
// (hash) de antes en vez de mostrar un error.
export class QuotesStoreOff extends Error {}

export async function saveQuoteRemote(id, data, clave) {
  const res = await fetch("/api/quotes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, data, clave }),
  });
  // 404: `astro dev` no sirve las funciones de la carpeta api/ (usa `vercel dev`).
  if (res.status === 501 || res.status === 404) throw new QuotesStoreOff();
  if (!res.ok) throw new Error("save-failed");
}

export async function fetchQuoteRemote(id) {
  const res = await fetch(`/api/quotes?id=${encodeURIComponent(id)}`);
  if (res.status === 501 || res.status === 404) throw new QuotesStoreOff();
  if (!res.ok) throw new Error("fetch-failed");
  const json = await res.json();
  return json.data;
}

// Borra la copia guardada en el backend (el link compartido deja de
// funcionar). Falla en silencio si nunca se guardó ahí (501/404) — el
// caller solo la usa best-effort al borrar una cotización local.
export async function deleteQuoteRemote(id, clave) {
  const res = await fetch("/api/quotes", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, clave }),
  });
  if (res.status === 501 || res.status === 404) throw new QuotesStoreOff();
  if (!res.ok) throw new Error("delete-failed");
}
