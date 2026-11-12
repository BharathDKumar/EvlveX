# EvlveX: shoe imagery

**Audience:** theme developers and the store owner.

Until studio photography exists, the theme's imagery is made from two phone photos of the COMEBACK models (`docs/brand/shoes/`):

| Original | Model | Chapter |
|---|---|---|
| `the-silent-grind-original.jpg` (1024×768) | The Silent Grind, black | Sub-concept I |
| `a-fresh-start-original.jpg` (768×1024) | A Fresh Start, cream and sand | Sub-concept II |

`tools/build-shoe-images.js` grades and crops them into theme assets:
- **The Silent Grind** is graded monochrome, with the background vignetted into Noir.
- **A Fresh Start** keeps its sand and cream tones. Cool background colours (the blue wall and the green floor) are washed into Ivory.

| Asset | What it shows | Used for |
|---|---|---|
| `evx-sg-full.jpg` | The Silent Grind, side profile | film, hero, editorial |
| `evx-sg-card.jpg` | the same on a 4:5 Noir card | product cards, product page |
| `evx-sg-monogram.jpg` | white monogram, close up | film detail, atelier |
| `evx-sg-sole.jpg` | suede toe and white cupsole | lifestyle, atelier |
| `evx-fs-full.jpg` | A Fresh Start, three-quarter view | film, lifestyle |
| `evx-fs-wide.jpg` | the same on a wide Ivory canvas | hero, editorial |
| `evx-fs-card.jpg` | 4:5 crop | product cards, product page |
| `evx-fs-monogram.jpg` | embossed monogram, close up | atelier, articles |
| `evx-fs-laces.jpg` | sand laces and suede | film detail, lifestyle |
| `evx-comeback-pair.jpg` | both shoes, dark and light halves | hero, collection cards |

`snippets/evlvex-demo-image.liquid` picks from these by kind, wherever no image has been chosen. Turn this off at launch in Theme settings → **EvlveX → Show demo photography**.

**Rebuild** (needs `jimp` 0.x installed somewhere):
```
node tools/build-shoe-images.js <folder with 5.jpg (A Fresh Start) and 6.jpg (The Silent Grind)> assets <node_modules folder containing jimp>
```

**For launch:** the originals are compressed phone shots, and their backgrounds still show through. Shoot each model on a seamless background at 3000 px or more: a side profile, a three-quarter view, the monogram, the suede toe and the sole. Then upload those images in Shopify instead of rebuilding these assets.
