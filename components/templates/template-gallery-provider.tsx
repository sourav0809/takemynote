"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { TemplateGalleryDialog } from "@/components/templates/template-gallery-dialog";
import { useCreateNoteFromTemplate } from "@/hooks/use-create-note-from-template";
import type { NoteTemplate } from "@/lib/templates/note-templates";

interface TemplateGalleryContextValue {
  /** Opens the gallery; choosing a template creates a new note from it. */
  openGallery: () => void;
}

const TemplateGalleryContext = createContext<TemplateGalleryContextValue | null>(null);

export function TemplateGalleryProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const createNoteFromTemplate = useCreateNoteFromTemplate();

  const openGallery = useCallback(() => setOpen(true), []);

  const handleUse = (template: NoteTemplate) => {
    setOpen(false);
    void createNoteFromTemplate(template);
  };

  const value = useMemo(() => ({ openGallery }), [openGallery]);

  return (
    <TemplateGalleryContext.Provider value={value}>
      {children}
      <TemplateGalleryDialog open={isOpen} onOpenChange={setOpen} onUse={handleUse} />
    </TemplateGalleryContext.Provider>
  );
}

export function useTemplateGallery(): TemplateGalleryContextValue {
  const context = useContext(TemplateGalleryContext);
  if (!context) throw new Error("useTemplateGallery must be used within a TemplateGalleryProvider");
  return context;
}
