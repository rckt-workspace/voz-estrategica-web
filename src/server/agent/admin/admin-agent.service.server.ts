import type {
  EngagementMetrics,
  CampaignsMetrics,
  AgentMetrics,
} from "./business-intelligence.types";

import type { ControlOverviewData } from "../../lib/control-overview-schema";

import { callOpenRouterDetailed } from "../llm/openrouter.provider.server";
import { ADMIN_SYSTEM_PROMPT } from "./admin-system.prompt.server";
import { validateAdminResponse, isValidationPassed, formatValidationErrors } from "./response-validator.server";

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
    // 1. Load all datasources in parallel
    stage = "load-datasources";
    const [businessOverview, ga4Metrics, adsMetrics, agentMetrics] =
      await Promise.all([
        loadBusinessOverviewSafely(input.context?.datasources),
        loadGA4MetricsSafely(input.context?.datasources),
        loadAdsMetricsSafely(input.context?.datasources),
        loadAgentMetricsSafely(input.context?.datasources),
      ]);

    console.info("[AdminAgent] Business overview loaded:", Boolean(businessOverview));
    console.info("[AdminAgent] GA4 loaded:", Boolean(ga4Metrics));
    console.info("[AdminAgent] Ads loaded:", Boolean(adsMetrics));
    console.info("[AdminAgent] Agent Metrics loaded:", Boolean(agentMetrics));

    // 2. Build grounded context using only data actually loaded.
    stage = "build-context";
    const adminContext = buildAdminContext(
      input.context,
      businessOverview,
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

    // Determine LLM configuration
    const adminLLMModel = process.env.ADMIN_LLM_MODEL;
    const primaryLLM = process.env.CHAT_PRIMARY_LLM || "openrouter/free";
    const effectiveModel = adminLLMModel || primaryLLM;

    if (effectiveModel === "openrouter/free") {
      console.warn(
        "[AdminAgent] ADMIN_LLM_MODEL not configured. Using fallback CHAT_PRIMARY_LLM. For production, set ADMIN_LLM_MODEL=<specific-model>",
      );
    }

    console.info("[AdminAgent] Model configured:", effectiveModel);

    const adminMaxTokens =
      parseInt(process.env.ADMIN_LLM_MAX_TOKENS || "1800") || 1800;

    const llmResult = await callOpenRouterDetailed(messages, {
      model: effectiveModel,
      maxTokens: adminMaxTokens,
      timeout: 45000,
      excludeReasoning: true,
    });

    console.info(
      "[AdminAgent] LLM response received:",
      `model=${llmResult.model}`,
      `finishReason=${llmResult.finishReason}`,
      `tokens=${llmResult.usage.totalTokens}`,
    );

    let finalResponse = llmResult.content;

    // Validate response for contradictions
    stage = "validate-response";
    const validation = validateAdminResponse(
      finalResponse,
      {
        businessOverview: !!businessOverview,
        ga4: !!ga4Metrics,
        ads: !!adsMetrics,
        agentMetrics: !!agentMetrics,
      },
      false, // currencyKnown = false (we don't have currencyCode yet)
    );

    if (!isValidationPassed(validation)) {
      console.warn(
        "[AdminAgent] Response validation: CORRECTION_REQUIRED",
        formatValidationErrors(validation.errors),
      );

      // Attempt correction pass (1x only)
      try {
        stage = "correction-pass";

        const correctionPrompt = `
Original response from Master Agent:

${finalResponse}

---

VALIDATION ERRORS DETECTED:
${validation.errors.map((e) => `- [${e.severity}] ${e.message}`).join("\n")}

---

DATA AVAILABILITY:
Supabase: ${businessOverview ? "AVAILABLE" : "UNAVAILABLE"}
GA4: ${ga4Metrics ? "AVAILABLE" : "UNAVAILABLE"}
Google Ads: ${adsMetrics ? "AVAILABLE" : "UNAVAILABLE"}
Agent Metrics: ${agentMetrics ? "AVAILABLE" : "UNAVAILABLE"}

---

CORRECTION INSTRUCTIONS:
1. Fix ONLY the contradictions detected above.
2. Do NOT invent new metrics or data.
3. Do NOT change observed numbers.
4. Do NOT add sources that don't exist.
5. Maintain executive tone.
6. Return ONLY the corrected response.
`;

        console.info("[AdminAgent] Attempting correction pass...");

        const correctionResult = await callOpenRouterDetailed(
          [
            {
              role: "system",
              content:
                "You are correcting a response from the Master Agent. Fix contradictions only. Keep the same structure and tone.",
            },
            {
              role: "user",
              content: correctionPrompt,
            },
          ],
          {
            model: effectiveModel,
            maxTokens: adminMaxTokens,
            timeout: 45000,
            excludeReasoning: true,
          },
        );

        // Revalidate corrected response
        const correctedValidation = validateAdminResponse(
          correctionResult.content,
          {
            businessOverview: !!businessOverview,
            ga4: !!ga4Metrics,
            ads: !!adsMetrics,
            agentMetrics: !!agentMetrics,
          },
          false,
        );

        if (isValidationPassed(correctedValidation)) {
          finalResponse = correctionResult.content;
          console.info("[AdminAgent] Corrected response validation: PASS");
        } else {
          // Corrected response still fails - use fallback
          console.warn(
            "[AdminAgent] Corrected response still has errors:",
            formatValidationErrors(correctedValidation.errors),
          );
          console.info("[AdminAgent] Using safe fallback response...");
          finalResponse = buildSafeExecutiveFallback(
            businessOverview,
            ga4Metrics,
            adsMetrics,
            agentMetrics,
          );
        }
      } catch (correctionError) {
        console.error(
          "[AdminAgent] Correction pass failed:",
          correctionError instanceof Error ? correctionError.message : "Unknown error",
        );
        console.info("[AdminAgent] Using safe fallback response...");
        finalResponse = buildSafeExecutiveFallback(
          businessOverview,
          ga4Metrics,
          adsMetrics,
          agentMetrics,
        );
      }
    } else {
      console.info("[AdminAgent] Response validation: PASS");
    }

    // 7. Structured extraction placeholders.
    stage = "postprocess";
    const insights = parseInsights(finalResponse);
    const recommendations = parseRecommendations(finalResponse);
    const forecasts = parseForecasts(finalResponse);

    // 8. Report only sources actually available/used.
    stage = "sources-used";
    const sourcesUsed = determineSourcesUsed(
      input.context?.datasources,
      businessOverview,
      ga4Metrics,
      adsMetrics,
      agentMetrics,
    );

    stage = "data-freshness";
    const dataFreshness: Record<string, string> = {};

    if (businessOverview) {
      dataFreshness.supabase = businessOverview.timestamp;
    }
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
      message: finalResponse,
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

    return await getAdsMetrics({
      startDate: "90daysAgo",
      endDate: "today",
    });
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
 * Load Business Overview from Supabase when available/requested.
 *
 * Behaviour:
 * - If no datasource list is provided, Business Overview loads by default when configured.
 * - If datasources are explicitly supplied, Business Overview loads only when
 *   "supabase", "business", or "overview" is requested.
 */
async function loadBusinessOverviewSafely(
  datasources?: string[],
): Promise<ControlOverviewData | null> {
  const hasExplicitDatasourceSelection =
    Array.isArray(datasources) && datasources.length > 0;

  const businessRequested =
    !hasExplicitDatasourceSelection ||
    datasources?.includes("supabase") ||
    datasources?.includes("business") ||
    datasources?.includes("overview");

  if (!businessRequested) {
    return null;
  }

  try {
    const {
      getBusinessOverview,
      isBusinessOverviewConfigured,
    } = await import("./business-overview.datasource.server");

    if (!isBusinessOverviewConfigured()) {
      console.warn(
        "[AdminAgent][Business Overview] Business overview datasource is not configured.",
      );
      return null;
    }

    return await getBusinessOverview();
  } catch (error) {
    console.error(
      "[AdminAgent][Business Overview import/load error]",
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
  businessOverview?: ControlOverviewData | null,
  ga4Metrics?: EngagementMetrics | null,
  adsMetrics?: CampaignsMetrics | null,
  agentMetrics?: AgentMetrics | null,
): string {
  const sections: string[] = [];

  const loadedSources: string[] = [];

  if (businessOverview) {
    loadedSources.push("Supabase / Operación");
  }
  if (ga4Metrics) {
    loadedSources.push("Google Analytics 4");
  }
  if (adsMetrics) {
    loadedSources.push("Google Ads");
  }
  if (agentMetrics) {
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

=== DISPONIBILIDAD DE DATOS (MATRIZ AUTORITATIVA) ===

Supabase / Operación: ${businessOverview ? "DISPONIBLE" : "NO DISPONIBLE"}
Google Analytics 4: ${ga4Metrics ? "DISPONIBLE" : "NO DISPONIBLE"}
Google Ads: ${adsMetrics ? "DISPONIBLE" : "NO DISPONIBLE"}
Agent Metrics: ${agentMetrics ? "DISPONIBLE" : "NO DISPONIBLE"}

NOTA CRÍTICA:
Si una fuente está marcada como DISPONIBLE, está PROHIBIDO decir que
"no está disponible", "no tenemos acceso", o "no está integrada".

El modelo debe usar esta matriz como fuente autoritative.

=== REGLAS DE VERACIDAD (INVARIANTES) ===

INVARIANTE 1:
Si "Supabase / Operación" = DISPONIBLE
  → PROHIBIDO decir: "Supabase no está integrado/disponible"
  → PROHIBIDO decir: "no tenemos datos operativos"
  → PROHIBIDO decir: "sin acceso a pedidos"
  → PROHIBIDO decir: "no hay información de solicitudes"

INVARIANTE 2:
Si "Google Analytics 4" = DISPONIBLE
  → PROHIBIDO decir: "GA4 no está disponible"
  → PROHIBIDO decir: "no tenemos tráfico web"
  → PROHIBIDO decir: "sin acceso a Google Analytics"

INVARIANTE 3:
Si "Google Ads" = DISPONIBLE
  → PROHIBIDO decir: "Google Ads no está disponible"
  → PROHIBIDO decir: "sin datos de campañas"

INVARIANTE 4:
Si "Agent Metrics" = DISPONIBLE
  Un valor CERO es un dato observado válido.
  → "0 conversaciones" = dato observado (asistente activo, sin actividad)
  → NO = "fuente no disponible"

INVARIANTE 5:
Semántica correcta:
  → Usar "campañas con datos observados en el período"
     (no "campañas activas" que no podemos confirmar)
  → Usar "pedidos registrados" (no automáticamente "ventas")
  → Usar "importe registrado" sin símbolo monetario (currencyCode=unknown)
  → Usar "importe aprobado" para ingresos validados

INVARIANTE 6:
Moneda:
  → currencyCode = UNKNOWN (no tenemos código oficial)
  → PROHIBIDO usar $, €, USD, COP automáticamente
  → Mostrar: "Costo registrado: 641,95" (sin símbolo)
  → SOLO usar símbolo si el usuario pregunta por una moneda específica

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

  if (businessOverview) {
    sections.push(buildBusinessOverviewContext(businessOverview));
  } else {
    sections.push(`
=== SUPABASE / OPERACIÓN ===

La fuente operativa no estuvo disponible en esta ejecución.

No inventes:
- solicitudes
- suscriptores
- pedidos
- ingresos
- speakers
- libros
- eventos
`);
  }

  if (adsMetrics) {
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
 * Build the Business Overview section from Supabase operational data.
 */
function buildBusinessOverviewContext(overview: ControlOverviewData): string {
  const kpis = overview.kpis;

  const buildMetricLine = (
    label: string,
    metric: { total: number | null; last7Days?: number | null; last30Days?: number | null } | null,
  ): string => {
    if (!metric || metric.total === null) {
      return `${label}: no disponible`;
    }

    const parts = [`${label}: ${formatNumber(metric.total)}`];
    if (metric.last7Days !== null && metric.last7Days !== undefined) {
      parts.push(`últimos 7 días: ${formatNumber(metric.last7Days)}`);
    }
    if (metric.last30Days !== null && metric.last30Days !== undefined) {
      parts.push(`últimos 30 días: ${formatNumber(metric.last30Days)}`);
    }

    return parts.join(" | ");
  };

  const pedidosStatus: string[] = [];
  if (kpis.pedidos?.aprobados !== null && kpis.pedidos?.aprobados !== undefined) {
    pedidosStatus.push(`aprobados: ${formatNumber(kpis.pedidos.aprobados)}`);
  }
  if (kpis.pedidos?.pendientes !== null && kpis.pedidos?.pendientes !== undefined) {
    pedidosStatus.push(`pendientes: ${formatNumber(kpis.pedidos.pendientes)}`);
  }
  if (kpis.pedidos?.rechazados !== null && kpis.pedidos?.rechazados !== undefined) {
    pedidosStatus.push(`rechazados: ${formatNumber(kpis.pedidos.rechazados)}`);
  }
  if (kpis.pedidos?.cancelados !== null && kpis.pedidos?.cancelados !== undefined) {
    pedidosStatus.push(`cancelados: ${formatNumber(kpis.pedidos.cancelados)}`);
  }

  const pedidosStatusStr =
    pedidosStatus.length > 0 ? pedidosStatus.join(" | ") : "sin detalles de estado";

  return `
=== SUPABASE / OPERACIÓN — DATOS OBSERVADOS ===

SOLICITUDES:
${buildMetricLine("Total", kpis.solicitudes)}

SUSCRIPTORES:
${buildMetricLine("Total", kpis.subscribers)}

PEDIDOS:
${buildMetricLine("Total", kpis.pedidos)}

Estados de pedidos:
${pedidosStatusStr}

REVENUE (Ingresos):
${
  kpis.revenue?.total !== null && kpis.revenue?.total !== undefined
    ? `Total registrado: ${formatNumber(kpis.revenue.total)}`
    : "no disponible"
}
${
  kpis.revenue?.aprobado !== null && kpis.revenue?.aprobado !== undefined
    ? ` | Aprobado: ${formatNumber(kpis.revenue.aprobado)}`
    : ""
}

SPEAKERS:
${buildMetricLine("Total", kpis.speakers)}

BOOKS (Libros):
${buildMetricLine("Total", kpis.books)}

EVENTS (Eventos):
${buildMetricLine("Total", kpis.events)}

Última actualización:
${overview.timestamp}
`;
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

Período: últimos 90 días

Gasto total:
${formatNumber(adsMetrics.totalSpend)}

Número de campañas:
${adsMetrics.campaigns.length}

=== TOP CAMPAÑAS ===

${topCampaigns}

Última consulta a Google Ads:
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
 *
 * IMPORTANT: A value of 0 is a valid observed data point.
 * Only exclude a source if it was truly unavailable (null/failed).
 */
function determineSourcesUsed(
  datasources?: string[],
  businessOverview?: ControlOverviewData | null,
  ga4Metrics?: EngagementMetrics | null,
  adsMetrics?: CampaignsMetrics | null,
  agentMetrics?: AgentMetrics | null,
): DataSourceRef[] {
  const used: DataSourceRef[] = [];

  if (businessOverview) {
    used.push({
      source: "supabase",
      updatedAt: businessOverview.timestamp,
    });
  } else if (
    datasources?.includes("supabase") ||
    datasources?.includes("business") ||
    datasources?.includes("overview")
  ) {
    used.push({
      source: "supabase",
      updatedAt: "unavailable",
    });
  }

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

  if (adsMetrics) {
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
 * Build a safe, deterministic fallback response using only observed data.
 * Used when LLM response fails validation and correction also fails.
 */
function buildSafeExecutiveFallback(
  businessOverview: ControlOverviewData | null,
  ga4Metrics: EngagementMetrics | null,
  adsMetrics: CampaignsMetrics | null,
  agentMetrics: AgentMetrics | null,
): string {
  const sections: string[] = [];

  sections.push("### Resumen ejecutivo\n");

  const sourcesLoaded: string[] = [];
  if (businessOverview) sourcesLoaded.push("Supabase");
  if (ga4Metrics) sourcesLoaded.push("Google Analytics");
  if (adsMetrics) sourcesLoaded.push("Google Ads");
  if (agentMetrics) sourcesLoaded.push("Agent Metrics");

  sections.push(
    `Se disponía de datos de: ${sourcesLoaded.join(", ")}.`,
  );
  sections.push(
    "A continuación se presentan los indicadores clave observados:\n",
  );

  sections.push("### Indicadores clave\n");

  const rows: string[] = ["| Área | Indicador | Valor |"];
  rows.push("|---|---|---|");

  if (businessOverview?.kpis.solicitudes) {
    rows.push(
      `| Operación | Solicitudes | ${formatNumber(businessOverview.kpis.solicitudes.total || 0)} |`,
    );
  }

  if (businessOverview?.kpis.pedidos) {
    rows.push(
      `| Operación | Pedidos | ${formatNumber(businessOverview.kpis.pedidos.total || 0)} |`,
    );
  }

  if (ga4Metrics) {
    rows.push(
      `| Web | Usuarios activos | ${formatNumber(ga4Metrics.traffic.uniqueUsers)} |`,
    );
    rows.push(
      `| Web | Sesiones | ${formatNumber(ga4Metrics.traffic.sessions)} |`,
    );
  }

  if (adsMetrics) {
    rows.push(
      `| Publicidad | Campañas | ${adsMetrics.campaigns.length} |`,
    );
    rows.push(
      `| Publicidad | Gasto | ${formatNumber(adsMetrics.totalSpend)} |`,
    );
  }

  if (agentMetrics) {
    rows.push(
      `| Agente | Conversaciones | ${formatNumber(agentMetrics.conversations.totalConversations)} |`,
    );
  }

  sections.push(rows.join("\n"));
  sections.push("");

  sections.push("### Lectura operativa\n");
  sections.push(
    "Los datos corresponden a las fuentes que fueron consultadas exitosamente.",
  );
  sections.push("Se presentan únicamente métricas observadas sin interpretación.\n");

  sections.push("### Próximos pasos\n");
  sections.push(
    "Para un análisis más detallado y recomendaciones estratégicas, consulte de nuevo al asistente.",
  );

  return sections.join("\n");
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