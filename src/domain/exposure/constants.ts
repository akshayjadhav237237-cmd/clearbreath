import type { AgeGroup } from '../contracts';
import type {
  BreathingRateParam,
  DepositionParam,
  MaskEfficiencyParam,
  MaskType,
  PenetrationParam,
  SealingRateMap,
  SourceReference,
} from './types';

const SOURCE_ASHRAE = 'ashrae-62-2-residential';
const SOURCE_PENETRATION = 'epa-indoor-pm-penetration';
const SOURCE_THATCHER = 'thatcher-deposition-pm25';
const SOURCE_NIOSH_FIT = 'cdc-niosh-n95-fit';
const SOURCE_CDC_MASK = 'cdc-mask-study';
const SOURCE_CLOTH_MASK = 'epa-cloth-mask-efficiency';
const SOURCE_EPA_EXPOSURE = 'epa-exposure-factors-handbook';

/** Verified academic and regulatory scientific literature source references. */
export const EXPOSURE_SOURCES: Readonly<Record<string, SourceReference>> = {
  [SOURCE_ASHRAE]: {
    id: SOURCE_ASHRAE,
    title:
      'ASHRAE Standard 62.2: Ventilation and Acceptable Indoor Air Quality in Residential Buildings',
    url: 'https://www.ashrae.org/technical-resources/standards-and-guidelines',
  },
  [SOURCE_PENETRATION]: {
    id: SOURCE_PENETRATION,
    title:
      'EPA Indoor Air Quality: Particulate Matter Penetration and Infiltration Factors',
    url: 'https://www.epa.gov/indoor-air-quality-iaq',
  },
  [SOURCE_THATCHER]: {
    id: SOURCE_THATCHER,
    title:
      'Thatcher & Layton: Deposition, Resuspension, and Penetration of Particles within a Residence',
    url: 'https://doi.org/10.1016/1352-2310(94)00253-A',
  },
  [SOURCE_NIOSH_FIT]: {
    id: SOURCE_NIOSH_FIT,
    title: 'CDC/NIOSH Respirator Fit Capability and Performance Evaluation',
    url: 'https://www.cdc.gov/niosh/npptl/topics/respirators/disp_part/default.html',
  },
  [SOURCE_CDC_MASK]: {
    id: SOURCE_CDC_MASK,
    title: 'CDC Laboratory Evaluation of Mask Efficacy and Inward Leakage',
    url: 'https://www.cdc.gov/mmwr/volumes/70/wr/mm7007e1.htm',
  },
  [SOURCE_CLOTH_MASK]: {
    id: SOURCE_CLOTH_MASK,
    title:
      'EPA Research on Cloth Masks and Filtration Efficiencies for Ambient Particulates',
    url: 'https://www.epa.gov/air-research/research-air-filtration-and-masks',
  },
  [SOURCE_EPA_EXPOSURE]: {
    id: SOURCE_EPA_EXPOSURE,
    title: 'EPA Exposure Factors Handbook Chapter 6: Inhalation Rates',
    url: 'https://www.epa.gov/expobox/about-exposure-factors-handbook',
  },
};

/** Residential air exchange rate parameters categorized by building envelope sealing class. */
export const AIR_EXCHANGE_RATES: Readonly<SealingRateMap> = {
  leaky: {
    ratePerHour: 3 / 2,
    sourceId: SOURCE_ASHRAE,
    minPerHour: 1.0,
    maxPerHour: 3.0,
  },
  average: {
    ratePerHour: 0.8,
    sourceId: SOURCE_ASHRAE,
    minPerHour: 0.5,
    maxPerHour: 1.0,
  },
  tight: {
    ratePerHour: 0.35,
    sourceId: SOURCE_ASHRAE,
    minPerHour: 0.2,
    maxPerHour: 0.5,
  },
};

/** Ambient fine particulate penetration factor through building envelopes. */
export const PENETRATION_FACTOR: Readonly<PenetrationParam> = {
  factor: 0.8,
  sourceId: SOURCE_PENETRATION,
  min: 0.6,
  max: 1.0,
};

/** Indoor surface deposition loss rate for fine particulate matter. */
export const SURFACE_DEPOSITION_RATE: Readonly<DepositionParam> = {
  ratePerHour: 0.24,
  sourceId: SOURCE_THATCHER,
  minPerHour: 0.1,
  maxPerHour: 0.5,
};

/** Mask filtration and inward leakage performance specifications across mask classifications. */
export const MASK_EFFICIENCIES: Readonly<
  Record<MaskType, MaskEfficiencyParam>
> = {
  n95: {
    nominalBps: 9500,
    effectiveBps: 8500,
    sourceId: SOURCE_NIOSH_FIT,
  },
  surgical: {
    nominalBps: 6000,
    effectiveBps: 4000,
    sourceId: SOURCE_CDC_MASK,
  },
  cloth: {
    nominalBps: 3000,
    effectiveBps: 1500,
    sourceId: SOURCE_CLOTH_MASK,
  },
  none: {
    nominalBps: 0,
    effectiveBps: 0,
    sourceId: 'none',
  },
};

/** Age-specific baseline resting inhalation volumetric rates. */
export const RESTING_BREATHING_RATES: Readonly<
  Record<AgeGroup, BreathingRateParam>
> = {
  infant: {
    rateM3h: 0.25,
    sourceId: SOURCE_EPA_EXPOSURE,
  },
  child: {
    rateM3h: 0.5,
    sourceId: SOURCE_EPA_EXPOSURE,
  },
  adult: {
    rateM3h: 0.75,
    sourceId: SOURCE_EPA_EXPOSURE,
  },
  older: {
    rateM3h: 0.65,
    sourceId: SOURCE_EPA_EXPOSURE,
  },
};

/** Adult active inhalation volumetric rate parameter. */
export const ADULT_ACTIVE_BREATHING_RATE: Readonly<BreathingRateParam> = {
  rateM3h: 3 / 2,
  sourceId: SOURCE_EPA_EXPOSURE,
};
