import { ViewTransition } from "react";

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * Cross-fades a route group in and out during client navigation
 * (e.g. landing → notes). Styles live under "Page transitions" in globals.css.
 */
export function PageTransition({ children }: PageTransitionProps) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      {children}
    </ViewTransition>
  );
}
