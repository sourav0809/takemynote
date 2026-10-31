import { APICallError } from "ai";

import { AI_PROVIDERS, type AiProviderId } from "@/lib/ai/providers";

/** Thrown when an AI feature is used before a key is saved. */
export class AiNotConfiguredError extends Error {
  constructor() {
    super("AI is not set up yet.");
    this.name = "AiNotConfiguredError";
  }
}

export interface FriendlyAiError {
  message: string;
  /** The key or model is the problem, so offer to open AI settings. */
  needsSetup: boolean;
}

/** Retries wrap the real error; dig it out. */
function unwrap(error: unknown): unknown {
  if (error && typeof error === "object" && "lastError" in error) {
    return (error as { lastError: unknown }).lastError;
  }
  return error;
}

/**
 * Turns provider and network errors into short, human messages. Never echoes
 * request details, which could include the key.
 */
export function toFriendlyAiError(error: unknown, provider: AiProviderId): FriendlyAiError {
  const name = AI_PROVIDERS[provider].name;
  const cause = unwrap(error);

  if (cause instanceof AiNotConfiguredError) {
    return { message: "Add your AI key to use this.", needsSetup: true };
  }
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { message: "You’re offline. AI needs a connection; your notes still work.", needsSetup: false };
  }
  if (APICallError.isInstance(cause)) {
    switch (cause.statusCode) {
      case 400:
        return { message: `${name} couldn’t handle this request. Try a shorter piece of text.`, needsSetup: false };
      case 401:
      case 403:
        return { message: `That key didn’t work with ${name}. Check it in AI settings.`, needsSetup: true };
      case 404:
        return { message: `This model isn’t available on your ${name} account. Pick another one.`, needsSetup: true };
      case 429:
        return { message: `${name} says you’ve hit a limit or run out of credit. Try again in a moment.`, needsSetup: false };
      default:
        if (cause.statusCode && cause.statusCode >= 500) {
          return { message: `${name} is having trouble right now. Try again in a moment.`, needsSetup: false };
        }
    }
  }
  if (cause instanceof TypeError) {
    return { message: `Couldn’t reach ${name}. Check your connection and try again.`, needsSetup: false };
  }
  return { message: "Something went wrong. Try again.", needsSetup: false };
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
