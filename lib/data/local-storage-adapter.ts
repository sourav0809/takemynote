import type { DataAdapter } from "@/lib/data/data-adapter";
import { runMigrations } from "@/lib/data/migrations";
import { writePreferences, type StoredPreferences } from "@/lib/data/preferences-storage";
import { createWelcomeNote } from "@/lib/data/seed";
import {
  CURRENT_SCHEMA_VERSION,
  LEGACY_SCHEMA_VERSION,
  STORAGE_KEYS,
} from "@/lib/data/storage-keys";
import type { Category, Note } from "@/types/note";

/** UUIDs: notes made on different devices must never share an id once they sync. */
function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

let initialization: Promise<void> | null = null;

async function migrateStoredNotes(): Promise<void> {
  const storedVersion = readJson<number | null>(STORAGE_KEYS.schemaVersion, null);
  const hasStoredNotes = window.localStorage.getItem(STORAGE_KEYS.notes) !== null;
  // Data written before schemaVersion was tracked is treated as the legacy format.
  const fromVersion = storedVersion ?? LEGACY_SCHEMA_VERSION;

  if (hasStoredNotes && fromVersion < CURRENT_SCHEMA_VERSION) {
    const migratedNotes = await runMigrations(
      readJson<unknown>(STORAGE_KEYS.notes, []),
      fromVersion,
      CURRENT_SCHEMA_VERSION
    );
    writeJson(STORAGE_KEYS.notes, migratedNotes);
  }
  if (storedVersion !== CURRENT_SCHEMA_VERSION) {
    writeJson(STORAGE_KEYS.schemaVersion, CURRENT_SCHEMA_VERSION);
  }
}

function seedIfFirstRun(): void {
  const alreadyInitialized = window.localStorage.getItem(STORAGE_KEYS.initialized);
  if (alreadyInitialized) return;

  writeJson<Note[]>(STORAGE_KEYS.notes, [createWelcomeNote()]);
  writeJson<Category[]>(STORAGE_KEYS.categories, []);
  window.localStorage.setItem(STORAGE_KEYS.initialized, "true");
}

function ensureInitialized(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  initialization ??= (async () => {
    await migrateStoredNotes();
    seedIfFirstRun();
  })();
  return initialization;
}

// Serializes all reads/writes so two rapid mutations (e.g. fast typing
// triggering back-to-back updateNote calls) can't interleave a
// read-modify-write cycle and silently drop one of the changes. Every task
// waits for the one-time migration/seed step before touching storage.
let writeQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => T | Promise<T>): Promise<T> {
  const result = writeQueue.then(async () => {
    await ensureInitialized();
    return task();
  });
  writeQueue = result.catch(() => undefined);
  return result;
}

function getNotesSync(): Note[] {
  return readJson<Note[]>(STORAGE_KEYS.notes, []);
}

function getCategoriesSync(): Category[] {
  return readJson<Category[]>(STORAGE_KEYS.categories, []);
}

export const localStorageAdapter: DataAdapter = {
  getNotes: async () => enqueue(getNotesSync),

  getCategories: async () => enqueue(getCategoriesSync),

  createNote: async (categoryId, initial) =>
    enqueue(() => {
      const notes = getNotesSync();
      const now = new Date().toISOString();
      const note: Note = {
        id: generateId("note"),
        title: initial?.title ?? "",
        content: initial?.content ?? [],
        categoryId,
        favorited: false,
        pinned: false,
        trashed: false,
        scratchpad: false,
        createdAt: now,
        updatedAt: now,
      };
      writeJson(STORAGE_KEYS.notes, [note, ...notes]);
      return note;
    }),

  updateNote: async (id, changes) =>
    enqueue(() => {
      const notes = getNotesSync();
      let updated: Note | undefined;
      const nextNotes = notes.map((note) => {
        if (note.id !== id) return note;
        updated = { ...note, ...changes, updatedAt: new Date().toISOString() };
        return updated;
      });
      writeJson(STORAGE_KEYS.notes, nextNotes);
      return updated;
    }),

  deleteNotePermanently: async (id) =>
    enqueue(() => {
      const notes = getNotesSync();
      writeJson(
        STORAGE_KEYS.notes,
        notes.filter((note) => note.id !== id)
      );
    }),

  emptyTrash: async () =>
    enqueue(() => {
      const notes = getNotesSync();
      writeJson(
        STORAGE_KEYS.notes,
        notes.filter((note) => !note.trashed)
      );
    }),

  createCategory: async (name) =>
    enqueue(() => {
      const categories = getCategoriesSync();
      const category: Category = { id: generateId("cat"), name };
      writeJson(STORAGE_KEYS.categories, [...categories, category]);
      return category;
    }),

  renameCategory: async (id, name) =>
    enqueue(() => {
      const categories = getCategoriesSync();
      writeJson(
        STORAGE_KEYS.categories,
        categories.map((category) => (category.id === id ? { ...category, name } : category))
      );
    }),

  deleteCategory: async (id) =>
    enqueue(() => {
      const categories = getCategoriesSync();
      const notes = getNotesSync();
      writeJson(
        STORAGE_KEYS.categories,
        categories.filter((category) => category.id !== id)
      );
      writeJson(
        STORAGE_KEYS.notes,
        notes.map((note) => (note.categoryId === id ? { ...note, categoryId: null } : note))
      );
    }),

  getOrCreateScratchpadNote: async () =>
    enqueue(() => {
      const notes = getNotesSync();
      const existing = notes.find((note) => note.scratchpad);
      if (existing) return existing;

      const now = new Date().toISOString();
      const scratchpadNote: Note = {
        id: generateId("note"),
        title: "Scratchpad",
        content: [],
        categoryId: null,
        favorited: false,
        pinned: false,
        trashed: false,
        scratchpad: true,
        createdAt: now,
        updatedAt: now,
      };
      writeJson(STORAGE_KEYS.notes, [scratchpadNote, ...notes]);
      return scratchpadNote;
    }),
};

