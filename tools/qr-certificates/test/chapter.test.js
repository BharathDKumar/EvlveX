import test from 'node:test';
import assert from 'node:assert/strict';
import { CLEAR_FIELDS, chapterFields, formatPairNumber, nextPairNumber } from '../src/chapter.js';

const STORY_A = 'gid://shopify/Metaobject/1';
const STORY_B = 'gid://shopify/Metaobject/2';
const PRODUCT_X = 'gid://shopify/Product/9';

test('nextPairNumber continues from the highest number in the same model', () => {
  const entries = [
    { handle: 'evx-a', group: STORY_A, pairNumber: '3' },
    { handle: 'evx-b', group: STORY_A, pairNumber: '12' },
    { handle: 'evx-c', group: STORY_B, pairNumber: '40' },
    { handle: 'evx-d', group: STORY_A, pairNumber: null },
    { handle: 'evx-e', group: null, pairNumber: null },
  ];
  assert.equal(nextPairNumber(entries, STORY_A, 'evx-new'), 13);
  assert.equal(nextPairNumber(entries, STORY_B, 'evx-new'), 41);
});

test('nextPairNumber starts at 1 for a new model and ignores the pair being assigned', () => {
  assert.equal(nextPairNumber([], STORY_A, 'evx-new'), 1);
  assert.equal(nextPairNumber([{ handle: 'evx-self', group: STORY_A, pairNumber: '7' }], STORY_A, 'evx-self'), 1);
  assert.equal(nextPairNumber([{ handle: 'evx-a', group: PRODUCT_X, pairNumber: '2' }], PRODUCT_X, 'evx-new'), 3);
});

test('nextPairNumber ignores invalid stored values', () => {
  const entries = [
    { handle: 'a', group: STORY_A, pairNumber: 'abc' },
    { handle: 'b', group: STORY_A, pairNumber: '-4' },
    { handle: 'c', group: STORY_A, pairNumber: '0' },
    { handle: 'd', group: STORY_A, pairNumber: '5' },
  ];
  assert.equal(nextPairNumber(entries, STORY_A, 'x'), 6);
});

test('chapterFields only returns the flags that were passed', () => {
  assert.deepEqual(chapterFields({}), { fields: [], errors: [] });
  const { fields, errors } = chapterFields({ artisan: ' Marco R. ', finished: '2026-11-03', note: 'Hide lot 12.', pairNumber: '042' });
  assert.deepEqual(errors, []);
  assert.deepEqual(fields, [
    { key: 'artisan', value: 'Marco R.' },
    { key: 'finished_on', value: '2026-11-03' },
    { key: 'pair_note', value: 'Hide lot 12.' },
    { key: 'pair_number', value: '42' },
  ]);
});

test('chapterFields rejects bad dates, long notes and bad pair numbers', () => {
  assert.equal(chapterFields({ finished: '03/11/2026' }).errors.length, 1);
  assert.equal(chapterFields({ finished: '2026-02-30' }).errors.length, 1);
  assert.equal(chapterFields({ note: 'x'.repeat(201) }).errors.length, 1);
  assert.equal(chapterFields({ note: 'x'.repeat(200) }).errors.length, 0);
  assert.equal(chapterFields({ pairNumber: '0' }).errors.length, 1);
  assert.equal(chapterFields({ pairNumber: '4.5' }).errors.length, 1);
  assert.equal(chapterFields({ pairNumber: 'ten' }).errors.length, 1);
});

test('chapterFields allows clearing a value with an empty string', () => {
  assert.deepEqual(chapterFields({ artisan: '', finished: '', note: '' }).fields, [
    { key: 'artisan', value: '' },
    { key: 'finished_on', value: '' },
    { key: 'pair_note', value: '' },
  ]);
});

test('--clear keeps the pair chapter and product', () => {
  for (const kept of ['product', 'pair_number', 'artisan', 'finished_on', 'pair_note', 'serial', 'batch']) {
    assert.ok(!CLEAR_FIELDS.includes(kept), `${kept} must not be cleared`);
  }
  for (const cleared of ['buyer_name', 'size', 'purchase_date', 'personal_message', 'order_number']) {
    assert.ok(CLEAR_FIELDS.includes(cleared), `${cleared} must be cleared`);
  }
});

test('formatPairNumber pads to four digits', () => {
  assert.equal(formatPairNumber(42), '0042');
  assert.equal(formatPairNumber('7'), '0007');
  assert.equal(formatPairNumber(12345), '12345');
});
