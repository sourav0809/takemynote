import "server-only";

import { MongoClient, type Collection, type Db, type Document } from "mongodb";

import { serverEnv } from "@/lib/server/env";
import type {
  CategoryDoc,
  GuestShareDoc,
  NoteDoc,
  RateLimitDoc,
  SettingsDoc,
  ShareDoc,
} from "@/lib/server/documents";
import { COLLECTION_SETUP } from "@/lib/server/collection-setup";

interface DbCache {
  client: MongoClient;
  ready: Promise<Db>;
}

// One client per server process, reused across requests and hot reloads
// (serverless functions would otherwise open a connection per request).
const globalForDb = globalThis as typeof globalThis & { __takemynoteDb?: DbCache };

async function setUpCollections(db: Db): Promise<void> {
  const existing = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name));
  for (const { name, validator, indexes } of COLLECTION_SETUP) {
    if (!existing.has(name)) {
      await db.createCollection(name, { validator, validationLevel: "strict" });
    } else {
      // Keeps validators current when the schema changes. Needs collMod permission.
      await db.command({ collMod: name, validator, validationLevel: "strict" }).catch(() => undefined);
    }
    if (indexes.length > 0) await db.collection(name).createIndexes(indexes);
  }
}

function getCache(): DbCache {
  if (!serverEnv.mongoUri) throw new Error("MONGODB_URI is not set");
  if (!globalForDb.__takemynoteDb) {
    const client = new MongoClient(serverEnv.mongoUri, { appName: "takemynote" });
    const ready = client.connect().then(async (connected) => {
      const db = connected.db(serverEnv.mongoDbName);
      await setUpCollections(db);
      return db;
    });
    // Let a failed connection be retried on the next request.
    ready.catch(() => {
      globalForDb.__takemynoteDb = undefined;
    });
    globalForDb.__takemynoteDb = { client, ready };
  }
  return globalForDb.__takemynoteDb;
}

export function getMongoClient(): MongoClient {
  return getCache().client;
}

/** The database, with collections, validators and indexes in place. */
export function getDb(): Promise<Db> {
  return getCache().ready;
}

/** Raw database handle for Better Auth (it manages its own collections). */
export function getAuthDb(): Db {
  if (!serverEnv.mongoUri) throw new Error("MONGODB_URI is not set");
  return getMongoClient().db(serverEnv.mongoDbName);
}

async function collection<T extends Document>(name: string): Promise<Collection<T>> {
  return (await getDb()).collection<T>(name);
}

export const collections = {
  notes: () => collection<NoteDoc>("notes"),
  categories: () => collection<CategoryDoc>("categories"),
  settings: () => collection<SettingsDoc>("settings"),
  shares: () => collection<ShareDoc>("shares"),
  guestShares: () => collection<GuestShareDoc>("guestShares"),
  rateLimits: () => collection<RateLimitDoc>("rateLimits"),
};
