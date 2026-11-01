# Accounts, sync and sharing: plan

Status: **built** (approved 2026-11-01). Differences from the draft, decided while building:

- No `scripts/db-setup.mjs`: validators and indexes are applied automatically on first connection (`lib/server/collection-setup.ts`), idempotently.
- Share tokens are 16 random bytes (22 URL-safe characters, 128 bits).
- Account deletion uses Better Auth's own endpoint (it requires a sign-in from the last day) with a `beforeDelete` hook that removes notes, categories, settings and shares, instead of a separate `/api/v1/account` route.
- Zod schemas live in `lib/sync/schemas.ts` (shared by server and browser) rather than `lib/server/schemas/`.
- Signing out with "keep a copy" clears the account link but remembers it (`previousAccountId`), so edits made while signed out upload at the next sign-in and a different account is asked first.
- React Query now runs queries and mutations offline (`networkMode: "always"`); before, offline edits were held in memory instead of saved.
- `npm run db:dev` starts a throwaway local MongoDB replica set for development and tests.
- Profile photos: uploaded to Vercel Blob (public store, random URL suffix) after re-encoding to a 256×256 WebP; the user's `image` field holds the URL. Needs `BLOB_READ_WRITE_TOKEN`.
- Email and password accounts were added next to Google (sign in / create account in one dialog). Accounts need only `MONGODB_URI` and `BETTER_AUTH_SECRET`; Google is offered when its client is configured. Google links to an existing account only if that account's email is verified, which prevents pre-registering someone else's email.

## 1. What we're building, in one minute

- **Accounts are optional.** TakeMyNote keeps working exactly as today without signing in: notes live in the browser.
- **Sign in with Google** (one click, no passwords to manage).
- **Signed in = synced.** Notes, categories and settings are saved to your account and appear on every device you sign in on. Edits save on the device instantly (as now) and reach the server a moment later.
- **Share a note with a public link.** Anyone with the link can read it (not edit). You can turn the link off any time.
- **What never changes:** the AI key stays on the device. It is never synced, uploaded or shared.

## 2. Choices to approve

| # | Question | Recommendation | Why |
|---|---|---|---|
| 1 | Auth library | **Better Auth** (1.7) | Listed in Next.js's own auth guide, stable, has Google sign-in and an official MongoDB adapter, sessions in our own database. NextAuth v5 never left beta. |
| 2 | Database access | **Official `mongodb` driver + Zod schemas + MongoDB `$jsonSchema` validators** | One driver (Better Auth needs it anyway), types come from Zod, and the database itself rejects bad documents. Mongoose would add a second driver and a second schema layer. |
| 3 | Signing out | **Ask:** "Keep a copy on this device" or "Remove from this device" (default) | Shared computers are common; the safe default removes notes, but people can keep them. |
| 4 | First sign-in on a device that already has notes | **Merge automatically** and say so ("12 notes added to your account") | Nobody should lose notes; asking every time is friction. |
| 5 | Shared links | **Live**: the link always shows the latest synced version | Simpler to understand ("share this note"). Snapshots can come later. |
| 6 | Where the shared page lives | `www.takemynote.online/s/<link-id>` | Short, clean, and clearly separate from the app. |

## 3. How it works (the big picture)

```
 Editor / lists (React)            ← unchanged: still talk to one "data adapter"
        │
 React Query
        │
 SyncingDataAdapter  ───────────────┐   new: wraps the current local adapter
   │ 1. writes to localStorage now  │
   │ 2. adds the change to the      │
   │    "outbox"                    ▼
 LocalStorageAdapter           Sync engine (browser)
 (today's code, kept)            • waits for a pause in typing (debounce)
                                 • sends changes, retries if offline
                                 • pulls changes from other devices
                                        │  HTTPS (same site, cookie session)
                                        ▼
                               API routes  /api/v1/…  (Next.js Route Handlers)
                                        │  every request: who is this user?
                                        ▼
                               Data Access Layer (server only)
                                        │  every query filtered by userId
                                        ▼
                               MongoDB Atlas
```

