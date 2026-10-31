import type { DefaultSuggestionItem } from "@blocknote/core/extensions";
import { getDefaultSlashMenuItems } from "@blocknote/core";
import type { DefaultReactSuggestionItem } from "@blocknote/react";
import type { LucideIcon } from "lucide-react";
import {
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  List,
  ListCollapse,
  ListOrdered,
  ListTodo,
  Minus,
  Quote,
  Smile,
  SquareCode,
  Table2,
  Type,
} from "lucide-react";

import { AI_ACTION_ICONS } from "@/components/editor/ai/ai-action-icons";
import { AI_ACTION_CONFIG, AI_ACTIONS, type AiAction } from "@/lib/ai/ai-actions";
import type { NoteBlockEditor } from "@/lib/editor/note-editor-schema";

export const AI_GROUP = "Ask AI";

type SlashKey = DefaultSuggestionItem["key"];

interface CuratedItem {
  icon: LucideIcon;
  title: string;
  subtext: string;
  group: string;
}

/**
 * The blocks offered in "/" (BlockNote key → our copy and icon), in display
 * order. Rarely used extras (H4–H6, toggle headings, uploads) are left out to
 * keep the menu short.
 */
const CURATED_ITEMS: Partial<Record<SlashKey, CuratedItem>> = {
  paragraph: { icon: Type, title: "Text", subtext: "Plain paragraph", group: "Basics" },
  heading: { icon: Heading1, title: "Heading 1", subtext: "Big section title", group: "Basics" },
  heading_2: { icon: Heading2, title: "Heading 2", subtext: "Medium section title", group: "Basics" },
  heading_3: { icon: Heading3, title: "Heading 3", subtext: "Small section title", group: "Basics" },
  bullet_list: { icon: List, title: "Bullet list", subtext: "Simple list", group: "Lists" },
  numbered_list: { icon: ListOrdered, title: "Numbered list", subtext: "Steps in order", group: "Lists" },
  check_list: { icon: ListTodo, title: "Task list", subtext: "Track things to do", group: "Lists" },
  toggle_list: { icon: ListCollapse, title: "Toggle list", subtext: "Hide details inside", group: "Lists" },
  quote: { icon: Quote, title: "Quote", subtext: "Call out a line", group: "Blocks" },
  code_block: { icon: SquareCode, title: "Code", subtext: "Snippet with highlighting", group: "Blocks" },
  table: { icon: Table2, title: "Table", subtext: "Rows and columns", group: "Blocks" },
  image: { icon: ImageIcon, title: "Image", subtext: "Embed from a link", group: "Blocks" },
  divider: { icon: Minus, title: "Divider", subtext: "Separate sections", group: "Blocks" },
  emoji: { icon: Smile, title: "Emoji", subtext: "Search and insert", group: "Blocks" },
};

const CURATED_ORDER = Object.keys(CURATED_ITEMS) as SlashKey[];

export interface SlashMenuItem extends DefaultReactSuggestionItem {
  /** Lucide icon component, rendered by our own menu. */
  lucideIcon: LucideIcon;
  isAi?: boolean;
}

export function getSlashMenuItems(
  editor: NoteBlockEditor,
  onAiAction: (action: AiAction) => void
): SlashMenuItem[] {
  const aiItems: SlashMenuItem[] = AI_ACTIONS.map((action) => ({
    title: AI_ACTION_CONFIG[action].label,
    subtext: AI_ACTION_CONFIG[action].hint,
    group: AI_GROUP,
    aliases: ["ai", action],
    lucideIcon: AI_ACTION_ICONS[action],
    isAi: true,
    onItemClick: () => onAiAction(action),
  }));

  const blockItems = getDefaultSlashMenuItems(editor)
    .filter((item) => item.key in CURATED_ITEMS)
    .sort((a, b) => CURATED_ORDER.indexOf(a.key) - CURATED_ORDER.indexOf(b.key))
    .map((item): SlashMenuItem => {
      const curated = CURATED_ITEMS[item.key]!;
      return {
        title: curated.title,
        subtext: curated.subtext,
        group: curated.group,
        badge: item.badge,
        aliases: [...(item.aliases ?? []), item.title.toLowerCase()],
        lucideIcon: curated.icon,
        onItemClick: item.onItemClick,
      };
    });

  return [...blockItems, ...aiItems];
}
