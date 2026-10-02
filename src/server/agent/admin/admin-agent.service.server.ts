import type {
  EngagementMetrics,
  CampaignsMetrics,
  AgentMetrics,
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
  history?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
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
  let stage = "start";
  try {
    // 1. Load real GA4 data when available/requested.
    stage = "load-ga4";
    const ga4Metrics = await loadGA4MetricsSafely(
      input.context?.datasources,
    );
    console.info("[AdminAgent] GA4 loaded:", Boolean(ga4Metrics));

    // 2. Load Google Ads metrics when available/requested.
    stage = "load-ads";
    const adsMetrics = await loadAdsMetricsSafely(
      input.context?.datasources,
    );
    console.info("[AdminAgent] Ads loaded:", Boolean(adsMetrics), adsMetrics?.campaigns?.length || 0, "campaigns");

    // 3. Load Agent Metrics when available/requested.
    stage = "load-agent-metrics";
    const agentMetrics = await loadAgentMetricsSafely(
      input.context?.datasources,
    );
    console.info("[AdminAgent] Agent Metrics loaded:", Boolean(agentMetrics), agentMetrics?.conversations?.totalConversations || 0, "conversations");

    // 4. Build grounded context using only data actually loaded.
    stage = "build-context";
    const adminContext = buildAdminContext(
      input.context,
      ga4Metrics,
      adsMetrics,
      agentMetrics,
    );
    console.info("[AdminAgent] Context built:", adminContext.length, "characters");

    // 5. Prepare system message.
    stage = "build-system-prompt";
    const systemPrompt =
      ADMIN_SYSTEM_PROMPT + "\n\n" + adminContext;
    console.info("[AdminAgent] System prompt size:", systemPrompt.length, "characters");

    // 6. Call LLM with conversation history.
    stage = "openrouter";

    // Sanitize history: max 20 messages, only user/assistant
    const sanitizedHistory = (input.history || [])
      .slice(-20)
      .filter((msg) => msg.role === "user" || msg.role === "assistant")
      .map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content.slice(0, 8000),
      }));

    const messages = [
      {
        role: "system" as const,
        content: systemPrompt,
      },
      ...sanitizedHistory,
      {
        role: "user" as const,
        content: input.query,
      },
    ];

    const response = await callOpenRouter(messages, {
      excludeReasoning: true,
    });
    console.info("[AdminAgent] OpenRouter response received:", response.length, "characters");

    // 7. Structured extraction placeholders.
    stage = "postprocess";
    const insights = parseInsights(response);
    const recommendations = parseRecommendations(response);
    const forecasts = parseForecasts(response);

    // 8. Report only sources actually available/used.
    stage = "sources-used";
    const sourcesUsed = determineSourcesUsed(
      input.context?.datasources,
      ga4Metrics,
      adsMetrics,
      agentMetrics,
    );

    stage = "data-freshness";
    const dataFreshness: Record<string, string> = {};

    if (ga4Metrics) {
      dataFreshness.ga4 = ga4Metrics.lastUpdated;
    }
    if (adsMetrics) {
      dataFreshness.googleAds = adsMetrics.lastUpdated;
    }
    if (agentMetrics) {
      dataFreshness.agentMetrics = agentMetrics.lastUpdated;
    }

    console.info("[AdminAgent] Query completed successfully");

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
      visualizations: undefined,
    };
  } catch (err) {
    console.error(
      `[AdminAgent][stage=${stage}]`,
      err instanceof Error ? err.message : "Unknown error",
      err instanceof Error ? err.stack : ""
    );
    throw err;
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

  try {
    const {
      getGA4Metrics,
      isGA4Configured,
    } = await import("../analytics/ga4.datasource");

    if (!isGA4Configured()) {
      console.warn(
        "[AdminAgent][GA4] GA4 datasource is not configured.",
      );
      return null;
    }

    return await getGA4Metrics();
  } catch (error) {
    console.error(
      "[AdminAgent][GA4 import/load error]",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

async function loadAdsMetricsSafely(
  datasources?: string[],
): Promise<CampaignsMetrics | null> {
  const hasExplicitDatasourceSelection =
    Array.isArray(datasources) && datasources.length > 0;

  const adsRequested =
    !hasExplicitDatasourceSelection ||
    datasources?.includes("ads") ||
    datasources?.includes("google_ads");

  if (!adsRequested) {
    return null;
  }

  try {
    const { getAdsMetrics, isAdsConfigured } = await import(
      "../analytics/ads.datasource"
    );

    if (!isAdsConfigured()) {
      console.warn("[AdminAgent][Ads] Ads datasource is not configured.");
      return null;
    }

    return await getAdsMetrics();
  } catch (error) {
    console.error(
      "[AdminAgent][Ads import/load error]",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

async function loadAgentMetricsSafely(
  datasources?: string[],
): Promise<AgentMetrics | null> {
  const hasExplicitDatasourceSelection =
    Array.isArray(datasources) && datasources.length > 0;

  const agentRequested =
    !hasExplicitDatasourceSelection ||
    datasources?.includes("agent") ||
    datasources?.includes("agent_metrics");

  if (!agentRequested) {
    return null;
  }

  try {
    const { getAgentMetrics, isAgentMetricsConfigured } = await import(
      "../analytics/agent-metrics.datasource"
    );

    if (!isAgentMetricsConfigured()) {
      console.warn("[AdminAgent][Agent] Agent metrics not configured.");
      return null;
    }

    return await getAgentMetrics("30daysAgo");
  } catch (error) {
    console.error(
      "[AdminAgent][Agent import/load error]",
      error instanceof Error ? error.message : error,
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
  adsMetrics?: CampaignsMetrics | null,
  agentMetrics?: AgentMetrics | null,
): string {
  const sections: string[] = [];

  const loadedSources: string[] = [];

  if (ga4Metrics) {
    loadedSources.push("Google Analytics 4");
  }
  if (adsMetrics && adsMetrics.totalSpend > 0) {
    loadedSources.push("Google Ads");
  }
  if (agentMetrics && agentMetrics.conversations.totalConversations > 0) {
    loadedSources.push("Agent Metrics");
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

  if (adsMetrics && adsMetrics.totalSpend > 0) {
    sections.push(buildAdsContext(adsMetrics));
  } else {
    sections.push(`
=== GOOGLE ADS ===

Google Ads no está disponible en esta consulta o no tiene datos vinculados.

No inventes:
- gasto en publicidad
- clics
- impresiones
- CPC
- campañas
- conversiones de Google Ads
`);
  }

  if (agentMetrics) {
    sections.push(buildAgentContext(agentMetrics));
  } else {
    sections.push(`
=== AGENT METRICS ===

Agent Metrics no está disponible en esta consulta.

No inventes:
- conversaciones del agente
- intents
- recomendaciones dadas
- contactos intentados
- métricas de interacción del agente
`);
  }

  sections.push(`
=== SUPABASE / MÉTRICAS COMERCIALES ===

La plataforma utiliza Supabase para datos operativos, pero este servicio
todavía no está inyectando esas métricas dentro de esta consulta del copiloto.

No presentes ventas, pedidos, leads o ingresos de Supabase como hechos
mientras esos datos no aparezcan en el contexto.

=== CAPACIDADES ACTUALES ===

Cuando las fuentes estén disponibles puedes:

GA4:
- analizar tráfico web y usuarios
- analizar sesiones y engagement
- identificar páginas y eventos populares

Google Ads:
- analizar gasto y eficiencia de campañas
- calcular CPC y ROAS
- identificar campañas mejor/peor desempeño

Agent Metrics:
- analizar interacción con el asistente
- medir conversiones y contactos del agente
- identificar intents populares

=== LIMITACIONES ===

No puedes:

- modificar campañas o presupuestos
- ejecutar acciones empresariales
- modificar Analytics o Google Ads
- realizar compras o enviar dinero
- inventar métricas ausentes

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
 * Build the observed Google Ads section.
 */
function buildAdsContext(adsMetrics: CampaignsMetrics): string {
  const topCampaigns =
    adsMetrics.campaigns.length > 0
      ? adsMetrics.campaigns
          .slice(0, 5)
          .map((campaign, index) => {
            const cpc = campaign.clicks > 0 ? campaign.spend / campaign.clicks : 0;
            return [
              `${index + 1}. ${campaign.name}`,
              `gasto=${formatNumber(campaign.spend)}`,
              `clics=${formatNumber(campaign.clicks)}`,
              `impresiones=${formatNumber(campaign.impressions)}`,
              `cpc=${formatNumber(cpc)}`,
            ].join(" | ");
          })
          .join("\n")
      : "Sin campañas disponibles.";

  return `
=== GOOGLE ADS — DATOS OBSERVADOS ===

Período: últimos 30 días

Gasto total:
${formatNumber(adsMetrics.totalSpend)}

Número de campañas:
${adsMetrics.campaigns.length}

=== TOP CAMPAÑAS ===

${topCampaigns}

Última consulta a Google Ads (vía GA4):
${adsMetrics.lastUpdated}
`;
}

/**
 * Build the observed Agent Metrics section.
 */
function buildAgentContext(agentMetrics: AgentMetrics): string {
  const convMetrics = agentMetrics.conversations;

  return `
=== AGENT METRICS — DATOS OBSERVADOS ===

Período: últimos 30 días

Conversaciones totales (aperturas):
${formatNumber(convMetrics.totalConversations)}

Mensajes promedio por conversación:
${formatNumber(convMetrics.avgMessagesPerConversation)}

Clics en recomendaciones:
${formatNumber(agentMetrics.recommendationClicks)}

Intentos de contacto:
${formatNumber(agentMetrics.contactAttempts)}

Tasa de conversación a contacto:
${formatPercent(convMetrics.conversionRate)}

Última consulta a Agent Metrics (vía GA4):
${agentMetrics.lastUpdated}
`;
}

/**
 * Determine which data sources were actually used.
 */
function determineSourcesUsed(
  datasources?: string[],
  ga4Metrics?: EngagementMetrics | null,
  adsMetrics?: CampaignsMetrics | null,
  agentMetrics?: AgentMetrics | null,
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

  if (adsMetrics && adsMetrics.totalSpend > 0) {
    used.push({
      source: "google_ads",
      updatedAt: adsMetrics.lastUpdated,
    });
  } else if (datasources?.includes("google_ads") || datasources?.includes("ads")) {
    used.push({
      source: "google_ads",
      updatedAt: "unavailable",
    });
  }

  if (agentMetrics) {
    used.push({
      source: "agent_metrics",
      updatedAt: agentMetrics.lastUpdated,
    });
  } else if (datasources?.includes("agent") || datasources?.includes("agent_metrics")) {
    used.push({
      source: "agent_metrics",
      updatedAt: "unavailable",
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