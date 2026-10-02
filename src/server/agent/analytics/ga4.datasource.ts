import { runGA4Report } from "./ga4-rest-client.server";
import type { EngagementMetrics } from "../admin/business-intelligence.types";

function metricValue(
  values: Array<{ value?: string | null }> | null | undefined,
  index: number,
): number {
  const value = values?.[index]?.value;
  if (!value) return 0;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function getGA4Metrics(): Promise<EngagementMetrics> {
  const propertyId = process.env.GA4_PROPERTY_ID;

  if (!propertyId) {
    throw new Error("GA4_PROPERTY_ID is not configured");
  }

  const property = `properties/${propertyId}`;

  const [trafficResult, pagesResult, eventsResult] = await Promise.all([
    runGA4Report({
      property,
      dateRanges: [
        {
          startDate: "30daysAgo",
          endDate: "today",
        },
      ],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "engagedSessions" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
      ],
    }),

    runGA4Report({
      property,
      dateRanges: [
        {
          startDate: "30daysAgo",
          endDate: "today",
        },
      ],
      dimensions: [{ name: "pagePath" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "activeUsers" },
        { name: "userEngagementDuration" },
      ],
      orderBys: [
        {
          metric: {
            metricName: "screenPageViews",
          },
          desc: true,
        },
      ],
      limit: 10,
    }),

    runGA4Report({
      property,
      dateRanges: [
        {
          startDate: "30daysAgo",
          endDate: "today",
        },
      ],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      orderBys: [
        {
          metric: {
            metricName: "eventCount",
          },
          desc: true,
        },
      ],
      limit: 25,
    }),
  ]);

  const trafficRow = trafficResult.rows?.[0];

  const uniqueUsers = metricValue(trafficRow?.metricValues, 0);
  const sessions = metricValue(trafficRow?.metricValues, 1);
  const engagedSessions = metricValue(trafficRow?.metricValues, 2);
  const avgSessionDuration = metricValue(trafficRow?.metricValues, 3);

  // GA4 entrega bounceRate normalmente como decimal (ej. 0.42).
  const bounceRate = metricValue(trafficRow?.metricValues, 4) * 100;

  const topPages =
    pagesResult.rows?.map((row) => {
      const path = row.dimensionValues?.[0]?.value ?? "/";
      const pageViews = metricValue(row.metricValues, 0);
      const users = metricValue(row.metricValues, 1);
      const engagementDuration = metricValue(row.metricValues, 2);

      return {
        path,
        pageViews,
        uniqueUsers: users,
        avgTimeOnPage:
          pageViews > 0 ? engagementDuration / pageViews : 0,
      };
    }) ?? [];

  const events: Record<string, number> = {};

  for (const row of eventsResult.rows ?? []) {
    const eventName = row.dimensionValues?.[0]?.value;

    if (!eventName) continue;

    events[eventName] = metricValue(row.metricValues, 0);
  }

  return {
    traffic: {
      uniqueUsers,
      sessions,
      engagedSessions,
      avgSessionDuration,
      bounceRate,
    },
    topPages,
    events,
    lastUpdated: new Date().toISOString(),
  };
}

export function isGA4Configured(): boolean {
  const hasProperty = Boolean(process.env.GA4_PROPERTY_ID);
  const hasCredentials = Boolean(
    process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL &&
      process.env.GOOGLE_ANALYTICS_PRIVATE_KEY,
  );

  return hasProperty && hasCredentials;
}