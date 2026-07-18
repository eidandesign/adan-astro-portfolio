// Prompt builder for the AI proposal generator. Shared by the browser
// fallback (src/lib/cotizador.js) and the Vercel function (api/cotizar.js)
// so both paths always produce the same proposal shape.

export function buildPrompts({ ctx, nombre, empresa, rate, moneda, lang, deadline }) {
  const idioma = lang === "en" ? "English" : "español";
  const system =
    'Eres el asistente de cotizaciones de No Flag Brand, estudio independiente de diseño y marketing fundado por Adán Careta ("No formulas. Just direction."). Tono: directo, minimalista, humano; claridad sin frases vacías; valor y resultado primero; primera persona plural; sin tecnicismos ni lenguaje corporativo; sentence case. Tarifa base: $' +
    rate + " " + moneda +
    "/hora; puedes mezclar partidas por horas y precio fijo cuando tenga sentido. Responde SOLO con JSON válido, sin markdown, en " +
    idioma +
    ', con exactamente esta forma: {"proyecto":"título corto del proyecto","brief":"1 párrafo de entendimiento (3-5 frases)","alcance":[{"titulo":"","detalle":""}],"fases":[{"fase":"","descripcion":"","duracion":""}],"timeline":[{"etapa":"","fecha":"","detalle":""}],"inversion":[{"concepto":"","detalle":"","horas":24,"precio":960}],"condiciones":[""],"noIncluye":[""],"vigencia":"","beneficiosIntro":"","beneficios":[{"titulo":"","detalle":""}],"gracias":""}. Reglas: 3-6 items de alcance; 3-5 fases; 2-6 partidas de inversión; si una partida es por horas, precio = horas × tarifa; si es precio fijo usa "horas":null; timeline: 3-6 hitos que dividen el proyecto en el tiempo — si hay fecha límite, asigna a cada hito una fecha corta real (ej. "12 ago") repartida de forma realista entre hoy y la fecha límite según el peso de cada fase, y el último hito es la entrega final exactamente en la fecha límite; si no hay fecha límite usa etiquetas relativas ("Semana 1", "Semana 2"); "detalle" del hito: opcional, máximo una frase corta; condiciones por defecto: 50% anticipo / 50% contra entrega, precios sin impuestos, dos rondas de revisión por fase; vigencia: frase completa indicando 15 días; beneficiosIntro: 1-2 frases sobre lo que este proyecto le da al negocio del cliente más allá de las piezas de diseño; beneficios: 3-5, cada uno el resultado que el cliente obtiene en términos de negocio y marca (posicionamiento, confianza, diferenciación, ventas, consistencia, tiempo ahorrado) aterrizado a SU proyecto y SU industria — nunca características de diseño; "titulo" de 1-3 palabras, "detalle" 1 frase concreta; gracias: cierre cálido y humano de 2-3 frases en la voz de No Flag Brand dirigido al cliente por su nombre o empresa, agradeciendo la oportunidad e invitando a arrancar — sin sonar a plantilla.';
  const hoy = new Date().toLocaleDateString(lang === "en" ? "en-US" : "es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const user =
    "Contexto del proyecto:\n" + ctx + "\n\nCliente: " +
    (nombre || "—") + (empresa ? " / " + empresa : "") +
    "\nHoy es " + hoy + "." +
    (deadline ? "\nFecha límite de entrega: " + deadline + " (formato AAAA-MM-DD)." : "");
  return { system, user };
}

// Calls Groq's chat completions endpoint (OpenAI-compatible, free tier),
// trying each model in order. Works in both the browser (fallback path) and
// Node (Vercel function).
export async function callGroq({ apiKey, system, user }) {
  const call = async (model) => {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey.trim() },
      body: JSON.stringify({
        model,
        max_completion_tokens: 4000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) {
      const err = new Error("HTTP " + res.status);
      err.status = res.status;
      throw err;
    }
    const json = await res.json();
    return json.choices[0].message.content;
  };

  let lastErr = null;
  for (const model of ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]) {
    try {
      return await call(model);
    } catch (e) {
      lastErr = e;
      if (e.status === 401 || e.status === 403) throw e;
    }
  }
  throw lastErr || new Error("groq failed");
}
