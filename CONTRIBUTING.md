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

The app runs at [http://localhost:3000](http://localhost:3000). It needs no environment variables or accounts. To try the AI features, add your own OpenAI, Google or Anthropic key in **Settings → AI** inside the app.

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
- **Privacy is a feature.** Notes stay in the browser. Don't add analytics, tracking, or anything that sends note content anywhere, except the AI request the user explicitly asks for.
- **Never handle keys carelessly.** AI keys go only through `lib/ai/key-vault.ts`. Never log them, store them in React state, or include them in exports.
- **Match the code around you.** TypeScript, functional React components, Tailwind classes, and the existing naming and comment style.
- **Mobile matters.** Check that layouts work on small screens.
- **Templates** live in `lib/templates/library/` as Markdown. Make them genuinely useful: real structure, examples and dates, not just headings.

## Commit messages

Short and descriptive, in the style used so far, e.g. `feat: add habit tracker template` or `fix: keep selection when opening Ask AI`.

## Code of Conduct

By taking part you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
