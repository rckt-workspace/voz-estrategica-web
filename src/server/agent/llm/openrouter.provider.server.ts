/**
 * OpenRouter LLM Provider
 * Server-side only. Never expose API key to client.
 * Supports streaming and non-streaming responses.
 */

const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface LLMRequest {
  model: string;
  messages: LLMMessage[];
  temperature: number;
  max_tokens: number;
  reasoning?: {
    type?: string;
    budget_tokens?: number;
    exclude?: boolean;
  };
}

interface LLMResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface LLMCallResult {
  content: string;
  model: string;
  finishReason: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Check if error is retryable.
 */
function isRetryableError(status?: number, error?: Error): boolean {
  if (!status && !error) return false;

  // Retryable HTTP statuses
  if (status === 429 || status >= 500) {
    return true;
  }

  // Retryable error types
  if (error) {
    if (error instanceof TypeError) {
      // Network errors
      if (
        error.message.includes("fetch") ||
        error.message.includes("network")
      ) {
        return true;
      }
    }
    if (error.name === "AbortError") {
      return true;
    }
  }

  return false;
}

/**
 * Call OpenRouter API for chat completion with full metadata (internal).
 * Includes retry for transient failures.
 * Requires OPENROUTER_API_KEY in process.env.
 */
async function callOpenRouterFull(
  messages: LLMMessage[],
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
    excludeReasoning?: boolean;
  },
): Promise<LLMCallResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY not configured. Set it in environment variables.",
    );
  }

  const model =
    options?.model || process.env.CHAT_PRIMARY_LLM || "openrouter/free";
  const temperature = options?.temperature ?? 0.2;
  const maxTokens = options?.maxTokens ?? 900;
  const timeout = options?.timeout ?? 30000;

  // Log configuration
  if (model === "openrouter/free") {
    console.warn(
      "[OpenRouter] Using dynamic model router (openrouter/free). Consider setting ADMIN_LLM_MODEL for production.",
    );
  }

  const request: LLMRequest = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  // Exclude reasoning from response if requested (for production admin agent)
  if (options?.excludeReasoning) {
    request.reasoning = { exclude: true };
  }

  let lastError: Error | null = null;
  const maxRetries = 1;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    try {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://vozestrategica.com",
          "X-Title": "Voz Estrategica",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[OpenRouter] API error (attempt ${attempt + 1}):`,
          response.status,
          errorText.slice(0, 200),
        );

        const isRetryable = isRetryableError(response.status);

        if (!isRetryable) {
          if (response.status === 401) {
            throw new Error("OPENROUTER_AUTH: Invalid API key");
          }
          if (response.status === 403) {
            throw new Error(
              "OPENROUTER_AUTH: Access forbidden. Check permissions.",
            );
          }
          if (response.status === 400) {
            throw new Error("OPENROUTER_UPSTREAM: Invalid request parameters");
          }
          throw new Error(
            `OPENROUTER_UPSTREAM: ${response.status} ${response.statusText}`,
          );
        }

        // Store error and retry
        lastError = new Error(
          response.status === 429
            ? "OPENROUTER_RATE_LIMIT"
            : "OPENROUTER_UPSTREAM",
        );

        if (attempt < maxRetries) {
          const backoffMs = 500 + Math.random() * 500;
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          continue;
        }

        throw lastError;
      }

      const data: LLMResponse = await response.json();

      if (
        !data.choices ||
        !data.choices[0] ||
        !data.choices[0].message?.content
      ) {
        throw new Error(
          "OPENROUTER_UPSTREAM: Invalid response structure from OpenRouter",
        );
      }

      console.info(
        "[OpenRouter] Success:",
        `model=${data.model}`,
        `finish_reason=${data.choices[0].finish_reason}`,
        `tokens=${data.usage.total_tokens}`,
      );

      return {
        content: data.choices[0].message.content,
        model: data.model,
        finishReason: data.choices[0].finish_reason,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      // Handle timeout specifically
      if (
        error instanceof TypeError &&
        error.message.includes("aborted")
      ) {
        error.message = "OPENROUTER_TIMEOUT";
      } else if (error.name === "AbortError") {
        error.message = "OPENROUTER_TIMEOUT";
      }

      lastError = error;

      // Check if retryable
      const isRetryable = isRetryableError(undefined, error);

      if (isRetryable && attempt < maxRetries) {
        console.warn(
          `[OpenRouter] Retrying (attempt ${attempt + 1}/${maxRetries}):`,
          error.message,
        );
        const backoffMs = 500 + Math.random() * 500;
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        continue;
      }

      throw error;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  // Should not reach here, but safety fallback
  throw lastError || new Error("OPENROUTER_UPSTREAM: Unknown error");
}

/**
 * Call OpenRouter API - Returns string for backward compatibility.
 * Used by public agent and other components expecting string response.
 */
export async function callOpenRouter(
  messages: LLMMessage[],
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
    excludeReasoning?: boolean;
  },
): Promise<string> {
  const result = await callOpenRouterFull(messages, options);
  return result.content;
}

/**
 * Call OpenRouter API - Returns full metadata.
 * Used by admin agent and components needing model/finishReason/usage info.
 */
export async function callOpenRouterDetailed(
  messages: LLMMessage[],
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
    excludeReasoning?: boolean;
  },
): Promise<LLMCallResult> {
  return callOpenRouterFull(messages, options);
}

/**
 * Verify OpenRouter is properly configured.
 * Useful for startup checks.
 */
export function isOpenRouterConfigured(): boolean {
  return !!process.env.OPENROUTER_API_KEY;
}

/**
 * Get current LLM model configuration.
 */
export function getLLMConfig() {
  return {
    model: process.env.CHAT_PRIMARY_LLM || "openrouter/free",
    temperature:
      parseFloat(process.env.CHAT_TEMPERATURE || "0.2") || 0.2,
    maxTokens: parseInt(process.env.CHAT_MAX_TOKENS || "900") || 900,
    baseUrl: OPENROUTER_BASE_URL,
    configured: isOpenRouterConfigured(),
  };
}
