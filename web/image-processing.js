(function (root, factory) {
  const api = factory();
  root.ImageProcessing = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  // Sources: official manufacturer product/support pages; grouped URLs identify the named model families.
  // BOOX dimensions use the full B/W pixel grid, normalized to portrait. Its live comparison data
  // (https://shop.boox.com/cdn/shop/t/128/assets/boox-product.json) corroborates grouped legacy models.
  const sources = {
    'nook-glowlight-4e': 'https://help.barnesandnoble.com/hc/en-us/articles/5587789324059-NOOK-GlowLight-4-4e-Getting-Started',
    'nook-glowlight-4': 'https://www.barnesandnobleinc.com/press-release/barnes-noble-introduces-nook-glowlight-4/',
    'nook-glowlight-4-plus': 'https://help.barnesandnoble.com/hc/en-us/sections/4782610159899-B-N-NOOK-eReaders-glowlight-4-plus',
    'kindle-basic-10th': 'https://www.amazon.com/Kindle-10th-Generation/dp/B07FZ8S74R',
    'kindle-basic-11th': 'https://www.amazon.com/Kindle-11th-Generation/dp/B09SWW1X1S',
    'kindle-paperwhite-10th': 'https://www.amazon.com/Kindle-Paperwhite-10th-Generation/dp/B07PS737QQ',
    'kindle-paperwhite-11th': 'https://www.amazon.com/Kindle-Paperwhite-11th-Generation/dp/B08KTZ8249',
    'kindle-paperwhite-12th': 'https://www.amazon.com/Kindle-Paperwhite-12th-Generation/dp/B0CFPJYX7P',
    'kindle-colorsoft': 'https://www.amazon.com/All-New-Amazon-Kindle-Colorsoft-Signature-Edition/dp/B0CN3XR57P',
    'kindle-oasis-9th': 'https://www.amazon.com/Kindle-Oasis-9th-Generation/dp/B06XD5YCKX',
    'kindle-oasis-10th': 'https://www.amazon.com/Kindle-Oasis-10th-Generation/dp/B07L5GDTYY',
    'kindle-scribe': 'https://www.amazon.com/Kindle-Scribe/dp/B09BS26B8B',
    'kobo-nia': 'https://www.kobo.com/en-us/products/kobo-nia',
    'kobo-clara-family': 'https://www.kobo.com/en-us/products/kobo-clara',
    'kobo-libra-family': 'https://www.kobo.com/en-us/products/kobo-libra',
    'kobo-sage': 'https://www.kobo.com/en-us/products/kobo-sage',
    'kobo-elipsa-family': 'https://www.kobo.com/en-us/products/kobo-elipsa',
    'boox-poke4-lite': 'https://shop.boox.com/products/poke4lite',
    'boox-poke-go-6-family': 'https://shop.boox.com/products/poke5',
    'boox-go-6': 'https://shop.boox.com/products/go6',
    'boox-go-6-gen-2': 'https://shop.boox.com/products/go6gen2',
    'boox-palma-family': 'https://shop.boox.com/products/palma',
    'boox-palma-2': 'https://shop.boox.com/products/palma2',
    'boox-palma-2-pro': 'https://shop.boox.com/products/palma2pro',
    'boox-page-go-7-family': 'https://shop.boox.com/products/page',
    'boox-go-7': 'https://shop.boox.com/products/go7',
    'boox-go-color-7': 'https://shop.boox.com/products/gocolor7',
    'boox-note-air-family': 'https://shop.boox.com/products/noteair2',
    'boox-note-air3': 'https://shop.boox.com/products/noteair3',
    'boox-note-air3-c': 'https://shop.boox.com/products/noteair3',
    'boox-note-air4-c': 'https://shop.boox.com/products/noteair4c',
    'boox-note-air5-c': 'https://shop.boox.com/products/noteair5c',
    'boox-go-10-3': 'https://shop.boox.com/products/go103',
    'boox-go-10-3-gen-2': 'https://shop.boox.com/products/go103gen2',
    'boox-tab-ultra': 'https://shop.boox.com/products/tab',
    'boox-tab-mini-c': 'https://shop.boox.com/products/tabminic',
    'boox-tab-ultra-c': 'https://shop.boox.com/products/tabultrac',
    'boox-tab-ultra-c-pro': 'https://shop.boox.com/products/tabultracpro',
    'boox-tab-x-max-family': 'https://shop.boox.com/products/tabx',
    'boox-tab-x-c': 'https://shop.boox.com/products/tabxc',
    'boox-max': 'https://onyxboox.com/boox_max',
    'boox-max-lumi-family': 'https://shop.boox.com/products/maxlumi2',
    'boox-note-max': 'https://shop.boox.com/products/notemax'
  };
  const rows = [
    ['nook-glowlight-4e', 'Barnes & Noble', 'GlowLight 4e', ['Nook GlowLight 4e'], 758, 1024],
    ['nook-glowlight-4', 'Barnes & Noble', 'GlowLight 4', ['Nook GlowLight 4'], 1080, 1440],
    ['nook-glowlight-4-plus', 'Barnes & Noble', 'GlowLight 4 Plus', ['Nook GlowLight 4 Plus'], 1404, 1872],
    ['kindle-basic-10th', 'Kindle', 'Basic 10th', ['Kindle Basic 10th'], 600, 800],
    ['kindle-basic-11th', 'Kindle', 'Basic 11th', ['Kindle Basic 11th'], 1072, 1448],
    ['kindle-paperwhite-10th', 'Kindle', 'Paperwhite 10th', ['Kindle Paperwhite 10th'], 1072, 1448],
    ['kindle-paperwhite-11th', 'Kindle', 'Paperwhite 11th', ['Kindle Paperwhite 11th', 'Kindle Paperwhite Signature Edition 11th'], 1236, 1648],
    ['kindle-paperwhite-12th', 'Kindle', 'Paperwhite 12th', ['Kindle Paperwhite 12th', 'Paperwhite Signature Edition', 'Kindle Paperwhite Signature Edition', 'Kindle Paperwhite Signature Edition 12th'], 1264, 1680],
    ['kindle-colorsoft', 'Kindle', 'Colorsoft', ['Kindle Colorsoft', 'Kindle Colorsoft Signature Edition'], 1264, 1680],
    ['kindle-oasis-9th', 'Kindle', 'Oasis 9th', ['Kindle Oasis 9th'], 1264, 1680],
    ['kindle-oasis-10th', 'Kindle', 'Oasis 10th', ['Kindle Oasis 10th'], 1264, 1680],
    ['kindle-scribe', 'Kindle', 'Scribe', ['Kindle Scribe'], 1860, 2480],
    ['kobo-nia', 'Kobo', 'Nia', ['Kobo Nia'], 758, 1024],
    ['kobo-clara-family', 'Kobo', 'Clara family', ['Kobo Clara', 'Kobo Clara HD', 'Kobo Clara 2E', 'Kobo Clara BW', 'Kobo Clara Colour'], 1072, 1448],
    ['kobo-libra-family', 'Kobo', 'Libra family', ['Kobo Libra', 'Kobo Libra H2O', 'Kobo Libra 2', 'Kobo Libra Colour'], 1264, 1680],
    ['kobo-sage', 'Kobo', 'Sage', ['Kobo Sage'], 1440, 1920],
    ['kobo-elipsa-family', 'Kobo', 'Elipsa family', ['Kobo Elipsa', 'Kobo Elipsa 2E'], 1404, 1872],
    ['boox-poke4-lite', 'BOOX', 'Poke4 Lite', ['BOOX Poke4 Lite', 'BOOX Poke 4 Lite'], 758, 1024],
    ['boox-poke-go-6-family', 'BOOX', 'Poke 3 / Poke 5', ['BOOX Poke', 'BOOX Poke3', 'BOOX Poke 3', 'BOOX Poke5', 'BOOX Poke 5'], 1072, 1448],
    ['boox-go-6', 'BOOX', 'Go 6', ['BOOX Go6', 'BOOX Go 6'], 1072, 1448],
    ['boox-go-6-gen-2', 'BOOX', 'Go 6 (Gen II)', ['BOOX Go 6 Gen II', 'BOOX Go 6 (Gen II)'], 1072, 1448],
    ['boox-palma-family', 'BOOX', 'Palma', ['BOOX Palma'], 824, 1648],
    ['boox-palma-2', 'BOOX', 'Palma 2', ['BOOX Palma 2'], 824, 1648],
    ['boox-palma-2-pro', 'BOOX', 'Palma 2 Pro', ['BOOX Palma 2 Pro'], 824, 1648],
    ['boox-page-go-7-family', 'BOOX', 'Page', ['BOOX Page'], 1264, 1680],
    ['boox-go-7', 'BOOX', 'Go 7', ['BOOX Go 7'], 1264, 1680],
    ['boox-go-color-7', 'BOOX', 'Go Color 7', ['BOOX Go Color 7', 'BOOX Go Color 7 Gen II'], 1264, 1680],
    ['boox-note-air-family', 'BOOX', 'Note Air / Air2', ['BOOX Note Air', 'BOOX Note Air2', 'BOOX Note Air 2', 'BOOX Note Air2 Plus', 'BOOX Note Air 2 Plus'], 1404, 1872],
    ['boox-note-air3', 'BOOX', 'Note Air3', ['BOOX Note Air3', 'BOOX Note Air 3'], 1404, 1872],
    ['boox-note-air3-c', 'BOOX', 'Note Air3 C', ['BOOX Note Air3 C', 'BOOX Note Air 3 C'], 1860, 2480],
    ['boox-note-air4-c', 'BOOX', 'Note Air4 C', ['BOOX Note Air4 C', 'BOOX Note Air 4 C'], 1860, 2480],
    ['boox-note-air5-c', 'BOOX', 'Note Air5 C', ['BOOX Note Air5 C', 'BOOX Note Air 5 C'], 1860, 2480],
    ['boox-go-10-3', 'BOOX', 'Go 10.3', ['BOOX Go 10.3'], 1860, 2480],
    ['boox-go-10-3-gen-2', 'BOOX', 'Go 10.3 (Gen II)', ['BOOX Go 10.3 Gen II', 'BOOX Go 10.3 (Gen II)', 'BOOX Go 10.3 (Gen II) Lumi'], 1860, 2480],
    ['boox-tab-ultra', 'BOOX', 'Tab Ultra', ['BOOX Tab Ultra'], 1404, 1872],
    ['boox-tab-mini-c', 'BOOX', 'Tab Mini C', ['BOOX Tab Mini C'], 1404, 1872],
    ['boox-tab-ultra-c', 'BOOX', 'Tab Ultra C', ['BOOX Tab Ultra C'], 1860, 2480],
    ['boox-tab-ultra-c-pro', 'BOOX', 'Tab Ultra C Pro', ['BOOX Tab Ultra C Pro'], 1860, 2480],
    ['boox-tab-x-max-family', 'BOOX', 'Tab X', ['BOOX Tab X'], 1650, 2200],
    ['boox-tab-x-c', 'BOOX', 'Tab X C', ['BOOX Tab X C'], 2400, 3200],
    ['boox-max', 'BOOX', 'Max', ['BOOX Max'], 1200, 1600],
    ['boox-max-lumi-family', 'BOOX', 'Max Lumi family', ['BOOX Max Lumi', 'BOOX Max Lumi2', 'BOOX Max Lumi 2'], 1650, 2200],
    ['boox-note-max', 'BOOX', 'Note Max', ['BOOX Note Max'], 2400, 3200]
  ];
  const PRESETS = Object.freeze(rows.map(([id, brand, label, searchNames, width, height]) => Object.freeze({ id, brand, label, searchNames: Object.freeze(searchNames), width, height, source: sources[id] })));
  function getBrands() { return [...new Set(PRESETS.map((preset) => preset.brand))]; }
  function getPresetsForBrand(brand) { return PRESETS.filter((preset) => preset.brand === brand); }
  function findPreset(id) { return PRESETS.find((preset) => preset.id === id) || null; }
  function parseDimension(value, name) {
    const text = typeof value === 'number' && Number.isInteger(value) ? String(value) : (typeof value === 'string' ? value : '');
    if (!/^\d+$/.test(text)) return { valid: false, message: `${name} must be a whole number between 1 and 10000` };
    const number = Number(text);
    if (number < 1 || number > 10000) return { valid: false, message: `${name} must be between 1 and 10000` };
    return { valid: true, value: number };
  }
  function validateDimensions(width, height) {
    const parsedWidth = parseDimension(width, 'width');
    if (!parsedWidth.valid) return parsedWidth;
    const parsedHeight = parseDimension(height, 'height');
    if (!parsedHeight.valid) return parsedHeight;
    return { valid: true, width: parsedWidth.value, height: parsedHeight.value };
  }
  function validateImageFile(file) {
    if (!file || typeof file !== 'object' || typeof file.name !== 'string' || !file.name.trim() || !(Number(file.size) > 0)) return { valid: false, message: 'Select a non-empty image file' };
    const type = typeof file.type === 'string' ? file.type.toLowerCase() : '';
    const supported = new Set(['image/jpeg', 'image/png', 'image/webp']);
    if (type) return supported.has(type) ? { valid: true } : { valid: false, message: 'Unsupported image type' };
    const extension = file.name.toLowerCase().match(/\.([a-z0-9]+)$/);
    return extension && ['jpg', 'jpeg', 'png', 'webp'].includes(extension[1]) ? { valid: true } : { valid: false, message: 'Unsupported image type' };
  }
  function normalizeSegment(value, fallback, stripExtension = false) {
    const source = stripExtension ? String(value || '').replace(/\.[^.]+$/, '') : String(value || '');
    const normalized = source.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return normalized || fallback;
  }
  function buildFilename(sourceName, deviceName, width, height) {
    return `${normalizeSegment(sourceName, 'image', true)}-${normalizeSegment(deviceName, 'device')}-${width}x${height}.png`;
  }

  function assertPixelDimensions(width, height, label) {
    if (!Number.isInteger(width) || width < 1 || !Number.isInteger(height) || height < 1) throw new RangeError(`${label} dimensions must be positive integers`);
  }
  function estimateSourceNormalizationBytes(width, height, retainedWidth = 0, retainedHeight = 0) {
    assertPixelDimensions(width, height, 'decoded source');
    if ((retainedWidth === 0) !== (retainedHeight === 0)) throw new RangeError('retained source dimensions must both be zero or positive integers');
    if (retainedWidth !== 0) assertPixelDimensions(retainedWidth, retainedHeight, 'retained source');
    return (width * height * 2 + retainedWidth * retainedHeight) * 4;
  }
  function estimateRenderWorkingBytes(sourceWidth, sourceHeight, outputWidth, outputHeight) {
    assertPixelDimensions(sourceWidth, sourceHeight, 'source');
    assertPixelDimensions(outputWidth, outputHeight, 'output');
    return sourceWidth * sourceHeight * 4 + outputWidth * outputHeight * 4 * 10;
  }

  const CROP_EPSILON = 1e-12;
  const MIN_CROP_SIZE = 0.01;
  function clamp(value, minimum, maximum) { return Math.min(maximum, Math.max(minimum, value)); }
  function assertPositiveFinite(value, name) {
    if (!(typeof value === 'number' && Number.isFinite(value) && value > 0)) throw new RangeError(`${name} must be a positive finite number`);
  }
  function assertFiniteNumber(value, name) {
    if (!(typeof value === 'number' && Number.isFinite(value))) throw new RangeError(`${name} must be a finite number`);
  }
  function assertCrop(crop) {
    if (!crop || typeof crop !== 'object') throw new RangeError('crop must be a normalized rectangle');
    for (const name of ['x', 'y', 'width', 'height']) assertFiniteNumber(crop[name], `crop.${name}`);
    if (crop.x < 0 || crop.y < 0 || crop.width <= 0 || crop.height <= 0 || crop.x + crop.width > 1 || crop.y + crop.height > 1) throw new RangeError('crop must be within normalized source bounds');
  }
  function cropAspect(sourceWidth, sourceHeight, targetWidth, targetHeight) {
    return (targetWidth * sourceHeight) / (targetHeight * sourceWidth);
  }
  function constrainCrop(crop) {
    const width = clamp(crop.width, CROP_EPSILON, 1);
    const height = clamp(crop.height, CROP_EPSILON, 1);
    return Object.freeze({
      x: clamp(crop.x, 0, 1 - width),
      y: clamp(crop.y, 0, 1 - height),
      width,
      height
    });
  }
  function resetCrop(sourceWidth, sourceHeight, targetWidth, targetHeight) {
    assertPositiveFinite(sourceWidth, 'sourceWidth');
    assertPositiveFinite(sourceHeight, 'sourceHeight');
    assertPositiveFinite(targetWidth, 'targetWidth');
    assertPositiveFinite(targetHeight, 'targetHeight');
    const aspect = cropAspect(sourceWidth, sourceHeight, targetWidth, targetHeight);
    const width = Math.min(1, aspect);
    const height = Math.min(1, 1 / aspect);
    return constrainCrop({ x: (1 - width) / 2, y: (1 - height) / 2, width, height });
  }
  function moveCrop(crop, dx, dy) {
    assertCrop(crop);
    assertFiniteNumber(dx, 'dx');
    assertFiniteNumber(dy, 'dy');
    return constrainCrop({ x: crop.x + dx, y: crop.y + dy, width: crop.width, height: crop.height });
  }
  function resizeCrop(crop, handle, dx, dy, aspect) {
    assertCrop(crop);
    assertFiniteNumber(dx, 'dx');
    assertFiniteNumber(dy, 'dy');
    assertPositiveFinite(aspect, 'aspect');
    if (!['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'].includes(handle)) throw new RangeError('handle must be a crop resize handle');
    const left = crop.x;
    const right = crop.x + crop.width;
    const top = crop.y;
    const bottom = crop.y + crop.height;
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;
    const minimumWidth = Math.max(MIN_CROP_SIZE, MIN_CROP_SIZE * aspect);
    let desiredWidth;
    let maximumWidth;
    let x;
    let y;

    if (handle === 'n' || handle === 's') {
      const desiredHeight = handle === 'n' ? crop.height - dy : crop.height + dy;
      desiredWidth = desiredHeight * aspect;
      maximumWidth = Math.min(2 * centerX, 2 * (1 - centerX), aspect * (handle === 'n' ? bottom : 1 - top));
      const width = clamp(desiredWidth, Math.min(minimumWidth, maximumWidth), maximumWidth);
      const height = width / aspect;
      x = centerX - width / 2;
      y = handle === 'n' ? bottom - height : top;
      return constrainCrop({ x, y, width, height });
    }

    if (handle === 'e' || handle === 'w') {
      desiredWidth = handle === 'e' ? crop.width + dx : crop.width - dx;
      maximumWidth = Math.min(handle === 'e' ? 1 - left : right, 2 * aspect * centerY, 2 * aspect * (1 - centerY));
      const width = clamp(desiredWidth, Math.min(minimumWidth, maximumWidth), maximumWidth);
      const height = width / aspect;
      x = handle === 'e' ? left : right - width;
      y = centerY - height / 2;
      return constrainCrop({ x, y, width, height });
    }

    const horizontalChange = (handle === 'ne' || handle === 'se') ? dx : -dx;
    const verticalChange = (handle === 'nw' || handle === 'ne') ? -dy : dy;
    const widthFromHorizontal = crop.width + horizontalChange;
    const widthFromVertical = (crop.height + verticalChange) * aspect;
    desiredWidth = Math.abs(horizontalChange) >= Math.abs(verticalChange * aspect) ? widthFromHorizontal : widthFromVertical;
    const anchorLeft = handle === 'ne' || handle === 'se';
    const anchorTop = handle === 'se' || handle === 'sw';
    maximumWidth = Math.min(
      anchorLeft ? 1 - left : right,
      aspect * (anchorTop ? 1 - top : bottom)
    );
    const width = clamp(desiredWidth, Math.min(minimumWidth, maximumWidth), maximumWidth);
    const height = width / aspect;
    x = anchorLeft ? left : right - width;
    y = anchorTop ? top : bottom - height;
    return constrainCrop({ x, y, width, height });
  }
  function changeCropAspect(crop, aspect) {
    assertCrop(crop);
    assertPositiveFinite(aspect, 'aspect');
    const centerX = crop.x + crop.width / 2;
    const centerY = crop.y + crop.height / 2;
    const width = Math.min(1, aspect);
    const height = width / aspect;
    return constrainCrop({ x: centerX - width / 2, y: centerY - height / 2, width, height });
  }
  function cropToSource(crop, sourceWidth, sourceHeight) {
    assertCrop(crop);
    assertPositiveFinite(sourceWidth, 'sourceWidth');
    assertPositiveFinite(sourceHeight, 'sourceHeight');
    const bounded = constrainCrop(crop);
    const sx = Math.floor(bounded.x * sourceWidth);
    const sy = Math.floor(bounded.y * sourceHeight);
    const right = Math.ceil((bounded.x + bounded.width) * sourceWidth);
    const bottom = Math.ceil((bounded.y + bounded.height) * sourceHeight);
    return { sx, sy, sw: right - sx, sh: bottom - sy };
  }

  function roundChannel(value) { return Math.round(clamp(value, 0, 255)); }
  function controlValue(value, minimum, maximum) {
    return typeof value === 'number' && Number.isFinite(value) ? clamp(value, minimum, maximum) : 0;
  }
  function assertRgbaDimensions(rgba, width, height) {
    if (!Number.isInteger(width) || width < 1) throw new RangeError('width must be a positive integer');
    if (!Number.isInteger(height) || height < 1) throw new RangeError('height must be a positive integer');
    if (!rgba || rgba.length !== width * height * 4) throw new RangeError('rgba length must match width and height');
  }
  function flattenTransparency(rgba, matte = [255, 255, 255]) {
    const output = new Uint8ClampedArray(rgba.length);
    for (let index = 0; index < rgba.length; index += 4) {
      const alpha = rgba[index + 3] / 255;
      output[index] = roundChannel(rgba[index] * alpha + matte[0] * (1 - alpha));
      output[index + 1] = roundChannel(rgba[index + 1] * alpha + matte[1] * (1 - alpha));
      output[index + 2] = roundChannel(rgba[index + 2] * alpha + matte[2] * (1 - alpha));
      output[index + 3] = 255;
    }
    return output;
  }
  function toPerceptualGrayscale(rgba) {
    const output = new Uint8ClampedArray(rgba.length);
    for (let index = 0; index < rgba.length; index += 4) {
      const luminance = roundChannel(0.2126 * rgba[index] + 0.7152 * rgba[index + 1] + 0.0722 * rgba[index + 2]);
      output[index] = luminance;
      output[index + 1] = luminance;
      output[index + 2] = luminance;
      output[index + 3] = 255;
    }
    return output;
  }
  function adjustBrightnessContrast(rgba, brightness, contrast) {
    const output = new Uint8ClampedArray(rgba.length);
    const brightnessOffset = controlValue(brightness, -100, 100) * 255 / 100;
    const mappedContrast = controlValue(contrast, -100, 100) * 255 / 100;
    const factor = (259 * (mappedContrast + 255)) / (255 * (259 - mappedContrast));
    for (let index = 0; index < rgba.length; index += 4) {
      output[index] = roundChannel(factor * (rgba[index] - 128) + 128 + brightnessOffset);
      output[index + 1] = roundChannel(factor * (rgba[index + 1] - 128) + 128 + brightnessOffset);
      output[index + 2] = roundChannel(factor * (rgba[index + 2] - 128) + 128 + brightnessOffset);
      output[index + 3] = 255;
    }
    return output;
  }
  function unsharpMask(rgba, width, height, amount) {
    assertRgbaDimensions(rgba, width, height);
    const output = new Uint8ClampedArray(rgba.length);
    const strength = controlValue(amount, 0, 100) / 100;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = (y * width + x) * 4;
        for (let channel = 0; channel < 3; channel += 1) {
          let total = 0;
          for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
            for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
              const sampleX = clamp(x + offsetX, 0, width - 1);
              const sampleY = clamp(y + offsetY, 0, height - 1);
              total += rgba[(sampleY * width + sampleX) * 4 + channel];
            }
          }
          const blur = total / 9;
          output[index + channel] = roundChannel(rgba[index + channel] + (rgba[index + channel] - blur) * strength);
        }
        output[index + 3] = 255;
      }
    }
    return output;
  }
  function floydSteinbergDither(rgba, width, height) {
    assertRgbaDimensions(rgba, width, height);
    const grayscale = new Float64Array(width * height);
    const output = new Uint8ClampedArray(rgba.length);
    for (let index = 0; index < grayscale.length; index += 1) {
      const rgbaIndex = index * 4;
      grayscale[index] = 0.2126 * rgba[rgbaIndex] + 0.7152 * rgba[rgbaIndex + 1] + 0.0722 * rgba[rgbaIndex + 2];
    }
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = y * width + x;
        const value = grayscale[index];
        const binary = value < 128 ? 0 : 255;
        const error = value - binary;
        const rgbaIndex = index * 4;
        output[rgbaIndex] = binary;
        output[rgbaIndex + 1] = binary;
        output[rgbaIndex + 2] = binary;
        output[rgbaIndex + 3] = 255;
        if (x + 1 < width) grayscale[index + 1] += error * 7 / 16;
        if (y + 1 < height) {
          if (x > 0) grayscale[index + width - 1] += error * 3 / 16;
          grayscale[index + width] += error * 5 / 16;
          if (x + 1 < width) grayscale[index + width + 1] += error / 16;
        }
      }
    }
    return output;
  }
  function processPixels(rgba, width, height, settings) {
    assertRgbaDimensions(rgba, width, height);
    if (!settings || typeof settings !== 'object' || !['color', 'grayscale', 'dither'].includes(settings.mode)) throw new RangeError('settings.mode must be color, grayscale, or dither');
    const options = settings;
    const flattened = flattenTransparency(rgba);
    const adjusted = adjustBrightnessContrast(flattened, options.brightness, options.contrast);
    const sharpened = unsharpMask(adjusted, width, height, options.sharpness);
    if (options.mode === 'color') return sharpened;
    if (options.mode === 'grayscale') return toPerceptualGrayscale(sharpened);
    return floydSteinbergDither(sharpened, width, height);
  }

  return Object.freeze({ PRESETS, getBrands, getPresetsForBrand, findPreset, validateDimensions, validateImageFile, buildFilename, estimateSourceNormalizationBytes, estimateRenderWorkingBytes, resetCrop, moveCrop, resizeCrop, changeCropAspect, cropToSource, flattenTransparency, toPerceptualGrayscale, adjustBrightnessContrast, unsharpMask, floydSteinbergDither, processPixels });
});
