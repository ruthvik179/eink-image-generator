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
  assert.doesNotMatch(readme, /\u00e2\u20ac\u201d/u);
  assert.doesNotMatch(gitignore, /\.class|\.jar|^target$|\.classpath|\.project/m);
});
