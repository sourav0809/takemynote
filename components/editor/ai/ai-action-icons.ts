import type { LucideIcon } from "lucide-react";
import { ListChecks, PenLine, SpellCheck, TextQuote } from "lucide-react";

import type { AiAction } from "@/lib/ai/ai-actions";

export const AI_ACTION_ICONS: Record<AiAction, LucideIcon> = {
  summarize: TextQuote,
  checklist: ListChecks,
  fix: SpellCheck,
  continue: PenLine,
};
