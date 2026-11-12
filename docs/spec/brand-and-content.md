# EvlveX — Brand & Content Specification

Part of the [EvlveX specification](../SPEC.md). **Audience:** brand, copywriters, photographers, and developers styling the theme.

---

## 1. Logo
- **Monogram:** a heavy ring enclosing two mirrored "E"s back to back, as embroidered on the side panel of Court 01.
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
The house palette is taken from the first model, Court 01. Individual models may come in other leathers (Cognac, Oxblood, Espresso), but the **website and packaging always use the house palette**.

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
| Navigation, buttons, eyebrows | Jost, uppercase, letter-spacing 0.2em, 12–13 px | e.g. eyebrow "CHAPTER 01 · COURT 01" |

Fallbacks if a font is unavailable in the store's font picker: Playfair Display / Montserrat.

## 4. Tone of voice
**Storytelling, quiet and specific.** We write like a good short-story writer: concrete sensory detail (light, leather, place, hands, hour of day) instead of adjectives. Short sentences. One idea per paragraph. No exclamation marks, no "SALE!!!", no emoji, no superlatives ("best", "ultimate", "iconic").

Every piece of product copy answers three questions, in this order:
1. **The story:** where does this shoe come from? (a place, an hour, a person)
2. **The detail:** which part of the shoe carries the story? (a stitch, a color, a shape)
3. **The invitation:** what moment in the owner's life is it made for?

- ✅ "Every pair has a story. This one begins on a clay court, just after the light turns."
- ✅ "Cut from a single panel of leather. No seams to hide behind."
- ✅ "Every pair is numbered, signed by its artisan, and registered to its owner."
- ❌ "Our most iconic sneaker ever — grab yours before they're gone!!"
- ❌ "Premium luxury quality materials for the modern man."

