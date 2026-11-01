"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { AccountSwitchDialog } from "@/components/account/account-switch-dialog";
import { AuthDialog, type AuthMode } from "@/components/account/auth-dialog";
import { ShareDialog } from "@/components/account/share-dialog";
import { SignOutDialog } from "@/components/account/sign-out-dialog";
import { authClient } from "@/lib/auth-client";
import { localStore } from "@/lib/data/local-storage-adapter";
import { claimGuestShares, removeAllGuestShares } from "@/lib/sharing/guest-shares";
import { emitRemoteNoteChanges } from "@/lib/sync/remote-events";
import { syncEngine, type RemoteChangeEvent } from "@/lib/sync/sync-engine";
import { clearOutbox, readMeta, resetMeta } from "@/lib/sync/sync-storage";

export interface AccountUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

/** What the server has configured (passed down from the app layout). */
export interface AccountsConfig {
  /** Sign-in, sync and sharing are available. */
  enabled: boolean;
  /** "Continue with Google" is available. */
  google: boolean;
  /** Images (profile photos, images in notes) can be uploaded to Vercel Blob. */
  imageUploads: boolean;
}

interface OpenAuthOptions {
  mode?: AuthMode;
  /** Shown under the title, e.g. "Sign in to share this note." */
  reason?: string;
}

interface AccountContextValue {
  enabled: boolean;
  /** Images (profile photos, images in notes) can be uploaded. */
  imageUploadsEnabled: boolean;
  user: AccountUser | null;
  /** Session still loading. */
  isPending: boolean;
  /** Opens the sign-in / create-account dialog. */
  openAuth: (options?: OpenAuthOptions) => void;
  /** Opens the sign-out dialog (keep or remove notes on this device). */
  requestSignOut: () => void;
  /** Opens the share dialog (signed in or not). */
  openShare: (noteId: string) => void;
  /** Reloads the signed-in user (e.g. after changing the profile photo). */
  refreshSession: () => Promise<void>;
}

const DISABLED: AccountContextValue = {
  enabled: false,
  imageUploadsEnabled: false,
  user: null,
  isPending: false,
  openAuth: () => undefined,
  requestSignOut: () => undefined,
  openShare: () => undefined,
  refreshSession: async () => undefined,
};

const AccountContext = createContext<AccountContextValue>(DISABLED);

const NOTES_QUERY_KEY = ["notes"] as const;
const CATEGORIES_QUERY_KEY = ["categories"] as const;
/** Better Auth sends Google sign-in problems back as `/notes?error=<code>`. */
const ERROR_PARAM = "error";

function readParam(name: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}

function removeParams(...names: string[]): void {
  const params = new URLSearchParams(window.location.search);
  names.forEach((name) => params.delete(name));
  const query = params.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
}

function describeGoogleError(code: string): string {
  if (code.includes("not_linked") || code.includes("link")) {
    return "An account with this email already exists. Sign in with your email and password.";
  }
  return "Couldn’t sign in with Google. Please try again.";
}

/** Notes on this device other than an untouched welcome note. */
async function hasOwnNotes(): Promise<boolean> {
  const notes = await localStore.readNotes();
  return notes.some((note) => note.createdAt !== note.updatedAt || note.title !== "Welcome to TakeMyNote");
}

interface AuthState {
  open: boolean;
  mode: AuthMode;
  reason: string | null;
}

const AUTH_CLOSED: AuthState = { open: false, mode: "sign-in", reason: null };

/** Accounts on: session, sync engine and the account dialogs. */
interface EnabledAccountProviderProps {
  googleEnabled: boolean;
  imageUploadsEnabled: boolean;
  children: React.ReactNode;
}

