import {
  ControlOverviewDataSchema,
  type ControlOverviewData,
} from "../../../lib/control-overview-schema";

/**
 * Check if Business Overview datasource is configured.
 *
 * Requires:
 * - SUPABASE_URL
 * - RCKT_INTERNAL_SECRET
 */
export function isBusinessOverviewConfigured(): boolean {
  const supabaseUrl = process.env.SUPABASE_URL;
  const internalSecret = process.env.RCKT_INTERNAL_SECRET;

  return !!(supabaseUrl && internalSecret);
}

/**
 * Fetch Business Overview from Supabase Edge Function.
 *
 * The Edge Function (control-overview) aggregates operational data
 * from Supabase and returns KPIs directly without wrapping in {success, data}.
 *
 * Returns validated ControlOverviewData or throws on error.
 */
export async function getBusinessOverview(): Promise<ControlOverviewData> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const internalSecret = process.env.RCKT_INTERNAL_SECRET;

  if (!supabaseUrl || !internalSecret) {
    throw new Error(
      "Business Overview not configured: missing SUPABASE_URL or RCKT_INTERNAL_SECRET"
    );
  }

  const url = `${supabaseUrl}/functions/v1/control-overview`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${internalSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(
        `Business Overview API returned ${response.status}: ${response.statusText}`
      );
    }

    const rawData = await response.json();

    // Validate against schema
    const parsed = ControlOverviewDataSchema.safeParse(rawData);

    if (!parsed.success) {
      console.error(
        "[BusinessOverview] Schema validation failed:",
        parsed.error
      );
      throw new Error(
        "Business Overview data validation failed: " + parsed.error.message
      );
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to fetch Business Overview: ${error.message}`
      );
    }
    throw error;
  }
}
