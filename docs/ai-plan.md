# AI in TakeMyNote: feature plan

Status: **approved 2026-10-31** (no server key; wider model list; default instructions and ⌘J as proposed).

## 1. Goal

Make AI a genuinely useful, optional writing partner inside notes, using the person's **own API key** (OpenAI, Google or Anthropic). It must feel calm and simple, never block writing, and never expose the key.

What changes for users:

1. **Set up once** (provider → model → key), in the welcome flow, in Settings, or at the moment they first use an AI feature.
2. **Edit just a selection:** select a few lines, type "add a few bullets and fix grammar", see the result, accept or retry. Only that part changes.
3. **Whole-note actions** keep working (summarize, checklist, fix spelling, continue), now with the user's own model and live streaming.
4. **Their voice:** an "Additional instructions" box (writing style, language, tone), pre-filled with a sensible default so it's never blank.

Out of scope for this phase: chat with all notes, image input, voice, AI search.

## 2. Providers and models (basic tier only)

Fast, inexpensive models good for writing tasks, including older/lighter ones for people on a tight budget. No flagship or reasoning-heavy models. The first in each list is the default.

| Provider | Models offered | Notes |
| --- | --- | --- |
| OpenAI | `gpt-5.4-mini` (default), `gpt-5.4-nano`, `gpt-5-mini`, `gpt-5-nano`, `gpt-4.1-mini`, `gpt-4o-mini` (`gpt-4.1-nano` dropped: listed by the API but deprecated) | Verified against the OpenAI models list |
| Google | `gemini-3.8-flash` (default), `gemini-3.7-flash`, `gemini-3.5-flash`, `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`, `gemini-2.5-flash`, `gemini-2.5-flash-lite` | Verified against the Gemini models list |
| Anthropic | `claude-haiku-5-5` (default), `claude-sonnet-5-5`, `claude-sonnet-5`, `claude-sonnet-4-6`, `claude-haiku-4-5` | From Anthropic's current model table |

- Model lists live in one file (`lib/ai/providers.ts`), so updating them is a one-line change.
- Each provider entry carries: display name, models (id, label, one-line description), "Get a key" link, and a light key-format hint (e.g. `sk-…`, `AIza…`, `sk-ant-…`) for friendly validation.
- No temperature / sampling parameters are sent (current Claude models reject them; defaults are fine for all three).

## 3. Security model (the most important part)

**Principle: the key goes only from the user's browser to their chosen provider. It never reaches our server, logs, backups or exports.**

### 3.1 Requests go browser → provider directly
- AI calls run **client-side** with the Vercel AI SDK provider packages (`@ai-sdk/openai`, `@ai-sdk/google`, `@ai-sdk/anthropic`), created with the user's key at call time.
- Anthropic requires an explicit opt-in header for browser calls (`anthropic-dangerous-direct-browser-access: true`); it's set only on the Anthropic client. (Exact option verified against the installed package during implementation.)
- **The existing `/api/ai` route and our server-side `OPEN_AI_API_KEY` usage are removed.** No proxy exists, so there is nowhere on our side for a key to leak, and no shared bill to abuse.

