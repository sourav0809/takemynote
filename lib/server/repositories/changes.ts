import "server-only";

import { ObjectId, type Filter } from "mongodb";

import { collections } from "@/lib/server/db";
import type { SyncFields } from "@/lib/server/documents";
import { toRemoteCategory } from "@/lib/server/repositories/categories";
import { toRemoteNote } from "@/lib/server/repositories/notes";
import { getSettings } from "@/lib/server/repositories/settings";
import { LIMITS, type SyncChangesResponse } from "@/lib/sync/schemas";

/**
 * Writes can commit slightly out of timestamp order, so a finished pull's
 * cursor steps back this far; devices ignore what they already have.
 */
const OVERLAP_MS = 10_000;

interface Position {
  /** serverUpdatedAt in ms */
  t: number;
  /** _id hex, to order items with the same timestamp */
  id: string;
}

interface Cursor {
  notes: Position;
  categories: Position;
  /** Settings version last seen. */
  settings: number;
}

const START: Cursor = { notes: { t: 0, id: "" }, categories: { t: 0, id: "" }, settings: 0 };

export function decodeCursor(raw: string | null): Cursor {
  if (!raw) return START;
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as Cursor;
    if (typeof parsed?.notes?.t !== "number" || typeof parsed?.categories?.t !== "number") return START;
    return parsed;
  } catch {
    return START;
  }
}

function encodeCursor(cursor: Cursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

function afterFilter<T extends SyncFields>(userId: string, position: Position): Filter<T> {
  const time = new Date(position.t);
  const after: Filter<SyncFields>[] = [{ serverUpdatedAt: { $gt: time } }];
  if (position.id) after.push({ serverUpdatedAt: time, _id: { $gt: new ObjectId(position.id) } });
  else after.push({ serverUpdatedAt: time });
  return { userId, $or: after } as Filter<T>;
}

function positionOf(doc: SyncFields): Position {
  return { t: doc.serverUpdatedAt.getTime(), id: doc._id?.toHexString() ?? "" };
}

/** Steps a finished cursor back by the overlap window. */
function settle(position: Position): Position {
  return position.t === 0 ? position : { t: Math.max(0, position.t - OVERLAP_MS), id: "" };
}

/** Everything that changed for this user after `cursor` (a page at most). */
export async function getChanges(userId: string, rawCursor: string | null): Promise<SyncChangesResponse> {
  const cursor = decodeCursor(rawCursor);
  const [notes, categories] = await Promise.all([collections.notes(), collections.categories()]);
  const sort = { serverUpdatedAt: 1, _id: 1 } as const;

  const [noteDocs, categoryDocs, settings] = await Promise.all([
    notes.find(afterFilter(userId, cursor.notes)).sort(sort).limit(LIMITS.pageSize + 1).toArray(),
    categories.find(afterFilter(userId, cursor.categories)).sort(sort).limit(LIMITS.pageSize + 1).toArray(),
    getSettings(userId),
  ]);

  const notesMore = noteDocs.length > LIMITS.pageSize;
  const categoriesMore = categoryDocs.length > LIMITS.pageSize;
  const notePage = noteDocs.slice(0, LIMITS.pageSize);
  const categoryPage = categoryDocs.slice(0, LIMITS.pageSize);
  const hasMore = notesMore || categoriesMore;

  const lastNote = notePage.at(-1);
  const lastCategory = categoryPage.at(-1);
  const notesPosition = lastNote ? positionOf(lastNote) : cursor.notes;
  const categoriesPosition = lastCategory ? positionOf(lastCategory) : cursor.categories;

  const next: Cursor = {
    notes: hasMore ? notesPosition : settle(notesPosition),
    categories: hasMore ? categoriesPosition : settle(categoriesPosition),
    settings: settings?.version ?? cursor.settings,
  };

  return {
    // Categories first: devices apply them before the notes that use them.
    categories: categoryPage.map(toRemoteCategory),
    notes: notePage.map(toRemoteNote),
    settings: settings && settings.version > cursor.settings ? settings : null,
    cursor: encodeCursor(next),
    hasMore,
  };
}
