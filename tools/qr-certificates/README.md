# EvlveX QR certificate tools

Command-line tools that create a unique QR tag for every pair, record each pair's own chapter (pair number, artisan, finished date, pair note) and link it to the buyer.
Full details are in the spec: [qr-tooling.md](../../docs/spec/qr-tooling.md) (commands), [qr-certificates.md](../../docs/spec/qr-certificates.md) (data model) and [operations.md](../../docs/spec/operations.md) (runbook).

## One-time setup
1. Install **Node.js 20.12+**, then run `npm install` in this folder.
2. Create an app for the store (Shopify Dev Dashboard, or Admin → Settings → Apps → Develop apps). Grant these Admin API scopes:
   - `read_metaobjects`
   - `write_metaobjects`
   - `read_metaobject_definitions`
   - `write_metaobject_definitions`
   - `read_orders`
   - `read_products`
   - `write_products` (needed to create the `evlvex.story` product metafield definition)

   Install the app on the store and copy its Admin API access token.
3. `copy .env.example .env`, then fill in `SHOPIFY_STORE`, `SHOPIFY_ADMIN_TOKEN` and `PUBLIC_DOMAIN`.
   **`PUBLIC_DOMAIN` must be the store's final primary domain before you print anything.**
4. `npm run setup`: creates, or checks and completes:
   - the *EvlveX Certificate* metaobject definition, with pages at `/pages/authentic/<serial>`
   - the *EvlveX Story* metaobject definition, with pages at `/pages/stories/<handle>`
   - the *Story* product metafield (`evlvex.story`) that links each product to its story

   Upgrading from v1.0? Just run it again: it adds the new certificate fields (`pair_number`, `artisan`, `finished_on`, `pair_note`) without touching existing entries.
5. `npm test`: optional self-check (serials, QR decoding, pair numbering, definitions).

## Everyday use
```bash
# Production: create 200 serials in Shopify and the print files
npm run generate -- --count 200 --batch NOV26
#   → out/NOV26/tags.pdf (print at 100%), out/NOV26/svg/*.svg, out/NOV26/manifest.csv

# Packing: link the pair in the box to its order, copying the workshop card
npm run assign -- --serial EVX-7F3K9QMD --order 1001 --artisan "Marco R." --finished 2026-11-03 \
  --note "The last pair cut from hide lot 12. The grain runs especially fine across the toe."
npm run assign -- --serial EVX-7F3K9QMD --order 1002 --name "Priya Sharma" --message "Happy birthday — Arjun"

# Look up / undo
npm run lookup -- --serial EVX-7F3K9QMD
npm run assign -- --serial EVX-7F3K9QMD --clear

# Proofs and reprints
npm run generate -- --count 6 --batch PROOF --offline                                 # nothing created in Shopify
npm run generate -- --count 3 --batch TEST --base-url https://evlvex.myshopify.com    # test tags only
npm run generate -- --reprint EVX-7F3K9QMD
```

## Good to know
- Serials look like `EVX-7F3K9QMD`: 8 random characters, with no I, L, O or U to avoid misreading. People can type them in any case, and with or without the `EVX-` prefix.
- **Pair numbers** are given automatically on the first `assign`: the highest number already used for the same model, plus 1. A model is every product that shares the same story; a product without a story is numbered on its own. Use `--pair-number` to set one by hand. A pair keeps its number for life, even after `--clear` or `--force`.
- `--clear` removes the buyer details (name, size, date, message, order) but keeps the product and the pair's chapter (number, artisan, finished date, note).
- Only name an artisan with `--artisan` if they have agreed to be shown on certificate pages. `--note` is limited to 200 characters.
- `assign` never prints the customer's email address. If an order has no name, pass `--name`.
- The order number is stored on the certificate for staff use but is never shown on the public page.
- Without the `read_all_orders` scope, Shopify only exposes orders from the last 60 days.
- `.env` and `out/` are git-ignored. Keep the token secret, but **keep each batch's `manifest.csv`**.
