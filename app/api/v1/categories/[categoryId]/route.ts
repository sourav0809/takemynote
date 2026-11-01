import { ApiError, json, readBody, withUser } from "@/lib/server/http";
import { deleteCategory, upsertCategory } from "@/lib/server/repositories/categories";
import { deleteBodySchema, itemIdSchema, putCategoryBodySchema } from "@/lib/sync/schemas";

async function parseCategoryId(ctx: RouteContext<"/api/v1/categories/[categoryId]">): Promise<string> {
  const parsed = itemIdSchema.safeParse((await ctx.params).categoryId);
  if (!parsed.success) throw new ApiError("invalid_request", "Invalid category id.");
  return parsed.data;
}

/** PUT /api/v1/categories/:categoryId: create or rename (409 with the server's copy on conflict). */
export function PUT(request: Request, ctx: RouteContext<"/api/v1/categories/[categoryId]">): Promise<Response> {
  return withUser(
    async (user) => {
      const categoryId = await parseCategoryId(ctx);
      const { category, baseVersion, deviceId } = await readBody(request, putCategoryBodySchema);
      const result = await upsertCategory(user.id, categoryId, category, baseVersion, deviceId);
      return json(result, result.status === "ok" ? 200 : 409);
    },
    { isWrite: true }
  );
}

/** DELETE /api/v1/categories/:categoryId: delete and unassign its notes. */
export function DELETE(request: Request, ctx: RouteContext<"/api/v1/categories/[categoryId]">): Promise<Response> {
  return withUser(
    async (user) => {
      const categoryId = await parseCategoryId(ctx);
      const { deviceId } = await readBody(request, deleteBodySchema);
      const item = await deleteCategory(user.id, categoryId, deviceId);
      return json({ status: "ok", item });
    },
    { isWrite: true }
  );
}
