import type { LucideIcon } from "lucide-react";
import { Download, FolderOpen, PencilLine, Slash } from "lucide-react";

export const LANDING_SECTION_IDS = {
  features: "features",
  howItWorks: "how-it-works",
  faq: "faq",
} as const;

export interface NavLink {
  id: string;
  label: string;
}

export const NAV_LINKS: NavLink[] = [
  { id: LANDING_SECTION_IDS.features, label: "Features" },
  { id: LANDING_SECTION_IDS.howItWorks, label: "How it works" },
  { id: LANDING_SECTION_IDS.faq, label: "FAQ" },
];

/** A few of the blocks offered by the editor's "/" menu (components/editor/slash-menu). */
export const SLASH_PREVIEW_ITEMS = [
  { label: "Heading 1", hint: "Big section title" },
  { label: "Task list", hint: "Track things to do" },
  { label: "Quote", hint: "Call out a line" },
  { label: "Code block", hint: "Snippets, formatted" },
];

export interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const STEPS: Step[] = [
  {
    icon: PencilLine,
    title: "Open it and write",
    description: "No account and nothing to install. Your first note is one tap away.",
  },
  {
    icon: Slash,
    title: "Type / to format",
    description: "Headings, task lists, quotes and code blocks, without leaving the keyboard.",
  },
  {
    icon: FolderOpen,
    title: "Keep it tidy",
    description: "Sort notes into categories, pin the important ones and star favourites.",
  },
  {
    icon: Download,
    title: "Back it up",
    description: "Save everything to one backup file, or export a single note as Markdown.",
  },
];

export interface Fact {
  value: string;
  label: string;
}

export const FACTS: Fact[] = [
  { value: "0", label: "sign-ups needed" },
  { value: "14", label: "block types via /" },
  { value: ".md", label: "export per note" },
  { value: ".json", label: "one-file backup" },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Do I need an account?",
    answer: "No. Open the app and start writing. There is no sign-up, email or password.",
  },
  {
    question: "Where are my notes stored?",
    answer:
      "In your own browser, on your device. Notes are never uploaded or synced. The only exception is when you ask AI for help: that one note is sent to OpenAI to write the suggestion.",
  },
  {
    question: "Does it have AI?",
    answer:
      "Yes, only when you ask. Summarize a note, turn it into a checklist, fix spelling or keep writing, then choose whether to add the result.",
  },
  {
    question: "What if I clear my browser data?",
    answer:
      "Clearing site data removes your notes too. Make a backup from Settings → Data first, and you can restore it anytime.",
  },
  {
    question: "Can I move my notes to another device?",
    answer:
      "Yes. Create a backup file on one device, then use Import Backup on the other. Notes, categories and preferences all come along.",
  },
  {
    question: "Are there templates?",
    answer:
      "Yes, 21 and all free: daily and weekly planners, meeting notes, project plans, OKRs, a habit tracker, journal, trip planner, budget and more. Pick one when you start a note, or just write.",
  },
  {
    question: "Can I change how it looks?",
    answer:
      "Yes. Choose between two layouts, where your text sits (left, centered or full width), and light or dark mode, all from Settings.",
  },
  {
    question: "Is TakeMyNote open source?",
    answer: "Yes. The full source code is on GitHub, linked at the bottom of this page.",
  },
  {
    question: "Can I export my notes?",
    answer:
      "Every note can be downloaded as a Markdown (.md) file, and the full backup is plain JSON you can keep anywhere.",
  },
];
