"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { CtaLink } from "@/components/landing/cta-link";
import { NAV_LINKS } from "@/components/landing/landing-content";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SCROLLED_OFFSET_PX = 8;
/** A section counts as "current" while it crosses the middle band of the viewport. */
const ACTIVE_SECTION_ROOT_MARGIN = "-45% 0px -50% 0px";

export function LandingNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > SCROLLED_OFFSET_PX);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map(({ id }) => document.getElementById(id)).filter(
      (section): section is HTMLElement => section !== null
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: ACTIVE_SECTION_ROOT_MARGIN }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-6">
      <nav
        aria-label="Main"
        className={cn(
          "mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 rounded-full border border-line bg-surface/75 pr-2 pl-4 backdrop-blur-xl transition-shadow",
          isScrolled ? "shadow-float" : "shadow-card"
        )}
      >
        <Link
          href={ROUTES.home}
          className="flex items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-edge"
        >
          <BrandLockup tone="light" className="h-8" priority />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={activeId === id ? "location" : undefined}
                className={cn(
                  "inline-flex h-9 items-center rounded-full px-3.5 text-[13px] font-semibold transition-colors",
                  activeId === id
                    ? "bg-accent text-ink"
                    : "text-muted hover:bg-sunken hover:text-ink"
                )}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <CtaLink href={ROUTES.notes} size="sm">
          Open app
        </CtaLink>
      </nav>
    </header>
  );
}
