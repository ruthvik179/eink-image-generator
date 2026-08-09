# E-Ink Image Converter Design

## Goal

Add a double-clickable, offline browser frontend that converts a user-supplied image into a crisp, native-resolution image for major Barnes & Noble NOOK, Kindle, Kobo, and BOOX e-readers.

## Scope

The tool accepts browser-supported raster images such as JPEG, PNG, and WebP. It provides a curated catalog of major current and commonly used recent e-reader models, grouped by brand, plus custom width and height fields. It exports a single processed image; EPUB parsing and batch extraction remain responsibilities of the existing Java application and are not duplicated in this frontend.

The initial preset catalog covers these product families:

- Barnes & Noble: NOOK GlowLight 4, GlowLight 4e, and GlowLight 4 Plus.
- Kindle: current and recent Kindle Basic, Paperwhite, Paperwhite Signature Edition, Colorsoft, Oasis, and Scribe generations where their native screen dimensions differ.
- Kobo: current and recent Nia, Clara, Libra, Sage, and Elipsa models where their native screen dimensions differ.
- BOOX: current and recent compact readers, Palma models, Page/Go 7-class readers, Note Air-class devices, Go 10.3, Tab-class devices, and Max-class devices where their native screen dimensions differ.

Models sharing the same native dimensions may share a labeled preset entry, but recognizable model names remain searchable. Preset values are documented in code and verified against manufacturer product or support material where available. Custom dimensions ensure that unlisted and future devices remain supported.

## Delivery Format

The user launches `ereader-image-converter.html` directly from File Explorer. The page has no network calls, server requirement, package installation, analytics, or runtime dependencies. CSS and JavaScript are embedded in the HTML so the tool can be copied as one file.

For automated tests, pure image geometry and pixel-processing functions also live in `web/image-processing.js`. The HTML embeds an equivalent generated build of those functions so direct launch remains self-contained. A repository script verifies that the embedded implementation matches the tested source module, preventing drift.

## User Experience

The interface is a compact desktop-first workspace that remains usable on narrower screens:

1. The user selects or drags an image into the page.
2. The user selects a brand and device model, or selects Custom and enters positive whole-number pixel dimensions.
3. An interactive crop editor displays an aspect-ratio-locked crop rectangle. The user can drag and resize the rectangle within the source image. Corner and edge handles remain visible, keyboard nudging is available, and a reset button restores the largest centered crop.
4. The user chooses Original Color, Optimized Grayscale, or Black & White Dithered output.
5. Brightness, contrast, and sharpness controls provide restrained adjustment and each has a visible neutral value and reset behavior.
6. The page shows the exact output dimensions and a processed preview.
7. The user downloads a PNG whose filename includes the source name, normalized device name, and dimensions.

Changing presets updates the locked aspect ratio while preserving the crop center and as much of the selected source area as possible. The output is portrait by default, with a rotate-dimensions control for devices that may be used in landscape.

## Image Pipeline

Processing happens locally using browser canvas APIs:

1. Decode the selected file and normalize its browser-decoded orientation.
2. Flatten transparent pixels onto white.
3. Map the visible crop rectangle into source-image pixel coordinates.
4. Downsample once to the exact target pixel dimensions using high-quality canvas interpolation. If the input crop is smaller than the target, show a quality warning while still allowing export.
5. Apply brightness and contrast at output resolution.
6. Apply a conservative unsharp mask at output resolution. The default is mild; zero disables it. This avoids exaggerated halos while restoring detail softened by downsampling.
7. Apply the output mode:
   - Original Color keeps RGB output, useful for color e-paper.
   - Optimized Grayscale uses perceptual sRGB luminance rather than the existing Java program's equal-channel average.
   - Black & White Dithered converts perceptual grayscale through Floyd-Steinberg error diffusion.
8. Encode as a full-resolution PNG with no metadata and trigger a local download.

The existing repository directly stretches images to the requested size and averages RGB channels for grayscale. The frontend preserves its local resize-and-convert purpose but intentionally replaces those operations with crop-safe, perceptually weighted, e-ink-oriented processing.

## State and Component Boundaries

The page maintains four explicit state groups: decoded source image, selected device dimensions, crop rectangle in normalized source coordinates, and processing settings. UI event handlers update one state group and schedule a preview render.

Pure functions handle preset lookup, crop constraint math, coordinate conversion, luminance conversion, contrast/brightness adjustment, unsharp masking, dithering, filename construction, and validation. DOM code handles file selection, pointer/keyboard crop interactions, control binding, preview scheduling, announcements, and download creation. Keeping pixel algorithms independent from the DOM makes them deterministic and testable.

Preview rendering is debounced and uses a bounded preview canvas for responsiveness. Export always reruns the same pipeline at the device's exact native resolution rather than enlarging the preview.

## Errors and Accessibility

Before an image is loaded, processing and download controls are disabled. Unsupported or unreadable files produce an inline error and leave the previous valid image intact. Custom dimensions must be whole numbers from 1 through 10,000. Very large decoded images or output buffers produce a clear memory warning instead of freezing the page where the browser exposes the failure.

An undersized crop produces a non-blocking warning that upscaling cannot create missing detail. All controls have visible labels, focus indicators, and keyboard operation. Status and error messages use an ARIA live region. The crop box is not color-only: its boundary, shaded exterior, handles, and focus treatment remain distinguishable in grayscale.

## Testing and Acceptance

Automated unit tests run without network access and verify:

- Every preset has a unique identifier and positive integer native dimensions.
- NOOK GlowLight 4 resolves to 1080 by 1440 pixels.
- Crop rectangles always retain the selected target ratio and stay within image bounds while moving, resizing, resetting, and changing presets.
- Source-coordinate mapping is correct at image edges and after display scaling.
- Perceptual grayscale produces known pixel values.
- Brightness and contrast clamp channels to the valid range.
- Dithering produces only black and white pixels and diffuses error deterministically.
- Sharpening preserves flat-color regions and increases edge contrast without changing dimensions.
- Export sizing exactly matches the selected native dimensions.
- Transparent input is flattened onto white.
- Invalid files and invalid custom dimensions are rejected with actionable messages.
- The embedded processing implementation in the standalone HTML matches the tested source module.

A browser smoke test loads a fixture image, selects NOOK GlowLight 4, adjusts the crop, generates grayscale output, and confirms that the downloadable image is a 1080 by 1440 PNG. Manual acceptance consists of double-clicking the HTML file on Windows with no server running, completing the full workflow, and opening the downloaded PNG to confirm its dimensions.

## Non-Goals

- Extracting covers from EPUB files in the browser.
- Batch conversion.
- Writing files directly onto a connected e-reader.
- Simulating the exact appearance or refresh behavior of every e-ink panel.
- AI enhancement, invented detail, or aggressive upscaling.
