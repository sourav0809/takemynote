import type { Note } from "@/types/note";

interface Migration {
  from: number;
  to: number;
  migrate: (raw: unknown) => Promise<unknown>;
}

// Each entry bumps schemaVersion by one step so existing users' stored data
// is transformed forward before anything else touches it.
const MIGRATIONS: Migration[] = [
  {
    // v1 -> v2: note bodies move from Tiptap HTML strings to BlockNote JSON
    // blocks. The converter is loaded lazily because it pulls in the editor
    // engine, which is only needed when there is legacy data to convert.
    from: 1,
    to: 2,
    migrate: async (raw) => {
      if (!Array.isArray(raw)) return raw;
      const { normalizeNotesContent } = await import("@/lib/editor/note-content-converter");
      return normalizeNotesContent(raw as Note[]);
    },
  },
];

export async function runMigrations(
  rawNotes: unknown,
  fromVersion: number,
  toVersion: number
): Promise<unknown> {
  let data = rawNotes;
  let version = fromVersion;

  while (version < toVersion) {
    const migration = MIGRATIONS.find((entry) => entry.from === version);
    if (!migration) break;
    data = await migration.migrate(data);
    version = migration.to;
  }

  return data;
}
