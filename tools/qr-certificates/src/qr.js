// QR matrix + tag artwork (SVG and PDF), with the EvlveX monogram in the centre.
//
// Tag: landscape, 2.5 in wide × 2 in tall (63.5 × 50.8 mm).
//   Left:  34 mm QR with the EvlveX monogram (assets/evlvex-monogram.svg, the brand file) in the centre.
//   Right: model name (bold, up to two lines), colour, size (large), the serial and the EVLVEX · CERTIFIED wordmark.
// Error correction "H" recovers ~30% damage; the logo clears < 6% of modules and
// never touches finder or alignment patterns. The text column starts ≥ 4 modules right of the QR (quiet zone).
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let alignmentPositions = () => [];
try {
  ({ getPositions: alignmentPositions } = require('qrcode/lib/core/alignment-pattern'));
} catch {
  // Older/newer qrcode layout: fall back to not protecting alignment patterns.
}

export const COLORS = { ink: '#111111', accent: '#111111', paper: '#FFFFFF', guide: '#BBBBBB' };

export const TAG = {
  width: 63.5, // mm (2.5 in)
  height: 50.8, // mm (2 in)
  inches: '2.5 in wide × 2 in tall',
  qrSize: 34,
  qrLeft: 4.2,
  qrTop: 8.4, // (height − qrSize) / 2
  textLeft: 42.6, // QR right edge + 4.4 mm quiet zone
  textRight: 60.8,
  model: { size: 3.6, baselines: [11.9, 16.3], single: 14.1, font: 'Helvetica-Bold' },
  color: { size: 3.0, baseline: 22.6, font: 'Helvetica' },
  size: { size: 5.2, baseline: 29.4, font: 'Helvetica-Bold' },
  ruleY: 32.8,
  serial: { size: 2.5, baseline: 37.4, spacing: 0.1, font: 'Helvetica' },
  wordmark: { size: 1.6, baseline: 42.2, spacing: 0.15, font: 'Helvetica' },
};
const TEXT_WIDTH = TAG.textRight - TAG.textLeft;

const LOGO_RATIO = 0.26; // logo diameter as a fraction of the module count

/** The brand monogram (one filled even-odd path), read from the theme's asset so tags always match the store. */
export const MONOGRAM = (() => {
  const svg = readFileSync(new URL('../../../assets/evlvex-monogram.svg', import.meta.url), 'utf8');
  const [, , w, h] = svg.match(/viewBox="([\d.\s-]+)"/)[1].trim().split(/\s+/).map(Number);
  const d = svg.match(/\sd="([^"]+)"/)[1].replace(/\s+/g, ' ').trim();
  return { width: w, height: h, d };
})();

// --- Text measuring (real Helvetica metrics from PDFKit, shared by the SVG and PDF output) ---------------------
let measurer;
/** Width in mm of `text` set in `font` at `sizeMm`, with `spacingMm` between letters. */
export function textWidth(text, font, sizeMm, spacingMm = 0) {
  measurer ||= new PDFDocument({ autoFirstPage: false });
  return measurer.font(font).fontSize(sizeMm).widthOfString(String(text), { characterSpacing: spacingMm });
}

/** Largest size ≤ `size` at which `text` fits `maxWidth`. */
export function fitSize(text, font, size, maxWidth = TEXT_WIDTH, spacing = 0) {
  if (!text) return size;
  for (let s = size; s > 0.5; s = Math.round((s - 0.05) * 100) / 100) {
    if (textWidth(text, font, s, spacing) <= maxWidth) return s;
  }
  return 0.5;
}

/** Break `text` into at most `maxLines` lines that fit `maxWidth` (words that don't fit go on the last line). */
export function wrapWords(text, font, size, maxWidth = TEXT_WIDTH, maxLines = 2) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  const lines = [];
  for (const word of words) {
    const last = lines[lines.length - 1];
    if (last !== undefined && (textWidth(`${last} ${word}`, font, size) <= maxWidth || lines.length === maxLines)) {
      lines[lines.length - 1] = `${last} ${word}`;
    } else {
      lines.push(word);
    }
  }
  return lines;
}

/**
 * The text lines of a tag, positioned (mm, relative to the tag) and sized to fit the text column.
 * @param {string} serial
 * @param {{product?:string, color?:string, size?:string}} [details]
 * @returns {{text:string, x:number, y:number, size:number, font:string, spacing:number}[]}
 */
