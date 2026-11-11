# EvlveX — Operations Runbook

Part of the [EvlveX specification](../SPEC.md). **Audience:** production, atelier, packing staff, and brand / copywriters publishing stories.

Command details are in [qr-tooling.md](qr-tooling.md); the certificate fields are in [qr-certificates.md §5](qr-certificates.md).

---

## 1. Generate and print a batch (production)
1. Run `npm run generate -- --count 200 --batch NOV26` in `tools/qr-certificates/`.
2. Open `out/NOV26/tags.pdf` and print it:
   - **Tag size:** 30 × 40 mm (QR 22 mm square, serial underneath, monogram in the QR centre).
   - **Material:** printed satin or woven label sewn under the tongue or insole, **plus** a matching sticker on the shoe box.
   - Print a test sheet first and scan 3 tags with an iPhone and an Android phone.
3. Keep `out/NOV26/manifest.csv` as the record of which serials exist.
4. Attach one tag per **pair** (the box sticker and the shoe label carry the **same** serial).

> Only print after the public domain is live ([deployment.md §1](deployment.md)).

## 2. Write the workshop card (atelier)
When a pair is finished, the artisan fills in a **workshop card** (printed card, Ivory stock, signature line *Every pair has a story.*) and places it in the box:
- Serial (copied from the box sticker)
- Model and colorway
- Finished by (first name and initial, if the artisan has consented to be named)
- Date finished
- Pair note (optional, ≤ 200 characters): something true and specific about this pair (the hide, the grain, the weather, a small decision made at the bench)

The card stays in the box and travels to the customer. The pair number is assigned at packing (§3).

## 3. Assign a pair at packing
**Option A: CLI (recommended, ~20 s)**
```
npm run assign -- --serial EVX-7F3K9QMD --order 1001 --size 42 \
  --artisan "Marco R." --finished 2026-11-03 \
  --note "The last pair cut from hide lot 12. The grain runs especially fine across the toe."
```
The tool reads the customer's full name, the product and the order date from the order, gives the pair the next pair number for that model, and fills the certificate. It prints the live URL. Open it on your phone to double-check.

**Option B: Shopify Admin (no computer setup needed)**
1. Admin → **Content → Metaobjects → EvlveX Certificate**
2. Search the serial (e.g. `EVX-7F3K9QMD`) and open it.
3. Fill in **Buyer name** (full name as on the order), **Product**, **Size**, **Purchase date**, **Order number** and, if it's a gift, **Personal message**.
4. From the workshop card, fill in **Artisan**, **Finished on** and **Pair note**. Set **Pair number** to the next number for that model (check the highest existing number by filtering on the product).
5. Save, then scan the tag to confirm.

## 4. Corrections
- **Wrong name or typo:** edit the entry in Admin, or re-run `assign` with `--force`.
- **Pair returned / exchanged:** run `npm run assign -- --serial EVX-… --clear`, or clear the buyer fields in Admin. The pair goes back to *Unassigned* and can be re-sold. Its pair number, artisan, date and note **stay**: they belong to the pair, not the owner.
- **Gift purchase:** put the recipient's name in `buyer_name` (`--name`) and the giver's note in `personal_message` (`--message`).
- **Name removal request:** clear `buyer_name`; the page shows the *Unassigned* state.

## 5. Lost or damaged tag
1. Look up the original serial by order number (Admin → Metaobjects, search the order number, or check the manifest).
2. Print a single replacement tag: `npm run generate -- --reprint EVX-7F3K9QMD`.
3. If the serial can't be recovered, generate a new one, assign it to the same order, and copy the pair number, artisan, date and note from the old entry.

## 6. Publish a new model story (brand / copywriter)
1. Write the story following [brand-and-content.md §4](brand-and-content.md) (90–150 words, excerpt ≤ 280 characters).
2. Upload the story plates to Admin → **Content → Files** (naming per [brand-and-content.md §5](brand-and-content.md)).
3. Admin → **Content → Metaobjects → EvlveX Story → Add entry**. Fill in all fields ([qr-certificates.md §5.2](qr-certificates.md)).
4. On each product of that model, set the **Story** metafield to the new entry.
5. Set the entry to **Active**. It appears on The Stories page and its product pages straight away.
6. Optional: choose it as the home page's *Featured story* in the theme editor.
