import type { ReactNode } from "react";
import { AssetsSummary, CandleChart, RangeTabs } from "@/components/app-ui/performance-chart";
import { PaymentMethods } from "@/components/app-ui/payment-methods";
import { PortfolioList } from "@/components/app-ui/portfolio-list";
import { TransactionList } from "@/components/app-ui/transaction-list";
import { cn } from "@/lib/utils";
import type { FeaturePreview as FeaturePreviewKind } from "@/types";

const previews: Record<FeaturePreviewKind, ReactNode> = {
  transactions: <TransactionList limit={4} />,
  portfolio: <PortfolioList />,
  performance: (
    <>
      <AssetsSummary />
      <CandleChart className="mt-[5cqw] h-[34cqw]" />
      <RangeTabs className="mt-[4cqw]" />
    </>
  ),
  "payment-methods": <PaymentMethods />,
};

/** A white app panel showing a slice of the product UI. */
export function FeaturePreview({ kind, className }: { kind: FeaturePreviewKind; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("app-ui overflow-hidden rounded-[14px] bg-white shadow-[0_12px_30px_-18px_rgb(0_0_0/0.3)]", className)}
    >
      <div className="p-[6cqw]">{previews[kind]}</div>
    </div>
  );
}
