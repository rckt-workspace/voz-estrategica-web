import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle, AlertCircle, Clock, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import type { Integration, IntegrationsHealthResponse } from "@/lib/control-integrations-schema";

export const Route = createFileRoute("/control/integrations")({
  component: ControlIntegrationsPage,
});

function ControlIntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const fetchIntegrationsHealth = async () => {
    setLoading(true);
    setLastError(null);
    try {
      const response = await fetch("/api/control/integrations");
      if (!response.ok) {
        if (response.status === 401) {
          setLastError("No autorizado");
        } else if (response.status === 500) {
          setLastError("Error interno al consultar integraciones");
        } else {
          setLastError(`Error HTTP ${response.status}`);
        }
        setLoading(false);
        return;
      }
      const data: IntegrationsHealthResponse = await response.json();
      setIntegrations(data.integrations);
      setCheckedAt(data.checkedAt);
    } catch (error) {
      console.error("[ControlIntegrations] Error fetching health:", error);
      setLastError("Error al cargar estado de integraciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrationsHealth();
  }, []);

  const getStatusIcon = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-amber-600" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusLabel = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return "Conectado";
      case "pending":
        return "Pendiente";
      case "error":
        return "Error";
    }
  };

  const getStatusColor = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return "text-green-600";
      case "pending":
        return "text-amber-600";
      case "error":
        return "text-red-600";
    }
  };

  const formatDetailValue = (value: unknown): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const getDetailsSummary = (details: Record<string, unknown> | undefined): string => {
    if (!details || Object.keys(details).length === 0) return "";

    const summary: string[] = [];
    for (const [key, value] of Object.entries(details)) {
      if (
        typeof value === "string" ||
        typeof value === "number"
      ) {
        summary.push(`${key}: ${formatDetailValue(value)}`);
      } else if (typeof value === "boolean") {
        summary.push(`${key}: ${value ? "sí" : "no"}`);
      }

      if (summary.length >= 2) break;
    }
    return summary.join(" · ");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl uppercase">Integraciones</h1>
          <p className="mt-2 text-muted-foreground">Estado de servicios conectados</p>
        </div>
        <button
          onClick={fetchIntegrationsHealth}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-foreground/10 bg-card hover:bg-accent disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {lastError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
          {lastError}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-foreground/10 bg-card p-4">
          <p className="text-sm text-muted-foreground">Conectadas</p>
          <p className="mt-2 text-2xl font-bold">
            {integrations.filter((i) => i.status === "connected").length}
          </p>
        </div>
        <div className="rounded-lg border border-foreground/10 bg-card p-4">
          <p className="text-sm text-muted-foreground">Pendientes</p>
          <p className="mt-2 text-2xl font-bold">
            {integrations.filter((i) => i.status === "pending").length}
          </p>
        </div>
        <div className="rounded-lg border border-foreground/10 bg-card p-4">
          <p className="text-sm text-muted-foreground">Errores</p>
          <p className="mt-2 text-2xl font-bold">
            {integrations.filter((i) => i.status === "error").length}
          </p>
        </div>
      </div>

      {/* Integration List */}
      <div className="space-y-3">
        {loading && integrations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Cargando estado de integraciones...</div>
        ) : integrations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No hay integraciones para mostrar</div>
        ) : (
          integrations.map((integration) => (
            <div
              key={integration.id}
              className="flex items-start justify-between rounded-lg border border-foreground/10 bg-card p-4"
            >
              <div className="flex items-start gap-3 flex-1">
                {getStatusIcon(integration.status)}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{integration.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{integration.description}</p>
                  {integration.details && (
                    <p className="text-xs text-muted-foreground mt-2">{getDetailsSummary(integration.details as any)}</p>
                  )}
                  {integration.latencyMs !== undefined && integration.latencyMs !== null && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Latencia: {integration.latencyMs}ms
                    </p>
                  )}
                  {checkedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Comprobado: {new Date(checkedAt).toLocaleTimeString("es-ES")}
                    </p>
                  )}
                </div>
              </div>
              <span className={`ml-4 text-sm font-medium whitespace-nowrap ${getStatusColor(integration.status)}`}>
                {getStatusLabel(integration.status)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Setup Instructions */}
      {integrations.filter((i) => i.status === "pending").length > 0 && (
        <div className="rounded-lg border border-foreground/10 bg-card p-6">
          <h3 className="font-semibold mb-4">Pendientes de configuración</h3>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            {integrations
              .filter((i) => i.status === "pending")
              .map((i) => (
                <li key={i.id}>{i.name} - {i.description}</li>
              ))}
          </ol>
        </div>
      )}
    </div>
  );
}
