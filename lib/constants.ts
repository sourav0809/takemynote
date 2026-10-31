import type { FolderId } from "@/types/note";

export const APP_NAME = "TakeMyNote";

export const APP_TAGLINE = "A calm, private notebook";

/** Public source code. */
export const GITHUB_URL = "https://github.com/sourav0809/takemynote";

export const ROUTES = {
  home: "/",
  notes: "/notes",
} as const;

/** Library column (folders, search, notes) on desktop. */
export const LIBRARY_MIN_SIZE = "280px";
export const LIBRARY_MAX_SIZE = "440px";
export const LIBRARY_DEFAULT_SIZE = "320px";

/** Classic layout: sidebar and note list columns on desktop. */
export const CLASSIC_SIDEBAR_MIN_SIZE = "200px";
export const CLASSIC_SIDEBAR_MAX_SIZE = "320px";
export const CLASSIC_SIDEBAR_DEFAULT_SIZE = "232px";
export const CLASSIC_LIST_MIN_SIZE = "260px";
export const CLASSIC_LIST_MAX_SIZE = "440px";
export const CLASSIC_LIST_DEFAULT_SIZE = "320px";

/** At this width and up the app shows Library and Page side by side; below it, one at a time. */
export const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";

export const UNTITLED_NOTE_TITLE = "Untitled note";

export const DEFAULT_CATEGORY_LABEL = "Notes";

export const WORDS_PER_MINUTE = 200;

export type NoteListView = "list" | "grid";

export type NoteListFilter = "all" | "recent" | "pinned";

export const RECENT_NOTE_WINDOW_DAYS = 3;

export const NOTE_EXCERPT_LENGTH = 140;

export const EDITOR_PLACEHOLDER = "Start writing...";

export const FOLDER_LABELS: Record<FolderId, string> = {
  notes: "Notes",
  favorites: "Favorites",
  scratchpad: "Scratchpad",
  trash: "Trash",
};
