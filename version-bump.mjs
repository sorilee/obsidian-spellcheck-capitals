import { readFileSync, writeFileSync } from 'node:fs';

const MANIFEST_PATH = 'manifest.json';
const VERSIONS_PATH = 'versions.json';

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

const targetVersion = process.env.npm_package_version;

if (!targetVersion) {
  throw new Error(
    'npm_package_version is missing. Run this script via `npm version ...` so npm provides the target version.',
  );
}

const manifest = readJson(MANIFEST_PATH);

if (typeof manifest.minAppVersion !== 'string' || manifest.minAppVersion.trim() === '') {
  throw new Error('manifest.json must define a non-empty minAppVersion before bumping the plugin version.');
}

manifest.version = targetVersion;
writeJson(MANIFEST_PATH, manifest);

const versions = readJson(VERSIONS_PATH);
const minAppVersion = manifest.minAppVersion;

// Obsidian only needs a versions.json entry when a new minAppVersion is introduced.
if (!Object.values(versions).includes(minAppVersion)) {
  versions[targetVersion] = minAppVersion;
  writeJson(VERSIONS_PATH, versions);
}
