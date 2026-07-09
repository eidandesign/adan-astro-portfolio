---
description: Auditoría completa (limpieza, seguridad, design system, CMS, SEO, a11y) antes de hacer checkpoint
argument-hint: "[full] — sin argumento revisa solo los cambios; 'full' audita todo el repo"
---

# /review

Auditoría del código antes de hacer checkpoint. Limpia, revisa seguridad, consistencia, SEO y vulnerabilidades. Al final reporta lo que se corrigió y lo que queda pendiente.

Contexto del proyecto: sitio Astro 4 **estático** (sin API routes ni auth). El diseño sigue a www.adancareta.com (Webflow). El CMS son archivos Markdown en `src/content/case-studies/` con schema en `src/content/config.ts`. Estilos compartidos en `src/styles/site.css`, animaciones con GSAP ScrollTrigger.

## Alcance

- **Sin argumento** (default): auditar solo los archivos modificados/nuevos desde el último commit (`git status` + `git diff`). Es el modo pre-checkpoint.
- **`/review full`**: auditar todo `src/`, `public/` (referencias, no binarios) y la configuración.

Argumento recibido: $ARGUMENTS

## Checks rápidos para arrancar

Correr estos antes de leer código (ajustar al alcance):

```bash
git status && git diff --stat
grep -rn "console\.log" src/ --include="*.astro" --include="*.ts"
grep -rn 'target="_blank"' src/ | grep -v "noopener"
grep -rn "TODO\|FIXME\|XXX\|lorem\|adsf" src/
npx astro check 2>&1 | tail -20   # errores de tipos en .astro
```

Lo que salga de aquí es el punto de partida, no el límite: después leer los archivos del alcance completos.

## Categorías de revisión

### 1. Código muerto y limpieza
- Variables, imports, funciones y estilos CSS que se declaran pero nunca se usan
- Comentarios redundantes que solo describen lo que ya dice el nombre
- `console.log` de debug que no son intencionales
- Código comentado que ya no tiene propósito
- Selectores CSS en `<style>` de páginas que duplican reglas ya presentes en `site.css`
- **Excepción conocida**: el scaffold de Sanity (`sanity/`, `src/utils/sanity.ts`, componentes React en `src/components/*.tsx`, `src/layouts/`) está dormido a propósito — no reportarlo cada vez, solo si interfiere con algo

### 2. Seguridad (sitio estático)
- **XSS**: uso de `set:html` con datos que no controlamos (el JSON-LD con `JSON.stringify` de frontmatter propio está bien)
- **Enlaces externos**: `target="_blank"` sin `rel="noopener"`
- **Exposición de datos**: keys, secrets o tokens hardcodeados en el código fuente o en archivos que van a git
- **Dependencias**: imports de módulos que no están en `package.json`
- **`eval()` o `Function()`**: uso de ejecución dinámica de código

### 3. Consistencia con el design system (site.css / sitio vivo)
- Colores hardcodeados fuera de los tokens: usar `var(--surface-background)`, `var(--text-primary)`, `var(--primary)`, etc. en vez de hex sueltos (los hex heredados del CSS de Webflow en los templates son aceptables si vienen del sitio vivo)
- Tipografías fuera del sistema: títulos en Powergrotesk (`.title`, `.titles`), cuerpo en Switzer (`.paragraph`, `.labels`); Playfair Display solo para el typewriter del héroe
- Componentes duplicados: si algo existe en `ConnectSection.astro` o `SEO.astro`, usarlo — no copiar el markup
- Botones: usar `.button-big` / `.button-return` / `.buttons`, no estilos ad-hoc
- El diseño debe seguir a www.adancareta.com; desviaciones visuales son bugs salvo que sean mejoras pedidas (GSAP/Three)

### 4. Contenido y CMS
- Frontmatter de cada `.md` válido contra el schema de `src/content/config.ts`
- Todas las imágenes referenciadas en frontmatter existen en `public/`
- Sin lorem ipsum, placeholders ni typos evidentes en el contenido
- URLs de Figma/prototipos con formato válido y apuntando al proyecto correcto
- `order:` sin duplicados dentro del mismo `kind`

### 5. SEO
- Toda página nueva usa el componente `SEO.astro` (canonical, OG, Twitter)
- Exactamente **un** `<h1>` por página y jerarquía h2/h3 coherente
- Imágenes con `alt` descriptivo (decorativas con `alt=""` está bien)
- Páginas stub/redirect fuera del sitemap (filtro en `astro.config.mjs`)
- JSON-LD presente en homepage (Person) y páginas de proyecto (CreativeWork)

### 6. Correctness y edge cases
- Scripts que hacen `querySelector` y usan el resultado sin guard de null (páginas donde el elemento no existe)
- GSAP: `registerPlugin(ScrollTrigger)` antes de usar ScrollTrigger; animaciones sobre selectores que pueden no existir en esa página
- Contenido opcional del schema: los templates deben tolerar campos ausentes (`exploration`, `prototype`, `results`, etc.)
- Listeners de eventos duplicados o timers (`setInterval`) que no se limpian

### 7. Performance
- Imágenes above-the-fold con `loading="eager"` (+ `fetchpriority="high"` en la LCP); el resto `loading="lazy"`
- Imágenes enormes sin necesidad (más de ~500KB para uso decorativo): revisar con `find public -size +500k`
- Fuentes: solo los pesos que se usan
- Animaciones GSAP que corren sin `ScrollTrigger` en elementos fuera de viewport

### 8. Accesibilidad básica
- Botones `<button>` sin `type="button"` dentro de un `<form>` (se interpretan como submit)
- Imágenes informativas sin atributo `alt`
- Inputs sin `label` asociado o `aria-label`
- Elementos interactivos hechos con `<div>` sin `role`, `tabindex` ni manejo de teclado
- Elementos interactivos sin estado focus visible

### 9. Verificación final
- `npm run build` debe pasar sin errores ni warnings nuevos
- Verificar en el preview (herramientas preview_*) las páginas afectadas por los cambios — en modo `full`, mínimo: homepage, un case study, una página de portfolio y la 404 — sin errores de consola
- Si se corrigió algo visual, comparar con screenshot

## Reglas

- Corregir directamente lo que sea inequívoco (código muerto, typos, `rel` faltante, alt vacío en imagen informativa).
- NO cambiar sin preguntar: contenido de los case studies, decisiones de diseño, dependencias, nada del scaffold de Sanity.
- No hacer cambios sin reportarlos.

## Output esperado

Al terminar, generar un reporte con este formato:

```
## Reporte de revisión (alcance: cambios | full)

### ✅ Corregido automáticamente
- [lista de lo que se arregló con archivo:línea]

### ⚠️ Requiere decisión tuya
- [cosas que se detectaron pero que no se deben cambiar sin confirmación]

### 🟢 Sin problemas encontrados en
- [áreas que se revisaron y están bien]
```

Si no hay nada que corregir en alguna categoría, decirlo explícitamente. Cerrar diciendo si el proyecto está listo para `/checkpoint`.
