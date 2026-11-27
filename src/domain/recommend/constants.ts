import type { CommuteMode } from '../contracts';
import type { RecommendationSource } from './types';

/** Specific lifecycle greenhouse gas emissions factors in grams CO2e per passenger-km. */
export const COMMUTE_EMISSION_FACTORS: Readonly<Record<CommuteMode, number>> = {
  walk: 0,
  cycle: 0,
  metro: 18,
  bus: 35,
  twoWheeler: 45,
  autoRickshaw: 65,
  car: 150,
};

/** Average working days per calendar month for recurring commute calculations. */
export const WORKING_DAYS_PER_MONTH = 22;

/** Minutes in a standard 24-hour diurnal cycle. */
export const MINUTES_PER_DAY = 1440;

/** Verified bibliographic citations for recommendation and emission models. */
export const RECOMMENDATION_SOURCES: Readonly<
  Record<string, RecommendationSource>
> = {
  'dmrc-sustainability-2022': {
    id: 'dmrc-sustainability-2022',
    title:
      'Delhi Metro Rail Corporation Annual Sustainability and Carbon Emission Report',
    url: 'https://delhimetrorail.com/otherdocuments/Sustainability-Report.pdf',
  },
  'cpcb-arai-vehicular-emissions-2020': {
    id: 'cpcb-arai-vehicular-emissions-2020',
    title: 'CPCB & ARAI Emission Factor Database for Indian In-Use Vehicles',
    url: 'https://cpcb.gov.in/source-apportioment-studies/Emission_Factors_Vehicles.pdf',
  },
  'ashrae-62-2-residential': {
    id: 'ashrae-62-2-residential',
    title:
      'ASHRAE Standard 62.2: Ventilation and Acceptable Indoor Air Quality in Residential Buildings',
    url: 'https://www.ashrae.org/technical-resources/standards-and-guidelines',
  },
  'cdc-niosh-n95-fit': {
    id: 'cdc-niosh-n95-fit',
    title: 'CDC/NIOSH Approved Filtering Facepiece Respirators Reference',
    url: 'https://www.cdc.gov/niosh/ppe/niosh-approved-respirators/ffr-cel.html',
  },
  'cpcb-naqi-2014': {
    id: 'cpcb-naqi-2014',
    title: 'CPCB National Air Quality Index Guidelines',
    url: 'https://cpcb.gov.in/National-Air-Quality-Index/',
  },
  'epa-indoor-pm-penetration': {
    id: 'epa-indoor-pm-penetration',
    title:
      'EPA Indoor Air Quality: Particulate Matter Penetration and Infiltration Factors',
    url: 'https://www.epa.gov/indoor-air-quality-iaq',
  },
};

/** Standard computational assumptions attached to recommendation explanations. */
export const STANDARD_EXPOSURE_ASSUMPTIONS: readonly string[] = [
  'Standard diurnal exposure pattern with average indoor occupancy',
  'Indoor infiltration based on building envelope sealing class',
  'Commute exposure calculated for round-trip travel',
  'Dose reductions aggregated across all living household members',
];
