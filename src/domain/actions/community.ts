import type { Action } from '../contracts';
import {
  SOURCE_EMISSIONS_INVENTORY,
  SOURCE_EPA_CLEANERS,
  SOURCE_IITK,
  SOURCE_SAMEER,
  SOURCE_WHO,
} from './sources';

const CAT_COMMUNITY = 'community';
const TYPE_EXPOSURE = 'exposureReduction';
const CONF_MEDIUM = 'medium';

/** Curated community and neighborhood level air quality interventions. */
export const COMMUNITY_ACTIONS: readonly Action[] = [
  {
    id: 'act-community-report-waste-burning',
    category: CAT_COMMUNITY,
    title: 'Report local open waste burning via Sameer app',
    description:
      'Photograph and submit geo-tagged incident reports of open municipal solid waste burning via the CPCB Sameer mobile portal to trigger enforcement action.',
    costRupees: 0,
    effort: 1,
    effects: [
      {
        type: TYPE_EXPOSURE,
        formulaId: 'sameer-app-enforcement',
        reductionBasisPoints: 3000,
      },
    ],
    sourceIds: [SOURCE_SAMEER],
    confidence: CONF_MEDIUM,
  },
  {
    id: 'act-community-pool-hepa-common',
    category: CAT_COMMUNITY,
    title: 'Pool funds for shared HEPA air purifier in apartment common areas',
    description:
      'Partner with residential welfare associations to install high-capacity commercial HEPA air cleaners in shared lobbies, study rooms, and clubhouses.',
    costRupees: 1200,
    effort: 2,
    effects: [
      {
        type: TYPE_EXPOSURE,
        formulaId: 'community-common-hepa',
        reductionBasisPoints: 4500,
      },
    ],
    sourceIds: [SOURCE_EPA_CLEANERS, SOURCE_WHO],
    confidence: CONF_MEDIUM,
  },
  {
    id: 'act-community-wet-road-washing',
    category: CAT_COMMUNITY,
    title: 'Organize community wet road washing and sprinkling',
    description:
      'Coordinate scheduled water-mist sprinkling and wet washing on unpaved colony roads and pavements to suppress re-suspended toxic road mineral dust.',
    costRupees: 400,
    effort: 2,
    effects: [
      {
        type: TYPE_EXPOSURE,
        formulaId: 'road-dust-suppression',
        reductionBasisPoints: 3500,
      },
    ],
    sourceIds: [SOURCE_SAMEER, SOURCE_IITK],
    confidence: CONF_MEDIUM,
  },
  {
    id: 'act-community-anti-smog-mist-cannons',
    category: CAT_COMMUNITY,
    title: 'Advocate for anti-smog water mist cannons at local construction',
    description:
      'Engage local municipal ward counselors and developers to enforce mandatory high-pressure water mist cannons and boundary wind-break netting around construction zones.',
    costRupees: 0,
    effort: 2,
    effects: [
      {
        type: TYPE_EXPOSURE,
        formulaId: 'construction-mist-cannons',
        reductionBasisPoints: 3000,
      },
    ],
    sourceIds: [SOURCE_SAMEER, SOURCE_EMISSIONS_INVENTORY],
    confidence: 'low',
  },
];
