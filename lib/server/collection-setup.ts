import "server-only";

import type { Document, IndexDescription } from "mongodb";

import { LIMITS } from "@/lib/sync/schemas";

/**
 * MongoDB validators and indexes, applied automatically on first connection
 * (lib/server/db.ts). They mirror the Zod schemas in lib/sync/schemas.ts so the
 * database rejects bad documents even if a code path forgets to validate.
 */

/** Deleted items are kept this long so offline devices still hear about them. */
const TOMBSTONE_TTL_SECONDS = 30 * 24 * 60 * 60;

const id = { bsonType: "string", minLength: 1, maxLength: LIMITS.idChars };
const date = { bsonType: "date" };
const bool = { bsonType: "bool" };
const int = { bsonType: ["int", "long"], minimum: 0 };

const syncFields = {
  userId: { bsonType: "string", minLength: 1 },
  version: int,
  serverUpdatedAt: date,
  deletedAt: { bsonType: ["date", "null"] },
  lastDeviceId: id,
};
const syncRequired = Object.keys(syncFields);

const notesValidator: Document = {
  $jsonSchema: {
    bsonType: "object",
    required: [...syncRequired, "noteId", "title", "content", "categoryId", "favorited", "pinned", "trashed", "scratchpad", "createdAt", "updatedAt"],
    properties: {
      ...syncFields,
      noteId: id,
      title: { bsonType: "string", maxLength: LIMITS.titleChars },
      content: { bsonType: "array" },
      categoryId: { bsonType: ["string", "null"], maxLength: LIMITS.idChars },
      favorited: bool,
      pinned: bool,
      trashed: bool,
      scratchpad: bool,
      createdAt: date,
      updatedAt: date,
    },
  },
};

const categoriesValidator: Document = {
  $jsonSchema: {
    bsonType: "object",
    required: [...syncRequired, "categoryId", "name", "createdAt"],
    properties: {
      ...syncFields,
      categoryId: id,
      // Tombstones keep an empty name.
      name: { bsonType: "string", maxLength: LIMITS.categoryNameChars },
      createdAt: date,
    },
  },
};

const settingsValidator: Document = {
  $jsonSchema: {
    bsonType: "object",
    required: ["userId", "preferences", "onboardingCompleted", "ai", "version", "serverUpdatedAt", "lastDeviceId"],
    properties: {
      userId: { bsonType: "string", minLength: 1 },
      preferences: {
        bsonType: "object",
        required: ["layout", "writingPosition", "sortBy", "textDirection", "scrollPastEnd", "theme"],
        properties: {
          layout: { enum: ["classic", "library"] },
          writingPosition: { enum: ["start", "center", "full"] },
          sortBy: { enum: ["updated", "created", "title"] },
          textDirection: { enum: ["ltr", "rtl"] },
          scrollPastEnd: bool,
          theme: { enum: ["light", "dark", "system"] },
        },
      },
      onboardingCompleted: bool,
      ai: {
        bsonType: "object",
        required: ["provider", "model", "instructions"],
        // Deliberately no key field: API keys never leave the device.
        additionalProperties: false,
        properties: {
          provider: { enum: ["openai", "google", "anthropic"] },
          model: { bsonType: "string", maxLength: 100 },
          instructions: { bsonType: "string", maxLength: LIMITS.instructionsChars },
        },
      },
      version: int,
      serverUpdatedAt: date,
      lastDeviceId: id,
    },
  },
};

const sharesValidator: Document = {
  $jsonSchema: {
    bsonType: "object",
    required: ["token", "userId", "noteId", "createdAt", "revokedAt", "viewCount", "lastViewedAt"],
    properties: {
      token: { bsonType: "string", minLength: 22, maxLength: 22 },
      userId: { bsonType: "string", minLength: 1 },
      noteId: id,
      createdAt: date,
      revokedAt: { bsonType: ["date", "null"] },
      viewCount: int,
      lastViewedAt: { bsonType: ["date", "null"] },
    },
  },
};

const guestSharesValidator: Document = {
  $jsonSchema: {
    bsonType: "object",
    required: ["token", "keyHash", "noteId", "title", "content", "trashed", "createdAt", "updatedAt", "viewCount", "lastViewedAt"],
    properties: {
      token: { bsonType: "string", minLength: 22, maxLength: 22 },
      keyHash: { bsonType: "string", minLength: 43, maxLength: 43 },
      noteId: id,
      title: { bsonType: "string", maxLength: LIMITS.titleChars },
      content: { bsonType: "array" },
      trashed: bool,
      createdAt: date,
      updatedAt: date,
      viewCount: int,
      lastViewedAt: { bsonType: ["date", "null"] },
    },
  },
};

const rateLimitsValidator: Document = {
  $jsonSchema: {
    bsonType: "object",
    required: ["key", "count", "expiresAt"],
    properties: { key: { bsonType: "string" }, count: int, expiresAt: date },
  },
};

export interface CollectionSetup {
  name: string;
  validator: Document;
  indexes: IndexDescription[];
}

export const COLLECTION_SETUP: CollectionSetup[] = [
  {
    name: "notes",
    validator: notesValidator,
    indexes: [
      { key: { userId: 1, noteId: 1 }, unique: true, name: "user_note" },
      { key: { userId: 1, serverUpdatedAt: 1, _id: 1 }, name: "user_changes" },
      // TTL only applies to documents whose deletedAt is a date (tombstones).
      { key: { deletedAt: 1 }, expireAfterSeconds: TOMBSTONE_TTL_SECONDS, name: "tombstone_ttl" },
    ],
  },
  {
    name: "categories",
    validator: categoriesValidator,
    indexes: [
      { key: { userId: 1, categoryId: 1 }, unique: true, name: "user_category" },
      { key: { userId: 1, serverUpdatedAt: 1, _id: 1 }, name: "user_changes" },
      { key: { deletedAt: 1 }, expireAfterSeconds: TOMBSTONE_TTL_SECONDS, name: "tombstone_ttl" },
    ],
  },
  {
    name: "settings",
    validator: settingsValidator,
    indexes: [{ key: { userId: 1 }, unique: true, name: "user" }],
  },
  {
    name: "shares",
    validator: sharesValidator,
    indexes: [
      { key: { token: 1 }, unique: true, name: "token" },
      { key: { userId: 1, noteId: 1 }, name: "user_note" },
    ],
  },
  {
    name: "guestShares",
    validator: guestSharesValidator,
    indexes: [{ key: { token: 1 }, unique: true, name: "token" }],
  },
  {
    name: "rateLimits",
    validator: rateLimitsValidator,
    indexes: [
      { key: { key: 1 }, unique: true, name: "key" },
      { key: { expiresAt: 1 }, expireAfterSeconds: 0, name: "expiry" },
    ],
  },
];
