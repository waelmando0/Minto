import { AppSectionHeader, AppStack, IconTile } from "@/components/app-ui/primitives";
import { transactions as defaultTransactions } from "@/lib/content";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types";

interface TransactionListProps {
  items?: Transaction[];
  limit?: number;
  className?: string;
}

export function TransactionList({ items = defaultTransactions, limit, className }: TransactionListProps) {
  return (
    <div className={className}>
      <AppSectionHeader title="Recent Transactions" action="See All" />
      <ul className="mt-[2.5cqw] flex flex-col gap-[3cqw]">
        {items.slice(0, limit).map((tx) => (
          <li key={`${tx.merchant}-${tx.date}`} className="flex items-center gap-[2.8cqw]">
            <IconTile icon={tx.icon} className={tx.tone} />
            <span className="flex flex-1 items-center justify-between gap-[2cqw]">
              <AppStack top={tx.merchant} bottom={tx.category} />
              <AppStack
                align="end"
                top={
                  <span className={cn(tx.amount > 0 && "text-[#2f8a4a]")}>
                    {formatCurrency(tx.amount, { signed: true })}
                  </span>
                }
                bottom={tx.date}
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
