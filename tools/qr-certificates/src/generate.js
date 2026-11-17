// npm run generate -- --count 200 --batch NOV26 [--offline] [--base-url https://…]
// npm run generate -- --reprint EVX-7F3K9QMD[,EVX-…]
// npm run generate -- --from stock.csv --batch NOV26   one certificate per pair in a stock list (product, size, pair no.)
//
// Creates new serials as Active `evlvex_certificate` metaobjects in Shopify and writes
// out/<batch>/{svg/*.svg, tags.pdf, manifest.csv}. See docs/spec/qr-tooling.md and docs/spec/operations.md §1.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { certificateUrl, config, fail, publicBaseUrl, ROOT } from './config.js';
import { assertNoUserErrors, getCertificate, gql, listCertificateChapters, modelGroup } from './shopify.js';
import { chapterFields, nextPairNumber } from './chapter.js';
import { expandPairs, groupLabel, parseStockList } from './stocklist.js';
import { newSerial, normaliseSerial, serialToHandle } from './serial.js';
import { writeOutputs } from './output.js';

const { values: args } = parseArgs({
  options: {
    count: { type: 'string' },
    batch: { type: 'string' },
    offline: { type: 'boolean', default: false },
    'base-url': { type: 'string' },
    reprint: { type: 'string' },
    from: { type: 'string' },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (args.help) {
  console.log(`Usage:
  npm run generate -- --count 200 --batch NOV26          create serials in Shopify + print files
  npm run generate -- --count 6 --batch TEST --offline   artwork only, nothing created in Shopify
  npm run generate -- --count 3 --batch TEST --base-url https://w3wigc-de.myshopify.com   test tags
  npm run generate -- --reprint EVX-7F3K9QMD,EVX-…       re-create artwork for existing serials
  npm run generate -- --from stock.csv --batch NOV26     one certificate per pair in a stock list
                                                         (columns: product, size, count [, color, artisan, finished, note])`);
  process.exit(0);
}

const baseUrl = publicBaseUrl(args['base-url'] || (args.offline && !config.publicDomain ? 'https://evlvex.com' : undefined));
const isTestUrl = Boolean(args['base-url']) || /myshopify\.com/i.test(baseUrl);
if (isTestUrl) {
  console.warn(`\n⚠  QR codes will point to ${baseUrl}. These are TEST tags — do not attach them to real pairs.\n`);
}

if (args.reprint) {
  await reprint(args.reprint);
} else if (args.from) {
  await generateFromList(args.from);
} else {
  await generate();
}

async function generate() {
  const count = Number.parseInt(args.count ?? '', 10);
  if (!Number.isInteger(count) || count < 1 || count > 5000) fail('--count must be a number between 1 and 5000.');
  const batch = (args.batch || '').trim();
  if (!/^[A-Za-z0-9_-]{1,32}$/.test(batch)) fail('--batch is required: letters, digits, - or _ (e.g. NOV26).');

  const outDir = path.join(ROOT, 'out', batch);
  if (existsSync(path.join(outDir, 'manifest.csv'))) {
    fail(`Batch "${batch}" already exists at ${outDir}. Choose a new batch name.`);
  }

  if (!args.offline) await assertDefinitionExists();

  const items = [];
  const seen = new Set();
  let failure;

  console.log(`${args.offline ? 'Generating (offline)' : 'Creating'} ${count} serials for batch ${batch}…`);
  try {
    while (items.length < count) {
      const serial = newSerial();
      if (seen.has(serial)) continue;
      seen.add(serial);
      const handle = serialToHandle(serial);

      if (!args.offline) {
        const created = await createCertificate(serial, handle, batch);
        if (!created) continue; // handle collision → try another serial
      }
      items.push({ serial, handle, url: certificateUrl(baseUrl, handle) });
      if (items.length % 10 === 0 || items.length === count) process.stdout.write(`  ${items.length}/${count}\r`);
    }
  } catch (error) {
    failure = error;
  }

  if (items.length) {
    await writeOutputs(outDir, items, { batch, note: args.offline ? 'OFFLINE PROOF — not registered' : isTestUrl ? 'TEST' : '' });
  }

  console.log(`\n✔ ${items.length} tag(s) written to ${outDir}`);
  console.log('  • tags.pdf      → print at 100% scale');
  console.log('  • svg/          → one vector file per tag');
  console.log('  • manifest.csv  → keep as the record of this batch');
  if (args.offline) console.log('\n  Offline mode: nothing was created in Shopify. Scanning these tags will show a 404 page.');

  if (failure) {
    fail(`Stopped after ${items.length} of ${count}: ${failure.message}\n  The files above contain only the serials that were created in Shopify.`);
  }
}

async function assertDefinitionExists() {
  const data = await gql(
    `query($type: String!) { metaobjectDefinitionByType(type: $type) { id name } }`,
    { type: config.type }
  );
  if (!data.metaobjectDefinitionByType) {
    fail(`Metaobject definition "${config.type}" not found in ${config.store}. Run \`npm run setup\` first.`);
  }
}

/** Returns true when created with exactly the requested handle. */
async function createCertificate(serial, handle, batch, extraFields = []) {
  const data = await gql(
    `mutation($metaobject: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $metaobject) {
        metaobject { id handle }
        userErrors { field message code }
      }
    }`,
    {
      metaobject: {
        type: config.type,
        handle,
        fields: [
          { key: 'serial', value: serial },
          { key: 'batch', value: batch },
          ...extraFields,
        ],
        capabilities: { publishable: { status: 'ACTIVE' } },
      },
    }
  );
  const payload = data.metaobjectCreate;
  if (payload.userErrors?.some((e) => e.code === 'TAKEN')) return false;
  assertNoUserErrors(payload, `Creating ${serial}`);

  if (payload.metaobject.handle !== handle) {
    // Shopify de-duplicated the handle (e.g. "-1" suffix): the serial is already in use. Undo and retry.
    await gql(`mutation($id: ID!) { metaobjectDelete(id: $id) { userErrors { message } } }`, { id: payload.metaobject.id });
    return false;
  }
  return true;
}

async function reprint(list) {
  const serials = list.split(',').map((s) => s.trim()).filter(Boolean);
  const items = [];
  for (const raw of serials) {
    const serial = normaliseSerial(raw);
    if (!serial) fail(`"${raw}" is not a valid serial (expected EVX-XXXXXXXX).`);
    const handle = serialToHandle(serial);
    if (!args.offline) {
      const cert = await getCertificate(handle);
      if (!cert) fail(`${serial} does not exist in Shopify. Check the serial, or add --offline to print it anyway.`);
    }
    items.push({ serial, handle, url: certificateUrl(baseUrl, handle) });
  }
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
  const batch = `REPRINT-${stamp}`;
  const outDir = path.join(ROOT, 'out', batch);
  await writeOutputs(outDir, items, { batch, note: 'REPRINT' });
  console.log(`✔ Reprint of ${items.length} tag(s) written to ${outDir}`);
}

/** Resolve product titles (any status, drafts included) → { id, storyId } per title. */
async function resolveProducts(titles) {
  const out = new Map();
  for (const title of titles) {
    const data = await gql(
      `query($q: String!) {
        products(first: 10, query: $q) {
          nodes { id title status story: metafield(namespace: "evlvex", key: "story") { value } }
        }
      }`,
      { q: `title:"${title.replace(/"/g, '')}"` }
    );
    const match = data.products.nodes.filter((p) => p.title.trim().toLowerCase() === title.trim().toLowerCase());
    if (match.length !== 1) {
      fail(`Product "${title}" ${match.length ? 'matches several products' : 'was not found'} in Shopify. Use the exact product title.`);
    }
    out.set(title, { id: match[0].id, storyId: match[0].story?.value || null });
  }
  return out;
}

async function generateFromList(file) {
  const batch = (args.batch || '').trim();
  if (!/^[A-Za-z0-9_-]{1,32}$/.test(batch)) fail('--batch is required: letters, digits, - or _ (e.g. NOV26).');
  const listPath = path.resolve(file);
  if (!existsSync(listPath)) fail(`Stock list not found: ${listPath}`);

  const { rows, errors } = parseStockList(readFileSync(listPath, 'utf8'));
  if (errors.length) fail(`The stock list has problems:\n  ${errors.join('\n  ')}`);
  for (const row of rows) {
    const { errors: chapterErrors } = chapterFields({ artisan: row.artisan, finished: row.finished, note: row.note });
    if (chapterErrors.length) fail(`Line ${row.line}: ${chapterErrors.join(' ')}`);
  }
  const pairs = expandPairs(rows);

  const outDir = path.join(ROOT, 'out', batch);
  if (existsSync(path.join(outDir, 'manifest.csv'))) fail(`Batch "${batch}" already exists at ${outDir}. Choose a new batch name.`);

  // Pair numbers continue per model: after the highest existing number of the same model (story, or product).
  const titles = [...new Set(pairs.map((p) => p.product))];
  const products = args.offline ? new Map(titles.map((t) => [t, { id: null, storyId: null }])) : await resolveProducts(titles);
  if (!args.offline) await assertDefinitionExists();
  const existing = args.offline ? [] : await listCertificateChapters();
  const next = new Map();
  for (const [title, p] of products) {
    const group = modelGroup(p.id, p.storyId) || title;
    if (!next.has(group)) next.set(group, nextPairNumber(existing, group, null));
    p.group = group;
  }

  const summary = rows.map((r) => `  ${groupLabel(r).padEnd(36)} ${String(r.count).padStart(4)}`).join('\n');
  console.log(`${args.offline ? 'Generating (offline)' : 'Creating'} ${pairs.length} certificates for batch ${batch}:\n${summary}`);

  const items = [];
  const seen = new Set();
  let failure;
  try {
    for (const pair of pairs) {
      const product = products.get(pair.product);
      const pairNumber = next.get(product.group);
      const { fields: chapter } = chapterFields({ artisan: pair.artisan, finished: pair.finished, note: pair.note });
      const extra = [
        ...(product.id ? [{ key: 'product', value: product.id }] : []),
        { key: 'size', value: pair.size },
        { key: 'pair_number', value: String(pairNumber) },
        ...chapter,
      ];
      for (;;) {
        const serial = newSerial();
        if (seen.has(serial)) continue;
        seen.add(serial);
        const handle = serialToHandle(serial);
        if (!args.offline && !(await createCertificate(serial, handle, batch, extra))) continue;
        items.push({
          serial, handle, url: certificateUrl(baseUrl, handle),
          product: pair.product, color: pair.color || '', size: pair.size, pairNumber, group: groupLabel(pair),
        });
        break;
      }
      next.set(product.group, pairNumber + 1);
      if (items.length % 10 === 0 || items.length === pairs.length) process.stdout.write(`  ${items.length}/${pairs.length}\r`);
    }
  } catch (error) {
    failure = error;
  }

  if (items.length) {
    await writeOutputs(outDir, items, { batch, note: args.offline ? 'OFFLINE PROOF — not registered' : isTestUrl ? 'TEST' : '' });
  }
  console.log(`\n✔ ${items.length} tag(s) written to ${outDir}`);
  console.log('  • tags.pdf      → print at 100% scale; each model and size starts on a new sheet');
  console.log('  • manifest.csv  → serial, product, colour, size and pair number of every tag');
  if (args.offline) console.log('\n  Offline mode: nothing was created in Shopify. Scanning these tags will show a 404 page.');
  if (failure) fail(`Stopped after ${items.length} of ${pairs.length}: ${failure.message}\n  The files above contain only the certificates that were created in Shopify.`);
}
