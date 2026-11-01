import "server-only";

import { del, list, put } from "@vercel/blob";
import sharp from "sharp";

/** Longest side of an image in a note; plenty for a reading column on retina screens. */
const MAX_SIDE = 2400;
/** Refuse "image bombs": huge dimensions that would take lots of memory to decode. */
const MAX_INPUT_PIXELS = 60_000_000;
const ONE_YEAR_SECONDS = 31_536_000;

function folderFor(userId: string): string {
  return `notes/${userId}/`;
}

/**
 * Stores an image added to a note and returns its public URL. Large images
 * are scaled down and everything is re-encoded as WebP (animated GIFs stay
 * animated), which also drops metadata such as GPS location. The random
 * suffix makes each URL unguessable and safe to cache for a year.
 */
export async function uploadNoteImage(userId: string, input: Buffer, contentType: string): Promise<string> {
  const data = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS, animated: contentType === "image/gif" })
    .rotate()
    .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();
  const blob = await put(`${folderFor(userId)}image.webp`, data, {
    access: "public",
    contentType: "image/webp",
    addRandomSuffix: true,
    cacheControlMaxAge: ONE_YEAR_SECONDS,
  });
  return blob.url;
}

/** Deletes every image a user uploaded to notes (account deletion). */
export async function deleteAllNoteImages(userId: string): Promise<void> {
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: folderFor(userId), cursor, limit: 1000 });
    if (page.blobs.length > 0) await del(page.blobs.map((blob) => blob.url));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
}
