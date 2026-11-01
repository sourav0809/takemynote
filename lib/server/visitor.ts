import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

/** A visitor fingerprint for counting views and rate limits: a hash, never the raw IP. */
export async function visitorKey(): Promise<string> {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "unknown";
  return createHash("sha256").update(ip).digest("base64url").slice(0, 16);
}
