import { z } from "zod";

/**
 * The shape of everything that travels between the browser and the sync API.
 * The server validates every request with these; the browser imports the
 * types only. Dates travel as ISO strings.
 */

export const LIMITS = {
  /** Serialized note (title + content) in bytes. */
  noteBytes: 1_000_000,
  titleChars: 500,
  categoryNameChars: 60,
  idChars: 64,
  instructionsChars: 600,
  /** Items per sync page / import batch. */
  pageSize: 500,
  importBatch: 200,
} as const;

/** Ids are made on the device: "note-ab12cd34" (older) or a UUID (newer). */
export const itemIdSchema = z
  .string()
  .min(1)
  .max(LIMITS.idChars)
  .regex(/^[A-Za-z0-9_-]+$/, "Invalid id");

const isoDateSchema = z.iso.datetime({ offset: true });

/** A note's content is BlockNote JSON; the server stores it as-is (size-limited). */
const noteContentSchema = z.array(z.record(z.string(), z.unknown()));

export const noteInputSchema = z.object({
  title: z.string().max(LIMITS.titleChars),
  content: noteContentSchema,
  categoryId: itemIdSchema.nullable(),
  favorited: z.boolean(),
  pinned: z.boolean(),
  trashed: z.boolean(),
  scratchpad: z.boolean(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1).max(LIMITS.categoryNameChars),
  createdAt: isoDateSchema.optional(),
});

export const syncedPreferencesSchema = z.object({
  layout: z.enum(["classic", "library"]),
  writingPosition: z.enum(["start", "center", "full"]),
  sortBy: z.enum(["updated", "created", "title"]),
  textDirection: z.enum(["ltr", "rtl"]),
  scrollPastEnd: z.boolean(),
  theme: z.enum(["light", "dark", "system"]),
});

export const syncedAiSchema = z.object({
  provider: z.enum(["openai", "google", "anthropic"]),
  model: z.string().min(1).max(100),
  instructions: z.string().max(LIMITS.instructionsChars),
});

export const settingsInputSchema = z.object({
  preferences: syncedPreferencesSchema,
  onboardingCompleted: z.boolean(),
  ai: syncedAiSchema,
});

/** Every write says which server version the device last saw (0 = never synced). */
const baseVersionSchema = z.number().int().min(0);

export const putNoteBodySchema = z.object({
  note: noteInputSchema,
  baseVersion: baseVersionSchema,
  deviceId: itemIdSchema,
});

export const putCategoryBodySchema = z.object({
  category: categoryInputSchema,
  baseVersion: baseVersionSchema,
  deviceId: itemIdSchema,
});

export const deleteBodySchema = z.object({
  baseVersion: baseVersionSchema,
  deviceId: itemIdSchema,
});

export const putSettingsBodySchema = z.object({
  settings: settingsInputSchema,
  deviceId: itemIdSchema,
});

export const importBodySchema = z.object({
  deviceId: itemIdSchema,
  notes: z
    .array(z.object({ id: itemIdSchema, note: noteInputSchema, baseVersion: baseVersionSchema }))
    .max(LIMITS.importBatch),
  categories: z
    .array(z.object({ id: itemIdSchema, category: categoryInputSchema, baseVersion: baseVersionSchema }))
    .max(LIMITS.importBatch),
});

/** What a guest's browser publishes for a shared note (only the parts the page shows). */
export const guestShareNoteSchema = noteInputSchema.pick({ title: true, content: true, trashed: true, updatedAt: true });

export const createGuestShareBodySchema = z.object({
  noteId: itemIdSchema,
  note: guestShareNoteSchema,
});

export const updateGuestShareBodySchema = z.object({ note: guestShareNoteSchema });

export type NoteInput = z.infer<typeof noteInputSchema>;
export type GuestShareNote = z.infer<typeof guestShareNoteSchema>;
export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type SettingsInput = z.infer<typeof settingsInputSchema>;
export type SyncedPreferences = z.infer<typeof syncedPreferencesSchema>;
export type ImportBody = z.infer<typeof importBodySchema>;

/* ---------- What the server sends back ---------- */

interface SyncedFields {
  id: string;
  version: number;
  /** True for a deletion ("tombstone"): the device should remove the item. */
  deleted: boolean;
}

export type RemoteNote = SyncedFields & NoteInput;
export type RemoteCategory = SyncedFields & { name: string; createdAt: string };
export interface RemoteSettings extends SettingsInput {
  version: number;
}

export interface SyncChangesResponse {
  notes: RemoteNote[];
  categories: RemoteCategory[];
  settings: RemoteSettings | null;
  /** Opaque; send it back to get the next changes. */
  cursor: string;
  hasMore: boolean;
}

/** Result of a write. "conflict" carries the server's copy for the device to resolve. */
export type WriteResult<T> = { status: "ok"; item: T } | { status: "conflict"; item: T };

export interface ImportResult {
  notes: { id: string; result: WriteResult<RemoteNote> }[];
  categories: { id: string; result: WriteResult<RemoteCategory> }[];
}

export interface ShareInfo {
  shared: boolean;
  url: string | null;
  createdAt: string | null;
  viewCount: number;
}

/** A new guest link. The key is sent once and only kept in that browser. */
export interface GuestShareCreated {
  token: string;
  key: string;
  share: ShareInfo;
}

export interface ApiErrorBody {
  error: { code: string; message: string };
}
