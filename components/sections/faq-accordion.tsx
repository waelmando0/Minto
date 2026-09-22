"use client";

import { Accordion } from "radix-ui";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Faq } from "@/types";

interface FaqAccordionProps {
  items: Faq[];
  /** Index of the question expanded on load. */
  defaultOpen?: number;
  className?: string;
}

/** Dark FAQ list; the open item flips to a light card and its "+" turns into a "×". */
export function FaqAccordion({ items, defaultOpen, className }: FaqAccordionProps) {
  return (
    <Accordion.Root
      type="single"
      collapsible
      defaultValue={defaultOpen === undefined ? undefined : `faq-${defaultOpen}`}
      className={cn("flex flex-col gap-3", className)}
    >
      {items.map((item, index) => (
        <Accordion.Item
          key={item.question}
          value={`faq-${index}`}
          className="group rounded-2xl bg-graphite-raised text-white/70 transition-colors duration-300 hover:bg-[#3d3d3d] hover:text-white/90 data-[state=open]:bg-[#f1f1ee] data-[state=open]:text-[#111]"
        >
          <Accordion.Header>
            <Accordion.Trigger className="flex w-full items-center justify-between gap-6 rounded-2xl px-5 py-[18px] text-left text-[15px] tracking-[-0.01em] outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-graphite group-data-[state=open]:font-medium sm:px-6">
              {item.question}
              <Plus
                aria-hidden
                className="size-4 shrink-0 opacity-70 transition-transform duration-300 ease-out group-data-[state=open]:rotate-45 group-data-[state=open]:opacity-100"
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <p className="max-w-[62ch] px-5 pt-1 pb-6 text-sm leading-relaxed text-[#55555a] sm:px-6">{item.answer}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
