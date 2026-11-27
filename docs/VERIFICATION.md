# Clearbreath Verification Report

Pass 2 verification audit at HEAD `c6de9fc` (`c6de9fce0da1eeb156b90081ba0ac49691e624e7`, `2026-11-27 UTC`, Node.js `v24.13.1`, Windows `win32 x64` fresh clone and live Vercel deployment `https://clearbreath-omega.vercel.app/`).

## 1. Automated Verification Suite Summary (`c6de9fc` Fresh Clone)

| Check Category           | Command                   | Observed Result (`c6de9fc`)                                                                                                              | Status     |
| :----------------------- | :------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------- | :--------- |
| Fresh Clone Install      | `npm ci --ignore-scripts` | `492` packages added, `493` audited (`16.04s`)                                                                                           | PASS       |
| TypeScript Typecheck     | `npm run typecheck`       | `0` errors (`tsc -b --noEmit`)                                                                                                           | PASS       |
| ESLint (Flat Config)     | `npm run lint`            | `0` errors, `0` warnings (`eslint .`)                                                                                                    | PASS       |
| Prettier Formatting      | `npm run format:check`    | Clean format check (LF, 2 spaces)                                                                                                        | PASS       |
| Knip Hygiene Scan        | `npm run knip`            | `0` unused files, dependencies, or exports                                                                                               | PASS       |
| Code Duplication (JSCPD) | `npm run dup`             | `128` files (`33` tsx, `95` typescript; `11,610` lines, `54,800` tokens), `0` clones (`0.00%`)                                           | PASS       |
| Production Build         | `npm run build`           | `vite v6.4.5` transformed `264` modules in `1.95s`                                                                                       | PASS       |
| Bundle Budget            | `npm run bundle:check`    | Initial JS `index-3HT6T3Nc.js` `70.28 KiB` vs `75 KiB`; CSS `index-BiJrkDKd.css` `5.57 KiB` vs `20 KiB`; lazy chunks `0.92–10.39 KiB`    | PASS       |
| Unit & Integration Tests | `npm run test:coverage`   | `63` test files passed, `370` tests passed (`vitest v4.1.12`, `23.31s`)                                                                  | PASS       |
| Real Chromium E2E Tests  | `npm run e2e`             | `4` spec files, `18` tests passed (`19.8s` in fresh clone)                                                                               | PASS       |
| Production Audit         | `npm audit --omit=dev`    | `0` vulnerabilities (`zod@4.6.7` via `zod/mini` resolves `GHSA-mrhx-c7xc-m3w5`)                                                          | PASS       |
| Full Dependency Audit    | `npm audit --json`        | `0` critical, `0` high, `9` moderate dev-only (`minimatch` `7.0.0 - 11.0.0`, `GHSA-g3hv-75wg-m249`, under pinned `eslint 9.x` toolchain) | DOCUMENTED |

## 2. Test Coverage, Bundles & File Line-Count Metrics

Recorded via `@vitest/coverage-v8` (`4.1.12`) in the clean fresh-clone run on commit `c6de9fc` (`2026-11-27 UTC`):

- **Statements**: `97.33%` (Threshold: `90%`)
- **Branches**: `89.25%` (Threshold: `85%`)
- **Functions**: `96.76%` (Threshold: `90%`)
- **Lines**: `97.93%` (Threshold: `90%`)
- **Test Files**: `63` passed (`0` failed)
- **Tests**: `370` passed (`0` failed)
- **Coverage Tooling Note**: `@vitest/coverage-v8` `4.1.12` includes `src/index.css`, barrel `index.ts` re-exports, and pure type-only `.ts` modules in the `All files` aggregate denominator while clearing every configured coverage threshold.

Bundle gzip sizes (`c6de9fc`, measured via `node scripts/check-bundle.mjs` in binary `KiB`):

- **Initial JS (`index-3HT6T3Nc.js`)**: `70.28 KiB` (Budget: `75 KiB`)
- **Stylesheet (`index-BiJrkDKd.css`)**: `5.57 KiB` (Budget: `20 KiB`)
- **Lazy Chunks (`40 KiB` budget each)**: `assistant-D99zSLsZ.js` `10.39 KiB`, `plan-DKcc6FOb.js` `8.26 KiB`, `compare-action-titles-BmGtZU5h.js` `5.72 KiB`, `compare-BvXB1wbs.js` `5.70 KiB`, `recommendations-94mP4urQ.js` `5.39 KiB`, `catalog-BYZ_Mm_M.js` `4.37 KiB`, `catalog-hi-CNdmKKCf.js` `2.79 KiB`, `household-BKCkXYkb.js` `2.39 KiB`, `community-B98X9Spj.js` `0.92 KiB`

