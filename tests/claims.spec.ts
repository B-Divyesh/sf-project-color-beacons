import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Locator, Page } from '@playwright/test';
import { verify, type Bundle } from 'sigstore';
import { APP_VERSION, BUILD_DATE } from '../shared/build-info.mjs';
import {
  isCompleteVerifiedRelease,
  isInstallableVerifiedRelease,
  isPlatformInstallable,
  platformInstallabilityIssues,
  platformSignatureIssues,
  verifiedReleaseIssues,
  type PlatformSignatureRecord,
  type Release
} from '../shared/release-contract.mjs';

const productionOrigin = 'https://project-color-beacons.sociobot.in';

function verifiedReleaseFixture(overrides: Partial<Release> = {}): Release {
  const assets = [
    'Project.Color.Beacons_0.1.2_x64.dmg',
    'Project.Color.Beacons_0.1.2_aarch64.dmg',
    'Project.Color.Beacons_0.1.2_x64_en-US.msi',
    'Project.Color.Beacons_0.1.2_amd64.AppImage',
    'Project.Color.Beacons_0.1.2_amd64.deb',
    'SHA256SUMS',
    'latest.json',
    'BUILD-PROVENANCE.sigstore.json',
    'platform-signatures.json'
  ].map((name) => ({ name, browser_download_url: `https://github.com/B-Divyesh/sf-project-color-beacons/releases/download/v0.1.2/${name}` }));
  return {
    tag_name: 'v0.1.2',
    target_commitish: '0fcfb94c1d96581214396223658ce0b2d1d6b82c',
    body: 'Source-verified desktop release. Linux provenance check: passed. Windows Authenticode check: passed. macOS signing and notarization check: passed.',
    draft: false,
    prerelease: false,
    assets,
    ...overrides
  };
}

async function routePlatformStatus(page: Page, record = platformSignatureFixture()) {
  await page.route('**/platform-signatures.json', (route) => route.fulfill({ json: record }));
}

function platformSignatureFixture(overrides: Partial<PlatformSignatureRecord> = {}): PlatformSignatureRecord {
  return {
    tag: 'v0.1.2',
    githubProvenanceVerified: true,
    platforms: {
      windows: { asset: 'Project.Color.Beacons_0.1.2_x64_en-US.msi', authenticodeVerified: true },
      macOS: {
        assets: ['Project.Color.Beacons_0.1.2_x64.dmg', 'Project.Color.Beacons_0.1.2_aarch64.dmg'],
        codeSigned: true,
        notarized: true
      },
      linux: {
        assets: ['Project.Color.Beacons_0.1.2_amd64.AppImage', 'Project.Color.Beacons_0.1.2_amd64.deb'],
        provenanceVerified: true
      }
    },
    ...overrides
  };
}

async function serveLocalCandidateAtProductionOrigin(page: Page) {
  await page.route(`${productionOrigin}/**`, async (route) => {
    const requested = new URL(route.request().url());
    const localUrl = `http://127.0.0.1:4173${requested.pathname}${requested.search}`;
    const response = await route.fetch({ url: localUrl });
    await route.fulfill({ response });
  });
}

async function expectMinimumTouchTarget(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
}

test('@claim:three-cues every sample project has a color, name, and symbol', async ({ page }) => {
  await page.goto('/demo');
  const samples = [
    { name: 'Atlas API', beacon: 'Fjord', symbol: 'half moon' },
    { name: 'Northwind Store', beacon: 'Ember', symbol: 'cross' },
    { name: 'Launch Docs', beacon: 'Iris', symbol: 'arch' }
  ];

  for (const sample of samples) {
    const project = page.locator('.demo-project').filter({ hasText: sample.name });
    await expect(project.getByText(sample.name, { exact: true })).toBeVisible();
    await expect(project.getByLabel(`${sample.beacon}, ${sample.symbol}`)).toBeVisible();
    await project.getByRole('button', { name: `Check ${sample.name}` }).click();

    const strip = page.locator('#demo-confirmation');
    await expect(strip).toContainText(sample.name);
    await expect(strip).toContainText(sample.beacon);
    await expect(strip.getByLabel(`${sample.beacon}, ${sample.symbol}`)).toBeVisible();
  }
});

test('@claim:confirmation-before-write editor output appears only after confirmation', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Check Northwind Store' }).click();
  await expect(page.locator('#config-output')).toBeEmpty();
  await page.getByRole('button', { name: 'Confirm Northwind Store' }).click();
  await expect(page.getByRole('heading', { name: 'Editor files ready for Northwind Store' })).toBeVisible();
  await expect(page.locator('#config-output')).toContainText('.vscode/settings.json');
  await expect(page.locator('#config-output')).not.toContainText('.zed/settings.json');
  await expect(page.locator('#config-output')).toContainText('titleBar.activeBackground');
});

