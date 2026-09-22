import { FeaturePreview } from "@/components/app-ui/feature-preview";
import { AboutHighlights } from "@/components/sections/about-highlights";
import { pillVariants } from "@/components/store-buttons";
import { Container } from "@/components/container";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { about, featureCards } from "@/lib/content";

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="bg-graphite py-24 text-white sm:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <Reveal className="flex flex-col items-start justify-between gap-10">
            <h2
              id="about-title"
              className="max-w-[15ch] text-[clamp(2rem,3.4vw,2.75rem)] leading-[1.08] font-medium tracking-[-0.04em] text-balance"
            >
              {about.title}
            </h2>
            <a href={about.cta.href} className={pillVariants({ tone: "light", size: "lg" })}>
              {about.cta.label}
            </a>
          </Reveal>
          <Reveal delay={0.1}>
            <AboutHighlights />
          </Reveal>
        </div>

        <Stagger id="features" className="mt-16 grid scroll-mt-24 gap-4 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4">
          {featureCards.map((card) => (
            <StaggerItem key={card.preview} className="h-full">
              <article className="group flex h-full flex-col rounded-[22px] bg-mint p-5 text-mint-foreground transition-transform duration-500 ease-out hover:-translate-y-1">
                <h3 className="text-[17px] leading-snug font-medium tracking-[-0.02em] text-balance text-[#111]">
                  {card.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[#4b574f]">{card.description}</p>
                <div className="mt-auto pt-6">
                  <FeaturePreview
                    kind={card.preview}
                    className="transition-transform duration-500 ease-out group-hover:-translate-y-1"
                  />
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
