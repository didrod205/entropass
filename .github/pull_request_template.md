## Summary

<!-- What does this PR change and why? -->

## Checklist

- [ ] Randomness stays CSPRNG-based and bias-free (no `Math.random`, no `% n`)
- [ ] Tests added or updated (randomness invariants; generator/strength behavior)
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
- [ ] Public API stays minimal and zero-dependency
- [ ] No password is ever transmitted
- [ ] CHANGELOG updated (for user-facing changes)
