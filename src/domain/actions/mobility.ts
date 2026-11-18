import type { Action } from '../contracts';

/** Curated particulate and emissions mitigation actions for urban mobility. */
export const MOBILITY_ACTIONS: readonly Action[] = [
  {
    id: 'act-mobility-metro-shift',
    category: 'mobility',
    title: 'Shift commute from car or two-wheeler to Delhi Metro',
    description:
      'Transfer daily commute from private motorized vehicles to the Delhi Metro network, reducing direct traffic exhaust exposure and urban carbon footprint.',
    costRupees: 60,
    effort: 2,
    effects: [
      {
        type: 'emissionsReduction',
        formulaId: 'modal-shift-metro',
        co2eGramsPerKm: 122,
      },
      {
        type: 'exposureReduction',
        formulaId: 'metro-cabin-air-filtration',
        reductionBasisPoints: 5000,
      },
    ],
    sourceIds: ['dmrc-sustainability-report-2023', 'cpcb-emissions-inventory'],
    confidence: 'high',
  },
  {
    id: 'act-mobility-electric-or-bus',
    category: 'mobility',
    title: 'Switch two-wheeler commute to electric or bus',
    description:
      'Shift recurring two-wheeler trips to municipal CNG/electric buses or electric two-wheelers to cut localized tailpipe emissions and roadside particulate exposure.',
    costRupees: 25,
    effort: 2,
    effects: [
      {
        type: 'emissionsReduction',
        formulaId: 'modal-shift-bus',
        co2eGramsPerKm: 30,
      },
      {
        type: 'exposureReduction',
        formulaId: 'bus-cabin-exposure',
        reductionBasisPoints: 2000,
      },
    ],
    sourceIds: ['cpcb-emissions-inventory', 'iitk-delhi-air-study'],
    confidence: 'high',
  },
  {
    id: 'act-mobility-carpool',
    category: 'mobility',
    title: 'Carpool with coworkers or neighbors',
    description:
      'Consolidate daily automobile commutes with colleagues along shared arterial routes, effectively halving per-passenger road emissions and vehicle congestion.',
    costRupees: 0,
    effort: 2,
    effects: [
      {
        type: 'emissionsReduction',
        formulaId: 'carpool-per-capita-reduction',
        co2eGramsPerKm: 70,
      },
      {
        type: 'exposureReduction',
        formulaId: 'carpool-cabin-filtration',
        reductionBasisPoints: 1000,
      },
    ],
    sourceIds: ['cpcb-emissions-inventory'],
    confidence: 'medium',
  },
  {
    id: 'act-mobility-cycle-low-aqi',
    category: 'mobility',
    title: 'Cycle on low-traffic routes during low-AQI hours',
    description:
      'Reroute bicycle trips away from congested highways onto secondary residential roads strictly during afternoon minimum AQI windows.',
    costRupees: 0,
    effort: 2,
    effects: [
      {
        type: 'emissionsReduction',
        formulaId: 'zero-emission-cycle',
        co2eGramsPerKm: 75,
      },
      {
        type: 'exposureReduction',
        formulaId: 'low-traffic-corridor-exposure',
        reductionBasisPoints: 2500,
      },
    ],
    sourceIds: ['cpcb-emissions-inventory', 'cpcb-sameer-guidelines'],
    confidence: 'medium',
  },
  {
    id: 'act-mobility-avoid-rush-two-wheeler',
    category: 'mobility',
    title: 'Avoid two-wheeler travel during peak morning rush',
    description:
      'Reschedule open-air two-wheeler trips to avoid the 08:00-10:30 morning traffic rush when diesel particulate concentrations and vehicle tailpipe idling peak.',
    costRupees: 0,
    effort: 1,
    effects: [
      {
        type: 'exposureReduction',
        formulaId: 'off-peak-transit-window',
        reductionBasisPoints: 3500,
      },
    ],
    sourceIds: ['cpcb-sameer-guidelines', 'iitk-delhi-air-study'],
    confidence: 'high',
  },
  {
    id: 'act-mobility-walk-n95-window',
    category: 'mobility',
    title: 'Walk with N95 during low-AQI windows',
    description:
      'Undertake necessary pedestrian transit during the 12:00-16:00 solar mixing window while wearing a certified, tight-fitting N95 particulate respirator.',
    costRupees: 150,
    effort: 1,
    effects: [
      {
        type: 'emissionsReduction',
        formulaId: 'zero-emission-walk',
        co2eGramsPerKm: 75,
      },
      {
        type: 'exposureReduction',
        formulaId: 'n95-filtered-transit',
        reductionBasisPoints: 8500,
      },
    ],
    sourceIds: ['niosh-respirator-standards', 'cpcb-sameer-guidelines'],
    confidence: 'high',
  },
];
