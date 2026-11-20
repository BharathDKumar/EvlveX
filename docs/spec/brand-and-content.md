# EvlveX — Brand & Content Specification

Part of the [EvlveX specification](../SPEC.md). **Audience:** brand, copywriters, photographers, and developers styling the theme.

---

## 1. Logo
- **Monogram:** a heavy ring enclosing two mirrored "E"s back to back, worn on the outer side of every pair: embroidered in white on The Silent Grind, embossed in sand on A Fresh Start.
- **Wordmark:** `EVLVEX` in a custom stencil-cut logotype: the Es are three bars, each V is split, and the X has a broken arm.
- **Signature line:** *Every pair has a story.* Set in Archivo, bold and uppercase, beneath the wordmark on packaging, workshop cards and the certificate page.
- **Master artwork** (final, supplied 12 Nov 2026): `docs/brand/logos/`. It holds the original monogram and wordmark PNGs in black and white on transparent backgrounds, plus `evlvex-monogram.svg` and `evlvex-wordmark.svg`, vectors traced from them for print and partners.
- **Files in theme:**
  - `assets/evlvex-monogram.svg`: standalone file in Black, used for the favicon and downloads
  - `snippets/evlvex-monogram.liquid`: inline SVG monogram that takes its color from the surrounding text color (`currentColor`)
  - `snippets/evlvex-wordmark.liquid`: inline SVG wordmark (`currentColor`), sized by CSS height
  - `snippets/evlvex-logo.liquid`: header lockup (monogram + wordmark), used when no logo image is uploaded in Theme settings
- **Usage rules:**
  - Clear space around the monogram ≥ ½ of its diameter.
  - Minimum size: 16 px on screen, 6 mm in print.
  - On light backgrounds use Black; on dark backgrounds use White. No other colors.
  - Never stretch, outline, add shadows, or place on busy photography.

## 2. Color palette
The house palette is **black and white**, with neutral greys only. It follows premium sportswear sites: high contrast, no accent color, and the shoes provide the interest. The **website and packaging always use the house palette**.

| Name | Hex | Use |
|---|---|---|
| Black | `#111111` | text, buttons, dark sections (hero, announcement bar, footer) |
| White | `#FFFFFF` | main page background; text and buttons on Black |
| Light grey | `#F5F5F5` | product cards, alternate sections |
| Grey | `#E5E5E5` | feature blocks, newsletter, sale badge |
| Mid grey | `#757575` | muted text (eyebrows, captions); hairlines are the text color at 15% |

There is **no accent color**: links, rules, underlines, the seal and chapter numbers use the text color, so they are black on light sections and white on dark ones.

The Shopify color-scheme mapping is in [theme.md §1](theme.md).

## 3. Typography
| Role | Font (Shopify font library) | Notes |
|---|---|---|
| Headings, story titles | **Archivo ExtraBold** (`archivo_n8`) | Bold, uppercase, tight (letter-spacing −0.01em, line-height about 1.0); heading scale 120% |
| Body / UI | **Archivo** (`archivo_n4`, bold 700) | One family for the whole site |
| Story body text | Archivo 17–18 px, line-height 1.7, max 62 characters per line | Long-form reading on story pages |
| Navigation, buttons, eyebrows | Archivo bold, uppercase, letter-spacing 0.04–0.08em, 12–14 px | e.g. eyebrow "CHAPTER 01 · THE SILENT GRIND" |

No italics anywhere. Buttons, size chips and badges are pills (fully rounded). Fallback if Archivo is unavailable in the store's font picker: Montserrat (`montserrat_n8` / `montserrat_n4`).

## 4. Tone of voice
**Resilient, quiet and direct.** COMEBACK speaks to people who have been knocked down and kept going. We write with calm conviction, not hype: short sentences, plain words, one idea per line. No exclamation marks, no "SALE!!!", no emoji, no superlatives ("best", "ultimate", "iconic"). Use the brand's own story text word for word where it fits (§6).

Every piece of product copy answers three questions, in this order:
1. **The chapter:** which part of the comeback is this shoe? (The Silent Grind / A Fresh Start)
2. **The detail:** which part of the shoe carries it? (the monogram, the overlays, the colour)
3. **The invitation:** what moment in the owner's life is it made for?

