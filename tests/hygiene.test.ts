import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { EN_TRANSLATIONS } from '../src/shared/i18n/en';

function collectLeafPaths(obj: Record<string, unknown>, prefix = ''): string[] {
  const paths: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') {
      paths.push(...collectLeafPaths(v as Record<string, unknown>, next));
    } else {
      paths.push(next);
    }
  }
  return paths;
}

/** Recursively gathers all file paths under a directory. */
function getFilesRecursively(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getFilesRecursively(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('Codebase hygiene', () => {
  const root = process.cwd();
  const srcFiles = getFilesRecursively(path.join(root, 'src'));
  const testFiles = getFilesRecursively(path.join(root, 'tests'));
  const candidateDirs = ['src', 'tests', 'docs', '.github'];
  const textFilesForCrlf = candidateDirs.flatMap((dir) =>
    getFilesRecursively(path.join(root, dir))
  );

  it('contains no forbidden tokens in src and tests', () => {
    const forbiddenTokens = [
      ['eslint', 'disable'].join('-'),
      ['ts', 'ignore'].join('-'),
      ['TO', 'DO'].join(''),
      ['console', '.'].join(''),
    ];

    const targetFiles = [...srcFiles, ...testFiles].filter(
      (file) => !file.endsWith('hygiene.test.ts')
    );

    for (const file of targetFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      for (const token of forbiddenTokens) {
        expect(
          content.includes(token),
          `Forbidden token "${token}" found in ${path.relative(root, file)}`
        ).toBe(false);
      }
    }
  });

  it('contains no CRLF line endings in text files', () => {
    for (const file of textFilesForCrlf) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(
        content.includes('\r\n'),
        `CRLF line endings found in ${path.relative(root, file)}`
      ).toBe(false);
    }
  });

  it('ensures all src files do not exceed 200 lines', () => {
    for (const file of srcFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      expect(
        lines.length,
        `File ${path.relative(root, file)} exceeds 200 lines (${lines.length})`
      ).toBeLessThanOrEqual(200);
    }
  });
});

describe('Translation dictionary usage', () => {
  it('references every leaf dictionary key in src', () => {
    const root = process.cwd();
    const srcFiles = getFilesRecursively(path.join(root, 'src'));
    const dictSkip = new Set([
      'src/shared/i18n/en.ts',
      'src/shared/i18n/hi.ts',
      'src/shared/i18n/types.ts',
    ]);
    const codeBlob = srcFiles
      .filter((f) => !dictSkip.has(path.relative(root, f).replace(/\\/g, '/')))
      .map((f) => fs.readFileSync(f, 'utf-8'))
      .join('\n');
    const leaves = collectLeafPaths(
      EN_TRANSLATIONS as unknown as Record<string, unknown>
    );
    const dynamicGroups = ['nav.', 'severity.', 'confidenceTiers.'];
    const unused = leaves.filter((leaf) => {
      if (dynamicGroups.some((g) => leaf.includes(g))) return false;
      const parts = leaf.split('.');
      const short =
        parts.length >= 2
          ? `${parts[parts.length - 2]}.${parts[parts.length - 1]}`
          : leaf;
      if (
        leaf === 'common.low' ||
        leaf === 'common.medium' ||
        leaf === 'common.high'
      ) {
        return !codeBlob.includes('common[level]');
      }
      return !codeBlob.includes(short) && !codeBlob.includes(`t.${leaf}`);
    });
    expect(unused).toEqual([]);
  });
});
