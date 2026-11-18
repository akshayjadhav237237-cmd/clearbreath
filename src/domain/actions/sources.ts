/** Verified scientific citation and regulatory source reference. */
export interface ActionSource {
  readonly id: string;
  readonly title: string;
  readonly organization: string;
  readonly url: string;
}

/** Curated registry of verified empirical evidence sources. */
export const ACTION_SOURCES: readonly ActionSource[] = [
  {
    id: 'cpcb-emissions-inventory',
    title: 'CPCB Comprehensive Emissions Inventory for Delhi-NCR',
    organization: 'Central Pollution Control Board',
    url: 'https://cpcb.nic.in/source-apportionment-studies/',
  },
  {
    id: 'dmrc-sustainability-report-2023',
    title: 'Delhi Metro Rail Corporation Sustainability Report 2023',
    organization: 'Delhi Metro Rail Corporation',
    url: 'https://www.delhimetrorail.com/corporate-sustainability',
  },
  {
    id: 'who-air-quality-guidelines-2021',
    title: 'WHO Global Air Quality Guidelines 2021',
    organization: 'World Health Organization',
    url: 'https://www.who.int/publications/i/item/9789240034228',
  },
  {
    id: 'cpcb-sameer-guidelines',
    title: 'CPCB Sameer App & Air Quality Advisories',
    organization: 'Central Pollution Control Board',
    url: 'https://cpcb.nic.in/air-quality-guidelines/',
  },
  {
    id: 'epa-indoor-air-cleaners',
    title: 'US EPA Guide to Air Cleaners in the Home',
    organization: 'US Environmental Protection Agency',
    url: 'https://www.epa.gov/indoor-air-quality-iaq/air-cleaners-and-air-filters-home',
  },
  {
    id: 'iitk-delhi-air-study',
    title: 'IIT Kanpur Comprehensive Study on Air Pollution in Delhi',
    organization: 'Indian Institute of Technology Kanpur',
    url: 'https://cpcb.nic.in/delhi-air-pollution-study-iitk/',
  },
  {
    id: 'niosh-respirator-standards',
    title: 'NIOSH Guide to the Selection and Use of Particulate Respirators',
    organization: 'CDC NIOSH',
    url: 'https://www.cdc.gov/niosh/npptl/topics/respirators/disp_part/default.html',
  },
  {
    id: 'lancet-planetary-health-india',
    title:
      'Lancet Planetary Health: Health and Economic Impact of Air Pollution in India',
    organization: 'The Lancet Planetary Health',
    url: 'https://www.thelancet.com/journals/lanplh',
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