test('@claim:demo-isolated demo uses no real project storage or outside requests', async ({ page, browser }) => {
  const outsideRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') outsideRequests.push(request.url());
  });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Check Atlas API' }).click();
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys.some((key) => key.startsWith('demo:'))).toBe(true);
  expect(keys).not.toContain('pcb:projects');
  expect(outsideRequests).toEqual([]);

  const desktopContext = await browser.newContext();
  await desktopContext.addInitScript(() => localStorage.setItem('pcb:projects', 'real-project-sentinel'));
  const desktop = await desktopContext.newPage();
  await desktop.goto('http://127.0.0.1:1420/?demo=1');
  await expect(desktop.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(desktop.locator('#confirmation-area')).toContainText('Confirmed');
  await expect(desktop.locator('#confirmation-area')).toContainText('Atlas API');
  await desktop.getByRole('button', { name: 'Check Northwind Store' }).click();
  await desktop.getByRole('button', { name: 'Reset demo' }).click();
  await expect(desktop.locator('#confirmation-area')).toContainText('Atlas API');
  expect(await desktop.evaluate(() => localStorage.getItem('pcb:projects'))).toBe('real-project-sentinel');
  expect(await desktop.evaluate(() => localStorage.getItem('demo:pcb:projects'))).not.toBeNull();
  await desktopContext.close();
});

test('@claim:demo-disposal Start for real discards both sample workspaces', async ({ browser }) => {
  const siteContext = await browser.newContext();
  const site = await siteContext.newPage();
  await site.goto('http://127.0.0.1:4173/demo');
  await site.getByRole('button', { name: 'Check Northwind Store' }).click();
  await expect(site.locator('#demo-confirmation')).toContainText('Check before editing · Northwind Store');
  await expect.poll(() => site.evaluate(() => localStorage.getItem('demo:pcb:site-state'))).not.toBeNull();
  await site.getByRole('link', { name: 'Start for real' }).click();
  await expect(site).toHaveURL('http://127.0.0.1:4173/#download');
  expect(await site.evaluate(() => localStorage.getItem('demo:pcb:site-state'))).toBeNull();
  await site.goto('http://127.0.0.1:4173/demo');
  await expect(site.locator('#demo-confirmation')).toContainText('Confirmed · Atlas API');
  await expect(site.getByRole('heading', { name: 'Editor files ready for Atlas API' })).toBeVisible();
  await siteContext.close();

  const desktopContext = await browser.newContext();
  const desktop = await desktopContext.newPage();
  await desktop.goto('http://127.0.0.1:1420/?demo=1');
  await desktop.getByRole('button', { name: 'Check Northwind Store' }).click();
  await expect(desktop.getByRole('button', { name: 'Confirm Northwind Store' })).toBeVisible();
  expect(await desktop.evaluate(() => localStorage.getItem('demo:pcb:projects'))).not.toBeNull();
  await desktop.getByRole('link', { name: 'Start for real' }).click();
  await expect(desktop).toHaveURL('http://127.0.0.1:1420/');
  expect(await desktop.evaluate(() => localStorage.getItem('demo:pcb:projects'))).toBeNull();
  await desktopContext.close();
});

test('@claim:offline-reload demo reloads offline after its first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Check a project before you edit.' })).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByText('Atlas API', { exact: true })).toBeVisible();
});

test('@claim:demo-reset Reset demo restores the completed sample workspace', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Check Northwind Store' }).click();
  await page.getByRole('button', { name: 'Confirm Northwind Store' }).click();
  await expect(page.getByRole('heading', { name: 'Editor files ready for Northwind Store' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#demo-confirmation')).toContainText('Confirmed · Atlas API');
  await expect(page.getByRole('heading', { name: 'Editor files ready for Atlas API' })).toBeVisible();
  await expect(page.locator('.demo-project')).toHaveCount(3);
  await expect(page.locator('#demo-status')).toHaveText('Demo reset to the completed Atlas API sample.');
});

test('@claim:free-project-limit fourth project opens the license choice', async ({ browser }) => {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    localStorage.setItem('pcb:projects', JSON.stringify([
      { id: '1', name: 'One', path: '/one', beaconId: 'fjord', editors: [], createdAt: 1 },
      { id: '2', name: 'Two', path: '/two', beaconId: 'ember', editors: [], createdAt: 2 },
      { id: '3', name: 'Three', path: '/three', beaconId: 'iris', editors: [], createdAt: 3 }
    ]));
  });
  const page = await context.newPage();
  await page.route('**/api/v1/products/project-color-beacons/verify?license=fixture-license', (route) => route.fulfill({ json: { valid: true } }));
  await page.goto('http://127.0.0.1:1420');
  const freeProject = page.locator('.project-card').filter({ hasText: 'One' });
  await expect(freeProject.getByRole('heading', { name: 'One' })).toBeVisible();
  await expect(freeProject.getByLabel('Fjord beacon, half moon symbol')).toBeVisible();
  await freeProject.getByRole('button', { name: 'Check One' }).click();
  await expect(page.locator('#confirmation-area')).toContainText('One · ◒ Fjord');
  await page.getByRole('button', { name: 'Confirm One' }).click();
  await expect(page.getByRole('heading', { name: 'Editor files for One' })).toBeVisible();
  await page.getByRole('button', { name: 'Close editor preview' }).click();
  await page.getByRole('button', { name: 'Add project' }).click();
  await expect(page.getByRole('heading', { name: 'Use unlimited projects' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'the Project Color Beacons site' })).toHaveAttribute('href', /#download$/);
  await page.locator('#license-key').fill('fixture-license');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByText('License active. You can add unlimited projects.')).toBeVisible();
  await page.getByRole('button', { name: 'Add project' }).click();
  await expect(page.getByRole('heading', { name: 'Add a project' })).toBeVisible();
  await context.close();
});

