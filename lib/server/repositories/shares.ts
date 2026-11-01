import "server-only";

import { randomBytes } from "node:crypto";

import { collections } from "@/lib/server/db";
import type { NoteDoc, ShareDoc } from "@/lib/server/documents";

/** 16 random bytes → 22 URL-safe characters (~128 bits): not guessable. */
export function newShareToken(): string {
  return randomBytes(16).toString("base64url");
}

export async function getActiveShare(userId: string, noteId: string): Promise<ShareDoc | null> {
  return (await collections.shares()).findOne({ userId, noteId, revokedAt: null });
}

/** Turns sharing on, reusing the note's active link if it already has one. */
export async function enableShare(userId: string, noteId: string): Promise<ShareDoc> {
  const existing = await getActiveShare(userId, noteId);
  if (existing) return existing;
  const share: ShareDoc = {
    token: newShareToken(),
    userId,
    noteId,
    createdAt: new Date(),
    revokedAt: null,
    viewCount: 0,
    lastViewedAt: null,
  };
  await (await collections.shares()).insertOne(share);
  return share;
}

/** Turns sharing off: every active link for the note stops working. */
export async function disableShare(userId: string, noteId: string): Promise<void> {
  await (await collections.shares()).updateMany({ userId, noteId, revokedAt: null }, { $set: { revokedAt: new Date() } });
}

/** What a public link shows. */
export interface SharedNote {
  /** An account's synced note, or a guest's published copy. */
  kind: "account" | "guest";
  title: string;
  content: NoteDoc["content"];
  updatedAt: Date;
}

export function isShareToken(token: string): boolean {
  return /^[A-Za-z0-9_-]{22}$/.test(token);
}

/**
 * The note behind a public link, if the link is active and the note is still
 * there (not deleted, not in the trash).
 */
export async function findSharedNote(token: string): Promise<SharedNote | null> {
  if (!isShareToken(token)) return null;
  const share = await (await collections.shares()).findOne({ token, revokedAt: null });
  if (share) {
    const note = await (await collections.notes()).findOne({
      userId: share.userId,
      noteId: share.noteId,
      deletedAt: null,
      trashed: false,
    });
    return note ? { kind: "account", title: note.title, content: note.content, updatedAt: note.updatedAt } : null;
  }
  const guest = await (await collections.guestShares()).findOne({ token, trashed: false });
  return guest ? { kind: "guest", title: guest.title, content: guest.content, updatedAt: guest.updatedAt } : null;
}

export async function recordShareView(token: string, kind: SharedNote["kind"]): Promise<void> {
  const update = { $inc: { viewCount: 1 }, $set: { lastViewedAt: new Date() } };
  if (kind === "account") await (await collections.shares()).updateOne({ token }, update);
  else await (await collections.guestShares()).updateOne({ token }, update);
}
