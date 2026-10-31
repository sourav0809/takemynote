import type { LucideIcon } from "lucide-react";
import { Lock, Slash, Sparkles } from "lucide-react";

import { LogoMark } from "@/components/brand/logo-mark";
import { APP_NAME } from "@/lib/constants";

const HIGHLIGHTS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Lock,
    title: "Private by default",
    text: "Notes are saved in this browser. No account, no sign-up.",
  },
  {
    icon: Slash,
    title: "Type / to format",
    text: "Headings, task lists, quotes and code without leaving the keyboard.",
  },
  {
    icon: Sparkles,
    title: "AI when you ask",
    text: "Select text and tell AI what to change, with your own key.",
  },
];

export function WelcomeStep() {
  return (
    <div>
      <LogoMark className="size-11" />
      <h2 className="mt-5 text-2xl font-semibold tracking-tight">Welcome to {APP_NAME}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        A calm place to write things down. A few quick choices and you’re in.
      </p>
      <ul className="mt-6 flex flex-col gap-4">
        {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" />
            </span>
            <span>
              <span className="block text-sm font-medium">{title}</span>
              <span className="block text-sm text-muted-foreground">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
