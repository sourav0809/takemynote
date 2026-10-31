import {
  Download,
  Moon,
  RefreshCw,
  Settings,
  Star,
  Sun,
  Tag,
  Trash2,
} from "lucide-react";

import { ToolbarIconButton } from "@/components/editor/toolbar-icon-button";
import { RelativeTime } from "@/components/note-list/relative-time";
import { useAppState } from "@/hooks/use-app-state";
import { useThemeToggle } from "@/hooks/use-theme-toggle";
import { getWordCount } from "@/lib/note-utils";
import type { Note } from "@/types/note";

interface EditorBottomBarProps {
  note: Note;
  onToggleFavorite: () => void;
  onMoveToTrash: () => void;
  onDownload: () => void;
}

export function EditorBottomBar({
  note,
  onToggleFavorite,
  onMoveToTrash,
  onDownload,
}: EditorBottomBarProps) {
  const { setSettingsOpen } = useAppState();
  const { isDark, toggleTheme } = useThemeToggle();

  return (
    <div className="flex h-11 shrink-0 items-center justify-between border-t border-border bg-background px-3">
      <div className="flex items-center gap-0.5">
        {!note.scratchpad && (
          <>
            <ToolbarIconButton
              icon={Star}
              label={note.favorited ? "Remove favorite" : "Favorite"}
              isActive={note.favorited}
              onClick={onToggleFavorite}
            />
            <ToolbarIconButton
              icon={Trash2}
              label="Move to trash"
              variant="destructive"
              onClick={onMoveToTrash}
            />
          </>
        )}
        <ToolbarIconButton icon={Tag} label="Add tag" onClick={() => {}} />
        <ToolbarIconButton icon={Download} label="Export" onClick={onDownload} />
      </div>

      <div className="hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
        <span>{getWordCount(note.content)} words</span>
        <span>
          Last edited <RelativeTime isoDate={note.updatedAt} />
        </span>
      </div>

      <div className="flex items-center gap-0.5">
        <ToolbarIconButton icon={RefreshCw} label="Sync" onClick={() => {}} />
        <ToolbarIconButton
          icon={isDark ? Sun : Moon}
          label={isDark ? "Light mode" : "Dark mode"}
          onClick={toggleTheme}
        />
        <ToolbarIconButton
          icon={Settings}
          label="Settings"
          onClick={() => setSettingsOpen(true)}
        />
      </div>
    </div>
  );
}
