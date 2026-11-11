# EvlveX — Website & QR Certificate Specification

| | |
|---|---|
| **Status** | v1.0 — approved for build |
| **Date** | 12 Nov 2026 |
| **Platform** | Shopify (Dawn 16.1.1 theme, customised) |
| **Audience** | EvlveX team, developers, operations / packing staff |

---

## 1. Overview & goals

EvlveX is a quiet-luxury sneaker house. The first product, **Court 01**, is a low-top leather court sneaker in two colorways (Ivory Sand, Noir). The website must:

1. **Feel like a luxury maison:** restrained palette, serif headlines, generous white space, large photography, no discount-store clutter.
2. **Sell:** a clear path from homepage → product → cart → Shopify checkout.
3. **Give every pair an identity:** each pair carries a unique QR tag. When the owner scans it, they land on a personal page: *"Thank you, {Full Name}"*, which also proves the pair is genuine.

### Out of scope (v1)
- Scan analytics and counterfeit detection (e.g. counting scans, geo alerts)
- Multi-language and multi-currency content (Dawn supports it later without code changes)
- Customer accounts / login customisation
- Native mobile app

---

## 2. Brand system

### 2.1 Logo
- **Monogram:** a thin circle enclosing two mirrored "E"s back to back, as embroidered on the shoe's side panel.
- **Wordmark:** `EVLVEX` in capitals with wide letter-spacing (≈ 0.35em).
- **Files in theme:**
  - `assets/evlvex-monogram.svg`: standalone file, used for the favicon and downloads
  - `snippets/evlvex-monogram.liquid`: inline SVG that takes its color from the surrounding text color (`currentColor`)
- **Usage rules:**
  - Clear space around the monogram ≥ ½ of its diameter.
  - Minimum size: 16 px on screen, 6 mm in print.
  - On light backgrounds use Noir or Sand-gold; on dark backgrounds use Ivory or Sand-gold.
  - Never stretch, outline, add shadows, or place on busy photography.
- ⚠️ The current SVG is a redraw from product photos. Replace it with the original vector when available (see §9).

### 2.2 Color palette
Taken directly from the Court 01 materials.

| Name | Hex | Source | Use |
|---|---|---|---|
| Noir | `#0E0E0E` | black leather | text, dark sections, footer |
| Ivory | `#F5F0E6` | cream leather | main page background |
| Bone | `#FBFAF7` | midsole | cards, alternate sections |
| Sand | `#CDBA98` | suede & laces | soft feature blocks |
| Sand-gold | `#B89B6A` | logo embroidery | accents, hairlines, seal, buttons on Noir |
| Caramel | `#B4734A` | sole stripe | rare highlight only (e.g. "New" badge) |

**Shopify color-scheme mapping** (Theme settings → Colors):

| Scheme | Background | Text | Button / label | Used for |
|---|---|---|---|---|
| scheme-1 *Ivory* | Ivory | Noir | Noir / Ivory | default pages, header |
| scheme-2 *Bone* | Bone | Noir | Noir / Bone | product cards, alternate sections |
| scheme-3 *Noir* | Noir | Ivory | Sand-gold / Noir | hero, certificate page, announcement bar |
| scheme-4 *Sand* | Sand | Noir | Noir / Sand | feature blocks, newsletter |
| scheme-5 *Noir footer* | Noir | Ivory | Ivory / Noir | footer |

### 2.3 Typography
| Role | Font (Shopify font library) | Notes |
|---|---|---|
| Headings | **Cormorant** (`cormorant_n4`) | Elegant high-contrast serif; heading scale 130% |
| Body / UI | **Jost** (`jost_n4`) | Clean geometric sans that echoes the monogram |
| Navigation, buttons, eyebrows | Jost, uppercase, letter-spacing 0.2em, 12–13 px | |

Fallbacks if a font is unavailable in the store's font picker: Playfair Display / Montserrat.

### 2.4 Tone of voice
Calm, confident, few words. No exclamation marks, no "SALE!!!", no emoji.

- ✅ "Crafted to evolve with you."
- ✅ "Every pair is individually numbered and registered to its owner."
- ❌ "Grab yours now before they're gone!!"

