// Soro SEO webhook receiver
// External webhook from Soro to receive blog post events
// Stores raw payloads in soro_webhook_events for later processing
// Authentication via SORO_WEBHOOK_SECRET (Edge Function env only, not frontend)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface WebhookResponse {
  status: number;
  ok?: boolean;
  duplicate?: boolean;
  error?: string;
  received_at?: string;
  payload_hash?: string;
}

function validateSecret(authHeader: string | null, soroSecretHeader: string | null): boolean {
  const secret = Deno.env.get("SORO_WEBHOOK_SECRET");
  if (!secret) {
    console.error("[soro-webhook] SORO_WEBHOOK_SECRET not configured");
    return false;
  }

  // Check Authorization: Bearer token
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match && match[1] === secret) {
      return true;
    }
  }

  // Check X-Soro-Secret header (optional fallback)
  if (soroSecretHeader && soroSecretHeader === secret) {
    return true;
  }

  return false;
}

async function calculateHash(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  // Only POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed", status: 405 }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  // Check Content-Type
  const contentType = req.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    console.warn("[soro-webhook] Invalid Content-Type:", contentType);
    const response: WebhookResponse = {
      status: 400,
      error: "Content-Type must be application/json",
    };
    return new Response(JSON.stringify(response), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  // Check body size
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
    console.warn("[soro-webhook] Payload too large:", contentLength);
    const response: WebhookResponse = {
      status: 400,
      error: "Payload exceeds maximum size of 10485760 bytes",
    };
    return new Response(JSON.stringify(response), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  // Validate secret from Authorization or X-Soro-Secret header
  const authHeader = req.headers.get("authorization");
  const soroSecretHeader = req.headers.get("x-soro-secret");

  if (!validateSecret(authHeader, soroSecretHeader)) {
    console.warn("[soro-webhook] Authentication failed");
    const response: WebhookResponse = {
      status: 401,
      error: "Unauthorized",
    };
    return new Response(JSON.stringify(response), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  // Parse JSON body
  let bodyText: string;
  try {
    bodyText = await req.text();
  } catch {
    console.warn("[soro-webhook] Failed to read body");
    const response: WebhookResponse = {
      status: 400,
      error: "Failed to read request body",
    };
    return new Response(JSON.stringify(response), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(bodyText) as Record<string, unknown>;
  } catch {
    console.warn("[soro-webhook] Invalid JSON");
    const response: WebhookResponse = {
      status: 400,
      error: "Invalid JSON payload",
    };
    return new Response(JSON.stringify(response), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  // Calculate hash for idempotency
  const payloadHash = await calculateHash(bodyText);
  const eventType = (payload.event_type as string | undefined) || null;
  const now = new Date().toISOString();

  // Create Supabase client with service role (backend-only credential)
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("[soro-webhook] Missing Supabase credentials");
    const response: WebhookResponse = {
      status: 500,
      error: "Internal server error",
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  // Insert webhook event directly (service role bypasses RLS)
  const { data: insertedEvent, error: insertError } = await supabase
    .from("soro_webhook_events")
    .insert({
      payload_hash: payloadHash,
      event_type: eventType,
      payload: payload,
      processed: false,
      received_at: now,
    })
    .select("id")
    .single();

  if (insertError) {
    // Handle duplicate: PostgreSQL unique constraint violation (23505)
    if (insertError.code === "23505") {
      console.info("[soro-webhook] Duplicate webhook received (payload_hash already exists)");
      const response: WebhookResponse = {
        status: 200,
        ok: true,
        duplicate: true,
        payload_hash: payloadHash,
      };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    console.error("[soro-webhook] Insert error:", insertError.message);
    const response: WebhookResponse = {
      status: 500,
      error: "Failed to store webhook",
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  if (!insertedEvent) {
    console.error("[soro-webhook] Insert returned no data");
    const response: WebhookResponse = {
      status: 500,
      error: "Internal server error",
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  console.info(
    `[soro-webhook] Webhook received (id: ${insertedEvent.id}, hash: ${payloadHash.substring(0, 8)}..., event_type: ${eventType || "null"})`
  );

  const response: WebhookResponse = {
    status: 200,
    ok: true,
    received_at: now,
    payload_hash: payloadHash,
  };
  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
});