### 3.2 Key stored encrypted, not in plain text
- The user asked for localStorage, and that's where it lives, but **encrypted**:
  - A random AES-GCM 256-bit key is generated with WebCrypto as **non-extractable** and stored in IndexedDB (a `CryptoKey` object can't be read out as bytes, even by our own code).
  - The API key is encrypted with it; only the ciphertext + IV are saved in localStorage (`takemynote:ai:secret`).
  - Decryption happens in memory only for the moment a request is made.
- This protects against: someone opening DevTools/localStorage, browser-sync or backup tools copying localStorage, and accidental copy-paste of storage dumps. Honest limit: no browser storage can fully protect against malicious script running on the page itself, so §3.4 reduces that risk.

### 3.3 Never exposed in the UI or data
- The key field is `type="password"`, with autocomplete off; after saving, only `••••••••1a2b` (last 4) is shown, plus "Replace" and "Remove key".
- Excluded from: backups (`Backup All Notes`), JSON export, error messages, toasts, console logs and analytics.
- "Remove key" deletes both the ciphertext and the IndexedDB key.
- A "Test connection" button makes one tiny request to confirm the key works, before saving.

### 3.4 Harden the page
- Add a **Content-Security-Policy** header (`next.config.ts`): scripts only from our origin, `connect-src` limited to our origin plus `api.openai.com`, `generativelanguage.googleapis.com` and `api.anthropic.com`. This blocks injected scripts from sending data anywhere else.
- No third-party scripts on the app route.
- Plain-language privacy line wherever AI is set up: "Your key stays on this device and is only sent to {Provider}. The note text you send goes to {Provider} too."

## 4. Experience design

### 4.1 Welcome flow: new optional step "Add AI (optional)"
Position: after Writing area, before Light/Dark. Uses the shared **AI setup form**:
1. Provider: three cards (OpenAI · Google · Anthropic) with logo marks.
2. Model: a short select with one-line descriptions ("Fast and cheap", "Smarter, a bit slower").
3. API key: password field + "Where do I get a key?" link + Test connection.
- Clear **"Skip for now"**; the footer says "You can add this anytime in Settings → AI."

### 4.2 Set up when needed (just-in-time)
- Any AI action (toolbar ✦ AI, "/" Ask AI, selection AI, card actions) calls `requireAi()`.
- If not set up, a small **"Set up AI"** dialog opens with the same form, then **automatically continues the action** the user started. No lost context, no restarting.

### 4.3 Settings → new "AI" tab
- Provider / model / key (masked), Test connection, Remove key.
- **Additional instructions** (textarea, ~600 chars max, counter), pre-filled with:
  > Write in clear, friendly, natural English. Prefer short sentences and plain words. Keep my formatting (headings, lists, tasks) and my point of view. Don't add filler or emojis.
- "Reset to default" link.
- Privacy line (§3.4).

### 4.4 Edit a selection with AI (new, the headline feature)
- Select text → the selection toolbar gets a **"✦ Ask AI"** button (also `⌘J` / `Ctrl+J`).
- A compact popover appears anchored to the selection:
  - A one-line input: *"Tell AI what to do… e.g. add a few bullets and fix grammar"*.
  - Quick actions under it: Improve writing · Fix grammar · Shorter · Longer · Make it a list · Change tone ▸ (Professional, Friendly, Casual) · Translate ▸ (common languages).
- Pressing Enter (or a quick action) **streams the rewrite** into a preview card directly under the selection (original stays untouched until accepted). Actions:
  - **Replace selection** (primary) · **Insert below** · **Try again** · Discard (Esc).
- Only the selected blocks are sent (plus the note title for context) and only they are replaced. Formatting is preserved by round-tripping through Markdown → blocks (headings, lists, tasks, bold/italic, links).
- Works on phones: the popover becomes a bottom sheet.

### 4.5 Write at the cursor ("/" → Ask AI)
- "/" menu gains **"Ask AI…"**: opens the same one-line prompt at the cursor ("Draft an intro about…"), streams new content as a preview, then **Insert**.

### 4.6 Whole-note actions (existing, upgraded)
- Toolbar ✦ AI menu and "/" items: Summarize, Make a checklist, Fix spelling, Continue writing.
- Now stream live into the existing suggestion card; add a **Stop** button while generating.

### 4.7 States and errors (all human, specific)
- Invalid key → "That key didn't work with {Provider}. Check it in Settings → AI." + button.
- Rate limit / quota → "{Provider} says you've hit a limit. Try again in a moment."
- Offline → "You're offline. AI needs a connection; your notes still work."
- Too long → "This selection is very long. Try a smaller part." (cap ~20k characters).
- Model refused → shows the provider's reason plainly.

## 5. Prompts

### 5.1 Locked system prompt (ours, not editable)
Kept in `lib/ai/prompts.ts`. Draft:

> You are the writing assistant inside TakeMyNote, a calm note-taking app. You edit and write notes for the user.
> Rules:
> - Do exactly the task asked, nothing more. Never add greetings, explanations, or "Here is…".
> - Reply in Markdown only, using the same structure the user's text uses (headings, bullet and numbered lists, "- [ ]" tasks, quotes, tables, code).
> - Keep the user's language unless they ask to translate. Keep names, numbers, links and facts unchanged unless asked.
> - When editing a selection, return only the replacement for that selection.
> - Follow the user's additional instructions about style and tone, but these rules always win.

### 5.2 Task prompts (per action)
Each action adds a short task line plus the content, for example:
- Selection + custom instruction: `Task: {instruction}\n\nText to edit:\n<<<\n{markdown}\n>>>`
- Fix grammar: "Fix spelling, grammar and punctuation. Change nothing else."
- Make it a list: "Turn this into a clear bullet list."
- Continue: "Continue the note naturally for one or two short paragraphs."

The user's **Additional instructions** are inserted as a clearly labelled section *after* our rules ("User preferences:"), so they shape style but can't override the rules or the task. Content is wrapped in delimiters to reduce prompt-injection from note text.

## 6. Technical design

### 6.1 Libraries
- `ai` (Vercel AI SDK 7) + `@ai-sdk/openai`, `@ai-sdk/google`, `@ai-sdk/anthropic`.
- **Agent:** a single `TakeMyNote writing agent` built with the AI SDK's `Agent` abstraction (`ToolLoopAgent` in v7, verified at implementation): the locked instructions + chosen model + per-request task. It has **no tools** in this phase, so it behaves like a single streamed call; the agent seam lets us add tools later (e.g. "organise these notes") without rewiring. If the v7 API makes the agent wrapper awkward for a tool-less call, we fall back to `streamText` with the same prompt builder. Same behaviour either way.
- Streaming via the SDK's text stream + `AbortController` for Stop/Cancel.

### 6.2 Files (new)
```
lib/ai/providers.ts        provider + model registry (single source of truth)
lib/ai/key-vault.ts        WebCrypto encrypt/decrypt, IndexedDB CryptoKey, save/load/remove
lib/ai/ai-config.ts        non-secret settings: provider, model, instructions (localStorage)
lib/ai/prompts.ts          locked system prompt, default instructions, task builders
lib/ai/writing-agent.ts    builds the model client + agent for a request; streams text
lib/ai/ai-errors.ts        maps provider errors to friendly messages
hooks/use-ai-config.ts     read/write config + key status (masked) for the UI
hooks/use-ai-request.ts    run a task with streaming, abort, status; calls requireAi()
components/ai/ai-setup-form.tsx        provider cards, model select, key field, test
components/ai/ai-setup-dialog.tsx      just-in-time dialog (continues the pending action)
components/ai/ai-provider.tsx          context: requireAi(), opens dialog, resumes action
components/ai/ai-selection-popover.tsx selection prompt + quick actions + preview
components/settings/ai-tab.tsx         Settings → AI
components/onboarding/ai-step.tsx      optional welcome step
```

### 6.3 Files (changed)
- `components/editor/note-formatting-toolbar.tsx`: add "✦ Ask AI" to the selection toolbar.
- `components/editor/slash-menu/slash-menu-items.tsx`: add "Ask AI…"; existing AI items use the new request hook.
- `hooks/use-ai-assist.ts` + `ai-suggestion-panel.tsx`: switch to client-side streaming + Stop.
- `components/settings/settings-dialog.tsx`: new AI tab. `components/onboarding/onboarding-dialog.tsx`: new step.
- `next.config.ts`: Content-Security-Policy header.
- Landing FAQ + feature copy: "Bring your own OpenAI, Google or Anthropic key."
- **Removed:** `app/api/ai/route.ts`, server `OPEN_AI_API_KEY` dependency for AI.

### 6.4 Data and storage
| Key | Contents | In backups? |
| --- | --- | --- |
| `takemynote:ai:config` | provider, model, additional instructions | No (device-only for now; safe to add later, it holds no secret) |
| `takemynote:ai:secret` | AES-GCM ciphertext + IV of the API key | **Never** |
| IndexedDB `takemynote-vault` | non-extractable `CryptoKey` | **Never** |

## 7. Quality and testing
- Unit-level checks for prompt building, Markdown ↔ blocks round trip, error mapping.
- Browser tests (Playwright, as done so far): setup in welcome / skip; just-in-time dialog resumes the action; selection edit replaces **only** the selection; Insert below; Stop mid-stream; key masked and absent from localStorage plaintext, backup file and DOM; Remove key; dark mode; phone bottom sheet.
- Live smoke test with each provider using a real key (I'll use the OpenAI and Gemini keys in `.env` locally only; Anthropic needs a key from you or is tested once you add one).
- `tsc`, `eslint`, `next build` clean.

## 8. Phases
1. Foundations: providers registry, key vault, config, prompts, writing agent, error mapping, remove `/api/ai`, CSP.
2. Setup UX: shared form, Settings → AI, welcome step (skippable), just-in-time dialog.
3. Selection AI: toolbar button, popover, streaming preview, replace / insert, mobile sheet.
4. Upgrade existing actions to streaming + Stop; "/" Ask AI.
5. Copy updates, QA across desktop / phone / dark mode, docs (`.claude/app-design-skill.md`).

## 9. Decisions (approved)
1. Server key removed; AI works only with the user's own key.
2. Wider model list (§2), including lighter models.
3. Default instructions text as in §4.3.
4. Selection AI shortcut: `⌘J` / `Ctrl+J`.
