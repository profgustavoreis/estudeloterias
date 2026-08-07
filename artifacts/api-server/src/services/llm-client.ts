/**
 * llm-client.ts — OpenAI-compatible client with a free→paid fallback chain.
 *
 * The OpenCode Zen gateway exposes two endpoints that share the same API key:
 *   - free tier   (LLM_BASE_URL,     default https://opencode.ai/zen/v1)     — models
 *     ending in `-free`; rate-limited with HTTP 429 `FreeUsageLimitError`.
 *   - paid tier   (LLM_GO_BASE_URL,  default https://opencode.ai/zen/go/v1)  — paid
 *     models; calling them on the free URL yields HTTP 401 `CreditsError`
 *     (zero Zen balance) and calling paid models here spends shared credits,
 *     so the chain only touches the paid tier AFTER a free candidate fails.
 *
 * Gateway error shape: `{ "error": { "type": "FreeUsageLimitError" | "CreditsError"
 * | "AuthError", "message": "..." } }` — classify by `body.error.type`, falling back
 * to the HTTP status.
 *
 * Reasoning rule (validated against the gateway): NEVER send `thinking` together
 * with `reasoning_effort` (400). When reasoning is ON, omit `temperature` (DeepSeek
 * ignores it anyway). `temperature` is only sent when reasoning is OFF. Valid
 * `reasoning_effort` values in the gateway: max|xhigh|high|medium|low|minimal|none.
 */

import { logger } from "../lib/logger";

/* ------------------------------------------------------------------ Types */

export type ThinkingLevel = "disabled" | "low" | "medium" | "high";

export interface LlmRequestParams {
  prompt: string;
  maxTokens: number;
  thinking: ThinkingLevel;
  temperature?: number;
  /** Default "json_object". */
  responseFormat?: "json_object" | "text";
}

export type LlmErrorKind =
  | "rate_limited" // 429 FreeUsageLimitError → advance candidate, no retry
  | "no_credits" // 401 CreditsError → endpoint flip 1x; then skip paid
  | "auth" // 401 AuthError → skip paid, heuristic fallback
  | "bad_payload" // 400 → degraded retry on same candidate, then advance
  | "server" // 5xx → retry with backoff
  | "timeout" // AbortError → retry with backoff
  | "network" // fetch TypeError → retry with backoff
  | "invalid_response"; // 200 without content / unparseable JSON → advance (no retry)

export interface LlmUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface LlmSuccess {
  ok: true;
  model: string;
  baseUrl: string;
  content: string;
  usage?: LlmUsage;
  costEstimateUsd?: number;
  attempts: number;
  candidatesTried: string[];
  latencyMs: number;
}

export interface LlmFailure {
  ok: false;
  kind: LlmErrorKind;
  reason: string;
  candidatesTried: string[];
  attempts: number;
  latencyMs: number;
}

/** Result of a single HTTP attempt (plus retry bookkeeping per candidate). */
interface AttemptResult {
  ok: boolean;
  content: string | null;
  usage?: LlmUsage;
  status?: number;
  errorType?: string;
  kind?: LlmErrorKind;
  latencyMs: number;
  attempts: number;
}

/* ----------------------------------------------------------- Constants */

export const DEFAULT_BASE_URL = "https://opencode.ai/zen/v1";
export const DEFAULT_GO_BASE_URL = "https://opencode.ai/zen/go/v1";
const DEFAULT_MODEL = "deepseek-v4-flash-free";
const DEFAULT_TIMEOUT_MS = 60000;
const DEFAULT_MAX_RETRIES = 1;
const DEFAULT_RETRY_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 4000;

/** USD per million tokens (models outside the table → undefined/0 cost). */
const PRICING_USD_PER_MTOK: Record<string, { in: number; out: number }> = {
  "deepseek-v4-flash": { in: 0.14, out: 0.28 },
  "deepseek-v4-pro": { in: 0.435, out: 0.87 },
  hy3: { in: 0.14, out: 0.58 },
};

