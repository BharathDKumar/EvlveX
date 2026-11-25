# EvlveX — Specification

| | |
|---|---|
| **Status** | v1.12 — Street Drop (supersedes v1.11) |
| **Date** | 25 Nov 2026 |
| **Platform** | Shopify (Dawn 16.1.1 theme, customised) + Node.js QR tooling |
| **Audience** | EvlveX team, developers, operations / packing staff, photographers & copywriters |

This file is the entry point. The detail lives in separate files, one per area.

## Documents

| File | What it covers | Main readers |
|---|---|---|
| [brand-and-content.md](spec/brand-and-content.md) | Logo, palette, typography, tone of voice, imagery, the COMEBACK story and its chapters, each pair's chapter, site copy | brand, copy, photography |
| [theme.md](spec/theme.md) | **Website code:** theme settings, site map, page and section specs, implementation rules, theme build changes | theme developers |
| [qr-certificates.md](spec/qr-certificates.md) | Certificate feature: user stories, formats, page states, privacy, **data models** (certificate, story, story slide, product metafields) | developers, brand |
| [qr-tooling.md](spec/qr-tooling.md) | **Tooling code:** CLI setup, commands, `assign` behaviour, outputs, tooling code changes | developers, ops |
| [operations.md](spec/operations.md) | Runbook: printing tags, assigning pairs, corrections, publishing stories | production, packing, brand |
| [deployment.md](spec/deployment.md) | **Deployment:** domain, GitHub-connected theme workflow, template validation, tooling install, release order, store setup checklist | developers, store owner |
| [marketing/comeback-ads.md](marketing/comeback-ads.md) | Ready-to-paste Google Ads and Meta ad copy for the limited-edition COMEBACK series (every line checked against the platform limits), keywords, audiences, tracking links | marketing, store owner |
| [brand/](brand/) | Brand files: original logos (`logos/`), shoe photos and the imagery made from them ([shoe-images.md](brand/shoe-images.md)) | everyone |

---

## Overview & goals

**EvlveX is a footwear house whose collections tell a story.** Each collection is one story; each model carries one chapter of it. Each individual pair then gains its own chapter: its number, its certificate and, finally, the name of the person who owns it.

The first collection is **COMEBACK**: *what happens after life knocks you down: the strength to keep going, the courage to move forward, and the choice to become someone new.* It is told in two chapters, one per model ([brand-and-content.md §6](spec/brand-and-content.md)):
- **The Silent Grind**: a black low-top sneaker with textured overlays and a white monogram, for *the chapters lived in the dark*.
- **A Fresh Start**: a cream and sand low-top sneaker with an embossed monogram, for *the moment after the struggle*.

The website must:

1. **Feel premium and editorial, never like a stock Shopify store:** a strict black-and-white palette with bold sans typography, generous white space, cinematic imagery of our own shoes only, no Dawn placeholders or "Powered by Shopify".
2. **Tell the story first, then sell:** the home page opens with the COMEBACK film (a full-screen 3D carousel); every model is introduced through its chapter; every product page carries that chapter; a clear path still leads from story → product → cart → Shopify checkout.
3. **Give every pair an identity:** each pair carries a unique QR tag. When the owner scans it, they land on a personal page, *"Thank you, {Full Name}"*, which tells the story of their pair and proves it is genuine.

### Out of scope (v1)
- Scan analytics and counterfeit detection (e.g. counting scans, geo alerts)
- Owner-written stories, photo uploads or comments on certificate pages
- Audio or video narration of stories
- Multi-language and multi-currency content (Dawn supports it later without code changes)
- Customer accounts / login customisation
- Native mobile app

---

## Current state (19 Nov 2026)
- **Live theme:** https://evlvex.in serves the theme **EvlveX/main**. That theme is connected to the GitHub repository and updates automatically from the `main` branch, usually within a minute ([deployment.md §2](spec/deployment.md)).
- **Storefront: paused before launch** (decided 19 Nov 2026). The password page *"The COMEBACK is coming"* collects emails for a waiting list. The password is switched on in Admin (Online Store → Preferences → Password protection); the API cannot toggle it.
- **Store data:**
  - **Products:** both are Active with limited-edition SEO and tags.
  - **Pages and menu:** all nine pages and the main menu exist.
  - **The Collection:** exists at `/collections/all` but is not published yet.
  - **Certificates:** 236 created, none assigned.
  - Remaining setup: [deployment.md §5](spec/deployment.md).
