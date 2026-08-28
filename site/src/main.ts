import './site.css';
import { SAMPLE_PROJECTS, beaconFor, editorPreview, type Project } from '../../shared/beacons';

const app = document.getElementById('app');
if (!app) throw new Error('The site root is missing.');

const titles: Record<string, string> = {
  '/': 'Project Color Beacons — Mark the right project',
  '/demo': 'Demo — Project Color Beacons',
  '/privacy': 'Privacy — Project Color Beacons',
  '/terms': 'Terms — Project Color Beacons',
  '/404': 'Page not found — Project Color Beacons'
};

const descriptions: Record<string, string> = {
  '/': 'Mark each project with a stable color, name, and symbol. Confirm the project before you edit.',
  '/demo': 'Try three sample project beacons in a separate browser sandbox.',
  '/privacy': 'Read how Project Color Beacons keeps project paths and settings on your device.',
  '/terms': 'Read the purchase and use terms for Project Color Beacons.',
  '/404': 'The requested Project Color Beacons page was not found.'
};

function esc(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);
}

function header() {
  return `<header><div class="site-header shell"><a class="wordmark" href="/" data-link><img src="/favicon.svg" width="32" height="32" alt=""><span>Project Color Beacons</span></a><nav class="site-nav" aria-label="Main navigation"><a href="/demo" data-link>Demo</a><a href="/#download">Download</a><a href="/privacy" data-link>Privacy</a></nav></div></header>`;
}

function footer() {
  return `<footer class="site-footer shell"><div><strong>Project Color Beacons</strong><p>Mark each project before you edit.</p><p class="footer-meta">Original generated ceramic image · Version 0.1.0 · Build 2026.08.28</p></div><nav class="footer-links" aria-label="Footer navigation"><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a><a href="https://hello-factory.sociobot.in">Built by Param Factory <span class="sr-only">(external site)</span></a></nav></footer>`;
}

function landing() {
  return `${header()}<main id="main" tabindex="-1">
    <section class="hero shell">
      <div class="hero-copy"><p class="eyebrow">A local desktop helper</p><h1>Mark the project before you edit.</h1><p class="lede">For dyslexic and ADHD developers, a color, name, and symbol make similar windows clear.</p><div class="actions"><a class="button" href="/demo" data-link>Try it with sample data</a><a class="button button-secondary" href="#download">Download the app</a><span class="action-note">The demo opens three sample projects. Nothing is saved.</span></div><ul class="plain-facts"><li>Project paths stay on your device.</li><li>The desktop app works offline.</li><li>Three projects are free. Unlimited projects cost $24 once.</li></ul></div>
      <figure class="hero-art"><picture><source media="(max-width: 700px)" srcset="/assets/ceramic-beacons-mobile.webp"><img src="/assets/ceramic-beacons.webp" width="1180" height="787" fetchpriority="high" decoding="async" alt="Six distinct ceramic shapes sit beside layered window-like panes."></picture><span class="hero-seal" aria-hidden="true">◒</span><figcaption>Each project repeats one shape, color, and name.</figcaption></figure>
    </section>
    <section class="preview-section shell" aria-labelledby="preview-title"><div class="section-intro"><h2 id="preview-title">See the project before the action</h2><p>The confirmation strip repeats all three cues. You press the named button before editor settings change.</p></div>${productPreview()}</section>
    <section class="steps shell" aria-labelledby="steps-title"><div class="section-intro"><h2 id="steps-title">Set a beacon in three steps</h2><p>The app adds supported settings for VS Code, Cursor, and Zed. Existing JSON settings stay in place.</p></div><div class="steps-grid">
      <figure class="step"><img src="/assets/walkthrough-1.webp" width="800" height="600" loading="lazy" decoding="async" alt="Project shelf with three sample projects and distinct beacons."><figcaption><span class="step-number">Step 1</span><strong>Choose a folder</strong>Name the project and pick its symbol and color.</figcaption></figure>
      <figure class="step"><img src="/assets/walkthrough-2.webp" width="800" height="600" loading="lazy" decoding="async" alt="Confirmation strip for Atlas API above the project shelf."><figcaption><span class="step-number">Step 2</span><strong>Check the strip</strong>Match the name, symbol, color, and local path.</figcaption></figure>
      <figure class="step"><img src="/assets/walkthrough-3.webp" width="800" height="600" loading="lazy" decoding="async" alt="Editor settings preview after Atlas API is confirmed."><figcaption><span class="step-number">Step 3</span><strong>Write editor settings</strong>The app merges the beacon into supported project files.</figcaption></figure>
    </div></section>
    <section class="boundaries" aria-labelledby="privacy-title"><div class="shell"><div><p class="eyebrow">Quiet by design</p><h2 id="privacy-title">No watching. No diagnosis.</h2></div><ul class="boundary-list"><li><strong>No monitoring.</strong> The app does not watch keystrokes or score mistakes.</li><li><strong>No project upload.</strong> Names, paths, and settings stay on your device.</li><li><strong>No color-only state.</strong> Every beacon includes a written name and a symbol.</li><li><strong>No medical claim.</strong> This is an accommodation tool, not a diagnosis.</li></ul></div></section>
    <section class="pricing shell" id="download" aria-labelledby="download-title"><div class="price-slab ceramic-panel"><div><p class="eyebrow">Desktop app</p><h2 id="download-title">Start with three projects</h2><p>Use every safety and accessibility feature for free. A license only removes the project limit.</p><div class="actions"><a class="button" id="download-button" href="https://github.com/B-Divyesh/sf-project-color-beacons/releases">View downloads</a><a class="button button-secondary" href="https://api.sociobot.in/api/v1/products/project-color-beacons/checkout">Buy a $24 license</a></div><p id="download-state" class="download-state" role="status">Checking for the latest desktop build…</p></div><div class="price"><strong>$24</strong><span>one-time · unlimited projects</span></div></div>
      <form class="license-restore" id="license-restore"><label for="site-license">Have a license? Paste it to restore this device.</label><input id="site-license" name="license" autocomplete="off" spellcheck="false"><button type="submit" aria-label="Verify license">Verify license</button><p id="license-status" class="status-message" role="status"></p></form>
    </section>
  </main>${footer()}`;
}

