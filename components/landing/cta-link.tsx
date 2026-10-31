import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const ctaLinkVariants = cva(
  "group inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-edge",
  {
    variants: {
      variant: {
        primary: "bg-brand text-brand-foreground hover:bg-brand-deep",
        accent: "border border-accent-edge/70 bg-accent text-ink hover:bg-accent-deep",
        secondary: "border border-line bg-surface text-ink shadow-card hover:bg-sunken",
      },
      size: {
        sm: "h-10 px-4 text-[13px]",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-[15px]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

interface CtaLinkProps extends VariantProps<typeof ctaLinkVariants> {
  href: string;
  children: React.ReactNode;
  className?: string;
  withArrow?: boolean;
}

export function CtaLink({ href, children, className, variant, size, withArrow }: CtaLinkProps) {
  return (
    <Link href={href} className={cn(ctaLinkVariants({ variant, size }), className)}>
      {children}
      {withArrow && (
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform group-hover:translate-x-0.5"
        />
      )}
    </Link>
  );
}
