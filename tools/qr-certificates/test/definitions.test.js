import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CERTIFICATE_FIELDS,
  STORY_FIELDS,
  certificateDefinition,
  diffDefinition,
  storyDefinition,
} from '../src/definitions.js';

const asExisting = (def, { drop = [], retype = {}, urlHandle } = {}) => ({
  fieldDefinitions: def.fieldDefinitions
    .filter((f) => !drop.includes(f.key))
    .map((f) => ({ key: f.key, type: { name: retype[f.key] || f.type } })),
  capabilities: {
    publishable: { enabled: true },
    onlineStore: { enabled: true, data: { urlHandle: urlHandle ?? def.capabilities.onlineStore.data.urlHandle } },
  },
});

test('certificate definition has the v1.1 pair chapter fields', () => {
  const keys = CERTIFICATE_FIELDS.map((f) => f.key);
  for (const k of ['serial', 'buyer_name', 'product', 'pair_number', 'artisan', 'finished_on', 'pair_note', 'order_number', 'batch']) {
    assert.ok(keys.includes(k), k);
  }
  assert.equal(CERTIFICATE_FIELDS.find((f) => f.key === 'pair_number').type, 'number_integer');
});

test('story definition matches the spec', () => {
  const def = storyDefinition({ type: 'evlvex_story', urlPrefix: 'stories' });
  assert.equal(def.displayNameKey, 'title');
  assert.equal(def.capabilities.onlineStore.data.urlHandle, 'stories');
  assert.deepEqual(def.capabilities.renderable.data, { metaTitleKey: 'title', metaDescriptionKey: 'excerpt' });
  assert.deepEqual(
    STORY_FIELDS.map((f) => f.key),
    ['title', 'chapter', 'model_name', 'setting', 'excerpt', 'body', 'signature_detail', 'hero_image', 'gallery', 'products']
  );
});

test('a v1.0 certificate definition only needs the new fields added', () => {
  const wanted = certificateDefinition({ type: 'evlvex_certificate', urlPrefix: 'authentic' });
  const v10 = asExisting(wanted, { drop: ['pair_number', 'artisan', 'finished_on', 'pair_note'] });
  const { missing, problems } = diffDefinition(v10, wanted);
  assert.deepEqual(problems, []);
  assert.deepEqual(missing.map((f) => f.key), ['pair_number', 'artisan', 'finished_on', 'pair_note']);
});

test('a matching definition needs nothing', () => {
  const wanted = storyDefinition({ type: 'evlvex_story', urlPrefix: 'stories' });
  assert.deepEqual(diffDefinition(asExisting(wanted), wanted), { missing: [], problems: [] });
});

test('wrong field types and URL handles are reported, not changed', () => {
  const wanted = certificateDefinition({ type: 'evlvex_certificate', urlPrefix: 'authentic' });
  const existing = asExisting(wanted, { retype: { pair_number: 'single_line_text_field' }, urlHandle: 'certificate' });
  const { missing, problems } = diffDefinition(existing, wanted);
  assert.deepEqual(missing, []);
  assert.equal(problems.length, 2);
});
