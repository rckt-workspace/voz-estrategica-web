import { BetaAnalyticsDataClient } from "@google-analytics/data";
import type { AgentMetrics } from "../admin/business-intelligence.types";

function getClient(): BetaAnalyticsDataClient {
  const clientEmail = process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_ANALYTICS_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (clientEmail && privateKey) {
    return new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    });
  }

  return new BetaAnalyticsDataClient();
}

function metricValue(values: Array<{ value?: string | null }> | null | undefined, index: number): number {
  const value = values?.[index]?.value;
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

const AGENT_EVENTS = [
  "agent_open",
  "agent_message",
  "agent_response",
  "agent_error",
  "agent_recommendation_click",
  "agent_contact_attempt",
];

export async function getAgentMetrics(period: string = "30daysAgo"): Promise<AgentMetrics> {
  const propertyId = process.env.GA4_PROPERTY_ID;

  if (!propertyId) {
    return {
      period,
      conversations: {
        totalConversations: 0,
        byIntent: {},
        byStage: {},
        conversionRate: 0,
        avgMessagesPerConversation: 0,
      },
      leadGeneration: 0,
      recommendationClicks: 0,
      contactAttempts: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    const client = getClient();
    const property = `properties/${propertyId}`;

    // Query all agent events in one go
    const eventsResult = await client.runReport({
      property,
      dateRanges: [
        {
          startDate: period,
          endDate: "today",
        },
      ],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: {
          inListFilter: {
            expressions: AGENT_EVENTS.map((e) => ({ value: e })),
            caseSensitive: true,
          },
        },
      },
    });

    const eventCounts: Record<string, number> = {};

    for (const row of eventsResult[0].rows ?? []) {
      const eventName = row.dimensionValues?.[0]?.value ?? "";
      const count = metricValue(row.metricValues, 0);
      eventCounts[eventName] = count;
    }

    const agentOpens = eventCounts["agent_open"] || 0;
    const agentMessages = eventCounts["agent_message"] || 0;
    const agentErrors = eventCounts["agent_error"] || 0;
    const recommendationClicks = eventCounts["agent_recommendation_click"] || 0;
    const contactAttempts = eventCounts["agent_contact_attempt"] || 0;

    // MVP Calculations:
    // - totalConversations: use agent_open as proxy
    // - avgMessagesPerConversation: agent_message / agent_open
    // - leadGeneration: agent_contact_attempt (MVP proxy for leads)
    const totalConversations = agentOpens;
    const avgMessagesPerConversation = agentOpens > 0 ? agentMessages / agentOpens : 0;

    return {
      period,
      conversations: {
        totalConversations,
        byIntent: {},
        byStage: {},
        conversionRate: agentOpens > 0 ? contactAttempts / agentOpens : 0,
        avgMessagesPerConversation,
      },
      leadGeneration: contactAttempts,
      recommendationClicks,
      contactAttempts,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[AgentMetrics] Error:", error instanceof Error ? error.message : "Unknown error");

    return {
      period,
      conversations: {
        totalConversations: 0,
        byIntent: {},
        byStage: {},
        conversionRate: 0,
        avgMessagesPerConversation: 0,
      },
      leadGeneration: 0,
      recommendationClicks: 0,
      contactAttempts: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export function isAgentMetricsConfigured(): boolean {
  // Check if GA4 is configured - that's sufficient for reading events
  const hasProperty = Boolean(process.env.GA4_PROPERTY_ID);
  const hasCredentials = Boolean(
    process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL && process.env.GOOGLE_ANALYTICS_PRIVATE_KEY,
  );
  const hasAppCredentials = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);

  return hasProperty && (hasCredentials || hasAppCredentials);
}
