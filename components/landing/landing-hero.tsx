import Image from "next/image";
import { CtaLink } from "@/components/landing/cta-link";
import { ProductStage } from "@/components/landing/stage/product-stage";
import { ROUTES } from "@/lib/constants";
import heroDunes from "./assets/hero-dunes.webp";

const SKY_IMAGE_QUALITY = 86;

export function LandingHero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Height grows with width so the dunes stay level just under the button. */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[500px] sm:h-[575px] lg:h-[calc(469px_+_14vw)]">
        <Image
          src={heroDunes}
          alt=""
          fill
          preload
          placeholder="blur"
          quality={SKY_IMAGE_QUALITY}
          sizes="100vw"
          className="object-cover object-bottom"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/6 bg-linear-to-b from-transparent to-canvas sm:h-1/4" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pt-32 text-center sm:px-6 sm:pt-40 lg:px-8 lg:pt-36">
        <h1 className="animate-rise text-[44px] leading-[0.98] font-normal tracking-[-0.035em] text-balance text-ink sm:text-6xl lg:text-[76px]">
          Write freely.
          <br />
          Keep it <span className="marker">private.</span>
        </h1>
        <p className="mt-5 max-w-2xl animate-rise text-lg leading-relaxed text-pretty text-muted sm:mt-6 sm:text-xl">
          A calm notebook with AI on tap. No sign‑up, nothing to install.
        </p>
        <CtaLink href={ROUTES.notes} size="lg" withArrow className="mt-8 animate-rise sm:mt-9">
          Start writing
        </CtaLink>
      </div>

      <div className="mx-auto mt-12 max-w-6xl animate-rise px-3 [perspective:1400px] [animation-delay:150ms] sm:mt-14 sm:px-6 lg:mt-16 lg:px-8">
        <div className="stage-tilt">
          <ProductStage />
        </div>
      </div>
    </section>
  );
}
