import { BetaAnalyticsDataClient } from "@google-analytics/data";
import type { CampaignsMetrics, CampaignMetrics } from "../admin/business-intelligence.types";

export interface AdsMetricsOptions {
  startDate?: string;
  endDate?: string;
}

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

async function queryGoogleAdsCampaigns(
  client: BetaAnalyticsDataClient,
  property: string,
  startDate: string,
  endDate: string,
): Promise<{ campaigns: CampaignMetrics[]; totalSpend: number; totalClicks: number; totalImpressions: number }> {
  try {
    // Execute the proven query: sessionGoogleAdsCustomerId + sessionGoogleAdsCampaignName
    const campaignsResult = await client.runReport({
      property,
      dateRanges: [
        {
          startDate,
          endDate,
        },
      ],
      dimensions: [{ name: "sessionGoogleAdsCustomerId" }, { name: "sessionGoogleAdsCampaignName" }],
      metrics: [
        { name: "advertiserAdCost" },
        { name: "advertiserAdClicks" },
        { name: "advertiserAdImpressions" },
      ],
      orderBys: [
        {
          metric: { metricName: "advertiserAdCost" },
          desc: true,
        },
      ],
      limit: 50,
    });

    const campaigns: CampaignMetrics[] = [];
    let totalSpend = 0;
    let totalClicks = 0;
    let totalImpressions = 0;

    for (const row of campaignsResult[0].rows ?? []) {
      const accountId = row.dimensionValues?.[0]?.value ?? "";
      const campaignName = row.dimensionValues?.[1]?.value ?? "Unknown Campaign";
      const spend = metricValue(row.metricValues, 0);
      const clicks = metricValue(row.metricValues, 1);
      const impressions = metricValue(row.metricValues, 2);

      if (spend > 0 || clicks > 0 || impressions > 0) {
        campaigns.push({
          campaignId: accountId,
          name: campaignName,
          platform: "google_ads" as const,
          spend,
          impressions,
          clicks,
          conversions: 0,
          cpc: clicks > 0 ? spend / clicks : 0,
          cpa: 0,
        });

        totalSpend += spend;
        totalClicks += clicks;
        totalImpressions += impressions;
      }
    }

    return { campaigns, totalSpend, totalClicks, totalImpressions };
  } catch (error) {
    console.error("[AdsMetrics] Query campaigns error:", error instanceof Error ? error.message : "Unknown error");
    return { campaigns: [], totalSpend: 0, totalClicks: 0, totalImpressions: 0 };
  }
}

export async function getAdsMetrics(options: AdsMetricsOptions = {}): Promise<CampaignsMetrics> {
  const propertyId = process.env.GA4_PROPERTY_ID;

  if (!propertyId) {
    return {
      campaigns: [],
      totalSpend: 0,
      totalConversions: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  const startDate = options.startDate ?? "30daysAgo";
  const endDate = options.endDate ?? "today";

  try {
    const client = getClient();
    const property = `properties/${propertyId}`;

    // Use the proven query directly (don't rely on aggregate report)
    const { campaigns, totalSpend, totalClicks, totalImpressions } = await queryGoogleAdsCampaigns(
      client,
      property,
      startDate,
      endDate,
    );

    return {
      campaigns,
      totalSpend,
      totalConversions: 0,
      avgROAS: undefined,
      bestPerformer: campaigns.length > 0 ? campaigns[0] : undefined,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[AdsMetrics] Error:", error instanceof Error ? error.message : "Unknown error");

    return {
      campaigns: [],
      totalSpend: 0,
      totalConversions: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export function isAdsConfigured(): boolean {
  const hasProperty = Boolean(process.env.GA4_PROPERTY_ID);
  const hasCredentials = Boolean(
    process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL && process.env.GOOGLE_ANALYTICS_PRIVATE_KEY,
  );
  const hasAppCredentials = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);

  return hasProperty && (hasCredentials || hasAppCredentials);
}
