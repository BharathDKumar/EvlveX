# EvlveX — QR Tooling (CLI Code) Specification

Part of the [EvlveX specification](../SPEC.md). **Audience:** developers, and operations staff who run the commands.

Location: `tools/qr-certificates/` (Node.js). It creates serials and tag artwork, and writes certificate data to Shopify. The data it writes is defined in [qr-certificates.md §5](qr-certificates.md).

---

## 1. Setup (one time)
1. Install Node.js 20.12+ and run `npm install` in `tools/qr-certificates/`.
2. Create an app for the store in the Shopify Dev Dashboard (or Admin → Settings → Apps → Develop apps, if offered). Install it on the store with these Admin API scopes: `read_metaobjects`, `write_metaobjects`, `read_metaobject_definitions`, `write_metaobject_definitions`, `read_orders`, `write_orders` (for `autopack`: order tags and the `evlvex.pack_serials` order metafield), `read_products`, `write_products` (for the `evlvex.story` product metafield definition).
3. Copy `.env.example` to `.env` and fill it in (table below). With a Dev Dashboard app, enter its **client ID and secret**; the tool fetches a short-lived access token itself on every run, so nobody handles tokens. EvlveX uses the *EvlveX setup* app for this; add the scopes above to it (Versions → new version → Release → approve in the store).
4. Run `npm run setup` once. It creates the `evlvex_certificate` and `evlvex_story` metaobject definitions, the `evlvex.story` product metafield definition and the `evlvex.pack_serials` order metafield definition. If they already exist, it checks them and adds any missing fields.

| Variable | Example | Meaning |
|---|---|---|
| `SHOPIFY_STORE` | `w3wigc-de.myshopify.com` | store's myshopify domain (API only) |
| `SHOPIFY_CLIENT_ID` / `SHOPIFY_CLIENT_SECRET` | `0a0a…` / `shpss_…` | the app's credentials; a token is fetched with the client-credentials grant. **Keep secret; never commit** |
| `SHOPIFY_ADMIN_TOKEN` | `shpat_…` | alternative: a fixed Admin API access token. Leave empty when using the client ID and secret |
| `SHOPIFY_API_VERSION` | `2026-10` | Admin API version |
| `PUBLIC_DOMAIN` | `evlvex.in` | domain encoded in every QR ([deployment.md §1](deployment.md)) |
| `METAOBJECT_TYPE` | `evlvex_certificate` | must match [qr-certificates.md §5.1](qr-certificates.md) |
| `URL_PREFIX` | `authentic` | must match the metaobject's Online Store URL handle |
| `SMTP_USER` / `SMTP_PASS` | `…@gmail.com` / app password | account that sends the `autopack` packing email. For Gmail, use an **app password** (Google Account → Security → 2-Step Verification → App passwords), never the account password. Optional: without them, no email is sent |
| `MAIL_TO` | `support@evlvex.in` | who receives the packing email (default: `SMTP_USER`) |
| `SMTP_HOST` / `SMTP_PORT` | `smtp.gmail.com` / `465` | only for a mail provider other than Gmail |

## 2. Commands
| Command | What it does |
|---|---|
| `npm run setup` | Creates (or checks and completes) the certificate and story definitions, the product story metafield and the order *Pack serials* metafield |
| `npm run autopack [-- --dry-run] [--days 30] [--no-mail]` | **Automatic:** reserves a tag for each new order, puts the name on it when the order is fulfilled, releases it when the order is cancelled, and emails which serial to pack (see §5). Runs every 30 min on GitHub; `--dry-run` changes nothing |
| `npm test` | Self-test: serial format, and that QR codes with the centre logo decode correctly |
| `npm run generate -- --count 200 --batch NOV26` | Creates 200 new serials in Shopify and writes SVGs, a print PDF and a CSV to `out/NOV26/` |
| `npm run generate -- --from stock/stock-2026-11.csv --batch NOV26` | **From a stock list:** one certificate per pair, created with its **product, size and pair number** (numbers continue per model). `tags.pdf` starts each model · colour · size on a new sheet with a heading ("The Silent Grind · Black · UK 10 — 14 tags · pair no. 1–14"); `manifest.csv` adds product, colour, size and pair number. List columns: `product` (exact Shopify title), `size` (UK), `count`, optional `color`, `artisan`, `finished`, `note`; CSV or text pasted from a spreadsheet. Add `--offline` for a proof |
| `npm run merge -- --batches NOV26,NOV26-2 --out NOV26-PRINT` | Combines batches into one print set (one sheet per model and size, pair-number order). Use it when a run was interrupted and finished as a second batch; creates nothing in Shopify |
| `npm run generate -- --count 6 --batch TEST --offline` | Same, but **does not touch Shopify**. For checking print quality |
| `npm run generate -- --count 3 --batch TEST --base-url https://w3wigc-de.myshopify.com` | Test tags that point at the myshopify domain. **Never print these for real pairs** |
| `npm run generate -- --reprint EVX-7F3K9QMD` | Re-creates the tag artwork for an existing serial |
| `npm run assign -- --serial EVX-… --order 1001 [--size 42] [--message "…"] [--name "…"] [--line 2] [--artisan "…"] [--finished YYYY-MM-DD] [--note "…"] [--pair-number 42] [--force]` | Links a serial to an order and records the pair's chapter (see §3) |
| `npm run assign -- --serial EVX-… --clear` | Un-assigns a pair (returns / exchanges); keeps the pair's chapter fields |
| `npm run lookup -- --serial EVX-…` | Shows a certificate's current data |

