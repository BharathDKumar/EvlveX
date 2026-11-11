# EvlveX — Theme (Website Code) Specification

Part of the [EvlveX specification](../SPEC.md). **Audience:** theme developers.

The store runs **Dawn 16.1.1, customised**. Brand rules (palette, fonts, voice, imagery) are in [brand-and-content.md](brand-and-content.md); the certificate page's behaviour is in [qr-certificates.md](qr-certificates.md).

---

## 1. Theme settings

**Color schemes** (Theme settings → Colors), using the palette in [brand-and-content.md §2](brand-and-content.md):

| Scheme | Background | Text | Button / label | Used for |
|---|---|---|---|---|
| scheme-1 *Ivory* | Ivory | Noir | Noir / Ivory | default pages, header |
| scheme-2 *Bone* | Bone | Noir | Noir / Bone | product cards, alternate sections, story text |
| scheme-3 *Noir* | Noir | Ivory | Sand-gold / Noir | hero, story openers, certificate page, announcement bar |
| scheme-4 *Sand* | Sand | Noir | Noir / Sand | feature blocks, newsletter |
| scheme-5 *Noir footer* | Noir | Ivory | Ivory / Noir | footer |

**Typography:** headings `cormorant_n4` (scale 130%), body `jost_n4`. Story body, eyebrow and button styles per [brand-and-content.md §3](brand-and-content.md), implemented in `assets/evlvex-luxury.css`.

## 2. Site map

```
Home
├── Shop (collection: all, "The Collection")
│   ├── Sneakers / Loafers & Mules / Formal / Boots
│   └── Product: Court 01 Ivory Sand, Court 01 Noir, Promenade Loafer Cognac, …
├── The Stories (index)                /pages/the-stories
│   └── Story (one per model)          /pages/stories/<story-handle>
├── The Maison (about)                 /pages/the-maison
├── Care                               /pages/care
├── Authenticity                       /pages/authenticity
│   └── Certificate (one per pair)     /pages/authentic/<serial>
├── Cart → Shopify checkout
└── 404
```

> Do not create ordinary pages with the handles `stories` or `authentic`; those URL prefixes belong to the story and certificate metaobjects.

## 3. Global elements
- **Announcement bar** (Noir): copy in [brand-and-content.md §8](brand-and-content.md).
- **Header** (Ivory): logo centred, menu centred below it, search / account / cart icons on the right. Sticky when scrolling up.
- **Main menu:** Shop (mega menu: The Collection, Sneakers, Loafers & Mules, Formal, Boots), The Stories, The Maison, Authenticity.
- **Footer** (Noir footer): "Join the Maison: receive each new chapter first" newsletter, menus (Shop, Stories, Maison, Client Care), social icons, payment icons, signature line *Every pair has a story.*

## 4. Page specifications

| Page | Template | Purpose | Sections (in order) | Content needed | Mobile |
|---|---|---|---|---|---|
| **Home** | `index.json` | Brand first impression, route to stories and products | 1. Full-bleed hero (Noir, story plate, copy per [brand-and-content.md §8](brand-and-content.md)) · 2. Brand statement (rich text) · 3. Featured collection "The Collection" (all models) · 4. Featured story (story plate + excerpt + "Read the story"; story entry chosen in theme editor) · 5. "The Stories": 3 story cards (plate, chapter number, title, model, excerpt) · 6. Image-with-text "From the Atelier" (hands, workshop card) · 7. Multicolumn "Every pair, its own chapter" + link to Authenticity · 8. Newsletter | hero plate 16:9 + 4:5, story plates, atelier image | hero stacks text under image; product grid 2 columns; story cards swipe |
| **Collection** | `collection.json` | Browse | banner (story plate of the lead model), collection description written as a short story intro, product grid with filters (type, colorway, size) | collection image + description | 2 columns, filter drawer |
| **Product** | `product.json` | Convert through story | media gallery · eyebrow "CHAPTER 0X", title, price, size buttons, add to cart, one-line story excerpt under the price · **"The Story" section** (story plate + story body + signature detail + "Read the full story") · collapsible tabs: Materials & Craft, Size & Fit, Care, Shipping & Returns, Your Pair's Certificate · "You may also admire" | 5–8 product images + 1–2 story plates, size chart, materials text, linked story | gallery swipes, sticky add-to-cart area under gallery |
| **The Stories** (index) | `page.stories.json` | Read before you buy | intro rich text ("Every EvlveX begins as a story…") · grid of all active story entries, newest chapter first (plate, chapter number, title, setting, excerpt) | — (pulls from story metaobjects) | 1 column |
| **Story** | `metaobject/evlvex_story.json` | Long-form story per model | Noir opener: chapter eyebrow, title (Cormorant italic), setting line, full-bleed plate · story body (Bone, reading width) · plate gallery · signature detail (image-with-text) · the model's products ("Wear the story") · next / previous chapter | from the story entry | stacked, reading width 100% minus 24 px gutters |
| **The Maison** | `page.about.json` | The house and its makers | image banner (atelier), rich text "Every pair has a story", image-with-text ×2: *The Atelier*, *The Workshop Card* | house story, atelier photography | stacked |
| **Care** | `page.care.json` | Aftercare (linked from certificate) | intro + collapsible care steps per material (smooth leather, suede, woven leather, soles) | care instructions per material | stacked |
| **Authenticity** | `page.authenticity.json` | Explain the QR program; manual serial lookup | intro, "How it works" 3 steps, **serial lookup form** | packaging imagery (family D) | full-width input |
| **Certificate** | `metaobject/evlvex_certificate.json` | Thank-you, the pair's story, proof of authenticity | see [qr-certificates.md §2](qr-certificates.md) | populated automatically per pair | single column; thank-you and seal fit one phone screen above the fold |
| **Cart** | `cart.json` | Review | Dawn default, restyled; each line shows the model's story title in italic under the product name | — | — |
| **404** | `404.json` | Recovery | message, "Return to the Maison", link to Authenticity | — | — |