function productPreview() {
  return `<div class="product-preview ceramic-panel" aria-label="Product preview"><div class="preview-topbar"><div class="preview-dots" aria-hidden="true"><span></span><span></span><span></span></div><span class="preview-title">PROJECT SHELF · LOCAL</span></div><div class="preview-strip"><span class="beacon" style="--beacon-color:#176B78" aria-hidden="true">◒</span><p><strong>Confirmed · Atlas API</strong>◒ Fjord · /work/acme/atlas-api</p></div><div class="preview-projects">${SAMPLE_PROJECTS.map((project) => { const beacon = beaconFor(project.beaconId); return `<div class="mini-project"><span class="beacon" style="--beacon-color:${beacon.color}" aria-hidden="true">${beacon.symbol}</span><span><strong>${project.name}</strong><small>${beacon.name} · ${beacon.symbolName}</small></span></div>`; }).join('')}</div></div>`;
}

function demo() {
  return `<div class="demo-banner"><strong>Demo — sample data, nothing is saved</strong><button type="button" data-demo-action="reset">Reset demo</button><a href="/#download">Start for real</a></div>${header()}<main id="main" class="demo-main shell" tabindex="-1"><div class="demo-intro"><div><p class="eyebrow">Safe sample workspace</p><h1>Check a project before you edit.</h1><p class="lede">Choose one sample project. Its name, symbol, color, and path move into the confirmation strip.</p></div><p class="action-note">Demo changes use the <code>demo:</code> storage space only.</p></div><section class="demo-app ceramic-panel" aria-labelledby="sample-projects-title"><h2 id="sample-projects-title">Sample projects</h2><div id="demo-confirmation" class="demo-confirmation"><span aria-hidden="true">◇</span><p>Choose “Check project” to fill this strip.</p></div><div id="demo-project-list" class="demo-project-list"></div><p class="demo-status" id="demo-status" role="status"></p><div id="config-output"></div></section></main>${footer()}`;
}

function privacy() {
  return `${header()}<main id="main" class="legal shell" tabindex="-1"><article><p class="eyebrow">Effective 28 August 2026</p><h1>Your projects stay on your device.</h1><p>Project Color Beacons stores project names, local paths, beacons, and license details on your device.</p><h2>What the app stores</h2><p>The app stores your project list in its local application data. It writes editor settings only after you confirm a project.</p><h2>What leaves your device</h2><p>Nothing leaves your device during normal project use. License checks send only your license token to the Sociobot billing API.</p><h2>Demo data</h2><p>The web demo uses a separate <code>demo:</code> browser storage key. Resetting or leaving the demo discards that sample workspace.</p><h2>Analytics and contact</h2><p>This version has no analytics, advertising, crash reporting, or tracking. Email <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a> with privacy questions.</p></article></main>${footer()}`;
}

