import { useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";

import { getTemplateIcon } from "@/components/templates/template-icons";
import { TemplatePreview } from "@/components/templates/template-preview";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  NOTE_TEMPLATES,
  TEMPLATE_CATEGORIES,
  renderTemplate,
  type NoteTemplate,
  type TemplateCategory,
} from "@/lib/templates/note-templates";
import { cn } from "@/lib/utils";

type CategoryFilter = TemplateCategory | "all";

interface TemplateGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUse: (template: NoteTemplate) => void;
}

const CHIP_CLASS = "h-8 shrink-0 rounded-full px-3 text-[13px] font-medium transition-colors";

export function TemplateGalleryDialog({ open, onOpenChange, onUse }: TemplateGalleryDialogProps) {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(NOTE_TEMPLATES[0].id);
  /** Phones show one screen at a time: the list, or the chosen template's preview. */
  const [isPreviewingOnPhone, setPreviewingOnPhone] = useState(false);

  const templates = useMemo(() => {
    const search = query.trim().toLowerCase();
    return NOTE_TEMPLATES.filter(
      (template) =>
        (category === "all" || template.category === category) &&
        (!search || `${template.name} ${template.description}`.toLowerCase().includes(search))
    );
  }, [category, query]);

  const selected = templates.find((template) => template.id === selectedId) ?? templates[0];
  const rendered = selected ? renderTemplate(selected) : null;

  const handleOpenChange = (next: boolean) => {
    if (!next) setPreviewingOnPhone(false);
    onOpenChange(next);
  };

  const handleSelect = (template: NoteTemplate) => {
    setSelectedId(template.id);
    setPreviewingOnPhone(true);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex h-[90dvh] w-full max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl md:h-[620px]">
        <div className="shrink-0 border-b border-border px-5 pt-5 pb-4 pr-14 md:px-6">
          <DialogTitle className="text-lg">Templates</DialogTitle>
          <DialogDescription>
            {NOTE_TEMPLATES.length} free templates. Pick one, then make it yours.
          </DialogDescription>
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search templates"
              aria-label="Search templates"
              className="h-10 border-border bg-muted/60 pl-9 md:h-9"
            />
          </div>
          <div className="no-scrollbar -mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1" role="tablist" aria-label="Category">
            {[{ value: "all" as const, label: "All" }, ...TEMPLATE_CATEGORIES].map((item) => (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={category === item.value}
                onClick={() => setCategory(item.value)}
                className={cn(
                  CHIP_CLASS,
                  category === item.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Template list (hidden on phones while previewing). */}
          <ul
            className={cn(
              "min-h-0 w-full flex-col gap-1 overflow-y-auto p-3 md:flex md:w-[46%] md:border-r md:border-border",
              isPreviewingOnPhone ? "hidden" : "flex"
            )}
          >
            {templates.length === 0 && (
              <li className="px-3 py-6 text-sm text-muted-foreground">No templates match “{query}”.</li>
            )}
            {templates.map((template) => {
              const Icon = getTemplateIcon(template.id);
              const isSelected = template.id === selected?.id;
              return (
                <li key={template.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(template)}
                    onDoubleClick={() => onUse(template)}
                    aria-current={isSelected ? "true" : undefined}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                      isSelected ? "md:bg-sidebar-accent" : "hover:bg-muted/70"
                    )}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{template.name}</span>
                      </span>
                      <span className="line-clamp-2 text-xs text-muted-foreground">{template.description}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Preview (always on md+, a full screen on phones). */}
          {selected && rendered && (
            <div className={cn("min-h-0 flex-1 flex-col md:flex", isPreviewingOnPhone ? "flex" : "hidden")}>
              <div className="flex shrink-0 items-center gap-2 px-3 pt-3 md:hidden">
                <Button variant="ghost" className="h-10 gap-1 px-2" onClick={() => setPreviewingOnPhone(false)}>
                  <ArrowLeft />
                  All templates
                </Button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 md:px-7 md:py-6">
                <TemplatePreview title={rendered.title} markdown={rendered.markdown} />
              </div>
              <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-7">
                <p className="truncate text-xs text-muted-foreground">{selected.name}</p>
                <Button className="h-10 px-5" onClick={() => onUse(selected)}>
                  Create note
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