### 2.5 Photography guidelines & shot list
The sample photos (`assets/sample-court-*.jpg`) are **placeholders only**: they were shot on boxes and walls.

For the launch shoot, use a seamless ivory or stone backdrop with soft directional light, and photograph each colorway:
1. Clean profile (side view): primary product image, 4:5
2. ¾ front
3. Top-down (laces and tongue)
4. Back / heel tab
5. Outsole
6. Macro shots: monogram embroidery, suede texture, stitching
7. On-foot lifestyle (2–3 frames): hero banners, 16:9 and 4:5 crops
8. Box and QR tag: for the authenticity section

Export at ≥ 2400 px on the long edge, sRGB, JPG quality 85.

---

## 3. Site map & page specifications

```
Home
├── Shop (collection: all) ─ Men / Women / Limited
│   └── Product: Court 01 Ivory Sand, Court 01 Noir, …
├── The Maison (about)                 /pages/the-maison
├── Care                               /pages/care
├── Authenticity                       /pages/authenticity
│   └── Certificate (one per pair)     /pages/authentic/<serial>
├── Cart → Shopify checkout
└── 404
```

Global elements:
- **Announcement bar** (Noir): "Complimentary shipping · Every pair individually certified"
- **Header** (Ivory): logo centred, menu centred below it, search / account / cart icons on the right. Sticky when scrolling up.
- **Footer** (Noir footer): "Join the Maison" newsletter, menus (Shop, Maison, Client Care), social icons, payment icons.

| Page | Purpose | Sections (in order) | Content needed | Mobile |
|---|---|---|---|---|
| **Home** | Brand first impression, route to product | 1. Full-bleed hero (Noir, "Crafted to Evolve", CTA "Discover Court 01") · 2. Brand statement (rich text) · 3. Featured collection (4 products) · 4. Image-with-text "The Craft" · 5. Multicolumn "Every pair, individually certified" (3 points + link to Authenticity) · 6. Collection list (Men / Women / Limited) · 7. Newsletter | hero image 16:9 + 4:5, craft image, collection images | hero stacks text under image; product grid 2 columns |
| **Collection** | Browse | banner, product grid with filters | collection image + description | 2 columns, filter drawer |
| **Product** | Convert | media gallery · title, price, size buttons, add to cart · collapsible tabs: Materials & Craft, Size & Fit, Care, Shipping & Returns, Authenticity Certificate · "You may also admire" | 5–8 images per product, size chart, materials text | gallery swipes, sticky add-to-cart area under gallery |
| **The Maison** | Story | image banner, rich text story, image-with-text ×2 | founder/brand story | stacked |
| **Care** | Aftercare (linked from certificate) | rich text + collapsible care steps | leather + suede care instructions | stacked |
| **Authenticity** | Explain the QR program; manual serial lookup | intro, "How it works" 3 steps, **serial lookup form** | — | full-width input |
| **Certificate** | Personal thank-you + proof of authenticity | see §4 | populated automatically per pair | single column, fits one phone screen above the fold |
| **Cart** | Review | Dawn default, restyled | — | — |
| **404** | Recovery | message + "Return to the Maison" + link to Authenticity ("Scanned a tag? Verify your serial") | — | — |

---

## 4. QR certificate feature

### 4.1 User stories
1. **Owner:** *As the buyer, when I scan the tag in my shoe, I see a page thanking me by name and confirming my pair is genuine.*
2. **Resale buyer / curious person:** *When I scan or enter a serial, I can confirm the pair is a genuine EvlveX product.*
3. **Packing staff:** *When I pack an order, I link the pair's serial to the order in under 30 seconds.*
4. **Production:** *I can generate and print a batch of unique tags before the shoes are finished.*

### 4.2 How it works
```
Production                 Packing                     Customer
──────────                 ───────                     ────────
generate batch  ──►  tag sewn/stuck  ──►  assign serial  ──►  scan QR
(serials created          in each pair         to order             │
 in Shopify, QR                                (name, product,      ▼
 PDF printed)                                   size, date)    /pages/authentic/<serial>
                                                               "Thank you, Priya Sharma"
```

