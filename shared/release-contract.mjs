/**
 * Every published package is tied to this repository, workflow, commit, and
 * tag by GitHub provenance. Platform trust is evaluated separately so an
 * absent Apple or Windows certificate cannot block a verified Linux package.
 */
export const VERIFIED_RELEASE_MARKER = 'Source-verified desktop release.';
export const PROVENANCE_ASSET = 'BUILD-PROVENANCE.sigstore.json';
export const PLATFORM_SIGNATURES_ASSET = 'platform-signatures.json';
export const PLATFORM_STATUS_MARKERS = {
  linux: { verified: 'Linux provenance check: passed.' },
  windows: {
    verified: 'Windows Authenticode check: passed.',
    unavailable: 'Windows Authenticode check: unavailable.'
  },
  macOS: {
    verified: 'macOS signing and notarization check: passed.',
    unavailable: 'macOS signing and notarization check: unavailable.'
  }
};

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
  if (!release.body?.includes(PLATFORM_STATUS_MARKERS.linux.verified)) {
    issues.push(`Missing release status: ${PLATFORM_STATUS_MARKERS.linux.verified}`);
  }
  for (const platform of ['windows', 'macOS']) {
    const markers = PLATFORM_STATUS_MARKERS[platform];
    const statusCount = [markers.verified, markers.unavailable].filter((marker) => release.body?.includes(marker)).length;
    if (statusCount !== 1) issues.push(`The release must carry exactly one ${platform} trust status.`);
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
  if (typeof windows?.authenticodeVerified !== 'boolean' || !windows.asset || !names.has(windows.asset) || !/\.(msi|exe)$/i.test(windows.asset)) {
    issues.push('The Windows signing status record is incomplete.');
  }

  const macOS = record.platforms?.macOS;
  const expectedMacAssets = [...names].filter((name) => /(?:x64|aarch64)\.dmg$/i.test(name));
  if (typeof macOS?.codeSigned !== 'boolean' || typeof macOS?.notarized !== 'boolean' || !Array.isArray(macOS.assets)
    || expectedMacAssets.some((name) => !macOS.assets.includes(name))) {
    issues.push('The macOS signing status record is incomplete.');
  }

  const linux = record.platforms?.linux;
  const expectedLinuxAssets = [...names].filter((name) => /\.(AppImage|deb)$/i.test(name));
  if (!linux?.provenanceVerified || !Array.isArray(linux.assets)
    || expectedLinuxAssets.some((name) => !linux.assets.includes(name))) {
    issues.push('The Linux provenance record is incomplete.');
  }
  if (windows && release?.body?.includes(PLATFORM_STATUS_MARKERS.windows.verified) !== windows.authenticodeVerified) {
    issues.push('The Windows release status disagrees with its signing record.');
  }
  const macVerified = macOS?.codeSigned === true && macOS?.notarized === true;
  if (macOS && release?.body?.includes(PLATFORM_STATUS_MARKERS.macOS.verified) !== macVerified) {
    issues.push('The macOS release status disagrees with its signing record.');
  }
  return issues;
}

/** @param {Release | undefined} release @param {PlatformSignatureRecord | undefined} record */
export function isInstallableVerifiedRelease(release, record) {
  return platformSignatureIssues(release, record).length === 0;
}

/**
 * @param {Release | undefined} release
 * @param {PlatformSignatureRecord | undefined} record
 * @param {'macOS' | 'windows' | 'linux'} platform
 */
export function platformInstallabilityIssues(release, record, platform) {
  const issues = platformSignatureIssues(release, record);
  if (issues.length) return issues;
  if (platform === 'windows' && record?.platforms.windows?.authenticodeVerified !== true) {
    issues.push('The Windows package does not have a verified Authenticode signature.');
  }
  if (platform === 'macOS' && (record?.platforms.macOS?.codeSigned !== true || record.platforms.macOS.notarized !== true)) {
    issues.push('The macOS packages are not signed and notarized.');
  }
  if (platform === 'linux' && record?.platforms.linux?.provenanceVerified !== true) {
    issues.push('The Linux package does not have verified GitHub provenance.');
  }
  return issues;
}

/** @param {Release | undefined} release @param {PlatformSignatureRecord | undefined} record @param {'macOS' | 'windows' | 'linux'} platform */
export function isPlatformInstallable(release, record, platform) {
  return platformInstallabilityIssues(release, record, platform).length === 0;
}

/** @param {Release | undefined} release @param {'macOS' | 'windows' | 'linux'} platform */
export function releaseMarksPlatformVerified(release, platform) {
  if (!isCompleteVerifiedRelease(release)) return false;
  return release.body?.includes(PLATFORM_STATUS_MARKERS[platform].verified) === true;
}

/**
 * @param {Release} release
 * @param {'macOS' | 'windows' | 'linux'} platform
 */
export function matchingPlatformAsset(release, platform) {
  return release.assets?.find((asset) => platformDownloadPatterns[platform].test(asset.name));
}