Repository file and line counts on commit `c6de9fc`:

- **Git-tracked files**: `260` total (`156` in `src/`, `66` in `tests/`, `4` in `e2e/`, `1` in `scripts/`).
- **Scanned code/test/script files** (`src`, `tests`, `e2e`, `scripts`): `227` files; `0` files exceed `200` lines (maximum `200` lines in `src/features/recommendations/why-this-drawer.tsx`).

## 3. Real Chromium End-to-End Suite

Executed via Playwright (`1.64.1`) against the production build (`npm run e2e`, `18` passed across `4` spec files on `c6de9fc`):

1. `e2e/a11y.spec.ts` (`9` Chromium `@axe-core/playwright` scenarios, `wcag2a/aa/21aa/22aa/best-practice`, asserting `0` violations and `0` `aria-prohibited-attr` incomplete nodes):
   - Household form with validation errors visible (`0` violations).
   - Severe-day mode with mocked Open-Meteo severe PM2.5/PM10 series (`0` violations).
   - Assistant panel with consent switch enabled and key field visible (`0` violations).
   - Grounding Facts dialog open (`0` violations).
   - Hindi language across the `7` navigation panels (`0` violations).
   - `forced-colors` media emulation (`0` violations).
   - `reduced-motion` media emulation (`0` violations).
   - `200%` zoom viewport at `640x400` (`0` violations).
   - Dark color scheme across the `7` navigation panels (`0` violations).
2. `e2e/keyboard.spec.ts` (`3` specs):
   - Skip-to-content link activation and focus transfer to `#main-content`.
   - Tab navigation across header controls and navigation buttons without keyboard traps.
   - Keyboard focus and activation on plan export controls.
3. `e2e/privacy.spec.ts` (`2` specs):
   - `0` requests to `generativelanguage.googleapis.com` when AI consent is off, and `0` CSP console errors.
   - Entered API key absent from `localStorage` and rendered `body.innerText`.
4. `e2e/flows.spec.ts` (`4` specs):
   - Smog-day planning workflow and `clearbreath-plan.csv` export download.
   - Recovery to `DEFAULT_HOUSEHOLD_PERSONA` with user notice on corrupted `localStorage` JSON.
   - Selected city persistence across browser reloads.
   - Light/dark theme switching under OS `prefers-color-scheme: dark`.

## 4. Live Vercel Deployment Audits (`c6de9fc`)

All Pass 2 live audits targeted `https://clearbreath-omega.vercel.app/` after verifying byte-for-byte `index.html` parity with the `c6de9fc` build (`2,157` bytes, SHA256 `44E7AD0680ECC6B101601FD9727713C10D767B5B79FECB452D8403DEB9F6CF36`).

### 4.1 Lighthouse Audits (Mobile & Desktop, `2026-11-27 UTC`)

Executed with Lighthouse `13.5.0`, Node `v24.13.1`, and Headless Chrome `159.0.8154.33`:

| Profile | Timestamp (UTC)            | Perf  | A11y  | BP    | SEO   | Agentic | TTFB     | Core Web Vitals (FCP / LCP / TBT / CLS / SI)     |
| :------ | :------------------------- | :---- | :---- | :---- | :---- | :------ | :------- | :----------------------------------------------- |
| Mobile  | `2026-11-27T16:47:06.462Z` | `100` | `100` | `100` | `92`  | `100`   | `71 ms`  | `1.2 s` / `1.2 s` / `0 ms` / `0.00003` / `1.2 s` |
| Desktop | `2026-11-27T16:47:30.695Z` | `92`  | `100` | `100` | `100` | `100`   | `805 ms` | `0.8 s` / `0.8 s` / `0 ms` / `0.00001` / `2.8 s` |

