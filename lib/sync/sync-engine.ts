import { localStore } from "@/lib/data/local-storage-adapter";
import { subscribeToAiConfig } from "@/lib/ai/ai-config";
import { subscribeToPreferences } from "@/hooks/use-preferences";
import { resolveNoteConflict, toLocalCategory, toLocalNote, toNoteInput } from "@/lib/sync/merge";
import type { RemoteNote, RemoteSettings, SettingsInput } from "@/lib/sync/schemas";
import { LIMITS } from "@/lib/sync/schemas";
import { syncApi, type ApiOutcome } from "@/lib/sync/sync-api";
import {
  getDeviceId,
  queueChange,
  readMeta,
  readOutbox,
  readOutboxEntry,
  removeOutboxEntry,
  removeOutboxEntryIfUnchanged,
  updateOutboxEntry,
  writeMeta,
  type OutboxEntry,
  type SyncMeta,
} from "@/lib/sync/sync-storage";
import { applySettings, readLocalSettings, settingsFingerprint } from "@/lib/sync/synced-settings";
import type { Note } from "@/types/note";

/**
 * Keeps this device and the account in step (plan §7):
 * local changes wait in the outbox and are pushed after a pause in typing;
 * changes from other devices are pulled on start, on focus and every minute.
 */

/** Push a change this long after the last edit… */
const DEBOUNCE_MS = 1_500;
/** …but no later than this after the first unsent edit. */
const MAX_WAIT_MS = 10_000;
const PULL_INTERVAL_MS = 60_000;
const TICK_MS = 1_000;
const MAX_BACKOFF_MS = 60_000;
/** Browsers cap keepalive requests at 64 KB; stay under it on page close. */
const KEEPALIVE_MAX_BYTES = 60_000;
const LOCK_NAME = "takemynote-sync";
const SETTINGS_ID = "account";
/** Never uploaded from a fresh device: every device starts with its own copy. */
const WELCOME_TITLE = "Welcome to TakeMyNote";

export type SyncState = "disabled" | "idle" | "syncing" | "offline" | "error" | "signed-out";

export interface SyncStatus {
  state: SyncState;
  /** Changes waiting to be sent. */
  pending: number;
  lastSyncedAt: string | null;
  /** Shown when something needs attention. */
  message: string | null;
}

export interface RemoteChangeEvent {
  noteIds: string[];
  categoriesChanged: boolean;
}

interface StartOptions {
  userId: string;
  setTheme: (theme: SettingsInput["preferences"]["theme"]) => void;
  /** Data changed on this device because of sync: refresh lists and the open note. */
  onRemoteChange: (event: RemoteChangeEvent) => void;
  /** The server no longer accepts this session. */
  onSignedOut: () => void;
}

type PushOutcome = "done" | "stop" | "failed";

function backoff(attempts: number): number {
  return Math.min(MAX_BACKOFF_MS, 1_000 * 2 ** attempts);
}

function isUneditedWelcomeNote(note: Note): boolean {
  return note.title === WELCOME_TITLE && note.createdAt === note.updatedAt;
}

class SyncEngine {
  private options: StartOptions | null = null;
  private status: SyncStatus = { state: "disabled", pending: 0, lastSyncedAt: null, message: null };
  private listeners = new Set<() => void>();
  private cleanups: (() => void)[] = [];
  private busy = false;
  private lastPullAt = 0;
  /** The last request couldn't reach the server, whatever `navigator.onLine` says. */
  private unreachable = false;

  /* ---------- Status for the UI ---------- */

  getStatus = (): SyncStatus => this.status;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private setStatus(changes: Partial<SyncStatus>): void {
    this.status = { ...this.status, ...changes };
    this.listeners.forEach((listener) => listener());
  }

  private refreshPending(): void {
    if (!this.options) return;
    const entries = readOutbox();
    const blocked = entries.filter((entry) => entry.blocked);
    const pending = entries.length - blocked.length;
    const state: SyncState = this.busy
      ? "syncing"
      : blocked.length > 0
        ? "error"
        : pending > 0 && (this.unreachable || !navigator.onLine)
          ? "offline"
          : this.status.state === "error" && pending > 0
            ? "error"
            : "idle";
    this.setStatus({
      pending,
      state,
      message: blocked.some((entry) => entry.blocked === "too_large")
        ? "A note is too large to sync. Try splitting it into smaller notes."
        : state === "error" ? this.status.message : null,
    });
  }

