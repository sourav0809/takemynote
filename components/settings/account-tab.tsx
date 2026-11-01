"use client";

import { Check, Lock, RefreshCw } from "lucide-react";
import { useState } from "react";

import { UserAvatar } from "@/components/account/account-menu";
import { useAccount } from "@/components/account/account-provider";
import { DeleteAccountDialog } from "@/components/account/delete-account-dialog";
import { ProfilePhoto } from "@/components/account/profile-photo";
import { SyncStatusLabel } from "@/components/account/sync-status-label";
import { Button } from "@/components/ui/button";
import { useSyncStatus } from "@/hooks/use-sync-status";
import { syncEngine } from "@/lib/sync/sync-engine";

const SYNCED = ["Notes and categories", "Favorites, pins and the trash", "Layout, writing area, theme and sorting", "AI provider, model and your writing style"];

function formatSince(iso: string | null): string {
  if (!iso) return "Not yet";
  const minutes = Math.round((Date.now() - Date.parse(iso)) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `${hours} h ago` : new Date(iso).toLocaleDateString();
}

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <h3 className="text-sm font-semibold">{title}</h3>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}

/** Settings → Account: sign in, sync status, sign out, delete account. */
export function AccountTab() {
  const { user, requestSignOut, openAuth, imageUploadsEnabled } = useAccount();
  const status = useSyncStatus();
  const [isSyncing, setSyncing] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex flex-col gap-6">
        <SectionHeading
          title="Sync your notes"
          description="Optional. Create a free account to keep your notes on every device you use and manage your shared links from anywhere."
        />
        <div className="flex flex-wrap gap-2">
          <Button className="h-10 px-4" onClick={() => openAuth({ mode: "sign-up" })}>
            Create account
          </Button>
          <Button variant="outline" className="h-10 px-4" onClick={() => openAuth({ mode: "sign-in" })}>
            Sign in
          </Button>
        </div>
        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
          {SYNCED.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check className="size-4 shrink-0 text-primary" />
              {item}
            </li>
          ))}
        </ul>
        <p className="flex gap-2.5 rounded-2xl bg-muted/60 p-4 text-xs leading-relaxed text-muted-foreground">
          <Lock className="mt-0.5 size-3.5 shrink-0" />
          <span>
            Without an account, notes stay only in this browser. Your AI key always stays on this device and is never
            synced.
          </span>
        </p>
      </div>
    );
  }

  const syncNow = async () => {
    setSyncing(true);
    try {
      await syncEngine.syncNow();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="flex items-center gap-4">
        {imageUploadsEnabled ? <ProfilePhoto user={user} /> : <UserAvatar user={user} className="size-14" />}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium">{user.name || "Your account"}</span>
          <span className="truncate text-sm text-muted-foreground">{user.email}</span>
        </div>
        <Button variant="outline" className="h-9 shrink-0" onClick={requestSignOut}>
          Sign out
        </Button>
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-6">
        <SectionHeading title="Sync" description="Changes save on this device first and reach your account a moment later." />
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-4">
          <div className="flex flex-col gap-0.5 text-sm">
            <SyncStatusLabel className="font-medium" />
            <span className="text-xs text-muted-foreground">Last synced: {formatSince(status.lastSyncedAt)}</span>
            {status.message && <span className="text-xs text-muted-foreground">{status.message}</span>}
          </div>
          <Button variant="secondary" className="h-9 gap-2" disabled={isSyncing} onClick={() => void syncNow()}>
            <RefreshCw className={isSyncing ? "animate-spin" : undefined} />
            Sync now
          </Button>
        </div>
        <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          {SYNCED.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check className="size-4 shrink-0 text-primary" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          Not synced: your AI key (it never leaves this device) and the collapsed-sidebar state.
        </p>
      </section>

      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <SectionHeading
          title="Delete account"
          description="Deletes your account and everything synced to it. Notes on this device are kept."
        />
        <Button variant="destructive" className="h-9 self-start" onClick={() => setDeleteOpen(true)}>
          Delete account…
        </Button>
      </section>

      <DeleteAccountDialog open={isDeleteOpen} onOpenChange={setDeleteOpen} />
    </div>
  );
}
