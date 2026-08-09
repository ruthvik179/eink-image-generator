const test = require('node:test');
const assert = require('node:assert/strict');
const ImageProcessing = require('../web/image-processing.js');

const EXPECTED_PRESETS = [
  ['nook-glowlight-4e', 'Barnes & Noble', 'GlowLight 4e', ['Nook GlowLight 4e'], 758, 1024, 'https://help.barnesandnoble.com/hc/en-us/articles/5587789324059-NOOK-GlowLight-4-4e-Getting-Started'],
  ['nook-glowlight-4', 'Barnes & Noble', 'GlowLight 4', ['Nook GlowLight 4'], 1080, 1440, 'https://www.barnesandnobleinc.com/press-release/barnes-noble-introduces-nook-glowlight-4/'],
  ['nook-glowlight-4-plus', 'Barnes & Noble', 'GlowLight 4 Plus', ['Nook GlowLight 4 Plus'], 1404, 1872, 'https://help.barnesandnoble.com/hc/en-us/sections/4782610159899-B-N-NOOK-eReaders-glowlight-4-plus'],
  ['kindle-basic-10th', 'Kindle', 'Basic 10th', ['Kindle Basic 10th'], 600, 800, 'https://www.amazon.com/Kindle-10th-Generation/dp/B07FZ8S74R'],
  ['kindle-basic-11th', 'Kindle', 'Basic 11th', ['Kindle Basic 11th'], 1072, 1448, 'https://www.amazon.com/Kindle-11th-Generation/dp/B09SWW1X1S'],
  ['kindle-paperwhite-10th', 'Kindle', 'Paperwhite 10th', ['Kindle Paperwhite 10th'], 1072, 1448, 'https://www.amazon.com/Kindle-Paperwhite-10th-Generation/dp/B07PS737QQ'],
  ['kindle-paperwhite-11th', 'Kindle', 'Paperwhite 11th', ['Kindle Paperwhite 11th', 'Kindle Paperwhite Signature Edition 11th'], 1236, 1648, 'https://www.amazon.com/Kindle-Paperwhite-11th-Generation/dp/B08KTZ8249'],
  ['kindle-paperwhite-12th', 'Kindle', 'Paperwhite 12th', ['Kindle Paperwhite 12th', 'Paperwhite Signature Edition', 'Kindle Paperwhite Signature Edition', 'Kindle Paperwhite Signature Edition 12th'], 1264, 1680, 'https://www.amazon.com/Kindle-Paperwhite-12th-Generation/dp/B0CFPJYX7P'],
  ['kindle-colorsoft', 'Kindle', 'Colorsoft', ['Kindle Colorsoft', 'Kindle Colorsoft Signature Edition'], 1264, 1680, 'https://www.amazon.com/All-New-Amazon-Kindle-Colorsoft-Signature-Edition/dp/B0CN3XR57P'],
  ['kindle-oasis-9th', 'Kindle', 'Oasis 9th', ['Kindle Oasis 9th'], 1264, 1680, 'https://www.amazon.com/Kindle-Oasis-9th-Generation/dp/B06XD5YCKX'],
  ['kindle-oasis-10th', 'Kindle', 'Oasis 10th', ['Kindle Oasis 10th'], 1264, 1680, 'https://www.amazon.com/Kindle-Oasis-10th-Generation/dp/B07L5GDTYY'],
  ['kindle-scribe', 'Kindle', 'Scribe', ['Kindle Scribe'], 1860, 2480, 'https://www.amazon.com/Kindle-Scribe/dp/B09BS26B8B'],
  ['kobo-nia', 'Kobo', 'Nia', ['Kobo Nia'], 758, 1024, 'https://www.kobo.com/en-us/products/kobo-nia'],
  ['kobo-clara-family', 'Kobo', 'Clara family', ['Kobo Clara', 'Kobo Clara HD', 'Kobo Clara 2E', 'Kobo Clara BW', 'Kobo Clara Colour'], 1072, 1448, 'https://www.kobo.com/en-us/products/kobo-clara'],
  ['kobo-libra-family', 'Kobo', 'Libra family', ['Kobo Libra', 'Kobo Libra H2O', 'Kobo Libra 2', 'Kobo Libra Colour'], 1264, 1680, 'https://www.kobo.com/en-us/products/kobo-libra'],
  ['kobo-sage', 'Kobo', 'Sage', ['Kobo Sage'], 1440, 1920, 'https://www.kobo.com/en-us/products/kobo-sage'],
  ['kobo-elipsa-family', 'Kobo', 'Elipsa family', ['Kobo Elipsa', 'Kobo Elipsa 2E'], 1404, 1872, 'https://www.kobo.com/en-us/products/kobo-elipsa'],
  ['boox-poke4-lite', 'BOOX', 'Poke4 Lite', ['BOOX Poke4 Lite', 'BOOX Poke 4 Lite'], 758, 1024, 'https://shop.boox.com/products/poke4lite'],
  ['boox-poke-go-6-family', 'BOOX', 'Poke 3 / Poke 5', ['BOOX Poke', 'BOOX Poke3', 'BOOX Poke 3', 'BOOX Poke5', 'BOOX Poke 5'], 1072, 1448, 'https://shop.boox.com/products/poke5'],
  ['boox-go-6', 'BOOX', 'Go 6', ['BOOX Go6', 'BOOX Go 6'], 1072, 1448, 'https://shop.boox.com/products/go6'],
  ['boox-go-6-gen-2', 'BOOX', 'Go 6 (Gen II)', ['BOOX Go 6 Gen II', 'BOOX Go 6 (Gen II)'], 1072, 1448, 'https://shop.boox.com/products/go6gen2'],
  ['boox-palma-family', 'BOOX', 'Palma', ['BOOX Palma'], 824, 1648, 'https://shop.boox.com/products/palma'],
  ['boox-palma-2', 'BOOX', 'Palma 2', ['BOOX Palma 2'], 824, 1648, 'https://shop.boox.com/products/palma2'],
  ['boox-palma-2-pro', 'BOOX', 'Palma 2 Pro', ['BOOX Palma 2 Pro'], 824, 1648, 'https://shop.boox.com/products/palma2pro'],
  ['boox-page-go-7-family', 'BOOX', 'Page', ['BOOX Page'], 1264, 1680, 'https://shop.boox.com/products/page'],
  ['boox-go-7', 'BOOX', 'Go 7', ['BOOX Go 7'], 1264, 1680, 'https://shop.boox.com/products/go7'],
  ['boox-go-color-7', 'BOOX', 'Go Color 7', ['BOOX Go Color 7', 'BOOX Go Color 7 Gen II'], 1264, 1680, 'https://shop.boox.com/products/gocolor7'],
  ['boox-note-air-family', 'BOOX', 'Note Air / Air2', ['BOOX Note Air', 'BOOX Note Air2', 'BOOX Note Air 2', 'BOOX Note Air2 Plus', 'BOOX Note Air 2 Plus'], 1404, 1872, 'https://shop.boox.com/products/noteair2'],
  ['boox-note-air3', 'BOOX', 'Note Air3', ['BOOX Note Air3', 'BOOX Note Air 3'], 1404, 1872, 'https://shop.boox.com/products/noteair3'],
  ['boox-note-air3-c', 'BOOX', 'Note Air3 C', ['BOOX Note Air3 C', 'BOOX Note Air 3 C'], 1860, 2480, 'https://shop.boox.com/products/noteair3'],
  ['boox-note-air4-c', 'BOOX', 'Note Air4 C', ['BOOX Note Air4 C', 'BOOX Note Air 4 C'], 1860, 2480, 'https://shop.boox.com/products/noteair4c'],
  ['boox-note-air5-c', 'BOOX', 'Note Air5 C', ['BOOX Note Air5 C', 'BOOX Note Air 5 C'], 1860, 2480, 'https://shop.boox.com/products/noteair5c'],
  ['boox-go-10-3', 'BOOX', 'Go 10.3', ['BOOX Go 10.3'], 1860, 2480, 'https://shop.boox.com/products/go103'],
  ['boox-go-10-3-gen-2', 'BOOX', 'Go 10.3 (Gen II)', ['BOOX Go 10.3 Gen II', 'BOOX Go 10.3 (Gen II)', 'BOOX Go 10.3 (Gen II) Lumi'], 1860, 2480, 'https://shop.boox.com/products/go103gen2'],
  ['boox-tab-ultra', 'BOOX', 'Tab Ultra', ['BOOX Tab Ultra'], 1404, 1872, 'https://shop.boox.com/products/tab'],
  ['boox-tab-mini-c', 'BOOX', 'Tab Mini C', ['BOOX Tab Mini C'], 1404, 1872, 'https://shop.boox.com/products/tabminic'],
  ['boox-tab-ultra-c', 'BOOX', 'Tab Ultra C', ['BOOX Tab Ultra C'], 1860, 2480, 'https://shop.boox.com/products/tabultrac'],
  ['boox-tab-ultra-c-pro', 'BOOX', 'Tab Ultra C Pro', ['BOOX Tab Ultra C Pro'], 1860, 2480, 'https://shop.boox.com/products/tabultracpro'],
  ['boox-tab-x-max-family', 'BOOX', 'Tab X', ['BOOX Tab X'], 1650, 2200, 'https://shop.boox.com/products/tabx'],
  ['boox-tab-x-c', 'BOOX', 'Tab X C', ['BOOX Tab X C'], 2400, 3200, 'https://shop.boox.com/products/tabxc'],
  ['boox-max', 'BOOX', 'Max', ['BOOX Max'], 1200, 1600, 'https://onyxboox.com/boox_max'],
  ['boox-max-lumi-family', 'BOOX', 'Max Lumi family', ['BOOX Max Lumi', 'BOOX Max Lumi2', 'BOOX Max Lumi 2'], 1650, 2200, 'https://shop.boox.com/products/maxlumi2'],
  ['boox-note-max', 'BOOX', 'Note Max', ['BOOX Note Max'], 2400, 3200, 'https://shop.boox.com/products/notemax']
];