  /* ---------- Lifecycle ---------- */

  isActive(): boolean {
    return this.options !== null;
  }

  start(options: StartOptions): void {
    this.stop();
    this.options = options;
    this.setStatus({ state: "idle", lastSyncedAt: readMeta().lastSyncedAt, message: null });

    const onVisibility = () => {
      if (document.visibilityState === "hidden") void this.runCycle({ force: true, pull: false });
      else void this.runCycle({ force: false, pull: true });
    };
    const onOnline = () => void this.runCycle({ force: true, pull: true });
    const onOffline = () => this.refreshPending();
    const onPageHide = () => this.sendOnPageClose();
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibility);
    const tick = window.setInterval(() => void this.tick(), TICK_MS);
    const unsubscribePreferences = subscribeToPreferences(() => this.notifySettingsChanged());
    const unsubscribeAi = subscribeToAiConfig(() => this.notifySettingsChanged());

    this.cleanups = [
      () => window.removeEventListener("online", onOnline),
      () => window.removeEventListener("offline", onOffline),
      () => window.removeEventListener("pagehide", onPageHide),
      () => document.removeEventListener("visibilitychange", onVisibility),
      () => window.clearInterval(tick),
      unsubscribePreferences,
      unsubscribeAi,
    ];
    void this.withLock(() => this.initialSync(), { wait: true });
  }

  stop(): void {
    this.cleanups.forEach((cleanup) => cleanup());
    this.cleanups = [];
    this.options = null;
    this.setStatus({ state: "disabled", pending: 0, message: null });
  }

  /* ---------- Hooks for the data adapter and the UI ---------- */

  /** A note, category or setting changed on this device. */
  noteLocalChange(): void {
    this.refreshPending();
  }

  /** Synced settings may have changed; queue them only if they really differ. */
  notifySettingsChanged(): void {
    if (!this.options) return;
    if (settingsFingerprint(readLocalSettings()) === readMeta().settingsSnapshot) return;
    queueChange("settings", SETTINGS_ID, "upsert");
    this.refreshPending();
  }

  /** Sends everything now and pulls (the "Sync now" button, sign-out). */
  async syncNow(): Promise<SyncStatus> {
    await this.runCycle({ force: true, pull: true, wait: true });
    return this.status;
  }

  /** Makes sure one note is on the server (before sharing it). */
  async syncNote(noteId: string): Promise<boolean> {
    if (!this.options) return false;
    if (readMeta().notes[noteId] === undefined && !readOutboxEntry("note", noteId)) {
      queueChange("note", noteId, "upsert");
    }
    await this.runCycle({ force: true, pull: false, wait: true });
    return readMeta().notes[noteId] !== undefined && !readOutboxEntry("note", noteId);
  }

  /* ---------- Scheduling ---------- */

  private async tick(): Promise<void> {
    if (!this.options || this.busy) return;
    const now = Date.now();
    const pushDue = readOutbox().some((entry) => this.isDue(entry, now, false));
    const pullDue = document.visibilityState === "visible" && now - this.lastPullAt >= PULL_INTERVAL_MS;
    if (pushDue || pullDue) await this.runCycle({ force: false, pull: pullDue });
  }

  private isDue(entry: OutboxEntry, now: number, force: boolean): boolean {
    if (entry.blocked || entry.nextAttemptAt > now) return false;
    return force || now - entry.changedAt >= DEBOUNCE_MS || now - entry.firstChangedAt >= MAX_WAIT_MS;
  }

  private async runCycle({ force, pull, wait = false }: { force: boolean; pull: boolean; wait?: boolean }): Promise<void> {
    if (!this.options) return;
    await this.withLock(
      async () => {
        const outcome = await this.pushDue(force);
        if (pull && outcome !== "stop") await this.pull();
      },
      { wait }
    );
  }

  /** Runs `task` while holding the cross-tab sync lock (one syncing tab at a time). */
  private async withLock(task: () => Promise<void>, { wait }: { wait: boolean }): Promise<void> {
    if (this.busy && !wait) return;
    const run = async () => {
      this.busy = true;
      this.refreshPending();
      try {
        await task();
      } finally {
        this.busy = false;
        this.refreshPending();
      }
    };
    if (!("locks" in navigator)) return run();
    await navigator.locks.request(LOCK_NAME, { ifAvailable: !wait }, async (lock) => {
      if (lock) await run();
    });
  }

  /* ---------- First sync with an account ---------- */

  private async initialSync(): Promise<void> {
    const options = this.options;
    if (!options) return;
    const meta = readMeta();
    if (meta.accountId !== options.userId) {
      const outcome = await this.importDevice();
      if (outcome === "stop") return;
      await this.syncSettingsOnFirstSignIn();
      writeMeta({ ...readMeta(), accountId: options.userId, previousAccountId: null, cursor: null });
    }
    const outcome = await this.pushDue(true);
    if (outcome !== "stop") await this.pull();
  }

  /** Uploads this device's notes and categories (first sign-in here). */
  private async importDevice(): Promise<PushOutcome> {
    const deviceId = getDeviceId();
    const categories = await localStore.readCategories();
    const notes = (await localStore.readNotes()).filter((note) => !isUneditedWelcomeNote(note));
    const meta = readMeta();

    for (let start = 0; start < Math.max(categories.length, notes.length); start += LIMITS.importBatch) {
      const batchCategories = categories.slice(start, start + LIMITS.importBatch);
      const slice = notes.slice(start, start + LIMITS.importBatch);
      const fits = (note: Note) => JSON.stringify(toNoteInput(note)).length <= LIMITS.noteBytes;
      // Oversized notes go through the outbox, which shows "too large to sync".
      slice.filter((note) => !fits(note)).forEach((note) => queueChange("note", note.id, "upsert"));
      const batchNotes = slice.filter(fits);
      const outcome = await syncApi.importBatch({
        deviceId,
        categories: batchCategories.map((category) => ({
          id: category.id,
          category: { name: category.name },
          baseVersion: meta.categories[category.id] ?? 0,
        })),
        notes: batchNotes.map((note) => ({ id: note.id, note: toNoteInput(note), baseVersion: meta.notes[note.id] ?? 0 })),
      });
      if (outcome.kind === "unauthorized") return this.signedOut();
      if (outcome.kind !== "ok") {
        // Fall back to the normal outbox for this batch; it retries on its own.
        batchCategories.forEach((category) => queueChange("category", category.id, "upsert"));
        batchNotes.forEach((note) => queueChange("note", note.id, "upsert"));
        continue;
      }

      const current = readMeta();
      for (const { id, result } of outcome.data.categories) {
        current.categories[id] = result.item.version;
        // The account already had this category: keep this device's name.
        if (result.status === "conflict") queueChange("category", id, "upsert");
      }
      writeMeta(current);
      for (const { id, result } of outcome.data.notes) {
        if (result.status === "ok") {
          this.rememberNote(id, result.item.version);
          continue;
        }
        // The account already had this note (e.g. kept after signing out): same rules as any conflict.
        const local = batchNotes.find((note) => note.id === id);
        if (local) await this.resolveConflict(local, result.item, null);
      }
    }
    return "done";
  }

  /** The account's settings win if it has some; otherwise this device's are uploaded. */
  private async syncSettingsOnFirstSignIn(): Promise<void> {
    const outcome = await syncApi.getSettings();
    if (outcome.kind !== "ok") return;
    if (outcome.data.settings) this.applyRemoteSettings(outcome.data.settings);
    else queueChange("settings", SETTINGS_ID, "upsert");
  }

  /* ---------- Push ---------- */

  private async pushDue(force: boolean): Promise<PushOutcome> {
    const now = Date.now();
    const order = { category: 0, note: 1, settings: 2 } as const;
    const due = readOutbox()
      .filter((entry) => this.isDue(entry, now, force))
      // Categories before the notes that use them; deletions of categories last.
      .sort((a, b) => order[a.kind] - order[b.kind] || Number(a.op === "delete") - Number(b.op === "delete"));

    for (const entry of due) {
      const outcome = await this.pushEntry(entry);
      if (outcome === "stop") return "stop";
      // Offline or the server is struggling: leave the rest for the next try.
      if (outcome === "failed") return "failed";
    }
    if (due.length > 0) writeMeta({ ...readMeta(), lastSyncedAt: new Date().toISOString() });
    this.setStatus({ lastSyncedAt: readMeta().lastSyncedAt });
    return "done";
  }

  private async pushEntry(entry: OutboxEntry): Promise<PushOutcome> {
    const outcome = await this.pushEntryOnce(entry);
    if (outcome === "done") this.unreachable = false;
    return outcome;
  }

  private async pushEntryOnce(entry: OutboxEntry): Promise<PushOutcome> {
    switch (entry.kind) {
      case "note":
        return this.pushNote(entry);
      case "category":
        return this.pushCategory(entry);
      case "settings":
        return this.pushSettings(entry);
    }
  }

  private async pushNote(entry: OutboxEntry): Promise<PushOutcome> {
    const deviceId = getDeviceId();
    const local = (await localStore.readNotes()).find((note) => note.id === entry.id);
    const meta = readMeta();
    const baseVersion = meta.notes[entry.id];

    if (entry.op === "delete" || !local) {
      // Never reached the server: nothing to delete there.
      if (baseVersion === undefined) {
        removeOutboxEntryIfUnchanged(entry);
        return "done";
      }
      const outcome = await syncApi.deleteNote(entry.id, baseVersion, deviceId);
      if (outcome.kind === "ok") {
        this.forgetNote(entry.id);
        removeOutboxEntryIfUnchanged(entry);
        return "done";
      }
      if (outcome.kind === "conflict" && outcome.data.item) {
        // Edited on another device since: the edit wins, the note comes back here.
        await this.applyRemoteNote(outcome.data.item);
        removeOutboxEntry("note", entry.id);
        return "done";
      }
      return this.handleFailure(entry, outcome);
    }

    let version = baseVersion ?? 0;
    // A conflict can repeat if another device keeps writing; give up after a few rounds.
    for (let round = 0; round < 3; round++) {
      const outcome = await syncApi.putNote(entry.id, toNoteInput(local), version, deviceId);
      if (outcome.kind === "ok") {
        this.rememberNote(entry.id, outcome.data.item.version);
        removeOutboxEntryIfUnchanged(entry);
        await this.adoptServerCategory(local, outcome.data.item);
        return "done";
      }
      if (outcome.kind !== "conflict") return this.handleFailure(entry, outcome);
      const keepLocal = await this.resolveConflict(local, outcome.data.item, entry);
      if (!keepLocal) return "done";
      version = outcome.data.item.version;
    }
    return this.handleFailure(entry, { kind: "retry" });
  }

  /**
   * Applies the conflict rules. Returns true if this device's note should be
   * sent again (on top of the server version).
   */
  private async resolveConflict(local: Note, server: RemoteNote, sent: OutboxEntry | null): Promise<boolean> {
    const decision = resolveNoteConflict(local, server, localStore.newNoteId);
    this.rememberNote(local.id, server.version);
    if (decision.copy) {
      await localStore.insertNote(decision.copy);
      queueChange("note", decision.copy.id, "upsert");
    }
    // Typed again while the request was in flight: this device's text is newer still.
    const editedSince = sent !== null && readOutboxEntry("note", local.id)?.changedAt !== sent.changedAt;

    if (decision.action === "take-server" && !editedSince) {
      await this.applyRemoteNote(server);
      removeOutboxEntry("note", local.id);
      this.options?.onRemoteChange({ noteIds: [local.id, ...(decision.copy ? [decision.copy.id] : [])], categoriesChanged: false });
      return false;
    }
    if (sent === null) queueChange("note", local.id, "upsert");
    if (decision.copy) this.options?.onRemoteChange({ noteIds: [decision.copy.id], categoriesChanged: false });
    return sent !== null;
  }

  private async pushCategory(entry: OutboxEntry): Promise<PushOutcome> {
    const deviceId = getDeviceId();
    const local = (await localStore.readCategories()).find((category) => category.id === entry.id);

    if (entry.op === "delete" || !local) {
      if (readMeta().categories[entry.id] === undefined) {
        removeOutboxEntryIfUnchanged(entry);
        return "done";
      }
      const outcome = await syncApi.deleteCategory(entry.id, deviceId);
      if (outcome.kind !== "ok") return this.handleFailure(entry, outcome);
      const meta = readMeta();
      delete meta.categories[entry.id];
      writeMeta(meta);
      removeOutboxEntryIfUnchanged(entry);
      return "done";
    }

    let version = readMeta().categories[entry.id] ?? 0;
    for (let round = 0; round < 3; round++) {
      const outcome = await syncApi.putCategory(entry.id, { name: local.name }, version, deviceId);
      if (outcome.kind === "ok" || outcome.kind === "conflict") {
        const meta = readMeta();
        meta.categories[entry.id] = outcome.data.item.version;
        writeMeta(meta);
        if (outcome.kind === "ok") {
          removeOutboxEntryIfUnchanged(entry);
          return "done";
        }
        // Renamed elsewhere too: this device's name wins (it's the latest intent here).
        version = outcome.data.item.version;
        continue;
      }
      return this.handleFailure(entry, outcome);
    }
    return this.handleFailure(entry, { kind: "retry" });
  }

  private async pushSettings(entry: OutboxEntry): Promise<PushOutcome> {
    const settings = readLocalSettings();
    const fingerprint = settingsFingerprint(settings);
    if (fingerprint === readMeta().settingsSnapshot) {
      removeOutboxEntryIfUnchanged(entry);
      return "done";
    }
    const outcome = await syncApi.putSettings(settings, getDeviceId());
    if (outcome.kind !== "ok") return this.handleFailure(entry, outcome);
    writeMeta({ ...readMeta(), settingsVersion: outcome.data.settings.version, settingsSnapshot: fingerprint });
    removeOutboxEntryIfUnchanged(entry);
    return "done";
  }

  private handleFailure(entry: OutboxEntry, outcome: ApiOutcome<unknown>): PushOutcome {
    switch (outcome.kind) {
      case "unauthorized":
        return this.signedOut();
      case "too_large":
        updateOutboxEntry({ ...entry, blocked: "too_large" });
        return "done";
      case "invalid":
      case "not_found":
        updateOutboxEntry({ ...entry, blocked: "invalid" });
        console.warn("[sync] change rejected", entry.kind, outcome.message);
        return "done";
      default: {
        const attempts = entry.attempts + 1;
        // Re-read: keep a newer edit's timing, only move the retry time.
        const current = readOutboxEntry(entry.kind, entry.id) ?? entry;
        updateOutboxEntry({ ...current, attempts, nextAttemptAt: Date.now() + backoff(attempts) });
        this.unreachable = outcome.kind === "retry" && outcome.unreachable === true;
        const offline = this.unreachable || !navigator.onLine;
        this.setStatus({ state: offline ? "offline" : "error", message: offline ? null : "Couldn’t sync. Retrying…" });
        return "failed";
      }
    }
  }

  private signedOut(): PushOutcome {
    this.setStatus({ state: "signed-out", message: "Sign in again to keep syncing." });
    this.options?.onSignedOut();
    return "stop";
  }

  /* ---------- Pull ---------- */

  private async pull(): Promise<void> {
    if (!this.options) return;
    this.lastPullAt = Date.now();
    let cursor = readMeta().cursor;

    for (let page = 0; page < 100; page++) {
      const outcome = await syncApi.getChanges(cursor);
      if (outcome.kind === "unauthorized") {
        this.signedOut();
        return;
      }
      if (outcome.kind !== "ok") {
        if (outcome.kind === "retry" && outcome.unreachable) this.unreachable = true;
        return;
      }
      this.unreachable = false;
      const { notes, categories, settings, cursor: next, hasMore } = outcome.data;

      const meta = readMeta();
      const pending = new Set(readOutbox().map((entry) => `${entry.kind}:${entry.id}`));
      const changes = { upsertNotes: [] as Note[], removeNoteIds: [] as string[], upsertCategories: [] as ReturnType<typeof toLocalCategory>[], removeCategoryIds: [] as string[] };

      for (const remote of categories) {
        const known = meta.categories[remote.id];
        // Already have it, or this device has unsent changes (they'll be resolved on push).
        if ((known !== undefined && remote.version <= known) || pending.has(`category:${remote.id}`)) continue;
        if (remote.deleted) {
          changes.removeCategoryIds.push(remote.id);
          delete meta.categories[remote.id];
        } else {
          changes.upsertCategories.push(toLocalCategory(remote));
          meta.categories[remote.id] = remote.version;
        }
      }
      for (const remote of notes) {
        const known = meta.notes[remote.id];
        if ((known !== undefined && remote.version <= known) || pending.has(`note:${remote.id}`)) continue;
        if (remote.deleted) {
          changes.removeNoteIds.push(remote.id);
          delete meta.notes[remote.id];
        } else {
          changes.upsertNotes.push(toLocalNote(remote));
          meta.notes[remote.id] = remote.version;
        }
      }

      await localStore.applyRemoteChanges(changes);
      writeMeta({ ...meta, cursor: next });
      if (settings && settings.version > meta.settingsVersion && !pending.has(`settings:${SETTINGS_ID}`)) {
        this.applyRemoteSettings(settings);
      }

      const noteIds = [...changes.upsertNotes.map((note) => note.id), ...changes.removeNoteIds];
      const categoriesChanged = changes.upsertCategories.length + changes.removeCategoryIds.length > 0;
      if (noteIds.length > 0 || categoriesChanged) this.options?.onRemoteChange({ noteIds, categoriesChanged });
      if (changes.upsertNotes.length > 0) await this.dropDuplicateWelcomeNote();

      cursor = next;
      if (!hasMore) break;
    }
    const lastSyncedAt = new Date().toISOString();
    writeMeta({ ...readMeta(), lastSyncedAt });
    this.setStatus({ lastSyncedAt });
  }

  /** A fresh device's welcome note isn't needed once the account's notes arrive. */
  private async dropDuplicateWelcomeNote(): Promise<void> {
    const meta = readMeta();
    const welcome = (await localStore.readNotes()).filter(
      (note) => isUneditedWelcomeNote(note) && meta.notes[note.id] === undefined
    );
    if (welcome.length === 0) return;
    await localStore.applyRemoteChanges({ upsertNotes: [], removeNoteIds: welcome.map((n) => n.id), upsertCategories: [], removeCategoryIds: [] });
    this.options?.onRemoteChange({ noteIds: welcome.map((n) => n.id), categoriesChanged: false });
  }

  private applyRemoteSettings(settings: RemoteSettings): void {
    const { version, ...values } = settings;
    // Record first, so the change events from applying don't queue an upload.
    writeMeta({ ...readMeta(), settingsVersion: version, settingsSnapshot: settingsFingerprint(values) });
    if (this.options) applySettings(values, this.options.setTheme);
  }

  /* ---------- Small helpers ---------- */

  /**
   * The server drops a category that was deleted on another device. Mirror
   * that here so this device doesn't keep pointing at a missing category.
   */
  private async adoptServerCategory(local: Note, saved: RemoteNote): Promise<void> {
    if (saved.categoryId === local.categoryId) return;
    const current = (await localStore.readNotes()).find((note) => note.id === local.id);
    if (!current || current.categoryId !== local.categoryId) return;
    await localStore.applyRemoteChanges({
      upsertNotes: [{ ...current, categoryId: saved.categoryId }],
      removeNoteIds: [],
      upsertCategories: [],
      removeCategoryIds: [],
    });
    this.options?.onRemoteChange({ noteIds: [local.id], categoriesChanged: false });
  }

  private async applyRemoteNote(remote: RemoteNote): Promise<void> {
    if (remote.deleted) {
      await localStore.applyRemoteChanges({ upsertNotes: [], removeNoteIds: [remote.id], upsertCategories: [], removeCategoryIds: [] });
      this.forgetNote(remote.id);
    } else {
      await localStore.applyRemoteChanges({ upsertNotes: [toLocalNote(remote)], removeNoteIds: [], upsertCategories: [], removeCategoryIds: [] });
      this.rememberNote(remote.id, remote.version);
    }
    this.options?.onRemoteChange({ noteIds: [remote.id], categoriesChanged: false });
  }

  private rememberNote(id: string, version: number): void {
    const meta: SyncMeta = readMeta();
    meta.notes[id] = version;
    writeMeta(meta);
  }

  private forgetNote(id: string): void {
    const meta = readMeta();
    delete meta.notes[id];
    writeMeta(meta);
  }

  /**
   * Best effort as the page closes: small pending notes go out with
   * `keepalive`. Anything not confirmed is sent again next time.
   */
  private sendOnPageClose(): void {
    if (!this.options) return;
    const deviceId = getDeviceId();
    const meta = readMeta();
    const notes = localStore.readNotesNow();
    let budget = KEEPALIVE_MAX_BYTES;
    for (const entry of readOutbox()) {
      if (entry.kind !== "note" || entry.op !== "upsert" || entry.blocked) continue;
      const note = notes.find((candidate) => candidate.id === entry.id);
      if (!note) continue;
      const size = JSON.stringify(toNoteInput(note)).length;
      if (size > budget) continue;
      budget -= size;
      void syncApi.putNote(note.id, toNoteInput(note), meta.notes[note.id] ?? 0, deviceId, true);
    }
  }
}

export const syncEngine = new SyncEngine();
