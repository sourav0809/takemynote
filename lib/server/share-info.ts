import "server-only";

import type { ShareInfo } from "@/lib/sync/schemas";

/** What the share dialog shows about an active link. */
export function toShareInfo(
  share: { token: string; createdAt: Date; viewCount: number } | null,
  origin: string
): ShareInfo {
  return share
    ? { shared: true, url: `${origin}/s/${share.token}`, createdAt: share.createdAt.toISOString(), viewCount: share.viewCount }
    : { shared: false, url: null, createdAt: null, viewCount: 0 };
}
