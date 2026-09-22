import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/*
 * Building blocks for the in-app mockups. Every size is expressed through the
 * `app-ui` scale (1 spacing unit = 1% of the mockup width), so these render
 * identically inside a phone or a card preview.
 */

export function AppSectionHeader({
  title,
  action,
  className,
}: {
  title: string;
  action?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <p className="text-[3cqw] font-semibold tracking-[-0.01em] text-[#141414]">{title}</p>
      {action ? <span className="text-[2.6cqw] font-medium text-violet">{action}</span> : null}
    </div>
  );
}

export function IconTile({
  icon: Icon,
  className,
  size = "md",
}: {
  icon: LucideIcon;
  className?: string;
  size?: "md" | "lg";
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center",
        size === "md" ? "size-[8.5cqw] rounded-[2.4cqw]" : "size-[11cqw] rounded-[3.2cqw]",
        className,
      )}
    >
      <Icon className={size === "md" ? "size-[4cqw]" : "size-[5cqw]"} strokeWidth={2} />
    </span>
  );
}

/** Two stacked lines: a muted label and a stronger value. */
export function AppStack({
  top,
  bottom,
  align = "start",
  bottomClassName,
}: {
  top: ReactNode;
  bottom: ReactNode;
  align?: "start" | "end";
  bottomClassName?: string;
}) {
  return (
    <span className={cn("flex min-w-0 flex-col gap-[0.6cqw]", align === "end" && "items-end text-right")}>
      <span className="truncate text-[3cqw] leading-tight font-semibold text-[#141414]">{top}</span>
      <span className={cn("truncate text-[2.4cqw] leading-tight text-[#8a8a8f]", bottomClassName)}>
        {bottom}
      </span>
    </span>
  );
}