export function tagText(serial, details = {}) {
  const out = [];
  const add = (text, spec, y = spec.baseline) => {
    if (!text) return;
    const spacing = spec.spacing || 0;
    out.push({ text, x: TAG.textLeft, y, size: fitSize(text, spec.font, spec.size, TEXT_WIDTH, spacing), font: spec.font, spacing });
  };
  const model = String(details.product || '').trim();
  if (model) {
    const lines = wrapWords(model, TAG.model.font, TAG.model.size);
    const size = Math.min(...lines.map((l) => fitSize(l, TAG.model.font, TAG.model.size)));
    const ys = lines.length === 1 ? [TAG.model.single] : TAG.model.baselines;
    lines.forEach((line, i) => out.push({ text: line, x: TAG.textLeft, y: ys[i], size, font: TAG.model.font, spacing: 0 }));
  }
  add(String(details.color || '').trim(), TAG.color);
  add(String(details.size || '').trim(), TAG.size);
  add(serial, TAG.serial);
  add('EVLVEX · CERTIFIED', TAG.wordmark);
  return out;
}

/** True when a tag has product details (and so gets the thin rule above the serial). */
const hasDetails = (d = {}) => Boolean(d.product || d.color || d.size);

const escapeXml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);

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

/** Where the monogram goes (mm, relative to the QR origin): scale and top-left so it is centred in the cleared circle. */
function logoBox(m, unit) {
  const d = m.logo.d * unit;
  const s = d / Math.max(MONOGRAM.width, MONOGRAM.height);
  return {
    s,
    x: m.logo.cx * unit - (MONOGRAM.width * s) / 2,
    y: m.logo.cy * unit - (MONOGRAM.height * s) / 2,
  };
}

/** Full tag artwork as an SVG string (units: mm). `details` adds the model, colour and size. */
export function tagSvg(serial, url, details = {}) {
  const m = qrMatrix(url);
  const unit = TAG.qrSize / m.size;
  const ox = TAG.qrLeft;
  const oy = TAG.qrTop;

  let modules = '';
  for (const [r, c, len] of runs(m.dark)) {
    modules += `M${fmt(ox + c * unit)} ${fmt(oy + r * unit)}h${fmt(len * unit)}v${fmt(unit)}h${fmt(-len * unit)}z`;
  }
  const logo = logoBox(m, unit);

  const text = tagText(serial, details).map((t) => {
    const weight = t.font.endsWith('Bold') ? ' font-weight="bold"' : '';
    const spacing = t.spacing ? ` letter-spacing="${t.spacing}"` : '';
    return `<text x="${fmt(t.x)}" y="${fmt(t.y)}" font-family="Helvetica, Arial, sans-serif"${weight} font-size="${fmt(t.size)}"${spacing} fill="${COLORS.ink}">${escapeXml(t.text)}</text>`;
  });
  if (hasDetails(details)) {
    text.push(`<line x1="${TAG.textLeft}" y1="${TAG.ruleY}" x2="${TAG.textRight}" y2="${TAG.ruleY}" stroke="${COLORS.guide}" stroke-width="0.2"/>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${TAG.width}mm" height="${TAG.height}mm" viewBox="0 0 ${TAG.width} ${TAG.height}">
  <title>EvlveX certificate tag ${serial}</title>
  <rect width="${TAG.width}" height="${TAG.height}" fill="${COLORS.paper}"/>
  <path d="${modules}" fill="${COLORS.ink}" shape-rendering="crispEdges"/>
  <g transform="translate(${fmt(ox + logo.x)} ${fmt(oy + logo.y)}) scale(${logo.s.toPrecision(6)})">
    <path d="${MONOGRAM.d}" fill="${COLORS.accent}" fill-rule="evenodd"/>
  </g>
  ${text.join('\n  ')}
</svg>
`;
}

const MM = 72 / 25.4; // PDF points per mm

/** Draw one tag on a PDFKit document at (x, y) in mm, with a light cut guide. `details` adds model, colour and size. */
export function drawTagPdf(doc, xMm, yMm, serial, url, details = {}) {
  const m = qrMatrix(url);
  const unit = (TAG.qrSize / m.size) * MM;
  const x = xMm * MM;
  const y = yMm * MM;
  const ox = x + TAG.qrLeft * MM;
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

  // Monogram: the brand path, scaled into the cleared centre
  const logo = logoBox(m, unit);
  doc.save().translate(ox + logo.x, oy + logo.y).scale(logo.s)
    .path(MONOGRAM.d).fill(COLORS.accent, 'even-odd').restore();

  // Text column
  for (const t of tagText(serial, details)) {
    doc.font(t.font).fontSize(t.size * MM).fillColor(COLORS.ink)
      .text(t.text, x + t.x * MM, y + t.y * MM, { baseline: 'alphabetic', characterSpacing: t.spacing * MM, lineBreak: false });
  }
  if (hasDetails(details)) {
    doc.save().lineWidth(0.2 * MM).strokeColor(COLORS.guide)
      .moveTo(x + TAG.textLeft * MM, y + TAG.ruleY * MM).lineTo(x + TAG.textRight * MM, y + TAG.ruleY * MM).stroke().restore();
  }
}

// 3 × 5 tags of 63.5 × 50.8 mm per A4 sheet (7 mm page margin, 2 mm between tags).
export const A4 = { width: 210, height: 297, margin: 7, gap: 2 };

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
