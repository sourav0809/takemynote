/** Notifies the open note when sync replaced it with a newer version from another device. */

type Listener = (noteIds: ReadonlySet<string>) => void;

const listeners = new Set<Listener>();

export function emitRemoteNoteChanges(noteIds: string[]): void {
  if (noteIds.length === 0) return;
  const ids = new Set(noteIds);
  listeners.forEach((listener) => listener(ids));
}

export function onRemoteNoteChanges(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
