
# SEO sitewide — Voz Estratégica

Objetivo: dejar el sitio listo para Google (Colombia priorizado, México vía landing de Diego). Sin tocar diseño ni contenido visible — solo metadatos, JSON-LD, sitemap y robots.

## 1. Limpiar el root (`src/routes/__root.tsx`)

Hoy el root tiene basura que se filtra a TODAS las páginas:

- **Eliminar 3 líneas con texto placeholder** `"Builds custom websites from provided documents and user specifications."` (description, og:description, twitter:description duplicadas).
- **Quitar `og:image` y `twitter:image` del root** — apuntan a un screenshot del preview de Lovable y, según la doc de TanStack, el `og:image` del root **sobrescribe** el de toda ruta hija. Por eso la landing de Diego no muestra su foto en WhatsApp/LinkedIn.
- **Agregar JSON-LD `Organization`** con nombre, logo, URL, sameAs (redes si las tienes).
- Dejar el `<html lang="es">` como está.

## 2. Metadatos por ruta

Cada ruta tendrá: `title`, `description`, `og:title`, `og:description`, `og:url`, `og:type`, `twitter:*`, `canonical` y `og:image` propios. Hoy la mayoría solo tiene title/description básicos.

| Ruta | Tipo | Acción |
|---|---|---|
| `/` | website | Añadir og:url, canonical, og:image (hero) |
| `/speakers` | website | Añadir og:url, canonical, og:image (grid speakers) |
| `/speakers/$slug` | profile | Añadir Person JSON-LD, canonical dinámico, og:image = foto speaker. Para `diego-camacho` añadir `hreflang` apuntando a `/mexico` |
| `/speakers/diego-camacho/mexico` | ya OK | Sin cambios (ya tiene todo) |
| `/eventos` | website | Añadir canonical, og:url, og:image |
| `/libros` | website | Añadir canonical, og:url, og:image |
| `/contratar` | website | Añadir canonical, og:url, og:image, `robots: noindex` (página de formulario, no aporta SEO) |
| `/masterclass-de-clientes-a-fans` | website | Revisar y completar; añadir Event JSON-LD (ya hay datos: fecha, ciudad) |
| `/masterclass/gracias` | — | `robots: noindex` |
| `/admin/*`, `/auth` | — | `robots: noindex` |

## 3. Sitemap dinámico

Crear `src/routes/sitemap[.]xml.ts` (server route) que liste:

- Rutas estáticas: `/`, `/speakers`, `/eventos`, `/libros`, `/contratar`, `/masterclass-de-clientes-a-fans`
- Una entrada por cada speaker en `src/data/content.ts` → `/speakers/{slug}`
- Entrada extra para `/speakers/diego-camacho/mexico`

Base URL: `https://vozestrategica.com`.

## 4. Robots

Crear `public/robots.txt`:

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /auth
Disallow: /masterclass/gracias

Sitemap: https://vozestrategica.com/sitemap.xml
```

## 5. Imágenes Open Graph

Hoy ninguna ruta (salvo el root con un placeholder roto) tiene imagen propia. Para que los shares en WhatsApp/LinkedIn/Twitter se vean bien:

- `/` → reusar imagen del hero o generar una OG 1200×630 con título + logo.
- `/speakers/$slug` → la `foto` del speaker (ya existe en `content.ts`).
- `/speakers/diego-camacho/mexico` → la foto de Diego.
- `/eventos`, `/libros`, `/contratar`, `/masterclass-...` → 1 imagen genérica de marca por ruta (o reusar hero existente si tiene).

**Decisión a tomar:** ¿generamos imágenes OG nuevas con AI para `/`, `/eventos`, `/libros`, `/contratar`? ¿O reusamos lo que haya (foto de algún speaker / hero existente)? Por defecto **reuso**, sin generar nada nuevo (más rápido, menos riesgo, igual válido para SEO).

## 6. Lo que NO se hace en esta iteración

- Versión `es-MX` del sitio entero (sólo Diego MX tiene landing dedicada — la estrategia acordada).
- Blog / contenido nuevo para SEO orgánico.
- Investigación de keywords con Semrush (lo dejamos para una iteración aparte, mejor con datos en mano una vez publicado y crawleado).
- Lighthouse / Core Web Vitals — la doc del dev server reporta build verde; auditoría de performance va aparte.

## 7. Verificación

Después de implementar:

1. Build local para confirmar que TanStack no rompe por meta dupes o sitemap.
2. Probar `/sitemap.xml` y `/robots.txt` en el preview.
3. Validar 1–2 rutas en https://search.google.com/test/rich-results (Person, Event, Organization).
4. Tras publicar, te dejo el checklist para Google Search Console (verificación por meta tag y envío del sitemap).

---

**¿Avanzo así, reusando imágenes existentes para OG?** Si prefieres que genere imágenes OG nuevas para `/`, `/eventos`, `/libros`, `/contratar`, dime y las creo en el mismo paso.
