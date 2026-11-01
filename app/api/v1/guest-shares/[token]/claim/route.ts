import { requireOwnedGuestShare } from "@/lib/server/guest-share-request";
import { ApiError, json, withUser } from "@/lib/server/http";
import { claimGuestShare } from "@/lib/server/repositories/guest-shares";
import { toShareInfo } from "@/lib/server/share-info";

type Ctx = RouteContext<"/api/v1/guest-shares/[token]/claim">;

/** POST: after signing in, move a link made as a guest into the account (same URL). */
export function POST(request: Request, ctx: Ctx): Promise<Response> {
  return withUser(
    async (user) => {
      const guest = await requireOwnedGuestShare(request, (await ctx.params).token);
      const share = await claimGuestShare(guest, user.id);
      if (!share) throw new ApiError("not_found", "This link belongs to another account.");
      return json(toShareInfo(share, new URL(request.url).origin));
    },
    { isWrite: true }
  );
}
