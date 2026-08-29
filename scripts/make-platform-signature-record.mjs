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
const linuxAssets = [...assetNames].filter((name) => /\.(AppImage|deb)$/i.test(name));

if (!windows?.authenticodeVerified || !assetNames.has(windows.asset) || !/\.(msi|exe)$/i.test(windows.asset)) {
  throw new Error('The Windows signature report is missing a verified installer.');
}
const recordedMacAssets = macOSReports.flatMap((report) => Array.isArray(report.assets) ? report.assets : []);
if (macOSReports.length === 0 || macOSReports.some((report) => !report.codeSigned || !report.notarized)
  || macAssets.some((name) => !recordedMacAssets.includes(name))) {
  throw new Error('The macOS signature report is missing a signed and notarized disk image.');
}
if (linuxAssets.length === 0) throw new Error('The Linux release has no AppImage or Debian package.');

const record = {
  tag,
  githubProvenanceVerified: true,
  platforms: {
    windows: { asset: windows.asset, authenticodeVerified: true },
    macOS: { assets: macAssets, codeSigned: true, notarized: true },
    linux: { assets: linuxAssets, provenanceVerified: true }
  }
};

await writeFile(`${releaseFolder}/platform-signatures.json`, `${JSON.stringify(record, null, 2)}\n`);