### 4.3 Formats
| Item | Format | Example |
|---|---|---|
| Serial (printed) | `EVX-` + 8 characters, Crockford Base32 (digits + letters, excluding I L O U) | `EVX-7F3K9QMD` |
| Handle (URL) | serial in lowercase | `evx-7f3k9qmd` |
| QR URL | `https://<PUBLIC_DOMAIN>/pages/authentic/<handle>` | `https://evlvex.com/pages/authentic/evx-7f3k9qmd` |

- About 1.1 trillion possible serials, so guessing a valid URL is not practical.
- QR codes always encode the **final public domain**, never `*.myshopify.com`, so printed tags keep working forever.

### 4.4 Data model: Shopify metaobject
**Definition:** created automatically by `npm run setup` (§6), or manually in Admin → Settings → Custom data → Metaobjects → *Add definition*. Either way, the result must be:

- Name: **EvlveX Certificate**
- Type (API handle): **`evlvex_certificate`**
- Capabilities:
  - **Online Store**: ON, with URL handle **`authentic`** and template `evlvex_certificate`
  - **Publishable**: ON
- Display name field: `serial`

| Field name | Key | Type | Shown on page? |
|---|---|---|---|
| Serial | `serial` | Single line text | Yes |
| Buyer name | `buyer_name` | Single line text | **Yes, full name** |
| Product | `product` | Product reference | Yes (image + title) |
| Size | `size` | Single line text | Yes |
| Purchase date | `purchase_date` | Date | Yes |
| Personal message | `personal_message` | Multi-line text | Yes, if present (gift dedication) |
| Order number | `order_number` | Single line text | **Never** |
| Batch | `batch` | Single line text | Never |

Entries are created as **Active**, so a tag scanned before the pair is sold still shows a valid "genuine" page.

### 4.5 Page states
| State | When | Page shows |
|---|---|---|
| **Assigned** | `buyer_name` is filled | Monogram seal · "Certificate of Authenticity" · **"Thank you, {buyer_name}"** · brand thank-you message · personal message (if any) · product image + name · size · purchase date · serial · "Genuine EvlveX" seal · buttons: *Care for your pair*, *Discover the collection* |
| **Unassigned** | entry exists, no buyer yet | Monogram seal · "Genuine EvlveX" · "This pair is authentic and awaiting its owner." · serial · *Discover the collection* |
| **Unknown serial** | no entry with that handle | Shopify 404 page (with the "Verify your serial" link) |

### 4.6 Thank-you copy (editable in the theme editor)
> **Thank you, {Full Name}.**
>
> This pair was made for you, and is now registered in your name. Every EvlveX is cut, stitched and finished with patience — we hope it walks with you for many years.
>
> *With gratitude,*
> *The House of EvlveX*

### 4.7 Privacy & security rules
- The **full name** is shown publicly to anyone who scans the tag. The privacy policy must say so (see §9).
- `order_number` and `batch` are **never** rendered in the HTML.
- Certificate pages carry `<meta name="robots" content="noindex,nofollow">`, so they never appear in Google.
- Serials are random. There is no index page listing certificates.
- To remove a name (e.g. on request), clear `buyer_name`. The page falls back to the *Unassigned* state.

---

## 5. Operations runbook

### 5.1 Generate and print a batch (production)
1. Run `npm run generate -- --count 200 --batch NOV26` in `tools/qr-certificates/` (see §6).
2. Open `out/NOV26/tags.pdf` and print it:
   - **Tag size:** 30 × 40 mm (QR 22 mm square, serial underneath, monogram in the QR centre).
   - **Material:** printed satin or woven label sewn under the tongue or insole, **plus** a matching sticker on the shoe box.
   - Print a test sheet first and scan 3 tags with an iPhone and an Android phone.
3. Keep `out/NOV26/manifest.csv` as the record of which serials exist.
4. Attach one tag per **pair** (the box sticker and the shoe label carry the **same** serial).

