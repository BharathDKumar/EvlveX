// npm run generate -- --count 200 --batch NOV26 [--offline] [--base-url https://…]
// npm run generate -- --reprint EVX-7F3K9QMD[,EVX-…]
//
// Creates new serials as Active `evlvex_certificate` metaobjects in Shopify and writes
// out/<batch>/{svg/*.svg, tags.pdf, manifest.csv}. See docs/spec/qr-tooling.md and docs/spec/operations.md §1.
import { existsSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { certificateUrl, config, fail, publicBaseUrl, ROOT } from './config.js';
import { assertNoUserErrors, getCertificate, gql } from './shopify.js';
import { newSerial, normaliseSerial, serialToHandle } from './serial.js';
import { writeOutputs } from './output.js';

const { values: args } = parseArgs({
  options: {
    count: { type: 'string' },
    batch: { type: 'string' },
    offline: { type: 'boolean', default: false },
    'base-url': { type: 'string' },
    reprint: { type: 'string' },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (args.help) {
  console.log(`Usage:
  npm run generate -- --count 200 --batch NOV26          create serials in Shopify + print files
  npm run generate -- --count 6 --batch TEST --offline   artwork only, nothing created in Shopify
  npm run generate -- --count 3 --batch TEST --base-url https://evlvex.myshopify.com   test tags
  npm run generate -- --reprint EVX-7F3K9QMD,EVX-…       re-create artwork for existing serials`);
  process.exit(0);
}

const baseUrl = publicBaseUrl(args['base-url'] || (args.offline && !config.publicDomain ? 'https://evlvex.com' : undefined));
const isTestUrl = Boolean(args['base-url']) || /myshopify\.com/i.test(baseUrl);
if (isTestUrl) {
  console.warn(`\n⚠  QR codes will point to ${baseUrl}. These are TEST tags — do not attach them to real pairs.\n`);
}

if (args.reprint) {
  await reprint(args.reprint);
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
async function createCertificate(serial, handle, batch) {
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
