import type { Editor } from "@tiptap/react";
import { Link } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface LinkPopoverButtonProps {
  editor: Editor;
}

export function LinkPopoverButton({ editor }: LinkPopoverButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");

  const isActive = editor.isActive("link");

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setUrl(editor.getAttributes("link").href ?? "");
    }
  };

  const applyLink = () => {
    const trimmed = url.trim();
    if (trimmed) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
    setIsOpen(false);
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
              if (event.key === "Enter") applyLink();
              if (event.key === "Escape") setIsOpen(false);
            }}
          />
          <Button type="button" size="sm" onClick={applyLink}>
            {url.trim() ? "Save" : "Remove"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
