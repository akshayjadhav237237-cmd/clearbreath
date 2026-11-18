# ADR 002: Typed Result Error Handling Pattern

## Status

Accepted

## Context

Unhandled runtime exceptions cause unpredictable application failures, missing error states in user interfaces, and hidden failure paths. Relying on thrown exceptions across layer boundaries obscures the function signature and weakens compile-time safety.

## Decision

We adopt a typed `Result<T, E>` pattern for all operations that may fail across architectural boundaries:

- A `Result<T, E>` represents either a successful outcome `Ok<T>` or a domain-specific failure `Err<E>`.
- Domain operations, parsers, and external adapters must return `Result<T, E>` rather than throwing exceptions.
- Thrown exceptions (`throw`) are restricted strictly to unrecoverable invariant violations or bugs.
- Consuming layers explicitly unwrap results or pattern-match to provide informative, graceful UI feedback.

## Consequences

- Error states become an explicit part of TypeScript type signatures and contracts.
- Call sites cannot inadvertently ignore potential failure modes.
- Stack traces and unhandled promise rejections are avoided across boundary transitions.
