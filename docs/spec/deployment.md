# EvlveX — Deployment & Store Setup

Part of the [EvlveX specification](../SPEC.md). **Audience:** developers and the store owner.

---

## 1. Connect the GoDaddy domain (do this **before printing tags**)
> **Status:** `evlvex.in` is connected and live (13 Nov 2026). The steps below are kept for reference, for example to add `www` or another domain.

1. Shopify Admin → **Settings → Domains → Connect existing domain**, then enter the domain (`evlvex.in`).
2. GoDaddy → My Products → Domain → **DNS**:

| Type | Name | Value | Action |
|---|---|---|---|
| A | `@` | `23.227.38.65` | edit existing `@` record; delete any other `@` A records |
| CNAME | `www` | `shops.myshopify.com` | edit existing `www` record |

3. Back in Shopify, click **Verify connection**. DNS can take up to 48 h, usually under 1 h.
4. Set the domain as **Primary** and confirm SSL shows **Active**.
5. Set `PUBLIC_DOMAIN` in `tools/qr-certificates/.env` to the exact domain (with or without `www`, matching the primary domain). See [qr-tooling.md §1](qr-tooling.md).

## 2. Theme workflow
The live theme **EvlveX/main** is connected to GitHub (`BharathDKumar/EvlveX`, branch `main`). **Pushing to `main` deploys to the live store**, usually within a minute. Edits made in the theme editor are committed back to `main` by Shopify, so pull before you start work.

1. **Lint:** `shopify theme check`. Expect no errors; 9 warnings in stock Dawn files are known.
2. **Validate templates:** `node tools/validate-templates.js`, which must print *Templates OK*. Shopify rejects a template file with any invalid setting value without failing the push. The store then silently keeps the old file ([theme.md §5](theme.md)).
3. **Preview** risky changes before they go live: `shopify theme dev --store evlvex.myshopify.com` (hot reload at http://127.0.0.1:9292), or push to a separate branch connected to an unpublished theme.
4. **Deploy:** push to `main`.
5. **Verify on evlvex.in:** reload the changed page and check that its sections are the new ones. If a template didn't change, open Admin → Online Store → Themes; a sync error on **EvlveX/main** names the rejected file.
- **Rollback:** `git revert` the commit and push. Shopify also keeps earlier theme versions in the theme library.

## 3. QR tooling deployment
The CLI runs on a packing-station computer, not on Shopify.
- Install and configure it per [qr-tooling.md §1](qr-tooling.md).
- `.env` holds the Admin API token: keep it on that machine only, never commit it, and rotate it if the machine is replaced.
- After any tooling update, run `npm test` and `npm run setup` (safe to repeat; it only adds what's missing).

## 4. Release order
1. Run `npm run setup` (definitions must exist before the theme templates can be selected).
2. Create story entries and set product story metafields ([operations.md §6](operations.md)).
3. Create the products and set their metafields, then check them on evlvex.in (§2, *Verify*).
4. Set `PUBLIC_DOMAIN=evlvex.in` and generate and print tags ([operations.md §1](operations.md)).

## 5. One-time store setup checklist
- [ ] Create metaobject and metafield definitions: `npm run setup` ([qr-certificates.md §5](qr-certificates.md))
- [ ] Create pages, choosing each page's **template** in the page editor:
  - *The Stories* (handle `the-stories`) → `page.stories`
  - *About* (handle `the-maison`) → `page.about`
  - *Care* → `page.care`
  - *Authenticity* → `page.authenticity`
- [ ] Do not create pages with the handles `stories` or `authentic`
- [ ] Create story entries for **The Silent Grind** and **A Fresh Start** (text in [brand-and-content.md §6](brand-and-content.md)) and upload their chapter frames
- [ ] Create collections: The Collection (all); optionally one per chapter (The Silent Grind, A Fresh Start)
- [ ] Create the **EvlveX Story Slide** metaobject and the **Story slides** product metafield (`evlvex.story_slides`) by hand, following [qr-certificates.md §5.4](qr-certificates.md). `npm run setup` does not create them.
- [ ] Create the products **The Silent Grind** (Noir) and **A Fresh Start** (Cream & Sand) with size variants and prices, and set each product's **Story** metafield. Optionally add its **Story slides** too ([operations.md §7](operations.md)). Then point the COMEBACK film's "Shop" links at the product pages (theme editor → Home → EvlveX COMEBACK film).
- [ ] Menus: *Main menu* (Shop, The Chapters, About, Authenticity); *Footer* (The Chapters, Care, Shipping & Returns, Privacy, Contact). The store currently shows Shopify's default *Home · Catalog · Contact*.
- [ ] Theme editor: the home **COMEBACK film** already shows the two shoes. Upload studio images per scene when they exist. The header already draws the original logo (monogram + wordmark); upload a logo image only if you want to replace it.
- [ ] Print workshop cards ([operations.md §2](operations.md))
- [ ] **Before launch:** upload studio photography of both models on products, collections and in the theme editor (the COMEBACK film scenes take an uploaded image too). Then turn off Theme settings → **EvlveX → Show demo photography** ([docs/brand/shoe-images.md](../brand/shoe-images.md)).
- [ ] Checkout and customer accounts are hosted by Shopify. Brand them in Admin → Settings → **Checkout → Customize** (logo: `docs/brand/logos/`; colors Ivory `#F5F0E6`, Noir `#0E0E0E`, Sand-gold `#B89B6A`; fonts Cormorant / Jost). Customer account pages use the same branding.
- [ ] Policies: add the certificate privacy wording ([open items](../SPEC.md#open-items))
