// QR matrix + tag artwork (SVG and PDF), with the EvlveX monogram in the centre.
//
// Tag: 30 × 40 mm. QR data area 22 mm wide (quiet zone ≥ 4 modules from the tag edge),
// serial underneath, small EVLVEX wordmark at the bottom.
// Error correction "H" recovers ~30% damage; the logo clears < 6% of modules and
// never touches finder or alignment patterns.
import QRCode from 'qrcode';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let alignmentPositions = () => [];
try {
  ({ getPositions: alignmentPositions } = require('qrcode/lib/core/alignment-pattern'));
} catch {
  // Older/newer qrcode layout: fall back to not protecting alignment patterns.
}

export const COLORS = { ink: '#0E0E0E', gold: '#B89B6A', paper: '#FFFFFF', guide: '#BBBBBB' };

export const TAG = {
  width: 30, // mm
  height: 40,
  qrSize: 22,
  qrTop: 4,
  serialBaseline: 30.6,
  serialSize: 2.7,
  wordmarkBaseline: 36.2,
  wordmarkSize: 1.7,
};

const LOGO_RATIO = 0.26; // logo diameter as a fraction of the module count

// Monogram geometry in a 100 × 100 box (same as assets/evlvex-monogram.svg).
export const MONOGRAM = {
  ring: { cx: 50, cy: 50, r: 45.5, stroke: 5 },
  bars: [
    [25, 27, 50, 7],
    [25, 66, 50, 7],
    [40, 27, 7, 46],
    [53, 27, 7, 46],
    [29, 46.5, 18, 7],
    [53, 46.5, 18, 7],
  ],
};

/** Build the QR matrix and remove modules under the centre logo. */
export function qrMatrix(text) {
  const qr = QRCode.create(text, { errorCorrectionLevel: 'H' });
  const n = qr.modules.size;
  const logoD = n * LOGO_RATIO;
  const centre = n / 2;
  const clearR = logoD / 2 + 0.6;

  const protectedCells = new Set();
  for (const [r0, c0] of alignmentPositions(qr.version)) {
    for (let r = r0 - 2; r <= r0 + 2; r++) for (let c = c0 - 2; c <= c0 + 2; c++) protectedCells.add(r * n + c);
  }

  const dark = [];
  let cleared = 0;
  for (let r = 0; r < n; r++) {
    const row = [];
    for (let c = 0; c < n; c++) {
      let on = Boolean(qr.modules.get(r, c));
      const dist = Math.hypot(c + 0.5 - centre, r + 0.5 - centre);
      if (dist <= clearR && !protectedCells.has(r * n + c)) {
        if (on) cleared++;
        on = false;
      }
      row.push(on);
    }
    dark.push(row);
  }
  return { size: n, version: qr.version, dark, logo: { cx: centre, cy: centre, d: logoD }, clearedRatio: cleared / (n * n) };
}

/** Merge dark modules into horizontal runs → fewer shapes. Yields [row, col, length]. */
function* runs(dark) {
  for (let r = 0; r < dark.length; r++) {
    let c = 0;
    while (c < dark.length) {
      if (!dark[r][c]) {
        c++;
        continue;
      }
      const start = c;
      while (c < dark.length && dark[r][c]) c++;
      yield [r, start, c - start];
    }
  }
}

const fmt = (n) => Number(n.toFixed(3));

