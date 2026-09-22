import { Eye, TrendingUp } from "lucide-react";

import { generateCandles } from "@/lib/chart";
import { portfolioSummary } from "@/lib/content";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Candle } from "@/types";

const VIEW_W = 400;
const VIEW_H = 160;

interface CandleChartProps {
  candles?: Candle[];
  className?: string;
}

/** Lightweight SVG candlestick chart: no chart library, no client JS. */
export function CandleChart({ candles = generateCandles(), className }: CandleChartProps) {
  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);
  const max = Math.max(...highs);
  const min = Math.min(...lows);
  const y = (v: number) => ((max - v) / (max - min)) * (VIEW_H - 8) + 4;
  const step = VIEW_W / candles.length;
  const body = step * 0.55;
  const last = candles[candles.length - 1];

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Portfolio value over the last month, trending up"
      className={cn("block w-full", className)}
    >
      <line
        x1="0"
        x2={VIEW_W}
        y1={y(last.close)}
        y2={y(last.close)}
        stroke="#7a4cf5"
        strokeOpacity="0.35"
        strokeDasharray="4 4"
        vectorEffect="non-scaling-stroke"
      />
      {candles.map((c, i) => {
        const up = c.close >= c.open;
        const color = up ? "#7a4cf5" : "#e5484d";
        const cx = i * step + step / 2;
        const top = y(Math.max(c.open, c.close));
        const height = Math.max(1.5, Math.abs(y(c.open) - y(c.close)));
        return (
          <g key={i}>
            <line
              x1={cx}
              x2={cx}
              y1={y(c.high)}
              y2={y(c.low)}
              stroke={color}
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <rect x={cx - body / 2} y={top} width={body} height={height} rx="1" fill={color} />
          </g>
        );
      })}
    </svg>
  );
}

export function RangeTabs({
  ranges = portfolioSummary.ranges,
  active = portfolioSummary.activeRange,
  className,
}: {
  ranges?: readonly string[];
  active?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between px-[2cqw]", className)}>
      {ranges.map((range) => (
        <span
          key={range}
          className={cn(
            "rounded-full px-[2.6cqw] py-[1cqw] text-[2.4cqw] font-medium",
            range === active ? "bg-[#1c1c1e] text-white" : "text-[#9a9aa0]",
          )}
        >
          {range}
        </span>
      ))}
    </div>
  );
}

/** Heading block used above the chart: label, balance and monthly change. */
export function AssetsSummary({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-start justify-between gap-[3cqw]", className)}>
      <div>
        <p className="text-[2.4cqw] text-[#8a8a8f]">Investment Assets</p>
        <p className="mt-[1cqw] flex items-center gap-[1.5cqw] text-[5.6cqw] leading-none font-semibold tracking-[-0.03em] text-[#141414]">
          {formatCurrency(portfolioSummary.assets)}
          <Eye aria-hidden className="size-[3cqw] text-[#8a8a8f]" />
        </p>
      </div>
      <p className="flex flex-col items-end gap-[0.8cqw] text-right text-[2.2cqw] text-[#8a8a8f]">
        <span className="inline-flex items-center gap-[1cqw] font-semibold text-violet">
          <span className="grid size-[3.2cqw] place-items-center rounded-[0.8cqw] bg-violet text-white">
            <TrendingUp aria-hidden className="size-[2.2cqw]" strokeWidth={3} />
          </span>
          {portfolioSummary.change}
        </span>
        Compared to last month
      </p>
    </div>
  );
}