function terms() {
  return `${header()}<main id="main" class="legal shell" tabindex="-1"><article><p class="eyebrow">Effective 28 August 2026</p><h1>Terms for using the app.</h1><p>You may use and modify the app under its MIT license. Keep backups of project settings before changing editor configuration.</p><h2>Free and paid use</h2><p>The free app supports three saved projects. A $24 one-time license supports unlimited projects on your devices.</p><h2>Purchases and refunds</h2><p>Sociobot and Dodo act as merchant of record. Their checkout handles payment and refunds. A refunded license stops working.</p><h2>No warranty</h2><p>The app is provided without warranty under the MIT license. You remain responsible for reviewing changes to project settings.</p><h2>Contact</h2><p>Email <a href="mailto:support@sociobot.in">support@sociobot.in</a> with purchase or license questions.</p></article></main>${footer()}`;
}

function notFound() {
  return `${header()}<main id="main" class="not-found shell" tabindex="-1"><p class="eyebrow">404 · marker missing</p><h1>This project marker is not here.</h1><p>The address may have moved. Return to the project shelf.</p><a class="button" href="/" data-link>Return home</a></main>${footer()}`;
}

function renderRoute(path = location.pathname) {
  const known = Object.prototype.hasOwnProperty.call(titles, path);
  const route = known ? path : '/404';
  document.title = titles[route];
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) canonical.href = `https://project-color-beacons.sociobot.in${route === '/404' ? path : route}`;
  const description = descriptions[route];
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', titles[route]);
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', titles[route]);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute('content', description);
  app!.innerHTML = route === '/' ? landing() : route === '/demo' ? demo() : route === '/privacy' ? privacy() : route === '/terms' ? terms() : notFound();
  if (route === '/demo') setupDemo();
  if (route === '/') { setupDownloads(); setupLicense(); }
  const heading = document.querySelector<HTMLElement>('h1');
  heading?.setAttribute('tabindex', '-1');
  heading?.focus({ preventScroll: true });
  const announcer = document.getElementById('route-status');
  if (announcer) announcer.textContent = heading?.textContent ?? '';
  scrollTo({ top: 0, behavior: 'auto' });
}

function navigate(path: string) {
  history.pushState({}, '', path);
  renderRoute();
}

document.addEventListener('click', (event) => {
  const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[data-link]');
  if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigate(link.pathname);
});
window.addEventListener('popstate', () => renderRoute());

type DemoState = { projects: Project[]; activeId: string | null; confirmedId: string | null };
const demoKey = 'demo:pcb:site-state';
let demoState: DemoState;

function initialDemoState(): DemoState { return { projects: structuredClone(SAMPLE_PROJECTS), activeId: null, confirmedId: null }; }

function loadDemoState(): DemoState {
  try { return JSON.parse(localStorage.getItem(demoKey) ?? '') as DemoState; }
  catch { const state = initialDemoState(); localStorage.setItem(demoKey, JSON.stringify(state)); return state; }
}

function renderDemoState() {
  const list = document.getElementById('demo-project-list');
  const strip = document.getElementById('demo-confirmation');
  if (!list || !strip) return;
  list.innerHTML = demoState.projects.map((project) => { const beacon = beaconFor(project.beaconId); return `<article class="demo-project"><span class="beacon" style="--beacon-color:${beacon.color}" aria-label="${beacon.name}, ${beacon.symbolName}">${beacon.symbol}</span><div><strong>${esc(project.name)}</strong><p title="${esc(project.path)}">${esc(project.path)}</p></div><button type="button" data-demo-action="check" data-id="${project.id}">Check project</button></article>`; }).join('');
  const project = demoState.projects.find((item) => item.id === demoState.activeId);
  if (!project) { strip.className = 'demo-confirmation'; strip.innerHTML = '<span aria-hidden="true">◇</span><p>Choose “Check project” to fill this strip.</p>'; return; }
  const beacon = beaconFor(project.beaconId);
  const confirmed = demoState.confirmedId === project.id;
  strip.className = `demo-confirmation ready${confirmed ? ' done' : ''}`;
  strip.innerHTML = `<span class="beacon" style="--beacon-color:${beacon.color}" aria-label="${beacon.name}, ${beacon.symbolName}">${beacon.symbol}</span><p><strong>${confirmed ? 'Confirmed' : 'Check before editing'} · ${esc(project.name)}</strong><br>${esc(project.path)} · ${beacon.name}</p><button type="button" data-demo-action="confirm" data-id="${project.id}">${confirmed ? 'Preview editor files' : `Confirm ${esc(project.name)}`}</button>`;
}

function setupDemo() {
  demoState = loadDemoState();
  renderDemoState();
  document.querySelector('.demo-main')?.addEventListener('click', handleDemoClick);
  document.querySelector('.demo-banner')?.addEventListener('click', handleDemoClick);
}

