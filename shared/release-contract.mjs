/**
 * The landing page cannot inspect platform signatures in a browser. It can,
 * however, refuse to advertise a package until the release job has published
 * its signed-release attestation, checksums, manifest, and every supported
 * platform artifact. The post-publish verifier performs the network checks
 * against those same requirements before a release is handed off.
 */
export const SIGNED_RELEASE_ATTESTATION = 'Signed and notarized desktop builds.';

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
/** @typedef {{ tag_name: string, body?: string, draft?: boolean, prerelease?: boolean, assets?: ReleaseAsset[] }} Release */

/**
 * @param {Release | undefined} release
 * @returns {string[]}
 */
export function signedReleaseIssues(release) {
  if (!release) return ['No release is published.'];
  const issues = [];
  if (release.draft) issues.push('The release is still a draft.');
  if (release.prerelease) issues.push('The release is marked as a prerelease.');
  if (!release.body?.includes(SIGNED_RELEASE_ATTESTATION)) {
    issues.push('The release does not carry the signed-build attestation.');
  }

  const names = new Set((release.assets ?? []).map((asset) => asset.name));
  for (const metadata of ['SHA256SUMS', 'latest.json']) {
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
export function isInstallableSignedRelease(release) {
  return signedReleaseIssues(release).length === 0;
}

/**
 * @param {Release} release
 * @param {'macOS' | 'windows' | 'linux'} platform
 */
export function matchingPlatformAsset(release, platform) {
  return release.assets?.find((asset) => platformDownloadPatterns[platform].test(asset.name));
}
