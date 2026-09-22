import { SectionHeading } from "@/components/primitives";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { Container } from "@/components/container";
import { Reveal } from "@/components/motion/reveal";
import { faq } from "@/lib/content";

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="bg-graphite pt-24 pb-8 text-white sm:pt-32">
      <Container className="max-w-4xl">
        <Reveal>
          <SectionHeading id="faq-title" className="mx-auto max-w-[16ch] text-center text-[clamp(2rem,3.4vw,2.75rem)] leading-[1.08]">
            {faq.title}
          </SectionHeading>
        </Reveal>
        <Reveal delay={0.1} className="mt-12 sm:mt-16">
          <FaqAccordion items={faq.items} defaultOpen={faq.defaultOpen} />
        </Reveal>
      </Container>
    </section>
  );
}
