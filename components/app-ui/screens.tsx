import type { ReactNode } from "react";
import { Bell, ChartColumn, CircleMinus, CirclePlus, CircleUserRound, Ellipsis, Eye, House, RefreshCw, Wallet } from "lucide-react";

import { AssetsSummary, CandleChart, RangeTabs } from "@/components/app-ui/performance-chart";
import { PortfolioList } from "@/components/app-ui/portfolio-list";
import { QuickActions } from "@/components/app-ui/quick-actions";
import { TransactionList } from "@/components/app-ui/transaction-list";
import { WalletStack } from "@/components/app-ui/wallet-stack";
import { appUser, portfolioSummary } from "@/lib/content";
import { formatCurrency } from "@/lib/format";

function RoundIcon({ children }: { children: ReactNode }) {
  return (
    <span className="grid size-[8cqw] place-items-center rounded-full bg-white text-[#141414] shadow-[0_0.5cqw_1.5cqw_rgb(0_0_0/0.08)] ring-1 ring-black/5 [&_svg]:size-[4cqw]">
      {children}
    </span>
  );
}

/** The Minto home screen: wallet, quick actions and recent transactions. */
export function HomeScreen({ withTabBar = true }: { withTabBar?: boolean }) {
  return (
    <div aria-hidden className="px-[5.5cqw]">
      <header className="flex items-center justify-between pt-[2cqw]">
        <div>
          <p className="text-[2.3cqw] text-[#8a8a8f]">{appUser.greeting}</p>
          <p className="mt-[0.4cqw] text-[4cqw] font-semibold tracking-[-0.02em] text-[#141414]">{appUser.name}</p>
        </div>
        <div className="flex gap-[2cqw]">
          <RoundIcon>
            <Bell />
          </RoundIcon>
          <RoundIcon>
            <CircleUserRound />
          </RoundIcon>
        </div>
      </header>

      <WalletStack className="mt-[4cqw]" />
      <QuickActions className="mt-[6cqw]" />
      <div className="mt-[5cqw] rounded-[4cqw] bg-white p-[4cqw] shadow-[0_0.6cqw_2cqw_-1cqw_rgb(0_0_0/0.12)]">
        <TransactionList />
      </div>

      {withTabBar ? (
        <nav className="absolute bottom-[6cqw] left-1/2 z-10 flex -translate-x-1/2 items-center gap-[4.5cqw] rounded-full bg-[#1c1c1e] p-[1.4cqw] pr-[5cqw] text-white/55 shadow-[0_2cqw_5cqw_-1cqw_rgb(0_0_0/0.5)] [&_svg]:size-[4cqw]">
          <span className="flex items-center gap-[1.4cqw] rounded-full bg-white/12 px-[3.6cqw] py-[2cqw] text-[2.8cqw] font-medium text-white">
            <House />
            Home
          </span>
          <ChartColumn />
          <RefreshCw />
          <Wallet />
        </nav>
      ) : null}
    </div>
  );
}

function PillButton({ icon: Icon, label }: { icon: typeof CirclePlus; label: string }) {
  return (
    <span className="flex flex-1 items-center justify-center gap-[1.4cqw] rounded-full bg-white py-[2.6cqw] text-[2.6cqw] font-medium text-violet shadow-[0_0.6cqw_2cqw_-1cqw_rgb(0_0_0/0.15)] ring-1 ring-black/5">
      <Icon className="size-[3.2cqw]" strokeWidth={2.4} />
      {label}
    </span>
  );
}

/** The investments overview: performance chart, cash and portfolio. */
export function InvestmentScreen() {
  return (
    <div aria-hidden className="px-[5.5cqw]">
      <header className="flex items-center justify-between pt-[2cqw]">
        <p className="text-[4.4cqw] font-semibold tracking-[-0.02em] text-[#141414]">Overview</p>
        <span className="grid size-[8cqw] place-items-center rounded-full bg-white text-[#141414] ring-1 ring-black/5">
          <Ellipsis className="size-[4cqw]" />
        </span>
      </header>

      <AssetsSummary className="mt-[4cqw]" />
      <CandleChart className="mt-[4cqw] h-[34cqw]" />
      <RangeTabs className="mt-[3cqw]" />

      <div className="mt-[5cqw]">
        <p className="text-[2.4cqw] text-[#8a8a8f]">Investment Cash</p>
        <p className="mt-[1cqw] flex items-center gap-[1.5cqw] text-[5cqw] leading-none font-semibold tracking-[-0.03em] text-[#141414]">
          {formatCurrency(portfolioSummary.cash)}
          <Eye aria-hidden className="size-[3cqw] text-[#8a8a8f]" />
        </p>
        <div className="mt-[3.5cqw] flex gap-[3cqw]">
          <PillButton icon={CirclePlus} label="Deposit" />
          <PillButton icon={CircleMinus} label="Withdraw" />
        </div>
      </div>

      <div className="mt-[5cqw] rounded-[4cqw] bg-white p-[4cqw] shadow-[0_0.6cqw_2cqw_-1cqw_rgb(0_0_0/0.12)]">
        <PortfolioList limit={3} />
      </div>
    </div>
  );
}
