import test from 'node:test';
import assert from 'node:assert/strict';
import { TAG, isFree, lineSize, packLines, packingEmail, pickTags, planActions } from '../src/pack.js';

const GRIND = 'gid://shopify/Product/1';
const FRESH = 'gid://shopify/Product/2';
const CARE_KIT = 'gid://shopify/Product/3';
const STORY_GRIND = 'gid://shopify/Metaobject/10';

let n = 0;
const cert = (over = {}) => {
  n++;
  const handle = over.handle || `evx-${String(n).padStart(8, '0')}`;
  return {
    id: `gid://shopify/Metaobject/${1000 + n}`,
    handle,
    serial: handle.toUpperCase(),
    productId: GRIND,
    productTitle: 'The Silent Grind',
    size: 'UK 8',
    buyerName: '',
    orderNumber: '',
    pairNumber: null,
    group: STORY_GRIND,
    ...over,
  };
};
const line = (over = {}) => ({ productId: GRIND, productTitle: 'The Silent Grind', quantity: 1, size: 'UK 8', ...over });
const order = (over = {}) => ({
  id: 'gid://shopify/Order/1',
  name: '#1001',
  createdAt: '2026-11-27T10:00:00Z',
  cancelled: false,
  fulfilled: false,
  tags: [],
  buyerName: 'Priya Sharma',
  lines: [line()],
  ...over,
});

test('isFree: no buyer and no order', () => {
  assert.equal(isFree(cert()), true);
  assert.equal(isFree(cert({ orderNumber: '#1000' })), false);
  assert.equal(isFree(cert({ buyerName: 'A B' })), false);
});

test('lineSize reads the Size option, then the variant title', () => {
  assert.equal(lineSize({ variant: { selectedOptions: [{ name: 'Size', value: '8' }] } }), 'UK 8');
  assert.equal(lineSize({ variant: { selectedOptions: [{ name: 'Color', value: 'Black' }] }, variantTitle: 'UK 9' }), 'UK 9');
  assert.equal(lineSize({ variant: null, variantTitle: 'Default Title' }), null);
});

test('pickTags takes the lowest pair number of the same product and size', () => {
  const certs = [
    cert({ handle: 'evx-c', pairNumber: '12' }),
    cert({ handle: 'evx-a', pairNumber: '3' }),
    cert({ handle: 'evx-b', pairNumber: '2', orderNumber: '#999' }), // reserved
    cert({ handle: 'evx-d', pairNumber: '1', buyerName: 'X Y' }), // sold
    cert({ handle: 'evx-e', pairNumber: '1', size: 'UK 9' }), // other size
    cert({ handle: 'evx-f', pairNumber: '1', productId: FRESH }), // other model
  ];
  const { picks, missing } = pickTags(certs, [line()]);
  assert.deepEqual(picks.map((c) => c.handle), ['evx-a']);
  assert.equal(missing.length, 0);
});

test('pickTags matches "8" and "UK 8", and gives quantity 2 two different tags', () => {
  const certs = [cert({ handle: 'evx-a', size: '8', pairNumber: '1' }), cert({ handle: 'evx-b', size: 'uk8', pairNumber: '2' })];
  const { picks } = pickTags(certs, [line({ quantity: 2 })]);
  assert.deepEqual(picks.map((c) => c.handle), ['evx-a', 'evx-b']);
});

test('pickTags flags missing stock and ignores products that have no tags', () => {
  const certs = [cert({ handle: 'evx-a' })];
  const { picks, missing } = pickTags(certs, [line({ quantity: 3 }), line({ productId: CARE_KIT, productTitle: 'Care kit', size: null })]);
  assert.equal(picks.length, 1);
  assert.deepEqual(missing, [{ productTitle: 'The Silent Grind', size: 'UK 8', count: 2, reason: 'no free tag in stock' }]);
});

test('pickTags reuses tags already reserved for the order (interrupted run)', () => {
  const mine = cert({ handle: 'evx-mine', orderNumber: '#1001' });
  const certs = [mine, cert({ handle: 'evx-other' })];
  const { picks, kept } = pickTags(certs, [line()], [mine]);
  assert.equal(picks.length, 0);
  assert.deepEqual(kept.map((c) => c.handle), ['evx-mine']);
});

test('packLines formats serial, model, size and pair number', () => {
  assert.deepEqual(packLines([cert({ serial: 'EVX-7F3K9QMD', pairNumber: '12' })], [{ productTitle: 'A Fresh Start', size: 'UK 10', count: 1, reason: 'no free tag in stock' }]), [
    'EVX-7F3K9QMD · The Silent Grind · UK 8 · No. 0012',
    'NO TAG · A Fresh Start · UK 10 · no free tag in stock: assign by hand',
  ]);
});

test('planActions reserves for a new order and tags it', () => {
  const certs = [cert({ handle: 'evx-a', serial: 'EVX-A', pairNumber: '5' })];
  const [a] = planActions([order()], certs);
  assert.equal(a.kind, 'reserve');
  assert.deepEqual(a.reserve.map((c) => c.handle), ['evx-a']);
  assert.equal(a.reserve[0].orderNumber, '#1001');
  assert.deepEqual(a.tagsAdd, [TAG.reserved, 'EVX-A']);
});

