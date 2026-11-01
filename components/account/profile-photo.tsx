"use client";

import { Camera, ImageUp, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { UserAvatar } from "@/components/account/account-menu";
import { useAccount, type AccountUser } from "@/components/account/account-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AVATAR_ENDPOINT = "/api/v1/account/avatar";
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";
/** Photos are shrunk in the browser first, so even big phone photos upload quickly. */
const UPLOAD_MAX_SIDE = 512;

/** Draws the photo onto a canvas at most `UPLOAD_MAX_SIDE` wide/tall and returns a WebP. */
async function shrinkPhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, UPLOAD_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.9));
  if (!blob) throw new Error("Could not encode image");
  return blob;
}

async function readError(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
  return body?.error?.message ?? "Couldn’t update your photo. Try again.";
}

/** The account avatar, with a menu to upload a new photo or remove it. */
export function ProfilePhoto({ user }: { user: AccountUser }) {
  const { refreshSession } = useAccount();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isWorking, setWorking] = useState(false);

  const upload = async (file: File) => {
    setWorking(true);
    try {
      let photo: Blob;
      try {
        photo = await shrinkPhoto(file);
      } catch {
        toast.error("That image type isn’t supported. Try a JPG or PNG.");
        return;
      }
      const form = new FormData();
      form.append("photo", photo, "photo.webp");
      const response = await fetch(AVATAR_ENDPOINT, { method: "PUT", body: form });
      if (!response.ok) {
        toast.error(await readError(response));
        return;
      }
      await refreshSession();
      toast.success("Profile photo updated");
    } catch {
      toast.error("Couldn’t reach TakeMyNote. Check your connection.");
    } finally {
      setWorking(false);
    }
  };

  const remove = async () => {
    setWorking(true);
    try {
      const response = await fetch(AVATAR_ENDPOINT, { method: "DELETE" });
      if (!response.ok) {
        toast.error(await readError(response));
        return;
      }
      await refreshSession();
      toast.success("Profile photo removed");
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isWorking}
          aria-label="Change profile photo"
          className="group relative shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <UserAvatar user={user} className="size-14" />
          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            {!isWorking && <Camera className="size-5" />}
          </span>
          {isWorking && (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-white">
              <Loader2 className="size-5 animate-spin" />
            </span>
          )}
          {/* Always-visible hint that the photo can be changed. */}
          <span
            aria-hidden
            className="absolute -right-0.5 -bottom-0.5 flex size-6 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground"
          >
            <Camera className="size-3" />
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => inputRef.current?.click()}>
              <ImageUp />
              Upload new photo
            </DropdownMenuItem>
            {user.image && (
              <DropdownMenuItem variant="destructive" onClick={() => void remove()}>
                <Trash2 />
                Remove photo
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void upload(file);
        }}
      />
    </>
  );
}