interface ModelProfile {
  /** How to disable reasoning: `thinking` → `{thinking:{type:"disabled"}}`; `reasoning_none` → `reasoning_effort:"none"`. */
  disableVia: "thinking" | "reasoning_none";
  /** reasoning_effort levels this model actually accepts (clamp target). */
  effortAccepted: string[];
  /** Whether `temperature` may be sent when reasoning is off. */
  supportsTemperature: boolean;
}

const MODEL_PROFILES: Record<string, ModelProfile> = {
  "deepseek-v4-flash-free": {
    disableVia: "thinking",
    effortAccepted: ["low", "medium", "high"],
    supportsTemperature: true,
  },
  "deepseek-v4-flash": {
    disableVia: "thinking",
    effortAccepted: ["low", "high", "max"],
    supportsTemperature: true,
  },
  "deepseek-v4-pro": {
    disableVia: "thinking",
    effortAccepted: ["high", "max"],
    supportsTemperature: true,
  },
  // hy3 documents no temperature support → omit temperature entirely
  // (when reasoning is off it uses reasoning_effort:"none", which the gateway
  // accepts without temperature).
  hy3: {
    disableVia: "reasoning_none",
    effortAccepted: ["low", "high"],
    supportsTemperature: false,
  },
};

/** Toggle-only generic profile for unknown models. */
const FALLBACK_PROFILE: ModelProfile = {
  disableVia: "thinking",
  effortAccepted: ["high"],
  supportsTemperature: true,
};

/* ------------------------------------------------------- Chain resolution */

export interface LlmCandidate {
  model: string;
  /** Full URL including /chat/completions. */
  url: string;
  tier: "free" | "paid";
  endpointIsGo: boolean;
  profile: ModelProfile;
}

function parseEndpointOverrides(raw: string | undefined): Map<string, "free" | "go"> {
  const map = new Map<string, "free" | "go">();
  if (!raw) return map;
  for (const part of raw.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const sep = trimmed.indexOf(":");
    if (sep === -1) continue;
    const model = trimmed.slice(0, sep).trim();
    const endpoint = trimmed.slice(sep + 1).trim();
    if (!model) continue;
    if (endpoint === "go") map.set(model, "go");
    else if (endpoint === "free") map.set(model, "free");
  }
  return map;
}

/**
 * Resolve the fallback chain from env:
 * - `LLM_MODELS` (csv, in attempt order) else `LLM_MODEL` (single-model chain).
 * - Per-model endpoint: `LLM_MODEL_ENDPOINTS` override (`model:free|go`) else the
 *   suffix rule: `model.endsWith("-free")` → free base, otherwise → go base.
 * - If the base URL already ends with `/chat/completions` it is used as-is.
 */
