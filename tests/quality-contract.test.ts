import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import ts from 'typescript';
import { calculateAqi } from '../src/domain/aqi';
import {
  calculateInhaledDose,
  calculateIndoorPm25,
} from '../src/domain/exposure';
import { ACTION_CATALOG } from '../src/domain/actions';
import type { HomeProfile } from '../src/domain/contracts';

/** Gathers file paths recursively from directory matching extension filter. */
function collectFiles(dir: string, extFilter: RegExp): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(full, extFilter));
    } else if (extFilter.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

/** Checks whether a node is a non-default named export. */
function isExportedNamed(node: ts.Node): boolean {
  const mods = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
  const isExp = mods?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
  const isDef = mods?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
  return Boolean(isExp && !isDef);
}

/** Resolves function declaration or arrow constant name. */
function getFunctionExportName(
  sf: ts.SourceFile,
  node: ts.Node
): string | null {
  if (ts.isFunctionDeclaration(node)) {
    return node.name?.getText(sf) ?? 'anonymous';
  }
  if (ts.isVariableStatement(node)) {
    const fnDecl = node.declarationList.declarations.find(
      (d) =>
        d.initializer &&
        (ts.isArrowFunction(d.initializer) ||
          ts.isFunctionExpression(d.initializer))
    );
    return fnDecl ? fnDecl.name.getText(sf) : null;
  }
  return null;
}

/** Determines if a top-level node is an exported function lacking JSDoc. */
function findUndocumentedExport(
  sf: ts.SourceFile,
  content: string,
  node: ts.Node
): string | null {
  if (!isExportedNamed(node)) return null;
  const name = getFunctionExportName(sf, node);
  if (!name) return null;
  const ranges = ts.getLeadingCommentRanges(content, node.getFullStart());
  const hasDoc =
    ranges?.some((r) => content.substring(r.pos, r.end).startsWith('/**')) ??
    false;
  return hasDoc ? null : name;
}

describe('Quality Contract: Codebase Structure & Hygiene', () => {
  const root = process.cwd();
  const srcFiles = collectFiles(path.join(root, 'src'), /\.(ts|tsx)$/);

  it('ensures every exported function in src has a JSDoc comment', () => {
    const missing: string[] = [];
    for (const file of srcFiles) {
      const rel = path.relative(root, file).replace(/\\/g, '/');
      if (rel.endsWith('/index.ts') || rel === 'src/index.ts') continue;
      const content = fs.readFileSync(file, 'utf-8');
      const sf = ts.createSourceFile(
        file,
        content,
        ts.ScriptTarget.Latest,
        true
      );

      ts.forEachChild(sf, (node) => {
        const unDocName = findUndocumentedExport(sf, content, node);
        if (unDocName) missing.push(`${rel}:${unDocName}`);
      });
    }
    expect(missing).toEqual([]);
  });

  it('detects no commented-out code lines in src', () => {
    const codePatterns = [
      /^\s*\/\/\s*(const|let|var|function|return|import|export|if|for|while|switch|class|interface|type)\s+/,
      /^\s*\/\/\s*<[A-Z]\w*\b/,
      /^\s*\/\/\s*\w+\s*=\s*/,
      /^\s*\/\/\s*\w+\([^)]*\);/,
    ];

    const violations: string[] = [];
    for (const file of srcFiles) {
      const rel = path.relative(root, file).replace(/\\/g, '/');
      const lines = fs.readFileSync(file, 'utf-8').split('\n');
      lines.forEach((line, idx) => {
        if (codePatterns.some((pat) => pat.test(line))) {
          violations.push(`${rel}:${idx + 1}: ${line.trim()}`);
        }
      });
    }
    expect(violations).toEqual([]);
  });

  it('prohibits default exports across all source files', () => {
    const defaultExportFiles = srcFiles
      .filter((file) =>
        /export\s+default\b/.test(fs.readFileSync(file, 'utf-8'))
      )
      .map((file) => path.relative(root, file).replace(/\\/g, '/'));
    expect(defaultExportFiles).toEqual([]);
  });
});

describe('Quality Contract: Integer Domain Outputs (AQI & Dose)', () => {
  it('guarantees integer AQI values across all concentration ranges', () => {
    const testCases = [
      { pm25: 15.4, pm10: 25.7 },
      { pm25: 45.2, pm10: 85.9 },
      { pm25: 110.8, pm10: 230.1 },
      { pm25: 380.5, pm10: 520.6 },
    ];
    for (const tc of testCases) {
      const res = calculateAqi(tc);
      expect(res.ok).toBe(true);
      if (res.ok) expect(Number.isInteger(res.value.value)).toBe(true);
    }
  });

  it('guarantees integer micrograms in inhaled dose outputs', () => {
    const testCases = [
      { pm25: 100, min: 60, age: 'adult' as const },
      { pm25: 250, min: 120, age: 'child' as const, maskBps: 9500 },
      { pm25: 380, min: 30, age: 'older' as const, maskBps: 5000 },
    ];
    for (const tc of testCases) {
      const res = calculateInhaledDose(tc.pm25, tc.min, tc.age, tc.maskBps);
      expect(res.ok).toBe(true);
      if (res.ok) expect(Number.isInteger(res.value)).toBe(true);
    }
  });
});

describe('Quality Contract: Integer Domain Outputs (Indoor & Actions)', () => {
  const dummyHome: HomeProfile = {
    type: 'apartment',
    floorAreaM2: 90,
    ceilingHeightCm: 300,
    sealing: 'average',
    purifierCadrM3h: 250,
    hasKitchenExhaust: true,
    cookingFuel: 'png',
  };

  it('guarantees integer micrograms in indoor mass-balance concentration', () => {
    for (const pm25 of [150, 280, 420]) {
      const res = calculateIndoorPm25(pm25, dummyHome, true);
      expect(res.ok).toBe(true);
      if (res.ok) expect(Number.isInteger(res.value)).toBe(true);
    }
  });

  it('guarantees integer-only financial metrics in action catalog', () => {
    for (const action of ACTION_CATALOG) {
      expect(Number.isInteger(action.costRupees)).toBe(true);
      expect([1, 2, 3].includes(action.effort)).toBe(true);
    }
  });
});
