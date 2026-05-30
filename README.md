<div align="center">

# 🔐 entropass

### Generate strong, bias-free passwords — and actually measure their strength. Locally.

[![npm version](https://img.shields.io/npm/v/entropass.svg?color=success)](https://www.npmjs.com/package/entropass)
[![bundle size](https://img.shields.io/bundlephobia/minzip/entropass?label=gzip)](https://bundlephobia.com/package/entropass)
[![CI](https://github.com/didrod205/entropass/actions/workflows/ci.yml/badge.svg)](https://github.com/didrod205/entropass/actions/workflows/ci.yml)
[![types](https://img.shields.io/npm/types/entropass.svg)](https://www.npmjs.com/package/entropass)
[![license](https://img.shields.io/npm/l/entropass.svg)](./LICENSE)

**[🌐 Try the free web app →](https://didrod205.github.io/entropass/)** &nbsp;·&nbsp; generate & test passwords in your browser. Nothing is ever sent anywhere.

</div>

---

Two uncomfortable truths about passwords:

1. **Most online password generators are a terrible idea.** You're asking a
   stranger's server to mint (and potentially log) your secret. A password tool
   should run on *your* machine.
2. **Most password code is subtly insecure.** The everyday `chars[random % chars.length]`
   has **modulo bias** — some characters become more likely than others, shrinking
   the real keyspace. It "looks random," but it isn't uniform.

**entropass** fixes both. It uses the platform CSPRNG with **rejection sampling**
for truly uniform, bias-free output, tells you the **exact entropy and crack
time** of what it makes, and runs **100% locally** — zero dependencies, no
network, no API key.

> 📸 _Screenshot / demo GIF:_ `./web/screenshot.png` — record the [live app](https://didrod205.github.io/entropass/) generating a password and the strength bar reacting to options.

## Why it exists

- **AI can't do this.** A language model literally cannot produce
  cryptographically secure randomness — its output is predictable. Secure
  passwords must come from a CSPRNG, generated correctly. That's a precise,
  security-critical job for a small, audited tool.
- **Bias-free by construction.** Rejection sampling removes the modulo bias that
  plagues naive generators, so every character is equally likely.
- **It quantifies strength.** Not a vague "weak/strong" guess — real entropy in
  bits and an estimated crack time, so "looks complex" stops fooling anyone.

## Who it's for

**Everyone needs passwords:** developers (generate secrets/tokens/test fixtures
without a heavy dep), designers, marketers, ops and creators making accounts
daily, and anyone who wants a trustworthy, **offline** generator.

## Install

**No install —** just open the **[web app](https://didrod205.github.io/entropass/)**.

For the library:

```bash
npm install entropass
```

Zero dependencies. ESM + CJS + TypeScript types. Runs in the browser, Node 20+, Deno and Bun.

## Usage

```ts
import { generate, generatePronounceable, generatePin, strength } from "entropass";

generate({ length: 20, symbols: true });
// { password: "…", entropyBits: 131.0, poolSize: 90 }

generate({ length: 16, symbols: false, excludeAmbiguous: true });
// no O/0, l/1/I … (easier to read & type)

generatePronounceable({ length: 14 });   // { password: "Kobiranuxe83", … } — typeable
generatePin(6);                          // { password: "402915", … }

strength("correct horse battery staple");
// { entropyBits: …, label: "Strong", poolSize: …, crackTime: { text: "centuries" } }
```

### Measure entropy & crack time

```ts
import { entropyBits, estimateCrackTime, strength } from "entropass";

entropyBits(94, 16);            // 104.87  (length × log2(pool))
estimateCrackTime(80).text;     // human-readable estimate
strength("Password123!").label; // honest assessment (patterns are discounted)
```

### Unbiased randomness primitives

```ts
import { randomInt, randomItem, shuffle } from "entropass";

randomInt(6);                    // 0–5, uniform, no modulo bias
randomItem(["a", "b", "c"]);
shuffle([1, 2, 3, 4, 5]);        // secure Fisher–Yates
```

## API

| Function | Description |
| -------- | ----------- |
| `generate(options?)` | Random password; returns `{ password, entropyBits, poolSize }`. |
| `generatePronounceable(options?)` | Typeable consonant/vowel password. |
| `generatePin(length?)` | Numeric PIN. |
| `strength(password, gps?)` | Estimate entropy, label & crack time of any password. |
| `entropyBits(poolSize, length)` | Entropy for a uniform secret. |
| `estimateCrackTime(bits, gps?)` | Average crack time at `gps` guesses/sec. |
| `randomInt` / `randomItem` / `shuffle` | Bias-free CSPRNG primitives. |

`GenerateOptions`: `length`, `lowercase`, `uppercase`, `digits`, `symbols`,
`excludeAmbiguous`, `excludeChars`, `requireEachClass`.

## FAQ

**Is my password sent anywhere?**
No. Generation and strength checks happen entirely on your device — no server, no
telemetry, works offline. (That's the whole point.)

**What's "modulo bias" and why should I care?**
If you map a random 32-bit number into an alphabet with `value % length`, and the
alphabet size doesn't divide 2³², lower indices get chosen slightly more often.
entropass rejects out-of-range samples so every character is equally likely.

**How is crack time estimated?**
Average guesses (half the keyspace) divided by an attacker's rate (default 10
billion guesses/sec, a fast offline attack). It's an estimate to build intuition,
not a guarantee.

**How accurate is the strength meter for my own password?**
It estimates the character pool and discounts obvious repeats and sequences
(`aaaa`, `abc123`). It's a lightweight, dependency-free model — directional, not a
substitute for not reusing passwords and using a manager.

**Should I still use a password manager?**
Yes! entropass generates strong secrets; a manager stores them. Great together.

## Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) and the
[Code of Conduct](./CODE_OF_CONDUCT.md).

```bash
git clone https://github.com/didrod205/entropass.git
cd entropass
npm install
npm test          # run the suite
npm run dev       # run the web app locally
```

## 💖 Sponsor

entropass is free, MIT-licensed, and built in spare time. If it gave you
passwords you can trust, please consider supporting it:

- ⭐ **Star this repo** — free, and it genuinely helps others find it.
- 🍋 **[Sponsor via Lemon Squeezy](https://elab-studio.lemonsqueezy.com/checkout/buy/5d059b89-51d0-456b-b33a-ed56994f7010)** — one-time or recurring support.

**Where your support goes:** a wordlist-based passphrase mode (EFF diceware),
a stronger pattern-aware strength model, a CLI, a browser-extension build,
keeping the free web app online, and fast issue responses.

## License

[MIT](./LICENSE) © entropass contributors
