# entropass — Product & Strategy

Why entropass exists, who it's for, how it's positioned, and how it could sustain itself.

## 1. Why this idea

Everyone creates passwords constantly, and the two common ways to get a "strong"
one are both flawed: online generators ask a stranger's server to mint your
secret (and may log it), and hand-rolled generator code usually has **modulo
bias** — `chars[random % chars.length]` quietly makes some characters more likely,
shrinking the real keyspace. People also can't tell a strong password from a
"looks complex" one.

entropass solves all three: a **bias-free** CSPRNG generator (rejection
sampling), **real entropy + crack-time** so strength stops being guesswork, and
**100% local** execution so nothing is transmitted. It's a "why didn't I use this
sooner?" tool with a crisp security story.

It fits every constraint: **AI can't replace it** (LLMs can't produce secure
randomness), **no server**, **no API key**, **runs in the browser or any JS
runtime**, immediate value, universal audience.

## 2. Competitor analysis

| Tool | What it does | Gaps entropass fills |
| ---- | ------------ | -------------------- |
| Online password generators | Generate in the browser/server | Trust problem (server may log); ads; rarely show real entropy |
| `generate-password` & similar npm libs | Generate strings | Some have modulo bias; no entropy/crack-time output; no app |
| zxcvbn | Excellent strength estimation | ~400 KB+ with data; estimation only (no generation); heavy |
| Password-manager generators | Generate in-app | Locked to the manager; not a reusable library or standalone tool |

**Nobody** combines a **tiny, zero-dependency, bias-free generator** *and* an
entropy/crack-time **strength meter** in one package + a friendly **local** app.

## 3. Differentiation

1. **Security-correct randomness** — documented rejection sampling, no modulo bias.
2. **Quantified strength** — entropy in bits + crack time, not vibes.
3. **Local-first** — a password tool that never sends your password anywhere.
4. **Generate + measure in one** — most tools do only one.
5. **Tiny & zero-dependency** — a fraction of zxcvbn's size; embeddable anywhere.

## 4. Folder structure

```
entropass/
├─ src/        random.ts (CSPRNG) · entropy.ts (strength) · generate.ts · index.ts
├─ test/       randomness-invariant, generator & strength tests
├─ web/        Vite generator + strength meter → docs/ (GitHub Pages)
├─ .github/    ci · release · pages workflows, templates, FUNDING
└─ README · LICENSE · CONTRIBUTING · CODE_OF_CONDUCT · CHANGELOG · PRODUCT
```

## 9. GitHub Topics

```
password, password-generator, passphrase, password-strength, entropy,
crack-time, csprng, secure-random, crypto, pin, security, zero-dependency
```

## 10. Product Hunt launch copy

**Tagline:** Strong, bias-free passwords with real entropy & crack-time — 100% local.

**Description:**
> Most online password generators ask a stranger's server to make your secret,
> and most password code has hidden "modulo bias" that quietly weakens it.
> entropass generates passwords correctly (rejection-sampled CSPRNG, no bias),
> shows you the real entropy and how long they'd take to crack, and runs entirely
> in your browser — nothing is ever sent anywhere.
>
> There's also a zero-dependency npm library so developers can generate secure
> secrets (and measure strength) without a heavy dependency.
>
> Free & open-source (MIT). 🔐

**First comment (maker):** "I read one too many password generators that did
`random % charset.length` (biased!) and one too many that uploaded your password.
So I built a tiny, correct, local one that also tells you how strong the result
actually is."

## 11. npm package name

- **Primary:** `entropass` (entropy + password; brandable, available).
- Discoverability via keyword topics & SEO below.

## 12. SEO keyword strategy

Intent-rich queries:

- "secure password generator", "password strength checker"
- "password entropy calculator", "how long to crack my password"
- "offline password generator", "pronounceable password generator"
- "bias-free random password javascript", "csprng password"
- "zxcvbn alternative lightweight"

Tactics: descriptive `<title>`/meta on the app (done), README phrasing,
explainer docs ("What is modulo bias?", "What entropy is strong enough?"),
GitHub topics, and the GitHub Pages app as an indexable landing page.

## 13. Monetization (without breaking the free, local promise)

Core stays free, open-source, local forever.

1. **Sponsorship** — Lemon Squeezy (wired up), with a clear "where it goes" note.
2. **Pro / integrations** — a paid browser extension (autofill-aware generation),
   a team "password policy" linter/CLI for CI, or an enterprise build with
   configurable policy presets.
3. **Funded features** — orgs sponsor a diceware/passphrase wordlist mode or a
   stronger pattern-aware strength model.

Guardrails: never transmit user passwords, never add telemetry, never weaken the
randomness, never paywall the existing generator or strength meter.
