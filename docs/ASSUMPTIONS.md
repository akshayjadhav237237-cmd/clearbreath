# Engineering Assumptions

This document records the foundational engineering assumptions for the Clearbreath project.

## Repository and Version Control

- Workspace initialization: Repository initialized with default branch `main` and GitHub remote `akshayjadhav237237-cmd/clearbreath`.
- GitHub workflows run automated verification on branch `main` for pushes and pull requests.

## Dependency and Version Management

- Exact package versions (without `^` or `~` ranges) are pinned in `package.json` and `package-lock.json` for reproducible builds (`npm ci --ignore-scripts`).
- Project dependency policy targeted packages published on or before `2026-11-04` (14-day cutoff prior to `2026-11-18`); individual npm registry publish timestamps were not re-queried online during freeze verification.

## Target Platform and Runtime

- Target platform: Modern Evergreen browsers supporting ES2022 and standard Web APIs (DOM, Fetch, Storage, Web Crypto).
- CI workflows (`.github/workflows/ci.yml` and `.github/workflows/pages.yml`) run on `Node.js 24` (verified locally on `v24.13.1`); `package.json` declares `"engines": { "node": ">=20" }`.

## Deployment Target

- Primary canonical deployment URL is `https://clearbreath-omega.vercel.app/` (matching `<link rel="canonical">`, OpenGraph metadata in `index.html`, and custom HTTP response headers in `vercel.json`).
- Secondary GitHub Pages mirror builds with `VITE_BASE: /clearbreath/` and serves at `https://akshayjadhav237237-cmd.github.io/clearbreath/` as static HTML/assets without `vercel.json` custom HTTP headers.

## External Services and Air Data Integration

- Live ambient air data queries Open-Meteo (`https://air-quality-api.open-meteo.com/v1/air-quality`) on initial `AirNowPanel` mount and city changes, passing static 2-decimal-place coordinates from the 12-city allowlist (`src/config/cities.ts`) and skipping refetch when live series for the active city are already cached in store state. On fetch failure or timeout fallback, `fetchAirDataWithFallback` falls back to `SampleProvider`; when `liveResult.error.code === 'aborted'` (`AbortError`), `fetchAirDataWithFallback` short-circuits without invoking `SampleProvider`.
- Synthetic diurnal simulation arrays in `src/ai/airdata/manual-provider.ts` (`DIURNAL_COEFFICIENTS`: `0.60–1.40`) and `src/ai/airdata/sample-provider.ts` (`WINTER_DIURNAL_FACTORS`: `0.60–1.50`) are internal deterministic fixtures for scenario simulation and testing rather than external empirical datasets.
- Cloud AI integration targets Google Gemini (`gemini-3.8-flash` via REST `FetchPort`) only when explicit user consent is enabled and an in-memory API key is provided (`ApiKeyHolder`); deterministic local templates (`LocalProvider`) handle unconsented, keyless, and fallback responses without external AI network calls.

## Target Persona

- Default persona is `DEFAULT_HOUSEHOLD_PERSONA` (`Sharma Family (Delhi-NCR)`) in `src/config/persona.ts`: three household members (`adult` with `respiratoryCondition: false`, `child` with `respiratoryCondition: true`, `older` with `respiratoryCondition: true`), 90 m² apartment (`average` sealing, 250 m³/h CADR purifier, kitchen exhaust, `png` cooking fuel), ₹5,000 monthly budget, 45 min/day outdoors, and a 12 km / 35 min `metro` commute.

## Domain Engine Assumptions

### AQI Calculation (Engine A)

- Sub-indices are computed using India CPCB NAQI standard linear piecewise interpolation.
- PM2.5 and PM10 24-hour average breakpoints are utilized; when both pollutants are present, the overall AQI is governed by the dominant pollutant (highest sub-index).

### Indoor Exposure & Mass Balance (Engine B)

