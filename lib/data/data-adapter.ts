import type { Category, Note } from "@/types/note";

export interface DataAdapter {
  getNotes(): Promise<Note[]>;
  getCategories(): Promise<Category[]>;
  createNote(categoryId: string | null): Promise<Note>;
  updateNote(id: string, changes: Partial<Note>): Promise<Note | undefined>;
  deleteNotePermanently(id: string): Promise<void>;
  emptyTrash(): Promise<void>;
  createCategory(name: string): Promise<Category>;
  renameCategory(id: string, name: string): Promise<void>;
  deleteCategory(id: string): Promise<void>;
  getOrCreateScratchpadNote(): Promise<Note>;
}