test('@claim:beacon-stability saved cues remain unchanged when the app reopens', async ({ browser }) => {
  const context = await browser.newContext();
  let page = await context.newPage();
  await page.goto('http://127.0.0.1:1420/?demo=1');
  await page.getByRole('button', { name: 'Add project' }).click();
  await page.getByRole('button', { name: 'Save project beacon' }).click();
  let project = page.locator('.project-card').filter({ hasText: 'Payments Worker' });
  await expect(project.getByRole('heading', { name: 'Payments Worker' })).toBeVisible();
  await expect(project.getByLabel('Saffron beacon, three waves symbol')).toBeVisible();
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('demo:pcb:projects') ?? '[]')
    .find((item: { name: string }) => item.name === 'Payments Worker'));
  await page.close();

  page = await context.newPage();
  await page.goto('http://127.0.0.1:1420/?demo=1');
  project = page.locator('.project-card').filter({ hasText: 'Payments Worker' });
  await expect(project.getByRole('heading', { name: 'Payments Worker' })).toBeVisible();
  await expect(project.getByLabel('Saffron beacon, three waves symbol')).toBeVisible();
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('demo:pcb:projects') ?? '[]')
    .find((item: { name: string }) => item.name === 'Payments Worker'));
  expect(after).toEqual(before);
  await context.close();
});

