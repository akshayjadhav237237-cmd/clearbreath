import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AssistantPanel } from '../../src/features/assistant';
import { AssistantChatBox } from '../../src/features/assistant/chat-transcript';

afterEach(() => {
  cleanup();
});

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
    const closeBtn = screen.getByRole('button', { name: /close dialog/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog')).toBeNull();

    const consentCheckbox = screen.getByRole('checkbox');
    fireEvent.click(consentCheckbox);

    const input = screen.getByPlaceholderText(/ask about air quality/i);
    fireEvent.change(input, { target: { value: 'Can I exercise outdoors?' } });
    const submitBtn = screen.getByRole('button', { name: /ask/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/can i exercise outdoors\?/i)).toBeDefined();
  });

  it('renders fallback notice when model is unavailable', () => {
    const messages = [
      {
        id: '1',
        sender: 'assistant' as const,
        text: 'Local recommendation',
        source: 'local' as const,
        fallbackReason: 'modelUnavailable',
      },
    ];
    render(
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
  });
});
