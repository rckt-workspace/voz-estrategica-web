import { runGA4Report } from "./ga4-rest-client.server";
import type { AgentMetrics } from "../admin/business-intelligence.types";

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
    const property = `properties/${propertyId}`;

    // Query all events, filter agent events in code
    const eventsResult = await runGA4Report({
      property,
      dateRanges: [
        {
          startDate: period,
          endDate: "today",
        },
      ],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
    });

    const eventCounts: Record<string, number> = {};

    for (const row of eventsResult.rows ?? []) {
      const eventName = row.dimensionValues?.[0]?.value ?? "";
      const count = metricValue(row.metricValues, 0);
      if (AGENT_EVENTS.includes(eventName)) {
        eventCounts[eventName] = count;
      }
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
    throw error;
  }
}

export function isAgentMetricsConfigured(): boolean {
  // Check if GA4 is configured - that's sufficient for reading events
  const hasProperty = Boolean(process.env.GA4_PROPERTY_ID);
  const hasCredentials = Boolean(
    process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL && process.env.GOOGLE_ANALYTICS_PRIVATE_KEY,
  );

  return hasProperty && hasCredentials;
}
