import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/ventas-masterclass")({
  component: VentasMasterclassPage,
});

interface Order {
  id: string;
  order_id: string | null;
  status: string;
  amount: number | null;
  currency: string | null;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  product: string | null;
  created_at: string;
}

function VentasMasterclassPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, order_id, status, amount, currency, customer_email, customer_name, customer_phone, product, created_at",
        )
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      setOrders((data as Order[] | null) ?? []);
      setLoading(false);
    })();
  }, []);

  const totalPagado = useMemo(
    () =>
      orders
        .filter((o) => /pag|aprob|paid|approved|success/i.test(o.status))
        .reduce((sum, o) => sum + Number(o.amount ?? 0), 0),
    [orders],
  );

  if (loading) return <p className="text-muted-foreground">Cargando…</p>;

  if (orders.length === 0)
    return (
      <div className="rounded-2xl border border-dashed border-foreground/20 p-12 text-center">
        <h2 className="font-display text-2xl uppercase">Sin ventas todavía</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Las compras de la masterclass aparecen acá.
        </p>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-2xl uppercase">Ventas ({orders.length})</h2>
        <span className="text-sm text-muted-foreground">
          Total aprobado: ${totalPagado.toLocaleString("es-CO")}
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-foreground/10">
        <table className="w-full text-sm">
          <thead className="bg-foreground/5 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Comprador</th>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Monto</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-foreground/10 align-top">
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleDateString("es-ES")}
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold">{o.customer_name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{o.customer_email ?? "—"}</div>
                  {o.customer_phone ? (
                    <div className="text-xs text-muted-foreground">{o.customer_phone}</div>
                  ) : null}
                </td>
                <td className="px-4 py-3 max-w-xs text-xs">{o.product ?? "—"}</td>
                <td className="px-4 py-3 font-semibold">
                  {o.amount != null
                    ? `$${Number(o.amount).toLocaleString("es-CO")} ${o.currency ?? ""}`.trim()
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-foreground/20 px-3 py-1 text-xs font-semibold">
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
