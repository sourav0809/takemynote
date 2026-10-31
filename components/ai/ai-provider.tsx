"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

import { AiSetupForm } from "@/components/ai/ai-setup-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { readAiConfig } from "@/lib/ai/ai-config";
import { readSavedKeyInfo } from "@/lib/ai/key-vault";

interface AiContextValue {
  /**
   * Runs `action` now if AI is set up. Otherwise opens the setup dialog and
   * runs it right after a key is saved, so nothing the user started is lost.
   */
  requireAi: (action: () => void) => void;
  /** Opens the setup dialog, e.g. after a "key didn't work" error. */
  openAiSetup: () => void;
}

const AiContext = createContext<AiContextValue | null>(null);

function isAiReady(): boolean {
  return readSavedKeyInfo()?.provider === readAiConfig().provider;
}

export function AiProvider({ children }: { children: React.ReactNode }) {
  const [isSetupOpen, setSetupOpen] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  const requireAi = useCallback((action: () => void) => {
    if (isAiReady()) {
      action();
      return;
    }
    pendingActionRef.current = action;
    setSetupOpen(true);
  }, []);

  const openAiSetup = useCallback(() => {
    pendingActionRef.current = null;
    setSetupOpen(true);
  }, []);

  const handleOpenChange = (open: boolean) => {
    setSetupOpen(open);
    if (!open) pendingActionRef.current = null;
  };

  const handleSaved = () => {
    const pendingAction = pendingActionRef.current;
    pendingActionRef.current = null;
    setSetupOpen(false);
    pendingAction?.();
  };

  const value = useMemo(() => ({ requireAi, openAiSetup }), [requireAi, openAiSetup]);

  return (
    <AiContext.Provider value={value}>
      {children}
      <Dialog open={isSetupOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[92dvh] gap-5 overflow-y-auto sm:max-w-lg">
          <DialogHeader className="pr-10">
            <DialogTitle className="text-lg">Set up AI</DialogTitle>
            <DialogDescription>
              Use your own OpenAI, Google or Anthropic key. It’s encrypted and stays in this browser.
            </DialogDescription>
          </DialogHeader>
          <AiSetupForm onSaved={handleSaved} />
        </DialogContent>
      </Dialog>
    </AiContext.Provider>
  );
}

export function useAi(): AiContextValue {
  const context = useContext(AiContext);
  if (!context) throw new Error("useAi must be used within an AiProvider");
  return context;
}
