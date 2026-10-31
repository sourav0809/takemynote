import { NoteMetaLine } from "@/components/editor/note-meta-line";
import { NoteTitleInput } from "@/components/editor/note-title-input";
import type { Note } from "@/types/note";

/**
 * Side padding shared by the title block and the BlockNote document so their
 * text lines up. Must match `.note-editor .bn-editor` padding in globals.css.
 */
export const NOTE_GUTTER_CLASS = "px-5 lg:px-[54px]";

interface EditorHeaderProps {
  note: Note;
  onTitleChange: (title: string) => void;
}

/** Title and meta line, rendered inside the scrolling page above the text. */
export function EditorHeader({ note, onTitleChange }: EditorHeaderProps) {
  return (
    <div className={`${NOTE_GUTTER_CLASS} pt-4 pb-1 lg:pt-8`}>
      <NoteTitleInput title={note.title} onChange={onTitleChange} />
      <NoteMetaLine updatedAt={note.updatedAt} content={note.content} />
    </div>
  );
}