function assertCropClose(actual, expected) {
  for (const key of ['x', 'y', 'width', 'height']) assert.ok(Math.abs(actual[key] - expected[key]) < 1e-12, key);
}

test('exports the public image processing contract', () => {
  for (const name of ['PRESETS', 'getBrands', 'getPresetsForBrand', 'findPreset']) {
    assert.ok(name in ImageProcessing, `${name} export is missing`);
  }
  assert.equal('findPresetBySearchName' in ImageProcessing, false);
});

test('preset IDs are unique and dimensions are positive integers', () => {
  const ids = ImageProcessing.PRESETS.map((preset) => preset.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const preset of ImageProcessing.PRESETS) {
    assert.ok(Number.isInteger(preset.width) && preset.width > 0);
    assert.ok(Number.isInteger(preset.height) && preset.height > 0);
  }
});

test('catalog exactly matches the offline manufacturer-sourced preset contract', () => {
  const actual = ImageProcessing.PRESETS.map(({ id, brand, label, searchNames, width, height, source }) => [id, brand, label, [...searchNames], width, height, source]);
  assert.deepEqual(actual, EXPECTED_PRESETS);
});

test('getPresetsForBrand filters every known brand and rejects unknown brands', () => {
  const expectedIds = {
    'Barnes & Noble': EXPECTED_PRESETS.filter((row) => row[1] === 'Barnes & Noble').map((row) => row[0]),
    Kindle: EXPECTED_PRESETS.filter((row) => row[1] === 'Kindle').map((row) => row[0]),
    Kobo: EXPECTED_PRESETS.filter((row) => row[1] === 'Kobo').map((row) => row[0]),
    BOOX: EXPECTED_PRESETS.filter((row) => row[1] === 'BOOX').map((row) => row[0])
  };

  assert.deepEqual(ImageProcessing.getBrands(), Object.keys(expectedIds));
  for (const [brand, ids] of Object.entries(expectedIds)) {
    assert.deepEqual(ImageProcessing.getPresetsForBrand(brand).map((preset) => preset.id), ids, brand);
  }
  assert.deepEqual(ImageProcessing.getPresetsForBrand('Unknown'), []);
  assert.deepEqual(ImageProcessing.getPresetsForBrand(''), []);
});

