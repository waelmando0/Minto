import * as React from "react";

import { Container } from "@/components/container";

/** Shared layout for the plain-text pages (privacy policy, support). */
export function LegalPage({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro: React.ReactNode;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <Container className="max-w-3xl pt-32 pb-24 sm:pt-40">
      <h1 className="text-4xl font-medium tracking-[-0.045em] sm:text-5xl">{title}</h1>
      {updated ? <p className="mt-3 text-sm text-muted-foreground">Last updated {updated}</p> : null}
      <div className="mt-6 text-lg leading-relaxed text-muted-foreground">{intro}</div>
      <div className="mt-12 grid gap-10 text-[15px] leading-relaxed text-foreground/85 [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_h2]:text-xl [&_h2]:font-medium [&_h2]:tracking-[-0.02em] [&_h2]:text-foreground [&_li]:pl-1 [&_p+p]:mt-3 [&_section>*+*]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </Container>
  );
}
