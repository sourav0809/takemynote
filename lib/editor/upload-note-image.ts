const UPLOAD_ENDPOINT = "/api/v1/uploads/image";
/** Bigger photos are scaled down in the browser before upload (the server caps at 2400px anyway). */
const MAX_SIDE = 2400;
/** Stay under the 4 MB upload limit. */
const MAX_UPLOAD_BYTES = 3.8 * 1024 * 1024;

/** Error with a message that's fine to show the user. */
export class ImageUploadError extends Error {}

/** Scales a large photo down and re-encodes it (GIFs are kept as they are, to stay animated). */
async function prepare(file: File): Promise<Blob> {
  if (file.type === "image/gif") {
    if (file.size > MAX_UPLOAD_BYTES) throw new ImageUploadError("That GIF is too large. Try one under 4 MB.");
    return file;
  }
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" }).catch(() => {
    throw new ImageUploadError("That image type isn’t supported. Try a JPG or PNG.");
  });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= MAX_UPLOAD_BYTES) {
    bitmap.close();
    return file;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.88));
  if (!blob || blob.size > MAX_UPLOAD_BYTES) throw new ImageUploadError("That image is too large. Try a smaller one.");
  return blob;
}

/** Uploads an image for a note and returns its URL (stored in Vercel Blob). */
export async function uploadNoteImage(file: File): Promise<string> {
  const body = new FormData();
  const prepared = await prepare(file);
  body.append("file", prepared, file.name || "image");

  let response: Response;
  try {
    response = await fetch(UPLOAD_ENDPOINT, { method: "POST", body });
  } catch {
    throw new ImageUploadError("Couldn’t upload the image. Check your connection.");
  }
  const data = (await response.json().catch(() => null)) as { url?: string; error?: { message?: string } } | null;
  if (!response.ok || !data?.url) throw new ImageUploadError(data?.error?.message ?? "Couldn’t upload the image. Try again.");
  return data.url;
}