test('split Kindle models have independent records and direct provenance', () => {
  const expected = {
    'kindle-paperwhite-12th': ['Paperwhite 12th', '/kindle-paperwhite-12th-generation/dp/b0cfpjyx7p'],
    'kindle-colorsoft': ['Colorsoft', '/all-new-amazon-kindle-colorsoft-signature-edition/dp/b0cn3xr57p'],
    'kindle-oasis-9th': ['Oasis 9th', '/kindle-oasis-9th-generation/dp/b06xd5yckx'],
    'kindle-oasis-10th': ['Oasis 10th', '/kindle-oasis-10th-generation/dp/b07l5gdtyy']
  };

  for (const [id, [label, sourcePath]] of Object.entries(expected)) {
    const preset = ImageProcessing.findPreset(id);
    assert.ok(preset, `${id} is missing`);
    assert.equal(preset.label, label);
    assert.equal(preset.width, 1264);
    assert.equal(preset.height, 1680);
    assert.equal(new URL(preset.source).pathname.toLowerCase(), sourcePath);
  }

  assert.equal(ImageProcessing.findPreset('kindle-paperwhite-12th-colorsoft-oasis'), null);
});

test('Basic 11th uses a Basic-only stable ID', () => {
  const preset = ImageProcessing.findPreset('kindle-basic-11th');
  assert.ok(preset);
  assert.equal(preset.label, 'Basic 11th');
  assert.deepEqual(preset.searchNames, ['Kindle Basic 11th']);
  assert.equal(ImageProcessing.findPreset('kindle-basic-11th-paperwhite-10th'), null);
});

