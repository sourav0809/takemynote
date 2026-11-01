import "server-only";

import { collections } from "@/lib/server/db";
import type { SettingsDoc } from "@/lib/server/documents";
import type { RemoteSettings, SettingsInput } from "@/lib/sync/schemas";

function toRemoteSettings(doc: SettingsDoc): RemoteSettings {
  return {
    preferences: doc.preferences,
    onboardingCompleted: doc.onboardingCompleted,
    ai: doc.ai,
    version: doc.version,
  };
}

export async function getSettings(userId: string): Promise<RemoteSettings | null> {
  const doc = await (await collections.settings()).findOne({ userId });
  return doc ? toRemoteSettings(doc) : null;
}

/** Settings are small and rarely edited on two devices at once: the last write wins. */
export async function saveSettings(userId: string, settings: SettingsInput, deviceId: string): Promise<RemoteSettings> {
  const doc = await (await collections.settings()).findOneAndUpdate(
    { userId },
    {
      $set: {
        preferences: settings.preferences,
        onboardingCompleted: settings.onboardingCompleted,
        ai: settings.ai,
        serverUpdatedAt: new Date(),
        lastDeviceId: deviceId,
      },
      $inc: { version: 1 },
      $setOnInsert: { userId },
    },
    { upsert: true, returnDocument: "after" }
  );
  return toRemoteSettings(doc!);
}
