import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { ToolLoopAgent, type LanguageModel } from "ai";

import { readAiConfig } from "@/lib/ai/ai-config";
import { AiNotConfiguredError } from "@/lib/ai/ai-errors";
import { loadApiKey } from "@/lib/ai/key-vault";
import { buildInstructions, buildTaskPrompt, type AiTask } from "@/lib/ai/prompts";
import type { AiProviderId } from "@/lib/ai/providers";

/** Enough for a long rewrite, including the thinking some models do first. */
const MAX_OUTPUT_TOKENS = 8_000;
const MAX_RETRIES = 1;

// The AI SDK logs provider warnings (e.g. an unsupported setting) to the console.
if (typeof globalThis !== "undefined") {
  (globalThis as { AI_SDK_LOG_WARNINGS?: boolean }).AI_SDK_LOG_WARNINGS = false;
}

/**
 * A model client that talks straight from the browser to the provider. The
 * key goes only to that provider; TakeMyNote has no server in between.
 */
function createModel(provider: AiProviderId, modelId: string, apiKey: string): LanguageModel {
  switch (provider) {
    case "openai":
      return createOpenAI({ apiKey })(modelId);
    case "google":
      return createGoogleGenerativeAI({ apiKey })(modelId);
    case "anthropic":
      // Anthropic asks browser apps to opt in explicitly; the key is the user's own.
      return createAnthropic({
        apiKey,
        headers: { "anthropic-dangerous-direct-browser-access": "true" },
      })(modelId);
  }
}

/** Settings every request shares. */
const SHARED_AGENT_SETTINGS = {
  // Ignored by models that don't reason; keeps the ones that do quick.
  providerOptions: { openai: { reasoningEffort: "low" } },
  // Errors reach the UI through the stream. Without this the SDK prints the
  // whole failed request to the console.
  onError: () => {},
} as const;

interface WritingAgentOptions {
  provider: AiProviderId;
  model: string;
  apiKey: string;
  instructions: string;
}

/**
 * The TakeMyNote writing agent: our locked rules plus the user's preferences.
 * It has no tools yet, so each request is a single streamed answer; tools
 * (e.g. "tidy these notes") can be added here later without touching the UI.
 */
function createWritingAgent({ provider, model, apiKey, instructions }: WritingAgentOptions) {
  return new ToolLoopAgent({
    model: createModel(provider, model, apiKey),
    instructions: buildInstructions(instructions),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    maxRetries: MAX_RETRIES,
    ...SHARED_AGENT_SETTINGS,
  });
}

async function runAgentStream(
  options: WritingAgentOptions,
  prompt: string,
  abortSignal?: AbortSignal
): Promise<AsyncIterable<string>> {
  const result = await createWritingAgent(options).stream({ prompt, abortSignal });

  return (async function* () {
    for await (const part of result.stream) {
      if (part.type === "text-delta") yield part.text;
      else if (part.type === "error") throw part.error;
    }
  })();
}

/**
 * Streams the answer to a task with the saved provider, model and key.
 * Throws AiNotConfiguredError when no usable key is saved.
 */
export async function streamWritingTask(
  task: AiTask,
  abortSignal?: AbortSignal
): Promise<AsyncIterable<string>> {
  const config = readAiConfig();
  const apiKey = await loadApiKey(config.provider);
  if (!apiKey) throw new AiNotConfiguredError();

  return runAgentStream({ ...config, apiKey }, buildTaskPrompt(task), abortSignal);
}

/**
 * Sends one tiny request to check a key before saving it. Throws the provider's
 * error (e.g. 401) when the key or model doesn't work.
 */
export async function verifyApiKey(provider: AiProviderId, model: string, apiKey: string): Promise<void> {
  const agent = new ToolLoopAgent({
    model: createModel(provider, model, apiKey),
    instructions: "Reply with the single word OK.",
    maxOutputTokens: 64,
    maxRetries: 0,
    ...SHARED_AGENT_SETTINGS,
  });
  const result = await agent.stream({ prompt: "Say OK." });
  for await (const part of result.stream) {
    if (part.type === "error") throw part.error;
  }
}
