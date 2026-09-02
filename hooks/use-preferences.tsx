"use client";

import { createContext, useContext, useMemo, useState } from "react";

interface Preferences {
  activeLineHighlight: boolean;
  scrollPastEnd: boolean;
  sortBy: "updated" | "created" | "title";
  textDirection: "ltr" | "rtl";
  setPreference: <K extends keyof PreferenceValues>(
    key: K,
    value: PreferenceValues[K]
  ) => void;
}

type PreferenceValues = Pick<
  Preferences,
  "activeLineHighlight" | "scrollPastEnd" | "sortBy" | "textDirection"
>;

const PreferencesContext = createContext<Preferences | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [values, setValues] = useState<PreferenceValues>({
    activeLineHighlight: true,
    scrollPastEnd: false,
    sortBy: "updated",
    textDirection: "ltr",
  });

  const value = useMemo<Preferences>(
    () => ({
      ...values,
      setPreference: (key, val) =>
        setValues((prev) => ({ ...prev, [key]: val })),
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
