import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { verifySession } from "@/lib/agent-server-boundaries";
import { z } from "zod";

async function loadGA4Safe() {
  try {
    const { getGA4Metrics, isGA4Configured } = await import(
      "@/server/agent/analytics/ga4.datasource"
    );

    if (!isGA4Configured()) {
      return null;
    }

    return await getGA4Metrics();
  } catch (error) {
    console.error(
      "[ControlAnalytics][GA4 import/load error]",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

async function loadAdsSafe() {
  try {
    const { getAdsMetrics, isAdsConfigured } = await import(
      "@/server/agent/analytics/ads.datasource"
    );

    if (!isAdsConfigured()) {
      return null;
    }

    return await getAdsMetrics({ startDate: "90daysAgo", endDate: "today" });
  } catch (error) {
    console.error(
      "[ControlAnalytics][Ads import/load error]",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

async function loadAgentMetricsSafe() {
  try {
    const { getAgentMetrics, isAgentMetricsConfigured } = await import(
      "@/server/agent/analytics/agent-metrics.datasource"
    );

    if (!isAgentMetricsConfigured()) {
      return null;
    }

    return await getAgentMetrics("30daysAgo");
  } catch (error) {
    console.error(
      "[ControlAnalytics][AgentMetrics import/load error]",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

/**
 * GET /api/control/analytics
 * Fetch real analytics data (GA4, Google Ads, Agent Metrics).
 * REQUIRES institutional admin session cookie.
 */
export const Route = createFileRoute("/api/control/analytics")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          // 1. Verify admin session
          const cookieHeader = request.headers.get("Cookie");
          const isAuthenticated = await verifySession(cookieHeader);

          if (!isAuthenticated) {
            return new Response(
              JSON.stringify({ success: false, error: "Unauthorized" }),
              {
                status: 401,
                headers: {
                  "Content-Type": "application/json",
                  "Cache-Control": "no-store",
                },
              },
            );
          }

          // 2. Load analytics data in parallel with independent error handling
          const [ga4Data, adsData, agentData] = await Promise.all([
            loadGA4Safe(),
            loadAdsSafe(),
            loadAgentMetricsSafe(),
          ]);

          // 3. Build response
          const response = {
            success: true,
            checkedAt: new Date().toISOString(),
            ga4: ga4Data
              ? {
                  available: true,
                  traffic: ga4Data.traffic,
                  topPages: ga4Data.topPages.slice(0, 5),
                  lastUpdated: ga4Data.lastUpdated,
                }
              : { available: false },
            ads: adsData
              ? {
                  available: true,
                  campaigns: adsData.campaigns,
                  totalSpend: adsData.totalSpend,
                  lastUpdated: adsData.lastUpdated,
                }
              : { available: false },
            agent: agentData
              ? {
                  available: true,
                  conversations: agentData.conversations,
                  recommendationClicks: agentData.recommendationClicks,
                  contactAttempts: agentData.contactAttempts,
                  lastUpdated: agentData.lastUpdated,
                }
              : { available: false },
          };

          // 4. Return
          return new Response(JSON.stringify(response), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          });
        } catch (error) {
          console.error(
            "[ControlAnalytics] Unexpected error:",
            error instanceof Error ? error.message : "Unknown error",
          );

          return new Response(
            JSON.stringify({ success: false, error: "Unable to load analytics" }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store",
              },
            },
          );
        }
      },
    },
  },
});
