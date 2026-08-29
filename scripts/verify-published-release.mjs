import { createHash } from 'node:crypto';
import {
  SIGNED_RELEASE_ATTESTATION,
  isInstallableSignedRelease,
  signedReleaseIssues
} from '../shared/release-contract.mjs';

const repository = process.env.RELEASE_REPOSITORY ?? 'B-Divyesh/sf-project-color-beacons';
const requestedTag = process.env.RELEASE_TAG;
const apiRoot = process.env.RELEASE_API_ROOT ?? `https://api.github.com/repos/${repository}`;
const headers = { Accept: 'application/vnd.github+json' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

function fail(message) {
  console.error(`Release verification failed: ${message}`);
  process.exitCode = 1;
}

async function getJson(url) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return response.json();
}

function parseChecksums(text) {
  const checksums = new Map();
  for (const line of text.trim().split(/\r?\n/)) {
    const match = line.match(/^([a-f0-9]{64})  (.+)$/i);
    if (!match) throw new Error(`Invalid SHA256SUMS line: ${line}`);
    checksums.set(match[2], match[1].toLowerCase());
  }
  return checksums;
}

try {
  const release = requestedTag
    ? await getJson(`${apiRoot}/releases/tags/${encodeURIComponent(requestedTag)}`)
    : (await getJson(`${apiRoot}/releases/latest`));
  const issues = signedReleaseIssues(release);
  if (issues.length) throw new Error(issues.join(' '));
  if (!isInstallableSignedRelease(release)) throw new Error('The release is not installable.');

  const assets = new Map(release.assets.map((asset) => [asset.name, asset]));
  const sumsAsset = assets.get('SHA256SUMS');
  const manifestAsset = assets.get('latest.json');
  if (!sumsAsset?.browser_download_url || !manifestAsset?.browser_download_url) {
    throw new Error('Release metadata does not have downloadable URLs.');
  }
  const [sumsText, manifest] = await Promise.all([
    fetch(sumsAsset.browser_download_url).then(async (response) => {
      if (!response.ok) throw new Error(`Could not download SHA256SUMS (${response.status}).`);
      return response.text();
    }),
    fetch(manifestAsset.browser_download_url).then(async (response) => {
      if (!response.ok) throw new Error(`Could not download latest.json (${response.status}).`);
      return response.json();
    })
  ]);
  const checksums = parseChecksums(sumsText);
  const packageAssets = release.assets.filter((asset) => !['SHA256SUMS', 'latest.json'].includes(asset.name));
  for (const asset of packageAssets) {
    const expected = checksums.get(asset.name);
    if (!expected) throw new Error(`SHA256SUMS has no entry for ${asset.name}.`);
    if (asset.digest && asset.digest !== `sha256:${expected}`) {
      throw new Error(`GitHub digest disagrees with SHA256SUMS for ${asset.name}.`);
    }
  }
  const expectedVersion = release.tag_name.replace(/^v/, '');
  if (manifest.version !== expectedVersion || manifest.tag !== release.tag_name) {
    throw new Error('latest.json does not describe this release tag.');
  }
  for (const platform of ['macos', 'windows', 'linux']) {
    if (!Array.isArray(manifest.platforms?.[platform]) || manifest.platforms[platform].length === 0) {
      throw new Error(`latest.json has no ${platform} package.`);
    }
    for (const entry of manifest.platforms[platform]) {
      if (!assets.has(entry.name)) throw new Error(`latest.json references missing asset ${entry.name}.`);
    }
  }
  console.log(JSON.stringify({
    repository,
    tag: release.tag_name,
    attestation: SIGNED_RELEASE_ATTESTATION,
    packages: packageAssets.map((asset) => asset.name),
    result: 'pass'
  }, null, 2));
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
