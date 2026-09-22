import Image from "next/image";

import { HomeScreen } from "@/components/app-ui/screens";
import { PhoneFrame } from "@/components/phone-frame";
import { ArtStage, Fog, SectionHeading } from "@/components/primitives";
import { Container } from "@/components/container";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { images, overview } from "@/lib/content";

export function Overview() {
  const { intro, checklist } = overview;

  return (
    <section
      id="overview"
      aria-labelledby="overview-title"
      className="relative overflow-hidden bg-[radial-gradient(55%_40%_at_12%_18%,#e3ebf3_0%,transparent_70%),linear-gradient(180deg,#eef2f6_0%,#f5efe8_38%,#f3e2d6_62%,#eed3c6_78%,#ffffff_100%)] pt-28 sm:pt-36"
    >
      <Container>
        <Reveal>
          <SectionHeading id="overview-title" className="mx-auto max-w-[22ch] text-center text-[#111]">
            {overview.title}
          </SectionHeading>
        </Reveal>
      </Container>

      <div className="relative mt-12 lg:mt-16">
        {/*
          Copy columns: stacked above the art on small screens, laid over the
          sky on either side of the phone from lg up.
        */}
        <Container className="grid gap-10 sm:grid-cols-2 lg:absolute lg:inset-x-0 lg:top-[2%] lg:z-20 lg:max-w-[1280px] lg:grid-cols-[1fr_30%_1fr] lg:px-[5%]">
          <Reveal className="lg:col-start-1">
            <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-[#111]">{intro.title}</h3>
            <p className="mt-4 max-w-[34ch] text-[15px] leading-relaxed text-[#55555a]">{intro.body}</p>
          </Reveal>
          <div className="lg:col-start-3 lg:justify-self-end">
            <Reveal delay={0.1}>
              <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-[#111]">{checklist.title}</h3>
            </Reveal>
            <Stagger className="mt-4 grid gap-3">
              {checklist.items.map(({ label, icon: Icon }) => (
                <StaggerItem key={label} className="flex items-center gap-3 text-[15px] text-[#3f3f44]">
                  <span className="grid size-6 place-items-center rounded-md bg-[#111]/85 text-white">
                    <Icon aria-hidden className="size-3.5" />
                  </span>
                  {label}
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Container>

        <ArtStage minWidth="md" className="mt-12 aspect-[1/0.64] lg:mt-0">
          <div className="absolute inset-x-0 bottom-0 aspect-[1179/470]">
            <Image
              src={images.overviewMountains}
              alt=""
              fill
              quality={90}
              sizes="(min-width: 1280px) 1280px, (min-width: 900px) 100vw, 900px"
              className="object-cover [mask-image:linear-gradient(to_bottom,transparent,#000_30%)]"
            />
          </div>
          <Reveal y={60} className="absolute bottom-[13%] left-1/2 z-10 w-[26.5%] -translate-x-1/2">
            <PhoneFrame label="The Minto home screen with quick actions and recent transactions">
              <HomeScreen />
            </PhoneFrame>
          </Reveal>
          <Fog className="z-10 h-[28%]" />
        </ArtStage>
      </div>
    </section>
  );
}
