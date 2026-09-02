"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";

import {
  DEFAULT_PREFERENCES,
  readPreferences,
  writePreferences,
  type StoredPreferences,
} from "@/lib/data/preferences-storage";

interface Preferences extends StoredPreferences {
  setPreference: <K extends keyof StoredPreferences>(
    key: K,
    value: StoredPreferences[K]
  ) => void;
}

const PreferencesContext = createContext<Preferences | null>(null);

const listeners = new Set<() => void>();
let cachedSnapshot: StoredPreferences | null = null;

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): StoredPreferences {
  if (!cachedSnapshot) {
    cachedSnapshot = readPreferences();
  }
  return cachedSnapshot;
}

function getServerSnapshot(): StoredPreferences {
  return DEFAULT_PREFERENCES;
}

function commitPreferences(next: StoredPreferences): void {
  writePreferences(next);
  cachedSnapshot = next;
  listeners.forEach((listener) => listener());
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const values = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value = useMemo<Preferences>(
    () => ({
      ...values,
      setPreference: (key, val) => commitPreferences({ ...values, [key]: val }),
    }),
    [values]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): Preferences {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}
