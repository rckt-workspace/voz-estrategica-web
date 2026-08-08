// GA4 helper (client-only)
// Supports both direct GA4 loading and GTM-managed mode

export const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || "G-2JN8WLT6LL";
const ANALYTICS_MODE = import.meta.env.VITE_ANALYTICS_MODE || "direct";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;

export function isDirectAnalyticsMode(): boolean {
  return ANALYTICS_MODE === "direct";
}

export function isAnalyticsEnabled(): boolean {
  return ANALYTICS_MODE !== "disabled";
}

/**
 * Initialize GA4 in direct mode (loads gtag.js script).
 * In GTM mode, the bootstrap script in __root.tsx already initialized dataLayer and gtag.
 * In disabled mode, does nothing.
 */
export function initGA4() {
  if (typeof window === "undefined" || initialized || !isAnalyticsEnabled()) return;
  initialized = true;

  // Ensure dataLayer exists (should already exist from bootstrap script)
  window.dataLayer = window.dataLayer || [];

  // Ensure gtag function exists (should already exist from bootstrap script)
  if (!window.gtag) {
    window.gtag = (...args: unknown[]) => {
      window.dataLayer!.push(args);
    };
  }

  // Only load GA4 script if in direct mode
  if (isDirectAnalyticsMode()) {
    window.gtag("js", new Date());
    window.gtag("config", GA4_MEASUREMENT_ID);

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }
}

export function trackGA4PageView() {
  if (typeof window === "undefined" || !isAnalyticsEnabled()) return;
  if (!window.gtag) return;

  // In direct mode, send page_view to GA4
  // In GTM mode, send virtual_page_view and let GTM transform it to page_view
  if (isDirectAnalyticsMode()) {
    window.gtag("event", "page_view", {
      page_location: window.location.href,
      page_path: window.location.pathname,
      page_title: document.title,
    });
  } else {
    // GTM mode: send to dataLayer as virtual_page_view
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "virtual_page_view",
      page_location: window.location.href,
      page_path: window.location.pathname,
      page_title: document.title,
    });
  }
}

export function trackGA4Event(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !isAnalyticsEnabled()) return;
  if (!window.gtag) return;

  // In both direct and GTM modes, events go to gtag which uses dataLayer
  window.gtag("event", eventName, params ?? {});
}
