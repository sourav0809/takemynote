import { ApiError, json, withUser } from "@/lib/server/http";
import { findNote } from "@/lib/server/repositories/notes";
import { disableShare, enableShare, getActiveShare } from "@/lib/server/repositories/shares";
import { toShareInfo } from "@/lib/server/share-info";
import { itemIdSchema } from "@/lib/sync/schemas";

type Ctx = RouteContext<"/api/v1/notes/[noteId]/share">;

async function parseNoteId(ctx: Ctx): Promise<string> {
  const parsed = itemIdSchema.safeParse((await ctx.params).noteId);
  if (!parsed.success) throw new ApiError("invalid_request", "Invalid note id.");
  return parsed.data;
}

/** GET: is this note shared? */
export function GET(request: Request, ctx: Ctx): Promise<Response> {
  return withUser(async (user) => {
    const share = await getActiveShare(user.id, await parseNoteId(ctx));
    return json(toShareInfo(share, new URL(request.url).origin));
  });
}

/** POST: turn the public link on (the note must be synced first). */
export function POST(request: Request, ctx: Ctx): Promise<Response> {
  return withUser(
    async (user) => {
      const noteId = await parseNoteId(ctx);
      const note = await findNote(user.id, noteId);
      if (!note || note.deletedAt) throw new ApiError("not_found", "Sync this note before sharing it.");
      const share = await enableShare(user.id, noteId);
      return json(toShareInfo(share, new URL(request.url).origin));
    },
    { isWrite: true }
  );
}

/** DELETE: turn the public link off. */
export function DELETE(request: Request, ctx: Ctx): Promise<Response> {
  return withUser(
    async (user) => {
      await disableShare(user.id, await parseNoteId(ctx));
      return json(toShareInfo(null, new URL(request.url).origin));
    },
    { isWrite: true }
  );
}
