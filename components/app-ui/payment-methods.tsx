import { AppSectionHeader, AppStack } from "@/components/app-ui/primitives";
import { paymentMethods as defaultMethods } from "@/lib/content";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types";

interface PaymentMethodsProps {
  items?: PaymentMethod[];
  selected?: number;
  className?: string;
}

export function PaymentMethods({ items = defaultMethods, selected = 0, className }: PaymentMethodsProps) {
  return (
    <div className={className}>
      <AppSectionHeader title="Choose a Payment Method" />
      <ul className="mt-[3cqw] flex flex-col gap-[3.2cqw]">
        {items.map((method, index) => (
          <li key={method.bank} className="flex items-center gap-[2.8cqw]">
            <span
              aria-hidden
              className={cn(
                "grid size-[8.5cqw] shrink-0 place-items-center rounded-[2.4cqw] text-[3.6cqw] font-bold text-white",
                method.tone,
              )}
            >
              {method.mark}
            </span>
            <span className="flex flex-1 items-center justify-between gap-[2cqw]">
              <AppStack top={method.bank} bottom={method.account} />
              <span
                aria-hidden
                className={cn(
                  "grid size-[4.4cqw] place-items-center rounded-full border-[0.5cqw]",
                  index === selected ? "border-violet" : "border-[#d7d7dc]",
                )}
              >
                {index === selected ? <span className="size-[2cqw] rounded-full bg-violet" /> : null}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
