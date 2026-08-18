// Envía un email cuando un pedido de libro cambia a "aprobado".
// Disparado por trigger AFTER UPDATE en public.pedidos_libros vía pg_net.
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
  let p: {
    id?: string;
    nombre_completo?: string;
    email?: string;
    telefono?: string;
    libro?: string;
    formato?: string;
    cantidad?: number;
    total?: number;
    direccion?: string | null;
    ciudad?: string | null;
    departamento?: string | null;
    updated_at?: string;
  };
  try {
    p = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const monto = typeof p.total === "number" ? "$" + p.total.toLocaleString("es-CO") + " COP" : "—";
  const when = p.updated_at ?? new Date().toISOString();
  const fecha = new Date(when).toLocaleString("es-CO", { timeZone: "America/Bogota" });

  const envio =
    p.formato === "fisico"
      ? `<h3>Envío</h3><p>${p.direccion ?? ""}<br>${p.ciudad ?? ""}, ${p.departamento ?? ""}</p>`
      : "";

  const html = `<h2>Nueva compra de libro aprobada</h2>
<p><strong>Libro:</strong> ${p.libro ?? "—"} (${p.formato ?? "—"})</p>
<p><strong>Cantidad:</strong> ${p.cantidad ?? "—"}</p>
<p><strong>Monto:</strong> ${monto}</p>
<p><strong>Fecha:</strong> ${fecha} (hora Colombia)</p>
<h3>Comprador</h3>
<p>${p.nombre_completo ?? ""}<br>${p.email ?? ""}<br>${p.telefono ?? ""}</p>
${envio}
<p style="color:#666;font-size:12px">Pedido ${p.id ?? ""}</p>`;

  // Enviar email
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [NOTIFY_TO],
      subject: `Compra aprobada: ${p.libro ?? "libro"} — ${p.nombre_completo ?? ""}`,
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
