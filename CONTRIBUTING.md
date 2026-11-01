# Contributing to TakeMyNote

Thanks for wanting to help. Bug reports, ideas, templates, copy fixes and code are all welcome.

## Before you start

- **Found a bug?** [Open a bug report](https://github.com/sourav0809/takemynote/issues/new?template=bug_report.yml). Steps to reproduce and your browser make it much faster to fix.
- **Have an idea?** [Open a feature request](https://github.com/sourav0809/takemynote/issues/new?template=feature_request.yml) before writing code for anything larger than a small fix, so we can agree on the approach.
- **Security issue?** Don't open a public issue. See [SECURITY.md](SECURITY.md).

## Set up

You need Node.js 20.9 or newer.

```bash
git clone https://github.com/<your-username>/takemynote.git
cd takemynote
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000). It needs no environment variables: without them it runs in guest mode. To try the AI features, add your own OpenAI, Google or Anthropic key in **Settings → AI** inside the app.

Working on accounts, sync or sharing? Run `npm run db:dev` for a throwaway local MongoDB and follow **README → Accounts and sync locally**. With just `MONGODB_URI` and `BETTER_AUTH_SECRET` set you can create an account with email and password; Google sign-in also needs its OAuth client.

## Making a change

1. Create a branch from `production`: `git checkout -b fix/short-description`.
2. Make your change. Keep pull requests focused on one thing.
3. Check it:
   ```bash
   npm run lint
   npm run typecheck
   npm run build
   ```
4. Try it in the browser, in light and dark mode, and on a narrow (phone-sized) window if you touched the UI.
5. Open a pull request and fill in the template. Screenshots or a short clip help a lot for UI changes.

## Guidelines

- **Simplicity first.** TakeMyNote should feel calm. Prefer fewer, clearer controls over more options.
- **Privacy is a feature.** Notes stay in the browser unless the user signs in to sync. Don't add analytics, tracking, or anything else that sends note content anywhere, beyond sync to their own account and the AI request they explicitly ask for.
- **Never handle keys carelessly.** AI keys go only through `lib/ai/key-vault.ts`. Never log them, store them in React state, or include them in exports.
- **Server data access** lives in `lib/server/repositories/`. Every query must filter by the user id from `getCurrentUser()`, never by an id from the request. Validate request bodies with the Zod schemas in `lib/sync/schemas.ts`.
- **Sync** changes go through the data adapter (`lib/data`), which saves locally first and queues the change. Don't call the sync API from components directly.
- **Match the code around you.** TypeScript, functional React components, Tailwind classes, and the existing naming and comment style.
- **Mobile matters.** Check that layouts work on small screens.
- **Templates** live in `lib/templates/library/` as Markdown. Make them genuinely useful: real structure, examples and dates, not just headings.

## Commit messages

Short and descriptive, in the style used so far, e.g. `feat: add habit tracker template` or `fix: keep selection when opening Ask AI`.

## Code of Conduct

By taking part you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
