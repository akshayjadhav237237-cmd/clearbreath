# Clearbreath Verification Report

Verification audit covering latest CI and Phase B commit `a9ddf94` (`a9ddf945ba8a13eb26620aa139ee52592f62443e`, `2026-11-27 UTC`, Node.js `v24.13.1`) alongside pre-Phase-B baselines on `8e71232` / `b3f8066` (`2026-11-26 UTC` – `2026-11-27 UTC`).

## 1. Automated Verification Suite Summary

| Check Category           | Command                 | Observed Result (`a9ddf94` unless noted)                                                                                                   | Status     |
| :----------------------- | :---------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- | :--------- |
| TypeScript Typecheck     | `npm run typecheck`     | `0` errors (`tsc -b --noEmit`)                                                                                                             | PASS       |
| ESLint (Flat Config)     | `npm run lint`          | `0` errors, `0` warnings (`eslint .`)                                                                                                      | PASS       |
| Prettier Formatting      | `npm run format:check`  | Clean format check (LF, 2 spaces)                                                                                                          | PASS       |
| Knip Hygiene Scan        | `npm run knip`          | `0` unused files, dependencies, or exports                                                                                                 | PASS       |
| Code Duplication (JSCPD) | `npm run dup`           | `110` files (`27` tsx, `83` ts; `9,004` lines, `42,256` tokens), `0` clones (`0.00%`)                                                      | PASS       |
| Bundle Budget            | `npm run bundle:check`  | Initial JS `index-B2yjhirt.js` `70.64 KiB` vs `75 KiB`; CSS `index-C-3sX0Ru.css` `5.41 KiB` vs `20 KiB`; lazy chunks `1.20–9.25 KiB`       | PASS       |
| Unit & Integration Tests | `npm run test:coverage` | `61` test files passed, `339` tests passed (`16.17s` in CI run `45943610330`; `19.62s` local)                                              | PASS       |
| Real Chromium E2E Tests  | `npm run e2e`           | `4` spec files, `18` tests passed (`18.9s` local; `1m34s` CI job; `14.7s` on `8e71232` fresh clone)                                        | PASS       |
| Lighthouse Mobile Audit  | `npx lighthouse <url>`  | `2026-11-26 UTC` (pre-Phase-B): `100 / 100 / 100 / 100` (`3` runs, `80–220 ms` TTFB); earlier cold run `84 / 100 / 100 / 100` (`1,230 ms`) | PASS       |
| Dependency Advisories    | `npm audit --omit=dev`  | `1` prod high (`zod <4.6.6`); `19` total with dev deps (`3` critical, `2` high, `14` moderate); `0` same-major patches under pinned majors | DOCUMENTED |

## 2. Test Coverage, Bundles & File Line-Count Metrics

Recorded via `@vitest/coverage-v8` from GitHub Actions CI run `45943610330` on commit `a9ddf94` (`2026-11-27 UTC`, clean Linux checkout without spaces in the workspace path):

- **Statements**: `98.53%` (Threshold: `90%`)
- **Branches**: `92.63%` (Threshold: `85%`)
- **Functions**: `98.63%` (Threshold: `90%`)
- **Lines**: `98.53%` (Threshold: `90%`)
- **Test Files**: `61` passed (`0` failed)
- **Tests**: `339` passed (`0` failed)
- **Clean-Clone Baseline (`8e71232`, `2026-11-26 UTC`)**: `98.54%` statements, `92.77%` branches, `98.63%` functions, `98.54%` lines across `61` test files and `338` tests.
- **Note on Local Checkout Variance**: Running `npm run test:coverage` locally under `D:\Akshay\Antigravity\VPW CH6` (`a9ddf94`) reported `94.47%` statements, `92.31%` branches, `97.27%` functions, and `94.47%` lines because a directory path containing spaces (`VPW CH6`) causes `@vitest/coverage-v8` to count pure type-only `.ts` files (`src/ai/orchestrator/types.ts`, `src/domain/contracts-core.ts`, `src/domain/exposure/types.ts`, `src/domain/recommend/types.ts`, `src/shared/i18n/types.ts`) as `0%` covered. Reported project coverage figures come from CI or a clean clone without spaces in the path.

Bundle gzip sizes (`a9ddf94`, measured via `node scripts/check-bundle.mjs` in binary `KiB`):

