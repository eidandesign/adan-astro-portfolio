# 📋 Guía de Migración: Webflow → Sanity + Astro

Este documento te guía paso a paso en la migración de tu portafolio de Webflow a Astro + Sanity.

## ✅ Fase 1: Preparación (1-2 horas)

### 1.1 Inventario de contenido

Tu portafolio Webflow incluye estos proyectos:

```
📁 Proyectos Webflow (del código extraído):
├── NASA - CATENI (spacemarts)
├── Taskeeter (branding, landing, header)
├── Tolktu
├── Stanza Warriors
└── Otros proyectos en desarrollo
```

**Acción**: Abre `detail_case-studies.html` y `detail_portfolio.html` para ver la estructura.

### 1.2 Crear cuenta Sanity

1. Ve a https://www.sanity.io
2. Crea cuenta gratuita
3. Crea nuevo proyecto:
   - **Nombre**: "Adan Portfolio"
   - **Dataset**: `production`
   - **Template**: Blank (empezamos con schema propio)
4. Copia tu **Project ID** en un lugar seguro

### 1.3 Conectar Sanity al proyecto Astro

```bash
# En el directorio del proyecto
npm install sanity @sanity/client @sanity/image-url
```

Actualiza tu `.env.local`:

```env
SANITY_PROJECT_ID=YOUR_PROJECT_ID_HERE
SANITY_DATASET=production
SANITY_API_VERSION=2024-01-01
```

Actualiza `src/utils/sanity.ts` con tu PROJECT_ID.

## 📊 Fase 2: Setup Sanity Studio (30 mins)

### 2.1 Inicializar Sanity Studio

```bash
npm install -g @sanity/cli
sanity init
```

Sigue los prompts:
- Selecciona proyecto existente (el que creaste)
- Selecciona dataset `production`
- No descargar starter template

### 2.2 Configurar schema en Sanity

Ya hemos creado los tipos en:
- `sanity/schemaTypes/project.ts`
- `sanity/schemaTypes/contactInfo.ts`
- `sanity/schemaTypes/blockContent.ts`

Para usar estos en Sanity:

```bash
cd sanity
npm install
```

### 2.3 Iniciar Sanity Studio

```bash
npm run sanity -- studio
```

Abre http://localhost:3333 y verás el CMS.

## 🎯 Fase 3: Migración de Contenido (2-4 horas)

### 3.1 Crear documento ContactInfo

1. En Sanity Studio, ve a **Create**
2. Selecciona **Contact Information**
3. Completa campos:
   - **Email**: design.adan@gmail.com
   - **Phone**: +525534006717
   - **Calendly URL**: https://calendly.com/letsconnect
   - **LinkedIn**: https://linkedin.com/in/acareta
   - **Behance**: https://behance.net/eidan
   - **Dribbble**: https://dribbble.com/eidan
   - **Instagram**: https://instagram.com/eidan
4. **Publish**

### 3.2 Crear Proyectos (Case Studies)

Para cada proyecto en tu portafolio, crea un documento **Project**.

**Ejemplo: NASA - CATENI**

```
Title: "NASA - CATENI - Stanza Warriors"
Slug: nasa-cateni-stanza-warriors (auto-generado)
Featured: ✓ (sí)
Category: Product Design
Year: 2024
Client: NASA
Role: Senior Product Designer
Team: Internal NASA team
Tech Used: Figma, React, Design Systems
Description: "Diseño de plataforma de colaboración..."

Challenge: (copiar del texto Webflow)
"Users needed a centralized way to..."

Key Opportunities:
"Simplify the onboarding..."

Solution:
"We created a dashboard that..."

Impact:
"Reduced time-to-value by 40%..."

Hero Image: (subir spacemarts-1.jpg)
Images: [spacemarts-1.jpg, spacemarts-2.jpg, ...]
```

**Proyectos a migrar** (del código Webflow):

1. ✅ NASA - CATENI
   - Imágenes: `nasa-cateni_1.avif`, `spacemarts-*.jpg`
   - Descripción: Platform para stanza warriors

2. ✅ Taskeeter
   - Imágenes: `tasketeer-header.jpg`, `tasketeer-branding.png`, `tasketeer-landing.jpg`
   - Descripción: Branding y landing page

3. ✅ Tolktu
   - Imagen: `tolktu_1.avif`
   - Descripción: Project design (por detallar)

4. ✅ Stanza Warriors
   - Imagen: `stanza-warriors_1.avif`
   - Descripción: Project design (por detallar)

### 3.3 Subir Imágenes a Sanity

Sanity maneja imágenes automáticamente. Solo:

1. En el formulario de proyecto, haz click en **Hero Image**
2. Sube o arrastra `spacemarts-1.jpg`
3. Crop si es necesario (Sanity lo hará automático)
4. Para **Images gallery**, añade múltiples imágenes

