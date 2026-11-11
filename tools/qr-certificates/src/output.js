// Writes a batch's artwork: one SVG per tag, an A4 print sheet (PDF) and a CSV manifest.
import { createWriteStream, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import { A4, drawTagPdf, sheetSlots, tagSvg, TAG } from './qr.js';

const csvCell = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));

/**
 * @param {string} outDir
 * @param {{serial:string, handle:string, url:string}[]} items
 * @param {{batch:string, note?:string}} meta
 */
export async function writeOutputs(outDir, items, meta) {
  mkdirSync(path.join(outDir, 'svg'), { recursive: true });

  for (const item of items) {
    writeFileSync(path.join(outDir, 'svg', `${item.serial}.svg`), tagSvg(item.serial, item.url));
  }

  const createdAt = new Date().toISOString();
  const lines = ['serial,handle,url,batch,created_at'];
  for (const item of items) {
    lines.push([item.serial, item.handle, item.url, meta.batch, createdAt].map(csvCell).join(','));
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
  items.forEach((item, i) => {
    const slot = i % slots.length;
    if (slot === 0) {
      doc.addPage();
      const page = Math.floor(i / slots.length) + 1;
      const pages = Math.ceil(items.length / slots.length);
      const header = `EvlveX · batch ${meta.batch} · sheet ${page}/${pages} · tags ${TAG.width}×${TAG.height} mm — print at 100% (no "fit to page")${meta.note ? ' · ' + meta.note : ''}`;
      doc.font('Helvetica').fontSize(6.5).fillColor('#888888')
        .text(header, A4.margin * MM, 5 * MM, { width: (A4.width - 2 * A4.margin) * MM, align: 'center', lineBreak: false });
    }
    const [x, y] = slots[slot];
    drawTagPdf(doc, x, y, item.serial, item.url);
  });

  doc.end();
  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}