test('@claim:release-manifest release metadata includes checksums and platform files', async () => {
  const folder = mkdtempSync(join(tmpdir(), 'pcb-release-'));
  try {
    writeFileSync(join(folder, 'Project.Color.Beacons_0.1.2_x64.dmg'), 'mac');
    writeFileSync(join(folder, 'Project.Color.Beacons_0.1.2_x64_en-US.msi'), 'windows');
    writeFileSync(join(folder, 'Project.Color.Beacons_0.1.2_amd64.AppImage'), 'linux');
    execFileSync('node', ['scripts/make-release-manifest.mjs', folder, 'v0.1.2'], { cwd: process.cwd() });
    const sums = readFileSync(join(folder, 'SHA256SUMS'), 'utf8');
    expect(sums.trim().split('\n')).toHaveLength(3);
    expect(sums).toContain('Project.Color.Beacons_0.1.2_x64.dmg');
    expect(sums).toContain('Project.Color.Beacons_0.1.2_x64_en-US.msi');
    expect(sums).toContain('Project.Color.Beacons_0.1.2_amd64.AppImage');
    const manifest = JSON.parse(readFileSync(join(folder, 'latest.json'), 'utf8')) as { version: string; platforms: Record<string, unknown[]> };
    expect(manifest.version).toBe('0.1.2');
    expect(manifest.platforms.macos).toHaveLength(1);
    expect(manifest.platforms.windows).toHaveLength(1);
    expect(manifest.platforms.linux).toHaveLength(1);
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});

test('@claim:release-signing recorded GitHub provenance cryptographically verifies the repository workflow commit and tag', async () => {
  const encodedBundle = readFileSync('tests/fixtures/release-v0.1.2-provenance.base64', 'utf8').trim();
  const bundle = JSON.parse(Buffer.from(encodedBundle, 'base64').toString('utf8')) as Bundle & {
    dsseEnvelope: { payload: string; signatures: Array<{ sig: string }> };
  };
  const sourceIdentity = 'https://github.com/B-Divyesh/sf-project-color-beacons/.github/workflows/release.yml@refs/tags/v0.1.2';
  const signer = await verify(bundle, Buffer.alloc(0), {
    certificateIssuer: 'https://token.actions.githubusercontent.com',
    certificateIdentityURI: `^${sourceIdentity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`
  });
  expect(signer.identity?.subjectAlternativeName).toBe(sourceIdentity);

  const statement = JSON.parse(Buffer.from(bundle.dsseEnvelope.payload, 'base64').toString('utf8')) as {
    predicateType: string;
    subject: Array<{ name: string; digest: { sha256: string } }>;
    predicate: { buildDefinition: { externalParameters: { workflow: { repository: string; path: string; ref: string } }; resolvedDependencies: Array<{ digest: { gitCommit: string } }> } };
  };
  expect(statement.predicateType).toBe('https://slsa.dev/provenance/v1');
  expect(statement.subject).toContainEqual({
    name: 'Project.Color.Beacons_0.1.2_x64_en-US.msi',
    digest: { sha256: 'cde46e9f59b3a5a0956df1dceed2458c0de2f897dfb6da4c53fc383cc72d4aa8' }
  });
  expect(statement.predicate.buildDefinition.externalParameters.workflow).toEqual({
    repository: 'https://github.com/B-Divyesh/sf-project-color-beacons',
    path: '.github/workflows/release.yml',
    ref: 'refs/tags/v0.1.2'
  });
  expect(statement.predicate.buildDefinition.resolvedDependencies).toContainEqual({
    uri: 'git+https://github.com/B-Divyesh/sf-project-color-beacons@refs/tags/v0.1.2',
    digest: { gitCommit: '0fcfb94c1d96581214396223658ce0b2d1d6b82c' }
  });

  const altered = structuredClone(bundle) as typeof bundle;
  const signature = altered.dsseEnvelope.signatures[0]!.sig;
  altered.dsseEnvelope.signatures[0]!.sig = `${signature[0] === 'A' ? 'B' : 'A'}${signature.slice(1)}`;
  await expect(verify(altered, Buffer.alloc(0), {
    certificateIssuer: 'https://token.actions.githubusercontent.com',
    certificateIdentityURI: `^${sourceIdentity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`
  })).rejects.toThrow();
});

test('@claim:release-matrix release workflow targets macOS, Windows, and Linux packages', async () => {
  const workflow = readFileSync('.github/workflows/release.yml', 'utf8');
  expect(workflow).toContain('platform: ubuntu-latest');
  expect(workflow).toContain('platform: windows-latest');
  expect(workflow.match(/platform: macos-latest/g)).toHaveLength(2);
  expect(workflow).toContain('target: x86_64-apple-darwin');
  expect(workflow).toContain('target: aarch64-apple-darwin');
  expect(workflow).toContain('tauri-apps/tauri-action@v0');
});

test('release workflow records absent platform credentials without claiming that packages are signed', async () => {
  const workflow = readFileSync('.github/workflows/release.yml', 'utf8');
  expect(workflow).toContain('the package will be recorded as unsigned');
  expect(workflow).toContain(`if [ "\${APPLE_SIGNING_CONFIGURED}" = 'true' ]; then`);
  expect(workflow).toContain('Get-AuthenticodeSignature');
  expect(workflow).toContain('Notarized Developer ID');
  expect(workflow).toContain('platform-signatures.json');
  expect(workflow).not.toContain('Windows signature check: passed.');
});

test('shell installer saves the portable provenance bundle with a GitHub CLI-supported extension', async () => {
  const installer = readFileSync('site/public/install.sh', 'utf8');
  expect(installer).toContain('project-color-beacons-provenance.XXXXXX.json');
  expect(installer).toContain('gh attestation verify "$destination" --repo "$repo" --bundle "$provenance"');
});

test('@claim:platform-download resolves only complete verified matching assets for macOS, Windows, and Linux', async ({ browser }) => {
  const fixtures = [
    { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6)', label: 'macOS', asset: 'Project.Color.Beacons_0.1.2_x64.dmg' },
    { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', label: 'Windows', asset: 'Project.Color.Beacons_0.1.2_x64_en-US.msi' },
    { userAgent: 'Mozilla/5.0 (X11; Linux x86_64)', label: 'Linux', asset: 'Project.Color.Beacons_0.1.2_amd64.AppImage' }
  ];
  const release = verifiedReleaseFixture();

  for (const fixture of fixtures) {
    const context = await browser.newContext({ userAgent: fixture.userAgent });
    const page = await context.newPage();
    await serveLocalCandidateAtProductionOrigin(page);
    await page.route('https://api.github.com/repos/B-Divyesh/sf-project-color-beacons/releases?per_page=10', (route) => route.fulfill({ json: [release] }));
    await routePlatformStatus(page);
    await page.route('https://api.sociobot.in/api/v1/products', (route) => route.fulfill({ json: { data: [] } }));
    await page.goto(`${productionOrigin}/`);
    const download = page.getByRole('link', { name: `Download for ${fixture.label}` });
    await expect(download).toHaveAttribute('href', release.assets?.find(({ name }) => name === fixture.asset)?.browser_download_url ?? '');
    await context.close();
  }

  const fallbackContext = await browser.newContext({ userAgent: fixtures[2].userAgent });
  const fallbackPage = await fallbackContext.newPage();
  await serveLocalCandidateAtProductionOrigin(fallbackPage);
  await fallbackPage.route('https://api.github.com/repos/B-Divyesh/sf-project-color-beacons/releases?per_page=10', (route) => route.fulfill({ json: [{ ...release, body: 'Unverified desktop builds.' }] }));
  await fallbackPage.route('https://api.sociobot.in/api/v1/products', (route) => route.fulfill({ json: { data: [] } }));
  await fallbackPage.goto(`${productionOrigin}/`);
  const pending = fallbackPage.locator('#download-button');
  await expect(pending).toHaveText('Verified Linux download pending');
  await expect(pending).not.toHaveAttribute('href', /.+/);
  await expect(pending).toHaveAttribute('aria-disabled', 'true');
  await expect(fallbackPage.getByText('A verified Linux download is not published yet. The free browser demo remains available.')).toBeVisible();
  await fallbackContext.close();
  const incomplete = verifiedReleaseFixture({
    assets: verifiedReleaseFixture().assets?.filter((asset) => !['Project.Color.Beacons_0.1.2_aarch64.dmg', 'SHA256SUMS', 'BUILD-PROVENANCE.sigstore.json', 'platform-signatures.json'].includes(asset.name))
  });
  expect(isCompleteVerifiedRelease(incomplete)).toBe(false);
  expect(verifiedReleaseIssues(incomplete)).toEqual(expect.arrayContaining([
    'Missing SHA256SUMS.',
    'Missing BUILD-PROVENANCE.sigstore.json.',
    'Missing platform-signatures.json.',
    expect.stringContaining('aarch64')
  ]));
  expect(isCompleteVerifiedRelease(verifiedReleaseFixture())).toBe(true);
});

test('@claim:platform-signatures gates each desktop package on its own verified trust record', async ({ browser }) => {
  const release = verifiedReleaseFixture();
  const record = platformSignatureFixture();
  expect(platformSignatureIssues(release, record)).toEqual([]);
  expect(isInstallableVerifiedRelease(release, record)).toBe(true);
  expect(isPlatformInstallable(release, record, 'windows')).toBe(true);
  expect(isPlatformInstallable(release, record, 'macOS')).toBe(true);
  expect(isPlatformInstallable(release, record, 'linux')).toBe(true);

  const linuxOnly = structuredClone(record);
  linuxOnly.platforms.windows!.authenticodeVerified = false;
  linuxOnly.platforms.macOS!.codeSigned = false;
  linuxOnly.platforms.macOS!.notarized = false;
  const linuxOnlyRelease = verifiedReleaseFixture({
    body: 'Source-verified desktop release. Linux provenance check: passed. Windows Authenticode check: unavailable. macOS signing and notarization check: unavailable.'
  });
  expect(platformSignatureIssues(linuxOnlyRelease, linuxOnly)).toEqual([]);
  expect(isPlatformInstallable(linuxOnlyRelease, linuxOnly, 'linux')).toBe(true);
  expect(platformInstallabilityIssues(linuxOnlyRelease, linuxOnly, 'windows')).toContain('The Windows package does not have a verified Authenticode signature.');
  expect(platformInstallabilityIssues(linuxOnlyRelease, linuxOnly, 'macOS')).toContain('The macOS packages are not signed and notarized.');

  const releaseFolder = mkdtempSync(join(tmpdir(), 'pcb-platform-release-'));
  const reportFolder = mkdtempSync(join(tmpdir(), 'pcb-platform-reports-'));
  try {
    for (const asset of release.assets ?? []) writeFileSync(join(releaseFolder, asset.name), 'fixture');
    writeFileSync(join(reportFolder, 'windows.json'), JSON.stringify(linuxOnly.platforms.windows));
    writeFileSync(join(reportFolder, 'mac-x64.json'), JSON.stringify({
      platform: 'macOS',
      assets: ['Project.Color.Beacons_0.1.2_x64.dmg'],
      codeSigned: false,
      notarized: false
    }));
    writeFileSync(join(reportFolder, 'mac-arm.json'), JSON.stringify({
      platform: 'macOS',
      assets: ['Project.Color.Beacons_0.1.2_aarch64.dmg'],
      codeSigned: false,
      notarized: false
    }));
    const windowsReport = JSON.parse(readFileSync(join(reportFolder, 'windows.json'), 'utf8')) as { platform?: string };
    windowsReport.platform = 'windows';
    writeFileSync(join(reportFolder, 'windows.json'), JSON.stringify(windowsReport));
    execFileSync('node', ['scripts/make-platform-signature-record.mjs', releaseFolder, reportFolder, 'v0.1.2'], { cwd: process.cwd() });
    const generated = JSON.parse(readFileSync(join(releaseFolder, 'platform-signatures.json'), 'utf8')) as PlatformSignatureRecord;
    expect(generated.platforms.windows?.authenticodeVerified).toBe(false);
    expect(generated.platforms.macOS).toMatchObject({ codeSigned: false, notarized: false });
    expect(generated.platforms.linux?.provenanceVerified).toBe(true);
    execFileSync('node', [
      'scripts/make-release-body.mjs',
      join(releaseFolder, 'platform-signatures.json'),
      join(releaseFolder, 'release-body.md')
    ], { cwd: process.cwd() });
    expect(readFileSync(join(releaseFolder, 'release-body.md'), 'utf8')).toContain([
      'Linux provenance check: passed.',
      'Windows Authenticode check: unavailable.',
      'macOS signing and notarization check: unavailable.'
    ].join('\n'));
  } finally {
    rmSync(releaseFolder, { recursive: true, force: true });
    rmSync(reportFolder, { recursive: true, force: true });
  }

  for (const fixture of [
    { userAgent: 'Mozilla/5.0 (X11; Linux x86_64)', allowed: true, label: 'Linux' },
    { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', allowed: false, label: 'Windows' },
    { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6)', allowed: false, label: 'macOS' }
  ]) {
    const context = await browser.newContext({ userAgent: fixture.userAgent });
    const page = await context.newPage();
    await serveLocalCandidateAtProductionOrigin(page);
    await page.route('https://api.github.com/repos/B-Divyesh/sf-project-color-beacons/releases?per_page=10', (route) => route.fulfill({ json: [linuxOnlyRelease] }));
    await routePlatformStatus(page, linuxOnly);
    await page.route('https://api.sociobot.in/api/v1/products', (route) => route.fulfill({ json: { data: [] } }));
    await page.goto(`${productionOrigin}/`);
    if (fixture.allowed) {
      await expect(page.getByRole('link', { name: `Download for ${fixture.label}` })).toHaveAttribute('href', /\.AppImage$/);
    } else {
      await expect(page.locator('#download-button')).toHaveText(`Verified ${fixture.label} download pending`);
      await expect(page.locator('#download-button')).not.toHaveAttribute('href', /.+/);
    }
    await context.close();
  }

  const incomplete = structuredClone(record) as unknown as {
    tag: string;
    githubProvenanceVerified: boolean;
    platforms: { windows: { asset: string; authenticodeVerified?: boolean } };
  };
  delete incomplete.platforms.windows.authenticodeVerified;
  expect(platformSignatureIssues(release, incomplete as unknown as PlatformSignatureRecord)).toContain('The Windows signing status record is incomplete.');
});

test('@claim:settings-preserved editor JSON merge keeps unrelated values', async () => {
  const output = execFileSync('cargo', ['test', '--manifest-path', 'src-tauri/Cargo.toml', '--no-default-features', 'claim_settings_preserved'], { encoding: 'utf8' });
  expect(output).toContain('test result: ok');
});

test('@claim:editor-settings Rust core writes the supported VS Code, Cursor, and Zed settings', async () => {
  const output = execFileSync('cargo', ['test', '--manifest-path', 'src-tauri/Cargo.toml', '--no-default-features', 'claim_supported_editor_settings'], { encoding: 'utf8' });
  expect(output).toContain('test result: ok');
});

test('@claim:project-data-local normal desktop use sends no project data to another origin', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const outsideRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:1420') outsideRequests.push(request.url());
  });
  await page.goto('http://127.0.0.1:1420/?demo=1');
  await page.getByRole('button', { name: 'Check Atlas API' }).click();
  await page.getByRole('button', { name: 'Confirm Atlas API' }).click();
  await expect(page.getByRole('heading', { name: 'Editor files for Atlas API' })).toBeVisible();
  expect(outsideRequests).toEqual([]);
  await context.close();
});

