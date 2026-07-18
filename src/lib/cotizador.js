// Shared logic for the private quote builder (/cotizador) and the client
// view page (/cotizador/ver). The quote is saved server-side (see
// api/quotes.js) and the viewer fetches it by a short id in the URL
// (?id=...); encodeQuote/decodeQuote remain for old long links (#q=...)
// generated before that existed, and as a fallback when the backend isn't
// configured.
import { buildPrompts, callGroq } from "./cotizador-prompt.js";

export const LABELS = {
  es: {
    // Tool chrome
    cotizador: "Cotizador",
    descargar: "Descargar PDF",
    copiarLink: "Copiar link para cliente",
    linkCopiado: "Link copiado",
    nueva: "Nueva cotización",
    datosCliente: "Datos del cliente",
    contexto: "Contexto del proyecto",
    phNombre: "Nombre del cliente",
    phEmpresa: "Empresa",
    phContacto: "Correo o teléfono",
    phContexto:
      "Describe el proyecto: qué necesita el cliente, alcance, tiempos, horas estimadas o precios fijos si los tienes…",
    fecha: "Fecha",
    tarifa: "Tarifa base",
    moneda: "Moneda",
    fechaLimite: "Fecha límite",
    sTimeline: "Línea de tiempo",
    generar: "Generar propuesta con IA",
    generando: "Generando…",
    hint: "La IA redacta una propuesta completa con la voz de No Flag Brand. Después puedes editar cualquier texto del documento haciendo clic sobre él.",
    apiHint:
      "Opcional: solo si la IA del sitio no está configurada. Se guarda solo en este navegador.",
    errCtx: "Escribe primero el contexto del proyecto.",
    errKey:
      "La IA del sitio no está disponible. Configura GROQ_API_KEY en Vercel o pega tu API key de Groq abajo en el panel.",
    errKeyInvalid: "API key inválida. Revísala e intenta de nuevo.",
    errGen: "No se pudo generar la propuesta. Intenta de nuevo.",
    // Document
    cotizacion: "Cotización",
    preparadoPara: "Preparado para",
    sBrief: "Entendimiento del proyecto",
    sAlcance: "Alcance y entregables",
    sFases: "Fases y tiempos",
    sInversion: "Inversión",
    sCondiciones: "Condiciones de pago",
    sNoIncluye: "Qué no incluye",
    sValor: "Lo que gana tu marca",
    graciasTitulo: "Gracias",
    graciasSub: "Estamos listos cuando tú lo estés.",
    total: "Total",
    add: "+ Añadir",
    remove: "Eliminar",
    // Access gate
    gateTitle: "Acceso privado",
    gateText: "Escribe la clave para entrar al cotizador.",
    phClave: "Clave",
    entrar: "Entrar",
    claveIncorrecta: "Clave incorrecta.",
    // Viewer
    linkInvalido: "Este link no contiene una cotización válida. Pide uno nuevo a quien te lo envió.",
    // Comments
    comentarios: "Comentarios",
    comentariosHint:
      "¿Dudas, ajustes o algo que quieras cambiar? Escríbelo aquí y le llega directo a No Flag Brand.",
    phAutor: "Tu nombre",
    phComentario: "Escribe tu comentario…",
    enviarComentario: "Enviar comentario",
    enviandoComentario: "Enviando…",
    comentarioEnviado: "Comentario enviado ✓",
    errComentarioVacio: "Escribe tu comentario primero.",
    errComentario: "No se pudo enviar el comentario. Intenta de nuevo.",
    sinComentarios: "Aún no hay comentarios.",
    sinComentariosCliente: "Aún no hay comentarios. El primero puede ser el tuyo.",
    anonimo: "Cliente",
    verComentarios: "Ver comentarios",
    // Saved quotes
    guardadas: "Cotizaciones",
    vacio: "Aún no hay cotizaciones guardadas.",
    duplicar: "Duplicar",
    eliminar: "Eliminar",
    confirmEliminar: "¿Seguro? Sí, eliminar",
    cerrar: "Cerrar",
    sinTitulo: "Sin título",
    // Cover
    clienteLabel: "Cliente",
  },
  en: {
    cotizador: "Quote builder",
    descargar: "Download PDF",
    copiarLink: "Copy client link",
    linkCopiado: "Link copied",
    nueva: "New quote",
    datosCliente: "Client details",
    contexto: "Project context",
    phNombre: "Client name",
    phEmpresa: "Company",
    phContacto: "Email or phone",
    phContexto:
      "Describe the project: what the client needs, scope, timing, estimated hours or fixed prices if you have them…",
    fecha: "Date",
    tarifa: "Base rate",
    moneda: "Currency",
    fechaLimite: "Deadline",
    sTimeline: "Timeline",
    generar: "Generate proposal with AI",
    generando: "Generating…",
    hint: "AI drafts a complete proposal in No Flag Brand's voice. You can then edit any text in the document by clicking on it.",
    apiHint: "Optional: only if the site's AI isn't configured. Stored only in this browser.",
    errCtx: "Write the project context first.",
    errKey:
      "The site's AI isn't available. Set GROQ_API_KEY on Vercel or paste your Groq API key below.",
    errKeyInvalid: "Invalid API key. Check it and try again.",
    errGen: "Could not generate the proposal. Try again.",
    cotizacion: "Quote",
    preparadoPara: "Prepared for",
    sBrief: "Project understanding",
    sAlcance: "Scope & deliverables",
    sFases: "Phases & timeline",
    sInversion: "Investment",
    sCondiciones: "Payment terms",
    sNoIncluye: "Not included",
    sValor: "What your brand gains",
    graciasTitulo: "Thank you",
    graciasSub: "We're ready when you are.",
    total: "Total",
    add: "+ Add",
    remove: "Remove",
    gateTitle: "Private access",
    gateText: "Enter the key to open the quote builder.",
    phClave: "Access key",
    entrar: "Enter",
    claveIncorrecta: "Wrong key.",
    linkInvalido: "This link doesn't contain a valid quote. Ask the sender for a new one.",
    comentarios: "Comments",
    comentariosHint:
      "Questions, tweaks, anything you'd like changed? Write it here and it goes straight to No Flag Brand.",
    phAutor: "Your name",
    phComentario: "Write your comment…",
    enviarComentario: "Send comment",
    enviandoComentario: "Sending…",
    comentarioEnviado: "Comment sent ✓",
    errComentarioVacio: "Write your comment first.",
    errComentario: "Couldn't send the comment. Try again.",
    sinComentarios: "No comments yet.",
    sinComentariosCliente: "No comments yet. Yours can be the first.",
    anonimo: "Client",
    verComentarios: "View comments",
    guardadas: "Quotes",
    vacio: "No saved quotes yet.",
    duplicar: "Duplicate",
    eliminar: "Delete",
    confirmEliminar: "Sure? Yes, delete",
    cerrar: "Close",
    sinTitulo: "Untitled",
    clienteLabel: "Client",
  },
};

