import { describe, expect, it } from 'vitest';

/** Interface representing a color token pair with semantic role. */
export interface ColorPair {
  readonly name: string;
  readonly foreground: string;
  readonly background: string;
  readonly minRatio: number;
}

/** Parses 6-character hex color to RGB triplet. */
export function hexToRgb(hex: string): readonly [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [r, g, b];
}

/** Computes sRGB relative luminance according to WCAG 2.1 specifications. */
export function getRelativeLuminance(
  rgb: readonly [number, number, number]
): number {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

/** Calculates WCAG contrast ratio between two hex colors. */
export function getContrastRatio(fg: string, bg: string): number {
  const lum1 = getRelativeLuminance(hexToRgb(fg));
  const lum2 = getRelativeLuminance(hexToRgb(bg));
  const brighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  const ratio = (brighter + 0.05) / (darker + 0.05);
  return Math.round(ratio * 100) / 100;
}

/** Design system semantic color pairs tested for WCAG AA compliance. */
export const DESIGN_TOKEN_PAIRS: readonly ColorPair[] = [
  {
    name: 'Light Body Text',
    foreground: '#0f172a',
    background: '#ffffff',
    minRatio: 4.5,
  },
  {
    name: 'Light Secondary Text',
    foreground: '#334155',
    background: '#ffffff',
    minRatio: 4.5,
  },
  {
    name: 'Light Muted Box Text',
    foreground: '#334155',
    background: '#f1f5f9',
    minRatio: 4.5,
  },
  {
    name: 'Sky Primary Button',
    foreground: '#ffffff',
    background: '#0369a1',
    minRatio: 4.5,
  },
  {
    name: 'Sky Button Hover',
    foreground: '#ffffff',
    background: '#075985',
    minRatio: 4.5,
  },
  {
    name: 'Emerald Completed Action',
    foreground: '#ffffff',
    background: '#047857',
    minRatio: 4.5,
  },
  {
    name: 'Dark Body Text',
    foreground: '#f8fafc',
    background: '#0f172a',
    minRatio: 4.5,
  },
  {
    name: 'Dark Secondary Text',
    foreground: '#cbd5e1',
    background: '#0f172a',
    minRatio: 4.5,
  },
  {
    name: 'Dark Border UI Component',
    foreground: '#e2e8f0',
    background: '#0f172a',
    minRatio: 3.0,
  },
  {
    name: 'Rose Emergency Alert',
    foreground: '#ffffff',
    background: '#be123c',
    minRatio: 4.5,
  },
  {
    name: 'Amber Warning Badge',
    foreground: '#ffffff',
    background: '#b45309',
    minRatio: 4.5,
  },
];

describe('Design Token Color Contrast Suite', () => {
  it('validates every semantic color pair meets WCAG AA contrast thresholds', () => {
    for (const pair of DESIGN_TOKEN_PAIRS) {
      const ratio = getContrastRatio(pair.foreground, pair.background);
      expect(ratio).toBeGreaterThanOrEqual(pair.minRatio);
    }
  });

  it('computes exact contrast ratios correctly', () => {
    expect(getContrastRatio('#ffffff', '#000000')).toBe(21);
    expect(getContrastRatio('#ffffff', '#ffffff')).toBe(1);
  });
});
