import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = path.join(root, 'ereader-image-converter.html');
const modulePath = path.join(root, 'web', 'image-processing.js');
const startMarker = '/* IMAGE_PROCESSING_START */';
const endMarker = '/* IMAGE_PROCESSING_END */';
const checking = process.argv.slice(2).includes('--check');

const [html, moduleSource] = await Promise.all([
  readFile(htmlPath, 'utf8'),
  readFile(modulePath, 'utf8')
]);

function markerIndex(text, marker) {
  const first = text.indexOf(marker);
  if (first < 0 || first !== text.lastIndexOf(marker)) {
    throw new Error(`Expected exactly one ${marker} marker`);
  }
  return first;
}

const start = markerIndex(html, startMarker);
const end = markerIndex(html, endMarker);
if (end <= start) throw new Error('Image processing markers are out of order');

const newline = html.includes('\r\n') ? '\r\n' : '\n';
const normalizedModule = moduleSource.replace(/\r?\n/g, newline);
const replacement = `${startMarker}${newline}${normalizedModule}${endMarker}`;
const synchronized = `${html.slice(0, start)}${replacement}${html.slice(end + endMarker.length)}`;

if (synchronized === html) {
  console.log('Standalone image processing module is synchronized.');
} else if (checking) {
  console.error('Standalone HTML is out of date; run node scripts/sync-standalone.mjs.');
  process.exitCode = 1;
} else {
  await writeFile(htmlPath, synchronized, 'utf8');
  console.log('Updated embedded image processing module.');
}
