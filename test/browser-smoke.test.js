const assert = require('node:assert/strict');
const { existsSync } = require('node:fs');
const { mkdtemp, readFile, rm, writeFile } = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');
const { deflateSync } = require('node:zlib');
const { chromium } = require('playwright-core');

const appUrl = pathToFileURL(path.resolve(__dirname, '..', 'ereader-image-converter.html')).href;

function browserPath() {
  const candidates = [
    process.env.PLAYWRIGHT_BROWSER_PATH,
    process.env['ProgramFiles(x86)'] && path.join(process.env['ProgramFiles(x86)'], 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    process.env['ProgramFiles(x86)'] && path.join(process.env['ProgramFiles(x86)'], 'Google', 'Chrome', 'Application', 'chrome.exe'),
    process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    '/usr/bin/microsoft-edge',
    '/usr/bin/google-chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ].filter(Boolean);
  const executable = candidates.find(existsSync);
  if (!executable) {
    throw new Error('No Edge/Chrome executable found. Set PLAYWRIGHT_BROWSER_PATH to its full path.');
  }
  return executable;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const name = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
}

function createPng(width, height) {
  const rows = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 4 + 1);
    for (let x = 0; x < width; x += 1) {
      const pixel = row + 1 + x * 4;
      rows[pixel] = Math.round(255 * x / Math.max(1, width - 1));
      rows[pixel + 1] = Math.round(255 * y / Math.max(1, height - 1));
      rows[pixel + 2] = (x + y) % 256;
      rows[pixel + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from('89504e470d0a1a0a', 'hex'),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(rows)),
    pngChunk('IEND', Buffer.alloc(0))
  ]);
}

function readPngDimensions(buffer) {
  const signature = Buffer.from('89504e470d0a1a0a', 'hex');
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(signature)) throw new Error('Invalid PNG signature');
  if (buffer.readUInt32BE(8) !== 13 || buffer.subarray(12, 16).toString('ascii') !== 'IHDR') throw new Error('Invalid PNG IHDR');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

