import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesOrderName } from '../src/orders.js';

test('order number matches with or without the store prefix', () => {
  for (const input of ['EVX-1003', 'evx-1003', '1003', '#1003', ' 1003 ']) assert.ok(matchesOrderName('EVX-1003', input), input);
  for (const input of ['1001', '#1001']) assert.ok(matchesOrderName('#1001', input), input);
  assert.ok(!matchesOrderName('EVX-1003', '100'));
  assert.ok(!matchesOrderName('EVX-1003', '11003'));
  assert.ok(!matchesOrderName('EVX-1003', 'ABC-1003'));
});
