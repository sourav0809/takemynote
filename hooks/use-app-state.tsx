"use client";

import { createContext, useContext, useMemo, useState } from "react";

import type { NoteListFilter, NoteListView } from "@/lib/constants";
import type { FolderId } from "@/types/note";

export type SettingsTab = "preferences" | "account" | "ai" | "shortcuts" | "data" | "about";

interface AppState {
  activeFolder: FolderId;
  activeCategoryId: string | null;
  selectedNoteId: string | null;
  searchQuery: string;
  listView: NoteListView;
  listFilter: NoteListFilter;
  isSettingsOpen: boolean;
  settingsTab: SettingsTab;
  /** Phone/tablet layout only: whether the Page is showing instead of the Library. */
  isNoteOpen: boolean;
  setActiveFolder: (folder: FolderId) => void;
  setActiveCategory: (categoryId: string) => void;
  setSelectedNoteId: (noteId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setListView: (view: NoteListView) => void;
  setListFilter: (filter: NoteListFilter) => void;
  setSettingsOpen: (open: boolean) => void;
  setSettingsTab: (tab: SettingsTab) => void;
  /** Opens Settings, optionally on a given tab. */
  openSettings: (tab?: SettingsTab) => void;
  /** Selects a note and, on small screens, opens it full screen. */
  openNote: (noteId: string) => void;
  closeNote: () => void;
}

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [activeFolder, setActiveFolderState] = useState<FolderId>("notes");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [listView, setListView] = useState<NoteListView>("list");
  const [listFilter, setListFilter] = useState<NoteListFilter>("all");
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("preferences");
  const [isNoteOpen, setNoteOpen] = useState(false);

  const value = useMemo<AppState>(
    () => ({
      activeFolder,
      activeCategoryId,
      selectedNoteId,
      searchQuery,
      listView,
      listFilter,
      isSettingsOpen,
      settingsTab,
      isNoteOpen,
      setActiveFolder: (folder) => {
        setActiveFolderState(folder);
        setActiveCategoryId(null);
      },
      setActiveCategory: (categoryId) => {
        setActiveFolderState("notes");
        setActiveCategoryId(categoryId);
      },
      setSelectedNoteId: (noteId) => {
        setSelectedNoteId(noteId);
        // A cleared selection (e.g. note moved to trash) returns phones to the Library.
        if (noteId === null) setNoteOpen(false);
      },
      setSearchQuery,
      setListView,
      setListFilter,
      setSettingsOpen,
      setSettingsTab,
      openSettings: (tab) => {
        if (tab) setSettingsTab(tab);
        setSettingsOpen(true);
      },
      openNote: (noteId) => {
        setSelectedNoteId(noteId);
        setNoteOpen(true);
      },
      closeNote: () => setNoteOpen(false),
    }),
    [
      activeFolder,
      activeCategoryId,
      selectedNoteId,
      searchQuery,
      listView,
      listFilter,
      isSettingsOpen,
      settingsTab,
      isNoteOpen,
    ]
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppState {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}
