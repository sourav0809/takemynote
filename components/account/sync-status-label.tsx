"use client";

import { CloudCheck, CloudOff, LoaderCircle, TriangleAlert } from "lucide-react";

import { useSyncStatus } from "@/hooks/use-sync-status";
import { readOutboxEntry } from "@/lib/sync/sync-storage";
import { cn } from "@/lib/utils";

interface SyncStatusLabelProps {
  /** Show the state of one note (e.g. in its meta line); otherwise the whole account. */
  noteId?: string;
  className?: string;
}

/** "Synced", "Syncing…", "Offline · will sync"… Nothing when not signed in. */
export function SyncStatusLabel({ noteId, className }: SyncStatusLabelProps) {
  const status = useSyncStatus();
  if (status.state === "disabled") return null;

  const notePending = noteId ? readOutboxEntry("note", noteId) : null;
  const isPending = noteId ? notePending !== null && !notePending.blocked : status.pending > 0;
  const isBlocked = noteId ? Boolean(notePending?.blocked) : status.state === "error";

  const { icon: Icon, label, tone } =
    status.state === "signed-out"
      ? { icon: TriangleAlert, label: "Sign in again to sync", tone: "text-amber-600 dark:text-amber-400" }
      : isBlocked
        ? { icon: TriangleAlert, label: notePending?.blocked === "too_large" ? "Too large to sync" : "Couldn’t sync", tone: "text-destructive" }
        : status.state === "offline" && isPending
          ? { icon: CloudOff, label: "Offline · will sync", tone: "" }
          : isPending || status.state === "syncing"
            ? { icon: LoaderCircle, label: "Syncing…", tone: "" }
            : { icon: CloudCheck, label: "Synced", tone: "" };

  return (
    <span className={cn("inline-flex items-center gap-1", tone, className)} aria-live="polite">
      <Icon className={cn("size-3.5", Icon === LoaderCircle && "animate-spin")} aria-hidden />
      {label}
    </span>
  );
}
