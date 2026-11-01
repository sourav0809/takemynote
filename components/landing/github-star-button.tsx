import { Star } from "lucide-react";

import { GithubIcon } from "@/components/brand/github-icon";
import { GITHUB_URL } from "@/lib/constants";
import { formatStarCount, getGithubStars, MIN_STARS_TO_SHOW } from "@/lib/github";
import { cn } from "@/lib/utils";

/**
 * GitHub-style "Star" split button. On hover the star fills and turns once.
 * The live count only appears once it's worth showing.
 */
export async function GithubStarButton({ className }: { className?: string }) {
  const stars = await getGithubStars();
  const showCount = stars !== null && stars >= MIN_STARS_TO_SHOW;

  return (
    <a
      href={GITHUB_URL}
      target="_blank"
      rel="noreferrer"
      aria-label={showCount ? `Star TakeMyNote on GitHub (${stars} stars)` : "Star TakeMyNote on GitHub"}
      className={cn(
        "group inline-flex h-10 items-stretch overflow-hidden rounded-full border border-line bg-surface text-[14px] font-semibold text-ink shadow-card transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-float focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none",
        className
      )}
    >
      <span className="flex items-center gap-2 pr-3.5 pl-3">
        <GithubIcon className="size-4" />
        Star on GitHub
        <Star
          aria-hidden
          className="size-4 text-subtle transition-[color,fill,rotate,scale] duration-500 ease-out group-hover:scale-110 group-hover:rotate-[72deg] group-hover:fill-amber-400 group-hover:text-amber-500 motion-reduce:transition-none"
        />
      </span>
      {showCount && (
        <span className="flex items-center border-l border-line bg-canvas px-3 text-[13px] tabular-nums text-ink-soft">
          {formatStarCount(stars)}
        </span>
      )}
    </a>
  );
}
