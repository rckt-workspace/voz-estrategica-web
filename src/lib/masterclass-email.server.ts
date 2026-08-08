/**
 * Correos transaccionales de la Masterclass "De clientes a fans" (grabación).
 *
 * Solo servidor: usa RESEND_API_KEY y nunca debe importarse desde el cliente.
 * Todavía no hay disparador automático: cuando conectemos Bold, el webhook de
 * pago confirmado debe llamar a `sendMasterclassPurchaseEmail()`.
 *
 * Variables de entorno (configurar en Lovable y en Hostinger):
 *  - RESEND_API_KEY            (privada, obligatoria)
 *  - RESEND_FROM_EMAIL         (opcional, por defecto onboarding@resend.dev)
 *  - RESEND_REPLY_TO           (opcional)
 *  - MASTERCLASS_ACCESS_URL    (opcional, enlace a la grabación)
 *  - MASTERCLASS_NOTIFY_TO     (opcional, copia interna)
 *  - NOTIFY_TO_EMAIL           (opcional, copia interna; deprecated: usar MASTERCLASS_NOTIFY_TO)
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "Voz Estratégica <onboarding@resend.dev>";

export const MASTERCLASS_PRODUCT_NAME = "Grabación Masterclass: De clientes a fans";
export const MASTERCLASS_PRICE_USD = 19;

export type MasterclassPurchaseEmailInput = {
  nombre?: string;
  email: string;
  orderId?: string;
  /** Monto pagado en USD; por defecto el precio de lista. */
  amountUsd?: number;
  /** Enlace de acceso; si se omite se usa MASTERCLASS_ACCESS_URL. */
  accessUrl?: string;
};

const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function renderMasterclassPurchaseEmail(input: MasterclassPurchaseEmailInput) {
  const nombre = input.nombre?.trim() || "";
  const saludo = nombre ? `Hola ${esc(nombre)},` : "Hola,";
  const accessUrl = input.accessUrl ?? process.env["MASTERCLASS_ACCESS_URL"] ?? "";
  const amount = input.amountUsd ?? MASTERCLASS_PRICE_USD;

  const subject = "Tu acceso a la Masterclass: De clientes a fans";

  const cta = accessUrl
    ? `<p style="margin:28px 0"><a href="${esc(accessUrl)}"
         style="background:#EAC945;color:#141310;text-decoration:none;font-weight:700;
                padding:14px 26px;border-radius:6px;display:inline-block">
         Ver la grabación ahora</a></p>`
    : `<p style="margin:28px 0;padding:14px 16px;background:#f5f2e6;border-radius:6px">
         En breve te enviamos el enlace de acceso a la grabación desde este mismo correo.
       </p>`;

  const html = `<!doctype html>
<html lang="es"><body style="margin:0;background:#f4f1e3;font-family:Helvetica,Arial,sans-serif;color:#141310">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px">
    <p style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#6b6858;margin:0 0 18px">
      Voz Estratégica
    </p>
    <h1 style="font-size:24px;line-height:1.25;margin:0 0 18px">¡Compra confirmada!</h1>
    <p style="font-size:16px;line-height:1.6;margin:0 0 12px">${saludo}</p>
    <p style="font-size:16px;line-height:1.6;margin:0 0 12px">
      Ya tienes acceso permanente a <strong>${esc(MASTERCLASS_PRODUCT_NAME)}</strong>,
      con Carlos Laguna, junto con todos los recursos incluidos.
    </p>
    ${cta}
    <table style="width:100%;border-collapse:collapse;font-size:14px;color:#3b3a33">
      <tr><td style="padding:6px 0">Producto</td><td style="padding:6px 0;text-align:right">${esc(MASTERCLASS_PRODUCT_NAME)}</td></tr>
      <tr><td style="padding:6px 0">Valor pagado</td><td style="padding:6px 0;text-align:right">USD ${amount}</td></tr>
      ${input.orderId ? `<tr><td style="padding:6px 0">Referencia</td><td style="padding:6px 0;text-align:right">${esc(input.orderId)}</td></tr>` : ""}
    </table>
    <p style="font-size:14px;line-height:1.6;color:#6b6858;margin:24px 0 0">
      Si tienes cualquier duda, responde a este correo y te ayudamos.
    </p>
  </div>
</body></html>`;

  const text = [
    "¡Compra confirmada!",
    "",
    saludo.replace(/&amp;/g, "&"),
    `Ya tienes acceso permanente a ${MASTERCLASS_PRODUCT_NAME}, con Carlos Laguna.`,
    accessUrl ? `Acceso: ${accessUrl}` : "En breve te enviamos el enlace de acceso.",
    `Valor pagado: USD ${amount}`,
    input.orderId ? `Referencia: ${input.orderId}` : "",
    "",
    "Voz Estratégica",
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

async function resendSend(payload: Record<string, unknown>) {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) throw new Error("RESEND_API_KEY no está configurada");

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.text();
  if (!res.ok) {
    console.error(`Resend error [${res.status}]: ${body}`);
    throw new Error(`Resend error [${res.status}]: ${body}`);
  }
  return body ? (JSON.parse(body) as { id?: string }) : {};
}

/** Envía la confirmación de compra + datos de acceso al comprador. */
export async function sendMasterclassPurchaseEmail(input: MasterclassPurchaseEmailInput) {
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new Error("Email no válido");

  const { subject, html, text } = renderMasterclassPurchaseEmail({ ...input, email });
  const payload: Record<string, unknown> = {
    from: process.env["RESEND_FROM_EMAIL"] ?? process.env["MASTERCLASS_FROM_EMAIL"] ?? DEFAULT_FROM,
    to: [email],
    subject,
    html,
    text,
  };

  if (process.env["RESEND_REPLY_TO"]) {
    payload.reply_to = process.env["RESEND_REPLY_TO"];
  }

  return resendSend(payload);
}

/** Aviso interno de venta (opcional, para el equipo). */
export async function notifyMasterclassSaleInternal(input: MasterclassPurchaseEmailInput) {
  const to = process.env["MASTERCLASS_NOTIFY_TO"] || process.env["NOTIFY_TO_EMAIL"] || "";

  if (!to) {
    console.log("MASTERCLASS_NOTIFY_TO no configurado, omitiendo notificación interna");
    return;
  }

  const payload: Record<string, unknown> = {
    from: process.env["RESEND_FROM_EMAIL"] ?? process.env["MASTERCLASS_FROM_EMAIL"] ?? DEFAULT_FROM,
    to: [to],
    subject: `Nueva venta masterclass: ${input.email}`,
    html: `<h2>Nueva venta de la grabación</h2>
<p><strong>Email:</strong> ${esc(input.email)}</p>
<p><strong>Nombre:</strong> ${esc(input.nombre ?? "—")}</p>
<p><strong>Referencia:</strong> ${esc(input.orderId ?? "—")}</p>
<p><strong>Valor:</strong> USD ${input.amountUsd ?? MASTERCLASS_PRICE_USD}</p>`,
  };

  if (process.env["RESEND_REPLY_TO"]) {
    payload.reply_to = process.env["RESEND_REPLY_TO"];
  }

  return resendSend(payload);
}
