# ADR 001: Clean Architecture Layered Structure and Boundaries

## Status

Accepted

## Context

Clearbreath requires a robust and maintainable architecture separating core domain logic, external integrations, and user interface components. Smog calculations, risk thresholds, and advisory models must not depend on external frameworks, API clients, or UI rendering libraries.

## Decision

We enforce a strict Clean Architecture layered organization with explicit inward dependency flow:

- `src/domain`: Core domain models, entities, value objects, and pure business rules. It has zero external dependencies.
- `src/shared`: Cross-cutting utility primitives including `Result<T, E>`, type guards, and core ports (e.g., Clock, IdGenerator).
- `src/config`: Static configuration values, environment constants, and Content Security Policy directives.
- `src/ai`: AI ports, prompt templates, and adapter implementations for Gemini LLM integration.
- `src/features`: Vertical slices encapsulating feature-specific state, components, and workflows.
- `src/app`: Top-level application shell, routing, and composition root wiring dependencies.

Dependencies must strictly point inward. Domain and shared modules never import from features or app modules.

## Consequences

- Domain logic is pure, deterministic, and independently verifiable with high-speed unit tests.
- UI or framework migrations do not alter business domain rules.
- Boundaries prevent circular dependencies and tangled concerns.