test('@claim:license-token-only sends only the pasted license value when verifying', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  let verificationUrl = '';
  let verificationBody: string | null = 'not-called';
  await page.route('**/api/v1/products/project-color-beacons/verify*', (route) => {
    verificationUrl = route.request().url();
    verificationBody = route.request().postData();
    return route.fulfill({ json: { valid: false } });
  });
  await page.goto('http://127.0.0.1:1420');
  await page.getByRole('button', { name: 'License' }).click();
  await page.locator('#license-key').fill('fixture-license');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByText('This license is not active.')).toBeVisible();
  expect(verificationUrl).toBe('https://api.sociobot.in/api/v1/products/project-color-beacons/verify?license=fixture-license');
  expect(verificationBody).toBeNull();
  await context.close();
});

test('@claim:checkout-availability shows checkout only for an active matching catalogue entry and verified desktop release', async ({ browser }) => {
  const unavailableContext = await browser.newContext();
  const unavailableSite = await unavailableContext.newPage();
  await serveLocalCandidateAtProductionOrigin(unavailableSite);
  await unavailableSite.route('https://api.github.com/repos/B-Divyesh/sf-project-color-beacons/releases?per_page=10', (route) => route.fulfill({ json: [verifiedReleaseFixture()] }));
  await routePlatformStatus(unavailableSite);
  await unavailableSite.route('https://api.sociobot.in/api/v1/products', (route) => route.fulfill({
    json: { data: [{ slug: 'another-product', checkout_url: 'https://example.test/checkout', price_minor: 999, currency: 'USD' }] }
  }));
  await unavailableSite.goto(`${productionOrigin}/`);
  await expect(unavailableSite.getByText('License purchases are being prepared.')).toBeVisible();
  await expect(unavailableSite.locator('a[href*="/checkout"]')).toHaveCount(0);

  const availableContext = await browser.newContext();
  const availableSite = await availableContext.newPage();
  await serveLocalCandidateAtProductionOrigin(availableSite);
  const checkoutUrl = 'https://api.sociobot.in/api/v1/products/project-color-beacons/checkout';
  await availableSite.route('https://api.github.com/repos/B-Divyesh/sf-project-color-beacons/releases?per_page=10', (route) => route.fulfill({ json: [verifiedReleaseFixture()] }));
  await routePlatformStatus(availableSite);
  await availableSite.route('https://api.sociobot.in/api/v1/products', (route) => route.fulfill({
    json: { data: [
      { slug: 'another-product', checkout_url: 'https://example.test/checkout', price_minor: 999, currency: 'USD' },
      { slug: 'project-color-beacons', checkout_url: checkoutUrl, price_minor: 2400, currency: 'USD' }
    ] }
  }));
  await availableSite.goto(`${productionOrigin}/`);
  await expect(availableSite.getByRole('link', { name: 'Buy a $24 license' })).toHaveAttribute('href', checkoutUrl);
  await expect(availableSite.getByText('$24 one-time · unlimited projects')).toBeVisible();
  await expect(availableSite.locator('a[href*="/checkout"]')).toHaveCount(1);

  const unsignedContext = await browser.newContext();
  const unsignedSite = await unsignedContext.newPage();
  await serveLocalCandidateAtProductionOrigin(unsignedSite);
  await unsignedSite.route('https://api.github.com/repos/B-Divyesh/sf-project-color-beacons/releases?per_page=10', (route) => route.fulfill({ json: [verifiedReleaseFixture({ body: 'Unverified desktop builds.' })] }));
  await unsignedSite.route('https://api.sociobot.in/api/v1/products', (route) => route.fulfill({ json: { data: [
    { slug: 'project-color-beacons', checkout_url: checkoutUrl, price_minor: 2400, currency: 'USD' }
  ] } }));
  await unsignedSite.goto(`${productionOrigin}/`);
  await expect(unsignedSite.locator('a[href*="/checkout"]')).toHaveCount(0);
  await expect(unsignedSite.getByText('License purchases open with a verified package for this platform.')).toBeVisible();

  const appContext = await browser.newContext();
  await appContext.addInitScript(() => {
    localStorage.setItem('pcb:projects', JSON.stringify([
      { id: '1', name: 'One', path: '/one', beaconId: 'fjord', editors: [], createdAt: 1 },
      { id: '2', name: 'Two', path: '/two', beaconId: 'ember', editors: [], createdAt: 2 },
      { id: '3', name: 'Three', path: '/three', beaconId: 'iris', editors: [], createdAt: 3 }
    ]));
  });
  const desktop = await appContext.newPage();
  await desktop.goto('http://127.0.0.1:1420');
  await desktop.getByRole('button', { name: 'Add project' }).click();
  await expect(desktop.getByRole('link', { name: 'the Project Color Beacons site' })).toBeVisible();
  await expect(desktop.locator('a[href*="/checkout"]')).toHaveCount(0);
  await unavailableContext.close();
  await availableContext.close();
  await unsignedContext.close();
  await appContext.close();
});

