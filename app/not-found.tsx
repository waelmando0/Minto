import Link from "next/link";

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <p className="text-sm text-muted-foreground">404</p>
      <h1 className="text-4xl font-medium tracking-[-0.045em] sm:text-5xl">We couldn&apos;t find that page.</h1>
      <Button asChild>
        <Link href="/">Back home</Link>
      </Button>
    </Container>
  );
}
