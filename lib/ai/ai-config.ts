import {
  DEFAULT_AI_PROVIDER,
  getDefaultModel,
  getModelOption,
  isAiProviderId,
  type AiProviderId,
} from "@/lib/ai/providers";
import { DEFAULT_INSTRUCTIONS, MAX_INSTRUCTIONS_CHARS } from "@/lib/ai/prompts";
import { STORAGE_KEYS } from "@/lib/data/storage-keys";

/** AI settings that are safe to keep in plain localStorage. The key is not here. */
export interface AiConfig {
  provider: AiProviderId;
  model: string;
  /** The user's "Additional instructions" (writing style, tone, language). */
  instructions: string;
}

export const DEFAULT_AI_CONFIG: AiConfig = {
  provider: DEFAULT_AI_PROVIDER,
  model: getDefaultModel(DEFAULT_AI_PROVIDER),
  instructions: DEFAULT_INSTRUCTIONS,
};

const listeners = new Set<() => void>();
let cachedConfig: AiConfig | null = null;

/** Fills gaps and drops models that are no longer offered. */
function normalize(value: Partial<AiConfig>): AiConfig {
  const provider = isAiProviderId(value.provider) ? value.provider : DEFAULT_AI_CONFIG.provider;
  const model =
    typeof value.model === "string" && getModelOption(provider, value.model)
      ? value.model
      : getDefaultModel(provider);
  const instructions =
    typeof value.instructions === "string"
      ? value.instructions.slice(0, MAX_INSTRUCTIONS_CHARS)
      : DEFAULT_INSTRUCTIONS;
  return { provider, model, instructions };
}

export function readAiConfig(): AiConfig {
  if (typeof window === "undefined") return DEFAULT_AI_CONFIG;
  if (cachedConfig) return cachedConfig;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.aiConfig);
    cachedConfig = raw ? normalize(JSON.parse(raw) as Partial<AiConfig>) : DEFAULT_AI_CONFIG;
  } catch {
    cachedConfig = DEFAULT_AI_CONFIG;
  }
  return cachedConfig;
}

export function updateAiConfig(changes: Partial<AiConfig>): void {
  const next = normalize({ ...readAiConfig(), ...changes });
  window.localStorage.setItem(STORAGE_KEYS.aiConfig, JSON.stringify(next));
  cachedConfig = next;
  listeners.forEach((listener) => listener());
}

export function subscribeToAiConfig(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEYS.aiConfig) return;
    cachedConfig = null;
    listeners.forEach((listener) => listener());
  });
}