test('routes have accessible structure, complete metadata, and no Axe findings', async ({ page }) => {
  for (const path of ['/', '/demo', '/?demo=1', '/privacy', '/terms', '/missing-page', '/404.html']) {
    const errors: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveCount(1);
    await expect(page.getByRole('link', { name: 'Skip to content' })).toHaveCount(1);
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toHaveCount(1);
    await expect(page.getByRole('navigation', { name: 'Footer navigation' })).toHaveCount(1);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations).toEqual([]);
    expect(errors).toEqual([]);
  }
});

test('the landing page and both 404 responses use the same generated build identity', async ({ page }) => {
  const versions: string[] = [];
  for (const path of ['/', '/404.html', '/missing-page']) {
    await page.goto(path);
    versions.push((await page.locator('.footer-meta').innerText()).replace(/^.*Version /, 'Version '));
  }
  expect(new Set(versions)).toEqual(new Set([`Version ${APP_VERSION} · Build ${BUILD_DATE}`]));
});

test('dark landing page has no Axe violations, including the privacy boundaries', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'dark' });
  const page = await context.newPage();
  await page.goto('/');
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations).toEqual([]);
  await context.close();
});

test('landing fits a 390 pixel screen and its first action works', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://127.0.0.1:4173/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  const priceFact = page.getByText('Three projects are free; unlimited projects cost $24 once.');
  await expect(priceFact).toBeVisible();
  const priceFactBox = await priceFact.boundingBox();
  expect(priceFactBox && priceFactBox.y + priceFactBox.height).toBeLessThanOrEqual(844);
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await page.close();
});

