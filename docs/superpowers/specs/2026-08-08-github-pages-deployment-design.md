# GitHub Pages Deployment Design

## Goal

Turn the repository into a focused browser-based e-reader image converter, remove the original Java EPUB extractor, and publish the project at `https://ruthvik179.github.io/eink-image-generator/` with a landing page that links to the standalone converter.

## Legacy Removal

Remove the Java/Maven EPUB extractor completely from the current tree:

- Delete `src/`, `pom.xml`, and `HOWTO.md`.
- Remove the Java CLI instructions and references from `README.md` and rename its project heading to E-reader Image Converter.
- Rename the npm package from `epub-cover-extractor` to `eink-image-generator` in `package.json` and `package-lock.json`.
- Remove Java build, JAR, and Eclipse metadata patterns from `.gitignore`, retaining only entries used by the browser converter's Node and local development workflow.

Keep the standalone converter, shared image-processing module, sync script, Node tests, and engineering design and plan documents. Existing Git history will remain intact; this cleanup removes the legacy implementation from the current branch without rewriting published history.

## Deployment Architecture

GitHub Pages will publish from the root of the `master` branch. This avoids a duplicated `docs/` site tree and avoids adding a deployment workflow for two static HTML files. Future pushes to `master` will automatically republish the site.

The public entry points will be:

- `/eink-image-generator/` for the project landing page.
- `/eink-image-generator/ereader-image-converter.html` for the converter.

All links will be relative so the site works under the repository's project-page path rather than assuming a domain root.

## Landing Page

Add a root-level `index.html` that uses the converter's existing visual language without changing the converter itself. The page will contain:

- The project name and a concise description.
- A prominent **Open Image Converter** link to `ereader-image-converter.html`.
- A short feature summary covering device presets, crop and image adjustments, PNG export, and local processing.
- A privacy note explaining that images remain in the browser and are not uploaded.
- A link to the GitHub repository.

The page will be responsive, keyboard accessible, and usable without external fonts, scripts, images, or services.

## Error Handling and Compatibility

The landing page will use only static HTML and CSS, so it remains useful if JavaScript is disabled. The converter link will be a normal anchor and will not depend on client-side routing. Metadata will include a viewport declaration and a descriptive page title.

## Validation

Before publishing:

- Confirm `src/`, `pom.xml`, and `HOWTO.md` are absent.
- Search the remaining product and package metadata for stale `epub-cover-extractor`, Java CLI, and Maven references.
- Run the existing `npm test` suite.
- Check that `index.html` links to the tracked converter file using a relative URL.
- Inspect the local page at desktop and mobile viewport sizes.

After enabling Pages:

- Confirm the Pages API reports a successful deployment.
- Confirm the landing-page URL returns HTTP 200.
- Confirm the converter URL returns HTTP 200 and can be reached from the landing page.

## Scope

This work does not rewrite Git history or remove the retained converter engineering documents. The deployment does not add a custom domain, analytics, a service worker, or a build system. It does not rename or modify the standalone converter.
