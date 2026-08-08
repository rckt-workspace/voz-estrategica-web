# Email Setup (Resend)

Este documento describe cómo configurar y mantener la infraestructura de emails en **Voz Estratégica** usando **Resend**.

## Variables de Entorno

Agregadas a `.env.example`:

```bash
# Obligatorias para Resend
RESEND_API_KEY=                         # API key privada de Resend
RESEND_FROM_EMAIL=                      # Email de remitente (ej: noreply@vozestrategica.com)
RESEND_REPLY_TO=                        # Email de reply-to (ej: contacto@vozestrategica.com)

# Notificaciones internas
NOTIFY_TO_EMAIL=                        # Destino principal de notificaciones
MASTERCLASS_NOTIFY_TO=                  # Copia para notificaciones de masterclass (alternativa)

# Masterclass (opcional)
MASTERCLASS_FROM_EMAIL=                 # Remitente específico para emails de masterclass
MASTERCLASS_ACCESS_URL=                 # URL de acceso a la grabación
```

## Flujo de Emails

### 1. Masterclass (De Clientes a Fans) — Transaccional

**Archivo:** `src/lib/masterclass-email.server.ts`

**Disparador:** Después de pago confirmado en Bold

- El cliente compra la masterclass
- Bold retorna `onSuccess`
- Backend llama `sendMasterclassPurchaseEmail()`
- Se envía email con enlace de acceso

**Emails enviados:**

1. **Al comprador** → Confirmación de compra + enlace de acceso
2. **Al equipo** (NOTIFY_TO_EMAIL o MASTERCLASS_NOTIFY_TO) → Notificación de venta

**Variables necesarias:**

- `RESEND_API_KEY` (obligatoria)
- `RESEND_FROM_EMAIL` o `MASTERCLASS_FROM_EMAIL` (opcional, por defecto `onboarding@resend.dev`)
- `RESEND_REPLY_TO` (opcional)
- `MASTERCLASS_ACCESS_URL` (URL a grabación)
- `MASTERCLASS_NOTIFY_TO` (email interno)

### 2. Newsletter — Edge Function

**Archivo:** `supabase/functions/notify-subscriber/index.ts`

**Disparador:** AFTER INSERT en tabla `public.subscribers`

- Usuario se suscribe desde formulario
- Trigger automático de Supabase llama la Edge Function
- Email de notificación al equipo

**Variables necesarias:**

- `RESEND_API_KEY` (obligatoria)
- `RESEND_FROM_EMAIL` (opcional)
- `NOTIFY_TO_EMAIL` o `MASTERCLASS_NOTIFY_TO` (al menos una obligatoria)
- `NOTIFY_WEBHOOK_TOKEN` (para autenticación)

### 3. Órdenes de Libros — Edge Function

**Archivo:** `supabase/functions/notify-book-order/index.ts`

**Disparador:** AFTER UPDATE en tabla `public.pedidos_libros` (estado = "aprobado")

- Usuario compra un libro
- Payment gateway aprueba
- Trigger automático de Supabase llama la Edge Function
- Email de notificación al equipo

**Variables necesarias:**

- `RESEND_API_KEY` (obligatoria)
- `RESEND_FROM_EMAIL` (opcional)
- `NOTIFY_TO_EMAIL` o `MASTERCLASS_NOTIFY_TO` (al menos una obligatoria)
- `NOTIFY_WEBHOOK_TOKEN` (para autenticación)

## Configuración en Resend

### Paso 1: Crear Cuenta Resend

