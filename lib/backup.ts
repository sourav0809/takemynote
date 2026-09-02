import { CURRENT_SCHEMA_VERSION } from "@/lib/data/storage-keys";
import { downloadNoteAsMarkdown } from "@/lib/download-note";
import { DEFAULT_PREFERENCES, type StoredPreferences } from "@/lib/data/preferences-storage";
import type { Category, Note } from "@/types/note";

export interface BackupPayload {
  schemaVersion: number;
  notes: Note[];
  categories: Category[];
  preferences: StoredPreferences;
}

export function downloadAllNotesAsMarkdown(notes: Note[]): void {
  for (const note of notes) {
    downloadNoteAsMarkdown(note);
  }
}

export function downloadBackupJson(payload: BackupPayload): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `takemynote-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

export function parseBackupJson(raw: string): BackupPayload {
  const parsed = JSON.parse(raw) as Partial<BackupPayload>;

  if (!Array.isArray(parsed.notes) || !Array.isArray(parsed.categories)) {
    throw new Error("Invalid backup file: missing notes or categories.");
  }

  return {
    schemaVersion:
      typeof parsed.schemaVersion === "number" ? parsed.schemaVersion : CURRENT_SCHEMA_VERSION,
    notes: parsed.notes,
    categories: parsed.categories,
    preferences: { ...DEFAULT_PREFERENCES, ...parsed.preferences },
  };
}
