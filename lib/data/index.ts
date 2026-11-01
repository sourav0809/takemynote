import { localStorageAdapter } from "@/lib/data/local-storage-adapter";
import type { DataAdapter } from "@/lib/data/data-adapter";
import { createSyncingDataAdapter } from "@/lib/sync/syncing-data-adapter";

/** Local-first: saved in the browser, and synced to the account when signed in. */
export const dataAdapter: DataAdapter = createSyncingDataAdapter(localStorageAdapter);
export type { DataAdapter } from "@/lib/data/data-adapter";
export { restoreFromBackup } from "@/lib/data/local-storage-adapter";
