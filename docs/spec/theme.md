# EvlveX — Theme (Website Code) Specification

Part of the [EvlveX specification](../SPEC.md). **Audience:** theme developers.

The store runs **Dawn 16.1.1, customised**. Brand rules (palette, fonts, voice, imagery) are in [brand-and-content.md](brand-and-content.md); the certificate page's behaviour is in [qr-certificates.md](qr-certificates.md).

---

## 1. Theme settings

**Color schemes** (Theme settings → Colors), using the palette in [brand-and-content.md §2](brand-and-content.md):

| Scheme | Background | Text | Button / label | Used for |
|---|---|---|---|---|
| scheme-1 *White* | White | Black | Black / White | default pages, header |
| scheme-2 *Light grey* | Light grey | Black | Black / Light grey | product cards, alternate sections, story text |
| scheme-3 *Black* | Black | White | White / Black | hero, story openers, certificate page, announcement bar |
| scheme-4 *Grey* | Grey | Black | Black / Grey | feature blocks, newsletter, sale badge |
| scheme-5 *Black footer* | Black | White | White / Black | footer |

**Typography:** headings `archivo_n8` (scale 120%), body `archivo_n4`. Buttons, size chips and badges are pills (radius 40); card text is left-aligned. Story body, eyebrow and button styles per [brand-and-content.md §3](brand-and-content.md), implemented in `assets/evlvex-luxury.css`.

## 2. Site map

```
Home
├── Shop (collection: all, "The Collection")
│   ├── The Silent Grind / A Fresh Start (one collection per chapter, optional)
│   └── Product: The Silent Grind (Noir), A Fresh Start (Cream & Sand)
├── The Stories (index)                /pages/the-stories
│   └── Story (one per model)          /pages/stories/<story-handle>
├── About ("Built for the comeback")   /pages/about
├── Care                               /pages/care
├── Authenticity                       /pages/authenticity
│   └── Certificate (one per pair)     /pages/authentic/<serial>
├── Contact                            /pages/contact
├── Help: FAQ                          /pages/faq
│   ├── Size guide                     /pages/size-guide
│   ├── Track your order               /pages/track-your-order
│   └── Shipping & returns             /pages/shipping-returns
├── Policies (Shopify)                 /policies/…
├── Cart → Shopify checkout
├── Account (Shopify-hosted login; popup in the header)
└── 404
```

> Do not create ordinary pages with the handles `stories` or `authentic`; those URL prefixes belong to the story and certificate metaobjects.

