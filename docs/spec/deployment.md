# EvlveX — Deployment & Store Setup

Part of the [EvlveX specification](../SPEC.md). **Audience:** developers and the store owner.

---

## 1. Connect the GoDaddy domain (do this **before printing tags**)
1. Shopify Admin → **Settings → Domains → Connect existing domain**, then enter e.g. `evlvex.com`.
2. GoDaddy → My Products → Domain → **DNS**:

| Type | Name | Value | Action |
|---|---|---|---|
| A | `@` | `23.227.38.65` | edit existing `@` record; delete any other `@` A records |
| CNAME | `www` | `shops.myshopify.com` | edit existing `www` record |

3. Back in Shopify, click **Verify connection**. DNS can take up to 48 h, usually under 1 h.
4. Set the domain as **Primary** and confirm SSL shows **Active**.
5. Set `PUBLIC_DOMAIN` in `tools/qr-certificates/.env` to the exact domain (with or without `www`, matching the primary domain). See [qr-tooling.md §1](qr-tooling.md).

## 2. Theme workflow
- **Preview locally:** `shopify theme dev --store evlvex.myshopify.com` (hot reload at http://127.0.0.1:9292)
- **Lint:** `shopify theme check`
- **Upload for review:** `shopify theme push --unpublished`. This creates a new draft theme; preview it from Admin → Online Store → Themes.
- **Go live:** Admin → Online Store → Themes → *Publish* on the reviewed theme.
- **Rollback:** publish the previous theme from the theme library (Shopify keeps it). Locally: `git log` / `git revert`.

## 3. QR tooling deployment
The CLI runs on a packing-station computer, not on Shopify.
- Install and configure it per [qr-tooling.md §1](qr-tooling.md).
- `.env` holds the Admin API token: keep it on that machine only, never commit it, and rotate it if the machine is replaced.
- After any tooling update, run `npm test` and `npm run setup` (safe to repeat; it only adds what's missing).

## 4. Release order
1. Run `npm run setup` (definitions must exist before the theme templates can be selected).
2. Create story entries and set product story metafields ([operations.md §6](operations.md)).
3. Push the theme unpublished, review it in the theme preview, then publish.
4. Connect the domain (§1), then generate and print tags ([operations.md §1](operations.md)).

## 5. One-time store setup checklist
- [ ] Create metaobject and metafield definitions: `npm run setup` ([qr-certificates.md §5](qr-certificates.md))
- [ ] Create pages, choosing each page's **template** in the page editor:
  - *The Stories* (handle `the-stories`) → `page.stories`
  - *The Maison* → `page.about`
  - *Care* → `page.care`
  - *Authenticity* → `page.authenticity`
- [ ] Do not create pages with the handles `stories` or `authentic`
- [ ] Create story entries for every model ([brand-and-content.md §6](brand-and-content.md)) and upload their story plates
- [ ] Create collections: The Collection (all), Sneakers, Loafers & Mules, Formal, Boots
- [ ] Create the **EvlveX Story Slide** metaobject and the **Story slides** product metafield (`evlvex.story_slides`) by hand, following [qr-certificates.md §5.4](qr-certificates.md). `npm run setup` does not create them.
- [ ] Create products for each model and colorway with size variants, and set each product's **Story** metafield. Optionally add its **Story slides** too ([operations.md §7](operations.md)).
- [ ] Menus: *Main menu* (Shop mega menu, The Stories, The Maison, Authenticity); *Footer* (Stories, Care, Shipping & Returns, Privacy, Contact)
- [ ] Theme editor: choose hero, featured story, atelier and collection images, and the slide images of the home **Story carousel**. The header already draws the original logo (monogram + wordmark); upload a logo image only if you want to replace it.
- [ ] Print workshop cards ([operations.md §2](operations.md))
- [ ] Policies: add the certificate privacy wording ([open items](../SPEC.md#open-items))
