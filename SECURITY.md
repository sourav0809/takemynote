# Security Policy

## Reporting a vulnerability

Please **don't** report security issues in public issues or pull requests.

Report them privately through [GitHub security advisories](https://github.com/sourav0809/takemynote/security/advisories/new). Include what you found, how to reproduce it, and the impact you expect. You'll get a reply within a few days, and credit in the fix if you'd like it.

## Supported versions

Only the latest version (the `production` branch, deployed at [www.takemynote.online](https://www.takemynote.online)) receives security fixes.

## How TakeMyNote handles data

Useful context when looking for issues:

- **Notes** are stored in the browser's `localStorage`. Signed-in users' notes, categories and synced settings are also stored in MongoDB (`lib/server/`), always scoped to the user id from the session. User ids are never taken from request bodies or URLs.
- **Accounts** use Better Auth with Google sign-in (`lib/server/auth.ts`). Sessions are `httpOnly`, `Secure`, `SameSite=Lax` cookies. Deleting an account requires a recent sign-in and removes all of the user's data.
- **Sync API** (`app/api/v1/`) validates every body with Zod (`lib/sync/schemas.ts`), caps request size (notes ≤ 1 MB), rate-limits writes per user, and MongoDB `$jsonSchema` validators enforce the same rules in the database (`lib/server/collection-setup.ts`).
- **Shared notes** (`/s/<token>`) use 128-bit random tokens, can be revoked, are `noindex`, rate-limited per visitor, and are rendered on the server through an HTML allow-list sanitizer (`lib/server/render-note.ts`). Visitor IPs are only stored as short-lived hashes for view counting. Guests can share without an account: the browser publishes a copy of that one note, and only the browser holding the link's 256-bit key (the server stores just its SHA-256) can update or remove it. New guest links are limited per visitor.
- **Profile photos** are uploaded only by signed-in users (≤ 4 MB, image types only), re-encoded on the server to a 256×256 WebP (which strips metadata such as GPS location), and stored in Vercel Blob under a random, unguessable URL. Old photos are deleted when replaced, removed, or when the account is deleted.
- **AI keys** are encrypted with AES-GCM using a non-extractable WebCrypto key kept in IndexedDB (`lib/ai/key-vault.ts`). Only the ciphertext is stored in `localStorage`. Keys are decrypted in memory per request, excluded from backups and exports, and never synced (the database validator rejects key fields).
- **AI requests** go directly from the browser to the chosen provider (OpenAI, Google or Anthropic). A key is only ever sent to the provider it was saved for.
- **Content-Security-Policy** (`next.config.ts`) restricts network requests to the app itself and those three provider APIs.

Of particular interest: reading or changing another user's notes, guessing or bypassing share links, script injection through note content (in the app or on shared pages) or imported backups, anything that could expose a saved AI key or note content to another origin, and CSP bypasses.
