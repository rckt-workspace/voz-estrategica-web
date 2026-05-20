# Plan: Sitio Voz Estratégica

Sitio editorial cinematográfico para agencia de speakers, siguiendo al pie de la letra el brief adjunto y el manual de marca (amarillo `#EAC945`, negro tinta, crema, tipografías Mada + Inter, motivo "burbujas de chat").

## Fase 1 — Sistema de diseño y fundaciones
- Activar **Lovable Cloud** (auth + DB + storage).
- Tokens en `src/styles.css` (formato oklch equivalente a los HSL del brief): `--background` crema, `--foreground` negro tinta, `--brand` amarillo, `--secondary`, `--muted`, `--border`, `--radius: 1rem`. Modo oscuro con bg/fg invertidos manteniendo el amarillo como accent.
- Tipografías: `@fontsource/mada` (900) para display, `@fontsource/inter` (300–500) body.
- Componentes utilitarios `.bubble`, `.bubble-black`, `.bubble-yellow`, `.bubble-outline`.
- Keyframes `fade-in`, `fade-up`, `marquee` + animaciones correspondientes.
- Componentes base: `Reveal` (IntersectionObserver), `PageHero` (halo amarillo + badge + h1 + descripción), `Header` (con logo SVG), `Footer`.
- Logo SVG inline en `src/assets/logo-voz-estrategica.svg` (dos burbujas: negra "VOZ", amarilla "Estratégica").

## Fase 2 — Backend (Lovable Cloud)
Tablas:
- `speakers` (slug, nombre, especialidad, foto_url, bio, tematicas[], destacado, orden)
- `events` (titulo, fecha, ciudad, descripcion, speaker_id, imagen_url)
- `books` (titulo, autor_speaker_id, portada_url, descripcion, anio, link_compra)
- `booking_requests` (organizacion, contacto, email, telefono, fecha_evento, speaker_id, tipo_evento, presupuesto, mensaje, estado)
- `user_roles` con enum `app_role` y función `has_role()` SECURITY DEFINER.

RLS:
- speakers / events / books: SELECT público, mutaciones solo admin.
- booking_requests: INSERT público, SELECT/UPDATE solo admin.
- user_roles: SELECT propio, modificación solo admin.

Storage: bucket `media` (lectura pública; upload admin) con carpetas `speakers/`, `books/`, `events/`.

Auth: email + password (sin auto-confirm en prod). Después del primer signup, inserto rol admin manualmente.

## Fase 3 — Home (6 secciones del brief)
Rutas TanStack (`src/routes/index.tsx`):
1. **Hero** — badge "Agencia de Speakers · 2026" con dot pulsante, h1 "LAS VOCES QUE **CAMBIAN** LA CONVERSACIÓN" (subrayado amarillo en CAMBIAN), 2 CTAs, halos blur.
2. **Marquee rotado** `-rotate-1` con nombres de speakers.
3. **Speakers destacados** — badge `01 · Talento`, grid 3 col tarjetas portrait con Reveal escalonado.
4. **Próximos eventos** (dark) — badge `02 · Agenda`, lista divida con fecha mono amarilla + título + ciudad + flecha hover.
5. **Libros + Voz Editorial** — badge `03 · Publicaciones`, grid 2x2 portadas + bloque amarillo `rounded-[60px]`.
6. **CTA final amarillo** — bloque gigante con titular y botón negro.

## Fase 4 — Páginas adicionales
Rutas separadas (cada una con su `head()` SEO único):
- `/speakers` — catálogo + chips filtro por temática.
- `/speakers/$slug` — perfil con bio, charlas, libros, eventos + JSON-LD `Person`.
- `/eventos` — listado editorial + JSON-LD `Event`.
- `/libros` — catálogo con portadas + JSON-LD `Book`.
- `/contratar` — formulario validado con Zod (react-hook-form), insert en `booking_requests`, toast de confirmación.

Todas reutilizan `PageHero` + `Reveal`.

## Fase 5 — Auth + Admin
- `/auth` — login email + password.
- `/_authenticated/admin` protegido por `has_role('admin')`:
  - CRUD speakers (upload foto a Storage).
  - CRUD eventos (date picker, select speaker).
  - CRUD libros (upload portada, select autor).
  - Bandeja `booking_requests` con estados (nuevo / contactado / cerrado).

## Fase 6 — Seed + pulido
- Sembrar 5 speakers, 4 eventos, 4 libros de muestra (vía migración/insert).
- Generar imágenes placeholder de speakers (retratos editoriales) y portadas de libros con imagegen.
- QA: revisar tipografía, halos, hover, responsive, SEO por página.

---

## Detalles técnicos
- **Stack**: TanStack Start (ya configurado), Tailwind v4 via `src/styles.css`, shadcn.
- **Routing**: rutas separadas en `src/routes/` (NO hash anchors).
- **Server functions** con `createServerFn` + `requireSupabaseAuth` para operaciones admin.
- **Inserts públicos** (booking) van vía cliente Supabase autenticado anónimo respetando RLS.
- **Dependencias nuevas**: `@fontsource/mada`, `@fontsource/inter`, `react-hook-form`, `zod`, `@hookform/resolvers`, `date-fns` (ya hay lucide-react y sonner).
- **No usar** `react-router-dom` — el brief lo menciona pero el stack es TanStack Router; mapeo 1:1.

## Notas
- Brief muy extenso → lo construyo en una sola pasada pero por capas (diseño → backend → home → resto de páginas → admin → seed). Si preferís dividir en entregas separadas (p. ej. primero diseño + home, después admin), decímelo antes de implementar.
- El manual de marca confirma colores y motivo "burbujas"; usaré exactamente `#EAC945` y `#0F0F0F`.