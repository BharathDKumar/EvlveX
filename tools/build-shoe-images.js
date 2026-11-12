// Build EvlveX imagery from the brand's own shoe photos (black = The Silent Grind, cream = A Fresh Start).
// Grades each chapter (Silent Grind: dark, Fresh Start: light sand), vignettes the cluttered backgrounds into the
// brand palette, and cuts full, card (4:5), wide and detail crops. Usage: node build-shoes.js <imagesDir> <assetsDir> <nm>
const path = require('path');
const [, , imagesDir, assets, nm] = process.argv;
const Jimp = require(path.join(nm, 'jimp'));

const NOIR = [14, 14, 14];
const IVORY = [245, 240, 230];

// Desaturate, tone and vignette toward a brand colour.
function grade(img, { sat, bright, contrast, tint, edge, strength, inner }) {
  img.color([{ apply: 'desaturate', params: [sat] }]);
  if (bright) img.brightness(bright);
  if (contrast) img.contrast(contrast);
  const { width: w, height: h, data } = img.bitmap;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      // tint
      data[i] = Math.min(255, data[i] * tint[0]);
      data[i + 1] = Math.min(255, data[i + 1] * tint[1]);
      data[i + 2] = Math.min(255, data[i + 2] * tint[2]);
      // elliptical vignette
      const dx = (x - w / 2) / (w / 2), dy = (y - h / 2) / (h / 2);
      const d = Math.sqrt(dx * dx + dy * dy);
      const t = Math.min(1, Math.max(0, (d - inner) / (1.25 - inner))) * strength;
      const k = t * t * (3 - 2 * t);
      for (let c = 0; c < 3; c++) data[i + c] = Math.round(data[i + c] * (1 - k) + edge[c] * k);
    }
  }
  return img;
}

// Fresh Start: keep warm (sand / cream / caramel) tones, wash cool colours (blue wall, green floor) and
// dark background toward Ivory, then a soft Ivory vignette.
function gradeLight(img, inner = 0.5, topFade = 0) {
  const { width: w, height: h, data } = img.bitmap;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    let r = data[i], g = data[i + 1], b = data[i + 2];
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
    let hue = 0;
    if (d > 0) hue = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    hue = (hue * 60 + 360) % 360;
    const ss = (e0, e1, v) => { const t = Math.min(1, Math.max(0, (v - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
    // smooth weight for cool colours (greens, cyans, blues) so the mask has no hard edges
    const cool = ss(6, 34, d) * ss(60, 105, hue) * (1 - ss(265, 300, hue));
    const grey = (r + g + b) / 3;
    const sat = 0.55 * (1 - cool); // keep 55% saturation of warm tones
    r = grey + (r - grey) * sat; g = grey + (g - grey) * sat; b = grey + (b - grey) * sat;
    const lift = 0.7 * cool; r += (IVORY[0] - r) * lift; g += (IVORY[1] - g) * lift; b += (IVORY[2] - b) * lift;
    // warm, airy tone curve
    r = r * 1.03 + 10; g = g * 1.0 + 8; b = b * 0.94 + 6;
    const dx = (x - w / 2) / (w / 2), dy = (y - h / 2) / (h / 2);
    const t = Math.min(1, Math.max(0, (Math.sqrt(dx * dx + dy * dy) - inner) / (1.25 - inner)));
    let k = t * t * (3 - 2 * t);
    if (topFade) { const [full, end] = topFade; const f = y <= full ? 1 : Math.max(0, 1 - (y - full) / (end - full)); k = Math.max(k, 0.95 * f * f * (3 - 2 * f)); }
    data[i] = Math.min(255, Math.round(r * (1 - k) + IVORY[0] * k));
    data[i + 1] = Math.min(255, Math.round(g * (1 - k) + IVORY[1] * k));
    data[i + 2] = Math.min(255, Math.round(b * (1 - k) + IVORY[2] * k));
  }
  return img;
}

// Place a photo on a canvas of the brand colour, feathering the photo's edges into it.
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

const save = (img, name, q = 86) => img.quality(q).writeAsync(path.join(assets, name)).then(() => console.log('✔', name, img.bitmap.width + 'x' + img.bitmap.height));

(async () => {
  const sgRaw = await Jimp.read(path.join(imagesDir, '6.jpg')); // black — The Silent Grind (1024x768)
  const fsRaw = await Jimp.read(path.join(imagesDir, '5.jpg')); // cream — A Fresh Start (768x1024)

  const sgGrade = { sat: 70, bright: -0.08, contrast: 0.18, tint: [1, 1, 1.02], edge: NOIR, strength: 1, inner: 0.55 };
  const fsGrade = { sat: 75, bright: 0.06, contrast: -0.04, tint: [1.04, 1.0, 0.93], edge: IVORY, strength: 1, inner: 0.5 };

  // The Silent Grind
  const sgFull = grade(sgRaw.clone(), sgGrade);
  await save(sgFull.clone(), 'evx-sg-full.jpg');
  await save(onCanvas(sgFull, 1024, 1280, NOIR, 90), 'evx-sg-card.jpg');
  await save(grade(sgRaw.clone().crop(367, 158, 480, 480), { ...sgGrade, inner: 0.45 }), 'evx-sg-monogram.jpg');
  await save(grade(sgRaw.clone().crop(0, 300, 600, 375), { ...sgGrade, inner: 0.5 }), 'evx-sg-sole.jpg');

  // A Fresh Start
  const fsFull = gradeLight(fsRaw.clone(), 0.5, [195, 228]);
  await save(fsFull.clone(), 'evx-fs-full.jpg');
  await save(onCanvas(fsFull, 1366, 1024, IVORY, 140), 'evx-fs-wide.jpg');
  await save(gradeLight(fsRaw.clone().crop(0, 64, 768, 960), 0.5, [131, 164]), 'evx-fs-card.jpg');
  await save(gradeLight(fsRaw.clone().crop(220, 270, 400, 400), 0.45), 'evx-fs-monogram.jpg');
  await save(gradeLight(fsRaw.clone().crop(150, 330, 400, 500), 0.45), 'evx-fs-laces.jpg');

  // COMEBACK — both chapters side by side (dark | light)
  const pair = new Jimp(1600, 1000, Jimp.rgbaToInt(...NOIR, 255));
  pair.composite(onCanvas(sgFull, 800, 1000, NOIR, 80), 0, 0);
  pair.composite(onCanvas(fsFull, 800, 1000, IVORY, 80), 800, 0);
  await save(pair, 'evx-comeback-pair.jpg');
})().catch((e) => { console.error(e); process.exit(1); });
