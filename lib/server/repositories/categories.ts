import "server-only";

import { MongoServerError, type ClientSession } from "mongodb";

import { collections, getMongoClient } from "@/lib/server/db";
import type { CategoryDoc } from "@/lib/server/documents";
import type { CategoryInput, RemoteCategory, WriteResult } from "@/lib/sync/schemas";

const DUPLICATE_KEY = 11000;

export function toRemoteCategory(doc: CategoryDoc): RemoteCategory {
  return {
    id: doc.categoryId,
    version: doc.version,
    deleted: doc.deletedAt !== null,
    name: doc.name,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function categoryExists(userId: string, categoryId: string): Promise<boolean> {
  const categories = await collections.categories();
  return (await categories.countDocuments({ userId, categoryId, deletedAt: null }, { limit: 1 })) > 0;
}

/** Creates or renames a category; version-checked like notes. */
export async function upsertCategory(
  userId: string,
  categoryId: string,
  category: CategoryInput,
  baseVersion: number,
  deviceId: string
): Promise<WriteResult<RemoteCategory>> {
  const categories = await collections.categories();
  const now = new Date();
  const existing = await categories.findOne({ userId, categoryId });

  if (!existing) {
    const doc: CategoryDoc = {
      userId,
      categoryId,
      name: category.name,
      createdAt: category.createdAt ? new Date(category.createdAt) : now,
      version: 1,
      serverUpdatedAt: now,
      deletedAt: null,
      lastDeviceId: deviceId,
    };
    try {
      await categories.insertOne(doc);
      return { status: "ok", item: toRemoteCategory(doc) };
    } catch (error) {
      if (error instanceof MongoServerError && error.code === DUPLICATE_KEY) {
        return upsertCategory(userId, categoryId, category, baseVersion, deviceId);
      }
      throw error;
    }
  }

  if (existing.version !== baseVersion) return { status: "conflict", item: toRemoteCategory(existing) };

  const updated = await categories.findOneAndUpdate(
    { _id: existing._id, version: baseVersion },
    { $set: { name: category.name, serverUpdatedAt: now, deletedAt: null, lastDeviceId: deviceId }, $inc: { version: 1 } },
    { returnDocument: "after" }
  );
  if (!updated) {
    const latest = await categories.findOne({ _id: existing._id });
    return { status: "conflict", item: toRemoteCategory(latest ?? existing) };
  }
  return { status: "ok", item: toRemoteCategory(updated) };
}

/** Clears a deleted category from all of the user's notes (inside the delete transaction). */
async function unassignCategory(
  userId: string,
  categoryId: string,
  deviceId: string,
  session: ClientSession
): Promise<void> {
  const notes = await collections.notes();
  await notes.updateMany(
    { userId, categoryId, deletedAt: null },
    { $set: { categoryId: null, serverUpdatedAt: new Date(), lastDeviceId: deviceId }, $inc: { version: 1 } },
    { session }
  );
}

/**
 * Deletes a category and unassigns its notes in one transaction. Deleting is
 * not version-checked: the device that deletes a category means it.
 */
export async function deleteCategory(
  userId: string,
  categoryId: string,
  deviceId: string
): Promise<RemoteCategory | null> {
  const categories = await collections.categories();
  const session = getMongoClient().startSession();
  try {
    let result: CategoryDoc | null = null;
    await session.withTransaction(async () => {
      result = await categories.findOneAndUpdate(
        { userId, categoryId },
        {
          $set: { name: "", deletedAt: new Date(), serverUpdatedAt: new Date(), lastDeviceId: deviceId },
          $inc: { version: 1 },
        },
        { returnDocument: "after", session }
      );
      if (result) await unassignCategory(userId, categoryId, deviceId, session);
    });
    return result ? toRemoteCategory(result) : null;
  } finally {
    await session.endSession();
  }
}
