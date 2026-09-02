import { MoreHorizontal, Share2 } from "lucide-react";

import { NoteMetaLine } from "@/components/editor/note-meta-line";
import { NoteTitleInput } from "@/components/editor/note-title-input";
import { Button } from "@/components/ui/button";
import type { Category, Note } from "@/types/note";

interface EditorHeaderProps {
  note: Note;
  category: Category | undefined;
  onTitleChange: (title: string) => void;
}

export function EditorHeader({ note, category, onTitleChange }: EditorHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 pt-5 pb-2 sm:px-6">
      <div className="min-w-0 flex-1">
        <NoteTitleInput title={note.title} onChange={onTitleChange} />
        <NoteMetaLine
          updatedAt={note.updatedAt}
          content={note.content}
          category={category}
        />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5">
          <Share2 />
          Share
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="More options">
          <MoreHorizontal />
        </Button>
      </div>
    </div>
  );
}
