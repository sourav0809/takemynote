"use client";

import { useCallback } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";

export type AppTheme = "light" | "dark";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Applies the theme class synchronously so the view transition snapshots the new look. */
function applyThemeToDocument(theme: AppTheme): void {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

/**
 * Theme switching that cross-fades the whole page through the View Transitions
 * API. Falls back to an instant switch without support or with reduced motion.
 */
export function useThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const setThemeSmoothly = useCallback(
    async (nextTheme: AppTheme) => {
      const canAnimate =
        typeof document.startViewTransition === "function" &&
        !window.matchMedia(REDUCED_MOTION_QUERY).matches;

      if (!canAnimate) {
        setTheme(nextTheme);
        return;
      }

      const root = document.documentElement;
      root.dataset.themeTransition = "";
      const transition = document.startViewTransition(() => {
        applyThemeToDocument(nextTheme);
        flushSync(() => setTheme(nextTheme));
      });
      try {
        await transition.finished;
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
