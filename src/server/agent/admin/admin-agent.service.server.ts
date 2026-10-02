import {
  getGA4Metrics,
  isGA4Configured,
} from "../analytics/ga4.datasource";

import type {
  EngagementMetrics,
} from "./business-intelligence.types";

import { callOpenRouter } from "../llm/openrouter.provider.server";
import { ADMIN_SYSTEM_PROMPT } from "./admin-system.prompt.server";

import type {
  AdminAgentResponse,
  ExecutiveInsight,
  Forecast,
  DataSourceRef,
} from "../core/agent.types";

export interface AdminAgentInput {
  query: string;
  context?: {
    period?: string;
    metric?: string;
    datasources?: string[];
  };
}

/**
 * Execute Admin Agent conversation.
 * CEO copilot with access to business intelligence.
 *
 * SECURITY:
 * Always verify admin access before calling this service.
 */
export async function executeAdminAgent(
  input: AdminAgentInput,
): Promise<AdminAgentResponse> {
  try {
    // 1. Load real GA4 data when available/requested.
    const ga4Metrics = await loadGA4MetricsSafely(
      input.context?.datasources,
    );

    // 2. Build grounded context using only data actually loaded.
    const adminContext = buildAdminContext(
      input.context,
      ga4Metrics,
    );

    // 3. Prepare system message.
    const systemPrompt =
      ADMIN_SYSTEM_PROMPT + "\n\n" + adminContext;

    // 4. Call LLM.
    const response = await callOpenRouter([
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: input.query,
      },
    ]);

    // 5. Structured extraction placeholders.
    const insights = parseInsights(response);
    const recommendations = parseRecommendations(response);
    const forecasts = parseForecasts(response);

    // 6. Report only sources actually available/used.
    const sourcesUsed = determineSourcesUsed(
      input.context?.datasources,
      ga4Metrics,
    );

    const dataFreshness: Record<string, string> = {};

    if (ga4Metrics) {
      dataFreshness.ga4 = ga4Metrics.lastUpdated;
    }

    return {
      message: response,
      insights,
      recommendations,
      forecasts,
      sourcesUsed,
      dataFreshness:
        Object.keys(dataFreshness).length > 0
          ? dataFreshness
          : undefined,
    };
  } catch (err) {
    console.error("[AdminAgent] Error:", err);

    return {
      message:
        "Error procesando consulta. Por favor intenta de nuevo o contacta soporte.",
      insights: [],
      recommendations: [],
      forecasts: [],
      sourcesUsed: [],
    };
  }
}

/**
 * Load GA4 data without making the whole Master Agent fail
 * if Analytics is temporarily unavailable.
 *
 * Behaviour:
 * - If no datasource list is provided, GA4 loads by default when configured.
 * - If datasources are explicitly supplied, GA4 loads only when "ga4"
 *   is requested.
 */
async function loadGA4MetricsSafely(
  datasources?: string[],
): Promise<EngagementMetrics | null> {
  const hasExplicitDatasourceSelection =
    Array.isArray(datasources) && datasources.length > 0;

  const ga4Requested =
    !hasExplicitDatasourceSelection ||
    datasources?.includes("ga4");

  if (!ga4Requested) {
    return null;
  }

  if (!isGA4Configured()) {
    console.warn(
      "[AdminAgent][GA4] GA4 datasource is not configured.",
    );

    return null;
  }

  try {
    return await getGA4Metrics();
  } catch (error) {
    console.error(
      "[AdminAgent][GA4] Failed to load GA4 metrics:",
      error,
    );

    return null;
  }
}

/**
 * Build grounded context for the Master Agent.
 *
 * IMPORTANT:
 * Only include observed data actually loaded by this service.
 * Never describe unavailable datasources as if they were connected.
 */
function buildAdminContext(
  context?: AdminAgentInput["context"],
  ga4Metrics?: EngagementMetrics | null,
): string {
  const sections: string[] = [];

  const loadedSources: string[] = [];

  if (ga4Metrics) {
    loadedSources.push("Google Analytics 4");
  }

  sections.push(`
=== COPILOTO EJECUTIVO - VOZ ESTRATÉGICA ===

Eres un copiloto ejecutivo que analiza información real disponible
para Voz Estratégica.

PERIODO SOLICITADO POR EL USUARIO:
${context?.period || "no especificado"}

MÉTRICA O ÁREA DE INTERÉS:
${context?.metric || "general"}

FUENTES REALMENTE CARGADAS EN ESTA CONSULTA:
${
  loadedSources.length > 0
    ? loadedSources.join(", ")
    : "ninguna fuente analítica externa disponible"
}

=== REGLAS DE VERACIDAD ===

- Usa como hechos únicamente los datos observados incluidos en este contexto.
- Distingue claramente entre dato observado, interpretación e hipótesis.
- No inventes tráfico, ingresos, conversiones, ventas ni leads.
- No inventes datos de una fuente que no haya sido cargada.
- Si faltan datos para responder una parte de la pregunta, indícalo.
- No presentes proyecciones como hechos.
- No reveles credenciales, API keys, secrets, variables de entorno
  ni detalles internos sensibles.
`);

  if (ga4Metrics) {
    sections.push(buildGA4Context(ga4Metrics));
  } else {
    sections.push(`
=== GOOGLE ANALYTICS 4 ===

GA4 no está disponible en esta consulta.

No inventes:
- usuarios
- sesiones
- páginas vistas
- engagement
- bounce rate
- eventos
- conversiones provenientes de Analytics

Si la pregunta depende de Analytics, explica que la fuente no pudo
ser consultada en esta ejecución.
`);
  }

  sections.push(`
=== ESTADO ACTUAL DE OTRAS FUENTES ===

Google Ads:
- todavía no está integrado en este servicio.
- no inventes inversión, campañas, clics, conversiones, CPA o ROAS.

Supabase / métricas comerciales:
- la plataforma utiliza Supabase para datos operativos,
  pero este servicio todavía no está inyectando esas métricas
  dentro de esta consulta del copiloto.
- no presentes ventas, pedidos, leads o ingresos de Supabase
  como hechos mientras esos datos no aparezcan en el contexto.

Agent Metrics:
- todavía no hay una fuente persistente conectada a este servicio.
- no inventes número de conversaciones, intents o conversiones
  del agente.

=== CAPACIDADES ACTUALES ===

Cuando GA4 esté disponible puedes:

- analizar tráfico web;
- analizar usuarios activos;
- analizar sesiones;
- analizar sesiones con interacción;
- analizar duración media de sesión;
- analizar bounce rate;
- identificar páginas con mayor actividad;
- analizar los principales eventos registrados;
- identificar patrones observados;
- formular hipótesis claramente marcadas como hipótesis;
- recomendar qué métricas deberían monitorearse;
- sugerir próximos pasos sujetos a aprobación humana.

=== LIMITACIONES ===

No puedes:

- modificar campañas;
- cambiar presupuestos;
- ejecutar acciones empresariales;
- modificar Analytics;
- modificar Google Ads;
- realizar compras;
- enviar dinero;
- inventar métricas ausentes.

=== HORIZONTES DE ANÁLISIS ===

- Corto plazo: 7-30 días
- Mediano plazo: 1-6 meses
- Largo plazo: 6-24 meses

Para horizontes futuros, cualquier proyección debe presentarse
como escenario o hipótesis, nunca como hecho observado.
`);

  return sections.join("\n");
}

