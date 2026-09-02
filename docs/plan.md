# Local Persistence Plan

Status: proposed, not yet implemented.

## 1. Goal

Replace the current in-memory `notesStore` (a module-level array that resets on every page refresh) with real persistence in the browser's `localStorage`, while:

- Showing a **first-run welcome note** to brand-new users only.
- Never re-seeding that welcome note (or any other demo data) once a real user has cleared it — an empty state after that is a real empty state, not "the app is broken."
- Persisting **notes, categories, and preferences** (not just notes).
- Keeping every existing component, hook, and React Query call site **unchanged**. All persistence work happens behind the same `notesStore`-style interface that hooks already call through.
- Being structured so a future swap to MongoDB (or any server API) touches **one file** (a new adapter), not the 20+ files that currently import `notesStore`.

## 2. Current state (what exists today)

| Piece | File | Persistence today |
|---|---|---|
| Notes + categories | `lib/notes-store.ts` | In-memory array, reseeded from `lib/mock-data.ts` on every load |
| React Query wiring | `hooks/use-notes.ts`, `hooks/use-categories.ts` | Calls `notesStore` methods, wrapped in fake-async `queryFn`/`mutationFn` |
| Preferences (active block highlight, scroll past end, sort by, text direction) | `hooks/use-preferences.tsx` | React Context + `useState`, resets on refresh |
| Theme (light/dark) | `next-themes` via `providers/theme-provider.tsx` | Already persisted to `localStorage` by `next-themes` itself — **no change needed** |
| App UI state (active folder, selected note, search query, list view/filter, settings dialog open) | `hooks/use-app-state.tsx` | React Context + `useState`, resets on refresh — **intentionally ephemeral**, see §5 |
| Backup/Import/Export UI | `components/settings/data-management-tab.tsx` | Buttons exist, wired to `toast.info(...)` placeholders only |

## 3. Storage architecture

### 3.1 Adapter interface

Introduce one interface that both a localStorage adapter and (later) a MongoDB/API adapter implement identically:

```ts
// lib/data/data-adapter.ts
interface DataAdapter {
  getNotes(): Promise<Note[]>;
  getCategories(): Promise<Category[]>;
  createNote(categoryId: string | null): Promise<Note>;
  updateNote(id: string, changes: Partial<Note>): Promise<Note | undefined>;
  deleteNotePermanently(id: string): Promise<void>;
  emptyTrash(): Promise<void>;
  createCategory(name: string): Promise<Category>;
  renameCategory(id: string, name: string): Promise<void>;
  deleteCategory(id: string): Promise<void>;
}
```

This is (deliberately) almost identical to today's `notesStore` shape — the only change is every method becomes genuinely `async` (it already looks async at the call site because `hooks/use-notes.ts` wraps everything in `queryFn`/`mutationFn`, so **no calling code changes**).

### 3.2 localStorage adapter (this phase)

`lib/data/local-storage-adapter.ts` implements `DataAdapter`:

- Reads/writes one JSON blob per collection (see §3.3 for keys).
- Every mutating method: read current array from storage → mutate → write back → return the changed item. Same logic `notesStore` has today, just persisted.
- Wrapped in a small **write queue / mutex** (a resolved-promise chain) so two rapid mutations (e.g. fast typing triggering `updateNote` twice) can't interleave a read-modify-write and silently drop one change. This is the one real risk of naive localStorage access and is cheap to guard against.

### 3.3 Storage keys & schema versioning

```
takemynote:schemaVersion   -> number, e.g. 1
takemynote:notes           -> Note[]
takemynote:categories      -> Category[]
takemynote:preferences     -> Preferences (serializable subset)
takemynote:initialized     -> boolean  (see §4)
```

All keys are namespaced with `takemynote:` so the app never collides with anything else the browser might store for the same origin, and so a future "clear only our data" action is a trivial prefix-scan.

