import {
  PROVENANCE_ASSET,
  PLATFORM_SIGNATURES_ASSET,
  VERIFIED_RELEASE_MARKER,
  isCompleteVerifiedRelease,
  isPlatformInstallable,
  platformSignatureIssues,
  verifiedReleaseIssues
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

function decodeStatement(bundle) {
  const payload = bundle?.dsseEnvelope?.payload;
  if (typeof payload !== 'string') throw new Error('A provenance record has no DSSE payload.');
  return JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
}

function statementMatchesSource(statement, name, digest, release) {
  const subjectMatches = statement.subject?.some((subject) => subject.name === name && subject.digest?.sha256 === digest);
  const source = JSON.stringify(statement.predicate ?? {});
  return subjectMatches
    && statement.predicateType === 'https://slsa.dev/provenance/v1'
    && source.includes(`https://github.com/${repository}`)
    && source.includes('.github/workflows/release.yml')
    && source.includes(`refs/tags/${release.tag_name}`)
    && Boolean(release.target_commitish)
    && source.includes(release.target_commitish);
}

try {
  const release = requestedTag
    ? await getJson(`${apiRoot}/releases/tags/${encodeURIComponent(requestedTag)}`)
    : (await getJson(`${apiRoot}/releases/latest`));
  const issues = verifiedReleaseIssues(release);
  if (issues.length) throw new Error(issues.join(' '));
  if (!isCompleteVerifiedRelease(release)) throw new Error('The release is not complete.');

  const assets = new Map(release.assets.map((asset) => [asset.name, asset]));
  const sumsAsset = assets.get('SHA256SUMS');
  const manifestAsset = assets.get('latest.json');
  const provenanceAsset = assets.get(PROVENANCE_ASSET);
  const platformSignaturesAsset = assets.get(PLATFORM_SIGNATURES_ASSET);
  if (!sumsAsset?.browser_download_url || !manifestAsset?.browser_download_url || !provenanceAsset?.browser_download_url || !platformSignaturesAsset?.browser_download_url) {
    throw new Error('Release metadata does not have downloadable URLs.');
  }
  const [sumsText, manifest, publishedBundle, platformSignatures] = await Promise.all([
    fetch(sumsAsset.browser_download_url).then(async (response) => {
      if (!response.ok) throw new Error(`Could not download SHA256SUMS (${response.status}).`);
      return response.text();
    }),
    fetch(manifestAsset.browser_download_url).then(async (response) => {
      if (!response.ok) throw new Error(`Could not download latest.json (${response.status}).`);
      return response.json();
    }),
    fetch(provenanceAsset.browser_download_url).then(async (response) => {
      if (!response.ok) throw new Error(`Could not download ${PROVENANCE_ASSET} (${response.status}).`);
      return response.json();
    }),
    fetch(platformSignaturesAsset.browser_download_url).then(async (response) => {
      if (!response.ok) throw new Error(`Could not download ${PLATFORM_SIGNATURES_ASSET} (${response.status}).`);
      return response.json();
    })
  ]);
  const platformIssues = platformSignatureIssues(release, platformSignatures);
  if (platformIssues.length) throw new Error(platformIssues.join(' '));
  const installability = Object.fromEntries(
    ['macOS', 'windows', 'linux'].map((platform) => [
      platform,
      isPlatformInstallable(release, platformSignatures, platform) ? 'installable' : 'withheld'
    ])
  );
  const checksums = parseChecksums(sumsText);
  const packageAssets = release.assets.filter((asset) => !['SHA256SUMS', 'latest.json', PROVENANCE_ASSET, PLATFORM_SIGNATURES_ASSET].includes(asset.name));
  const publishedStatement = decodeStatement(publishedBundle);
  for (const asset of packageAssets) {
    const expected = checksums.get(asset.name);
    if (!expected) throw new Error(`SHA256SUMS has no entry for ${asset.name}.`);
    if (asset.digest && asset.digest !== `sha256:${expected}`) {
      throw new Error(`GitHub digest disagrees with SHA256SUMS for ${asset.name}.`);
    }
    if (!statementMatchesSource(publishedStatement, asset.name, expected, release)) {
      throw new Error(`${PROVENANCE_ASSET} does not bind ${asset.name} to this release source.`);
    }
    const attestationResponse = await getJson(`${apiRoot}/attestations/${encodeURIComponent(`sha256:${expected}`)}`);
    const trustedRecord = attestationResponse.attestations?.some((attestation) => {
      try { return statementMatchesSource(decodeStatement(attestation.bundle), asset.name, expected, release); }
      catch { return false; }
    });
    if (!trustedRecord) throw new Error(`GitHub has no matching source attestation for ${asset.name}.`);
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
    attestation: VERIFIED_RELEASE_MARKER,
    source: `${repository}/.github/workflows/release.yml@refs/tags/${release.tag_name}`,
    platformTrust: platformSignatures.platforms,
    installability,
    packages: packageAssets.map((asset) => asset.name),
    result: 'pass'
  }, null, 2));
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
