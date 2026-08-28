import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';

const [folder = 'release-assets', tag = 'v0.1.0'] = process.argv.slice(2);
const repository = process.env.GITHUB_REPOSITORY ?? 'B-Divyesh/sf-project-color-beacons';
const ignored = new Set(['SHA256SUMS', 'latest.json']);
const files = (await readdir(folder)).filter((name) => !ignored.has(name)).sort();
const sums = [];
const platforms = { macos: [], windows: [], linux: [] };

for (const name of files) {
  const bytes = await readFile(`${folder}/${name}`);
  sums.push(`${createHash('sha256').update(bytes).digest('hex')}  ${name}`);
  const url = `https://github.com/${repository}/releases/download/${tag}/${encodeURIComponent(basename(name))}`;
  if (/\.(dmg|app\.tar\.gz)$/i.test(name)) platforms.macos.push({ name, url });
  if (/\.(msi|exe|nsis\.zip)$/i.test(name)) platforms.windows.push({ name, url });
  if (/\.(AppImage|deb)$/i.test(name)) platforms.linux.push({ name, url });
}

await writeFile(`${folder}/SHA256SUMS`, `${sums.join('\n')}\n`);
await writeFile(`${folder}/latest.json`, `${JSON.stringify({ version: tag.replace(/^v/, ''), tag, platforms }, null, 2)}\n`);
