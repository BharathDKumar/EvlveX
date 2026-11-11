import test from 'node:test';
import assert from 'node:assert/strict';
import jsQR from 'jsqr';
import { qrMatrix, sheetSlots, tagSvg } from '../src/qr.js';

// Rasterise the matrix (with quiet zone) and paint the logo area mid-tone, like the printed gold monogram.
function rasterise(m, scale = 6, quiet = 4) {
  const n = m.size + quiet * 2;
  const px = n * scale;
  const data = new Uint8ClampedArray(px * px * 4).fill(255);
  for (let y = 0; y < px; y++) {
    for (let x = 0; x < px; x++) {
      const r = Math.floor(y / scale) - quiet;
      const c = Math.floor(x / scale) - quiet;
      let v = 255;
      if (r >= 0 && c >= 0 && r < m.size && c < m.size && m.dark[r][c]) v = 14;
      const mx = x / scale - quiet - m.logo.cx;
      const my = y / scale - quiet - m.logo.cy;
      if (Math.hypot(mx, my) <= m.logo.d / 2 && (y + x) % 3 === 0) v = 150; // gold strokes ≈ mid-grey
      const i = (y * px + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = v;
    }
  }
  return { data, width: px, height: px };
}

const urls = [
  'https://evlvex.com/pages/authentic/evx-7f3k9qmd',
  'https://www.evlvex.com/pages/authentic/evx-zzzzzzzz',
  'https://evlvex-luxury-footwear.com/pages/authentic/evx-00000000', // longer domain → larger version
  'https://evlvex.myshopify.com/pages/authentic/evx-abcdefgh',
];

for (const url of urls) {
  test(`QR with centre logo decodes: ${url}`, () => {
    const m = qrMatrix(url);
    assert.ok(m.clearedRatio < 0.08, `logo clears ${(m.clearedRatio * 100).toFixed(1)}% of modules`);
    const img = rasterise(m);
    const result = jsQR(img.data, img.width, img.height);
    assert.ok(result, `failed to decode (version ${m.version})`);
    assert.equal(result.data, url);
  });
}

test('tag SVG contains the serial and is well-formed', () => {
  const svg = tagSvg('EVX-7F3K9QMD', urls[0]);
  assert.match(svg, /^<\?xml/);
  assert.match(svg, />EVX-7F3K9QMD</);
  assert.match(svg, /width="30mm" height="40mm"/);
});

test('A4 sheet fits 30 tags of 30×40 mm', () => {
  assert.equal(sheetSlots().length, 30);
});
