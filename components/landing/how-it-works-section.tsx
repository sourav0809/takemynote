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

      <ol className="reveal mt-8 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {STEPS.map(({ icon: Icon, title, description }, index) => (
          <li
            key={title}
            className="flex gap-4 rounded-[28px] border border-line bg-surface p-2 shadow-card sm:flex-col sm:gap-0"
          >
            <div className="flex w-20 shrink-0 items-center justify-center rounded-[20px] bg-sunken sm:h-28 sm:w-auto">
              <span className="flex size-11 items-center justify-center rounded-2xl border border-line bg-surface shadow-card">
                <Icon aria-hidden className="size-5 text-ink-soft" />
              </span>
            </div>
            <div className="py-3 pr-3 sm:px-4 sm:pt-5 sm:pb-4">
              <span className="font-mono text-[13px] text-accent-edge">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-1 text-lg leading-snug font-medium tracking-[-0.02em] text-ink sm:text-xl">
                {title}
              </h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-pretty text-muted">
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
