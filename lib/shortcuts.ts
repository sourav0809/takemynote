/**
 * Global keyboard shortcuts: ⌘⌥ (Mac) or Ctrl+Alt (Windows/Linux) plus a key.
 * Matched on `event.code` (the physical key), because on a Mac Option changes
 * `event.key` (⌥N types "˜", ⌥S types "ß"). Both the handler and the
 * Settings list read from here, so they can't drift apart.
 */
export type ShortcutId = "newNote" | "search" | "favorite" | "trash" | "theme";

export interface ShortcutDefinition {
  id: ShortcutId;
  label: string;
  /** Key shown in the UI after the modifiers. */
  keyLabel: string;
  /** Physical keys that trigger it; the first one is the documented key. */
  codes: string[];
}

export const SHORTCUTS: ShortcutDefinition[] = [
  { id: "newNote", label: "New note", keyLabel: "N", codes: ["KeyN"] },
  { id: "search", label: "Search notes", keyLabel: "F", codes: ["KeyF"] },
  { id: "favorite", label: "Add to or remove from favorites", keyLabel: "S", codes: ["KeyS"] },
  // ⌘⌥D toggles the macOS Dock, so Backspace is the documented key; D still works elsewhere.
  { id: "trash", label: "Move note to trash", keyLabel: "⌫", codes: ["Backspace", "KeyD"] },
  // ⌘⌥L opens Chrome's downloads on a Mac, so T is the documented key.
  { id: "theme", label: "Switch light / dark", keyLabel: "T", codes: ["KeyT", "KeyL"] },
];

export function findShortcut(event: KeyboardEvent): ShortcutDefinition | undefined {
  const hasModifiers = (event.metaKey || event.ctrlKey) && event.altKey && !event.shiftKey;
  if (!hasModifiers || event.repeat) return undefined;
  return SHORTCUTS.find((shortcut) => shortcut.codes.includes(event.code));
}
