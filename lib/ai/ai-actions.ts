/** The AI actions TakeMyNote offers. Shared by the client UI and the /api/ai route. */
export const AI_ACTIONS = ["summarize", "checklist", "fix", "continue"] as const;

export type AiAction = (typeof AI_ACTIONS)[number];

/** How the result is applied to the note when the user accepts it. */
export type AiApplyMode = "prepend" | "append" | "replace";

interface AiActionConfig {
  label: string;
  /** Short description used in the "/" menu. */
  hint: string;
  /** Label of the button that applies the result. */
  applyLabel: string;
  applyMode: AiApplyMode;
}

export const AI_ACTION_CONFIG: Record<AiAction, AiActionConfig> = {
  summarize: {
    label: "Summarize",
    hint: "A few bullet points at the top",
    applyLabel: "Add to top",
    applyMode: "prepend",
  },
  checklist: {
    label: "Make a checklist",
    hint: "Turn to-dos into tasks",
    applyLabel: "Add to note",
    applyMode: "append",
  },
  fix: {
    label: "Fix spelling",
    hint: "Spelling, grammar and punctuation",
    applyLabel: "Replace note",
    applyMode: "replace",
  },
  continue: {
    label: "Continue writing",
    hint: "Keep going in the same voice",
    applyLabel: "Add to note",
    applyMode: "append",
  },
};

/** Longest note (in characters of Markdown) sent to the model. */
export const AI_MAX_INPUT_CHARS = 24_000;

export interface AiRequestBody {
  action: AiAction;
  title: string;
  markdown: string;
}

export interface AiResponseBody {
  text?: string;
  error?: string;
}

export function isAiAction(value: unknown): value is AiAction {
  return typeof value === "string" && (AI_ACTIONS as readonly string[]).includes(value);
}
