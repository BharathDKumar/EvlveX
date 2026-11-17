// Loads .env and exposes validated settings shared by all commands.
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const envPath = path.join(ROOT, '.env');
if (existsSync(envPath)) process.loadEnvFile(envPath);

const env = process.env;

export const config = {
  store: (env.SHOPIFY_STORE || '').trim(),
  token: (env.SHOPIFY_ADMIN_TOKEN || '').trim(),
  // Alternative to a fixed token: the app's client ID and secret (Dev Dashboard apps). A short-lived token is
  // fetched automatically with the client-credentials grant (src/shopify.js).
  clientId: (env.SHOPIFY_CLIENT_ID || '').trim(),
  clientSecret: (env.SHOPIFY_CLIENT_SECRET || '').trim(),
  apiVersion: (env.SHOPIFY_API_VERSION || '2026-10').trim(),
  publicDomain: (env.PUBLIC_DOMAIN || '').trim().replace(/^https?:\/\//, '').replace(/\/+$/, ''),
  type: (env.METAOBJECT_TYPE || 'evlvex_certificate').trim(),
  urlPrefix: (env.URL_PREFIX || 'authentic').trim(),
  // Story pages (docs/spec/qr-certificates.md §5.2). Fixed: the theme expects these names.
  storyType: 'evlvex_story',
  storyUrlPrefix: 'stories',
};

export function requireApi() {
  const missing = [];
  if (!config.store) missing.push('SHOPIFY_STORE');
  const hasToken = config.token && !config.token.includes('xxxx');
  const hasClient = config.clientId && config.clientSecret && !config.clientSecret.includes('xxxx');
  if (!hasToken && !hasClient) missing.push('SHOPIFY_ADMIN_TOKEN (or SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET)');
  if (missing.length) {
    fail(`Missing ${missing.join(', ')} in ${envPath}. Copy .env.example to .env and fill it in.`);
  }
}

/** Base URL encoded in QR codes, e.g. https://evlvex.com */
export function publicBaseUrl(override) {
  if (override) return override.replace(/\/+$/, '');
  if (!config.publicDomain) fail('Missing PUBLIC_DOMAIN in .env (the domain printed into every QR code).');
  return `https://${config.publicDomain}`;
}

export function certificateUrl(baseUrl, handle) {
  return `${baseUrl}/pages/${config.urlPrefix}/${handle}`;
}

export function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}
