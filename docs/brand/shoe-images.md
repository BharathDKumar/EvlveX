# EvlveX: shoe imagery

**Audience:** theme developers and the store owner.

The site's own shoe imagery comes from four colour studio photos of the COMEBACK models (`docs/brand/campaign/`, supplied 15 Nov 2026, 1195×896 each). The site design is black and white; **the shoe photography is always true colour**.

| Original | What it shows |
|---|---|
| `silent-grind-pair.jpg` | two Silent Grind shoes floating, dark grey studio |
| `fresh-start-stand.jpg` | A Fresh Start on a black acrylic stand, beside a thank-you card |
| `collage-unboxing.jpg` | 7 panels: both pairs with boxes, unboxing scenes, feathers |
| `triptych-satin.jpg` | 3 panels on grey satin: A Fresh Start in a cream box, both pairs, The Silent Grind in a navy box |

`tools/build-shoe-images.js` **only crops** them; it never changes colour. The 4:5 cards and the wide hero place a crop on a canvas that matches the studio backdrop. Every crop leaves out the thank-you cards' small print and the corner marks in the originals.

| Asset | Size | Crop | Used for |
|---|---|---|---|
| `evx-sg-full.jpg` | 960×720 | silent-grind-pair, both shoes | film, hero, editorial |
| `evx-sg-card.jpg` | 1024×1280 | the same on a 4:5 studio canvas | product cards, product page |
| `evx-sg-monogram.jpg` | 397×445 | collage, bottom middle: close-up with feathers | film detail |
| `evx-sg-sole.jpg` | 392×490 | triptych, right: in the navy velvet box | film texture shot, lifestyle |
| `evx-fs-full.jpg` | 950×530 | fresh-start-stand, shoe on the stand | film, lifestyle |
| `evx-fs-wide.jpg` | 1366×1024 | the same on a wide studio canvas | hero, editorial |
| `evx-fs-card.jpg` | 1024×1280 | the same on a 4:5 studio canvas | product cards, product page |
| `evx-fs-monogram.jpg` | 389×295 | collage, top right: in the black box | film detail, articles |
| `evx-fs-laces.jpg` | 397×460 | triptych, left: in the cream box on feathers | film texture shot, lifestyle |
| `evx-comeback-pair.jpg` | 399×445 | collage, top left: both pairs with their boxes | film backdrop, collection cards |

If a crop's size changes, update the sizes in `sections/evlvex-comeback-film.liquid` (shot list and the "both" frames) and `snippets/evlvex-demo-image.liquid`.

`snippets/evlvex-demo-image.liquid` picks from these by kind wherever no image has been chosen. Turn this off at launch in Theme settings → **EvlveX → Show demo photography**.

**Rebuild** (needs `jimp` 0.x installed somewhere):
```
node tools/build-shoe-images.js docs/brand/campaign assets <node_modules folder containing jimp>
```

**For launch:** these originals are about 1200 px wide. For full-width heroes, use the same shots at 3000 px or more and upload them in Shopify (products, collections, and each COMEBACK film scene's *Image*) rather than rebuilding these assets. The earlier phone photos stay in `docs/brand/shoes/` for reference.
