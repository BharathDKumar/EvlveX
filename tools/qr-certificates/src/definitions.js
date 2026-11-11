// Shopify data definitions used by EvlveX (docs/spec/qr-certificates.md §5).
// Pure data + helpers, no API calls, so they can be unit-tested.

const imageOnly = [{ name: 'file_type_options', value: '["Image"]' }];

/** `evlvex_certificate`: one entry per pair. */
export const CERTIFICATE_FIELDS = [
  { key: 'serial', name: 'Serial', type: 'single_line_text_field', required: true, description: 'Printed under the QR code, e.g. EVX-7F3K9QMD.' },
  { key: 'buyer_name', name: 'Buyer name', type: 'single_line_text_field', description: 'Full name shown on the certificate page. Leave blank until the pair is sold.' },
  { key: 'product', name: 'Product', type: 'product_reference' },
  { key: 'size', name: 'Size', type: 'single_line_text_field' },
  { key: 'purchase_date', name: 'Purchase date', type: 'date' },
  { key: 'personal_message', name: 'Personal message', type: 'multi_line_text_field', description: 'Optional dedication, e.g. for gifts. Shown on the page.' },
  { key: 'pair_number', name: 'Pair number', type: 'number_integer', description: 'Shown as "Pair No. 0042". Sequential per model.', validations: [{ name: 'min', value: '1' }] },
  { key: 'artisan', name: 'Artisan', type: 'single_line_text_field', description: 'Who finished the pair: first name and initial, only with their consent. Shown on the page.' },
  { key: 'finished_on', name: 'Finished on', type: 'date', description: 'Date the pair left the bench (from the workshop card).' },
  { key: 'pair_note', name: 'Pair note', type: 'multi_line_text_field', description: 'One true, specific line about this pair (≤ 200 characters). Shown on the page.', validations: [{ name: 'max', value: '200' }] },
  { key: 'order_number', name: 'Order number', type: 'single_line_text_field', description: 'Internal. Never shown on the page.' },
  { key: 'batch', name: 'Batch', type: 'single_line_text_field', description: 'Internal production batch.' },
];

/** `evlvex_story`: one entry per model. */
export const STORY_FIELDS = [
  { key: 'title', name: 'Title', type: 'single_line_text_field', required: true, description: 'e.g. The Last Set at Dusk' },
  { key: 'chapter', name: 'Chapter', type: 'number_integer', required: true, description: 'Release order of the model; shown as "Chapter 01".', validations: [{ name: 'min', value: '1' }] },
  { key: 'model_name', name: 'Model', type: 'single_line_text_field', required: true, description: 'e.g. Court 01' },
  { key: 'setting', name: 'Setting', type: 'single_line_text_field', description: 'One line that sets the scene, e.g. "A seaside club, late summer."' },
  { key: 'excerpt', name: 'Excerpt', type: 'multi_line_text_field', description: 'Shown on product pages, story cards and certificates (≤ 280 characters).', validations: [{ name: 'max', value: '280' }] },
  { key: 'body', name: 'Story', type: 'rich_text_field', description: 'The full story, 90–150 words.' },
  { key: 'signature_detail', name: 'Signature detail', type: 'multi_line_text_field', description: 'Which part of the shoe carries the story.' },
  { key: 'hero_image', name: 'Hero plate', type: 'file_reference', validations: imageOnly },
  { key: 'gallery', name: 'Plates', type: 'list.file_reference', description: '2–4 further story plates.', validations: imageOnly },
  { key: 'products', name: 'Products', type: 'list.product_reference', description: 'Every product (colorway) of this model.' },
];

export function certificateDefinition({ type, urlPrefix }) {
  return {
    name: 'EvlveX Certificate',
    type,
    description: `One entry per pair. Page: /pages/${urlPrefix}/<serial>. See docs/spec/qr-certificates.md.`,
    displayNameKey: 'serial',
    access: { storefront: 'PUBLIC_READ' },
    capabilities: {
      publishable: { enabled: true },
      renderable: { enabled: true, data: { metaTitleKey: 'serial' } },
      onlineStore: { enabled: true, data: { urlHandle: urlPrefix } },
    },
    fieldDefinitions: CERTIFICATE_FIELDS,
  };
}

export function storyDefinition({ type, urlPrefix }) {
  return {
    name: 'EvlveX Story',
    type,
    description: `One entry per model. Page: /pages/${urlPrefix}/<handle>. See docs/spec/qr-certificates.md.`,
    displayNameKey: 'title',
    access: { storefront: 'PUBLIC_READ' },
    capabilities: {
      publishable: { enabled: true },
      renderable: { enabled: true, data: { metaTitleKey: 'title', metaDescriptionKey: 'excerpt' } },
      onlineStore: { enabled: true, data: { urlHandle: urlPrefix } },
    },
    fieldDefinitions: STORY_FIELDS,
  };
}

/**
 * Compare an existing definition (as returned by `metaobjectDefinitionByType`) with the wanted one.
 * Returns fields that can be added automatically, and problems that need a human.
 */
export function diffDefinition(existing, wanted) {
  const missing = [];
  const problems = [];
  for (const f of wanted.fieldDefinitions) {
    const found = existing.fieldDefinitions.find((d) => d.key === f.key);
    if (!found) missing.push(f);
    else if (found.type.name !== f.type) problems.push(`field "${f.key}" is ${found.type.name}, expected ${f.type}`);
  }
  const caps = existing.capabilities || {};
  if (!caps.publishable?.enabled) problems.push('"Active/Draft status" (publishable) capability is off');
  const urlHandle = wanted.capabilities.onlineStore.data.urlHandle;
  if (!caps.onlineStore?.enabled) problems.push('Online Store capability is off');
  else if (caps.onlineStore.data?.urlHandle !== urlHandle) {
    problems.push(`Online Store URL handle is "${caps.onlineStore.data?.urlHandle}", expected "${urlHandle}"`);
  }
  return { missing, problems };
}
