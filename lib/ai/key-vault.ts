import { isAiProviderId, type AiProviderId } from "@/lib/ai/providers";
import { STORAGE_KEYS } from "@/lib/data/storage-keys";

/**
 * Keeps the user's AI API key on this device, encrypted.
 *
 * - A random AES-GCM key is created with WebCrypto as non-extractable and kept
 *   in IndexedDB. Not even this app's code can read its bytes.
 * - Only the ciphertext (plus IV, provider and the last 4 characters for
 *   display) is written to localStorage.
 * - The key is decrypted in memory just before a request and never stored in
 *   React state, logs, backups or exports.
 */

const DB_NAME = "takemynote-vault";
const DB_STORE = "keys";
const CRYPTO_KEY_ID = "ai-api-key";
const IV_BYTES = 12;
const HINT_LENGTH = 4;

interface StoredSecret {
  provider: AiProviderId;
  /** Last characters of the key, shown as ••••1a2b. */
  hint: string;
  iv: string;
  data: string;
}

/** What the UI may know about the saved key. Never the key itself. */
export interface SavedKeyInfo {
  provider: AiProviderId;
  hint: string;
}

const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

/** Called when a key is saved or removed (also from other tabs). */
export function subscribeToSavedKey(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function toBase64(bytes: ArrayBuffer | Uint8Array): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

function openVault(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(DB_STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openVault();
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = action(db.transaction(DB_STORE, mode).objectStore(DB_STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

async function createCryptoKey(): Promise<CryptoKey> {
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, [
    "encrypt",
    "decrypt",
  ]);
  await withStore("readwrite", (store) => store.put(key, CRYPTO_KEY_ID));
  return key;
}

function readStoredSecret(): StoredSecret | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEYS.aiSecret);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredSecret>;
    if (!isAiProviderId(parsed.provider) || !parsed.iv || !parsed.data) return null;
    return { provider: parsed.provider, hint: parsed.hint ?? "", iv: parsed.iv, data: parsed.data };
  } catch {
    return null;
  }
}

/** Provider and last characters of the saved key, or null when there is none. */
export function readSavedKeyInfo(): SavedKeyInfo | null {
  const secret = readStoredSecret();
  return secret ? { provider: secret.provider, hint: secret.hint } : null;
}

/** Encrypts and saves the key. A fresh encryption key is made every time. */
export async function saveApiKey(provider: AiProviderId, apiKey: string): Promise<void> {
  const cryptoKey = await createCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    new TextEncoder().encode(apiKey)
  );
  const secret: StoredSecret = {
    provider,
    hint: apiKey.slice(-HINT_LENGTH),
    iv: toBase64(iv),
    data: toBase64(encrypted),
  };
  window.localStorage.setItem(STORAGE_KEYS.aiSecret, JSON.stringify(secret));
  notify();
}

/**
 * Decrypts the key for one request. Returns null when nothing is saved, when
 * it belongs to another provider (so a key is never sent to the wrong
 * company), or when it can no longer be decrypted.
 */
export async function loadApiKey(provider: AiProviderId): Promise<string | null> {
  const secret = readStoredSecret();
  if (!secret || secret.provider !== provider) return null;

  try {
    const cryptoKey = await withStore<CryptoKey | undefined>("readonly", (store) =>
      store.get(CRYPTO_KEY_ID)
    );
    if (!cryptoKey) throw new Error("Missing encryption key");
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64(secret.iv) },
      cryptoKey,
      fromBase64(secret.data)
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    // Site data was partly cleared: the ciphertext is useless now.
    await removeApiKey();
    return null;
  }
}

/** Forgets the key completely: ciphertext and encryption key. */
export async function removeApiKey(): Promise<void> {
  window.localStorage.removeItem(STORAGE_KEYS.aiSecret);
  try {
    await withStore("readwrite", (store) => store.delete(CRYPTO_KEY_ID));
  } finally {
    notify();
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEYS.aiSecret) notify();
  });
}
