import Image from "next/image";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import logoMark from "./assets/logo-mark.png";

interface LogoMarkProps {
  className?: string;
}

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <Image
      src={logoMark}
      alt={`${APP_NAME} logo`}
      sizes="48px"
      className={cn("size-6 shrink-0", className)}
    />
  );
}
