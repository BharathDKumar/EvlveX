// Automatic tag assignment (docs/spec/qr-tooling.md §5). Pure logic, no API calls, unit-tested.
//
// A certificate (tag) is FREE when it has neither a buyer name nor an order number.
// At order:      a free tag of the same product and UK size is RESERVED (order_number set, no name yet).
// At fulfilment: the reserved tags get the buyer's name and purchase date (NAMED).
// At cancel:     reserved tags that were never named are RELEASED (order_number cleared).
import { formatPairNumber, nextPairNumber } from './chapter.js';
import { normaliseSize } from './stocklist.js';

export const TAG = {
  reserved: 'evx-reserved',
  named: 'evx-named',
  released: 'evx-released',
  noTag: 'evx-no-tag',
  // Set once a problem has been reported, so it is reported (and emailed) only once.
  checkReturn: 'evx-check-return',
  noName: 'evx-no-name',
};

export const isFree = (c) => !c.buyerName && !c.orderNumber;

/** Size of an order line: the variant's Size option, else the variant title. */
export function lineSize(line) {
  const opt = (line.variant?.selectedOptions || []).find((o) => /size|taille|größe|talla|maat/i.test(o.name));
  return normaliseSize(opt?.value ?? line.variantTitle ?? '');
}

const pairNo = (c) => {
  const n = Number.parseInt(c.pairNumber, 10);
  return Number.isSafeInteger(n) && n > 0 ? n : Number.POSITIVE_INFINITY;
};
const byPairNumber = (a, b) => pairNo(a) - pairNo(b) || String(a.handle).localeCompare(String(b.handle));

/**
 * Tags needed for an order's lines. Lines whose product has no certificates at all are not shoes (or have no
 * tags printed) and are ignored. Tags already reserved for this order are counted first, so a run that was
 * interrupted after reserving never reserves twice.
 *
 * @param certs   all certificates [{ handle, serial, productId, productTitle, size, buyerName, orderNumber, pairNumber, group }]
 * @param lines   order lines [{ productId, productTitle, quantity, size }]
 * @param already certificates whose orderNumber is this order
 * @param exclude handles already handed to other orders in this run
 * @returns {{ picks: cert[], kept: cert[], missing: {productTitle, size, count, reason}[] }}
 */
export function pickTags(certs, lines, already = [], exclude = new Set()) {
  const taken = new Set(exclude);
  const keep = [...already];
  const picks = [];
  const kept = [];
  const missing = [];
  const tagged = new Set(certs.map((c) => c.productId).filter(Boolean));

  for (const line of lines) {
    if (!line.productId || !tagged.has(line.productId) || !(line.quantity > 0)) continue;
    let need = line.quantity;

    // Reuse tags already reserved for this order (same product and size).
    for (let i = 0; i < keep.length && need > 0; ) {
      const c = keep[i];
      if (c.productId === line.productId && normaliseSize(c.size) === line.size) {
        kept.push(c);
        keep.splice(i, 1);
        need--;
      } else i++;
    }
    if (need === 0) continue;

    if (!line.size) {
      missing.push({ productTitle: line.productTitle, size: '', count: need, reason: 'the order line has no UK size' });
      continue;
    }

    const free = certs
      .filter((c) => isFree(c) && !taken.has(c.handle) && c.productId === line.productId && normaliseSize(c.size) === line.size)
      .sort(byPairNumber);
    for (const c of free.slice(0, need)) {
      taken.add(c.handle);
      picks.push(c);
    }
    const short = need - Math.min(need, free.length);
    if (short > 0) missing.push({ productTitle: line.productTitle, size: line.size, count: short, reason: 'no free tag in stock' });
  }
  return { picks, kept, missing };
}

/** One line per tag for the email, the order metafield and the log. */
export function packLines(tags, missing = []) {
  const out = tags.map((c) =>
    [c.serial, c.productTitle, normaliseSize(c.size) || c.size, c.pairNumber ? `No. ${formatPairNumber(c.pairNumber)}` : '']
      .filter(Boolean)
      .join(' · ')
  );
  for (const m of missing) {
    out.push(`NO TAG ${m.count > 1 ? `×${m.count} ` : ''}· ${[m.productTitle, m.size].filter(Boolean).join(' · ')} · ${m.reason}: assign by hand`);
  }
  return out;
}

/**
 * Work out what to do for every order.
 * @param orders [{ id, name, createdAt, cancelled, fulfilled, tags: string[], buyerName, lines }]
 * @param certs  all certificates (see pickTags)
 * @returns actions [{ order, kind: 'reserve'|'name'|'release'|'warn', reserve?, name?, release?, tagsAdd, tagsRemove, packText?, message }]
 */