`schemaVersion` exists from day one even though there's only one version right now, because:
- It costs nothing to add now and is very costly to retrofit later (you'd have no way to distinguish "old shape data" from "new shape data" for existing users).
- A tiny `migrations` array (`{ from: 0, to: 1, migrate: (raw) => ... }`) runs on load if `schemaVersion` is behind current, before anything else touches the data. Empty today, ready when the `Note`/`Category` shape changes.

### 3.4 Where reads/writes actually happen

`lib/data/local-storage-adapter.ts` is the **only** file that calls `localStorage.getItem`/`setItem`. No component, hook, or other lib file touches `localStorage` directly — this is what keeps the future MongoDB swap to "write a new adapter file, change one import."

## 4. First-run vs. cleared-by-user

This is the part that needs to be precise, since it's explicitly the behavior you asked for.

**Rule:** the welcome note is seeded **once**, the very first time the app is opened on a given browser (`takemynote:initialized` is absent). After that first seed, the flag is set to `true` forever, and the app **never** re-seeds — including if the user deletes every note and the notes array becomes empty.

Flow on app boot (inside the adapter's lazy-init, run once per page load):

1. Read `takemynote:initialized` from `localStorage`.
2. If **absent** (true first run, ever):
   - Write `takemynote:notes` = `[oneWelcomeNote]` (a single seeded note — see §4.1, not the current 6-note + scratchpad mock set).
   - Write `takemynote:categories` = `[]` (no pre-made categories either — a genuinely blank slate; the welcome note itself has no category).
   - Write `takemynote:initialized` = `true`.
3. If **present** (returning user, any subsequent load): read whatever is actually in `takemynote:notes` / `takemynote:categories`, no matter how empty. An empty notes array after this point renders the app's existing empty states (`EditorEmptyState`, empty note-list state) exactly as designed — that's correct behavior, not a bug to work around.

### 4.1 What the seeded welcome note contains

Replacing today's 6-note mock dataset, first-run seeds exactly **one** note:

- Title: "Welcome to TakeMyNote"
- Content: short HTML intro paragraph (reusing the existing copy already in `lib/mock-data.ts`'s `note-1`)
- No category, not favorited, not pinned, not scratchpad
- This is a normal, fully-editable, fully-deletable note — nothing about it is special after creation. There is no "is this the demo note" flag anywhere; once written to storage it's just a note like any other, which is what makes "delete it and it's gone forever" work for free.

`lib/mock-data.ts` stops being production seed data — it becomes fixture data used only by tests/Storybook-style dev tooling if needed later, or is deleted outright if nothing else references it after this change (needs a grep pass during implementation to confirm nothing else imports `initialNotes`/`initialCategories`).

### 4.2 Scratchpad note

Today's scratchpad note (`note-scratchpad`, `scratchpad: true`) is structural, not demo content — the "Scratchpad" nav item expects a note with that exact id to exist (`setSelectedNoteId("note-scratchpad")` is hardcoded in `app-sidebar.tsx`). Two options, to decide during implementation:

- **(a)** Keep seeding a single empty scratchpad note (`content: ""`) alongside the welcome note on first run only, since it's app furniture rather than a "look how great this app is" demo — clearing its content isn't the same as deleting it, and the nav item has nowhere else to point.
- **(b)** Change the Scratchpad nav item to lazily create-if-missing (check for a note with `scratchpad: true`, create one on first visit if none exists) rather than assuming a hardcoded id exists in storage.

Recommendation: **(b)** — it removes the hardcoded-id fragility entirely and means the scratchpad note follows the exact same "created for real, deletable if the id-lookup logic is ever revisited" story as everything else, with no special-cased seed data at all. Flagging both so you can confirm before implementation.

## 5. What does *not* get persisted (and why)

`hooks/use-app-state.tsx` (`activeFolder`, `activeCategoryId`, `selectedNoteId`, `searchQuery`, `listView`, `listFilter`, `isSettingsOpen`) stays **in-memory React state, not persisted** — reopening the app should land on a sensible default (Notes folder, most-recent note, no search filter active), the same way most note apps don't reopen mid-search. If you'd rather have `listView` (list/grid) and `listFilter` (all/recent/pinned) persist as sticky UI preferences, those two specifically are cheap to move into the `preferences` store — flagging as an open question rather than assuming.

## 6. React Query layer changes

`hooks/use-notes.ts` and `hooks/use-categories.ts` change in exactly one way: `notesStore.xxx(...)` calls become `dataAdapter.xxx(...)` calls, where `dataAdapter` is the currently-active `DataAdapter` implementation (localStorage today, swappable later). `queryFn`/`mutationFn` bodies already do nothing but forward to the store, so this is a mechanical rename, not a rewrite. `initialData` (which currently calls the sync store function directly) is removed, since adapter calls are genuinely async now — React Query's normal loading state takes over for the brief first read, which is a few milliseconds for localStorage.

## 7. Preferences persistence

`hooks/use-preferences.tsx` changes from bare `useState` to state that's initialized from `localStorage` (via the same `local-storage-adapter.ts`, a `getPreferences`/`setPreferences` pair, not the `DataAdapter` interface since preferences aren't a swappable-to-MongoDB collection in the same sense — though nothing prevents that later) and written back on every `setPreference` call. Same `PreferencesProvider` shape and API — no consuming component changes.

## 8. Backup / Restore / Export (wires up the already-stubbed buttons)

`components/settings/data-management-tab.tsx` already has three buttons with `toast.info("... coming soon")` placeholders. This phase wires them for real, since the underlying data now genuinely exists to export:

- **Download All Notes** → reuses existing `lib/download-note.ts` logic in a loop, zipped client-side (needs a small zip lib, e.g. `fflate`, or ships as multiple sequential downloads if we want zero new dependencies — decide during implementation).
- **Backup All Notes** → serializes `{ schemaVersion, notes, categories, preferences }` to one JSON file, downloaded via a Blob URL.
- **Import Backup** → file input → parse JSON → run through the same migration path as normal boot (§3.3) → validate shape → overwrite storage → invalidate all React Query caches.

This directly gives you a manual "export before we had a real backend" story, and the same JSON shape becomes the exact payload a future MongoDB import endpoint would accept.

## 9. Migration path to MongoDB (why this design supports it for free)

When a real backend exists:

1. Write `lib/data/api-adapter.ts` implementing the same `DataAdapter` interface, calling REST/tRPC endpoints instead of `localStorage`.
2. Swap one import in `hooks/use-notes.ts` / `hooks/use-categories.ts` (or, cleaner, put the active adapter behind a single `lib/data/index.ts` that exports `dataAdapter`, so literally one file changes).
3. Existing localStorage data becomes the payload for a **one-time "import my local notes" flow** on first login — the exact same import path built in §8, just fed programmatically instead of via a file picker.
4. Nothing in `components/`, `hooks/use-notes.ts`'s consumers, or any UI changes at all.

## 10. File-level implementation checklist

- [ ] `lib/data/data-adapter.ts` — interface + shared types
- [ ] `lib/data/local-storage-adapter.ts` — implementation, write-queue, namespaced keys
- [ ] `lib/data/migrations.ts` — `schemaVersion` migration runner (empty migrations array to start)
- [ ] `lib/data/seed.ts` — the single first-run welcome note (+ scratchpad decision from §4.2)
- [ ] `lib/data/index.ts` — exports the active `dataAdapter` singleton (swap point for §9)
- [ ] `hooks/use-notes.ts` — swap `notesStore` → `dataAdapter`, drop `initialData`
- [ ] `hooks/use-categories.ts` — same swap
- [ ] `hooks/use-preferences.tsx` — read/write through `local-storage-adapter.ts`'s preferences helpers
- [ ] `components/settings/data-management-tab.tsx` — wire up real export/backup/import
- [ ] `lib/notes-store.ts` — deleted once nothing imports it
- [ ] `lib/mock-data.ts` — deleted or demoted to dev-only fixture, pending the grep-for-other-usages check from §4.1
- [ ] `app-sidebar.tsx` — scratchpad create-if-missing logic, if §4.2 option (b) is chosen

## 11. Open questions (need your call before implementation)

1. **Scratchpad note**: seed it once like the welcome note (§4.2a), or make the Scratchpad nav item create-if-missing (§4.2b, recommended)?
2. **Sticky list view/filter**: should `listView` (list/grid) and `listFilter` (all/recent/pinned) persist across reloads as part of preferences (§5), or reset to defaults every load like the rest of `use-app-state`?
3. **Zip dependency for "Download All Notes"**: add a small client-side zip library, or ship it as N sequential single-file downloads to avoid a new dependency?
4. **Cross-tab sync**: if the user has the app open in two browser tabs, should edits in one tab reflect live in the other (via the `storage` event)? Out of scope for a first pass unless you want it now.