**Rules for stories:**
- Stories may be fables (an unnamed club, a watchmaker in an old quarter), but **anything stated as fact about the house, its founders or its artisans must be true** ([open items](../SPEC.md#open-items)).
- No real people's names without written consent. No other brands, clubs or hotels by name.
- Model story: 90–150 words. Excerpt: ≤ 280 characters. Pair note: ≤ 200 characters.

## 5. Photography & imagery

The sample photos (`assets/sample-court-ivory.jpg`, `assets/sample-court-noir.jpg`) are **placeholders only**: they were shot on boxes and walls. No placeholder imagery exists yet for the other models.

**Art direction (all images):**
- Natural or soft directional light; warm, slightly filmic grade with fine grain; never glossy or "catalogue".
- Colors held close to the house palette: ivory, sand, stone, deep shadow. Avoid saturated blues and greens.
- People appear as hands, feet, silhouettes or from behind. The shoe and the place are the subject.
- No visible third-party logos, signage or brands.
- Every image should feel like a still from the story it belongs to.

**Image families:**

| Family | What | Where it's used | Ratio |
|---|---|---|---|
| **A. Product still life** | per colorway, seamless ivory or stone backdrop | product gallery, collection cards | 4:5 |
| **B. Story plates** | 3–5 atmospheric frames per model that set the story's scene (§6) | story pages, product "The Story" section, home hero, certificate | 16:9 and 4:5 crops |
| **C. Atelier & material** | hands cutting and stitching, hides, tools, lasts, the workshop card being written | The Maison, home "From the Atelier", Care | 3:2 and 4:5 |
| **D. Certificate & packaging** | the box, the QR tag under the tongue, the handwritten workshop card, a phone showing the certificate | Authenticity page, product "Certificate" tab | 4:5 |

**Product still-life shot list (family A), per colorway:**
1. Clean profile (side view): primary product image
2. ¾ front
3. Top-down (laces / vamp and tongue)
4. Back / heel
5. Outsole
6. Macro shots: monogram, leather grain or suede texture, stitching
7. On-foot (2–3 frames), shot inside the model's story setting where possible
8. Box, workshop card and QR tag

**File naming:** `<model>-<colorway>-<nn>.jpg` for product shots (e.g. `court-01-noir-01.jpg`), `story-<model>-<nn>.jpg` for story plates (e.g. `story-court-01-01.jpg`), `atelier-<nn>.jpg`, `packaging-<nn>.jpg`.

Export at ≥ 2400 px on the long edge, sRGB, JPG quality 85. Every image gets descriptive alt text written in the house voice (e.g. *"Court 01 in Ivory Sand on an empty clay court at dusk"*).

## 6. The Collection: models and their stories

Each model is a **chapter** of the house, numbered in order of release. The working names, colorways and stories below are **proposed drafts** for brand approval ([open items](../SPEC.md#open-items)); only Court 01 exists physically today. Each story is stored as an `evlvex_story` entry ([qr-certificates.md §5](qr-certificates.md)).

| Ch. | Model | Type | Colorways | Story | Signature detail |
|---|---|---|---|---|---|
| 01 | **Court 01** | low-top leather court sneaker | Ivory Sand, Noir | *The Last Set at Dusk* | sand suede, caramel sole stripe, embroidered gold monogram |
| 02 | **Promenade Loafer** | hand-sewn penny loafer | Cognac, Noir | *Sunday, Unhurried* | hand-stitched moccasin toe, brass monogram coin in the strap |
| 03 | **Atelier Oxford** | whole-cut oxford | Noir, Oxblood | *The First Commission* | cut from one panel of leather, single seam at the heel |
| 04 | **Nocturne Chelsea** | suede Chelsea boot | Sand, Espresso | *The Night Train* | leather lining, quiet rubber sole, pulls on without laces |
| 05 | **Riviera Mule** | hand-woven leather mule | Ivory, Caramel | *The Salt Hour* | woven calf strips, nine hours of weaving per pair |

### Chapter 01 — Court 01: *The Last Set at Dusk*
*A seaside club, late summer.*

> There was a club by the sea where the members played one last set each evening, long after the score stopped mattering. The light came in low and turned the clay to sand. The baseline glowed caramel for a moment before it disappeared. Nobody wanted to be the first to walk off the court.
>
> Court 01 is made from that hour. The suede is the color of clay dust on white leather. The caramel stripe is the baseline at dusk. The gold monogram on its side is the last of the light. It is a shoe for the evenings you stay a little longer than you planned.

**Excerpt:** *A seaside club, one last set, and the hour when clay turns to sand. Court 01 is made from that light.*
**Story plates:** an empty clay court at golden hour; a towel over the net post; a chalked baseline in long shadow; Court 01 resting on a wooden bench, laces loose.

### Chapter 02 — Promenade Loafer: *Sunday, Unhurried*
*A river town, every Sunday for forty years.*

> In the old quarter there lived a watchmaker who polished one pair of loafers every Saturday night: a soft cloth, a little wax, the radio low. On Sunday morning he walked the length of the river and back. In forty years, nobody ever saw him hurry.
>
> The Promenade is sewn the way he walked: by hand, one stitch at a time, in a single sitting around a moccasin toe that softens to your foot within a week. The strap holds a small brass coin pressed with the monogram, for luck, as his did. It is a shoe for the days that ask nothing of you.

**Excerpt:** *A watchmaker, a river, and forty years of Sundays without hurry. The Promenade is hand-sewn at the same pace.*
**Story plates:** a stone river embankment in early mist; polished loafers on a doorstep beside a folded newspaper; a hand buffing leather under a kitchen lamp; a pocket watch on linen.

### Chapter 03 — Atelier Oxford: *The First Commission*
*An atelier bench, three weeks before a wedding.*

> A young man came to the bench with a wedding in three weeks and no shoes worth the occasion. He could afford one pair, so it had to be the right one. The cutter chose a whole-cut: a single panel of leather, no seams to hide behind, no second chance with the knife.
>
> He wore them to that wedding, then to his own, then to his daughter's. The Atelier Oxford is still cut from one piece and closed with a single seam at the heel. Buy it for one occasion. Keep it for all of them.

**Excerpt:** *One young man, one wedding, one pair of shoes cut from a single panel of leather. Made for one occasion; kept for all of them.*
**Story plates:** a full hide laid across the cutting bench; a paper pattern and a cutting knife; a wedding invitation propped against a last; the finished oxfords beside a folded pocket square.

> ⚠️ This story is told as a fable. If it is presented as the house's actual first commission, it must be true.

### Chapter 04 — Nocturne Chelsea: *The Night Train*
*An overnight sleeper, arriving at dawn.*

> Some journeys are made to be slept through. The night train leaves after dinner and arrives with the dawn, in a city where nobody knows you yet. You wake to fogged glass and a knock at the door, and you have four minutes to be ready.
>
> The Nocturne is made for those four minutes. A suede Chelsea boot that pulls on without laces, a leather lining that has kept warm under the berth all night, a sole that stays quiet on station marble. Sand for the morning you arrive. Espresso for the long way home.

**Excerpt:** *A sleeper train, a city at dawn, four minutes to be ready. The Nocturne pulls on without laces and steps out quietly.*
**Story plates:** a sleeper compartment at first light, window fogged; the boots beside a leather bag under the berth; a platform in blue dawn, seen from the train door; a ticket and a folded scarf.

### Chapter 05 — Riviera Mule: *The Salt Hour*
*A sunlit terrace above the sea, after the last swim.*

> After the last swim of the day there is an hour when the salt dries on your skin and nobody wants to go indoors. Towels on warm stone, a glass of something cold, bare feet looking for something easy to step into.
>
> The Riviera is woven by hand from strips of soft calf, nine hours to a pair, over a cushioned footbed that forgives the walk back up from the water. It is the shoe you keep by the door all summer, and find again, a little salt-marked, the next.

**Excerpt:** *The hour after the last swim, salt drying on warm stone. The Riviera is woven by hand for bare feet and slow evenings.*
**Story plates:** a sun-bleached stone terrace with a striped towel; the mules beside a cold glass; hands weaving leather strips; wet footprints fading on stone.

## 7. Every pair's own chapter
Beyond the model story, **every individual pair** carries its own short chapter, recorded when it leaves the atelier and shown on its certificate page ([qr-certificates.md](qr-certificates.md)):

- **Pair number:** its place in the model's chapter, e.g. *Pair No. 0042 of Court 01*.
- **Artisan:** who finished it (first name and initial, with their consent), e.g. *Finished by Marco R.*
- **Finished on:** the date it left the bench.
- **Pair note:** an optional line from the workshop about this pair alone, e.g. *"The last pair cut from hide lot 12. The grain runs especially fine across the toe."*
- **Owner:** the name of the person it now belongs to, and, for gifts, a personal message.

The same details are handwritten on a **workshop card** placed in the box ([operations.md §2](operations.md)).

## 8. Site copy (editable in the theme editor)

**Announcement bar:** "Complimentary shipping · Every pair numbered, certified and told"

**Home hero:** eyebrow "THE HOUSE OF EVLVEX" · headline "Every Pair Has a Story" · sub "Luxury shoes made by hand, each born from a story of its own." · CTAs "Discover the Collection", "Read the Stories"

**Home brand statement**
> At EvlveX, a shoe begins as a story: a seaside court at dusk, a river walked every Sunday, a night train arriving at dawn. We shape leather around that story by hand until it can be worn. Then each pair is numbered, signed by the artisan who finished it, and registered to the person who will carry the story further.

**"Every pair, its own chapter" (multicolumn)**
- **Numbered.** Each pair carries its place in the chapter, from No. 0001 onward.
- **Signed by its artisan.** The hands that finished it, and the day they did.
- **Registered to you.** Scan the tag inside and your name is written into its story.

**Newsletter / footer**
> **Receive each new chapter first.** One letter when a new story is told. Nothing else.

**Authenticity "How it works":** *Made and numbered* → *Signed and recorded* → *Registered to you*

**Care intro:** "A story is kept by the one who wears it."

**404:** "This page has no story yet." · "Return to the Maison" · "Scanned a tag? Verify your serial"

**Certificate thank-you copy** is in [qr-certificates.md §3](qr-certificates.md).
