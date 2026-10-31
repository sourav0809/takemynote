/**
 * The AI providers and models people can pick. Only fast, inexpensive models
 * that are good at everyday writing; the first model of each provider is its
 * default. Update the lists here and the whole app follows.
 */
export const AI_PROVIDER_IDS = ["openai", "google", "anthropic"] as const;

export type AiProviderId = (typeof AI_PROVIDER_IDS)[number];

export interface AiModelOption {
  id: string;
  label: string;
  /** One short line shown under the name in the model picker. */
  description: string;
}

export interface AiProviderInfo {
  id: AiProviderId;
  name: string;
  /** Where people create an API key. */
  keyUrl: string;
  /** Example shown in the empty key field. */
  keyPlaceholder: string;
  /** Keys from this provider start with this; used for a friendly hint only. */
  keyPrefix: string;
  models: AiModelOption[];
}

export const AI_PROVIDERS: Record<AiProviderId, AiProviderInfo> = {
  openai: {
    id: "openai",
    name: "OpenAI",
    keyUrl: "https://platform.openai.com/api-keys",
    keyPlaceholder: "sk-…",
    keyPrefix: "sk-",
    models: [
      { id: "gpt-5.4-mini", label: "GPT-5.4 mini", description: "Fast and smart. A great default" },
      { id: "gpt-5.4-nano", label: "GPT-5.4 nano", description: "Fastest and cheapest of the 5.4 family" },
      { id: "gpt-5-mini", label: "GPT-5 mini", description: "Balanced speed and quality" },
      { id: "gpt-5-nano", label: "GPT-5 nano", description: "Very low cost for quick edits" },
      { id: "gpt-4.1-mini", label: "GPT-4.1 mini", description: "Quick, no reasoning step" },
      { id: "gpt-4o-mini", label: "GPT-4o mini", description: "Older, lightest and cheapest" },
    ],
  },
  google: {
    id: "google",
    name: "Google",
    keyUrl: "https://aistudio.google.com/app/apikey",
    keyPlaceholder: "AIza…",
    keyPrefix: "AIza",
    models: [
      { id: "gemini-3.8-flash", label: "Gemini 3.8 Flash", description: "Fast and smart. A great default" },
      { id: "gemini-3.7-flash", label: "Gemini 3.7 Flash", description: "Fast, previous version" },
      { id: "gemini-3.5-flash", label: "Gemini 3.5 Flash", description: "Balanced speed and quality" },
      { id: "gemini-3.5-flash-lite", label: "Gemini 3.5 Flash-Lite", description: "Very low cost for quick edits" },
      { id: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash-Lite", description: "Lightweight and cheap" },
      { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", description: "Older, widely available" },
      { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash-Lite", description: "Lightest and cheapest" },
    ],
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    keyUrl: "https://console.anthropic.com/settings/keys",
    keyPlaceholder: "sk-ant-…",
    keyPrefix: "sk-ant-",
    models: [
      { id: "claude-haiku-5-5", label: "Claude Haiku 5.5", description: "Fast and affordable. A great default" },
      { id: "claude-sonnet-5-5", label: "Claude Sonnet 5.5", description: "Sharper writing, a bit slower" },
      { id: "claude-sonnet-5", label: "Claude Sonnet 5", description: "Strong writing, previous version" },
      { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", description: "Older, dependable" },
      { id: "claude-haiku-4-5", label: "Claude Haiku 4.5", description: "Older, lowest cost" },
    ],
  },
};

export const DEFAULT_AI_PROVIDER: AiProviderId = "openai";

export function isAiProviderId(value: unknown): value is AiProviderId {
  return typeof value === "string" && (AI_PROVIDER_IDS as readonly string[]).includes(value);
}

export function getDefaultModel(provider: AiProviderId): string {
  return AI_PROVIDERS[provider].models[0].id;
}

export function getModelOption(provider: AiProviderId, modelId: string): AiModelOption | undefined {
  return AI_PROVIDERS[provider].models.find((model) => model.id === modelId);
}
