/**
 * Breakpoints and bands for India Central Pollution Control Board (CPCB) NAQI.
 * Source: CPCB 2014 National Air Quality Index Guidelines.
 */

/** Breakpoint band defining ambient concentration and AQI index boundaries. */
export interface BreakpointBand {
  readonly bLo: number;
  readonly bHi: number;
  readonly iLo: number;
  readonly iHi: number;
}

/** CPCB 2014 National Air Quality Index guidelines source identifier. */
export const CPCB_SOURCE_ID = 'cpcb-naqi-2014';

/** CPCB 2014 National Air Quality Index publication metadata. */
export const CPCB_SOURCE_METADATA = {
  id: CPCB_SOURCE_ID,
  title: 'National Air Quality Index',
  organization: 'Central Pollution Control Board',
  year: 2014,
  url: 'https://cpcb.gov.in/National-Air-Quality-Index/',
} as const;

/** CPCB 24-hour average PM2.5 breakpoints in micrograms per cubic meter. */
export const PM25_BREAKPOINTS: readonly BreakpointBand[] = [
  { bLo: 0, bHi: 30, iLo: 0, iHi: 50 },
  { bLo: 31, bHi: 60, iLo: 51, iHi: 100 },
  { bLo: 61, bHi: 90, iLo: 101, iHi: 200 },
  { bLo: 91, bHi: 120, iLo: 201, iHi: 300 },
  { bLo: 121, bHi: 250, iLo: 301, iHi: 400 },
  { bLo: 250, bHi: 350, iLo: 400, iHi: 500 },
];

/** CPCB 24-hour average PM10 breakpoints in micrograms per cubic meter. */
export const PM10_BREAKPOINTS: readonly BreakpointBand[] = [
  { bLo: 0, bHi: 50, iLo: 0, iHi: 50 },
  { bLo: 51, bHi: 100, iLo: 51, iHi: 100 },
  { bLo: 101, bHi: 250, iLo: 101, iHi: 200 },
  { bLo: 251, bHi: 350, iLo: 201, iHi: 300 },
  { bLo: 351, bHi: 430, iLo: 301, iHi: 400 },
  { bLo: 430, bHi: 500, iLo: 400, iHi: 500 },
];
