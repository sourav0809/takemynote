import { ApiError, json, readBody, withUser } from "@/lib/server/http";
import { upsertCategory } from "@/lib/server/repositories/categories";
import { upsertNote } from "@/lib/server/repositories/notes";
import { importBodySchema, LIMITS, type ImportResult } from "@/lib/sync/schemas";

/**
 * POST /api/v1/sync/import: a device's notes and categories on first sign-in,
 * in batches. Each item is an idempotent upsert, so a retried batch is safe.
 */
export function POST(request: Request): Promise<Response> {
  return withUser(
    async (user) => {
      const body = await readBody(request, importBodySchema);
      if (body.notes.some(({ note }) => JSON.stringify(note).length > LIMITS.noteBytes)) {
        throw new ApiError("too_large", "A note is too large to sync.");
      }

      // Categories first, so notes can keep their category.
      const result: ImportResult = { categories: [], notes: [] };
      for (const { id, category, baseVersion } of body.categories) {
        result.categories.push({ id, result: await upsertCategory(user.id, id, category, baseVersion, body.deviceId) });
      }
      for (const { id, note, baseVersion } of body.notes) {
        result.notes.push({ id, result: await upsertNote(user.id, id, note, baseVersion, body.deviceId) });
      }
      return json(result);
    },
    { isWrite: true }
  );
}
