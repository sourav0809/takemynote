import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
}

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-6", className)}
      role="img"
      aria-label="TakeMyNote logo"
    >
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path
        d="M9.5 8.5H19L22.5 12V23.5H9.5V8.5Z"
        className="fill-primary-foreground/15"
      />
      <path
        d="M9.5 8.5H19L22.5 12V23.5H9.5V8.5Z"
        stroke="currentColor"
        className="text-primary-foreground"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M19 8.5V12H22.5"
        stroke="currentColor"
        className="text-primary-foreground"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 15.5H19.5"
        stroke="currentColor"
        className="text-primary-foreground"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M12.5 18.5H19.5"
        stroke="currentColor"
        className="text-primary-foreground"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M12.5 21H16.5"
        stroke="currentColor"
        className="text-primary-foreground"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
