import { createExtension } from "@blocknote/core";
import { Plugin, PluginKey } from "prosemirror-state";

interface TypographyRule {
  /** Matched against the block text before the cursor plus the typed char. */
  find: RegExp;
  replace: string;
}

// Characters that can precede an opening quote.
const QUOTE_PREFIX = "(?:^|[\\s{[(<'\"\\u2018\\u201C])";

// Mirrors the replacements of the Tiptap Typography extension this app used
// before moving to BlockNote. A capture group, when present, marks the part of
// the match that gets replaced; otherwise the whole match is replaced.
const TYPOGRAPHY_RULES: TypographyRule[] = [
  { find: /--$/, replace: "—" },
  { find: /\.\.\.$/, replace: "…" },
  { find: /<-$/, replace: "←" },
  { find: /->$/, replace: "→" },
  { find: /<<$/, replace: "«" },
  { find: />>$/, replace: "»" },
  { find: /!=$/, replace: "≠" },
  { find: /\+\/-$/, replace: "±" },
  { find: /\(c\)$/i, replace: "©" },
  { find: /\(r\)$/i, replace: "®" },
  { find: /\(tm\)$/i, replace: "™" },
  { find: /\(sm\)$/i, replace: "℠" },
  { find: /(?:^|\s)(1\/2)\s$/, replace: "½ " },
  { find: /(?:^|\s)(1\/4)\s$/, replace: "¼ " },
  { find: /(?:^|\s)(3\/4)\s$/, replace: "¾ " },
  { find: /\^2$/, replace: "²" },
  { find: /\^3$/, replace: "³" },
  { find: new RegExp(`${QUOTE_PREFIX}(")$`), replace: "“" },
  { find: /"$/, replace: "”" },
  { find: new RegExp(`${QUOTE_PREFIX}(')$`), replace: "‘" },
  { find: /'$/, replace: "’" },
];

const MAX_LOOKBEHIND = 8;
const CODE_BLOCK_TYPE = "codeBlock";
const typographyPluginKey = new PluginKey("noteTypography");

const typographyPlugin = new Plugin({
  key: typographyPluginKey,
  props: {
    handleTextInput(view, from, to, text) {
      const $from = view.state.doc.resolve(from);
      const isInCode =
        $from.parent.type.spec.code ||
        $from.parent.type.name === CODE_BLOCK_TYPE ||
        $from.marks().some((mark) => mark.type.spec.code);
      if (isInCode) return false;

      const textBefore =
        $from.parent.textBetween(
          Math.max(0, $from.parentOffset - MAX_LOOKBEHIND),
          $from.parentOffset,
          undefined,
          "￼"
        ) + text;

      for (const rule of TYPOGRAPHY_RULES) {
        const match = rule.find.exec(textBefore);
        if (!match) continue;

        const replacedText =
          match[1] === undefined
            ? match[0]
            : textBefore.slice(match.index + match[0].indexOf(match[1]));
        const start = from - (replacedText.length - text.length);
        view.dispatch(view.state.tr.insertText(rule.replace, start, to));
        return true;
      }
      return false;
    },
  },
});

export const typographyExtension = createExtension({
  key: "noteTypography",
  prosemirrorPlugins: [typographyPlugin],
});
