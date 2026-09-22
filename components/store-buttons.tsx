import { cva, type VariantProps } from "class-variance-authority";

import { AppleIcon, PlayStoreIcon } from "@/components/brand-icons";
import { mintoMeta } from "@/lib/content";
import { cn } from "@/lib/utils";

/** Shared pill used by store badges and the small uppercase CTAs across the page. */
export const pillVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-full font-semibold tracking-[0.01em] uppercase whitespace-nowrap transition-[transform,background-color,box-shadow,color] duration-200 ease-out outline-none select-none active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-offset-2 [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        dark: "bg-[#111] text-white shadow-[0_6px_16px_-6px_rgb(0_0_0/0.45)] hover:-translate-y-0.5 hover:bg-black focus-visible:ring-black",
        light:
          "bg-white text-[#111] shadow-[0_6px_18px_-8px_rgb(0_0_0/0.25)] ring-1 ring-black/5 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-10px_rgb(0_0_0/0.3)] focus-visible:ring-black",
        outline:
          "bg-white text-[#111] ring-1 ring-black/10 hover:bg-[#f5f5f3] hover:ring-black/20 focus-visible:ring-black",
      },
      size: {
        sm: "h-8 px-3.5 text-[10px]",
        md: "h-9 px-4 text-[11px]",
        lg: "h-10 px-5 text-xs",
      },
    },
    defaultVariants: { tone: "dark", size: "md" },
  },
);

type PillVariants = VariantProps<typeof pillVariants>;

interface StoreButtonsProps {
  className?: string;
  size?: PillVariants["size"];
}

/** Google Play + App Store badges, in the order the reference shows them. */
export function StoreButtons({ className, size = "md" }: StoreButtonsProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-2.5", className)}>
      <a
        href={mintoMeta.playStoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={pillVariants({ tone: "light", size })}
      >
        <PlayStoreIcon className="size-3.5" />
        Play Store
        <span className="sr-only">(opens in a new tab)</span>
      </a>
      <a
        href={mintoMeta.appStoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={pillVariants({ tone: "dark", size })}
      >
        <AppleIcon className="size-3.5" />
        App Store
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    </div>
  );
}
