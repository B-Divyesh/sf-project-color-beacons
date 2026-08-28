# Project Color Beacons

Mark each project with a color, name, and symbol before you edit.

Project Color Beacons is a local desktop helper for developers who juggle similar windows. It gives each project folder a stable beacon and a named confirmation strip. The app can merge supported per-project settings for VS Code, Cursor, and Zed. Existing unrelated JSON settings stay in place.

The app does not diagnose attention or reading differences. It does not monitor typing, collect analytics, or upload project paths.

## Try the safe demo

Open `/demo` or run the site locally and visit:

```text
http://localhost:5173/demo
```

The demo includes Atlas API, Northwind Store, and Launch Docs. It writes only to a `demo:` browser storage key. Use **Reset demo** for a clean sample workspace.

## Develop

Requirements: Node 22, npm, Rust stable, and the [Tauri 2 system dependencies](https://v2.tauri.app/start/prerequisites/).

```bash
npm ci
npm run dev          # desktop interface in a browser
npm run dev:site     # landing site
npm run tauri dev    # native desktop window
```

## Test and build

```bash
npm test
cargo test --manifest-path src-tauri/Cargo.toml --no-default-features
npm run build
```

`npm run build` creates desktop assets in `dist/app` and the deployable site in `dist/site`. The static deploy command is `npm ci && npm run build:site` with `dist/site` as its output.

The Playwright suite checks every published claim in `.factory/claims.json`. It also checks routes, accessibility, offline reload, mobile width, and console errors.

## Install and release

GitHub Actions builds unsigned packages when a `v*` tag is pushed:

- macOS: Intel and Apple silicon disk images
- Windows: MSI or executable installer
- Linux: AppImage and Debian package

The workflow publishes `SHA256SUMS` and `latest.json`. The landing page detects the operating system and resolves a matching asset through the GitHub API. Until the first release is published, it links to the Releases page.

Unsigned apps may show an operating-system warning. On macOS, right-click the app and choose **Open**. On Windows, review the publisher warning before installation.

## Price and privacy

All confirmation, editor, symbol, and color-blind features are free for three projects. A $24 one-time license removes the project limit. Checkout and license verification use the Sociobot billing API.

Project data stays in local app storage. A license check sends only the pasted license token to `api.sociobot.in`. Read the shipped `/privacy` and `/terms` pages for details.

## Project layout

- `app/` — Vite and TypeScript desktop interface
- `src-tauri/` — Rust folder validation and editor-file merge
- `site/` — landing, demo, legal pages, service worker, installers
- `shared/` — beacon data and shared visual tokens
- `tests/` — Playwright claim and accessibility checks
- `.factory/` — brief, design, claims, demo, copy audit, and handoff

Licensed under the [MIT License](LICENSE).
