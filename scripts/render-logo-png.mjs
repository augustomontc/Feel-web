import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const logoDir = path.join(root, 'assets', 'logo');
const SIZE = 1024;

async function embedFont(svg) {
  const fontMatch = svg.match(/url\(['"]?\.\.\/fonts\/([^'"]+)['"]?\)/);
  if (!fontMatch) return svg;
  const fontBase64 = (await readFile(path.join(root, 'assets', 'fonts', fontMatch[1]))).toString('base64');
  return svg.replace(
    /url\(['"]?\.\.\/fonts\/[^'"]+['"]?\)/,
    `url('data:font/truetype;base64,${fontBase64}')`,
  );
}

async function renderSvgToPng(svgPath, pngPath) {
  const svg = await embedFont(await readFile(svgPath, 'utf8'));
  await sharp(Buffer.from(svg), { density: 144 }).resize(SIZE, SIZE).png().toFile(pngPath);
}

const jobs = [['feel-text-mixed.svg', 'feel-text-mixed-1024.png']];

for (const [svgName, pngName] of jobs) {
  const svgPath = path.join(logoDir, svgName);
  const pngPath = path.join(logoDir, pngName);
  await renderSvgToPng(svgPath, pngPath);
  const meta = await sharp(pngPath).metadata();
  console.log(`${pngName}: ${meta.width}x${meta.height}, alpha=${meta.hasAlpha}`);
}

console.log('Done.');
