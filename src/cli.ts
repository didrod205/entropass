#!/usr/bin/env node
/**
 * entropass CLI — generate strong passwords & measure strength. Zero-dependency.
 *
 *   entropass                          # a strong 16-char password
 *   entropass -l 24 --symbols          # longer, with symbols
 *   entropass --pronounceable          # easier to type/remember
 *   entropass --pin -l 6               # a numeric PIN
 *   entropass strength "hunter2"       # rate an existing password
 *   entropass -n 5                     # generate 5 at once
 */

import { readFileSync } from "node:fs";
import {
  generate,
  generatePin,
  generatePronounceable,
  strength,
  type GenerateOptions,
} from "./index.js";
import pkg from "../package.json";

const HELP = `entropass — generate strong passwords & measure strength, 100% locally.

Usage:
  entropass [options]               Generate a password
  entropass strength <password>     Rate an existing password (or use stdin)

Options:
  -l, --length <n>     Length (default 16; PIN default 6)
  -n, --count <n>      Generate this many (default 1)
      --symbols        Include symbols
      --no-digits      Exclude digits
      --no-uppercase   Exclude uppercase
      --no-lowercase   Exclude lowercase
      --no-ambiguous   Drop look-alikes (O/0, l/1/I, …)
      --pronounceable  Generate a pronounceable password
      --pin            Generate a numeric PIN
      --bits           Also print entropy bits and crack-time
  -h, --help           Show this help
  -v, --version        Show version

Uses a cryptographic RNG. Nothing is transmitted — all local.`;

function has(argv: string[], ...names: string[]): boolean {
  return names.some((n) => argv.includes(n));
}
function val(argv: string[], ...names: string[]): string | undefined {
  for (const n of names) {
    const i = argv.indexOf(n);
    if (i !== -1) return argv[i + 1];
  }
  return undefined;
}

function readStdin(): string {
  try {
    return readFileSync(0, "utf8").trim();
  } catch {
    return "";
  }
}

function rate(password: string, showBits: boolean): void {
  const s = strength(password);
  if (showBits) {
    process.stdout.write(
      `${s.label}  (${s.entropyBits} bits, cracks in ~${s.crackTime.text})\n`,
    );
  } else {
    process.stdout.write(`${s.label}  (cracks in ~${s.crackTime.text})\n`);
  }
}

function main(): number {
  const argv = process.argv.slice(2);
  if (has(argv, "-h", "--help")) {
    process.stdout.write(HELP + "\n");
    return 0;
  }
  if (has(argv, "-v", "--version")) {
    process.stdout.write(`entropass ${pkg.version}\n`);
    return 0;
  }

  const showBits = has(argv, "--bits");

  // `strength` subcommand.
  if (argv[0] === "strength") {
    const pw = argv.slice(1).find((a) => !a.startsWith("-")) ?? readStdin();
    if (!pw) {
      process.stderr.write("entropass: provide a password to rate.\n");
      return 2;
    }
    rate(pw, showBits);
    return 0;
  }

  const length = val(argv, "-l", "--length");
  const count = Math.max(1, Number(val(argv, "-n", "--count") ?? "1") || 1);

  try {
    for (let i = 0; i < count; i++) {
      let result;
      if (has(argv, "--pin")) {
        result = generatePin(length ? Number(length) : 6);
      } else if (has(argv, "--pronounceable")) {
        result = generatePronounceable(length ? { length: Number(length) } : {});
      } else {
        const opts: GenerateOptions = {
          length: length ? Number(length) : 16,
          symbols: has(argv, "--symbols"),
          digits: !has(argv, "--no-digits"),
          uppercase: !has(argv, "--no-uppercase"),
          lowercase: !has(argv, "--no-lowercase"),
          excludeAmbiguous: has(argv, "--no-ambiguous"),
        };
        result = generate(opts);
      }
      const suffix = showBits ? `\t(${result.entropyBits} bits)` : "";
      process.stdout.write(result.password + suffix + "\n");
    }
    return 0;
  } catch (e) {
    process.stderr.write(`entropass: ${(e as Error).message}\n`);
    return 1;
  }
}

process.exit(main());
