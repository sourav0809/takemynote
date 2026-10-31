import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  /** Shown as a slash command in the badge, e.g. "features" → "/ features". */
  command: string;
  title: React.ReactNode;
  description?: string;
  className?: string;
}

export function SectionHeading({ command, title, description, className }: SectionHeadingProps) {
  return (
    <div className={cn("mx-auto flex max-w-2xl flex-col items-center text-center", className)}>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-[13px] font-medium text-ink-soft shadow-card">
        <span aria-hidden className="font-mono text-accent-edge">
          /
        </span>
        {command}
      </span>
      <h2 className="mt-5 text-[34px] leading-[1.1] font-medium tracking-[-0.025em] text-balance text-ink sm:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-pretty text-muted sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