### 5.2 Assign a pair at packing
**Option A: CLI (recommended, ~10 s)**
```
npm run assign -- --serial EVX-7F3K9QMD --order 1001 --size 42
```
The tool reads the customer's full name, the product and the order date from the order and fills the certificate. It prints the live URL. Open it on your phone to double-check.

**Option B: Shopify Admin (no computer setup needed)**
1. Admin → **Content → Metaobjects → EvlveX Certificate**
2. Search the serial (e.g. `EVX-7F3K9QMD`) and open it.
3. Fill in **Buyer name** (full name as on the order), **Product**, **Size**, **Purchase date**, **Order number** and, if it's a gift, **Personal message**.
4. Save, then scan the tag to confirm.

### 5.3 Corrections
- **Wrong name or typo:** edit the entry in Admin, or re-run `assign` with `--force`.
- **Pair returned / exchanged:** run `npm run assign -- --serial EVX-… --clear`, or clear the fields in Admin. The pair goes back to *Unassigned* and can be re-sold.
- **Gift purchase:** put the recipient's name in `buyer_name` and the giver's note in `personal_message`.

### 5.4 Lost or damaged tag
1. Look up the original serial by order number (Admin → Metaobjects, search the order number, or check the manifest).
2. Print a single replacement tag: `npm run generate -- --reprint EVX-7F3K9QMD`.
3. If the serial can't be recovered, generate a new one and assign it to the same order.

---

## 6. QR tooling reference (`tools/qr-certificates/`)

### 6.1 Setup (one time)
1. Install Node.js 20.12+ and run `npm install` in `tools/qr-certificates/`.
2. Create an app for the store in the Shopify Dev Dashboard (or Admin → Settings → Apps → Develop apps, if offered). Install it on the store with these Admin API scopes: `read_metaobjects`, `write_metaobjects`, `read_metaobject_definitions`, `write_metaobject_definitions`, `read_orders`, `read_products`.
3. Copy `.env.example` to `.env` and fill it in (table below).
4. Run `npm run setup` once. It creates the metaobject definition (§4.4); if the definition already exists, it only checks it.

| Variable | Example | Meaning |
|---|---|---|
| `SHOPIFY_STORE` | `evlvex.myshopify.com` | store's myshopify domain (API only) |
| `SHOPIFY_ADMIN_TOKEN` | `shpat_…` | Admin API access token. **Keep secret; never commit** |
| `SHOPIFY_API_VERSION` | `2026-10` | Admin API version |
| `PUBLIC_DOMAIN` | `evlvex.com` | domain encoded in every QR |
| `METAOBJECT_TYPE` | `evlvex_certificate` | must match §4.4 |
| `URL_PREFIX` | `authentic` | must match the metaobject's Online Store URL handle |

### 6.2 Commands
| Command | What it does |
|---|---|
| `npm run setup` | Creates (or checks) the `evlvex_certificate` metaobject definition |
| `npm test` | Self-test: serial format, and that QR codes with the centre logo decode correctly |
| `npm run generate -- --count 200 --batch NOV26` | Creates 200 new serials in Shopify and writes SVGs, a print PDF and a CSV to `out/NOV26/` |
| `npm run generate -- --count 6 --batch TEST --offline` | Same, but **does not touch Shopify**. For checking print quality |
| `npm run generate -- --count 3 --batch TEST --base-url https://evlvex.myshopify.com` | Test tags that point at the myshopify domain. **Never print these for real pairs** |
| `npm run generate -- --reprint EVX-7F3K9QMD` | Re-creates the tag artwork for an existing serial |
| `npm run assign -- --serial EVX-… --order 1001 [--size 42] [--message "…"] [--name "…"] [--line 2] [--force]` | Links a serial to an order. `--name` overrides the customer name (e.g. a gift recipient); `--line` picks the product when an order has several |
| `npm run assign -- --serial EVX-… --clear` | Un-assigns a pair (returns / exchanges) |
| `npm run lookup -- --serial EVX-…` | Shows a certificate's current data |

