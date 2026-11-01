"use client";

import { Check, Copy, Globe, Loader2, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useNotes } from "@/hooks/use-notes";
import { localStore } from "@/lib/data/local-storage-adapter";
import {
  claimGuestShares,
  disableGuestShare,
  enableGuestShare,
  getGuestShareInfo,
  NOT_SHARED,
} from "@/lib/sharing/guest-shares";
import type { ShareInfo } from "@/lib/sync/schemas";
import { syncApi, type ApiOutcome } from "@/lib/sync/sync-api";
import { syncEngine } from "@/lib/sync/sync-engine";

/** Signed in (the link shows the synced note) or a guest (the link shows a copy kept up to date by this browser). */
type ShareMode = "account" | "guest";

interface ShareDialogProps {
  /** The note to share, or null when closed. */
  noteId: string | null;
  /** "loading" while the session is still being checked. */
  mode: ShareMode | "loading";
  /** Guests: sign in to keep links with an account. */
  onSignIn: () => void;
  onClose: () => void;
}

/** "Anyone with the link can view": turn a note's public link on or off. */
export function ShareDialog({ noteId, mode, onSignIn, onClose }: ShareDialogProps) {
  return (
    <Dialog open={noteId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-5 sm:max-w-md">
        {/* Keyed by note and mode, so each starts from a fresh state. */}
        {noteId && mode === "loading" && <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />}
        {noteId && mode !== "loading" && (
          <ShareDialogBody key={`${noteId}:${mode}`} noteId={noteId} mode={mode} onSignIn={onSignIn} />
        )}
      </DialogContent>
    </Dialog>
  );
}

async function loadShare(noteId: string, mode: ShareMode): Promise<ApiOutcome<ShareInfo>> {
  if (mode === "guest") return getGuestShareInfo(noteId);
  // A link made before signing in that hasn't moved to the account yet.
  await claimGuestShares();
  return syncApi.getShare(noteId);
}

async function turnOn(noteId: string, mode: ShareMode): Promise<ApiOutcome<ShareInfo>> {
  if (mode === "guest") {
    const note = (await localStore.readNotes()).find((candidate) => candidate.id === noteId);
    return note ? enableGuestShare(note) : { kind: "not_found", message: "" };
  }
  // The public page shows the account's copy, so the note must be synced first.
  if (!(await syncEngine.syncNote(noteId))) return { kind: "retry" };
  return syncApi.enableShare(noteId);
}

function turnOff(noteId: string, mode: ShareMode): Promise<ApiOutcome<ShareInfo>> {
  return mode === "guest" ? disableGuestShare(noteId) : syncApi.disableShare(noteId);
}

function describeFailure(outcome: ApiOutcome<ShareInfo>, turningOn: boolean): string {
  if (outcome.kind === "too_large") return "This note is too large to share. Try splitting it into smaller notes.";
  if (outcome.kind === "retry" && !outcome.unreachable && turningOn) {
    return "Couldn’t create the link right now. Try again in a little while.";
  }
  if (outcome.kind === "retry" && outcome.unreachable) return "You’re offline. Check your connection and try again.";
  return turningOn ? "Couldn’t create the link. Try again in a moment." : "Couldn’t turn the link off. Try again in a moment.";
}

interface ShareDialogBodyProps {
  noteId: string;
  mode: ShareMode;
  onSignIn: () => void;
}

function ShareDialogBody({ noteId, mode, onSignIn }: ShareDialogBodyProps) {
  const { data: notes } = useNotes();
  const note = notes.find((candidate) => candidate.id === noteId);
  const [info, setInfo] = useState<ShareInfo | null>(null);
  const [isWorking, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadShare(noteId, mode).then((outcome) => {
      if (cancelled) return;
      if (outcome.kind === "ok") setInfo(outcome.data);
      else {
        setInfo(NOT_SHARED);
        setError("Couldn’t check sharing right now. Check your connection.");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [noteId, mode]);

  const toggle = async (shared: boolean) => {
    setWorking(true);
    setError(null);
    try {
      const outcome = await (shared ? turnOn(noteId, mode) : turnOff(noteId, mode));
      if (outcome.kind === "ok") setInfo(outcome.data);
      else setError(describeFailure(outcome, shared));
    } finally {
      setWorking(false);
    }
  };

  const copy = async () => {
    if (!info?.url) return;
    await navigator.clipboard.writeText(info.url);
    setCopied(true);
    toast.success("Link copied");
    window.setTimeout(() => setCopied(false), 2000);
  };

  const isShared = info?.shared ?? false;

  return (
    <>
      <DialogHeader className="pr-10">
        <DialogTitle className="text-lg">Share “{note?.title.trim() || "Untitled"}”</DialogTitle>
        <DialogDescription>Anyone with the link can read this note. They can’t edit it.</DialogDescription>
      </DialogHeader>

      <label className="flex items-center gap-3 rounded-2xl border border-border p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          {isShared ? <Globe className="size-4 text-primary" /> : <Lock className="size-4" />}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm font-medium">Anyone with the link can view</span>
          <span className="text-xs text-muted-foreground">
            {isShared ? "On. Turn off to stop the link working." : "Off. Only you can see this note."}
          </span>
        </span>
        {info === null || isWorking ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : (
          <Switch checked={isShared} onCheckedChange={(checked) => void toggle(checked)} aria-label="Share with a public link" />
        )}
      </label>

      {isShared && info?.url && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input readOnly value={info.url} aria-label="Public link" className="h-10 font-mono text-[13px]" onFocus={(event) => event.target.select()} />
            <Button className="h-10 shrink-0 gap-1.5 px-4" onClick={() => void copy()}>
              {isCopied ? <Check /> : <Copy />}
              {isCopied ? "Copied" : "Copy"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {mode === "guest" ? "Updates a few seconds after you edit" : "Shows the latest synced version"} · Opened{" "}
            {info.viewCount} {info.viewCount === 1 ? "time" : "times"}
          </p>
        </div>
      )}

      {mode === "guest" && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          {isShared ? "Only this browser can change or turn off this link. " : "No account needed. "}
          <button type="button" onClick={onSignIn} className="font-medium text-primary hover:underline">
            Sign in
          </button>{" "}
          to manage your links from any device.
        </p>
      )}

      {note?.trashed && isShared && (
        <p className="text-sm text-muted-foreground">This note is in the trash, so the link shows “not available” until you restore it.</p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </>
  );
}