test('one-click mobile demo opens with a completed result and full sample row', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://127.0.0.1:4173/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.locator('#demo-confirmation')).toContainText('Confirmed · Atlas API');
  await expect(page.getByRole('heading', { name: 'Editor files ready for Atlas API' })).toBeVisible();
  const atlas = page.locator('.demo-project').filter({ hasText: 'Atlas API' });
  await expect(atlas).toBeVisible();
  const box = await atlas.boundingBox();
  expect(box && box.y + box.height).toBeLessThanOrEqual(844);
  await page.goto('http://127.0.0.1:4173/?demo=1');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('#demo-confirmation')).toContainText('Confirmed · Atlas API');
  await page.close();
});

test('SPA Back and Forward restore focus and each history entry scroll position', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 600 } });
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, 1800));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1700);
  const landingScroll = await page.evaluate(() => window.scrollY);
  await page.evaluate(() => (document.querySelector<HTMLAnchorElement>('a[href="/demo"]') as HTMLAnchorElement).click());
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.locator('h1')).toBeFocused();
  await page.evaluate(() => window.scrollTo(0, 300));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(250);
  const demoScroll = await page.evaluate(() => window.scrollY);
  await page.goBack();
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
  await expect(page.locator('h1')).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(landingScroll - 2);
  await page.goForward();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.locator('h1')).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(demoScroll - 2);
  await page.close();
});

