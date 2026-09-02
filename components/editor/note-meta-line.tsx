import { Badge } from "@/components/ui/badge";
import { formatFullDate, getReadingTimeMinutes, getWordCount } from "@/lib/note-utils";
import type { Category } from "@/types/note";

interface NoteMetaLineProps {
  updatedAt: string;
  content: string;
  category: Category | undefined;
}

export function NoteMetaLine({ updatedAt, content, category }: NoteMetaLineProps) {
  const wordCount = getWordCount(content);
  const readingTime = getReadingTimeMinutes(content);

  return (
    <div className="mt-1 flex flex-wrap items-center gap-2">
      <p className="text-sm text-muted-foreground">
        Updated {formatFullDate(updatedAt)} · {wordCount} words · {readingTime} min read
      </p>
      {category && (
        <Badge variant="secondary" className="gap-1.5">
          <span className="size-1.5 rounded-full bg-primary" />
          {category.name}
        </Badge>
      )}
    </div>
  );
}
