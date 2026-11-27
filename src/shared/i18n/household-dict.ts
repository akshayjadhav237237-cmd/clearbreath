import type { Language } from './types';

const EN_HOUSEHOLD_SPEC = {
  sensitivityLabel: 'Sensitivity:',
  riskSuffix: 'RISK',
  sensitivityLevels: { low: 'LOW', elevated: 'ELEVATED', high: 'HIGH' },
  respiratoryCondition: '⚠️ Respiratory Condition',
  healthy: 'Healthy',
  homeTypeLabel: 'Home Type',
  floorAreaLabel: 'Floor Area',
  sealingLabel: 'Building Sealing',
  cookingFuelLabel: 'Cooking Fuel',
  sqMetersUnit: 'm²',
  budgetError: 'Budget must be an integer between 0 and 500000',
  ageGroups: {
    infant: 'Infant',
    child: 'Child',
    adult: 'Adult',
    older: 'Older Adult',
  },
  homeTypes: {
    apartment: 'Apartment',
    house: 'Independent House',
    singleRoom: 'Single Room',
  },
  sealingTypes: {
    leaky: 'Leaky',
    average: 'Average',
    tight: 'Tight',
  },
  fuels: {
    lpg: 'LPG',
    png: 'PNG',
    induction: 'Induction',
    biomass: 'Biomass',
  },
};

/** Bilingual dictionary contract for Household profile specs and members. */
export type HouseholdSpecDict = typeof EN_HOUSEHOLD_SPEC;

const HI_HOUSEHOLD_SPEC: HouseholdSpecDict = {
  sensitivityLabel: 'संवेदनशीलता:',
  riskSuffix: 'जोखिम',
  sensitivityLevels: { low: 'कम', elevated: 'मध्यम', high: 'उच्च' },
  respiratoryCondition: '⚠️ श्वसन संबंधी समस्या',
  healthy: 'स्वस्थ',
  homeTypeLabel: 'आवास प्रकार',
  floorAreaLabel: 'फ्लोर क्षेत्रफल',
  sealingLabel: 'भवन की सीलिंग',
  cookingFuelLabel: 'खाना पकाने का ईंधन',
  sqMetersUnit: 'वर्ग मी.',
  budgetError: 'बजट 0 और 500000 के बीच एक पूर्णांक होना चाहिए',
  ageGroups: {
    infant: 'शिशु',
    child: 'बच्चा',
    adult: 'वयस्क',
    older: 'वरिष्ठ नागरिक',
  },
  homeTypes: {
    apartment: 'अपार्टमेंट',
    house: 'स्वतंत्र मकान',
    singleRoom: 'एक कमरा',
  },
  sealingTypes: {
    leaky: 'कम सील',
    average: 'औसत सील',
    tight: 'मजबूत सील',
  },
  fuels: {
    lpg: 'एलपीजी',
    png: 'पीएनजी',
    induction: 'इंडक्शन',
    biomass: 'बायोमास',
  },
};

/** Returns localized English or Hindi copy for the Household profile panel. */
export function getHouseholdSpecDict(language: Language): HouseholdSpecDict {
  return language === 'hi' ? HI_HOUSEHOLD_SPEC : EN_HOUSEHOLD_SPEC;
}
