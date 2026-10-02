import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { IntegrationsHealthResponseSchema, type IntegrationsHealthResponse } from "@/lib/control-integrations-schema";
import { verifySession } from "@/lib/agent-server-boundaries";

/**
 * GET /api/control/integrations
 * Fetch health status of all integrations for Centro Maestro.
 * REQUIRES institutional admin session cookie.
 *
 * Performs parallel health checks for:
 * - Supabase / Lovable Cloud (via Edge Function)
 * - OpenRouter (LLM provider)
 * - Google Analytics 4 (analytics)
 * - Soro (blog)
 * - Google Ads (pending)
 * - Agent Metrics (pending)
 *
 * Never expose credentials to browser.
 */
export const Route = createFileRoute("/api/control/integrations")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          // 1. Verify admin session (institutional auth)
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

          // 2. Run health checks in parallel
          const { getIntegrationsHealth } = await import(
            "@/server/control/integrations-health.server"
          );
          const integrations = await getIntegrationsHealth();

          // 3. Build response
          const response: IntegrationsHealthResponse = {
            success: true,
            checkedAt: new Date().toISOString(),
            integrations,
          };

          // 4. Validate response schema
          const validated = IntegrationsHealthResponseSchema.safeParse(response);

          if (!validated.success) {
            console.error("[IntegrationsHealth] Invalid response schema:", validated.error);
            return new Response(
              JSON.stringify({ success: false, error: "Unable to load integrations health" }),
              {
                status: 500,
                headers: {
                  "Content-Type": "application/json",
                  "Cache-Control": "no-store",
                },
              },
            );
          }

          // 5. Return validated data
          return new Response(JSON.stringify(validated.data as IntegrationsHealthResponse), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          });
        } catch (error) {
          console.error(
            "[IntegrationsHealth] Error:",
            error instanceof Error ? error.message : "Unknown error",
          );

          return new Response(
            JSON.stringify({ success: false, error: "Unable to load integrations health" }),
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
