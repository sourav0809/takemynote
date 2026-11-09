import type { LucideIcon } from "lucide-react";

import type { StepArtKind } from "@/components/landing/how-it-works-art";
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
  /** Phones show the icon on a timeline; larger screens show the picture. */
  icon: LucideIcon;
  art: StepArtKind;
  title: string;
  description: string;
}

export const STEPS: Step[] = [
  {
    icon: PencilLine,
    art: "write",
    title: "Open it and write",
    description: "No account and nothing to install. Your first note is one tap away.",
  },
  {
    icon: Slash,
    art: "slash",
    title: "Type / to format",
    description: "Headings, task lists, quotes and code blocks, without leaving the keyboard.",
  },
  {
    icon: FolderOpen,
    art: "tidy",
    title: "Keep it tidy",
    description: "Sort notes into categories, pin the important ones and star favourites.",
  },
  {
    icon: Download,
    art: "backup",
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
    answer:
      "No. Open the app and start writing, no sign-up needed. If you want your notes on more than one device, you can sign in with Google to sync them. It’s optional.",
  },
  {
    question: "Where are my notes stored?",
    answer:
      "In your own browser, on your device. If you sign in, they’re also saved to your account so they sync across your devices. When you ask AI for help, the text you choose goes straight to the AI provider you picked, using your own key.",
  },
  {
    question: "Does it have AI?",
    answer:
      "Yes, only when you ask, with your own OpenAI, Google or Anthropic key. Select a few lines and type what you want (“add a few bullets and fix grammar”), or summarize, make a checklist and keep writing. Your key is encrypted and never leaves your browser except to go to that provider.",
  },
  {
    question: "What if I clear my browser data?",
    answer:
      "Without an account, clearing site data removes your notes too, so make a backup from Settings → Data first. If you’re signed in, your notes are safe in your account and come back when you sign in again.",
  },
  {
    question: "Can I use it on more than one device?",
    answer:
      "Yes. Sign in with Google on each device and your notes, categories and settings stay in sync. Edits save on your device first, so it keeps working offline and catches up when you’re back. Prefer no account? Move notes with a backup file instead.",
  },
  {
    question: "Can I share a note?",
    answer:
      "Yes, no account needed. Open a note, choose Share and turn on the link. Anyone with it can read the note (not edit it), it updates as you write, and you can turn the link off any time.",
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
    answer:
      "Yes. TakeMyNote is free and open source under the MIT license. The full source code is on GitHub, linked at the bottom of this page.",
  },
  {
    question: "Can I export my notes?",
    answer:
      "Yes. Download any note as PDF, Markdown, plain text, HTML or JSON, or print it. A full backup of everything is one JSON file you can restore anywhere.",
  },
];