test('demo project controls have unique accessible names', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('button', { name: 'Check Atlas API' })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Check Northwind Store' })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Check Launch Docs' })).toHaveCount(1);
});

test('desktop interface fits its 390 pixel minimum window', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://127.0.0.1:1420/?demo=1');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('#confirmation-area')).toContainText('Atlas API');
  await page.close();
});

test('site demo and desktop UI reflow at 390 pixels with 200 percent text after confirming the longest sample', async ({ browser }) => {
  const cases = [
    { url: 'http://127.0.0.1:4173/demo', expected: 'Completed sample and projects' },
    { url: 'http://127.0.0.1:1420/?demo=1', expected: 'Project beacons' }
  ];
  for (const item of cases) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(item.url);
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    await page.getByRole('button', { name: 'Check Northwind Store' }).click();
    await page.getByRole('button', { name: 'Confirm Northwind Store' }).click();
    if (item.url.includes(':1420')) {
      await page.getByRole('button', { name: 'Close editor preview' }).click();
    }
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    await expect(page.getByText(item.expected, { exact: true })).toBeVisible();
    const confirmationParts = item.url.includes(':1420')
      ? page.locator('.confirmation > *')
      : page.locator('.demo-confirmation > *');
    const boxes = await confirmationParts.evaluateAll((elements) => elements.map((element) => {
      const box = element.getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
    }));
    for (let index = 0; index < boxes.length; index += 1) {
      expect(boxes[index].left).toBeGreaterThanOrEqual(0);
      expect(boxes[index].right).toBeLessThanOrEqual(390);
      for (let other = index + 1; other < boxes.length; other += 1) {
        const overlaps = boxes[index].left < boxes[other].right
          && boxes[index].right > boxes[other].left
          && boxes[index].top < boxes[other].bottom
          && boxes[index].bottom > boxes[other].top;
        expect(overlaps).toBe(false);
      }
    }
    await page.close();
  }
});

test('desktop demo previews only the editor selected for a newly saved project', async ({ browser }) => {
  for (const selectedEditor of ['VS Code and Cursor', 'Zed']) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:1420/?demo=1');
    await page.getByRole('button', { name: 'Add project' }).click();
    await page.getByLabel('Project name').fill(`${selectedEditor} Project`);
    await page.getByRole('button', { name: 'Choose folder' }).click();
    const unselectedEditor = selectedEditor === 'VS Code and Cursor' ? 'Zed' : 'VS Code and Cursor';
    await page.getByLabel(unselectedEditor, { exact: true }).uncheck();
    await page.getByRole('button', { name: 'Save project beacon' }).click();
    await page.getByRole('button', { name: `Check ${selectedEditor} Project` }).click();
    await page.getByRole('button', { name: `Confirm ${selectedEditor} Project` }).click();
    const dialog = page.locator('#preview-dialog');
    const expectedFile = selectedEditor === 'VS Code and Cursor' ? '.vscode/settings.json' : '.zed/settings.json';
    const unexpectedFile = selectedEditor === 'VS Code and Cursor' ? '.zed/settings.json' : '.vscode/settings.json';
    await expect(dialog.locator('h3').filter({ hasText: expectedFile })).toBeVisible();
    await expect(dialog.getByText(unexpectedFile, { exact: true })).toHaveCount(0);
    await context.close();
  }
});

test('mobile demo, settings, and footer controls have 44 pixel targets', async ({ browser }) => {
  const site = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await site.goto('http://127.0.0.1:4173/demo');
  await expectMinimumTouchTarget(site.getByRole('button', { name: 'Reset demo' }));
  await expectMinimumTouchTarget(site.getByRole('link', { name: 'Start for real' }));
  await expectMinimumTouchTarget(site.getByText('View settings', { exact: true }));
  for (const footerLink of await site.locator('.site-footer a').all()) await expectMinimumTouchTarget(footerLink);
  await site.close();

  const desktop = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await desktop.goto('http://127.0.0.1:1420/?demo=1');
  await expectMinimumTouchTarget(desktop.getByRole('button', { name: 'Reset demo' }));
  await expectMinimumTouchTarget(desktop.getByRole('link', { name: 'Start for real' }));
  await desktop.close();
});

test('desktop interface demo is keyboard-ready and accessible', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1100, height: 800 } });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('http://127.0.0.1:1420/?demo=1');
  await expect(page.locator('h1')).toHaveCount(1);
  await page.getByRole('button', { name: 'Check Atlas API' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Confirm Atlas API' })).toBeVisible();
  await page.keyboard.press('Tab');
  await page.getByRole('button', { name: 'Confirm Atlas API' }).click();
  await expect(page.getByRole('heading', { name: 'Editor files for Atlas API' })).toBeVisible();
  await page.getByRole('button', { name: 'Close editor preview' }).click();
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations).toEqual([]);
  expect(errors).toEqual([]);
  await context.close();
});
