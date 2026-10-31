import Image from "next/image";

import { AiVisual } from "@/components/landing/features/ai-visual";
import { BentoCard } from "@/components/landing/features/bento-card";
import {
  DownloadVisual,
  OrganiseVisual,
  TemplatesVisual,
} from "@/components/landing/features/bento-visuals";
import { MakeItYoursVisual } from "@/components/landing/features/make-it-yours-visual";
import { WriteFeatureCard } from "@/components/landing/features/write-feature-card";
import { LANDING_SECTION_IDS } from "@/components/landing/landing-content";
import { SectionHeading } from "@/components/landing/section-heading";
import privateNotebook from "../assets/feature-private.webp";

const PHOTO_QUALITY = 86;

/**
 * Feature grid. Desktop rows: Write (wide) + Private · AI, Templates, Find
 * · Make it yours (wide) + Download. Tablet pairs the single cards; phones stack.
 */
export function FeaturesSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.features}
      className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pt-28"
    >
      <SectionHeading
        command="features"
        title={
          <>
            Everything you need, <span className="marker">nothing</span> you don’t
          </>
        }
        description="A focused editor, ready-made templates and a few smart tools. Nothing to learn."
      />

      <div className="reveal mt-8 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        <WriteFeatureCard className="min-h-[420px] sm:col-span-2" />

        <BentoCard
          titleAccent="Private"
          title="by default"
          description="Notes live in your browser. No account, no server, and AI only when you ask."
          media={
            <Image
              src={privateNotebook}
              alt="A closed linen notebook with a small brass lock on a pale stone surface"
              placeholder="blur"
              quality={PHOTO_QUALITY}
              sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
              className="aspect-4/3 w-full object-cover"
            />
          }
        />

        <BentoCard
          tone="sky"
          titleAccent="Ask AI"
          title="when you want"
          description="Select a few lines and say what to change. Bring your own OpenAI, Google or Anthropic key."
        >
          <AiVisual />
        </BentoCard>

        <BentoCard
          titleAccent="21 templates"
          title="ready to go"
          description="Planners, meeting notes, trips, budgets and more. All free, all editable."
        >
          <TemplatesVisual />
        </BentoCard>

        <BentoCard
          tone="sky"
          titleAccent="Find it"
          title="fast"
          description="Search every note as you type. Pin, star and sort into categories."
        >
          <OrganiseVisual />
        </BentoCard>

        <BentoCard
          titleAccent="Make it"
          title="yours"
          description="Two layouts, three writing widths, light or dark, and shortcuts for everything you do often."
          className="sm:col-span-2"
        >
          <MakeItYoursVisual />
        </BentoCard>

        <BentoCard
          tone="sky"
          titleAccent="Download"
          title="any note"
          description="PDF, Markdown, text, HTML or JSON. Back up everything in one file."
          className="sm:col-span-2 lg:col-span-1"
        >
          <DownloadVisual />
        </BentoCard>
      </div>
    </section>
  );
}
