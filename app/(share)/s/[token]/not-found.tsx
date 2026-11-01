import Link from "next/link";

import { BrandLockup } from "@/components/brand/brand-lockup";

/** The link was turned off, or the note was deleted or moved to the trash. */
export default function SharedNoteNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <BrandLockup className="h-8" />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">This note isn’t available</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The owner may have stopped sharing it, or it was deleted.
        </p>
      </div>
      <Link href="/" className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/85">
        Go to TakeMyNote
      </Link>
    </main>
  );
}
