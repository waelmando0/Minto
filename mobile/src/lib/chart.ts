export interface Candle {
  open: number;
  close: number;
  high: number;
  low: number;
}

/** Small deterministic PRNG so every render shows the same series. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** An OHLC series that dips mid-period and recovers. Each range gets its own seed. */
export function generateCandles(count = 40, seed = 7): Candle[] {
  const random = mulberry32(seed);
  const candles: Candle[] = [];
  let price = 100;

  for (let i = 0; i < count; i++) {
    const progress = i / (count - 1);
    const drift = Math.sin(progress * Math.PI * 1.6 + 0.4) * 1.6 + (progress > 0.55 ? 1.4 : -0.3);
    const open = price;
    const close = open + drift + (random() - 0.5) * 6;
    const high = Math.max(open, close) + random() * 2.5;
    const low = Math.min(open, close) - random() * 2.5;
    candles.push({ open, close, high, low });
    price = close;
  }

  return candles;
}
