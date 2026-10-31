/** The whole-note AI actions in the toolbar menu and the "/" menu. */
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
