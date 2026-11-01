"use client";

import { useSyncExternalStore } from "react";

import { syncEngine, type SyncStatus } from "@/lib/sync/sync-engine";

const SERVER_STATUS: SyncStatus = { state: "disabled", pending: 0, lastSyncedAt: null, message: null };

/** Live sync status (disabled when signed out or accounts aren't configured). */
export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(syncEngine.subscribe, syncEngine.getStatus, () => SERVER_STATUS);
}
