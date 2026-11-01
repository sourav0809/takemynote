import { PageTransition } from "@/components/common/page-transition";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNav } from "@/components/landing/landing-nav";

interface LegalPageProps {
  /** Shown as a slash command in the badge, like the landing sections. */
  command: string;
  title: string;
  /** e.g. "November 1, 2026" */
  lastUpdated: string;
  /** "The short version": a few plain sentences above the full text. */
  summary: React.ReactNode;
  children: React.ReactNode;
}

/** Privacy Policy and Terms of Service: the landing page's nav, footer and look, with readable long text. */
export function LegalPage({ command, title, lastUpdated, summary, children }: LegalPageProps) {
  return (
    <PageTransition>
      <div className="landing min-h-dvh bg-canvas font-sans text-ink">
        <LandingNav />
        <main className="mx-auto max-w-3xl px-5 pt-32 pb-24 sm:px-8 sm:pt-40">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-[13px] font-medium text-ink-soft shadow-card">
            <span aria-hidden className="font-mono text-accent-edge">
              /
            </span>
            {command}
          </span>
          <h1 className="mt-5 text-[34px] leading-[1.1] font-medium tracking-[-0.025em] text-balance sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-muted">Last updated {lastUpdated}</p>

          <section
            aria-label="The short version"
            className="mt-10 rounded-2xl border border-sky-edge bg-sky-tint p-5 text-[15px] leading-relaxed text-ink-soft sm:p-6"
          >
            <p className="mb-2 text-[13px] font-semibold text-sky-ink">The short version</p>
            {summary}
          </section>

          <article
            className="prose mt-12 max-w-none text-[15px] leading-relaxed text-ink-soft prose-neutral
              prose-headings:font-medium prose-headings:tracking-[-0.02em] prose-headings:text-ink
              prose-h2:mt-12 prose-h2:mb-3 prose-h2:text-[22px] prose-strong:text-ink
              prose-a:font-medium prose-a:text-brand prose-a:no-underline hover:prose-a:underline
              prose-li:my-1 prose-li:marker:text-subtle"
          >
            {children}
          </article>
        </main>
        <LandingFooter />
      </div>
    </PageTransition>
  );
}
