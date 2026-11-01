import { readAiConfig, updateAiConfig } from "@/lib/ai/ai-config";
import { readPreferences } from "@/lib/data/preferences-storage";
import { updateStoredPreferences } from "@/hooks/use-preferences";
import type { SettingsInput } from "@/lib/sync/schemas";

/** next-themes' default storage key. */
const THEME_STORAGE_KEY = "theme";

type Theme = SettingsInput["preferences"]["theme"];

function readTheme(): Theme {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

/**
 * The settings that follow an account across devices. Screen-specific ones
 * (collapsed sidebars) and the AI key stay on this device.
 */
export function readLocalSettings(): SettingsInput {
  const preferences = readPreferences();
  const ai = readAiConfig();
  return {
    preferences: {
      layout: preferences.layout,
      writingPosition: preferences.writingPosition,
      sortBy: preferences.sortBy,
      textDirection: preferences.textDirection,
      scrollPastEnd: preferences.scrollPastEnd,
      theme: readTheme(),
    },
    onboardingCompleted: preferences.onboardingCompleted,
    ai: { provider: ai.provider, model: ai.model, instructions: ai.instructions },
  };
}

/** Stable string for "did the synced settings change?" checks. */
export function settingsFingerprint(settings: SettingsInput): string {
  return JSON.stringify(settings);
}

/** Applies settings from the account. The theme goes through next-themes (`setTheme`). */
export function applySettings(settings: SettingsInput, setTheme: (theme: Theme) => void): void {
  const { theme, ...preferences } = settings.preferences;
  updateStoredPreferences({ ...preferences, onboardingCompleted: settings.onboardingCompleted });
  updateAiConfig(settings.ai);
  setTheme(theme);
}
