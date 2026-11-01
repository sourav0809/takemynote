import { hasImageUploads } from "@/lib/server/env";
import { ApiError, json, withUser } from "@/lib/server/http";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { uploadNoteImage } from "@/lib/server/repositories/note-images";

/** Below Vercel's 4.5 MB request limit; the browser shrinks big photos first. */
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const UPLOADS_PER_HOUR = 60;

/** POST (multipart, field "file"): store an image for a note and return its URL. */
export function POST(request: Request): Promise<Response> {
  return withUser(
    async (user) => {
      if (!hasImageUploads()) throw new ApiError("not_found", "Image uploads aren’t set up on this server.");
      if (!(await checkRateLimit(`image-upload:${user.id}`, UPLOADS_PER_HOUR, 60 * 60))) {
        throw new ApiError("rate_limited", "That’s a lot of images for one hour. Try again a little later.");
      }
      if (Number(request.headers.get("content-length") ?? 0) > MAX_UPLOAD_BYTES) {
        throw new ApiError("too_large", "That image is too large. Try one under 4 MB.");
      }
      const form = await request.formData().catch(() => null);
      const file = form?.get("file");
      if (!(file instanceof File)) throw new ApiError("invalid_request", "Choose an image to upload.");
      if (!ACCEPTED_TYPES.has(file.type)) throw new ApiError("invalid_request", "Use a JPG, PNG, WebP, GIF or AVIF image.");
      if (file.size > MAX_UPLOAD_BYTES) throw new ApiError("too_large", "That image is too large. Try one under 4 MB.");

      try {
        return json({ url: await uploadNoteImage(user.id, Buffer.from(await file.arrayBuffer()), file.type) });
      } catch (error) {
        if (error instanceof Error && /unsupported|corrupt|input/i.test(error.message)) {
          throw new ApiError("invalid_request", "That file couldn’t be read as an image.");
        }
        throw error;
      }
    },
    { isWrite: true }
  );
}
