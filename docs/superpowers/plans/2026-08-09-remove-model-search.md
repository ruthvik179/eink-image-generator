# Remove Model Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the redundant **Find a model** search path while preserving Brand, Device, and Custom dimension selection.

**Architecture:** Keep Brand as the preset filter and Device as the single preset selector. Remove the search-only DOM, event flow, and lookup API from the source module, then regenerate the module's embedded copy in the standalone HTML with the existing synchronization script.

**Tech Stack:** Standalone HTML/CSS/JavaScript, CommonJS-compatible UMD module, Node.js 20+, `node:test`, `playwright-core`.

## Global Constraints

- Keep the Brand and Device dropdowns and their existing preset-selection behavior.
- Keep Custom dimensions available and validated as positive integers from 1 through 10000.
- Keep the preset catalog, dimensions, manufacturer sources, crop behavior, image-processing pipeline, and export behavior unchanged.
- Keep `searchNames` in each preset because its first value remains the canonical device name used by exports.
- Remove the **Find a model** input, datalist, event path, and `findPresetBySearchName` API without adding a replacement search control.
- Regenerate the embedded module with `node scripts/sync-standalone.mjs`; do not hand-edit the embedded module independently.

---

### Task 1: Remove the duplicate model-search path

**Files:**
- Modify: `test/image-processing.test.js`
- Modify: `test/browser-smoke.test.js`
- Modify: `web/image-processing.js`
- Modify: `ereader-image-converter.html`

**Interfaces:**
- Consumes: `ImageProcessing.PRESETS`, `getBrands()`, `getPresetsForBrand(brand)`, and `findPreset(id)`.
- Produces: a screen chooser containing `#brand-select`, `#device-select`, and the existing custom dimension controls, with no `#device-search`, `#device-options`, or `findPresetBySearchName` API.

- [ ] **Step 1: Make the unit contract reject the obsolete lookup API**

In `test/image-processing.test.js`, extend `exports the public image processing contract` with this assertion:

```js
assert.equal('findPresetBySearchName' in ImageProcessing, false);
```

Delete the complete `exact model-name lookup resolves required aliases case-insensitively` test because model-name lookup is no longer a supported interface. Keep the catalog assertions, including every `searchNames` value, unchanged.

- [ ] **Step 2: Add a browser test for the simplified selector**

Add this test to `test/browser-smoke.test.js` after the PNG parser test and before the export workflow test:

```js
test('screen selection uses brand and device without a duplicate model search', async (t) => {
  const { page, pageErrors, requestUrls, webSocketUrls } = await openApp(t);

  assert.equal(await page.locator('#device-search').count(), 0);
  assert.equal(await page.locator('#device-options').count(), 0);

  await page.locator('#brand-select').selectOption({ label: 'Kobo' });
  const actualPresetIds = await page.locator('#device-select option').evaluateAll((options) =>
    options.map((entry) => entry.value)
  );
  const expectedPresetIds = await page.evaluate(() => [
    ...ImageProcessing.getPresetsForBrand('Kobo').map((preset) => preset.id),
    '__custom__'
  ]);
  assert.deepEqual(actualPresetIds, expectedPresetIds);

  await page.locator('#device-select').selectOption('kobo-libra-family');
  assert.match(await page.locator('#target-dimensions').textContent(), /^1264 × 1680 pixels \(portrait\)$/);

  await page.locator('#device-select').selectOption('__custom__');
  assert.equal(await page.locator('#custom-width').isEnabled(), true);
  assert.equal(await page.locator('#custom-height').isEnabled(), true);

  assert.deepEqual(pageErrors, []);
  assert.deepEqual(requestUrls, []);
  assert.deepEqual(webSocketUrls, []);
});
```

- [ ] **Step 3: Run the focused tests and verify the new expectations fail**

Run:

```powershell
node --test test/image-processing.test.js
node --test --test-name-pattern="screen selection uses brand and device" test/browser-smoke.test.js
```

Expected: the unit test fails because `findPresetBySearchName` is still exported, and the browser test fails because `#device-search` and `#device-options` still exist.

- [ ] **Step 4: Remove the lookup API from the source module**

In `web/image-processing.js`, delete:

```js
function findPresetBySearchName(name) {
  const normalized = typeof name === 'string' ? name.trim().toLowerCase() : '';
  return PRESETS.find((preset) => preset.searchNames.some((candidate) => candidate.toLowerCase() === normalized)) || null;
}
```

Remove `findPresetBySearchName` from the final frozen export object. Do not change `PRESETS`, `searchNames`, `getBrands`, `getPresetsForBrand`, or `findPreset`.

- [ ] **Step 5: Remove the search UI and event path**

In `ereader-image-converter.html`:

1. Delete the `<div>` containing the `device-search` label and input, plus the `device-options` datalist.
2. Delete `deviceSearch` and `deviceOptions` from the `controls` object.
3. Delete the loop in `populateModels()` that appends every `searchNames` entry to `controls.deviceOptions`; keep Brand and Custom option population.
4. Delete assignments to `controls.deviceSearch.value` from `selectPreset()` and `enterCustomMode()`.
5. Delete the `controls.deviceSearch` input listener from `bindTargetControls()`.

Keep `populateDevices()`, the Brand listener, the Device listener, Custom dimension handling, and initial preset selection unchanged.

- [ ] **Step 6: Regenerate the embedded processing module**

Run:

```powershell
node scripts/sync-standalone.mjs
node scripts/sync-standalone.mjs --check
```

Expected: the first command updates the embedded module in `ereader-image-converter.html`; the second reports `Standalone image processing module is synchronized.`

- [ ] **Step 7: Run focused verification**

Run:

```powershell
node --test test/image-processing.test.js
node --test --test-name-pattern="screen selection uses brand and device" test/browser-smoke.test.js
```

Expected: both commands pass. The browser test confirms the search controls are absent, Kobo devices populate correctly, preset dimensions apply, and Custom fields enable.

- [ ] **Step 8: Run the full suite**

Run:

```powershell
npm test
```

Expected: all unit, repository-hygiene, standalone-sync, landing-page, and browser smoke tests pass.

- [ ] **Step 9: Review and commit the implementation**

Run:

```powershell
git diff --check
git diff --stat
git add -- test/image-processing.test.js test/browser-smoke.test.js web/image-processing.js ereader-image-converter.html
git commit -m "refactor: remove redundant model search"
```

Expected: one implementation commit containing only the two test files, the processing source module, and the regenerated standalone HTML.
