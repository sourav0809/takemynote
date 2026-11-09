import { FileJson, FileText, Heading1, ListTodo, Pin, Quote, Star } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Small pictures of each "How it works" step, drawn with the landing tokens
 * so they read as tiny pieces of the real app. Decorative only.
 */

const CARD = "rounded-xl border border-line bg-surface shadow-card";

/** 01: a fresh note with the cursor blinking after the first words. */
function WriteArt() {
  return (
    <div className={cn(CARD, "w-[172px] px-3.5 py-3")}>
      <p className="text-[13px] font-semibold tracking-[-0.01em] text-ink">Ideas for Sunday</p>
      <p className="mt-1.5 flex items-center text-[11px] text-ink-soft">
        Slow breakfast, then
        <span className="ml-0.5 inline-block h-3 w-px animate-[caret-blink_1.1s_steps(1)_infinite] bg-brand motion-reduce:animate-none" />
      </p>
      <div className="mt-2 space-y-1.5">
        <div className="h-1.5 w-full rounded-full bg-sunken" />
        <div className="h-1.5 w-3/4 rounded-full bg-sunken" />
      </div>
    </div>
  );
}

/** 02: the "/" menu, with Task list picked. */
function SlashArt() {
  const items = [
    { icon: Heading1, label: "Heading" },
    { icon: ListTodo, label: "Task list", active: true },
    { icon: Quote, label: "Quote" },
  ];
  return (
    <div className="flex flex-col items-start gap-1.5">
      <span className="ml-1 font-mono text-[12px] text-ink">
        <span className="text-accent-edge">/</span>ta
      </span>
      <div className={cn(CARD, "w-[150px] p-1")}>
        {items.map(({ icon: Icon, label, active }) => (
          <div
            key={label}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-1 text-[11px]",
              active ? "bg-accent font-medium text-ink" : "text-muted"
            )}
          >
            <Icon className={cn("size-3", active ? "text-sky-ink" : "text-subtle")} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

/** 03: category chips over a pinned and a starred note. */
function TidyArt() {
  const chips = [
    { label: "Work", dot: "bg-brand" },
    { label: "Ideas", dot: "bg-accent-edge" },
    { label: "Travel", dot: "bg-brand-deep" },
  ];
  return (
    <div className="flex w-[180px] flex-col gap-2">
      <div className="flex gap-1">
        {chips.map(({ label, dot }) => (
          <span
            key={label}
            className="flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5 text-[10px] font-medium text-ink-soft"
          >
            <span className={cn("size-1.5 rounded-full", dot)} />
            {label}
          </span>
        ))}
      </div>
      <div className={cn(CARD, "divide-y divide-line px-2.5")}>
        <div className="flex items-center justify-between py-1.5 text-[11px] font-medium text-ink">
          Q4 launch plan
          <Pin className="size-3 rotate-45 fill-sky-tint text-sky-ink" />
        </div>
        <div className="flex items-center justify-between py-1.5 text-[11px] text-ink-soft">
          Reading list
          <Star className="size-3 fill-sky-ink text-sky-ink" />
        </div>
      </div>
    </div>
  );
}

/** 04: one backup file being saved, with a Markdown export behind it. */
function BackupArt() {
  return (
    <div className="relative h-[84px] w-[172px]">
      <div className={cn(CARD, "absolute top-0 left-0 flex h-[64px] w-[88px] -rotate-6 flex-col justify-between p-2")}>
        <FileText className="size-4 text-subtle" />
        <span className="font-mono text-[10px] text-muted">note.md</span>
      </div>
      <div className={cn(CARD, "absolute right-0 bottom-0 flex h-[70px] w-[100px] flex-col justify-between p-2.5")}>
        <FileJson className="size-4 text-sky-ink" />
        <span className="font-mono text-[10px] text-ink">backup.json</span>
        <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-card">
          <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3v8M4.5 7.5 8 11l3.5-3.5M3.5 13.5h9" />
          </svg>
        </span>
      </div>
    </div>
  );
}

export type StepArtKind = "write" | "slash" | "tidy" | "backup";

const ART: Record<StepArtKind, () => React.ReactElement> = {
  write: WriteArt,
  slash: SlashArt,
  tidy: TidyArt,
  backup: BackupArt,
};

export function StepArt({ kind }: { kind: StepArtKind }) {
  const Art = ART[kind];
  return (
    <div aria-hidden className="pointer-events-none select-none">
      <Art />
    </div>
  );
}
