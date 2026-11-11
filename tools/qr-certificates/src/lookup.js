// npm run lookup -- --serial EVX-7F3K9QMD
import { parseArgs } from 'node:util';
import { certificateUrl, fail, publicBaseUrl } from './config.js';
import { fieldMap, getCertificate } from './shopify.js';
import { normaliseSerial, serialToHandle } from './serial.js';

const { values: args } = parseArgs({ options: { serial: { type: 'string' } } });
const serial = normaliseSerial(args.serial);
if (!serial) fail('Usage: npm run lookup -- --serial EVX-7F3K9QMD');

const handle = serialToHandle(serial);
const cert = await getCertificate(handle);
if (!cert) fail(`${serial} was not found in Shopify.`);

const f = fieldMap(cert);
const rows = [
  ['Serial', f.serial],
  ['Status', f.buyer_name ? 'Registered' : 'Waiting for its owner'],
  ['Buyer', f.buyer_name],
  ['Product', f.product],
  ['Size', f.size],
  ['Purchased', f.purchase_date],
  ['Order', f.order_number],
  ['Message', f.personal_message],
  ['Pair', f.pair_number ? `No. ${String(f.pair_number).padStart(4, '0')}` : ''],
  ['Artisan', f.artisan],
  ['Finished', f.finished_on],
  ['Note', f.pair_note],
  ['Batch', f.batch],
  ['Updated', cert.updatedAt],
  ['URL', certificateUrl(publicBaseUrl(), handle)],
];
for (const [k, v] of rows) if (v) console.log(`${k.padEnd(10)} ${v}`);
