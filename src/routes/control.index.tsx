import { createFileRoute } from "@tanstack/react-router";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { Loader, AlertCircle } from "lucide-react";
import { ControlOverviewResponseSchema, type ControlOverviewData } from "@/lib/control-overview-schema";

export const Route = createFileRoute("/control/")({
  component: ControlIndexPage,
});

interface KPICard {
  label: string;
  value: string;
  change: string;
  available: boolean;
}

interface AnalyticsData {
  ga4?: {
    available: boolean;
    traffic?: {
      uniqueUsers: number;
      sessions: number;
      engagedSessions: number;
      bounceRate: number;
    };
  };
  ads?: {
    available: boolean;
    campaigns?: Array<{
      name: string;
      spend: number;
      clicks: number;
      impressions: number;
      cpc: number;
    }>;
    totalSpend?: number;
  };
}

function ControlIndexPage() {
  const [data, setData] = useState<ControlOverviewData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both endpoints in parallel
        const [overviewRes, analyticsRes] = await Promise.all([
          fetch("/api/control/overview"),
          fetch("/api/control/analytics"),
        ]);

        // Check overview response
        if (!overviewRes.ok) {
          throw new Error(`Overview: HTTP ${overviewRes.status}`);
        }

        const overviewJson = await overviewRes.json();
        const validated = ControlOverviewResponseSchema.safeParse(overviewJson);
        if (!validated.success) {
          throw new Error("Invalid overview structure");
        }

        if (validated.data.success && validated.data.data) {
          setData(validated.data.data);
        } else {
          throw new Error(validated.data.error || "Failed to load overview");
        }

        // Load analytics if available
        if (analyticsRes.ok) {
          const analyticsJson = await analyticsRes.json();
          if (analyticsJson.success) {
            setAnalyticsData(analyticsJson);
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Error fetching data:", message);
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-4xl uppercase">Resumen Ejecutivo</h1>
          <p className="mt-2 text-muted-foreground">Visión general del negocio</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Error cargando datos</h3>
              <p className="mt-1 text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-4xl uppercase">Resumen Ejecutivo</h1>
          <p className="mt-2 text-muted-foreground">Visión general del negocio</p>
        </div>
        <div className="text-center text-muted-foreground">Sin datos disponibles</div>
      </div>
    );
  }

  // Build KPI cards defensively
  const kpis: KPICard[] = [];

  if (data.kpis.solicitudes.available) {
    kpis.push({
      label: "Solicitudes",
      value: (data.kpis.solicitudes.total ?? 0).toString(),
      change: `+${data.kpis.solicitudes.last30Days ?? 0} últimos 30d`,
      available: true,
    });
  } else {
    kpis.push({
      label: "Solicitudes",
      value: "—",
      change: "No disponible",
      available: false,
    });
  }

  if (data.kpis.subscribers.available) {
    kpis.push({
      label: "Suscriptores",
      value: (data.kpis.subscribers.total ?? 0).toString(),
      change: `+${data.kpis.subscribers.last30Days ?? 0} últimos 30d`,
      available: true,
    });
  } else {
    kpis.push({
      label: "Suscriptores",
      value: "—",
      change: "No disponible",
      available: false,
    });
  }

  if (data.kpis.pedidos.available) {
    kpis.push({
      label: "Pedidos",
      value: (data.kpis.pedidos.total ?? 0).toString(),
      change: `${data.kpis.pedidos.aprobados ?? 0} aprobados`,
      available: true,
    });
  } else {
    kpis.push({
      label: "Pedidos",
      value: "—",
      change: "No disponible",
      available: false,
    });
  }

  if (data.kpis.speakers.available) {
    kpis.push({
      label: "Speakers",
      value: (data.kpis.speakers.total ?? 0).toString(),
      change: "activos",
      available: true,
    });
  } else {
    kpis.push({
      label: "Speakers",
      value: "—",
      change: "No disponible",
      available: false,
    });
  }

  // Chart data
  const chartData = [];
  if (data.kpis.solicitudes.available && data.kpis.solicitudes.total) {
    chartData.push({ name: "Solicitudes", value: data.kpis.solicitudes.total });
  }
  if (data.kpis.subscribers.available && data.kpis.subscribers.total) {
    chartData.push({ name: "Suscriptores", value: data.kpis.subscribers.total });
  }
  if (data.kpis.pedidos.available && data.kpis.pedidos.total) {
    chartData.push({ name: "Pedidos", value: data.kpis.pedidos.total });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl uppercase">Resumen Ejecutivo</h1>
        <p className="mt-2 text-muted-foreground">Visión general del negocio</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`rounded-lg border p-6 ${
              kpi.available
                ? "border-foreground/10 bg-card"
                : "border-foreground/5 bg-foreground/2"
            }`}
          >
            <p className="text-sm text-muted-foreground">{kpi.label}</p>
            <p className="mt-3 font-display text-3xl font-bold">{kpi.value}</p>
            <p className={`mt-2 text-xs ${kpi.available ? "text-green-600" : "text-muted-foreground"}`}>
              {kpi.change}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {chartData.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-foreground/10 bg-card p-6">
            <h3 className="font-semibold mb-4">Visión general de métricas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#000" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg border border-foreground/10 bg-card p-6">
            <h3 className="font-semibold mb-4">Distribución de pedidos</h3>
            {data.kpis.pedidos.available ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Aprobados</span>
                  <span className="font-semibold">{data.kpis.pedidos.aprobados ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pendientes</span>
                  <span className="font-semibold">{data.kpis.pedidos.pendientes ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rechazados</span>
                  <span className="font-semibold">{data.kpis.pedidos.rechazados ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cancelados</span>
                  <span className="font-semibold">{data.kpis.pedidos.cancelados ?? 0}</span>
                </div>
                {(data.kpis.pedidos.otros ?? 0) > 0 && (
                  <div className="flex justify-between">
                    <span>Otros</span>
                    <span className="font-semibold">{data.kpis.pedidos.otros}</span>
                  </div>
                )}
                <div className="border-t border-foreground/10 pt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{data.kpis.pedidos.total ?? 0}</span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Datos no disponibles</p>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-foreground/10 bg-card p-12 text-center">
          <p className="text-muted-foreground">No hay datos disponibles para mostrar gráficos</p>
        </div>
      )}

      {/* GA4 Section */}
      {analyticsData?.ga4?.available && analyticsData.ga4.traffic && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div className="rounded-lg border border-foreground/10 bg-card p-4">
              <p className="text-xs text-muted-foreground">Usuarios activos</p>
              <p className="mt-2 text-2xl font-bold">{analyticsData.ga4.traffic.uniqueUsers.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-foreground/10 bg-card p-4">
              <p className="text-xs text-muted-foreground">Sesiones</p>
              <p className="mt-2 text-2xl font-bold">{analyticsData.ga4.traffic.sessions.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-foreground/10 bg-card p-4">
              <p className="text-xs text-muted-foreground">Sesiones con interacción</p>
              <p className="mt-2 text-2xl font-bold">{analyticsData.ga4.traffic.engagedSessions.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-foreground/10 bg-card p-4">
              <p className="text-xs text-muted-foreground">Bounce rate</p>
              <p className="mt-2 text-2xl font-bold">{(analyticsData.ga4.traffic.bounceRate).toFixed(1)}%</p>
            </div>
            <div className="rounded-lg border border-foreground/10 bg-card p-4">
              <p className="text-xs text-muted-foreground">Período</p>
              <p className="mt-2 text-xs font-semibold">Últimos 30 días</p>
            </div>
          </div>
        </div>
      )}

      {/* Google Ads Section */}
      {analyticsData?.ads?.available && analyticsData.ads.campaigns && analyticsData.ads.campaigns.length > 0 && (
        <div className="space-y-6">
          <div className="rounded-lg border border-foreground/10 bg-card p-6">
            <h3 className="font-semibold mb-4">Google Ads — Últimos 90 días</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Campañas</p>
                <p className="mt-2 text-2xl font-bold">{analyticsData.ads.campaigns.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Costo</p>
                <p className="mt-2 text-2xl font-bold">${(analyticsData.ads.totalSpend ?? 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Clics</p>
                <p className="mt-2 text-2xl font-bold">
                  {analyticsData.ads.campaigns.reduce((sum, c) => sum + c.clicks, 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Impresiones</p>
                <p className="mt-2 text-2xl font-bold">
                  {analyticsData.ads.campaigns.reduce((sum, c) => sum + c.impressions, 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Campaigns Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-foreground/10">
                  <tr>
                    <th className="text-left py-2 px-2">Campaña</th>
                    <th className="text-right py-2 px-2">Costo</th>
                    <th className="text-right py-2 px-2">Clics</th>
                    <th className="text-right py-2 px-2">Impresiones</th>
                    <th className="text-right py-2 px-2">CPC</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.ads.campaigns.map((campaign, idx) => (
                    <tr key={idx} className="border-b border-foreground/5">
                      <td className="py-3 px-2">{campaign.name}</td>
                      <td className="text-right py-3 px-2">${campaign.spend.toFixed(2)}</td>
                      <td className="text-right py-3 px-2">{campaign.clicks.toLocaleString()}</td>
                      <td className="text-right py-3 px-2">{campaign.impressions.toLocaleString()}</td>
                      <td className="text-right py-3 px-2">${campaign.cpc.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Activity */}
      <div className="rounded-lg border border-foreground/10 bg-card p-6">
        <h3 className="font-semibold mb-4">Actividad Reciente</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Sin actividad registrada</p>
        </div>
      </div>
    </div>
  );
}
