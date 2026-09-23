"use client";

import { Container } from "@/components/container";
import { pillVariants } from "@/components/store-buttons";
import { cn } from "@/lib/utils";

export default function AccountError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <Container className="flex min-h-[80vh] flex-col items-center justify-center gap-5 pt-24 pb-16 text-center">
      <h1 className="text-3xl font-medium tracking-[-0.04em] sm:text-4xl">We couldn&apos;t load your account.</h1>
      <p className="max-w-md text-muted-foreground">Check your connection and try again.</p>
      <button
        type="button"
        onClick={() => retry()}
        className={cn(pillVariants({ tone: "dark", size: "lg" }), "normal-case tracking-normal")}
      >
        Try again
      </button>
    </Container>
  );
}
