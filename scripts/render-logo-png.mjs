import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const logoDir = path.join(root, 'assets', 'logo');
const SIZE = 1024;
const DENSITY = 144;

async function embedFont(svg) {
  const fontMatch = svg.match(/url\(['"]?\.\.\/fonts\/([^'"]+)['"]?\)/);
  if (!fontMatch) return svg;
  const fontBase64 = (await readFile(path.join(root, 'assets', 'fonts', fontMatch[1]))).toString('base64');
  return svg.replace(
    /url\(['"]?\.\.\/fonts\/[^'"]+['"]?\)/,
    `url('data:font/truetype;base64,${fontBase64}')`,
  );
}

async function renderSvgToPng(svgPath, pngPath, { size, trim } = {}) {
  const svg = await embedFont(await readFile(svgPath, 'utf8'));
  let pipeline = sharp(Buffer.from(svg), { density: DENSITY });

  if (trim) {
    await pipeline.trim().png().toFile(pngPath);
  } else {
    await pipeline.resize(size, size).png().toFile(pngPath);
  }
}

const jobs = [
  ['feel-text-mixed.svg', 'feel-text-mixed-1024.png', { size: SIZE }],
  ['feel-text-mixed.svg', 'feel-wordmark.png', { trim: true }],
];

for (const [svgName, pngName, options] of jobs) {
  const svgPath = path.join(logoDir, svgName);
  const pngPath = path.join(logoDir, pngName);
  await renderSvgToPng(svgPath, pngPath, options);
  const meta = await sharp(pngPath).metadata();
  console.log(`${pngName}: ${meta.width}x${meta.height}, alpha=${meta.hasAlpha}`);
}

console.log('Done.');
