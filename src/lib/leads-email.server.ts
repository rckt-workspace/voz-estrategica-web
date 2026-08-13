import { z } from "zod";

/**
 * Envío del correo de notificación de leads de /mx/diego-camacho.
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

export const leadEmailSchema = z.object({
  nombre: z.string().trim().min(1).max(200),
  empresa: z.string().trim().min(1).max(200),
  cargo: z.string().trim().min(1).max(200),
  tipo_evento: z.string().trim().min(1).max(120),
  presupuesto: z.string().trim().min(1).max(120),
  asistentes: z.string().trim().min(1).max(120),
  ciudad_fecha: z.string().trim().min(1).max(300),
  whatsapp: z.string().trim().min(1).max(60),
  gclid: z.string().trim().max(300).optional(),
  utm_source: z.string().trim().max(200).optional(),
  utm_campaign: z.string().trim().max(200).optional(),
});

export type LeadEmailInput = z.infer<typeof leadEmailSchema>;

const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function sendLeadNotification(data: LeadEmailInput) {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    console.error("[leads-email] RESEND_API_KEY no configurada");
    return { ok: false as const, reason: "missing_api_key" as const };
  }

  const to = process.env["LEADS_NOTIFY_TO"] || DEFAULT_TO;
  const from = process.env["RESEND_FROM_EMAIL"] || DEFAULT_FROM;
  const replyTo = process.env["RESEND_REPLY_TO"];

  const rows: Array<[string, string]> = [
    ["Nombre y apellido", data.nombre],
    ["Empresa", data.empresa],
    ["Cargo / área", data.cargo],
    ["Tipo de evento", data.tipo_evento],
    ["Rango de presupuesto", data.presupuesto],
    ["Asistentes (aprox.)", data.asistentes],
    ["Ciudad y fecha tentativa", data.ciudad_fecha],
    ["WhatsApp", data.whatsapp],
    ["Origen", "Landing /mx/diego-camacho"],
  ];
  if (data.utm_source) rows.push(["utm_source", data.utm_source]);
  if (data.utm_campaign) rows.push(["utm_campaign", data.utm_campaign]);
  if (data.gclid) rows.push(["gclid", data.gclid]);

  const subject = `Nuevo lead: landing Diego Camacho — ${data.nombre} de ${data.empresa}`;

  const html = `<!doctype html>
<html lang="es"><body style="margin:0;background:#f4f1e3;font-family:Helvetica,Arial,sans-serif;color:#141310">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px">
    <p style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#6b6858;margin:0 0 14px">
      Voz Estratégica · Nuevo lead
    </p>
    <h1 style="font-size:22px;line-height:1.3;margin:0 0 18px">
      ${esc(data.nombre)} — ${esc(data.empresa)}
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
    <p style="margin:24px 0 0">
      <a href="https://wa.me/${esc(data.whatsapp.replace(/[^\d]/g, ""))}"
         style="background:#EAC945;color:#141310;text-decoration:none;font-weight:700;
                padding:12px 22px;border-radius:6px;display:inline-block">Escribir por WhatsApp</a>
    </p>
  </div>
</body></html>`;

  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[leads-email] Resend falló [${res.status}]: ${body}`);
    return { ok: false as const, reason: `resend_${res.status}` as const };
  }

  const json = (await res.json()) as { id?: string };
  return { ok: true as const, id: json.id ?? null };
}
