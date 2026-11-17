// npm run merge -- --batches NOV26,NOV26-2 --out NOV26-PRINT
//
// Combines the manifests of several batches (e.g. a run that was interrupted and finished as a second batch)
// into one set of print files, grouped by model · colour · size in pair-number order. Nothing is created in
// Shopify: the serials already exist. See docs/spec/qr-tooling.md §2.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { fail, ROOT } from './config.js';
import { writeOutputs } from './output.js';
import { groupLabel } from './stocklist.js';

const { values: args } = parseArgs({
  options: {
    batches: { type: 'string' },
    out: { type: 'string' },
  },
});

const batches = (args.batches || '').split(',').map((b) => b.trim()).filter(Boolean);
const out = (args.out || '').trim();
if (batches.length < 1 || !/^[A-Za-z0-9_-]{1,32}$/.test(out)) {
  fail('Usage: npm run merge -- --batches NOV26,NOV26-2 --out NOV26-PRINT');
}
const outDir = path.join(ROOT, 'out', out);
if (existsSync(path.join(outDir, 'manifest.csv'))) fail(`"${out}" already exists at ${outDir}. Choose a new name.`);

/** Minimal CSV reader for our own manifests (quoted cells allowed). */
function readCsv(file) {
  const rows = readFileSync(file, 'utf8').replace(/\r\n?/g, '\n').trim().split('\n').map((line) => {
    const cells = [];
    let cur = '';
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (quoted) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') quoted = false; else cur += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ',') { cells.push(cur); cur = ''; } else cur += ch;
    }
    cells.push(cur);
    return cells;
  });
  const [header, ...body] = rows;
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])));
}

const items = [];
for (const batch of batches) {
  const file = path.join(ROOT, 'out', batch, 'manifest.csv');
  if (!existsSync(file)) fail(`No manifest for batch "${batch}" at ${file}.`);
  for (const row of readCsv(file)) {
    const item = { serial: row.serial, handle: row.handle, url: row.url };
    if (row.product) {
      Object.assign(item, { product: row.product, color: row.color, size: row.size, pairNumber: Number(row.pair_number) });
      item.group = groupLabel(item);
    }
    items.push(item);
  }
}

// Keep the first-seen order of groups (the stock list order), pairs by number inside each group.
const groupOrder = [...new Set(items.map((i) => i.group || ''))];
items.sort((a, b) => groupOrder.indexOf(a.group || '') - groupOrder.indexOf(b.group || '') || (a.pairNumber || 0) - (b.pairNumber || 0));

await writeOutputs(outDir, items, { batch: out });
console.log(`✔ ${items.length} tags from ${batches.join(' + ')} written to ${outDir}`);
console.log('  • tags.pdf      → print at 100% scale; each model and size starts on a new sheet');
console.log('  • manifest.csv  → the combined record');