## 3. Global elements
- **Announcement bar** (Black): copy in [brand-and-content.md §8](brand-and-content.md).
- **Header** (White): logo centred, menu centred below it, search / account / cart icons on the right. Sticky when scrolling up.
- **Main menu:** Shop (The Collection, The Silent Grind, A Fresh Start), The Chapters (stories), About, Authenticity. *(Store data: the store currently shows Shopify's default menu.)*
- **Footer** (Black footer, `sections/evlvex-footer.liquid` + `assets/section-evlvex-footer.css`; Dawn's `footer.liquid` is kept unused as a fallback). Top to bottom:
  - statement "Keep going." and the newsletter (bare underline field with a round arrow button)
  - four columns: Shop, COMEBACK and Help link columns, plus Get in touch. Link columns take a menu when one is chosen, otherwise their own links, and they are accordions on mobile. Get in touch has labelled support email and Instagram lines and the social icons.
  - full-width wordmark
  - one-line legal bar: © year EvlveX, Made in India, a trust line, policy links, country and currency, greyscale payment icons
  - Each element appears once.

## 4. Page specifications

| Page | Template | Purpose | Sections (in order) | Content needed | Mobile |
|---|---|---|---|---|---|
| **Home** | `index.json` | Brand first impression, route to stories and products | **Street Drop** (v1.12): 1. **Drop hero** (`evlvex-drop-hero`): carousel of three slides (COMEBACK with the monogram card, The Silent Grind, A Fresh Start), each a giant condensed word (half solid, half outlined) on a light grid, a tilted photo card with a round sticker, spec labels in the corners (collection, model CB-01 and colourway, chapter) and a button; autoplay 8 s, dots, swipe, arrow keys, pauses on hover/focus, still under reduced motion · 2. **Ticker tape** (`evlvex-tape`), tilted black band · 3. **The drop** (`evlvex-drop-grid`): two spec cards (photo, number, chapter chip, title, model / colourway / sizes / run, live price, Shop) · 4. **The standard** (`evlvex-standard`): four boxed columns 01–04, the second in black · 5. **Manifesto** (`evlvex-manifesto`): "Knocked down. Never out." on a black grid, the COMEBACK code in two columns · 6. **Authenticity** (`evlvex-authenticity`): "Registered to you", three steps, a hang-tag certificate labelled *Example* · 7. featured story and stories grid (hidden until story entries exist) | campaign crops (`assets/evx-*.jpg`), product photos | hero: word above the card; everything stacked, 2-column standard grid |
| **Collection** | `collection.json` | Browse | banner (story plate of the lead model), collection description written as a short story intro, product grid with filters (type, colorway, size) | collection image + description | 2 columns, filter drawer |
| **Product** | `product.json` | Convert through story | **Street Drop** (v1.12): main product with a black chapter chip (fallback "COMEBACK series"), giant condensed title, price between two rules, black limited-edition box, boxed size buttons, black pill *Add to cart*, **EvlveX assurance** chips (free shipping across India · 7-day returns & size exchange · numbered, certificate in your name), bordered accordions · ticker tape · **Story of this pair** (`evlvex-pair-story`): black grid band, tilted photo, the model's official chapter text, picked by product · **The other chapter** (`evlvex-drop-grid`, *Hide the product being viewed*): the other model as one wide spec card | product photos; campaign crops in the story and other-chapter card | stacked |
| **The Stories** (index) | `page.stories.json` | Read before you buy | **EvlveX opener** (black, full screen, monogram): "COMEBACK", the comeback intro, *Never give up. Make your comeback.*, chapter links 01 / 02 that jump down the page · **EvlveX chapter** ×2: *The Silent Grind* (black, photo left, anchor `the-silent-grind`) and *A Fresh Start* (white, photo right, anchor `a-fresh-start`), each with its story, closing statement and shop button · grid "Read each chapter" of all active story entries, newest chapter first (hidden until entries exist) | — (pulls from story metaobjects) | 1 column |
| **Story** | `metaobject/evlvex_story.json` | Long-form story per model | Black opener: chapter eyebrow, title (bold uppercase), setting line, full-bleed plate · story body (Light grey, reading width) · plate gallery · signature detail (image-with-text) · the model's products ("Wear the story") · next / previous chapter | from the story entry | stacked, reading width 100% minus 24 px gutters |
| **About** | `page.about.json` | The story behind the house | **EvlveX opener** (black, monogram): "About EvlveX", the name (*derived from the word Evolution*) and the brand belief · rich text "One story, two chapters" · multicolumn "Four steps of a comeback" (The Fall, The Grind, The Turn, The Comeback) · **EvlveX chapter** ×2: *The Silent Grind*, *A Fresh Start* (shop button and a link to that chapter on the Stories page) · rich text "Shoes for the long way back" (black) | detail photography | stacked |
| **Care** | `page.care.json` | Aftercare (linked from certificate) | intro "Keep your comeback going" + collapsible care steps: before first wear, smooth panels, suede, midsoles & laces, storage, repairs | — | stacked |
| **Authenticity** | `page.authenticity.json` | Explain the QR program; manual serial lookup | intro, "How it works" 3 steps, **serial lookup form** | packaging imagery (family D) | full-width input |
| **Certificate** | `metaobject/evlvex_certificate.json` | Thank-you, the pair's story, proof of authenticity | see [qr-certificates.md §2](qr-certificates.md) | populated automatically per pair | single column; thank-you and seal fit one phone screen above the fold |
| **Cart** | `cart.json` | Review | line items (story title in italic under each product name) · subtotal and checkout · "The EvlveX promise" (free shipping across India, certificate, 7-day returns and size exchange) · "You may also admire" | — | stacked |
| **Search** | `search.json` | Find | results grid (portrait cards) with filters · "Perhaps you were looking for" | — | 2 columns |
| **All collections** | `list-collections.json` | Browse families | intro "The Collection" · collection cards · "The Stories" cards | collection images | 2 columns |
| **The Journal** (blog) | `blog.json` | Brand content | intro "Journal" · article grid (the newsletter is in the footer) | article images | 1 column |
| **Article** | `article.json` | Read | featured image, title, content, share · "More from the Journal" · newsletter | article image | stacked |
| **Page** (generic) | `page.json` | Shipping, privacy and other text pages | page content · "Need help?" strip (Contact us, FAQ) | — | stacked |
| **Contact** | `page.contact.json` | Contact us | banner "Contact us" · page content · Order help / Customer support / Instagram / Authenticity columns · "Send us a message" form | shoe image | stacked |
| **FAQ** | `page.faq.json` | Quick answers | intro · collapsible groups: Orders & payment, Shipping & delivery, Returns & exchanges, Sizing & care, Authenticity · "Still need help?" | — | stacked |
| **Size guide** | `page.size-guide.json` | Choose a size | intro · `evlvex-size-guide` table for model CB-01, unisex, UK 6–10 (UK/India, Men's US, Women's US, EU, foot length in cm and inches; one block per row; empty column label hides a column) · fit advice for men and women · "How to measure your foot" · help | — | table scrolls sideways |
| **Track your order** | `page.track-order.json` | Delivery status | intro · 3 steps (confirmed, dispatched, delivered) · "Where is my tracking link?" · My account / Contact us | — | stacked |
| **Shipping & returns** | `page.shipping-returns.json` | Summary of the policies | intro · 4-point summary · "How to return or exchange" · buttons to the Shipping and Refund policies | — | stacked |
| **Gift card** | `gift_card.liquid` | Show a gift card | EvlveX card (white monogram + wordmark on Black) unless a logo is uploaded | — | — |
| **404** | `404.json` | Recovery | "Error 404" · "Page not found" · Continue shopping / Go to homepage · product search · quick links (Shop all, Size guide, FAQ, Track your order, Contact us) · "Scanned a QR tag? Verify your pair." | — | — |

## 5. Implementation rules
- **Story data:** product page, cart line, certificate and home "Featured story" read the story through `product.metafields.evlvex.story.value` (definition in [qr-certificates.md §5](qr-certificates.md)). If a product has no story, hide the section and the excerpt line; never render empty headings.
- **Stories index:** list entries from `shop.metaobjects.evlvex_story.values`, sorted by `chapter`, descending.
- **Story pages are indexable:** meta title = story title + " — " + model name; meta description = excerpt; `og:image` = hero plate.
- **Certificate pages are not indexable:** see the privacy rules in [qr-certificates.md §4](qr-certificates.md).
- **Structured data and sharing (v1.7):**
  - **Organization:** the header outputs it with the home URL, the uploaded logo or else `assets/evlvex-monogram.svg`, and only the social links that are filled in. The home page also gets *WebSite* with a search action.
  - **Breadcrumbs:** `snippets/evlvex-breadcrumbs-schema.liquid` adds a *BreadcrumbList* on product, collection, article, page and story pages, never on certificates.
  - **Share image:** pages without their own image use `assets/evx-fs-wide.jpg`, always over https.
  - **Alt text:** product photos without alt text in Admin use the product title (gallery, zoom modal, product card).
- **Serial lookup form** (Authenticity page): accept any case, with or without `EVX-`; normalise to the handle format and redirect to `/pages/authentic/<handle>`.
- **Copy** lives in section settings so it can be edited in the theme editor; default values come from [brand-and-content.md §8](brand-and-content.md).
- **Images:** use `image_url` with `width` and responsive `srcset`; every image needs alt text.
- **Story carousel** (`sections/evlvex-story-carousel.liquid`): one reusable section with two slide sources.
  - *Slides: Section blocks* is for the home page and any other page.
  - *Slides: Product story slides* is for the product template. It reads `product.metafields.evlvex.story_slides.value` ([qr-certificates.md §5.4](qr-certificates.md)) and outputs nothing on products without slides. The theme editor shows a notice instead.
  - Behaviour: native scroll-snap plus `assets/evlvex-story-carousel.js` (`<evlvex-story-carousel>`). It has arrows, dots, swipe and arrow/Home/End keys. Autoplay is optional; it pauses on hover, keyboard focus, a hidden tab, when the carousel is off-screen and when a block is selected in the theme editor, and it starts paused for visitors who prefer reduced motion.
  - Images: only the first slide's image may load eagerly, and only when the section is one of the first two on the page. When a slide becomes active, the next slide's image starts loading.
- **Missing plates:** until story plates are uploaded, `snippets/evlvex-story-plate.liquid` shows a Black panel with the white monogram and the story title, never a broken or stock image.
- **Only EvlveX shoes, ever.** Wherever no image has been chosen, `snippets/evlvex-demo-image.liquid` shows graded photography of the two COMEBACK models ([docs/brand/shoe-images.md](../brand/shoe-images.md)) instead of Dawn's clothing illustrations. This covers image sections, product, collection and article cards, products without media, article pages and story plates. The setting is Theme settings → **EvlveX → Show demo photography**; with it off, those spots show the monogram plate. Sample product cards are named *The Silent Grind — Noir* and *A Fresh Start — Sand*, with a sample price.
- **COMEBACK film** (`sections/evlvex-comeback-film.liquid`, `assets/evlvex-comeback-film.{css,js}`): scenes turn in 3D; each shot has a camera move (push, pull, pan); the shoe tilts with the pointer and floats when idle; copy reveals in sequence; the timeline fills like a video scrubber. It pauses on keyboard focus, when the tab is hidden or the film is scrolled away, and while a scene block is selected in the theme editor. Under *prefers-reduced-motion* it uses a simple crossfade and starts paused. Scenes are blocks: shoe (The Silent Grind / A Fresh Start / both) and shot (full / monogram / suede, laces and sole), or an uploaded image.
- **No Shopify branding:** the footer shows *Every pair has a story.* instead of "Powered by Shopify"; the password page, gift card and favicon use the EvlveX marks.
- Run `shopify theme check` **and** `node tools/validate-templates.js` before every push ([deployment.md §2](deployment.md)). Template setting values must match their section schema exactly: a range value on its step (e.g. overlay opacity 30, not 35), a select value from its options, an existing block type. Otherwise Shopify **silently rejects the whole template file** when the GitHub-connected theme syncs, and the live store keeps the old version. This happened to `index.json`, `page.about.json` and `page.contact.json` until 13 Nov 2026.
- Leave out unset image and URL settings in template JSON rather than writing empty strings.

## 6. Changes by version

v1.1, v1.2 (13 Nov 2026), v1.3 and v1.4, v1.5 and v1.6 (15 Nov 2026) and v1.7 (18 Nov 2026) are implemented as listed. v1.2 rows: story carousel, logos, demo photography & every page, COMEBACK. v1.3 row: Black & white. v1.4 row: Colour photography, policies & contact. v1.5 row: Footer & COMEBACK literature. v1.6 row: Standard pages. v1.7 row: SEO.

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
| Password page & gift card | `layout/password.liquid` (EvlveX styles, favicon), `sections/main-password-header.liquid` (logo lockup), `templates/gift_card.liquid` (EvlveX card) |
| Tooling | `tools/validate-templates.js` (template values against schemas), `tools/build-shoe-images.js` (graded shoe crops) |
| Shared | `snippets/evlvex-chapter-label.liquid`, `snippets/evlvex-story-plate.liquid`, `assets/evlvex-story.css` |
| Black & white (v1.3) | color schemes, fonts (Archivo) and pill radii in `config/settings_data.json`; `assets/evlvex-luxury.css` (tokens, bold uppercase headings, pill buttons, no gold); `assets/evlvex-comeback-film.css`, `assets/evlvex-story.css`, `assets/evlvex-story-carousel.css`, `assets/section-certificate.css`; gold removed from `sections/main-404.liquid`, `templates/gift_card.liquid`, `assets/evlvex-monogram.svg`, `tools/qr-certificates/src/qr.js`; `evx-eyebrow--gold` renamed `evx-eyebrow--strong`; `layout/theme.liquid` no longer loads a heading italic; images regraded by `tools/build-shoe-images.js`, `assets/sample-court-noir.jpg` made greyscale |
| Colour photography, policies & contact (v1.4) | campaign photos in `docs/brand/campaign/`, cropped in true colour by `tools/build-shoe-images.js` into `assets/evx-*.jpg`; new sizes in `sections/evlvex-comeback-film.liquid` and `snippets/evlvex-demo-image.liquid`; Fresh Start film scenes set to the dark tone (`templates/index.json`); film backdrop no longer desaturated (`assets/evlvex-comeback-film.css`); store policies for Admin in `docs/policies/`; 7-day returns, free shipping and prepaid copy in `templates/product.json`, `templates/cart.json`, `sections/header-group.json`; Instagram link (`config/settings_data.json`) and support@evlvex.in on `templates/page.contact.json`, `templates/page.json` and a footer *Contact* column (`sections/footer-group.json`) |
| Footer & COMEBACK literature (v1.5) | new `sections/evlvex-footer.liquid` and `assets/section-evlvex-footer.css`; `sections/footer-group.json` switched to it; home manifesto added and the "Every pair, its own chapter" and newsletter sections removed (`templates/index.json`); "Four steps of a comeback" and "Shoes for the long way back" on `templates/page.about.json`; one line added to `templates/page.stories.json` |
| Standard pages (v1.6) | new `templates/page.{faq,size-guide,track-order,shipping-returns}.json` and `sections/evlvex-size-guide.liquid`; plain 404 (`sections/main-404.liquid`, `templates/404.json`); standard wording in `page.contact.json`, `page.json`, `page.care.json`, `cart.json`, `product.json` (plus a Size & fit tab), `search.json`, `list-collections.json`, `blog.json`, `article.json` (duplicate newsletters removed); About now at `/pages/about`; footer wordmark removed and Help column extended (`sections/evlvex-footer.liquid`, `sections/footer-group.json`); account popup colours fixed in `sections/header.liquid`; *Log in* link in `snippets/header-drawer.liquid` |
| SEO (v1.7) | Organization / WebSite structured data in `sections/header.liquid`; new `snippets/evlvex-breadcrumbs-schema.liquid`, rendered from `layout/theme.liquid` (which also gets a `theme-color`); default share image and https in `snippets/meta-tags.liquid`; product title as fallback alt text in `snippets/{product-thumbnail,product-media,card-product}.liquid`; store SEO steps in [deployment.md §5](deployment.md) |
| Limited edition (v1.7) | products tagged *Limited edition* (tag and badge text in Theme settings → EvlveX → Limited edition, `config/settings_schema.json`) get a card badge (`snippets/evlvex-limited-badge.liquid`, from `snippets/card-product.liquid`; Sold out and Sale badges take precedence) and a bordered line under the price (new **EvlveX limited edition** block in `sections/main-product.liquid`, `snippets/evlvex-limited.liquid`, styles in `assets/evlvex-luxury.css`, added to `templates/product.json`); announcement *COMEBACK · Limited edition · Numbered pairs* → `/collections/all` (v1.8 wording) (`sections/header-group.json`). Wording rules in [brand-and-content.md §6](brand-and-content.md) |
| Premium copy (v1.8) | positioning and true-claims pass ([brand-and-content.md §4](brand-and-content.md)): new home multicolumn *The EvlveX standard* (`templates/index.json`), three announcements (`sections/header-group.json`), product tab *Design & make* and limited-run text (`templates/product.json`, `sections/main-product.liquid` defaults), two FAQ questions (`templates/page.faq.json`); handmade / artisan / workshop-card / leather / suede wording removed from `templates/{cart,page.authenticity,page.care,page.faq,page.shipping-returns,list-collections,page.about}.json`, `sections/main-certificate.liquid` and `sections/evlvex-story-carousel.liquid` defaults, `snippets/evlvex-demo-image.liquid` alt text, `config/settings_data.json` brand description; authenticity fallback image `evx-sg-full.jpg` (`sections/authenticity-lookup.liquid`, `locales/en.default.json`); Organization `description` (`sections/header.liquid`); share image re-rendered (`assets/evx-share.png`) |
| Home layout (v1.9) | film: three scenes, new *EvlveX monogram (no shoe)* scene option, whole-scene link (`.evx-film__hit`), timeline and buttons behind a new *Show timeline and buttons* setting (off), multi-paragraph scene text, scene length 10 s (max 16), scenes stacked in one grid cell so long copy is never clipped (`sections/evlvex-comeback-film.liquid`, `assets/evlvex-comeback-film.{css,js}`); brand statement and "The Mark" removed (`templates/index.json`); featured collection centres a grid of one column per product when there are fewer products than columns (`sections/featured-collection.liquid`, `assets/evlvex-luxury.css`); header logo left with the menu on the same row, padding 12/12, always sticky and shorter once scrolled (*Sticky header: always, reduce logo size* in `sections/header-group.json`; 6 px padding and a smaller logo lockup in `assets/evlvex-luxury.css`); home-only back-to-top icon button (`layout/theme.liquid`, `.evx-back-to-top` in `assets/evlvex-luxury.css`, label `general.back_to_top` in every `locales/*.json`) |
| About & Story literature (v1.10) | new `sections/evlvex-opener.liquid` (cinematic opener: eyebrow, display heading, definition, lead text, bold statement, chapter links, monogram and ghost watermark) and `sections/evlvex-chapter.liquid` (editorial chapter: full-bleed photo with inset detail photo, outlined chapter number, lead, story, closing statement, buttons, anchor), styles in new `assets/evlvex-editorial.css`; `snippets/evlvex-demo-image.liquid` gets a `shoe` parameter so a chapter always shows its own model; `templates/page.stories.json` and `templates/page.about.json` rebuilt with them |
| Light film & wordmark header (v1.11) | `snippets/evlvex-logo.liquid` (new `mark` parameter), `sections/header.liquid` (wordmark only), `assets/evlvex-luxury.css` (word-only sizes); `sections/evlvex-comeback-film.liquid` (settings *Light scenes: Background, top left / bottom right*, `is-light` set server-side), `assets/evlvex-comeback-film.css` (light gradient, light gaps during the 3D turn, softer shadows and backdrop), `templates/index.json` (all scenes Light) |
| Street Drop (v1.12) | new `assets/evlvex-street.css` (all Street Drop styles, incl. header pill menu and product page), `assets/evlvex-drop-hero.js`, `assets/archivo-street.woff2` (Archivo variable, SIL OFL, latin; declared as *Archivo Street* in `layout/theme.liquid`, which also adds the body class `evx-t-<template>`); new sections `evlvex-drop-hero`, `evlvex-tape`, `evlvex-drop-grid`, `evlvex-standard`, `evlvex-manifesto`, `evlvex-authenticity`, `evlvex-pair-story`; `sections/main-product.liquid` block *EvlveX assurance* (`snippets/evlvex-assurance.liquid`); `templates/index.json` and `templates/product.json` rebuilt. The COMEBACK film, opener/chapter, featured-collection and related-products sections stay in the theme, unused on these two templates |
| Copy | `templates/index.json`, `product.json`, `page.about.json`, `page.care.json`, `page.authenticity.json`, `collection.json`, `sections/header-group.json` (mega menu), `sections/footer-group.json`, `sections/main-404.liquid`, brand text in `config/settings_data.json` |

Menus, collections, products and story entries are store data, created during store setup ([deployment.md §5](deployment.md)).
