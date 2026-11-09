import { StepArt } from "@/components/landing/how-it-works-art";
import { FACTS, LANDING_SECTION_IDS, STEPS } from "@/components/landing/landing-content";
import { SectionHeading } from "@/components/landing/section-heading";
import { cn } from "@/lib/utils";

export function HowItWorksSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.howItWorks}
      className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-16 sm:px-6 sm:pt-24 lg:pt-28 lg:px-8"
    >
      <SectionHeading
        command="how it works"
        title="From blank page to backed up"
        description="Four small steps. Most people are writing within seconds."
      />

      {/* Phones: a compact numbered timeline. sm and up: one card per step. */}
      <ol className="reveal mt-8 grid grid-cols-1 sm:mt-14 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5">
        {STEPS.map(({ icon: Icon, art, title, description }, index) => (
          <li
            key={title}
            className={cn(
              "relative flex gap-4 pb-7 last:pb-0",
              "sm:flex-col sm:gap-0 sm:rounded-[28px] sm:border sm:border-line sm:bg-surface sm:p-2 sm:pb-2 sm:shadow-card sm:last:pb-2"
            )}
          >
            {/* Timeline marker and the line down to the next step (phones). */}
            <span className="relative flex shrink-0 flex-col items-center sm:hidden">
              <span className="flex size-10 items-center justify-center rounded-full border border-line bg-surface shadow-card">
                <Icon aria-hidden className="size-[18px] text-ink-soft" />
              </span>
              {index < STEPS.length - 1 && (
                <span aria-hidden className="absolute top-12 -bottom-5 w-px bg-line" />
              )}
            </span>

            <div className="hidden h-36 items-center justify-center overflow-hidden rounded-[20px] bg-sunken sm:flex">
              <StepArt kind={art} />
            </div>
            <div className="pt-1 sm:px-4 sm:pt-5 sm:pb-4">
              <span className="font-mono text-[13px] text-accent-edge">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-0.5 text-lg leading-snug font-medium tracking-[-0.02em] text-ink sm:mt-1 sm:text-xl">
                {title}
              </h3>
              <p className="mt-1 text-[15px] leading-relaxed text-pretty text-muted sm:mt-1.5">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <dl className="reveal mt-10 grid grid-cols-2 border-y border-line sm:mt-16 lg:grid-cols-4">
        {FACTS.map(({ value, label }, index) => (
          <div
            key={label}
            className={cn(
              "flex flex-col items-center gap-1 px-2 py-6 text-center sm:py-8",
              index % 2 === 1 && "border-l border-line",
              index >= 2 && "border-t border-line lg:border-t-0",
              index === 2 && "lg:border-l"
            )}
          >
            <dt className="order-2 text-[13px] font-medium text-muted">{label}</dt>
            <dd className="order-1 font-mono text-4xl text-ink sm:text-5xl">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
