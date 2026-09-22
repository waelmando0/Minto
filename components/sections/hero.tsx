import Image from "next/image";

import { HomeScreen } from "@/components/app-ui/screens";
import { PhoneFrame } from "@/components/phone-frame";
import { ArtStage, Fog } from "@/components/primitives";
import { HeroParallax } from "@/components/sections/hero-phone";
import { StoreButtons } from "@/components/store-buttons";
import { Container } from "@/components/container";
import { hero, images } from "@/lib/content";

/*
 * The entrance uses CSS keyframes (tw-animate-css) rather than JS, so the
 * headline paints on first render without waiting for hydration.
 */
const enter = "animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-700 ease-out";

export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#e2ddf4_0%,#ece9f8_28%,#f8f7fc_55%,#ffffff_75%)] pt-32 sm:pt-40"
    >
      <Container className="relative z-10 flex flex-col items-center text-center">
        <h1
          id="hero-title"
          className={`${enter} max-w-[17ch] text-[clamp(2.5rem,5.4vw,4.4rem)] leading-[1.04] font-medium tracking-[-0.05em] text-balance text-[#111]`}
        >
          {hero.title}
        </h1>
        <p className={`${enter} mt-5 max-w-[54ch] text-[15px] leading-relaxed text-[#55555a] delay-100`}>
          {hero.description}
        </p>
        <StoreButtons className={`${enter} mt-7 delay-200`} />
      </Container>

      <ArtStage minWidth="sm" className="mt-10 aspect-[1179/558] sm:mt-14">
        <Image
          src={images.heroHills}
          alt=""
          fill
          preload
          quality={90}
          sizes="(min-width: 1280px) 1280px, (min-width: 820px) 100vw, 820px"
          className="object-cover [mask-image:linear-gradient(to_bottom,transparent,#000_22%)]"
        />
        {/* The phone must cover the centre of the plate: its width is locked to the art board. */}
        <HeroParallax className="absolute top-[3%] left-1/2 w-[32%] -translate-x-1/2">
          <div className="animate-in fade-in slide-in-from-bottom-16 fill-mode-both delay-300 duration-1000 ease-out">
            <PhoneFrame label="The Minto home screen showing a total balance of $36,862.76">
              <HomeScreen withTabBar={false} />
            </PhoneFrame>
          </div>
        </HeroParallax>
        <Fog className="h-[46%]" />
      </ArtStage>
    </section>
  );
}
