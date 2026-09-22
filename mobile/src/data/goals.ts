import {
  Baby,
  Car,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  Laptop,
  Palmtree,
  PiggyBank,
  Sparkles,
  Sprout,
  Truck,
  type LucideIcon,
} from "lucide-react-native";

import { formatCurrency } from "@/lib/format";

export type GoalTemplateId =
  | "emergency"
  | "vacation"
  | "home"
  | "car"
  | "education"
  | "wedding"
  | "retirement"
  | "tech"
  | "gift"
  | "health"
  | "moving"
  | "baby";

export interface GoalTemplate {
  id: GoalTemplateId;
  name: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  /** Pre-filled target when the template is picked. */
  suggested: number;
}

/** The "12+ goal templates" promised on the website. */
export const goalTemplates: GoalTemplate[] = [
  { id: "emergency", name: "Emergency fund", icon: PiggyBank, color: "#7A4CF5", bg: "#ECE6FE", suggested: 5000 },
  { id: "vacation", name: "Vacation", icon: Palmtree, color: "#E5822A", bg: "#FFEEDC", suggested: 3000 },
  { id: "home", name: "New home", icon: House, color: "#2F6DF6", bg: "#E3EBFF", suggested: 40000 },
  { id: "car", name: "Car", icon: Car, color: "#1C1C1E", bg: "#ECECEF", suggested: 15000 },
  { id: "education", name: "Education", icon: GraduationCap, color: "#3D63E0", bg: "#E3EBFF", suggested: 10000 },
  { id: "wedding", name: "Wedding", icon: Sparkles, color: "#D14B8F", bg: "#FCE4F1", suggested: 20000 },
  { id: "retirement", name: "Retirement", icon: Sprout, color: "#2F8A4A", bg: "#DFF3E3", suggested: 100000 },
  { id: "tech", name: "New gadget", icon: Laptop, color: "#1C1C1E", bg: "#ECECEF", suggested: 2000 },
  { id: "gift", name: "Gifts", icon: Gift, color: "#E5484D", bg: "#FDE7E8", suggested: 500 },
  { id: "health", name: "Health", icon: HeartPulse, color: "#E5484D", bg: "#FDE7E8", suggested: 2500 },
  { id: "moving", name: "Moving", icon: Truck, color: "#7A5A2A", bg: "#F3EAD9", suggested: 4000 },
  { id: "baby", name: "New baby", icon: Baby, color: "#2F8A4A", bg: "#DFF3E3", suggested: 8000 },
];

export const templateById = (id: GoalTemplateId) =>
  goalTemplates.find((t) => t.id === id) ?? goalTemplates[0];

export interface Goal {
  id: string;
  name: string;
  template: GoalTemplateId;
  target: number;
  saved: number;
  /** ISO timestamp. */
  createdAt: string;
}

export const goalLimits = { min: 10, max: 1_000_000 };

export const initialGoals: Goal[] = [
  { id: "g1", name: "Summer in Lisbon", template: "vacation", target: 3000, saved: 1850, createdAt: "2026-05-02T09:00:00.000Z" },
  { id: "g2", name: "New MacBook", template: "tech", target: 2400, saved: 900, createdAt: "2026-07-14T09:00:00.000Z" },
];

/** 0–1 share of the target that has been saved. */
export const goalProgress = (goal: Goal) => (goal.target > 0 ? Math.min(1, goal.saved / goal.target) : 0);

/** Validates a new goal's name and target; returns an error message or undefined. */
export function validateGoal(name: string, target: string) {
  if (!name.trim()) return "Give your goal a name.";
  const value = Number(target);
  if (!target || Number.isNaN(value) || value <= 0) return "Enter a target amount.";
  if (value < goalLimits.min) return `The target must be at least ${formatCurrency(goalLimits.min)}.`;
  if (value > goalLimits.max) return `The target can be at most ${formatCurrency(goalLimits.max)}.`;
  return undefined;
}
