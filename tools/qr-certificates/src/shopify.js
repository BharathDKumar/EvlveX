// Minimal Shopify Admin GraphQL client with throttle-aware retries.
import { config, requireApi } from './config.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function gql(query, variables = {}, { retries = 5 } = {}) {
  requireApi();
  const url = `https://${config.store}/admin/api/${config.apiVersion}/graphql.json`;

  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': config.token,
      },
      body: JSON.stringify({ query, variables }),
    });

    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      await sleep(1000 * 2 ** attempt);
      continue;
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error(`Shopify rejected the token (HTTP ${res.status}). Check SHOPIFY_ADMIN_TOKEN and the app's scopes.`);
    }
    if (!res.ok) {
      throw new Error(`Shopify API HTTP ${res.status}: ${await res.text()}`);
    }

    const body = await res.json();
    const throttled = body.errors?.some((e) => e.extensions?.code === 'THROTTLED');
    if (throttled && attempt < retries) {
      await sleep(1000 * 2 ** attempt);
      continue;
    }
    if (body.errors?.length) {
      throw new Error(`GraphQL error: ${body.errors.map((e) => e.message).join('; ')}`);
    }
    return body.data;
  }
}

/** Throws if a mutation payload contains userErrors. */
export function assertNoUserErrors(payload, action) {
  const errors = payload?.userErrors || [];
  if (errors.length) {
    const detail = errors.map((e) => `${(e.field || []).join('.')} ${e.message}`.trim()).join('; ');
    throw new Error(`${action} failed: ${detail}`);
  }
}

const CERT_FIELDS = `
  id
  handle
  updatedAt
  fields { key value reference { ... on Product { id title handle } } }
`;

export async function getCertificate(handle) {
  const data = await gql(
    `query($handle: MetaobjectHandleInput!) {
      metaobjectByHandle(handle: $handle) { ${CERT_FIELDS} }
    }`,
    { handle: { type: config.type, handle } }
  );
  return data.metaobjectByHandle;
}

/** Turn a metaobject's field list into { key: value } (product reference → title). */
export function fieldMap(metaobject) {
  const out = {};
  for (const f of metaobject?.fields || []) {
    out[f.key] = f.reference?.title ? `${f.reference.title} (${f.value})` : f.value;
  }
  return out;
}
