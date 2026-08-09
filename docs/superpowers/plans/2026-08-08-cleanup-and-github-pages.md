# Legacy Cleanup and GitHub Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the original Java EPUB extractor, focus the repository on the browser converter, add a project landing page, and publish it through GitHub Pages.

**Architecture:** Preserve the standalone converter and its Node-based development workflow while deleting the isolated Java/Maven implementation and updating repository metadata. Add one dependency-free root landing page, verify it with Playwright, then publish the repository root from `master` through GitHub Pages.

**Tech Stack:** Static HTML/CSS, Node.js 20+, `node:test`, `playwright-core`, GitHub Pages, GitHub CLI.

## Global Constraints

- Delete `src/`, `pom.xml`, and `HOWTO.md`; do not rewrite Git history.
- Keep `ereader-image-converter.html`, `web/`, `scripts/`, `test/`, and `docs/superpowers/`.
- Keep `ereader-image-converter.html` unchanged.
- Use the package and project name `eink-image-generator`.
- Publish from the root of the `master` branch.
- Use relative site links that work below `/eink-image-generator/`.
- Do not add external fonts, scripts, images, services, analytics, a service worker, a custom domain, or a build system.
- Keep the landing page usable without JavaScript, responsive, and keyboard accessible.

---

### Task 1: Remove the legacy Java extractor and update project identity

**Files:**
- Create: `test/repository-hygiene.test.js`
- Modify: `.gitignore`
- Modify: `README.md`
- Modify: `package.json`
- Modify: `package-lock.json`
- Delete: `HOWTO.md`
- Delete: `pom.xml`
- Delete: `src/main/java/com/pipasoft/epubcoverextractor/Application.java`
- Delete: `src/main/java/com/pipasoft/epubcoverextractor/Grayscale.java`
- Delete: `src/main/java/com/pipasoft/epubcoverextractor/Utils.java`

**Interfaces:**
- Consumes: the existing browser converter files and Node test scripts.
- Produces: package name `eink-image-generator`, browser-only README content, and a hygiene test that prevents legacy Java metadata from returning.

- [ ] **Step 1: Write a failing repository-hygiene test**

Create `test/repository-hygiene.test.js`:

```js
const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

test('repository contains only the browser converter product', () => {
  for (const legacyPath of [
    'HOWTO.md',
    'pom.xml',
    'src/main/java/com/pipasoft/epubcoverextractor/Application.java',
    'src/main/java/com/pipasoft/epubcoverextractor/Grayscale.java',
    'src/main/java/com/pipasoft/epubcoverextractor/Utils.java'
  ]) {
    assert.equal(existsSync(path.join(root, legacyPath)), false, `${legacyPath} should be removed`);
  }

  const packageJson = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
  const packageLock = JSON.parse(readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  const readme = readFileSync(path.join(root, 'README.md'), 'utf8');
  const gitignore = readFileSync(path.join(root, '.gitignore'), 'utf8');

  assert.equal(packageJson.name, 'eink-image-generator');
  assert.equal(packageLock.name, 'eink-image-generator');
  assert.equal(packageLock.packages[''].name, 'eink-image-generator');
  assert.doesNotMatch(readme, /epub-cover-extractor|Java CLI EPUB cover extractor|mvn clean package/i);
  assert.doesNotMatch(gitignore, /\.class|\.jar|^target$|\.classpath|\.project/m);
});
```

- [ ] **Step 2: Include the hygiene test in the unit suite**

Change `package.json` to:

```json
{
  "name": "eink-image-generator",
  "private": true,
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "test:unit": "node --test test/image-processing.test.js test/repository-hygiene.test.js test/standalone-sync.test.js",
    "test:smoke": "node --test test/browser-smoke.test.js",
    "test": "npm run test:unit && npm run test:smoke"
  },
  "devDependencies": {
    "playwright-core": "^1.62.1"
  }
}
```

- [ ] **Step 3: Run the hygiene test and verify it fails against the legacy tree**