export function labelsFor(lang) {
  return LABELS[lang === "en" ? "en" : "es"];
}

export function todayStr(lang = "es") {
  return new Date().toLocaleDateString(lang === "en" ? "en-US" : "es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Next consecutive quote number: takes the highest numeric suffix among the
// saved quotes sharing the most recent prefix (e.g. "NFB-2026-") and adds 1.
export function nextNumero(quotes) {
  let prefix = "NFB-2026-";
  let width = 3;
  let max = 0;
  const parsed = quotes
    .map((q) => (q.meta && q.meta.numero ? q.meta.numero.match(/^(.*?)(\d+)\s*$/) : null))
    .filter(Boolean);
  if (parsed.length) {
    prefix = parsed[parsed.length - 1][1];
    for (const m of parsed) {
      if (m[1] !== prefix) continue;
      width = Math.max(width, m[2].length);
      max = Math.max(max, Number(m[2]));
    }
  }
  return prefix + String(max + 1).padStart(width, "0");
}

export function defaultQuote(lang = "es") {
  return {
    v: 1,
    id: genId(),
    lang,
    moneda: "USD",
    rate: 40,
    meta: {
      nombre: "",
      empresa: "",
      contacto: "",
      numero: "NFB-2026-001",
      fecha: todayStr(lang),
      deadline: "",
    },
    q: {
      proyecto: "Identidad visual y sitio web",
      brief:
        "Ejemplo de propuesta. Escribe el contexto del proyecto en el panel izquierdo y genera la cotización — o edita cualquier texto de este documento directamente.",
      alcance: [
        { titulo: "Identidad visual", detalle: "logotipo, paleta, tipografía y usos básicos." },
        { titulo: "Sitio web", detalle: "one-page responsivo, diseño y desarrollo." },
        { titulo: "Entregables finales", detalle: "archivos fuente y mini guía de marca en PDF." },
      ],
      fases: [
        { fase: "Descubrimiento", descripcion: "Inmersión, referencias y dirección estratégica.", duracion: "1 semana" },
        { fase: "Diseño", descripcion: "Identidad y propuesta visual del sitio.", duracion: "2 semanas" },
        { fase: "Entrega", descripcion: "Ajustes finales, desarrollo y archivos.", duracion: "1 semana" },
      ],
      timeline: [
        { etapa: "Kickoff", fecha: "Semana 1", detalle: "Arranque y referencias." },
        { etapa: "Propuesta visual", fecha: "Semana 2", detalle: "Identidad y dirección." },
        { etapa: "Revisión", fecha: "Semana 3", detalle: "Ajustes sobre feedback." },
        { etapa: "Entrega final", fecha: "Semana 4", detalle: "Archivos y cierre." },
      ],
      inversion: [
        { concepto: "Identidad visual", detalle: "Descubrimiento, diseño y guía de uso.", horas: 24, precio: 960 },
        { concepto: "Sitio web one-page", detalle: "Diseño y desarrollo responsivo.", horas: 30, precio: 1200 },
      ],
      condiciones: [
        "50% de anticipo para iniciar; 50% contra entrega final.",
        "Precios en USD; no incluyen impuestos.",
        "Hasta dos rondas de revisión por fase.",
      ],
      noIncluye: [
        "Costos de impresión o producción.",
        "Licencias de tipografías o imágenes de stock.",
        "Hosting y dominio.",
      ],
      vigencia: "Esta cotización tiene una vigencia de 15 días a partir de su fecha de emisión.",
      beneficiosIntro:
        "Más allá de los entregables, este proyecto está pensado para mover la aguja de tu negocio.",
      beneficios: [
        { titulo: "Claridad", detalle: "Una marca que comunica a la primera qué haces y por qué importa." },
        { titulo: "Confianza", detalle: "Presencia profesional que respalda cada propuesta y conversación de venta." },
        { titulo: "Diferenciación", detalle: "Dirección visual propia — dejas de parecerte a la competencia." },
        { titulo: "Consistencia", detalle: "Bases claras para que todo lo que publiques sume a la misma historia." },
      ],
      gracias:
        "Gracias por considerar a No Flag Brand para este proyecto. Nos entusiasma la dirección que puede tomar — cuando quieras arrancamos.",
    },
  };
}

export function fmtMoney(n, moneda = "USD", lang = "es") {
  const loc = lang === "en" ? "en-US" : "es-MX";
  return "$" + Number(n || 0).toLocaleString(loc) + " " + moneda;
}

export function totalOf(data) {
  return data.q.inversion.reduce((acc, i) => acc + (Number(i.precio) || 0), 0);
}

/* ---------- URL hash encoding (quote → shareable link) ---------- */

function b64urlEncode(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str) {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function pipeThrough(bytes, stream) {
  const buf = await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer();
  return new Uint8Array(buf);
}

export async function encodeQuote(data) {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  if (typeof CompressionStream !== "undefined") {
    return "1." + b64urlEncode(await pipeThrough(bytes, new CompressionStream("gzip")));
  }
  return "0." + b64urlEncode(bytes);
}

export async function decodeQuote(token) {
  const dot = token.indexOf(".");
  if (dot === -1) throw new Error("bad token");
  const mode = token.slice(0, dot);
  let bytes = b64urlDecode(token.slice(dot + 1));
  if (mode === "1") bytes = await pipeThrough(bytes, new DecompressionStream("gzip"));
  const data = JSON.parse(new TextDecoder().decode(bytes));
  if (!data || !data.q || !data.meta) throw new Error("bad quote");
  return data;
}

/* ---------- Short link id (quote → /cotizador/ver?id=…) ---------- */

function slugify(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Short, readable id for the client link: quote number + client name, e.g.
// "nfb-2026-001-juan-perez". Falls back to the quote's internal id if both
// are blank so the link is never empty.
export function quoteSlug(data) {
  const numero = slugify(data.meta.numero);
  const cliente = slugify(data.meta.nombre || data.meta.empresa);
  return [numero, cliente].filter(Boolean).join("-") || data.id;
}

/* ---------- Cover page ---------- */

// Renders the brand cover sheet: blue full-bleed page with the white NFB
// logo, the geometric mosaic art (public/images/forms.png) and the client
// block near the bottom.
export function renderCover(root, data) {
  const t = labelsFor(data.lang);
  root.textContent = "";

  const logo = document.createElement("img");
  logo.src = "/images/noflagbrand-logo-white.svg";
  logo.alt = "No Flag Brand";
  logo.className = "cz-cover-logo";
  root.appendChild(logo);

  // The brand's mosaic of geometric shapes, shown large and uncropped in the
  // upper-right of the cover.
  const art = el("div", "cz-cover-art");
  const forms = document.createElement("img");
  forms.src = "/images/forms.png";
  forms.alt = "";
  forms.setAttribute("aria-hidden", "true");
  art.appendChild(forms);
  root.appendChild(art);

  const client = el("div", "cz-cover-client");
  client.appendChild(el("div", "cz-cover-client-label", t.clienteLabel));
  client.appendChild(
    el("div", "cz-cover-client-name", data.meta.empresa || data.meta.nombre || "—")
  );
  root.appendChild(client);
}

/* ---------- Document rendering ---------- */

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// The timeline animates in the first time it scrolls into view. The builder
// re-renders the whole document on every edit, so the animation runs only on
// the first render per root — after that the timeline appears already settled
// (`is-static` kills transitions) instead of replaying on each keystroke.
const czAnimatedTimelines = new WeakSet();

function revealTimeline(root, tl) {
  if (czAnimatedTimelines.has(root)) {
    tl.classList.add("is-static", "is-in");
    return;
  }
  czAnimatedTimelines.add(root);
  if (typeof IntersectionObserver === "undefined") {
    tl.classList.add("is-in");
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          tl.classList.add("is-in");
          io.disconnect();
        }
      }
    },
    { threshold: 0.3 }
  );
  io.observe(tl);
}

// Shared edit affordances for the document sheets: contenteditable text
// (committed on blur via onChange) and add/remove list controls (which
// trigger a re-render through onChange).
function editKit(data, editable, onChange, t) {
  const commit = (rerender) => onChange(data, rerender);

  const editableText = (node, apply) => {
    if (!editable) return node;
    node.setAttribute("contenteditable", "true");
    node.setAttribute("spellcheck", "false");
    node.addEventListener("blur", () => {
      apply(node.textContent.replace(/^\s*—\s*/, "").trim());
      commit(false);
    });
    node.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && node.tagName !== "P") {
        e.preventDefault();
        node.blur();
      }
    });
    return node;
  };

  const removeBtn = (list, idx) => {
    const btn = el("button", "cz-doc-remove", "×");
    btn.type = "button";
    btn.setAttribute("data-noprint", "1");
    btn.setAttribute("aria-label", t.remove);
    btn.addEventListener("click", () => {
      data.q[list].splice(idx, 1);
      commit(true);
    });
    return btn;
  };

  const addBtn = (list, blank) => {
    const btn = el("button", "cz-doc-add", t.add);
    btn.type = "button";
    btn.setAttribute("data-noprint", "1");
    btn.addEventListener("click", () => {
      data.q[list].push(typeof blank === "function" ? blank() : blank);
      commit(true);
    });
    return btn;
  };

  return { commit, editableText, removeBtn, addBtn };
}

