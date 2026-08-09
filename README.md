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