- **Google Search Console:** the domain is added. Submit the sitemap and request indexing only at relaunch, because Google sees only the password page while it is on.

### Relaunch checklist
1. **Store setup:** publish The Collection; set the homepage title and description in Preferences ([deployment.md §5](spec/deployment.md)).
2. **Certificate names:** decide open item 13 before the first sale.
3. **Open the store:** Online Store → Preferences → Password protection → untick *Restrict access*.
4. **Search Console:** submit `sitemap.xml` and request indexing for the home page, both products and `/collections/all`.
5. **Waiting list:** email the sign-ups from Customers (filter *Email subscribers*) that the series is live.
6. **Ads:** start them only after the store is open ([marketing/comeback-ads.md](marketing/comeback-ads.md)).

## Open items
| # | Item | Owner | Needed for |
|---|---|---|---|
| 1 | ~~Original logo files~~ **Done 12 Nov 2026:** in `docs/brand/logos/`, traced to SVG in the theme | Brand | — |
| 2 | Create the two products with size variants, prices, materials and care text; confirm the materials (genuine leather and suede, or synthetic). Until then the site says only "smooth upper, textured overlays, padded collar, stitched cupsole" and never "leather" or "suede" (decided 20 Nov 2026) | Brand | products, product tabs, removing sample prices |
| 3 | ~~Approve the model stories~~ **Done 13 Nov 2026:** COMEBACK, The Silent Grind, A Fresh Start (brand text, used word for word) | Brand / copy | — |
| 4 | Studio photography of both models at 3000 px or more. The site uses crops of the 1195 px campaign photos until then ([shoe-images.md](brand/shoe-images.md)) | Brand / photographer | every page, COMEBACK film |
| 5 | ~~Confirm brand claims~~ **Done 20 Nov 2026:** shoes are factory-made, so every "handmade", "artisan", "signed" and "workshop card" claim was removed; "numbered, certified, registered to you" stay (the certificate system is real). Positioning and word rules: [brand-and-content.md §4](spec/brand-and-content.md). **Shipping and returns decided 15 Nov 2026:** free shipping across India, prepaid only, 7-day returns and size exchange ([docs/policies/](policies/README.md)) | Brand | launch |
| 6 | ~~Artisan consent~~ **Not needed:** factory-made, artisans are not named (20 Nov 2026) | — | — |
| 7 | ~~Workshop card~~ **Dropped 20 Nov 2026:** no workshop card (factory-made) | — | — |
| 8 | ~~Confirm exact domain~~ **Done:** `evlvex.in` is live. Set `PUBLIC_DOMAIN=evlvex.in` before printing tags | Brand | QR tags |
| 9 | Store policies are written ([docs/policies/](policies/README.md)): paste them into Admin → Settings → Policies and fill in the business details (legal name, address, GSTIN, phone, Grievance Officer, court city). Have a lawyer or CA review them | Brand / legal | launch |
| 10 | Tag supplier and material (satin label vs sticker) | Production | first batch |
| 11 | Main and footer menus (Shop, The Chapters, About, Care, Authenticity, Contact) | Store owner | navigation |
| 12 | Before launch: turn off Theme settings → EvlveX → *Show demo photography* once real images are uploaded | Store owner | launch |
| 13 | **Certificate names are listed through the sitemap** ([qr-certificates.md §4](spec/qr-certificates.md)). Decide before the first pair is assigned: show only first name + last initial (theme change), or keep full names and say so in the privacy policy | Brand / developer | first assigned pair |
| 14 | **"International standards":** the owner wants to say the shoes meet international standards. There is no certificate or test yet, so the site says "designed and made in India; every pair inspected". Add the claim only with proof (e.g. ISO 9001 factory, SATRA or BIS test report), naming it exactly | Brand / production | premium positioning |

