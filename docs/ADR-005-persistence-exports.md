# ADR 005: Client-Side Persistence, Validated Exports, and Printable Action Plan

## Status

Accepted

## Context

Clearbreath must retain user state across browser sessions (household profile, selected city, completed actions, language preference, and AI consent) without requiring backend infrastructure or user authentication accounts. Additionally, users require portable export formats (CSV for spreadsheets, ICS for calendar schedules, JSON for device backup/transfer) and a printable "Smog-Day Family Action Plan" to post inside homes or share with caregivers.

These capabilities introduce security and stability risks:

- LocalStorage tampering, corrupted payloads, or schema drift across releases can crash client state.
- Unsanitized spreadsheet exports are vulnerable to CSV Formula Injection attacks.
- Calendar files must adhere strictly to RFC 5545 specification (CRLF line endings, 75-octet line folding, proper delimiter escaping) to prevent calendar client crashes.
- Sensitive credentials (e.g., Google Gemini API key) are not written to persistent storage.

## Decision

1. **Versioned Storage Architecture (`src/persistence`)**:
   - Client persistence is mediated through the injected `StoragePort` interface using a namespaced key (`clearbreath_state_v1`).
   - State payloads include an explicit schema version integer (`version: 1`).
   - Loading parses data against strict Zod schemas (`persistedStateV1Schema`).
   - A sequential migration pipeline transforms legacy schemas forward (e.g., migration registry supporting v1 to v2 transformations).
   - Payload size guard limits stored strings to 100 KB, preventing quota exhaustion.
   - Any unrecoverable corrupt or foreign JSON resets gracefully to `DEFAULT_HOUSEHOLD_PERSONA` and surfaces a user-visible notice.
   - **Memory-Only Key Isolation**: `ApiKeyHolder` is decoupled from persistence; API keys exist only in volatile runtime memory.

2. **Export Engines (`src/exports`)**:
   - **Formula-Injection Sanitized CSV**: Every cell starting with `=`, `+`, `-`, `@`, `\t`, or `\r` is prefixed with a single quote (`'`). Fields with commas, quotes, or newlines are quoted and internal quotes escaped as `""`.
   - **RFC 5545 Conforming ICS**: Implements CRLF endings (`\r\n`), 75-octet line folding, delimiter escaping (`\`, `,`, `;`, `\n`), deterministic `IdGenerator` UIDs, `Clock` timestamps, and floating local times (`SUMMARY`, `DTSTART`, `DTEND`, `RRULE:FREQ=DAILY`). Schedules morning ventilation and night purifier runtimes.
   - **Validated JSON Backup**: Exports household profile JSON with formatting; imports check max file size (50 KB) and validate against domain Zod schema. Browser downloads use Blob URLs immediately revoked after use.

3. **Printable Smog-Day Action Plan (`src/features/print`)**:
   - Implements high-contrast, black-and-white, ink-saving printable layout for paper postings.
   - Screen-only interactive chrome (navigation, buttons, chat inputs, themes) is suppressed in `@media print`.
   - Displays core family advisory: date, AQI level, top 5 impact actions with dose reduction, ventilation and air purifier time windows, methodology assumptions, and non-medical disclaimer.

## Consequences

- In-browser user state management without external telemetry or servers.
- Mitigates formula injection and calendar parser incompatibility risks.
- Maintains strict 200-line file ceilings, comprehensive unit testing, and full test coverage.
