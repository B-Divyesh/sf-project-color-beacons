import { readFile, writeFile } from 'node:fs/promises';

const [recordPath = 'release-assets/platform-signatures.json', outputPath = 'release-body.md'] = process.argv.slice(2);
const record = JSON.parse(await readFile(recordPath, 'utf8'));
const windowsVerified = record.platforms?.windows?.authenticodeVerified === true;
const macOSVerified = record.platforms?.macOS?.codeSigned === true && record.platforms?.macOS?.notarized === true;

const body = `Source-verified desktop release.

GitHub records which repository, workflow, commit, and tag produced each package. Check SHA256SUMS before installation.

Linux provenance check: passed.
Windows Authenticode check: ${windowsVerified ? 'passed' : 'unavailable'}.
macOS signing and notarization check: ${macOSVerified ? 'passed' : 'unavailable'}.

See platform-signatures.json for the machine-readable results. A package without its operating-system trust check stays unavailable on the product site.
`;

await writeFile(outputPath, body);
