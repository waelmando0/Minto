import { Eye } from "lucide-react";

import { MintoMark } from "@/components/logo";
import { walletCards as defaultCards } from "@/lib/content";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { WalletCard } from "@/types";

/** The dark "wallet" with account cards tucked into it and the total balance. */
export function WalletStack({ cards = defaultCards, className }: { cards?: WalletCard[]; className?: string }) {
  const total = cards.reduce((sum, card) => sum + card.balance, 0);

  return (
    <div className={cn("rounded-[5cqw] bg-[#1f1f21] p-[1.6cqw] shadow-[0_4cqw_8cqw_-4cqw_rgb(0_0_0/0.45)]", className)}>
      <div className="overflow-hidden rounded-[4cqw] border border-dashed border-white/15">
        <div className="relative h-[17cqw]">
          {cards.map((card, index) => (
            <div
              key={card.name}
              className={cn(
                "absolute h-[14cqw] rounded-t-[3.4cqw] px-[3.5cqw] pt-[2.4cqw] text-white shadow-[0_-1cqw_3cqw_rgb(0_0_0/0.25)]",
                card.tone,
                index === 0 ? "top-[2.2cqw] right-[3cqw] left-[6cqw]" : "top-[9cqw] right-[4.5cqw] left-[3cqw]",
              )}
            >
              <div className="flex items-center justify-between text-[2.4cqw] font-medium">
                <span className="flex items-center gap-[1.2cqw]">
                  <MintoMark className="size-[3.2cqw]" />
                  {card.name}
                </span>
                <span className="opacity-90">{formatCurrency(card.balance)}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="relative bg-[#1f1f21] px-[4cqw] pt-[3cqw] pb-[4.5cqw] shadow-[0_-1.5cqw_3cqw_rgb(0_0_0/0.35)]">
          <p className="text-[2.2cqw] text-white/45">Total Balance</p>
          <p className="mt-[1cqw] flex items-center gap-[1.6cqw] text-[6.2cqw] leading-none font-medium tracking-[-0.03em] text-white">
            {formatCurrency(total)}
            <Eye aria-hidden className="size-[3.2cqw] text-white/70" />
          </p>
        </div>
      </div>
    </div>
  );
}
