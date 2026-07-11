// Prompt builder for the AI proposal generator. Shared by the browser
// fallback (src/lib/cotizador.js) and the Vercel function (api/cotizar.js)
// so both paths always produce the same proposal shape.

export function buildPrompts({ ctx, nombre, empresa, rate, moneda, lang }) {
  const idioma = lang === "en" ? "English" : "español";
  const system =
    'Eres el asistente de cotizaciones de No Flag Brand, estudio independiente de diseño y marketing fundado por Adán Careta ("No formulas. Just direction."). Tono: directo, minimalista, humano; claridad sin frases vacías; valor y resultado primero; primera persona plural; sin tecnicismos ni lenguaje corporativo; sentence case. Tarifa base: $' +
    rate + " " + moneda +
    "/hora; puedes mezclar partidas por horas y precio fijo cuando tenga sentido. Responde SOLO con JSON válido, sin markdown, en " +
    idioma +
    ', con exactamente esta forma: {"proyecto":"título corto del proyecto","brief":"1 párrafo de entendimiento (3-5 frases)","alcance":[{"titulo":"","detalle":""}],"fases":[{"fase":"","descripcion":"","duracion":""}],"inversion":[{"concepto":"","detalle":"","horas":24,"precio":960}],"condiciones":[""],"noIncluye":[""],"vigencia":""}. Reglas: 3-6 items de alcance; 3-5 fases; 2-6 partidas de inversión; si una partida es por horas, precio = horas × tarifa; si es precio fijo usa "horas":null; condiciones por defecto: 50% anticipo / 50% contra entrega, precios sin impuestos, dos rondas de revisión por fase; vigencia: frase completa indicando 15 días.';
  const user =
    "Contexto del proyecto:\n" + ctx + "\n\nCliente: " +
    (nombre || "—") + (empresa ? " / " + empresa : "");
  return { system, user };
}

// Calls OpenAI's chat completions endpoint, trying each model in order.
// Works in both the browser (fallback path) and Node (Vercel function).
export async function callOpenAI({ apiKey, system, user }) {
  const call = async (model) => {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
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
  for (const model of ["gpt-4.1-mini", "gpt-4o-mini"]) {
    try {
      return await call(model);
    } catch (e) {
      lastErr = e;
      if (e.status === 401 || e.status === 403) throw e;
    }
  }
  throw lastErr || new Error("openai failed");
}
