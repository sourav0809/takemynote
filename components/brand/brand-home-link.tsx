import Link from "next/link";

import { BrandLockup } from "@/components/brand/brand-lockup";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface BrandHomeLinkProps {
  /** Logo height, e.g. "h-8". */
  className?: string;
}

/** The logo in the app's sidebars: takes you back to the landing page. */
export function BrandHomeLink({ className }: BrandHomeLinkProps) {
  return (
    <Link
      href={ROUTES.home}
      aria-label={`${APP_NAME} home`}
      className="-m-1 flex items-center rounded-lg p-1 transition-opacity outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <BrandLockup className={cn("h-7", className)} />
    </Link>
  );
}
