import "server-only";

import { ApiError } from "@/lib/server/http";
import { findOwnedGuestShare } from "@/lib/server/repositories/guest-shares";
import { isShareToken } from "@/lib/server/repositories/shares";
import type { GuestShareDoc } from "@/lib/server/documents";

/** The browser proves it owns a guest link with this header. */
export const GUEST_SHARE_KEY_HEADER = "x-share-key";

/** The guest link named in the URL, if the request carries its key. */
export async function requireOwnedGuestShare(request: Request, token: string): Promise<GuestShareDoc> {
  const key = request.headers.get(GUEST_SHARE_KEY_HEADER) ?? "";
  const share = isShareToken(token) && key ? await findOwnedGuestShare(token, key) : null;
  // The same answer for "no such link" and "wrong key": nothing to probe.
  if (!share) throw new ApiError("not_found", "This link doesn’t exist any more.");
  return share;
}
