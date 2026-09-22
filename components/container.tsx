import * as React from "react";

import { cn } from "@/lib/utils";

/** Shared horizontal rhythm — the reference content column sits at ~1140px. */
export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)} {...props} />;
}
