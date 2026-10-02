import type { Integration } from "@/lib/control-integrations-schema";
import { fetchControlOverview } from "@/lib/agent-server-boundaries";
import { getGA4Metrics, isGA4Configured } from "../agent/analytics/ga4.datasource";

export async function checkSupabaseHealth(): Promise<Integration> {
  const start = Date.now();
  const RCKT_INTERNAL_SECRET = process.env.RCKT_INTERNAL_SECRET;
  const SUPABASE_URL = process.env.SUPABASE_URL;

  if (!RCKT_INTERNAL_SECRET || !SUPABASE_URL) {
    return {
      id: "supabase",
      name: "Supabase / Lovable Cloud",
      status: "pending",
      description: "No configurado",
      details: { reason: "Missing RCKT_INTERNAL_SECRET or SUPABASE_URL" },
    };
  }

  try {
    const result = await fetchControlOverview();
    const latency = Date.now() - start;

    if (!result.success || !result.data) {
      return {
        id: "supabase",
        name: "Supabase / Lovable Cloud",
        status: "error",
        description: "Edge Function no respondió correctamente",
        latencyMs: latency,
        details: { error: result.error || "Unknown error" },
      };
    }

    const data = result.data as any;
    const details: Record<string, unknown> = {
      solicitudes: data.kpis?.solicitudes?.total || 0,
      suscriptores: data.kpis?.subscribers?.total || 0,
      pedidos: data.kpis?.pedidos?.total || 0,
      revenue: data.kpis?.revenue?.total || 0,
    };

    return {
      id: "supabase",
      name: "Supabase / Lovable Cloud",
      status: "connected",
      description: "Base de datos y Edge Functions operativas",
      latencyMs: latency,
      details,
    };
  } catch (error) {
    return {
      id: "supabase",
      name: "Supabase / Lovable Cloud",
      status: "error",
      description: "Error al contactar Edge Function",
      latencyMs: Date.now() - start,
      details: { error: error instanceof Error ? error.message : "Unknown error" },
    };
  }
}

export async function checkOpenRouterHealth(): Promise<Integration> {
  const start = Date.now();
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return {
      id: "openrouter",
      name: "OpenRouter",
      status: "pending",
      description: "API key no configurada",
      details: { configured: false },
    };
  }

  try {
    const baseUrl = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
    const response = await fetch(`${baseUrl}/key`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    const latency = Date.now() - start;

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[OpenRouter Health] API error:", response.status, errorText);

      return {
        id: "openrouter",
        name: "OpenRouter",
        status: "error",
        description: "API rechazó la solicitud",
        latencyMs: latency,
        details: {
          status: response.status,
          model: process.env.CHAT_PRIMARY_LLM || "openrouter/free",
        },
      };
    }

    const keyData = await response.json() as any;
    const details: Record<string, unknown> = {
      model: process.env.CHAT_PRIMARY_LLM || "openrouter/free",
      baseUrl: baseUrl,
    };

    if (keyData.limit_remaining !== undefined) {
      details.limit_remaining = keyData.limit_remaining;
    }
    if (keyData.usage !== undefined) {
      details.usage = keyData.usage;
    }

    return {
      id: "openrouter",
      name: "OpenRouter",
      status: "connected",
      description: "Proveedor LLM para agentes",
      latencyMs: latency,
      details,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        id: "openrouter",
        name: "OpenRouter",
        status: "error",
        description: "Timeout al verificar conexión",
        details: { timeout: 5000 },
      };
    }

    return {
      id: "openrouter",
      name: "OpenRouter",
      status: "error",
      description: "Error al verificar API key",
      latencyMs: Date.now() - start,
      details: { error: error instanceof Error ? error.message : "Unknown error" },
    };
  }
}

