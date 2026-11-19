import { describe, it, expect, vi } from 'vitest';
import { DEFAULT_HOUSEHOLD_PERSONA } from '../../src/config/persona';
import {
  exportProfileJson,
  importProfileJson,
  MAX_IMPORT_SIZE_BYTES,
  triggerBlobDownload,
} from '../../src/exports';

describe('JSON profile export and round-trip parsing', () => {
  it('exports household profile to formatted JSON', () => {
    const jsonStr = exportProfileJson(DEFAULT_HOUSEHOLD_PERSONA);
    expect(jsonStr).toContain('"members"');
    expect(jsonStr).toContain('"floorAreaM2"');
  });

  it('imports valid JSON and reconstructs household profile', () => {
    const jsonStr = exportProfileJson(DEFAULT_HOUSEHOLD_PERSONA);
    const importRes = importProfileJson(jsonStr);
    expect(importRes.ok).toBe(true);
    if (importRes.ok) {
      expect(importRes.value.members).toHaveLength(
        DEFAULT_HOUSEHOLD_PERSONA.members.length
      );
      expect(importRes.value.home.floorAreaM2).toBe(
        DEFAULT_HOUSEHOLD_PERSONA.home.floorAreaM2
      );
    }
  });
});

describe('JSON import validation and browser download', () => {
  it('rejects files exceeding size limit or with malformed syntax', () => {
    const oversized = ' '.repeat(MAX_IMPORT_SIZE_BYTES + 10);
    const importRes = importProfileJson(oversized);
    expect(importRes.ok).toBe(false);

    const badJson = importProfileJson('{ invalid');
    expect(badJson.ok).toBe(false);
  });

  it('rejects JSON failing domain schema validation', () => {
    const invalidProfile = JSON.stringify({
      members: [],
      home: { type: 'invalid-type' },
    });
    const importRes = importProfileJson(invalidProfile);
    expect(importRes.ok).toBe(false);
  });

  it('triggers browser blob download safely', () => {
    const clickSpy = vi.fn();
    const createObjectUrlSpy = vi.fn(() => 'blob:mock-url');
    const revokeSpy = vi.fn();

    vi.stubGlobal('URL', {
      createObjectURL: createObjectUrlSpy,
      revokeObjectURL: revokeSpy,
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(clickSpy);

    triggerBlobDownload('test.csv', 'col1,col2\n1,2', 'text/csv');
    expect(createObjectUrlSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
