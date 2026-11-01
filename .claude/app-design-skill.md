---
name: calm-app-design
description: Use this skill when designing, restyling or reviewing any screen inside the TakeMyNote app (the /notes route) — layout, sidebar, note list, editor, settings, dialogs, empty states, mobile behaviour. Covers the product stance (simplicity is the USP), the real feature inventory, rules that keep the UI from looking AI-generated, the layout spec for desktop and phone, component rules, and a QA checklist. Pair with design-skill.md (marketing site) for shared taste; this file wins inside the app.
---

# Calm app design (TakeMyNote, inside the app)

The landing page sells a promise: *a calm, private notebook*. The app has to keep it. People open a notes app to write something down in the next five seconds. Every pixel that is not the note, the list of notes, or the way back to them is a cost.

**The USP is simplicity.** When a design choice is unclear, pick the version with fewer things on screen.

## 1. Product stance

- **Writing first.** The open note is the hero. Chrome (toolbars, badges, counters) stays quiet and gets out of the way while typing.
- **Honest UI.** Every visible control does something today. No placeholders, no "coming soon" buttons, no fake plan labels.
- **One way to do each thing** in each place. Shortcuts and context menus are accelerators, not the only path.
- **Same product as the landing page.** Same blue (`--primary`), same neutral greys, same Inter, same logo. The app uses the shadcn tokens in `app/globals.css` (`:root` / `.dark`); never introduce a second palette.

## 2. Feature inventory (keep all of these working)

| Area | Feature | Where it lives today |
| --- | --- | --- |
| Notes | Create, edit title, rich-text body (BlockNote), autosave | Sidebar "New Note", ⌘⌥N, editor |
| Editor | Bold/italic/underline/strike, H1/H2, bullet/numbered/task list, code block (highlighted), quote, link | Fixed toolbar, selection bubble, `/` menu, markdown shortcuts |
| Editor | Word count, reading time, last edited, category badge | Meta line, bottom bar |
| Organise | Folders: Notes, Favorites, Scratchpad, Trash | Sidebar |
| Organise | Categories: add, rename (double-click / context menu), delete | Sidebar |
| Organise | Favorite, pin, move to trash, restore, delete forever, empty trash | Note context menu, bottom bar, ⌘⌥S / ⌘⌥D |
| Find | Search (title + body), filters All / Recent / Pinned, list ↔ grid view | Note list header, ⌘⌥F |
| Data | Export note as Markdown, download all, JSON backup, import backup | Bottom bar, Settings → Data |
| App | Dark mode, settings dialog, keyboard shortcuts list, about | Bottom bar, Settings, ⌘⌥L |
| Privacy | Everything stored locally, no account | — |

### Known gaps (fix as part of any redesign; they are UX bugs, not new features)

1. **Dead controls:** Share, More (…), Add tag, Sync, AI Assist do nothing. Remove them, or wire them to a real action (e.g. "Add tag" → move note to a category).
2. **Dead settings:** Active block highlight, Scroll past end, Sort by, Text direction are saved but never read. Wire them or remove them from the Preferences tab.
3. **No way to change a note's category** after creation. Give the category badge a menu ("Move to…").
4. **Pin / favorite / trash are hidden** behind right-click. They need a visible path that also works on touch (an overflow menu on the note, and in the editor header).
5. **Pinned notes have no marker** in the list. Show a small pin glyph and a "Pinned" group.
6. **Settings is only reachable from the editor's bottom bar.** It needs one permanent home.
7. **Dark mode lives in three places.** Keep one visible toggle (Settings or the sidebar foot) plus the shortcut.
8. **Phones get three squeezed panes.** See §5.

## 3. Not AI-generated: the rules

Generated UIs share tells. Avoid every item in the left column.

