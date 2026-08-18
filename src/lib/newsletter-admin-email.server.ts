import { z } from "zod";

/**
 * Notificación al admin cuando alguien se suscribe en /suscribete.
 * Responsabilidad única: avisar al admin (no sincroniza audiencias de Resend).
 * Server-only: se ejecuta únicamente dentro del handler de la server function.
 *
 * Variables de entorno:
 *  - RESEND_API_KEY        (privada, obligatoria)
 *  - RESEND_FROM_EMAIL     (opcional, por defecto send@vozestrategica.com)
 *  - NOTIFY_TO_EMAIL       (opcional, por defecto tatinsu83@gmail.com)
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "Voz Estratégica <send@vozestrategica.com>";
const DEFAULT_TO = "tatinsu83@gmail.com";

export const newsletterAdminEmailSchema = z.object({
  nombre: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  empresa: z.string().trim().max(200).optional(),
  rol: z.string().trim().max(120).optional(),
  telefono: z.string().trim().max(40).optional(),

  intereses: z.array(z.string().trim().max(120)).max(20).optional(),
});

export type NewsletterAdminEmailInput = z.infer<typeof newsletterAdminEmailSchema>;

const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function sendNewsletterAdminNotification(data: NewsletterAdminEmailInput) {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    console.error("[newsletter-admin-email] RESEND_API_KEY no configurada");
    return { ok: false as const, reason: "missing_api_key" as const };
  }

  const to = process.env["NOTIFY_TO_EMAIL"] || DEFAULT_TO;
  const from = process.env["RESEND_FROM_EMAIL"] || DEFAULT_FROM;
  const replyTo = process.env["RESEND_REPLY_TO"];

  const fecha = new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" });
  const rows: Array<[string, string]> = [
    ["Nombre", data.nombre],
    ["Correo", data.email],
    ["Empresa", data.empresa?.trim() || "No especificada"],
    ["Teléfono", data.telefono?.trim() || "No especificado"],

    ["Rol", data.rol?.trim() || "No especificado"],
    [
      "Intereses",
      data.intereses && data.intereses.length > 0
        ? data.intereses.join(", ")
        : "Ninguno seleccionado",
    ],
    ["Fecha y hora", `${fecha} (hora Colombia)`],
  ];

  const html = `<!doctype html>
<html lang="es"><body style="margin:0;background:#f4f1e3;font-family:Helvetica,Arial,sans-serif;color:#141310">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px">
    <h1 style="font-size:20px;line-height:1.3;margin:0 0 18px">
      Nuevo suscriptor desde la página de newsletter
    </h1>
    <table style="width:100%;border-collapse:collapse;font-size:15px">
      ${rows
        .map(
          ([k, v]) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #e3dfcc;color:#6b6858;width:42%">${esc(k)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e3dfcc;font-weight:600">${esc(v)}</td>
      </tr>`,
        )
        .join("")}
    </table>
    <p style="margin:24px 0 0;font-size:12px;color:#6b6858">
      Este correo se generó automáticamente desde el formulario de suscripción en
      vozestrategica.com/suscribete
    </p>
  </div>
</body></html>`;

  const text = `Nuevo suscriptor desde la página de newsletter

${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}

Este correo se generó automáticamente desde el formulario de suscripción en vozestrategica.com/suscribete`;

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Nueva suscripción — Newsletter Voz Estratégica",
      html,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[newsletter-admin-email] Resend falló [${res.status}]: ${body}`);
    return { ok: false as const, reason: `resend_${res.status}` as const };
  }

  const json = (await res.json()) as { id?: string };
  return { ok: true as const, id: json.id ?? null };
}
