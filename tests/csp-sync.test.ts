import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  CSP_POLICY,
  APP_NAME,
  GEMINI_MODEL_ID,
  STORAGE_KEYS,
  DEFAULT_HOUSEHOLD_PERSONA,
} from '../src/config';

describe('Configuration values', () => {
  it('exposes defined app constants', () => {
    expect(APP_NAME).toBe('Clearbreath');
    expect(GEMINI_MODEL_ID).toBe('gemini-3.8-flash');
    expect(STORAGE_KEYS.SETTINGS).toBe('clearbreath_settings_v1');
    expect(DEFAULT_HOUSEHOLD_PERSONA.members).toHaveLength(3);
  });
});

describe('Content Security Policy synchronization', () => {
  it('matches the exact policy defined in index.html', () => {
    const indexPath = path.resolve(process.cwd(), 'index.html');
    const htmlContent = fs.readFileSync(indexPath, 'utf-8');
    const match =
      /<meta[\s\S]*?http-equiv="Content-Security-Policy"[\s\S]*?content="([^"]+)"/i.exec(
        htmlContent
      );
    expect(match).not.toBeNull();
    const policyInHtml = match ? match[1] : '';
    expect(policyInHtml).toBe(CSP_POLICY);
  });

  it('keeps vercel.json HTTP CSP header aligned with CSP_POLICY plus frame-ancestors', () => {
    const vercelPath = path.resolve(process.cwd(), 'vercel.json');
    const raw = fs.readFileSync(vercelPath, 'utf-8');
    const parsed = JSON.parse(raw) as {
      headers?: Array<{
        headers?: Array<{ key: string; value: string }>;
      }>;
    };
    const cspHeader = parsed.headers?.[0]?.headers?.find(
      (h) => h.key === 'Content-Security-Policy'
    );
    expect(cspHeader?.value).toBe(`${CSP_POLICY}; frame-ancestors 'none'`);
  });
});