test('findPreset resolves Nook GlowLight 4 dimensions', () => {
  const preset = ImageProcessing.findPreset('nook-glowlight-4');
  assert.equal(preset.width, 1080);
  assert.equal(preset.height, 1440);
  assert.equal(preset.brand, 'Barnes & Noble');
});

test('exports validation and filename functions', () => {
  for (const name of ['validateDimensions', 'validateImageFile', 'buildFilename']) assert.equal(typeof ImageProcessing[name], 'function');
});

test('accepts dimensions represented by numeric strings', () => {
  assert.deepEqual(ImageProcessing.validateDimensions('1080', '1440'), { valid: true, width: 1080, height: 1440 });
});

test('rejects malformed dimensions with actionable messages', () => {
  for (const value of ['10.5', '0', '-1', '', 'abc', '10001']) {
    const result = ImageProcessing.validateDimensions(value, '100');
    assert.equal(result.valid, false, `expected rejection for ${value}`);
    assert.match(result.message, /width|dimension|integer|between/i);
  }
});

test('accepts supported image MIME types and extension fallback', () => {
  for (const file of [{ name: 'cover.jpg', type: 'image/jpeg', size: 1 }, { name: 'cover.png', type: 'image/png', size: 1 }, { name: 'cover.webp', type: 'image/webp', size: 1 }, { name: 'cover.JPG', type: '', size: 1 }]) {
    assert.deepEqual(ImageProcessing.validateImageFile(file), { valid: true });
  }
});

test('rejects unsupported and empty image-like values', () => {
  for (const file of [null, {}, { name: 'cover.gif', type: 'image/gif', size: 1 }, { name: '', type: 'image/png', size: 1 }, { name: 'cover.png', type: 'image/png', size: 0 }]) {
    assert.equal(ImageProcessing.validateImageFile(file).valid, false);
  }
});

test('normalizes filename segments', () => {
  assert.equal(ImageProcessing.buildFilename('My Cover.JPEG', 'NOOK GlowLight 4', 1080, 1440), 'my-cover-nook-glowlight-4-1080x1440.png');
  assert.equal(ImageProcessing.buildFilename('cover.jpeg', 'BOOX Go 10.3', 1860, 2480), 'cover-boox-go-10-3-1860x2480.png');
});

