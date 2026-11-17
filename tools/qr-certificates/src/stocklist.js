// Stock list → one entry per pair, for `generate --from <file>` (docs/spec/qr-tooling.md §2, operations.md §1).
// Pure helpers, unit-tested (test/stocklist.test.js).
//
// Accepted input: CSV, or tab/space separated text pasted from a spreadsheet, with a header row.
// Columns (case-insensitive; order free):
//   product | type | model   required  product title, e.g. The Silent Grind
//   size                     required  UK size, e.g. 8 or UK 8
//   count | qty | quantity   optional  pairs in this row (default 1)
//   color | colour           optional  kept in the manifest
//   artisan, finished, note  optional  copied to every pair of the row (see chapter.js)

const HEADERS = {
  product: ['product', 'type', 'model'],
  size: ['size'],
  count: ['count', 'qty', 'quantity'],
  color: ['color', 'colour'],
  artisan: ['artisan'],
  finished: ['finished', 'finished_on', 'date'],
  note: ['note', 'pair_note'],
};

/** Split one line into cells: CSV when it has commas, otherwise tabs or runs of 2+ spaces. */
function splitLine(line) {
  if (line.includes(',')) {
    const cells = [];
    let cur = '';
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (quoted) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') quoted = false;
        else cur += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ',') { cells.push(cur); cur = ''; }
      else cur += ch;
    }
    cells.push(cur);
    return cells.map((c) => c.trim());
  }
  return line.split(/\t+| {2,}/).map((c) => c.trim()).filter((c) => c !== '');
}

/** "8", "UK 8", "uk8" → "UK 8". Returns null when it isn't a UK size. */
export function normaliseSize(value) {
  const m = String(value ?? '').trim().match(/^(?:uk\s*)?(\d{1,2}(?:\.5)?)$/i);
  return m ? `UK ${m[1]}` : null;
}

/**
 * Parse a stock list.
 * @returns {{ rows: {product, color, size, count, artisan?, finished?, note?, line}[], errors: string[] }}
 */
export function parseStockList(text) {
  const errors = [];
  const lines = String(text).replace(/\r\n?/g, '\n').split('\n').map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { rows: [], errors: ['The stock list is empty.'] };

  const header = splitLine(lines[0]).map((h) => h.toLowerCase());
  const col = {};
  for (const [key, names] of Object.entries(HEADERS)) {
    const i = header.findIndex((h) => names.includes(h));
    if (i >= 0) col[key] = i;
  }
  if (col.product === undefined || col.size === undefined) {
    return { rows: [], errors: [`Header row must name a product column (${HEADERS.product.join('/')}) and a size column. Found: ${header.join(', ')}`] };
  }

  const rows = [];
  lines.slice(1).forEach((line, idx) => {
    const lineNo = idx + 2;
    const cells = splitLine(line);
    const get = (key) => (col[key] === undefined ? undefined : cells[col[key]]);
    const product = (get('product') || '').trim();
    const size = normaliseSize(get('size'));
    const rawCount = get('count');
    const count = rawCount === undefined || rawCount === '' ? 1 : Number(rawCount);

    if (!product) errors.push(`Line ${lineNo}: missing product.`);
    if (!size) errors.push(`Line ${lineNo}: size "${get('size') ?? ''}" is not a UK size like 8 or UK 8.`);
    if (!Number.isInteger(count) || count < 1 || count > 1000) errors.push(`Line ${lineNo}: count "${rawCount}" must be a whole number from 1 to 1000.`);
    if (product && size && Number.isInteger(count) && count >= 1 && count <= 1000) {
      const row = { product, color: (get('color') || '').trim(), size, count, line: lineNo };
      for (const key of ['artisan', 'finished', 'note']) {
        const v = get(key);
        if (v !== undefined && v !== '') row[key] = v;
      }
      rows.push(row);
    }
  });
  return { rows, errors };
}

/** Expand rows into one entry per pair, keeping the list order. */
export function expandPairs(rows) {
  const pairs = [];
  for (const row of rows) {
    for (let i = 0; i < row.count; i++) {
      const { count, ...rest } = row;
      pairs.push({ ...rest });
    }
  }
  return pairs;
}

/** Label used to group tags on the print sheets, e.g. "The Silent Grind · Black · UK 8". */
export const groupLabel = (p) => [p.product, p.color, p.size].filter(Boolean).join(' · ');