- **Initial JS (`index-B2yjhirt.js`)**: `70.64 KiB` (Budget: `75 KiB`)
- **Stylesheet (`index-C-3sX0Ru.css`)**: `5.41 KiB` (Budget: `20 KiB`)
- **Lazy Chunks (`40 KiB` budget each)**: `assistant-B1oeHSLd.js` `9.25 KiB`, `plan-lWhXYkuo.js` `6.88 KiB`, `catalog-QmVmKAXH.js` `4.18 KiB`, `engine-OoD1El2N.js` `3.07 KiB`, `recommendations-BUFeNj4H.js` `2.14 KiB`, `compare-FcS2iUg0.js` `1.60 KiB`, `household-BjR1aWZy.js` `1.55 KiB`, `community-BafUK3FA.js` `1.20 KiB`

Repository file and line counts on commit `a9ddf94`:

- **Git-tracked files**: `241` total (`139` in `src/`, `64` in `tests/` including `61` test suites, `4` in `e2e/`, `1` in `scripts/`).
- **Scanned code/test/script files** (`src`, `tests`, `e2e`, `scripts`): `208` files; `0` files exceed `200` lines (maximum `197` lines excluding trailing newline in `tests/gap/airdata-and-runtime.test.ts`).

## 3. Real Chromium End-to-End Suite

Executed via Playwright against the production build (`npm run e2e`, `18 passed` across `4` spec files on `a9ddf94`):

1. `e2e/a11y.spec.ts` (9 Chromium `@axe-core/playwright` scenarios, `wcag2a/aa/21aa/22aa/best-practice`, asserting `0` violations and `0` `aria-prohibited-attr` incomplete nodes):
   - Household form with validation errors visible (`0` violations).
   - Severe-day mode with mocked Open-Meteo severe PM2.5/PM10 series (`0` violations).
   - Assistant panel with consent switch enabled and key field visible (`0` violations).
   - Grounding Facts dialog open (`0` violations).
   - Hindi language across the 7 navigation panels (`0` violations).
   - `forced-colors` media emulation (`0` violations).
   - `reduced-motion` media emulation (`0` violations).
   - `200%` zoom viewport at `640x400` (`0` violations).
   - Dark color scheme across the 7 navigation panels (`0` violations).
2. `e2e/keyboard.spec.ts` (3 specs):
   - Skip-to-content link activation and focus transfer to `#main-content`.
   - Tab navigation across header controls and navigation buttons without traps.
   - Keyboard focus verification on plan CSV export control.
3. `e2e/privacy.spec.ts` (2 specs):
   - `0` requests to `generativelanguage.googleapis.com` when AI consent is off, and `0` CSP console errors.
   - Entered API key absent from `localStorage['clearbreath_state_v1']` and rendered `body.innerText`.
4. `e2e/flows.spec.ts` (4 specs):
   - Smog-day planning workflow and `clearbreath-plan.csv` export download.
   - Graceful reset to `DEFAULT_HOUSEHOLD_PERSONA` with user notice on corrupted `localStorage` JSON.
   - Selected city persistence across browser reloads.
   - Light/dark theme switching under OS `prefers-color-scheme: dark`.

## 4. Live Deployment Audits

### 4.1 Mobile Lighthouse Audits (`2026-11-26 UTC`, pre-Phase-B)

Audited in mobile Headless Chromium simulation prior to Phase B commit `a9ddf94`. Performance scores vary with server response time (TTFB):

| Audit Run / Target                                          | Timestamp (UTC)            | Lighthouse | Perf  | A11y  | BP    | SEO   | Agentic Browsing | Server Response (TTFB) | Core Web Vitals (FCP / LCP / TBT / CLS / SI) |
| :---------------------------------------------------------- | :------------------------- | :--------- | :---- | :---- | :---- | :---- | :--------------- | :--------------------- | :------------------------------------------- |
| Live Vercel (`https://clearbreath-omega.vercel.app/`)       | `2026-11-26T10:20:02.762Z` | `13.5.0`   | `84`  | `100` | `100` | `100` | `100`            | `1,230 ms` (`1.2 s`)   | `2.6 s` / `2.6 s` / `0 ms` / `0` / `9.8 s`   |
| Local Preview SEO Check (`http://127.0.0.1:52577/`)         | `2026-11-26T18:24:23.923Z` | `13.5.0`   | `—`   | `—`   | `—`   | `100` | `—`              | `—`                    | Other categories not run in SEO-only check   |
| Live Vercel Run 1 (`https://clearbreath-omega.vercel.app/`) | `2026-11-26T19:52:14.723Z` | `13.6.0`   | `100` | `100` | `100` | `100` | `—`              | `80 ms`                | `0.8 s` / `0.8 s` / `80 ms` / `0` / `2.1 s`  |
| Live Vercel Run 2 (`https://clearbreath-omega.vercel.app/`) | `2026-11-26T19:52:29.900Z` | `13.6.0`   | `100` | `100` | `100` | `100` | `—`              | `220 ms`               | `0.9 s` / `0.9 s` / `70 ms` / `0` / `1.9 s`  |
| Live Vercel Run 3 (`https://clearbreath-omega.vercel.app/`) | `2026-11-26T19:52:44.629Z` | `13.6.0`   | `100` | `100` | `100` | `100` | `—`              | `110 ms`               | `0.8 s` / `0.8 s` / `80 ms` / `0` / `1.3 s`  |

