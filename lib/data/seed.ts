import type { Note } from "@/types/note";

const WELCOME_NOTE_TEXT =
  "This is your new note-taking home. Write with a rich text editor, organize with categories, and star your favorites.";
const WELCOME_NOTE_HINT = "Type / to insert headings, lists, checklists, quotes, and code blocks.";

function createParagraph(id: string, text: string): Note["content"][number] {
  return {
    id,
    type: "paragraph",
    props: { backgroundColor: "default", textColor: "default", textAlignment: "left" },
    content: [{ type: "text", text, styles: {} }],
    children: [],
  };
}

export function createWelcomeNote(): Note {
  const now = new Date().toISOString();
  return {
    id: `note-${Math.random().toString(36).slice(2, 10)}`,
    title: "Welcome to TakeMyNote",
    content: [
      createParagraph("welcome-intro", WELCOME_NOTE_TEXT),
      createParagraph("welcome-hint", WELCOME_NOTE_HINT),
    ],
    categoryId: null,
    favorited: false,
    pinned: false,
    trashed: false,
    scratchpad: false,
    createdAt: now,
    updatedAt: now,
  };
}
