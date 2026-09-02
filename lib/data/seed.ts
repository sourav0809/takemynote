import type { Note } from "@/types/note";

export function createWelcomeNote(): Note {
  const now = new Date().toISOString();
  return {
    id: `note-${Math.random().toString(36).slice(2, 10)}`,
    title: "Welcome to TakeMyNote",
    content:
      "<p>This is your new note-taking home. Write with a rich text editor, organize with categories, and star your favorites.</p>",
    categoryId: null,
    favorited: false,
    pinned: false,
    trashed: false,
    scratchpad: false,
    createdAt: now,
    updatedAt: now,
  };
}
