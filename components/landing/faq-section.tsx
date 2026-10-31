import { Plus } from "lucide-react";
import { FAQ_ITEMS, LANDING_SECTION_IDS } from "@/components/landing/landing-content";
import { SectionHeading } from "@/components/landing/section-heading";

export function FaqSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.faq}
      className="mx-auto max-w-3xl scroll-mt-24 px-4 pt-16 sm:px-6 sm:pt-24 lg:pt-28"
    >
      <SectionHeading command="faq" title="Questions, answered" />

      <div className="reveal mt-8 divide-y divide-line rounded-[28px] border border-line bg-surface shadow-card sm:mt-14">
        {FAQ_ITEMS.map(({ question, answer }) => (
          <details key={question} className="group px-5 sm:px-7">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-base font-semibold text-ink [&::-webkit-details-marker]:hidden">
              {question}
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sunken text-muted transition group-open:rotate-45 group-open:bg-accent group-open:text-ink">
                <Plus aria-hidden className="size-4" />
              </span>
            </summary>
            <p className="-mt-1 pr-10 pb-5 text-[15px] leading-relaxed text-pretty text-muted">
              {answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
