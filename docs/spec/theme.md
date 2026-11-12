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
│   └── Product: The Silent Grind (Noir), A Fresh Start (Cream & Sand)
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
| **Home** | `index.json` | Brand first impression, route to stories and products | 1. **COMEBACK film**: full-screen 3D carousel, five scenes (COMEBACK → The Silent Grind → detail → A Fresh Start → detail) · 2. Brand statement "Falling behind is not the end." · 3. Featured collection "Two chapters, one comeback" · 4. Featured story · 5. "The Chapters": story cards · 6. Image-with-text "The Mark" (monogram) · 7. Multicolumn "Every pair, its own chapter" + link to Authenticity · 8. Newsletter | shoe photography ([shoe-images.md](../brand/shoe-images.md)) | film stacks the shoe above the copy; product grid 2 columns |
| **Collection** | `collection.json` | Browse | banner (story plate of the lead model), collection description written as a short story intro, product grid with filters (type, colorway, size) | collection image + description | 2 columns, filter drawer |
| **Product** | `product.json` | Convert through story | media gallery · eyebrow "CHAPTER 0X", title, price, size buttons, add to cart, one-line story excerpt under the price · **"The Story" section** (story plate + story body + signature detail + "Read the full story") · **Story carousel** (the product's own slides from `evlvex.story_slides`; hidden when there are none) · collapsible tabs: Materials & Craft, Size & Fit, Care, Shipping & Returns, Your Pair's Certificate · "You may also admire" | 5–8 product images + 1–2 story plates, size chart, materials text, linked story | gallery swipes, sticky add-to-cart area under gallery |
| **The Stories** (index) | `page.stories.json` | Read before you buy | intro rich text ("Every EvlveX begins as a story…") · grid of all active story entries, newest chapter first (plate, chapter number, title, setting, excerpt) | — (pulls from story metaobjects) | 1 column |
| **Story** | `metaobject/evlvex_story.json` | Long-form story per model | Noir opener: chapter eyebrow, title (Cormorant italic), setting line, full-bleed plate · story body (Bone, reading width) · plate gallery · signature detail (image-with-text) · the model's products ("Wear the story") · next / previous chapter | from the story entry | stacked, reading width 100% minus 24 px gutters |
| **The Maison** | `page.about.json` | The house and its makers | image banner (atelier), rich text "Every pair has a story", image-with-text ×2: *The Atelier*, *The Workshop Card* | house story, atelier photography | stacked |
| **Care** | `page.care.json` | Aftercare (linked from certificate) | intro + collapsible care steps per material (smooth leather, suede, woven leather, soles) | care instructions per material | stacked |
| **Authenticity** | `page.authenticity.json` | Explain the QR program; manual serial lookup | intro, "How it works" 3 steps, **serial lookup form** | packaging imagery (family D) | full-width input |
| **Certificate** | `metaobject/evlvex_certificate.json` | Thank-you, the pair's story, proof of authenticity | see [qr-certificates.md §2](qr-certificates.md) | populated automatically per pair | single column; thank-you and seal fit one phone screen above the fold |
| **Cart** | `cart.json` | Review | line items (story title in italic under each product name) · subtotal and checkout · "The EvlveX promise" (shipping, certificate, 14-day returns) · "You may also admire" | — | stacked |
| **Search** | `search.json` | Find | results grid (portrait cards) with filters · "Perhaps you were looking for" | — | 2 columns |
| **All collections** | `list-collections.json` | Browse families | intro "The Collection" · collection cards · "The Stories" cards | collection images | 2 columns |
| **The Journal** (blog) | `blog.json` | Brand content | intro "Notes from the Maison" · article grid · newsletter | article images | 1 column |
| **Article** | `article.json` | Read | featured image, title, content, share · "More from the Journal" · newsletter | article image | stacked |
| **Page** (generic) | `page.json` | Shipping, privacy and other text pages | page content · "Client care" strip (Contact, Care guide) | — | stacked |
| **Contact** | `page.contact.json` | Write to the Maison | atelier banner · page content · atelier / client care / certificate details · contact form | atelier image | stacked |
| **Gift card** | `gift_card.liquid` | Show a gift card | EvlveX card (monogram + wordmark on Noir) unless a logo is uploaded | — | — |
| **404** | `404.json` | Recovery | message, "Return to the Maison", link to Authenticity | — | — |

## 5. Implementation rules
- **Story data:** product page, cart line, certificate and home "Featured story" read the story through `product.metafields.evlvex.story.value` (definition in [qr-certificates.md §5](qr-certificates.md)). If a product has no story, hide the section and the excerpt line; never render empty headings.
- **Stories index:** list entries from `shop.metaobjects.evlvex_story.values`, sorted by `chapter`, descending.
- **Story pages are indexable:** meta title = story title + " — " + model name; meta description = excerpt; `og:image` = hero plate.
- **Certificate pages are not indexable:** see the privacy rules in [qr-certificates.md §4](qr-certificates.md).
- **Serial lookup form** (Authenticity page): accept any case, with or without `EVX-`; normalise to the handle format and redirect to `/pages/authentic/<handle>`.
- **Copy** lives in section settings so it can be edited in the theme editor; default values come from [brand-and-content.md §8](brand-and-content.md).
- **Images:** use `image_url` with `width` and responsive `srcset`; every image needs alt text.
- **Story carousel** (`sections/evlvex-story-carousel.liquid`): one reusable section with two slide sources.
  - *Slides: Section blocks* is for the home page and any other page.
  - *Slides: Product story slides* is for the product template. It reads `product.metafields.evlvex.story_slides.value` ([qr-certificates.md §5.4](qr-certificates.md)) and outputs nothing on products without slides. The theme editor shows a notice instead.
  - Behaviour: native scroll-snap plus `assets/evlvex-story-carousel.js` (`<evlvex-story-carousel>`). It has arrows, dots, swipe and arrow/Home/End keys. Autoplay is optional; it pauses on hover, keyboard focus, a hidden tab, when the carousel is off-screen and when a block is selected in the theme editor, and it starts paused for visitors who prefer reduced motion.
  - Images: only the first slide's image may load eagerly, and only when the section is one of the first two on the page. When a slide becomes active, the next slide's image starts loading.
- **Missing plates:** until story plates are uploaded, `snippets/evlvex-story-plate.liquid` shows a Noir panel with the gold monogram and the story title, never a broken or stock image.
- **Only EvlveX shoes, ever.** Wherever no image has been chosen, `snippets/evlvex-demo-image.liquid` shows graded photography of the two COMEBACK models ([docs/brand/shoe-images.md](../brand/shoe-images.md)) instead of Dawn's clothing illustrations. This covers image sections, product, collection and article cards, products without media, article pages and story plates. The setting is Theme settings → **EvlveX → Show demo photography**; with it off, those spots show the monogram plate. Sample product cards are named *The Silent Grind — Noir* and *A Fresh Start — Sand*, with a sample price.
- **COMEBACK film** (`sections/evlvex-comeback-film.liquid`, `assets/evlvex-comeback-film.{css,js}`): scenes turn in 3D; each shot has a camera move (push, pull, pan); the shoe tilts with the pointer and floats when idle; copy reveals in sequence; the timeline fills like a video scrubber. It pauses on keyboard focus, when the tab is hidden or the film is scrolled away, and while a scene block is selected in the theme editor. Under *prefers-reduced-motion* it uses a simple crossfade and starts paused. Scenes are blocks: shoe (The Silent Grind / A Fresh Start / both) and shot (full / monogram / suede, laces and sole), or an uploaded image.
- **No Shopify branding:** the footer shows *Every pair has a story.* instead of "Powered by Shopify"; the password page, gift card and favicon use the EvlveX marks.
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
| Story carousel | `sections/evlvex-story-carousel.liquid`, `snippets/evlvex-story-slide.liquid`, `assets/evlvex-story-carousel.css`, `assets/evlvex-story-carousel.js`; added to `templates/index.json` (after the statement) and `templates/product.json` (after "The Story") |
| Logos | original artwork in `docs/brand/logos/`; `snippets/evlvex-monogram.liquid`, new `snippets/evlvex-wordmark.liquid`, `snippets/evlvex-logo.liquid`, `assets/evlvex-monogram.svg` (favicon) |
| Demo photography & every page | `snippets/evlvex-demo-image.liquid`, `assets/evx-{sg,fs,comeback}-*.jpg`, `docs/brand/shoe-images.md`; demo fallbacks in `sections/{collage,featured-blog,featured-product,footer,image-banner,image-with-text,multirow,slideshow,video,main-article,main-product}.liquid` and `snippets/{card-product,card-collection,article-card,evlvex-story-plate}.liquid`; Theme setting *EvlveX → Show demo photography* (`config/settings_schema.json`); page content in `templates/{cart,search,list-collections,blog,article,page,page.contact}.json`; `templates/gift_card.liquid`; "Powered by Shopify" removed in `sections/footer.liquid`; page styles in `assets/evlvex-luxury.css` |
| COMEBACK | `sections/evlvex-comeback-film.liquid`, `assets/evlvex-comeback-film.css`, `assets/evlvex-comeback-film.js`; story copy in `templates/{index,page.about,page.care,page.stories,product}.json`, `sections/header-group.json`, `snippets/evlvex-sample-product.liquid` |
| Shared | `snippets/evlvex-chapter-label.liquid`, `snippets/evlvex-story-plate.liquid`, `assets/evlvex-story.css`; Cormorant italic loaded in `layout/theme.liquid` |
| Copy | `templates/index.json`, `product.json`, `page.about.json`, `page.care.json`, `page.authenticity.json`, `collection.json`, `sections/header-group.json` (mega menu), `sections/footer-group.json`, `sections/main-404.liquid`, brand text in `config/settings_data.json` |

Menus, collections, products and story entries are store data, created during store setup ([deployment.md §5](deployment.md)).