export function resolveChainFromEnv(): LlmCandidate[] {
  const modelsRaw = (process.env.LLM_MODELS || "").trim();
  const models = modelsRaw
    ? modelsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [(process.env.LLM_MODEL || DEFAULT_MODEL).trim()];

  const baseFree = (process.env.LLM_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
  const baseGo = (process.env.LLM_GO_BASE_URL || DEFAULT_GO_BASE_URL).replace(/\/+$/, "");
  const overrides = parseEndpointOverrides(process.env.LLM_MODEL_ENDPOINTS);

  return models.map((model) => {
    const override = overrides.get(model);
    const isFreeModel = model.endsWith("-free");
    let base: string;
    let endpointIsGo: boolean;
    if (override === "go") {
      base = baseGo;
      endpointIsGo = true;
    } else if (override === "free") {
      base = baseFree;
      endpointIsGo = false;
    } else if (isFreeModel) {
      base = baseFree;
      endpointIsGo = false;
    } else {
      base = baseGo;
      endpointIsGo = true;
    }
    const url = base.endsWith("/chat/completions") ? base : `${base}/chat/completions`;
    return {
      model,
      url,
      tier: isFreeModel ? "free" : "paid",
      endpointIsGo,
      profile: MODEL_PROFILES[model] ?? FALLBACK_PROFILE,
    };
  });
}

/* ------------------------------------------------------- Params adaptation */

const EFFORT_ORDER: readonly string[] = ["minimal", "low", "medium", "high", "max", "xhigh"];

/**
 * Clamp the requested thinking level onto the model's accepted reasoning_effort
 * ladder, picking the nearest accepted level (preferring the lower one on ties):
 *   flash-free (low|medium|high): low→low, medium→medium, high→high
 *   flash paid (low|high|max):    medium→low (medium not accepted)
 *   pro (high|max):               low→high, medium→high
 *   hy3 (low|high):               medium→low
 */
function mapThinkingToEffort(
  thinking: Exclude<ThinkingLevel, "disabled">,
  accepted: string[],
): string {
  const desired = thinking;
  if (accepted.includes(desired)) return desired;
  const desiredIdx = EFFORT_ORDER.indexOf(desired);
  let best = accepted[0];
  let bestDist = Number.POSITIVE_INFINITY;
  let bestIdx = Number.POSITIVE_INFINITY;
  for (const level of accepted) {
    const idx = EFFORT_ORDER.indexOf(level);
    if (idx === -1) continue;
    const dist = Math.abs(idx - desiredIdx);
    if (dist < bestDist || (dist === bestDist && idx < bestIdx)) {
      best = level;
      bestDist = dist;
      bestIdx = idx;
    }
  }
  return best;
}

/**
 * Convert the abstract `thinking` level into the gateway body for a given model
 * profile. Reasoning ON: send `reasoning_effort` (clamped), NEVER `thinking`,
 * omit `temperature`. Reasoning OFF: send the profile-specific disable switch;
 * send `temperature` only when the profile supports it (default 0.7).
 */
export function adaptParams(
  profile: ModelProfile,
  params: LlmRequestParams,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    messages: [{ role: "user", content: params.prompt }],
    max_tokens: params.maxTokens,
    response_format: { type: params.responseFormat ?? "json_object" },
  };

  if (params.thinking === "disabled") {
    if (profile.disableVia === "thinking") {
      body.thinking = { type: "disabled" };
    } else {
      body.reasoning_effort = "none";
    }
    // Reasoning off: temperature/tone take effect again. Simplify per spec:
    // never send temperature for reasoning_none models (hy3) either.
    if (profile.disableVia === "thinking" && profile.supportsTemperature !== false) {
      body.temperature = params.temperature ?? 0.7;
    }
  } else {
    body.reasoning_effort = mapThinkingToEffort(params.thinking, profile.effortAccepted);
    // Reasoning on: DeepSeek ignores temperature; sending it alongside
    // reasoning_effort risks a 400 on some gateways — omit.
  }
  return body;
}

/* --------------------------------------------------------- Error mapping */

interface GatewayErrorBody {
  error?: { type?: string; message?: string };
}

export function classifyError(
  status: number,
  body: GatewayErrorBody | null | undefined,
  errorObj?: { type?: string } | null,
): LlmErrorKind {
  const type = errorObj?.type ?? body?.error?.type;
  if (status === 429) return "rate_limited";
  if (status === 401) return type === "CreditsError" ? "no_credits" : "auth";
  if (status === 400) return "bad_payload";
  return "server"; // 5xx and anything unexpected
}

/* ------------------------------------------------------------ HTTP attempt */

async function attemptOnce(
  candidate: LlmCandidate,
  body: Record<string, unknown>,
  timeoutMs: number,
): Promise<AttemptResult> {
  // Headers preserved from the previous ai-writer implementation.
  const apiKey = (process.env.LLM_API_KEY || "").trim() || "public";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    "User-Agent": "opencode/1.15.0",
    "x-opencode-client": "cli",
  };

  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(candidate.url, {
      method: "POST",
      headers,
      body: JSON.stringify({ model: candidate.model, ...body }),
      signal: controller.signal,
    });
    const latencyMs = Date.now() - start;

    if (!response.ok) {
      let errorBody: GatewayErrorBody | null = null;
      try {
        errorBody = (await response.json()) as GatewayErrorBody;
      } catch {
        /* non-JSON error body */
      }
      return {
        ok: false,
        content: null,
        status: response.status,
        errorType: errorBody?.error?.type,
        kind: classifyError(response.status, errorBody),
        latencyMs,
        attempts: 1,
      };
    }

    const data = (await response.json()) as any;
    const rawContent = data?.choices?.[0]?.message?.content;
    const usageData = data?.usage;
    return {
      ok: true,
      content: typeof rawContent === "string" && rawContent.length > 0 ? rawContent : null,
      usage: usageData
        ? {
            promptTokens: Number(usageData.prompt_tokens ?? 0),
            completionTokens: Number(usageData.completion_tokens ?? 0),
            totalTokens: Number(usageData.total_tokens ?? 0),
          }
        : undefined,
      status: response.status,
      latencyMs,
      attempts: 1,
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    const err = error as Error;
    if (err?.name === "AbortError") {
      return { ok: false, content: null, kind: "timeout", latencyMs, attempts: 1 };
    }
    return { ok: false, content: null, kind: "network", latencyMs, attempts: 1 };
  } finally {
    clearTimeout(timeoutId);
  }
}

