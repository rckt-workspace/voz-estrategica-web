# Analytics Events Reference

Todos los eventos de analytics en **Voz Estratégica** están centralizados y respetan **Consent Mode v2**.

## Cuadro de Eventos

| Evento              | Momento                    | Parámetros                                                   | Modo   | Destino                 | Tipo        | Datos Personales                         | Consentimiento                                     |
| ------------------- | -------------------------- | ------------------------------------------------------------ | ------ | ----------------------- | ----------- | ---------------------------------------- | -------------------------------------------------- |
| `virtual_page_view` | Cambio de ruta (SPA)       | `page_location`, `page_path`, `page_title`                   | GTM    | GA4                     | Medición    | No                                       | `analytics_storage`                                |
| `page_view`         | Cargue inicial             | `page_location`, `page_path`, `page_title`                   | Direct | GA4                     | Medición    | No                                       | `analytics_storage`                                |
| `generate_lead`     | Submit form de contacto    | `form_name`, `source`, `placement`, `lead_id`                | Both   | GA4 / Google Ads        | Conversión  | No (email opcional en form, no se envía) | `analytics_storage`                                |
| `contact_whatsapp`  | Clic en botón WhatsApp     | `method: "whatsapp"`, `placement`, `source`                  | Both   | GA4 / Meta              | Interacción | No                                       | `analytics_storage`                                |
| `begin_checkout`    | Clic "Comprar" en checkout | `currency`, `value`, `items[]`, `order_id`                   | Both   | GA4 / Google Ads / Meta | Conversión  | No                                       | `analytics_storage`                                |
| `purchase`          | Pago confirmado ✓          | `transaction_id`, `currency`, `value`, `items[]`, `event_id` | Both   | GA4 / Google Ads / Meta | Conversión  | Opcional (enhanced conversions)          | `analytics_storage` + `ad_user_data` (si enhanced) |

## Detalle de Eventos

### 1. virtual_page_view (GTM mode) / page_view (Direct mode)

**¿Cuándo se dispara?**

- En modo GTM: cada cambio de ruta en la aplicación (SPA)
- En modo Direct: una vez al cargar la página inicial, luego cambios de ruta

**¿Dónde?**

- Archivo: `src/routes/__root.tsx` → `useEffect` que escucha cambios en `location.pathname`
- Función: `trackPageView()` desde `src/lib/analytics.ts`

**Parámetros:**

```javascript
{
  page_location: "https://vozestrategica.com/masterclass-de-clientes-a-fans",
  page_path:     "/masterclass-de-clientes-a-fans",
  page_title:    "Grabación: De clientes a fans"
}
```

**Transformación en GTM:**

- Evento llega como `event: "virtual_page_view"`
- GTM tiene una regla que lo convierte a `event: "page_view"` para GA4
- GA4 lo procesa como una vista de página normal

**Consentimiento:** Requiere `analytics_storage: "granted"`

---

### 2. generate_lead

**¿Cuándo se dispara?**

- Submit de formulario de contacto / solicitud de propuesta
- Ejemplos: `/contratar`, `/mx/diego-camacho`

**¿Dónde se llama?**

```typescript
// src/routes/contratar.tsx (línea 113)
trackGenerateLead({
  form_name: "Solicitar propuesta",
  source: "landing",
  placement: "hero",
});
```

**Parámetros:**

```javascript
{
  form_name: "Solicitar propuesta",      // Nombre del formulario
  source: "landing-page",                 // Página o canal
  placement: "hero" | "cta-section",      // Ubicación del formulario
  lead_id: "uuid-del-lead"                // Opcional: ID único del lead
}
```

**Destinos:**

- GA4 (analytics_storage)
- Google Ads (vía GTM, si está configurado)
- Meta Pixel (si ad_storage permitido)

**Consentimiento:** `analytics_storage: "granted"`

**¿Cómo trackear en Google Ads?**

