"use client";

import { useSyncExternalStore } from "react";

interface PlatformModifierKeys {
  mod: string;
  alt: string;
}

const DEFAULT_KEYS: PlatformModifierKeys = { mod: "Ctrl", alt: "Alt" };
const MAC_KEYS: PlatformModifierKeys = { mod: "⌘", alt: "⌥" };

function subscribe(): () => void {
  return () => {};
}

function getClientSnapshot(): PlatformModifierKeys {
  return /Mac|iPhone|iPod|iPad/.test(navigator.userAgent) ? MAC_KEYS : DEFAULT_KEYS;
}

function getServerSnapshot(): PlatformModifierKeys {
  return DEFAULT_KEYS;
}

export function usePlatformModifierKeys(): PlatformModifierKeys {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
