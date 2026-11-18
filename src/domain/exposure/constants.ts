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

/** Verified academic and regulatory scientific literature source references. */
export const EXPOSURE_SOURCES: Readonly<Record<string, SourceReference>> = {
  'ashrae-62-2-residential': {
    id: 'ashrae-62-2-residential',
    title:
      'ASHRAE Standard 62.2: Ventilation and Acceptable Indoor Air Quality in Residential Buildings',
    url: 'https://www.ashrae.org/technical-resources/standards-and-guidelines',
  },
  'epa-indoor-pm-penetration': {
    id: 'epa-indoor-pm-penetration',
    title:
      'EPA Indoor Air Quality: Particulate Matter Penetration and Infiltration Factors',
    url: 'https://www.epa.gov/indoor-air-quality-iaq',
  },
  'thatcher-deposition-pm25': {
    id: 'thatcher-deposition-pm25',
    title:
      'Thatcher & Layton: Deposition, Resuspension, and Penetration of Particles within a Residence',
    url: 'https://doi.org/10.1016/1352-2310(94)00253-A',
  },
  'cdc-niosh-n95-fit': {
    id: 'cdc-niosh-n95-fit',
    title: 'CDC/NIOSH Respirator Fit Capability and Performance Evaluation',
    url: 'https://www.cdc.gov/niosh/npptl/topics/respirators/disp_part/default.html',
  },
  'cdc-mask-study': {
    id: 'cdc-mask-study',
    title: 'CDC Laboratory Evaluation of Mask Efficacy and Inward Leakage',
    url: 'https://www.cdc.gov/mmwr/volumes/70/wr/mm7007e1.htm',
  },
  'epa-cloth-mask-efficiency': {
    id: 'epa-cloth-mask-efficiency',
    title:
      'EPA Research on Cloth Masks and Filtration Efficiencies for Ambient Particulates',
    url: 'https://www.epa.gov/air-research/research-air-filtration-and-masks',
  },
  'epa-exposure-factors-handbook': {
    id: 'epa-exposure-factors-handbook',
    title: 'EPA Exposure Factors Handbook Chapter 6: Inhalation Rates',
    url: 'https://www.epa.gov/expobox/about-exposure-factors-handbook',
  },
};

/** Residential air exchange rate parameters categorized by building envelope sealing class. */
export const AIR_EXCHANGE_RATES: Readonly<SealingRateMap> = {
  leaky: {
    ratePerHour: 1.5,
    sourceId: 'ashrae-62-2-residential',
    minPerHour: 1.0,
    maxPerHour: 3.0,
  },
  average: {
    ratePerHour: 0.8,
    sourceId: 'ashrae-62-2-residential',
    minPerHour: 0.5,
    maxPerHour: 1.0,
  },
  tight: {
    ratePerHour: 0.35,
    sourceId: 'ashrae-62-2-residential',
    minPerHour: 0.2,
    maxPerHour: 0.5,
  },
};

/** Ambient fine particulate penetration factor through building envelopes. */
export const PENETRATION_FACTOR: Readonly<PenetrationParam> = {
  factor: 0.8,
  sourceId: 'epa-indoor-pm-penetration',
  min: 0.6,
  max: 1.0,
};

/** Indoor surface deposition loss rate for fine particulate matter. */
export const SURFACE_DEPOSITION_RATE: Readonly<DepositionParam> = {
  ratePerHour: 0.24,
  sourceId: 'thatcher-deposition-pm25',
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
    sourceId: 'cdc-niosh-n95-fit',
  },
  surgical: {
    nominalBps: 6000,
    effectiveBps: 4000,
    sourceId: 'cdc-mask-study',
  },
  cloth: {
    nominalBps: 3000,
    effectiveBps: 1500,
    sourceId: 'epa-cloth-mask-efficiency',
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
    sourceId: 'epa-exposure-factors-handbook',
  },
  child: {
    rateM3h: 0.5,
    sourceId: 'epa-exposure-factors-handbook',
  },
  adult: {
    rateM3h: 0.75,
    sourceId: 'epa-exposure-factors-handbook',
  },
  older: {
    rateM3h: 0.65,
    sourceId: 'epa-exposure-factors-handbook',
  },
};

/** Adult active inhalation volumetric rate parameter. */
export const ADULT_ACTIVE_BREATHING_RATE: Readonly<BreathingRateParam> = {
  rateM3h: 1.5,
  sourceId: 'epa-exposure-factors-handbook',
};
