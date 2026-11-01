import { json, readBody, withUser } from "@/lib/server/http";
import { getSettings, saveSettings } from "@/lib/server/repositories/settings";
import { putSettingsBodySchema } from "@/lib/sync/schemas";

/** GET /api/v1/settings: the account's synced settings, or null if none yet. */
export function GET(): Promise<Response> {
  return withUser(async (user) => json({ settings: await getSettings(user.id) }));
}

/** PUT /api/v1/settings: save synced settings (last write wins). */
export function PUT(request: Request): Promise<Response> {
  return withUser(
    async (user) => {
      const { settings, deviceId } = await readBody(request, putSettingsBodySchema);
      return json({ settings: await saveSettings(user.id, settings, deviceId) });
    },
    { isWrite: true }
  );
}