// Renders the quote document into `root` (the sheet container) as three
// separate letter pages so each part gets room to breathe:
//   page 2 — brief + scope     page 3 — phases + timeline     page 4 — money
export function renderDoc(root, data, opts = {}) {
  const { editable = false, onChange = () => {} } = opts;
  const t = labelsFor(data.lang);
  const rate = Number(data.rate) || 0;
  root.textContent = "";

  const { editableText, removeBtn, addBtn } = editKit(data, editable, onChange, t);

  const sheet = () => {
    const s = el("div", "cz-paper");
    root.appendChild(s);
    return s;
  };

  const sectionHead = (num, label) => {
    const head = el("div", "cz-sec-head");
    head.appendChild(el("span", "cz-sec-num", num));
    head.appendChild(el("span", "cz-sec-title", label));
    return head;
  };

  // Slim running header for the continuation pages (3, 4): keeps the reader
  // oriented — small brand mark + quote number — without repeating the full
  // masthead from page 2.
  const contHead = () => {
    const h = el("div", "cz-cont-head");
    const logo = document.createElement("img");
    logo.src = "/images/noflagbrand-logo.svg";
    logo.alt = "No Flag Brand";
    logo.className = "cz-cont-logo";
    h.appendChild(logo);
    h.appendChild(el("span", "cz-cont-num", data.meta.numero || ""));
    return h;
  };

  /* ===== Page 2: masthead + 01 Brief + 02 Alcance ===== */
  const p2 = sheet();

  const head = el("div", "cz-doc-top");
  const logo = document.createElement("img");
  logo.src = "/images/noflagbrand-logo.svg";
  logo.alt = "No Flag Brand";
  logo.className = "cz-doc-logo";
  head.appendChild(logo);
  const headRight = el("div", "cz-doc-topright");
  headRight.appendChild(el("div", "cz-doc-kicker", t.cotizacion));
  headRight.appendChild(el("div", "cz-doc-num", data.meta.numero || "—"));
  headRight.appendChild(el("div", "cz-doc-date", data.meta.fecha || ""));
  head.appendChild(headRight);
  p2.appendChild(head);

  const cliente = [data.meta.nombre, data.meta.empresa].filter(Boolean).join(" · ") || "—";
  const prep = el("div", "cz-doc-prep");
  prep.appendChild(el("div", "cz-doc-kicker", t.preparadoPara));
  const prepLine = el("div", "cz-doc-prepline");
  prepLine.appendChild(el("strong", null, cliente));
  if (data.meta.contacto) prepLine.appendChild(el("span", "cz-muted", " · " + data.meta.contacto));
  prep.appendChild(prepLine);
  p2.appendChild(prep);

  p2.appendChild(
    editableText(el("h1", "cz-doc-h1", data.q.proyecto), (v) => (data.q.proyecto = v))
  );

  const brief = el("section", "cz-sec");
  brief.appendChild(sectionHead("01", t.sBrief));
  brief.appendChild(editableText(el("p", "cz-doc-brief", data.q.brief), (v) => (data.q.brief = v)));
  p2.appendChild(brief);

  const alcance = el("section", "cz-sec");
  alcance.appendChild(sectionHead("02", t.sAlcance));
  data.q.alcance.forEach((item, i) => {
    const row = el("div", "cz-item");
    row.appendChild(el("span", "cz-bullet", "▪"));
    const body = el("div", "cz-item-body");
    body.appendChild(editableText(el("span", "cz-item-title", item.titulo), (v) => (item.titulo = v)));
    body.appendChild(document.createTextNode(" — "));
    body.appendChild(editableText(el("span", "cz-muted", item.detalle), (v) => (item.detalle = v)));
    row.appendChild(body);
    if (editable) row.appendChild(removeBtn("alcance", i));
    alcance.appendChild(row);
  });
  if (editable) alcance.appendChild(addBtn("alcance", { titulo: "Nuevo entregable", detalle: "detalle." }));
  p2.appendChild(alcance);

  /* ===== Page 3: 03 Fases y tiempos + spacious timeline ===== */
  const p3 = sheet();
  p3.classList.add("cz-paper-timeline");
  p3.appendChild(contHead());

  const fases = el("section", "cz-sec cz-sec-flush");
  fases.appendChild(sectionHead("03", t.sFases));
  data.q.fases.forEach((f, i) => {
    const row = el("div", "cz-fase");
    row.appendChild(editableText(el("span", "cz-item-title", f.fase), (v) => (f.fase = v)));
    row.appendChild(editableText(el("span", "cz-muted cz-fase-desc", f.descripcion), (v) => (f.descripcion = v)));
    row.appendChild(editableText(el("span", "cz-fase-dur", f.duracion), (v) => (f.duracion = v)));
    if (editable) row.appendChild(removeBtn("fases", i));
    fases.appendChild(row);
  });
  if (editable)
    fases.appendChild(addBtn("fases", { fase: "Nueva fase", descripcion: "Descripción.", duracion: "1 semana" }));
  p3.appendChild(fases);

  /* Timeline: milestones toward the deadline. On its own page it runs as a
     spacious vertical track (cz-timeline--page). Older quotes predate
     q.timeline, so guard its existence. */
  if (editable && !Array.isArray(data.q.timeline)) data.q.timeline = [];
  const hitos = Array.isArray(data.q.timeline) ? data.q.timeline : [];
  if (hitos.length || editable) {
    const tlWrap = el("section", "cz-sec cz-tl-section");
    tlWrap.appendChild(el("div", "cz-tl-kicker", t.sTimeline));
    const tl = el("div", "cz-timeline cz-timeline--page");
    hitos.forEach((h, i) => {
      const item = el("div", "cz-tl-item");
      item.style.setProperty("--i", String(i));
      item.appendChild(el("span", "cz-tl-dot" + (i === hitos.length - 1 ? " is-end" : "")));
      item.appendChild(editableText(el("div", "cz-tl-fecha", h.fecha || "—"), (v) => (h.fecha = v)));
      item.appendChild(editableText(el("div", "cz-tl-etapa", h.etapa), (v) => (h.etapa = v)));
      if (h.detalle || editable) {
        item.appendChild(
          editableText(el("div", "cz-tl-detalle", h.detalle || ""), (v) => (h.detalle = v))
        );
      }
      if (editable) item.appendChild(removeBtn("timeline", i));
      tl.appendChild(item);
    });
    if (hitos.length) revealTimeline(root, tl);
    tlWrap.appendChild(tl);
    if (editable) tlWrap.appendChild(addBtn("timeline", { etapa: "Nuevo hito", fecha: "—", detalle: "" }));
    p3.appendChild(tlWrap);
  }

  /* ===== Page 4: 04 Inversión + 05 Condiciones + 06 No incluye ===== */
  const p4 = sheet();
  p4.appendChild(contHead());

  const inversion = el("section", "cz-sec cz-sec-flush");
  inversion.appendChild(sectionHead("04", t.sInversion));
  data.q.inversion.forEach((inv, i) => {
    const row = el("div", "cz-inv");
    const left = el("div", "cz-inv-left");
    left.appendChild(editableText(el("div", "cz-item-title", inv.concepto), (v) => (inv.concepto = v)));
    left.appendChild(editableText(el("div", "cz-muted cz-inv-detail", inv.detalle), (v) => (inv.detalle = v)));
    row.appendChild(left);

    const horas = el("span", "cz-inv-hours");
    const horasVal = editableText(
      el("span", null, inv.horas === null || inv.horas === undefined ? "—" : String(inv.horas)),
      (v) => {
        if (v === "—" || v === "") {
          inv.horas = null;
        } else {
          inv.horas = Number(v.replace(/[^0-9.]/g, "")) || 0;
          inv.precio = inv.horas * rate;
        }
        onChange(data, true);
      }
    );
    horas.appendChild(horasVal);
    if (inv.horas !== null && inv.horas !== undefined) {
      horas.appendChild(document.createTextNode(` h × $${rate}/h`));
    }
    row.appendChild(horas);

    row.appendChild(
      editableText(el("span", "cz-inv-price", fmtMoney(inv.precio, data.moneda, data.lang)), (v) => {
        inv.precio = Number(v.replace(/[^0-9.]/g, "")) || 0;
        onChange(data, true);
      })
    );
    if (editable) row.appendChild(removeBtn("inversion", i));
    inversion.appendChild(row);
  });
  const totalRow = el("div", "cz-total-row");
  if (editable) {
    totalRow.appendChild(
      addBtn("inversion", () => ({
        concepto: "Nueva partida",
        detalle: "Detalle.",
        horas: 8,
        precio: 8 * rate,
      }))
    );
  } else {
    totalRow.appendChild(el("span"));
  }
  const totalBox = el("div", "cz-total");
  totalBox.appendChild(el("span", "cz-doc-kicker", t.total));
  totalBox.appendChild(el("span", "cz-total-amount", fmtMoney(totalOf(data), data.moneda, data.lang)));
  totalRow.appendChild(totalBox);
  inversion.appendChild(totalRow);
  p4.appendChild(inversion);

  // 05/06 are secondary terms — set side by side as tight "fine print"
  // columns so the investment breakdown stays the focus and the page never
  // runs long, however many items get added.
  const termsColumn = (num, label, list, blank, accentClass) => {
    const col = el("div", "cz-terms-col");
    const head = el("div", "cz-terms-head");
    head.appendChild(el("span", "cz-sec-num", num));
    head.appendChild(el("span", "cz-sec-title", label));
    col.appendChild(head);
    data.q[list].forEach((textItem, i) => {
      const row = el("div", "cz-terms-item");
      row.appendChild(el("span", "cz-bullet" + (accentClass ? " " + accentClass : ""), "▪"));
      row.appendChild(
        editableText(el("span", "cz-terms-text", textItem), (v) => (data.q[list][i] = v))
      );
      if (editable) row.appendChild(removeBtn(list, i));
      col.appendChild(row);
    });
    if (editable) col.appendChild(addBtn(list, blank));
    return col;
  };
  const terms = el("div", "cz-terms");
  terms.appendChild(termsColumn("05", t.sCondiciones, "condiciones", "Nueva condición."));
  terms.appendChild(termsColumn("06", t.sNoIncluye, "noIncluye", "Nuevo punto.", "cz-bullet-accent"));
  p4.appendChild(terms);

  p4.appendChild(
    editableText(el("p", "cz-doc-vigencia", data.q.vigencia), (v) => (data.q.vigencia = v))
  );
  const foot = el("div", "cz-doc-foot");
  const footLeft = el("span", "cz-muted");
  footLeft.appendChild(document.createTextNode("No Flag Brand — "));
  const footLink = el("a", null, "noflagbrand.com");
  footLink.href = "https://noflagbrand.com";
  footLeft.appendChild(footLink);
  foot.appendChild(footLeft);
  foot.appendChild(el("span", "cz-doc-tagline", "Let's find the right direction."));
  p4.appendChild(foot);
}

