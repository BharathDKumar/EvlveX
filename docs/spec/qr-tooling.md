# EvlveX — QR Tooling (CLI Code) Specification

Part of the [EvlveX specification](../SPEC.md). **Audience:** developers, and operations staff who run the commands.

Location: `tools/qr-certificates/` (Node.js). It creates serials and tag artwork, and writes certificate data to Shopify. The data it writes is defined in [qr-certificates.md §5](qr-certificates.md).

---

## 1. Setup (one time)
1. Install Node.js 20.12+ and run `npm install` in `tools/qr-certificates/`.
2. Create an app for the store in the Shopify Dev Dashboard (or Admin → Settings → Apps → Develop apps, if offered). Install it on the store with these Admin API scopes: `read_metaobjects`, `write_metaobjects`, `read_metaobject_definitions`, `write_metaobject_definitions`, `read_orders`, `read_products`, `write_products` (for the `evlvex.story` product metafield definition).
3. Copy `.env.example` to `.env` and fill it in (table below).
4. Run `npm run setup` once. It creates the `evlvex_certificate` and `evlvex_story` metaobject definitions and the `evlvex.story` product metafield definition. If they already exist, it checks them and adds any missing fields.

| Variable | Example | Meaning |
|---|---|---|
| `SHOPIFY_STORE` | `evlvex.myshopify.com` | store's myshopify domain (API only) |
| `SHOPIFY_ADMIN_TOKEN` | `shpat_…` | Admin API access token. **Keep secret; never commit** |
| `SHOPIFY_API_VERSION` | `2026-10` | Admin API version |
| `PUBLIC_DOMAIN` | `evlvex.com` | domain encoded in every QR ([deployment.md §1](deployment.md)) |
| `METAOBJECT_TYPE` | `evlvex_certificate` | must match [qr-certificates.md §5.1](qr-certificates.md) |
| `URL_PREFIX` | `authentic` | must match the metaobject's Online Store URL handle |

## 2. Commands
| Command | What it does |
|---|---|
| `npm run setup` | Creates (or checks and completes) the certificate and story definitions and the product story metafield |
| `npm test` | Self-test: serial format, and that QR codes with the centre logo decode correctly |
| `npm run generate -- --count 200 --batch NOV26` | Creates 200 new serials in Shopify and writes SVGs, a print PDF and a CSV to `out/NOV26/` |
| `npm run generate -- --count 6 --batch TEST --offline` | Same, but **does not touch Shopify**. For checking print quality |
| `npm run generate -- --count 3 --batch TEST --base-url https://evlvex.myshopify.com` | Test tags that point at the myshopify domain. **Never print these for real pairs** |
| `npm run generate -- --reprint EVX-7F3K9QMD` | Re-creates the tag artwork for an existing serial |
| `npm run assign -- --serial EVX-… --order 1001 [--size 42] [--message "…"] [--name "…"] [--line 2] [--artisan "…"] [--finished YYYY-MM-DD] [--note "…"] [--pair-number 42] [--force]` | Links a serial to an order and records the pair's chapter (see §3) |
| `npm run assign -- --serial EVX-… --clear` | Un-assigns a pair (returns / exchanges); keeps the pair's chapter fields |
| `npm run lookup -- --serial EVX-…` | Shows a certificate's current data |

## 3. `assign` behaviour
- Reads the customer's full name, the product and the order date from the order.
- `--name` overrides the customer name (e.g. a gift recipient).
- `--line` picks the product when an order has several.
- `--artisan`, `--finished`, `--note` fill `artisan`, `finished_on`, `pair_note`. `--note` longer than 200 characters is rejected.
- **Pair number:** if the certificate has none, set it to the highest `pair_number` among certificates of the same **model**, plus 1. A model is every product that shares the same `evlvex.story`; a product without a story is numbered on its own. `--pair-number` overrides this. An existing number is never changed automatically, even with `--force`.
- Refuses to overwrite an assigned certificate unless `--force` is given.
- `--clear` empties `buyer_name`, `size`, `purchase_date`, `personal_message` and `order_number`, and keeps `product`, `pair_number`, `artisan`, `finished_on`, `pair_note`.
- Prints the live certificate URL when done.

## 4. Output files (`out/<batch>/`)
- `svg/EVX-XXXXXXXX.svg`: one tag per serial (vector, for label printers)
- `tags.pdf`: A4 sheet of 30 × 40 mm tags with cut marks (QR 22 mm square, serial underneath, monogram in the QR centre)
- `manifest.csv`: `serial, handle, url, batch, created_at`

## 5. Changes from v1.0 (implemented in v1.1)
- `src/definitions.js` (new): field lists for both metaobjects and the check that finds missing fields.
- `src/setup.js`: adds the four new certificate fields to an existing definition, creates the `evlvex_story` definition (meta title = title, meta description = excerpt) and the `evlvex.story` product metafield definition.
- `src/chapter.js` (new): validation of `--artisan`, `--finished`, `--note`, `--pair-number`; next pair number per model; fields emptied by `--clear`.
- `src/assign.js`: new flags, automatic pair numbers, `--clear` keeps the product and the pair's chapter. `src/lookup.js` shows the chapter fields.
- Tests: `test/chapter.test.js`, `test/definitions.test.js`.
- `.env.example` / `README.md`: the extra `write_products` scope and the new flags.
