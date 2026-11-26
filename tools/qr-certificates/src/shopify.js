// Minimal Shopify Admin GraphQL client with throttle-aware retries.
import { config, requireApi } from './config.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let cachedToken = null;

/** Fixed token from .env, or a short-lived one from the client-credentials grant (cached for this run). */
async function accessToken() {
  if (config.token && !config.token.includes('xxxx')) return config.token;
  if (cachedToken) return cachedToken;
  let res;
  for (let attempt = 0; ; attempt++) {
    res = await fetch(`https://${config.store}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.clientId,
        client_secret: config.clientSecret,
      }),
    });
    // Shopify's token endpoint sometimes answers 429/5xx for a moment: wait and try again.
    if ((res.status === 429 || res.status >= 500) && attempt < 5) {
      await sleep(1000 * 2 ** attempt);
      continue;
    }
    break;
  }
  const text = await res.text();
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {
    // Shopify answers with an HTML page for some errors, e.g. when the app is not installed.
  }
  if (!res.ok || !body?.access_token) {
    const reason = body?.error_description || body?.error || (text.match(/<title>(.*?)<\/title>/) || [])[1] || `HTTP ${res.status}`;
    throw new Error(`Could not get an access token from Shopify (${reason}). Check SHOPIFY_STORE, the client ID and secret, and that the app is installed on the store.`);
  }
  cachedToken = body.access_token;
  return cachedToken;
}

export async function gql(query, variables = {}, { retries = 5 } = {}) {
  requireApi();
  const token = await accessToken();
  const url = `https://${config.store}/admin/api/${config.apiVersion}/graphql.json`;

  for (let attempt = 0; ; attempt++) {
    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token,
        },
        body: JSON.stringify({ query, variables }),
      });
    } catch (error) {
      // Dropped connection: wait and retry. A create that reached Shopify before the drop is caught by the
      // caller (its handle is then taken), and `generate` reports such leftovers.
      if (attempt < retries) {
        await sleep(1000 * 2 ** attempt);
        continue;
      }
      throw error;
    }

    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      await sleep(1000 * 2 ** attempt);
      continue;
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error(`Shopify rejected the token (HTTP ${res.status}). Check the token or client credentials, and the app's scopes.`);
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
  fields {
    key value
    reference { ... on Product { id title handle story: metafield(namespace: "evlvex", key: "story") { value } } }
  }
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

/** Model group of a product: its story's id, or the product id when it has no story yet. */
export const modelGroup = (productId, storyId) => storyId || productId || null;

/** Story id of a product, or null. */
export async function getProductStoryId(productId) {
  const data = await gql(
    `query($id: ID!) { product(id: $id) { story: metafield(namespace: "evlvex", key: "story") { value } } }`,
    { id: productId }
  );
  return data.product?.story?.value || null;
}

/**
 * Every certificate's pair number and model group, for numbering pairs per model.
 * Returns [{ handle, group, pairNumber }].
 */
export async function listCertificateChapters() {
  return (await listCertificates()).map(({ handle, group, pairNumber }) => ({ handle, group, pairNumber }));
}

/**
 * Every certificate with the fields needed to pick and track tags (src/pack.js).
 * Returns [{ id, handle, serial, productId, productTitle, size, buyerName, orderNumber, pairNumber, group }].
 */
export async function listCertificates() {
  const out = [];
  let after = null;
  do {
    const data = await gql(
      `query($type: String!, $after: String) {
        metaobjects(type: $type, first: 250, after: $after) {
          nodes {
            id handle
            serial: field(key: "serial") { value }
            size: field(key: "size") { value }
            buyerName: field(key: "buyer_name") { value }
            orderNumber: field(key: "order_number") { value }
            pairNumber: field(key: "pair_number") { value }
            product: field(key: "product") {
              value
              reference { ... on Product { title story: metafield(namespace: "evlvex", key: "story") { value } } }
            }
          }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { type: config.type, after }
    );
    for (const n of data.metaobjects.nodes) {
      out.push({
        id: n.id,
        handle: n.handle,
        serial: n.serial?.value || n.handle.toUpperCase(),
        productId: n.product?.value || null,
        productTitle: n.product?.reference?.title || '',
        size: n.size?.value || '',
        buyerName: n.buyerName?.value || '',
        orderNumber: n.orderNumber?.value || '',
        group: modelGroup(n.product?.value, n.product?.reference?.story?.value),
        pairNumber: n.pairNumber?.value ?? null,
      });
    }
    after = data.metaobjects.pageInfo.hasNextPage ? data.metaobjects.pageInfo.endCursor : null;
  } while (after);
  return out;
}

/** Write fields on one certificate. */
export async function updateCertificate(id, fields, label = 'the certificate') {
  const data = await gql(
    `mutation($id: ID!, $metaobject: MetaobjectUpdateInput!) {
      metaobjectUpdate(id: $id, metaobject: $metaobject) {
        metaobject { id }
        userErrors { field message code }
      }
    }`,
    { id, metaobject: { fields } }
  );
  assertNoUserErrors(data.metaobjectUpdate, `Updating ${label}`);
}

/** Turn a metaobject's field list into { key: value } (product reference → title). */
export function fieldMap(metaobject) {
  const out = {};
  for (const f of metaobject?.fields || []) {
    out[f.key] = f.reference?.title ? `${f.reference.title} (${f.value})` : f.value;
  }
  return out;
}
