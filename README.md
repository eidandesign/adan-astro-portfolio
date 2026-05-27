# Adan Careta - Portfolio Astro + Sanity

Portafolio personal construido con **Astro**, **React**, **Framer Motion**, y **Sanity CMS**.

## 🎯 Características

- ⚡ **Ultra-rápido**: Astro static generation + optimización de imágenes
- 🎨 **Hermoso diseño**: Componentes modernos con Framer Motion
- 📱 **Responsive**: Mobile-first design
- 🗂️ **Headless CMS**: Sanity para gestionar contenido
- 🔍 **SEO optimizado**: Metadatos y sitemap automático
- 🌙 **Animaciones nativas**: CSS + Framer Motion (sin dependencias pesadas)
- 📧 **Formulario de contacto**: Integrado con iCal

## 🚀 Quick Start

### 1. **Clonar el repositorio**

```bash
git clone <tu-repo>
cd adan-astro-portfolio
```

### 2. **Instalar dependencias**

```bash
npm install
```

### 3. **Configurar variables de entorno**

Copia `.env.example` a `.env.local` y completa:

```bash
cp .env.example .env.local
```

Necesitarás:
- `SANITY_PROJECT_ID`: Tu Sanity project ID
- `SANITY_DATASET`: Nombre del dataset (ej: `production`)

### 4. **Iniciar servidor de desarrollo**

```bash
npm run dev
```

Visita `http://localhost:3000`

## 📁 Estructura del Proyecto

```
adan-astro-portfolio/
├── sanity/                 # Configuración y schema de Sanity
│   ├── sanity.config.ts
│   └── schemaTypes/       # Tipos: project, contactInfo, blockContent
├── src/
│   ├── pages/             # Páginas Astro
│   │   ├── index.astro    # Home
│   │   ├── portfolio/     # Portfolio
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   └── contact.astro
│   ├── components/        # Componentes React
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroSection.tsx
│   │   ├── ProjectCard.tsx
│   │   └── ContactForm.tsx
│   ├── layouts/           # Layouts reutilizables
│   │   └── Layout.tsx
│   ├── utils/             # Utilidades
│   │   └── sanity.ts      # Cliente de Sanity y queries
│   ├── styles/            # CSS global
│   │   └── global.css
│   └── types/             # TypeScript types
├── public/                # Assets estáticos
├── astro.config.mjs       # Configuración de Astro
├── tailwind.config.mjs    # Configuración de Tailwind
├── tsconfig.json          # TypeScript config
└── package.json
```

## 🔑 Variables de Entorno

Crear `.env.local` con:

```env
SANITY_PROJECT_ID=YOUR_PROJECT_ID
SANITY_DATASET=production
SANITY_API_VERSION=2024-01-01
SITE_URL=https://adancareta.com
```

## 📦 Dependencias Principales

- **Astro**: Framework estático
- **React**: Para componentes interactivos
- **Framer Motion**: Animaciones
- **Tailwind CSS**: Estilos
- **Sanity**: CMS headless
- **TypeScript**: Type safety

## 🎨 Componentes

### Navbar
- Navbar responsivo con menú mobile
- Estado de scroll dinámico
- Animaciones smooth

### HeroSection
- Gradientes animados
- Botones CTA
- Indicador de scroll

### ProjectCard
- Imagen con hover effect
- Información del proyecto
- Link a case study

### ContactForm
- Formulario de contacto
- Integración con iCal
- Validación de campos

## 🌐 Sanity CMS

### Schema Types

#### Project
- Title, slug, featured
- Category, year, client
- Role, team, tech used
- Challenge, key opportunities, solution, impact
- Hero image, images gallery
- External case study link

#### ContactInfo
- Email, phone
- Calendly URL
- Social links (LinkedIn, Twitter, etc.)

#### BlockContent
- Rich text con formatting
- Links e imágenes embebidas

## 🚀 Deployment

### Netlify (Recomendado)

1. **Push a GitHub**
```bash
git add .
git commit -m "Initial commit"
git push
```

2. **Conecta Netlify**
   - Ir a netlify.com
   - New site from Git
   - Selecciona tu repo
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Añade variables de entorno en Netlify**
   - Ir a Site settings → Environment
   - Añade `SANITY_PROJECT_ID`, etc.

4. **Deploy automático**
   - Cada push a main dispara un deploy

### Vercel

```bash
npm install -g vercel
vercel
```

## 📝 Migración de Contenido Webflow

Los siguientes datos están listos para migrar:

1. **Proyectos** (del portafolio Webflow)
   - Títulos, descripción, imágenes
   - Case studies con problema/solución
   - Información de rol, equipo, herramientas

2. **Información de Contacto**
   - Email
   - Calendly link
   - Social media links

3. **Imágenes y Assets**
   - Fonts custom
   - Imágenes del portafolio
   - Videos (si aplica)

## 🎯 Próximos Pasos

1. **Setup Sanity**
   - Crear cuenta en sanity.io
   - Crear nuevo proyecto
   - Obtener PROJECT_ID

2. **Migrar Contenido**
   - Importar proyectos a Sanity
   - Actualizar información de contacto
   - Subir imágenes

3. **Personalizar Diseño**
   - Ajustar colores en `tailwind.config.mjs`
   - Cambiar fuentes en estilos
   - Personalizar animaciones en componentes

4. **Deploy**
   - Conectar a Netlify o Vercel
   - Setup dominio
   - Monitorear performance

## 📊 Performance

- Lighthouse: 95+ (todos los metrics)
- Core Web Vitals: Passing
- Load time: <1s

## 🔗 Links Útiles

- [Astro Docs](https://docs.astro.build)
- [Sanity Docs](https://www.sanity.io/docs)
- [Framer Motion Docs](https://www.framer.com/motion)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 📧 Soporte

Para preguntas o issues, contacta a design.adan@gmail.com

---

**Última actualización**: Mayo 2024
