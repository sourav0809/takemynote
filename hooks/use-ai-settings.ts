"use client";

import { useSyncExternalStore } from "react";

import {
  DEFAULT_AI_CONFIG,
  readAiConfig,
  subscribeToAiConfig,
  updateAiConfig,
  type AiConfig,
} from "@/lib/ai/ai-config";
import { readSavedKeyInfo, subscribeToSavedKey, type SavedKeyInfo } from "@/lib/ai/key-vault";

export interface AiSettings extends AiConfig {
  /** Provider and last characters of the saved key. Never the key itself. */
  savedKey: SavedKeyInfo | null;
  /** A key is saved for the selected provider, so AI features can run. */
  isReady: boolean;
  update: (changes: Partial<AiConfig>) => void;
}

// Snapshots must be stable between renders, so cache by the stored string.
let cachedKeyInfo: SavedKeyInfo | null = null;
let cachedKeySignature = "";

function getSavedKeySnapshot(): SavedKeyInfo | null {
  const info = readSavedKeyInfo();
  const signature = info ? `${info.provider}:${info.hint}` : "";
  if (signature !== cachedKeySignature) {
    cachedKeySignature = signature;
    cachedKeyInfo = info;
  }
  return cachedKeyInfo;
}

/** The saved AI provider, model, instructions and key status, kept in sync. */
export function useAiSettings(): AiSettings {
  const config = useSyncExternalStore(subscribeToAiConfig, readAiConfig, () => DEFAULT_AI_CONFIG);
  const savedKey = useSyncExternalStore(subscribeToSavedKey, getSavedKeySnapshot, () => null);

  return {
    ...config,
    savedKey,
    isReady: savedKey?.provider === config.provider,
    update: updateAiConfig,
  };
}
