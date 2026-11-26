---
inclusion: always
---

# Frontend harness

Stack: React + TypeScript (strict) + Vite + Vitest + Testing Library. Package manager: npm.

## Design system

- `docs/toss.md` (TDS) is the design source of truth. Read its Do's and Don'ts and the relevant component section before building UI.
- `src/styles/tokens.css` is generated from the `toss.md` frontmatter. Never edit it. Run `npm run tokens` after changing `docs/toss.md`.
- Use `var(--color-*)`, `var(--space-*)`, `var(--radius-*)`, `var(--shadow-*)`. No raw hex, `rgb()`, or `oklch()` outside `tokens.css` (enforced by `npm run check:design`).
- Typography follows the `typography` ramp in `toss.md` (Pretendard).

## Code rules

- One component per folder-less file pair: `Name.tsx`, `Name.css`, `Name.test.tsx` in `src/components/`.
- No `any`. Accessible by default (eslint jsx-a11y is on). Query tests by role/name.

## Definition of done

Run `npm run check` (format, lint, typecheck, design guard, token freshness, tests). It must pass before reporting work as finished. The same command runs in pre-push and CI.
