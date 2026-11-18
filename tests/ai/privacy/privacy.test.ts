import { describe, expect, it } from 'vitest';
import type { HouseholdProfile } from '../../../src/domain/contracts';
import {
  PRIVACY_DISCLOSURE_ALLOWLIST,
  buildLlmSafeContext,
  categorizeBudgetBand,
  renderPrivacyDisclosureMarkdown,
} from '../../../src/ai/privacy';

const canaryMemberId = 'canary-secret-member-id-998877';
const canaryArea = 143;
const canaryBudget = 3750;

const canaryProfile: HouseholdProfile = {
  members: [
    { id: canaryMemberId, ageGroup: 'child', respiratoryCondition: true },
  ],
  home: {
    type: 'apartment',
    floorAreaM2: canaryArea,
    ceilingHeightCm: 280,
    sealing: 'tight',
    purifierCadrM3h: 300,
    hasKitchenExhaust: true,
    cookingFuel: 'induction',
  },
  lifestyle: {
    budgetRupees: canaryBudget,
    outdoorMinutesPerDay: 45,
    commute: { mode: 'metro', distanceKm: 15, minutes: 35 },
  },
};

describe('Privacy preservation and PII exclusion', () => {
  it('excludes canary PII tokens from constructed safe context', () => {
    const ctx = buildLlmSafeContext({
      profile: canaryProfile,
      aqi: { value: 350, category: 'veryPoor', dominant: 'pm25' },
      sensitivityLevel: 'high',
      city: 'Delhi',
      facts: [],
      question: 'Is it safe outside?',
      language: 'en',
    });

    const serialized = JSON.stringify(ctx);
    expect(serialized).not.toContain(canaryMemberId);
    expect(serialized).not.toContain(String(canaryArea));
    expect(serialized).not.toContain(String(canaryBudget));
    expect(ctx.budgetBand).toBe('medium');
    expect(ctx.ageGroupsPresent).toEqual(['child']);
  });

  it('categorizes budget bands deterministically', () => {
    expect(categorizeBudgetBand(1500)).toBe('low');
    expect(categorizeBudgetBand(3500)).toBe('medium');
    expect(categorizeBudgetBand(7500)).toBe('high');
  });
});

describe('Privacy disclosure documentation and schema parity', () => {
  it('maintains strict parity between disclosure list and safe context keys', () => {
    const ctx = buildLlmSafeContext({
      profile: canaryProfile,
      aqi: { value: 100, category: 'satisfactory', dominant: 'pm25' },
      sensitivityLevel: 'low',
      city: 'Pune',
      facts: [],
      question: null,
      language: 'en',
    });

    const contextKeys = Object.keys(ctx).sort();
    const disclosureKeys = PRIVACY_DISCLOSURE_ALLOWLIST.map(
      (item) => item.field
    ).sort();
    expect(contextKeys).toEqual(disclosureKeys);
  });

  it('renders a formatted Markdown table with all disclosure entries', () => {
    const md = renderPrivacyDisclosureMarkdown();
    expect(md).toContain('| Field | Purpose | Example |');
    for (const item of PRIVACY_DISCLOSURE_ALLOWLIST) {
      expect(md).toContain(`\`${item.field}\``);
    }
  });
});
