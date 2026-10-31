import {
  BasicTextStyleButton,
  FormattingToolbar,
  FormattingToolbarController,
  getFormattingToolbarItems,
} from "@blocknote/react";
import { flip, offset, shift } from "@floating-ui/react";
import { useMemo } from "react";

const INSERT_INLINE_CODE_AFTER_KEY = "strikeStyleButton";
const TOOLBAR_OFFSET_PX = 10;

// BlockNote's default selection toolbar plus an inline-code button, which the
// app's previous selection bubble menu offered.
function NoteFormattingToolbar() {
  const items = getFormattingToolbarItems();
  const insertIndex = items.findIndex((item) => item.key === INSERT_INLINE_CODE_AFTER_KEY) + 1;
  items.splice(
    insertIndex,
    0,
    <BasicTextStyleButton key="codeStyleButton" basicTextStyle="code" />
  );

  return <FormattingToolbar>{items}</FormattingToolbar>;
}

interface NoteFormattingToolbarControllerProps {
  /** Visible editor area; the toolbar flips below the selection rather than
   *  overflowing it and covering the fixed toolbar above. */
  boundary: HTMLElement | null;
}

export function NoteFormattingToolbarController({
  boundary,
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

  return (
    <FormattingToolbarController
      formattingToolbar={NoteFormattingToolbar}
      floatingUIOptions={floatingUIOptions}
    />
  );
}
