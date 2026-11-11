// npm run setup
// Creates, or checks and completes, everything EvlveX stores in Shopify (docs/spec/qr-certificates.md §5):
//   1. `evlvex_certificate` metaobject definition  → /pages/<URL_PREFIX>/<serial>
//   2. `evlvex_story` metaobject definition        → /pages/stories/<handle>
//   3. `evlvex.story` product metafield            → links each product to its story
// Safe to re-run: existing definitions are checked, and missing fields are added.
import { config, fail } from './config.js';
import { certificateDefinition, diffDefinition, storyDefinition } from './definitions.js';
import { assertNoUserErrors, gql } from './shopify.js';

await ensureMetaobjectDefinition(certificateDefinition({ type: config.type, urlPrefix: config.urlPrefix }));
const story = await ensureMetaobjectDefinition(
  storyDefinition({ type: config.storyType, urlPrefix: config.storyUrlPrefix })
);
await ensureProductStoryMetafield(story.id);

console.log(`
✔ Setup complete.
  Certificates: https://${config.publicDomain || '<your-domain>'}/pages/${config.urlPrefix}/<serial>
  Stories:      https://${config.publicDomain || '<your-domain>'}/pages/${config.storyUrlPrefix}/<story-handle>
  Next: Admin → Settings → Custom data → Metaobjects: confirm the Online Store templates are
  "evlvex_certificate" and "evlvex_story" (the theme provides both), then add the story entries.`);

async function ensureMetaobjectDefinition(wanted) {
  const data = await gql(
    `query($type: String!) {
      metaobjectDefinitionByType(type: $type) {
        id name
        fieldDefinitions { key type { name } }
        capabilities { onlineStore { enabled data { urlHandle } } publishable { enabled } }
      }
    }`,
    { type: wanted.type }
  );
  const existing = data.metaobjectDefinitionByType;

  if (!existing) {
    const created = await gql(
      `mutation($definition: MetaobjectDefinitionCreateInput!) {
        metaobjectDefinitionCreate(definition: $definition) {
          metaobjectDefinition { id type }
          userErrors { field message code }
        }
      }`,
      { definition: wanted }
    );
    assertNoUserErrors(created.metaobjectDefinitionCreate, `Creating "${wanted.type}"`);
    console.log(`✔ Created metaobject definition "${wanted.type}" (${wanted.name}).`);
    return created.metaobjectDefinitionCreate.metaobjectDefinition;
  }

  console.log(`Definition "${wanted.type}" already exists (${existing.name}). Checking it…`);
  const { missing, problems } = diffDefinition(existing, wanted);
  if (problems.length) {
    fail(`Fix "${wanted.type}" in Admin → Settings → Custom data → Metaobjects:\n  - ${problems.join('\n  - ')}`);
  }

  if (missing.length) {
    const updated = await gql(
      `mutation($id: ID!, $definition: MetaobjectDefinitionUpdateInput!) {
        metaobjectDefinitionUpdate(id: $id, definition: $definition) {
          metaobjectDefinition { id }
          userErrors { field message code }
        }
      }`,
      {
        id: existing.id,
        definition: { fieldDefinitions: missing.map((f) => ({ create: { ...f, required: false } })) },
      }
    );
    assertNoUserErrors(updated.metaobjectDefinitionUpdate, `Adding fields to "${wanted.type}"`);
    console.log(`✔ Added ${missing.length} field(s) to "${wanted.type}": ${missing.map((f) => f.key).join(', ')}`);
  } else {
    console.log(`✔ "${wanted.type}" looks correct.`);
  }
  return existing;
}

async function ensureProductStoryMetafield(storyDefinitionId) {
  const [namespace, key] = ['evlvex', 'story'];
  const data = await gql(
    `query($namespace: String!, $key: String!) {
      metafieldDefinitions(first: 1, ownerType: PRODUCT, namespace: $namespace, key: $key) {
        nodes { id type { name } validations { name value } }
      }
    }`,
    { namespace, key }
  );
  const existing = data.metafieldDefinitions.nodes[0];

  if (existing) {
    const linked = existing.validations.find((v) => v.name === 'metaobject_definition_id')?.value;
    const problems = [];
    if (existing.type.name !== 'metaobject_reference') problems.push(`type is ${existing.type.name}, expected metaobject_reference`);
    else if (linked !== storyDefinitionId) problems.push(`it points at ${linked}, not the "${config.storyType}" definition`);
    if (problems.length) {
      fail(`Fix the product metafield ${namespace}.${key} in Admin → Settings → Custom data → Products:\n  - ${problems.join('\n  - ')}`);
    }
    console.log(`✔ Product metafield "${namespace}.${key}" looks correct.`);
    return;
  }

  const created = await gql(
    `mutation($definition: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $definition) {
        createdDefinition { id }
        userErrors { field message code }
      }
    }`,
    {
      definition: {
        name: 'Story',
        namespace,
        key,
        ownerType: 'PRODUCT',
        type: 'metaobject_reference',
        description: 'The EvlveX story of this model. Shown on the product page, in the cart and on certificates.',
        validations: [{ name: 'metaobject_definition_id', value: storyDefinitionId }],
      },
    }
  );
  assertNoUserErrors(created.metafieldDefinitionCreate, `Creating product metafield ${namespace}.${key}`);
  console.log(`✔ Created product metafield "${namespace}.${key}" (Story).`);
}