/* ---------- Closing value sheet ---------- */

// Renders the final sheet: what the client gains beyond the deliverables —
// business and brand outcomes, not design features. Blue full-bleed page
// bookending the cover. Hidden entirely when an old quote has no beneficios
// and the sheet isn't editable.
export function renderValor(root, data, opts = {}) {
  const { editable = false, onChange = () => {} } = opts;
  const t = labelsFor(data.lang);
  root.textContent = "";

  if (editable && !Array.isArray(data.q.beneficios)) data.q.beneficios = [];
  const items = Array.isArray(data.q.beneficios) ? data.q.beneficios : [];
  const intro = data.q.beneficiosIntro || "";
  if (!editable && !items.length && !intro) {
    root.hidden = true;
    return;
  }
  root.hidden = false;

  const { editableText, removeBtn, addBtn } = editKit(data, editable, onChange, t);

  const head = el("div", "cz-sec-head");
  head.appendChild(el("span", "cz-sec-num", "07"));
  head.appendChild(el("span", "cz-sec-title", t.sValor));
  root.appendChild(head);

  root.appendChild(
    editableText(el("p", "cz-valor-intro", intro), (v) => (data.q.beneficiosIntro = v))
  );

  const list = el("div", "cz-valor-list");
  items.forEach((b, i) => {
    const row = el("div", "cz-valor-item");
    row.appendChild(el("span", "cz-valor-chip"));
    const body = el("div", "cz-valor-body");
    body.appendChild(editableText(el("div", "cz-valor-titulo", b.titulo), (v) => (b.titulo = v)));
    body.appendChild(
      editableText(el("div", "cz-valor-detalle", b.detalle), (v) => (b.detalle = v))
    );
    row.appendChild(body);
    if (editable) row.appendChild(removeBtn("beneficios", i));
    list.appendChild(row);
  });
  root.appendChild(list);
  if (editable) root.appendChild(addBtn("beneficios", { titulo: "Nuevo beneficio", detalle: "Detalle." }));

  const foot = el("div", "cz-valor-foot");
  foot.appendChild(el("span", null, "No Flag Brand — noflagbrand.com"));
  foot.appendChild(el("span", "cz-doc-tagline", "Let's find the right direction."));
  root.appendChild(foot);
}

