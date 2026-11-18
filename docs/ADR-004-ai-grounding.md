# ADR 004: AI Grounding and Zero-PII Ingress Architecture

## Status

Accepted

## Context

Clearbreath integrates generative AI to explain winter smog advisories and answer household questions. Generative language models are prone to hallucination (e.g., inventing ungrounded particulate concentrations or unverified mitigation actions) and prompt injection. Furthermore, household air quality data may inadvertently leak sensitive user identifiers or behavioral telemetry to external cloud endpoints.

## Decision

We implement a dual-layer AI safety, grounding, and privacy architecture:

1. **Zero-PII Ingress (`LlmSafeContext`)**:
   - Only allowlisted categorical fields are forwarded to external LLMs: coarse city name, AQI category, sensitivity level, presence of broad age groups (infant/child/adult/older), housing type, sealing class, cooking fuel, commute mode, budget band, language, and verified domain facts.
   - Exact names, timestamps, coordinates, exact budgets, and floor area metrics are strictly stripped.
   - API keys are held exclusively in memory (`ApiKeyHolder`) and never persisted to local storage or exported in telemetry.

2. **Strict Grounding Validation**:
   - Model responses must conform to strict JSON schemas (`aiPlanNarrativeSchema`, `aiAnswerSchema`).
   - Every referenced action ID is checked against the verified domain catalog.
   - Numerals appearing in generated responses must match verified grounding facts emitted by domain engines. Hallucinated numeric claims trigger automatic rejection.

3. **Multi-Stage Prompt Injection Defense**:
   - User inputs undergo NFKC normalization, control character removal, and regex filtering against known jailbreak/injection markers.

4. **Deterministic Offline Fallback (`LocalProvider`)**:
   - If cloud inference is unavailable, rate-limited, times out, violates grounding, or lacks user consent, the orchestrator seamlessly falls back to local deterministic template synthesis, tagging response provenance (`source: 'local'`, `fallbackReason`).

## Consequences

- Prevents prompt injection, token leakage, and hallucinated health or air quality metrics.
- Complies with zero-PII egress principles and user privacy expectations.
- Ensures the application remains fully functional offline and without cloud credentials.
