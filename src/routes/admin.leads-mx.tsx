import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/leads-mx")({
  component: LeadsMxPage,
});

interface LeadMx {
  id: string;
  nombre: string;
  empresa: string;
  cargo: string | null;
  tipo_evento: string;
  ciudad_fecha: string;
  whatsapp: string;
  presupuesto: string | null;
  asistentes: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  created_at: string;
}

function LeadsMxPage() {
  const [leads, setLeads] = useState<LeadMx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("leads_mx")
        .select(
          "id, nombre, empresa, cargo, tipo_evento, ciudad_fecha, whatsapp, presupuesto, asistentes, utm_source, utm_campaign, created_at",
        )
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      setLeads((data as LeadMx[] | null) ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-muted-foreground">Cargando…</p>;

  if (leads.length === 0)
    return (
      <div className="rounded-2xl border border-dashed border-foreground/20 p-12 text-center">
        <h2 className="font-display text-2xl uppercase">Sin leads todavía</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Los registros de la campaña de México aparecen acá.
        </p>
      </div>
    );

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl uppercase">Leads MX ({leads.length})</h2>

      <div className="overflow-x-auto rounded-2xl border border-foreground/10">
        <table className="w-full text-sm">
          <thead className="bg-foreground/5 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Empresa / Cargo</th>
              <th className="px-4 py-3">WhatsApp</th>
              <th className="px-4 py-3">Evento</th>
              <th className="px-4 py-3">Presupuesto</th>
              <th className="px-4 py-3">Origen</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-t border-foreground/10 align-top">
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(l.created_at).toLocaleDateString("es-ES")}
                </td>
                <td className="px-4 py-3 font-semibold">{l.nombre}</td>
                <td className="px-4 py-3 text-xs">
                  <div>{l.empresa}</div>
                  <div className="text-muted-foreground">{l.cargo ?? "—"}</div>
                </td>
                <td className="px-4 py-3 text-xs">{l.whatsapp}</td>
                <td className="px-4 py-3 max-w-xs text-xs">
                  <div>{l.tipo_evento}</div>
                  <div className="text-muted-foreground">{l.ciudad_fecha}</div>
                  {l.asistentes ? (
                    <div className="text-muted-foreground">{l.asistentes} asistentes</div>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-xs">{l.presupuesto ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {l.utm_source ?? "—"}
                  {l.utm_campaign ? ` / ${l.utm_campaign}` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