test('planActions never gives one tag to two orders in the same run', () => {
  const certs = [cert({ handle: 'evx-a', pairNumber: '1' }), cert({ handle: 'evx-b', pairNumber: '2' })];
  const actions = planActions([order(), order({ id: 'gid://shopify/Order/2', name: '#1002' }), order({ id: 'gid://shopify/Order/3', name: '#1003' })], certs);
  assert.deepEqual(actions.map((a) => a.reserve.map((c) => c.handle)), [['evx-a'], ['evx-b'], []]);
  assert.ok(actions[2].tagsAdd.includes(TAG.noTag));
});

test('planActions numbers tags that have no pair number, continuing per model', () => {
  const certs = [cert({ handle: 'evx-old', pairNumber: '7', buyerName: 'Someone' }), cert({ handle: 'evx-a' }), cert({ handle: 'evx-b' })];
  const [a] = planActions([order({ lines: [line({ quantity: 2 })] })], certs);
  assert.deepEqual(a.reserve.map((c) => [c.pairNumber, c.newPairNumber]), [['8', true], ['9', true]]);
});

test('planActions skips orders that are already reserved, and orders without tagged shoes', () => {
  const certs = [cert({ handle: 'evx-a', orderNumber: '#1001' }), cert({ handle: 'evx-b' })];
  assert.deepEqual(planActions([order({ tags: [TAG.reserved] })], certs), []);
  assert.deepEqual(planActions([order({ lines: [line({ productId: CARE_KIT })] })], certs), []);
});

test('planActions names reserved tags once the order is fulfilled', () => {
  const certs = [cert({ handle: 'evx-a', orderNumber: '#1001' })];
  const [a] = planActions([order({ tags: [TAG.reserved, 'EVX-A'], fulfilled: true })], certs);
  assert.equal(a.kind, 'name');
  assert.deepEqual(a.name.map((c) => c.handle), ['evx-a']);
  assert.deepEqual(planActions([order({ tags: [TAG.reserved, TAG.named], fulfilled: true })], certs), []);
});

test('planActions reserves and names in one run when the order was fulfilled before the job saw it', () => {
  const certs = [cert({ handle: 'evx-a' })];
  const kinds = planActions([order({ fulfilled: true })], certs).map((a) => a.kind);
  assert.deepEqual(kinds, ['reserve', 'name']);
});

test('planActions warns once when a fulfilled order has no customer name', () => {
  const certs = [cert({ handle: 'evx-a', orderNumber: '#1001' })];
  const [a] = planActions([order({ tags: [TAG.reserved], fulfilled: true, buyerName: '' })], certs);
  assert.equal(a.kind, 'warn');
  assert.deepEqual(a.tagsAdd, [TAG.noName]);
  assert.deepEqual(planActions([order({ tags: [TAG.reserved, TAG.noName], fulfilled: true, buyerName: '' })], certs), []);
});

test('planActions releases unnamed tags of a cancelled order, and only warns about named ones', () => {
  const certs = [cert({ handle: 'evx-a', serial: 'EVX-A', orderNumber: '#1001' }), cert({ handle: 'evx-b', serial: 'EVX-B', orderNumber: '#1001', buyerName: 'Priya Sharma' })];
  const actions = planActions([order({ cancelled: true, tags: [TAG.reserved, 'EVX-A', 'EVX-B'] })], certs);
  assert.deepEqual(actions.map((a) => a.kind), ['release', 'warn']);
  assert.deepEqual(actions[0].release.map((c) => c.handle), ['evx-a']);
  assert.deepEqual(actions[0].tagsRemove, [TAG.reserved, 'EVX-A']);
  // After the release the tag is free, so nothing happens on the next run.
  const after = [cert({ handle: 'evx-a' }), { ...certs[1] }];
  assert.deepEqual(planActions([order({ cancelled: true, tags: [TAG.released, TAG.checkReturn, 'EVX-B'] })], after), []);
});

test('packingEmail lists what to pack, flags missing tags, and stays quiet when only naming', () => {
  const certs = [cert({ handle: 'evx-a', serial: 'EVX-A', pairNumber: '5' })];
  const actions = planActions([order(), order({ id: 'gid://shopify/Order/2', name: '#1002' })], certs);
  const email = packingEmail(actions);
  assert.equal(email.subject, '⚠ Pack #1001 → EVX-A · #1002 → NO TAG');
  assert.match(email.text, /#1001 · Priya Sharma · placed 2026-11-27\n {3}EVX-A · The Silent Grind · UK 8 · No\. 0005/);
  assert.match(email.text, /NO TAG · The Silent Grind · UK 8 · no free tag in stock: assign by hand/);

  const naming = planActions([order({ tags: [TAG.reserved], fulfilled: true })], [cert({ orderNumber: '#1001' })]);
  assert.equal(naming[0].kind, 'name');
  assert.equal(packingEmail(naming), null);
});
