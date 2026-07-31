// Google Consent Mode v2 (client-only)
export const CONSENT_STORAGE_KEY = "ve_consent_v2";

export type ConsentChoice = "granted" | "denied";

const CATEGORIES = [
  "ad_storage",
  "analytics_storage",
  "ad_user_data",
  "ad_personalization",
] as const;

function ensureGtag() {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
  }
}

function consentPayload(value: ConsentChoice) {
  return CATEGORIES.reduce<Record<string, ConsentChoice>>((acc, key) => {
    acc[key] = value;
    return acc;
  }, {});
}

export function readStoredConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return raw === "granted" || raw === "denied" ? raw : null;
  } catch {
    return null;
  }
}

/**
 * Must run BEFORE GA4 / Google Ads / Meta Pixel load.
 * Defaults every category to denied, then replays a stored choice if any.
 */
export function initConsentMode() {
  if (typeof window === "undefined") return;
  ensureGtag();

  window.gtag!("consent", "default", {
    ...consentPayload("denied"),
    wait_for_update: 500,
  });

  const stored = readStoredConsent();
  if (stored) {
    window.gtag!("consent", "update", consentPayload(stored));
  }
}

export function setConsent(choice: ConsentChoice) {
  if (typeof window === "undefined") return;
  ensureGtag();
  window.gtag!("consent", "update", consentPayload(choice));
  window.dataLayer!.push({ event: "consent_update", consent_state: choice });
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    /* storage bloqueado: la página sigue funcionando */
  }
}

/** SHA-256 hex hash for Google Enhanced Conversions (never sends raw PII). */
export async function sha256Hex(value: string): Promise<string | null> {
  if (typeof window === "undefined" || !window.crypto?.subtle) return null;
  const normalized = value.trim().replace(/\s+/g, "");
  if (!normalized) return null;
  const bytes = new TextEncoder().encode(normalized);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Normalizes a phone to E.164-ish digits with a country prefix before hashing. */
export function normalizePhone(raw: string, defaultCountryCode = "57") {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (raw.trim().startsWith("+")) return `+${digits}`;
  if (digits.length > 10) return `+${digits}`;
  return `+${defaultCountryCode}${digits}`;
}

export async function setEnhancedConversionUserData(phone: string) {
  if (typeof window === "undefined") return;
  const hashed = await sha256Hex(normalizePhone(phone));
  if (!hashed) return;
  ensureGtag();
  window.gtag!("set", "user_data", { phone_number: hashed });
}
