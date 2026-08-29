export type ReleasePlatform = 'macOS' | 'windows' | 'linux';

export type ReleaseAsset = {
  name: string;
  browser_download_url?: string;
  digest?: string;
};

export type Release = {
  tag_name: string;
  body?: string;
  draft?: boolean;
  prerelease?: boolean;
  assets?: ReleaseAsset[];
};

export const SIGNED_RELEASE_ATTESTATION: string;
export const PROVENANCE_ASSET: string;
export function signedReleaseIssues(release: Release | undefined): string[];
export function isInstallableSignedRelease(release: Release | undefined): release is Release;
export function matchingPlatformAsset(release: Release, platform: ReleasePlatform): ReleaseAsset | undefined;
