# Agent Operating Guide: Clearbreath

## Project Summary

Clearbreath is a GenAI-powered urban air quality advisory assistant designed to help families protect vulnerable members during winter smog episodes.

## Quality Contract

QUALITY CONTRACT:
max 200 lines per file; max 60 lines per function (90 TSX); complexity 10; max 4 params; named exports only; no any, no non-null assertions, no ts-ignore, no eslint-disable; Result<T,E> across layer boundaries; no console.*; one-line JSDoc on every public function; no TODO, no commented-out code; integer money and integer micrograms where units apply; injected Clock and IdGenerator ports; knip clean; Prettier enforced; LF endings.

## Layer Map

- `src/domain`: core domain entities, value objects, pure business rules.
- `src/shared`: cross-cutting utilities (Result, Ports).
- `src/config`: configuration constants and CSP.
- `src/ai`: AI ports, prompt templates, LLM client adapters.
- `src/features`: vertical slices containing feature logic, state, components.
- `src/app`: top-level application shell and routing.

## Commands

- `npm run dev`: Start local development server.
- `npm run build`: Build production assets to dist directory.
- `npm run typecheck`: Run TypeScript compiler checks without emitting files.
- `npm run lint`: Run ESLint checks.
- `npm run format:check`: Check code formatting with Prettier.
- `npm run test`: Run Vitest unit tests.
- `npm run test:coverage`: Run Vitest tests with coverage reporting.
- `npm run knip`: Detect unused files, dependencies, and exports.
- `npm run check`: Run complete verification suite.

## Unattended Operation

- Never ask questions.
- Record assumptions in docs/ASSUMPTIONS.md.
- Revert changes after 3 failed fixes on one problem.
- Never leave main red.
- Kill processes started during execution.
- No stray files in repo.
- No push after submission.