- **Diagnostic Notes**: Mobile SEO `92` resulted from the `robots-txt` gatherer timing out after `2,016 ms` over the audit host's NAT64 IPv6 path (direct IPv4 check returned HTTP `404 Not Found` in ~`280 ms`, which Desktop Lighthouse marked `notApplicable`). Desktop Performance `92` reflected the `805 ms` `server-response-time` observed over the host NAT64 IPv6 path. `unused-javascript` flagged `26 KiB` estimated savings on `index-3HT6T3Nc.js`, and `render-blocking-insight` flagged `index-BiJrkDKd.css` (`6,204` B mobile / `6,178` B desktop transfer).

### 4.2 Live Axe-Core Accessibility Audit (`29` UI States)

Audited on `2026-11-27T16:47:01.326Z` via Playwright Chromium + `@axe-core/playwright` (`axe-core v4.14.0`) at `1280x800` using tags `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa, best-practice` (and cross-checked with the default ruleset):

- **Violations**: `0` rules, `0` nodes across all `29` states (`11` EN Light states, `10` HI Light states, and `8` EN Dark states, including Household budget validation error, Actions with `"Why this?"` drawer expanded, AI Advisor Consent OFF/ON, and Grounding Facts modal open).
- **Incomplete (Needs Review) Items**: `191` nodes across `44` rule entries, consisting exclusively of `color-contrast` on single-character glyph/symbol elements (`ⓘ`, `▾`, `▴`, `✕`) and `label-content-name-mismatch` on icon buttons (`🌙`/`☀️` theme toggle and `✕` dialog close button).
- **`aria-prohibited-attr` & Runtime Errors**: `0` `aria-prohibited-attr` nodes, `0` console errors, `0` page errors.

### 4.3 Live UI, AQI, Hindi, Export & Privacy Consistency (`45/45`)

Audited on `2026-11-27T16:46:46.630Z` (`45` assertions passed, `0` failed):

- **Unified Hour-12 AQI & Window Parity**: Open-Meteo `200 OK` telemetry for Delhi (`pm25: 86`, `pm10: 88`, AQI `186` Moderate, outdoor window `15:00 – 16:00` avg `115`), Noida (`pm25: 62`, `pm10: 65`, AQI `104` Moderate, window `14:00 – 15:00` avg `90`), and Lucknow (`pm25: 112`, `pm10: 117`, AQI `273` Poor, `Stay Indoors`) matched identically across Header, Air Now, Daily Plan, Actions, Compare, Grounding Facts modal, Community, and Print view (`0` stale mock numbers).
- **Household, Actions & Compare Parity**: Preset switching (`Pune Student`: `LOW RISK`, `1` member, `25 m²`, `Leaky`, `Induction`, `No active purifier`; `Mumbai Senior`: `CADR 200 m³/h`, `75 m²`, `tight`, `2 km`), negative budget validation error, Actions header totals matching toggled cards (`637 µg/day`, `720 g CO2e/day`), Compare baseline/mitigated parity (`0` actions baseline=mitigated; `2` actions `1,447 -> 810 µg/day`), Action Comparison Picker verdict updates, and visible estimate/assumption disclosures all passed.
- **Hindi Localization & Exports**: Full `html[lang="hi"]` localization across all `7` panels, Print view, Grounding Facts modal, local AI response (`स्रोत: स्थानीय इंजन`), and EN restoration passed. EN/HI CSV (`26` rows, `2,776` B EN, `0` unsafe formula prefixes), EN/HI ICS (`953` B EN, RFC 5545 CRLF/`VCALENDAR`/`VEVENT`/`RRULE`, max line `75` octets), and JSON (`758` B valid `HouseholdProfile`) exports passed.
- **Privacy & Egress**: `0` requests to `generativelanguage.googleapis.com` with AI consent OFF, entered API key absent from `localStorage` and DOM, `0` console/page errors, and outbound requests strictly to `clearbreath-omega.vercel.app` and `air-quality-api.open-meteo.com`.

### 4.4 Live Security Headers, Console/Network & Demo Video

- **HTTP Security Headers (`2026-11-27T16:46:24.181Z`)**: Vercel (`https://clearbreath-omega.vercel.app/`, `200 OK`) served all `6/6` configured `vercel.json` headers:
  - `Content-Security-Policy`: `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://generativelanguage.googleapis.com https://api.open-meteo.com https://air-quality-api.open-meteo.com; base-uri 'self'; form-action 'self'; object-src 'none'; frame-ancestors 'none'`
  - `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload`
  - `X-Content-Type-Options`: `nosniff`
  - `X-Frame-Options`: `DENY`
  - `Referrer-Policy`: `no-referrer`
  - `Permissions-Policy`: `camera=(), microphone=(), geolocation=()`
  - `Cache-Control`: `public, max-age=0, must-revalidate`
  - HTML `<meta http-equiv="Content-Security-Policy">` matched `src/config/csp.ts` on both Vercel and GitHub Pages (`https://akshayjadhav237237-cmd.github.io/clearbreath/`, HTTP `200`, `index.html` SHA256 `d3e68fe8ee970c1d19ccf6709bf2c7a059eaeebace5630e3721f880f83b15a37`, static hosting without `vercel.json` headers).
