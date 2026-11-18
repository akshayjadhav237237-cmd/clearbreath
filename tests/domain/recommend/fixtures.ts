import type { Action, DailyPlan } from '../../../src/domain/contracts';

/** Sample curated particulate mitigation action catalog for test suites. */
export const TEST_ACTION_CATALOG: readonly Action[] = [
  {
    id: 'hepa-air-purifier',
    category: 'indoor',
    title: 'Portable HEPA Air Purifier',
    description: 'CADR 300 m3/h mechanical filtration for main living area.',
    costRupees: 4500,
    effort: 1,
    effects: [
      {
        type: 'indoorPm25Reduction',
        formulaId: 'hepa-cadr-mass-balance',
        reductionBasisPoints: 6500,
      },
    ],
    sourceIds: ['ashrae-62-2-residential', 'epa-indoor-pm-penetration'],
    confidence: 'high',
  },
  {
    id: 'n95-respirator-pack',
    category: 'outdoor',
    title: 'Certified N95 Anti-Pollution Masks',
    description: 'NIOSH-certified particulate filtering facepiece respirators.',
    costRupees: 600,
    effort: 1,
    effects: [
      {
        type: 'exposureReduction',
        formulaId: 'respiratory-filtration-efficiency',
        reductionBasisPoints: 8500,
      },
    ],
    sourceIds: ['cdc-niosh-n95-fit'],
    confidence: 'high',
  },
  {
    id: 'weatherstrip-seal-gaps',
    category: 'indoor',
    title: 'Weatherstrip Doors & Windows',
    description:
      'Self-adhesive rubber foam strips to reduce building infiltration.',
    costRupees: 800,
    effort: 2,
    effects: [
      {
        type: 'indoorPm25Reduction',
        formulaId: 'envelope-sealing-mass-balance',
        reductionBasisPoints: 3000,
      },
    ],
    sourceIds: ['ashrae-62-2-residential'],
    confidence: 'medium',
  },
  {
    id: 'kitchen-exhaust-service',
    category: 'household',
    title: 'Kitchen Exhaust Hood Service',
    description: 'Clean grease filters and optimize exhaust air flow rate.',
    costRupees: 500,
    effort: 1,
    effects: [
      {
        type: 'indoorPm25Reduction',
        formulaId: 'exhaust-ventilation-efficiency',
        reductionBasisPoints: 2000,
      },
    ],
    sourceIds: ['ashrae-62-2-residential'],
    confidence: 'medium',
  },
  {
    id: 'biomass-cookstove-replacement',
    category: 'household',
    title: 'LPG / Induction Cookstove Transition',
    description:
      'Eliminate solid biomass fuel emissions with modern cookstove.',
    costRupees: 3500,
    effort: 2,
    effects: [
      {
        type: 'indoorPm25Reduction',
        formulaId: 'clean-fuel-combustion-reduction',
        reductionBasisPoints: 8000,
      },
    ],
    sourceIds: ['epa-indoor-pm-penetration'],
    confidence: 'high',
  },
  {
    id: 'shift-commute-metro',
    category: 'mobility',
    title: 'Shift Commute to Delhi Metro',
    description: 'Replace motorized road commute with air-filtered metro rail.',
    costRupees: 1200,
    effort: 2,
    effects: [
      {
        type: 'exposureReduction',
        formulaId: 'transit-cabin-filtration',
        reductionBasisPoints: 5000,
      },
      {
        type: 'emissionsReduction',
        formulaId: 'transit-mode-decarbonization',
        co2eGramsPerKm: 18,
      },
    ],
    sourceIds: [
      'dmrc-sustainability-2022',
      'cpcb-arai-vehicular-emissions-2020',
    ],
    confidence: 'high',
  },
  {
    id: 'premium-central-purification',
    category: 'indoor',
    title: 'Whole-Home Central Air Filtration',
    description: 'Ducted multi-stage electrostatic air cleaning system.',
    costRupees: 25000,
    effort: 3,
    effects: [
      {
        type: 'indoorPm25Reduction',
        formulaId: 'central-hvac-filtration',
        reductionBasisPoints: 9000,
      },
    ],
    sourceIds: ['ashrae-62-2-residential'],
    confidence: 'high',
  },
];

/** Minimal valid DailyPlan test fixture. */
export const TEST_DAILY_PLAN: DailyPlan = {
  outdoorWindows: [{ startHour: 13, endHour: 15, averageAqi: 180 }],
  bestVentilationWindow: { startHour: 13, endHour: 15 },
  purifierSchedule: [{ hour: 8, operationalState: 'high' }],
  hourlyAqi: [{ value: 320, category: 'veryPoor', dominant: 'pm25' }],
  advisorySummary: 'Severe winter smog advisory: minimize outdoor exposure.',
};
