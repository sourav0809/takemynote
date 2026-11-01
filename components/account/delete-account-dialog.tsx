"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { useAccount } from "@/components/account/account-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { syncEngine } from "@/lib/sync/sync-engine";
import { clearOutbox, resetMeta } from "@/lib/sync/sync-storage";

const CONFIRM_WORD = "delete";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Deletes the account and everything stored in it. The copy on this device
 * is kept, so nothing disappears by surprise.
 */
export function DeleteAccountDialog({ open, onOpenChange }: DeleteAccountDialogProps) {
  const { openAuth } = useAccount();
  const [confirmation, setConfirmation] = useState("");
  const [isWorking, setWorking] = useState(false);
  const [needsFreshSignIn, setNeedsFreshSignIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAccount = async () => {
    setWorking(true);
    setError(null);
    try {
      const { error: deleteError } = await authClient.deleteUser();
      if (deleteError) {
        // For safety, deleting needs a sign-in from the last day.
        if (deleteError.code === "SESSION_EXPIRED") setNeedsFreshSignIn(true);
        else setError("Couldn’t delete the account. Try again in a moment.");
        return;
      }
      syncEngine.stop();
      resetMeta();
      clearOutbox();
      window.location.reload();
    } finally {
      setWorking(false);
    }
  };

  const close = (next: boolean) => {
    if (isWorking) return;
    if (!next) {
      setConfirmation("");
      setError(null);
      setNeedsFreshSignIn(false);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="gap-5 sm:max-w-md">
        <DialogHeader className="pr-10">
          <DialogTitle className="text-lg">Delete your account?</DialogTitle>
          <DialogDescription>
            This permanently deletes your account and everything synced to it: notes, categories, settings and shared
            links. The copy on this device stays, and you can keep using TakeMyNote without an account.
          </DialogDescription>
        </DialogHeader>

        {needsFreshSignIn ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              For your security, please sign in again, then delete your account from Settings → Account.
            </p>
            <Button
              variant="outline"
              className="h-10"
              onClick={() => {
                close(false);
                openAuth({ reason: "Sign in again, then delete your account from Settings → Account." });
              }}
            >
              Sign in again
            </Button>
          </div>
        ) : (
          <>
            <label className="flex flex-col gap-2 text-sm">
              <span>
                Type <span className="font-mono font-semibold">{CONFIRM_WORD}</span> to confirm
              </span>
              <Input
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                className="h-10"
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="ghost" className="h-10" disabled={isWorking} onClick={() => close(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="h-10"
                disabled={confirmation.trim().toLowerCase() !== CONFIRM_WORD || isWorking}
                onClick={() => void deleteAccount()}
              >
                {isWorking && <Loader2 className="animate-spin" />}
                Delete account
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
