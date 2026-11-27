// Order helpers shared by `assign` and `autopack`.
import { assertNoUserErrors, gql } from './shopify.js';

export const PACK_METAFIELD = { namespace: 'evlvex', key: 'pack_serials' };

const ORDER_FIELDS = `
  id name createdAt cancelledAt displayFulfillmentStatus tags
  shippingAddress { name }
  billingAddress { name }
  packSerials: metafield(namespace: "${PACK_METAFIELD.namespace}", key: "${PACK_METAFIELD.key}") { value }
  lineItems(first: 50) {
    nodes {
      quantity currentQuantity variantTitle
      product { id title }
      variant { selectedOptions { name value } }
    }
  }
`;

/**
 * One order by its number, or null. Accepts the full name ("EVX-1003", "#1001") or just the number ("1003"),
 * whatever order-number prefix the store uses (Settings → General → Order ID format).
 */
export async function findOrder(input) {
  const raw = String(input).trim().replace(/^#/, '');
  const data = await gql(
    `query($q: String!) { orders(first: 10, query: $q) { nodes { ${ORDER_FIELDS} } } }`,
    { q: `name:${raw}` }
  );
  return data.orders.nodes.find((o) => matchesOrderName(o.name, input)) || null;
}

/** True when `input` names this order: the full name (any case, # optional) or only its number. */
export function matchesOrderName(name, input) {
  const want = String(input).trim().replace(/^#/, '').toLowerCase();
  const have = name.replace(/^#/, '').toLowerCase();
  if (have === want) return true;
  return /^\d+$/.test(want) && have.match(/(\d+)$/)?.[1] === want;
}

/** Every order created in the last `days` days, oldest first (so earlier orders get tags first). */
export async function listRecentOrders(days) {
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const out = [];
  let after = null;
  do {
    const data = await gql(
      `query($q: String!, $after: String) {
        orders(first: 50, after: $after, query: $q, sortKey: CREATED_AT) {
          nodes { ${ORDER_FIELDS} }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { q: `created_at:>=${since}`, after }
    );
    out.push(...data.orders.nodes);
    after = data.orders.pageInfo.hasNextPage ? data.orders.pageInfo.endCursor : null;
  } while (after);
  return out;
}

/**
 * The name shown on the certificate: the shipping name (the person who receives the pair), else the billing
 * name. The order's customer record is not read: it needs the read_customers scope. Never an email address,
 * because the certificate page is public.
 */
export function buyerName(order, override) {
  return [override, order.shippingAddress?.name, order.billingAddress?.name]
    .map((n) => (n || '').trim())
    .find((n) => n && !n.includes('@')) || '';
}

export async function addTags(id, tags) {
  if (!tags.length) return;
  const data = await gql(
    `mutation($id: ID!, $tags: [String!]!) { tagsAdd(id: $id, tags: $tags) { userErrors { field message } } }`,
    { id, tags }
  );
  assertNoUserErrors(data.tagsAdd, 'Adding order tags');
}

export async function removeTags(id, tags) {
  if (!tags.length) return;
  const data = await gql(
    `mutation($id: ID!, $tags: [String!]!) { tagsRemove(id: $id, tags: $tags) { userErrors { field message } } }`,
    { id, tags }
  );
  assertNoUserErrors(data.tagsRemove, 'Removing order tags');
}

export async function setPackSerials(orderId, text) {
  const data = await gql(
    `mutation($m: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $m) { userErrors { field message code } } }`,
    { m: [{ ownerId: orderId, ...PACK_METAFIELD, type: 'multi_line_text_field', value: text }] }
  );
  assertNoUserErrors(data.metafieldsSet, 'Saving the pack serials on the order');
}
