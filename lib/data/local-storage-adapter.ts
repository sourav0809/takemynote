import type { DataAdapter } from "@/lib/data/data-adapter";
import { runMigrations } from "@/lib/data/migrations";
import { writePreferences, type StoredPreferences } from "@/lib/data/preferences-storage";
import { createWelcomeNote } from "@/lib/data/seed";
import { CURRENT_SCHEMA_VERSION, STORAGE_KEYS } from "@/lib/data/storage-keys";
import type { Category, Note } from "@/types/note";

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
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

// Serializes all reads/writes so two rapid mutations (e.g. fast typing
// triggering back-to-back updateNote calls) can't interleave a
// read-modify-write cycle and silently drop one of the changes.
let writeQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => T): Promise<T> {
  const result = writeQueue.then(task);
  writeQueue = result.catch(() => undefined);
  return result;
}

let hasEnsuredInitialization = false;

function ensureInitialized(): void {
  if (typeof window === "undefined" || hasEnsuredInitialization) return;
  hasEnsuredInitialization = true;

  const storedVersion = readJson<number | null>(STORAGE_KEYS.schemaVersion, null);
  if (storedVersion !== null && storedVersion < CURRENT_SCHEMA_VERSION) {
    const migratedNotes = runMigrations(
      readJson<Note[]>(STORAGE_KEYS.notes, []),
      storedVersion,
      CURRENT_SCHEMA_VERSION
    );
    writeJson(STORAGE_KEYS.notes, migratedNotes);
  }
  if (storedVersion !== CURRENT_SCHEMA_VERSION) {
    writeJson(STORAGE_KEYS.schemaVersion, CURRENT_SCHEMA_VERSION);
  }

  const alreadyInitialized = window.localStorage.getItem(STORAGE_KEYS.initialized);
  if (alreadyInitialized) return;

  writeJson<Note[]>(STORAGE_KEYS.notes, [createWelcomeNote()]);
  writeJson<Category[]>(STORAGE_KEYS.categories, []);
  window.localStorage.setItem(STORAGE_KEYS.initialized, "true");
}

function getNotesSync(): Note[] {
  ensureInitialized();
  return readJson<Note[]>(STORAGE_KEYS.notes, []);
}

function getCategoriesSync(): Category[] {
  ensureInitialized();
  return readJson<Category[]>(STORAGE_KEYS.categories, []);
}

export const localStorageAdapter: DataAdapter = {
  getNotes: async () => enqueue(getNotesSync),

  getCategories: async () => enqueue(getCategoriesSync),

  createNote: async (categoryId) =>
    enqueue(() => {
      const notes = getNotesSync();
      const now = new Date().toISOString();
      const note: Note = {
        id: generateId("note"),
        title: "",
        content: "",
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
        content: "",
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

export function restoreFromBackup(payload: {
  notes: Note[];
  categories: Category[];
  preferences: StoredPreferences;
}): Promise<void> {
  return enqueue(() => {
    writeJson(STORAGE_KEYS.notes, payload.notes);
    writeJson(STORAGE_KEYS.categories, payload.categories);
    writePreferences(payload.preferences);
    writeJson(STORAGE_KEYS.schemaVersion, CURRENT_SCHEMA_VERSION);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.initialized, "true");
    }
  });
}
