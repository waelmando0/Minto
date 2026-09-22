import { useMemo, useState } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import Svg, { Line, Rect } from "react-native-svg";

import { generateCandles } from "@/lib/chart";
import { useColors } from "@/theme/theme";

interface CandleChartProps {
  seed: number;
  height?: number;
  count?: number;
  label: string;
}

/** Candlestick chart drawn with react-native-svg; sizes itself to its container. */
export function CandleChart({ seed, height = 150, count = 40, label }: CandleChartProps) {
  const colors = useColors();
  const [width, setWidth] = useState(0);
  const candles = useMemo(() => generateCandles(count, seed), [count, seed]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const max = Math.max(...candles.map((c) => c.high));
  const min = Math.min(...candles.map((c) => c.low));
  const y = (v: number) => ((max - v) / (max - min)) * (height - 8) + 4;
  const step = width / candles.length;
  const body = Math.max(2, step * 0.55);
  const last = candles[candles.length - 1];

  return (
    <View onLayout={onLayout} style={{ height }} accessible accessibilityRole="image" accessibilityLabel={label}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Line
            x1={0}
            x2={width}
            y1={y(last.close)}
            y2={y(last.close)}
            stroke={colors.violet}
            strokeOpacity={0.35}
            strokeDasharray="4 4"
          />
          {candles.map((c, i) => {
            const up = c.close >= c.open;
            const color = up ? colors.violet : colors.negative;
            const cx = i * step + step / 2;
            return (
              <Line key={`w${i}`} x1={cx} x2={cx} y1={y(c.high)} y2={y(c.low)} stroke={color} strokeWidth={1} />
            );
          })}
          {candles.map((c, i) => {
            const up = c.close >= c.open;
            const cx = i * step + step / 2;
            const top = y(Math.max(c.open, c.close));
            const bodyHeight = Math.max(1.5, Math.abs(y(c.open) - y(c.close)));
            return (
              <Rect
                key={`b${i}`}
                x={cx - body / 2}
                y={top}
                width={body}
                height={bodyHeight}
                rx={1}
                fill={up ? colors.violet : colors.negative}
              />
            );
          })}
        </Svg>
      ) : null}
    </View>
  );
}
