import {
  BasicTextStyleButton,
  FormattingToolbar,
  FormattingToolbarController,
  getFormattingToolbarItems,
  useComponentsContext,
} from "@blocknote/react";
import { flip, offset, shift } from "@floating-ui/react";
import { Sparkles } from "lucide-react";
import { useCallback, useMemo } from "react";

import { usePlatformModifierKeys } from "@/hooks/use-platform-modifier-key";

const INSERT_INLINE_CODE_AFTER_KEY = "strikeStyleButton";
const TOOLBAR_OFFSET_PX = 10;

/** "✦ Ask AI" at the start of the selection toolbar. */
function AskAiButton({ onClick }: { onClick: () => void }) {
  const Components = useComponentsContext()!;
  const { mod } = usePlatformModifierKeys();

  return (
    <Components.FormattingToolbar.Button
      className="ask-ai-button"
      mainTooltip="Ask AI to edit"
      secondaryTooltip={`${mod}+J`}
      icon={<Sparkles size={16} />}
      onClick={onClick}
    >
      Ask AI
    </Components.FormattingToolbar.Button>
  );
}

// BlockNote's default selection toolbar with "Ask AI" first, plus an
// inline-code button, which the app's previous selection bubble menu offered.
function NoteFormattingToolbar({ onAskAi }: { onAskAi: () => void }) {
  const items = getFormattingToolbarItems();
  const insertIndex = items.findIndex((item) => item.key === INSERT_INLINE_CODE_AFTER_KEY) + 1;
  items.splice(
    insertIndex,
    0,
    <BasicTextStyleButton key="codeStyleButton" basicTextStyle="code" />
  );

  return (
    <FormattingToolbar>
      <AskAiButton key="askAiButton" onClick={onAskAi} />
      {items}
    </FormattingToolbar>
  );
}

interface NoteFormattingToolbarControllerProps {
  /** Visible editor area; the toolbar flips below the selection rather than
   *  overflowing it and covering the fixed toolbar above. */
  boundary: HTMLElement | null;
  /** Opens the inline AI panel for the selection. Keep it stable. */
  onAskAi: () => void;
}

export function NoteFormattingToolbarController({
  boundary,
  onAskAi,
}: NoteFormattingToolbarControllerProps) {
  const floatingUIOptions = useMemo(
    () => ({
      useFloatingOptions: {
        middleware: [
          offset(TOOLBAR_OFFSET_PX),
          shift(boundary ? { boundary } : undefined),
          flip(boundary ? { boundary } : undefined),
        ],
      },
    }),
    [boundary]
  );

  const Toolbar = useCallback(() => <NoteFormattingToolbar onAskAi={onAskAi} />, [onAskAi]);

  return (
    <FormattingToolbarController
      formattingToolbar={Toolbar}
      floatingUIOptions={floatingUIOptions}
    />
  );
}
