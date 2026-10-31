import { PageTransition } from "@/components/common/page-transition";
import { ClosingCta } from "@/components/landing/closing-cta";
import { FaqSection } from "@/components/landing/faq-section";
import { FeaturesSection } from "@/components/landing/features/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingNav } from "@/components/landing/landing-nav";

export default function LandingPage() {
  return (
    <PageTransition>
      <div className="landing min-h-dvh bg-canvas font-sans text-ink">
        <LandingNav />
        <main>
          <LandingHero />
          <FeaturesSection />
          <HowItWorksSection />
          <FaqSection />
          <ClosingCta />
        </main>
        <LandingFooter />
      </div>
    </PageTransition>
  );
}
