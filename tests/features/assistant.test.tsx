import { afterEach, describe, expect, it } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { AssistantPanel } from '../../src/features/assistant';
import { AssistantChatBox } from '../../src/features/assistant/chat-transcript';
import { useAppStore } from '../../src/app/store';

afterEach(() => {
  cleanup();
  useAppStore.setState({
    language: 'en',
    aiConsent: false,
    hourlySeries: null,
    selectedCity: 'Delhi',
  });
});

const HI_LOCAL_SRC = 'स्रोत: स्थानीय इंजन';

describe('AssistantPanel', () => {
  it('renders chat interface with pre-canned prompts and consent toggle', () => {
    render(<AssistantPanel />);
    expect(
      screen.getByRole('heading', { name: /ai air quality assistant/i })
    ).toBeDefined();
    expect(screen.getByText(/enable cloud gemini/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/ask about air quality/i)).toBeDefined();
  });

  it('populates and sends pre-canned prompts into chat transcript', async () => {
    render(<AssistantPanel />);
    const promptBtn = screen.getByRole('button', {
      name: /can my child play outdoors at 4pm\?/i,
    });
    fireEvent.click(promptBtn);
    expect(
      await screen.findByText(/prioritize indoor filtration/i)
    ).toBeDefined();
  });

  it('handles custom user question submission and facts modal toggle', async () => {
    render(<AssistantPanel />);

    const factsBtn = screen.getByRole('button', { name: /grounding facts/i });
    fireEvent.click(factsBtn);
    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByText(/Current AQI in Delhi is 180/i)).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /close dialog/i }));
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('checkbox'));
    const input = screen.getByPlaceholderText(/ask about air quality/i);
    fireEvent.change(input, { target: { value: 'Can I exercise outdoors?' } });
    fireEvent.click(screen.getByRole('button', { name: /ask/i }));
    expect(await screen.findByText(/can i exercise outdoors\?/i)).toBeDefined();
  });
});

describe('AssistantPanel fallback and Hindi localization', () => {
  it('renders fallback notice when model is unavailable in EN and HI', () => {
    const messages = [
      {
        id: '1',
        sender: 'assistant' as const,
        text: 'Local recommendation',
        source: 'local' as const,
        fallbackReason: 'modelUnavailable',
      },
    ];
    const { rerender } = render(
      <AssistantChatBox
        messages={messages}
        input=""
        isLoading={false}
        onInputChange={() => {}}
        onSend={() => {}}
        placeholder="Ask"
        sendLabel="Send"
      />
    );
    expect(
      screen.getByText('AI model unavailable, local guidance shown.')
    ).toBeDefined();

    rerender(
      <AssistantChatBox
        messages={messages}
        input=""
        isLoading={false}
        onInputChange={() => {}}
        onSend={() => {}}
        placeholder="पूछें"
        sendLabel="पूछें"
        language="hi"
      />
    );
    expect(
      screen.getByText(
        'एआई मॉडल उपलब्ध नहीं है, स्थानीय परामर्श दिखाया गया है।'
      )
    ).toBeDefined();
    expect(screen.getByText(HI_LOCAL_SRC)).toBeDefined();
  });

  it('renders complete Hindi localization and unified selector AQI', async () => {
    useAppStore.setState({
      language: 'hi',
      aiConsent: true,
      hourlySeries: {
        city: 'Delhi',
        isSample: true,
        readings: Array.from({ length: 24 }, (_, hour) => ({
          hour,
          pm25: 190,
          pm10: 300,
        })),
      },
    });
    render(<AssistantPanel />);
    expect(screen.getByText(/मैं क्लियरब्रेथ हूँ/i)).toBeDefined();
    expect(screen.getByLabelText('जेमिनी API कुंजी')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'आधारभूत तथ्य' }));
    expect(screen.getByText('एआई को भेजे गए आधारभूत तथ्य')).toBeDefined();
    expect(screen.getByText(/Delhi में वर्तमान एक्यूआई 354/i)).toBeDefined();

    const hiPrompt = screen.getByRole('button', {
      name: /क्या मेरा बच्चा शाम 4 बजे बाहर खेल सकता है\?/i,
    });
    fireEvent.click(hiPrompt);
    await waitFor(() => {
      expect(screen.getAllByText(HI_LOCAL_SRC)).toHaveLength(2);
    });
  });
});
