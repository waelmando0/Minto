import { donutArcs } from "@/components/donut-chart";
import type { Transaction } from "@/data/mock";
import { incomeFor, isSpending, spendingByCategory } from "@/lib/insights";

const now = new Date("2026-09-22T12:00:00Z");
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString();
const tx = (id: string, category: Transaction["category"], amount: number, days: number): Transaction => ({
  id,
  merchant: id,
  category,
  amount,
  date: daysAgo(days),
  account: "personal",
});

const sample: Transaction[] = [
  tx("coffee", "Food & Drink", -10, 1),
  tx("lunch", "Food & Drink", -30, 3),
  tx("uber", "Transport", -20, 10),
  tx("rent", "Bills", -40, 40),
  tx("goal", "Savings", -500, 2), // moving money into a goal is not spending
  tx("etf", "Investing", -300, 2), // nor is buying investments
  tx("salary", "Salary", 3000, 5),
  tx("refund", "Savings", 200, 1), // nor is a goal refund income
];

describe("spendingByCategory", () => {
  it("groups outflows by category, largest first, within the period", () => {
    const week = spendingByCategory(sample, "7d", now);
    expect(week.map((c) => [c.category, c.total, c.count])).toEqual([["Food & Drink", 40, 2]]);

    const month = spendingByCategory(sample, "30d", now);
    expect(month.map((c) => c.category)).toEqual(["Food & Drink", "Transport"]);
    expect(month[0].share).toBeCloseTo(40 / 60);

    const all = spendingByCategory(sample, "all", now);
    expect(all.reduce((s, c) => s + c.total, 0)).toBe(100);
    expect(all.reduce((s, c) => s + c.share, 0)).toBeCloseTo(1);
  });

  it("ignores savings and investing moves", () => {
    expect(isSpending(sample[4])).toBe(false);
    expect(isSpending(sample[5])).toBe(false);
    expect(spendingByCategory(sample, "all", now).find((c) => c.category === "Savings")).toBeUndefined();
  });

  it("returns nothing for an empty period", () => {
    expect(spendingByCategory([], "30d", now)).toEqual([]);
  });
});

describe("incomeFor", () => {
  it("counts real income only", () => {
    expect(incomeFor(sample, "30d", now)).toBe(3000);
    expect(incomeFor(sample, "7d", now)).toBe(3000);
  });
});

describe("donutArcs", () => {
  it("lays segments end to end in proportion", () => {
    const arcs = donutArcs(
      [
        { key: "a", value: 3, color: "#000" },
        { key: "b", value: 1, color: "#fff" },
      ],
      100,
      0,
    );
    expect(arcs[0]).toMatchObject({ dash: "75 25", offset: -0 });
    expect(arcs[1]).toMatchObject({ dash: "25 75", offset: -75 });
  });

  it("leaves a gap between segments but not around a single one", () => {
    const [only] = donutArcs([{ key: "a", value: 1, color: "#000" }], 360, 10);
    expect(only.dash).toBe("360 0");
    const two = donutArcs(
      [
        { key: "a", value: 1, color: "#000" },
        { key: "b", value: 1, color: "#000" },
      ],
      360,
      10,
    );
    expect(two[0].dash).toBe("170 190");
  });
});
