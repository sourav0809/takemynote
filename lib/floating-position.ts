import { computePosition, flip, shift } from "@floating-ui/dom";
import type { Editor } from "@tiptap/react";

interface UpdatePositionOptions {
  editor: Editor;
  element: HTMLElement;
  clientRect?: (() => DOMRect | null) | null;
}

export function updateFloatingPosition({
  editor,
  element,
  clientRect,
}: UpdatePositionOptions): void {
  const rect = clientRect?.();
  if (!rect) return;

  const virtualElement = { getBoundingClientRect: () => rect };

  void computePosition(virtualElement, element, {
    placement: "bottom-start",
    strategy: "absolute",
    middleware: [shift(), flip()],
  }).then(({ x, y, strategy }) => {
    Object.assign(element.style, {
      width: "max-content",
      position: strategy,
      left: `${x}px`,
      top: `${y}px`,
    });
  });

  void editor;
}
