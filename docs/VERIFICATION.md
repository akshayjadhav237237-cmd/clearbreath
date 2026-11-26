# Clearbreath Verification Report

Verification audit executed on commit `8e71232` (`8e71232d5df05b284fadd64101b565c0f12fec82`) on `2026-11-26 UTC` (Node.js `v24.13.1`).

## 1. Automated Verification Suite Summary

| Check Category           | Command                                                | Observed Result                                                                                                                         | Gate Status |
| :----------------------- | :----------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- | :---------- |
| TypeScript Typecheck     | `npm run typecheck`                                    | `0` errors (`tsc -b --noEmit`)                                                                                                          | PASS        |
| ESLint (Flat Config)     | `npm run lint`                                         | `0` errors, `0` warnings (`eslint .`)                                                                                                   | PASS        |
| Prettier Formatting      | `npm run format:check`                                 | Clean format check (LF, 2 spaces)                                                                                                       | PASS        |
| Knip Hygiene Scan        | `npm run knip`                                         | `0` unused files, dependencies, or exports                                                                                              | PASS        |
| Code Duplication (JSCPD) | `npm run dup`                                          | `110` files (`27` tsx, `83` ts; `8,958` lines, `42,050` tokens), `0` clones (`0.00%`)                                                   | PASS        |
| Bundle Budget            | `npm run bundle:check`                                 | Initial JS `70.48 KiB` (`72,175 B` / `72.18 kB` SI) vs `75 KiB`; CSS `5.41 KiB` (`5.54 kB` SI) vs `20 KiB` (binary KiB printed as `kB`) | PASS        |
| Unit & Integration Tests | `npm run test:coverage`                                | `61` test files passed, `338` tests passed (`41.68s`)                                                                                   | PASS        |
| Real Chromium E2E Tests  | `npm run e2e`                                          | `4` spec files, `18` tests passed (`30.4s` local; `14.7s` fresh clone)                                                                  | PASS        |
| Lighthouse Mobile Audit  | `npx lighthouse https://clearbreath-omega.vercel.app/` | `100 / 100 / 100 / 100` medians across 3 runs (`Lighthouse 13.6.0`)                                                                     | PASS        |

## 2. Test Coverage & File Line-Count Metrics

Recorded via `@vitest/coverage-v8` during `npm run check` (`pb-check.txt`) on commit `8e71232`:

- **Statements**: `94.47%` (Threshold: `90%`)
- **Branches**: `92.43%` (Threshold: `85%`)
- **Functions**: `97.26%` (Threshold: `90%`)
- **Lines**: `94.47%` (Threshold: `90%`)
- **Test Files**: `61` passed (`0` failed)
- **Tests**: `338` passed (`0` failed)
- _(Note: Clean fresh-clone run `c5-check.txt` also passed `61` files / `338` tests with V8 coverage reporting `98.54%` statements, `92.77%` branches, `98.63%` functions, `98.54%` lines; running Vitest under a path containing spaces (`VPW CH6`) caused `@vitest/coverage-v8` in `pb-check.txt` to count 277 lines across 4 pure type-only `.ts` files as 0% covered, alongside a 1-branch timing variance in `src/ai/runtime/timeout.ts`.)_

Repository file & line counts on commit `8e71232`:

- **Git-tracked files**: `241` total (`139` in `src/`, `64` in `tests/` including `61` test suites, `4` in `e2e/`, `1` in `scripts/`).
- **Scanned code/test/script files** (`src`, `tests`, `e2e`, `scripts`): `208` files; `0` files exceed `200` lines (maximum `198` lines including trailing newline in `tests/gap/airdata-and-runtime.test.ts`; `197` lines excluding trailing newline).

## 3. Real Chromium End-to-End Suite

Executed via Playwright against production build (`npm run e2e`, `18 passed` across `4` spec files):

1. `e2e/a11y.spec.ts` (9 Chromium `@axe-core/playwright` scenarios, `wcag2a/aa/21aa/22aa/best-practice`):
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

## 4. Live Deployment Audits (`2026-11-26 UTC`)

### Mobile Lighthouse (`https://clearbreath-omega.vercel.app/`)

Audited via Google Lighthouse `13.6.0` (mobile form factor, simulated throttling, `3` sequential runs on `2026-11-26T19:52:14Z–19:52:44Z`):

