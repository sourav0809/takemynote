import "server-only";

import { collections } from "@/lib/server/db";

/**
 * Fixed-window rate limit stored in MongoDB (works across serverless
 * instances). Returns false when the limit for this window is used up.
 */
export async function checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const rateLimits = await collections.rateLimits();
  const now = Date.now();
  const windowEnd = new Date(Math.ceil(now / (windowSeconds * 1000)) * windowSeconds * 1000);
  const windowKey = `${key}:${windowEnd.getTime()}`;

  const doc = await rateLimits.findOneAndUpdate(
    { key: windowKey },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: windowEnd } },
    { upsert: true, returnDocument: "after" }
  );
  return (doc?.count ?? 1) <= limit;
}

/** True the first time `key` is seen within the window (e.g. one view per visitor per hour). */
export async function isFirstInWindow(key: string, windowSeconds: number): Promise<boolean> {
  return checkRateLimit(key, 1, windowSeconds);
}