1. Ve a [Resend.com](https://resend.com)
2. Crea una cuenta con email corporativo
3. Verifica tu email
4. Toma nota de tu **API Key**

### Paso 2: Agregar Dominio Personalizado (Recomendado)

Para producción, no uses `onboarding@resend.dev`. En su lugar, usa tu dominio corporativo.

**Pasos:**

1. En Resend → **Domains**
2. Haz clic en "Add Domain"
3. Ingresa tu dominio (ej: `vozestrategica.com`)
4. Resend te dará registros **DNS** a agregar en tu registrador

**IMPORTANTE:**

- No cambies los **MX records** del dominio principal
- Resend te dará registros **TXT** y **CNAME** para validación
- Solo agrega esos registros, no toques los MX

**Ejemplo de registros:**

```
Type: CNAME, Name: default._domainkey, Value: default.resend-domains.com
Type: CNAME, Name: outbound._domainkey, Value: outbound.resend-domains.com
Type: TXT, Name: _dmarc, Value: v=DMARC1; p=quarantine
```

5. Copia los registros en tu registrador (GoDaddy, NameCheap, etc.)
6. Espera 5-10 minutos a que se propague
7. En Resend, haz clic en "Verify" cuando esté listo

### Paso 3: Configurar Variables de Entorno

#### En Lovable (Desarrollo):

1. Abre Lovable → Project Settings
2. Agrega variables de entorno:
   ```
   RESEND_API_KEY = re_...
   RESEND_FROM_EMAIL = noreply@vozestrategica.com
   RESEND_REPLY_TO = contacto@vozestrategica.com
   NOTIFY_TO_EMAIL = your-email@vozestrategica.com
   MASTERCLASS_ACCESS_URL = https://www.loom.com/share/...
   ```
3. Guarda

#### En Hostinger (Producción):

1. SSH a tu servidor Hostinger
2. Accede al archivo de configuración de Node.js
   ```bash
   ssh user@host
   cd /ruta/del/proyecto
   nano .env.production
   ```
3. Agrega lo mismo que en Lovable
4. Guarda y reinicia Nitro:
   ```bash
   npm run build
   npm start
   ```

#### En Supabase (Edge Functions):

Para que las Edge Functions accedan a las variables:

1. Ve a Supabase Dashboard → tu proyecto
2. Settings → Secrets
3. Agrega:
   ```
   RESEND_API_KEY = re_...
   RESEND_FROM_EMAIL = noreply@vozestrategica.com
   NOTIFY_TO_EMAIL = your-email@vozestrategica.com
   NOTIFY_WEBHOOK_TOKEN = un-token-secreto-largo
   ```

**IMPORTANTE:**

- El `NOTIFY_WEBHOOK_TOKEN` debe ser un string largo y aleatorio
- Úsalo en los triggers de Supabase para autenticar las llamadas

## Validación de Configuración

### Test 1: Masterclass Email

Después de que alguien compre una masterclass:

1. Verifica que el comprador **reciba un email** con:
   - Confirmación de compra
   - Enlace de acceso (si `MASTERCLASS_ACCESS_URL` está configurado)
   - Detalles del producto

2. Verifica que el equipo **reciba una copia** en `NOTIFY_TO_EMAIL`

**Si no llega:**

- Revisa `RESEND_API_KEY` (válido y no expirado)
- Revisa `RESEND_FROM_EMAIL` (dominio verificado)
- Revisa logs en Hostinger (ver abajo)

### Test 2: Newsletter Signup

1. Abre el sitio
2. Suscríbete al newsletter desde cualquier página
3. Verifica que el equipo **reciba un email** en `NOTIFY_TO_EMAIL`

**Si no llega:**

- Revisa que el trigger de Supabase esté activo
- Verifica `NOTIFY_WEBHOOK_TOKEN` en el trigger vs. Supabase Secrets

### Test 3: Book Order

1. Compra un libro
2. Aprueba el pago en Bold
3. Verifica que el equipo **reciba un email** en `NOTIFY_TO_EMAIL`

## Revisión de Logs

### Resend

1. Ve a [Resend Dashboard](https://resend.com/emails)
2. Verás un historial de todos los emails enviados
3. Haz clic en un email para ver:
   - Estado (sent, delivered, bounced, etc.)
   - Message ID
   - Destinatario
   - Información de debugging

### Hostinger

1. SSH al servidor:
   ```bash
   ssh user@host
   tail -f /var/log/nodejs/app.log
   ```
2. Busca líneas que mencionen "Resend" o "email"

### Supabase

1. Abre Supabase → Edge Functions → tu función
2. Haz clic en "Logs"
3. Verás registros de ejecuciones recientes
4. Busca errores o líneas que digan "Email sent, id: ..."

## Tareas Pendientes

### 1. Webhook de Bold (NO IMPLEMENTADO AÚN)

**Estado actual:**

- Los emails de masterclass se envían desde el cliente después de `onSuccess` en Bold
- Esto NO es ideal porque depende de que el usuario complete el flujo en el navegador

**Qué falta:**

- Configurar un webhook en Bold que notifique al servidor cuando un pago es aprobado
- El servidor (Node.js en Hostinger) recibe el webhook
- El servidor verifica la firma del webhook (para seguridad)
- El servidor llama `sendMasterclassPurchaseEmail()` de forma idempotente
- Agregar una columna `email_sent_at` a la tabla de órdenes para evitar envíos duplicados

**Por qué es importante:**

- Garantiza que el email se envíe incluso si el usuario cierra el navegador
- Permite reintentos automáticos si Resend falla
- Es más seguro (no depende de JavaScript en el cliente)

**Cómo implementarlo después:**

1. Bold proporciona un URL para webhooks (solicitar a Bold)
2. Crear un endpoint en `src/routes/api/bold-webhook.ts` (TanStack Start)
3. Validar firma del webhook
4. Llamar `sendMasterclassPurchaseEmail()` con el order_id
5. Guardar estado de delivery en BD

### 2. Tabla de Delivery Logs (OPCIONAL)

Para auditería, puedes agregar una tabla:

```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT,
  email_to TEXT,
  email_type TEXT, -- 'masterclass', 'book_order', 'newsletter'
  status TEXT, -- 'pending', 'sent', 'failed', 'bounced'
  resend_id TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

Luego, registra cada intento en esta tabla para auditería.

## Estructura de Directorios

```
src/
  lib/
    masterclass-email.server.ts     # Emails de masterclass

supabase/
  functions/
    notify-subscriber/              # Edge Function para newsletter
    notify-book-order/              # Edge Function para órdenes de libros

docs/
  EMAIL_SETUP.md                    # Este archivo
  ANALYTICS_EVENTS.md               # Eventos de analytics
  GTM_GOOGLE_ADS_SETUP.md           # Configuración de GTM
```

## Security Best Practices

1. **Nunca commits `.env` real** — úsalo solo localmente
2. **RESEND_API_KEY no debe exponerse al cliente** — úsalo solo en server functions
3. **NOTIFY_WEBHOOK_TOKEN debe ser secreto** — configúralo en Supabase Secrets, no en .env públicos
4. **Valida emails** antes de enviar (ya lo hacemos con regex)
5. **No almacenes PII en logs** — registra solo message IDs, no emails en crudo
6. **Sanitiza HTML** en emails — úsamos `esc()` para esto

## Troubleshooting

| Problema                        | Causa                             | Solución                                       |
| ------------------------------- | --------------------------------- | ---------------------------------------------- |
| "RESEND_API_KEY no configurada" | Variable de env falta             | Agrega a Lovable o Hostinger                   |
| Email no llega                  | Dominio no verificado             | Verifica dominio en Resend, agrega records DNS |
| Email marcado como spam         | Falta DMARC/SPF                   | Agrega registros SPF y DMARC en tu registrador |
| Webhook no dispara              | Trigger no existe en Supabase     | Crea trigger AFTER INSERT/UPDATE en tabla      |
| Error 401 en Edge Function      | Token webhook inválido            | Verifica NOTIFY_WEBHOOK_TOKEN                  |
| Error 500 en Edge Function      | RESEND_API_KEY no está en Secrets | Agrega a Supabase Secrets                      |

## Referencias

- [Resend Docs](https://resend.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Database Webhooks](https://supabase.com/docs/guides/realtime/postgres-changes)