function handleDemoClick(event: Event) {
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-demo-action]');
  if (!target) return;
  const action = target.dataset.demoAction;
  const id = target.dataset.id;
  const status = document.getElementById('demo-status');
  const output = document.getElementById('config-output');
  if (action === 'reset') {
    demoState = initialDemoState();
    localStorage.setItem(demoKey, JSON.stringify(demoState));
    if (status) status.textContent = 'Demo reset to three sample projects.';
    if (output) output.innerHTML = '';
  }
  if (action === 'check' && id) {
    demoState.activeId = id;
    demoState.confirmedId = null;
    if (status) status.textContent = 'The confirmation strip is ready. Check all four cues.';
    if (output) output.innerHTML = '';
  }
  if (action === 'confirm' && id) {
    demoState.confirmedId = id;
    const project = demoState.projects.find((item) => item.id === id);
    if (project && output) {
      const preview = editorPreview(project);
      output.className = 'config-output';
      output.innerHTML = `<h3>Editor files ready for ${esc(project.name)}</h3><p>The desktop app merges these settings into the project folder.</p><pre>${esc(JSON.stringify({ '.vscode/settings.json': preview.vscode, '.zed/settings.json': preview.zed }, null, 2))}</pre>`;
      if (status) status.textContent = `Confirmed ${project.name}. The editor file preview is below.`;
    }
  }
  localStorage.setItem(demoKey, JSON.stringify(demoState));
  renderDemoState();
}

async function setupDownloads() {
  const button = document.getElementById('download-button') as HTMLAnchorElement | null;
  const state = document.getElementById('download-state');
  if (!button || !state) return;
  const fallback = 'https://github.com/B-Divyesh/sf-project-color-beacons/releases';
  const platform = /Windows/i.test(navigator.userAgent) ? 'windows' : /Macintosh|Mac OS X/i.test(navigator.userAgent) ? 'macOS' : 'linux';
  button.textContent = `View ${platform === 'macOS' ? 'macOS' : platform === 'windows' ? 'Windows' : 'Linux'} downloads`;
  try {
    const cache = JSON.parse(localStorage.getItem('pcb:release-cache') ?? '{}') as { at?: number; data?: Release };
    let release = cache.data;
    if (!release || !cache.at || Date.now() - cache.at > 3_600_000) {
      const response = await fetch('https://api.github.com/repos/B-Divyesh/sf-project-color-beacons/releases?per_page=1', { headers: { Accept: 'application/vnd.github+json' } });
      if (!response.ok) throw new Error('Release not available');
      const releases = await response.json() as Release[];
      release = releases[0];
      if (!release) throw new Error('Release not available');
      localStorage.setItem('pcb:release-cache', JSON.stringify({ at: Date.now(), data: release }));
    }
    const pattern = platform === 'windows' ? /\.(msi|exe)$/i : platform === 'macOS' ? /\.(dmg|app\.tar\.gz)$/i : /\.(AppImage|deb)$/i;
    const asset = release.assets.find((item) => pattern.test(item.name));
    if (!asset) throw new Error('Platform asset not available');
    button.href = asset.browser_download_url;
    button.textContent = `Download for ${platform === 'macOS' ? 'macOS' : platform === 'windows' ? 'Windows' : 'Linux'}`;
    state.textContent = `${release.tag_name} · ${asset.name} · unsigned build`;
  } catch {
    button.href = fallback;
    state.textContent = 'Downloads are being published. The Releases page will show them when ready.';
  }
}

type Release = { tag_name: string; assets: Array<{ name: string; browser_download_url: string }> };

function setupLicense() {
  const url = new URL(location.href);
  const returned = url.searchParams.get('license');
  if (returned) {
    localStorage.setItem('sb_license:project-color-beacons', returned);
    url.searchParams.delete('license');
    history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    void verifySiteLicense(returned);
  }
  document.getElementById('license-restore')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.getElementById('site-license') as HTMLInputElement;
    const token = input.value.trim();
    const status = document.getElementById('license-status');
    if (!token) { if (status) status.textContent = 'Paste the license key from your receipt, then verify it.'; return; }
    void verifySiteLicense(token);
  });
}

async function verifySiteLicense(token: string) {
  const status = document.getElementById('license-status');
  try {
    const response = await fetch(`https://api.sociobot.in/api/v1/products/project-color-beacons/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('No answer');
    const verdict = await response.json() as { valid: boolean };
    if (verdict.valid) {
      localStorage.setItem('sb_license:project-color-beacons', token);
      localStorage.setItem('pcb:license-verdict', JSON.stringify({ valid: true, checkedAt: Date.now() }));
      if (status) status.textContent = 'License verified. Paste the same key into the desktop app.';
    } else if (status) status.textContent = 'This license is not active. Check the key or buy a new license.';
  } catch {
    if (status) status.textContent = 'The license could not be checked. Check your connection and try again.';
  }
}

renderRoute();
if ('serviceWorker' in navigator) window.addEventListener('load', () => { void navigator.serviceWorker.register('/sw.js'); });
