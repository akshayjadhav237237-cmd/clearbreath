# ADR 003: Port and Adapter Architecture for AI Integration

## Status

Accepted

## Context

Clearbreath leverages Generative AI (Gemini) to synthesize personalized smog advisories. Binding domain or UI layers directly to vendor SDKs or live network endpoints introduces non-deterministic test behavior, external network latency in CI, and tight coupling to specific third-party APIs.

## Decision

We apply the Ports and Adapters (Hexagonal Architecture) pattern for AI capabilities:

- Port contracts are defined in `src/ai/ports/` (e.g., `AiAdvisoryPort`) defining required request/response shapes using domain models and Result types.
- Production adapters are implemented in `src/ai/adapters/gemini/` using the official client SDK and prompt templates.
- Testable fake adapters are implemented in `src/ai/adapters/fake/` to provide deterministic, fast responses for unit and component testing.
- The composition root in `src/app` injects the appropriate adapter based on environment configuration.

## Consequences

- Unit and feature tests execute deterministically without external API keys or network dependencies.
- Changes in the underlying LLM provider or SDK version do not propagate to domain or UI logic.
- Prompt validation, schema parsing, and fallback strategies are modularized and testable in isolation.
