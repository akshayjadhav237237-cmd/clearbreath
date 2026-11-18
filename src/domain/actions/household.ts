import type { Action } from '../contracts';

/** Curated residential particulate mitigation and source elimination actions. */
export const HOUSEHOLD_ACTIONS: readonly Action[] = [
  {
    id: 'act-household-chulha-to-clean',
    category: 'household',
    title: 'Switch from biomass or coal chulha to LPG or induction cooking',
    description:
      'Replace traditional biomass, wood, dung, or coal cookstoves with modern LPG cylinders or electric induction cooktops to eliminate extreme kitchen particulate smoke.',
    costRupees: 2800,
    effort: 3,
    effects: [
      {
        type: 'indoorPm25Reduction',
        formulaId: 'clean-cooking-fuel-shift',
        reductionBasisPoints: 8000,
      },
    ],
    sourceIds: ['who-air-quality-guidelines-2021', 'iitk-delhi-air-study'],
    confidence: 'high',
  },
  {
    id: 'act-household-no-waste-burning',
    category: 'household',
    title: 'Avoid burning municipal solid waste or dry leaves',
    description:
      'Eliminate backyard, roadside, and open compound burning of garden leaves, plastic packaging, and household rubbish, adopting home composting or municipal collection.',
    costRupees: 0,
    effort: 1,
    effects: [
      {
        type: 'exposureReduction',
        formulaId: 'eliminate-open-waste-burning',
        reductionBasisPoints: 4000,
      },
    ],
    sourceIds: ['cpcb-sameer-guidelines', 'iitk-delhi-air-study'],
    confidence: 'high',
  },
  {
    id: 'act-household-range-hood-grease-filter',
    category: 'household',
    title: 'Install range hood grease filter',
    description:
      'Fit aluminum mesh or baffle grease filters over kitchen cooktops to trap aerosolized oil particles, cooking fumes, and condensation before indoor dispersion.',
    costRupees: 650,
    effort: 2,
    effects: [
      {
        type: 'indoorPm25Reduction',
        formulaId: 'range-hood-filter-efficiency',
        reductionBasisPoints: 3500,
      },
    ],
    sourceIds: ['epa-indoor-air-cleaners', 'who-air-quality-guidelines-2021'],
    confidence: 'medium',
  },
  {
    id: 'act-household-maintain-ventilation-filters',
    category: 'household',
    title: 'Maintain clean indoor ventilation filters',
    description:
      'Routinely wash or vacuum air conditioner pre-filters and mechanical ventilation screens every two weeks during the winter smog season.',
    costRupees: 300,
    effort: 1,
    effects: [
      {
        type: 'indoorPm25Reduction',
        formulaId: 'hvac-filter-maintenance',
        reductionBasisPoints: 2500,
      },
    ],
    sourceIds: ['epa-indoor-air-cleaners'],
    confidence: 'high',
  },
];
