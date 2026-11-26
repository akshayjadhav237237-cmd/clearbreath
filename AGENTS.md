# Agent Operating Guide: Clearbreath

## Project Summary

Clearbreath is a GenAI-powered urban air quality advisory assistant designed to help families protect vulnerable members during winter smog episodes.

## Quality Contract

QUALITY CONTRACT:
max 200 lines per file; max 60 lines per function (90 TSX); complexity 10; max 4 params; named exports only; no any, no non-null assertions, no ts-ignore, no eslint-disable; Result<T,E> across layer boundaries; no console.*; one-line JSDoc on each exported non-barrel function in src/; no TODO, no commented-out code; integer money and integer micrograms where units apply; injected Clock and IdGenerator ports; knip clean; jscpd 0 clones; bundle budgets clean; Prettier enforced; LF endings.

## Layer Map

- `src/domain`: core domain entities, value objects, and pure business rules (`aqi`, `exposure`, `planner`, `actions`, `profile`, `recommend`).
- `src/shared`: cross-cutting utilities (`Result`, `ports.ts`, browser storage port, i18n dictionaries, shared UI primitives).
- `src/config`: static configuration constants, 12-city coordinates, default household persona/presets, and CSP policy.
- `src/ai`: AI contracts, air-data providers (`OpenMeteoProvider`, `SampleProvider`, `ManualProvider`), egress allowlist, sanitization/grounding guards, runtime helpers, and LLM/local providers (`GeminiProvider`, `LocalProvider`).
- `src/persistence`: versioned `localStorage` adapter, Zod state schema, and schema migrations (`clearbreath_state_v1`).
- `src/exports`: CSV formula-sanitized export, RFC 5545 ICS calendar export, JSON profile export/import, and browser download helper.
- `src/features`: vertical slices (`air-now`, `household`, `plan`, `recommendations`, `compare`, `assistant`, `community`, `print`) containing feature UI and state hooks.
- `src/app`: top-level application shell, Zustand store, and persistence sync (`App.tsx`, `store.ts`, `storage-sync.ts`).

## Commands

- `npm run dev`: Start local development server (`vite`).
- `npm run build`: Build production assets to `dist/` (`vite build`).
- `npm run preview`: Preview production build locally (`vite preview`).
- `npm run typecheck`: Run TypeScript compiler checks without emitting files (`tsc -b --noEmit`).
- `npm run lint`: Run ESLint checks (`eslint .`).
- `npm run format`: Format workspace files with Prettier (`prettier --write .`).
- `npm run format:check`: Check code formatting with Prettier (`prettier --check .`).
- `npm run test`: Run Vitest unit tests (`vitest run`).
- `npm run test:coverage`: Run Vitest tests with V8 coverage thresholds (`vitest run --coverage`).
- `npm run knip`: Detect unused files, dependencies, and exports (`knip`).
- `npm run dup`: Check code duplication with JSCPD (`jscpd src --threshold 3 --min-lines 8 --reporters console`).
- `npm run bundle:check`: Verify gzipped JS/CSS bundle budgets (`node scripts/check-bundle.mjs`).
- `npm run e2e`: Run Playwright Chromium end-to-end tests (`playwright test`).
- `npm run check`: Run complete verification suite (`typecheck`, `lint`, `format:check`, `test:coverage`, `knip`, `dup`, `build`, `bundle:check`).

## Unattended Operation

- Do not ask questions.
- Record assumptions in docs/ASSUMPTIONS.md.
- Revert changes after 3 failed fixes on one problem.
- Do not leave main red.
- Kill processes started during execution.
- No stray files in repo.
- No push after submission.
