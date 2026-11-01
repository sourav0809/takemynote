import type { ObjectId } from "mongodb";

import type { NoteInput, SettingsInput } from "@/lib/sync/schemas";

/**
 * MongoDB document shapes (see .claude/accounts-sync-sharing-plan.md §6).
 * Validators in collection-setup.ts enforce the same rules in the database.
 */

/** Fields every synced document has. */
export interface SyncFields {
  _id?: ObjectId;
  /** Owner (Better Auth user id). Every query filters by it. */
  userId: string;
  /** +1 on every server write; devices send the version they last saw. */
  version: number;
  /** Set by the server on every write; drives "what changed since…". */
  serverUpdatedAt: Date;
  /** Set when deleted, so other devices learn about it. Purged later. */
  deletedAt: Date | null;
  lastDeviceId: string;
}

export interface NoteDoc extends SyncFields {
  noteId: string;
  title: string;
  content: NoteInput["content"];
  categoryId: string | null;
  favorited: boolean;
  pinned: boolean;
  trashed: boolean;
  scratchpad: boolean;
  createdAt: Date;
  /** Last edit time on the device (shown in the app). */
  updatedAt: Date;
}

export interface CategoryDoc extends SyncFields {
  categoryId: string;
  name: string;
  createdAt: Date;
}

export interface SettingsDoc {
  _id?: ObjectId;
  userId: string;
  preferences: SettingsInput["preferences"];
  onboardingCompleted: boolean;
  /** Provider, model and writing instructions. Never an API key. */
  ai: SettingsInput["ai"];
  version: number;
  serverUpdatedAt: Date;
  lastDeviceId: string;
}

export interface ShareDoc {
  _id?: ObjectId;
  /** 22 random URL-safe characters (~131 bits): the public link id. */
  token: string;
  userId: string;
  noteId: string;
  createdAt: Date;
  revokedAt: Date | null;
  viewCount: number;
  lastViewedAt: Date | null;
}

/**
 * A note shared by someone without an account. Their notes live only in their
 * browser, so the shared note is a copy that the browser keeps up to date.
 * Only the browser holding the secret key can update or remove it.
 */
export interface GuestShareDoc {
  _id?: ObjectId;
  /** Same format as ShareDoc.token; the link becomes an account share on sign-in. */
  token: string;
  /** SHA-256 of the secret key (the key itself is never stored). */
  keyHash: string;
  noteId: string;
  title: string;
  content: NoteInput["content"];
  /** A trashed note's link shows "not available", like an account share. */
  trashed: boolean;
  createdAt: Date;
  /** Last edit time of the note (shown on the page). */
  updatedAt: Date;
  viewCount: number;
  lastViewedAt: Date | null;
}

export interface RateLimitDoc {
  _id?: ObjectId;
  key: string;
  count: number;
  /** When this window ends; a TTL index removes the document afterwards. */
  expiresAt: Date;
}
