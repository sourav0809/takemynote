import Image from "next/image";

import { activeLogo } from "@/components/brand/brand-assets";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface BrandLockupProps {
  /** "auto" follows dark mode; "light" always uses navy lettering (the landing page). */
  tone?: "auto" | "light";
  /** Height comes from the class (e.g. "h-7"); width follows the artwork. */
  className?: string;
  priority?: boolean;
}

/** The TakeMyNote logo: symbol + name. */
export function BrandLockup({ tone = "auto", className, priority }: BrandLockupProps) {
  const logo = activeLogo;
  const imageClass = cn("h-7 w-auto select-none", className);

  if (tone === "light") {
    return <Image src={logo.lockup} alt={APP_NAME} preload={priority} className={imageClass} />;
  }

  return (
    <>
      <Image src={logo.lockup} alt={APP_NAME} preload={priority} className={cn(imageClass, "dark:hidden")} />
      <Image
        src={logo.lockupDark}
        alt={APP_NAME}
        preload={priority}
        className={cn(imageClass, "hidden dark:block")}
      />
    </>
  );
}
