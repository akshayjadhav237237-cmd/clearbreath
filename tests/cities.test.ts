import { describe, expect, it } from 'vitest';
import { CITIES, CITIES_BY_ID, getCityById } from '../src/config/cities';

describe('Cities configuration and coordinate registry', () => {
  it('contains exactly 12 verified Indian cities', () => {
    expect(CITIES).toHaveLength(12);
    expect(CITIES_BY_ID.size).toBe(12);
  });

  it('verifies Delhi-NCR coordinates to 2 decimal places', () => {
    const delhi = getCityById('delhi');
    expect(delhi).toBeDefined();
    if (delhi) {
      expect(delhi.latitude).toBeCloseTo(28.61, 2);
      expect(delhi.longitude).toBeCloseTo(77.21, 2);
      expect(delhi.state).toBe('Delhi-NCR');
    }
  });

  it('retrieves cities case-insensitively', () => {
    expect(getCityById('MUMBAI')?.name).toBe('Mumbai');
    expect(getCityById('bengaluru')?.name).toBe('Bengaluru');
    expect(getCityById('unknown-city')).toBeUndefined();
  });
});
