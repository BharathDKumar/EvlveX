// Build EvlveX shoe imagery from the campaign photos in docs/brand/campaign/ (see docs/brand/shoe-images.md).
// Photos are used in true colour: this script only crops them (and, for the 4:5 cards and the wide hero, places a
// crop on a matching dark studio canvas). Crops leave out the "Thank you" cards' small print and the corner marks.
// Usage: node tools/build-shoe-images.js <campaignDir> <assetsDir> <node_modules dir that contains jimp>
const path = require('path');
const [, , srcDir, assets, nm] = process.argv;
const Jimp = require(path.join(nm, 'jimp'));

// Place a photo on a canvas of one colour, feathering the photo's edges into it.
function onCanvas(photo, W, H, color, feather) {
  const canvas = new Jimp(W, H, Jimp.rgbaToInt(...color, 255));
  const p = photo.clone().scaleToFit(W, H);
  const ox = Math.round((W - p.bitmap.width) / 2), oy = Math.round((H - p.bitmap.height) / 2);
  const pw = p.bitmap.width, ph = p.bitmap.height, pd = p.bitmap.data, cd = canvas.bitmap.data;
  for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) {
    const edgeDist = Math.min(x, y, pw - 1 - x, ph - 1 - y);
    const a = Math.min(1, edgeDist / feather);
    const s = (y * pw + x) * 4, t = ((y + oy) * W + (x + ox)) * 4;
    for (let c = 0; c < 3; c++) cd[t + c] = Math.round(pd[s + c] * a + color[c] * (1 - a));
  }
  return canvas;
}

// Average colour of a photo's top band (the studio backdrop; lower edges can hold props), so a canvas matches it.
function edgeColour(img, band = 24) {
  const { width: w, height: h, data } = img.bitmap;
  const sum = [0, 0, 0];
  let n = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (y >= band) continue;
    const i = (y * w + x) * 4;
    sum[0] += data[i]; sum[1] += data[i + 1]; sum[2] += data[i + 2]; n++;
  }
  return sum.map((v) => Math.round(v / n));
}

const crop = (img, x, y, w, h) => img.clone().crop(x, y, w, h);
const save = (img, name, q = 88) => img.quality(q).writeAsync(path.join(assets, name)).then(() => console.log('✔', name, img.bitmap.width + 'x' + img.bitmap.height));

(async () => {
  const read = (f) => Jimp.read(path.join(srcDir, f));
  const grindPair = await read('silent-grind-pair.jpg'); // two Silent Grind shoes, dark grey studio
  const freshStand = await read('fresh-start-stand.jpg'); // A Fresh Start on an acrylic stand
  const collage = await read('collage-unboxing.jpg'); // 7 panels (3 columns), unboxing scenes
  const triptych = await read('triptych-satin.jpg'); // 3 panels on grey satin

  // The Silent Grind
  const sgFull = crop(grindPair, 70, 105, 960, 720); // both floating shoes; leaves out the corner mark
  await save(sgFull.clone(), 'evx-sg-full.jpg');
  await save(onCanvas(sgFull, 1024, 1280, edgeColour(sgFull), 120), 'evx-sg-card.jpg');
  await save(crop(collage, 403, 450, 397, 445), 'evx-sg-monogram.jpg'); // close-up with feathers
  await save(crop(triptych, 802, 130, 392, 490), 'evx-sg-sole.jpg'); // in the navy box; card left out

  // A Fresh Start
  const fsFull = crop(freshStand, 150, 40, 950, 530); // shoe on the stand; card text and corner mark left out
  await save(fsFull.clone(), 'evx-fs-full.jpg');
  await save(onCanvas(fsFull, 1366, 1024, edgeColour(fsFull), 140), 'evx-fs-wide.jpg');
  await save(onCanvas(fsFull, 1024, 1280, edgeColour(fsFull), 120), 'evx-fs-card.jpg');
  await save(crop(collage, 805, 0, 389, 295), 'evx-fs-monogram.jpg'); // in the black box
  await save(crop(triptych, 0, 100, 397, 460), 'evx-fs-laces.jpg'); // in the cream box on feathers

  // COMEBACK: both shoes together
  await save(crop(collage, 0, 0, 399, 445), 'evx-comeback-pair.jpg'); // both pairs with their boxes
})().catch((e) => { console.error(e); process.exit(1); });
