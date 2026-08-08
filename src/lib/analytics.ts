// Unified analytics layer supporting both direct GA4 and GTM modes
// Type-safe event tracking with proper parameter validation

import { isDirectAnalyticsMode, isAnalyticsEnabled } from "@/lib/ga4";

function getPushFunction(): (obj: Record<string, unknown>) => void {
  if (typeof window === "undefined") return () => {};

  window.dataLayer = window.dataLayer || [];

  return (obj: Record<string, unknown>) => {
    window.dataLayer!.push(obj);
  };
}

function sendEvent(eventName: string, params?: Record<string, unknown>) {
  if (!isAnalyticsEnabled()) return;

  if (isDirectAnalyticsMode()) {
    // Direct GA4 mode: use gtag function
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, params ?? {});
    }
  } else {
    // GTM mode: push to dataLayer
    const push = getPushFunction();
    push({
      event: eventName,
      ...params,
    });
  }
}

export function trackPageView() {
  if (typeof window === "undefined" || !isAnalyticsEnabled()) return;

  if (isDirectAnalyticsMode()) {
    if (window.gtag) {
      window.gtag("event", "page_view", {
        page_location: window.location.href,
        page_path: window.location.pathname,
        page_title: document.title,
      });
    }
  } else {
    // GTM mode: send virtual_page_view for GTM to transform
    const push = getPushFunction();
    push({
      event: "virtual_page_view",
      page_location: window.location.href,
      page_path: window.location.pathname,
      page_title: document.title,
    });
  }
}

/**
 * Generate Lead event
 * Fired when user submits a contact form or lead form.
 */
export function trackGenerateLead(params: {
  form_name: string;
  source?: string;
  placement?: string;
  lead_id?: string;
}) {
  sendEvent("generate_lead", params);
}

/**
 * WhatsApp Contact event
 * Fired when user initiates WhatsApp contact.
 */
export function trackWhatsAppContact(params: {
  source?: string;
  placement?: string;
  page_path?: string;
}) {
  sendEvent("contact_whatsapp", {
    method: "whatsapp",
    ...params,
  });
}

/**
 * Begin Checkout event
 * Fired when user starts the checkout process.
 */
export function trackBeginCheckout(params: {
  currency: string;
  value: number;
  items?: Array<{
    item_id?: string;
    item_name?: string;
    price?: number;
    quantity?: number;
  }>;
  order_id?: string;
}) {
  sendEvent("begin_checkout", params);
}

/**
 * Purchase event
 * Fired when payment is confirmed on server side.
 * IMPORTANT: Must have a transaction_id for Google Ads conversion tracking.
 */
export function trackPurchase(params: {
  transaction_id: string;
  currency: string;
  value: number;
  items?: Array<{
    item_id?: string;
    item_name?: string;
    price?: number;
    quantity?: number;
  }>;
  event_id?: string;
}) {
  if (!params.transaction_id) {
    console.warn("trackPurchase: transaction_id is required for proper conversion tracking");
  }
  sendEvent("purchase", params);
}

/**
 * Generic event tracking
 * Backward compatible with existing trackGA4Event calls.
 */
export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  sendEvent(eventName, params);
}
