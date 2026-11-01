import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import { collections } from "@/lib/server/db";
import type { GuestShareDoc, ShareDoc } from "@/lib/server/documents";
import { newShareToken } from "@/lib/server/repositories/shares";
import type { GuestShareNote } from "@/lib/sync/schemas";

/** 32 random bytes → 43 URL-safe characters: the browser's proof that it owns the link. */
function newKey(): string {
  return randomBytes(32).toString("base64url");
}

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("base64url");
}

function toFields(note: GuestShareNote): Pick<GuestShareDoc, "title" | "content" | "trashed" | "updatedAt"> {
  return { title: note.title, content: note.content, trashed: note.trashed, updatedAt: new Date(note.updatedAt) };
}

export async function createGuestShare(noteId: string, note: GuestShareNote): Promise<{ share: GuestShareDoc; key: string }> {
  const key = newKey();
  const share: GuestShareDoc = {
    token: newShareToken(),
    keyHash: hashKey(key),
    noteId,
    ...toFields(note),
    createdAt: new Date(),
    viewCount: 0,
    lastViewedAt: null,
  };
  await (await collections.guestShares()).insertOne(share);
  return { share, key };
}

/** The guest link, if `key` is the one it was created with. */
export async function findOwnedGuestShare(token: string, key: string): Promise<GuestShareDoc | null> {
  const share = await (await collections.guestShares()).findOne({ token });
  if (!share) return null;
  const expected = Buffer.from(share.keyHash);
  const given = Buffer.from(hashKey(key));
  return expected.length === given.length && timingSafeEqual(expected, given) ? share : null;
}

export async function updateGuestShare(token: string, note: GuestShareNote): Promise<void> {
  await (await collections.guestShares()).updateOne({ token }, { $set: toFields(note) });
}

/** Turning a guest link off removes the copy completely. */
export async function deleteGuestShare(token: string): Promise<void> {
  await (await collections.guestShares()).deleteOne({ token });
}

/**
 * After signing in: the guest link becomes an ordinary account share with the
 * same token, so the link people already have keeps working and from now on
 * shows the synced note.
 */
export async function claimGuestShare(guest: GuestShareDoc, userId: string): Promise<ShareDoc | null> {
  const shares = await collections.shares();
  const existing = await shares.findOne({ token: guest.token });
  if (existing && existing.userId !== userId) return null;
  const share: ShareDoc = existing ?? {
    token: guest.token,
    userId,
    noteId: guest.noteId,
    createdAt: guest.createdAt,
    revokedAt: null,
    viewCount: guest.viewCount,
    lastViewedAt: guest.lastViewedAt,
  };
  if (!existing) await shares.insertOne(share);
  await deleteGuestShare(guest.token);
  return share;
}
