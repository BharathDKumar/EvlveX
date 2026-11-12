# EvlveX — Specification

| | |
|---|---|
| **Status** | v1.1 — story-led revision (draft; supersedes v1.0 once approved) |
| **Date** | 12 Nov 2026 |
| **Platform** | Shopify (Dawn 16.1.1 theme, customised) + Node.js QR tooling |
| **Audience** | EvlveX team, developers, operations / packing staff, photographers & copywriters |

This file is the entry point. The detail lives in separate files, one per area.

## Documents

| File | What it covers | Main readers |
|---|---|---|
| [brand-and-content.md](spec/brand-and-content.md) | Logo, palette, typography, tone of voice, imagery, the COMEBACK story and its chapters, each pair's chapter, site copy | brand, copy, photography |
| [theme.md](spec/theme.md) | **Website code:** theme settings, site map, page and section specs, implementation rules, theme build changes | theme developers |
| [qr-certificates.md](spec/qr-certificates.md) | Certificate feature: user stories, formats, page states, privacy, **data models** (certificate, story, product metafield) | developers, brand |
| [qr-tooling.md](spec/qr-tooling.md) | **Tooling code:** CLI setup, commands, `assign` behaviour, outputs, tooling code changes | developers, ops |
| [operations.md](spec/operations.md) | Runbook: printing tags, workshop cards, assigning pairs, corrections, publishing stories | production, packing, brand |
| [deployment.md](spec/deployment.md) | **Deployment:** domain, theme workflow, tooling install, release order, store setup checklist | developers, store owner |

---

## Overview & goals

**EvlveX is a luxury shoe house where every pair has a story.** Each model in the collection is born from a story: a place, an hour, a person, a journey. Each individual pair then gains its own chapter: who finished it, when, its number, and finally the name of the person who owns it.

The first collection is **COMEBACK**, told in two chapters, one per model: **The Silent Grind** (black low-top sneaker) and **A Fresh Start** (cream and sand low-top sneaker) ([brand-and-content.md §6](spec/brand-and-content.md)).

The website must:

1. **Feel like a luxury maison:** restrained palette, serif headlines, generous white space, large cinematic photography, no discount-store clutter.
2. **Tell the story first, then sell:** every model is introduced through its story; every product page carries that story; a clear path still leads from story → product → cart → Shopify checkout.
3. **Give every pair an identity:** each pair carries a unique QR tag. When the owner scans it, they land on a personal page, *"Thank you, {Full Name}"*, which tells the story of their pair and proves it is genuine.

### Out of scope (v1)
- Scan analytics and counterfeit detection (e.g. counting scans, geo alerts)
- Owner-written stories, photo uploads or comments on certificate pages
- Audio or video narration of stories
- Multi-language and multi-currency content (Dawn supports it later without code changes)
- Customer accounts / login customisation
- Native mobile app

---

## Open items
| # | Item | Owner | Needed for |
|---|---|---|---|
| 1 | ~~Original logo vector file~~ **Done 12 Nov 2026:** the original artwork is in `docs/brand/logos/`, traced to SVG in the theme | Brand | ~~replace redrawn monogram~~ |
| 2 | Confirm materials, sizes and prices of The Silent Grind and A Fresh Start (the site shows sample prices until products exist) | Brand | products |
| 3 | ~~Approve the model stories~~ **Done 13 Nov 2026:** COMEBACK, The Silent Grind, A Fresh Start (brand text) | Brand / copy | — |
| 4 | Studio photography of both models at 3000 px+ on seamless backgrounds; the site uses graded phone photos until then ([shoe-images.md](brand/shoe-images.md)) | Brand / photographer | every page |
| 5 | Final prices, size ranges (men's / women's), materials and care text per model | Brand | products & tabs |
| 6 | Written consent from each artisan to be named on certificates | Atelier / legal | `artisan` field |
| 7 | Workshop card design and print run | Brand / production | workshop cards |
| 8 | Confirm exact domain (e.g. `evlvex.com`) | Brand | `PUBLIC_DOMAIN`, before printing |
| 9 | Privacy-policy wording, e.g. *"Each EvlveX pair carries a certificate page showing the owner's name and the name of the artisan who finished it. Contact us to remove or change the owner's name."* | Brand / legal | launch |
| 10 | Tag supplier and material (satin label vs sticker) | Production | first batch |

## Changes from v1.0
v1.1 is implemented in the theme and the QR tooling. The files changed are listed where they belong:
- Theme: [theme.md §6](spec/theme.md)
- QR tooling: [qr-tooling.md §5](spec/qr-tooling.md)

Store setup and deployment ([deployment.md](spec/deployment.md)) are still to do: running `npm run setup`, creating story entries, products, collections and menus, and connecting the domain.