export function planActions(orders, certs) {
  const byOrder = new Map();
  for (const c of certs) {
    if (!c.orderNumber) continue;
    if (!byOrder.has(c.orderNumber)) byOrder.set(c.orderNumber, []);
    byOrder.get(c.orderNumber).push(c);
  }
  // Pair numbers handed out in this run, so two new pairs of one model never get the same number.
  const entries = certs.map((c) => ({ handle: c.handle, group: c.group, pairNumber: c.pairNumber }));
  const reservedNow = new Set();
  const actions = [];

  for (const order of orders) {
    const tags = new Set(order.tags.map((t) => t.toLowerCase()));
    const mine = (byOrder.get(order.name) || []).filter((c) => !reservedNow.has(c.handle));

    if (order.cancelled) {
      const release = mine.filter((c) => !c.buyerName);
      const named = mine.filter((c) => c.buyerName);
      if (release.length) {
        actions.push({
          order,
          kind: 'release',
          release,
          tagsAdd: [TAG.released],
          tagsRemove: [TAG.reserved, ...release.map((c) => c.serial)],
          packText: `Released (order cancelled): ${release.map((c) => c.serial).join(', ')}`,
          message: `cancelled → released ${release.map((c) => c.serial).join(', ')}`,
        });
      }
      if (named.length && !tags.has(TAG.checkReturn)) {
        actions.push({
          order,
          kind: 'warn',
          tagsAdd: [TAG.checkReturn],
          tagsRemove: [],
          message: `cancelled, but ${named.map((c) => c.serial).join(', ')} already carries the buyer's name. If the pair comes back: npm run assign -- --serial ${named[0].serial} --clear`,
        });
      }
      continue;
    }

    let tagsOfOrder = mine;
    if (!tags.has(TAG.reserved)) {
      const { picks, kept, missing } = pickTags(certs, order.lines, mine, reservedNow);
      if (!picks.length && !kept.length && !missing.length) continue; // no shoes with tags in this order
      const reserve = picks.map((c) => {
        reservedNow.add(c.handle);
        if (c.pairNumber) return { ...c, orderNumber: order.name };
        const pairNumber = String(nextPairNumber(entries, c.group, c.handle));
        entries.push({ handle: c.handle, group: c.group, pairNumber });
        return { ...c, orderNumber: order.name, pairNumber, newPairNumber: true };
      });
      tagsOfOrder = [...kept, ...reserve];
      const lines = packLines(tagsOfOrder, missing);
      actions.push({
        order,
        kind: 'reserve',
        reserve,
        tags: tagsOfOrder,
        missing,
        tagsAdd: [TAG.reserved, ...tagsOfOrder.map((c) => c.serial), ...(missing.length ? [TAG.noTag] : [])],
        tagsRemove: [],
        packText: lines.join('\n'),
        message: lines.join(' | '),
      });
    }

    if (order.fulfilled && !tags.has(TAG.named)) {
      const name = tagsOfOrder.filter((c) => !c.buyerName);
      if (!name.length) continue;
      if (!order.buyerName) {
        if (tags.has(TAG.noName)) continue;
        actions.push({ order, kind: 'warn', tagsAdd: [TAG.noName], tagsRemove: [], message:`fulfilled, but the order has no customer name. Run: npm run assign -- --serial ${name[0].serial} --order ${order.name} --name "Full Name"` });
        continue;
      }
      actions.push({
        order,
        kind: 'name',
        name,
        tagsAdd: [TAG.named],
        tagsRemove: [],
        message: `fulfilled → ${order.buyerName} on ${name.map((c) => c.serial).join(', ')}`,
      });
    }
  }
  return actions;
}

/** One email per run, only when there is something to pack or check. Naming alone sends nothing. */
export function packingEmail(list) {
  const reserve = list.filter((a) => a.kind === 'reserve');
  const other = list.filter((a) => a.kind === 'release' || a.kind === 'warn');
  if (!reserve.length && !other.length) return null;

  const parts = [];
  if (reserve.length) {
    parts.push('PACK THESE PAIRS. Put the box whose sticker shows this serial in the parcel.\n');
    for (const a of reserve) {
      parts.push(`${a.order.name} · ${a.order.buyerName || 'no name on order'} · placed ${a.order.createdAt.slice(0, 10)}`);
      for (const line of a.packText.split('\n')) parts.push(`   ${line}`);
      parts.push('');
    }
    parts.push('Mark the order as fulfilled when it ships: the buyer\'s name then appears on the QR page automatically.');
  }
  if (other.length) {
    parts.push(`${reserve.length ? '\n' : ''}ALSO`);
    for (const a of other) parts.push(`   ${a.order.name}: ${a.message}`);
  }
  const missing = reserve.some((a) => a.missing.length);
  const subject = reserve.length
    ? `${missing ? '⚠ ' : ''}Pack ${reserve.map((a) => `${a.order.name} → ${a.tags.map((c) => c.serial).join(', ') || 'NO TAG'}`).join(' · ')}`
    : `EvlveX tags: ${other.map((a) => a.order.name).join(', ')} needs a check`;
  return { subject, text: parts.join('\n') + '\n' };
}
