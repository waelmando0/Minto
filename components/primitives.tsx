import type { ComponentProps, ElementType } from "react";

import { cn } from "@/lib/utils";

type SectionHeadingProps<T extends ElementType> = { as?: T } & ComponentProps<T>;

/**
 * Display headline used by every section: tight tracking, balanced lines.
 * When overriding the size, pass a `leading-*` too: tailwind-merge treats a
 * font-size class as replacing line-height.
 */
export function SectionHeading<T extends ElementType = "h2">({ as, className, ...props }: SectionHeadingProps<T>) {
  const Tag = as ?? "h2";
  return (
    <Tag
      className={cn(
        "text-[clamp(2rem,3.6vw,3rem)] leading-[1.08] font-medium tracking-[-0.045em] text-balance",
        className,
      )}
      {...props}
    />
  );
}

/** Soft ground fog that swallows the bottom of a phone mockup. */
export function Fog({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-x-0 bottom-0", className)}>
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/85 to-transparent" />
      <div className="absolute -bottom-[20%] left-[2%] h-[80%] w-[46%] rounded-[50%] bg-white/90 blur-3xl" />
      <div className="absolute -bottom-[25%] left-[28%] h-[85%] w-[44%] rounded-[50%] bg-white blur-2xl" />
      <div className="absolute right-[0%] -bottom-[20%] h-[80%] w-[48%] rounded-[50%] bg-white/90 blur-3xl" />
    </div>
  );
}

/**
 * A fixed-proportion art board. The artwork (landscape + phone) is laid out in
 * percentages, so it keeps its composition at every width; below `minWidth`
 * it simply overflows and is cropped at the sides.
 */
export function ArtStage({
  className,
  minWidth,
  ...props
}: ComponentProps<"div"> & { minWidth: "sm" | "md" }) {
  return (
    <div
      className={cn(
        "relative left-1/2 max-w-[1280px] -translate-x-1/2",
        minWidth === "sm" ? "w-[max(100%,820px)]" : "w-[max(100%,900px)]",
        // Past 1280px the board stops growing, so its sides fade into the page.
        "min-[1281px]:[mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]",
        className,
      )}
      {...props}
    />
  );
}
