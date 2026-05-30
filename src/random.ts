/**
 * Cryptographically secure randomness with **no modulo bias**.
 *
 * The naive `crypto-value % n` is biased whenever `n` doesn't divide 2³²
 * evenly — some outputs become slightly more likely, weakening every password
 * built on top. `randomInt` uses rejection sampling to draw a *uniform* value.
 */

const MAX_UINT32 = 0x1_0000_0000;

function fillRandom(buf: Uint32Array): void {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (!c || typeof c.getRandomValues !== "function") {
    throw new Error("entropass: a secure crypto.getRandomValues is required but not available");
  }
  c.getRandomValues(buf);
}

/** A uniform random integer in `[0, max)` with no modulo bias. */
export function randomInt(max: number): number {
  if (!Number.isInteger(max) || max <= 0) {
    throw new RangeError(`entropass: max must be a positive integer, got ${max}`);
  }
  if (max === 1) return 0;
  // Largest multiple of `max` that fits in a uint32; reject anything above it.
  const limit = MAX_UINT32 - (MAX_UINT32 % max);
  const buf = new Uint32Array(1);
  let x: number;
  do {
    fillRandom(buf);
    x = buf[0] as number;
  } while (x >= limit);
  return x % max;
}

/** A uniformly random element of a non-empty array. */
export function randomItem<T>(items: ArrayLike<T>): T {
  if (items.length === 0) throw new RangeError("entropass: cannot pick from an empty list");
  return items[randomInt(items.length)] as T;
}

/** In-place, unbiased Fisher–Yates shuffle using the secure RNG. */
export function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    const tmp = items[i] as T;
    items[i] = items[j] as T;
    items[j] = tmp;
  }
  return items;
}
