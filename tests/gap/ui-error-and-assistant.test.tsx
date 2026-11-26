import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type { JSX } from 'react';
import { ErrorBoundary } from '../../src/shared/ui';
import { AssistantPanel } from '../../src/features/assistant';
import { useAppStore } from '../../src/app/store';
import { DEFAULT_HOUSEHOLD_PERSONA } from '../../src/config/persona';

function BrokenChild({
  shouldThrow,
}: {
  readonly shouldThrow: boolean;
}): JSX.Element {
  if (shouldThrow) {
    throw new Error('Render crash');
  }
  return <div>Healthy child</div>;
}

function makeGeminiResponse(payload: unknown, status = 200): Response {
  const body =
    status === 200
      ? JSON.stringify({
          candidates: [
            { content: { parts: [{ text: JSON.stringify(payload) }] } },
          ],
        })
      : String(payload);
  return new Response(body, { status });
}

beforeEach(() => {
  useAppStore.setState({
    profile: DEFAULT_HOUSEHOLD_PERSONA,
    language: 'en',
    selectedCity: 'Delhi',
    aiConsent: false,
    hourlySeries: null,
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('ErrorBoundary fallback rendering', () => {
  it('renders children normally when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <BrokenChild shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Healthy child')).toBeDefined();
  });

  it('renders default alert fallback when a child throws', () => {
    const con = Reflect.get(globalThis, 'console') as {
      error: (...args: unknown[]) => void;
    };
    vi.spyOn(con, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BrokenChild shouldThrow={true} />
      </ErrorBoundary>
    );
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Something went wrong');
  });

  it('renders custom fallback prop when supplied', () => {
    const con = Reflect.get(globalThis, 'console') as {
      error: (...args: unknown[]) => void;
    };
    vi.spyOn(con, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<div role="status">Custom recovery UI</div>}>
        <BrokenChild shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByRole('status').textContent).toBe('Custom recovery UI');
  });
});

describe('AssistantPanel hourly series and cloud path', () => {
  it('handles invalid hourly reading fallback and API key cloud answer', async () => {
    useAppStore.setState({
      hourlySeries: {
        city: 'Delhi',
        isSample: false,
        readings: Array.from({ length: 24 }, (_, hour) => ({
          hour,
          pm25: -5,
          pm10: 10,
        })),
      },
    });
    const fetchMock = vi.fn(async () =>
      makeGeminiResponse({
        answer: 'AQI 180 suggests indoor filtering.',
        usedActionIds: ['act-indoor-seal-gaps'],
        refusal: false,
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<AssistantPanel />);
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.change(screen.getByLabelText('Gemini API Key'), {
      target: { value: 'mem-only-key' },
    });
    const input = screen.getByPlaceholderText(/ask about air quality/i);
    fireEvent.change(input, { target: { value: 'Should we seal gaps?' } });
    fireEvent.click(screen.getByRole('button', { name: /ask/i }));

    await waitFor(() => {
      expect(screen.getByText(/Source: gemini engine/i)).toBeDefined();
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByPlaceholderText(/ask about air quality/i), {
      target: { value: 'Should we seal gaps?' },
    });
    fireEvent.click(screen.getByRole('button', { name: /ask/i }));
    await waitFor(() => {
      expect(screen.getAllByText(/Source: gemini engine/i)).toHaveLength(2);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('shows model unavailable fallback notice on 404 and ignores blank submit', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => makeGeminiResponse('model not found', 404))
    );
    render(<AssistantPanel />);
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.change(screen.getByLabelText('Gemini API Key'), {
      target: { value: 'mem-only-key' },
    });

    const form = screen
      .getByPlaceholderText(/ask about air quality/i)
      .closest('form');
    if (form) fireEvent.submit(form);

    fireEvent.change(screen.getByPlaceholderText(/ask about air quality/i), {
      target: { value: 'Can we open windows?' },
    });
    fireEvent.click(screen.getByRole('button', { name: /ask/i }));

    await waitFor(() => {
      expect(
        screen.getByText('AI model unavailable, local guidance shown.')
      ).toBeDefined();
    });
  });
});
