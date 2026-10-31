import { formatFullDate, getReadingTimeMinutes, getWordCount } from "@/lib/note-utils";
import type { NoteContent } from "@/types/note";

interface NoteMetaLineProps {
  updatedAt: string;
  content: NoteContent;
}

export function NoteMetaLine({ updatedAt, content }: NoteMetaLineProps) {
  const wordCount = getWordCount(content);
  const readingTime = getReadingTimeMinutes(content);

  return (
    <p className="mt-1 text-[13px] text-muted-foreground tabular-nums">
      Updated {formatFullDate(updatedAt)} · {wordCount} {wordCount === 1 ? "word" : "words"} ·{" "}
      {readingTime} min read
    </p>
  );
}
