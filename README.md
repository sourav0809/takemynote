<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/assets/logo-dark.png">
  <img src=".github/assets/logo.png" alt="TakeMyNote" height="64">
</picture>

### Calm notes that stay in your browser.

A private, focused notebook with a rich editor, 21 free templates and AI that uses your own key.<br>
No sign-up needed: notes stay in your browser, and you can share one with a link without an account. Sign in only if you want sync.

[**Open the app**](https://www.takemynote.online) · [Website](https://www.takemynote.online) · [Report a bug](https://github.com/sourav0809/takemynote/issues/new?template=bug_report.yml) · [Request a feature](https://github.com/sourav0809/takemynote/issues/new?template=feature_request.yml)

[![License: MIT](https://img.shields.io/badge/license-MIT-1d6fb8.svg)](LICENSE)
[![CI](https://github.com/sourav0809/takemynote/actions/workflows/ci.yml/badge.svg)](https://github.com/sourav0809/takemynote/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs)](https://nextjs.org)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-1d6fb8.svg)](CONTRIBUTING.md)
[![Sponsor](https://img.shields.io/badge/sponsor-%E2%9D%A4-db61a2?logo=githubsponsors&logoColor=white)](https://github.com/sponsors/sourav0809)

<br>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/assets/app-dark.png">
  <img src=".github/assets/app-light.png" alt="TakeMyNote: a note open in the editor with the sidebar and note list" width="100%">
</picture>

</div>

## Why TakeMyNote

Most note apps want an account, a subscription and your data on their servers before you can write a word. TakeMyNote is the opposite: open it and start writing. Everything is saved in your browser. Share any note with a link, no account needed. If you want your notes on every device, sign in. That part is optional.

## Features

**Writing**

- Rich editor with headings, lists, task lists, quotes, tables, code blocks and images
- Type `/` for any block, or select text for formatting
- Word count and reading time, with your choice of writing area: left, centered or full width

**AI, with your own key** ([details below](#ai-with-your-own-key))

- Select a few lines and say what you want: _"add a few bullets and fix the grammar"_. Only that part changes.
- Quick actions: improve, fix spelling and grammar, shorter, longer, simplify, change tone, translate
- Write at the cursor, summarize a note, turn it into a checklist or keep writing
- Works with OpenAI, Google Gemini or Anthropic Claude

**Organize**

- Instant search across every note
- Favorites, pins, categories, trash and a scratchpad
- Two layouts (Classic three-column, or Library + Page); drag a sidebar's edge to resize it, or shrink it to a slim icon bar

**Sync and sharing (optional)**

- Create an account (email and password, or Google) to sync notes, categories and settings across devices
- Edits save on the device first, so it's instant and works offline; changes catch up in the background
- Two devices editing the same note never lose text: the other version is kept as a copy
- Share any note with a read-only public link, and turn it off any time

**Templates**

- 21 free templates: daily and weekly planners, meeting notes, trip planner, budget, habit tracker, book notes and more

**Yours to keep**

- Download any note as PDF, Markdown, text, HTML or JSON, or print it
- One-file backup of everything, and restore anywhere
- Light and dark mode, keyboard shortcuts for everything you do often

## AI with your own key

<img src=".github/assets/ai-edit.png" alt="Ask AI editing a selected paragraph: the rewrite is shown with Replace selection, Insert below, Try again and Discard" width="100%">

AI is optional. Add a key from OpenAI, Google or Anthropic during setup, in **Settings → AI**, or the first time you use an AI feature. Pick a model (only fast, inexpensive ones are offered) and, if you like, tell it how you write.

How your key is protected:

- **No middleman.** Requests go straight from your browser to the provider you chose, through the [Vercel AI SDK](https://ai-sdk.dev). They never pass through TakeMyNote's servers, so we can't see your key or your text.
- **Encrypted on your device.** The key is encrypted with AES-GCM using a WebCrypto key that can't be read back, even by the app's own code. Only the ciphertext is kept in local storage.
- **Never shared.** It's left out of backups and exports, never shown again after saving (only the last 4 characters), and can only be sent to the provider it belongs to.
- **Locked-down page.** A Content-Security-Policy only lets the app talk to itself and the three provider APIs.

Our own instructions to the model are fixed; yours (tone, language, style) are added on top and can't override them. Nothing changes in a note until you accept the result.

## Templates

<img src=".github/assets/templates.png" alt="The template gallery with categories, a list of templates and a live preview" width="100%">

## Keyboard shortcuts

| Action                     | Mac         | Windows / Linux          |
| -------------------------- | ----------- | ------------------------ |
| New note                   | `⌘` `⌥` `N` | `Ctrl` `Alt` `N`         |
| Search notes               | `⌘` `⌥` `F` | `Ctrl` `Alt` `F`         |
| Add to favorites           | `⌘` `⌥` `S` | `Ctrl` `Alt` `S`         |
| Move to trash              | `⌘` `⌥` `⌫` | `Ctrl` `Alt` `Backspace` |
| Light / dark               | `⌘` `⌥` `T` | `Ctrl` `Alt` `T`         |
| Ask AI (inside a note)     | `⌘` `J`     | `Ctrl` `J`               |
| Insert a block             | `/`         | `/`                      |

## Run it locally

You need [Node.js](https://nodejs.org) 20.9 or newer.

```bash
git clone https://github.com/sourav0809/takemynote.git
cd takemynote
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No environment variables are needed: without them the app runs in guest mode (everything in the browser) and sign-in, sync and sharing are hidden.

#### Accounts and sync locally (optional)

1. Start a throwaway MongoDB: `npm run db:dev` (prints a `MONGODB_URI`), or use a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.
2. Create a Google OAuth client (Google Cloud Console → APIs & Services → Credentials → OAuth client ID → Web) with the redirect URI `http://localhost:3000/api/auth/callback/google`.
3. Copy [`.env.example`](.env.example) to `.env` and fill in `MONGODB_URI`, `BETTER_AUTH_SECRET` (`openssl rand -base64 32`), `BETTER_AUTH_URL=http://localhost:3000`, `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

Collections, validators and indexes are created automatically on first connection.

| Script              | What it does                 |
| ------------------- | ---------------------------- |
| `npm run dev`       | Start the development server |
| `npm run build`     | Production build             |
| `npm start`         | Serve the production build   |
| `npm run lint`      | ESLint                       |
| `npm run typecheck` | TypeScript, no output        |
| `npm run db:dev`    | Throwaway local MongoDB      |

The scripts in `scripts/` that regenerate the brand images use OpenAI and Gemini keys from a `.env` file (see [`.env.example`](.env.example)). You only need them if you're changing the artwork.

### Deploy

It's a standard Next.js app, so it deploys anywhere Next.js runs. On [Vercel](https://vercel.com/new), import the repository and deploy: with no settings it runs in guest mode.

To turn on accounts, sync and sharing, add `MONGODB_URI`, `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` (your site's address, e.g. `https://www.takemynote.online`). That enables email and password accounts. For "Continue with Google", also add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, with `<your address>/api/auth/callback/google` as a redirect URI in the Google OAuth client. For profile photo uploads, connect a public [Vercel Blob](https://vercel.com/docs/vercel-blob) store to the project (this adds `BLOB_READ_WRITE_TOKEN`). Redeploy after changing them.

If you deploy to your own domain, set `NEXT_PUBLIC_SITE_URL` so canonical URLs, the sitemap and link previews point to it. `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (defaults to the token for www.takemynote.online in `lib/seo.ts`) and `NEXT_PUBLIC_BING_SITE_VERIFICATION` are optional, for Search Console and Bing Webmaster Tools.

## How it's built

|           |                                                                                                                                                     |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework | [Next.js 16](https://nextjs.org) (App Router), [React 19](https://react.dev), TypeScript                                                            |
| Editor    | [BlockNote](https://www.blocknotejs.org)                                                                                                            |
| AI        | [Vercel AI SDK](https://ai-sdk.dev) with the OpenAI, Google and Anthropic providers                                                                 |
| UI        | [Tailwind CSS 4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) on [Base UI](https://base-ui.com), [Lucide](https://lucide.dev) icons |
| Data      | Browser `localStorage` through [TanStack Query](https://tanstack.com/query); optional sync to [MongoDB](https://www.mongodb.com)                  |
| Accounts  | [Better Auth](https://www.better-auth.com) with Google sign-in                                                                                     |
| Export    | [jsPDF](https://github.com/parallax/jsPDF) for PDFs                                                                                                 |

```
app/
  (www)/            Landing page
  (app)/notes/      The app
components/         UI, grouped by area (editor, ai, settings, landing, …)
hooks/              React hooks (notes, preferences, AI streaming, …)
lib/
  ai/               Providers, prompts, writing agent, encrypted key vault
  data/             Local storage, migrations, preferences
  sync/             Sync engine (outbox, debounce, conflicts), API client, schemas
  server/           Server only: MongoDB, auth, repositories, rate limits
  editor/           Note conversion (Markdown, HTML) and editor helpers
  export/           PDF export
  templates/        The template library
docs/               Design notes and plans
```

## Privacy

- Without an account, notes, categories and settings are stored only in your browser's local storage. Clearing site data removes them, so make a backup from **Settings → Data management** first.
- If you sign in, they're also stored in your account (MongoDB) so they sync. They're encrypted at rest by the database host but not end-to-end encrypted. Delete your account any time from **Settings → Account**; that deletes everything stored in it.
- Shared notes are readable by anyone with the link and are never listed in search engines.
- Your AI key is never synced or uploaded. If you use AI, the text you choose goes straight to the provider you picked.
- No analytics or tracking.

## Contributing

Contributions are welcome, from typo fixes to new templates and features. Read [CONTRIBUTING.md](CONTRIBUTING.md) to get started, and please follow the [Code of Conduct](CODE_OF_CONDUCT.md).

Found a security issue? Please report it privately as described in [SECURITY.md](SECURITY.md).

If TakeMyNote is useful to you, a ⭐ on GitHub helps other people find it.

## Support the project

TakeMyNote is free, open source and has no ads or paid plan. If it saves you time, you can help keep it going:

<a href="https://github.com/sponsors/sourav0809"><img src="https://img.shields.io/badge/Sponsor_on_GitHub-%E2%9D%A4-db61a2?style=for-the-badge&logo=githubsponsors&logoColor=white" alt="Sponsor on GitHub" height="36"></a>
<a href="https://buymeacoffee.com/sourav0809"><img src="https://img.shields.io/badge/Buy_me_a_coffee-FFDD00?style=for-the-badge&logo=buymeacoffee&logoColor=black" alt="Buy me a coffee" height="36"></a>

## License

[MIT](LICENSE) © Sourav Pathak