| Looks generated | Looks designed |
| --- | --- |
| Sparkles icons, "AI Assist" pills, gradients on buttons | No AI affordance until AI exists. Plain verbs. |
| Every element is a rounded pill or a card with a shadow | Hairline dividers and whitespace separate things; cards only where something is truly a card (grid view) |
| An icon in front of every label | Icons only where they speed up scanning (folders, toolbar). Text-only for everything else |
| Centred empty state: big icon in a tinted rounded square + headline + CTA | One quiet sentence where the content would be, in the content's own position and size |
| Title Case Buttons, "Unleash", "Seamless", exclamation marks | Sentence case. Short, specific words: "New note", "Move to trash", "Nothing in Trash" |
| Uniform 16px padding everywhere | A spacing rhythm with intent: tight inside rows (4/8px), generous around the page (24–64px) |
| Badges and counters on everything | Counts only where they answer a question (Trash, Favorites). Muted, tabular numerals |
| Bright selected states (solid brand-colour blocks) or none at all | One clear selection marker, consistent everywhere |
| Fake data: "Free plan", avatar "You", "Pro" badges | Nothing that is not true |
| Dense toolbars repeating features | One primary formatting surface visible; the rest appear in context |
| Default shadcn look untouched (every component at stock radius and colour) | Components tuned to the product's own scale and voice |

Human signals worth adding:

- **Typography carries hierarchy**, not boxes: title 28–34px semibold with tight tracking, meta in 13px muted, list titles 14px semibold, previews 13px muted.
- **Tabular numerals** for counts and times (`tabular-nums`).
- **Optical alignment:** title text, body text and list text share one left edge per column.
- **Relative times written like a person:** "Just now", "2m", "Yesterday", "Mon", "12 Oct".
- **Keyboard first on desktop:** every frequent action has a shortcut, shown in menus and tooltips as small key caps.
- **Small, specific copy** in empty and error states ("Trash is empty. Deleted notes stay here until you empty it.").

## 4. Visual system (inside the app)

- **Colour:** tokens only (`bg-background`, `bg-sidebar`, `text-muted-foreground`, `bg-primary`, `bg-sidebar-accent`…). The blue is for the primary action and the current selection; never decorative.
- **Selection:** one style for "this is the current thing" (current folder, current note). Reuse it everywhere.
- **Type:** Inter only. Mono (Geist Mono) only for code and key caps.
- **Radii:** buttons and inputs follow the existing shadcn scale. Rows in lists: 10–12px when highlighted. Dialogs: existing.
- **Borders over shadows.** Shadows only on floating things (menus, popovers, dialogs, toasts).
- **Density:** desktop list rows ≈ 64–76px tall; phone rows ≥ 72px, tap targets ≥ 44px.
- **Motion:** 150–200ms colour/opacity changes only. The page and theme transitions already exist (`components/common/page-transition.tsx`, `hooks/use-theme-toggle.ts`); reuse them, add nothing bouncy.

## 5. Layout

Chosen direction: **see "Layout decision" at the end of this file.** Whatever the direction, these hold:

### Desktop (≥ 1024px)
- The open note gets the most width. Body text sits in a reading column of about 680–720px, centred in its pane.
- Navigation (folders, categories) is always one click away and never hides the note.
- The list shows title, one or two preview lines, time, and markers (pin, favorite) — nothing else.
- Resizable panes are allowed but must have sensible pixel defaults and minimums.

### Phone and tablet (< 1024px)
- **One screen at a time:** list → note, with a back control in the top-left that names where it goes.
- The new-note action is always reachable with one thumb on the list screen.
- Navigation (folders, categories, settings) lives in one sheet opened from the list header.
- While a note is open: the title scrolls with the text, the formatting bar sits above the keyboard or scrolls sideways, nothing else is fixed.
- Inputs use ≥ 16px text so iOS does not zoom. Respect `env(safe-area-inset-bottom)`.
- Only one editor instance is ever mounted (decide the layout before rendering it).

## 6. Components

- **Note row:** title (14px semibold, one line) · time (12px muted, right) · preview (13px muted, two lines) · markers (pin, star) inline before the title. Selected = the shared selection style. Hover = faint background. Overflow menu (⋯) appears on hover/focus on desktop and is always visible on touch.
- **Folder row:** icon (16px, muted; current = primary), label, count when useful.
- **Editor header:** back (phone), then breadcrumb-style context ("Notes / Travel") that doubles as the category menu, then favorite toggle and an overflow menu with Pin, Export Markdown, Move to trash.
- **Empty states:** a single muted sentence in place of the content. A button only when the next action is not otherwise visible.
- **Settings:** one dialog; on phones it becomes full height with tabs in a horizontal row.

