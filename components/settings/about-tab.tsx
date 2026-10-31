import { ExternalLink } from "lucide-react";

import { GithubIcon } from "@/components/brand/github-icon";
import { buttonVariants } from "@/components/ui/button";
import { APP_NAME, GITHUB_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AboutTab() {
  return (
    <div className="flex flex-col gap-4 text-sm text-muted-foreground">
      <p>
        {APP_NAME} is a calm, private notebook. Write with a rich editor and the / menu, keep
        things tidy with categories, pins and favourites, and ask AI for help only when you want
        it.
      </p>
      <p>
        Your notes stay yours. They live in this browser, and you can back them up or export them
        as Markdown anytime from Data management.
      </p>
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noreferrer"
        className={cn(buttonVariants({ variant: "outline" }), "w-fit gap-2")}
      >
        <GithubIcon />
        View source on GitHub
        <ExternalLink className="size-3.5 text-muted-foreground" />
      </a>
    </div>
  );
}