1. En GTM, crea una etiqueta GA4 Event para `generate_lead`
2. Mapea como **conversion** en Google Ads
3. Define el valor de conversión (si aplica)

---

### 3. contact_whatsapp

**¿Cuándo se dispara?**

- Clic en el botón flotante de WhatsApp
- Clic en CTA de WhatsApp en landing pages

**¿Dónde se llama?**

```typescript
// src/routes/__root.tsx (línea 196-201)
trackWhatsAppContact({
  source: "landing",
  placement: "floating",
});

// Otras ubicaciones: src/routes/mx.diego-camacho.tsx, etc.
```

**Parámetros:**

```javascript
{
  method: "whatsapp",                 // Siempre "whatsapp"
  placement: "floating" | "hero",      // Ubicación del botón
  source: "landing" | "speaker-page"   // Página origen
}
```

**Destinos:**

- GA4 (medición de engagement)
- Meta Pixel (seguimiento de clic)

**Consentimiento:** `analytics_storage: "granted"`

---

### 4. begin_checkout

**¿Cuándo se dispara?**

- Usuario hace clic en "Comprar" / "Ir a pagar"
- **Ejemplo:** Masterclass → click en "Comprar ahora" → Bold checkout abierto

**¿Dónde se llama?**

```typescript
// src/routes/masterclass.checkout.tsx (línea 115)
trackBeginCheckout({
  currency: "USD",
  value: 19,
  items: [
    {
      item_id: "masterclass-clientes-fans",
      item_name: "Grabación: De clientes a fans",
      price: 19,
      quantity: 1,
    },
  ],
  order_id: "MC-timestamp-hex",
});
```

**Parámetros:**

```javascript
{
  currency: "USD" | "COP",
  value: 19.00,              // Monto total (sin impuestos si aplica)
  items: [
    {
      item_id: "product-id",
      item_name: "Product Name",
      price: 19.00,
      quantity: 1
    }
  ],
  order_id: "MC-..."         // Opcional: ID temporal de orden
}
```

**Destinos:**

- GA4 (funnel de conversión)
- Google Ads (remarketing)
- Meta Pixel (cart abandonment)

**Consentimiento:** `analytics_storage: "granted"`, `ad_storage: "granted"` (si remarketing)

---

### 5. purchase

**¿Cuándo se dispara?**

- **SOLO cuando el pago está confirmado por servidor**
- No se dispara desde el cliente en `onSuccess` de Bold; espera confirmación de servidor

**¿Dónde se llama?**

```typescript
// src/routes/masterclass.gracias.tsx (línea 103)
trackPurchase({
  transaction_id: "MC-timestamp-hex",  // OBLIGATORIO
  currency: "USD",
  value: 19,
  items: [...],
  event_id: "purchase_" + uuid()       // Opcional pero recomendado
});
```

**Parámetros:**

```javascript
{
  transaction_id: "MC-12345-abcdef",   // OBLIGATORIO: ID único de orden
  currency: "USD" | "COP",
  value: 19.00,                         // Monto pagado
  items: [
    {
      item_id: "masterclass-clientes-fans",
      item_name: "Grabación: De clientes a fans",
      price: 19.00,
      quantity: 1
    }
  ],
  event_id: "purchase_abc123"           // Opcional: ID único de evento para dedup
}
```

**Parámetros de Items (si aplica):**

```javascript
{
  item_id: "product-sku",
  item_name: "Product Name",
  item_category: "digital" | "physical",
  item_variant: "version",
  price: 19.00,
  quantity: 1
}
```

**Destinos:**

- GA4 (conversion tracking)
- Google Ads (conversion goal)
- Meta Pixel (purchase conversion)
- Resend (email de confirmación)

**Consentimiento:** `analytics_storage: "granted"`, `ad_storage: "granted"` (Google Ads)

**IMPORTANTE:**

