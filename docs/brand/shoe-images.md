# EvlveX: shoe imagery

**Audience:** theme developers and the store owner.

All shoe imagery comes from the brand's own photo shoot of the COMEBACK models (supplied 27 Nov 2026, 16 photos, 7008×4672). The site design is white, sand and black; **the photography is always true colour**: it is only cropped and resized, never recoloured. The Silent Grind was shot on a cool grey backdrop and A Fresh Start on warm brown; both are kept as shot.

## Sources
The raw camera files sit in `docs/brand/campaign/raw/`. That folder is git-ignored (15–22 MB each), so keep a copy elsewhere. Committed **masters** (3000 px on the long edge, q85) sit in `docs/brand/campaign/`:

| Master | Camera file | What it shows |
|---|---|---|
| `sg-side.jpg` | DSC08928 | The Silent Grind, side profile, embroidered white monogram |
| `sg-front.jpg` | DSC08930 | The Silent Grind, 3/4 front, EVLVEX on the tongue (portrait) |
| `sg-other-side.jpg` | DSC08932 | The Silent Grind, inner side (no monogram) |
| `sg-heel.jpg` | DSC08936 | The Silent Grind heel, *NEVER GIVE UP* |
| `sg-sole.jpg` | DSC08937 | The Silent Grind heel and outsole |
| `sg-hold.jpg` | DSC08416 | The Silent Grind held to the chest (portrait) |
| `sg-duo.jpg` | DSC08407 | The Silent Grind from above and from the side; the yellow strip at the right edge is cropped off |
| `fs-side.jpg` | DSC08890 | A Fresh Start, 3/4 side, embossed monogram, gum sole |
| `fs-front.jpg` | DSC08892 | A Fresh Start, toe forward (portrait) |
| `fs-top.jpg` | DSC08894 | A Fresh Start from above, laces and tongue (portrait) |
| `fs-heel.jpg` | DSC08897 | A Fresh Start heel, *NEVER GIVE UP* |
| `pair-card.jpg` | DSC08452 | both models with the *COMEBACK Series-01* card between them |
| `card-comeback.jpg` | DSC08446 | the *COMEBACK Series-01* card in front of the boxes |
| `box-front.jpg` | DSC08967 | the black EvlveX box on satin, front-lit |
| `box-angle.jpg` | DSC08957 | the box at an angle, low light |
| `box-streak.jpg` | DSC08976 | the box lid in a streak of light |

## Site crops
`tools/build-shoe-images.js` makes these from the masters (q82, all under 250 KB):

| Asset | Size | From | Used for |
|---|---|---|---|
| `evx-sg-full.jpg` | 1600×1067 | sg-side, full frame | film, hero, editorial, articles |
| `evx-sg-card.jpg` | 1200×1500 | sg-front, 4:5 | product cards, drop hero/grid |
| `evx-sg-monogram.jpg` | 1000×1120 | sg-side, the monogram | film detail, chapter inset |
| `evx-sg-sole.jpg` | 1600×1067 | sg-sole | film texture shot, atelier |
| `evx-sg-heel.jpg` | 1600×1067 | sg-heel | atelier, articles, chapter inset |
| `evx-sg-hold.jpg` | 1200×1500 | sg-hold, 4:5 | lifestyle, editorial |
| `evx-sg-duo.jpg` | 1600×1200 | sg-duo, 4:3 | hero, lifestyle |
| `evx-fs-full.jpg` | 1600×900 | fs-side, 16:9 | film, lifestyle |
| `evx-fs-wide.jpg` | 1600×1200 | fs-side, 4:3 | hero, editorial, pair story |
| `evx-fs-card.jpg` | 1200×1500 | fs-front, 4:5 | product cards, drop hero/grid |
| `evx-fs-monogram.jpg` | 1000×760 | fs-side, the monogram | film detail, chapter inset |
| `evx-fs-laces.jpg` | 1000×1500 | fs-top, full frame | film texture shot, lifestyle |
| `evx-fs-heel.jpg` | 1600×1067 | fs-heel | atelier, chapter inset |
| `evx-comeback-pair.jpg` | 1600×1067 | pair-card | film backdrop, hero, collection cards |
| `evx-comeback-card.jpg` | 1600×1067 | card-comeback | articles |
| `evx-box.jpg` | 1600×1067 | box-front | atelier, collection cards |
| `evx-box-angle.jpg` | 1600×1067 | box-angle | spare |
| `evx-box-streak.jpg` | 1600×1067 | box-streak | articles |

If a crop's size changes, update the sizes in `snippets/evlvex-demo-image.liquid`, `sections/evlvex-comeback-film.liquid` (shot list and the "both" frames), `sections/evlvex-pair-story.liquid`, `sections/evlvex-drop-grid.liquid` and `sections/evlvex-drop-hero.liquid`.

`snippets/evlvex-demo-image.liquid` picks from these by kind wherever no image has been chosen in the theme editor. Its `shoe` filter keeps only `evx-sg-*` or `evx-fs-*` crops, so each story chapter shows only its own model. Theme settings → **EvlveX → Show demo photography** switches them off.

## Product galleries (Admin)
Uploaded 27 Nov 2026 from the masters, with alt text:
- **The Silent Grind:** sg-side, sg-front, sg-other-side, sg-heel, sg-sole, sg-hold, sg-duo, pair-card
- **A Fresh Start:** fs-side, fs-front, fs-top, fs-heel, pair-card

## Social sharing image
`docs/brand/social/evlvex-share-1200x628.png`, also `assets/evx-share.png`: 1200×628. The monogram, wordmark, *COMEBACK · Limited edition* and *Original designs · Made in India · Numbered pairs* run across the top. Below them, `evx-sg-full.jpg` and `evx-fs-wide.jpg` sit side by side. The theme uses it for pages without their own image (`snippets/meta-tags.liquid`); you can also upload it in Admin → Online Store → Preferences → *Social sharing image*. To rebuild it, edit `docs/brand/social/share.html` and screenshot it at 1200×628, for example with `msedge --headless=new --window-size=1200,628 --screenshot=out.png share.html`.

## Rebuild
Needs `jimp` 0.x (`npm i jimp@0.22.12` in any folder).
```
node tools/build-shoe-images.js docs/brand/campaign assets <node_modules folder containing jimp>
```
To make new masters from raw camera files, resize each to 3000 px on the long edge. jpeg-js needs `maxMemoryUsageInMB: 2048` to decode 33-megapixel files.
