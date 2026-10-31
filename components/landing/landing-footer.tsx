import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";
import { NAV_LINKS } from "@/components/landing/landing-content";
import { APP_NAME, ROUTES } from "@/lib/constants";

const LINK_CLASS = "text-[14px] text-muted transition-colors hover:text-ink";

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="overflow-hidden border-t border-line bg-canvas">
      <div className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <Link href={ROUTES.home} className="flex items-center gap-2">
              <LogoMark className="size-7" />
              <span className="text-[15px] leading-none font-semibold tracking-tight text-ink italic">
                {APP_NAME}
              </span>
            </Link>
            <p className="mt-4 text-[14px] leading-relaxed text-muted">
              A calm, private notebook that lives in your browser.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            <div>
              <p className="text-[13px] font-semibold text-ink">Product</p>
              <ul className="mt-3 flex flex-col gap-2.5">
                {NAV_LINKS.map(({ id, label }) => (
                  <li key={id}>
                    <a href={`#${id}`} className={LINK_CLASS}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-ink">App</p>
              <ul className="mt-3 flex flex-col gap-2.5">
                <li>
                  <Link href={ROUTES.notes} className={LINK_CLASS}>
                    Open notes
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <p
          aria-hidden
          className="mt-14 bg-linear-to-b from-line-strong to-transparent bg-clip-text text-center text-[18.5vw] leading-[0.8] font-semibold tracking-[-0.05em] text-transparent select-none lg:text-[200px]"
        >
          {APP_NAME.toLowerCase()}
        </p>

        <p className="border-t border-line py-6 text-center text-[13px] text-subtle">
          © {year} {APP_NAME}. Your notes stay yours.
        </p>
      </div>
    </footer>
  );
}