export async function restoreFromBackup(payload: {
  notes: Note[];
  categories: Category[];
  preferences: StoredPreferences;
}): Promise<void> {
  // Backups made before the BlockNote migration hold HTML note bodies;
  // convert them so restored notes are always in the current format.
  const { normalizeNotesContent } = await import("@/lib/editor/note-content-converter");
  const notes = normalizeNotesContent(payload.notes);

  return enqueue(() => {
    writeJson(STORAGE_KEYS.notes, notes);
    writeJson(STORAGE_KEYS.categories, payload.categories);
    writePreferences(payload.preferences);
    writeJson(STORAGE_KEYS.schemaVersion, CURRENT_SCHEMA_VERSION);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.initialized, "true");
    }
  });
}

/** Server changes to apply on this device (from sync). */
export interface RemoteChanges {
  upsertNotes: Note[];
  removeNoteIds: string[];
  upsertCategories: Category[];
  removeCategoryIds: string[];
}

/**
 * Low-level access for the sync engine. Unlike the adapter, these keep the
 * server's timestamps and never feed the outbox.
 */
export const localStore = {
  readNotes: (): Promise<Note[]> => enqueue(getNotesSync),
  /** Synchronous read, for the last moment before the page closes. */
  readNotesNow: (): Note[] => getNotesSync(),
  readCategories: (): Promise<Category[]> => enqueue(getCategoriesSync),

  applyRemoteChanges: ({ upsertNotes, removeNoteIds, upsertCategories, removeCategoryIds }: RemoteChanges) =>
    enqueue(() => {
      if (upsertCategories.length > 0 || removeCategoryIds.length > 0) {
        const removed = new Set(removeCategoryIds);
        const incoming = new Map(upsertCategories.map((category) => [category.id, category]));
        const kept = getCategoriesSync()
          .filter((category) => !removed.has(category.id))
          .map((category) => incoming.get(category.id) ?? category);
        const added = upsertCategories.filter((category) => !kept.some((existing) => existing.id === category.id));
        writeJson(STORAGE_KEYS.categories, [...kept, ...added]);
      }
      if (upsertNotes.length > 0 || removeNoteIds.length > 0) {
        const removed = new Set(removeNoteIds);
        const incoming = new Map(upsertNotes.map((note) => [note.id, note]));
        const kept = getNotesSync()
          .filter((note) => !removed.has(note.id))
          .map((note) => incoming.get(note.id) ?? note);
        const added = upsertNotes.filter((note) => !kept.some((existing) => existing.id === note.id));
        writeJson(STORAGE_KEYS.notes, [...added, ...kept]);
      }
    }),

  /** Adds a note as-is (used for conflict copies). */
  insertNote: (note: Note) =>
    enqueue(() => {
      writeJson(STORAGE_KEYS.notes, [note, ...getNotesSync()]);
    }),

  /** Empties notes and categories, then shows the welcome note again (after sign-out). */
  resetToFreshDevice: () =>
    enqueue(() => {
      writeJson<Note[]>(STORAGE_KEYS.notes, [createWelcomeNote()]);
      writeJson<Category[]>(STORAGE_KEYS.categories, []);
    }),

  newNoteId: () => generateId("note"),
};
