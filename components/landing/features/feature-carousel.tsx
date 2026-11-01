"use client";

import { ArrowRight } from "lucide-react";
import { Children, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface FeatureCarouselProps {
  /** Grid classes used from `sm` up, where the cards sit in a bento grid. */
  gridClassName: string;
  children: React.ReactNode;
}

/**
 * Phones: the feature cards become a swipeable row (the next card peeks in),
 * with a "swipe" hint, a counter and dots. From `sm` up it's the usual grid.
 */
export function FeatureCarousel({ gridClassName, children }: FeatureCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = Children.toArray(children);
  const count = slides.length;

  // The card nearest the centre of the track is the active one.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => {
      const center = track.scrollLeft + track.clientWidth / 2;
      let nearest = 0;
      let nearestDistance = Infinity;
      Array.from(track.children).forEach((child, index) => {
        const card = child as HTMLElement;
        const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = index;
        }
      });
      setActiveIndex(nearest);
    };
    track.addEventListener("scroll", update, { passive: true });
    return () => track.removeEventListener("scroll", update);
  }, []);

  const goTo = (index: number) => {
    const card = trackRef.current?.children[index] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  const isLast = activeIndex === count - 1;

  return (
    <div>
      <div
        ref={trackRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Features"
        className={cn(
          // Phones: a full-bleed horizontal row that snaps card by card.
          "no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2",
          "*:w-[86%] *:shrink-0 *:snap-center",
          // sm and up: back to the bento grid.
          "sm:mx-0 sm:grid sm:snap-none sm:overflow-visible sm:px-0 sm:pb-0 sm:*:w-auto",
          gridClassName
        )}
      >
        {slides}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 sm:hidden">
        <p
          aria-hidden
          className="flex items-center gap-1.5 text-[13px] font-medium text-muted transition-opacity duration-300"
        >
          {isLast ? (
            "That’s everything"
          ) : (
            <>
              Swipe to see more
              <ArrowRight className="size-3.5 animate-[nudge-x_1.6s_ease-in-out_infinite] motion-reduce:animate-none" />
            </>
          )}
        </p>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-subtle tabular-nums" aria-live="polite">
            {activeIndex + 1} / {count}
          </span>
          <div className="flex items-center gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Show feature ${index + 1} of ${count}`}
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={() => goTo(index)}
                // A 24px tap target around a small dot.
                className="flex h-6 items-center"
              >
                <span
                  className={cn(
                    "block h-1.5 rounded-full transition-all duration-300",
                    index === activeIndex ? "w-5 bg-brand" : "w-1.5 bg-line-strong"
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