/**
 * Build the observed GA4 section injected into the LLM context.
 */
function buildGA4Context(
  ga4Metrics: EngagementMetrics,
): string {
  const traffic = ga4Metrics.traffic;

  const topPages =
    ga4Metrics.topPages.length > 0
      ? ga4Metrics.topPages
          .slice(0, 10)
          .map((page, index) => {
            return [
              `${index + 1}. ${page.path}`,
              `vistas=${formatNumber(page.pageViews)}`,
              `usuarios=${formatNumber(page.uniqueUsers)}`,
              `tiempo_promedio=${formatSeconds(
                page.avgTimeOnPage,
              )}`,
            ].join(" | ");
          })
          .join("\n")
      : "Sin páginas disponibles.";

  const eventEntries = Object.entries(
    ga4Metrics.events,
  ).sort((a, b) => b[1] - a[1]);

  const topEvents =
    eventEntries.length > 0
      ? eventEntries
          .slice(0, 20)
          .map(
            ([eventName, count], index) =>
              `${index + 1}. ${eventName}: ${formatNumber(
                count,
              )}`,
          )
          .join("\n")
      : "Sin eventos disponibles.";

  return `
=== GOOGLE ANALYTICS 4 — DATOS OBSERVADOS ===

IMPORTANTE:
La consulta actual del datasource GA4 utiliza una ventana fija
de los últimos 30 días.

Estos datos son observados y pueden citarse como hechos
dentro de esa ventana.

Usuarios activos:
${formatNumber(traffic.uniqueUsers)}

Sesiones:
${formatNumber(traffic.sessions)}

Sesiones con interacción:
${formatNumber(traffic.engagedSessions)}

Duración media de sesión:
${formatSeconds(traffic.avgSessionDuration)}

Bounce rate:
${formatPercent(traffic.bounceRate)}

=== TOP PÁGINAS ===

${topPages}

=== EVENTOS PRINCIPALES ===

${topEvents}

Última consulta a GA4:
${ga4Metrics.lastUpdated}
`;
}

/**
 * Determine which data sources were actually used.
 */
function determineSourcesUsed(
  datasources?: string[],
  ga4Metrics?: EngagementMetrics | null,
): DataSourceRef[] {
  const used: DataSourceRef[] = [];

  if (ga4Metrics) {
    used.push({
      source: "ga4",
      updatedAt: ga4Metrics.lastUpdated,
    });
  } else if (datasources?.includes("ga4")) {
    used.push({
      source: "ga4",
      updatedAt: "unavailable",
    });
  }

  if (datasources?.includes("google_ads")) {
    used.push({
      source: "google_ads",
      updatedAt: "not configured",
    });
  }

  return used;
}

/**
 * Format numeric metrics safely.
 */
function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format seconds for model-readable context.
 */
function formatSeconds(value: number): string {
  if (!Number.isFinite(value)) {
    return "0 segundos";
  }

  return `${value.toFixed(2)} segundos`;
}

/**
 * GA4 datasource normalizes bounce rate to percentage (0-100).
 */
function formatPercent(value: number): string {
  if (!Number.isFinite(value)) {
    return "0 %";
  }

  return `${value.toFixed(2)} %`;
}

/**
 * Parse insights from LLM response.
 *
 * Placeholder until structured model output is implemented.
 */
function parseInsights(
  _response: string,
): ExecutiveInsight[] {
  return [];
}

/**
 * Parse recommendations from LLM response.
 *
 * Placeholder until structured model output is implemented.
 */
function parseRecommendations(
  _response: string,
): string[] {
  return [];
}

/**
 * Parse forecasts from LLM response.
 *
 * Placeholder until structured model output is implemented.
 */
function parseForecasts(
  _response: string,
): Forecast[] {
  return [];
}