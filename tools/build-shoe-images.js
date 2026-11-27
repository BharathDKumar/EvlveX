// Build EvlveX shoe imagery from the photo-shoot masters in docs/brand/campaign/ (see docs/brand/shoe-images.md).
// Photos are used in true colour: this script only crops and resizes them, it never changes colour.
// Masters are 3000 px on the long edge (3000×2000 landscape, 2000×3000 portrait, sg-duo 3000×2210).
// Usage: node tools/build-shoe-images.js <campaignDir> <assetsDir> <node_modules dir that contains jimp 0.x>
const path = require('path');
const [, , srcDir, assets, nm] = process.argv;
const Jimp = require(path.join(nm, 'jimp'));

const read = (f) => Jimp.read(path.join(srcDir, f + '.jpg'));
// Crop (x, y, w, h in master pixels), then resize to the output width; height follows the crop's ratio.
const shot = (img, [x, y, w, h], outW) => img.clone().crop(x, y, w, h).resize(outW, Jimp.AUTO, Jimp.RESIZE_BICUBIC);
const full = (img, outW) => img.clone().resize(outW, Jimp.AUTO, Jimp.RESIZE_BICUBIC);
const save = (img, name, q = 82) =>
  img.quality(q).writeAsync(path.join(assets, name)).then(() => console.log('✔', name, img.bitmap.width + 'x' + img.bitmap.height));

(async () => {
  // The Silent Grind (black)
  const sgSide = await read('sg-side'); // side profile, white monogram, grey backdrop
  await save(full(sgSide, 1600), 'evx-sg-full.jpg'); // 1600×1067
  await save(shot(sgSide, [850, 760, 1000, 1120], 1000), 'evx-sg-monogram.jpg'); // embroidered monogram
  await save(shot(await read('sg-front'), [0, 500, 2000, 2500], 1200), 'evx-sg-card.jpg'); // 3/4 front, 4:5
  await save(full(await read('sg-sole'), 1600), 'evx-sg-sole.jpg'); // heel and outsole
  await save(full(await read('sg-heel'), 1600), 'evx-sg-heel.jpg'); // NEVER GIVE UP heel
  await save(shot(await read('sg-hold'), [0, 500, 2000, 2500], 1200), 'evx-sg-hold.jpg'); // held to the chest, 4:5
  await save(shot(await read('sg-duo'), [26, 0, 2947, 2210], 1600), 'evx-sg-duo.jpg'); // top + side on black/white, 4:3

  // A Fresh Start (cream and sand)
  const fsSide = await read('fs-side'); // 3/4 side, embossed monogram, warm brown backdrop
  await save(shot(fsSide, [0, 312, 3000, 1688], 1600), 'evx-fs-full.jpg'); // 16:9
  await save(shot(fsSide, [210, 0, 2667, 2000], 1600), 'evx-fs-wide.jpg'); // 4:3
  await save(shot(fsSide, [580, 785, 1000, 760], 1000), 'evx-fs-monogram.jpg'); // embossed monogram
  await save(shot(await read('fs-front'), [0, 500, 2000, 2500], 1200), 'evx-fs-card.jpg'); // toe-forward, 4:5
  await save(full(await read('fs-top'), 1000), 'evx-fs-laces.jpg'); // top-down laces and tongue, 2:3
  await save(full(await read('fs-heel'), 1600), 'evx-fs-heel.jpg'); // NEVER GIVE UP heel

  // COMEBACK: both models, the card and the box
  await save(full(await read('pair-card'), 1600), 'evx-comeback-pair.jpg'); // both shoes with the COMEBACK card
  await save(full(await read('card-comeback'), 1600), 'evx-comeback-card.jpg'); // COMEBACK Series-01 card
  await save(full(await read('box-front'), 1600), 'evx-box.jpg'); // box on satin, front-lit
  await save(full(await read('box-angle'), 1600), 'evx-box-angle.jpg'); // box at an angle, low light
  await save(full(await read('box-streak'), 1600), 'evx-box-streak.jpg'); // box lid in a streak of light
})().catch((e) => { console.error(e); process.exit(1); });
