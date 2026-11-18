import { describe, expect, it } from 'vitest';
import { ApiKeyHolder } from '../../../src/ai/key-holder';

describe('ApiKeyHolder', () => {
  it('stores and clears API keys in memory only without token leakage', () => {
    const holder = new ApiKeyHolder();
    expect(holder.hasKey()).toBe(false);
    expect(holder.getKey()).toBeNull();
    expect(holder.toString()).toBe('ApiKeyHolder[EMPTY]');

    holder.setKey('ai-test-key-12345');
    expect(holder.hasKey()).toBe(true);
    expect(holder.getKey()).toBe('ai-test-key-12345');
    expect(holder.toString()).toBe('ApiKeyHolder[CONFIGURED]');
    expect(holder.toString()).not.toContain('12345');

    holder.setKey('   ');
    expect(holder.hasKey()).toBe(false);
    expect(holder.getKey()).toBeNull();

    holder.setKey('ai-test-key-67890');
    holder.clear();
    expect(holder.hasKey()).toBe(false);
  });
});
