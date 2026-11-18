import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { DOMAIN_LAYER } from '../src/domain';
import { AI_LAYER } from '../src/ai';
import { FEATURES_LAYER } from '../src/features';

/** Recursively gathers all domain file paths under a directory. */
function getDomainFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getDomainFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('Architectural layer boundaries', () => {
  it('exports layer marker tokens', () => {
    expect(DOMAIN_LAYER).toBe('domain');
    expect(AI_LAYER).toBe('ai');
    expect(FEATURES_LAYER).toBe('features');
  });

  it('ensures domain layer does not import react, zustand, or features', () => {
    const domainDir = path.resolve(process.cwd(), 'src/domain');
    const domainFiles = getDomainFiles(domainDir);
    const forbiddenImports = [
      'react',
      'zustand',
      'features',
      '../features',
      './features',
    ];

    for (const file of domainFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      for (const forbidden of forbiddenImports) {
        const importRegex = new RegExp(`from\\s+['"]${forbidden}['"]`);
        expect(
          importRegex.test(content),
          `Domain file ${path.basename(file)} illegally imports "${forbidden}"`
        ).toBe(false);
      }
    }
  });
});
