# EvlveX — Brand & Content Specification

Part of the [EvlveX specification](../SPEC.md). **Audience:** brand, copywriters, photographers, and developers styling the theme.

---

## 1. Logo
- **Monogram:** a heavy ring enclosing two mirrored "E"s back to back, worn on the outer side of every pair: embroidered in white on The Silent Grind, embossed in sand on A Fresh Start.
- **Wordmark:** `EVLVEX` in a custom stencil-cut logotype: the Es are three bars, each V is split, and the X has a broken arm.
- **Signature line:** *Every pair has a story.* Set in Cormorant italic beneath the wordmark on packaging, workshop cards and the certificate page.
- **Master artwork** (final, supplied 12 Nov 2026): `docs/brand/logos/`. It holds the original monogram and wordmark PNGs in black and white on transparent backgrounds, plus `evlvex-monogram.svg` and `evlvex-wordmark.svg`, vectors traced from them for print and partners.
- **Files in theme:**
  - `assets/evlvex-monogram.svg`: standalone file in Sand-gold, used for the favicon and downloads
  - `snippets/evlvex-monogram.liquid`: inline SVG monogram that takes its color from the surrounding text color (`currentColor`)
  - `snippets/evlvex-wordmark.liquid`: inline SVG wordmark (`currentColor`), sized by CSS height
  - `snippets/evlvex-logo.liquid`: header lockup (monogram + wordmark), used when no logo image is uploaded in Theme settings
- **Usage rules:**
  - Clear space around the monogram ≥ ½ of its diameter.
  - Minimum size: 16 px on screen, 6 mm in print.
  - On light backgrounds use Noir or Sand-gold; on dark backgrounds use Ivory or Sand-gold.
  - Never stretch, outline, add shadows, or place on busy photography.

## 2. Color palette
The house palette is taken from the two COMEBACK models: Noir from The Silent Grind, Ivory and Sand from A Fresh Start. The **website and packaging always use the house palette**.

| Name | Hex | Source | Use |
|---|---|---|---|
| Noir | `#0E0E0E` | black leather | text, dark sections, footer |
| Ivory | `#F5F0E6` | cream leather | main page background |
| Bone | `#FBFAF7` | midsole | cards, alternate sections, story body background |
| Sand | `#CDBA98` | suede & laces | soft feature blocks |
| Sand-gold | `#B89B6A` | logo embroidery | accents, hairlines, seal, chapter numbers, buttons on Noir |
| Caramel | `#B4734A` | sole stripe | rare highlight only (e.g. "New chapter" badge) |

The Shopify color-scheme mapping is in [theme.md §1](theme.md).

## 3. Typography
| Role | Font (Shopify font library) | Notes |
|---|---|---|
| Headings, story titles | **Cormorant** (`cormorant_n4`, italic `cormorant_i4`) | Elegant high-contrast serif; heading scale 130%. Italic for story titles, pull quotes and signatures |
| Body / UI | **Jost** (`jost_n4`) | Clean geometric sans that echoes the monogram |
| Story body text | Cormorant 20–22 px, line-height 1.6, max 62 characters per line | Long-form reading on story pages only |
| Navigation, buttons, eyebrows | Jost, uppercase, letter-spacing 0.2em, 12–13 px | e.g. eyebrow "CHAPTER 01 · THE SILENT GRIND" |

Fallbacks if a font is unavailable in the store's font picker: Playfair Display / Montserrat.

## 4. Tone of voice
**Resilient, quiet and direct.** COMEBACK speaks to people who have been knocked down and kept going. We write with calm conviction, not hype: short sentences, plain words, one idea per line. No exclamation marks, no "SALE!!!", no emoji, no superlatives ("best", "ultimate", "iconic"). Use the brand's own story text word for word where it fits (§6).

Every piece of product copy answers three questions, in this order:
1. **The chapter:** which part of the comeback is this shoe? (The Silent Grind / A Fresh Start)
2. **The detail:** which part of the shoe carries it? (the monogram, the suede, the colour)
3. **The invitation:** what moment in the owner's life is it made for?

- ✅ "Falling behind is not the end. Sometimes, it is where the comeback begins."
- ✅ "Black, with the monogram in white. For the battles no one sees."
- ✅ "Every pair is numbered, signed by its artisan, and registered to its owner."
- ❌ "Our most iconic sneaker ever — grab yours before they're gone!!"
- ❌ "Premium luxury quality materials for the modern man."