- ✅ "Falling behind is not the end. Sometimes, it is where the comeback begins."
- ✅ "Black, with the monogram in white. For the battles no one sees."
- ✅ "Every pair is numbered, inspected before it leaves us, and registered to its owner."
- ❌ "Our most iconic sneaker ever — grab yours before they're gone!!"
- ❌ "Premium luxury quality materials for the modern man."

**Positioning (owner, 20 Nov 2026):** *shoes with a story · original designs · limited edition · made in India · premium.* Every claim must be true, so the words are fixed:

| Say | Don't say (and why) |
|---|---|
| premium sneakers, premium finish | luxury, "house of", couture, finest (not the brand's register) |
| original EvlveX designs; each model has its own design and chapter | every pair uniquely designed, one of a kind (pairs of a model are identical; what is unique per pair is its number and certificate) |
| limited edition; a limited, numbered run; "when this run sells out, it's gone" | not restocked, will not be made again, won't return, "once it's gone, it's gone" (COMEBACK may return in a new run if it succeeds) |
| designed and made in India; every pair inspected before it leaves us | international standards, certified quality (no certificate or test yet: [open item 14](../SPEC.md#open-items)) |
| numbered, QR certificate, registered to you | handmade, by hand, artisan, signed, workshop card, atelier (shoes are factory-made) |
| smooth upper, textured overlays, padded collar, stitched cupsole | leather, suede (materials not confirmed yet: [open item 2](../SPEC.md#open-items)) |
| dust bag, numbered box, insured delivery | shoe trees included (they are not) |

**Rules for stories:**
- **Anything stated as fact about the house, its shoes, materials or people must be true** ([open items](../SPEC.md#open-items)). The COMEBACK story is a concept, not a biography: do not invent founders, athletes or events.
- No real people's names without written consent. No other brands, clubs or hotels by name.
- Model story: 90–150 words. Excerpt: ≤ 280 characters. Pair note: ≤ 200 characters.

## 5. Photography & imagery

Current imagery is cropped from four colour studio photos of both models on dark backdrops (`docs/brand/campaign/`, [shoe-images.md](../brand/shoe-images.md)). The earlier phone photos are in `docs/brand/shoes/`; `assets/sample-court-noir.jpg` is no longer used on the Authenticity page (its fallback is now `evx-sg-full.jpg`).

**Art direction (all images):**
- **Only EvlveX shoes.** No stock photography of other footwear or clothing anywhere.
- **The site is black and white; shoe photography is true colour.** The shoes are the only colour on the page: the black upper and white monogram of *The Silent Grind*, the cream upper, sand overlays and caramel sole of *A Fresh Start*. Never grade them to monochrome.
- Dark studio backdrops (charcoal, black, grey satin), with props kept minimal: boxes, white or black feathers, a plain thank-you card. No legible small print in the frame.
- People appear as hands, feet, silhouettes or from behind. The shoe is the subject.
- No visible third-party logos, signage or brands.
- Every image should feel like a still from the COMEBACK film.

**Image families:**

| Family | What | Where it's used | Ratio |
|---|---|---|---|
| **A. Product still life** | per colorway, seamless white or light-grey backdrop | product gallery, collection cards | 4:5 |
| **B. Chapter frames** | 3–5 cinematic frames per model in its chapter's grade (§6): the shoe in darkness for The Silent Grind, in first light for A Fresh Start | COMEBACK film, story pages, product "The Story" section, certificate | 16:9 and 4:5 crops |
| **C. Details & material** | the monogram (white and embossed), suede texture, laces, cupsole, the workshop card | home "The Mark", About, Care, film detail scenes | 1:1, 3:2 and 4:5 |
| **D. Certificate & packaging** | the box, the QR tag under the tongue, the handwritten workshop card, a phone showing the certificate | Authenticity page, product "Certificate" tab | 4:5 |

**Product still-life shot list (family A), per colorway:**
1. Clean profile (side view): primary product image
2. ¾ front
3. Top-down (laces / vamp and tongue)
4. Back / heel
5. Outsole
6. Macro shots: monogram, leather grain or suede texture, stitching
7. On-foot (2–3 frames), graded to the model's chapter
8. Box, workshop card and QR tag

**File naming:** `<model>-<colorway>-<nn>.jpg` for product shots (e.g. `the-silent-grind-noir-01.jpg`), `chapter-<model>-<nn>.jpg` for chapter frames (e.g. `chapter-a-fresh-start-01.jpg`), `detail-<nn>.jpg`, `packaging-<nn>.jpg`.

Export at ≥ 2400 px on the long edge, sRGB, JPG quality 85. Every image gets descriptive alt text written in the house voice (e.g. *"The Silent Grind in black, side profile, the white monogram catching the light"*).

## 6. The Collection: COMEBACK

EvlveX tells **one story**, COMEBACK, in **chapters**. Each model carries one chapter (a sub-concept). The story is the brand's own text and is used word for word on the site.

| Ch. | Model | Shoe | Colorway | Chapter (sub-concept) | Signature detail |
|---|---|---|---|---|---|
| — | **COMEBACK** | the collection | — | main concept | the EvlveX monogram on every pair |
| 01 | **The Silent Grind** | low-top sneaker | Noir: black upper, black textured toe and collar, white cupsole | *The Silent Grind* | monogram embroidered in white |
| 02 | **A Fresh Start** | low-top sneaker | Cream and Sand: cream upper, sand textured overlays, caramel sole stripe | *A Fresh Start* | monogram embossed in sand |

**Limited edition** (owner, 20 Nov 2026, replacing the 18 Nov "not restocked" decision): COMEBACK is a limited edition made in a **limited, numbered run**. No restock is planned, but the brand may make it again if it is a big success. So the site says "limited, numbered run" and "When this run sells out, it's gone" (true either way), and never "won't return", "will not be made again" or "once it's gone, it's gone". If COMEBACK is remade, it is announced as a new numbered run.

### COMEBACK: main concept
> COMEBACK is about what happens after life knocks you down: the strength to keep going, the courage to move forward, and the choice to become someone new. It is a reminder that falling behind is not the end; sometimes, it is where the comeback begins.

**Line:** *Falling behind is not the end.*

### Chapter 01: The Silent Grind
> THE SILENT GRIND represents the chapters lived in the dark: the struggles, setbacks, and battles that aren't always seen. It is about holding on through the weight of those moments and finding the strength to rise from them.

**Excerpt:** *The chapters lived in the dark: the struggles, setbacks and battles that aren't always seen.*
**Imagery:** dark and monochrome. Black backgrounds, hard light on the white monogram and cupsole.

### Chapter 02: A Fresh Start
> A FRESH START represents the moment after the struggle, when you stop looking back and choose what comes next. It is about carrying the lessons forward, leaving the weight behind, and taking the first step into a new chapter.

**Excerpt:** *The moment after the struggle, when you stop looking back and choose what comes next.*
**Imagery:** light and airy, in black and white. White backgrounds, soft daylight, the suede and embossed monogram.

### COMEBACK literature: "never give up"
Supporting copy around the official story, written in the same voice. It is not a replacement for it. Use it where the site needs more than the story text; keep each line in one place only.

**The COMEBACK code** (home manifesto, black)
> **Knocked down. Never out.**
> Every comeback starts the same way: on the ground.
> A missed chance. A closed door. A season that took more than it gave.
> Nobody claps for the early mornings. Nobody sees the second attempt, or the tenth.
> That is the silent grind. It is where the real work happens.
> Then one day you stop looking back. You lace up. You take the first step.
> That is a fresh start. It is where the story turns.
> EvlveX is made for the road between the two: for everyone who fell behind and refused to stay there.
> **Never give up on your comeback.**

**Four steps of a comeback** (About page)
1. **The Fall.** Life knocks you down. It happens to everyone. What matters is what you do next.
2. **The Grind.** The quiet work no one sees: early starts, small wins, holding on when it would be easier to let go.
3. **The Turn.** The day you stop looking back and choose what comes next. Carry the lessons. Leave the weight.
4. **The Comeback.** Not a return to who you were. A first step into who you are becoming.

**Shoes for the long way back** (About page, closing)
> A comeback is rarely one big moment. It is a thousand small ones: getting up, showing up, starting again. We wanted to make something that stays with you through all of them.
> So every EvlveX pair carries the monogram on its side: a small mark for a big decision. Not to say you have arrived. To say you never gave up.

**Stories page:** "Two models, two chapters, one story. Wear the one that matches where you are right now, and keep going."

**Footer:** "Keep going." · "Every comeback starts with one more step."

### Product photography
The site currently uses crops of four colour campaign photos ([docs/brand/shoe-images.md](../brand/shoe-images.md)). For launch, shoot each model at 3000 px or more: a side profile, a three-quarter view, the monogram, the textured toe and the sole.

## 7. Every pair's own chapter
Beyond the model story, **every individual pair** carries its own short chapter, recorded when it is inspected and packed and shown on its certificate page ([qr-certificates.md](qr-certificates.md)):

- **Pair number:** its place in the model's run, e.g. *Pair No. 0042 of The Silent Grind*.
- **Pair note:** an optional true line about this pair alone, ≤ 200 characters.
- **Owner:** the name of the person it now belongs to, and, for gifts, a personal message.

The shoes are factory-made (owner, 20 Nov 2026), so the **artisan** and **finished on** fields stay empty and there is **no workshop card**. Never write "made by hand", "artisan", "signed" or "atelier".

## 8. Site copy (editable in the theme editor)

**Announcement bar:** "COMEBACK · Limited edition · Numbered pairs" · "Original designs · Made in India" · "Free shipping across India · 7-day size exchange"

**Home: COMEBACK film** (`sections/evlvex-comeback-film.liquid`), five scenes: *COMEBACK* ("EvlveX · The first collection", both shoes) → *The Silent Grind* (Chapter 01) → "Hold on through the weight" (monogram) → *A Fresh Start* (Chapter 02) → "Take the first step" (laces and overlays). Each scene uses the brand text above.

**Home brand statement**
> **Falling behind is not the end.** Sometimes, it is where the comeback begins. EvlveX makes premium sneakers that tell one story in two chapters: The Silent Grind, for the battles no one sees, and A Fresh Start, for the first step into what comes next. Every design is our own, made in India in a limited, numbered run, and every pair is inspected before it leaves us.

**Home: "The EvlveX standard"** (after the featured products): *A story in every pair* · *Original designs* · *Limited edition* · *Made in India*.

**Home manifesto:** "The COMEBACK code" (see §6, COMEBACK literature).

**Footer** (`sections/evlvex-footer.liquid`)
- Statement: **Keep going.** Every comeback starts with one more step.
- Newsletter: **Get early access.** Placeholder "Your email"; note "New releases and early access. No spam." It is the only newsletter on the site.
- Columns: *Shop* (The Collection, The Silent Grind, A Fresh Start) · *COMEBACK* (Our story, Stories, Authenticity) · *Help* (Track your order, Shipping & returns, Size guide, FAQ, Care guide, Contact us) · *Get in touch* (Support: support@evlvex.in, Instagram: @evlvex, "We answer within one working day.", social icons).
- Bottom bar: "© 2026 EvlveX" · "Made in India" · "evlvex.in is the only official EvlveX store." · policy links · country and currency · payment icons.

**Authenticity "How it works":** *Made and numbered* → *Inspected and recorded* → *Registered to you*

**Care intro:** "Keep your comeback going."

**System pages use standard e-commerce wording**, not story language: 404 ("Page not found", "Continue shopping"), Contact ("Contact us", "Send us a message"), FAQ, Size guide, Track your order, Shipping & returns, "Journal". Recommendation headings are "The other chapter" (product page, cart) and "The collection" (search). The brand voice stays in the story content: home film and manifesto, About, Stories, certificates.

**About page:** "Built for the comeback" · "One story, two chapters" · *The Silent Grind* · *A Fresh Start*

**Stories index:** "COMEBACK" · "One story, two chapters"

**Product tabs:** Design & make ("An original EvlveX design, model CB-01. Smooth upper with textured overlays at the toe, eyestay and collar, a padded collar and a stitched white cupsole… Designed and made in India. Every pair is inspected before it is packed."), Size & fit ("Unisex, UK/India sizing. Our shoes run true to standard Indian/UK sizing…", links to the size guide), Care, Shipping & returns, Your pair's certificate.

**Certificate thank-you copy** is in [qr-certificates.md §3](qr-certificates.md).
