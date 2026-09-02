import type { Category, Note } from "@/types/note";

export const initialCategories: Category[] = [
  { id: "cat-work", name: "Work" },
  { id: "cat-personal", name: "Personal" },
  { id: "cat-recipes", name: "Recipes" },
];

export const initialNotes: Note[] = [
  {
    id: "note-scratchpad",
    title: "Scratchpad",
    content:
      "<p>A place for quick thoughts that don't need a home yet.</p>",
    categoryId: null,
    favorited: false,
    pinned: false,
    trashed: false,
    scratchpad: true,
    createdAt: "2026-08-20T09:00:00.000Z",
    updatedAt: "2026-09-01T14:32:00.000Z",
  },
  {
    id: "note-1",
    title: "Welcome to TakeMyNote",
    content:
      "<p>This is your new note-taking home. Write with a rich text editor, organize with categories, and star your favorites.</p>",
    categoryId: "cat-personal",
    favorited: true,
    pinned: true,
    trashed: false,
    scratchpad: false,
    createdAt: "2026-08-15T10:00:00.000Z",
    updatedAt: "2026-09-01T11:15:00.000Z",
  },
  {
    id: "note-2",
    title: "Q3 Roadmap",
    content:
      "<ul><li><p>Ship AI note summaries</p></li><li><p>Add note linking</p></li><li><p>Polish mobile layout</p></li></ul>",
    categoryId: "cat-work",
    favorited: true,
    pinned: true,
    trashed: false,
    scratchpad: false,
    createdAt: "2026-08-18T10:00:00.000Z",
    updatedAt: "2026-08-31T16:45:00.000Z",
  },
  {
    id: "note-3",
    title: "Standup notes",
    content:
      "<p>Discussed the editor redesign and search improvements.</p>",
    categoryId: "cat-work",
    favorited: false,
    pinned: false,
    trashed: false,
    scratchpad: false,
    createdAt: "2026-08-25T10:00:00.000Z",
    updatedAt: "2026-08-29T09:10:00.000Z",
  },
  {
    id: "note-4",
    title: "Weekend trip ideas",
    content:
      "<ul><li><p>Coastal hike</p></li><li><p>Visit the new bakery downtown</p></li><li><p>Movie night</p></li></ul>",
    categoryId: "cat-personal",
    favorited: false,
    pinned: false,
    trashed: false,
    scratchpad: false,
    createdAt: "2026-08-10T10:00:00.000Z",
    updatedAt: "2026-08-27T18:20:00.000Z",
  },
  {
    id: "note-5",
    title: "Banana bread",
    content:
      "<ol><li><p>Mash 3 ripe bananas</p></li><li><p>Mix with flour, sugar, egg</p></li><li><p>Bake at 350F for 55 minutes</p></li></ol>",
    categoryId: "cat-recipes",
    favorited: false,
    pinned: false,
    trashed: false,
    scratchpad: false,
    createdAt: "2026-08-05T10:00:00.000Z",
    updatedAt: "2026-08-20T08:00:00.000Z",
  },
  {
    id: "note-6",
    title: "Old draft",
    content: "<p>This note is no longer needed.</p>",
    categoryId: null,
    favorited: false,
    pinned: false,
    trashed: true,
    scratchpad: false,
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: "2026-08-01T12:00:00.000Z",
  },
];