- `transaction_id` es **OBLIGATORIO** para Google Ads
- `event_id` ayuda a deduplicar si el evento se dispara múltiples veces
- El evento debe ir al servidor, no al cliente (para verificación de pago segura)

---

## Flujo Técnico: Direct vs GTM

### Modo Direct (VITE_ANALYTICS_MODE=direct)

```
trackEvent()
  ↓
window.gtag("event", eventName, params)
  ↓
GA4 recibe directamente
  ↓
GA4 Analytics / Google Ads / Meta Pixel
```

**Ventaja:** Simple, directo, sin dependencias externas  
**Desventaja:** Cambiar de GA4 a otra plataforma requiere código

### Modo GTM (VITE_ANALYTICS_MODE=gtm)

```
trackEvent()
  ↓
window.dataLayer.push({event, ...params})
  ↓
GTM Container (browser)
  ↓
GTM Rules & Tags
  ↓
GA4 / Google Ads / Meta Pixel / Cualquier otra plataforma
```

**Ventaja:** Cambiar plataformas sin tocar código (configurable en GTM)  
**Desventaja:** Depende de GTM; más latencia en cargas iniciales

---

## Consentimiento y PII

### ¿Se envía PII (Personally Identifiable Information)?

**En eventos de analytics:**

- ❌ NO se envía email en crudo
- ❌ NO se envía teléfono en crudo
- ❌ NO se envía nombre completo

**En Enhanced Conversions (Google Ads):**

- ✅ Teléfono HASHADO (SHA-256)
- ✅ Email HASHADO (SHA-256)
- ❌ Nunca en texto plano

**Función:** `src/lib/consent.ts` → `setEnhancedConversionUserData(phone)`

```typescript
export async function setEnhancedConversionUserData(phone: string) {
  if (typeof window === "undefined") return;
  const hashed = await sha256Hex(normalizePhone(phone));
  if (!hashed) return;
  ensureGtag();
  window.gtag!("set", "user_data", { phone_number: hashed });
}
```

### Categorías de Consentimiento

```javascript
{
  ad_storage: "granted" | "denied",          // Google Ads cookies
  analytics_storage: "granted" | "denied",    // GA4 cookies
  ad_user_data: "granted" | "denied",        // Enhanced conversions (PII hasheado)
  ad_personalization: "granted" | "denied"   // Ads personalizados
}
```

**Estado por defecto:** Todos `denied` (GDPR compliant)

**Cómo actualizar:** Via `setConsent()` cuando el usuario da su decisión en el banner de cookies

---

## Validación de Datos

### Validation en trackPurchase()

```typescript
export function trackPurchase(params) {
  if (!params.transaction_id) {
    console.warn("trackPurchase: transaction_id is required");
  }
  sendEvent("purchase", params);
}
```

### Validación en servidor (Resend emails)

```typescript
const email = input.email.trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
  throw new Error("Email no válido");
}
```

---

## Debugging

### En Chrome DevTools

**Console tab:**

```javascript
// Ver dataLayer
console.log(window.dataLayer);

// Disparar evento manual
window.dataLayer.push({
  event: "generate_lead",
  form_name: "Test",
  source: "debug",
});
```

**Network tab:**

- Busca `gtag` → peticiones a Google
- Busca `gtm` → peticiones a Google Tag Manager
- Busca `facebook.com` → Meta Pixel

### En GTM Preview

1. Abre GTM → Preview
2. Abre tu sitio
3. Panel inferior muestra todos los eventos y variables

### En GA4 Real-time

1. Google Analytics → tu propiedad
2. Real-time Report
3. Verás eventos mientras navigas

---

## Próximos Pasos

1. **Configurar Google Ads Conversion Goals** en Google Ads usando transaction_id
2. **Agregar Enhanced Ecommerce** para items/valores más detallados
3. **Auditar GDPR/CCPA** compliance
4. **Configurar Attribution Modeling** en GA4
5. **Crear Custom Reports** en GA4 para KPIs específicos
