import { test } from 'node:test';
import assert from 'node:assert/strict';
import { expandPairs, groupLabel, normaliseSize, parseStockList } from '../src/stocklist.js';

test('normaliseSize accepts 8, UK 8, uk8 and half sizes', () => {
  assert.equal(normaliseSize('8'), 'UK 8');
  assert.equal(normaliseSize('UK 10'), 'UK 10');
  assert.equal(normaliseSize('uk7'), 'UK 7');
  assert.equal(normaliseSize('8.5'), 'UK 8.5');
  assert.equal(normaliseSize('EU 42'), null);
  assert.equal(normaliseSize(''), null);
});

test('parses a list pasted from a spreadsheet (tabs and spaces)', () => {
  const text = `Type                color       Size       Count
The Silent Grind  \tBlack\t\t  10            14
A Fresh Start     \tOff-White\t\t   6             2`;
  const { rows, errors } = parseStockList(text);
  assert.deepEqual(errors, []);
  assert.deepEqual(rows.map(({ line, ...r }) => r), [
    { product: 'The Silent Grind', color: 'Black', size: 'UK 10', count: 14 },
    { product: 'A Fresh Start', color: 'Off-White', size: 'UK 6', count: 2 },
  ]);
});

test('parses CSV with optional chapter columns and quoted cells', () => {
  const text = 'product,size,qty,artisan,note\n"The Silent Grind",8,2,Ravi K.,"Hide lot 12, fine grain"';
  const { rows, errors } = parseStockList(text);
  assert.deepEqual(errors, []);
  assert.equal(rows[0].count, 2);
  assert.equal(rows[0].artisan, 'Ravi K.');
  assert.equal(rows[0].note, 'Hide lot 12, fine grain');
});

test('reports bad rows and a missing header', () => {
  assert.match(parseStockList('colour,count\nBlack,2').errors[0], /product column/);
  const { rows, errors } = parseStockList('product,size,count\nA Fresh Start,EU 42,2\n,8,1\nA Fresh Start,8,zero');
  assert.equal(rows.length, 0);
  assert.equal(errors.length, 3);
});

test('expandPairs makes one entry per pair in list order; groupLabel', () => {
  const pairs = expandPairs([
    { product: 'A', color: 'Black', size: 'UK 8', count: 2, line: 2 },
    { product: 'B', color: '', size: 'UK 7', count: 1, line: 3 },
  ]);
  assert.equal(pairs.length, 3);
  assert.deepEqual(pairs.map(groupLabel), ['A · Black · UK 8', 'A · Black · UK 8', 'B · UK 7']);
});