- **Category Scores & Medians**: Performance `100 / 100 / 100` (median `100`), Accessibility `100 / 100 / 100` (median `100`), Best Practices `100 / 100 / 100` (median `100`), SEO `100 / 100 / 100` (median `100`).
- **Median Core Web Vitals**: `FCP: 0.8 s` (`0.8 s, 0.9 s, 0.8 s`), `LCP: 0.8 s` (`0.8 s, 0.9 s, 0.8 s`), `TBT: 80 ms` (`80 ms, 70 ms, 80 ms`), `CLS: 0` (`0.000069`), `Speed Index: 1.9 s` (`2.1 s, 1.9 s, 1.3 s`).

### Live Chromium Axe-Core & Viewport Overflow (`https://clearbreath-omega.vercel.app/`)

Audited via `axe-core 4.14.0` across `10` UI states and `33` total scans (`2026-11-26T19:32:05Z–19:35:01Z`, tags `wcag2a, wcag2aa, wcag21aa, wcag22aa, best-practice`):

- `0` violations, `1,319` passes, `29` incomplete nodes (manual-review flags for contrast/ARIA), `0` runtime errors.
- `0` horizontal overflow (`scrollWidth <= clientWidth`) verified across the 7 tabs at `320x640` mobile and `1280x800` dark, plus `Air Now` and `Daily Plan` at `640x400` (`200%` zoom) and `Air Now` at `1280x800` light.

### HTTP Headers, Console/Network & CI/CD Parity

- **HTTP Headers (`2026-11-26T19:19:51Z`)**: Live Vercel (`https://clearbreath-omega.vercel.app/`) returned `200 OK` with `6/6` configured response headers matching `vercel.json` (`Content-Security-Policy` including `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`). HTML `<title>`, description, canonical link, `<meta name="referrer">`, and `<meta http-equiv="Content-Security-Policy">` match across `index.html`, Vercel, and GitHub Pages (`https://akshayjadhav237237-cmd.github.io/clearbreath/`, HTTP `200`, static hosting without `vercel.json` headers).
- **Console & Network Walkthrough (Vercel)**: `0` console errors, `0` warnings, `0` pageerrors, `0` `"Refused to"` CSP messages; `14` requests across `2` origins (`https://clearbreath-omega.vercel.app` and `https://air-quality-api.open-meteo.com`), `0` failed requests, `0` HTTP `>= 400` responses, `0` Gemini requests with consent disabled, and `0` Open-Meteo requests when revisiting `Air Now` after `Daily Plan`.
- **Fresh-Clone & CI Parity (`8e71232`)**: Clean clone passed `npm ci --ignore-scripts`, `npm run check`, and `npm run e2e` (`EXIT_CODE=0`), producing `dist/index.html` SHA256 `4a2b01d4c1f2a51755f70d4556075e2ec5b46208d0447dd3cd749286d56fadfa`, matching live Vercel byte-for-byte. GitHub Actions CI (`45882187502`) and Pages (`45882419852`) completed with `success`. Subsequent docs-only edits kept `dist/` byte-for-byte identical.

## 5. Egress & Input Controls

- **Content Security Policy**: Enforced in `index.html` and `vercel.json` (`tests/csp-sync.test.ts` checks parity with `src/config/csp.ts`), restricting `connect-src` to `'self' https://generativelanguage.googleapis.com https://api.open-meteo.com https://air-quality-api.open-meteo.com`.
- **Allowlist Scrubbing**: Identifiers, exact ages, GPS coordinates, street addresses, exact budgets, and home dimensions are excluded prior to LLM prompt formulation (`src/ai/privacy/disclosure.ts`, `src/ai/privacy/context-builder.ts`).
- **Formula Injection Sanitized CSV**: Export sanitization prefixes leading `=`, `+`, `-`, `@`, `\t`, and `\r` with `'`.

## 6. Explicitly Unverified Scope

- **Live Gemini API Execution**: A live `gemini-3.8-flash` request with a real API key against `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent` was not executed; AI integration is verified via unit tests with mocked `FetchPort` responses and grounding/allowlist checks.
- **Physical Mobile Devices**: Mobile layout (`320x640`) and performance (`Lighthouse 13.6.0`) were verified in Headless Chromium emulation rather than physical mobile hardware.
- **Registry Publish Dates**: Package publication timestamps (`<= 2026-11-04`) were not queried from the npm registry during verification.
- **Axe Incomplete Nodes**: The `29` `incomplete` flags reported by `axe-core` during the live audit were not manually adjudicated individually.
