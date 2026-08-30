# Project Color Beacons

Mark each project with a color, name, and symbol before you edit.

Project Color Beacons is a local desktop helper for developers who juggle similar windows. It keeps each saved project's color, name, and symbol after a restart. The app writes supported per-project settings for VS Code, Cursor, and Zed. Existing unrelated JSON settings stay in place.

## Try sample projects

Open `/demo` or run the site locally and visit:

```text
http://localhost:5173/demo
```

The demo opens with Atlas API confirmed and its editor-file preview ready. It also includes Northwind Store and Launch Docs. It writes only to a `demo:` browser storage key. Use **Reset demo** to restore that completed sample.

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
npm run test:unit
npm run typecheck
cargo test --manifest-path src-tauri/Cargo.toml --no-default-features
npm run build
```

`npm run build` creates desktop assets in `dist/app` and the deployable site in `dist/site`. The static deploy command is `npm ci && npm run build:site` with `dist/site` as its output.

The Playwright suite checks every published claim in `.factory/claims.json`. It also checks routes, accessibility, offline reload, mobile width, and console errors.

## Install and release

The release workflow targets these packages when a `v*` tag is pushed:

- macOS: Intel and Apple silicon disk images
- Windows: MSI or executable installer
- Linux: AppImage and Debian package

The workflow publishes `SHA256SUMS`, `latest.json`, a platform-status record, and a GitHub provenance file.

GitHub records the repository, workflow, commit, tag, and checksum for every package.

The landing page detects the operating system and reads release details from GitHub's browser-accessible API.

Every platform requires verified GitHub provenance and a complete release before its download appears. Windows also requires Authenticode verification. macOS requires Apple signing and notarization.

Unsigned Windows and macOS packages stay unavailable. Their purchase links also stay hidden until the required trust checks pass.

After publishing a release, run these independent checks. The first checks release files, checksums, the manifest, and GitHub's package-origin record.

The second checks a downloaded package against the repository identity.

```bash
npm run test:release
gh attestation verify <downloaded-package> --repo B-Divyesh/sf-project-color-beacons
```

Windows and macOS signing need owner certificates. The release status and landing page disclose when those signatures are unavailable.

## Price and privacy

Color, name, symbol, and confirmation are free for up to three projects. A valid license removes the project limit.

To restore a purchase, open the desktop app, choose **License**, and paste the key from your receipt.

The site shows a purchase link only when checkout is active and an installable package exists for the visitor's platform.

Project names, local paths, and settings stay on the device during normal use. A license check sends only the pasted license value to `api.sociobot.in`. Read the shipped `/privacy` and `/terms` pages for details.

## Project layout

- `app/` — Vite and TypeScript desktop interface
- `src-tauri/` — Rust folder validation and editor-file merge
- `site/` — landing, demo, legal pages, service worker, installers
- `shared/` — beacon data and shared visual tokens
- `tests/` — Playwright claim and accessibility checks
- `.factory/` — brief, design, claims, demo, copy audit, and handoff

Licensed under the [MIT License](LICENSE).
