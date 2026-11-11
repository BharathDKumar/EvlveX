# EvlveX — QR Certificate & Story Data Specification

Part of the [EvlveX specification](../SPEC.md). **Audience:** developers (theme and tooling), brand.

Covers what the certificate does, the data it uses and the privacy rules. The CLI is in [qr-tooling.md](qr-tooling.md); day-to-day procedures are in [operations.md](operations.md).

---

## 1. Feature overview

### 1.1 User stories
1. **Owner:** *As the buyer, when I scan the tag in my shoe, I see a page thanking me by name, telling me the story of my pair and confirming it is genuine.*
2. **Gift recipient:** *When I scan a pair given to me, I see my name and the giver's message.*
3. **Resale buyer / curious person:** *When I scan or enter a serial, I can confirm the pair is a genuine EvlveX and read its story.*
4. **Packing staff:** *When I pack an order, I link the pair's serial to the order, and copy its workshop card, in under 60 seconds.*
5. **Production:** *I can generate and print a batch of unique tags before the shoes are finished.*
6. **Copywriter / brand:** *I can publish a new model story and link it to its products without a developer.*

### 1.2 How it works
```
Production                 Atelier                Packing                      Customer
──────────                 ───────                ───────                      ────────
generate batch  ──►  tag sewn/stuck  ──►  workshop card  ──►  assign serial  ──►  scan QR
(serials created          in each pair      written (artisan,     to order               │
 in Shopify, QR                             date, pair note)      (name, product,        ▼
 PDF printed)                                                      size, date, card) /pages/authentic/<serial>
                                                                                   "Thank you, Priya Sharma"
                                                                                   + the story of this pair
```

### 1.3 Formats
| Item | Format | Example |
|---|---|---|
| Serial (printed) | `EVX-` + 8 characters, Crockford Base32 (digits + letters, excluding I L O U) | `EVX-7F3K9QMD` |
| Handle (URL) | serial in lowercase | `evx-7f3k9qmd` |
| QR URL | `https://<PUBLIC_DOMAIN>/pages/authentic/<handle>` | `https://evlvex.com/pages/authentic/evx-7f3k9qmd` |
| Pair number (displayed) | `No. ` + 4 digits, sequential per model | `No. 0042` |

- About 1.1 trillion possible serials, so guessing a valid URL is not practical.
- QR codes always encode the **final public domain**, never `*.myshopify.com`, so printed tags keep working forever.

## 2. Page states
Template: `templates/metaobject/evlvex_certificate.json`.

| State | When | Page shows |
|---|---|---|
| **Assigned** | `buyer_name` is filled | Monogram seal · "Certificate of Authenticity" · **"Thank you, {buyer_name}"** · thank-you message (§3) · personal message (if any) · product image + name · **"The Story of Your Pair"**: pair number, artisan, finished on, pair note (each only if present) · model story excerpt + "Read the full story" (§5) · size · purchase date · serial · "Genuine EvlveX" seal · buttons: *Care for your pair*, *Discover the collection* |
| **Unassigned** | entry exists, no buyer yet | Monogram seal · "Genuine EvlveX" · "This pair is authentic. Its story is waiting for its owner." · product and pair chapter (if already recorded) · model story excerpt (if product is set) · serial · *Discover the collection* |
| **Unknown serial** | no entry with that handle | Shopify 404 page (with the "Verify your serial" link) |

## 3. Thank-you copy (editable in the theme editor)
> **Thank you, {Full Name}.**
>
> Every EvlveX begins as a story. This pair now carries yours. It was cut, stitched and finished by hand, and is registered in your name for as long as it walks with you. Take it somewhere worth remembering.
>
> *With gratitude,*
> *The House of EvlveX*

**"The Story of Your Pair" block** (renders only the lines whose fields are filled):
> *Pair No. {pair_number} of {model}.*
> *Finished by {artisan} on {finished_on}.*
> *"{pair_note}"*

## 4. Privacy & security rules
- The **full name** is shown publicly to anyone who scans the tag. The privacy policy must say so ([open items](../SPEC.md#open-items)).
- **Artisan names** are shown publicly: first name and initial only, and only with the artisan's written consent. Without consent, leave `artisan` empty.
- `order_number` and `batch` are **never** rendered in the HTML.
- Certificate pages carry `<meta name="robots" content="noindex,nofollow">`, so they never appear in Google. (Story pages, by contrast, **are** indexable.)
- Serials are random. There is no index page listing certificates.
- To remove a name (e.g. on request), clear `buyer_name`. The page falls back to the *Unassigned* state.

## 5. Data models

### 5.1 Certificate metaobject
Created by `npm run setup` ([qr-tooling.md §1](qr-tooling.md)), or manually in Admin → Settings → Custom data → Metaobjects → *Add definition*. Either way, the result must be:

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
| Product | `product` | Product reference | Yes (image, title and the model's story, via §5.2) |
| Size | `size` | Single line text | Yes |
| Purchase date | `purchase_date` | Date | Yes |
| Personal message | `personal_message` | Multi-line text | Yes, if present (gift dedication) |
| Pair number | `pair_number` | Integer | Yes, as `No. 0042` |
| Artisan | `artisan` | Single line text | Yes, if present ("Finished by …") |
| Finished on | `finished_on` | Date | Yes, if present |
| Pair note | `pair_note` | Multi-line text (≤ 200 chars) | Yes, if present |
| Order number | `order_number` | Single line text | **Never** |
| Batch | `batch` | Single line text | Never |

Entries are created as **Active**, so a tag scanned before the pair is sold still shows a valid "genuine" page.

`pair_number`, `artisan`, `finished_on` and `pair_note` belong to the **pair**, not the owner: un-assigning a pair keeps them.

### 5.2 Story metaobject
Each model story ([brand-and-content.md §6](brand-and-content.md)) is stored once and shared by the story page, the product page and every certificate of that model.

- Name: **EvlveX Story**
- Type (API handle): **`evlvex_story`**
- Capabilities:
  - **Online Store**: ON, with URL handle **`stories`** and template `evlvex_story`
  - **Publishable**: ON
- Display name field: `title`

| Field name | Key | Type | Example |
|---|---|---|---|
| Title | `title` | Single line text | *The Last Set at Dusk* |
| Chapter | `chapter` | Integer | `1` (shown as "Chapter 01") |
| Model | `model_name` | Single line text | Court 01 |
| Setting | `setting` | Single line text | *A seaside club, late summer.* |
| Excerpt | `excerpt` | Multi-line text (≤ 280 chars) | shown on product, cards and certificate |
| Story | `body` | Rich text | the full 90–150-word story |
| Signature detail | `signature_detail` | Multi-line text | how the story shows in the shoe |
| Hero plate | `hero_image` | File (image) | `story-court-01-01.jpg` |
| Plates | `gallery` | List of files (images) | 2–4 further story plates |
| Products | `products` | List of product references | Court 01 Ivory Sand, Court 01 Noir |

### 5.3 Product metafield
- **`evlvex.story`**, type metaobject reference → `evlvex_story`, set on every product.
- The product page, cart and certificate read the story through `product.metafields.evlvex.story`.
