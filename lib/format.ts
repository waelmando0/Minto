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
