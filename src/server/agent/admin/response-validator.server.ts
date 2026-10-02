/**
 * Response Validator for Admin Agent
 * Detects contradictions and invalid claims about data availability
 */

import type { ControlOverviewData } from "../../lib/control-overview-schema";
import type { EngagementMetrics, CampaignsMetrics, AgentMetrics } from "./business-intelligence.types";

interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    type: "availability" | "currency" | "semantics";
    message: string;
    severity: "error" | "warning";
  }>;
}

/**
 * Validate Admin Agent response for contradictions and invalid claims
 */
export function validateAdminResponse(
  response: string,
  availability: {
    businessOverview: boolean;
    ga4: boolean;
    ads: boolean;
    agentMetrics: boolean;
  },
  currencyKnown: boolean,
): ValidationResult {
  const errors: ValidationResult["errors"] = [];

  // INVARIANT 1: Supabase availability
  if (availability.businessOverview) {
    const supabaseUnavailablePhrases = [
      "supabase no está disponible",
      "supabase no está integrado",
      "no tenemos acceso a pedidos",
      "no hay datos operativos",
      "sin acceso a supabase",
      "supabase no está conectad",
    ];

    for (const phrase of supabaseUnavailablePhrases) {
      if (response.toLowerCase().includes(phrase)) {
        errors.push({
          type: "availability",
          message: `Detected contradiction: "${phrase}" but Supabase is available`,
          severity: "error",
        });
      }
    }
  }

  // INVARIANT 2: GA4 availability
  if (availability.ga4) {
    const ga4UnavailablePhrases = [
      "ga4 no está disponible",
      "google analytics no está disponible",
      "no tenemos tráfico web",
      "sin acceso a google analytics",
      "analytics no está disponible",
    ];

    for (const phrase of ga4UnavailablePhrases) {
      if (response.toLowerCase().includes(phrase)) {
        errors.push({
          type: "availability",
          message: `Detected contradiction: "${phrase}" but GA4 is available`,
          severity: "error",
        });
      }
    }
  }

  // INVARIANT 3: Google Ads availability
  if (availability.ads) {
    const adsUnavailablePhrases = [
      "google ads no está disponible",
      "ads no está disponible",
      "no hay datos de campañas",
      "sin datos de publicidad",
      "google ads no está conectad",
    ];

    for (const phrase of adsUnavailablePhrases) {
      if (response.toLowerCase().includes(phrase)) {
        errors.push({
          type: "availability",
          message: `Detected contradiction: "${phrase}" but Google Ads is available`,
          severity: "error",
        });
      }
    }
  }

  // INVARIANT 4: Currency symbols without currencyCode
  if (!currencyKnown) {
    // Look for currency symbols associated with our metrics
    const currencyPatterns = [
      /\$\s*\d+[,\.]\d{2}/, // $641.95 or $641,95
      /€\s*\d+[,\.]\d{2}/, // €641.95
      /(?:USD|COP|EUR)\s*\d+[,\.]\d{2}/, // USD 641.95
    ];

    const contextKeywords = [
      "costo",
      "spend",
      "gasto",
      "importe",
      "ingresos",
      "revenue",
      "cpc",
      "precio",
    ];

    for (const pattern of currencyPatterns) {
      const matches = response.match(pattern);
      if (matches) {
        // Check if this is near business metrics
        const index = response.indexOf(matches[0]);
        const context = response.substring(Math.max(0, index - 100), index + 100);

        const hasBusinessContext = contextKeywords.some((keyword) =>
          context.toLowerCase().includes(keyword),
        );

        if (hasBusinessContext) {
          errors.push({
            type: "currency",
            message: `Found currency symbol "${matches[0]}" without confirmed currencyCode`,
            severity: "error",
          });
        }
      }
    }
  }

  // INVARIANT 5: Semantics - check for imprecise language
  const imprecisePhrasesWithSuggestions = [
    {
      phrase: "campañas activas",
      suggestion: "use 'campañas con datos observados en el período'",
      severity: "warning" as const,
    },
    {
      phrase: "ventas observadas",
      suggestion: "use 'pedidos registrados' instead",
      severity: "warning" as const,
    },
  ];

  for (const { phrase, suggestion, severity } of imprecisePhrasesWithSuggestions) {
    if (response.toLowerCase().includes(phrase.toLowerCase())) {
      errors.push({
        type: "semantics",
        message: `Imprecise language: "${phrase}" - ${suggestion}`,
        severity,
      });
    }
  }

  return {
    isValid: errors.length === 0 || errors.every((e) => e.severity === "warning"),
    errors,
  };
}

/**
 * Check if validation passed (no critical errors)
 */
export function isValidationPassed(result: ValidationResult): boolean {
  return result.errors.length === 0 || result.errors.every((e) => e.severity === "warning");
}

/**
 * Format validation errors for logging
 */
export function formatValidationErrors(errors: ValidationResult["errors"]): string {
  if (errors.length === 0) return "PASS";

  const critical = errors.filter((e) => e.severity === "error");
  const warnings = errors.filter((e) => e.severity === "warning");

  const lines: string[] = [];

  if (critical.length > 0) {
    lines.push(`CRITICAL (${critical.length}):`);
    critical.forEach((e) => lines.push(`  - ${e.message}`));
  }

  if (warnings.length > 0) {
    lines.push(`WARNINGS (${warnings.length}):`);
    warnings.forEach((e) => lines.push(`  - ${e.message}`));
  }

  return lines.join("\n");
}