- **Live Console/Network Walkthrough (`2026-11-27T16:46:24Z`)**: Across all `7` panels, `Why this?` drawer, AI consent toggle, Grounding Facts modal, Hindi switch, and dark theme toggle (`13` requests across `2` origins: `12` to `clearbreath-omega.vercel.app`, `1` to `air-quality-api.open-meteo.com`, `0` to `generativelanguage.googleapis.com`): `0` console errors, `0` console warnings, `0` `pageerror`, `0` `requestfailed`, and `0` HTTP `>= 400` responses.
- **Pass 2 Demo Recording (`demo-v2.mp4`)**: `10`-scene live walkthrough against `https://clearbreath-omega.vercel.app/` verified via `ffprobe`: `96.07s` (`96.066667s` stream duration), H.264 High (`avc1`), `yuv420p`, `1280x720`, `30 fps` (`r_frame_rate=30/1`, `2,882` frames), `moov` atom preceding `mdat` (`faststart`), `2,344,764` bytes (`SHA256: 35DD9E1B8BDE5FDE3E0975F0195ACB9E98F497F14657FF7D2818D4E69FB3E244`), `0` console errors, `0` page errors, and all `10` extracted keyframes visually verified.

## 5. Egress, Estimate Disclosure & Input Controls

- **Content Security Policy**: Enforced in `index.html` and `vercel.json` (`tests/csp-sync.test.ts` checks parity with `src/config/csp.ts`), restricting `connect-src` to `'self' https://generativelanguage.googleapis.com https://api.open-meteo.com https://air-quality-api.open-meteo.com`.
- **Allowlist Scrubbing**: Identifiers, exact ages, GPS coordinates, street addresses, exact budgets, and home dimensions are excluded prior to LLM prompt formulation (`src/ai/privacy/disclosure.ts`, `src/ai/privacy/context-builder.ts`).
- **Formula Injection Sanitized CSV**: Export sanitization prefixes leading `=`, `+`, `-`, `@`, `\t`, and `\r` with `'`.
- **Estimate Disclosure & Provenance**: Modelled action and compare outputs carry visible `"Modelled estimate under stated assumptions; actual exposure varies with real-world ventilation and emission sources."` notices in English and Hindi (`src/shared/i18n/en.ts`, `src/shared/i18n/hi.ts`, `src/shared/i18n/compare-dict.ts`, `src/shared/i18n/actions-dict.ts`), while `act-indoor-no-incense-candles` carries `confidence: 'low'` and an explicit prior-combustion assumption note.

## 6. Dependency Audit Posture

- **Production (`npm audit --omit=dev`)**: `0` vulnerabilities (`zod@4.6.7` imported via `'zod/mini'` resolved `GHSA-mrhx-c7xc-m3w5` within the `75 KiB` initial JS budget).
- **Development (`npm audit --json`)**: `vitest@4.1.12`, `@vitest/coverage-v8@4.1.12`, and `vite@6.4.5` resolved critical and high dev advisories (`0` critical, `0` high). The remaining `9` moderate dev-only advisories trace to `minimatch` (`7.0.0 - 11.0.0`, `GHSA-g3hv-75wg-m249`) inside the pinned `eslint 9.x` toolchain (`typescript-eslint` `8.72.1`, `eslint-plugin-import-x` `4.17.1`, `eslint-plugin-sonarjs` `4.2.2`) and carry no runtime exposure.

## 7. Explicitly Unverified Scope

- **Live Gemini API Execution**: Gemini live call not verified (`GEMINI_API_KEY` not present during audit; only static request-builder checks and mocked `FetchPort` provider unit tests ran).
- **Physical Mobile Devices**: Mobile layout (`320x640`) and Mobile Lighthouse (`13.5.0`) were verified in Headless Chromium emulation rather than physical mobile hardware.
