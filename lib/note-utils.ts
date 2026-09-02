import { UNTITLED_NOTE_TITLE, WORDS_PER_MINUTE } from "@/lib/constants";
import type { Note } from "@/types/note";

export function getNoteDisplayTitle(title: string): string {
  return title.trim() || UNTITLED_NOTE_TITLE;
}

export function getNotePlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getNoteExcerpt(html: string): string {
  const text = getNotePlainText(html);
  return text.length > 140 ? `${text.slice(0, 140).trimEnd()}…` : text;
}

export function getWordCount(html: string): number {
  const text = getNotePlainText(html);
  return text.length === 0 ? 0 : text.split(" ").filter(Boolean).length;
}

export function getReadingTimeMinutes(html: string): number {
  return Math.max(1, Math.round(getWordCount(html) / WORDS_PER_MINUTE));
}

export function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatFullDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function sortNotesByUpdatedAt(notes: Note[]): Note[] {
  return [...notes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}
