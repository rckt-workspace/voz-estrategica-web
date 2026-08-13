import { z } from "zod";

/**
 * Envío del correo de notificación de solicitudes de propuesta (/contratar).
 * Server-only: se ejecuta únicamente dentro del handler de la server function.
 *
 * Variables de entorno:
 *  - RESEND_API_KEY      (privada, obligatoria)
 *  - RESEND_FROM_EMAIL   (opcional, por defecto onboarding@resend.dev)
 *  - LEADS_NOTIFY_TO     (opcional, por defecto tatinsu83@gmail.com)
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "Voz Estratégica <onboarding@resend.dev>";
const DEFAULT_TO = "tatinsu83@gmail.com";

export const bookingEmailSchema = z.object({
  organizacion: z.string().trim().min(1).max(200),
  contacto: z.string().trim().min(1).max(200),
  cargo: z.string().trim().max(200).optional(),
  email: z.string().trim().email().max(320),
  telefono: z.string().trim().max(60).optional(),
  interes: z.string().trim().min(1).max(120),
  territorio: z.string().trim().min(1).max(120),
  audiencia: z.string().trim().max(200).optional(),
  fecha_evento: z.string().trim().max(60).optional(),
  presupuesto: z.string().trim().max(120).optional(),
  origen: z.string().trim().max(200).optional(),
  mensaje: z.string().trim().max(5000),
});

export type BookingEmailInput = z.infer<typeof bookingEmailSchema>;

const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function sendBookingNotification(data: BookingEmailInput) {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    console.error("[booking-email] RESEND_API_KEY no configurada");
    return { ok: false as const, reason: "missing_api_key" as const };
  }

  const to = process.env["LEADS_NOTIFY_TO"] || DEFAULT_TO;
  const from = process.env["RESEND_FROM_EMAIL"] || DEFAULT_FROM;
  const replyTo = process.env["RESEND_REPLY_TO"] || data.email;

  const rows: Array<[string, string]> = [
    ["Organización", data.organizacion],
    ["Contacto", data.contacto],
    ["Cargo", data.cargo || "—"],
    ["Email", data.email],
    ["Teléfono", data.telefono || "—"],
    ["¿Qué le interesa?", data.interes],
    ["Territorio", data.territorio],
    ["Audiencia", data.audiencia || "—"],
    ["Fecha tentativa", data.fecha_evento || "—"],
    ["Presupuesto", data.presupuesto || "—"],
    ["¿Dónde nos conoció?", data.origen || "—"],
    ["Origen", "Formulario /contratar"],
  ];

  const subject = `Nueva solicitud de propuesta — ${data.contacto} de ${data.organizacion}`;

  const html = `<!doctype html>
<html lang="es"><body style="margin:0;background:#f4f1e3;font-family:Helvetica,Arial,sans-serif;color:#141310">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px">
    <p style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#6b6858;margin:0 0 14px">
      Voz Estratégica · Nueva solicitud
    </p>
    <h1 style="font-size:22px;line-height:1.3;margin:0 0 18px">${esc(data.contacto)} — ${esc(
      data.organizacion,
    )}</h1>
    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e2ddc7">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:10px 14px;border-bottom:1px solid #efeada;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#6b6858;width:42%">${esc(
              k,
            )}</td><td style="padding:10px 14px;border-bottom:1px solid #efeada;font-size:14px">${esc(
              v,
            )}</td></tr>`,
        )
        .join("")}
    </table>
    <p style="font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:#6b6858;margin:22px 0 6px">Mensaje</p>
    <div style="background:#fff;border:1px solid #e2ddc7;padding:14px;font-size:14px;white-space:pre-wrap">${esc(
      data.mensaje,
    )}</div>
  </div>
</body></html>`;

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!res.ok) {
    console.error("[booking-email] Resend error", res.status, body);
    return { ok: false as const, reason: "resend_error" as const, status: res.status };
  }
  return { ok: true as const, id: body.id };
}