### 4.2 Axe-Core Accessibility Audits (Pre-Fix `b3f8066` vs Post-Phase-B `a9ddf94`)

- **Pre-Fix A2 Baseline (`b3f8066`, `2026-11-26T19:32:05Z–19:35:01Z`, `axe-core 4.14.0`, tags `wcag2a, wcag2aa, wcag21aa, wcag22aa, best-practice`)**:
  - `0` violations, `1,319` passes, `0` runtime errors, and `0` horizontal overflow (`scrollWidth <= clientWidth`) across `33` live scans (`10` UI states including `320x640` mobile, `640x400` 200% zoom, `forced-colors`, `reduced-motion`, dark scheme, and Hindi panels).
  - `173` raw / `50` deduplicated `incomplete` nodes were adjudicated (`a2-axe-adjudicate`) as:
    - `29` real `aria-prohibited-attr` defects: `MetricCard` tooltip icon `<span>` (`6` elements: `3` on `Air Now`, `3` on `Compare`) and `ConfidenceMeter` outer `<div>` (`23` elements on `Actions`).
    - `21` deduplicated `color-contrast` false positives verified passing WCAG AA (`10.35:1` light, `12.02:1` dark, `21.00:1` forced-colors) across non-BMP `ⓘ`/`✕` symbol glyphs, forced-colors `-webkit-text-fill-color` reading on `Print` buttons, and horizontally scrolled `320px` mobile navigation tabs.
- **Post-Phase-B Fix & Verification (`a9ddf94`, `2026-11-27 UTC`)**:
  - Added `role="img"` to the `MetricCard` tooltip icon `<span>` (`src/shared/ui/metric-card.tsx`) and removed the duplicate `aria-label` from the `ConfidenceMeter` outer `<div>` while keeping `aria-label` on the child `<div role="progressbar">` (`src/shared/ui/confidence-meter.tsx`).
  - Verified `0` violations and `0` `aria-prohibited-attr` incomplete nodes across local/CI Playwright E2E (`18` tests), Vitest JSDOM unit tests (`tests/a11y.test.tsx`, `tests/ui/ui-kit.test.tsx`), and `12` live Vercel Chromium scans covering the `7` light panels, `3` dark English panels (`Air Now`, `Actions`, `Compare`), and `2` dark Hindi panels (`Actions`, `Compare`).
  - Remaining `color-contrast` incomplete count in the `12` post-fix live scans is `3` non-BMP `ⓘ` glyphs on `Air Now` (light and dark), previously adjudicated at `10.35:1` (light) and `12.02:1` (dark), passing WCAG AA.

### 4.3 HTTP Headers, Console/Network, Walkthrough & CI/CD Parity

- **HTTP Headers (`2026-11-26T19:19:51Z`, `8e71232` live Vercel)**: `https://clearbreath-omega.vercel.app/` returned `200 OK` with `6/6` configured response headers matching `vercel.json` (`Content-Security-Policy` including `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`). HTML `<title>`, description, canonical link, `<meta name="referrer">`, and `<meta http-equiv="Content-Security-Policy">` match across `index.html`, Vercel, and GitHub Pages (`https://akshayjadhav237237-cmd.github.io/clearbreath/`, HTTP `200`, static hosting without `vercel.json` headers).
- **Console & Network Walkthrough (`2026-11-26 UTC`, pre-Phase-B live Vercel)**: `0` console errors, `0` warnings, `0` pageerrors, `0` `"Refused to"` CSP messages; `14` requests across `2` origins (`https://clearbreath-omega.vercel.app` and `https://air-quality-api.open-meteo.com`), `0` failed requests, `0` HTTP `>= 400` responses, `0` Gemini requests with consent disabled, and `0` Open-Meteo requests when revisiting `Air Now` after `Daily Plan`.
- **Live Walkthrough Recording (`2026-11-27 UTC`, `b3f8066` live Vercel)**: 10-scene Chromium walkthrough (`97.43s` H.264 MP4, `2,924,122` bytes, `1280x720`, `0` console errors, caption fade-out verified programmatically) inspected across `10` extracted frames (`Air Now`, `Household`, `Daily Plan`, `Actions`, `Compare`, Hindi/English toggle, `AI Advisor` local mode, `Print` preview, and end card).
- **CI/CD & Live Build Parity (`a9ddf94` and `8e71232`)**: On `a9ddf94`, GitHub Actions `CI` (`45943610330`) and `Deploy to GitHub Pages` (`45943782467`) completed with `success`; live Vercel served `index.html` SHA256 `B99CCE328A43F866F5AB61937E9828AD2781C5FEFB3B2C744165224209B1CBFD`, matching the local `a9ddf94` build byte-for-byte. (Earlier `8e71232` clean clone passed `npm ci --ignore-scripts`, `npm run check`, and `npm run e2e` with `dist/index.html` SHA256 `4a2b01d4c1f2a51755f70d4556075e2ec5b46208d0447dd3cd749286d56fadfa`, CI `45882187502`, Pages `45882419852`.)