**Rules for stories:**
- **Anything stated as fact about the house, its shoes, materials or people must be true** ([open items](../SPEC.md#open-items)). The COMEBACK story is a concept, not a biography: do not invent founders, athletes or events.
- No real people's names without written consent. No other brands, clubs or hotels by name.
- Model story: 90–150 words. Excerpt: ≤ 280 characters. Pair note: ≤ 200 characters.

## 5. Photography & imagery

Current imagery is made from two phone photos of the real shoes (`docs/brand/shoes/`; the same files are in the theme as `assets/sample-court-ivory.jpg` = A Fresh Start and `assets/sample-court-noir.jpg` = The Silent Grind, used on the Authenticity page). They were shot on boxes and walls, so the theme uses **graded crops** ([shoe-images.md](../brand/shoe-images.md)). They are stand-ins until studio photography exists.

**Art direction (all images):**
- **Only EvlveX shoes.** No stock photography of other footwear or clothing anywhere.
- **Grade by chapter:** *The Silent Grind* is dark and monochrome (Noir, hard light on the white monogram and cupsole); *A Fresh Start* is light and airy (Ivory, soft daylight on cream and sand).
- Colors held close to the house palette: ivory, sand, stone, deep shadow. Avoid saturated blues and greens.
- People appear as hands, feet, silhouettes or from behind. The shoe is the subject.
- No visible third-party logos, signage or brands.
- Every image should feel like a still from the COMEBACK film.

**Image families:**

| Family | What | Where it's used | Ratio |
|---|---|---|---|
| **A. Product still life** | per colorway, seamless ivory or stone backdrop | product gallery, collection cards | 4:5 |
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
| 01 | **The Silent Grind** | low-top sneaker | Noir: black upper, black suede toe and collar, white cupsole | *The Silent Grind* | monogram embroidered in white |
| 02 | **A Fresh Start** | low-top sneaker | Cream and Sand: cream upper, sand suede overlays, caramel sole stripe | *A Fresh Start* | monogram embossed in sand |

### COMEBACK: main concept
> COMEBACK is about what happens after life knocks you down: the strength to keep going, the courage to move forward, and the choice to become someone new. It is a reminder that falling behind is not the end; sometimes, it is where the comeback begins.

**Line:** *Falling behind is not the end.*

### Chapter 01: The Silent Grind
> THE SILENT GRIND represents the chapters lived in the dark: the struggles, setbacks, and battles that aren't always seen. It is about holding on through the weight of those moments and finding the strength to rise from them.

**Excerpt:** *The chapters lived in the dark: the struggles, setbacks and battles that aren't always seen.*
**Imagery:** dark and monochrome. Noir backgrounds, hard light on the white monogram and cupsole.

### Chapter 02: A Fresh Start
> A FRESH START represents the moment after the struggle, when you stop looking back and choose what comes next. It is about carrying the lessons forward, leaving the weight behind, and taking the first step into a new chapter.

**Excerpt:** *The moment after the struggle, when you stop looking back and choose what comes next.*
**Imagery:** light and airy. Ivory backgrounds, soft daylight, the sand suede and embossed monogram.

### Product photography
The site currently uses graded crops of two phone photos ([docs/brand/shoe-images.md](../brand/shoe-images.md)). For launch, shoot each model on a seamless background at 3000 px or more: a side profile, a three-quarter view, the monogram, the suede toe and the sole.

## 7. Every pair's own chapter
Beyond the model story, **every individual pair** carries its own short chapter, recorded when it leaves the atelier and shown on its certificate page ([qr-certificates.md](qr-certificates.md)):

- **Pair number:** its place in the model's chapter, e.g. *Pair No. 0042 of The Silent Grind*.
- **Artisan:** who finished it (first name and initial, with their consent), e.g. *Finished by Marco R.*
- **Finished on:** the date it left the bench.
- **Pair note:** an optional line from the workshop about this pair alone, e.g. *"The last pair cut from hide lot 12. The grain runs especially fine across the toe."*
- **Owner:** the name of the person it now belongs to, and, for gifts, a personal message.

The same details are handwritten on a **workshop card** placed in the box ([operations.md §2](operations.md)).

## 8. Site copy (editable in the theme editor)

**Announcement bar:** "Complimentary shipping · Every pair numbered, certified and told" · "COMEBACK · The Silent Grind & A Fresh Start"

**Home: COMEBACK film** (`sections/evlvex-comeback-film.liquid`), five scenes: *COMEBACK* (both shoes, the main concept) → *The Silent Grind* → "Hold on through the weight" (monogram) → *A Fresh Start* → "Take the first step" (laces and suede). Each scene uses the brand text above.

**Home brand statement**
> **Falling behind is not the end.** Sometimes, it is where the comeback begins. EvlveX tells one story in two chapters: *The Silent Grind*, for the battles no one sees, and *A Fresh Start*, for the first step into what comes next. Every pair is numbered and registered to the person writing their own comeback.

**"Every pair, its own chapter" (multicolumn)**
- **Numbered.** Each pair carries its place in the chapter, from No. 0001 onward.
- **Signed by its artisan.** The hands that finished it, and the day they did.
- **Registered to you.** Scan the tag inside and your name is written into its story.

**Newsletter / footer**
> **Receive each new chapter first.** One letter when a new story is told. Nothing else.

**Authenticity "How it works":** *Made and numbered* → *Signed and recorded* → *Registered to you*

**Care intro:** "Keep your comeback going."

**404:** "This page has no story yet." · "Return to the Maison" · "Scanned a tag? Verify your serial"

**About page:** "Built for the comeback" · "One story, two chapters" · *The Silent Grind* · *A Fresh Start*

**Stories index:** "COMEBACK" · "One story, two chapters"

**Product tabs:** Materials & craft ("Smooth upper with suede overlays at the toe, eyestay and collar, a padded collar and a stitched white cupsole…"), Size & fit ("EU sizing. True to size…"), Care, Shipping & returns, Your pair's certificate.

**Certificate thank-you copy** is in [qr-certificates.md §3](qr-certificates.md).