## 3. `assign` behaviour
- Reads the buyer's full name (the shipping name, else the billing name), the product and the order date from the order.
- Refuses a serial that `autopack` reserved for a **different** order, unless `--force` is given. For the order it is reserved for, it simply fills in the name.
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

## 5. `autopack`: automatic tag assignment
The owner asked for this on 27 Nov 2026: the system picks the tag, and staff pack the serial they are emailed. It works because every tag from a stock list already has its **product and size**, and each product comes in one colour.

| Event | What `autopack` does | Certificate page |
|---|---|---|
| **New order** (not yet tagged `evx-reserved`) | For each shoe line and each unit, it picks a **free** tag (no `buyer_name`, no `order_number`) of the same product and UK size, lowest pair number first, and writes `order_number`. On the order it adds the tags `evx-reserved` plus each serial (e.g. `EVX-7F3K9QMD`) and fills the **Pack serials** metafield (`evlvex.pack_serials`). | still *Unassigned* ("waiting for its owner"); no name is public yet |
| **No free tag** of that size | The line goes into *Pack serials* as "NO TAG … assign by hand", the order gets `evx-no-tag`, and the email subject starts with ⚠ | — |
| **Order fulfilled** (Shopify status *Fulfilled*) | Fills `buyer_name` (shipping name, else billing name) and `purchase_date` on its reserved tags. Adds `evx-named` | *Assigned*: "Thank you, {name}" |
| **Order cancelled** before it was fulfilled | Clears `order_number` (size, product and pair number stay), removes `evx-reserved` and the serial tags, adds `evx-released`. The tag is free again | *Unassigned* |
| Cancelled **after** the name was added | Changes nothing, reports it once (`evx-check-return`). Handle the return as in [operations.md §4](operations.md) | *Assigned* until cleared |
| Fulfilled order with **no name** | Reports it once (`evx-no-name`); use `assign --name` | *Unassigned* |

- **Email:** one per run, and only when there is something to pack or check. The subject reads like "Pack #1001 → EVX-7F3K9QMD". The body lists each order with the serial, model, size and pair number. Naming alone sends nothing.
- **Safe to repeat:** an order with `evx-reserved` is never reserved again. A tag that has an `order_number` is never picked again. Tags already reserved for an order are reused if a run stopped halfway. The GitHub job runs one at a time (`concurrency: autopack`).
- **Products without tags** (e.g. an accessory) are ignored. A product whose tags are all sold counts as "no free tag".
- **Order window:** orders from the last 30 days (`--days`). Shopify shows at most 60 days without `read_all_orders`.
- **Schedule:** `.github/workflows/autopack.yml` runs at :07 and :37 past every hour, plus a **Run workflow** button (GitHub → Actions → *Autopack QR tags*) with a dry-run option. Expect the email 30–45 min after an order. If a run fails, GitHub emails the account that added the workflow (default notification settings).
- **Cost:** the repo is private. GitHub Free includes 2,000 Actions minutes a month, and each run counts as at least 1 minute. Every 30 min comes to about 1,490 min/month, so it costs nothing. **Don't schedule it more often:** every 15 min (about 2,980 min) would use up the free minutes, and with the default $0 budget GitHub would then stop the job until the next month.
- **GitHub secrets** (repo → Settings → Secrets and variables → Actions): `SHOPIFY_STORE`, `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET`, `SMTP_USER`, `SMTP_PASS`, `MAIL_TO`.

## 6. Code changes

### v1.15: automatic tag assignment
- `src/pack.js` (new): picks, reserves, names and releases tags; pure logic, tested in `test/pack.test.js`.
- `src/orders.js` (new): order queries, order tags, the `evlvex.pack_serials` metafield, and the buyer name (shipping name, else billing name; the customer record is not read because it needs `read_customers`). Used by `assign` and `autopack`.
- `src/autopack.js` (new), `src/mail.js` (new, uses `nodemailer`), `.github/workflows/autopack.yml` (new).
- `src/shopify.js`: `listCertificates()` and `updateCertificate()`. `src/setup.js` / `src/definitions.js`: the order metafield definition. `src/assign.js`: refuses a serial reserved for another order. `src/lookup.js`: shows *Reserved for order …*.

### v1.1: changes from v1.0
- `src/definitions.js` (new): field lists for both metaobjects and the check that finds missing fields.
- `src/setup.js`: adds the four new certificate fields to an existing definition, creates the `evlvex_story` definition (meta title = title, meta description = excerpt) and the `evlvex.story` product metafield definition.
- `src/chapter.js` (new): validation of `--artisan`, `--finished`, `--note`, `--pair-number`; next pair number per model; fields emptied by `--clear`.
- `src/assign.js`: new flags, automatic pair numbers, `--clear` keeps the product and the pair's chapter. `src/lookup.js` shows the chapter fields.
- Tests: `test/chapter.test.js`, `test/definitions.test.js`.
- `.env.example` / `README.md`: the extra `write_products` scope and the new flags.
