import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { RecommendationsPanel } from '../../src/features/recommendations';
import { RecommendationItemCard } from '../../src/features/recommendations/recommendation-card';
import { useAppStore } from '../../src/app/store';
import { DEFAULT_HOUSEHOLD_PERSONA } from '../../src/config/persona';
import type { HourlyReading } from '../../src/domain/contracts';

const ATTR_EXPANDED = 'aria-expanded';
const CITY_DELHI = 'Delhi';
const EN_CATS = [
  'All',
  'Indoor',
  'Mobility',
  'Outdoor',
  'Household',
  'Community',
];
const HI_CATS = ['सभी', 'घर के अंदर', 'यातायात', 'बाहरी', 'घरेलू', 'सामुदायिक'];

const FALLBACK_ITEM = {
  action: {
    id: 'act-test-fallback',
    category: 'indoor' as const,
    title: 'Fallback Test Action',
    description: 'Verifies fallback provenance when explanation is absent.',
    costRupees: 100,
    effort: 1 as const,
    effects: [],
    sourceIds: ['unknown-source-id'],
    confidence: 'low' as const,
  },
  dailyDoseReductionUg: 42,
  doseReductionBasisPoints: 150,
  co2eSavedGramsPerDay: 0,
};

function makeUniformReadings(pm25: number, pm10: number): HourlyReading[] {
  return Array.from({ length: 24 }, (_, hour) => ({ hour, pm25, pm10 }));
}

function clickDefined(el: HTMLElement | undefined): void {
  expect(el).toBeDefined();
  if (el) fireEvent.click(el);
}

afterEach(() => {
  cleanup();
  useAppStore.setState({
    language: 'en',
    completedActionIds: [],
    hourlySeries: null,
    profile: DEFAULT_HOUSEHOLD_PERSONA,
    selectedCity: CITY_DELHI,
  });
});

describe('RecommendationsPanel filtering and live AQI', () => {
  it('renders prioritized actions and filters by category', () => {
    render(<RecommendationsPanel />);
    expect(
      screen.getByRole('heading', { name: /mitigation actions/i })
    ).toBeDefined();
    expect(
      screen.getByRole('navigation', { name: /action categories/i })
    ).toBeDefined();
    for (const label of EN_CATS) {
      expect(screen.getByRole('button', { name: label })).toBeDefined();
    }
    const indoorBtn = screen.getByRole('button', { name: 'Indoor' });
    fireEvent.click(indoorBtn);
    expect(indoorBtn.className).toContain('bg-sky-700');
    expect(indoorBtn.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getAllByText('Confidence: High').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/0 g CO2e\/day/i).length).toBeGreaterThan(0);
  });

  it('updates dose savings on AQI changes and shows CO2e savings', () => {
    const { rerender } = render(<RecommendationsPanel />);
    expect(screen.getByText(/Delhi • AQI 180/)).toBeDefined();
    expect(screen.getByText('-503 µg/day')).toBeDefined();
    useAppStore.setState({
      hourlySeries: {
        city: CITY_DELHI,
        readings: makeUniformReadings(250, 400),
        isSample: false,
      },
      profile: {
        ...DEFAULT_HOUSEHOLD_PERSONA,
        lifestyle: {
          ...DEFAULT_HOUSEHOLD_PERSONA.lifestyle,
          commute: { mode: 'car', distanceKm: 12, minutes: 35 },
        },
      },
    });
    rerender(<RecommendationsPanel />);
    expect(screen.getByText(/Delhi • AQI 400/)).toBeDefined();
    expect(screen.getByText('-1,510 µg/day')).toBeDefined();
    expect(screen.getByText('672 g CO2e/day')).toBeDefined();
  });
});

