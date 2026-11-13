# EvlveX — Specification

| | |
|---|---|
| **Status** | v1.2 — COMEBACK revision (supersedes v1.1) |
| **Date** | 13 Nov 2026 |
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
| [operations.md](spec/operations.md) | Runbook: printing tags, workshop cards, assigning pairs, corrections, publishing stories | production, packing, brand |
| [deployment.md](spec/deployment.md) | **Deployment:** domain, GitHub-connected theme workflow, template validation, tooling install, release order, store setup checklist | developers, store owner |
| [brand/](brand/) | Brand files: original logos (`logos/`), shoe photos and the imagery made from them ([shoe-images.md](brand/shoe-images.md)) | everyone |

---

## Overview & goals

**EvlveX is a footwear house whose collections tell a story.** Each collection is one story; each model carries one chapter of it. Each individual pair then gains its own chapter: its number, its certificate and, finally, the name of the person who owns it.

The first collection is **COMEBACK**: *what happens after life knocks you down: the strength to keep going, the courage to move forward, and the choice to become someone new.* It is told in two chapters, one per model ([brand-and-content.md §6](spec/brand-and-content.md)):
- **The Silent Grind**: a black low-top sneaker with suede overlays and a white monogram, for *the chapters lived in the dark*.
- **A Fresh Start**: a cream and sand low-top sneaker with an embossed monogram, for *the moment after the struggle*.

The website must:

1. **Feel premium and editorial, never like a stock Shopify store:** restrained Noir / Ivory / Sand palette, generous white space, cinematic imagery of our own shoes only, no Dawn placeholders or "Powered by Shopify".
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

## Current state (13 Nov 2026)
- **Live:** https://evlvex.in serves the theme **EvlveX/main**. That theme is connected to the GitHub repository and updates automatically from the `main` branch, usually within a minute ([deployment.md §2](spec/deployment.md)).
- **Storefront:** open, with no password page. Home, cart, search, collections list, blog and contact show the COMEBACK design.
- **Store data not created yet:** no products, collections (other than *all*), pages, menus (the default *Home · Catalog · Contact* is shown), metaobject definitions or entries. Until they exist, the theme shows the graded shoe photography and sample product cards (*The Silent Grind — Noir*, *A Fresh Start — Sand*, sample price).

## Open items
| # | Item | Owner | Needed for |
|---|---|---|---|
| 1 | ~~Original logo files~~ **Done 12 Nov 2026:** in `docs/brand/logos/`, traced to SVG in the theme | Brand | — |
| 2 | Create the two products with size variants, prices, materials and care text; confirm the materials copy in the product tabs ("smooth upper with suede overlays, padded collar, stitched cupsole") | Brand | products, product tabs, removing sample prices |
| 3 | ~~Approve the model stories~~ **Done 13 Nov 2026:** COMEBACK, The Silent Grind, A Fresh Start (brand text, used word for word) | Brand / copy | — |
| 4 | Studio photography of both models at 3000 px or more on seamless backgrounds. The site uses graded phone photos until then ([shoe-images.md](brand/shoe-images.md)) | Brand / photographer | every page, COMEBACK film |
| 5 | Confirm brand claims still shown on the site: "every pair numbered, certified", "signed by its artisan", "registered to you" (certificate programme) and "complimentary shipping", "14-day returns" | Brand | launch |
| 6 | Written consent from each artisan to be named on certificates (only if artisans are named) | Atelier / legal | `artisan` field |
| 7 | Workshop card design and print run | Brand / production | workshop cards |
| 8 | ~~Confirm exact domain~~ **Done:** `evlvex.in` is live. Set `PUBLIC_DOMAIN=evlvex.in` before printing tags | Brand | QR tags |
| 9 | Privacy-policy wording, e.g. *"Each EvlveX pair carries a certificate page showing the owner's name. Contact us to remove or change the owner's name."* | Brand / legal | launch |
| 10 | Tag supplier and material (satin label vs sticker) | Production | first batch |
| 11 | Main and footer menus (Shop, The Chapters, About, Care, Authenticity, Contact) | Store owner | navigation |
| 12 | Before launch: turn off Theme settings → EvlveX → *Show demo photography* once real images are uploaded | Store owner | launch |

## Version history
| Version | Date | What changed |
|---|---|---|
| v1.0 | 11 Nov 2026 | First specification: luxury story-led store on Dawn, QR certificates |
| v1.1 | 12 Nov 2026 | Story layer: story metaobject, story pages, product story, home featured story, story-aware cart and certificate |
| **v1.2** | **13 Nov 2026** | **COMEBACK:** the brand's real story and two models replace the five invented models; original logos; COMEBACK film (3D carousel) on the home page; editorial story carousel (home and per product); only the brand's own shoe photography, no Dawn placeholders; every page customised (cart, search, collections, journal, contact, password page, gift card, footer); template validation added to the release workflow |

Files changed per version are listed where they belong: theme [theme.md §6](spec/theme.md), QR tooling [qr-tooling.md §5](spec/qr-tooling.md).

Still to do: store setup ([deployment.md §5](spec/deployment.md)). That means creating the products, metaobject definitions and entries, pages, collections and menus, and running `npm run setup` on the packing computer.
