"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

import { useAccount } from "@/components/account/account-provider";
import { ImageUploadError, uploadNoteImage } from "@/lib/editor/upload-note-image";

type UploadFile = (file: File) => Promise<string>;

/**
 * The editor's image upload: signed in → stored in Vercel Blob; guest → asked
 * to sign in (adding an image from a link still works). Undefined when uploads
 * aren't configured, which hides the editor's Upload tab.
 */
export function useNoteImageUpload(): UploadFile | undefined {
  const account = useAccount();
  // The editor keeps the function it was created with; read the latest account state.
  const accountRef = useRef(account);
  useEffect(() => {
    accountRef.current = account;
  }, [account]);

  const upload = useCallback<UploadFile>(async (file) => {
    const { user, openAuth } = accountRef.current;
    if (!user) {
      openAuth({ reason: "Sign in to upload images. You can still add an image from a link." });
      throw new ImageUploadError("Sign in to upload images.");
    }
    try {
      return await uploadNoteImage(file);
    } catch (error) {
      toast.error(error instanceof ImageUploadError ? error.message : "Couldn’t upload the image. Try again.");
      throw error;
    }
  }, []);

  return account.enabled && account.imageUploadsEnabled ? upload : undefined;
}
