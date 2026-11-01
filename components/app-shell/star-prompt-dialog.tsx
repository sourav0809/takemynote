"use client";

import { Star } from "lucide-react";
import { useEffect, useState } from "react";

import { GithubIcon } from "@/components/brand/github-icon";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useIsHydrated } from "@/hooks/use-is-hydrated";
import { usePreferences } from "@/hooks/use-preferences";
import { APP_NAME, GITHUB_URL } from "@/lib/constants";
import {
  countActiveDays,
  finishStarPrompt,
  recordVisit,
  shouldAskForStar,
  snoozeStarPrompt,
} from "@/lib/star-prompt";
import { cn } from "@/lib/utils";

/** Let people settle into their session before asking. */
const ASK_DELAY_MS = 20_000;
/** If something else is open (or the tab is hidden), try again a little later. */
const RETRY_DELAY_MS = 15_000;
const MAX_RETRIES = 6;
/** Anything already asking for attention. */
const BUSY_SELECTOR = '[role="dialog"], [role="menu"], [role="listbox"]';

/**
 * A one-time "enjoying it? star us on GitHub" ask, after someone has used the
 * app for a day and come back (rules in lib/star-prompt.ts).
 */
export function StarPromptDialog() {
  const isHydrated = useIsHydrated();
  const { onboardingCompleted } = usePreferences();
  const [isOpen, setOpen] = useState(false);
  const [activeDays, setActiveDays] = useState(0);

  useEffect(() => {
    if (!isHydrated) return;
    const record = recordVisit();
    if (!onboardingCompleted || !shouldAskForStar(record)) return;

    let retries = 0;
    let timer = 0;
    const tryToOpen = () => {
      const isBusy = document.visibilityState !== "visible" || document.querySelector(BUSY_SELECTOR);
      if (!isBusy) {
        setActiveDays(countActiveDays());
        setOpen(true);
      } else if (retries++ < MAX_RETRIES) {
        timer = window.setTimeout(tryToOpen, RETRY_DELAY_MS);
      }
    };
    timer = window.setTimeout(tryToOpen, ASK_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [isHydrated, onboardingCompleted]);

  const close = (outcome: "finish" | "snooze") => {
    if (outcome === "finish") finishStarPrompt();
    else snoozeStarPrompt();
    setOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close("finish")}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[420px]">
        <div className="flex flex-col items-center px-7 pt-9 pb-7 text-center">
          <span aria-hidden className="relative flex size-16 items-center justify-center rounded-2xl bg-foreground text-background shadow-lg">
            <GithubIcon className="size-8" />
            <span className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-background shadow-md ring-1 ring-border">
              <Star className="size-4 animate-[star-pop_0.6s_ease-out_0.2s_both] fill-amber-400 text-amber-500 motion-reduce:animate-none" />
            </span>
          </span>

          <DialogTitle className="mt-6 text-xl font-semibold tracking-tight">Enjoying {APP_NAME}?</DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {activeDays >= 2 && (
              <span className="mb-2 block font-medium text-foreground">
                You’ve written here on {activeDays} different days.
              </span>
            )}
            It’s free, open source and has no ads. If it has made your notes a little calmer, a star on GitHub is
            the nicest way to say thanks, and it helps other people find it.
          </DialogDescription>
        </div>

        <div className="flex flex-col gap-2 border-t border-border bg-muted/40 px-7 py-5">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => close("finish")}
            className={cn(buttonVariants(), "h-11 gap-2 text-[15px]")}
          >
            <Star className="size-4" />
            Star on GitHub
          </a>
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" className="h-10 text-muted-foreground" onClick={() => close("snooze")}>
              Maybe later
            </Button>
            <Button variant="ghost" className="h-10 text-muted-foreground" onClick={() => close("finish")}>
              Don’t ask again
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
