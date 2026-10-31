import type { LucideIcon } from "lucide-react";
import {
  Braces,
  CalendarCheck,
  FileCode,
  FileJson,
  FileText,
  FileType,
  Globe,
  Hash,
  Pin,
  Plane,
  Printer,
  Search,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const ROW_CLASS = "flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-card";
const ICON_CLASS = "flex size-9 shrink-0 items-center justify-center rounded-xl";

/** Search as you type, a pinned note and categories, in one small panel. */
export function OrganiseVisual() {
  return (
    <div aria-hidden className="flex flex-col gap-2">
      <div className="flex h-10 items-center gap-2 rounded-xl border border-sky-edge bg-surface px-3 text-[13px] text-ink">
        <Search className="size-4 text-sky-ink" />
        lisb
        <span className="h-4 w-px animate-pulse bg-ink" />
      </div>
      <div className={ROW_CLASS}>
        <span className={cn(ICON_CLASS, "bg-sky-tint text-sky-ink")}>
          <Pin className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-ink">
            Weekend in <span className="marker">Lisb</span>on
          </p>
          <p className="truncate text-[12px] text-muted">Pinned · Travel</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 pt-1">
        {["Travel", "Work", "Ideas"].map((label) => (
          <span
            key={label}
            className="inline-flex h-7 items-center gap-1 rounded-full border border-line bg-surface px-2.5 text-[11px] font-semibold text-ink-soft"
          >
            <Hash className="size-3 text-subtle" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

const TEMPLATE_STACK: { icon: LucideIcon; name: string; lines: string[] }[] = [
  { icon: Plane, name: "Trip planner", lines: ["Itinerary", "Packing list"] },
  { icon: Users, name: "Meeting notes", lines: ["Agenda", "Action items"] },
  { icon: CalendarCheck, name: "Daily planner", lines: ["Top 3 priorities", "Schedule"] },
];

/** Three template cards fanned out like a small deck. */
export function TemplatesVisual() {
  return (
    <div aria-hidden className="relative h-48">
      {TEMPLATE_STACK.map(({ icon: Icon, name, lines }, index) => (
        <div
          key={name}
          className={cn(
            "absolute inset-x-2 rounded-2xl border border-line bg-surface p-3.5 shadow-card",
            index === 0 && "top-0 scale-[0.92]",
            index === 1 && "top-9 scale-[0.96]",
            index === 2 && "top-[72px] shadow-float"
          )}
        >
          <p className="flex items-center gap-2 text-[13px] font-semibold text-ink">
            <span className="flex size-6 items-center justify-center rounded-lg bg-sky-tint text-sky-ink">
              <Icon className="size-3.5" />
            </span>
            {name}
          </p>
          <ul className="mt-2.5 flex flex-col gap-1.5">
            {lines.map((line) => (
              <li key={line} className="flex items-center gap-2 text-[12px] text-muted">
                <span className="size-3 shrink-0 rounded-[3px] border border-line-strong" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

const DOWNLOAD_FORMATS: { icon: LucideIcon; label: string }[] = [
  { icon: FileText, label: "PDF" },
  { icon: FileCode, label: "Markdown" },
  { icon: FileType, label: "Text" },
  { icon: Globe, label: "HTML" },
  { icon: Braces, label: "JSON" },
];

/** Every download format, the one-file backup, and printing. */
export function DownloadVisual() {
  return (
    <div aria-hidden className="flex flex-col gap-2.5">
      <div className="grid grid-cols-5 gap-1.5">
        {DOWNLOAD_FORMATS.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-line bg-surface px-1 py-2.5 shadow-card"
          >
            <Icon className="size-4 text-sky-ink" />
            <span className="w-full truncate text-center text-[10.5px] font-semibold text-ink-soft">{label}</span>
          </div>
        ))}
      </div>
      <div className={cn(ROW_CLASS, "border border-line")}>
        <span className={cn(ICON_CLASS, "bg-sky-tint text-sky-ink")}>
          <FileJson className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-ink">takemynote-backup.json</p>
          <p className="truncate text-[12px] text-muted">Everything, restorable anywhere</p>
        </div>
      </div>
      <div className={cn(ROW_CLASS, "border border-line")}>
        <span className={cn(ICON_CLASS, "bg-sky-tint text-sky-ink")}>
          <Printer className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-ink">Print</p>
          <p className="truncate text-[12px] text-muted">A clean copy, any page size</p>
        </div>
      </div>
    </div>
  );
}
