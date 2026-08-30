import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { APP_VERSION, BUILD_DATE } from '../shared/build-info.mjs';

const origin = 'https://project-color-beacons.sociobot.in';
const browser = await chromium.launch();

try {
  const routes = [
    ['/', 'Project Color Beacons — Mark the right project', 200],
    ['/demo', 'Demo — Project Color Beacons', 200],
    ['/privacy', 'Privacy — Project Color Beacons', 200],
    ['/terms', 'Terms — Project Color Beacons', 200],
    ['/404.html', 'Page not found — Project Color Beacons', 200],
    ['/missing-live-check', 'Page not found — Project Color Beacons', 404]
  ];

  for (const [path, title, status] of routes) {
    const routeContext = await browser.newContext();
    const page = await routeContext.newPage();
    const errors = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
    assert.equal(response?.status(), status, `${path} must return HTTP ${status}`);
    assert.equal(await page.title(), title);
    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    assert.equal(await page.locator('main').count(), 1);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('img:not([alt])').count(), 0);
    assert.equal(await page.locator('meta[name="description"]').count(), 1);
    assert.equal(await page.locator('link[rel="canonical"]').count(), 1);
    assert.equal(await page.locator('meta[property="og:title"]').count(), 1);
    assert.equal(await page.locator('meta[name="twitter:card"]').count(), 1);
    assert.equal(await page.getByRole('navigation', { name: 'Main navigation' }).count(), 1);
    assert.equal(await page.getByRole('navigation', { name: 'Footer navigation' }).count(), 1);
    assert.match(await page.locator('.footer-meta').innerText(), new RegExp(`Version ${APP_VERSION.replaceAll('.', '\\.')} · Build ${BUILD_DATE.replaceAll('.', '\\.')}`));
    const axe = await new AxeBuilder({ page }).analyze();
    assert.deepEqual(axe.violations, []);
    const unexpectedErrors = path === '/missing-live-check'
      ? errors.filter((message) => !/Failed to load resource: the server responded with a status of 404/.test(message))
      : errors;
    assert.deepEqual(unexpectedErrors, [], `${path} must have no unexpected console or page errors`);
    await routeContext.close();
  }

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobile = await mobileContext.newPage();
  const demoRequests = [];
  mobile.on('request', (request) => demoRequests.push(request.url()));
  await mobile.goto(`${origin}/demo`, { waitUntil: 'networkidle' });
  assert.ok((await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 1);
  assert.match(await mobile.locator('#demo-confirmation').innerText(), /Confirmed · Atlas API/);
  assert.match(await mobile.locator('#config-output').innerText(), /Editor files ready for Atlas API/);
  const atlasBox = await mobile.locator('.demo-project').filter({ hasText: 'Atlas API' }).boundingBox();
  assert.ok(atlasBox && atlasBox.y + atlasBox.height <= 844, 'A complete Atlas API row must fit in the initial mobile viewport');
  await mobile.getByRole('button', { name: 'Check Northwind Store' }).click();
  assert.match(await mobile.locator('#demo-confirmation').innerText(), /Check before editing · Northwind Store/);
  await mobile.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await mobile.getByRole('button', { name: 'Confirm Northwind Store' }).click();
  assert.ok((await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 1);
  const confirmationBoxes = await mobile.locator('.demo-confirmation > *').evaluateAll((elements) => elements.map((element) => {
    const box = element.getBoundingClientRect();
    return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
  }));
  for (let index = 0; index < confirmationBoxes.length; index += 1) {
    assert.ok(confirmationBoxes[index].left >= 0 && confirmationBoxes[index].right <= 390);
    for (let other = index + 1; other < confirmationBoxes.length; other += 1) {
      const overlaps = confirmationBoxes[index].left < confirmationBoxes[other].right
        && confirmationBoxes[index].right > confirmationBoxes[other].left
        && confirmationBoxes[index].top < confirmationBoxes[other].bottom
        && confirmationBoxes[index].bottom > confirmationBoxes[other].top;
      assert.equal(overlaps, false, 'Post-confirmation controls must not collide at 390px and 200% text');
    }
  }
  const selectedEditorOutput = await mobile.locator('#config-output').innerText();
  assert.match(selectedEditorOutput, /\.vscode\/settings\.json/);
  assert.doesNotMatch(selectedEditorOutput, /\.zed\/settings\.json/);
  assert.ok((await mobile.evaluate(() => localStorage.getItem('demo:pcb:site-state'))) !== null);
  assert.deepEqual([...new Set(demoRequests.map((url) => new URL(url).origin))], [origin]);

  const startForReal = mobile.getByRole('link', { name: 'Start for real' });
  await startForReal.focus();
  await mobile.keyboard.press('Tab');
  await mobile.keyboard.press('Shift+Tab');
  const focus = await startForReal.evaluate((element) => {
    const style = getComputedStyle(element);
    return { width: Number.parseFloat(style.outlineWidth), style: style.outlineStyle };
  });
  assert.ok(focus.width >= 3 && focus.style === 'solid', 'Keyboard focus must use a visible solid outline');
  await mobile.keyboard.press('Enter');
  await mobile.waitForURL(`${origin}/#download`);
  assert.equal(await mobile.evaluate(() => localStorage.getItem('demo:pcb:site-state')), null);
  await mobile.goto(`${origin}/demo`);
  assert.match(await mobile.locator('#demo-confirmation').innerText(), /Confirmed · Atlas API/);
  assert.match(await mobile.locator('#config-output').innerText(), /Editor files ready for Atlas API/);

  await mobile.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
  });
  await mobile.reload();
  await mobileContext.setOffline(true);
  await mobile.reload({ waitUntil: 'domcontentloaded' });
  assert.match(await mobile.locator('h1').innerText(), /Check a project before you edit/);
  assert.match(await mobile.locator('#demo-project-list').innerText(), /Atlas API/);
  await mobileContext.close();

  const landingContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const landing = await landingContext.newPage();
  await landing.goto(`${origin}/`, { waitUntil: 'networkidle' });
  const priceFact = landing.getByText('Three projects are free; unlimited projects cost $24 once.');
  const priceFactBox = await priceFact.boundingBox();
  assert.ok(priceFactBox && priceFactBox.y + priceFactBox.height <= 844, 'The $24 price fact must fit in the first mobile viewport');
  await landing.getByRole('link', { name: 'Buy a $24 license' }).waitFor();
  await landing.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  assert.equal(await landing.evaluate(() => document.documentElement.scrollWidth), 390, 'Loaded pricing must reflow at 390px and 200% text');
  await landingContext.close();

  const reducedContext = await browser.newContext({ reducedMotion: 'reduce' });
  const reduced = await reducedContext.newPage();
  await reduced.goto(`${origin}/demo`);
  const durations = await reduced.locator('.demo-project').first().evaluate((element) => {
    const style = getComputedStyle(element);
    return { animation: style.animationDuration, transition: style.transitionDuration };
  });
  assert.ok(Number.parseFloat(durations.animation) <= 0.00001);
  assert.ok(Number.parseFloat(durations.transition) <= 0.00001);
  await reducedContext.close();

  const historyContext = await browser.newContext({ viewport: { width: 390, height: 600 } });
  const historyPage = await historyContext.newPage();
  await historyPage.goto(`${origin}/`);
  await historyPage.evaluate(() => window.scrollTo(0, 1800));
  await historyPage.waitForFunction(() => window.scrollY > 1700);
  const landingScroll = await historyPage.evaluate(() => window.scrollY);
  await historyPage.evaluate(() => document.querySelector('a[href="/demo"]')?.click());
  await historyPage.waitForURL(`${origin}/demo`);
  await historyPage.evaluate(() => window.scrollTo(0, 300));
  await historyPage.waitForFunction(() => window.scrollY > 250);
  const demoScroll = await historyPage.evaluate(() => window.scrollY);
  await historyPage.goBack();
  await historyPage.waitForFunction((expected) => window.scrollY >= expected - 2, landingScroll);
  assert.equal(await historyPage.locator('h1').evaluate((element) => element === document.activeElement), true);
  await historyPage.goForward();
  await historyPage.waitForFunction((expected) => window.scrollY >= expected - 2, demoScroll);
  assert.equal(await historyPage.locator('h1').evaluate((element) => element === document.activeElement), true);
  await historyContext.close();

  const billingContext = await browser.newContext();
  const billing = await billingContext.newPage();
  await billing.goto(`${origin}/`, { waitUntil: 'networkidle' });
  const download = billing.locator('#download-button');
  await download.getByText('Download for Linux').waitFor();
  assert.match(await download.getAttribute('href'), new RegExp(`Project\\.Color\\.Beacons_${APP_VERSION.replaceAll('.', '\\.')}.*\\.AppImage$`));
  assert.equal(await download.getAttribute('aria-disabled'), null);
  assert.equal(await billing.getByRole('link', { name: 'Buy a $24 license' }).count(), 1);
  assert.match(await billing.locator('#download-state').innerText(), new RegExp(`v${APP_VERSION.replaceAll('.', '\\.')} .* verified package origin`));
  await billingContext.close();

  for (const fixture of [
    { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', label: 'Windows' },
    { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6)', label: 'macOS' }
  ]) {
    const platformContext = await browser.newContext({ userAgent: fixture.userAgent });
    const platformPage = await platformContext.newPage();
    await platformPage.goto(`${origin}/`, { waitUntil: 'networkidle' });
    const platformDownload = platformPage.locator('#download-button');
    assert.equal(await platformDownload.getAttribute('href'), null, `${fixture.label} must not link an unsigned package`);
    assert.equal(await platformDownload.getAttribute('aria-disabled'), 'true');
    assert.equal(await platformPage.getByRole('link', { name: 'Buy a $24 license' }).count(), 0);
    assert.match(await platformPage.locator('#download-state').innerText(), new RegExp(`verified ${fixture.label} download is not published`, 'i'));
    await platformContext.close();
  }

  const returnContext = await browser.newContext();
  await returnContext.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
  const returned = await returnContext.newPage();
  let websiteVerificationRequests = 0;
  await returned.route('https://api.sociobot.in/api/v1/products/project-color-beacons/verify?license=fixture-return', (route) => {
    websiteVerificationRequests += 1;
    return route.fulfill({ json: { valid: true } });
  });
  await returned.goto(`${origin}/?license=fixture-return`);
  await returned.getByText('Your license is ready.').waitFor();
  assert.equal(await returned.locator('#returned-license').inputValue(), 'fixture-return');
  await returned.getByText('Copy it, then paste it into the desktop app.').waitFor();
  await returned.getByRole('button', { name: 'Copy license key' }).click();
  assert.equal(await returned.evaluate(() => navigator.clipboard.readText()), 'fixture-return');
  assert.equal(new URL(returned.url()).searchParams.has('license'), false);
  assert.equal(await returned.evaluate(() => localStorage.getItem('sb_license:project-color-beacons')), null);
  assert.equal(await returned.evaluate(() => localStorage.getItem('pcb:license-verdict')), null);
  assert.equal(websiteVerificationRequests, 0);
  await returnContext.close();

  console.log('Live site passed: routes, Axe, mobile, keyboard, history, privacy, demo disposal, offline update, trusted download gates, and desktop license guidance.');
} finally {
  await browser.close();
}
