const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Runs `update` inside a View Transition when it can animate, otherwise
 * straight away. Browsers refuse transitions while the tab is hidden and can
 * cancel one mid-way (e.g. the tab is switched); that's harmless, so those
 * rejections are absorbed instead of surfacing as uncaught errors. The update
 * always runs either way.
 */
export function runViewTransition(update: () => void): ViewTransition | null {
  const canAnimate =
    typeof document.startViewTransition === "function" &&
    document.visibilityState === "visible" &&
    !window.matchMedia(REDUCED_MOTION_QUERY).matches;

  if (!canAnimate) {
    update();
    return null;
  }

  const transition = document.startViewTransition(update);
  transition.ready.catch(() => undefined);
  transition.finished.catch(() => undefined);
  return transition;
}