function isRetryableKind(kind: LlmErrorKind | undefined): boolean {
  return kind === "server" || kind === "timeout" || kind === "network";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** delay = min(4000, base × 2^attempt) × rand(0.5, 1.5) */
function backoffDelay(baseMs: number, attempt: number): number {
  const capped = Math.min(MAX_BACKOFF_MS, baseMs * 2 ** attempt);
  return Math.round(capped * (0.5 + Math.random()));
}

/** Strip reasoning/temperature switches for a degraded retry on 400. */
function degradeBody(body: Record<string, unknown>): Record<string, unknown> {
  const copy: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (key === "thinking" || key === "reasoning_effort" || key === "temperature") continue;
    copy[key] = value;
  }
  return copy;
}

function readPositiveInt(raw: string | undefined, fallback: number): number {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

/**
 * Attempt a candidate with retries:
 * - retry (LLM_MAX_RETRIES, default 1) with jittered exponential backoff only
 *   for server | timeout | network;
 * - bad_payload (400) → one degraded retry on the SAME candidate (no
 *   reasoning/thinking/temperature) before the caller advances.
 */
async function attemptWithRetry(
  candidate: LlmCandidate,
  params: LlmRequestParams,
  timeoutMs: number,
): Promise<AttemptResult> {
  const maxRetries = readPositiveInt(process.env.LLM_MAX_RETRIES, DEFAULT_MAX_RETRIES);
  const backoffBase = readPositiveInt(
    process.env.LLM_RETRY_BACKOFF_MS,
    DEFAULT_RETRY_BACKOFF_MS,
  );
  const body = adaptParams(candidate.profile, params);
  let attempts = 0;

  const run = () => {
    attempts += 1;
    return attemptOnce(candidate, body, timeoutMs);
  };

  let result = await run();
  while (
    !result.ok &&
    isRetryableKind(result.kind) &&
    attempts <= maxRetries
  ) {
    await sleep(backoffDelay(backoffBase, attempts - 1));
    result = await run();
  }

  if (!result.ok && result.kind === "bad_payload") {
    logger.warn({ model: candidate.model }, "llm.bad_payload_degrade");
    const degraded = await attemptOnce(candidate, degradeBody(body), timeoutMs);
    attempts += 1;
    return { ...degraded, attempts };
  }

  return { ...result, attempts };
}

/* ------------------------------------------------------------- Cost & main */

function estimateCostUsd(model: string, usage: LlmUsage): number | undefined {
  const pricing = PRICING_USD_PER_MTOK[model];
  if (!pricing) return undefined;
  return (usage.promptTokens * pricing.in + usage.completionTokens * pricing.out) / 1e6;
}

/**
 * Run the fallback chain. Chain order = attempt order. Billing errors
 * (no_credits/auth) share the same key/account across paid models, so once one
 * occurs the remaining PAID candidates are skipped (free candidates still get a
 * chance). A paid candidate pointed at the free endpoint gets a one-shot flip
 * to the go endpoint on `no_credits` (401 CreditsError).
 */
export async function completeWithFallback(
  params: LlmRequestParams,
  isAcceptable: (content: string) => boolean,
): Promise<LlmSuccess | LlmFailure> {
  const candidates = resolveChainFromEnv();
  const timeoutMs = readPositiveInt(process.env.LLM_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);
  const start = Date.now();
  const candidatesTried: string[] = [];
  let totalAttempts = 0;
  let lastKind: LlmErrorKind = "server";
  let lastReason = "chain exhausted without an acceptable response";
  let skipPaid = false;

  const finishSuccess = (
    candidate: LlmCandidate,
    result: AttemptResult,
    content: string,
  ): LlmSuccess => {
    const usage = result.usage;
    const costEstimateUsd = usage ? estimateCostUsd(candidate.model, usage) : undefined;
    logger.info(
      {
        model: candidate.model,
        baseUrl: candidate.url,
        attempts: totalAttempts,
        latencyMs: Date.now() - start,
        costEstimateUsd,
      },
      "llm.chain_result",
    );
    return {
      ok: true,
      model: candidate.model,
      baseUrl: candidate.url,
      content,
      usage,
      costEstimateUsd,
      attempts: totalAttempts,
      candidatesTried,
      latencyMs: Date.now() - start,
    };
  };

  for (const candidate of candidates) {
    if (skipPaid && candidate.tier === "paid") {
      logger.warn({ model: candidate.model }, "llm.skip_paid_after_billing_error");
      continue;
    }
    candidatesTried.push(candidate.model);

    const result = await attemptWithRetry(candidate, params, timeoutMs);
    totalAttempts += result.attempts;

    if (result.ok) {
      const content = result.content ?? "";
      if (isAcceptable(content)) {
        return finishSuccess(candidate, result, content);
      }
      // 200 but empty/unparseable → advance without retry.
      lastKind = "invalid_response";
      lastReason = `${candidate.model} returned unparseable/empty content`;
      logger.warn({ model: candidate.model, status: result.status }, "llm.invalid_response");
      continue;
    }

    lastKind = result.kind ?? "server";
    lastReason = `${result.kind ?? "error"} from ${candidate.model}`;
    logger.warn(
      {
        model: candidate.model,
        kind: result.kind,
        status: result.status,
        errorType: result.errorType,
        attempts: result.attempts,
      },
      "llm.candidate_failed",
    );

    if (result.kind === "no_credits" || result.kind === "auth") {
      if (result.kind === "no_credits" && candidate.tier === "paid" && !candidate.endpointIsGo) {
        // Paid model forced onto the free URL → one-shot flip to the go endpoint.
        const goBase = (process.env.LLM_GO_BASE_URL || DEFAULT_GO_BASE_URL).replace(/\/+$/, "");
        const flipUrl = goBase.endsWith("/chat/completions")
          ? goBase
          : `${goBase}/chat/completions`;
        const flipCandidate: LlmCandidate = {
          ...candidate,
          url: flipUrl,
          endpointIsGo: true,
        };
        logger.warn({ model: candidate.model }, "llm.endpoint_flip");
        const flipResult = await attemptOnce(
          flipCandidate,
          adaptParams(flipCandidate.profile, params),
          timeoutMs,
        );
        totalAttempts += 1;
        if (flipResult.ok) {
          const content = flipResult.content ?? "";
          if (isAcceptable(content)) {
            return finishSuccess(flipCandidate, flipResult, content);
          }
          lastKind = "invalid_response";
          lastReason = `endpoint flip for ${candidate.model} returned unparseable content`;
          logger.warn({ model: candidate.model }, "llm.flip_invalid_response");
        } else {
          lastKind = flipResult.kind ?? "server";
          lastReason = `endpoint flip for ${candidate.model} failed (${flipResult.kind ?? "error"})`;
          logger.warn(
            { model: candidate.model, kind: flipResult.kind, status: flipResult.status },
            "llm.flip_failed",
          );
        }
      } else {
        logger.warn({ model: candidate.model, kind: result.kind }, "llm.billing_error");
      }
      // Remaining paid candidates share the same account/billing — skip them,
      // but keep giving free candidates a chance.
      skipPaid = true;
    }
    // rate_limited | bad_payload | server | timeout | network | invalid_response
    // → next candidate in the chain.
  }

  logger.warn({ candidatesTried, lastKind }, "llm.chain_exhausted");
  return {
    ok: false,
    kind: lastKind,
    reason: lastReason,
    candidatesTried,
    attempts: totalAttempts,
    latencyMs: Date.now() - start,
  };
}
