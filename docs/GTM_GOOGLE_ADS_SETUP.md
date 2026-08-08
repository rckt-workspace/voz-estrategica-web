# Google Tag Manager y Google Ads Integration

Este documento describe cómo configurar Google Tag Manager (GTM), Google Analytics 4 (GA4) y Google Ads en **Voz Estratégica**.

## Variables de Entorno

Agregadas a `.env.example`:

```bash
VITE_ANALYTICS_MODE=direct              # Opciones: direct, gtm, disabled
VITE_GTM_ID=                            # ID de GTM (formato: GTM-XXXXXXXX)
VITE_GA4_MEASUREMENT_ID=G-2JN8WLT6LL   # Measurement ID de GA4
VITE_META_PIXEL_ID=4497186893935830    # ID de Meta Pixel
VITE_ANALYTICS_DEBUG=false              # Activa logs de debugging
```

### Valores por Defecto

- **VITE_ANALYTICS_MODE**: `direct` (carga GA4 directamente, sin GTM)
- **VITE_GA4_MEASUREMENT_ID**: `G-2JN8WLT6LL` (ID actual, no necesita cambio)
- **VITE_META_PIXEL_ID**: `4497186893935830` (ID actual, no necesita cambio)

## Paso 1: Crear el Contenedor GTM

