import type { Action } from '../contracts';
import {
  SOURCE_IITK,
  SOURCE_LANCET,
  SOURCE_NIOSH,
  SOURCE_SAMEER,
  SOURCE_WHO,
} from './sources';

const CAT_OUTDOOR = 'outdoor';
const TYPE_EXPOSURE = 'exposureReduction';
const CONF_HIGH = 'high';

/** Curated personal protection actions for outdoor air pollution exposure. */
export const OUTDOOR_ACTIONS: readonly Action[] = [
  {
    id: 'act-outdoor-shift-exercise-hour',
    category: CAT_OUTDOOR,
    title: 'Shift outdoor exercise or walking to diurnal minimum AQI hour',
    description:
      'Reschedule jogging, walking, or sports from morning inversion hours (06:00-08:00) to afternoon hours (13:00-15:00) when solar warming elevates the mixing layer.',
    costRupees: 0,
    effort: 1,
    effects: [
      {
        type: TYPE_EXPOSURE,
        formulaId: 'diurnal-minimum-exercise',
        reductionBasisPoints: 4000,
      },
    ],
    sourceIds: [SOURCE_SAMEER, SOURCE_LANCET],
    confidence: CONF_HIGH,
  },
  {
    id: 'act-outdoor-wear-n95-transit',
    category: CAT_OUTDOOR,
    title: 'Wear fitted N95 respirator mask during outdoor transit',
    description:
      'Wear a certified NIOSH N95 respirator with an airtight face seal and dual headband straps during all outdoor travel and roadside waiting.',
    costRupees: 150,
    effort: 1,
    effects: [
      {
        type: TYPE_EXPOSURE,
        formulaId: 'n95-respirator-filtration',
        reductionBasisPoints: 9500,
      },
    ],
    sourceIds: [SOURCE_NIOSH, SOURCE_WHO],
    confidence: CONF_HIGH,
  },
  {
    id: 'act-outdoor-wear-ffp2-mask',
    category: CAT_OUTDOOR,
    title: 'Wear FFP2 mask outdoors',
    description:
      'Wear an EN 149 standard FFP2 particulate filtering facepiece mask during outdoor activities to capture fine inhalable aerosols.',
    costRupees: 120,
    effort: 1,
    effects: [
      {
        type: TYPE_EXPOSURE,
        formulaId: 'ffp2-respirator-filtration',
        reductionBasisPoints: 9400,
      },
    ],
    sourceIds: [SOURCE_WHO, SOURCE_NIOSH],
    confidence: CONF_HIGH,
  },
  {
    id: 'act-outdoor-avoid-exertion-aqi-300',
    category: CAT_OUTDOOR,
    title: 'Avoid outdoor exertion above AQI 300',
    description:
      'Cancel heavy outdoor running, cycling, or physical labor whenever ambient AQI exceeds 300 (Very Poor / Severe) to avert deep pulmonary toxic deposition.',
    costRupees: 0,
    effort: 1,
    effects: [
      {
        type: TYPE_EXPOSURE,
        formulaId: 'curtail-exertion-severe-aqi',
        reductionBasisPoints: 7000,
      },
    ],
    sourceIds: [SOURCE_SAMEER, SOURCE_LANCET],
    confidence: CONF_HIGH,
  },
  {
    id: 'act-outdoor-stay-indoors-inversion',
    category: CAT_OUTDOOR,
    title: 'Stay indoors during peak inversion hours',
    description:
      'Remain inside sealed buildings from sunset through mid-morning during winter thermal inversion episodes when hazardous pollutants are trapped at ground level.',
    costRupees: 0,
    effort: 1,
    effects: [
      {
        type: TYPE_EXPOSURE,
        formulaId: 'avoid-inversion-exposure',
        reductionBasisPoints: 5000,
      },
    ],
    sourceIds: [SOURCE_SAMEER, SOURCE_IITK],
    confidence: CONF_HIGH,
  },
];
