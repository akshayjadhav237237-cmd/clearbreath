import { afterEach, describe, expect, it } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { CommunityPanel } from '../../src/features/community';
import { useAppStore } from '../../src/app/store';
import { DEFAULT_HOUSEHOLD_PERSONA } from '../../src/config/persona';

afterEach(() => {
  cleanup();
  useAppStore.setState({
    language: 'en',
    selectedCity: 'Delhi',
    hourlySeries: null,
    profile: DEFAULT_HOUSEHOLD_PERSONA,
    toastMessage: null,
  });
});

describe('CommunityPanel', () => {
  it('renders WhatsApp/RWA broadcast draft with unified AQI and plan hours', () => {
    render(<CommunityPanel />);
    expect(
      screen.getByRole('heading', { name: /neighborhood broadcast card/i })
    ).toBeDefined();
    expect(screen.getByText(/whatsapp \/ rwa broadcast draft/i)).toBeDefined();
    expect(screen.getByText(/Current AQI: \*180 \(Moderate\)\*/)).toBeDefined();
    expect(screen.getByText(/13:00 – 14:00/)).toBeDefined();
    expect(
      screen.getByRole('button', { name: /copy broadcast text/i })
    ).toBeDefined();
  });

  it('copies broadcast draft text to clipboard and handles copy errors', async () => {
    let copiedText = '';
    Object.assign(navigator, {
      clipboard: {
        writeText: async (text: string) => {
          copiedText = text;
        },
      },
    });
    render(<CommunityPanel />);
    fireEvent.click(
      screen.getByRole('button', { name: /copy broadcast text/i })
    );
    await waitFor(() => {
      expect(copiedText).toContain('Clearbreath Neighborhood Air Advisory');
    });

    Object.assign(navigator, {
      clipboard: {
        writeText: async () => {
          throw new Error('Denied');
        },
      },
    });
    fireEvent.click(
      screen.getByRole('button', { name: /copy broadcast text/i })
    );
    await waitFor(() => {
      expect(useAppStore.getState().toastMessage).toBe(
        'Could not access clipboard.'
      );
    });
  });

  it('updates severe-day broadcast without outdoor window and supports Hindi', () => {
    useAppStore.setState({
      hourlySeries: {
        city: 'Delhi',
        isSample: true,
        readings: Array.from({ length: 24 }, (_, hour) => ({
          hour,
          pm25: 380,
          pm10: 520,
        })),
      },
    });
    const { rerender } = render(<CommunityPanel />);
    expect(screen.getByText(/None today \(stay indoors\)/)).toBeDefined();
    expect(screen.getByText('Severe')).toBeDefined();

    useAppStore.setState({ language: 'hi' });
    rerender(<CommunityPanel />);
    expect(
      screen.getByText('व्हाट्सएप / आरडब्ल्यूए प्रसारण मसौदा')
    ).toBeDefined();
    expect(screen.getByText(/क्लियरब्रेथ पड़ोस वायु परामर्श/)).toBeDefined();
    expect(
      screen.getByText(/आज कोई सुरक्षित समय नहीं \(घर के अंदर रहें\)/)
    ).toBeDefined();
  });
});
