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
3. **Preview** risky changes before they go live: `shopify theme dev --store w3wigc-de.myshopify.com` (hot reload at http://127.0.0.1:9292), or push to a separate branch connected to an unpublished theme.
4. **Deploy:** push to `main`.
5. **Verify on evlvex.in:** reload the changed page and check that its sections are the new ones. If a template didn't change, open Admin → Online Store → Themes; a sync error on **EvlveX/main** names the rejected file.
- **Rollback:** `git revert` the commit and push. Shopify also keeps earlier theme versions in the theme library.

## 3. QR tooling deployment
The CLI runs on a packing-station computer, not on Shopify.
- Install and configure it per [qr-tooling.md §1](qr-tooling.md).
- `.env` holds the Admin API token: keep it on that machine only, never commit it, and rotate it if the machine is replaced.
- After any tooling update, run `npm test` and `npm run setup` (safe to repeat; it only adds what's missing).
- **Automatic tag assignment** (`autopack`, [qr-tooling.md §5](qr-tooling.md)) runs on GitHub Actions, not on that computer: `.github/workflows/autopack.yml`, every 30 min. One-time setup:
  - [x] App scopes and setup, *done 27 Nov 2026*: the *EvlveX setup* app already has `write_orders`. `npm run setup` created the *Pack serials* order metafield. The order tag, metafield and certificate writes were tested on cancelled order #1002 and undone.
  - [ ] Zoho app password for support@evlvex.in: sign in at **accounts.zoho.in → Security → App Passwords → Generate New Password**, name it *EvlveX autopack*, and copy it. (If App Passwords is missing, turn on two-factor authentication there first. Zoho's **Forever Free** plan does not allow SMTP sending: check Zoho Mail → Settings → Subscription, and upgrade to Mail Lite or use another sender.)
  - [ ] GitHub → repo → **Settings → Secrets and variables → Actions → New repository secret**, six times: `SHOPIFY_STORE`, `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET` (copy from `tools/qr-certificates/.env`), `SMTP_USER` (`support@evlvex.in`), `SMTP_PASS` (the Zoho app password), `MAIL_TO` (who gets the packing email).
  - [ ] GitHub → **Actions → Autopack QR tags → Run workflow**, with *Dry run* ticked. The log should end with "Nothing to do." or a list of orders.
  - [ ] Same screen: **Run workflow** with *Test email* ticked. A test email should arrive at `MAIL_TO`. If the run fails, its log says why (wrong password, or SMTP not allowed on the Zoho plan).

## 4. Release order
1. Run `npm run setup` (definitions must exist before the theme templates can be selected).
2. Create story entries and set product story metafields ([operations.md §6](operations.md)).
3. Create the products and set their metafields, then check them on evlvex.in (§2, *Verify*).
4. Set `PUBLIC_DOMAIN=evlvex.in` and generate and print tags ([operations.md §1](operations.md)).

## 5. One-time store setup checklist
The store's internal address is **w3wigc-de.myshopify.com** (Admin and API); the public domain is evlvex.in. Store data can be changed with the Admin API through the *EvlveX setup* app in the Dev Dashboard: its client ID and secret go in  (git-ignored) and are exchanged for a 24-hour token. Rotate the secret when a job is finished.

- [ ] Create metaobject and metafield definitions: `npm run setup` ([qr-certificates.md §5](qr-certificates.md))
- [x] **Create the pages.** *Done 17 Nov 2026 through the Admin API: all nine exist with their templates.* Until a page exists, its links (footer, menus, buttons) show the 404 page. Go to Online Store → **Pages → Add page**, type the **Title** exactly as below, leave the content empty, choose the **Template** on the right, and save. Shopify makes the handle from the title; check it under *Search engine listing*.

  | Title | Handle | Template |
  |---|---|---|
  | About | `about` | `page.about` |
  | The Stories | `the-stories` | `page.stories` |
  | Care | `care` | `page.care` |
  | Authenticity | `authenticity` | `page.authenticity` |
  | Contact | `contact` | `page.contact` |
  | FAQ | `faq` | `page.faq` |
  | Size guide | `size-guide` | `page.size-guide` |
  | Track your order | `track-your-order` | `page.track-order` |
  | Shipping & returns | `shipping-returns` | `page.shipping-returns` |
- [ ] Do not create pages with the handles `stories` or `authentic`
- [ ] Create story entries for **The Silent Grind** and **A Fresh Start** (text in [brand-and-content.md §6](brand-and-content.md)) and upload their chapter frames
- [ ] Create collections: The Collection (all); optionally one per chapter (The Silent Grind, A Fresh Start). *18 Nov 2026: **The Collection** created through the Admin API at handle `all` (smart collection: product type = Sneakers, so both products and every future model join it automatically), with a limited-edition description and SEO title *COMEBACK — Limited Edition Sneaker Series*. **Still to do:** publish it to the Online Store (Products → Collections → The Collection → Sales channels). Until then `/collections/all` shows Shopify's automatic "Products" page. The setup app has no publications scope.*
- [ ] Create the **EvlveX Story Slide** metaobject and the **Story slides** product metafield (`evlvex.story_slides`) by hand, following [qr-certificates.md §5.4](qr-certificates.md). `npm run setup` does not create them.
- [x] Products, *done 17 Nov 2026*: **The Silent Grind** (handle `the-silent-grind`, **draft**; set it to Active when ready) and **A Fresh Start** (`a-fresh-start`, live), ₹3,435, model CB-01, sizes UK 6–10 with the November stock (118 pairs each). Still to do: set each product's **Story** metafield once the story entries exist, optionally its **Story slides** ([operations.md §7](operations.md)), and point the COMEBACK film's "Shop" links at the product pages (theme editor → Home → EvlveX COMEBACK film).
- [x] Menus: *Main menu* (Shop → /collections/all, Stories, About, Authenticity, Contact), *done 17 Nov 2026*. The footer columns already carry their own links (theme editor → Footer). The policies are listed automatically in the footer's bottom bar.
- [x] QR certificates, *done 17 Nov 2026*: definitions created (`npm run setup`) and 236 certificates for the November stock (batches NOV26 + NOV26-2, print set `out/NOV26-PRINT`).
- [ ] Theme editor: the home **COMEBACK film** already shows the two shoes. Upload studio images per scene when they exist. The header already draws the original logo (monogram + wordmark); upload a logo image only if you want to replace it.
- [x] ~~Print workshop cards~~ Dropped 20 Nov 2026: factory-made, no workshop card ([operations.md §2](operations.md))
- [x] **Studio photography**, *done 27 Nov 2026*: both product galleries are uploaded, and the theme's built-in crops (`assets/evx-*.jpg`) are from the same shoot. **Keep** Theme settings → **EvlveX → Show demo photography** on: it is what shows those crops wherever no image is chosen in the theme editor ([docs/brand/shoe-images.md](../brand/shoe-images.md)).
- [ ] **Login, account and checkout pages** are hosted by Shopify (new customer accounts), so the theme can't change their layout. It only styles the account popup in the header and the mobile-menu *Log in* link. Brand the hosted pages in Admin → Settings → **Checkout and accounts → Customize** → *Branding*:
  - **Logo:** `docs/brand/logos/evlvex-wordmark-black.png` (and the white version for dark headers if offered); **favicon:** `docs/brand/logos/evlvex-monogram-black.png`
  - **Colors:** background `#FFFFFF`, text `#111111`, accent and primary buttons `#111111`, button text `#FFFFFF`
  - **Corner radius:** buttons fully rounded (pill); fields small
  - **Font:** Archivo for headings and body if listed, otherwise the closest clean sans
  - **Optional banner / main image** on the login page: `assets/evx-sg-full.jpg`
  Customer account pages (orders, profile) use the same branding.
- [ ] **Policies:** paste the five texts from [docs/policies/](../policies/README.md) into Admin → Settings → Policies, and replace every `[FILL IN: …]` placeholder. The footer and checkout then link to them.
- [ ] Admin → Settings → Store details: contact email **support@evlvex.in**, plus the legal business name and address. Settings → Notifications: sender email support@evlvex.in.
- [ ] Admin → Settings → Payments: keep Cash on Delivery **off** (the policies say prepaid only).
- [ ] **SEO** (the theme already outputs the meta tags, structured data and breadcrumbs, [theme.md §5](theme.md); these steps are store data):
  - [ ] Online Store → **Preferences**: homepage title *EvlveX — Premium Limited Edition Sneakers, Made in India* and meta description *EvlveX COMEBACK: premium limited-edition sneakers that tell the stories of people who got knocked down and came back. Original designs, made in India.* Social sharing image: upload `docs/brand/social/evlvex-share-1200x628.png` (re-rendered 20 Nov 2026; replace the earlier upload). The Admin API cannot set these.
  - [x] **Products**, *done 18 Nov 2026 through the Admin API*. Both are Active with Vendor *EvlveX* and type *Sneakers*. Both are tagged *COMEBACK series* and *Limited edition*. Each has its own search listing title (*A Fresh Start — Limited Edition Cream Sneaker*, *The Silent Grind — Limited Edition Black Sneaker*) and a description with premium, original design, made in India and "limited numbered run" (updated 20 Nov 2026), while the product title stays the story name, which the cart and certificates show. Every photo has alt text (no material claims). All 9 pages have an SEO description (About also a title), and Shopify's default *Home page* collection is hidden from search (`seo.hidden`). A Fresh Start's description had pasted line breaks mid-sentence; they are now spaces, as in [brand-and-content.md §6](brand-and-content.md).
  - [ ] A Fresh Start photo **file names** are still *WhatsApp_Image_…jpg*. Rename them in Content → Files, for example *a-fresh-start-cream-sand-low-top-sneaker.jpg* (the setup app has no files scope). Replace the first photo when studio shots exist: its thank-you card has garbled text.
  - [ ] Optional: longer product descriptions (150 words or more, with materials, fit and care) once the materials copy is confirmed (open item 2 in [SPEC.md](../SPEC.md)).
  - [ ] Each **page** (About, FAQ, Care…): *Edit website SEO* with a short description.
  - **Google Search Console** (search.google.com/search-console): add a *Domain* property for `evlvex.in` (verified through a DNS TXT record at the domain registrar) and submit `https://evlvex.in/sitemap.xml`. Then use *URL inspection → Request indexing* on the home page and both products. Do the same in **Bing Webmaster Tools** (it can import from Search Console).
  - Install the **Google & YouTube** app (Shopify App Store) and connect Merchant Center so both products appear in free Google Shopping listings.
  - **Google Business Profile**, only if there is a shop or studio address customers can visit.