/* ---------- Closing thank-you page ---------- */

// Renders the final page: a warm sign-off that bookends the cover — same blue
// full-bleed treatment, mosaic accent and NFB logo. The message is editable;
// contact + client name come from the quote meta.
export function renderThanks(root, data, opts = {}) {
  const { editable = false, onChange = () => {} } = opts;
  const t = labelsFor(data.lang);
  root.textContent = "";
  root.hidden = false;

  const { editableText } = editKit(data, editable, onChange, t);

  const logo = document.createElement("img");
  logo.src = "/images/noflagbrand-logo-white.svg";
  logo.alt = "No Flag Brand";
  logo.className = "cz-thanks-logo";
  root.appendChild(logo);

  // Mosaic accent echoing the cover, top-right.
  const art = el("div", "cz-thanks-art");
  const forms = document.createElement("img");
  forms.src = "/images/forms.png";
  forms.alt = "";
  forms.setAttribute("aria-hidden", "true");
  art.appendChild(forms);
  root.appendChild(art);

  const body = el("div", "cz-thanks-body");
  const cliente = data.meta.empresa || data.meta.nombre || "";
  const titulo = t.graciasTitulo + (cliente ? ", " + cliente : "");
  body.appendChild(el("h2", "cz-thanks-title", titulo));

  const msg = data.q.gracias || t.graciasSub;
  body.appendChild(
    editableText(el("p", "cz-thanks-msg", msg), (v) => (data.q.gracias = v))
  );

  if (data.meta.contacto) {
    body.appendChild(el("p", "cz-thanks-contact", data.meta.contacto));
  }
  root.appendChild(body);

  const foot = el("div", "cz-thanks-foot");
  foot.appendChild(el("span", null, "No Flag Brand — noflagbrand.com"));
  foot.appendChild(el("span", "cz-doc-tagline", "Let's find the right direction."));
  root.appendChild(foot);
}

