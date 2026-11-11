// npm run setup
// Creates the `evlvex_certificate` metaobject definition with Online Store pages at
// /pages/<URL_PREFIX>/<handle>. Safe to re-run: an existing definition is only checked.
import { config, fail } from './config.js';
import { assertNoUserErrors, gql } from './shopify.js';

export const FIELDS = [
  { key: 'serial', name: 'Serial', type: 'single_line_text_field', required: true, description: 'Printed under the QR code, e.g. EVX-7F3K9QMD.' },
  { key: 'buyer_name', name: 'Buyer name', type: 'single_line_text_field', description: 'Full name shown on the certificate page. Leave blank until the pair is sold.' },
  { key: 'product', name: 'Product', type: 'product_reference' },
  { key: 'size', name: 'Size', type: 'single_line_text_field' },
  { key: 'purchase_date', name: 'Purchase date', type: 'date' },
  { key: 'personal_message', name: 'Personal message', type: 'multi_line_text_field', description: 'Optional dedication, e.g. for gifts. Shown on the page.' },
  { key: 'order_number', name: 'Order number', type: 'single_line_text_field', description: 'Internal. Never shown on the page.' },
  { key: 'batch', name: 'Batch', type: 'single_line_text_field', description: 'Internal production batch.' },
];

const existing = await gql(
  `query($type: String!) {
    metaobjectDefinitionByType(type: $type) {
      id name
      fieldDefinitions { key type { name } }
      capabilities { onlineStore { enabled data { urlHandle } } publishable { enabled } }
    }
  }`,
  { type: config.type }
);

const def = existing.metaobjectDefinitionByType;
if (def) {
  console.log(`Definition "${config.type}" already exists (${def.name}). Checking it…`);
  const problems = [];
  for (const f of FIELDS) {
    const found = def.fieldDefinitions.find((d) => d.key === f.key);
    if (!found) problems.push(`missing field "${f.key}" (${f.type})`);
    else if (found.type.name !== f.type) problems.push(`field "${f.key}" is ${found.type.name}, expected ${f.type}`);
  }
  if (!def.capabilities.publishable?.enabled) problems.push('"Active/Draft status" (publishable) capability is off');
  if (!def.capabilities.onlineStore?.enabled) problems.push('Online Store capability is off');
  else if (def.capabilities.onlineStore.data?.urlHandle !== config.urlPrefix) {
    problems.push(`Online Store URL handle is "${def.capabilities.onlineStore.data?.urlHandle}", but URL_PREFIX is "${config.urlPrefix}"`);
  }
  if (problems.length) fail(`Fix in Admin → Settings → Custom data → Metaobjects:\n  - ${problems.join('\n  - ')}`);
  console.log('✔ Definition looks correct.');
  process.exit(0);
}

const created = await gql(
  `mutation($definition: MetaobjectDefinitionCreateInput!) {
    metaobjectDefinitionCreate(definition: $definition) {
      metaobjectDefinition { id type }
      userErrors { field message code }
    }
  }`,
  {
    definition: {
      name: 'EvlveX Certificate',
      type: config.type,
      description: 'One entry per pair. Page: /pages/' + config.urlPrefix + '/<serial>. See docs/SPEC.md §4.',
      displayNameKey: 'serial',
      access: { storefront: 'PUBLIC_READ' },
      capabilities: {
        publishable: { enabled: true },
        onlineStore: { enabled: true, data: { urlHandle: config.urlPrefix } },
      },
      fieldDefinitions: FIELDS,
    },
  }
);
assertNoUserErrors(created.metaobjectDefinitionCreate, 'Creating the definition');

console.log(`✔ Created metaobject definition "${config.type}".`);
console.log(`  Pages will live at https://${config.publicDomain || '<your-domain>'}/pages/${config.urlPrefix}/<serial>`);
console.log('  Next: in Admin → Settings → Custom data → Metaobjects → EvlveX Certificate,');
console.log('  confirm the Online Store template is "evlvex_certificate" (the theme provides it).');
