const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** `$1,238.97`. With `signed`, prefixes `+` / `-` the way banking apps list movements. */
export function formatCurrency(value: number, { signed = false } = {}) {
  const formatted = usd.format(Math.abs(value));
  if (!signed) return value < 0 ? `-${formatted}` : formatted;
  return `${value < 0 ? "-" : "+"}${formatted}`;
}

/** Replaces digits with bullets while keeping the currency shape, e.g. `$••,•••.••`. */
export function maskCurrency(formatted: string) {
  return formatted.replace(/\d/g, "•");
}

const dayFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const timeFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** "Today", "Yesterday" or "Aug 12", relative to `now`. */
export function formatDay(date: Date, now = new Date()) {
  const diff = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return dayFormatter.format(date);
}

/** "Today, 8:24 AM" style label used in transaction rows. */
export function formatDateTime(date: Date, now = new Date()) {
  return `${formatDay(date, now)}, ${timeFormatter.format(date)}`;
}

/**
 * Parses keypad input ("250", "250.5") into cents-safe numbers and validates
 * it against the transfer limits. Returns an error message or undefined.
 */
export function validateAmount(input: string, { min, max, available }: { min: number; max: number; available?: number }) {
  const value = Number(input);
  if (!input || Number.isNaN(value) || value === 0) return "Enter an amount";
  if (value < min) return `Minimum is ${formatCurrency(min)}`;
  if (value > max) return `Maximum is ${formatCurrency(max)} per transaction`;
  if (available !== undefined && value > available) return "Not enough available cash";
  return undefined;
}

/** Applies a keypad key to the current amount string, keeping at most 2 decimals. */
export function applyKey(current: string, key: string) {
  if (key === "back") return current.slice(0, -1);
  if (key === ".") {
    if (current.includes(".")) return current;
    return current === "" ? "0." : `${current}.`;
  }
  if (current === "0") return key;
  const [, decimals] = current.split(".");
  if (decimals !== undefined && decimals.length >= 2) return current;
  if (current.replace(".", "").length >= 8) return current;
  return current + key;
}

/** Adds thousands separators to keypad input for display: "12500.5" → "12,500.5". */
export function formatAmountInput(input: string) {
  const [whole, decimals] = input.split(".");
  const grouped = (whole || "0").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimals !== undefined ? `${grouped}.${decimals}` : grouped;
}