export async function checkGA4Health(): Promise<Integration> {
  const start = Date.now();

  if (!isGA4Configured()) {
    const missingVars: string[] = [];
    if (!process.env.GA4_PROPERTY_ID) missingVars.push("GA4_PROPERTY_ID");
    if (
      !process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL ||
      !process.env.GOOGLE_ANALYTICS_PRIVATE_KEY
    ) {
      missingVars.push("credenciales de Google");
    }

    return {
      id: "ga4",
      name: "Google Analytics 4",
      status: "pending",
      description: `No configurado. Faltan: ${missingVars.join(", ")}`,
      details: { missing: missingVars },
    };
  }

  try {
    const metrics = await getGA4Metrics();
    const latency = Date.now() - start;

    const details: Record<string, unknown> = {
      activeUsers: metrics.traffic.uniqueUsers,
      sessions: metrics.traffic.sessions,
      engagedSessions: metrics.traffic.engagedSessions,
      bounceRate: metrics.traffic.bounceRate.toFixed(1) + "%",
      lastUpdated: metrics.lastUpdated,
    };

    return {
      id: "ga4",
      name: "Google Analytics 4",
      status: "connected",
      description: "Analytics en tiempo real",
      latencyMs: latency,
      details,
    };
  } catch (error) {
    console.error("[GA4 Health] Error:", error);

    return {
      id: "ga4",
      name: "Google Analytics 4",
      status: "error",
      description: "Google Analytics API no responde",
      latencyMs: Date.now() - start,
      details: { error: error instanceof Error ? error.message : "Unknown error" },
    };
  }
}

export async function checkSoroHealth(): Promise<Integration> {
  const start = Date.now();
  const soroEmbedId = "7e9befdb-eb37-40d0-8b6a-6043898f81d9";
  const soroEmbedUrl = `https://app.trysoro.com/api/embed/${soroEmbedId}`;

  try {
    const response = await fetch(soroEmbedUrl, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });

    const latency = Date.now() - start;

    if (!response.ok) {
      return {
        id: "soro",
        name: "Soro",
        status: "error",
        description: "Endpoint de Soro no responde",
        latencyMs: latency,
        details: {
          embedId: soroEmbedId,
          status: response.status,
        },
      };
    }

    // Soro devuelve una página/contenido en respuesta.
    // Si llega aquí con 2xx, consideramos que está conectado.
    const details: Record<string, unknown> = {
      embedId: soroEmbedId,
      blog: "/blog",
      embedReachable: true,
    };

    return {
      id: "soro",
      name: "Soro",
      status: "connected",
      description: "Blog SEO y contenido operativo",
      latencyMs: latency,
      details,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        id: "soro",
        name: "Soro",
        status: "error",
        description: "Timeout al verificar Soro",
        details: { timeout: 5000 },
      };
    }

    return {
      id: "soro",
      name: "Soro",
      status: "error",
      description: "No se puede contactar Soro",
      latencyMs: Date.now() - start,
      details: { error: error instanceof Error ? error.message : "Unknown error" },
    };
  }
}

export async function checkGoogleAdsHealth(): Promise<Integration> {
  const hasConfig = Boolean(process.env.GOOGLE_ADS_CUSTOMER_ID);

  if (!hasConfig) {
    return {
      id: "google-ads",
      name: "Google Ads",
      status: "pending",
      description: "Integración todavía no configurada",
      details: { configured: false },
    };
  }

  return {
    id: "google-ads",
    name: "Google Ads",
    status: "pending",
    description: "Health check no implementado",
    details: { configured: true, checkImplemented: false },
  };
}

export async function checkAgentMetricsHealth(): Promise<Integration> {
  return {
    id: "agent-metrics",
    name: "Agent Metrics",
    status: "pending",
    description: "Instrumentación todavía no implementada",
    details: { implemented: false },
  };
}

export async function getIntegrationsHealth(): Promise<Integration[]> {
  const checks = [
    checkSupabaseHealth(),
    checkOpenRouterHealth(),
    checkGA4Health(),
    checkSoroHealth(),
    checkGoogleAdsHealth(),
    checkAgentMetricsHealth(),
  ];

  const results = await Promise.allSettled(checks);

  return results
    .map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      }
      const error = result.reason instanceof Error ? result.reason.message : String(result.reason);
      console.error("[IntegrationsHealth] Health check failed:", error);
      return null;
    })
    .filter((integration) => integration !== null) as Integration[];
}
