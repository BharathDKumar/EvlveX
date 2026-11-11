// npm run assign -- --serial EVX-7F3K9QMD --order 1001 [--size 42] [--message "…"] [--name "…"] [--line 2]
//                   [--artisan "Marco R."] [--finished 2026-11-03] [--note "…"] [--pair-number 42] [--force]
// npm run assign -- --serial EVX-7F3K9QMD --clear
//
// Links a pair's certificate to an order (buyer's full name, product, size, purchase date) and records
// the pair's own chapter from its workshop card. See docs/spec/qr-tooling.md §3 and docs/spec/operations.md §3.
import { parseArgs } from 'node:util';
import { certificateUrl, fail, publicBaseUrl } from './config.js';
import { CLEAR_FIELDS, chapterFields, formatPairNumber, nextPairNumber } from './chapter.js';
import {
  assertNoUserErrors,
  fieldMap,
  getCertificate,
  getProductStoryId,
  gql,
  listCertificateChapters,
  modelGroup,
} from './shopify.js';
import { normaliseSerial, serialToHandle } from './serial.js';

const { values: args } = parseArgs({
  options: {
    serial: { type: 'string' },
    order: { type: 'string' },
    size: { type: 'string' },
    message: { type: 'string' },
    name: { type: 'string' },
    line: { type: 'string' },
    artisan: { type: 'string' },
    finished: { type: 'string' },
    note: { type: 'string' },
    'pair-number': { type: 'string' },
    force: { type: 'boolean', default: false },
    clear: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (args.help || !args.serial) {
  console.log(`Usage:
  npm run assign -- --serial EVX-7F3K9QMD --order 1001            fill from the order
       [--size 42]           override size (default: the line item's Size option)
       [--message "..."]     personal/gift message shown on the page
       [--name "..."]        override buyer name (e.g. gift recipient)
       [--line 2]            which shoe line item to use if the order has several
       [--artisan "Marco R."]   who finished the pair (from the workshop card; only with consent)
       [--finished 2026-11-03]  date the pair was finished
       [--note "..."]        pair note from the workshop card (max 200 characters)
       [--pair-number 42]    override the automatic next pair number for the model
       [--force]             overwrite an already-assigned certificate
  npm run assign -- --serial EVX-7F3K9QMD --clear                 un-assign (returns); keeps the pair's chapter`);
  process.exit(args.help ? 0 : 1);
}

const serial = normaliseSerial(args.serial);
if (!serial) fail(`"${args.serial}" is not a valid serial (expected EVX-XXXXXXXX).`);
const handle = serialToHandle(serial);

const chapter = chapterFields({
  artisan: args.artisan,
  finished: args.finished,
  note: args.note,
  pairNumber: args['pair-number'],
});
if (chapter.errors.length) fail(chapter.errors.join('\n  '));

const cert = await getCertificate(handle);
if (!cert) fail(`${serial} was not found in Shopify. Check the tag, or generate it first.`);
const current = fieldMap(cert);

if (args.clear) {
  await update(cert.id, CLEAR_FIELDS.map((key) => ({ key, value: '' })));
  console.log(`✔ ${serial} cleared. It is back to "waiting for its owner".`);
  if (current.pair_number || current.artisan) {
    console.log(`  Kept the pair's chapter: No. ${current.pair_number ? formatPairNumber(current.pair_number) : '—'}${current.artisan ? ', finished by ' + current.artisan : ''}.`);
  }
  process.exit(0);
}

if (!args.order) fail('--order is required (e.g. --order 1001), or use --clear.');
if (current.buyer_name && !args.force) {
  fail(`${serial} is already registered to "${current.buyer_name}" (order ${current.order_number || '?'}).\n  Re-run with --force to overwrite, or --clear to un-assign.`);
}

const order = await findOrder(args.order);
if (!order) fail(`Order ${args.order} not found. Note: without the read_all_orders scope, only the last 60 days are visible.`);

const shoeLines = order.lineItems.nodes.filter((li) => li.product);
if (!shoeLines.length) fail(`Order ${order.name} has no product line items.`);
let lineIndex = 0;
if (args.line) {
  lineIndex = Number.parseInt(args.line, 10) - 1;
  if (!(lineIndex >= 0 && lineIndex < shoeLines.length)) fail(`--line must be between 1 and ${shoeLines.length}.`);
} else if (shoeLines.length > 1) {
  console.warn(`⚠  Order ${order.name} has ${shoeLines.length} products; using line 1 (${shoeLines[0].product.title}). Use --line N to pick another:`);
  shoeLines.forEach((li, i) => console.warn(`     ${i + 1}. ${li.product.title} — ${li.variantTitle || ''}`));
}
const line = shoeLines[lineIndex];

// Never fall back to displayName blindly: Shopify uses the email address when no name is set,
// and the certificate page is public.
const buyerName = [args.name, joinName(order.customer), order.shippingAddress?.name, order.billingAddress?.name, order.customer?.displayName]
  .map((n) => (n || '').trim())
  .find((n) => n && !n.includes('@'));
if (!buyerName) fail(`Order ${order.name} has no customer name. Pass --name "Full Name".`);

const sizeOption = line.variant?.selectedOptions?.find((o) => /size|taille|größe|talla|maat/i.test(o.name));
const size = (args.size || sizeOption?.value || '').trim();
const purchaseDate = order.createdAt.slice(0, 10);

const fields = [
  { key: 'buyer_name', value: buyerName },
  { key: 'product', value: line.product.id },
  { key: 'size', value: size },
  { key: 'purchase_date', value: purchaseDate },
  { key: 'order_number', value: order.name },
];
if (args.message !== undefined) fields.push({ key: 'personal_message', value: args.message });
fields.push(...chapter.fields);

// Pair number: keep an existing one; otherwise the next number for this model.
let pairNumber = chapter.fields.find((f) => f.key === 'pair_number')?.value || current.pair_number || null;
if (!pairNumber) {
  const group = modelGroup(line.product.id, await getProductStoryId(line.product.id));
  pairNumber = String(nextPairNumber(await listCertificateChapters(), group, handle));
  fields.push({ key: 'pair_number', value: pairNumber });
}

await update(cert.id, fields);

const finalValue = (key) => fields.find((f) => f.key === key)?.value ?? current[key];
const artisan = finalValue('artisan');
const finishedOn = finalValue('finished_on');
const pairNote = finalValue('pair_note');

console.log(`✔ ${serial} registered`);
console.log(`  Name     ${buyerName}`);
console.log(`  Product  ${line.product.title}${size ? ' · size ' + size : ''}`);
console.log(`  Date     ${purchaseDate}   Order ${order.name}`);
if (args.message) console.log(`  Message  ${args.message}`);
console.log(`  Pair     No. ${formatPairNumber(pairNumber)}`);
if (artisan) console.log(`  Artisan  ${artisan}${finishedOn ? ' · finished ' + finishedOn : ''}`);
else if (finishedOn) console.log(`  Finished ${finishedOn}`);
if (pairNote) console.log(`  Note     ${pairNote}`);
if (!artisan && !finishedOn) console.log('  (No workshop card details recorded. Add them with --artisan / --finished / --note.)');
console.log(`\n  ${certificateUrl(publicBaseUrl(), handle)}\n  Scan the tag to double-check before closing the box.`);

async function update(id, fields) {
  const data = await gql(
    `mutation($id: ID!, $metaobject: MetaobjectUpdateInput!) {
      metaobjectUpdate(id: $id, metaobject: $metaobject) {
        metaobject { id }
        userErrors { field message code }
      }
    }`,
    { id, metaobject: { fields } }
  );
  assertNoUserErrors(data.metaobjectUpdate, `Updating ${serial}`);
}

async function findOrder(input) {
  const name = String(input).trim().replace(/^#?/, '#');
  const data = await gql(
    `query($q: String!) {
      orders(first: 1, query: $q) {
        nodes {
          id name createdAt
          customer { displayName firstName lastName }
          shippingAddress { name }
          billingAddress { name }
          lineItems(first: 50) {
            nodes {
              variantTitle
              product { id title }
              variant { selectedOptions { name value } }
            }
          }
        }
      }
    }`,
    { q: `name:${name}` }
  );
  return data.orders.nodes.find((o) => o.name === name) || null;
}

function joinName(c) {
  return [c?.firstName, c?.lastName].filter(Boolean).join(' ');
}