## 7. QA checklist

- [ ] Every visible control performs a real action (click each one).
- [ ] All features in §2 still work: create, edit, autosave, every toolbar action, `/` menu, links, task check, favorite, pin, trash, restore, delete forever, empty trash, categories add/rename/delete, search, filters, list/grid, export, backup/import, dark mode, all five shortcuts.
- [ ] Screenshots at 390, 768, 1024, 1440, 1920 in light and dark. `scrollWidth - innerWidth` = 0.
- [ ] Notes persist across reload; old notes still open.
- [ ] No console errors; `tsc`, `eslint`, `next build` pass.
- [ ] Read every string on screen aloud: sentence case, no filler, nothing untrue.

## 8. Feedback log (owner's reactions — hard rules)

- **Black primary buttons and a plum/black dark theme were rejected** ("I don't like the black theme"). The app's blue theme is the brand; the landing page was re-themed to match it.
- **Warm stone neutrals + highlighter yellow were rejected** for the same reason: the app theme comes first.
- **A first in-place polish of the 3-pane layout was rejected and reverted** ("old app design was better"). It kept the copied 3-pane structure and added: light-blue tinted note cards with a ring, an icon-in-a-tinted-square empty state with a CTA, a sidebar footer, pill buttons everywhere, a centred reading column. Lesson: restyling a borrowed layout is not enough, and generic "polish" moves read as generated. Decide the layout and UX first, agree on it, then style.
- The owner wants the app to feel **human-designed and very simple**, keeping every current feature.
- **Small controls on coloured backgrounds** (the ⋯ on the blue selected note) must not inherit the generic grey ghost/focus styles. A grey focus ring and a grey "open" circle on blue were flagged as "breaking". Use tints of the foreground colour for hover, open and focus, and no ring on tiny round buttons that sit next to text.
- **Every selected state needs a visible highlight**, including the Settings tab list (light-blue `sidebar-accent`, the same as the sidebar). Hover must never override the selected style.
- After seeing Library + Page, the owner asked to **let users choose** between it and the 3-column look of the landing mock, saved locally, with a Settings preview. They also asked for the **note text to start at the left of the writing area** (toolbar centred is fine), a modern "/" menu with Lucide icons, and **working AI in every layout**.

## Layouts (user's choice)

The app ships **two layouts**. The user picks one in Settings → Preferences → Layout (visual miniatures, `components/settings/layout-picker.tsx`). The choice is stored in `takemynote:preferences.layout` (included in backups). **New visitors get `classic`**, which matches the product shown on the landing page.

| Layout | Desktop (≥ 1024px) | Phone / tablet |
| --- | --- | --- |
| `classic` | Sidebar (folders with counts, categories with dots, Settings) · note list · Page | List screen with ☰ (sidebar in a sheet) and +; tap a note → Page with ‹ back |
| `library` | Library (folder switcher, search, notes, Settings) · Page | Library screen; tap a note → Page with ‹ back |

Both layouts reuse the same parts: `NoteListBody`, `NoteListControls`, `NewNoteButton`, `useFolderNavigation`, `EditorPane`. A change to a note row or the Page appears in both automatically. Never fork them per layout.

**Page alignment:** the note column (title, meta, body) starts at the left of the writing area with the shared gutter (`NOTE_GUTTER_CLASS`); it is not centred. The formatting toolbar is centred.

## Writing area (user's choice)

Settings → Preferences → Writing area: **Left** (default; the note column starts at the edge of the writing area), **Centered** (Notion-style reading column), or **Full width**. Stored as `preferences.writingPosition` and included in backups. Applied in `note-editor.tsx` (`WRITING_COLUMN_CLASS`). The toolbar is always centred.

## Keyboard shortcuts

