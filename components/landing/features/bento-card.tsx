import { cn } from "@/lib/utils";

export type BentoTone = "plain" | "sky";

const TONE_CLASSES: Record<BentoTone, { card: string; accent: string }> = {
  plain: { card: "border-line bg-surface", accent: "text-sky-ink" },
  sky: { card: "border-sky-edge bg-sky-tint", accent: "text-sky-ink" },
};

interface BentoCardProps {
  tone?: BentoTone;
  /** First words of the title, coloured with the tone's ink. */
  titleAccent: string;
  title: string;
  description: string;
  className?: string;
  /** A picture shown above the text, inset in the card (illustrated card). */
  media?: React.ReactNode;
  /** A live-looking UI shown below the text. */
  children?: React.ReactNode;
}

export function BentoCard({
  tone = "plain",
  titleAccent,
  title,
  description,
  className,
  media,
  children,
}: BentoCardProps) {
  const toneClasses = TONE_CLASSES[tone];

  return (
    <article
      className={cn(
        "flex min-w-0 flex-col rounded-[28px] border shadow-card",
        media ? "gap-0 p-2" : "gap-6 p-6 sm:p-7",
        toneClasses.card,
        className
      )}
    >
      {media && <div className="overflow-hidden rounded-[20px]">{media}</div>}
      <div className={cn(media && "px-4 pt-5 pb-4 sm:px-5")}>
        <h3 className="text-[22px] leading-tight font-medium tracking-[-0.03em] text-balance text-ink sm:text-2xl">
          <span className={toneClasses.accent}>{titleAccent}</span> {title}
        </h3>
        <p className="mt-2 text-[15px] leading-relaxed text-pretty text-muted">{description}</p>
      </div>
      {children && <div className="mt-auto">{children}</div>}
    </article>
  );
}
