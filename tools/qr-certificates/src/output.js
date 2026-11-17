// Writes a batch's artwork: one SVG per tag, an A4 print sheet (PDF) and a CSV manifest.
import { createWriteStream, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import { A4, drawTagPdf, sheetSlots, tagSvg, TAG } from './qr.js';

const csvCell = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));

/**
 * @param {string} outDir
 * @param {{serial:string, handle:string, url:string, product?:string, color?:string, size?:string, pairNumber?:number, group?:string}[]} items
 *   Items from a stock list (generate --from) carry product details: the manifest gets extra columns and the
 *   PDF starts every group (model · colour · size) on a new sheet.
 * @param {{batch:string, note?:string}} meta
 */
export async function writeOutputs(outDir, items, meta) {
  mkdirSync(path.join(outDir, 'svg'), { recursive: true });

  for (const item of items) {
    writeFileSync(path.join(outDir, 'svg', `${item.serial}.svg`), tagSvg(item.serial, item.url));
  }

  const createdAt = new Date().toISOString();
  const detailed = items.some((i) => i.group);
  const lines = [detailed ? 'serial,handle,url,batch,created_at,product,color,size,pair_number' : 'serial,handle,url,batch,created_at'];
  for (const item of items) {
    const row = [item.serial, item.handle, item.url, meta.batch, createdAt];
    if (detailed) row.push(item.product || '', item.color || '', item.size || '', item.pairNumber ?? '');
    lines.push(row.map(csvCell).join(','));
  }
  writeFileSync(path.join(outDir, 'manifest.csv'), lines.join('\n') + '\n');

  await writePdf(path.join(outDir, 'tags.pdf'), items, meta);
}

async function writePdf(file, items, meta) {
  const MM = 72 / 25.4;
  const doc = new PDFDocument({
    size: 'A4',
    margin: 0,
    autoFirstPage: false,
    info: { Title: `EvlveX certificate tags — ${meta.batch}`, Author: 'EvlveX' },
  });
  const stream = createWriteStream(file);
  doc.pipe(stream);

  const slots = sheetSlots();
  // Pages: a new sheet every ${slots.length} tags, and (for stock lists) whenever the group changes.
  const pagesOf = [];
  let current = null;
  items.forEach((item) => {
    if (!current || current.items.length === slots.length || current.group !== (item.group || '')) {
      current = { group: item.group || '', items: [] };
      pagesOf.push(current);
    }
    current.items.push(item);
  });
  const groupTotals = new Map();
  for (const item of items) if (item.group) groupTotals.set(item.group, (groupTotals.get(item.group) || 0) + 1);

  pagesOf.forEach((page, p) => {
    doc.addPage();
    const header = `EvlveX · batch ${meta.batch} · sheet ${p + 1}/${pagesOf.length} · tags ${TAG.width}×${TAG.height} mm — print at 100% (no "fit to page")${meta.note ? ' · ' + meta.note : ''}`;
    doc.font('Helvetica').fontSize(6.5).fillColor('#888888')
      .text(header, A4.margin * MM, 5 * MM, { width: (A4.width - 2 * A4.margin) * MM, align: 'center', lineBreak: false });
    if (page.group) {
      const first = page.items[0];
      const last = page.items[page.items.length - 1];
      const label = `${page.group} — ${page.items.length} of ${groupTotals.get(page.group)} tags · pair no. ${first.pairNumber}–${last.pairNumber}`;
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#111111')
        .text(label, A4.margin * MM, 8.5 * MM, { width: (A4.width - 2 * A4.margin) * MM, align: 'center', lineBreak: false });
    }
    page.items.forEach((item, i) => {
      const [x, y] = slots[i];
      drawTagPdf(doc, x, y, item.serial, item.url);
    });
  });

  doc.end();
  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}
