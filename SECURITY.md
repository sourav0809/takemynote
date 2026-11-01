# Security Policy

## Reporting a vulnerability

Please **don't** report security issues in public issues or pull requests.

Report them privately through [GitHub security advisories](https://github.com/sourav0809/takemynote/security/advisories/new). Include what you found, how to reproduce it, and the impact you expect. You'll get a reply within a few days, and credit in the fix if you'd like it.

## Supported versions

Only the latest version (the `production` branch, deployed at [www.takemynote.online](https://www.takemynote.online)) receives security fixes.

## How TakeMyNote handles data

Useful context when looking for issues:

- **Notes** are stored only in the browser's `localStorage`. There is no TakeMyNote server or database.
- **AI keys** are encrypted with AES-GCM using a non-extractable WebCrypto key kept in IndexedDB (`lib/ai/key-vault.ts`). Only the ciphertext is stored in `localStorage`. Keys are decrypted in memory per request and are excluded from backups and exports.
- **AI requests** go directly from the browser to the chosen provider (OpenAI, Google or Anthropic). A key is only ever sent to the provider it was saved for.
- **Content-Security-Policy** (`next.config.ts`) restricts network requests to the app itself and those three provider APIs.

Of particular interest: anything that could expose a saved key or note content to another origin, script injection through note content or imported backups, and CSP bypasses.
