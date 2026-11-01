import type { ComponentType, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArchiveRestore,
  Braces,
  Download,
  FileCode,
  FileText,
  FileType,
  Globe,
  Link2,
  Pin,
  PinOff,
  Printer,
  Star,
  StarOff,
  Trash2,
  X,
} from "lucide-react";

import { useAccount } from "@/components/account/account-provider";
import { ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useNoteActions } from "@/hooks/use-note-actions";
import { NOTE_EXPORT_FORMATS, type NoteExportFormat } from "@/lib/download-note";

const FORMAT_ICONS: Record<NoteExportFormat, LucideIcon> = {
  pdf: FileText,
  markdown: FileCode,
  text: FileType,
  html: Globe,
  json: Braces,
};
import type { Note } from "@/types/note";

interface MenuItemProps {
  onClick?: () => void;
  variant?: "default" | "destructive";
  children: ReactNode;
}

interface NoteMenuItemsProps {
  note: Note;
  Item: ComponentType<MenuItemProps>;
  Separator: ComponentType;
  /** Extra items placed before "Move to trash" (the Page's download menu). */
  extraItems?: ReactNode;
}

/** The same note actions for the right-click menu and the ⋯ dropdown. */
function NoteMenuItems({ note, Item, Separator, extraItems }: NoteMenuItemsProps) {
  const actions = useNoteActions();
  const { enabled: canShare, openShare } = useAccount();

  if (note.trashed) {
    return (
      <>
        <Item onClick={() => actions.restore(note)}>
          <ArchiveRestore />
          Restore
        </Item>
        <Item variant="destructive" onClick={() => actions.deletePermanently(note)}>
          <X />
          Delete forever
        </Item>
      </>
    );
  }

  return (
    <>
      <Item onClick={() => actions.toggleFavorite(note)}>
        {note.favorited ? <StarOff /> : <Star />}
        {note.favorited ? "Remove from favorites" : "Add to favorites"}
      </Item>
      {!note.scratchpad && (
        <Item onClick={() => actions.togglePinned(note)}>
          {note.pinned ? <PinOff /> : <Pin />}
          {note.pinned ? "Unpin" : "Pin to top"}
        </Item>
      )}
      {canShare && (
        <Item onClick={() => openShare(note.id)}>
          <Link2 />
          Share…
        </Item>
      )}
      {extraItems}
      {!note.scratchpad && (
        <>
          <Separator />
          <Item variant="destructive" onClick={() => actions.moveToTrash(note)}>
            <Trash2 />
            Move to trash
          </Item>
        </>
      )}
    </>
  );
}

export function NoteContextMenuItems({ note }: { note: Note }) {
  return <NoteMenuItems note={note} Item={ContextMenuItem} Separator={ContextMenuSeparator} />;
}

/** "Download as ›" with every export format, then a separate Print. */
function DownloadItems({ note }: { note: Note }) {
  const actions = useNoteActions();

  return (
    <>
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Download />
        Download as
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-52">
        {NOTE_EXPORT_FORMATS.map(({ format, label, hint }) => {
          const Icon = FORMAT_ICONS[format];
          return (
            <DropdownMenuItem key={format} onClick={() => void actions.downloadAs(note, format)}>
              <Icon />
              <span className="flex-1">{label}</span>
              <span className="text-xs font-normal text-muted-foreground">{hint}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
    <DropdownMenuItem onClick={() => void actions.print(note)}>
      <Printer />
      Print
    </DropdownMenuItem>
    </>
  );
}

export function NoteDropdownMenuItems({ note, showExport }: { note: Note; showExport?: boolean }) {
  return (
    <NoteMenuItems
      note={note}
      Item={DropdownMenuItem}
      Separator={DropdownMenuSeparator}
      extraItems={showExport ? <DownloadItems note={note} /> : undefined}
    />
  );
}
