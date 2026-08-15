// Google Tag Manager integration
// Loads GTM with proper Consent Mode v2 bootstrap

const GTM_ID = import.meta.env.VITE_GTM_ID || "";
const ANALYTICS_MODE = import.meta.env.VITE_ANALYTICS_MODE || "direct";

export function isGTMEnabled(): boolean {
  return ANALYTICS_MODE === "gtm" && GTM_ID.startsWith("GTM-");
}

export function validateGTMId(id: string): boolean {
  return /^GTM-[A-Z0-9]{6,}$/.test(id);
}

/**
 * Returns the script to load GTM with Consent Mode v2.
 * Must be inserted AFTER the inline consent bootstrap script but BEFORE closing head.
 * TanStack wraps this in <script> tags automatically via head().scripts[].children
 * Includes the noscript fallback for browsers without JS (as HTML for dangerouslySetInnerHTML).
 */
export function getGTMScripts(): { head: string; body: string } {
  if (!isGTMEnabled()) {
    return { head: "", body: "" };
  }

  // GTM script for head (JavaScript ONLY — no <script> tags, TanStack adds them)
  const headScript = `(function(w,d,s,l,i){
  w[l]=w[l]||[];
  w[l].push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
  var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s), dl=l!=='dataLayer'?'&l='+l:'';
  j.async=true;
  j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
  f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`;

  // GTM noscript fallback for body (HTML, inserted with dangerouslySetInnerHTML)
  const bodyScript = `<noscript>
  <iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"
    height="0" width="0" style="display:none;visibility:hidden"></iframe>
</noscript>`;

  return { head: headScript, body: bodyScript };
}

/**
 * Returns the inline script that initializes Consent Mode v2 and dataLayer.
 * Must run BEFORE GTM loads so that consent is set before any tags fire.
 * TanStack wraps this in <script> tags automatically via head().scripts[].children
 * Returns JavaScript ONLY — no <script> tags.
 */
export function getConsentBootstrapScript(): string {
  return `window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
gtag.js = new Date();

// Set consent to denied by default (GDPR compliant)
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'analytics_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'wait_for_update': 500
});

// Check localStorage for stored consent decision
try {
  var stored = window.localStorage.getItem('ve_consent_v2');
  if (stored === 'granted' || stored === 'denied') {
    gtag('consent', 'update', {
      'ad_storage': stored,
      'analytics_storage': stored,
      'ad_user_data': stored,
      'ad_personalization': stored
    });
  }
} catch (e) {
  // localStorage may be blocked, that's ok
}`;
}
