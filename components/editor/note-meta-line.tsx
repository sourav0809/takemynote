import { SyncStatusLabel } from "@/components/account/sync-status-label";
import { formatFullDate, getReadingTimeMinutes, getWordCount } from "@/lib/note-utils";
import type { NoteContent } from "@/types/note";

interface NoteMetaLineProps {
  noteId: string;
  updatedAt: string;
  content: NoteContent;
}

export function NoteMetaLine({ noteId, updatedAt, content }: NoteMetaLineProps) {
  const wordCount = getWordCount(content);
  const readingTime = getReadingTimeMinutes(content);

  return (
    <p className="mt-1 flex flex-wrap items-center gap-x-1 text-[13px] text-muted-foreground tabular-nums">
      <span>
        Updated {formatFullDate(updatedAt)} · {wordCount} {wordCount === 1 ? "word" : "words"} · {readingTime} min read
      </span>
      {/* Only when signed in. */}
      <SyncStatusLabel noteId={noteId} className="before:mr-0.5 before:content-['·']" />
    </p>
  );
}