**Nota**: Sanity optimiza automáticamente. No necesitas comprimir.

## 🔧 Fase 4: Verificación (30 mins)

### 4.1 Verificar datos en Sanity

```bash
# Terminal 1: Sanity Studio
npm run sanity -- studio

# Terminal 2: Dev server Astro
npm run dev
```

### 4.2 Verificar que Astro lee datos

Abre http://localhost:3000 en tu navegador:

1. ✅ Home page muestra "Featured Projects"
2. ✅ Projects vienen de Sanity (no hardcoded)
3. ✅ Portfolio page lista todos los proyectos
4. ✅ Links a proyectos funcionan
5. ✅ Páginas de detalle cargan datos correctamente

### 4.3 Verificar ContactForm

1. Ve a /contact
2. Completa formulario
3. Verifica que el email sea el de Sanity
4. Verifica que enlace Calendly sea correcto

## 🎨 Fase 5: Personalización (1-2 horas)

### 5.1 Ajustar colores

En `tailwind.config.mjs`, modifica:

```javascript
colors: {
  primary: '#YOUR_COLOR',
  secondary: '#YOUR_COLOR',
}
```

### 5.2 Ajustar tipografía

En `src/styles/global.css`:

```css
@font-face {
  font-family: 'Switzer';
  src: url('/fonts/Switzer-Regular.otf') format('opentype');
}

body {
  font-family: 'Switzer', system-ui, sans-serif;
}
```

Copia los fonts de Webflow a `public/fonts/`.

### 5.3 Personalizar animaciones

En componentes React:

```javascript
// src/components/HeroSection.tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { /* ajusta aquí */ }
  }
}
```

## 🚀 Fase 6: Deploy (30 mins)

### 6.1 GitHub

```bash
git init
git add .
git commit -m "Initial commit: Astro + Sanity"
git remote add origin https://github.com/YOUR_USERNAME/adan-portfolio.git
git push -u origin main
```

### 6.2 Netlify

1. Ve a https://netlify.com
2. **New site from Git**
3. Selecciona tu repo
4. **Deploy settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. **Environment variables**:
   - Añade `SANITY_PROJECT_ID`
   - Añade `SANITY_DATASET`
6. **Deploy**

### 6.3 Dominio

1. En Netlify, ve a **Domain settings**
2. Apunta tu dominio `adancareta.com` a Netlify

## 📋 Checklist de Migración

```
Fase 1: Preparación
  ☐ Sanity account creada
  ☐ Project ID obtenido
  ☐ .env.local configurado
  ☐ Variables de entorno seteadas

Fase 2: Setup Sanity Studio
  ☐ Sanity CLI instalado
  ☐ Studio corriendo en localhost:3333
  ☐ Schema tipos creados

Fase 3: Contenido
  ☐ Contact Info completado
  ☐ NASA - CATENI migrado
  ☐ Taskeeter migrado
  ☐ Tolktu migrado
  ☐ Stanza Warriors migrado
  ☐ Otras imágenes subidas

Fase 4: Verificación
  ☐ Home page muestra projects
  ☐ Portfolio page funciona
  ☐ Páginas detalle cargan datos
  ☐ ContactForm funciona
  ☐ Links funcionan

Fase 5: Personalización
  ☐ Colores ajustados
  ☐ Fonts importados
  ☐ Animaciones personalizadas
  ☐ Todos los cambios pusheados a Git

Fase 6: Deploy
  ☐ GitHub repo creado
  ☐ Netlify conectado
  ☐ Dominio apuntando a Netlify
  ☐ Deploy exitoso
  ☐ Sitio en vivo en adancareta.com
```

## 🆘 Troubleshooting

### El sitio dice "No projects found"

**Problema**: Sanity no devuelve datos
**Solución**:
1. Verifica SANITY_PROJECT_ID en `.env.local`
2. Verifica que hayas publicado proyectos en Sanity
3. Reinicia el servidor Astro

### Las imágenes no cargan

**Problema**: URLs de imágenes rotas
**Solución**:
1. Verifica que subiste imágenes en Sanity
2. Comprueba que `urlFor()` está configurado correctamente
3. Abre DevTools → Network para ver errores

### Deploy en Netlify falla

**Problema**: Build error
**Solución**:
1. Verifica `npm run build` funciona localmente
2. Verifica variables de entorno en Netlify
3. Checa logs en Netlify Deploy

## 📞 Próximos Pasos

Una vez completada esta migración:

1. **Blog (opcional)**: Añadir tipo "Post" a Sanity
2. **Analytics**: Integrar Google Analytics
3. **SEO**: Actualizar sitemap y robots.txt
4. **Performance**: Monitorear Core Web Vitals

---

**Duración total estimada**: 6-8 horas
**Costo**: $0 (Sanity free tier soporta portafolios)

¿Listo? ¡Empecemos! 🚀
