import type { BackupPayload } from "@/lib/backup";
import { localStore } from "@/lib/data/local-storage-adapter";
import { writePreferences } from "@/lib/data/preferences-storage";
import { syncEngine } from "@/lib/sync/sync-engine";
import { queueChange } from "@/lib/sync/sync-storage";

/**
 * Restoring a backup while signed in: the backup's notes and categories are
 * added to (or update) the account instead of replacing it, so notes that
 * aren't in the backup are kept on every device.
 */
export async function mergeBackupIntoAccount(payload: BackupPayload): Promise<void> {
  const { normalizeNotesContent } = await import("@/lib/editor/note-content-converter");
  const notes = normalizeNotesContent(payload.notes);

  await localStore.applyRemoteChanges({
    upsertNotes: notes,
    removeNoteIds: [],
    upsertCategories: payload.categories,
    removeCategoryIds: [],
  });
  writePreferences(payload.preferences);
  payload.categories.forEach((category) => queueChange("category", category.id, "upsert"));
  notes.forEach((note) => queueChange("note", note.id, "upsert"));
  await syncEngine.syncNow();
}