/* ---------- AI generation ---------- */

// Prefers the site's own serverless endpoint (/api/cotizar, key in a Vercel
// env var). Falls back to calling Groq directly with a key pasted in the
// browser when the endpoint isn't deployed or configured (e.g. `astro dev`).
export async function generateProposal({ ctx, data, apiKey, clave }) {
  const t = labelsFor(data.lang);
  const rate = Number(data.rate) || 40;
  const payload = {
    ctx,
    nombre: data.meta.nombre,
    empresa: data.meta.empresa,
    rate,
    moneda: data.moneda,
    lang: data.lang,
    deadline: data.meta.deadline || "",
  };

  let text = null;
  let serverConfigured = false;
  try {
    const res = await fetch("/api/cotizar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, clave }),
    });
    if (res.ok) {
      text = (await res.json()).text || null;
    } else if (![404, 405, 501].includes(res.status)) {
      // The endpoint exists and is configured but the call failed (bad
      // clave, OpenAI down). "Paste a key" would be misleading advice here.
      serverConfigured = true;
    }
  } catch (e) {
    // Network failure — fall through to the browser-side key.
  }

  if (text === null) {
    if (!apiKey || !apiKey.trim()) {
      throw new Error(serverConfigured ? t.errGen : t.errKey);
    }
    const { system, user } = buildPrompts(payload);
    try {
      text = await callGroq({ apiKey, system, user });
    } catch (e) {
      if (e.status === 401 || e.status === 403) throw new Error(t.errKeyInvalid);
      throw new Error(t.errGen);
    }
  }

  const match = String(text).match(/\{[\s\S]*\}/);
  if (!match) throw new Error(t.errGen);
  const parsed = JSON.parse(match[0]);
  return {
    proyecto: parsed.proyecto || data.q.proyecto,
    brief: parsed.brief || "",
    alcance: Array.isArray(parsed.alcance) ? parsed.alcance : [],
    fases: Array.isArray(parsed.fases) ? parsed.fases : [],
    timeline: (Array.isArray(parsed.timeline) ? parsed.timeline : []).map((h) => ({
      etapa: h.etapa || "",
      fecha: h.fecha || "",
      detalle: h.detalle || "",
    })),
    inversion: (Array.isArray(parsed.inversion) ? parsed.inversion : []).map((i) => ({
      concepto: i.concepto || "",
      detalle: i.detalle || "",
      horas: i.horas === null || i.horas === undefined || i.horas === "" ? null : Number(i.horas),
      precio: Number(i.precio) || (Number(i.horas) ? Number(i.horas) * rate : 0),
    })),
    condiciones: Array.isArray(parsed.condiciones) ? parsed.condiciones : [],
    noIncluye: Array.isArray(parsed.noIncluye) ? parsed.noIncluye : [],
    vigencia: parsed.vigencia || data.q.vigencia,
    beneficiosIntro: parsed.beneficiosIntro || "",
    beneficios: (Array.isArray(parsed.beneficios) ? parsed.beneficios : []).map((b) => ({
      titulo: b.titulo || "",
      detalle: b.detalle || "",
    })),
    gracias: parsed.gracias || data.q.gracias || "",
  };
}
