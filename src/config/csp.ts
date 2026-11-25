/** Single source of truth for Content Security Policy. */
export const CSP_POLICY =
  "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://generativelanguage.googleapis.com https://api.open-meteo.com https://air-quality-api.open-meteo.com; base-uri 'self'; form-action 'self'; object-src 'none'; frame-ancestors 'none'";
