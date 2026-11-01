import "server-only";

import { del, put } from "@vercel/blob";
import sharp from "sharp";

/** Final size of a profile photo (square, shown at most ~56px, 2–4× for sharp screens). */
const AVATAR_SIZE = 256;
/** Refuse "image bombs": huge dimensions that would take lots of memory to decode. */
const MAX_INPUT_PIXELS = 40_000_000;
const ONE_YEAR_SECONDS = 31_536_000;
/** Our uploads live under this folder in the Blob store. */
const AVATAR_FOLDER = "avatars/";

/**
 * Turns any supported upload into a small square WebP. Re-encoding also drops
 * metadata such as camera details and GPS location.
 */
async function toAvatarWebp(input: Buffer): Promise<Buffer> {
  return sharp(input, { limitInputPixels: MAX_INPUT_PIXELS })
    .rotate() // respect the photo's orientation before metadata is removed
    .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover", position: "attention" })
    .webp({ quality: 82 })
    .toBuffer();
}

/**
 * Stores a new profile photo in Vercel Blob and returns its public URL. A
 * random suffix makes every upload a new, unguessable URL, so it can be cached
 * for a year.
 */
export async function uploadAvatar(userId: string, input: Buffer): Promise<string> {
  const data = await toAvatarWebp(input);
  const blob = await put(`${AVATAR_FOLDER}${userId}.webp`, data, {
    access: "public",
    contentType: "image/webp",
    addRandomSuffix: true,
    cacheControlMaxAge: ONE_YEAR_SECONDS,
  });
  return blob.url;
}

/** True for photos we uploaded (not, say, a Google profile picture). */
function isStoredAvatar(url: string): boolean {
  try {
    const { hostname, pathname } = new URL(url);
    return hostname.endsWith(".blob.vercel-storage.com") && pathname.startsWith(`/${AVATAR_FOLDER}`);
  } catch {
    return false;
  }
}

/** Deletes one of our stored photos. Never fails the caller: a leftover file is harmless. */
export async function deleteStoredAvatar(url: string | null | undefined): Promise<void> {
  if (!url || !isStoredAvatar(url)) return;
  await del(url).catch(() => undefined);
}
