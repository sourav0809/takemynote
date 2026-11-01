import "server-only";

import { MongoServerError, type WithId } from "mongodb";

import { collections } from "@/lib/server/db";
import type { NoteDoc } from "@/lib/server/documents";
import { categoryExists } from "@/lib/server/repositories/categories";
import type { NoteInput, RemoteNote, WriteResult } from "@/lib/sync/schemas";

const DUPLICATE_KEY = 11000;

export function toRemoteNote(doc: NoteDoc): RemoteNote {
  return {
    id: doc.noteId,
    version: doc.version,
    deleted: doc.deletedAt !== null,
    title: doc.title,
    content: doc.content,
    categoryId: doc.categoryId,
    favorited: doc.favorited,
    pinned: doc.pinned,
    trashed: doc.trashed,
    scratchpad: doc.scratchpad,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function noteFields(note: NoteInput, categoryId: string | null) {
  return {
    title: note.title,
    content: note.content,
    categoryId,
    favorited: note.favorited,
    pinned: note.pinned,
    trashed: note.trashed,
    scratchpad: note.scratchpad,
    createdAt: new Date(note.createdAt),
    updatedAt: new Date(note.updatedAt),
  };
}

export async function findNote(userId: string, noteId: string): Promise<WithId<NoteDoc> | null> {
  return (await collections.notes()).findOne({ userId, noteId });
}

/**
 * Creates or updates a note. Succeeds only if the device saw the latest
 * version (`baseVersion`); otherwise returns the server's copy as a conflict.
 * Writing to a deleted note brings it back (an edit beats a delete).
 */
export async function upsertNote(
  userId: string,
  noteId: string,
  note: NoteInput,
  baseVersion: number,
  deviceId: string
): Promise<WriteResult<RemoteNote>> {
  const notes = await collections.notes();
  // A category deleted on another device just leaves the note uncategorised.
  const categoryId =
    note.categoryId && (await categoryExists(userId, note.categoryId)) ? note.categoryId : null;
  const now = new Date();

  const existing = await notes.findOne({ userId, noteId });
  if (!existing) {
    const doc: NoteDoc = {
      userId,
      noteId,
      ...noteFields(note, categoryId),
      version: 1,
      serverUpdatedAt: now,
      deletedAt: null,
      lastDeviceId: deviceId,
    };
    try {
      await notes.insertOne(doc);
      return { status: "ok", item: toRemoteNote(doc) };
    } catch (error) {
      // Another request created it a moment ago: treat as an update.
      if (error instanceof MongoServerError && error.code === DUPLICATE_KEY) {
        return upsertNote(userId, noteId, note, baseVersion, deviceId);
      }
      throw error;
    }
  }

  if (existing.version !== baseVersion) return { status: "conflict", item: toRemoteNote(existing) };

  const updated = await notes.findOneAndUpdate(
    { _id: existing._id, version: baseVersion },
    {
      $set: { ...noteFields(note, categoryId), serverUpdatedAt: now, deletedAt: null, lastDeviceId: deviceId },
      $inc: { version: 1 },
    },
    { returnDocument: "after" }
  );
  if (!updated) {
    // Lost a race with another device between the read and the write.
    const latest = await notes.findOne({ _id: existing._id });
    return { status: "conflict", item: toRemoteNote(latest ?? existing) };
  }
  return { status: "ok", item: toRemoteNote(updated) };
}

/**
 * Deletes a note forever, leaving a tombstone so other devices remove it too.
 * If another device edited it since, the delete is refused (conflict).
 */
export async function deleteNote(
  userId: string,
  noteId: string,
  baseVersion: number,
  deviceId: string
): Promise<WriteResult<RemoteNote> | null> {
  const notes = await collections.notes();
  const existing = await notes.findOne({ userId, noteId });
  if (!existing) return null;
  if (existing.deletedAt) return { status: "ok", item: toRemoteNote(existing) };
  if (existing.version !== baseVersion) return { status: "conflict", item: toRemoteNote(existing) };

  const deleted = await notes.findOneAndUpdate(
    { _id: existing._id, version: baseVersion },
    {
      $set: { title: "", content: [], deletedAt: new Date(), serverUpdatedAt: new Date(), lastDeviceId: deviceId },
      $inc: { version: 1 },
    },
    { returnDocument: "after" }
  );
  if (!deleted) {
    const latest = await notes.findOne({ _id: existing._id });
    return { status: "conflict", item: toRemoteNote(latest ?? existing) };
  }
  return { status: "ok", item: toRemoteNote(deleted) };
}
