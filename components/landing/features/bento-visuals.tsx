import { FileJson, Hash, Lock, Pin, Search, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const ROW_CLASS = "flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-card";
const ICON_CLASS = "flex size-9 shrink-0 items-center justify-center rounded-xl";

const PRIVACY_ROWS = [
  { icon: Lock, title: "On this device only", meta: "No account, no server" },
  { icon: Sparkles, title: "AI only when you ask", meta: "Nothing is sent otherwise" },
];

export function PrivacyVisual() {
  return (
    <ul aria-hidden className="flex flex-col gap-2">
      {PRIVACY_ROWS.map(({ icon: Icon, title, meta }) => (
        <li key={title} className={ROW_CLASS}>
          <span className={cn(ICON_CLASS, "bg-sky-tint text-sky-ink")}>
            <Icon className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-ink">{title}</p>
            <p className="truncate text-[12px] text-muted">{meta}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

const ORGANISE_CHIPS = [
  { label: "Pinned", icon: Pin },
  { label: "Favorites", icon: Star },
  { label: "Ideas", icon: Hash },
  { label: "Work", icon: Hash },
];

export function OrganiseVisual() {
  return (
    <div aria-hidden className="flex flex-col gap-2.5">
      <div className={ROW_CLASS}>
        <span className={cn(ICON_CLASS, "bg-sky-tint text-sky-ink")}>
          <Pin className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-ink">Weekend in Lisbon</p>
          <p className="truncate text-[12px] text-muted">Pinned · Travel</p>
        </div>
      </div>
      <ul className="flex flex-wrap gap-2">
        {ORGANISE_CHIPS.map(({ label, icon: Icon }) => (
          <li
            key={label}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-[12px] font-semibold text-ink-soft"
          >
            <Icon className="size-3.5 text-subtle" />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SearchVisual() {
  return (
    <div aria-hidden className="flex flex-col gap-2">
      <div className="flex h-10 items-center gap-2 rounded-xl border border-sky-edge bg-surface px-3 text-[13px] text-ink">
        <Search className="size-4 text-sky-ink" />
        lisb
        <span className="h-4 w-px animate-pulse bg-ink" />
      </div>
      <div className={ROW_CLASS}>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-ink">
            Weekend in <span className="marker">Lisb</span>on
          </p>
          <p className="truncate text-[12px] text-muted">Travel · Edited 2m ago</p>
        </div>
      </div>
    </div>
  );
}

export function ScratchpadVisual() {
  return (
    <div aria-hidden className="rounded-2xl bg-surface p-4 font-mono text-[12px] leading-6 text-muted shadow-card">
      <p>wifi: lisbon-guest</p>
      <p>call dentist → thu</p>
      <p className="flex items-center text-ink">
        idea: weekly review
        <span className="ml-0.5 h-4 w-px animate-pulse bg-ink" />
      </p>
    </div>
  );
}

const DOWNLOAD_FORMATS = ["PDF", "Markdown", "Plain text", "HTML", "JSON"];

export function BackupVisual() {
  return (
    <div aria-hidden className="flex flex-col gap-2.5">
      <div className={cn(ROW_CLASS, "border border-line")}>
        <span className={cn(ICON_CLASS, "bg-sky-tint text-sky-ink")}>
          <FileJson className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-ink">takemynote-backup.json</p>
          <p className="truncate text-[12px] text-muted">Notes, categories and preferences</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[12px] font-medium text-muted">Download a note as</span>
        {DOWNLOAD_FORMATS.map((format) => (
          <span
            key={format}
            className="inline-flex h-7 items-center rounded-full border border-line bg-surface px-2.5 text-[11px] font-semibold text-ink-soft"
          >
            {format}
          </span>
        ))}
      </div>
    </div>
  );
}