Defined once in `lib/shortcuts.ts` and used by both the handler and the Settings list. ⌘⌥ / Ctrl+Alt plus N (new), F (search), S (favorite), ⌫ (trash), T (theme). Match on `event.code`, never `event.key`: on a Mac, Option changes the character (⌥N → "˜"). Avoid OS and browser combos: ⌘⌥D toggles the macOS Dock and ⌘⌥L opens Chrome's downloads; D and L remain as hidden aliases. Ignore auto-repeat.

## Accounts, sync and sharing (optional)

Full design: `.claude/accounts-sync-sharing-plan.md`.

- **Off unless configured.** Without `MONGODB_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` and Google credentials, no account UI renders and `/api/v1/*`, `/api/auth/*`, `/s/*` return 404. Guests are unaffected.
- **Local-first.** The data adapter (`lib/sync/syncing-data-adapter.ts`) saves to localStorage first, then queues the change (`takemynote:outbox:<kind>:<id>`). The engine (`lib/sync/sync-engine.ts`) pushes 1.5 s after the last edit (≤ 10 s), pulls on start/focus/every 60 s, one tab at a time (Web Locks), retries with backoff.
- **Conflicts never lose text** (`lib/sync/merge.ts`): flags merge; different text → newest wins and the other becomes "Title (copy from another device)"; edit beats delete.
- **Sign in / create account:** one dialog (`components/account/auth-dialog.tsx`): painted picture left (`components/account/assets/auth-panel.webp`, made with `scripts/generate-image.mjs auth`), form right; a bottom sheet with the picture as a banner on phones. Email + password always; "Continue with Google" when configured.
- **Profile chip** replaces the Settings button in the sidebar footer (`components/account/account-menu.tsx`): avatar + first name, or a neutral avatar + "Guest". Its menu: Settings and Sign out (signed in) or Sign in, Create account and Settings (guest). Avatar-only in the collapsed rail.
- **UI:** Settings → Account (sync status, Sync now, sign out, delete account); sync status in the note meta line; Share button in the note top bar and note menu; share dialog with a switch and copy link (guests too: their link shows a copy of the note that the browser keeps up to date, and moves into the account on sign-in); public page `/s/<token>` (server-rendered, sanitized, noindex, own link preview).
- **Profile photo:** Settings → Account, click the avatar (camera badge) → Upload new photo / Remove photo. Shrunk in the browser (≤ 512px), re-encoded on the server to a 256×256 WebP with sharp, stored in Vercel Blob (`lib/server/repositories/avatars.ts`); hidden unless `BLOB_READ_WRITE_TOKEN` is set.
- **Never synced:** the AI key, collapsed-sidebar state, star-prompt state.

## Resizing and closing sidebars (desktop)

- No collapse buttons or shortcut (the owner wanted it simple). Drag a side column's edge to resize it. Dragging the sidebar (Classic's folders, or the Library) past its minimum width shrinks it to a 60px icon rail (`components/app-shell/sidebar-rail.tsx`: logo, New note, Search in Library, folders, theme, profile chip); it never disappears completely. In Library, choosing a folder or Search on the rail opens the Library again. Classic's note list closes completely. Drag the edge back out to reopen. `collapsible` panels with `collapsedSize` in `components/app-shell/desktop-shells.tsx`.
- Layouts (sizes and closed columns) are remembered per arrangement with `useDefaultLayout` (`classic-layout`, `library-layout`).
- The drag line highlights in the brand blue on hover/drag; the grab area is 12px (28px for touch).

## GitHub star

- **Landing footer:** `GithubStarButton`, a GitHub-style split button under the tagline. The star fills amber and turns on hover. The live count (`lib/github.ts`, fetched on the server, cached 1 h) only shows from `MIN_STARS_TO_SHOW` (10) up, so it never reads "0".
- **In-app ask:** `components/app-shell/star-prompt-dialog.tsx`, rules in `lib/star-prompt.ts`: at least 24 h since the first visit **and** opened on 2+ different days, onboarding done, ~20 s into a session, tab visible and nothing else open (retries a few times). "Star on GitHub" / "Don't ask again" / closing → never again; "Maybe later" → 7 days, at most twice. Device-only (`takemynote:star-prompt`, not in backups).

## First-run welcome

