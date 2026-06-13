import { createServerFn } from "@tanstack/react-start";

export const recordOrder = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      orderId?: string;
      status?: string;
      amount?: number;
      currency?: string;
      description?: string;
      customerEmail?: string;
      customerName?: string;
      customerPhone?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const status = (data.status ?? "unknown").toLowerCase();

    // Upsert-style: if order_id exists, update status; otherwise insert
    if (data.orderId) {
      const { data: existing } = await supabaseAdmin
        .from("orders")
        .select("id")
        .eq("order_id", data.orderId)
        .maybeSingle();

      if (existing) {
        await supabaseAdmin
          .from("orders")
          .update({
            status,
            amount: data.amount ?? null,
            currency: data.currency ?? null,
            customer_email: data.customerEmail ?? null,
            customer_name: data.customerName ?? null,
            customer_phone: data.customerPhone ?? null,
            raw_payload: data as unknown as Record<string, unknown>,
          })
          .eq("id", existing.id);
        return { ok: true, id: existing.id, updated: true };
      }
    }

    const { data: inserted, error } = await supabaseAdmin
      .from("orders")
      .insert({
        order_id: data.orderId ?? null,
        status,
        amount: data.amount ?? null,
        currency: data.currency ?? null,
        customer_email: data.customerEmail ?? null,
        customer_name: data.customerName ?? null,
        customer_phone: data.customerPhone ?? null,
        product: data.description ?? "masterclass-de-clientes-a-fans",
        raw_payload: data as unknown as Record<string, unknown>,
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return { ok: true, id: inserted.id, updated: false };
  });
