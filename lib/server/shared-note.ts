import "server-only";

import { cache } from "react";

import { isAccountsEnabled } from "@/lib/server/env";
import { checkRateLimit, isFirstInWindow } from "@/lib/server/rate-limit";
import { findSharedNote, recordShareView, type SharedNote } from "@/lib/server/repositories/shares";
import { visitorKey } from "@/lib/server/visitor";

const VIEWS_PER_MINUTE_PER_VISITOR = 60;
const HOUR_SECONDS = 60 * 60;

/** The note behind a public link (cached per request, shared by the page and its metadata). */
export const getSharedNote = cache(async (token: string): Promise<SharedNote | null> => {
  if (!isAccountsEnabled()) return null;
  return findSharedNote(token);
});

/** Applies the per-visitor limit and counts a view at most once per visitor per hour. */
export async function registerShareView(token: string, kind: SharedNote["kind"]): Promise<boolean> {
  const visitor = await visitorKey();
  if (!(await checkRateLimit(`share-read:${visitor}`, VIEWS_PER_MINUTE_PER_VISITOR, 60))) return false;
  if (await isFirstInWindow(`share-view:${token}:${visitor}`, HOUR_SECONDS)) await recordShareView(token, kind);
  return true;
}
