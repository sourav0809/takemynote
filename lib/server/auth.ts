import "server-only";

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

import { collections, getAuthDb, getMongoClient } from "@/lib/server/db";
import { deleteStoredAvatar } from "@/lib/server/repositories/avatars";
import { deleteAllNoteImages } from "@/lib/server/repositories/note-images";
import { hasGoogleSignIn, hasImageUploads, isAccountsEnabled, serverEnv } from "@/lib/server/env";

const DAY_SECONDS = 24 * 60 * 60;

/** Removes everything we store for a user (Better Auth removes the account itself). */
async function deleteUserData(userId: string): Promise<void> {
  const [notes, categories, settings, shares] = await Promise.all([
    collections.notes(),
    collections.categories(),
    collections.settings(),
    collections.shares(),
  ]);
  await Promise.all([
    notes.deleteMany({ userId }),
    categories.deleteMany({ userId }),
    settings.deleteMany({ userId }),
    shares.deleteMany({ userId }),
  ]);
}

function createAuth() {
  return betterAuth({
    appName: "TakeMyNote",
    baseURL: serverEnv.authUrl,
    secret: serverEnv.authSecret,
    database: mongodbAdapter(getAuthDb(), { client: getMongoClient() }),
    socialProviders: hasGoogleSignIn
      ? {
          google: {
            clientId: serverEnv.googleClientId!,
            clientSecret: serverEnv.googleClientSecret!,
            prompt: "select_account",
          },
        }
      : undefined,
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      // Signed in straight after creating an account.
      autoSignIn: true,
    },
    // Google sign-in only links to an existing account whose email is verified
    // (Better Auth's default), so nobody can pre-register someone else's email
    // with a password and take over their Google login.
    account: { accountLinking: { enabled: true, requireLocalEmailVerified: true } },
    // Kept in MongoDB so limits hold across serverless instances. Sign-in and
    // sign-up get Better Auth's stricter built-in rules on top.
    rateLimit: { enabled: true, storage: "database", window: 60, max: 100 },
    // Problems during Google sign-in come back to the app, not a bare error page.
    onAPIError: { errorURL: "/notes" },
    session: {
      expiresIn: 30 * DAY_SECONDS,
      updateAge: DAY_SECONDS,
    },
    user: {
      deleteUser: {
        enabled: true,
        beforeDelete: async (user) => {
          await deleteUserData(user.id);
          // Uploaded files live in Vercel Blob, not MongoDB.
          if (hasImageUploads()) {
            await Promise.all([deleteStoredAvatar(user.image), deleteAllNoteImages(user.id).catch(() => undefined)]);
          }
        },
      },
    },
    telemetry: { enabled: false },
  });
}

type Auth = ReturnType<typeof createAuth>;

const globalForAuth = globalThis as typeof globalThis & { __takemynoteAuth?: Auth };

/** The Better Auth instance, or null when accounts aren't configured. */
export function getAuth(): Auth | null {
  if (!isAccountsEnabled()) return null;
  globalForAuth.__takemynoteAuth ??= createAuth();
  return globalForAuth.__takemynoteAuth;
}
