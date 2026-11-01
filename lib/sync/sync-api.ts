import type {
  ApiErrorBody,
  CategoryInput,
  GuestShareCreated,
  GuestShareNote,
  ImportBody,
  ImportResult,
  NoteInput,
  RemoteCategory,
  RemoteNote,
  RemoteSettings,
  SettingsInput,
  ShareInfo,
  SyncChangesResponse,
  WriteResult,
} from "@/lib/sync/schemas";

/** How a request ended, from the sync engine's point of view. */
export type ApiOutcome<T> =
  | { kind: "ok"; data: T }
  | { kind: "conflict"; data: T }
  /** Not signed in any more (session expired, account deleted). */
  | { kind: "unauthorized" }
  | { kind: "too_large"; message: string }
  /** The server rejected the data; retrying won't help. */
  | { kind: "invalid"; message: string }
  | { kind: "not_found"; message: string }
  /** Rate-limited or a server hiccup (or `unreachable`: no connection): try again later. */
  | { kind: "retry"; unreachable?: boolean };

const API = "/api/v1";

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  keepalive = false,
  extraHeaders: Record<string, string> = {}
): Promise<ApiOutcome<T>> {
  let response: Response;
  try {
    response = await fetch(`${API}${path}`, {
      method,
      headers: { ...(body === undefined ? {} : { "Content-Type": "application/json" }), ...extraHeaders },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
      keepalive,
    });
  } catch {
    // The request never reached the server (offline, DNS, captive portal…).
    return { kind: "retry", unreachable: true };
  }

  const data = (await response.json().catch(() => null)) as T | ApiErrorBody | null;
  const message = (data as ApiErrorBody | null)?.error?.message ?? "";
  if (response.ok) return { kind: "ok", data: data as T };
  switch (response.status) {
    case 409:
      return { kind: "conflict", data: data as T };
    case 401:
      return { kind: "unauthorized" };
    case 413:
      return { kind: "too_large", message };
    case 400:
      return { kind: "invalid", message };
    case 404:
      return { kind: "not_found", message };
    default:
      return { kind: "retry" };
  }
}

export const syncApi = {
  getChanges: (cursor: string | null) =>
    request<SyncChangesResponse>("GET", `/sync${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`),

  importBatch: (body: ImportBody) => request<ImportResult>("POST", "/sync/import", body),

  putNote: (id: string, note: NoteInput, baseVersion: number, deviceId: string, keepalive = false) =>
    request<WriteResult<RemoteNote>>("PUT", `/notes/${encodeURIComponent(id)}`, { note, baseVersion, deviceId }, keepalive),

  deleteNote: (id: string, baseVersion: number, deviceId: string) =>
    request<WriteResult<RemoteNote | null>>("DELETE", `/notes/${encodeURIComponent(id)}`, { baseVersion, deviceId }),

  putCategory: (id: string, category: CategoryInput, baseVersion: number, deviceId: string) =>
    request<WriteResult<RemoteCategory>>("PUT", `/categories/${encodeURIComponent(id)}`, { category, baseVersion, deviceId }),

  deleteCategory: (id: string, deviceId: string) =>
    request<{ status: "ok"; item: RemoteCategory | null }>("DELETE", `/categories/${encodeURIComponent(id)}`, {
      baseVersion: 0,
      deviceId,
    }),

  getSettings: () => request<{ settings: RemoteSettings | null }>("GET", "/settings"),

  putSettings: (settings: SettingsInput, deviceId: string) =>
    request<{ settings: RemoteSettings }>("PUT", "/settings", { settings, deviceId }),

  getShare: (noteId: string) => request<ShareInfo>("GET", `/notes/${encodeURIComponent(noteId)}/share`),
  enableShare: (noteId: string) => request<ShareInfo>("POST", `/notes/${encodeURIComponent(noteId)}/share`),
  disableShare: (noteId: string) => request<ShareInfo>("DELETE", `/notes/${encodeURIComponent(noteId)}/share`),
};

/** Sends the guest link's key (see lib/server/guest-share-request.ts). */
const keyHeader = (key: string) => ({ "x-share-key": key });
const guestSharePath = (token: string) => `/guest-shares/${encodeURIComponent(token)}`;

/** Sharing without an account: the browser publishes a copy of one note. */
export const guestShareApi = {
  create: (noteId: string, note: GuestShareNote) => request<GuestShareCreated>("POST", "/guest-shares", { noteId, note }),
  get: (token: string, key: string) => request<ShareInfo>("GET", guestSharePath(token), undefined, false, keyHeader(key)),
  update: (token: string, key: string, note: GuestShareNote, keepalive = false) =>
    request<ShareInfo>("PUT", guestSharePath(token), { note }, keepalive, keyHeader(key)),
  remove: (token: string, key: string) => request<ShareInfo>("DELETE", guestSharePath(token), undefined, false, keyHeader(key)),
  /** Signed in now: the same link becomes an account share. */
  claim: (token: string, key: string) =>
    request<ShareInfo>("POST", `${guestSharePath(token)}/claim`, undefined, false, keyHeader(key)),
};
