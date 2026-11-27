# Clearbreath: GenAI Urban Air Quality Assistant

[![CI](https://github.com/akshayjadhav237237-cmd/clearbreath/actions/workflows/ci.yml/badge.svg)](https://github.com/akshayjadhav237237-cmd/clearbreath/actions)
[![Pages](https://github.com/akshayjadhav237237-cmd/clearbreath/actions/workflows/pages.yml/badge.svg)](https://akshayjadhav237237-cmd.github.io/clearbreath/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Clearbreath is a GenAI-powered urban air quality advisory assistant designed to help families and communities navigate severe winter smog episodes. Live app: [https://clearbreath-omega.vercel.app/](https://clearbreath-omega.vercel.app/) (GitHub Pages mirror: [https://akshayjadhav237237-cmd.github.io/clearbreath/](https://akshayjadhav237237-cmd.github.io/clearbreath/)).

## Vertical & Persona

- **Vertical**: Family and community air-quality planning during seasonal winter smog episodes.
- **Default Persona**: Codified in `src/config/persona.ts` as `DEFAULT_HOUSEHOLD_PERSONA` (`Sharma Family (Delhi-NCR)`): `adult` (`respiratoryCondition: false`), `child` (`respiratoryCondition: true`), and `older` (`respiratoryCondition: true`), in a 90 m² apartment (`average` sealing, 250 m³/h CADR purifier, kitchen exhaust, `png` cooking fuel), 12 km / 35 min `metro` commute, 45 min/day outdoors, and ₹5,000 monthly mitigation budget.

## Problem Map

| Challenge                    | Solution Module                                     | Verification                                                                       |
| :--------------------------- | :-------------------------------------------------- | :--------------------------------------------------------------------------------- |
| Severe PM2.5 / PM10 Spikes   | Diurnal 24-hr planner & ventilation windows         | `tests/domain/planner/planner.test.ts`                                             |
| Inhaled Particulate Toxicity | Physical dose engine (`V_E × C_in × t`)             | `tests/domain/exposure/dose.test.ts`                                               |
| Indoor Infiltration Controls | Mass-balance infiltration and DIY air cleaner model | `tests/domain/exposure/exposure.test.ts`                                           |
| Transit Smog Exposure        | Low-emission commute ranker & CO2e calculator       | `tests/domain/recommend/recommend.test.ts`, `tests/domain/actions/actions.test.ts` |
| Community Awareness          | WhatsApp & RWA broadcast copy generator             | `tests/features/community.test.tsx`                                                |
| Grounding & Data Controls    | Grounding fact injector & allowlist scrubber        | `tests/ai/guard/guard.test.ts`                                                     |

## Architecture & Data Flow

```mermaid
graph TD
  A[Open-Meteo Air Quality API] --> B[Domain Engines: AQI, Exposure, Planner, Catalog]
  B --> C[Grounding Facts & Allowlist Context Builder]
  C --> D{User Consent & Key?}
  D -- No / Local Fallback --> E[Deterministic Local Template Engine]
  D -- Yes + In-Memory Key --> F[Gemini 3.8 Flash Grounded Invoker]
  E --> G[Zustand Store & Versioned Persistence]
  F --> G
  G --> H[7 Feature Panels: AirNow, Household, Plan, Actions, Compare, Assistant, Community]
```

India CPCB NAQI breakpoints and advisories execute in the browser from static domain tables, while Open-Meteo supplies hourly PM2.5 and PM10 readings (with deterministic `SampleProvider` fallback on fetch error). **Gemini live call not verified** (`GEMINI_API_KEY` not present during audit; only static request-builder and mocked `FetchPort` provider tests ran); `LocalProvider` handles deterministic responses when consent or an in-memory key is absent.

Modelled mitigation action reductions (`Actions`) and scenario comparisons (`Compare`) display visible UI wording `"estimate under stated assumptions"` in both English and Hindi (alongside `formulaId`, `sourceIds`, and `assumptions` metadata on action cards and `"estimated cost-effectiveness"` wording). See [docs/ASSUMPTIONS.md](docs/ASSUMPTIONS.md) for model parameters and documented domain/UI simplifications.

## Data Egress & Allowlist Disclosure

Cloud AI is optional and domain calculations run in the browser; outbound browser requests target only Open-Meteo (receiving static 2-decimal-place coordinates for the selected city on load or change) and Gemini (receiving only the allowlisted fields below, only after explicit consent and an in-memory API key).

<!-- privacy:start -->

| Field              | Purpose                                                                        | Example                                 |
| ------------------ | ------------------------------------------------------------------------------ | --------------------------------------- |
| `city`             | Selects local climatological and baseline AQI parameters.                      | `Delhi`                                 |
| `aqiCategory`      | Directs severity and urgency of outdoor activity advisories.                   | `severe`                                |
| `aqiValue`         | Provides ambient diurnal particulate index.                                    | `430`                                   |
| `sensitivityLevel` | Calibrates vulnerability threshold for elder and child guidance.               | `high`                                  |
| `ageGroupsPresent` | Shapes protective guidance by age cohort without exposing member identities.   | `["child", "older"]`                    |
| `homeType`         | Informs dwelling infiltration estimates.                                       | `apartment`                             |
| `sealing`          | Determines building envelope air exchange rate.                                | `average`                               |
| `cookingFuel`      | Evaluates indoor combustion particulate sources.                               | `png`                                   |
| `commuteMode`      | Identifies transit exposure and carbon mitigation opportunities.               | `metro`                                 |
| `budgetBand`       | Filters viable intervention actions without revealing exact rupee figures.     | `medium`                                |
| `language`         | Instructs response language preference.                                        | `en`                                    |
| `facts`            | Supplies calculated mathematical and catalog evidence to ground output claims. | `[{ id: "act-indoor-seal-gaps", ... }]` |
| `question`         | Transmits sanitized question text only when user submits a query.              | `Should we run the purifier tonight?`   |

<!-- privacy:end -->

## Quality & Verification Matrix

| Criterion                 | Implementation & Measured Outcome                                                                                                                                                                                                                 | Verified Artifacts                                        |
| :------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------- |
| **Code Quality**          | 200 lines/file max, 60 lines/fn (`.ts`) / 90 lines/fn (`.tsx`), 0 `any`, 0 `!`, 0 clones (`110` files analyzed)                                                                                                                                   | `npm run check`, `npm run dup`                            |
| **Problem Alignment**     | CPCB NAQI breakpoints, ASHRAE/EPA mass-balance infiltration, EPA dose calculations, visible `"estimate under stated assumptions"` UI notes                                                                                                        | `src/domain/`, `src/features/`, `docs/ASSUMPTIONS.md`     |
| **Egress & Headers**      | Allowlist egress, strict CSP & `6/6` Vercel HTTP headers (`2026-11-26 UTC`), memory-only API key isolation                                                                                                                                        | `e2e/privacy.spec.ts`, `tests/ai/privacy/privacy.test.ts` |
| **Efficiency & Bundles**  | Initial JS `70.64 KiB` gzip vs `75 KiB` budget; lazy chunks `1.20–9.25 KiB` vs `40 KiB`; CSS `5.41 KiB` vs `20 KiB` (`a9ddf94`); browser domain engines                                                                                           | `scripts/check-bundle.mjs`                                |
| **Testing & Coverage**    | `61` test files (`339` unit tests passing), `18` Chromium E2E specs across `4` files; CI (`a9ddf94`) coverage: `98.53%` stmts / `92.63%` branches (`8e71232` clean clone: `98.54%` stmts)                                                         | `npm run check`, `npm run e2e`, `docs/VERIFICATION.md`    |
| **Accessibility**         | `0` axe-core violations & `0` `aria-prohibited-attr` incomplete nodes (`a9ddf94`: `18` Chromium E2E specs + `12` live Vercel scans; resolves `29` defects from the `33`-scan `b3f8066` audit)                                                     | `e2e/a11y.spec.ts`, `docs/VERIFICATION.md`                |
| **Live Lighthouse**       | Mobile (`2026-11-26 UTC`, pre-Phase-B): `100 / 100 / 100 / 100` across `3` sequential runs (`80–220 ms` TTFB); earlier cold-TTFB run `84 / 100 / 100 / 100` (`1,230 ms` TTFB, Agentic `100`); Performance varies with server response time (TTFB) | `docs/VERIFICATION.md`                                    |
| **Dependency Advisories** | `19` `npm audit` advisories (`1` prod high `zod <4.6.6` pinned `3.25.76`; `18` dev: `3` critical, `1` high, `14` moderate); `0` same-major patch fixes exist under pinned majors                                                                  | `package.json`, `docs/VERIFICATION.md`                    |

## Commands

- `npm run dev`: Local Vite development server.
- `npm run build`: Production build into `dist/`.
- `npm run check`: Complete quality verification (`typecheck`, `lint`, `format:check`, `test:coverage`, `knip`, `dup`, `build`, `bundle:check`).
- `npm run e2e`: Real Chromium end-to-end tests via Playwright (`18` specs).

## Attribution & License

- Air quality data powered by [Open-Meteo](https://open-meteo.com/) under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- Breakpoints and health advisories based on India CPCB National Air Quality Index.
- Licensed under the [MIT License](LICENSE).
