/**
 * What the sync engine remembers on this device, in localStorage.
 *
 * - The outbox keeps one key per pending item (`takemynote:outbox:note:<id>`),
 *   so tabs adding and removing entries never overwrite each other.
 * - Sync metadata (account, cursor, last-known server versions) is only
 *   written by the engine while it holds the cross-tab sync lock.
 */

const DEVICE_ID_KEY = "takemynote:device-id";
const META_KEY = "takemynote:sync:meta";
const OUTBOX_PREFIX = "takemynote:outbox:";

export type SyncKind = "note" | "category" | "settings";
export type SyncOp = "upsert" | "delete";

export interface OutboxEntry {
  kind: SyncKind;
  id: string;
  op: SyncOp;
  /** Last local change (debounce reference). */
  changedAt: number;
  /** First unsent change (for the "at most every 10 s" rule). */
  firstChangedAt: number;
  attempts: number;
  /** Retry no earlier than this (backoff). */
  nextAttemptAt: number;
  /** Set when the server can't take this change (e.g. too large); not retried. */
  blocked?: "too_large" | "invalid";
}

export interface SyncMeta {
  /** The account this device is syncing with. */
  accountId: string | null;
  /**
   * Set when someone signed out but kept their notes here: the next sign-in
   * uploads edits made meanwhile, and a different account is asked first.
   */
  previousAccountId: string | null;
  cursor: string | null;
  /** Last server version seen per item (missing = never synced). */
  notes: Record<string, number>;
  categories: Record<string, number>;
  settingsVersion: number;
  /** Synced settings as last sent or received, to skip no-op uploads. */
  settingsSnapshot: string | null;
  lastSyncedAt: string | null;
}

const EMPTY_META: SyncMeta = {
  accountId: null,
  previousAccountId: null,
  cursor: null,
  notes: {},
  categories: {},
  settingsVersion: 0,
  settingsSnapshot: null,
  lastSyncedAt: null,
};

export function getDeviceId(): string {
  let id = window.localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `device-${crypto.randomUUID()}`;
    window.localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function readMeta(): SyncMeta {
  try {
    const raw = window.localStorage.getItem(META_KEY);
    return raw ? { ...EMPTY_META, ...(JSON.parse(raw) as Partial<SyncMeta>) } : { ...EMPTY_META };
  } catch {
    return { ...EMPTY_META };
  }
}

export function writeMeta(meta: SyncMeta): void {
  window.localStorage.setItem(META_KEY, JSON.stringify(meta));
}

/** Forgets everything about the account (keeps notes on the device). */
export function resetMeta(): void {
  window.localStorage.removeItem(META_KEY);
}

function outboxKey(kind: SyncKind, id: string): string {
  return `${OUTBOX_PREFIX}${kind}:${id}`;
}

export function readOutboxEntry(kind: SyncKind, id: string): OutboxEntry | null {
  try {
    const raw = window.localStorage.getItem(outboxKey(kind, id));
    return raw ? (JSON.parse(raw) as OutboxEntry) : null;
  } catch {
    return null;
  }
}

/** Queues (or refreshes) a change. A newer change replaces the older one for the same item. */
export function queueChange(kind: SyncKind, id: string, op: SyncOp): void {
  const now = Date.now();
  const existing = readOutboxEntry(kind, id);
  const entry: OutboxEntry = {
    kind,
    id,
    op,
    changedAt: now,
    firstChangedAt: existing?.firstChangedAt ?? now,
    attempts: 0,
    nextAttemptAt: 0,
  };
  window.localStorage.setItem(outboxKey(kind, id), JSON.stringify(entry));
}

export function updateOutboxEntry(entry: OutboxEntry): void {
  window.localStorage.setItem(outboxKey(entry.kind, entry.id), JSON.stringify(entry));
}

/** Removes an entry only if it hasn't changed since it was sent. */
export function removeOutboxEntryIfUnchanged(sent: OutboxEntry): void {
  const current = readOutboxEntry(sent.kind, sent.id);
  if (current && current.changedAt === sent.changedAt) {
    window.localStorage.removeItem(outboxKey(sent.kind, sent.id));
  }
}

export function removeOutboxEntry(kind: SyncKind, id: string): void {
  window.localStorage.removeItem(outboxKey(kind, id));
}

export function readOutbox(): OutboxEntry[] {
  const entries: OutboxEntry[] = [];
  for (let index = 0; index < window.localStorage.length; index++) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith(OUTBOX_PREFIX)) continue;
    try {
      entries.push(JSON.parse(window.localStorage.getItem(key)!) as OutboxEntry);
    } catch {
      window.localStorage.removeItem(key);
    }
  }
  return entries;
}

export function clearOutbox(): void {
  readOutbox().forEach((entry) => removeOutboxEntry(entry.kind, entry.id));
}

export function isOutboxKey(key: string | null): boolean {
  return Boolean(key?.startsWith(OUTBOX_PREFIX));
}
