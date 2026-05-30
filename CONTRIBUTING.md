# Contributing to entropass

Thanks for taking the time to contribute! 🎉 entropass is a **security** tool, so
correctness and a tiny, auditable surface are the priorities.

## Getting started

```bash
git clone https://github.com/didrod205/entropass.git
cd entropass
npm install
```

| Command | What it does |
| ------- | ------------ |
| `npm test` | Run the test suite (Vitest). |
| `npm run test:watch` | Re-run tests on change. |
| `npm run typecheck` | Type-check without emitting. |
| `npm run build` | Build the library (`dist/`). |
| `npm run build:web` | Build the web app (`docs/`). |
| `npm run dev` | Run the web app locally (`vite`). |

## Good contributions

- **EFF diceware passphrase mode** (bundled wordlist, attribution preserved).
- **A stronger, still-dependency-free strength model** (more pattern detection).
- **A CLI** and/or a **browser-extension** build.

## Rules of the road

1. **Never weaken the randomness.** All secret generation must go through the
   CSPRNG and stay bias-free (rejection sampling) — no `Math.random`, no `% n`.
2. Every change needs tests. Assert ranges/invariants for randomness (e.g. "all
   outputs in `[0, max)`", "covers the full range"), not specific values.
3. `npm run typecheck` and `npm test` must pass.
4. Keep the package **zero-dependency** and the API small.
5. The web app and library must never transmit a password anywhere.

## Reporting bugs

Open an issue with the function, the options used, and what you expected vs. got.
**Never paste a real password** you use anywhere.

By contributing you agree your contributions are licensed under the project's
[MIT License](./LICENSE).
