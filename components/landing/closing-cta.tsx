import Image from "next/image";
import { CtaLink } from "@/components/landing/cta-link";
import { APP_NAME, ROUTES } from "@/lib/constants";
import closingSky from "./assets/closing-sky.webp";

const SKY_IMAGE_QUALITY = 86;

export function ClosingCta() {
  return (
    <section className="mx-auto max-w-6xl px-3 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
      <div className="reveal relative isolate flex min-h-[380px] overflow-hidden rounded-[28px] sm:rounded-[32px] border border-line shadow-card sm:min-h-[420px] lg:min-h-[460px]">
        <Image
          src={closingSky}
          alt=""
          fill
          placeholder="blur"
          quality={SKY_IMAGE_QUALITY}
          sizes="(min-width: 1152px) 1152px, 100vw"
          className="-z-10 object-cover object-[85%_100%] sm:object-bottom"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-white/60 via-white/25 to-transparent sm:bg-linear-to-r sm:from-white/55 sm:via-white/15" />

        <div className="flex max-w-lg flex-col items-start p-7 sm:p-12 lg:p-16">
          <h2 className="text-[34px] leading-[1.1] font-medium tracking-[-0.025em] text-balance text-ink sm:text-5xl">
            Your next idea needs a <span className="marker">home.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-pretty text-ink-soft sm:text-lg">
            Open {APP_NAME} and start typing. It’s ready when you are.
          </p>
          <CtaLink href={ROUTES.notes} size="lg" withArrow className="mt-8">
            Start writing
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
