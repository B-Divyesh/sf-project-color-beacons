import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const [releaseFolder = 'release-assets', reportFolder = 'signature-reports', tag = 'v0.1.0'] = process.argv.slice(2);

async function collectJsonFiles(folder) {
  const entries = await readdir(folder, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => entry.isDirectory()
    ? collectJsonFiles(join(folder, entry.name))
    : entry.name.endsWith('.json') ? [join(folder, entry.name)] : []));
  return files.flat();
}

const assetNames = new Set(await readdir(releaseFolder));
const reportFiles = await collectJsonFiles(reportFolder);
const reports = await Promise.all(reportFiles.map(async (file) => JSON.parse(await readFile(file, 'utf8'))));
const findReport = (platform) => reports.find((report) => report.platform === platform);
const windows = findReport('windows');
const macOSReports = reports.filter((report) => report.platform === 'macOS');
const macAssets = [...assetNames].filter((name) => /(?:x64|aarch64)\.dmg$/i.test(name));
const windowsAssets = [...assetNames].filter((name) => /\.(msi|exe)$/i.test(name));
const linuxAssets = [...assetNames].filter((name) => /\.(AppImage|deb)$/i.test(name));
const canonicalBundleName = (name) => name.normalize('NFKC').replace(/[^a-z0-9]+/gi, '').toLowerCase();
const resolveReportedAsset = (reportedName, releaseAssets) => {
  if (typeof reportedName !== 'string') return undefined;
  const canonicalName = canonicalBundleName(reportedName);
  const matches = releaseAssets.filter((name) => canonicalBundleName(name) === canonicalName);
  return matches.length === 1 ? matches[0] : undefined;
};
const reportedWindowsAssets = Array.isArray(windows?.assets) ? windows.assets : [];
const resolvedWindowsAssets = reportedWindowsAssets.map((name) => resolveReportedAsset(name, windowsAssets));

if (typeof windows?.authenticodeVerified !== 'boolean' || resolvedWindowsAssets.some((name) => !name)
  || resolvedWindowsAssets.length !== windowsAssets.length || windowsAssets.some((name) => !resolvedWindowsAssets.includes(name))) {
  throw new Error('The Windows signing report is missing an installer status.');
}
const recordedMacAssets = macOSReports.flatMap((report) => Array.isArray(report.assets) ? report.assets : []);
const resolvedMacAssets = recordedMacAssets.map((name) => resolveReportedAsset(name, macAssets));
if (macOSReports.length !== 2 || macOSReports.some((report) => typeof report.codeSigned !== 'boolean' || typeof report.notarized !== 'boolean')
  || resolvedMacAssets.some((name) => !name) || resolvedMacAssets.length !== macAssets.length
  || macAssets.some((name) => !resolvedMacAssets.includes(name))) {
  throw new Error('The macOS signing reports are missing disk-image statuses.');
}
if (linuxAssets.length === 0) throw new Error('The Linux release has no AppImage or Debian package.');

const record = {
  tag,
  githubProvenanceVerified: true,
  platforms: {
    windows: { assets: resolvedWindowsAssets, provenanceVerified: true, authenticodeVerified: windows.authenticodeVerified },
    macOS: {
      assets: macAssets,
      provenanceVerified: true,
      codeSigned: macOSReports.every((report) => report.codeSigned),
      notarized: macOSReports.every((report) => report.notarized)
    },
    linux: { assets: linuxAssets, provenanceVerified: true }
  }
};

await writeFile(`${releaseFolder}/platform-signatures.json`, `${JSON.stringify(record, null, 2)}\n`);
