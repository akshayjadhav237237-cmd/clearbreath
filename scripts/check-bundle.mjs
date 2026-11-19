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

let totalJsGzip = 0;
let totalInitialGzip = 0;

const htmlPath = path.join(distDir, 'index.html');
if (fs.existsSync(htmlPath)) {
  totalInitialGzip += getGzipSize(htmlPath);
}

for (const file of assetFiles) {
  const fullPath = path.join(assetsDir, file);
  const gzSize = getGzipSize(fullPath);
  totalInitialGzip += gzSize;

  if (file.endsWith('.js')) {
    totalJsGzip += gzSize;
  }
}

const MAX_JS_GZIP = 200 * 1024;
const MAX_TOTAL_GZIP = 400 * 1024;

process.stdout.write(`Bundle Budget Analysis:\n`);
process.stdout.write(
  `- Total JS Gzip: ${(totalJsGzip / 1024).toFixed(2)} KB (Limit: 200 KB)\n`
);
process.stdout.write(
  `- Total Initial Gzip: ${(totalInitialGzip / 1024).toFixed(2)} KB (Limit: 400 KB)\n`
);

if (totalJsGzip > MAX_JS_GZIP) {
  process.stderr.write(
    `JS gzip size ${(totalJsGzip / 1024).toFixed(2)} KB exceeds 200 KB limit!\n`
  );
  process.exit(1);
}

if (totalInitialGzip > MAX_TOTAL_GZIP) {
  process.stderr.write(
    `Total initial gzip size ${(totalInitialGzip / 1024).toFixed(2)} KB exceeds 400 KB limit!\n`
  );
  process.exit(1);
}

process.stdout.write('Bundle budget check PASSED cleanly!\n');
