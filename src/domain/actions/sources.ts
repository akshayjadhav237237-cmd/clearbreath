/** Verified scientific citation and regulatory source reference. */
export interface ActionSource {
  readonly id: string;
  readonly title: string;
  readonly organization: string;
  readonly url: string;
}

export const SOURCE_WHO = 'who-air-quality-guidelines-2021';
export const SOURCE_SAMEER = 'cpcb-sameer-guidelines';
export const SOURCE_EPA_CLEANERS = 'epa-indoor-air-cleaners';
export const SOURCE_IITK = 'iitk-delhi-air-study';
export const SOURCE_ARAI = 'cpcb-arai-vehicular-emissions-2020';
export const SOURCE_DMRC = 'dmrc-sustainability-report-2023';
export const SOURCE_NIOSH = 'niosh-respirator-standards';
export const SOURCE_LANCET = 'lancet-planetary-health-india';
export const SOURCE_EMISSIONS_INVENTORY = 'cpcb-emissions-inventory';

/** Curated registry of verified empirical evidence sources. */
export const ACTION_SOURCES: readonly ActionSource[] = [
  {
    id: SOURCE_ARAI,
    title: 'CPCB & ARAI Emission Factor Development for Indian Vehicles',
    organization: 'Central Pollution Control Board & ARAI',
    url: 'https://cpcb.gov.in/source-apportioment-studies/Emission_Factors_Vehicles.pdf',
  },
  {
    id: SOURCE_EMISSIONS_INVENTORY,
    title: 'CPCB Comprehensive Emissions Inventory for Delhi-NCR',
    organization: 'Central Pollution Control Board',
    url: 'https://cpcb.gov.in/source-apportionment-studies/',
  },
  {
    id: SOURCE_DMRC,
    title: 'Delhi Metro Rail Corporation Sustainability Report 2023',
    organization: 'Delhi Metro Rail Corporation',
    url: 'https://delhimetrorail.com/otherdocuments/Sustainability-Report.pdf',
  },
  {
    id: SOURCE_WHO,
    title: 'WHO Global Air Quality Guidelines 2021',
    organization: 'World Health Organization',
    url: 'https://www.who.int/publications/i/item/9789240034228',
  },
  {
    id: SOURCE_SAMEER,
    title: 'CPCB Air Quality Management Portals & Advisories',
    organization: 'Central Pollution Control Board',
    url: 'https://cpcb.gov.in/air-quality-management-portals/',
  },
  {
    id: SOURCE_EPA_CLEANERS,
    title: 'US EPA Guide to Air Cleaners in the Home',
    organization: 'US Environmental Protection Agency',
    url: 'https://www.epa.gov/indoor-air-quality-iaq/air-cleaners-and-air-filters-home',
  },
  {
    id: SOURCE_IITK,
    title: 'IIT Kanpur Comprehensive Study on Air Pollution in Delhi',
    organization: 'Indian Institute of Technology Kanpur',
    url: 'https://environment.delhi.gov.in/sites/default/files/environment/generic_multiple_files/final_report09jan2016_1.pdf',
  },
  {
    id: SOURCE_NIOSH,
    title: 'NIOSH Respirator Types and Use Guidance',
    organization: 'CDC NIOSH',
    url: 'https://www.cdc.gov/niosh/ppe/respirators/',
  },
  {
    id: SOURCE_LANCET,
    title:
      'Lancet Planetary Health: Health and Economic Impact of Air Pollution in India',
    organization: 'The Lancet Planetary Health',
    url: 'https://doi.org/10.1016/S2542-5196(20)30298-9',
  },
];

/** Map of action sources indexed by identifier. */
export const ACTION_SOURCES_MAP: ReadonlyMap<string, ActionSource> = new Map(
  ACTION_SOURCES.map((source) => [source.id, source])
);

/** Retrieves a source citation by unique identifier. */
export function getActionSourceById(id: string): ActionSource | undefined {
  return ACTION_SOURCES_MAP.get(id);
}
