import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const distDir = path.resolve('dist');

if (!fs.existsSync(distDir)) {
  process.stderr.write('Dist directory does not exist. Run build first.\n');
  process.exit(1);
}

function getGzipSize(filePath) {
  const content = fs.readFileSync(filePath);
  return zlib.gzipSync(content).length;
}

const assetsDir = path.join(distDir, 'assets');
const assetFiles = fs.readdirSync(assetsDir);

const MAX_INITIAL_JS_GZIP = 100 * 1024;
const MAX_LAZY_CHUNK_GZIP = 40 * 1024;
const MAX_CSS_GZIP = 20 * 1024;

let hasError = false;

process.stdout.write('Bundle Budget Analysis:\n');

for (const file of assetFiles) {
  const fullPath = path.join(assetsDir, file);
  const gzSize = getGzipSize(fullPath);
  const gzKb = (gzSize / 1024).toFixed(2);

  if (file.endsWith('.css')) {
    process.stdout.write(`- CSS (${file}): ${gzKb} kB (Budget: 20 kB)\n`);
    if (gzSize > MAX_CSS_GZIP) {
      process.stderr.write(`CSS ${file} exceeds 20 kB budget!\n`);
      hasError = true;
    }
  } else if (file.endsWith('.js')) {
    const isInitial = file.startsWith('index-');
    const budget = isInitial ? MAX_INITIAL_JS_GZIP : MAX_LAZY_CHUNK_GZIP;
    const budgetLabel = isInitial
      ? '100 kB (Initial JS)'
      : '40 kB (Lazy Chunk)';
    process.stdout.write(
      `- JS (${file}): ${gzKb} kB (Budget: ${budgetLabel})\n`
    );
    if (gzSize > budget) {
      process.stderr.write(`JS ${file} exceeds ${budgetLabel} budget!\n`);
      hasError = true;
    }
  }
}

if (hasError) {
  process.exit(1);
}

process.stdout.write('Bundle budget check PASSED cleanly!\n');
