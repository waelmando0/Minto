import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

export interface DonutSegment {
  key: string;
  value: number;
  color: string;
}

/**
 * Converts values into dash patterns along a circle of the given circumference.
 * Each segment starts where the previous one ended, minus a small gap.
 */
export function donutArcs(segments: DonutSegment[], circumference: number, gapDegrees = 2) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const gapLength = segments.length > 1 ? (gapDegrees / 360) * circumference : 0;
  const lengths = segments.map((s) => (total > 0 ? (s.value / total) * circumference : 0));
  return segments.map((segment, i) => {
    const start = lengths.slice(0, i).reduce((a, b) => a + b, 0);
    const visible = Math.max(0, lengths[i] - gapLength);
    return { ...segment, dash: `${visible} ${circumference - visible}`, offset: -start };
  });
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  stroke?: number;
  /** Gap between segments, in degrees. */
  gap?: number;
  label: string;
  children?: ReactNode;
}

/** Ring split into proportional segments, drawn with dashed SVG circles. */
export function DonutChart({ segments, size = 200, stroke = 22, gap = 2, label, children }: DonutChartProps) {
  const r = (size - stroke) / 2;
  const arcs = donutArcs(segments, 2 * Math.PI * r, gap);

  return (
    <View style={{ width: size, height: size }} accessible accessibilityRole="image" accessibilityLabel={label}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(0,0,0,0.06)" strokeWidth={stroke} fill="none" />
        {arcs.map((arc) => (
          <Circle
            key={arc.key}
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={arc.color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={arc.dash}
            strokeDashoffset={arc.offset}
          />
        ))}
      </Svg>
      {children ? <View style={styles.center}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
});
