"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";

import aiImage from "@/components/account/assets/auth-ai.webp";
import shareImage from "@/components/account/assets/auth-share.webp";
import syncImage from "@/components/account/assets/auth-sync.webp";
import templatesImage from "@/components/account/assets/auth-templates.webp";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { cn } from "@/lib/utils";

interface Slide {
  image: StaticImageData;
  /** First part of the headline, then the highlighted words. */
  title: string;
  highlight: string;
  text: string;
}

const SLIDES: Slide[] = [
  {
    image: syncImage,
    title: "Your notes, on",
    highlight: "every device.",
    text: "Sign in to sync. Without an account, everything stays in this browser.",
  },
  {
    image: shareImage,
    title: "Share a note with",
    highlight: "a link.",
    text: "Anyone with the link can read it, and you can turn it off any time.",
  },
  {
    image: aiImage,
    title: "AI that writes",
    highlight: "with you.",
    text: "Select a few lines and say what to change, with your own OpenAI, Google or Anthropic key.",
  },
  {
    image: templatesImage,
    title: "21 templates,",
    highlight: "ready to go.",
    text: "Planners, meeting notes, trips, budgets and more. All free.",
  },
];

const SLIDE_MS = 3_000;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
/** How far a swipe or drag must travel to change slides. */
const SWIPE_PX = 40;
/** Ignore further trackpad scrolling for a moment after it changes a slide. */
const WHEEL_COOLDOWN_MS = 600;

/**
 * The picture side of the sign-in dialog: a few calm slides about what an
 * account adds. Moves on every 3 seconds (not for people who prefer reduced
 * motion); swipe, drag, scroll sideways, use ← → or the dots to move yourself.
 * On phones it's a short banner with the pictures only.
 */
export function AuthShowcase({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const lastWheelAt = useRef(0);

  // Re-armed whenever the slide changes, so a manual move never jumps straight on.
  useEffect(() => {
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;
    const timer = window.setTimeout(() => setIndex((current) => (current + 1) % SLIDES.length), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [index]);

  const go = (step: number) => setIndex((current) => (current + step + SLIDES.length) % SLIDES.length);

  const onPointerDown = (event: React.PointerEvent) => {
    dragStartX.current = event.clientX;
  };
  const onPointerUp = (event: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const distance = event.clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(distance) >= SWIPE_PX) go(distance < 0 ? 1 : -1);
  };
  // Sideways trackpad scrolling moves one slide at a time.
  const onWheel = (event: React.WheelEvent) => {
    if (Math.abs(event.deltaX) < Math.abs(event.deltaY) || Math.abs(event.deltaX) < 10) return;
    const now = Date.now();
    if (now - lastWheelAt.current < WHEEL_COOLDOWN_MS) return;
    lastWheelAt.current = now;
    go(event.deltaX > 0 ? 1 : -1);
  };
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") go(1);
    if (event.key === "ArrowLeft") go(-1);
  };

  const slide = SLIDES[index];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="What an account adds"
      tabIndex={0}
      className={cn("relative cursor-grab touch-pan-y overflow-hidden outline-none select-none active:cursor-grabbing", className)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (dragStartX.current = null)}
      onWheel={onWheel}
      onKeyDown={onKeyDown}
    >
      {SLIDES.map((item, itemIndex) => (
        <Image
          key={item.highlight}
          src={item.image}
          alt=""
          fill
          placeholder="blur"
          sizes="(min-width: 640px) 420px, 100vw"
          preload={itemIndex === 0}
          draggable={false}
          className={cn(
            "object-cover transition-opacity duration-1000 ease-out motion-reduce:transition-none",
            "object-[50%_72%] sm:object-bottom",
            itemIndex === index ? "opacity-100" : "opacity-0"
          )}
        />
      ))}
      <div className="absolute inset-0 bg-linear-to-b from-white/55 via-white/10 to-transparent" />

      <div className="relative flex h-full flex-col justify-between p-5 sm:p-9">
        {/* Natural width: flex columns would otherwise stretch the logo. */}
        <BrandLockup tone="light" className="h-7 w-auto self-start sm:h-8" />

        <div className="hidden max-w-[18rem] sm:block">
          <div key={index} className="duration-500 animate-in fade-in-0 slide-in-from-bottom-2 motion-reduce:animate-none">
            <p className="text-[26px] leading-[1.15] font-semibold tracking-[-0.02em] text-[#0f172a]">
              {slide.title}{" "}
              {/* The pictures are always light, so the highlight doesn't follow the theme. */}
              <span className="box-decoration-clone bg-[linear-gradient(transparent_62%,#cfe4f7_62%)]">{slide.highlight}</span>
            </p>
            <p className="mt-3 min-h-[3lh] text-sm leading-relaxed text-[#334155]">{slide.text}</p>
          </div>

          <div className="mt-5 flex items-center gap-1.5" role="group" aria-label="Slides">
            {SLIDES.map((item, dotIndex) => (
              <button
                key={item.highlight}
                type="button"
                aria-label={`Show slide ${dotIndex + 1} of ${SLIDES.length}`}
                aria-current={dotIndex === index ? "true" : undefined}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => setIndex(dotIndex)}
                // A comfortable click target around a small dot.
                className="flex h-5 items-center outline-none focus-visible:ring-2 focus-visible:ring-[#1d6fb8]"
              >
                <span
                  className={cn(
                    "block h-1.5 rounded-full transition-all duration-300",
                    dotIndex === index ? "w-6 bg-[#1d6fb8]" : "w-1.5 bg-[#0f172a]/25 hover:bg-[#0f172a]/40"
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
