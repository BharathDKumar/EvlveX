// Each pair's own chapter: pair number, artisan, finished date, pair note
// (docs/spec/brand-and-content.md §7, docs/spec/qr-tooling.md §3). Pure helpers, unit-tested.

export const PAIR_NOTE_MAX = 200;

/** Fields emptied by `assign --clear`. The pair's chapter (and its product) stay with the pair. */
export const CLEAR_FIELDS = ['buyer_name', 'size', 'purchase_date', 'personal_message', 'order_number'];

/**
 * Validate --artisan / --finished / --note / --pair-number.
 * Returns { fields: [{key, value}], errors: [string] }. Only flags that were passed produce fields.
 */
export function chapterFields({ artisan, finished, note, pairNumber } = {}) {
  const fields = [];
  const errors = [];

  if (artisan !== undefined) fields.push({ key: 'artisan', value: artisan.trim() });

  if (finished !== undefined) {
    const value = finished.trim();
    if (value && !isIsoDate(value)) errors.push(`--finished must be a date like 2026-11-03 (got "${finished}").`);
    else fields.push({ key: 'finished_on', value });
  }

  if (note !== undefined) {
    const value = note.trim();
    if ([...value].length > PAIR_NOTE_MAX) errors.push(`--note is ${[...value].length} characters; the limit is ${PAIR_NOTE_MAX}.`);
    else fields.push({ key: 'pair_note', value });
  }

  if (pairNumber !== undefined) {
    const n = parsePositiveInt(pairNumber);
    if (n === null) errors.push(`--pair-number must be a whole number of 1 or more (got "${pairNumber}").`);
    else fields.push({ key: 'pair_number', value: String(n) });
  }

  return { fields, errors };
}

/**
 * Next pair number for a model: highest existing number in the same group, plus 1.
 * `entries` are [{ handle, group, pairNumber }]; `group` is the model's story id, or the product id
 * when the product has no story. The certificate being assigned (`selfHandle`) is ignored.
 */
export function nextPairNumber(entries, group, selfHandle) {
  let max = 0;
  for (const e of entries) {
    if (e.handle === selfHandle || e.group !== group) continue;
    const n = parsePositiveInt(e.pairNumber);
    if (n !== null && n > max) max = n;
  }
  return max + 1;
}

/** Display format used on the certificate: 42 → "0042". */
export const formatPairNumber = (n) => String(n).padStart(4, '0');

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function parsePositiveInt(value) {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (!/^\d+$/.test(s)) return null;
  const n = Number.parseInt(s, 10);
  return n >= 1 && Number.isSafeInteger(n) ? n : null;
}
