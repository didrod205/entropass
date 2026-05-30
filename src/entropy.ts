/**
 * Entropy and crack-time estimation.
 *
 * For a uniformly random secret, entropy is exactly `length × log2(poolSize)`.
 * For an arbitrary password we estimate the pool from the character classes
 * present and discount obvious patterns (repeats and sequences) so that
 * `"aaaaaa"` and `"abc123"` don't score like real randomness.
 */

export type StrengthLabel = "Very weak" | "Weak" | "Reasonable" | "Strong" | "Very strong";

export interface CrackTime {
  /** Average seconds to guess, at the given attacker rate. */
  seconds: number;
  /** Human-readable estimate, e.g. "3 hours", "centuries". */
  text: string;
}

export interface Strength {
  entropyBits: number;
  poolSize: number;
  length: number;
  label: StrengthLabel;
  /** Crack time for a fast offline attacker (default 1e10 guesses/sec). */
  crackTime: CrackTime;
}

/** Entropy in bits for a uniformly random secret of `length` over a `poolSize` alphabet. */
export function entropyBits(poolSize: number, length: number): number {
  if (poolSize <= 1 || length <= 0) return 0;
  return Math.round(length * Math.log2(poolSize) * 100) / 100;
}

export function strengthLabel(bits: number): StrengthLabel {
  if (bits < 28) return "Very weak";
  if (bits < 36) return "Weak";
  if (bits < 60) return "Reasonable";
  if (bits < 128) return "Strong";
  return "Very strong";
}

const SECOND = 1, MINUTE = 60, HOUR = 3600, DAY = 86400, MONTH = 2_592_000, YEAR = 31_536_000;

/** Humanize average crack time given entropy bits and attacker guesses/second. */
export function estimateCrackTime(bits: number, guessesPerSecond = 1e10): CrackTime {
  // Average guesses to find the secret is half the keyspace.
  const seconds = Math.pow(2, bits) / 2 / guessesPerSecond;
  return { seconds, text: humanizeSeconds(seconds) };
}

function humanizeSeconds(s: number): string {
  if (!Number.isFinite(s) || s > 1e17) return "centuries"; // effectively forever
  if (s < SECOND) return "instant";
  const units: [number, string][] = [
    [YEAR, "year"], [MONTH, "month"], [DAY, "day"], [HOUR, "hour"], [MINUTE, "minute"], [SECOND, "second"],
  ];
  for (const [size, name] of units) {
    if (s >= size) {
      const v = Math.round(s / size);
      if (name === "year" && v >= 1000) return v >= 1e6 ? "millions of years" : "centuries";
      return `${v} ${name}${v === 1 ? "" : "s"}`;
    }
  }
  return "instant";
}

function detectPool(password: string): number {
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^a-zA-Z0-9\s]/.test(password)) pool += 33; // common printable symbols
  if (/\s/.test(password)) pool += 1;
  // Characters outside the basic sets (accents, emoji, CJK …) widen the pool.
  if (/[^\x20-\x7e]/.test(password)) pool += 100;
  return pool;
}

/** Effective length after discounting runs of repeats and ascending/descending sequences. */
function effectiveLength(password: string): number {
  const chars = [...password];
  if (chars.length <= 1) return chars.length;
  let discount = 0;
  let runRepeat = 1;
  let runSeq = 1;
  for (let i = 1; i < chars.length; i++) {
    const prev = chars[i - 1] as string;
    const cur = chars[i] as string;
    runRepeat = cur === prev ? runRepeat + 1 : 1;
    const diff = cur.charCodeAt(0) - prev.charCodeAt(0);
    runSeq = diff === 1 || diff === -1 ? runSeq + 1 : 1;
    if (runRepeat >= 2) discount += 0.75; // each extra repeated char ≈ no new entropy
    else if (runSeq >= 3) discount += 0.75; // predictable sequence
  }
  return Math.max(1, chars.length - discount);
}

/** Estimate the strength of an arbitrary password. */
export function strength(password: string, guessesPerSecond = 1e10): Strength {
  const length = [...password].length;
  if (length === 0) {
    return { entropyBits: 0, poolSize: 0, length: 0, label: "Very weak", crackTime: { seconds: 0, text: "instant" } };
  }
  const poolSize = detectPool(password);
  const bits = Math.round(effectiveLength(password) * Math.log2(Math.max(2, poolSize)) * 100) / 100;
  return {
    entropyBits: bits,
    poolSize,
    length,
    label: strengthLabel(bits),
    crackTime: estimateCrackTime(bits, guessesPerSecond),
  };
}
