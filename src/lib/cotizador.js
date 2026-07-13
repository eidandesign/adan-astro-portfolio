// Shared logic for the private quote builder (/cotizador) and the client
// view page (/cotizador/ver). The quote travels between them encoded in the
// URL hash, so the viewer works without any backend or database.
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
    total: "Total",
    add: "+ Add",
    remove: "Remove",
    gateTitle: "Private access",
    gateText: "Enter the key to open the quote builder.",
    phClave: "Access key",
    entrar: "Enter",
    claveIncorrecta: "Wrong key.",
    linkInvalido: "This link doesn't contain a valid quote. Ask the sender for a new one.",
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
    meta: { nombre: "", empresa: "", contacto: "", numero: "NFB-2026-001", fecha: todayStr(lang) },
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

/* ---------- Cover page ---------- */

// The cover art is a flag on a pole — a nod to the No Flag Brand name: the
// vertical bar from the logo becomes the mast, and the brand's real mosaic
// artwork (public/images/forms.png, 1:2 vertical) becomes the cloth, clipped
// by a gentle wave so it reads as waving.
const COVER_ART_SVG = `
<svg viewBox="0 0 240 560" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <!-- Mast: same vertical bar as the logo, hanging from the page's top edge -->
  <rect x="14" y="0" width="6" height="560" rx="3" fill="#FFFFFF"/>

  <!-- Cloth: the brand mosaic, free edges waving -->
  <g transform="translate(20, 16)">
    <defs>
      <clipPath id="czFlagWave">
        <path d="M0 0 H196
                 C204 60 188 120 196 180
                 C204 260 186 330 194 392
                 C150 406 60 388 0 398 Z"/>
      </clipPath>
    </defs>
    <image href="/images/forms.png" x="-2" y="-4" width="210" height="420"
      preserveAspectRatio="xMidYMid slice" clip-path="url(#czFlagWave)"/>
  </g>

  <!-- Wind accents trailing off the cloth -->
  <circle cx="230" cy="120" r="9" fill="#F8C9A0"/>
  <circle cx="222" cy="452" r="6" fill="#F0532D"/>
</svg>`;

// Renders the brand cover sheet: blue full-bleed page with the white NFB
// logo, the geometric art and the client block near the bottom.
export function renderCover(root, data) {
  const t = labelsFor(data.lang);
  root.textContent = "";

  const logo = document.createElement("img");
  logo.src = "/images/noflagbrand-logo-white.svg";
  logo.alt = "No Flag Brand";
  logo.className = "cz-cover-logo";
  root.appendChild(logo);

  const art = el("div", "cz-cover-art");
  art.innerHTML = COVER_ART_SVG;
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

// Renders the quote document into `root`. In editable mode, text becomes
// contenteditable (committed on blur via onChange) and lists get add/remove
// controls (which trigger a re-render through onChange).
export function renderDoc(root, data, opts = {}) {
  const { editable = false, onChange = () => {} } = opts;
  const t = labelsFor(data.lang);
  const rate = Number(data.rate) || 0;
  root.textContent = "";

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

  const sectionHead = (num, label) => {
    const head = el("div", "cz-sec-head");
    head.appendChild(el("span", "cz-sec-num", num));
    head.appendChild(el("span", "cz-sec-title", label));
    return head;
  };

  /* Header */
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
  root.appendChild(head);

  /* Prepared for */
  const cliente = [data.meta.nombre, data.meta.empresa].filter(Boolean).join(" · ") || "—";
  const prep = el("div", "cz-doc-prep");
  prep.appendChild(el("div", "cz-doc-kicker", t.preparadoPara));
  const prepLine = el("div", "cz-doc-prepline");
  prepLine.appendChild(el("strong", null, cliente));
  if (data.meta.contacto) prepLine.appendChild(el("span", "cz-muted", " · " + data.meta.contacto));
  prep.appendChild(prepLine);
  root.appendChild(prep);

  /* Title */
  root.appendChild(
    editableText(el("h1", "cz-doc-h1", data.q.proyecto), (v) => (data.q.proyecto = v))
  );

  /* 01 Brief */
  const brief = el("section", "cz-sec");
  brief.appendChild(sectionHead("01", t.sBrief));
  brief.appendChild(editableText(el("p", "cz-doc-brief", data.q.brief), (v) => (data.q.brief = v)));
  root.appendChild(brief);

  /* 02 Alcance */
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
  root.appendChild(alcance);

  /* 03 Fases */
  const fases = el("section", "cz-sec");
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
  root.appendChild(fases);

  /* 04 Inversión */
  const inversion = el("section", "cz-sec");
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
  root.appendChild(inversion);

  /* 05 Condiciones + 06 No incluye */
  const simpleList = (num, label, list, blank, accentClass) => {
    const sec = el("section", "cz-sec");
    sec.appendChild(sectionHead(num, label));
    data.q[list].forEach((textItem, i) => {
      const row = el("div", "cz-item");
      row.appendChild(el("span", "cz-bullet" + (accentClass ? " " + accentClass : ""), "▪"));
      row.appendChild(
        editableText(el("span", "cz-item-body", textItem), (v) => (data.q[list][i] = v))
      );
      if (editable) row.appendChild(removeBtn(list, i));
      sec.appendChild(row);
    });
    if (editable) sec.appendChild(addBtn(list, blank));
    return sec;
  };
  root.appendChild(simpleList("05", t.sCondiciones, "condiciones", "Nueva condición."));
  root.appendChild(simpleList("06", t.sNoIncluye, "noIncluye", "Nuevo punto.", "cz-bullet-accent"));

  /* Vigencia + footer */
  root.appendChild(
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
    inversion: (Array.isArray(parsed.inversion) ? parsed.inversion : []).map((i) => ({
      concepto: i.concepto || "",
      detalle: i.detalle || "",
      horas: i.horas === null || i.horas === undefined || i.horas === "" ? null : Number(i.horas),
      precio: Number(i.precio) || (Number(i.horas) ? Number(i.horas) * rate : 0),
    })),
    condiciones: Array.isArray(parsed.condiciones) ? parsed.condiciones : [],
    noIncluye: Array.isArray(parsed.noIncluye) ? parsed.noIncluye : [],
    vigencia: parsed.vigencia || data.q.vigencia,
  };
}
