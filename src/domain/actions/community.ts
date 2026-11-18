import type { Action } from '../contracts';

/** Curated community and neighborhood level air quality interventions. */
export const COMMUNITY_ACTIONS: readonly Action[] = [
  {
    id: 'act-community-report-waste-burning',
    category: 'community',
    title: 'Report local open waste burning via Sameer app',
    description:
      'Photograph and submit geo-tagged incident reports of open municipal solid waste burning via the CPCB Sameer mobile portal to trigger enforcement action.',
    costRupees: 0,
    effort: 1,
    effects: [
      {
        type: 'exposureReduction',
        formulaId: 'sameer-app-enforcement',
        reductionBasisPoints: 3000,
      },
    ],
    sourceIds: ['cpcb-sameer-guidelines'],
    confidence: 'medium',
  },
  {
    id: 'act-community-pool-hepa-common',
    category: 'community',
    title: 'Pool funds for shared HEPA air purifier in apartment common areas',
    description:
      'Partner with residential welfare associations to install high-capacity commercial HEPA air cleaners in shared lobbies, study rooms, and clubhouses.',
    costRupees: 1200,
    effort: 2,
    effects: [
      {
        type: 'exposureReduction',
        formulaId: 'community-common-hepa',
        reductionBasisPoints: 4500,
      },
    ],
    sourceIds: ['epa-indoor-air-cleaners', 'who-air-quality-guidelines-2021'],
    confidence: 'medium',
  },
  {
    id: 'act-community-wet-road-washing',
    category: 'community',
    title: 'Organize community wet road washing and sprinkling',
    description:
      'Coordinate scheduled water-mist sprinkling and wet washing on unpaved colony roads and pavements to suppress re-suspended toxic road mineral dust.',
    costRupees: 400,
    effort: 2,
    effects: [
      {
        type: 'exposureReduction',
        formulaId: 'road-dust-suppression',
        reductionBasisPoints: 3500,
      },
    ],
    sourceIds: ['cpcb-sameer-guidelines', 'iitk-delhi-air-study'],
    confidence: 'medium',
  },
  {
    id: 'act-community-anti-smog-mist-cannons',
    category: 'community',
    title: 'Advocate for anti-smog water mist cannons at local construction',
    description:
      'Engage local municipal ward counselors and developers to enforce mandatory high-pressure water mist cannons and boundary wind-break netting around construction zones.',
    costRupees: 0,
    effort: 2,
    effects: [
      {
        type: 'exposureReduction',
        formulaId: 'construction-mist-cannons',
        reductionBasisPoints: 3000,
      },
    ],
    sourceIds: ['cpcb-sameer-guidelines', 'cpcb-emissions-inventory'],
    confidence: 'low',
  },
];
