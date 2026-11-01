import { useEffect, useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { ArrowLeft, ArrowRight, Settings } from "lucide-react";

import { AiSetupForm } from "@/components/ai/ai-setup-form";
import { ThemeOptionCards } from "@/components/onboarding/theme-option-cards";
import { useOnboardingSound } from "@/components/onboarding/use-onboarding-sound";
import { WelcomeStep } from "@/components/onboarding/welcome-step";
import { LayoutOptionCards } from "@/components/settings/layout-picker";
import { WritingPositionCards } from "@/components/settings/writing-position-picker";
import { Button } from "@/components/ui/button";
import { useAiSettings } from "@/hooks/use-ai-settings";
import { useIsHydrated } from "@/hooks/use-is-hydrated";
import { usePreferences } from "@/hooks/use-preferences";
import { cn } from "@/lib/utils";

interface ChoiceStep {
  title: string;
  description: string;
  content: React.ReactNode;
  /** Where to change it later. */
  settingsPath: string;
  /** Optional steps offer "Skip for now" until they're done. */
  isOptional?: boolean;
}

/** Steps after the welcome. Each choice applies live and can be changed later. */
const CHOICE_STEPS: ChoiceStep[] = [
  {
    title: "Pick a layout",
    description: "How should the app be arranged?",
    content: <LayoutOptionCards />,
    settingsPath: "Settings → Preferences",
  },
  {
    title: "Where should your text sit?",
    description: "Choose the writing area that feels right. The toolbar always stays centred.",
    content: <WritingPositionCards />,
    settingsPath: "Settings → Preferences",
  },
  {
    title: "Add AI (optional)",
    description: "Use your own OpenAI, Google or Anthropic key to edit and write with AI. It’s encrypted and stays in this browser.",
    content: <AiSetupForm />,
    settingsPath: "Settings → AI",
    isOptional: true,
  },
  {
    title: "Light or dark?",
    description: "Pick what’s easiest on your eyes.",
    content: <ThemeOptionCards />,
    settingsPath: "Settings → Preferences",
  },
];

const STEP_COUNT = CHOICE_STEPS.length + 1;
const LAST_STEP = STEP_COUNT - 1;
/** Lets the app draw behind the dialog first, so the two don't pop in together. */
const OPEN_DELAY_MS = 400;

const EASE_OUT = "ease-[cubic-bezier(0.2,0.7,0.2,1)]";

type Direction = "forward" | "back";

/** First-run welcome: intro, layout, writing area, AI (optional), light/dark. Shown once per browser. */
export function OnboardingDialog() {
  const isHydrated = useIsHydrated();
  const { onboardingCompleted, setPreference } = usePreferences();
  const { isReady: isAiReady } = useAiSettings();
  const [isReady, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<Direction>("forward");

  // Preferences come from localStorage, so wait for hydration (no flash for
  // returning users), then a beat for the app to settle.
  useEffect(() => {
    if (!isHydrated || onboardingCompleted) return;
    const timer = window.setTimeout(() => setReady(true), OPEN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [isHydrated, onboardingCompleted]);

  const isOpen = isReady && !onboardingCompleted;
  const currentChoice = step > 0 ? CHOICE_STEPS[step - 1] : null;
  const canSkipStep = currentChoice?.isOptional && !isAiReady;
  const playSound = useOnboardingSound(isOpen);
  const finish = () => setPreference("onboardingCompleted", true);
  const startWriting = () => {
    playSound("finish");
    finish();
  };
  const goTo = (nextStep: number) => {
    playSound(nextStep > step ? "forward" : "back");
    setDirection(nextStep > step ? "forward" : "back");
    setStep(nextStep);
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && finish()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/35 transition-opacity duration-300 supports-backdrop-filter:backdrop-blur-sm",
            "data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none",
            EASE_OUT
          )}
        />
        <DialogPrimitive.Popup
          className={cn(
            // Phones: a bottom sheet. sm and up: a centred card.
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[94dvh] flex-col overflow-hidden rounded-t-3xl bg-popover text-popover-foreground shadow-2xl ring-1 ring-foreground/5 outline-none",
            "sm:inset-0 sm:m-auto sm:h-fit sm:w-[calc(100%-3rem)] sm:max-w-2xl sm:rounded-3xl dark:ring-foreground/10",
            "transition-[opacity,translate,scale] duration-300 motion-reduce:transition-none",
            "data-starting-style:translate-y-full data-ending-style:translate-y-full",
            "sm:data-starting-style:translate-y-4 sm:data-starting-style:scale-[0.97] sm:data-starting-style:opacity-0",
            "sm:data-ending-style:translate-y-2 sm:data-ending-style:opacity-0",
            EASE_OUT
          )}
        >
          <span aria-hidden className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-foreground/15 sm:hidden" />

          {/* Fixed height so the dialog never jumps between steps. */}
          <div className="h-[min(520px,calc(94dvh-96px))] overflow-x-hidden overflow-y-auto px-6 pt-5 pb-6 sm:h-[460px] sm:px-10 sm:pt-10">
            <div
              key={step}
              className={cn(
                "duration-300 animate-in fade-in-0 motion-reduce:animate-none",
                direction === "forward" ? "slide-in-from-right-6" : "slide-in-from-left-6",
                EASE_OUT
              )}
            >
              {step === 0 && (
                <>
                  <DialogPrimitive.Title className="sr-only">Welcome</DialogPrimitive.Title>
                  <WelcomeStep />
                </>
              )}
              {step > 0 && (
                <>
                  <DialogPrimitive.Title className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {CHOICE_STEPS[step - 1].title}
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Description className="mt-1.5 text-sm text-muted-foreground">
                    {CHOICE_STEPS[step - 1].description}
                  </DialogPrimitive.Description>
                  <div className="mt-6">{CHOICE_STEPS[step - 1].content}</div>
                  <p className="mt-5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Settings className="size-3.5 shrink-0" />
                    You can change this anytime in {CHOICE_STEPS[step - 1].settingsPath}.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-10">
            <div className="flex items-center gap-1.5" aria-label={`Step ${step + 1} of ${STEP_COUNT}`}>
              {Array.from({ length: STEP_COUNT }, (_, index) => (
                <span
                  key={index}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    index === step ? "w-6 bg-primary" : "w-1.5 bg-foreground/20"
                  )}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {step === 0 ? (
                <Button variant="ghost" className="h-10" onClick={finish}>
                  Skip
                </Button>
              ) : (
                <Button variant="ghost" className="h-10 gap-1.5" onClick={() => goTo(step - 1)}>
                  <ArrowLeft />
                  Back
                </Button>
              )}
              {step < LAST_STEP ? (
                <Button
                  variant={canSkipStep ? "outline" : "default"}
                  className="h-10 gap-1.5 px-4"
                  onClick={() => goTo(step + 1)}
                >
                  {step === 0 ? "Get started" : canSkipStep ? "Skip for now" : "Continue"}
                  <ArrowRight />
                </Button>
              ) : (
                <Button className="h-10 px-4" onClick={startWriting}>
                  Start writing
                </Button>
              )}
            </div>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