- Indoor PM2.5 steady-state concentrations follow a well-mixed single-compartment mass balance model: $C_{in} = \frac{a \cdot P \cdot C_{out}}{a + k + \text{CADR}/V}$.
- Air exchange rate ($a$) depends on building envelope sealing class (leaky: 1.5/h, average: 0.8/h, tight: 0.35/h) per ASHRAE 62.2.
- Penetration factor ($P$) is taken as 0.8 across unsealed cracks; indoor surface deposition loss rate ($k$) is taken as 0.24/h per Thatcher & Layton.
- Mask effective filtration in `src/domain/exposure/constants.ts` (`MASK_EFFICIENCIES`) accounts for facial inward leakage (`n95`: nominal `9500` bps / `95%`, effective `8500` bps / `85%`; `surgical`: effective `4000` bps / `40%`; `cloth`: effective `1500` bps / `15%`). Separately, the outdoor transit catalog entry `act-outdoor-wear-n95-transit` in `src/domain/actions/outdoor.ts` uses `reductionBasisPoints: 9500` (nominal NIOSH rating) for catalog action quantification.
- Inhaled dose (`calculateInhaledDose` in `src/domain/exposure/inhaled-dose.ts`) uses `RESTING_BREATHING_RATES` per age group (`infant: 0.25`, `child: 0.5`, `adult: 0.75`, `older: 0.65` m³/h) according to the US EPA Exposure Factors Handbook; `getBreathingRate` additionally supports `'active'` for `'adult'` (`1.5` m³/h).

### Household Sensitivity Ordering (Engine C)

- Sensitivity ordering (`high`, `elevated`, `low`) is derived from member age groups and declared chronic respiratory conditions (`determineMemberSensitivity` in `src/domain/profile/sensitivity.ts`): any member with `respiratoryCondition: true` as well as `infant` and `older` members classify as `high`; `child` without `respiratoryCondition` classifies as `elevated`; `adult` without `respiratoryCondition` classifies as `low`.
- Household sensitivity defaults to the maximum sensitivity level among household members.
- No medical claims are asserted; sensitivity categorizations are operational risk classifications for advisory prioritization only.

### Diurnal Planning (Engine E)

- 24-hour diurnal temperature inversion profile in winter Delhi-NCR typically concentrates particulate pollution between 20:00 and 09:00, with minimum ambient pollution typically observed between 12:00 and 16:00.
- Missing hours in diurnal time-series (`src/domain/planner/interpolation.ts`) are filled using linear interpolation across interior gaps between known preceding and following hours, and flat boundary clamping (`prev` or `next` value) at leading or trailing edge gaps, without midnight wraparound (`23:00` to `00:00`).

### Action Recommendations & Emissions (Engine F & D)

- Action impact quantification aggregates daily inhaled dose reduction across household members.
- Two distinct commute emission factor tables (`g CO2e/passenger-km`) exist in `src/domain/` and are preserved as implemented:
  - `src/domain/actions/emissions.ts` (`COMMUTE_EMISSION_FACTORS`): `walk: 0`, `cycle: 0`, `metro: 18`, `bus: 45`, `twoWheeler: 75`, `autoRickshaw: 60`, `car: 140` (used by `calculateCommuteEmissionsGrams` and `calculateModalShiftSavingsGrams`).
  - `src/domain/recommend/constants.ts` (`COMMUTE_EMISSION_FACTORS`): `walk: 0`, `cycle: 0`, `metro: 18`, `bus: 35`, `twoWheeler: 45`, `autoRickshaw: 65`, `car: 150` (used by recommendation quantification).

## AI Layer Assumptions

### Allowlist Egress and Context Scoping

- Outbound browser requests target only Open-Meteo (receiving static 2-decimal-place `latitude`/`longitude` coordinates for the selected allowlisted city under `<meta name="referrer" content="no-referrer">` and Vercel `Referrer-Policy: no-referrer`, with no household fields or keys) and Gemini (receiving only the 13 allowlisted fields in `src/ai/privacy/disclosure.ts`, only after explicit user consent and an in-memory API key).
- To protect household details, member IDs, per-member respiratory flags, street addresses, exact rupee budgets, home dimensions, and CADR are excluded from AI prompts (`src/ai/privacy/context-builder.ts`).
- API keys are held in memory during an active browser session (`ApiKeyHolder` / `AssistantPanel` state) and are not written to disk, cookies, or `localStorage`.

### Grounding and Hallucination Mitigation

- Cloud LLM responses are treated as untrusted and must pass JSON schema parsing (`aiPlanNarrativeSchema` / `aiAnswerSchema`) and numerical/action-ID grounding validation (`src/ai/guard/grounding.ts`) before presentation.
- Any numeric claim in generated narratives must match an allowed numeric fact emitted by domain calculations (or built-in `{0, 1, 24}`). Unverified numbers trigger fallback to deterministic local templates.
- If external inference is unavailable, rate-limited, rejected, or unconsented by the user, the assistant falls back to deterministic local templates (`LocalProvider`).
