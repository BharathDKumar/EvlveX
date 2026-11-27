import test from 'node:test';
import assert from 'node:assert/strict';
import jsQR from 'jsqr';
import { fitSize, MONOGRAM, qrMatrix, sheetSlots, TAG, tagSvg, tagText, textWidth, wrapWords } from '../src/qr.js';
import { parseManifest } from '../src/output.js';

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

test('tag SVG is landscape 2.5 in wide × 2 in tall and uses the brand monogram', () => {
  const svg = tagSvg('EVX-7F3K9QMD', urls[0]);
  assert.match(svg, /^<\?xml/);
  assert.match(svg, />EVX-7F3K9QMD</);
  assert.match(svg, /width="63.5mm" height="50.8mm"/);
  assert.ok(svg.includes(MONOGRAM.d), 'monogram path from assets/evlvex-monogram.svg');
});

test('tag SVG shows model, colour and size', () => {
  const svg = tagSvg('EVX-7F3K9QMD', urls[0], { product: 'The Silent Grind', color: 'Black', size: 'UK 10' });
  assert.match(svg, />The Silent</);
  assert.match(svg, />Grind</);
  assert.match(svg, />Black</);
  assert.match(svg, />UK 10</);
  assert.match(tagSvg('EVX-7F3K9QMD', urls[0], { product: 'A & B' }), />A &amp; B</);
});

test('every text line fits the column, and long names wrap to two lines', () => {
  for (const details of [
    { product: 'The Silent Grind', color: 'Black', size: 'UK 10' },
    { product: 'A Fresh Start', color: 'Off-White', size: 'UK 6' },
    { product: 'An Exceptionally Long Model Name Indeed', color: 'Burnished Oxblood Brown', size: 'UK 10.5' },
  ]) {
    const lines = tagText('EVX-MD6XC8DZ', details);
    for (const t of lines) {
      assert.ok(t.x + textWidth(t.text, t.font, t.size, t.spacing) <= TAG.textRight + 1e-6, `"${t.text}" overflows`);
    }
    assert.ok(lines.filter((t) => t.font === TAG.model.font && t.y < TAG.color.baseline).length <= 2);
  }
  assert.deepEqual(wrapWords('The Silent Grind', TAG.model.font, TAG.model.size), ['The Silent', 'Grind']);
  assert.ok(fitSize('W'.repeat(40), 'Helvetica', 3) < 3);
});

test('text column keeps a 4-module quiet zone right of the QR', () => {
  for (const url of urls) {
    const moduleMm = TAG.qrSize / qrMatrix(url).size;
    assert.ok(TAG.textLeft - (TAG.qrLeft + TAG.qrSize) >= 4 * moduleMm - 1e-6, url);
  }
});

test('A4 sheet fits 15 tags of 2.5 × 2 in', () => {
  const slots = sheetSlots();
  assert.equal(slots.length, 15);
  for (const [x, y] of slots) {
    assert.ok(x >= 5 && x + TAG.width <= 205 && y >= 5 && y + TAG.height <= 292);
  }
});

test('parseManifest reads a stock-list manifest back', () => {
  const csv = 'serial,handle,url,batch,created_at,product,color,size,pair_number\n'
    + 'EVX-VCQ8ZQP0,evx-vcq8zqp0,https://evlvex.in/pages/authentic/evx-vcq8zqp0,NOV26,2026-11-17T07:44:41.841Z,"Grind, The",Black,UK 10,1\n';
  const [item] = parseManifest(csv);
  assert.equal(item.serial, 'EVX-VCQ8ZQP0');
  assert.equal(item.product, 'Grind, The');
  assert.equal(item.size, 'UK 10');
  assert.equal(item.pairNumber, 1);
  assert.equal(item.group, 'Grind, The · Black · UK 10');
  const [plain] = parseManifest('serial,handle,url,batch,created_at\nEVX-A,evx-a,https://x/y,B,2026\n');
  assert.equal(plain.group, undefined);
});
