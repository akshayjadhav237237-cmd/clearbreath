import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { CommunityPanel } from '../../src/features/community';

afterEach(() => {
  cleanup();
});

describe('CommunityPanel', () => {
  it('renders WhatsApp/RWA broadcast draft and copy button', () => {
    render(<CommunityPanel />);
    expect(
      screen.getByRole('heading', { name: /neighborhood broadcast card/i })
    ).toBeDefined();
    expect(screen.getByText(/whatsapp \/ rwa broadcast draft/i)).toBeDefined();
    expect(
      screen.getByRole('button', { name: /copy broadcast text/i })
    ).toBeDefined();
  });

  it('copies broadcast draft text to clipboard and triggers feedback', async () => {
    let copiedText = '';
    Object.assign(navigator, {
      clipboard: {
        writeText: async (text: string) => {
          copiedText = text;
        },
      },
    });
    render(<CommunityPanel />);
    const copyBtn = screen.getByRole('button', {
      name: /copy broadcast text/i,
    });
    fireEvent.click(copyBtn);
    expect(copiedText).toContain('Clearbreath Neighborhood Air Advisory');
  });
});
