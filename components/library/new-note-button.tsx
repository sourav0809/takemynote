import { Plus } from "lucide-react";

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

export function NewNoteButton({ variant = "icon", className }: NewNoteButtonProps) {
  const createAndOpenNote = useCreateAndOpenNote();
  const { mod, alt } = usePlatformModifierKeys();

  if (variant === "full") {
    return (
      <Button className={cn("h-9 w-full gap-2", className)} onClick={createAndOpenNote}>
        <Plus />
        New note
      </Button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            size="icon"
            className={cn("size-10 lg:size-8", className)}
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
  );
}
