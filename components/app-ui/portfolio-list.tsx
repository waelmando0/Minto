import { AppSectionHeader, IconTile } from "@/components/app-ui/primitives";
import { holdings as defaultHoldings } from "@/lib/content";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Holding } from "@/types";

interface PortfolioListProps {
  items?: Holding[];
  limit?: number;
  className?: string;
}

export function PortfolioList({ items = defaultHoldings, limit, className }: PortfolioListProps) {
  return (
    <div className={className}>
      <AppSectionHeader title="Portfolio" action="Manage" />
      <ul className="mt-[2.5cqw] flex flex-col gap-[3cqw]">
        {items.slice(0, limit).map((holding) => (
          <li key={holding.name} className="flex items-center gap-[2.8cqw]">
            <IconTile icon={holding.icon} className={holding.tone} />
            <span className="flex flex-1 items-center justify-between gap-[2cqw]">
              <span className="flex min-w-0 flex-col gap-[0.6cqw]">
                <span className="truncate text-[2.4cqw] leading-tight text-[#8a8a8f]">{holding.name}</span>
                <span className="truncate text-[3cqw] leading-tight font-semibold text-[#141414]">
                  {formatCurrency(holding.value)}
                </span>
              </span>
              <span className="flex flex-col items-end gap-[0.6cqw] text-right">
                <span className="text-[2.4cqw] leading-tight text-[#8a8a8f]">Total Return</span>
                <span
                  className={cn(
                    "text-[3cqw] leading-tight font-semibold",
                    holding.totalReturn >= 0 ? "text-violet" : "text-[#e5484d]",
                  )}
                >
                  {formatCurrency(holding.totalReturn, { signed: true })}
                </span>
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

