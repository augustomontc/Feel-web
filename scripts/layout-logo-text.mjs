import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logoDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'logo');

const FONT_SIZE = 280;

const VARIANTS = [
  {
    file: 'feel-text-mixed.svg',
    word: 'Feel.',
    /** Distributes spacing evenly between all glyphs including the dot */
    attrs: 'textLength="660" lengthAdjust="spacing"',
  },
];

function buildSvg({ word, attrs }) {
  const letters = word.slice(0, -1);
  const dot = word.slice(-1);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <style>
      @font-face {
        font-family: 'Lora';
        src: url('../fonts/Lora-Regular.ttf') format('truetype');
        font-weight: 400;
        font-style: normal;
      }
    </style>
  </defs>
  <text
    x="512"
    y="512"
    text-anchor="middle"
    dominant-baseline="central"
    font-family="Lora, Georgia, serif"
    font-size="${FONT_SIZE}"
    font-weight="400"
    ${attrs}
  ><tspan fill="#f0f4f8">${letters}</tspan><tspan fill="#4da8da">${dot}</tspan></text>
</svg>
`;
}

for (const variant of VARIANTS) {
  await writeFile(path.join(logoDir, variant.file), `${buildSvg(variant)}\n`);
  console.log(`${variant.file}: ${variant.attrs}`);
}
