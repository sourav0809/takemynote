import { BentoCard } from "@/components/landing/features/bento-card";
import {
  BackupVisual,
  OrganiseVisual,
  PrivacyVisual,
  ScratchpadVisual,
  SearchVisual,
} from "@/components/landing/features/bento-visuals";
import { LANDING_SECTION_IDS } from "@/components/landing/landing-content";
import { SectionHeading } from "@/components/landing/section-heading";
import { SlashMenuPreview } from "@/components/landing/slash-menu-preview";

export function FeaturesSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.features}
      className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
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

      <div className="reveal mt-12 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        <BentoCard
          tone="violet"
          titleAccent="Type /"
          title="for any block"
          description="Headings, task lists, quotes and code blocks appear the moment you need them."
          className="sm:col-span-2"
        >
          <SlashMenuPreview className="max-w-none shadow-card sm:max-w-72" />
        </BentoCard>
        <BentoCard
          tone="mint"
          titleAccent="Private"
          title="by default"
          description="Notes live in your browser. Nothing to sign up for or sync."
        >
          <PrivacyVisual />
        </BentoCard>
        <BentoCard
          titleAccent="Tidy"
          title="without trying"
          description="Categories, pins and favourites keep the right note close."
        >
          <OrganiseVisual />
        </BentoCard>
        <BentoCard
          tone="sky"
          titleAccent="Find it"
          title="as you type"
          description="Search titles and text across every note instantly."
        >
          <SearchVisual />
        </BentoCard>
        <BentoCard
          tone="peach"
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
      </div>
    </section>
  );
}
