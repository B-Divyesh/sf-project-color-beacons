/**
 * A browser cannot inspect an Authenticode signature or Apple's notarization
 * ticket. It therefore waits for the release workflow's verification record,
 * as well as complete package, checksum, and GitHub provenance files, before
 * offering any desktop download.
 */
export const VERIFIED_RELEASE_MARKER = 'Verified desktop release.';
export const PROVENANCE_ASSET = 'BUILD-PROVENANCE.sigstore.json';
export const PLATFORM_SIGNATURES_ASSET = 'platform-signatures.json';
export const PLATFORM_STATUS_MARKERS = [
  'Windows signature check: passed.',
  'macOS signing check: passed.',
  'macOS notarization check: passed.'
];

const platformRequirements = {
  macOS: [/x64\.dmg$/i, /aarch64\.dmg$/i],
  windows: [/\.(msi|exe)$/i],
  linux: [/\.AppImage$/i, /\.deb$/i]
};

const platformDownloadPatterns = {
  macOS: /\.(dmg|app\.tar\.gz)$/i,
  windows: /\.(msi|exe)$/i,
  linux: /\.(AppImage|deb)$/i
};

/** @typedef {{ name: string, browser_download_url?: string, digest?: string }} ReleaseAsset */
/** @typedef {{ tag_name: string, target_commitish?: string, body?: string, draft?: boolean, prerelease?: boolean, assets?: ReleaseAsset[] }} Release */

/**
 * @param {Release | undefined} release
 * @returns {string[]}
 */
export function verifiedReleaseIssues(release) {
  if (!release) return ['No release is published.'];
  const issues = [];
  if (release.draft) issues.push('The release is still a draft.');
  if (release.prerelease) issues.push('The release is marked as a prerelease.');
  if (!release.body?.includes(VERIFIED_RELEASE_MARKER)) {
    issues.push('The release does not carry the verified-release marker.');
  }
  for (const marker of PLATFORM_STATUS_MARKERS) {
    if (!release.body?.includes(marker)) issues.push(`Missing release status: ${marker}`);
  }

  const names = new Set((release.assets ?? []).map((asset) => asset.name));
  for (const metadata of ['SHA256SUMS', 'latest.json', PROVENANCE_ASSET, PLATFORM_SIGNATURES_ASSET]) {
    if (!names.has(metadata)) issues.push(`Missing ${metadata}.`);
  }
  for (const [platform, patterns] of Object.entries(platformRequirements)) {
    for (const pattern of patterns) {
      if (![...names].some((name) => pattern.test(name))) {
        issues.push(`Missing ${platform} package matching ${pattern}.`);
      }
    }
  }
  return issues;
}

/** @param {Release | undefined} release */
export function isCompleteVerifiedRelease(release) {
  return verifiedReleaseIssues(release).length === 0;
}

/** @typedef {{ tag: string, githubProvenanceVerified: boolean, platforms: { windows?: { asset: string, authenticodeVerified: boolean }, macOS?: { assets: string[], codeSigned: boolean, notarized: boolean }, linux?: { assets: string[], provenanceVerified: boolean } } }} PlatformSignatureRecord */

/**
 * @param {Release | undefined} release
 * @param {PlatformSignatureRecord | undefined} record
 */
export function platformSignatureIssues(release, record) {
  const issues = verifiedReleaseIssues(release);
  if (issues.length) return issues;
  if (!record) return ['The platform signature record is unavailable.'];
  if (record.tag !== release?.tag_name) issues.push('The platform signature record names a different release.');
  if (record.githubProvenanceVerified !== true) issues.push('GitHub provenance was not verified for the release.');

  const names = new Set((release?.assets ?? []).map((asset) => asset.name));
  const windows = record.platforms?.windows;
  if (!windows?.authenticodeVerified || !windows.asset || !names.has(windows.asset) || !/\.(msi|exe)$/i.test(windows.asset)) {
    issues.push('The Windows Authenticode verification record is incomplete.');
  }

  const macOS = record.platforms?.macOS;
  const expectedMacAssets = [...names].filter((name) => /(?:x64|aarch64)\.dmg$/i.test(name));
  if (!macOS?.codeSigned || !macOS.notarized || !Array.isArray(macOS.assets)
    || expectedMacAssets.some((name) => !macOS.assets.includes(name))) {
    issues.push('The macOS signing and notarization record is incomplete.');
  }

  const linux = record.platforms?.linux;
  const expectedLinuxAssets = [...names].filter((name) => /\.(AppImage|deb)$/i.test(name));
  if (!linux?.provenanceVerified || !Array.isArray(linux.assets)
    || expectedLinuxAssets.some((name) => !linux.assets.includes(name))) {
    issues.push('The Linux provenance record is incomplete.');
  }
  return issues;
}

/** @param {Release | undefined} release @param {PlatformSignatureRecord | undefined} record */
export function isInstallableVerifiedRelease(release, record) {
  return platformSignatureIssues(release, record).length === 0;
}

/**
 * @param {Release} release
 * @param {'macOS' | 'windows' | 'linux'} platform
 */
export function matchingPlatformAsset(release, platform) {
  return release.assets?.find((asset) => platformDownloadPatterns[platform].test(asset.name));
}
