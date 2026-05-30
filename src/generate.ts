/**
 * Password generators built on the unbiased CSPRNG: a classic character-class
 * password, a typeable pronounceable password, and a numeric PIN.
 */

import { entropyBits } from "./entropy.js";
import { randomInt, randomItem, shuffle } from "./random.js";

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?/";
const AMBIGUOUS = new Set("O0oIl1|`'\"{}[]()/\\;:.,".split(""));

export interface GenerateOptions {
  /** Total length. Default `16`. */
  length?: number;
  lowercase?: boolean;
  uppercase?: boolean;
  digits?: boolean;
  symbols?: boolean;
  /** Drop visually ambiguous characters (O/0, l/1/I, quotes, brackets…). Default `false`. */
  excludeAmbiguous?: boolean;
  /** Additional characters to exclude. */
  excludeChars?: string;
  /** Guarantee at least one character from each enabled class. Default `true`. */
  requireEachClass?: boolean;
}

export interface GeneratedPassword {
  password: string;
  entropyBits: number;
  poolSize: number;
}

function buildSets(o: GenerateOptions): string[] {
  const exclude = new Set([...(o.excludeChars ?? "")]);
  const filter = (set: string) =>
    [...set].filter((c) => !exclude.has(c) && !(o.excludeAmbiguous && AMBIGUOUS.has(c))).join("");

  const sets: string[] = [];
  if (o.lowercase !== false) sets.push(filter(LOWER));
  if (o.uppercase !== false) sets.push(filter(UPPER));
  if (o.digits !== false) sets.push(filter(DIGITS));
  if (o.symbols) sets.push(filter(SYMBOLS));
  return sets.filter((s) => s.length > 0);
}

/**
 * Generate a secure random password.
 *
 * ```ts
 * generate({ length: 20, symbols: true });
 * // { password: "…", entropyBits: …, poolSize: … }
 * ```
 */
export function generate(options: GenerateOptions = {}): GeneratedPassword {
  const length = options.length ?? 16;
  if (length < 1) throw new RangeError("entropass: length must be at least 1");

  const sets = buildSets(options);
  if (sets.length === 0) throw new RangeError("entropass: no character classes enabled");

  const pool = sets.join("");
  const requireEach = options.requireEachClass !== false;
  const chars: string[] = [];

  if (requireEach && length >= sets.length) {
    for (const set of sets) chars.push(randomItem(set));
  }
  while (chars.length < length) chars.push(randomItem(pool));

  shuffle(chars);
  return {
    password: chars.join(""),
    entropyBits: entropyBits(pool.length, length),
    poolSize: pool.length,
  };
}

const CONSONANTS = "bcdfghjklmnprstvwz";
const VOWELS = "aeiou";

export interface PronounceableOptions {
  /** Approximate length. Default `12`. */
  length?: number;
  /** Capitalize the first letter. Default `true`. */
  capitalize?: boolean;
  /** Append a random 2-digit number for password policies. Default `true`. */
  digits?: boolean;
}

/** Generate a pronounceable, typeable password (alternating consonant/vowel). */
export function generatePronounceable(options: PronounceableOptions = {}): GeneratedPassword {
  const target = options.length ?? 12;
  const digits = options.digits !== false;
  const letterCount = Math.max(3, digits ? target - 2 : target);

  let out = "";
  let bits = 0;
  for (let i = 0; i < letterCount; i++) {
    const useVowel = i % 2 === 1;
    const set = useVowel ? VOWELS : CONSONANTS;
    out += randomItem(set);
    bits += Math.log2(set.length);
  }
  if (options.capitalize !== false) {
    out = out.charAt(0).toUpperCase() + out.slice(1);
    bits += 1; // one bit for the case choice (first letter)
  }
  if (digits) {
    const n = randomInt(100);
    out += n.toString().padStart(2, "0");
    bits += Math.log2(100);
  }
  return { password: out, entropyBits: Math.round(bits * 100) / 100, poolSize: CONSONANTS.length + VOWELS.length };
}

/** Generate a numeric PIN. */
export function generatePin(length = 6): GeneratedPassword {
  if (length < 1) throw new RangeError("entropass: PIN length must be at least 1");
  let out = "";
  for (let i = 0; i < length; i++) out += randomInt(10).toString();
  return { password: out, entropyBits: entropyBits(10, length), poolSize: 10 };
}
