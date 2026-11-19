# Engineering Assumptions

This document records the foundational engineering assumptions for the Clearbreath project.

## Repository and Version Control

- Workspace initialization: Repository initialized with default branch `main` and GitHub remote `akshayjadhav237237-cmd/clearbreath`.
- GitHub workflows run automated verification on branch `main` for pushes and pull requests.

## Dependency and Version Management

- Pinned package versions based on 14-day cutoff before 2026-11-18 (packages published on or before 2026-11-04).
- Exact package versions are pinned in `package.json` to ensure reproducible builds across development and CI.

## Target Platform and Runtime

- Target platform: Modern Evergreen browsers supporting ES2022 and standard Web APIs (DOM, Fetch, Storage, Web Crypto).
- Runtime environment for development and CI scripts is Node.js version 20 LTS.

## Deployment Target

- GitHub Pages deploy configured at path `/clearbreath/`.
- Assets and routing are configured to resolve relative to `/clearbreath/` base URL.

## External Services and AI Integration

- Gemini API key expected via environment or client configuration in later development steps.
- Deterministic fake adapters are used for local testing and CI verification without requiring live external API credentials.

## Target Persona

- Default persona is a multi-generational family household in Delhi-NCR during winter smog (parent, child, older adult).
- The default persona definition lives in `src/config/persona.ts` as the constant `DEFAULT_HOUSEHOLD_PERSONA`.

## Domain Engine Assumptions

### AQI Calculation (Engine A)

- Sub-indices are computed using India CPCB NAQI standard linear piecewise interpolation.
- PM2.5 and PM10 24-hour average breakpoints are utilized; when both pollutants are present, the overall AQI is governed by the dominant pollutant (highest sub-index).

### Indoor Exposure & Mass Balance (Engine B)

- Indoor PM2.5 steady-state concentrations follow a well-mixed single-compartment mass balance model: $C_{in} = \frac{a \cdot P \cdot C_{out}}{a + k + \text{CADR}/V}$.
- Air exchange rate ($a$) depends on building envelope sealing class (leaky: 1.5/h, average: 0.8/h, tight: 0.35/h) per ASHRAE 62.2.
- Penetration factor ($P$) is taken as 0.8 across unsealed cracks; indoor surface deposition loss rate ($k$) is taken as 0.24/h per Thatcher & Layton.
- Mask effective filtration accounts for facial inward leakage (N95 effective: 85%, Surgical effective: 40%, Cloth effective: 15%).
- Inhaled dose uses resting and active inhalation volumes per age group according to the US EPA Exposure Factors Handbook.

### Household Sensitivity Ordering (Engine C)

- Sensitivity ordering (`high`, `elevated`, `low`) is derived strictly from member age groups (infants and older adults classified as elevated or high) and declared chronic respiratory conditions.
- Household sensitivity defaults to the maximum sensitivity level among living members.
- No medical claims are asserted; sensitivity categorizations are operational risk classifications for advisory prioritization only.

### Diurnal Planning (Engine E)

- 24-hour diurnal diurnal temperature inversion profile in winter Delhi-NCR typically concentrates particulate pollution between 20:00 and 09:00, with minimum ambient pollution typically observed between 12:00 and 16:00.
- Missing hours in diurnal time-series are imputed using linear boundary-wrapped interpolation.

### Action Recommendations & Emissions (Engine F & D)

- Action impact quantification aggregates daily inhaled dose reduction across household members.
- Commute modal shift emissions use standard vehicle emission factors from CPCB and DMRC corporate sustainability reports.

## AI Layer Assumptions

### Allowlist Egress and Context Scoping

- To safeguard household privacy, exact user names, street addresses, precise financial budgets, and room dimensions are not transmitted to cloud LLM endpoints.
- AI context (`LlmSafeContext`) is limited to coarse categorical fields (city, housing type, sealing class, age categories present, commute mode, budget tier) and verified numeric facts derived from pure domain calculations.
- API keys are held in memory during an active browser session (`ApiKeyHolder`) and are not written to disk, cookies, or localStorage.

### Grounding and Hallucination Mitigation

- Cloud LLM outputs are treated as untrusted and must pass JSON schema parsing and strict numerical grounding verification before presentation.
- Any numeric claim in generated narratives must match an allowed numeric fact emitted by domain calculations. Unverified numbers trigger fallback to deterministic local templates.
- If external inference is unavailable, rate-limited, rejected, or unconsented by the user, the assistant falls back to deterministic local templates (`LocalProvider`).
