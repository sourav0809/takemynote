import type { LucideIcon } from "lucide-react";
import { Moon, PanelLeftOpen, Plus, Search, Settings, Sun } from "lucide-react";
import Link from "next/link";

import { LogoMark } from "@/components/brand/logo-mark";
import { FOLDER_ICONS, FOLDER_ORDER } from "@/components/library/folder-icons";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAppState } from "@/hooks/use-app-state";
import { useCreateAndOpenNote } from "@/hooks/use-create-and-open-note";
import { useFolderNavigation } from "@/hooks/use-folder-navigation";
import { NOTE_SEARCH_INPUT_ID } from "@/hooks/use-global-shortcuts";
import { usePlatformModifierKeys } from "@/hooks/use-platform-modifier-key";
import { useThemeToggle } from "@/hooks/use-theme-toggle";
import { APP_NAME, FOLDER_LABELS, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const RAIL_BUTTON_CLASS = "size-10 rounded-xl text-sidebar-foreground/70 hover:text-sidebar-foreground";

interface RailButtonProps {
  icon: LucideIcon;
  label: string;
  hint?: string;
  isActive?: boolean;
  onClick: () => void;
}

function RailButton({ icon: Icon, label, hint, isActive, onClick }: RailButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              RAIL_BUTTON_CLASS,
              isActive && "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent [&_svg]:text-primary"
            )}
            onClick={onClick}
          />
        }
      >
        <Icon className="size-[18px]" />
      </TooltipTrigger>
      <TooltipContent side="right">
        {label}
        {hint && <span className="opacity-60">{hint}</span>}
      </TooltipContent>
    </Tooltip>
  );
}

interface SidebarRailProps {
  onExpand: () => void;
  /**
   * Library layout: the notes live inside the sidebar, so choosing a folder
   * or searching opens it. Classic shows notes in their own column.
   */
  expandOnNavigate?: boolean;
}

/** The collapsed sidebar: a slim column of icons with the essentials. */
export function SidebarRail({ onExpand, expandOnNavigate = false }: SidebarRailProps) {
  const { activeFolder, activeCategoryId, setSettingsOpen } = useAppState();
  const { counts, selectFolder } = useFolderNavigation();
  const createAndOpenNote = useCreateAndOpenNote();
  const { isDark, toggleTheme } = useThemeToggle();
  const { mod, alt } = usePlatformModifierKeys();

  const openSearch = () => {
    onExpand();
    // The search field mounts with the expanded sidebar.
    window.requestAnimationFrame(() => document.getElementById(NOTE_SEARCH_INPUT_ID)?.focus());
  };

  return (
    <nav
      aria-label="Sidebar"
      className="flex h-full w-[60px] shrink-0 flex-col items-center gap-1 border-r border-border bg-sidebar py-3 text-sidebar-foreground"
    >
      <Link
        href={ROUTES.home}
        aria-label={`${APP_NAME} home`}
        className="mb-2 flex size-10 items-center justify-center rounded-xl transition-opacity outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <LogoMark className="size-7" />
      </Link>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button size="icon" aria-label="New note" className="mb-3 size-10 rounded-full" onClick={createAndOpenNote} />
          }
        >
          <Plus className="size-5" />
        </TooltipTrigger>
        <TooltipContent side="right">
          New note
          <span className="opacity-60">{`${mod} ${alt} N`}</span>
        </TooltipContent>
      </Tooltip>

      {expandOnNavigate && (
        <RailButton icon={Search} label="Search notes" hint={`${mod} ${alt} F`} onClick={openSearch} />
      )}

      {FOLDER_ORDER.map((folder) => {
        const count = counts[folder];
        return (
          <RailButton
            key={folder}
            icon={FOLDER_ICONS[folder]}
            label={FOLDER_LABELS[folder]}
            hint={count ? String(count) : undefined}
            isActive={activeFolder === folder && !activeCategoryId}
            onClick={() => {
              selectFolder(folder);
              if (expandOnNavigate) onExpand();
            }}
          />
        );
      })}

      <div className="mt-auto flex flex-col items-center gap-1">
        <RailButton
          icon={isDark ? Sun : Moon}
          label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={toggleTheme}
        />
        <RailButton icon={Settings} label="Settings" onClick={() => setSettingsOpen(true)} />
        <RailButton icon={PanelLeftOpen} label="Expand sidebar" onClick={onExpand} />
      </div>
    </nav>
  );
}
