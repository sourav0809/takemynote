import Image from "next/image";
import { Check } from "lucide-react";

import { SlashMenuPreview } from "@/components/landing/slash-menu-preview";
import { cn } from "@/lib/utils";
import lakeImage from "../assets/feature-lake.webp";

const IMAGE_QUALITY = 86;

const TASKS = [
  { label: "Write the announcement", done: true },
  { label: "Record a 60-second demo", done: false },
];

/** The lead feature: a floating editor with the "/" menu, over a calm painted lake. */
export function WriteFeatureCard({ className }: { className?: string }) {
  return (
    <article
      className={cn(
        "relative isolate flex min-w-0 flex-col overflow-hidden rounded-[28px] border border-line shadow-card",
        className
      )}
    >
      <Image
        src={lakeImage}
        alt=""
        fill
        placeholder="blur"
        quality={IMAGE_QUALITY}
        sizes="(min-width: 1024px) 760px, 100vw"
        className="-z-10 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-white/70 via-white/20 to-transparent" />

      <div className="p-6 sm:p-7">
        <h3 className="text-[22px] leading-tight font-medium tracking-[-0.03em] text-ink sm:text-2xl">
          <span className="text-sky-ink">Type /</span> for any block
        </h3>
        <p className="mt-2 max-w-md text-[15px] leading-relaxed text-pretty text-ink-soft">
          Headings, tasks, tables, quotes and code appear the moment you need them.
        </p>
      </div>

      {/* A light editor window floating on the scene. */}
      <div aria-hidden className="relative mt-auto px-6 pb-6 sm:px-7 sm:pb-7">
        <div className="max-w-md rounded-2xl border border-white/70 bg-surface/95 p-4 shadow-window backdrop-blur-sm sm:p-5">
          <p className="text-[11px] font-medium text-subtle">
            <span className="text-sky-ink">Work</span> · Edited just now
          </p>
          <p className="mt-1.5 text-[17px] font-semibold tracking-tight text-ink">Launch week</p>
          <ul className="mt-2.5 flex flex-col gap-1.5">
            {TASKS.map(({ label, done }) => (
              <li key={label} className="flex items-center gap-2 text-[13px]">
                <span
                  className={cn(
                    "flex size-3.5 shrink-0 items-center justify-center rounded-[4px] border",
                    done ? "border-brand bg-brand text-brand-foreground" : "border-line-strong"
                  )}
                >
                  {done && <Check className="size-2.5" strokeWidth={3} />}
                </span>
                <span className={done ? "text-subtle line-through" : "text-ink-soft"}>{label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2.5 flex items-center text-[13px] text-ink">
            /<span className="ml-px h-3.5 w-px animate-pulse bg-ink" />
          </p>
        </div>
        <SlashMenuPreview
          compact
          className="absolute right-6 bottom-6 hidden w-52 sm:right-7 sm:bottom-7 sm:block lg:right-10"
        />
      </div>
    </article>
  );
}
