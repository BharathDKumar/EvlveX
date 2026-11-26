// npm run autopack [-- --dry-run] [--days 30] [--no-mail]
//
// Gives every new order its QR tags and emails staff which serials to pack (docs/spec/qr-tooling.md §5):
//   new order        → reserve a free tag of the same product and UK size (lowest pair number first)
//   order fulfilled  → put the buyer's name and purchase date on the reserved tags
//   order cancelled  → release tags that were never named
// Runs every 30 minutes on GitHub Actions (.github/workflows/autopack.yml); safe to run by hand at any time.
import { parseArgs } from 'node:util';
import { fail } from './config.js';
import { mailConfig, mailEnabled, sendMail } from './mail.js';
import { addTags, buyerName, listRecentOrders, removeTags, setPackSerials } from './orders.js';
import { lineSize, packingEmail, planActions } from './pack.js';
import { listCertificates, updateCertificate } from './shopify.js';

const { values: args } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: false },
    'no-mail': { type: 'boolean', default: false },
    days: { type: 'string', default: '30' },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (args.help) {
  console.log(`Usage:
  npm run autopack                 reserve tags for new orders, name shipped ones, release cancelled ones
  npm run autopack -- --dry-run    show what would happen; change nothing, send no email
       [--days 30]                 how far back to look at orders (max 60 without read_all_orders)
       [--no-mail]                 do not send the packing email`);
  process.exit(0);
}

const days = Number.parseInt(args.days, 10);
if (!(days >= 1 && days <= 365)) fail('--days must be a whole number between 1 and 365.');
const dryRun = args['dry-run'];

const [certs, rawOrders] = await Promise.all([listCertificates(), listRecentOrders(days)]);
const orders = rawOrders.map((o) => ({
  id: o.id,
  name: o.name,
  createdAt: o.createdAt,
  cancelled: Boolean(o.cancelledAt),
  fulfilled: o.displayFulfillmentStatus === 'FULFILLED',
  tags: o.tags || [],
  buyerName: buyerName(o),
  lines: o.lineItems.nodes.map((li) => ({
    productId: li.product?.id || null,
    productTitle: li.product?.title || '',
    quantity: li.currentQuantity ?? li.quantity,
    size: lineSize(li),
  })),
}));

const free = certs.filter((c) => !c.buyerName && !c.orderNumber).length;
console.log(`${dryRun ? '[dry run] ' : ''}${orders.length} order(s) in the last ${days} days · ${certs.length} tags, ${free} free`);

const actions = planActions(orders, certs);
if (!actions.length) {
  console.log('Nothing to do.');
  process.exit(0);
}

for (const a of actions) {
  console.log(`${a.order.name}  ${a.kind.padEnd(7)}  ${a.message}`);
  if (dryRun) continue;

  if (a.kind === 'reserve') {
    // Certificate first: if the run stops here, the next run finds the tag already reserved for this order.
    for (const c of a.reserve) {
      const fields = [{ key: 'order_number', value: a.order.name }];
      if (c.newPairNumber) fields.push({ key: 'pair_number', value: c.pairNumber });
      await updateCertificate(c.id, fields, c.serial);
    }
    await setPackSerials(a.order.id, a.packText);
  } else if (a.kind === 'name') {
    for (const c of a.name) {
      await updateCertificate(c.id, [
        { key: 'buyer_name', value: a.order.buyerName },
        { key: 'purchase_date', value: a.order.createdAt.slice(0, 10) },
      ], c.serial);
    }
  } else if (a.kind === 'release') {
    for (const c of a.release) await updateCertificate(c.id, [{ key: 'order_number', value: '' }], c.serial);
    await setPackSerials(a.order.id, a.packText);
  }
  await removeTags(a.order.id, a.tagsRemove || []);
  await addTags(a.order.id, a.tagsAdd || []);
}

const email = packingEmail(actions);
if (dryRun) {
  console.log(`\n[dry run] Nothing was changed.${email ? `\n\nEmail that would be sent:\nSubject: ${email.subject}\n\n${email.text}` : ''}`);
} else if (email && !args['no-mail']) {
  if (mailEnabled()) {
    await sendMail(email);
    console.log(`✔ Packing email sent to ${mailConfig.to.replace(/^(.).*(@.*)$/, '$1…$2')}.`);
  } else {
    console.warn('⚠  SMTP_USER / SMTP_PASS are not set, so no email was sent. The serials are on each order (tags and "Pack serials").');
  }
}