test('resetCrop centers the largest target-ratio crop on a landscape source', () => {
  const crop = ImageProcessing.resetCrop(4000, 2000, 1000, 2000);

  assert.deepEqual(crop, { x: 0.375, y: 0, width: 0.25, height: 1 });
  assert.ok(crop.x >= 0 && crop.y >= 0 && crop.x + crop.width <= 1 && crop.y + crop.height <= 1);
  assert.ok(Math.abs(((crop.width * 4000) / (crop.height * 2000)) - 0.5) < 1e-9);
});

test('resetCrop centers the largest target-ratio crop on a portrait source', () => {
  const crop = ImageProcessing.resetCrop(2000, 4000, 1200, 800);

  assert.equal(crop.x, 0);
  assert.equal(crop.width, 1);
  assert.ok(Math.abs(crop.y - 1 / 3) < 1e-12);
  assert.ok(Math.abs(crop.height - 1 / 3) < 1e-12);
  assert.ok(crop.x >= 0 && crop.y >= 0 && crop.x + crop.width <= 1 && crop.y + crop.height <= 1);
  assert.ok(Math.abs(((crop.width * 2000) / (crop.height * 4000)) - 1.5) < 1e-9);
});

test('cropToSource retains all four source-image edges', () => {
  assert.deepEqual(ImageProcessing.cropToSource({ x: 0, y: 0, width: 1, height: 1 }, 1000, 800), { sx: 0, sy: 0, sw: 1000, sh: 800 });
});

test('cropToSource maps normalized coordinates independently of display scale', () => {
  const source = ImageProcessing.cropToSource({ x: 0.101, y: 0.201, width: 0.5, height: 0.25 }, 1000, 800);

  assert.deepEqual(source, { sx: 101, sy: 160, sw: 500, sh: 201 });
});

test('changeCropAspect preserves the crop center while maximizing selected area', () => {
  const crop = ImageProcessing.changeCropAspect({ x: 0.3, y: 0.3, width: 0.4, height: 0.4 }, 2);

  assert.deepEqual(crop, { x: 0, y: 0.25, width: 1, height: 0.5 });
});

test('changeCropAspect expands globally near an edge before clamping position', () => {
  const crop = ImageProcessing.changeCropAspect({ x: 0, y: 0.25, width: 0.2, height: 0.5 }, 2);

  assert.deepEqual(crop, { x: 0, y: 0.25, width: 1, height: 0.5 });
});

test('memory estimates include both source normalization copies and retained source bytes', () => {
  assert.equal(ImageProcessing.estimateSourceNormalizationBytes(8192, 8192, 1000, 500), 538870912);
  assert.equal(ImageProcessing.estimateRenderWorkingBytes(4000, 3000, 3200, 2400), 355200000);
  assert.throws(() => ImageProcessing.estimateSourceNormalizationBytes(0, 1), RangeError);
  assert.throws(() => ImageProcessing.estimateRenderWorkingBytes(1, 1, 1.5, 1), RangeError);
});

test('moveCrop moves without mutating its input and clamps every image boundary', () => {
  const crop = { x: 0.2, y: 0.2, width: 0.4, height: 0.4 };

  assertCropClose(ImageProcessing.moveCrop(crop, 0.1, -0.1), { x: 0.3, y: 0.1, width: 0.4, height: 0.4 });
  assertCropClose(ImageProcessing.moveCrop(crop, -1, 0), { x: 0, y: 0.2, width: 0.4, height: 0.4 });
  assertCropClose(ImageProcessing.moveCrop(crop, 1, 0), { x: 0.6, y: 0.2, width: 0.4, height: 0.4 });
  assertCropClose(ImageProcessing.moveCrop(crop, 0, -1), { x: 0.2, y: 0, width: 0.4, height: 0.4 });
  assertCropClose(ImageProcessing.moveCrop(crop, 0, 1), { x: 0.2, y: 0.6, width: 0.4, height: 0.4 });
  assert.deepEqual(crop, { x: 0.2, y: 0.2, width: 0.4, height: 0.4 });
});

