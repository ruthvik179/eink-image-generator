const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'ereader-image-converter.html');
const modulePath = path.join(root, 'web', 'image-processing.js');
const scriptPath = path.join(root, 'scripts', 'sync-standalone.mjs');
const startMarker = '/* IMAGE_PROCESSING_START */';
const endMarker = '/* IMAGE_PROCESSING_END */';

function runCheck(repositoryRoot = root) {
  return spawnSync(process.execPath, [path.join(repositoryRoot, 'scripts', 'sync-standalone.mjs'), '--check'], {
    cwd: repositoryRoot,
    encoding: 'utf8'
  });
}

function count(text, fragment) {
  return text.split(fragment).length - 1;
}

test('standalone artifact is self-contained and --check rejects embedded module drift', async () => {
  const [moduleSource, originalHtml] = await Promise.all([
    readFile(modulePath, 'utf8'),
    readFile(htmlPath, 'utf8')
  ]);
  const newline = originalHtml.includes('\r\n') ? '\r\n' : '\n';
  const normalizedModule = moduleSource.replace(/\r?\n/g, newline);
  const expectedBlock = `${startMarker}${newline}${normalizedModule}${endMarker}`;

  assert.equal(count(originalHtml, startMarker), 1, 'start marker must appear once');
  assert.equal(count(originalHtml, endMarker), 1, 'end marker must appear once');
  assert.ok(originalHtml.includes(expectedBlock), 'embedded module must exactly match its source file');
  assert.doesNotMatch(
    originalHtml,
    /\b(?:src|href)\s*=\s*["']https?:\/\//i,
    'standalone HTML must not load runtime resources from the network'
  );

  const synchronized = runCheck();
  assert.equal(synchronized.status, 0, synchronized.stderr || synchronized.stdout);

  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'standalone-sync-'));
  try {
    await Promise.all([
      mkdir(path.join(temporaryRoot, 'scripts')),
      mkdir(path.join(temporaryRoot, 'web'))
    ]);
    await Promise.all([
      copyFile(scriptPath, path.join(temporaryRoot, 'scripts', 'sync-standalone.mjs')),
      copyFile(modulePath, path.join(temporaryRoot, 'web', 'image-processing.js'))
    ]);
    const driftedHtml = originalHtml.replace(normalizedModule, `${normalizedModule}/* deliberate drift */${newline}`);
    assert.notEqual(driftedHtml, originalHtml, 'test setup must create drift');
    await writeFile(path.join(temporaryRoot, 'ereader-image-converter.html'), driftedHtml, 'utf8');
    const drifted = runCheck(temporaryRoot);
    assert.notEqual(drifted.status, 0, '--check must fail when the embedded module has drifted');
    assert.match(drifted.stderr, /out of date|drift/i);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