async function openApp(t) {
  const browser = await chromium.launch({ executablePath: browserPath(), headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const pageErrors = [];
  const requestUrls = [];
  const webSocketUrls = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('request', (request) => {
    if (/^https?:/i.test(request.url())) requestUrls.push(request.url());
  });
  page.on('websocket', (webSocket) => webSocketUrls.push(webSocket.url()));
  await page.goto(appUrl, { waitUntil: 'load' });
  return { page, pageErrors, requestUrls, webSocketUrls };
}

test('PNG dimension parser validates the signature and IHDR framing', () => {
  const png = createPng(17, 23);
  assert.deepEqual(readPngDimensions(png), { width: 17, height: 23 });

  const badSignature = Buffer.from(png);
  badSignature[0] = 0;
  assert.throws(() => readPngDimensions(badSignature), /signature/);

  const badLength = Buffer.from(png);
  badLength.writeUInt32BE(12, 8);
  assert.throws(() => readPngDimensions(badLength), /IHDR/);

  const badType = Buffer.from(png);
  badType.write('IDAT', 12, 'ascii');
  assert.throws(() => readPngDimensions(badType), /IHDR/);
});

test('file app previews locally and exports the exact active target as PNG', { timeout: 30_000 }, async (t) => {
  const fixtureDirectory = await mkdtemp(path.join(os.tmpdir(), 'ereader-converter-smoke-'));
  t.after(() => rm(fixtureDirectory, { recursive: true, force: true }));
  const fixturePath = path.join(fixtureDirectory, 'gradient-cover.png');
  await writeFile(fixturePath, createPng(320, 240));

  const { page, pageErrors, requestUrls, webSocketUrls } = await openApp(t);
  await page.locator('#file-input').setInputFiles(fixturePath);
  await page.waitForFunction(() => document.querySelector('#status').textContent.includes('gradient-cover.png loaded'));
  assert.equal(await page.locator('#reset-crop').isEnabled(), true);
  await page.locator('#brand-select').selectOption({ label: 'Barnes & Noble' });
  await page.locator('#device-select').selectOption('nook-glowlight-4');
  const cropBefore = await page.locator('#crop-canvas').evaluate((canvas) => canvas.toDataURL());
  await page.locator('#crop-canvas').focus();
  await page.keyboard.press('Shift+ArrowRight');
  const cropAfter = await page.locator('#crop-canvas').evaluate((canvas) => canvas.toDataURL());
  assert.notEqual(cropAfter, cropBefore);
  await page.locator('#mode').selectOption('grayscale');

  await assert.doesNotReject(() => page.locator('#status').waitFor({ state: 'visible' }));
  await assert.doesNotReject(() => page.waitForFunction(() => {
    const canvas = document.querySelector('#preview-canvas');
    const pixel = canvas.getContext('2d').getImageData(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), 1, 1).data;
    return document.querySelector('#status').textContent.includes('Preview ready')
      && pixel[0] === pixel[1]
      && pixel[1] === pixel[2];
  }, null, { timeout: 10_000 }));
  const previewPixel = await page.locator('#preview-canvas').evaluate((canvas) => {
    const context = canvas.getContext('2d');
    return [...context.getImageData(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), 1, 1).data];
  });
  assert.equal(previewPixel[0], previewPixel[1]);
  assert.equal(previewPixel[1], previewPixel[2]);
  const previewSize = await page.locator('#preview-canvas').evaluate((canvas) => {
    const bounds = canvas.getBoundingClientRect();
    return { bitmapWidth: canvas.width, bitmapHeight: canvas.height, cssWidth: bounds.width, cssHeight: bounds.height };
  });
  assert.deepEqual([previewSize.bitmapWidth, previewSize.bitmapHeight], [675, 900]);
  assert.equal(previewSize.bitmapWidth / previewSize.bitmapHeight, 1080 / 1440);
  assert.ok(previewSize.cssWidth <= 900 && previewSize.cssHeight <= 900);
  await assert.doesNotReject(() => page.locator('#quality-warning').waitFor({ state: 'visible' }));
  assert.match(await page.locator('#quality-warning').textContent(), /upscal/i);

  await page.evaluate(() => {
    const encode = HTMLCanvasElement.prototype.toBlob;
    let signalEncode;
    window.exportEncodeStarted = new Promise((resolve) => { signalEncode = resolve; });
    HTMLCanvasElement.prototype.toBlob = function (callback, ...args) {
      signalEncode();
      return encode.call(this, (blob) => setTimeout(() => callback(blob), 250), ...args);
    };
    const nextFrame = window.requestAnimationFrame.bind(window);
    let releaseFirstFrame;
    let signalFirstFrame;
    const firstFrameRelease = new Promise((resolve) => { releaseFirstFrame = resolve; });
    window.firstExportFrameScheduled = new Promise((resolve) => { signalFirstFrame = resolve; });
    window.releaseFirstExportFrame = releaseFirstFrame;
    window.requestAnimationFrame = (callback) => {
      signalFirstFrame();
      window.requestAnimationFrame = nextFrame;
      return nextFrame((time) => firstFrameRelease.then(() => callback(time)));
    };
  });
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#download').click();
  await page.evaluate(() => window.firstExportFrameScheduled);
  await page.locator('#device-select').selectOption('nook-glowlight-4-plus');
  await page.locator('#mode').selectOption('dither');
  await page.locator('#crop-canvas').focus();
  await page.keyboard.press('-');
  await page.evaluate(() => window.releaseFirstExportFrame());
  await page.evaluate(() => window.exportEncodeStarted);
  await page.locator('#device-select').selectOption('nook-glowlight-4e');
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), 'gradient-cover-nook-glowlight-4-1080x1440.png');
  const downloadedPng = await readFile(await download.path());
  assert.deepEqual(readPngDimensions(downloadedPng), { width: 1080, height: 1440 });
  assert.deepEqual(pageErrors, []);
  assert.deepEqual(requestUrls, []);
  assert.deepEqual(webSocketUrls, []);
});