## Version history
| Version | Date | What changed |
|---|---|---|
| v1.0 | 11 Nov 2026 | First specification: story-led store on Dawn, QR certificates |
| v1.1 | 12 Nov 2026 | Story layer: story metaobject, story pages, product story, home featured story, story-aware cart and certificate |
| v1.2 | 13 Nov 2026 | COMEBACK: the brand's real story and two models replace the five invented models; original logos; COMEBACK film (3D carousel) on the home page; editorial story carousel (home and per product); only the brand's own shoe photography, no Dawn placeholders; every page customised (cart, search, collections, journal, contact, password page, gift card, footer); template validation added to the release workflow |
| v1.3 | 15 Nov 2026 | Black & white: the whole site moves to black, white and neutral greys (no gold, ivory or sand); bold uppercase Archivo headings and Archivo body replace Cormorant / Jost; pill buttons; shoe imagery and QR tags regraded to black and white |
| v1.4 | 15 Nov 2026 | Colour photography, policies & contact: shoe imagery replaced by true-colour crops of four campaign photos (the site stays black and white); store policies for India (returns, shipping, privacy, terms, contact) ready to paste into Shopify; 7-day returns, free shipping and prepaid-only copy; Instagram @evlvex and support@evlvex.in on the contact page and in the footer |
| v1.5 | 15 Nov 2026 | Footer & COMEBACK literature: a new premium footer (statement, one newsletter, sparse link columns, labelled contact, full-width wordmark, one-line legal bar, no repeated elements); "never give up" literature (home manifesto, four steps of a comeback and a closing essay on About); the "Every pair, its own chapter" block and the duplicate newsletter removed from home |
| v1.6 | 15 Nov 2026 | Standard pages: FAQ, Size guide, Track your order and Shipping & returns templates; a plain 404 with search and quick links; standard e-commerce wording on system pages; About moved to `/pages/about`; footer wordmark removed; account popup fixed to a white card with black pill buttons, and *Log in* added to the mobile menu; Admin checklist for creating every page and branding the hosted login |
| v1.7 | 18 Nov 2026 | SEO: Organization structured data with the brand logo and only real social links; breadcrumbs in search results (product, collection, article, page, story); a default share image for links on WhatsApp, Instagram and other apps; product photos never without alt text; SEO steps for Admin, Search Console and Google Shopping in the store setup checklist ([deployment.md §5](spec/deployment.md)) |
| v1.8 | 20 Nov 2026 | Premium copy revalidated: positioning *shoes with a story · original designs · limited edition · made in India · premium* added (home "The EvlveX standard", announcement bar, product "Design & make" tab, FAQ, About); every untrue or unconfirmed claim removed (handmade, artisan, signed, workshop card, house of, luxury, leather, suede, "won't return"); limited edition now "a limited, numbered run" (COMEBACK may return if it succeeds); SEO titles, descriptions and alt text for products, collection and all 9 pages; share image text; policy drafts corrected. Word rules: [brand-and-content.md §4](spec/brand-and-content.md) |
| v1.9 | 21 Nov 2026 | Home layout: COMEBACK film cut to three scenes (COMEBACK with the monogram only, The Silent Grind, A Fresh Start) of 10 s each, more story text and smaller images, a click anywhere on a scene opens the stories page or the product, timeline and buttons hidden; brand statement and "The Mark" removed; two featured products centred without gaps; logo and menu on one header row; the header stays on screen while scrolling and gets shorter |
| v1.10 | 25 Nov 2026 | About & Story literature: the brand's new texts word for word: *About EvlveX* (the name comes from Evolution) and the Story page (COMEBACK, Chapter 01 The Silent Grind, Chapter 02 A Fresh Start). Both pages rebuilt as editorial pages with two new sections: a cinematic opener and an editorial chapter spread (full-bleed photo, detail photo, outlined chapter number, bold closing statement); each chapter always shows its own shoe |
| v1.11 | 25 Nov 2026 | Light film & wordmark header: the header shows the EvlveX wordmark alone (no monogram); the home COMEBACK film moves from black to a soft light studio gradient (near-white to light cool grey, editable in the theme editor) with black copy |
| **v1.12** | **25 Nov 2026** | **Street Drop:** home and product pages redesigned in a bold sneaker-drop style chosen from four design directions: a carousel hero (giant condensed word, tilted photo card, sticker, spec labels), a tilted ticker tape, spec-sheet product cards with live prices, a boxed "standard", a black manifesto, an authenticity teaser with an example hang tag, pill-shaped header menu; on the product page a condensed title, boxed sizes, assurance chips, the story of the pair and the other chapter. Condensed type is Archivo variable, self-hosted. (The earlier editorial-film branch was not merged.) |

Files changed per version are listed where they belong: theme [theme.md §6](spec/theme.md), QR tooling [qr-tooling.md §5](spec/qr-tooling.md).

Still to do: store setup ([deployment.md §5](spec/deployment.md)). That means creating the products, metaobject definitions and entries, pages, collections and menus, and running `npm run setup` on the packing computer.
