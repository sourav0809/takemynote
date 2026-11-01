import { localStore } from "@/lib/data/local-storage-adapter";
import type { GuestShareNote, ShareInfo } from "@/lib/sync/schemas";
import { guestShareApi, type ApiOutcome } from "@/lib/sync/sync-api";
import type { Note } from "@/types/note";

/**
 * Sharing without an account. A guest's notes live only in this browser, so
 * sharing publishes a copy of that one note, and this browser keeps the copy
 * up to date a few seconds after each edit. The key that controls a link is
 * kept here only; signing in moves the link into the account (same URL).
 */

const STORAGE_KEY = "takemynote:guest-shares";
/** Wait for a pause in typing before updating the shared copy. */
const UPDATE_DELAY_MS = 2_000;
/** After a failed update (offline, rate limit), try again this much later. */
const RETRY_DELAY_MS = 30_000;

interface StoredGuestShare {
  token: string;
  key: string;
}

/** Links by note id. */
type GuestShareMap = Record<string, StoredGuestShare>;

export const NOT_SHARED: ShareInfo = { shared: false, url: null, createdAt: null, viewCount: 0 };

function readMap(): GuestShareMap {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as GuestShareMap;
  } catch {
    return {};
  }
}

function writeMap(map: GuestShareMap): void {
  if (Object.keys(map).length === 0) window.localStorage.removeItem(STORAGE_KEY);
  else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

function forget(noteId: string): void {
  const map = readMap();
  delete map[noteId];
  writeMap(map);
}

export function isGuestShared(noteId: string): boolean {
  return typeof window !== "undefined" && noteId in readMap();
}

function toGuestShareNote(note: Note): GuestShareNote {
  return {
    title: note.title,
    content: note.content as unknown as GuestShareNote["content"],
    trashed: note.trashed,
    updatedAt: note.updatedAt,
  };
}

/** Is this note shared from this browser? Forgets links that no longer exist. */
export async function getGuestShareInfo(noteId: string): Promise<ApiOutcome<ShareInfo>> {
  const stored = readMap()[noteId];
  if (!stored) return { kind: "ok", data: NOT_SHARED };
  const outcome = await guestShareApi.get(stored.token, stored.key);
  if (outcome.kind === "not_found") {
    forget(noteId);
    return { kind: "ok", data: NOT_SHARED };
  }
  return outcome;
}

export async function enableGuestShare(note: Note): Promise<ApiOutcome<ShareInfo>> {
  const outcome = await guestShareApi.create(note.id, toGuestShareNote(note));
  if (outcome.kind === "conflict") return { kind: "retry" };
  if (outcome.kind !== "ok") return outcome;
  const { token, key, share } = outcome.data;
  writeMap({ ...readMap(), [note.id]: { token, key } });
  return { kind: "ok", data: share };
}

/** Turns the link off; the shared copy is removed from the server. */
export async function disableGuestShare(noteId: string): Promise<ApiOutcome<ShareInfo>> {
  const stored = readMap()[noteId];
  if (!stored) return { kind: "ok", data: NOT_SHARED };
  cancelUpdate(noteId);
  const outcome = await guestShareApi.remove(stored.token, stored.key);
  if (outcome.kind !== "ok" && outcome.kind !== "not_found") return outcome;
  forget(noteId);
  return { kind: "ok", data: NOT_SHARED };
}

/* ---------- Keeping the shared copy up to date ---------- */

const timers = new Map<string, number>();
let isPageHideListening = false;

function cancelUpdate(noteId: string): void {
  window.clearTimeout(timers.get(noteId));
  timers.delete(noteId);
}

async function sendUpdate(noteId: string, keepalive = false): Promise<void> {
  timers.delete(noteId);
  const stored = readMap()[noteId];
  const note = (keepalive ? localStore.readNotesNow() : await localStore.readNotes()).find(
    (candidate) => candidate.id === noteId
  );
  if (!stored) return;
  if (!note) {
    // Deleted for good: remove the copy too.
    void disableGuestShare(noteId);
    return;
  }
  const outcome = await guestShareApi.update(stored.token, stored.key, toGuestShareNote(note), keepalive);
  if (outcome.kind === "not_found") forget(noteId);
  else if (outcome.kind === "retry") timers.set(noteId, window.setTimeout(() => void sendUpdate(noteId), RETRY_DELAY_MS));
}

/** A shared note changed (or was deleted) in this browser. */
export function scheduleGuestShareUpdate(noteId: string): void {
  if (!isGuestShared(noteId)) return;
  if (!isPageHideListening) {
    isPageHideListening = true;
    // Closing the tab right after typing: send what's pending straight away.
    window.addEventListener("pagehide", () => {
      [...timers.keys()].forEach((id) => {
        cancelUpdate(id);
        void sendUpdate(id, true);
      });
    });
  }
  cancelUpdate(noteId);
  timers.set(noteId, window.setTimeout(() => void sendUpdate(noteId), UPDATE_DELAY_MS));
}

/* ---------- Signing in ---------- */

/**
 * Moves this browser's guest links into the signed-in account. The links keep
 * their URLs and from then on show the synced note. Links that can't be moved
 * right now are tried again next time.
 */
export async function claimGuestShares(): Promise<void> {
  const map = readMap();
  for (const [noteId, { token, key }] of Object.entries(map)) {
    cancelUpdate(noteId);
    const outcome = await guestShareApi.claim(token, key);
    if (outcome.kind === "ok" || outcome.kind === "not_found") forget(noteId);
  }
}

/** This browser's notes are being removed: take their shared copies down too. */
export async function removeAllGuestShares(): Promise<void> {
  await Promise.all(Object.keys(readMap()).map((noteId) => disableGuestShare(noteId)));
}
