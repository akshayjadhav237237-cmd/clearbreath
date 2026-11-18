/** Application display name. */
export const APP_NAME = 'Clearbreath';

/** Default Gemini model identifier (GA, free-tier callable). */
export const GEMINI_MODEL_ID = 'gemini-1.5-flash';

/** Base REST endpoint for Google Generative Language API. */
export const GEMINI_ENDPOINT_BASE =
  'https://generativelanguage.googleapis.com/v1beta';

/** Open-Meteo Air Quality REST API endpoint. */
export const OPEN_METEO_AIR_QUALITY_ENDPOINT =
  'https://air-quality-api.open-meteo.com/v1/air-quality';

/** Mandatory Open-Meteo attribution text under CC BY 4.0 license. */
export const OPEN_METEO_ATTRIBUTION_TEXT =
  'Air quality data powered by Open-Meteo.com under Creative Commons Attribution 4.0 International (CC BY 4.0)';

/** Maximum allowed character length for user-submitted assistant questions. */
export const MAX_QUESTION_LENGTH = 300;

/** Timeout in milliseconds for AI generation requests. */
export const AI_REQUEST_TIMEOUT_MS = 15000;

/** Timeout in milliseconds for Open-Meteo air data fetch requests. */
export const AIR_DATA_TIMEOUT_MS = 10000;

/** Maximum retry attempts for transient AI network failures. */
export const AI_MAX_RETRIES = 2;

/** Base exponential backoff delay in milliseconds for AI retries. */
export const AI_RETRY_BASE_DELAY_MS = 1000;

/** Minimum interval in milliseconds required between consecutive AI calls. */
export const AI_MIN_INTERVAL_MS = 3000;

/** Maximum allowed AI requests per user session. */
export const AI_MAX_REQUESTS_PER_SESSION = 20;

/** Maximum capacity for in-memory LRU AI response cache. */
export const AI_CACHE_MAX_ENTRIES = 20;

/** Local storage key identifiers. */
export const STORAGE_KEYS = {
  SETTINGS: 'clearbreath_settings_v1',
  PROFILE: 'clearbreath_profile_v1',
  ACTIONS_STATE: 'clearbreath_actions_state_v1',
} as const;
