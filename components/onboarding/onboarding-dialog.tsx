import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { ThemeOptionCards } from "@/components/onboarding/theme-option-cards";
import { WelcomeStep } from "@/components/onboarding/welcome-step";
import { LayoutOptionCards } from "@/components/settings/layout-picker";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useIsHydrated } from "@/hooks/use-is-hydrated";
import { usePreferences } from "@/hooks/use-preferences";
import { cn } from "@/lib/utils";

const STEP_COUNT = 3;
const LAST_STEP = STEP_COUNT - 1;

/** First-run welcome: intro, then layout, then light/dark. Shown once per browser. */
export function OnboardingDialog() {
  const isHydrated = useIsHydrated();
  const { onboardingCompleted, setPreference } = usePreferences();
  const [step, setStep] = useState(0);

  // Preferences come from localStorage, so wait for hydration to avoid a flash.
  const isOpen = isHydrated && !onboardingCompleted;
  const finish = () => setPreference("onboardingCompleted", true);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && finish()}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[92dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-7 pb-6 sm:px-8 sm:pt-8">
          {step === 0 && (
            <>
              <DialogTitle className="sr-only">Welcome</DialogTitle>
              <WelcomeStep />
            </>
          )}
          {step === 1 && (
            <>
              <DialogTitle className="text-xl font-semibold tracking-tight">Pick a layout</DialogTitle>
              <DialogDescription className="mt-1.5 text-sm">
                How should the app be arranged? You can change this anytime in Settings.
              </DialogDescription>
              <LayoutOptionCards className="mt-5" />
            </>
          )}
          {step === 2 && (
            <>
              <DialogTitle className="text-xl font-semibold tracking-tight">Light or dark?</DialogTitle>
              <DialogDescription className="mt-1.5 text-sm">
                Pick what’s easiest on your eyes. Also in Settings later.
              </DialogDescription>
              <div className="mt-5">
                <ThemeOptionCards />
              </div>
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border px-6 py-4 sm:px-8">
          <div className="flex items-center gap-1.5" aria-label={`Step ${step + 1} of ${STEP_COUNT}`}>
            {Array.from({ length: STEP_COUNT }, (_, index) => (
              <span
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === step ? "w-5 bg-primary" : "w-1.5 bg-foreground/20"
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step === 0 ? (
              <Button variant="ghost" onClick={finish}>
                Skip
              </Button>
            ) : (
              <Button variant="ghost" className="gap-1.5" onClick={() => setStep(step - 1)}>
                <ArrowLeft />
                Back
              </Button>
            )}
            {step < LAST_STEP ? (
              <Button className="gap-1.5" onClick={() => setStep(step + 1)}>
                {step === 0 ? "Get started" : "Continue"}
                <ArrowRight />
              </Button>
            ) : (
              <Button onClick={finish}>Start writing</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
