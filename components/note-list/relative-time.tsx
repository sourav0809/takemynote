"use client";

import { useSyncExternalStore } from "react";

import { formatRelativeDate } from "@/lib/note-utils";

interface RelativeTimeProps {
  isoDate: string;
}

function subscribe() {
  return () => {};
}

export function RelativeTime({ isoDate }: RelativeTimeProps) {
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  return <>{isClient ? formatRelativeDate(isoDate) : null}</>;
}
