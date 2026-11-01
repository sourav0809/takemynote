import "server-only";

/**
 * Server configuration. Accounts, sync and sharing turn on only when the
 * database and auth secrets are set, so the app runs in guest mode for
 * contributors and self-hosters without any setup.
 */
export const serverEnv = {
  mongoUri: process.env.MONGODB_URI,
  mongoDbName: process.env.MONGODB_DB ?? "takemynote",
  authSecret: process.env.BETTER_AUTH_SECRET,
  authUrl: process.env.BETTER_AUTH_URL,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  /** Vercel Blob store token, for uploaded images (profile photos, images in notes). */
  blobToken: process.env.BLOB_READ_WRITE_TOKEN,
} as const;

/** "Continue with Google" is offered when its OAuth client is configured. */
export const hasGoogleSignIn = Boolean(serverEnv.googleClientId && serverEnv.googleClientSecret);

/** True when sign-in (email and password, plus Google if set up), sync and sharing are available. */
export function isAccountsEnabled(): boolean {
  return Boolean(serverEnv.mongoUri && serverEnv.authSecret);
}

/** Images can be uploaded (stored in Vercel Blob). */
export function hasImageUploads(): boolean {
  return isAccountsEnabled() && Boolean(serverEnv.blobToken);
}
