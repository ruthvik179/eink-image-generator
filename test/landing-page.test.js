const assert = require('node:assert/strict');
const { existsSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright-core');

const landingUrl = pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href;

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
  if (!executable) throw new Error('No Edge/Chrome executable found. Set PLAYWRIGHT_BROWSER_PATH to its full path.');
  return executable;
}

async function openLanding(t, viewport) {
  const browser = await chromium.launch({ executablePath: browserPath(), headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport });
  const externalRequests = [];
  const pageErrors = [];
  page.on('request', (request) => {
    if (/^https?:/i.test(request.url())) externalRequests.push(request.url());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto(landingUrl, { waitUntil: 'load' });
  return { page, externalRequests, pageErrors };
}

test('landing page describes the project and links to the converter', async (t) => {
  const { page, externalRequests, pageErrors } = await openLanding(t, { width: 1280, height: 900 });
  await assert.doesNotReject(() => page.getByRole('heading', { level: 1, name: /e-reader image converter/i }).waitFor());
  assert.equal(await page.getByRole('link', { name: /open image converter/i }).getAttribute('href'), 'ereader-image-converter.html');
  assert.equal(await page.getByRole('link', { name: /view on github/i }).first().getAttribute('href'), 'https://github.com/ruthvik179/eink-image-generator');
  assert.match(await page.locator('main').textContent(), /nothing is uploaded/i);
  assert.deepEqual(externalRequests, []);
  assert.deepEqual(pageErrors, []);
});

test('landing page fits a narrow viewport and keeps the primary action visible', async (t) => {
  const { page } = await openLanding(t, { width: 360, height: 800 });
  const layout = await page.evaluate(() => ({
    bodyWidth: document.body.scrollWidth,
    viewportWidth: document.documentElement.clientWidth
  }));
  assert.ok(layout.bodyWidth <= layout.viewportWidth);
  await assert.doesNotReject(() => page.getByRole('link', { name: /open image converter/i }).waitFor({ state: 'visible' }));
});
