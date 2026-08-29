export type Beacon = {
  id: string;
  name: string;
  color: string;
  symbol: string;
  symbolName: string;
};

export type Project = {
  id: string;
  name: string;
  path: string;
  beaconId: string;
  editors: Array<'vscode' | 'zed'>;
  createdAt: number;
};

export const BEACONS: Beacon[] = [
  { id: 'fjord', name: 'Fjord', color: '#176B78', symbol: '◒', symbolName: 'half moon' },
  { id: 'ember', name: 'Ember', color: '#B34835', symbol: '✕', symbolName: 'cross' },
  { id: 'lichen', name: 'Lichen', color: '#4B7043', symbol: '◆', symbolName: 'diamond' },
  { id: 'saffron', name: 'Saffron', color: '#9A6813', symbol: '≋', symbolName: 'three waves' },
  { id: 'iris', name: 'Iris', color: '#66538C', symbol: '⌂', symbolName: 'arch' },
  { id: 'slate', name: 'Slate', color: '#485E68', symbol: '▥', symbolName: 'bars' }
];

export const SAMPLE_PROJECTS: Project[] = [
  { id: 'sample-atlas', name: 'Atlas API', path: '/work/acme/atlas-api', beaconId: 'fjord', editors: ['vscode', 'zed'], createdAt: 1 },
  { id: 'sample-store', name: 'Northwind Store', path: '/work/acme/northwind-store', beaconId: 'ember', editors: ['vscode'], createdAt: 2 },
  { id: 'sample-docs', name: 'Launch Docs', path: '/work/acme/launch-docs', beaconId: 'iris', editors: ['zed'], createdAt: 3 }
];

export function beaconFor(id: string): Beacon {
  return BEACONS.find((beacon) => beacon.id === id) ?? BEACONS[0];
}

export function editorPreview(project: Project) {
  const beacon = beaconFor(project.beaconId);
  const themes: Record<string, string> = {
    fjord: 'Tokyo Night', ember: 'Ayu Dark', lichen: 'Gruvbox Dark',
    saffron: 'Solarized Dark', iris: 'Rosé Pine', slate: 'One Dark'
  };
  return {
    vscode: {
      'workbench.colorCustomizations': {
        'titleBar.activeBackground': beacon.color,
        'titleBar.activeForeground': '#FFFFFF',
        'statusBar.background': beacon.color,
        'statusBar.foreground': '#FFFFFF'
      },
      'window.title': `${beacon.symbol} ${project.name} — \${activeEditorShort}`
    },
    zed: {
      theme: {
        mode: 'dark',
        dark: themes[project.beaconId] ?? themes.fjord,
        light: themes[project.beaconId] ?? themes.fjord
      }
    }
  };
}

export function selectedEditorFiles(project: Project) {
  const preview = editorPreview(project);
  return project.editors.map((editor) => editor === 'vscode'
    ? { path: '.vscode/settings.json', settings: preview.vscode }
    : { path: '.zed/settings.json', settings: preview.zed });
}

export function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `project-${Date.now()}`;
}
