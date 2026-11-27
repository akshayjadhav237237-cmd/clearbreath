# Engineering Assumptions

This document records the foundational engineering assumptions for the Clearbreath project.

## Repository and Version Control

- Workspace initialization: Repository initialized with default branch `main` and GitHub remote `akshayjadhav237237-cmd/clearbreath`.
- GitHub workflows run automated verification on branch `main` for pushes and pull requests.

## Dependency and Version Management

- Exact package versions (without `^` or `~` ranges) are pinned in `package.json` and `package-lock.json` for reproducible builds (`npm ci --ignore-scripts`).
- Pass 2 security updates pinned `zod@4.6.7` (imported via `'zod/mini'` to keep initial JS within the `75 KiB` gzip budget while resolving `GHSA-mrhx-c7xc-m3w5`) and upgraded dev tooling to `vitest@4.1.12`, `@vitest/coverage-v8@4.1.12` (published `2026-10-15`), and `vite@6.4.5` (published `2026-10-21`), clearing production vulnerabilities (`0`) and dev critical/high advisories (`0`).
- Remaining `9` moderate dev-only advisories in `minimatch` (`>=7.0.0 <11.0.1`, `GHSA-g3hv-75wg-m249`) sit inside the pinned `eslint@9.39.5` linting toolchain (`typescript-eslint`, `eslint-plugin-import-x`, `eslint-plugin-sonarjs`) and are retained untouched under the pinned-major policy without runtime exposure.

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

## Citation Access Posture

- Official India CPCB citations were migrated from legacy `cpcb.nic.in` (whose TLS certificate expired on `2026-11-17`) to `https://cpcb.gov.in/` (verified `200 OK` on `2026-11-27`).
- The official ASHRAE Standard 62.2 page (`https://www.ashrae.org/technical-resources/standards-and-guidelines`) presents a Cloudflare HTTP `403` bot challenge to non-browser automated checks; the US DOE PNNL Building America Solution Center mirror (`https://basc.pnnl.gov/library/standard-622-2022-ventilation-and-acceptable-indoor-air-quality-residential-buildings`) is verified HTTP `200 OK`.
- Elsevier DOI citations (`10.1016/1352-2310(95)00016-R` and `10.1016/S2542-5196(20)30298-9`) resolve `302 -> 200` via `linkinghub.elsevier.com` (prior to ScienceDirect's Cloudflare gate) and `200 OK` via CrossRef metadata (`api.crossref.org`).

## Target Persona

- Default persona is `DEFAULT_HOUSEHOLD_PERSONA` (`Sharma Family (Delhi-NCR)`) in `src/config/persona.ts`: three household members (`adult` with `respiratoryCondition: false`, `child` with `respiratoryCondition: true`, `older` with `respiratoryCondition: true`), 90 m² apartment (`average` sealing, 250 m³/h CADR purifier, kitchen exhaust, `png` cooking fuel), ₹5,000 monthly budget, 45 min/day outdoors, and a 12 km / 35 min `metro` commute.

## Domain Engine Assumptions

### Headline AQI Selector & Fallback Parity

- All active panels read the headline reading and daily plan through shared selectors (`selectCurrentReading`, `selectCurrentAqi`, `selectDayPlan`, `selectAqiAndPlan` in `src/shared/state/selectors.ts`), indexing `HEADLINE_HOUR = 12` (noon local city time / IST in `timezone=auto` series).
- Shared selector parity spans Header (`App.tsx`), Air Now (`AirNowPanel`), Daily Plan & Print view (`PlanPanel` -> `SmogDayPlanPrint`), Recommendations (`RecommendationsPanel`), Compare (`buildCompareViewModel` -> `ComparePanel`), Assistant (`AssistantPanel`), and Community (`CommunityPanel`).
- When no valid fetched or cached 24-hour series is present (`hourlySeries` is `null`, empty, or invalid), selectors fall back to deterministic `FALLBACK_HOURLY_READINGS` (noon `pm25: 84`, `pm10: 140`, `FALLBACK_AQI: 180` Moderate), while failed live fetches in `AirNowPanel` surface `SampleProvider` marked with the UI `"Simulated Data"` (`isSample: true`) badge.

### AQI Calculation (Engine A)

- Sub-indices are computed using India CPCB NAQI standard linear piecewise interpolation.
- PM2.5 and PM10 24-hour average breakpoints are utilized; when both pollutants are present, the overall AQI is governed by the dominant pollutant (highest sub-index).

### Indoor Exposure & Mass Balance (Engine B)

- Indoor PM2.5 steady-state concentrations follow a well-mixed single-compartment mass balance model: $C_{in} = \frac{a \cdot P \cdot C_{out}}{a + k + \text{CADR}/V}$.
- `purifierActive` is derived dynamically from `profile.home.purifierCadrM3h !== null` (`resolveExposureContext` in `src/domain/recommend/dose-quantification.ts` and `evaluateActionDose` in `src/domain/recommend/compare.ts`), applying `purifierCadrM3h` inside `calculateIndoorPm25` only when non-null and exposing active CADR vs `"No active purifier"` status in `ComparePanel` assumptions.
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

### Action Recommendations, Scenario Modeling & Emissions (Engine F & D)

- Action impact quantification aggregates daily inhaled dose reduction across household members.
- `act-indoor-no-incense-candles` (`src/domain/actions/indoor.ts`) is explicitly marked `confidence: 'low'` (`formulaId: 'incense-combustion-elimination'`, `-45%` / `4500` bps indoor combustion elimination heuristic) and emits `INCENSE_COMBUSTION_ASSUMPTION` (`src/domain/recommend/quantification.ts`, `src/domain/recommend/scenario.ts`) noting that the steady-state ambient mass-balance model includes no indoor combustion emission term and assumes regular prior indoor incense or candle burning.
- `summarizeScenario` (`src/domain/recommend/scenario.ts`) combines multiple eligible `indoorPm25Reduction` and `exposureReduction` effects multiplicatively (`combineSurvivalFactors`) and enforces integer domain bounds (`toInteger`, `clampInteger(..., 0, 10000)` for combined mask/exposure basis points, `clampInteger(rawMitigatedDose, 0, baselineDoseUg)`, and non-negative integer micrograms/rupees/grams).
- Modelled estimate disclosures (`"Modelled estimate under stated assumptions; actual exposure varies with real-world ventilation and emission sources."` and `SmogDayPlanPrint` non-clinical disclaimer) are rendered visibly across Actions cards, `"Why this?"` drawers, Compare views, and Print outputs in English and Hindi.
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
