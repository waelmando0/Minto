import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium transition-[transform,background-color,color,box-shadow,border-color] duration-200 ease-out outline-none select-none active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_1px_2px_rgb(0_0_0/0.2),inset_0_1px_0_rgb(255_255_255/0.12)] hover:bg-primary/85",
        outline:
          "border border-border bg-background text-foreground hover:border-foreground/25 hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        light: "bg-white text-foreground shadow-sm hover:bg-white/90",
        "outline-dark":
          "border border-white/15 bg-white/[0.03] text-white hover:border-white/30 hover:bg-white/[0.08]",
      },
      size: {
        sm: "h-8 rounded-md px-3 text-xs",
        default: "h-10 rounded-lg px-4 text-sm",
        lg: "h-12 rounded-xl px-6 text-sm",
        icon: "size-9 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
