"use client";

import * as React from "react";
import { Accordion } from "radix-ui";

import { highlights as defaultHighlights } from "@/lib/content";
import { cn } from "@/lib/utils";
import type { Highlight } from "@/types";

/**
 * The stat list beside the manifesto. Exactly one row is always expanded;
 * it turns mint and reveals its story.
 */
export function AboutHighlights({ items = defaultHighlights, className }: { items?: Highlight[]; className?: string }) {
  const [value, setValue] = React.useState(items[0]?.id ?? "");

  return (
    <Accordion.Root
      type="single"
      value={value}
      onValueChange={(next) => next && setValue(next)}
      className={cn("flex flex-col gap-2.5", className)}
    >
      {items.map(({ id, title, stat, statLabel, description, icon: Icon }) => (
        <Accordion.Item
          key={id}
          value={id}
          className="group rounded-[14px] bg-graphite-raised text-white/75 transition-[background-color,color] duration-500 ease-out hover:bg-[#3d3d3d] data-[state=open]:bg-mint data-[state=open]:text-mint-foreground"
        >
          <Accordion.Header>
            <Accordion.Trigger className="flex w-full items-center gap-3 rounded-[14px] px-4 py-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-graphite sm:px-5 sm:py-4">
              <Icon aria-hidden className="size-4 shrink-0 opacity-80" />
              <span className="flex-1 text-[15px] font-medium tracking-[-0.01em] group-data-[state=open]:text-[#111]">
                {title}
              </span>
              <span className="text-[15px] font-semibold tabular-nums group-data-[state=open]:text-[#111]">
                <span className="sr-only">{statLabel}: </span>
                {stat}
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <p className="px-4 pb-4 pl-11 text-[13px] leading-relaxed text-[#46524a] sm:px-5 sm:pl-12">{description}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
