// Comentarios de clientes sobre una cotización: cliente de /api/comentarios y
// render del hilo. Lo usan el visor (/cotizador/ver, donde el cliente escribe)
// y el cotizador (/cotizador, donde Adán los lee).

import { LABELS } from "./cotizador.js";

// El endpoint responde 501 cuando faltan las env vars de Supabase. Se
// distingue del resto de errores para poder esconder el panel entero en vez
// de mostrarle un error al cliente por algo que no puede resolver.
export class ComentariosOff extends Error {}

export async function fetchComentarios(quoteId) {
  const res = await fetch(`/api/comentarios?quote=${encodeURIComponent(quoteId)}`);
  // 404: `astro dev` no sirve las funciones de la carpeta api/ (usa `vercel dev`).
  if (res.status === 501 || res.status === 404) throw new ComentariosOff();
  if (!res.ok) throw new Error("fetch-failed");
  const json = await res.json();
  return Array.isArray(json.comentarios) ? json.comentarios : [];
}

export async function postComentario({ quote, autor, texto, numero, cliente }) {
  const res = await fetch("/api/comentarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quote, autor, texto, numero, cliente }),
  });
  if (res.status === 501 || res.status === 404) throw new ComentariosOff();
  if (!res.ok) throw new Error("post-failed");
  const json = await res.json();
  return json.comentario;
}

// La aprobación viaja como comentario con texto fijo por idioma
// (LABELS.aprobadaComentario): su presencia en el hilo ES el estado de
// aprobada, compartido entre el visor del cliente y el cotizador.
export function esAprobacion(c) {
  return (
    c &&
    typeof c.texto === "string" &&
    (c.texto.startsWith(LABELS.es.aprobadaComentario) ||
      c.texto.startsWith(LABELS.en.aprobadaComentario))
  );
}

// El rechazo viaja igual que la aprobación: un comentario con texto fijo por
// idioma (LABELS.rechazadaComentario). Aprobada y rechazada son excluyentes;
// solo el admin marca rechazo desde el cotizador.
export function esRechazo(c) {
  return (
    c &&
    typeof c.texto === "string" &&
    (c.texto.startsWith(LABELS.es.rechazadaComentario) ||
      c.texto.startsWith(LABELS.en.rechazadaComentario))
  );
}

// Borra del hilo los comentarios de estado (aprobación y/o rechazo). `tipo`
// elige cuáles: "aprobacion" (default, compatible), "rechazo" o "todos". Solo
// desde el cotizador: el endpoint verifica la clave.
export async function deleteAprobacion(quote, clave, tipo = "aprobacion") {
  const res = await fetch("/api/comentarios", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quote, clave, tipo }),
  });
  if (res.status === 501 || res.status === 404) throw new ComentariosOff();
  if (!res.ok) throw new Error("delete-failed");
}

export function fmtFecha(iso, lang = "es") {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString(lang === "en" ? "en-US" : "es-MX", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Pinta el hilo dentro de `root`. Texto siempre por textContent: el cliente
// escribe esto y el cotizador lo lee — nada de innerHTML aquí.
export function renderComentarios(root, comentarios, { lang = "es", vacio = "", anon = "" } = {}) {
  root.textContent = "";
  if (!comentarios.length) {
    const empty = document.createElement("p");
    empty.className = "cz-hint";
    empty.textContent = vacio;
    root.appendChild(empty);
    return;
  }
  for (const c of comentarios) {
    const item = document.createElement("article");
    item.className = "cz-comment";

    const head = document.createElement("div");
    head.className = "cz-comment-head";
    const autor = document.createElement("span");
    autor.className = "cz-comment-autor";
    autor.textContent = c.autor || anon;
    const fecha = document.createElement("time");
    fecha.className = "cz-comment-fecha";
    fecha.dateTime = c.created_at || "";
    fecha.textContent = fmtFecha(c.created_at, lang);
    head.append(autor, fecha);

    const texto = document.createElement("p");
    texto.className = "cz-comment-texto";
    texto.textContent = c.texto || "";

    item.append(head, texto);
    root.appendChild(item);
  }
}
