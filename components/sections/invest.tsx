import { Eye, TrendingUp } from "lucide-react";

import { SectionHeading } from "@/components/primitives";
import { pillVariants } from "@/components/store-buttons";
import { Container } from "@/components/container";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { invest } from "@/lib/content";
import { cn } from "@/lib/utils";
import type { InvestCard as InvestCardData } from "@/types";

export function Invest() {
  return (
    <section
      id="invest"
      aria-labelledby="invest-title"
      className="relative overflow-hidden border-b border-dashed border-black/10 bg-[radial-gradient(45%_35%_at_10%_12%,#e6ebf1_0%,transparent_70%),radial-gradient(40%_35%_at_90%_22%,#f3ede6_0%,transparent_70%),radial-gradient(60%_40%_at_50%_100%,#efe7df_0%,transparent_70%),linear-gradient(180deg,#ffffff_0%,#f3f4f6_45%,#f5f1ec_100%)] py-24 sm:py-32"
    >
      <GuideLines />
      <Container className="relative">
        <Reveal>
          <SectionHeading id="invest-title" className="mx-auto max-w-[16ch] text-center text-[#111]">
            {invest.title}
          </SectionHeading>
        </Reveal>
        <Stagger className="mt-14 grid gap-4 md:grid-cols-3 lg:mt-20">
          {invest.cards.map((card) => (
            <StaggerItem key={card.id} className="h-full">
              <InvestCard card={card} />
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}

/** Dashed column guides that frame the card grid, as in the reference. */
function GuideLines() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
      <Container className="grid h-full grid-cols-3 gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="border-x border-dashed border-black/[0.08]" />
        ))}
      </Container>
    </div>
  );
}

function InvestCard({ card }: { card: InvestCardData }) {
  return (
    <article className="group flex h-full flex-col rounded-[26px] bg-white/80 p-2.5 shadow-[0_24px_48px_-32px_rgb(0_0_0/0.3)] ring-1 ring-black/[0.04] backdrop-blur-md transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_32px_56px_-30px_rgb(0_0_0/0.35)]">
      <div
        className={cn(
          "flex min-h-[200px] flex-col justify-center rounded-[20px] bg-[#f3f3f1] px-6 py-8",
          card.input && "items-center text-center",
        )}
      >
        <p className="text-[13px] text-[#6b6b70]">{card.label}</p>
        {card.input ? <AmountInput value={card.value} /> : <Balance value={card.value} />}
        <CardMeta meta={card.meta} />
      </div>
      <div className="flex flex-1 flex-col px-4 pt-6 pb-4">
        <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-[#111]">{card.title}</h3>
        <p className="mt-1.5 max-w-[34ch] text-[13px] leading-relaxed text-[#6b6b70]">{card.description}</p>
        <a
          href={card.cta.href}
          className={cn(pillVariants({ tone: card.featured ? "dark" : "outline", size: "lg" }), "mt-6 self-start")}
        >
          {card.cta.label}
        </a>
      </div>
    </article>
  );
}

function Balance({ value }: { value: string }) {
  return (
    <p className="mt-2 flex items-center gap-2 text-[clamp(1.9rem,3vw,2.4rem)] leading-none font-medium tracking-[-0.045em] text-[#111]">
      {value}
      <Eye aria-hidden className="size-4 text-[#9a9aa0]" />
    </p>
  );
}

/** Styled like a focused amount field, with a blinking caret after the cents. */
function AmountInput({ value }: { value: string }) {
  const [whole, cents] = value.replace("$", "").split(".");
  return (
    <p className="mt-2 flex items-baseline text-[clamp(1.9rem,3vw,2.4rem)] leading-none font-medium tracking-[-0.045em] text-[#111]">
      <span className="mr-1.5 text-[#9a9aa0]">$</span>
      {whole}
      <span className="text-[#b5b5ba]">.{cents}</span>
      <span aria-hidden className="ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[0.1em] animate-caret-blink bg-violet" />
    </p>
  );
}

function CardMeta({ meta }: { meta: InvestCardData["meta"] }) {
  switch (meta.kind) {
    case "trend":
      return (
        <p className="mt-3 flex items-center gap-2 text-[13px] text-[#55555a]">
          <span className="inline-flex items-center gap-1 font-semibold text-violet">
            <span className="grid size-4 place-items-center rounded bg-violet text-white">
              <TrendingUp aria-hidden className="size-3" strokeWidth={3} />
            </span>
            {meta.change}
          </span>
          {meta.caption}
        </p>
      );
    case "caption":
      return <p className="mt-3 max-w-[22ch] text-[13px] leading-snug text-[#8a8a8f]">{meta.text}</p>;
    case "accent":
      return <p className="mt-3 text-[13px] font-medium text-violet">{meta.text}</p>;
  }
}
