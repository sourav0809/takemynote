import { ExternalLink, Star } from "lucide-react";

import { BuyMeACoffeeIcon } from "@/components/brand/buy-me-a-coffee-icon";
import { GithubIcon } from "@/components/brand/github-icon";
import { buttonVariants } from "@/components/ui/button";
import { APP_NAME, BUY_ME_A_COFFEE_URL, GITHUB_URL } from "@/lib/constants";
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
        Your notes stay yours. They live in this browser (and in your account if you sign in to
        sync), and you can back them up or export them anytime from Data management.
      </p>
      <div className="flex flex-wrap gap-2">
        {/* GitHub's own dark, with a gold star; the ring keeps it visible in dark mode. */}
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className={cn(
            buttonVariants(),
            "group w-fit gap-2 bg-[#1f2328] text-white ring-1 ring-white/15 hover:bg-[#1f2328]/85"
          )}
        >
          <GithubIcon />
          Star on GitHub
          <Star className="size-3.5 fill-[#e3b341] text-[#e3b341] transition-transform group-hover:scale-125 group-hover:rotate-12 motion-reduce:transition-none" />
        </a>
        {/* Buy Me a Coffee's own yellow and dark text, like their official button. */}
        <a
          href={BUY_ME_A_COFFEE_URL}
          target="_blank"
          rel="noreferrer"
          className={cn(
            buttonVariants(),
            "w-fit gap-2 bg-[#FFDD00] text-[#0d0c22] hover:bg-[#FFDD00]/85"
          )}
        >
          <BuyMeACoffeeIcon />
          Buy me a coffee
          <ExternalLink className="size-3.5 opacity-60" />
        </a>
      </div>
      <p className="text-xs">
        {APP_NAME} is free, open source and has no ads. If it helps you, a star or a coffee keeps it going.
      </p>
    </div>
  );
}
