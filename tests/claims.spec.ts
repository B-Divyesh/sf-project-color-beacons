import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { execFileSync } from 'node:child_process';

test('@claim:three-cues every sample project has a color, name, and symbol', async ({ page }) => {
  await page.goto('/demo');
  const atlas = page.locator('.demo-project').filter({ hasText: 'Atlas API' });
  await expect(atlas.getByLabel(/Fjord, half moon/)).toBeVisible();
  await atlas.getByRole('button', { name: 'Check project' }).click();
  const strip = page.locator('#demo-confirmation');
  await expect(strip).toContainText('Atlas API');
  await expect(strip).toContainText('Fjord');
  await expect(strip.getByLabel(/Fjord, half moon/)).toBeVisible();
});

test('@claim:confirmation-before-write editor output appears only after confirmation', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('.demo-project').filter({ hasText: 'Atlas API' }).getByRole('button', { name: 'Check project' }).click();
  await expect(page.locator('#config-output')).toBeEmpty();
  await page.getByRole('button', { name: 'Confirm Atlas API' }).click();
  await expect(page.getByRole('heading', { name: 'Editor files ready for Atlas API' })).toBeVisible();
  await expect(page.locator('#config-output')).toContainText('.vscode/settings.json');
  await expect(page.locator('#config-output')).toContainText('.zed/settings.json');
  await expect(page.locator('#config-output')).toContainText('titleBar.activeBackground');
});

test('@claim:demo-isolated demo uses no real project storage or outside requests', async ({ page }) => {
  const outsideRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') outsideRequests.push(request.url());
  });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Check project' }).first().click();
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys.some((key) => key.startsWith('demo:'))).toBe(true);
  expect(keys).not.toContain('pcb:projects');
  expect(outsideRequests).toEqual([]);
});

test('@claim:offline-reload demo reloads offline after its first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Check a project before you edit.' })).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByText('Atlas API')).toBeVisible();
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
  await page.goto('http://127.0.0.1:1420');
  await page.getByRole('button', { name: 'Add project' }).click();
  await expect(page.getByRole('heading', { name: 'Use unlimited projects' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buy a $24 license' })).toHaveAttribute('href', /api\.sociobot\.in/);
  await context.close();
});

test('@claim:settings-preserved editor JSON merge keeps unrelated values', async () => {
  const output = execFileSync('cargo', ['test', '--manifest-path', 'src-tauri/Cargo.toml', '--no-default-features', 'claim_settings_preserved'], { encoding: 'utf8' });
  expect(output).toContain('test result: ok');
});

test('routes have accessible structure and no serious Axe findings', async ({ page }) => {
  for (const path of ['/', '/demo', '/privacy', '/terms', '/missing-page']) {
    const errors: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
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

test('desktop interface demo is keyboard-ready and accessible', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1100, height: 800 } });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('http://127.0.0.1:1420/?demo=1');
  await expect(page.locator('h1')).toHaveCount(1);
  await page.locator('.project-card').filter({ hasText: 'Atlas API' }).getByRole('button', { name: 'Check project' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Confirm Atlas API' })).toBeVisible();
  await page.keyboard.press('Tab');
  await page.getByRole('button', { name: 'Confirm Atlas API' }).click();
  await expect(page.getByRole('heading', { name: 'Editor files for Atlas API' })).toBeVisible();
  await page.getByRole('button', { name: 'Close editor preview' }).click();
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  expect(errors).toEqual([]);
  await context.close();
});
