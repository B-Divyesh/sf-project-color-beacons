import './app.css';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { openUrl } from '@tauri-apps/plugin-opener';
import { BEACONS, SAMPLE_PROJECTS, beaconFor, editorPreview, newId, type Project } from '../../shared/beacons';

declare global { interface Window { __TAURI_INTERNALS__?: unknown; } }

const query = new URLSearchParams(location.search);
const demoMode = query.get('demo') === '1';
const storageKey = demoMode ? 'demo:pcb:projects' : 'pcb:projects';
const licenseKey = 'sb_license:project-color-beacons';
const licenseCacheKey = 'pcb:license-verdict';

let projects = loadProjects();
let activeId: string | null = null;
let confirmedId: string | null = null;
let removedProject: Project | null = null;
let licensed = demoMode || loadCachedLicense();

const list = required<HTMLElement>('project-list');
const count = required<HTMLElement>('project-count');
const status = required<HTMLElement>('status');
const confirmation = required<HTMLElement>('confirmation-area');
const projectDialog = required<HTMLDialogElement>('project-dialog');
const licenseDialog = required<HTMLDialogElement>('license-dialog');
const projectForm = required<HTMLFormElement>('project-form');
const licenseForm = required<HTMLFormElement>('license-form');

function required<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing element: ${id}`);
  return element as T;
}

function loadProjects(): Project[] {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved) as Project[];
  } catch { /* A calm empty state is safer than blocking startup. */ }
  if (demoMode) {
    localStorage.setItem(storageKey, JSON.stringify(SAMPLE_PROJECTS));
    return structuredClone(SAMPLE_PROJECTS);
  }
  return [];
}

function saveProjects() {
  localStorage.setItem(storageKey, JSON.stringify(projects));
}

function loadCachedLicense(): boolean {
  try {
    const cache = JSON.parse(localStorage.getItem(licenseCacheKey) ?? '{}') as { valid?: boolean; checkedAt?: number };
    return Boolean(localStorage.getItem(licenseKey) && cache.valid && cache.checkedAt && Date.now() - cache.checkedAt < 86_400_000);
  } catch { return false; }
}

function takeLicenseFromUrl() {
  const token = query.get('license');
  if (!token || demoMode) return;
  localStorage.setItem(licenseKey, token);
  query.delete('license');
  history.replaceState(null, '', `${location.pathname}${query.size ? `?${query}` : ''}`);
  void verifyLicense(token);
}

async function verifyLicense(token: string): Promise<boolean> {
  const error = required<HTMLElement>('license-error');
  error.textContent = '';
  try {
    const response = await fetch(`https://api.sociobot.in/api/v1/products/project-color-beacons/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('The license service did not answer.');
    const verdict = await response.json() as { valid: boolean };
    licensed = verdict.valid;
    localStorage.setItem(licenseCacheKey, JSON.stringify({ valid: verdict.valid, checkedAt: Date.now() }));
    if (verdict.valid) {
      localStorage.setItem(licenseKey, token);
      licenseDialog.close();
      setStatus('License active. You can add unlimited projects.');
    } else {
      error.textContent = 'This license is not active. Check the key or use a purchase option when one is available.';
    }
    render();
    return verdict.valid;
  } catch {
    error.textContent = 'The license could not be checked. Check your connection and try again.';
    return false;
  }
}

function setStatus(message: string, isError = false) {
  status.textContent = message;
  status.classList.toggle('error', isError);
}

function beaconMarkup(project: Project) {
  const beacon = beaconFor(project.beaconId);
  return `<span class="beacon" style="--beacon-color:${beacon.color}" aria-label="${escapeHtml(beacon.name)} beacon, ${escapeHtml(beacon.symbolName)} symbol">${beacon.symbol}</span>`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);
}

function render() {
  count.textContent = licensed ? `${projects.length} projects · unlimited` : `${projects.length} of 3 free projects`;
  if (!projects.length) {
    list.innerHTML = `<div class="empty-state ceramic-panel"><span class="beacon" aria-hidden="true">◇</span><h3>No project beacons yet</h3><p>Your folders will appear here after you add one. You can also load three sample projects.</p><div class="actions"><button data-action="add">Add your first project</button><button class="secondary" data-action="samples">Load sample projects</button></div></div>`;
  } else {
    list.innerHTML = projects.map((project) => {
      const beacon = beaconFor(project.beaconId);
      const editorTags = project.editors.map((editor) => `<span class="editor-tag">${editor === 'vscode' ? 'VS Code' : 'Zed'}</span>`).join('');
      return `<article class="project-card ceramic-panel${activeId === project.id ? ' active' : ''}" data-project="${project.id}">
        ${beaconMarkup(project)}
        <div><h3>${escapeHtml(project.name)}</h3><p class="project-path" title="${escapeHtml(project.path)}">${escapeHtml(project.path)}</p><div class="editor-tags" aria-label="Editor integrations">${editorTags || '<span class="editor-tag">Strip only</span>'}</div><span class="sr-only">${beacon.name}, ${beacon.symbolName}</span></div>
        <div class="project-actions"><button data-action="activate" data-id="${project.id}">Check project</button><button class="danger-link" data-action="remove" data-id="${project.id}" aria-label="Remove ${escapeHtml(project.name)}">Remove</button></div>
      </article>`;
    }).join('');
  }
  renderConfirmation();
}