test('resizeCrop preserves the source-aware aspect for all eight handles', () => {
  const crop = { x: 0.25, y: 0.25, width: 0.5, height: 0.25 };
  const cases = [
    ['n', 0, -0.05, { x: 0.2, y: 0.2, width: 0.6, height: 0.3 }],
    ['ne', 0.1, 0, { x: 0.25, y: 0.2, width: 0.6, height: 0.3 }],
    ['e', 0.1, 0, { x: 0.25, y: 0.225, width: 0.6, height: 0.3 }],
    ['se', 0.1, 0, { x: 0.25, y: 0.25, width: 0.6, height: 0.3 }],
    ['s', 0, 0.05, { x: 0.2, y: 0.25, width: 0.6, height: 0.3 }],
    ['sw', -0.1, 0, { x: 0.15, y: 0.25, width: 0.6, height: 0.3 }],
    ['w', -0.1, 0, { x: 0.15, y: 0.225, width: 0.6, height: 0.3 }],
    ['nw', -0.1, 0, { x: 0.15, y: 0.2, width: 0.6, height: 0.3 }]
  ];

  for (const [handle, dx, dy, expected] of cases) {
    const result = ImageProcessing.resizeCrop(crop, handle, dx, dy, 2);
    for (const key of ['x', 'y', 'width', 'height']) assert.ok(Math.abs(result[key] - expected[key]) < 1e-12, `${handle} ${key}`);
    assert.ok(Math.abs(result.width / result.height - 2) < 1e-12, `${handle} aspect`);
  }
  assert.deepEqual(crop, { x: 0.25, y: 0.25, width: 0.5, height: 0.25 });
});

test('resizeCrop clamps drags beyond every image boundary', () => {
  const crop = { x: 0.25, y: 0.25, width: 0.5, height: 0.25 };
  const cases = [
    ['n', 0, -1, { x: 0, y: 0, width: 1, height: 0.5 }],
    ['e', 1, 0, { x: 0.25, y: 0.1875, width: 0.75, height: 0.375 }],
    ['s', 0, 1, { x: 0, y: 0.25, width: 1, height: 0.5 }],
    ['w', -1, 0, { x: 0, y: 0.1875, width: 0.75, height: 0.375 }]
  ];

  for (const [handle, dx, dy, expected] of cases) {
    const result = ImageProcessing.resizeCrop(crop, handle, dx, dy, 2);
    for (const key of ['x', 'y', 'width', 'height']) assert.ok(Math.abs(result[key] - expected[key]) < 1e-12, `${handle} ${key}`);
    assert.ok(result.x >= 0 && result.y >= 0 && result.x + result.width <= 1 && result.y + result.height <= 1, `${handle} bounds`);
  }
});

test('resizeCrop enforces the minimum crop size', () => {
  const result = ImageProcessing.resizeCrop({ x: 0.4, y: 0.4, width: 0.02, height: 0.02 }, 'e', -1, 0, 1);

  assert.deepEqual(result, { x: 0.4, y: 0.405, width: 0.01, height: 0.01 });
});

test('crop geometry rejects invalid dimensions, aspect ratios, and handles', () => {
  const crop = { x: 0.2, y: 0.2, width: 0.4, height: 0.4 };

  assert.throws(() => ImageProcessing.resetCrop(0, 1000, 600, 800), RangeError);
  assert.throws(() => ImageProcessing.cropToSource(crop, Infinity, 1000), RangeError);
  assert.throws(() => ImageProcessing.changeCropAspect(crop, 0), RangeError);
  assert.throws(() => ImageProcessing.resizeCrop(crop, 'e', 0.1, 0, 0), RangeError);
  assert.throws(() => ImageProcessing.resizeCrop(crop, 'diagonal', 0.1, 0, 1), RangeError);
});

