import type { Transaction } from "@/data/mock";
import { formatDay } from "@/lib/format";

/** Groups transactions (already newest-first) by calendar-day label. */
export function groupByDay(items: Transaction[], now = new Date()) {
  const groups: { day: string; items: Transaction[] }[] = [];
  for (const item of items) {
    const day = formatDay(new Date(item.date), now);
    const last = groups[groups.length - 1];
    if (last?.day === day) last.items.push(item);
    else groups.push({ day, items: [item] });
  }
  return groups;
}
