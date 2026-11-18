import type { SealingClass } from '../contracts';

/** Mask classification type for respiratory protection. */
export type MaskType = 'none' | 'cloth' | 'surgical' | 'n95';

/** Physical activity level determining inhalation rate. */
export type ActivityLevel = 'resting' | 'active';

/** Literature source reference with bibliographic identification. */
export interface SourceReference {
  readonly id: string;
  readonly title: string;
  readonly url: string;
}

/** Air exchange rate parameter specification with validation range. */
interface AirExchangeRateParam {
  readonly ratePerHour: number;
  readonly sourceId: string;
  readonly minPerHour: number;
  readonly maxPerHour: number;
}

/** Aerosol penetration factor parameter specification. */
export interface PenetrationParam {
  readonly factor: number;
  readonly sourceId: string;
  readonly min: number;
  readonly max: number;
}

/** Indoor surface deposition velocity parameter specification. */
export interface DepositionParam {
  readonly ratePerHour: number;
  readonly sourceId: string;
  readonly minPerHour: number;
  readonly maxPerHour: number;
}

/** Mask filtration and inward leakage performance metrics in basis points. */
export interface MaskEfficiencyParam {
  readonly nominalBps: number;
  readonly effectiveBps: number;
  readonly sourceId: string;
}

/** Inhalation volumetric rate parameter in cubic meters per hour. */
export interface BreathingRateParam {
  readonly rateM3h: number;
  readonly sourceId: string;
}

/** Sealing class mapping to air exchange rate specifications. */
export type SealingRateMap = Record<SealingClass, AirExchangeRateParam>;