## 5. Egress, Estimate Disclosure & Input Controls

- **Content Security Policy**: Enforced in `index.html` and `vercel.json` (`tests/csp-sync.test.ts` checks parity with `src/config/csp.ts`), restricting `connect-src` to `'self' https://generativelanguage.googleapis.com https://api.open-meteo.com https://air-quality-api.open-meteo.com`.
- **Allowlist Scrubbing**: Identifiers, exact ages, GPS coordinates, street addresses, exact budgets, and home dimensions are excluded prior to LLM prompt formulation (`src/ai/privacy/disclosure.ts`, `src/ai/privacy/context-builder.ts`).
- **Formula Injection Sanitized CSV**: Export sanitization prefixes leading `=`, `+`, `-`, `@`, `\t`, and `\r` with `'`.
- **Estimate Disclosure (`7b8e845`)**: Modelled action and compare outputs carry visible UI wording `"estimate under stated assumptions"` in English and Hindi (`src/shared/i18n/en.ts`, `src/shared/i18n/hi.ts`), surfaced on `ComparePanel` (`CompareHeader`) and `RecommendationItemCard` (alongside `explanation` `formulaId`, `sourceIds`, and `assumptions`), while `RecommendationsPanel` labels ranking `"estimated cost-effectiveness"`.

## 6. Dependency Advisory Audit (`npm audit`)

Audited on `2026-11-27 UTC` (`npm audit --json` and `npm audit --omit=dev`): `19` total advisories, with `0` same-major patch or minor upgrades available under currently pinned majors:

- **Production (`--omit=dev`)**: `1` high advisory (`zod <4.6.6`, GHSA-mrhx-c7xc-m3w5, pinned `3.25.76` in `package.json`), which requires a major-version bump to `4.x`.
- **Development (`devDependencies`)**: `18` advisories — `3` critical (`vitest`, `@vitest/coverage-v8`, `tinypool`), `1` high (`vite`), and `14` moderate (`@typescript-eslint/*`, `@vitest/mocker`, `esbuild`, `eslint-plugin-import-x`, `eslint-plugin-sonarjs`, `glob`, `minimatch`, `test-exclude`, `typescript-eslint`, `vite-node`). Critical and high dev advisories require major-version upgrades (`vite 6/8`, `vitest 4/5`, `tinypool 2`), so pinned majors (`zod 3.25.76`, `vite 5.4.21`, `vitest 2.1.9`, `@vitest/coverage-v8 2.1.9`) are documented without unverified major upgrades.

## 7. Explicitly Unverified Scope

- **Live Gemini API Execution**: Gemini live call not verified (`GEMINI_API_KEY` not present; A5 recorded `no key, skipped`). Only static request-builder checks and mocked `FetchPort` provider unit tests ran; a live request against `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent` was not executed.
- **Physical Mobile Devices**: Mobile layout (`320x640`) and performance (`Lighthouse 13.5.0 / 13.6.0`) were verified in Headless Chromium emulation rather than physical mobile hardware.
- **Pre-Phase-B Live Audits Not Re-Run**: Mobile Lighthouse (`2026-11-26 UTC`), HTTP header parity (`2026-11-26T19:19:51Z`), the console/network walkthrough (`2026-11-26 UTC`), and the `33`-scan live axe sweep (`b3f8066`) predated `a9ddf94`; post-Phase-B live checks covered `12` live Vercel axe scans (`light`, `dark`, `hi`), `dist/index.html` SHA256 parity, and CI `check` + `e2e` (`18` Chromium tests including `forced-colors`, `reduced-motion`, and `200%` zoom).
- **Registry Publish Dates**: Package publication timestamps (`<= 2026-11-04` policy in `docs/ASSUMPTIONS.md`) were inspected for audited advisory packages and candidates during A1 analysis rather than across the rest of the dependency tree.