test('the crop can be resized from the keyboard and exposes position plus size', { timeout: 30_000 }, async (t) => {
  const { page, pageErrors, requestUrls, webSocketUrls } = await openApp(t);
  await page.locator('#file-input').setInputFiles({ name: 'keyboard.png', mimeType: 'image/png', buffer: createPng(320, 240) });
  await page.waitForFunction(() => document.querySelector('#status').textContent.includes('keyboard.png loaded'));
  await page.locator('#brand-select').selectOption({ label: 'Barnes & Noble' });
  await page.locator('#device-select').selectOption('nook-glowlight-4');
  await page.waitForFunction(() => document.querySelector('#status').textContent.includes('Preview ready'));

  const cropCanvas = page.locator('#crop-canvas');
  await cropCanvas.focus();
  const beforeLabel = await cropCanvas.getAttribute('aria-label');
  const beforeBitmap = await cropCanvas.evaluate((canvas) => canvas.toDataURL());
  await page.keyboard.press('-');
  await page.waitForFunction(
    (label) => document.querySelector('#crop-canvas').getAttribute('aria-label') !== label,
    beforeLabel,
    { timeout: 2_000 }
  );

  const afterLabel = await cropCanvas.getAttribute('aria-label');
  const afterBitmap = await cropCanvas.evaluate((canvas) => canvas.toDataURL());
  assert.match(await page.locator('#crop-help').textContent(), /\+.*[-−]/);
  assert.match(afterLabel, /x position [\d.]+%, y position [\d.]+%, width [\d.]+%, height [\d.]+%/i);
  assert.notEqual(afterBitmap, beforeBitmap);
  assert.equal(await cropCanvas.evaluate((canvas) => document.activeElement === canvas), true);
  await page.waitForFunction(() => /Crop: x [\d.]+%, y [\d.]+%, width [\d.]+%, height [\d.]+%/.test(document.querySelector('#status').textContent));
  assert.deepEqual(pageErrors, []);
  assert.deepEqual(requestUrls, []);
  assert.deepEqual(webSocketUrls, []);
});

test('the crop focus indicator stays visible inside its clipped stage with at least 3 to 1 contrast', { timeout: 30_000 }, async (t) => {
  const { page } = await openApp(t);
  const cropCanvas = page.locator('#crop-canvas');
  await cropCanvas.focus();

  const contrast = await cropCanvas.evaluate((canvas) => {
    const parse = (color) => color.match(/[\d.]+/g).slice(0, 3).map(Number);
    const luminance = (rgb) => {
      const channels = rgb.map((value) => {
        const normalized = value / 255;
        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    };
    const style = getComputedStyle(canvas);
    const stage = canvas.parentElement;
    const stageStyle = getComputedStyle(stage);
    const canvasBounds = canvas.getBoundingClientRect();
    const stageBounds = stage.getBoundingClientRect();
    const outlineWidth = Number.parseFloat(style.outlineWidth);
    const outlineOffset = Number.parseFloat(style.outlineOffset);
    const ringInset = -(outlineOffset + outlineWidth);
    const background = stageStyle.backgroundColor;
    const lighter = Math.max(luminance(parse(style.outlineColor)), luminance(parse(background)));
    const darker = Math.min(luminance(parse(style.outlineColor)), luminance(parse(background)));
    return {
      ratio: (lighter + 0.05) / (darker + 0.05),
      outlineStyle: style.outlineStyle,
      hasInsetHalo: style.boxShadow.includes('inset'),
      ringInset,
      ringInsideStage:
        canvasBounds.left + ringInset >= stageBounds.left
        && canvasBounds.top + ringInset >= stageBounds.top
        && canvasBounds.right - ringInset <= stageBounds.right
        && canvasBounds.bottom - ringInset <= stageBounds.bottom,
    };
  });

  assert.equal(contrast.outlineStyle, 'solid');
  assert.equal(contrast.hasInsetHalo, true);
  assert.ok(contrast.ringInset >= 0, `focus outline extended ${-contrast.ringInset}px outside the canvas`);
  assert.equal(contrast.ringInsideStage, true);
  assert.ok(contrast.ratio >= 3, `focus contrast was ${contrast.ratio}`);
});

test('dropping an image on the source panel loads it without a network request', { timeout: 30_000 }, async (t) => {
  const { page, pageErrors, requestUrls, webSocketUrls } = await openApp(t);
  const dropZone = page.locator('#source-drop-zone');
  const pngBase64 = createPng(24, 32).toString('base64');

  await dropZone.evaluate((zone, encoded) => {
    const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
    const transfer = new DataTransfer();
    transfer.items.add(new File([bytes], 'dropped.png', { type: 'image/png' }));
    zone.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: transfer }));
  }, pngBase64);
  assert.equal(await dropZone.evaluate((zone) => zone.classList.contains('is-dragging')), true);
  await dropZone.evaluate((zone, encoded) => {
    const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
    const transfer = new DataTransfer();
    transfer.items.add(new File([bytes], 'dropped.png', { type: 'image/png' }));
    zone.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer }));
  }, pngBase64);

  await page.waitForFunction(() => document.querySelector('#status').textContent.includes('dropped.png loaded at 24 × 32'));
  assert.equal(await dropZone.evaluate((zone) => zone.classList.contains('is-dragging')), false);
  assert.equal(await page.locator('#download').isEnabled(), true);
  assert.deepEqual(pageErrors, []);
  assert.deepEqual(requestUrls, []);
  assert.deepEqual(webSocketUrls, []);
});

