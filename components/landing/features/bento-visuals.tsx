import { FileJson, FileText, Hash, Lock, Pin, Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const ROW_CLASS = "flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-card";
const ICON_CLASS = "flex size-9 shrink-0 items-center justify-center rounded-xl";

export function PrivacyVisual() {
  return (
    <div aria-hidden className={ROW_CLASS}>
      <span className={cn(ICON_CLASS, "bg-sky-tint text-sky-ink")}>
        <Lock className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-ink">On this device only</p>
        <p className="truncate text-[12px] text-muted">No account · No server</p>
      </div>
    </div>
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
    <ul aria-hidden className="flex flex-wrap gap-2">
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

const BACKUP_ROWS = [
  {
    icon: FileJson,
    title: "takemynote-backup.json",
    meta: "Notes, categories and preferences",
    iconClass: "bg-sky-tint text-sky-ink",
  },
  {
    icon: FileText,
    title: "weekend-in-lisbon.md",
    meta: "Single note as Markdown",
    iconClass: "bg-sky-edge text-brand-deep",
  },
];

export function BackupVisual() {
  return (
    <ul aria-hidden className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {BACKUP_ROWS.map(({ icon: Icon, title, meta, iconClass }) => (
        <li key={title} className={cn(ROW_CLASS, "border border-line")}>
          <span className={cn(ICON_CLASS, iconClass)}>
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
