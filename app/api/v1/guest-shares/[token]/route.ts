import { requireOwnedGuestShare } from "@/lib/server/guest-share-request";
import { ApiError, enforceRateLimit, json, readBody, withoutUser } from "@/lib/server/http";
import { deleteGuestShare, updateGuestShare } from "@/lib/server/repositories/guest-shares";
import { toShareInfo } from "@/lib/server/share-info";
import { LIMITS, updateGuestShareBodySchema } from "@/lib/sync/schemas";

type Ctx = RouteContext<"/api/v1/guest-shares/[token]">;

/** Updates per link per hour: plenty for edits sent a few seconds apart. */
const UPDATES_PER_HOUR = 900;

/** GET: the link's details (view count). */
export function GET(request: Request, ctx: Ctx): Promise<Response> {
  return withoutUser(async () => {
    const share = await requireOwnedGuestShare(request, (await ctx.params).token);
    return json(toShareInfo(share, new URL(request.url).origin));
  });
}

/** PUT: the note changed in the guest's browser; update the shared copy. */
export function PUT(request: Request, ctx: Ctx): Promise<Response> {
  return withoutUser(async () => {
    const share = await requireOwnedGuestShare(request, (await ctx.params).token);
    await enforceRateLimit(`guest-share-update:${share.token}`, UPDATES_PER_HOUR, 60 * 60);
    const { note } = await readBody(request, updateGuestShareBodySchema);
    if (JSON.stringify(note).length > LIMITS.noteBytes) throw new ApiError("too_large", "This note is too large to share.");
    await updateGuestShare(share.token, note);
    return json(toShareInfo(share, new URL(request.url).origin));
  });
}

/** DELETE: turn the link off and remove the shared copy. */
export function DELETE(request: Request, ctx: Ctx): Promise<Response> {
  return withoutUser(async () => {
    const share = await requireOwnedGuestShare(request, (await ctx.params).token);
    await deleteGuestShare(share.token);
    return json(toShareInfo(null, new URL(request.url).origin));
  });
}
