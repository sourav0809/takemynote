import { initialCategories, initialNotes } from "@/lib/mock-data";
import type { Category, Note } from "@/types/note";

let notes: Note[] = initialNotes;
let categories: Category[] = initialCategories;

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export const notesStore = {
  getNotes: (): Note[] => notes,

  getCategories: (): Category[] => categories,

  createNote: (categoryId: string | null): Note => {
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
    notes = [note, ...notes];
    return note;
  },

  updateNote: (id: string, changes: Partial<Note>): Note | undefined => {
    let updated: Note | undefined;
    notes = notes.map((note) => {
      if (note.id !== id) return note;
      updated = { ...note, ...changes, updatedAt: new Date().toISOString() };
      return updated;
    });
    return updated;
  },

  deleteNotePermanently: (id: string): void => {
    notes = notes.filter((note) => note.id !== id);
  },

  emptyTrash: (): void => {
    notes = notes.filter((note) => !note.trashed);
  },

  createCategory: (name: string): Category => {
    const category: Category = { id: generateId("cat"), name };
    categories = [...categories, category];
    return category;
  },

  renameCategory: (id: string, name: string): void => {
    categories = categories.map((category) =>
      category.id === id ? { ...category, name } : category
    );
  },

  deleteCategory: (id: string): void => {
    categories = categories.filter((category) => category.id !== id);
    notes = notes.map((note) =>
      note.categoryId === id ? { ...note, categoryId: null } : note
    );
  },
};