test('an oversized decoded source is rejected before a normalized canvas allocation', { timeout: 30_000 }, async (t) => {
  const { page, pageErrors, requestUrls, webSocketUrls } = await openApp(t);
  const chooser = page.locator('#file-input');
  await chooser.setInputFiles({ name: 'kept.png', mimeType: 'image/png', buffer: createPng(120, 160) });
  await page.waitForFunction(() => document.querySelector('#status').textContent.includes('kept.png loaded'));
  await page.evaluate(() => {
    window.oversizedBitmapClosed = false;
    window.normalizedCanvasAllocations = 0;
    window.createImageBitmap = async () => ({
      width: 10_000,
      height: 10_000,
      close() { window.oversizedBitmapClosed = true; }
    });
    const createElement = document.createElement.bind(document);
    document.createElement = (name, options) => {
      if (String(name).toLowerCase() === 'canvas') {
        window.normalizedCanvasAllocations += 1;
        throw new Error('unexpected normalized canvas allocation');
      }
      return createElement(name, options);
    };
  });

  await chooser.setInputFiles({ name: 'too-large.png', mimeType: 'image/png', buffer: createPng(2, 2) });
  await page.locator('#error').waitFor({ state: 'visible' });
  assert.match(await page.locator('#error').textContent(), /decoded image.*512 MiB.*smaller image/i);
  assert.match(await page.locator('#status').textContent(), /Keeping kept\.png/);
  assert.equal(await page.evaluate(() => window.normalizedCanvasAllocations), 0);
  assert.equal(await page.evaluate(() => window.oversizedBitmapClosed), true);
  assert.equal(await page.locator('#download').isEnabled(), true);
  assert.deepEqual(pageErrors, []);
  assert.deepEqual(requestUrls, []);
  assert.deepEqual(webSocketUrls, []);
});

test('clearing the chooser prevents an in-flight decode from replacing the prior source', { timeout: 30_000 }, async (t) => {
  const { page, pageErrors, requestUrls, webSocketUrls } = await openApp(t);
  const chooser = page.locator('#file-input');
  await chooser.setInputFiles({ name: 'original.png', mimeType: 'image/png', buffer: createPng(120, 160) });
  await page.waitForFunction(() => document.querySelector('#status').textContent.includes('original.png loaded'));
  await page.evaluate(() => {
    const decode = window.createImageBitmap.bind(window);
    let signalDecodeComplete;
    window.delayedDecodeComplete = new Promise((resolve) => { signalDecodeComplete = resolve; });
    window.createImageBitmap = async (...args) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      try {
        return await decode(...args);
      } finally {
        signalDecodeComplete();
      }
    };
  });
  await chooser.setInputFiles({ name: 'stale.png', mimeType: 'image/png', buffer: createPng(80, 100) });
  await chooser.setInputFiles([]);
  await page.evaluate(() => window.delayedDecodeComplete);
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 0)));

  assert.doesNotMatch(await page.locator('#status').textContent(), /stale\.png loaded/);
  assert.match(await page.locator('#quality-warning').textContent(), /120 × 160 source pixels/);
  assert.equal(await page.locator('#download').isEnabled(), true);
  assert.deepEqual(pageErrors, []);
  assert.deepEqual(requestUrls, []);
  assert.deepEqual(webSocketUrls, []);
});
