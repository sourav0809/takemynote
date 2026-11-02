import { PRODUCT_HUNT_BADGE_URL, PRODUCT_HUNT_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Product Hunt's "Featured" badge, linking to the launch. The landing is always light, so it uses the light badge. */
export function ProductHuntBadge({ className }: { className?: string }) {
  return (
    <a
      href={PRODUCT_HUNT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex shrink-0 rounded-[10px] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-edge",
        className
      )}
    >
      {/* Product Hunt serves an SVG with live counts; next/image would neither optimize nor refresh it. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={PRODUCT_HUNT_BADGE_URL}
        alt="TakeMyNote - A calm notebook that works without an account | Product Hunt"
        width={250}
        height={54}
        className="h-12 w-auto"
      />
    </a>
  );
}
