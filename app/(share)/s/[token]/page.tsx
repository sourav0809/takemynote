import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandLockup } from "@/components/brand/brand-lockup";
import { APP_NAME } from "@/lib/constants";
import { formatFullDate, getNoteDisplayTitle, getNoteExcerpt } from "@/lib/note-utils";
import { renderNoteHtml } from "@/lib/server/render-note";
import { getSharedNote, registerShareView } from "@/lib/server/shared-note";
import type { NoteContent } from "@/types/note";

type Props = PageProps<"/s/[token]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const shared = await getSharedNote((await params).token);
  if (!shared) return { title: "Note not available", robots: { index: false, follow: false } };
  const title = getNoteDisplayTitle(shared.title);
  const description = getNoteExcerpt(shared.content as unknown as NoteContent) || `A note shared with ${APP_NAME}.`;
  return {
    title,
    description,
    // Shared by link only: never listed in search engines.
    robots: { index: false, follow: false },
    openGraph: { type: "article", title, description, siteName: APP_NAME },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** A note shared with "Anyone with the link can view": read-only, no app JavaScript. */
export default async function SharedNotePage({ params }: Props) {
  const { token } = await params;
  const shared = await getSharedNote(token);
  if (!shared) notFound();

  const isAllowed = await registerShareView(token, shared.kind);
  if (!isAllowed) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-6 text-sm text-muted-foreground">
        Too many requests. Please try again in a minute.
      </main>
    );
  }

  const html = renderNoteHtml(shared.content);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <Link href="/" aria-label={`${APP_NAME} home`} className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <BrandLockup className="h-7" />
        </Link>
        <Link
          href="/notes"
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
        >
          Start writing
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-5 pt-6 pb-20 sm:px-8 sm:pt-12">
        <h1 className="text-3xl leading-tight font-bold tracking-tight text-balance sm:text-4xl">
          {getNoteDisplayTitle(shared.title)}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Updated {formatFullDate(shared.updatedAt.toISOString())}</p>
        <article
          className="shared-note prose prose-neutral mt-8 max-w-none dark:prose-invert prose-headings:tracking-tight prose-a:text-primary prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>

      <footer className="border-t border-border">
        <p className="mx-auto max-w-3xl px-5 py-6 text-sm text-muted-foreground sm:px-8">
          Made with{" "}
          <Link href="/" className="font-medium text-foreground hover:underline">
            {APP_NAME}
          </Link>
          , a calm, private notebook.{" "}
          <Link href="/notes" className="font-medium text-primary hover:underline">
            Start writing free
          </Link>
        </p>
      </footer>
    </div>
  );
}
