import type { Action } from '../contracts';

/** Curated particulate mitigation actions for indoor living environments. */
export const INDOOR_ACTIONS: readonly Action[] = [
  {
    id: 'act-indoor-seal-gaps',
    category: 'indoor',
    title: 'Seal window and door gaps with foam weatherstripping',
    description:
      'Apply self-adhesive high-density foam or EPDM rubber weatherstripping along window frames and door perimeters to block ambient PM2.5 infiltration.',
    costRupees: 500,
    effort: 2,
    effects: [
      {
        type: 'indoorPm25Reduction',
        formulaId: 'infiltration-reduction-weatherstrip',
        reductionBasisPoints: 2000,
      },
    ],
    sourceIds: ['epa-indoor-air-cleaners', 'iitk-delhi-air-study'],
    confidence: 'high',
  },
  {
    id: 'act-indoor-box-fan',
    category: 'indoor',
    title: 'DIY box-fan air cleaner with MERV-13 filter',
    description:
      'Fasten a 20-inch MERV-13 furnace filter to the intake side of a standard domestic box fan with duct tape to build an effective high-CADR particulate air cleaner.',
    costRupees: 2500,
    effort: 2,
    effects: [
      {
        type: 'indoorPm25Reduction',
        formulaId: 'cadr-merv13-boxfan',
        reductionBasisPoints: 6500,
      },
    ],
    sourceIds: ['epa-indoor-air-cleaners', 'who-air-quality-guidelines-2021'],
    confidence: 'high',
  },
  {
    id: 'act-indoor-close-windows-smog',
    category: 'indoor',
    title: 'Close windows during peak morning and evening smog hours',
    description:
      'Keep all exterior windows, balconies, and ventilation dampers shut tight during morning and evening inversion hours (06:00-10:00 and 19:00-23:00).',
    costRupees: 0,
    effort: 1,
    effects: [
      {
        type: 'indoorPm25Reduction',
        formulaId: 'inversion-window-closure',
        reductionBasisPoints: 3000,
      },
    ],
    sourceIds: ['cpcb-sameer-guidelines', 'iitk-delhi-air-study'],
    confidence: 'high',
  },
  {
    id: 'act-indoor-wet-mopping',
    category: 'indoor',
    title: 'Wet mopping rather than dry sweeping',
    description:
      'Clean indoor tile and hard floors using a damp microfiber mop rather than dry brooms to avoid re-suspending settled hazardous fine dust particles.',
    costRupees: 200,
    effort: 1,
    effects: [
      {
        type: 'indoorPm25Reduction',
        formulaId: 'dust-resuspension-reduction',
        reductionBasisPoints: 1500,
      },
    ],
    sourceIds: ['who-air-quality-guidelines-2021', 'epa-indoor-air-cleaners'],
    confidence: 'medium',
  },
  {
    id: 'act-indoor-kitchen-exhaust',
    category: 'indoor',
    title: 'Operate kitchen exhaust during cooking',
    description:
      'Run the range hood or kitchen exhaust fan at maximum setting during all frying, tadka, and baking to evacuate cooking aerosols and ultrafine particles.',
    costRupees: 0,
    effort: 1,
    effects: [
      {
        type: 'indoorPm25Reduction',
        formulaId: 'kitchen-source-exhaust',
        reductionBasisPoints: 4000,
      },
    ],
    sourceIds: ['who-air-quality-guidelines-2021', 'epa-indoor-air-cleaners'],
    confidence: 'high',
  },
  {
    id: 'act-indoor-no-incense-candles',
    category: 'indoor',
    title: 'Eliminate indoor incense and candle burning',
    description:
      'Avoid lighting agarbatti, dhoop, and paraffin candles in indoor spaces to eliminate a dominant domestic source of carbon soot and volatile organic compounds.',
    costRupees: 0,
    effort: 1,
    effects: [
      {
        type: 'indoorPm25Reduction',
        formulaId: 'incense-combustion-elimination',
        reductionBasisPoints: 4500,
      },
    ],
    sourceIds: ['iitk-delhi-air-study', 'who-air-quality-guidelines-2021'],
    confidence: 'high',
  },
];