test('transparent pixels flatten against the white matte without mutating the source', () => {
  const source = new Uint8ClampedArray([
    255, 0, 0, 0,
    0, 0, 0, 128,
    20, 40, 60, 255
  ]);

  const result = ImageProcessing.flattenTransparency(source);

  assert.deepEqual([...result], [255, 255, 255, 255, 127, 127, 127, 255, 20, 40, 60, 255]);
  assert.deepEqual([...source], [255, 0, 0, 0, 0, 0, 0, 128, 20, 40, 60, 255]);
  assert.notEqual(result, source);
});

test('grayscale uses rounded perceptual sRGB luminance and returns opaque pixels', () => {
  const source = new Uint8ClampedArray([
    255, 0, 0, 12,
    0, 255, 0, 34,
    0, 0, 255, 56
  ]);

  const result = ImageProcessing.toPerceptualGrayscale(source);

  assert.deepEqual([...result], [54, 54, 54, 255, 182, 182, 182, 255, 18, 18, 18, 255]);
  assert.deepEqual([...source], [255, 0, 0, 12, 0, 255, 0, 34, 0, 0, 255, 56]);
});

test('brightness clamps channels at both limits', () => {
  const source = new Uint8ClampedArray([0, 128, 255, 20]);

  assert.deepEqual([...ImageProcessing.adjustBrightnessContrast(source, 100, 0)], [255, 255, 255, 255]);
  assert.deepEqual([...ImageProcessing.adjustBrightnessContrast(source, -100, 0)], [0, 0, 0, 255]);
  assert.deepEqual([...source], [0, 128, 255, 20]);
});

test('contrast maps the full control range around middle gray', () => {
  const source = new Uint8ClampedArray([127, 128, 129, 8]);

  const result = ImageProcessing.adjustBrightnessContrast(source, 0, 100);

  assert.deepEqual([...result], [0, 128, 255, 255]);
  assert.deepEqual([...source], [127, 128, 129, 8]);
});

test('sharpening preserves a flat 3 by 3 region exactly', () => {
  const source = new Uint8ClampedArray(Array.from({ length: 9 }, () => [100, 100, 100, 255]).flat());

  const result = ImageProcessing.unsharpMask(source, 3, 3, 100);

  assert.deepEqual([...result], [...source]);
  assert.notEqual(result, source);
});

test('sharpening increases contrast across a synthetic vertical edge', () => {
  const source = new Uint8ClampedArray([
    64, 64, 64, 17, 128, 128, 128, 18, 192, 192, 192, 19,
    64, 64, 64, 20, 128, 128, 128, 21, 192, 192, 192, 22,
    64, 64, 64, 23, 128, 128, 128, 24, 192, 192, 192, 25
  ]);

  const result = ImageProcessing.unsharpMask(source, 3, 3, 100);

  assert.equal(result.length, source.length);
  assert.deepEqual([result[3], result[7], result[11], result[15], result[19], result[23], result[27], result[31], result[35]], Array(9).fill(255));
  assert.ok(result[8] - result[0] > source[8] - source[0]);
  assert.deepEqual([...source], [
    64, 64, 64, 17, 128, 128, 128, 18, 192, 192, 192, 19,
    64, 64, 64, 20, 128, 128, 128, 21, 192, 192, 192, 22,
    64, 64, 64, 23, 128, 128, 128, 24, 192, 192, 192, 25
  ]);
});

test('sharpening with zero amount is an opaque identity', () => {
  const source = new Uint8ClampedArray([12, 34, 56, 255, 78, 90, 123, 255]);

  assert.deepEqual([...ImageProcessing.unsharpMask(source, 2, 1, 0)], [...source]);
});

