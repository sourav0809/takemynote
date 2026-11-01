"use client";

import { useCallback } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";

import { playThemeSwitchSound } from "@/lib/sound/theme-switch-sound";
import { runViewTransition } from "@/lib/view-transition";

export type AppTheme = "light" | "dark";

/** Applies the theme class synchronously so the view transition snapshots the new look. */
function applyThemeToDocument(theme: AppTheme): void {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

/**
 * Theme switching that cross-fades the whole page through the View Transitions
 * API. Falls back to an instant switch without support, with reduced motion,
 * or while the tab is hidden. Plays a soft chime.
 */
export function useThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const setThemeSmoothly = useCallback(
    async (nextTheme: AppTheme) => {
      playThemeSwitchSound(nextTheme);
      const root = document.documentElement;
      root.dataset.themeTransition = "";
      const transition = runViewTransition(() => {
        applyThemeToDocument(nextTheme);
        flushSync(() => setTheme(nextTheme));
      });
      try {
        await transition?.finished.catch(() => undefined);
      } finally {
        delete root.dataset.themeTransition;
      }
    },
    [setTheme]
  );

  const toggleTheme = useCallback(
    () => void setThemeSmoothly(isDark ? "light" : "dark"),
    [isDark, setThemeSmoothly]
  );

  return { isDark, setThemeSmoothly, toggleTheme };
}
