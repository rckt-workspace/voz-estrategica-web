// Meta Pixel helper (client-only)
// Respects ad_storage consent, does not load if ID is missing

export const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || "4497186893935830";
const ANALYTICS_MODE = import.meta.env.VITE_ANALYTICS_MODE || "direct";

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[] };
    _fbq?: unknown;
  }
}

let initialized = false;

export function isMetaPixelEnabled(): boolean {
  if (ANALYTICS_MODE === "disabled") return false;
  if (!META_PIXEL_ID) return false;
  return true;
}

/**
 * Initialize Meta Pixel only if enabled and ad_storage consent is granted.
 * In GTM mode, Meta Pixel conversions should be configured within GTM instead.
 */
export function initMetaPixel() {
  if (typeof window === "undefined" || initialized || !isMetaPixelEnabled()) return;
  initialized = true;

  // If in GTM mode, don't load Meta Pixel directly (configure it in GTM instead)
  if (ANALYTICS_MODE === "gtm") {
    return;
  }

  /* eslint-disable */
  // @ts-ignore - standard Meta Pixel bootstrap
  !(function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */

  window.fbq?.("init", META_PIXEL_ID);
  window.fbq?.("track", "PageView");
}

export function trackPageView() {
  if (typeof window === "undefined" || !isMetaPixelEnabled()) return;
  window.fbq?.("track", "PageView");
}

export function trackEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !isMetaPixelEnabled()) return;
  if (params) window.fbq?.("track", event, params);
  else window.fbq?.("track", event);
}