/** Full tag artwork as an SVG string (units: mm). */
export function tagSvg(serial, url) {
  const m = qrMatrix(url);
  const unit = TAG.qrSize / m.size;
  const ox = (TAG.width - TAG.qrSize) / 2;
  const oy = TAG.qrTop;

  let modules = '';
  for (const [r, c, len] of runs(m.dark)) {
    modules += `M${fmt(ox + c * unit)} ${fmt(oy + r * unit)}h${fmt(len * unit)}v${fmt(unit)}h${fmt(-len * unit)}z`;
  }

  const logoSize = m.logo.d * unit;
  const lx = ox + m.logo.cx * unit - logoSize / 2;
  const ly = oy + m.logo.cy * unit - logoSize / 2;
  const s = logoSize / 100;
  const ring = MONOGRAM.ring;
  const bars = MONOGRAM.bars.map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${TAG.width}mm" height="${TAG.height}mm" viewBox="0 0 ${TAG.width} ${TAG.height}">
  <title>EvlveX certificate tag ${serial}</title>
  <rect width="${TAG.width}" height="${TAG.height}" fill="${COLORS.paper}"/>
  <path d="${modules}" fill="${COLORS.ink}" shape-rendering="crispEdges"/>
  <g transform="translate(${fmt(lx)} ${fmt(ly)}) scale(${fmt(s)})">
    <circle cx="${ring.cx}" cy="${ring.cy}" r="${ring.r}" fill="none" stroke="${COLORS.gold}" stroke-width="${ring.stroke}"/>
    <g fill="${COLORS.gold}">${bars}</g>
  </g>
  <text x="${TAG.width / 2}" y="${TAG.serialBaseline}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${TAG.serialSize}" letter-spacing="0.35" fill="${COLORS.ink}">${serial}</text>
  <text x="${TAG.width / 2}" y="${TAG.wordmarkBaseline}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${TAG.wordmarkSize}" letter-spacing="0.42" fill="${COLORS.gold}">EVLVEX · CERTIFIED</text>
</svg>
`;
}

const MM = 72 / 25.4; // PDF points per mm

/** Draw one tag on a PDFKit document at (x, y) in mm, with a light cut guide. */
export function drawTagPdf(doc, xMm, yMm, serial, url) {
  const m = qrMatrix(url);
  const unit = (TAG.qrSize / m.size) * MM;
  const x = xMm * MM;
  const y = yMm * MM;
  const ox = x + ((TAG.width - TAG.qrSize) / 2) * MM;
  const oy = y + TAG.qrTop * MM;

  // Cut guide
  doc.save().lineWidth(0.25).dash(1.5, { space: 1.5 }).strokeColor(COLORS.guide)
    .rect(x, y, TAG.width * MM, TAG.height * MM).stroke().undash().restore();

  // Modules (tiny overlap avoids hairline gaps in some PDF viewers)
  doc.save().fillColor(COLORS.ink);
  for (const [r, c, len] of runs(m.dark)) {
    doc.rect(ox + c * unit, oy + r * unit, len * unit + 0.02, unit + 0.02);
  }
  doc.fill().restore();

  // Monogram
  const logoSize = m.logo.d * unit;
  const s = logoSize / 100;
  const lx = ox + m.logo.cx * unit - logoSize / 2;
  const ly = oy + m.logo.cy * unit - logoSize / 2;
  const ring = MONOGRAM.ring;
  doc.save().lineWidth(ring.stroke * s).strokeColor(COLORS.gold)
    .circle(lx + ring.cx * s, ly + ring.cy * s, ring.r * s).stroke().restore();
  doc.save().fillColor(COLORS.gold);
  for (const [bx, by, bw, bh] of MONOGRAM.bars) doc.rect(lx + bx * s, ly + by * s, bw * s, bh * s);
  doc.fill().restore();

  // Serial + wordmark (PDFKit positions text by its top, so offset from the baseline)
  const serialPt = TAG.serialSize * MM;
  doc.font('Helvetica').fontSize(serialPt).fillColor(COLORS.ink)
    .text(serial, x, y + TAG.serialBaseline * MM - serialPt * 0.8, {
      width: TAG.width * MM, align: 'center', characterSpacing: 0.35 * MM, lineBreak: false,
    });
  const wordPt = TAG.wordmarkSize * MM;
  doc.font('Helvetica').fontSize(wordPt).fillColor(COLORS.gold)
    .text('EVLVEX · CERTIFIED', x, y + TAG.wordmarkBaseline * MM - wordPt * 0.8, {
      width: TAG.width * MM, align: 'center', characterSpacing: 0.42 * MM, lineBreak: false,
    });
}

export const A4 = { width: 210, height: 297, margin: 12, gap: 5 };

/** Grid positions (mm) for tags on an A4 sheet. */
export function sheetSlots() {
  const cols = Math.floor((A4.width - 2 * A4.margin + A4.gap) / (TAG.width + A4.gap));
  const rows = Math.floor((A4.height - 2 * A4.margin + A4.gap) / (TAG.height + A4.gap));
  const usedW = cols * TAG.width + (cols - 1) * A4.gap;
  const usedH = rows * TAG.height + (rows - 1) * A4.gap;
  const x0 = (A4.width - usedW) / 2;
  const y0 = (A4.height - usedH) / 2;
  const slots = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    slots.push([x0 + c * (TAG.width + A4.gap), y0 + r * (TAG.height + A4.gap)]);
  }
  return slots;
}
