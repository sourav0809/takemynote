import { json, withUser } from "@/lib/server/http";
import { getChanges } from "@/lib/server/repositories/changes";

/** GET /api/v1/sync?cursor=… → notes, categories and settings changed since the cursor. */
export function GET(request: Request): Promise<Response> {
  return withUser(async (user) => {
    const cursor = new URL(request.url).searchParams.get("cursor");
    return json(await getChanges(user.id, cursor));
  });
}