Key idea: **the device is always the first place a change is saved.** The server is a copy that keeps devices in step. That keeps the app instant, works offline, and means a flaky network never loses typing.

## 4. User flows

### A. Signing in (first time, this device has notes)
1. Sidebar footer or **Settings → Account** → "Sign in with Google".
2. Google sign-in page → back to the app.
3. Every note and category on this device is uploaded and merged into the account. Toast: "12 notes are now synced to your account."
4. Settings that sync (see §6.4) are uploaded if the account has none yet; if it already has some, the account's settings win.

### B. Signing in on a new device
1. Sign in → the app downloads everything from the account.
2. If this device also had notes, they're merged in (same as A).
3. Onboarding is skipped if the account has already done it.

### C. Writing while signed in
1. Every keystroke saves to the device (unchanged).
2. After you pause for **1.5 s** (or at most every **10 s** while typing non-stop), the note is sent to the server.
3. A small status in the note's meta line: `Saved` → `Syncing…` → `Synced`. If offline: `Offline · will sync`.

### D. Offline
Changes wait in the outbox (saved in localStorage, so they survive a reload). When the connection returns, they're sent in order.

### E. The same note edited on two devices
See §7.4. In short: small changes (star, pin, category) merge; if both devices changed the text, the newest edit wins **and the other version is kept as a copy** ("Weekend in Lisbon (copy from another device)"). Text is never silently lost.

### F. Signing out
Dialog: **Remove notes from this device** (default) / **Keep a copy on this device**. Unsynced changes are sent first; if that fails (offline), we warn before removing anything.

### G. Deleting the account
**Settings → Account → Delete account** → confirm by typing "delete". All server data (notes, categories, settings, shares, sessions) is deleted. The copy on this device is kept, so nothing is lost by surprise. Offered alongside "Download a backup first".

### H. Sharing a note
1. Note's **Share** button (top bar) or the note menu → **Share**.
2. Not signed in? The same dialog works as a guest (added later, see "Guest sharing" below): the browser publishes a copy of that one note.
3. Share dialog: switch **"Anyone with the link can view"** → link created → **Copy link**. Shows when it was created and how many times it was opened.
4. Turn the switch off → link stops working immediately ("This note is no longer shared").
5. The public page shows the title and the note, read-only, styled like the app, with a quiet "Made with TakeMyNote · Start writing" link. Link previews (WhatsApp etc.) show the note title and first lines.

## 5. Accounts (Better Auth)

- Google provider only, for now. Email/password can be added later without changing the data model.
- Sessions stored in MongoDB, cookie is `httpOnly`, `Secure`, `SameSite=Lax`. Sessions last 30 days and refresh while used.
- Route: `app/api/auth/[...all]/route.ts` using `toNextJsHandler(auth)`.
- Client: `better-auth/react` (`signIn.social({ provider: "google" })`, `signOut()`, `useSession()`).
- Server: `auth.api.getSession({ headers })` inside the Data Access Layer.
- `proxy.ts` is **not** needed: the app works without an account, and API routes check the session themselves.

## 6. MongoDB schema