describe('RecommendationsPanel Why this? provenance drawer', () => {
  it('toggles Why this? drawer with impact, assumptions, and sources', () => {
    render(<RecommendationsPanel />);
    const firstWhy = screen.getAllByRole('button', { name: /why this\?/i })[0];
    expect(firstWhy?.getAttribute(ATTR_EXPANDED)).toBe('false');
    clickDefined(firstWhy);
    expect(firstWhy?.getAttribute(ATTR_EXPANDED)).toBe('true');
    expect(screen.getByText('Model Provenance & Evidence')).toBeDefined();
    expect(screen.getByText('incense-combustion-elimination')).toBeDefined();
    expect(screen.getByText('36.0%')).toBeDefined();
    expect(
      screen.getByText(/standard diurnal exposure pattern/i)
    ).toBeDefined();
    const iitkLink = screen.getByRole('link', {
      name: /iit kanpur comprehensive study/i,
    });
    expect(iitkLink.getAttribute('href')).toMatch(/^https:\/\//);
    expect(
      screen.getByText(/Indian Institute of Technology Kanpur/)
    ).toBeDefined();
    const ashraeLink = screen.getByRole('link', {
      name: /ashrae standard 62\.2/i,
    });
    expect(ashraeLink.getAttribute('href')).toMatch(/^https:\/\//);
    expect(screen.getByText(/— ASHRAE$/)).toBeDefined();
    clickDefined(firstWhy);
    expect(firstWhy?.getAttribute(ATTR_EXPANDED)).toBe('false');
  });

  it('handles empty eligibility and fallback drawer safely', () => {
    useAppStore.setState({
      profile: { ...DEFAULT_HOUSEHOLD_PERSONA, members: [] },
    });
    const { rerender } = render(<RecommendationsPanel />);
    expect(
      screen.getByText(/no eligible actions found for this category/i)
    ).toBeDefined();
    rerender(
      <ul>
        <RecommendationItemCard
          item={FALLBACK_ITEM}
          isDone={false}
          onToggle={() => undefined}
        />
      </ul>
    );
    clickDefined(screen.getByRole('button', { name: /why this\?/i }));
    expect(screen.getByText('indoor-pm25-mass-balance')).toBeDefined();
    expect(
      screen.getByText(/derived from core residential exposure/i)
    ).toBeDefined();
  });
});

describe('RecommendationsPanel completion and Hindi localization', () => {
  it('toggles completion and renders Hindi card and drawer copy', () => {
    const { rerender } = render(<RecommendationsPanel />);
    expect(
      screen.getAllByText(/estimate under stated assumptions/i).length
    ).toBeGreaterThan(0);
    clickDefined(
      screen.getAllByRole('button', { name: /\+ mark as implemented/i })[0]
    );
    expect(useAppStore.getState().completedActionIds).toHaveLength(1);
    expect(screen.getByText('✓ IMPLEMENTED TODAY')).toBeDefined();
    expect(screen.getByRole('button', { name: '✓ Completed' })).toBeDefined();
    useAppStore.setState({ language: 'hi' });
    rerender(<RecommendationsPanel />);
    expect(
      screen.getByRole('heading', { name: 'प्रदूषण रोकथाम उपाय' })
    ).toBeDefined();
    for (const hiCat of HI_CATS) {
      expect(screen.getByRole('button', { name: hiCat })).toBeDefined();
    }
    expect(screen.getByText('✓ आज लागू किया गया')).toBeDefined();
    expect(screen.getByRole('button', { name: '✓ पूर्ण हुआ' })).toBeDefined();
    expect(screen.getAllByText('विश्वास स्तर: उच्च').length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(
        /निर्दिष्ट मान्यताओं के अंतर्गत मॉडल किया गया अनुमान/i
      ).length
    ).toBeGreaterThan(0);
    clickDefined(screen.getAllByRole('button', { name: /यह क्यों\?/i })[0]);
    expect(screen.getByText('मॉडल प्रमाण और स्रोत विवरण')).toBeDefined();
    expect(screen.getByText('प्रमुख मॉडलिंग मान्यताएं')).toBeDefined();
    expect(screen.getByText('वैज्ञानिक और नियामक स्रोत')).toBeDefined();
  });
});