1. Accede a [Google Tag Manager](https://tagmanager.google.com)
2. Crea un nuevo contenedor:
   - Nombre: `Voz Estratégica Web`
   - Plataforma de destino: **Web**
   - Aceptar términos
3. GTM te dará un **GTM ID** (formato: `GTM-XXXXXXXX`)
4. Copia ese ID a tu variable `VITE_GTM_ID`

## Paso 2: Desactivar el Page View Automático de GA4

En GTM, **es crucial** desactivar el page view automático porque en modo SPA (Single Page Application):

- GTM dispara automáticamente `page_view` en el carregamento inicial
- Nuestro código envía `virtual_page_view` en cada cambio de ruta para SPA

Si no desactivas el page view automático, GA4 contará **dos** page views por ruta.

**Pasos:**

1. En GTM, ve a **Tags**
2. Crea una nueva etiqueta:
   - Nombre: `GA4 Configuration`
   - Tipo: **Google Analytics: GA4 Configuration**
   - Measurement ID: `G-2JN8WLT6LL` (o tu ID)
   - En "Advanced Settings" → "Disable Page View Tracking": **Activa esta opción**
   - Disparador: **All Pages** (o **Initialization – All Pages**)
3. Guarda y publica

## Paso 3: Transformar virtual_page_view en page_view

Nuestro código SPA envía eventos con `event: "virtual_page_view"`. GTM debe transformarlos en `page_view` para GA4.

**Pasos:**

1. En GTM, ve a **Tags**
2. Crea una nueva etiqueta:
   - Nombre: `GA4 - Virtual Page View to Page View`
   - Tipo: **Google Analytics: GA4 Event**
   - Measurement ID: `G-2JN8WLT6LL`
   - Event Name: `page_view`
   - Parámetros de evento:
     ```
     page_location  = {{Page Location}}
     page_path      = {{Page Path}}
     page_title     = {{Page Title}}
     ```
   - Disparador: **Custom Event** → `event equals virtual_page_view`
3. Guarda y publica

## Paso 4: Configurar Activadores para Eventos

Para cada evento (`generate_lead`, `contact_whatsapp`, `begin_checkout`, `purchase`), crea un activador (Trigger):

**Ejemplo para `generate_lead`:**

1. Ve a **Triggers**
2. Crea un nuevo activador:
   - Nombre: `generate_lead`
   - Tipo: **Custom Event**
   - Event Name: `generate_lead`
3. Guarda

Repite para: `contact_whatsapp`, `begin_checkout`, `purchase`.

## Paso 5: Crear Etiqueta GA4 para Cada Evento

Para cada evento, crea una etiqueta que lo envíe a GA4.

**Ejemplo para `begin_checkout`:**

1. Ve a **Tags**
2. Crea una nueva etiqueta:
   - Nombre: `GA4 - Begin Checkout`
   - Tipo: **Google Analytics: GA4 Event**
   - Measurement ID: `G-2JN8WLT6LL`
   - Event Name: `begin_checkout`
   - Parámetros de evento:
     ```
     currency  = {{event_currency}}
     value     = {{event_value}}
     items     = {{event_items}}
     ```
   - Disparador: **begin_checkout**
3. Guarda y publica

Repite para otros eventos.

## Paso 6: Conversion Linker (Recomendado)

El Conversion Linker ayuda a rastrear conversiones en múltiples dominios.

**Pasos:**

1. Ve a **Tags**
2. Crea una nueva etiqueta:
   - Nombre: `Conversion Linker`
   - Tipo: **Conversion Linker**
   - Disparador: **All Pages**
3. Guarda y publica

## Paso 7: Configurar Google Ads (sin Etiquetas Directas)

**NO agregues etiquetas de Google Ads directamente en GTM** en esta entrega. En su lugar:

1. Conecta GA4 a Google Ads desde Google Analytics
2. Habilita "Enhanced Conversions" en Google Analytics si lo necesitas
3. En GTM, configura el mapeo de eventos a conversiones en Google Analytics después

Cuando necesites activar conversiones de Google Ads:

- El archivo `consent.ts` tiene la función `setEnhancedConversionUserData(phone)` que prepara datos de usuario hasheados
- Estos datos se envían como `user_data` a través de `gtag("set", "user_data", ...)`
- Google Analytics / Google Ads los usará automáticamente si están habilitadas las Enhanced Conversions

## Paso 8: Cambiar de Modo `direct` a `gtm`

Una vez que hayas configurado GTM:

1. En `.env` (Lovable o Hostinger), cambia:

   ```bash
   VITE_ANALYTICS_MODE=gtm
   ```

2. Deploy la aplicación

3. Verifica que GTM esté cargándose (abre Developer Tools → Network, busca `gtm.js`)

4. Comprueba que los eventos aparecen en GA4 (puede tomar 5-10 minutos)

## Paso 9: Testing con GTM Preview

GTM incluye un modo Preview para probar sin publicar.

**Pasos:**

1. En GTM, haz clic en **Preview** (parte superior derecha)
2. Abre tu sitio en una nueva pestaña
3. Verás un panel en la parte inferior que muestra todos los eventos disparados
4. Verifica que:
   - Los eventos aparezcan cuando debería
   - Los parámetros sean correctos
   - No haya errores

## Paso 10: Tag Assistant

Usa la extensión **Tag Assistant** (de Google) para auditar:

1. Instala [Tag Assistant de Google](https://chrome.google.com/webstore)
2. Abre tu sitio
3. Tag Assistant te mostrará si GTM, GA4 y Google Ads están bien configurados

## Paso 11: Regresar a `direct` si hay Problemas

Si necesitas regresar al modo GA4 directo:

1. Cambia `.env`:

   ```bash
   VITE_ANALYTICS_MODE=direct
   ```

2. Deploy

3. Los eventos continuarán siendo trackados sin GTM

## Eventos Soportados

| Evento              | Parámetros                                                   | Notas                                                |
| ------------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| `virtual_page_view` | `page_location`, `page_path`, `page_title`                   | SPA navigation; GTM la convierte a `page_view`       |
| `generate_lead`     | `form_name`, `source`, `placement`, `lead_id`                | Formularios de contacto                              |
| `contact_whatsapp`  | `method`, `placement`, `source`                              | Clic en botón WhatsApp                               |
| `begin_checkout`    | `currency`, `value`, `items[]`                               | Inicio de checkout                                   |
| `purchase`          | `transaction_id`, `currency`, `value`, `items[]`, `event_id` | Compra confirmada; **transaction_id es obligatorio** |

## Validación de Consentimiento

Todos los eventos respetan **Consent Mode v2**:

- Por defecto, todas las categorías están **denegadas** (`denied`)
- Los eventos se envían a dataLayer incluso con consentimiento denegado
- GTM/GA4 respetan la configuración de consentimiento antes de procesar datos

El banner de cookies (`CookieConsent.tsx`) permite al usuario otorgar consentimiento:

- `ad_storage` (para Google Ads)
- `analytics_storage` (para GA4)
- `ad_user_data` (para Enhanced Conversions)
- `ad_personalization` (para personalización)

## Estructu del Proyecto

- `src/lib/gtm.ts` — Funciones para generar scripts de GTM
- `src/lib/ga4.ts` — GA4 direct mode y compatibility
- `src/lib/consent.ts` — Consent Mode v2
- `src/lib/analytics.ts` — Capa única de eventos
- `src/lib/meta-pixel.ts` — Meta Pixel (respeta consentimiento)
- `src/routes/__root.tsx` — Carga de scripts en el head

## Monitoreo

Para verificar que todo está funcionando:

1. **GA4 Real-time Report**: https://analytics.google.com → tu propiedad → Real-time
   - Deberías ver usuarios y eventos mientras navegas

2. **GTM Preview**: Haz clic en **Preview** en GTM
   - Verás un panel con los eventos disparados

3. **Chrome DevTools**:
   - Tab **Network**: busca `gtm.js`, `gtag/js`
   - Console: no debería haber errores de scripts

## Próximos Pasos

1. Activar Google Ads conversions (necesita Conversion IDs)
2. Agregar Enhanced Ecommerce tracking
3. Configurar Attribution Modeling en GA4
4. Auditoría de privacidad (GDPR, CCPA)
