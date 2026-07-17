// Comentarios de clientes sobre una cotización: cliente de /api/comentarios y
// render del hilo. Lo usan el visor (/cotizador/ver, donde el cliente escribe)
// y el cotizador (/cotizador, donde Adán los lee).

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
