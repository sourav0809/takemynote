import Image from "next/image";

import { activeLogo } from "@/components/brand/brand-assets";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
}

/** The logo symbol on its own (no name). */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <Image
      src={activeLogo.mark}
      alt={`${APP_NAME} logo`}
      sizes="64px"
      className={cn("size-6 shrink-0", className)}
    />
  );
}
