import { LayoutTemplate, Plus } from "lucide-react";

import { useTemplateGallery } from "@/components/templates/template-gallery-provider";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCreateAndOpenNote } from "@/hooks/use-create-and-open-note";
import { usePlatformModifierKeys } from "@/hooks/use-platform-modifier-key";
import { cn } from "@/lib/utils";

interface NewNoteButtonProps {
  /** Icon-only round button, or a full-width labelled one (Classic sidebar). */
  variant?: "icon" | "full";
  className?: string;
}

/** Opens the template gallery to create a new note from a template. */
function FromTemplateButton({ className }: { className?: string }) {
  const { openGallery } = useTemplateGallery();

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="New from template"
            className={cn("text-muted-foreground", className)}
            onClick={openGallery}
          />
        }
      >
        <LayoutTemplate className="size-4.5" />
      </TooltipTrigger>
      <TooltipContent>New from template</TooltipContent>
    </Tooltip>
  );
}

export function NewNoteButton({ variant = "icon", className }: NewNoteButtonProps) {
  const createAndOpenNote = useCreateAndOpenNote();
  const { mod, alt } = usePlatformModifierKeys();

  if (variant === "full") {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <Button className="h-9 flex-1 gap-2" onClick={createAndOpenNote}>
          <Plus />
          New note
        </Button>
        <FromTemplateButton className="size-9 border border-border" />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <FromTemplateButton className="size-10 lg:size-8" />
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size="icon"
              className="size-10 lg:size-8"
              aria-label="New note"
              onClick={createAndOpenNote}
            />
          }
        >
          <Plus className="size-5 lg:size-4" />
        </TooltipTrigger>
        <TooltipContent>
          New note · {mod} {alt} N
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
