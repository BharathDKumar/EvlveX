import test from 'node:test';
import assert from 'node:assert/strict';
import { ALPHABET, newSerial, normaliseSerial, serialToHandle } from '../src/serial.js';

test('newSerial has the EVX-XXXXXXXX Crockford format', () => {
  for (let i = 0; i < 2000; i++) {
    const s = newSerial();
    assert.match(s, /^EVX-[0-9A-HJKMNP-TV-Z]{8}$/);
  }
});

test('newSerial is effectively unique', () => {
  const set = new Set(Array.from({ length: 20000 }, newSerial));
  assert.equal(set.size, 20000);
});

test('alphabet excludes ambiguous letters', () => {
  assert.equal(ALPHABET.length, 32);
  for (const ch of 'ILOU') assert.ok(!ALPHABET.includes(ch));
});

test('normaliseSerial accepts what people type or scan', () => {
  assert.equal(normaliseSerial('EVX-7F3K9QMD'), 'EVX-7F3K9QMD');
  assert.equal(normaliseSerial(' evx-7f3k9qmd '), 'EVX-7F3K9QMD');
  assert.equal(normaliseSerial('evx7f3k9qmd'), 'EVX-7F3K9QMD');
  assert.equal(normaliseSerial('7f3k9qmd'), 'EVX-7F3K9QMD');
  assert.equal(normaliseSerial('EVX-7F3K 9QMD'), 'EVX-7F3K9QMD');
  assert.equal(normaliseSerial('EVX-O1LI2345'), 'EVX-01112345'); // O→0, I/L→1
  assert.equal(normaliseSerial('https://evlvex.com/pages/authentic/evx-7f3k9qmd'), 'EVX-7F3K9QMD');
  assert.equal(normaliseSerial('EVX-123'), null);
  assert.equal(normaliseSerial('EVX-7F3K9QMU'), null); // U is not Crockford
  assert.equal(normaliseSerial(''), null);
});

test('handle is the lowercase serial', () => {
  assert.equal(serialToHandle('EVX-7F3K9QMD'), 'evx-7f3k9qmd');
});
