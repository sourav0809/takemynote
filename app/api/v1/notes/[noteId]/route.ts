import { ApiError, json, readBody, withUser } from "@/lib/server/http";
import { deleteNote, upsertNote } from "@/lib/server/repositories/notes";
import { deleteBodySchema, itemIdSchema, LIMITS, putNoteBodySchema } from "@/lib/sync/schemas";

async function parseNoteId(ctx: RouteContext<"/api/v1/notes/[noteId]">): Promise<string> {
  const parsed = itemIdSchema.safeParse((await ctx.params).noteId);
  if (!parsed.success) throw new ApiError("invalid_request", "Invalid note id.");
  return parsed.data;
}

/** PUT /api/v1/notes/:noteId: create or update (200), or the server's copy on conflict (409). */
export function PUT(request: Request, ctx: RouteContext<"/api/v1/notes/[noteId]">): Promise<Response> {
  return withUser(
    async (user) => {
      const noteId = await parseNoteId(ctx);
      const { note, baseVersion, deviceId } = await readBody(request, putNoteBodySchema);
      if (JSON.stringify(note).length > LIMITS.noteBytes) {
        throw new ApiError("too_large", "This note is too large to sync. Try splitting it into smaller notes.");
      }
      const result = await upsertNote(user.id, noteId, note, baseVersion, deviceId);
      return json(result, result.status === "ok" ? 200 : 409);
    },
    { isWrite: true }
  );
}

/** DELETE /api/v1/notes/:noteId: delete forever (tombstone); 409 if edited elsewhere since. */
export function DELETE(request: Request, ctx: RouteContext<"/api/v1/notes/[noteId]">): Promise<Response> {
  return withUser(
    async (user) => {
      const noteId = await parseNoteId(ctx);
      const { baseVersion, deviceId } = await readBody(request, deleteBodySchema);
      const result = await deleteNote(user.id, noteId, baseVersion, deviceId);
      // Never synced: nothing to delete on the server.
      if (!result) return json({ status: "ok", item: null });
      return json(result, result.status === "ok" ? 200 : 409);
    },
    { isWrite: true }
  );
}