### 6.3 Output files (`out/<batch>/`)
- `svg/EVX-XXXXXXXX.svg`: one tag per serial (vector, for label printers)
- `tags.pdf`: A4 sheet of 30 × 40 mm tags with cut marks
- `manifest.csv`: `serial, handle, url, batch, created_at`

---

## 7. Domain & deployment

### 7.1 Connect the GoDaddy domain (do this **before printing tags**)
1. Shopify Admin → **Settings → Domains → Connect existing domain**, then enter e.g. `evlvex.com`.
2. GoDaddy → My Products → Domain → **DNS**:

| Type | Name | Value | Action |
|---|---|---|---|
| A | `@` | `23.227.38.65` | edit existing `@` record; delete any other `@` A records |
| CNAME | `www` | `shops.myshopify.com` | edit existing `www` record |

3. Back in Shopify, click **Verify connection**. DNS can take up to 48 h, usually under 1 h.
4. Set the domain as **Primary** and confirm SSL shows **Active**.
5. Set `PUBLIC_DOMAIN` in `.env` to the exact domain (with or without `www`, matching the primary domain).

### 7.2 Theme workflow
- **Preview locally:** `shopify theme dev --store evlvex.myshopify.com` (hot reload at http://127.0.0.1:9292)
- **Lint:** `shopify theme check`
- **Upload for review:** `shopify theme push --unpublished`. This creates a new draft theme; preview it from Admin → Online Store → Themes.
- **Go live:** Admin → Online Store → Themes → *Publish* on the reviewed theme.
- **Rollback:** publish the previous theme from the theme library (Shopify keeps it). Locally: `git log` / `git revert`.

### 7.3 One-time store setup checklist
- [ ] Create metaobject definition: `npm run setup` (§4.4, §6)
- [ ] Create pages, choosing each page's **template** in the page editor:
  - *The Maison* → `page.about`
  - *Care* → `page.care`
  - *Authenticity* → `page.authenticity`
- [ ] Create collections: All, Men, Women, Limited
- [ ] Create products (Court 01 Ivory Sand, Court 01 Noir) with size variants
- [ ] Menus: *Main menu* (Shop, Men, Women, The Maison, Authenticity); *Footer* (Care, Shipping & Returns, Privacy, Contact)
- [ ] Theme editor: choose hero, craft and collection images; upload the logo
- [ ] Policies: add the certificate privacy wording (§9)

---

## 8. Acceptance criteria / test checklist
- [ ] `shopify theme check` reports no errors
- [ ] Home, collection, product, Maison, Care, Authenticity and Cart pages render correctly at 1440 px and 375 px wide
- [ ] Palette and fonts match §2 everywhere; no stock Dawn blue or grey remains
- [ ] `generate --offline` produces SVGs, PDF and CSV. The printed QR (with centre monogram) scans from 15 cm on iPhone and Android
- [ ] `generate` (online) creates Active metaobject entries visible in Admin
- [ ] Scanning an **unassigned** tag shows the "awaiting its owner" state
- [ ] After `assign` on a test order, scanning shows **"Thank you, {Full Name}"** with the correct product image, size, date and serial
- [ ] Page source of a certificate contains `noindex` and does **not** contain the order number
- [ ] Entering a serial on the Authenticity page (any case, with or without `EVX-`) opens the right certificate; an unknown serial shows the 404 page
- [ ] Certificate page passes a keyboard and screen-reader check (headings, alt text, contrast ≥ 4.5:1)

---

## 9. Open items
| # | Item | Owner | Needed for |
|---|---|---|---|
| 1 | Original logo vector file (SVG/AI/PDF) | Brand | replace redrawn monogram |
| 2 | Studio and lifestyle photography (§2.5) | Brand | hero, product, craft images |
| 3 | Final product names, prices, size range, materials text | Brand | products & tabs |
| 4 | Confirm exact domain (e.g. `evlvex.com`) | Brand | `PUBLIC_DOMAIN`, before printing |
| 5 | Privacy-policy wording, e.g. *"Each EvlveX pair carries a certificate page showing the owner's name. Contact us to remove or change it."* | Brand / legal | launch |
| 6 | Tag supplier and material (satin label vs sticker) | Production | first batch |
