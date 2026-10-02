/**
 * Response Sanitizer for Admin Agent
 * Detects and handles responses that expose internal reasoning
 * and performs corrective measures
 */

const REASONING_PATTERNS = [
  /^here's a thinking process/i,
  /^thinking process:/i,
  /^analyze user input:/i,
  /^identify available data:/i,
  /^let's think step by step/i,
  /^let's reason/i,
  /^i need to/i,
  /^step \d+:/i,
];

function containsReasoningPattern(text: string): boolean {
  const lines = text.split("\n").slice(0, 5); // Check first 5 lines
  return lines.some((line) => REASONING_PATTERNS.some((pattern) => pattern.test(line)));
}

/**
 * Sanitize admin agent response.
 * Detects responses that leak internal reasoning and handles them.
 * Returns the safe response to show to user.
 */
export async function sanitizeAdminAgentResponse(
  response: string,
  retryFn?: () => Promise<string>,
): Promise<string> {
  // Check if response contains reasoning patterns
  if (!containsReasoningPattern(response)) {
    return response;
  }

  console.warn(
    "[AdminAgent] Model returned reasoning-like content, attempting correction",
  );

  // If retry function provided, try once to get cleaner response
  if (retryFn) {
    try {
      const correctedResponse = await retryFn();
      if (!containsReasoningPattern(correctedResponse)) {
        console.info("[AdminAgent] Successfully corrected reasoning leakage on retry");
        return correctedResponse;
      }
    } catch (err) {
      console.warn(
        "[AdminAgent] Retry failed, using fallback",
        err instanceof Error ? err.message : "Unknown error",
      );
    }
  }

  // Fallback: return safe error message instead of exposing reasoning
  return (
    "No fue posible procesar tu consulta completamente. " +
    "Intenta reformular la pregunta o consulta de nuevo en unos momentos."
  );
}
