import { cn } from "@/lib/utils";

export type BentoTone = "plain" | "violet" | "sky" | "peach" | "mint";

const TONE_CLASSES: Record<BentoTone, { card: string; accent: string }> = {
  plain: { card: "border-line bg-surface", accent: "text-muted" },
  violet: { card: "border-violet-edge bg-violet-tint", accent: "text-violet-ink" },
  sky: { card: "border-sky-edge bg-sky-tint", accent: "text-sky-ink" },
  peach: { card: "border-peach-edge bg-peach-tint", accent: "text-peach-ink" },
  mint: { card: "border-mint-edge bg-mint-tint", accent: "text-mint-ink" },
};

interface BentoCardProps {
  tone?: BentoTone;
  /** First words of the title, coloured with the tone's ink. */
  titleAccent: string;
  title: string;
  description: string;
  className?: string;
  children?: React.ReactNode;
}

export function BentoCard({
  tone = "plain",
  titleAccent,
  title,
  description,
  className,
  children,
}: BentoCardProps) {
  const toneClasses = TONE_CLASSES[tone];

  return (
    <article
      className={cn(
        "flex min-w-0 flex-col gap-6 rounded-[28px] border p-6 shadow-card sm:p-7",
        toneClasses.card,
        className
      )}
    >
      <div>
        <h3 className="text-2xl leading-tight font-medium tracking-[-0.03em] text-balance text-ink">
          <span className={toneClasses.accent}>{titleAccent}</span> {title}
        </h3>
        <p className="mt-2 text-[15px] leading-relaxed text-pretty text-muted">{description}</p>
      </div>
      {children && <div className="mt-auto">{children}</div>}
    </article>
  );
}
