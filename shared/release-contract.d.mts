export type ReleasePlatform = 'macOS' | 'windows' | 'linux';

export type ReleaseAsset = {
  name: string;
  browser_download_url?: string;
  digest?: string;
};

export type Release = {
  tag_name: string;
  target_commitish?: string;
  body?: string;
  draft?: boolean;
  prerelease?: boolean;
  assets?: ReleaseAsset[];
};

export const VERIFIED_RELEASE_MARKER: string;
export const PROVENANCE_ASSET: string;
export const PLATFORM_SIGNATURES_ASSET: string;
export const PLATFORM_PROVENANCE_MARKERS: Record<ReleasePlatform, string>;
export const PLATFORM_STATUS_MARKERS: Record<ReleasePlatform, { verified: string; unavailable?: string }>;
export type PlatformSignatureRecord = {
  tag: string;
  githubProvenanceVerified: boolean;
  platforms: {
    windows?: { assets: string[]; provenanceVerified: boolean; authenticodeVerified: boolean };
    macOS?: { assets: string[]; provenanceVerified: boolean; codeSigned: boolean; notarized: boolean };
    linux?: { assets: string[]; provenanceVerified: boolean };
  };
};
export function verifiedReleaseIssues(release: Release | undefined): string[];
export function isCompleteVerifiedRelease(release: Release | undefined): release is Release;
export function platformSignatureIssues(release: Release | undefined, record: PlatformSignatureRecord | undefined): string[];
export function isInstallableVerifiedRelease(release: Release | undefined, record: PlatformSignatureRecord | undefined): release is Release;
export function platformInstallabilityIssues(release: Release | undefined, record: PlatformSignatureRecord | undefined, platform: ReleasePlatform): string[];
export function isPlatformInstallable(release: Release | undefined, record: PlatformSignatureRecord | undefined, platform: ReleasePlatform): release is Release;
export function releaseMarksPlatformVerified(release: Release | undefined, platform: ReleasePlatform): release is Release;
export function matchingPlatformAsset(release: Release, platform: ReleasePlatform): ReleaseAsset | undefined;
