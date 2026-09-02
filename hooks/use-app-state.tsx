"use client";

import { createContext, useContext, useMemo, useState } from "react";

import type { NoteListFilter, NoteListView } from "@/lib/constants";
import type { FolderId } from "@/types/note";

interface AppState {
  activeFolder: FolderId;
  activeCategoryId: string | null;
  selectedNoteId: string | null;
  searchQuery: string;
  listView: NoteListView;
  listFilter: NoteListFilter;
  isSettingsOpen: boolean;
  setActiveFolder: (folder: FolderId) => void;
  setActiveCategory: (categoryId: string) => void;
  setSelectedNoteId: (noteId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setListView: (view: NoteListView) => void;
  setListFilter: (filter: NoteListFilter) => void;
  setSettingsOpen: (open: boolean) => void;
}

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [activeFolder, setActiveFolderState] = useState<FolderId>("notes");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>("note-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [listView, setListView] = useState<NoteListView>("list");
  const [listFilter, setListFilter] = useState<NoteListFilter>("all");
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  const value = useMemo<AppState>(
    () => ({
      activeFolder,
      activeCategoryId,
      selectedNoteId,
      searchQuery,
      listView,
      listFilter,
      isSettingsOpen,
      setActiveFolder: (folder) => {
        setActiveFolderState(folder);
        setActiveCategoryId(null);
      },
      setActiveCategory: (categoryId) => {
        setActiveFolderState("notes");
        setActiveCategoryId(categoryId);
      },
      setSelectedNoteId,
      setSearchQuery,
      setListView,
      setListFilter,
      setSettingsOpen,
    }),
    [activeFolder, activeCategoryId, selectedNoteId, searchQuery, listView, listFilter, isSettingsOpen]
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
