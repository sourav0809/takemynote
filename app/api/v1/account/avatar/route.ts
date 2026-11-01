import { headers } from "next/headers";

import { getAuth } from "@/lib/server/auth";
import { hasImageUploads } from "@/lib/server/env";
import { ApiError, json, withUser } from "@/lib/server/http";
import { deleteStoredAvatar, uploadAvatar } from "@/lib/server/repositories/avatars";

/** Below Vercel's 4.5 MB request limit; the browser shrinks photos before upload anyway. */
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

/** Points the account's profile picture at a new URL (or clears it). */
async function setProfileImage(image: string | null): Promise<void> {
  await getAuth()!.api.updateUser({ body: { image }, headers: await headers() });
}

function requirePhotoUploads(): void {
  if (!hasImageUploads()) throw new ApiError("not_found", "Photo uploads aren’t set up on this server.");
}

/** PUT (multipart, field "photo"): replace your profile photo. */
export function PUT(request: Request): Promise<Response> {
  return withUser(
    async (user) => {
      requirePhotoUploads();
      if (Number(request.headers.get("content-length") ?? 0) > MAX_UPLOAD_BYTES) {
        throw new ApiError("too_large", "That photo is too large. Try one under 4 MB.");
      }
      const form = await request.formData().catch(() => null);
      const photo = form?.get("photo");
      if (!(photo instanceof File)) throw new ApiError("invalid_request", "Choose a photo to upload.");
      if (!ACCEPTED_TYPES.has(photo.type)) {
        throw new ApiError("invalid_request", "Use a JPG, PNG, WebP, GIF or AVIF image.");
      }
      if (photo.size > MAX_UPLOAD_BYTES) throw new ApiError("too_large", "That photo is too large. Try one under 4 MB.");

      let image: string;
      try {
        image = await uploadAvatar(user.id, Buffer.from(await photo.arrayBuffer()));
      } catch (error) {
        // Sharp rejects files that aren't really images; anything else is a storage problem.
        if (error instanceof Error && /unsupported|corrupt|input/i.test(error.message)) {
          throw new ApiError("invalid_request", "That file couldn’t be read as an image.");
        }
        throw error;
      }
      await setProfileImage(image);
      // The previous upload is no longer used.
      await deleteStoredAvatar(user.image);
      return json({ image });
    },
    { isWrite: true }
  );
}

/** DELETE: remove your profile photo (back to initials). */
export function DELETE(): Promise<Response> {
  return withUser(
    async (user) => {
      await setProfileImage(null);
      await deleteStoredAvatar(user.image);
      return json({ image: null });
    },
    { isWrite: true }
  );
}