`components/onboarding/onboarding-dialog.tsx` appears once per browser, the first time someone opens /notes. Steps: **Welcome** (logo, one line, three facts: private, "/" to format, AI when you ask) → **Pick a layout** (the same cards as Settings, applied live) → **Where should your text sit?** → **Add AI (optional)** (provider, model, key; "Skip for now") → **Light or dark?** (Light / Dark / Match system, applied live) → "Start writing". "Skip" on step 1, or closing the dialog, keeps the defaults (Classic, system theme). Completion is stored as `preferences.onboardingCompleted`, which is included in backups, so restoring on a new device skips it. It renders only after hydration, so returning users never see a flash. **Sound:** each Continue / Back / Start writing plays a heartbeat, "dhuk-dhuk" (`public/sounds/onboarding-heartbeat.mp3`: a felt-drum thump generated with Google's Lyria, muffled below ~350 Hz and cut to ~120 ms so it reads as a pulse, doubled into a lub-dub with a small stereo room; `components/onboarding/use-onboarding-sound.ts`). Every beat is identical (pitch changes made it sound like a dholak); Back is quieter; Start writing is two beats. "Skip" and closing are silent. **The only other sound is a soft two-note chime when the user switches the theme (rising into light, falling into dark), synthesized with Web Audio in `lib/sound/theme-switch-sound.ts`. The owner asked for no sounds anywhere else.**

## Templates

- **Never block note creation.** "New note" is instant and blank. While a note is blank, a quiet row offers 4 quick picks plus "Browse all"; it disappears as soon as you type. "Hide suggestions" and Settings → Template suggestions turn it off. "New from template" (the layout icon next to New note) opens the gallery to create a new note.
- **Gallery** (`components/templates/`): search, category chips, cards with tags and a "Popular" badge, and a live preview. On phones it's the list, then a full preview screen. Opened from a blank note it fills that note ("Use template"); otherwise it creates one ("Create note").
- **Content** lives in `lib/templates/library/*.ts` as Markdown: real structure (tables, trackers, task lists, dividers), short italic prompts, and example rows. Placeholders `{{date}} {{weekday}} {{month}} {{weekRange}} {{mon}}…{{sun}}` are filled when the template is used. Convert with `templateMarkdownToBlocks`, which keeps empty list items as real empty blocks.
- The owner rejected thin outline templates ("people won't use these"). New templates must be genuinely useful: structure, examples and dates, not just headings.

## AI (bring your own key)

Plan and decisions: `docs/ai-plan.md`.

- **No server.** Requests go from the browser straight to the user's provider (OpenAI, Google or Anthropic) with the Vercel AI SDK. There is no `/api/ai` and no TakeMyNote key. Models (light ones only) are listed in `lib/ai/providers.ts`; the first per provider is the default.
- **Key safety** (`lib/ai/key-vault.ts`): AES-GCM with a non-extractable WebCrypto key in IndexedDB; only ciphertext + last 4 characters in localStorage (`takemynote:ai:secret`). Decrypted per request, never in React state, logs, backups or exports. The key is tied to its provider, so it can't be sent to another one. The CSP in `next.config.ts` limits `connect-src` to our origin plus the three provider APIs.
- **Prompts** (`lib/ai/prompts.ts`): a locked `SYSTEM_PROMPT`, then the user's "Additional instructions" (Settings → AI, pre-filled with `DEFAULT_INSTRUCTIONS`) inside `<user_preferences>`. Note text is wrapped in `<note>/<context>/<selection>` tags and treated as content, not instructions.
- **Agent** (`lib/ai/writing-agent.ts`): one `ToolLoopAgent` per request, no tools yet, streamed. Errors are mapped to plain messages in `lib/ai/ai-errors.ts`.
- **Setup:** an optional "Add AI" step in the welcome flow ("Skip for now"), Settings → AI, and `requireAi(action)` from `components/ai/ai-provider.tsx`, which opens a small setup dialog and then carries on with what the user started. All three use `AiSetupForm`, which checks the key with one tiny request before saving.
- **Ask AI** (`hooks/use-inline-ai.ts` + `components/editor/ai/inline-ai-panel.tsx`): "Ask AI" in the selection toolbar, ⌘J / Ctrl+J, "/" → "Ask AI to write…", or the toolbar ✦ AI menu. With a selection it edits only that range (`getSelectionCutBlocks` → restore the range → `pasteMarkdown`, one undo); without one it writes at the cursor. Free-text instruction plus quick actions (Improve, Fix grammar, Shorter, Longer, Simplify, List, Tone ▸, Translate ▸). The result streams into a preview; Replace selection / Insert below / Try again / Discard; typing again refines the result. The selection stays marked with a CSS Custom Highlight. Bottom sheet on phones.
- **Whole-note actions** (Summarize, Make a checklist, Fix spelling, Continue writing) stream into `ai-suggestion-panel.tsx` with Stop. Nothing changes in a note until the user accepts.

## "/" menu

Custom component (`components/editor/slash-menu/`), replacing BlockNote's default: groups Basics · Lists · Blocks · Ask AI, one Lucide icon per item in a small bordered tile, a one-line hint, and the shortcut as key caps (⌘ ⌥ 1). Curated items only (no H4–H6, toggle headings or uploads). Keyboard navigation and filtering come from BlockNote.

## Layout decision (Library + Page, original agreement)

**Chosen (agreed with the owner): Library + Page.** Two columns instead of the copied three. Dead controls are removed or wired to real actions.

```
┌─ Library (320px) ───────┬─ Page ─────────────────────────────────┐
│ TakeMyNote          [+] │ Notes / Travel ▾                ☆   ⋯  │
│ [Search notes…]         │  B I U S │ H1 H2 │ • 1. ☐ │ </> ❝ │ 🔗  │
│ Notes ▾           ≡  ▦  │                                        │
│ All   Recent   Pinned   │      Weekend in Lisbon                 │
│─────────────────────────│      Edited 2m ago · 312 words         │
│ PINNED                  │                                        │
│ 📌 Weekend in Lisbon  2m│      Land Friday morning…              │
│    Pastéis de nata at… ⋯│      ☐ Book the tram                   │
│ NOTES                   │                                        │
│ Book club picks      1h │                                        │
│─────────────────────────│                                        │
│ ⚙ Settings            ☾ │                                        │
└─────────────────────────┴────────────────────────────────────────┘
```

**Why:** one place to find notes, one place to write. Fewer concepts on screen, and it no longer looks like the borrowed 3-pane template.

**Library column**
- Header: logo + wordmark; one primary icon button for "New note" (tooltip shows ⌘⌥N).
- Search field.
- Folder switcher ("Notes ▾", shows the current folder or category). Its menu lists Notes, Favorites, Scratchpad, Trash with counts, then Categories with New, Rename and Delete. The list/grid toggle sits on the same row.
- Filters All / Recent / Pinned as plain text tabs; "Empty trash" appears on this row in Trash.
- Notes grouped under small "Pinned" and "Notes" labels when both exist. Each row has a ⋯ menu (same actions as the right-click menu). It shows on hover on desktop and is always visible on touch.
- Footer: Settings (the one permanent home) and the theme toggle (the one visible toggle).
- Empty list: one muted sentence specific to the folder or search.

**Page**
- Top bar: back link on phones; breadcrumb "Folder / Category ▾", which is the "Move to category" menu (replaces the dead Add tag button); favorite star; ⋯ menu with Pin, Export as Markdown and Move to trash (Restore / Delete forever in Trash). Replaces the dead More button.
- Formatting toolbar under it, without AI Assist.
- Reading column (max 720px): title and meta line scroll with the text.
- No bottom bar. Its contents moved: favorite → top bar, trash/export → ⋯, word count/edited → meta line, theme/settings → library footer. Sync was removed.
- Empty page (desktop): one muted sentence.

**Removed:** Share, Sync, AI Assist (they had no behaviour). The "Active block highlight" preference was removed (never implemented). "Sort by", "Text direction" and "Scroll past end" are now wired.

**Phone/tablet (< 1024px):** the Library is the home screen; tapping a note opens the Page full screen with "‹ Folder" back. Same components, one at a time; only one editor mounts.
