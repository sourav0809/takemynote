export const STORAGE_KEYS = {
  schemaVersion: "takemynote:schemaVersion",
  notes: "takemynote:notes",
  categories: "takemynote:categories",
  preferences: "takemynote:preferences",
  initialized: "takemynote:initialized",
  /** Provider, model and writing instructions. No secrets. */
  aiConfig: "takemynote:ai:config",
  /** The encrypted API key (see lib/ai/key-vault.ts). Never exported. */
  aiSecret: "takemynote:ai:secret",
} as const;

// v1: note content stored as Tiptap HTML. v2: BlockNote JSON blocks.
export const LEGACY_SCHEMA_VERSION = 1;
export const CURRENT_SCHEMA_VERSION = 2;
