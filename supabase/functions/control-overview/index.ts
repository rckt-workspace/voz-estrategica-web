import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const RCKT_INTERNAL_SECRET = Deno.env.get("RCKT_INTERNAL_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const unavailable = () => ({ available: false, total: null });

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json" } });
  }

  const token = (req.headers.get("authorization") || "").replace("Bearer ", "").trim();
  if (!RCKT_INTERNAL_SECRET || token !== RCKT_INTERNAL_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "content-type": "application/json" } });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Server configuration unavailable" }), { status: 503, headers: { "content-type": "application/json" } });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = new Date();
    const last7 = new Date(now.getTime() - 7 * 86400000);
    const last30 = new Date(now.getTime() - 30 * 86400000);

    const [requestsRes, subscribersRes, pedidosRes, speakersRes, booksRes, eventsRes] = await Promise.all([
      supabase.from("booking_requests").select("id,created_at,estado"),
      supabase.from("subscribers").select("id,created_at"),
      supabase.from("pedidos_libros").select("id,fecha_creacion,estado_pago,total"),
      supabase.from("speakers").select("id"),
      supabase.from("books").select("id"),
      supabase.from("events").select("id,fecha"),
    ]);

    const requests = requestsRes.data ?? [];
    const subscribers = subscribersRes.data ?? [];
    const pedidos = pedidosRes.data ?? [];
    const speakers = speakersRes.data ?? [];
    const books = booksRes.data ?? [];
    const events = eventsRes.data ?? [];

    const countSince = (rows: Array<Record<string, unknown>>, field: string, since: Date) =>
      rows.filter((row) => typeof row[field] === "string" && new Date(row[field] as string) > since).length;

    const approved = pedidos.filter((p) => p.estado_pago === "aprobado");
    const pending = pedidos.filter((p) => p.estado_pago === "pendiente").length;
    const rejected = pedidos.filter((p) => p.estado_pago === "rechazado").length;
    const canceled = pedidos.filter((p) => p.estado_pago === "cancelado").length;
    const knownStates = new Set(["aprobado", "pendiente", "rechazado", "cancelado"]);
    const others = pedidos.filter((p) => !knownStates.has(p.estado_pago as string)).length;
    const revenueTotal = pedidos.reduce((sum, p) => sum + (Number(p.total) || 0), 0);
    const revenueApproved = approved.reduce((sum, p) => sum + (Number(p.total) || 0), 0);

    return new Response(JSON.stringify({
      timestamp: now.toISOString(),
      kpis: {
        solicitudes: requestsRes.error ? unavailable() : { available: true, total: requests.length, last7Days: countSince(requests, "created_at", last7), last30Days: countSince(requests, "created_at", last30) },
        subscribers: subscribersRes.error ? unavailable() : { available: true, total: subscribers.length, last7Days: countSince(subscribers, "created_at", last7), last30Days: countSince(subscribers, "created_at", last30) },
        pedidos: pedidosRes.error ? { ...unavailable(), aprobados: null, pendientes: null, rechazados: null, cancelados: null, otros: null } : { available: true, total: pedidos.length, aprobados: approved.length, pendientes: pending, rechazados: rejected, cancelados: canceled, otros: others },
        speakers: speakersRes.error ? unavailable() : { available: true, total: speakers.length },
        books: booksRes.error ? unavailable() : { available: true, total: books.length },
        events: eventsRes.error ? unavailable() : { available: true, total: events.length },
        revenue: pedidosRes.error ? { available: false, total: null, aprobado: null } : { available: true, total: revenueTotal, aprobado: revenueApproved },
      },
      series: { solicitudes: [], subscribers: [], pedidos: [], revenue: [] },
    }), { status: 200, headers: { "content-type": "application/json", "cache-control": "no-store" } });
  } catch (error) {
    console.error("[control-overview] Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "content-type": "application/json" } });
  }
});
