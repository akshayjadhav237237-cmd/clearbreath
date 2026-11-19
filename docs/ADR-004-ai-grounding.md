# ADR 004: AI Grounding and Allowlist Egress Architecture

## Status

Accepted

## Context

Clearbreath integrates generative AI to explain winter smog advisories and answer household questions. Generative language models are prone to hallucination (e.g., inventing ungrounded particulate concentrations or unverified mitigation actions) and prompt injection. Furthermore, household air quality data may inadvertently leak sensitive user identifiers or behavioral telemetry to external cloud endpoints.

## Decision

We implement a dual-layer AI safety, grounding, and privacy architecture:

1. **Allowlist Egress (`LlmSafeContext`)**:
   - Only allowlisted categorical fields are forwarded to external LLMs: coarse city name, AQI category, sensitivity level, presence of broad age groups (infant/child/adult/older), housing type, sealing class, cooking fuel, commute mode, budget band, language, and verified domain facts.
   - Exact names, timestamps, coordinates, exact budgets, and floor area metrics are stripped.
   - API keys are held in memory (`ApiKeyHolder`) and not persisted to local storage or exported in telemetry.

2. **Strict Grounding Validation**:
   - Model responses must conform to strict JSON schemas (`aiPlanNarrativeSchema`, `aiAnswerSchema`).
   - Every referenced action ID is checked against the verified domain catalog.
   - Numerals appearing in generated responses must match verified grounding facts emitted by domain engines. Hallucinated numeric claims trigger automatic rejection.

3. **Multi-Stage Prompt Injection Defense**:
   - User inputs undergo NFKC normalization, control character removal, and regex filtering against known jailbreak/injection markers.

4. **Deterministic Local Fallback (`LocalProvider`)**:
   - If cloud inference is unavailable, rate-limited, times out, violates grounding, or lacks user consent, the orchestrator falls back to local deterministic template synthesis, tagging response provenance (`source: 'local'`, `fallbackReason`).

## Consequences

- Mitigates prompt injection, token leakage, and ungrounded health or air quality metrics.
- Enforces allowlist egress boundaries and user privacy expectations.
- Ensures application domain engines run in the browser without network calls after the page has loaded and without cloud credentials.
