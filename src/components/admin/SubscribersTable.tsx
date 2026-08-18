import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface Subscriber {
  id: string;
  nombre: string;
  email: string;
  empresa: string | null;
  telefono: string | null;
  rol: string | null;
  intereses: string[] | null;
  created_at: string;
}

interface Props {
  source: string;
  title: string;
  csvPrefix: string;
  emptyTitle: string;
  emptyHint: string;
  variant?: "full" | "simple";
}

export function SubscribersTable({
  source,
  title,
  csvPrefix,
  emptyTitle,
  emptyHint,
  variant = "full",
}: Props) {
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from("suscriptores_newsletter")
        .select("id, nombre, email, empresa, telefono, rol, intereses, created_at")
        .eq("source", source)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) toast.error(error.message);
      setSubs((data as Subscriber[] | null) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [source]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return subs;
    return subs.filter(
      (s) =>
        s.email.toLowerCase().includes(term) ||
        s.nombre.toLowerCase().includes(term) ||
        (s.empresa ?? "").toLowerCase().includes(term),
    );
  }, [q, subs]);

  function exportCsv() {
    const header =
      variant === "full"
        ? ["fecha", "nombre", "email", "empresa", "telefono", "rol", "intereses"]
        : ["fecha", "nombre", "email"];
    const rows = [
      header,
      ...subs.map((s) =>
        variant === "full"
          ? [
              new Date(s.created_at).toISOString(),
              s.nombre,
              s.email,
              s.empresa ?? "",
              s.telefono ?? "",
              s.rol ?? "",
              (s.intereses ?? []).join(", "),
            ]
          : [new Date(s.created_at).toISOString(), s.nombre, s.email],
      ),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${csvPrefix}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <p className="text-muted-foreground">Cargando…</p>;

  if (subs.length === 0)
    return (
      <div className="rounded-2xl border border-dashed border-foreground/20 p-12 text-center">
        <h2 className="font-display text-2xl uppercase">{emptyTitle}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{emptyHint}</p>
      </div>
    );

  const colCount = variant === "full" ? 7 : 3;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-2xl uppercase">
          {title} ({subs.length})
        </h2>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
        >
          <Download className="h-4 w-4" /> Exportar CSV
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, correo o empresa…"
          className="w-full rounded-full border border-foreground/20 bg-background py-2.5 pl-11 pr-4 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-foreground/10">
        <table className="w-full text-sm">
          <thead className="bg-foreground/5 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Correo</th>
              {variant === "full" ? (
                <>
                  <th className="px-4 py-3">Empresa</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Intereses</th>
                </>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-t border-foreground/10 align-top">
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(s.created_at).toLocaleDateString("es-ES")}
                </td>
                <td className="px-4 py-3 font-semibold">{s.nombre}</td>
                <td className="px-4 py-3">{s.email}</td>
                {variant === "full" ? (
                  <>
                    <td className="px-4 py-3 text-xs">{s.empresa ?? "—"}</td>
                    <td className="px-4 py-3 text-xs">{s.telefono ?? "—"}</td>
                    <td className="px-4 py-3 text-xs">{s.rol ?? "—"}</td>
                    <td className="px-4 py-3 max-w-sm text-xs text-muted-foreground">
                      {s.intereses && s.intereses.length > 0 ? s.intereses.join(", ") : "—"}
                    </td>
                  </>
                ) : null}
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={colCount}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  Sin resultados para “{q}”.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