## 5. Implementation rules
- **Story data:** product page, cart line, certificate and home "Featured story" read the story through `product.metafields.evlvex.story.value` (definition in [qr-certificates.md §5](qr-certificates.md)). If a product has no story, hide the section and the excerpt line; never render empty headings.
- **Stories index:** list entries from `shop.metaobjects.evlvex_story.values`, sorted by `chapter`, descending.
- **Story pages are indexable:** meta title = story title + " — " + model name; meta description = excerpt; `og:image` = hero plate.
- **Certificate pages are not indexable:** see the privacy rules in [qr-certificates.md §4](qr-certificates.md).
- **Serial lookup form** (Authenticity page): accept any case, with or without `EVX-`; normalise to the handle format and redirect to `/pages/authentic/<handle>`.
- **Copy** lives in section settings so it can be edited in the theme editor; default values come from [brand-and-content.md §8](brand-and-content.md).
- **Images:** use `image_url` with `width` and responsive `srcset`; every image needs alt text.
- **Missing plates:** until story plates are uploaded, `snippets/evlvex-story-plate.liquid` shows a Noir panel with the gold monogram and the story title, never a broken or stock image.
- Run `shopify theme check` before every push ([deployment.md §2](deployment.md)).

## 6. Changes from v1.0 (implemented in v1.1)

| Area | Files |
|---|---|
| Story page | `templates/metaobject/evlvex_story.json`, `sections/main-story.liquid` (opener, body, signature detail, plates, "Wear the story", previous / next chapter) |
| Stories index & home cards | `templates/page.stories.json`, `sections/evlvex-stories-grid.liquid`, `snippets/evlvex-story-card.liquid`, `snippets/evlvex-story-handles.liquid` (sorting by chapter) |
| Home featured story | `sections/evlvex-featured-story.liquid` (story picked in the theme editor; newest chapter by default) |
| Product page | `sections/evlvex-product-story.liquid`; new **EvlveX story line** block in `sections/main-product.liquid` (chapter eyebrow above the title, excerpt under the price) |
| Cart | story title under the product name in `snippets/cart-drawer.liquid` and `sections/main-cart-items.liquid` |
| Certificate | `sections/main-certificate.liquid`: "The Story of Your Pair" block, model story excerpt, new Unassigned copy |
| SEO | `layout/theme.liquid`, `snippets/meta-tags.liquid`: story pages indexable with their own title, description and image; every other metaobject page `noindex` |
| Shared | `snippets/evlvex-chapter-label.liquid`, `snippets/evlvex-story-plate.liquid`, `assets/evlvex-story.css`; Cormorant italic loaded in `layout/theme.liquid` |
| Copy | `templates/index.json`, `product.json`, `page.about.json`, `page.care.json`, `page.authenticity.json`, `collection.json`, `sections/header-group.json` (mega menu), `sections/footer-group.json`, `sections/main-404.liquid`, brand text in `config/settings_data.json` |

Menus, collections, products and story entries are store data, created during store setup ([deployment.md §5](deployment.md)).
