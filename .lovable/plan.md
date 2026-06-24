# Landing SEM · Diego Camacho · Ciudad de México

Construir una landing específica para la campaña SEM de contratación de Diego Camacho como speaker en México (foco CDMX), aprovechando la autoridad del dominio `vozestrategica.com` sin necesidad de un sitio separado.

## Objetivo

Maximizar conversión de leads "contratar speaker" desde Google/Meta Ads en CDMX, con copy y señales localizadas (México, MXN, español MX) que mejoren el Quality Score del anuncio y la tasa de conversión.

## Ruta y arquitectura

Nueva ruta: `/speakers/diego-camacho/mexico`

- URL específica para el anuncio (match exacto con keyword "diego camacho speaker mexico", "contratar conferencista IA cdmx", etc.).
- No reemplaza `/speakers/diego-camacho` (perfil neutro LatAm que ya funciona para SEO orgánico).
- Heredamos autoridad del dominio principal en lugar de empezar desde cero en un `.mx`.

## Estructura de la landing

```text
1. Hero
   - H1: "Contrata a Diego Camacho como speaker en Ciudad de México"
   - Subtítulo: experto Google Ads Hispanoamérica · IA, ventas, marketing digital
   - Foto Diego + badges (Google, Endeavor, Angel Investor)
   - CTA primario: "Solicitar cotización" (form/WhatsApp)
   - Señal local visible: "Disponible para eventos presenciales en CDMX y todo México"

2. Prueba social rápida
   - Logos de empresas/eventos donde ha hablado (México, Panamá, Chile, etc.)
   - "Sus conferencias han pasado por México, Panamá, Chile, Argentina, Colombia y más"

3. Conferencias / temas estrella (3 cards)
   - IA: la nueva revolución en las ventas
   - Marketing digital con IA para oportunidades de negocio
   - Liderazgo inspirador

4. Por qué Diego para tu evento
   - Bullets: lidera Google Ads Hispanoamérica, mentor Endeavor, experiencia LatAm + Asia
   - Frase ancla: "La IA no reemplaza a tu equipo comercial: lo libera para vender mejor."

5. Formatos disponibles
   - Conferencia magistral (45-60 min)
   - Keynote para convenciones corporativas
   - Workshop ejecutivo
   - Panel / moderación

6. Formulario de contacto (conversión principal)
   - Nombre, empresa, email, WhatsApp, fecha tentativa, ciudad, tipo de evento, asistentes
   - Submit → guarda en Lovable Cloud + notificación (mismo patrón que checkout existente)
   - CTA alterno: WhatsApp directo con mensaje pre-llenado

7. FAQ corta (3-4 preguntas)
   - Cobertura, idioma, fees, anticipación
   - Habilita JSON-LD FAQPage

8. Footer minimalista (sin distracciones a otras ofertas)
```

## Señales de localización México

- `<html lang="es-MX">` en esta ruta (vía `head()` meta).
- Copy con vocabulario MX (no "vos", sí "ustedes"; "platicar" donde aplique; referencias a ciudades MX).
- Menciones explícitas: "Ciudad de México", "CDMX", "México", "empresas mexicanas".
- Moneda MXN si se muestra rango de fees (o "consulta tarifa" sin precio).
- Horario CDMX (UTC-6) en cualquier referencia temporal.

## Head metadata (SEO + Social)

```text
title:       "Contratar a Diego Camacho · Speaker IA y Ventas en CDMX | Voz Estratégica"
description: "Conferencista internacional experto en IA, ventas y marketing digital.
              Líder Google Ads Hispanoamérica. Disponible para eventos en Ciudad
              de México y todo México. Solicita cotización."
og:title, og:description, og:url self-referencial
og:type:     "profile"
canonical:   https://vozestrategica.com/speakers/diego-camacho/mexico
hreflang:    es-MX (self), es-CO → /speakers/diego-camacho (opcional)
```

## JSON-LD (structured data)

Stack en `scripts`:

- `Person` (Diego Camacho, jobTitle, knowsAbout, sameAs)
- `Service` (offerCatalog: conferencias, workshops; areaServed: México)
- `FAQPage` (con las 3-4 Q&A del bloque FAQ)
- `BreadcrumbList` (Home → Speakers → Diego Camacho → México)

## Performance (crítico para Quality Score SEM)

- Imagen hero optimizada (foto Diego ya existe como `.jpg`, servir con `loading="eager"` solo el hero, `lazy` el resto).
- Sin scripts terceros innecesarios en esta ruta.
- LCP objetivo <2.5s, CLS <0.1.
- Inline críticos vía TanStack Start SSR (ya soportado).

## Tracking de conversión

Reutilizar lo ya configurado:

- **Meta Pixel** (`src/lib/meta-pixel.ts`): evento `Lead` al submit del formulario.
- **GA4** (`src/lib/ga4.ts`): evento `generate_lead` con `value` y `currency: "MXN"`.
- Atributo `data-source="sem-mx-diego"` en el form para segmentar en analytics.

## Backend (formulario)

- Tabla nueva `speaker_leads` en Lovable Cloud (campos del form + `source`, `created_at`).
- Server function `submitSpeakerLead` con validación Zod (createServerFn + handler).
- RLS: solo `service_role` lee/escribe; insert público vía server fn (no anon directo).
- GRANT correspondientes + RLS policy.

## Sitemap

Añadir `/speakers/diego-camacho/mexico` al sitemap (si el sitemap existe; si no, no se crea uno nuevo en esta iteración — quedará para la fase de SEO sitewide).

## Lo que NO entra en esta iteración

- Meta tags únicos en el resto de rutas existentes.
- Sitemap.xml dinámico.
- JSON-LD sitewide (Organization en `__root.tsx`).
- Hreflang en `/masterclass-de-clientes-a-fans` (Colombia).
- Investigación Semrush de keywords MX.

Todo eso queda para una segunda iteración "SEO sitewide" cuando confirmes que la landing de Diego está convirtiendo y quieres escalar el orgánico.

## Detalles técnicos

- Ruta: `src/routes/speakers.diego-camacho.mexico.tsx` (file-based TanStack Router).
- Reutiliza componentes existentes: `Header`, `Footer`, `Reveal`, `Logo`, shadcn `Button`/`Card`/`Input`/`Textarea`.
- Datos de Diego: ya en `src/data/content.ts` (importar `speakers.find(s => s.slug === "diego-camacho")`).
- Form submit: `createServerFn({ method: "POST" })` en `src/lib/leads.functions.ts` + helper en `src/lib/leads.server.ts`.
- Migración SQL: `CREATE TABLE public.speaker_leads` + `GRANT` a `service_role` + RLS + policy `INSERT` para `service_role` only (server fn lo usa).
- Notificación: opción simple = log en tabla; opción siguiente = email via Resend (requiere connector — no en esta iteración salvo que lo pidas).

## Próximos pasos sugeridos (después de aprobar)

1. Construir landing + form + tabla.
2. Tú lanzas la campaña SEM apuntando a `/speakers/diego-camacho/mexico`.
3. Medimos conversión 1-2 semanas.
4. Iteramos copy/oferta según data.
5. Después: SEO sitewide.
