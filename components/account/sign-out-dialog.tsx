"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { localStore } from "@/lib/data/local-storage-adapter";
import { syncEngine } from "@/lib/sync/sync-engine";
import { clearOutbox, readMeta, resetMeta, writeMeta } from "@/lib/sync/sync-storage";
import { cn } from "@/lib/utils";

type Choice = "remove" | "keep";

const CHOICES: { value: Choice; title: string; description: string }[] = [
  {
    value: "remove",
    title: "Remove notes from this device",
    description: "Best on a shared or public computer. They stay safe in your account.",
  },
  {
    value: "keep",
    title: "Keep a copy on this device",
    description: "You can keep writing here without an account. Sign in again to sync.",
  },
];

interface SignOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Sends any unsynced changes, then signs out and keeps or removes this device's copy. */
export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const [choice, setChoice] = useState<Choice>("remove");
  const [isWorking, setWorking] = useState(false);
  const [unsynced, setUnsynced] = useState(0);

  const signOut = async (force: boolean) => {
    setWorking(true);
    try {
      if (!force) {
        const status = await syncEngine.syncNow();
        if (status.pending > 0 && choice === "remove") {
          setUnsynced(status.pending);
          return;
        }
      }
      const meta = readMeta();
      await authClient.signOut();
      syncEngine.stop();
      if (choice === "remove") {
        await localStore.resetToFreshDevice();
        clearOutbox();
        resetMeta();
      } else {
        // Edits made while signed out are uploaded at the next sign-in.
        writeMeta({ ...meta, accountId: null, previousAccountId: meta.accountId ?? meta.previousAccountId });
      }
      // A full reload resets every in-memory cache to the new state.
      window.location.reload();
    } finally {
      setWorking(false);
    }
  };

  const close = (next: boolean) => {
    if (isWorking) return;
    if (!next) setUnsynced(0);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="gap-5 sm:max-w-md">
        <DialogHeader className="pr-10">
          <DialogTitle className="text-lg">{unsynced > 0 ? "Some changes haven’t synced" : "Sign out?"}</DialogTitle>
          <DialogDescription>
            {unsynced > 0
              ? `${unsynced} ${unsynced === 1 ? "change hasn’t" : "changes haven’t"} reached your account yet, probably because you’re offline. If you remove notes from this device now, ${unsynced === 1 ? "it" : "they"} will be lost.`
              : "Your notes are saved in your account. What should happen to the copy on this device?"}
          </DialogDescription>
        </DialogHeader>

        {unsynced === 0 && (
          <div role="radiogroup" aria-label="After signing out" className="flex flex-col gap-2">
            {CHOICES.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={choice === option.value}
                onClick={() => setChoice(option.value)}
                className={cn(
                  "flex flex-col gap-0.5 rounded-xl border px-4 py-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  choice === option.value ? "border-primary ring-1 ring-primary" : "border-border hover:border-foreground/25"
                )}
              >
                <span className="text-sm font-medium">{option.title}</span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" className="h-10" disabled={isWorking} onClick={() => close(false)}>
            Cancel
          </Button>
          {unsynced > 0 ? (
            <>
              <Button variant="outline" className="h-10" disabled={isWorking} onClick={() => { setChoice("keep"); setUnsynced(0); }}>
                Keep a copy instead
              </Button>
              <Button variant="destructive" className="h-10" disabled={isWorking} onClick={() => void signOut(true)}>
                Sign out anyway
              </Button>
            </>
          ) : (
            <Button className="h-10 px-4" disabled={isWorking} onClick={() => void signOut(false)}>
              {isWorking && <Loader2 className="animate-spin" />}
              {isWorking ? "Syncing…" : "Sign out"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
