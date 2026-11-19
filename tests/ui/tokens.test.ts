import { describe, expect, it } from 'vitest';

interface ContrastToken {
  readonly role: string;
  readonly type: 'text' | 'ui';
  readonly fg: string;
  readonly bg: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function getRelativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

function computeContrast(fg: string, bg: string): number {
  const l1 = getRelativeLuminance(hexToRgb(fg));
  const l2 = getRelativeLuminance(hexToRgb(bg));
  const [high, low] = l1 > l2 ? [l1, l2] : [l2, l1];
  return Math.round(((high + 0.05) / (low + 0.05)) * 100) / 100;
}

const COLOR_TOKENS: readonly ContrastToken[] = [
  // 6 AQI Categories (Light)
  { role: 'AQI Good (Light)', type: 'text', fg: '#022c22', bg: '#d1fae5' },
  {
    role: 'AQI Satisfactory (Light)',
    type: 'text',
    fg: '#1a2e05',
    bg: '#ecfccb',
  },
  { role: 'AQI Moderate (Light)', type: 'text', fg: '#451a03', bg: '#fef3c7' },
  { role: 'AQI Poor (Light)', type: 'text', fg: '#431407', bg: '#ffedd5' },
  { role: 'AQI Very Poor (Light)', type: 'text', fg: '#4c0519', bg: '#ffe4e6' },
  { role: 'AQI Severe (Light)', type: 'text', fg: '#3b0764', bg: '#f3e8ff' },

  // 6 AQI Categories (Dark)
  { role: 'AQI Good (Dark)', type: 'text', fg: '#d1fae5', bg: '#022c22' },
  {
    role: 'AQI Satisfactory (Dark)',
    type: 'text',
    fg: '#ecfccb',
    bg: '#1a2e05',
  },
  { role: 'AQI Moderate (Dark)', type: 'text', fg: '#fef3c7', bg: '#451a03' },
  { role: 'AQI Poor (Dark)', type: 'text', fg: '#ffedd5', bg: '#431407' },
  { role: 'AQI Very Poor (Dark)', type: 'text', fg: '#ffe4e6', bg: '#4c0519' },
  { role: 'AQI Severe (Dark)', type: 'text', fg: '#f3e8ff', bg: '#3b0764' },

  // Focus Ring
  { role: 'Focus Ring (Light BG)', type: 'ui', fg: '#0284c7', bg: '#ffffff' },
  { role: 'Focus Ring (Dark BG)', type: 'ui', fg: '#38bdf8', bg: '#020617' },

  // Borders
  {
    role: 'UI Border (Light Slate-500)',
    type: 'ui',
    fg: '#64748b',
    bg: '#ffffff',
  },
  {
    role: 'UI Border (Dark Slate-500)',
    type: 'ui',
    fg: '#64748b',
    bg: '#020617',
  },

  // Chart Bars
  {
    role: 'Chart Bar Safe (Emerald-700)',
    type: 'ui',
    fg: '#047857',
    bg: '#ffffff',
  },
  {
    role: 'Chart Bar Peak (Rose-700)',
    type: 'ui',
    fg: '#be123c',
    bg: '#ffffff',
  },
  {
    role: 'Chart Bar Commute (Sky-700)',
    type: 'ui',
    fg: '#0369a1',
    bg: '#ffffff',
  },

  // Badges & Buttons
  { role: 'Sky Primary Button', type: 'text', fg: '#ffffff', bg: '#0369a1' },
  { role: 'Info Badge (Light)', type: 'text', fg: '#082f49', bg: '#e0f2fe' },
  { role: 'Info Badge (Dark)', type: 'text', fg: '#e0f2fe', bg: '#082f49' },
  { role: 'Neutral Badge (Light)', type: 'text', fg: '#1e293b', bg: '#f1f5f9' },
  { role: 'Neutral Badge (Dark)', type: 'text', fg: '#f1f5f9', bg: '#1e293b' },

  // Links
  { role: 'Link (Light Mode)', type: 'text', fg: '#0369a1', bg: '#ffffff' },
  { role: 'Link (Dark Mode)', type: 'text', fg: '#38bdf8', bg: '#0f172a' },

  // Disabled UI Elements
  {
    role: 'Disabled Button Contrast',
    type: 'ui',
    fg: '#64748b',
    bg: '#f1f5f9',
  },

  // Dark Scheme Foundations
  { role: 'Dark Body Text', type: 'text', fg: '#f8fafc', bg: '#020617' },
  { role: 'Dark Secondary Text', type: 'text', fg: '#cbd5e1', bg: '#020617' },
];

describe('Design system token contrast verification', () => {
  it('enforces minimum 4.5:1 ratio for all text tokens and 3.0:1 for UI elements', () => {
    for (const token of COLOR_TOKENS) {
      const ratio = computeContrast(token.fg, token.bg);
      const minRequired = token.type === 'text' ? 4.5 : 3.0;
      expect(
        ratio,
        `Token "${token.role}" (${token.fg} on ${token.bg}) has ratio ${ratio}, expected >= ${minRequired}`
      ).toBeGreaterThanOrEqual(minRequired);
    }
  });

  it('verifies exact mathematical extremes', () => {
    expect(computeContrast('#ffffff', '#000000')).toBe(21);
    expect(computeContrast('#000000', '#ffffff')).toBe(21);
    expect(computeContrast('#ffffff', '#ffffff')).toBe(1);
  });
});
