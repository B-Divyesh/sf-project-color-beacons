import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from '@playwright/test';

const productionOrigin = 'https://project-color-beacons.sociobot.in';

async function serveLocalCandidateAtProductionOrigin(page: Page) {
  await page.route(`${productionOrigin}/**`, async (route) => {
    const requested = new URL(route.request().url());
    const localUrl = `http://127.0.0.1:4173${requested.pathname}${requested.search}`;
    const response = await route.fetch({ url: localUrl });
    await route.fulfill({ response });
  });
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
  await expect(page.locator('#config-output')).toContainText('.zed/settings.json');
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

test('@claim:release-signing release publication requires platform signing credentials', async () => {
  const workflow = readFileSync('.github/workflows/release.yml', 'utf8');
  expect(workflow).toContain('Require macOS signing and notarization credentials');
  expect(workflow).toContain('APPLE_CERTIFICATE');
  expect(workflow).toContain('APPLE_SIGNING_IDENTITY');
  expect(workflow).toContain('APPLE_ID');
  expect(workflow).toContain('APPLE_TEAM_ID');
  expect(workflow).toContain('Import Windows signing certificate');
  expect(workflow).toContain('WINDOWS_CERT_PFX');
  expect(workflow).toContain('certificateThumbprint');
  expect(workflow).toContain('unsigned Windows releases are blocked');
  expect(workflow).not.toContain('Unsigned desktop builds');
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

test('@claim:platform-download resolves only signed matching assets for macOS, Windows, and Linux', async ({ browser }) => {
  const fixtures = [
    { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6)', label: 'macOS', asset: 'Project.Color.Beacons_0.1.2_x64.dmg' },
    { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', label: 'Windows', asset: 'Project.Color.Beacons_0.1.2_x64_en-US.msi' },
    { userAgent: 'Mozilla/5.0 (X11; Linux x86_64)', label: 'Linux', asset: 'Project.Color.Beacons_0.1.2_amd64.AppImage' }
  ];
  const release = { tag_name: 'v0.1.2', body: 'Signed and notarized desktop builds. Check SHA256SUMS before installing.', draft: false, prerelease: false, assets: fixtures.map(({ asset }) => ({ name: asset, browser_download_url: `https://github.com/B-Divyesh/sf-project-color-beacons/releases/download/v0.1.2/${asset}` })) };

  for (const fixture of fixtures) {
    const context = await browser.newContext({ userAgent: fixture.userAgent });
    const page = await context.newPage();
    await serveLocalCandidateAtProductionOrigin(page);
    await page.route('https://api.github.com/repos/B-Divyesh/sf-project-color-beacons/releases?per_page=10', (route) => route.fulfill({ json: [release] }));
    await page.route('https://api.sociobot.in/api/v1/products', (route) => route.fulfill({ json: { data: [] } }));
    await page.goto(`${productionOrigin}/`);
    const download = page.getByRole('link', { name: `Download for ${fixture.label}` });
    await expect(download).toHaveAttribute('href', release.assets.find(({ name }) => name === fixture.asset)?.browser_download_url ?? '');
    await context.close();
  }

  const fallbackContext = await browser.newContext({ userAgent: fixtures[2].userAgent });
  const fallbackPage = await fallbackContext.newPage();
  await serveLocalCandidateAtProductionOrigin(fallbackPage);
  await fallbackPage.route('https://api.github.com/repos/B-Divyesh/sf-project-color-beacons/releases?per_page=10', (route) => route.fulfill({ json: [{ ...release, body: 'Unsigned desktop builds.' }] }));
  await fallbackPage.route('https://api.sociobot.in/api/v1/products', (route) => route.fulfill({ json: { data: [] } }));
  await fallbackPage.goto(`${productionOrigin}/`);
  const pending = fallbackPage.locator('#download-button');
  await expect(pending).toHaveText('Signed Linux download pending');
  await expect(pending).not.toHaveAttribute('href', /.+/);
  await expect(pending).toHaveAttribute('aria-disabled', 'true');
  await expect(fallbackPage.getByText('Signed downloads are not published yet. The free browser demo remains available.')).toBeVisible();
  await fallbackContext.close();
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

test('@claim:checkout-availability shows checkout only for an active matching catalogue entry', async ({ browser }) => {
  const unavailableContext = await browser.newContext();
  const unavailableSite = await unavailableContext.newPage();
  await serveLocalCandidateAtProductionOrigin(unavailableSite);
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

test('landing fits a 390 pixel screen and its first action works', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://127.0.0.1:4173/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
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
