/**
 * CPCB National AQI engine module.
 * Exposes AQI calculation, category evaluation, guidance, and breakpoint constants.
 */

export type { BreakpointBand } from './breakpoints';
export {
  CPCB_SOURCE_ID,
  CPCB_SOURCE_METADATA,
  PM10_BREAKPOINTS,
  PM25_BREAKPOINTS,
} from './breakpoints';

export {
  MAX_AQI,
  calculateAqi,
  calculateSubIndex,
  getAqiCategory,
} from './calculator';

export { getAqiGuidance } from './guidance';
