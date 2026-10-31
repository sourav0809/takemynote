import { BentoCard } from "@/components/landing/features/bento-card";
import {
  BackupVisual,
  OrganiseVisual,
  PrivacyVisual,
  ScratchpadVisual,
  SearchVisual,
} from "@/components/landing/features/bento-visuals";
import { AiVisual } from "@/components/landing/features/ai-visual";
import { MakeItYoursVisual } from "@/components/landing/features/make-it-yours-visual";
import { LANDING_SECTION_IDS } from "@/components/landing/landing-content";
import { SectionHeading } from "@/components/landing/section-heading";
import { SlashMenuPreview } from "@/components/landing/slash-menu-preview";

export function FeaturesSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.features}
      className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-16 sm:px-6 sm:pt-24 lg:pt-28 lg:px-8"
    >
      <SectionHeading
        command="features"
        title={
          <>
            Everything you need, <span className="marker">nothing</span> you don’t
          </>
        }
        description="A focused editor and a few smart tools to keep your notes in order."
      />

      <div className="reveal mt-8 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        <BentoCard
          tone="sky"
          titleAccent="Type /"
          title="for any block"
          description="Headings, task lists, quotes and code blocks appear the moment you need them."
          className="sm:col-span-2"
        >
          <SlashMenuPreview className="max-w-none shadow-card sm:max-w-72" />
        </BentoCard>
        <BentoCard
          titleAccent="Private"
          title="by default"
          description="Notes live in your browser. Nothing to sign up for or sync."
        >
          <PrivacyVisual />
        </BentoCard>
        <BentoCard
          tone="sky"
          titleAccent="Tidy"
          title="without trying"
          description="Categories, pins and favourites keep the right note close."
        >
          <OrganiseVisual />
        </BentoCard>
        <BentoCard
          titleAccent="Find it"
          title="as you type"
          description="Search titles and text across every note instantly."
        >
          <SearchVisual />
        </BentoCard>
        <BentoCard
          tone="sky"
          titleAccent="Scratchpad"
          title="for quick bits"
          description="One always-there page for numbers, links and half-ideas."
        >
          <ScratchpadVisual />
        </BentoCard>
        <BentoCard
          titleAccent="Back up"
          title="in one file"
          description="Save everything to a single backup and restore it on any device. Export any note as Markdown."
          className="sm:col-span-2"
        >
          <BackupVisual />
        </BentoCard>
        <BentoCard
          tone="sky"
          titleAccent="Ask AI"
          title="only when you want"
          description="Summarize a note, turn it into a checklist, fix spelling or keep writing. You decide what gets added."
          className="sm:col-span-2"
        >
          <AiVisual />
        </BentoCard>
        <BentoCard
          titleAccent="Make it"
          title="yours"
          description="Pick a layout, choose where your text sits, go light or dark, and fly through it with keyboard shortcuts."
          className="sm:col-span-2"
        >
          <MakeItYoursVisual />
        </BentoCard>
      </div>
    </section>
  );
}