Run: `node --test test/repository-hygiene.test.js`

Expected: FAIL because `HOWTO.md`, `pom.xml`, and the Java source files still exist.

- [ ] **Step 4: Delete the Java/Maven implementation**

Run:

```powershell
git rm -- HOWTO.md pom.xml src/main/java/com/pipasoft/epubcoverextractor/Application.java src/main/java/com/pipasoft/epubcoverextractor/Grayscale.java src/main/java/com/pipasoft/epubcoverextractor/Utils.java
```

Expected: Git stages the two legacy documentation/build files and three Java source files for deletion; empty source directories disappear from the working tree.

- [ ] **Step 5: Trim `.gitignore` to current development artifacts**

Replace `.gitignore` with:

```gitignore
.worktrees/
.superpowers/sdd/
node_modules/
```

- [ ] **Step 6: Focus the README on the browser converter**

Replace `README.md` with:

````markdown
# E-reader Image Converter

A standalone offline image converter for e-reader screens.

## Using the converter

No installation or local server is required. Double-click `ereader-image-converter.html` to open it in a current Edge or Chrome browser.

1. Select a local JPEG, PNG, or WebP image, or drop it onto the **Choose an image** panel.
2. Choose a brand and device preset, or choose **Custom** and enter the screen dimensions.
3. Drag or resize the crop. With the crop canvas focused, arrow keys move it, `+` and `-` resize it, and Shift uses a larger step.
4. Choose Original Color, Optimized Grayscale, or Black & White Dithered, then adjust brightness, contrast, and sharpness as needed.
5. Check the processed preview and click **Download PNG**. Export always uses the exact displayed target dimensions, independently of the smaller preview.

All decoding, cropping, processing, and PNG creation happens locally in the browser. The converter does not upload the image or make network requests. If the selected crop contains fewer pixels than the target screen, a nonblocking warning explains that the export will be upscaled and cannot recreate missing detail. A shared 512 MiB safety budget covers source decoding, the retained normalized source, preview work, and export work; an oversized replacement is rejected with an inline message while the previous valid image stays open.

## Browser converter development

Install Node.js 20 or newer, then install the development-only test dependency and run the unit, standalone-sync, repository-hygiene, landing-page, and direct-file browser smoke suites:

```powershell
npm install
npm test
```

The standalone HTML embeds `web/image-processing.js`. After changing that module, synchronize the embedded copy with `node scripts/sync-standalone.mjs`; verify it is current with:

```powershell
node scripts/sync-standalone.mjs --check
```

The smoke suite locates an installed Edge or Chrome browser. Set `PLAYWRIGHT_BROWSER_PATH` to the browser executable if it is installed in a nonstandard location.

### Release handoff

Automated tests exercise the standalone page through `file://`, including local image loading, drag and drop, crop keyboard operation, preview, and exact PNG export. Manual Windows acceptance—double-clicking the HTML in File Explorer, completing the workflow, and opening the downloaded PNG to confirm its dimensions—remains a release check.
````

- [ ] **Step 7: Synchronize package-lock metadata**

Run: `npm install --package-lock-only`

Expected: both top-level `name` fields in `package-lock.json` become `eink-image-generator`; no dependency versions change.

- [ ] **Step 8: Run the focused hygiene test**

Run: `node --test test/repository-hygiene.test.js`

Expected: 1 test passes, 0 fail.

- [ ] **Step 9: Run the full suite**

Run: `npm test`

Expected: all image-processing, repository-hygiene, standalone-sync, and browser smoke tests pass.

- [ ] **Step 10: Commit the cleanup**

```powershell
git add -- .gitignore README.md package.json package-lock.json test/repository-hygiene.test.js
git commit -m "chore: remove legacy EPUB extractor"
```

---

### Task 2: Build and test the project landing page

**Files:**
- Create: `index.html`
- Create: `test/landing-page.test.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: tracked `ereader-image-converter.html` and repository URL `https://github.com/ruthvik179/eink-image-generator`.
- Produces: a root document whose primary action has `href="ereader-image-converter.html"` and whose repository links use the canonical HTTPS URL.

