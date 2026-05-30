# Changelog

All notable changes to this project are documented in this file. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0]

### Added

- Initial release.
- `randomInt` / `randomItem` / `shuffle` — bias-free CSPRNG primitives
  (rejection sampling, secure Fisher–Yates).
- `generate` — random password with character-class options, ambiguous-character
  exclusion, and guaranteed class coverage; returns entropy & pool size.
- `generatePronounceable` and `generatePin`.
- `strength` — entropy, label, and crack-time estimate for any password (with
  repeat/sequence discounting); plus `entropyBits` and `estimateCrackTime`.
- Free, local-only web app (generator + strength meter) deployed to GitHub Pages.
- Zero runtime dependencies; ESM + CJS + TypeScript types.

[Unreleased]: https://github.com/didrod205/entropass/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/didrod205/entropass/releases/tag/v0.1.0
