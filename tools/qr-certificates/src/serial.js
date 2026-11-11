// Serial numbers: "EVX-" + 8 Crockford Base32 characters (no I, L, O, U).
// 32^8 ≈ 1.1 trillion combinations, so certificate URLs cannot be guessed.
import { randomBytes } from 'node:crypto';

export const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
export const PREFIX = 'EVX-';
const BODY_LENGTH = 8;
const SERIAL_RE = /^EVX-[0-9A-HJKMNP-TV-Z]{8}$/;

export function newSerial() {
  // 256 is a multiple of 32, so `byte & 31` is unbiased.
  const bytes = randomBytes(BODY_LENGTH);
  let body = '';
  for (const byte of bytes) body += ALPHABET[byte & 31];
  return PREFIX + body;
}

/**
 * Normalise what a person typed or scanned: case, spaces, missing prefix,
 * and Crockford look-alikes (O→0, I/L→1). Returns null if it can't be a serial.
 */
export function normaliseSerial(input) {
  let v = String(input || '').trim().toUpperCase().replace(/[\s_.]/g, '');
  const fromUrl = v.match(/\/(EVX-?[0-9A-Z]{8})\/?$/);
  if (fromUrl) v = fromUrl[1];
  if (/^[0-9A-Z]{8}$/.test(v)) v = 'EVX' + v;
  let body = v.replace(/^EVX-?/, '');
  body = body.replace(/O/g, '0').replace(/[IL]/g, '1');
  const serial = PREFIX + body;
  return SERIAL_RE.test(serial) ? serial : null;
}

export const serialToHandle = (serial) => serial.toLowerCase();