Database: `takemynote`. All our documents use **our own string IDs** for notes and categories (they're created on the device, often offline), scoped per user, plus MongoDB's own `_id`.

Common sync fields (on notes and categories):

| Field | Type | Meaning |
|---|---|---|
| `userId` | string | Owner (Better Auth user id). Every query filters by it. |
| `version` | int | +1 on every server write. Used to spot conflicts. |
| `serverUpdatedAt` | Date | Set by the server on every write. Used to fetch "what changed since…". |
| `deletedAt` | Date \| null | Soft delete ("tombstone") so other devices learn about deletions. Purged after 30 days. |
| `lastDeviceId` | string | Which device made the last change (lets a device ignore its own echoes). |

### 6.1 Managed by Better Auth
`user` (name, email, emailVerified, image, createdAt, updatedAt), `session` (token, userId, expiresAt, ipAddress, userAgent), `account` (provider "google", providerAccountId, tokens), `verification`. We don't write to these directly.

### 6.2 `notes`

| Field | Type | Rules |
|---|---|---|
| `_id` | ObjectId | Auto |
| `userId` | string | required |
| `noteId` | string | required, the device-made id (`note-…` today, UUID for new notes) |
| `title` | string | ≤ 500 chars |
| `content` | array | BlockNote JSON blocks; whole note ≤ **1 MB** |
| `categoryId` | string \| null | must be one of the user's categories, or null |
| `favorited`, `pinned`, `trashed`, `scratchpad` | bool | |
| `trashedAt` | Date \| null | when moved to trash |
| `createdAt` | Date | from the device |
| `updatedAt` | Date | last edit time on the device (shown in the UI) |
| + common sync fields | | |

Indexes: `{ userId: 1, noteId: 1 }` **unique** · `{ userId: 1, serverUpdatedAt: 1 }` (delta sync) · `{ deletedAt: 1 }` TTL-style cleanup job (partial: only tombstones).

### 6.3 `categories`

| Field | Type | Rules |
|---|---|---|
| `_id` | ObjectId | Auto |
| `userId` | string | required |
| `categoryId` | string | required |
| `name` | string | 1–60 chars |
| `createdAt` | Date | |
| + common sync fields | | |

Indexes: `{ userId: 1, categoryId: 1 }` unique · `{ userId: 1, serverUpdatedAt: 1 }`.

### 6.4 `settings` (one per user)

| Field | Type | Synced? |
|---|---|---|
| `userId` | string, unique | |
| `preferences.layout` | "classic" \| "library" | yes |
| `preferences.writingPosition` | "start" \| "center" \| "full" | yes |
| `preferences.sortBy` | "updated" \| "created" \| "title" | yes |
| `preferences.textDirection` | "ltr" \| "rtl" | yes |
| `preferences.scrollPastEnd` | bool | yes |
| `preferences.theme` | "light" \| "dark" \| "system" | yes |
| `onboardingCompleted` | bool | yes (skip onboarding on new devices) |
| `ai.provider`, `ai.model`, `ai.instructions` | strings | yes (**never the key**) |
| `version`, `serverUpdatedAt` | | |

Kept on the device only: sidebar/list collapsed state (depends on screen), star-prompt state, the AI key.

### 6.5 `shares`

| Field | Type | Rules |
|---|---|---|
| `_id` | ObjectId | Auto |
| `token` | string | **unique**, 22 random URL-safe chars (~131 bits): unguessable |
| `userId` | string | owner |
| `noteId` | string | the shared note |
| `createdAt` | Date | |
| `revokedAt` | Date \| null | set when the switch is turned off |
| `viewCount` | int | |
| `lastViewedAt` | Date \| null | |

Indexes: `{ token: 1 }` unique · `{ userId: 1, noteId: 1 }` (one active link per note).

### 6.6 `rateLimits`
`{ key: "push:<userId>" | "share-view:<ip>", windowStart, count }` with a TTL index so old windows disappear. Small and self-cleaning.

### 6.7 Validation
Each collection gets a `$jsonSchema` validator (created by a setup script, `scripts/db-setup.mjs`, which also creates indexes). The same rules exist as Zod schemas in `lib/server/schemas/`, and TypeScript types come from those, so the API, the database and the code agree.

## 7. Sync, in detail

### 7.1 IDs
- New notes and categories get `crypto.randomUUID()` ids (today's short ids could collide across devices).
- Existing ids are kept. Uniqueness is per user (`userId + noteId`), so old ids are safe.

### 7.2 Sending changes (push)
- The **outbox** (in localStorage) holds at most one pending change per item; a newer edit replaces the older one.
- **Debounce:** a note is sent 1.5 s after the last edit, at the latest 10 s after the first unsent edit.
- **Flush right away** when: the tab is hidden, the window loses focus, the user switches note, or the page is closing (`fetch` with `keepalive`).
- Each change is an **idempotent upsert** (`PUT …/:id`), so retries can't create duplicates.
- **Retries:** 1 s, 2 s, 4 s… up to 60 s; paused while offline (`navigator.onLine` + `online` event).

### 7.3 Getting changes (pull)
- `GET /api/v1/sync?cursor=…` returns everything changed after the cursor (including deletions), up to 500 items per page, plus a new cursor.
- Runs on app start, when the tab comes back into view, after a push, and every 60 s while visible.
- Only **one tab** syncs at a time (Web Locks API); other tabs update through the existing localStorage `storage` events.

### 7.4 Conflicts
Every push includes the `version` the device last saw (`baseVersion`).
- Same version → saved, version +1.
- Different version (another device changed it) → the server answers `409` with its copy, and the device decides:
  - Only flags/category differ → **merge field by field** (newest per field).
  - Text differs on both → the **newest edit wins**; the other text is saved as a **new note** "Title (copy from another device)". Never lose text.
  - Deleted on one device, edited on the other → **edit wins** (the note comes back); deleting is easy to repeat, lost writing isn't.

### 7.5 The note that's open
If a newer version arrives for the note being edited:
- You have unsent edits → yours stay (they'll be pushed, and §7.4 applies).
- You're not typing → the editor reloads that note quietly.
- You're typing → it waits until you pause.

### 7.6 Category deletion
Deleting a category sets `categoryId: null` on its notes, on the device and on the server (same request, in one MongoDB transaction).

### 7.7 Emptying the trash / deleting forever
Sent as tombstones (batched). Tombstones are kept 30 days so offline devices still hear about them, then removed.

## 8. API

All routes: JSON, session cookie, user id **always from the session, never from the request**, bodies validated with Zod, consistent errors `{ error: { code, message } }`.

| Method & path | What it does | Notes |
|---|---|---|
| `GET /api/auth/*`, `POST /api/auth/*` | Better Auth (sign in, callback, sign out, session) | |
| `GET /api/v1/sync?cursor=` | Changes since cursor (notes, categories, settings) | paginated, 500 per page |
| `POST /api/v1/sync/import` | First-sign-in upload of a device's notes and categories | batches of 200, idempotent |
| `PUT /api/v1/notes/:noteId` | Create or update a note (`baseVersion` in body) | 200 / 409 / 413 |
| `DELETE /api/v1/notes/:noteId` | Delete forever (tombstone) | |
| `PUT /api/v1/categories/:categoryId` | Create or rename | |
| `DELETE /api/v1/categories/:categoryId` | Delete, unassign its notes | transaction |
| `GET /api/v1/settings`, `PUT /api/v1/settings` | Synced settings | |
| `GET /api/v1/notes/:noteId/share` | Is this note shared? link + views | |
| `POST /api/v1/notes/:noteId/share` | Turn link on (reuses the active link if there is one) | |
| `DELETE /api/v1/notes/:noteId/share` | Turn link off | |
| `DELETE /api/v1/account` | Delete account and all server data | |
| Page `GET /s/:token` | Public read-only note | server-rendered |

Limits: note ≤ 1 MB, title ≤ 500, category name ≤ 60, 120 pushes/minute per user, 60 share views/minute per IP.

## 9. Public share page (`/s/:token`)

- Server component: looks up an active share, loads the note, renders it to HTML with `@blocknote/server-util` (read-only, same typography as the app). No editor JavaScript is sent.
- Shows title, "Updated <date>", the note, and a footer "Made with TakeMyNote · Start writing".
- Missing, turned off, deleted, or trashed → a friendly "This note isn't available" page (404 status).
- `noindex` (shared notes are private-by-link, never in Google). Link previews use the note title, the first ~150 characters, and a generated preview image with the title on the TakeMyNote background.
- Images inside notes are already external links; shown as-is (CSP already allows `https:` images).
- Counts a view at most once per visitor per hour.

## 10. Security and privacy

- **Authorization:** every database query includes `userId` from the session. Share pages look up by token only and expose nothing but that note's title, content and date.
- **Input:** Zod on every request; size limits; unknown fields stripped.
- **Sessions:** Better Auth cookies (`httpOnly`, `Secure`, `SameSite=Lax`), CSRF/origin checks built in.
- **Rate limits:** §8 limits, stored in `rateLimits`.
- **Secrets:** only in environment variables (§12). Never sent to the browser.
- **Data at rest:** MongoDB Atlas encrypts storage. Notes are **not** end-to-end encrypted (that would block sharing and server rendering); we say this plainly in the UI and docs. E2E could be a future opt-in.
- **AI key:** unchanged, never leaves the device.
- **CSP:** no change needed for sync (same origin). Google profile pictures are allowed by the existing `img-src https:`. Google's sign-in is a full-page redirect, so no extra script origins.
- **Copy updates:** landing page, FAQ ("Where are my notes stored?"), README, SECURITY.md and the in-app privacy line must say: "In your browser. If you sign in, also in your account so they sync."

## 11. Interface changes

- **Sidebar footer / icon rail:** "Sign in" button for guests; avatar for signed-in users (menu: sync status, Settings, Sign out).
- **Settings → Account** (new tab): Sign in with Google · signed-in email and avatar · "Last synced 2 min ago" + "Sync now" · Sign out · Delete account.
- **Note meta line:** sync status (`Synced`, `Syncing…`, `Offline · will sync`, `Couldn't sync, retrying`), only when signed in.
- **Share:** button in the note top bar and in the note menu; share dialog; sign-in prompt for guests.
- **Landing:** "Sign in" link in the nav (secondary); new FAQ answers on accounts and sharing.

All in the existing style (app blue, calm, no extra badges).

## 12. Setup and configuration

| Variable | Where it comes from |
|---|---|
| `MONGODB_URI` | MongoDB Atlas → Connect → Drivers |
| `BETTER_AUTH_SECRET` | random 32+ bytes (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | `https://www.takemynote.online` (and `http://localhost:3000` locally) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google Cloud Console → OAuth client (Web). Redirect URIs: `https://www.takemynote.online/api/auth/callback/google`, `http://localhost:3000/api/auth/callback/google` |

- MongoDB client is created once and reused across requests (important on Vercel's serverless functions).
- Without these variables the app still runs in guest mode: sign-in and sharing are simply hidden. Contributors don't need a database to work on the app.
- `.env.example`, README and CONTRIBUTING get the new variables.

## 13. Files (planned)

```
lib/server/                     server-only (import "server-only")
  db.ts                         MongoDB client (cached), collections
  auth.ts                       Better Auth config (Google, Mongo adapter)
  session.ts                    getCurrentUser() for the Data Access Layer
  schemas/                      Zod schemas: note, category, settings, share, sync
  repositories/                 notes.ts, categories.ts, settings.ts, shares.ts
  rate-limit.ts
  http.ts                       JSON responses, errors, validation helpers
lib/auth-client.ts              Better Auth React client
lib/sync/
  outbox.ts                     pending changes (localStorage)
  sync-engine.ts                debounce, push, pull, retries, conflicts
  syncing-data-adapter.ts       wraps the local adapter, feeds the outbox
  merge.ts                      conflict rules (pure, unit-tested)
  device-id.ts
hooks/use-session.ts, hooks/use-sync-status.ts, hooks/use-share.ts
app/api/auth/[...all]/route.ts
app/api/v1/sync/route.ts, sync/import/route.ts
app/api/v1/notes/[noteId]/route.ts, notes/[noteId]/share/route.ts
app/api/v1/categories/[categoryId]/route.ts
app/api/v1/settings/route.ts, account/route.ts
app/s/[token]/page.tsx (+ opengraph-image.tsx, not-found)
components/account/             sign-in button, account menu, account tab, sign-out dialog, delete dialog
components/share/               share dialog, sign-in-to-share prompt
scripts/db-setup.mjs            validators + indexes
```

## 14. Edge cases (checked in the design)

1. Signed in, offline for days, then reconnects → outbox replays; conflicts handled (§7.4).
2. Two tabs open → one syncs (Web Locks), both stay current.
3. Sign out with unsent changes → flush first; warn if offline.
4. Session expires mid-edit → keeps saving locally, shows "Sign in again to sync", resumes after sign-in.
5. A note bigger than 1 MB → stays local, status says "Too large to sync" with a hint (split the note).
6. Category deleted on device A while device B assigns a note to it → note ends up uncategorised, nothing breaks.
7. The same Google account on many devices at once → all converge through versions + pull.
8. Restoring a backup while signed in → restored notes are merged into the account (not replacing it), after a confirmation.
9. Signing in with a different account than last time on this device → notes from the previous account aren't uploaded to the new one; the dialog asks.
10. Account deleted on another device → next request returns 401; this device drops back to guest mode and keeps its copy.
11. Shared note is trashed or deleted → link shows "not available"; restoring it brings the link back if it wasn't turned off.
12. Shared note edited → link shows the new version after it syncs.
13. Link guessing → 131-bit tokens + rate limits make it impractical.
14. Very first pull of a big account → paginated (500 per page) with a progress toast.
15. Clock differences between devices → conflict decisions use server versions; device clocks only break ties.
16. Scratchpad (a single special note) → synced like any note; if two devices each created one before syncing, they're merged into one (older one kept as a normal note).
17. Template notes and AI results → ordinary notes, nothing special.
18. Guest mode with no environment variables (contributors, self-hosters) → app works; account features hidden.

## 15. Testing

- **Unit:** merge/conflict rules, outbox coalescing, debounce timings, Zod schemas.
- **API:** every route with no session (401), another user's ids (404, never 403 to avoid leaking existence), bad bodies (400), oversized notes (413), conflicts (409).
- **End to end (Playwright, two browser contexts = two devices):** sign in → edit on A → appears on B; offline edits; conflict copy; sign out keep/remove; share on → open as anonymous → share off → 404; delete account.
- **Load:** first sync of 2,000 notes.
- Google sign-in is tested with a test Google account on a preview deployment.

## 16. Build order

1. **Foundations:** env, MongoDB client, `db-setup` script, Zod schemas, Better Auth with Google, `/api/auth`.
2. **Account UI:** sign-in button, account menu, Settings → Account, sign-out dialog (no sync yet).
3. **Server data:** repositories + `/api/v1` routes + tests.
4. **Sync engine:** outbox, debounce, push, pull, conflicts, syncing adapter, status indicator, first-sign-in import.
5. **Settings sync.**
6. **Sharing:** share APIs, share dialog, public page, link previews.
7. **Delete account, copy and docs updates, full QA** (desktop, phone, dark mode, two devices, offline).

Each step ships with nothing broken for guests: until a user signs in, the app behaves exactly as it does today.

## Guest sharing (added after launch)

Sharing no longer needs an account. A guest's notes live only in their browser, so turning on the link publishes a **copy of that one note** to `guestShares` (title, content, trashed, last edit time). Nothing else leaves the browser.

- `POST /api/v1/guest-shares` creates the link and returns a random 43-character **key**, sent once. The server stores only its SHA-256. The browser keeps `{ token, key }` per note in `takemynote:guest-shares` (never in backups).
- `GET/PUT/DELETE /api/v1/guest-shares/<token>` need the key in the `x-share-key` header. A wrong key and a missing link both return 404. Turning the link off deletes the copy.
- Edits to a shared note update the copy 2 seconds after typing stops (`lib/sharing/guest-shares.ts`, hooked into the syncing data adapter), retry after 30 seconds if offline, and are sent straight away when the tab closes. Trashing hides the page ("not available"); deleting for good removes the copy.
- Limits: 30 new links per hour per visitor (hashed IP), 900 updates per hour per link, the same 1 MB note limit. The public page is noindex and sanitized, as for account shares.
- **Signing in** claims each guest link (`POST …/claim`): it becomes an ordinary account share with the same token, so links people already have keep working and now show the synced note. Choosing "remove this device's notes" on an account switch takes the guest links down first.
