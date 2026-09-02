import { STORAGE_KEYS } from "@/lib/data/storage-keys";

export interface StoredPreferences {
  activeLineHighlight: boolean;
  scrollPastEnd: boolean;
  sortBy: "updated" | "created" | "title";
  textDirection: "ltr" | "rtl";
}

export const DEFAULT_PREFERENCES: StoredPreferences = {
  activeLineHighlight: true,
  scrollPastEnd: false,
  sortBy: "updated",
  textDirection: "ltr",
};

export function readPreferences(): StoredPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;

  const raw = window.localStorage.getItem(STORAGE_KEYS.preferences);
  if (!raw) return DEFAULT_PREFERENCES;

  try {
    return { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as Partial<StoredPreferences>) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function writePreferences(preferences: StoredPreferences): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(preferences));
}
