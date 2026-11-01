import { ApiError, enforceRateLimit, json, readBody, withoutUser } from "@/lib/server/http";
import { createGuestShare } from "@/lib/server/repositories/guest-shares";
import { toShareInfo } from "@/lib/server/share-info";
import { visitorKey } from "@/lib/server/visitor";
import { createGuestShareBodySchema, LIMITS, type GuestShareCreated } from "@/lib/sync/schemas";

/** New links per visitor per hour (no account to rate-limit by, so per IP hash). */
const CREATES_PER_HOUR = 30;

/** POST: share a note without an account. Returns the link and the key that controls it. */
export function POST(request: Request): Promise<Response> {
  return withoutUser(async () => {
    await enforceRateLimit(`guest-share-create:${await visitorKey()}`, CREATES_PER_HOUR, 60 * 60);
    const { noteId, note } = await readBody(request, createGuestShareBodySchema);
    if (JSON.stringify(note).length > LIMITS.noteBytes) throw new ApiError("too_large", "This note is too large to share.");
    const { share, key } = await createGuestShare(noteId, note);
    return json<GuestShareCreated>({ token: share.token, key, share: toShareInfo(share, new URL(request.url).origin) });
  });
}