function renderConfirmation() {
  const project = projects.find((item) => item.id === activeId);
  if (!project) {
    confirmation.innerHTML = `<div class="confirmation-placeholder">The project confirmation strip appears here when you choose “Check project”.</div>`;
    return;
  }
  const isConfirmed = confirmedId === project.id;
  const beacon = beaconFor(project.beaconId);
  confirmation.innerHTML = `<div class="confirmation ceramic-panel${isConfirmed ? ' confirmed' : ''}">
    ${beaconMarkup(project)}
    <div><p class="eyebrow">${isConfirmed ? 'Confirmed' : 'Check before editing'}</p><h2 id="confirmation-heading">${escapeHtml(project.name)} · ${beacon.symbol} ${beacon.name}</h2><p>${escapeHtml(project.path)}</p></div>
    <button data-action="confirm" data-id="${project.id}"${isConfirmed ? ' class="secondary"' : ''}>${isConfirmed ? 'Write editor strips again' : `Confirm ${escapeHtml(project.name)}`}</button>
  </div>`;
}

async function confirmProject(project: Project) {
  confirmedId = project.id;
  render();
  if (demoMode || !window.__TAURI_INTERNALS__) {
    showConfigPreview(project);
    setStatus(`Confirmed ${project.name}. The sample editor files are ready to preview.`);
    return;
  }
  try {
    const written = await invoke<string[]>('configure_project', { project });
    setStatus(`Confirmed ${project.name}. Wrote ${written.length} editor file${written.length === 1 ? '' : 's'}.`);
  } catch (error) {
    setStatus(`The editor files were not written. ${String(error)} Check the folder and try again.`, true);
  }
}

function showConfigPreview(project: Project) {
  document.getElementById('preview-dialog')?.remove();
  const preview = editorPreview(project);
  const dialog = document.createElement('dialog');
  dialog.id = 'preview-dialog';
  dialog.innerHTML = `<form method="dialog"><div class="dialog-heading"><div><p class="eyebrow">Demo preview</p><h2>Editor files for ${escapeHtml(project.name)}</h2></div><button class="icon-button secondary" value="close" aria-label="Close editor preview">×</button></div><p>In the desktop app, these settings merge into the project folder.</p><h3>.vscode/settings.json</h3><pre>${escapeHtml(JSON.stringify(preview.vscode, null, 2))}</pre><h3>.zed/settings.json</h3><pre>${escapeHtml(JSON.stringify(preview.zed, null, 2))}</pre><div class="dialog-actions"><button value="close">Close preview</button></div></form>`;
  document.body.append(dialog);
  dialog.addEventListener('close', () => dialog.remove());
  dialog.showModal();
}

function openProjectDialog() {
  if (!licensed && projects.length >= 3) {
    void openLicenseDialog();
    return;
  }
  projectForm.reset();
  required<HTMLInputElement>('project-path').value = demoMode ? '/work/acme/new-project' : '';
  required<HTMLInputElement>('project-name').value = demoMode ? 'Payments Worker' : '';
  required<HTMLInputElement>('project-error').textContent = '';
  renderBeaconOptions();
  projectDialog.showModal();
  required<HTMLInputElement>('project-name').focus();
}

function openLicenseDialog() {
  licenseDialog.showModal();
  required<HTMLElement>('license-title').focus();
  const offer = required<HTMLElement>('license-purchase');
  offer.innerHTML = 'See current purchase availability on <a data-external href="https://project-color-beacons.sociobot.in/#download">the Project Color Beacons site</a>.';
}

function renderBeaconOptions() {
  required<HTMLElement>('beacon-options').innerHTML = BEACONS.map((beacon, index) => `<div class="beacon-choice"><input type="radio" id="beacon-${beacon.id}" name="beacon" value="${beacon.id}"${index === projects.length % BEACONS.length ? ' checked' : ''}><label for="beacon-${beacon.id}"><span class="beacon" style="--beacon-color:${beacon.color}" aria-hidden="true">${beacon.symbol}</span>${beacon.name}<span class="sr-only">${beacon.symbolName}</span></label></div>`).join('');
}