- [ ] **Step 1: Write failing landing-page smoke tests**

Create `test/landing-page.test.js`:

```js
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
```

- [ ] **Step 2: Include the landing-page test in the smoke suite**

Change the smoke script in `package.json` to:

```json
"test:smoke": "node --test test/browser-smoke.test.js test/landing-page.test.js"
```

- [ ] **Step 3: Run the focused test and verify it fails for the missing page**

Run: `node --test test/landing-page.test.js`

Expected: FAIL because `index.html` does not exist.

- [ ] **Step 4: Create the dependency-free landing page**

Create `index.html`:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Prepare images for Kindle, Kobo, Nook, and other e-reader screens directly in your browser.">
  <title>E-reader Image Converter</title>
  <style>
    :root { color-scheme: light; --paper: #f4efe3; --panel: #fffdf7; --ink: #202724; --muted: #59645f; --line: #a9aaa0; --accent: #2f6f69; --accent-dark: #1e504c; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--paper); color: var(--ink); line-height: 1.55; }
    a:focus-visible { outline: 3px solid #5a3600; outline-offset: 3px; box-shadow: 0 0 0 2px white; }
    .shell { width: min(68rem, calc(100% - 2rem)); margin-inline: auto; }
    header { padding: 1.25rem 0; }
    header a { color: var(--accent-dark); font-weight: 750; }
    main { padding: clamp(2.5rem, 8vw, 6rem) 0 4rem; }
    .eyebrow { margin: 0; color: var(--accent-dark); font-size: .8rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
    h1 { max-width: 14ch; margin: .35rem 0 1rem; font-size: clamp(2.4rem, 7vw, 5.3rem); line-height: .98; letter-spacing: -.04em; }
    .lede { max-width: 42rem; margin: 0; color: var(--muted); font-size: clamp(1.05rem, 2vw, 1.3rem); }
    .actions { display: flex; flex-wrap: wrap; gap: .75rem; margin: 2rem 0 3.5rem; }
    .actions a { display: inline-flex; min-height: 2.75rem; align-items: center; padding: .65rem 1rem; border: 1px solid var(--accent-dark); border-radius: .3rem; color: var(--accent-dark); font-weight: 750; text-decoration: none; }
    .actions .cta { background: var(--accent-dark); color: white; }
    .actions a:hover { background: #e4efea; }
    .actions .cta:hover { background: var(--accent); }
    .features { display: grid; grid-template-columns: repeat(3, 1fr); gap: .8rem; }
    .features section { padding: 1.25rem; border: 1px solid var(--line); border-radius: .35rem; background: var(--panel); box-shadow: 0 2px 8px rgb(32 39 36 / 7%); }
    h2 { margin: 0 0 .5rem; font-size: 1.05rem; }
    .features p { margin: 0; color: var(--muted); }
    footer { padding: 1.5rem 0 2.5rem; border-top: 1px solid var(--line); color: var(--muted); }
    @media (max-width: 720px) { .features { grid-template-columns: 1fr; } .actions a { width: 100%; justify-content: center; } }
  </style>
</head>
<body>
  <header class="shell"><a href="https://github.com/ruthvik179/eink-image-generator">View on GitHub</a></header>
  <main class="shell">
    <p class="eyebrow">Private. Offline. Made for e-readers.</p>
    <h1>E-reader Image Converter</h1>
    <p class="lede">Crop, resize, and tune images for Kindle, Kobo, Nook, and other e-reader screens. Everything runs locally in your browser—nothing is uploaded.</p>
    <nav class="actions" aria-label="Project actions">
      <a class="cta" href="ereader-image-converter.html">Open Image Converter</a>
      <a href="https://github.com/ruthvik179/eink-image-generator">View on GitHub</a>
    </nav>
    <div class="features">
      <section><h2>Device-ready presets</h2><p>Choose common e-reader models or enter an exact custom screen size.</p></section>
      <section><h2>Purpose-built controls</h2><p>Crop, rotate, adjust brightness and contrast, sharpen, and choose color, grayscale, or dithered output.</p></section>
      <section><h2>Local PNG export</h2><p>Preview and save the finished image at the precise target dimensions without sending it to a server.</p></section>
    </div>
  </main>
  <footer><div class="shell">A dependency-free image tool that runs entirely in your browser.</div></footer>
</body>
</html>
```

- [ ] **Step 5: Run the focused landing-page tests**

Run: `node --test test/landing-page.test.js`

Expected: 2 tests pass, 0 fail.

- [ ] **Step 6: Run the full project suite**

Run: `npm test`

Expected: all unit, converter smoke, standalone-sync, repository-hygiene, and landing-page tests pass.

- [ ] **Step 7: Inspect desktop and mobile renders**

Open `index.html` at 1280×900 and 360×800. Confirm the heading, primary action, three feature cards, privacy copy, and repository link are visible; confirm the narrow layout has no horizontal scrolling.

- [ ] **Step 8: Commit the landing page and test**

```powershell
git add -- index.html test/landing-page.test.js package.json
git commit -m "feat: add project landing page"
```

---

## Post-review release: Publish and verify GitHub Pages

Run this release checklist only after Tasks 1 and 2 pass their task reviews, the whole-branch review is clean, and the reviewed feature branch has been integrated into local `master` through the finishing-development-branch workflow.

**Files:**
- No repository files created or modified.

**Interfaces:**
- Consumes: committed `master`, root `index.html`, `ereader-image-converter.html`, and authenticated `gh` access to `ruthvik179/eink-image-generator`.
- Produces: live landing page `https://ruthvik179.github.io/eink-image-generator/` and live converter `https://ruthvik179.github.io/eink-image-generator/ereader-image-converter.html`.

- [ ] **Step 1: Verify integrated repository scope and run fresh tests**

Run:

```powershell
git status -sb
git diff origin/master..HEAD --stat
npm test
```

Expected: local `master` contains only the approved spec, plan, cleanup, landing page, and test commits ahead of `origin/master`; all tests pass.

- [ ] **Step 2: Push the tested commits**

Run: `git push origin master`

Expected: Git reports `master -> master` with no rejected updates.

- [ ] **Step 3: Enable GitHub Pages from the branch root**

Run:

```powershell
gh api --method POST repos/ruthvik179/eink-image-generator/pages --field 'source[branch]=master' --field 'source[path]=/'
```

Expected: the response reports `html_url` as `https://ruthvik179.github.io/eink-image-generator/` and source `master` at `/`. If Pages already exists, use the same fields with `--method PUT`.

- [ ] **Step 4: Poll the latest build to a terminal state**

Run `gh api repos/ruthvik179/eink-image-generator/pages/builds/latest` at intervals no longer than 30 seconds until `.status` is `built` or `errored`.

Expected: `.status` is `built`. If it is `errored`, inspect `.error.message` and stop without claiming deployment success.

- [ ] **Step 5: Verify both public pages**

Run:

```powershell
$landing = Invoke-WebRequest -UseBasicParsing 'https://ruthvik179.github.io/eink-image-generator/'
$converter = Invoke-WebRequest -UseBasicParsing 'https://ruthvik179.github.io/eink-image-generator/ereader-image-converter.html'
$landing.StatusCode
$converter.StatusCode
$landing.Content -match 'href="ereader-image-converter.html"'
```

Expected: both status codes are `200` and the link expression is `True`.

- [ ] **Step 6: Verify deployed commit and local synchronization**

Run:

```powershell
git status -sb
git rev-parse HEAD
git ls-remote origin refs/heads/master
gh api repos/ruthvik179/eink-image-generator/pages
```

Expected: the worktree is clean, local and remote hashes match, and Pages reports the intended HTTPS URL with `built` status.
