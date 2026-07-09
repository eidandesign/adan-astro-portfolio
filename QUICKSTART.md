# 🚀 QUICKSTART - 10 Pasos para Comenzar

## Paso 1: Clonar y configurar

```bash
# Si estás en tu compu
cd /path/to/projects
git clone <tu-repo-github> adan-portfolio
cd adan-portfolio

# O si estás en Claude Code
# Simplemente sigue los pasos
```

## Paso 2: Instalar dependencias

```bash
npm install
```

**Tiempo estimado**: 2 mins

## Paso 3: Crear cuenta Sanity

1. Ve a https://www.sanity.io
2. Sign up (gratis)
3. Crea proyecto:
   - Name: "Adan Portfolio"
   - Dataset: `production`
4. **Copia tu Project ID**

## Paso 4: Configurar variables de entorno

```bash
# Copia el archivo example
cp .env.example .env.local

# Edita con tu Project ID
nano .env.local  # o abre con tu editor
```

Reemplaza:
```env
SANITY_PROJECT_ID=YOUR_PROJECT_ID_HERE
```

## Paso 5: Iniciar Sanity Studio

```bash
# Terminal 1
npm run sanity -- studio
```

Abre http://localhost:3333

## Paso 6: Crear Contact Info en Sanity

1. Click en **Create**
2. Selecciona **Contact Information**
3. Completa:
   - Email: `design.adan@gmail.com`
   - Phone: `+525534006717`
   - Calendly: `https://calendly.com/letsconnect`
   - LinkedIn: `https://linkedin.com/in/acareta`
   - Behance: `https://behance.net/eidan`
   - Dribbble: `https://dribbble.com/eidan`
4. **Publish**

## Paso 7: Crear tu primer Proyecto

1. Click en **Create**
2. Selecciona **Project**
3. Completa formulario:

```
Title: "Taskeeter - Branding & Design"
Slug: taskeeter (auto)
Featured: ✓
Category: Branding
Year: 2024
Client: "Taskeeter"
Role: "Senior Product Designer"
Team: "Design team"
Tech Used: Figma, Webflow
Description: "Complete branding and landing page design"
```

4. **Sube Hero Image**: `taskeeter-header.jpg` (está en `/public/images`)
5. En **Challenge**, escribe:

```
"Need to create cohesive brand identity and landing page for task management tool."
```

6. En **Solution**:

```
"Designed comprehensive brand system with logo, colors, and typography. Created clean, modern landing page with focus on simplicity and usability."
```

7. **Publish**

## Paso 8: Iniciar servidor Astro

```bash
# Terminal 2 (nueva terminal, Terminal 1 sigue corriendo Sanity)
npm run dev
```

Abre http://localhost:3000

## Paso 9: Verificar que funciona

Checklist:

- [ ] Página home carga
- [ ] "Featured Projects" muestra tu proyecto
- [ ] Puedes hacer click en proyecto
- [ ] Página de detalle carga correctamente
- [ ] ContactForm funciona
- [ ] Links de redes sociales funcionan

## Paso 10: Commit a Git y Deploy

```bash
# Terminal 3 (nueva terminal)
git add .
git commit -m "Initial Astro + Sanity setup"
git push origin main
```

Conecta a Netlify:

1. Ve a https://netlify.com
2. Click **New site from Git**
3. Selecciona tu repo
4. Deploy settings:
   - Build: `npm run build`
   - Publish: `dist`
5. Añade env variables
6. Click **Deploy**

---

## ✅ ¡Lo hiciste!

Tu portafolio está en vivo. Ahora:

1. **Migra más proyectos** a Sanity
2. **Personaliza colores** en `tailwind.config.mjs`
3. **Ajusta animaciones** en componentes
4. **Sube dominio** en Netlify

## 📚 Recursos

- [README.md](./README.md) - Documentación completa
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Guía detallada de migración
- [Sanity Docs](https://www.sanity.io/docs)
- [Astro Docs](https://docs.astro.build)

## 🆘 Si algo no funciona

1. **Revisa `.env.local`** - ¿Está correctamente configurado?
2. **Reinicia servidores** - Ctrl+C y vuelve a correr comandos
3. **Borra `node_modules`** - `rm -rf node_modules && npm install`
4. **Checa consola** - ¿Hay errores?

---

**Tiempo total estimado**: 30 mins

**Siguientes 2 horas**: Migrar más proyectos y personalizar

🎉 **¡Bienvenido al futuro de tu portafolio!**
