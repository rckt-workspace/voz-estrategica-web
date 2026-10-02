import { sign, verify, createPrivateKey, createPublicKey } from "crypto";

interface CachedToken {
  token: string;
  expiresAt: number;
}

let cachedTokenState: CachedToken | null = null;

function normalizePrivateKey(value: string): string {
  let key = value.trim();

  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }

  return key.replace(/\\n/g, "\n").replace(/\r\n/g, "\n").trim();
}

function base64UrlEncode(input: string | Buffer): string {
  const buffer =
    typeof input === "string" ? Buffer.from(input, "utf8") : input;

  return buffer
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getAccessToken(): Promise<string> {
  const clientEmailRaw = process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL?.trim();
  const privateKeyRaw = process.env.GOOGLE_ANALYTICS_PRIVATE_KEY;

  if (!clientEmailRaw || !privateKeyRaw) {
    throw new Error(
      "GOOGLE_ANALYTICS_CLIENT_EMAIL and GOOGLE_ANALYTICS_PRIVATE_KEY are required"
    );
  }

  const clientEmail = clientEmailRaw;
  const privateKey = normalizePrivateKey(privateKeyRaw);

  const hasBegin = privateKey.includes("-----BEGIN PRIVATE KEY-----");
  const hasEnd = privateKey.includes("-----END PRIVATE KEY-----");

  if (!hasBegin || !hasEnd) {
    throw new Error("Invalid private key format: missing PEM markers");
  }

  console.info("[GA4 OAuth] Credentials validation", {
    issuerConfigured: true,
    domain: clientEmail.endsWith(".iam.gserviceaccount.com"),
    keyNormalized: true,
  });

  const nowMs = Date.now();
  if (
    cachedTokenState &&
    cachedTokenState.expiresAt - nowMs > 60_000
  ) {
    console.info("[GA4 OAuth] Using cached token (valid for",
      Math.round((cachedTokenState.expiresAt - nowMs) / 1000), "seconds)");
    return cachedTokenState.token;
  }

  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${headerEncoded}.${payloadEncoded}`;

  const signingBuffer = Buffer.from(signingInput, "utf8");
  const signatureBuffer = sign("RSA-SHA256", signingBuffer, privateKey);
  const signatureEncoded = base64UrlEncode(signatureBuffer);
  const jwt = `${signingInput}.${signatureEncoded}`;

  try {
    const publicKey = createPublicKey({ key: privateKey, format: "pem" });
    const isValid = verify(
      "RSA-SHA256",
      signingBuffer,
      publicKey,
      signatureBuffer
    );

    if (!isValid) {
      throw new Error("JWT self-verification failed: signature invalid");
    }

    console.info("[GA4 OAuth] JWT self verification: PASS", {
      iat: payload.iat,
      exp: payload.exp,
      lifetimeSeconds: payload.exp - payload.iat,
    });
  } catch (error) {
    console.error("[GA4 OAuth] JWT self-verification failed");
    throw new Error(
      `JWT verification failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  const tokenBody = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: jwt,
  });

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: tokenBody.toString(),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text().catch(() => "Unknown error");
    console.error("[GA4 OAuth] Token exchange failed", {
      status: tokenResponse.status,
      errorLength: errorText.length,
    });
    throw new Error(
      `OAuth2 token request failed: ${tokenResponse.status} - ${errorText.substring(
        0,
        100
      )}`
    );
  }

  const tokenData = (await tokenResponse.json()) as {
    access_token: string;
    expires_in: number;
  };

  console.info("[GA4 OAuth] Token exchange: OK", {
    expiresIn: tokenData.expires_in,
  });

  cachedTokenState = {
    token: tokenData.access_token,
    expiresAt: Date.now() + tokenData.expires_in * 1000,
  };

  return tokenData.access_token;
}

interface GA4ReportRequest {
  property?: string;
  dateRanges?: Array<{ startDate: string; endDate: string }>;
  dimensions?: Array<{ name: string }>;
  metrics?: Array<{ name: string }>;
  orderBys?: Array<{
    metric?: { metricName: string };
    desc?: boolean;
  }>;
  limit?: number;
  dimensionFilter?: {
    filter?: {
      inListFilter?: {
        expressions: Array<{ value: string }>;
        caseSensitive?: boolean;
      };
    };
  };
}

interface GA4ReportResponse {
  rows?: Array<{
    dimensionValues?: Array<{ value?: string | null }>;
    metricValues?: Array<{ value?: string | null }>;
  }>;
}

export async function runGA4Report(
  requestBody: GA4ReportRequest
): Promise<GA4ReportResponse> {
  if (!requestBody.property) {
    throw new Error("property is required in request body");
  }

  const accessToken = await getAccessToken();
  const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;

  if (!GA4_PROPERTY_ID) {
    throw new Error("GA4_PROPERTY_ID is not configured");
  }

  const url = `https://analyticsdata.googleapis.com/v1beta/${requestBody.property}:runReport`;

  const reportResponse = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!reportResponse.ok) {
    const errorText = await reportResponse
      .text()
      .catch(() => "Unknown error");
    const sanitizedError =
      errorText.length > 200
        ? errorText.substring(0, 200) + "..."
        : errorText;
    throw new Error(
      `GA4 report request failed: ${reportResponse.status} - ${sanitizedError}`
    );
  }

  const response = (await reportResponse.json()) as GA4ReportResponse;
  return response;
}
