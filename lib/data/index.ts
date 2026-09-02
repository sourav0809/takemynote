import { localStorageAdapter } from "@/lib/data/local-storage-adapter";
import type { DataAdapter } from "@/lib/data/data-adapter";

export const dataAdapter: DataAdapter = localStorageAdapter;
export type { DataAdapter } from "@/lib/data/data-adapter";
export { restoreFromBackup } from "@/lib/data/local-storage-adapter";
