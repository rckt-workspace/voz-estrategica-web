// Envía un email cuando alguien se suscribe al newsletter.
// Disparado por trigger AFTER INSERT en public.subscribers vía pg_net.
// Variables de entorno:
//  - RESEND_API_KEY (obligatoria)
//  - RESEND_FROM_EMAIL (opcional, por defecto "Voz Estratégica <onboarding@resend.dev>")
//  - NOTIFY_TO_EMAIL o MASTERCLASS_NOTIFY_TO (obligatoria al menos una)
//  - NOTIFY_WEBHOOK_TOKEN (obligatoria para autenticación)

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  // Validar token de webhook
  const secret = Deno.env.get("NOTIFY_WEBHOOK_TOKEN");
  if (!secret || req.headers.get("x-webhook-token") !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Validar RESEND_API_KEY
  const RESEND = Deno.env.get("RESEND_API_KEY");
  if (!RESEND) return new Response("Missing RESEND_API_KEY", { status: 500 });

  // Validar RESEND_FROM_EMAIL
  const FROM = Deno.env.get("RESEND_FROM_EMAIL") || "Voz Estratégica <send@vozestrategica.com>";

  // Obtener destino de notificación
  const NOTIFY_TO = Deno.env.get("NOTIFY_TO_EMAIL") || Deno.env.get("MASTERCLASS_NOTIFY_TO") || "";
  if (!NOTIFY_TO) {
    console.error("Missing NOTIFY_TO_EMAIL or MASTERCLASS_NOTIFY_TO environment variable");
    return new Response("Missing notification email configuration", { status: 500 });
  }

  // Parsear payload
  let payload: { email?: string; source?: string; created_at?: string };
  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // Validar email
  const email = String(payload.email ?? "").trim();
  if (!email) return new Response("Missing email", { status: 400 });

  const source = payload.source ?? "—";
  const when = payload.created_at ?? new Date().toISOString();
  const fechaLegible = new Date(when).toLocaleString("es-CO", { timeZone: "America/Bogota" });

  const html = `<h2>Nuevo suscriptor al newsletter</h2>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Origen:</strong> ${source}</p>
<p><strong>Fecha:</strong> ${fechaLegible} (hora Colombia)</p>`;

  // Enviar email
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [NOTIFY_TO],
      subject: `Nuevo suscriptor: ${email}`,
      html,
    }),
  });

  const body = await res.text();
  if (!res.ok) {
    console.error("Resend error", res.status);
    return new Response(JSON.stringify({ error: "Failed to send email" }), { status: 502 });
  }

  try {
    const result = JSON.parse(body);
    console.log("Email sent, id:", result.id);
  } catch {
    // noop
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json" },
  });
});
