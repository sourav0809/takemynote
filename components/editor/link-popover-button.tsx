import { Link } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { applyLink } from "@/lib/editor/link-actions";
import type { NoteBlockEditor } from "@/lib/editor/note-editor-schema";
import { cn } from "@/lib/utils";

interface LinkPopoverButtonProps {
  editor: NoteBlockEditor;
  isActive: boolean;
}

export function LinkPopoverButton({ editor, isActive }: LinkPopoverButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setUrl(editor.getSelectedLinkUrl() ?? "");
    }
  };

  const handleApply = () => {
    setIsOpen(false);
    applyLink(editor, url);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Link"
            aria-pressed={isActive}
            className={cn(
              "text-muted-foreground",
              isActive && "bg-accent text-accent-foreground"
            )}
          />
        }
      >
        <Link />
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="flex items-center gap-2">
          <Input
            autoFocus
            placeholder="https://example.com"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                // Stop the Enter from reaching the editor once focus returns
                // to it, which would replace the selected text.
                event.preventDefault();
                handleApply();
              }
              if (event.key === "Escape") setIsOpen(false);
            }}
          />
          <Button type="button" size="sm" onClick={handleApply}>
            {url.trim() ? "Save" : "Remove"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
