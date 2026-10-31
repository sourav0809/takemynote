"use client";

import { Lock } from "lucide-react";
import { useId } from "react";

import { AiSetupForm } from "@/components/ai/ai-setup-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAiSettings } from "@/hooks/use-ai-settings";
import { DEFAULT_INSTRUCTIONS, MAX_INSTRUCTIONS_CHARS } from "@/lib/ai/prompts";
import { AI_PROVIDERS } from "@/lib/ai/providers";

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

/** Settings → AI: provider, model and key, plus the user's writing preferences. */
export function AiTab() {
  const settings = useAiSettings();
  const instructionsId = useId();
  const providerName = AI_PROVIDERS[settings.provider].name;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <SectionHeading
          title="Provider and key"
          description="Bring your own key. Pick a lighter model to keep costs down."
        />
        <AiSetupForm allowRemove />
      </section>

      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <SectionHeading
          title="Your writing style"
          description="Tell AI how you like to write: tone, language, words to avoid. TakeMyNote’s own rules still apply."
        />
        <Label htmlFor={instructionsId} className="sr-only">
          Additional instructions
        </Label>
        <Textarea
          id={instructionsId}
          value={settings.instructions}
          maxLength={MAX_INSTRUCTIONS_CHARS}
          onChange={(event) => settings.update({ instructions: event.target.value })}
          placeholder={DEFAULT_INSTRUCTIONS}
          className="min-h-28 leading-relaxed"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground tabular-nums">
            {settings.instructions.length} / {MAX_INSTRUCTIONS_CHARS}
          </span>
          {settings.instructions !== DEFAULT_INSTRUCTIONS && (
            <Button
              variant="ghost"
              size="xs"
              className="text-muted-foreground"
              onClick={() => settings.update({ instructions: DEFAULT_INSTRUCTIONS })}
            >
              Reset to default
            </Button>
          )}
        </div>
      </section>

      <p className="flex gap-2.5 rounded-2xl bg-muted/60 p-4 text-xs leading-relaxed text-muted-foreground">
        <Lock className="mt-0.5 size-3.5 shrink-0" />
        <span>
          Your key is encrypted and stays in this browser. It’s left out of backups and exports. When you use AI,
          the text you choose and your key go straight to {providerName}, never to TakeMyNote.
        </span>
      </p>
    </div>
  );
}
