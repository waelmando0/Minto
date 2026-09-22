import Image from "next/image";

import { InvestmentScreen } from "@/components/app-ui/screens";
import { MintoMark } from "@/components/logo";
import { PhoneFrame } from "@/components/phone-frame";
import { Container } from "@/components/container";
import { Reveal } from "@/components/motion/reveal";
import { images, insights } from "@/lib/content";

export function Insights() {
  return (
    <section
      id="insights"
      aria-labelledby="insights-title"
      className="relative overflow-hidden bg-[radial-gradient(50%_40%_at_8%_10%,#e7ecf2_0%,transparent_70%),linear-gradient(180deg,#f5f1ec_0%,#f3e6db_30%,#f0d8ca_60%,#ecc9bb_100%)] pt-20 pb-[13vw] sm:pt-28"
    >
      <Container className="relative grid gap-12 lg:grid-cols-[1fr_minmax(0,340px)_1fr] lg:gap-0">
        <Reveal className="lg:pt-4 lg:pr-12">
          <MintoMark className="size-7 text-[#111]" />
          <h2
            id="insights-title"
            className="mt-6 max-w-[17ch] text-[clamp(1.9rem,2.9vw,2.5rem)] leading-[1.08] font-medium tracking-[-0.045em] text-balance text-[#111]"
          >
            {insights.title}
          </h2>
        </Reveal>

        {/* Dashed guides frame the phone column; the meadow below hides its lower half. */}
        <div className="relative order-last mx-auto w-[min(78vw,320px)] lg:order-none lg:w-full lg:border-x lg:border-dashed lg:border-black/15 lg:px-7 lg:pt-4">
          <Reveal y={60} className="aspect-[71.6/126] overflow-hidden">
            <PhoneFrame label="The Minto investments overview with a performance chart and portfolio">
              <InvestmentScreen />
            </PhoneFrame>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="lg:self-end lg:pb-[9vw] lg:pl-12">
          <p className="max-w-[15ch] text-[clamp(1.6rem,2.4vw,2.1rem)] leading-[1.1] font-medium tracking-[-0.04em] text-balance text-[#111]">
            {insights.aside}
          </p>
        </Reveal>
      </Container>

      <Image
        src={images.insightsMeadow}
        alt=""
        width={1179}
        height={272}
        quality={90}
        sizes="100vw"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-auto w-full"
      />
    </section>
  );
}