function EnabledAccountProvider({ googleEnabled, imageUploadsEnabled, children }: EnabledAccountProviderProps) {
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const session = authClient.useSession();
  const sessionUser = session.data?.user;
  const user = useMemo<AccountUser | null>(
    () =>
      sessionUser
        ? { id: sessionUser.id, name: sessionUser.name, email: sessionUser.email, image: sessionUser.image ?? null }
        : null,
    [sessionUser]
  );

  const [auth, setAuth] = useState<AuthState>(AUTH_CLOSED);
  const [isSignOutOpen, setSignOutOpen] = useState(false);
  const [shareNoteId, setShareNoteId] = useState<string | null>(null);
  const [switchFromAccount, setSwitchFromAccount] = useState(false);
  // Back from Google with a problem to explain.
  const [googleError, setGoogleError] = useState(() => {
    const code = readParam(ERROR_PARAM);
    return code ? describeGoogleError(code) : null;
  });
  const setThemeRef = useRef(setTheme);
  const refetchSessionRef = useRef(session.refetch);
  useEffect(() => {
    setThemeRef.current = setTheme;
    refetchSessionRef.current = session.refetch;
  }, [setTheme, session.refetch]);

  const handleRemoteChange = useCallback(
    ({ noteIds, categoriesChanged }: RemoteChangeEvent) => {
      void queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      if (categoriesChanged) void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      emitRemoteNoteChanges(noteIds);
    },
    [queryClient]
  );

  const startSync = useCallback(
    (userId: string) => {
      syncEngine.start({
        userId,
        setTheme: (value) => setThemeRef.current(value),
        onRemoteChange: handleRemoteChange,
        onSignedOut: () => void session.refetch(),
      });
      // Links made before signing in keep their URLs and now show the synced note.
      void claimGuestShares();
    },
    [handleRemoteChange, session]
  );

  // Start or stop syncing as the session changes.
  const userId = user?.id ?? null;
  useEffect(() => {
    if (!userId) {
      syncEngine.stop();
      return;
    }
    let cancelled = false;
    void (async () => {
      const meta = readMeta();
      const previousAccount = meta.accountId ?? meta.previousAccountId;
      if (previousAccount && previousAccount !== userId && (await hasOwnNotes())) {
        if (!cancelled) setSwitchFromAccount(true);
        return;
      }
      if (!cancelled) startSync(userId);
    })();
    return () => {
      cancelled = true;
    };
    // startSync is stable for a given session; restarting on every render would be wrong.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => () => syncEngine.stop(), []);

  // The theme lives in next-themes; tell sync when it changes.
  useEffect(() => {
    if (theme) syncEngine.notifySettingsChanged();
  }, [theme]);

  // Tidy the address bar once the error has been picked up.
  useEffect(() => {
    if (googleError) removeParams(ERROR_PARAM);
  }, [googleError]);

  const openAuth = useCallback(({ mode = "sign-in", reason }: OpenAuthOptions = {}) => {
    setAuth({ open: true, mode, reason: reason ?? null });
  }, []);

  const closeAuth = () => {
    setAuth(AUTH_CLOSED);
    setGoogleError(null);
  };

  const resolveAccountSwitch = async (choice: "add" | "remove") => {
    if (!userId) return;
    if (choice === "remove") {
      // Notes shared from this browser are going away, so their links go too.
      await removeAllGuestShares();
      await localStore.resetToFreshDevice();
    }
    // Either way, this device now starts fresh with the new account.
    resetMeta();
    clearOutbox();
    setSwitchFromAccount(false);
    await queryClient.invalidateQueries();
    startSync(userId);
  };

  const value = useMemo<AccountContextValue>(
    () => ({
      enabled: true,
      imageUploadsEnabled,
      user,
      isPending: session.isPending,
      openAuth,
      requestSignOut: () => setSignOutOpen(true),
      openShare: setShareNoteId,
      refreshSession: async () => {
        await refetchSessionRef.current();
      },
    }),
    [imageUploadsEnabled, user, session.isPending, openAuth]
  );

  // A Google problem reopens the dialog with the explanation (once the session has loaded).
  const isAuthOpen = auth.open || (googleError !== null && !session.isPending && !userId);

  return (
    <AccountContext.Provider value={value}>
      {children}
      <AuthDialog
        open={isAuthOpen}
        mode={auth.mode}
        onModeChange={(mode) => setAuth((current) => ({ ...current, mode }))}
        onOpenChange={(open) => !open && closeAuth()}
        googleEnabled={googleEnabled}
        reason={auth.reason}
        initialError={googleError}
        onSignedIn={closeAuth}
      />
      <SignOutDialog open={isSignOutOpen} onOpenChange={setSignOutOpen} />
      <ShareDialog
        noteId={shareNoteId}
        mode={session.isPending ? "loading" : userId ? "account" : "guest"}
        onSignIn={() => {
          setShareNoteId(null);
          openAuth({ reason: "Sign in to manage your links from any device." });
        }}
        onClose={() => setShareNoteId(null)}
      />
      <AccountSwitchDialog open={switchFromAccount} onChoose={(choice) => void resolveAccountSwitch(choice)} />
    </AccountContext.Provider>
  );
}

/** Accounts are optional: without server configuration this is a no-op. */
export function AccountProvider({ config, children }: { config: AccountsConfig; children: React.ReactNode }) {
  if (!config.enabled) return <AccountContext.Provider value={DISABLED}>{children}</AccountContext.Provider>;
  return (
    <EnabledAccountProvider googleEnabled={config.google} imageUploadsEnabled={config.imageUploads}>
      {children}
    </EnabledAccountProvider>
  );
}

export function useAccount(): AccountContextValue {
  return useContext(AccountContext);
}