test('dither is deterministic, binary, opaque, and matches the checked fixture', () => {
  const source = new Uint8ClampedArray([
    0, 0, 0, 1, 128, 128, 128, 2, 255, 255, 255, 3,
    64, 64, 64, 4, 192, 192, 192, 5, 128, 128, 128, 6
  ]);

  const first = ImageProcessing.floydSteinbergDither(source, 3, 2);
  const second = ImageProcessing.floydSteinbergDither(source, 3, 2);

  assert.deepEqual([...first], [0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255]);
  assert.deepEqual([...second], [...first]);
  for (let index = 0; index < first.length; index += 4) {
    assert.ok(first[index] === 0 || first[index] === 255);
    assert.equal(first[index], first[index + 1]);
    assert.equal(first[index], first[index + 2]);
    assert.equal(first[index + 3], 255);
  }
  assert.deepEqual([...source], [
    0, 0, 0, 1, 128, 128, 128, 2, 255, 255, 255, 3,
    64, 64, 64, 4, 192, 192, 192, 5, 128, 128, 128, 6
  ]);
});

test('pipeline applies the selected color, grayscale, or dither mode without source mutation', () => {
  const source = new Uint8ClampedArray([255, 0, 0, 255]);
  const baseSettings = { brightness: 0, contrast: 0, sharpness: 0 };

  const color = ImageProcessing.processPixels(source, 1, 1, { ...baseSettings, mode: 'color' });
  const grayscale = ImageProcessing.processPixels(source, 1, 1, { ...baseSettings, mode: 'grayscale' });
  const dither = ImageProcessing.processPixels(source, 1, 1, { ...baseSettings, mode: 'dither' });

  assert.deepEqual([...color], [255, 0, 0, 255]);
  assert.deepEqual([...grayscale], [54, 54, 54, 255]);
  assert.deepEqual([...dither], [0, 0, 0, 255]);
  assert.equal(color.length, source.length);
  assert.deepEqual([...source], [255, 0, 0, 255]);
});

test('pipeline flattens transparent color before later grayscale processing', () => {
  const source = new Uint8ClampedArray([255, 0, 0, 0]);

  const result = ImageProcessing.processPixels(source, 1, 1, { mode: 'grayscale', brightness: 0, contrast: 0, sharpness: 0 });

  assert.deepEqual([...result], [255, 255, 255, 255]);
  assert.deepEqual([...source], [255, 0, 0, 0]);
});

test('pipeline rejects invalid and absent modes instead of silently selecting color', () => {
  const source = new Uint8ClampedArray([12, 34, 56, 255]);

  assert.throws(() => ImageProcessing.processPixels(source, 1, 1, { mode: 'sepia', brightness: 0, contrast: 0, sharpness: 0 }), RangeError);
  assert.throws(() => ImageProcessing.processPixels(source, 1, 1, { brightness: 0, contrast: 0, sharpness: 0 }), RangeError);
  assert.throws(() => ImageProcessing.processPixels(source, 1, 1), RangeError);
});

test('dimensioned pixel functions reject zero, fractional, and non-finite dimensions', () => {
  const source = new Uint8ClampedArray([12, 34, 56, 255]);
  const calls = [
    (width, height) => ImageProcessing.unsharpMask(source, width, height, 0),
    (width, height) => ImageProcessing.floydSteinbergDither(source, width, height),
    (width, height) => ImageProcessing.processPixels(source, width, height, { mode: 'color', brightness: 0, contrast: 0, sharpness: 0 })
  ];

  for (const call of calls) {
    for (const [width, height] of [[0, 1], [1.5, 1], [1, NaN], [1, Infinity]]) {
      assert.throws(() => call(width, height), RangeError);
    }
  }
});

test('dimensioned pixel functions reject RGBA buffers that do not match their dimensions', () => {
  const calls = [
    (rgba) => ImageProcessing.unsharpMask(rgba, 1, 1, 0),
    (rgba) => ImageProcessing.floydSteinbergDither(rgba, 1, 1),
    (rgba) => ImageProcessing.processPixels(rgba, 1, 1, { mode: 'color', brightness: 0, contrast: 0, sharpness: 0 })
  ];

  for (const call of calls) {
    assert.throws(() => call(new Uint8ClampedArray([12, 34, 56])), RangeError);
    assert.throws(() => call(new Uint8ClampedArray([12, 34, 56, 255, 78])), RangeError);
  }
});