async function chooseFolder() {
  const pathField = required<HTMLInputElement>('project-path');
  if (!window.__TAURI_INTERNALS__) {
    pathField.value = '/work/acme/new-project';
    required<HTMLElement>('project-error').textContent = 'The website uses a sample folder. Install the app to choose a real folder.';
    return;
  }
  const selection = await open({ directory: true, multiple: false, title: 'Choose a project folder' });
  if (typeof selection === 'string') {
    pathField.value = selection;
    const name = required<HTMLInputElement>('project-name');
    if (!name.value) name.value = selection.split(/[\\/]/).filter(Boolean).pop() ?? '';
  }
}

async function submitProject(event: SubmitEvent) {
  event.preventDefault();
  const submitter = event.submitter as HTMLButtonElement | null;
  if (submitter?.value === 'cancel') { projectDialog.close(); return; }
  const data = new FormData(projectForm);
  const name = String(data.get('name') ?? '').trim();
  const path = String(data.get('path') ?? '').trim();
  const beaconId = String(data.get('beacon') ?? 'fjord');
  const editors = data.getAll('editor').filter((value): value is 'vscode' | 'zed' => value === 'vscode' || value === 'zed');
  const error = required<HTMLElement>('project-error');
  if (!name || !path) { error.textContent = 'The project needs a name and folder. Choose both, then save it.'; return; }
  if (!editors.length) { error.textContent = 'Choose at least one editor strip, then save the project.'; return; }
  if (projects.some((project) => project.path === path)) { error.textContent = 'That folder already has a beacon. Choose a different folder.'; return; }
  projects.push({ id: newId(), name, path, beaconId, editors, createdAt: Date.now() });
  saveProjects();
  projectDialog.close();
  render();
  setStatus(`Saved ${name}. Choose “Check project” before editing.`);
}

function removeProject(id: string) {
  const project = projects.find((item) => item.id === id);
  if (!project || !confirm(`Remove ${project.name} from this device? Editor files already written to its folder will stay there.`)) return;
  projects = projects.filter((item) => item.id !== id);
  removedProject = project;
  if (activeId === id) activeId = null;
  saveProjects();
  render();
  status.innerHTML = `Removed ${escapeHtml(project.name)}. <button class="secondary" data-action="undo">Undo removal</button>`;
}

function installDemoBanner() {
  if (!demoMode) return;
  required<HTMLElement>('demo-banner').innerHTML = `<div class="demo-banner"><strong>Demo — sample data, nothing is saved</strong><button type="button" data-action="reset-demo">Reset demo</button><a href="/" data-action="exit-demo">Start for real</a></div>`;
}

document.addEventListener('click', (event) => {
  const external = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[data-external]');
  if (external && window.__TAURI_INTERNALS__) {
    event.preventDefault();
    void openUrl(external.href);
    return;
  }
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  const id = target.dataset.id;
  if (action === 'add') openProjectDialog();
  if (action === 'samples') { projects = structuredClone(SAMPLE_PROJECTS); saveProjects(); render(); setStatus('Loaded three sample projects.'); }
  if (action === 'activate' && id) { activeId = id; confirmedId = null; render(); confirmation.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  if (action === 'confirm' && id) { const project = projects.find((item) => item.id === id); if (project) void confirmProject(project); }
  if (action === 'remove' && id) removeProject(id);
  if (action === 'undo' && removedProject) { projects.push(removedProject); removedProject = null; saveProjects(); render(); setStatus('Project restored.'); }
  if (action === 'reset-demo') { localStorage.removeItem(storageKey); projects = structuredClone(SAMPLE_PROJECTS); saveProjects(); activeId = null; confirmedId = null; render(); setStatus('Demo reset to its sample projects.'); }
  if (action === 'exit-demo') localStorage.removeItem(storageKey);
});

required<HTMLButtonElement>('add-project').addEventListener('click', openProjectDialog);
required<HTMLButtonElement>('choose-folder').addEventListener('click', () => void chooseFolder());
required<HTMLButtonElement>('license-button').addEventListener('click', openLicenseDialog);
projectForm.addEventListener('submit', (event) => void submitProject(event));
licenseForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const submitter = (event as SubmitEvent).submitter as HTMLButtonElement | null;
  if (submitter?.value === 'cancel') { licenseDialog.close(); return; }
  const token = required<HTMLInputElement>('license-key').value.trim();
  if (!token) { required<HTMLElement>('license-error').textContent = 'Paste the license key from your receipt, then verify it.'; return; }
  void verifyLicense(token);
});

installDemoBanner();
takeLicenseFromUrl();
render();
