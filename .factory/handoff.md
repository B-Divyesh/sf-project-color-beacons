# Handoff — Project Color Beacons v0.1.0

## What shipped

- A Tauri 2 desktop app with a Vite and TypeScript interface.
- Local project records with six high-contrast color, name, and symbol beacons.
- A named confirmation strip before editor settings are written.
- Folder selection through the Tauri dialog API.
- Recursive JSON merging for `.vscode/settings.json` and `.zed/settings.json`.
- VS Code and Cursor title/status colors plus a name and symbol in the window title.
- A supported per-project Zed theme setting for its color cue.
- An empty state, sample loader, clear write errors, remove confirmation, and undo.
- A free three-project tier and a $24 one-time Sociobot license flow.
- License return capture, daily verification cache, and paste-to-restore in both surfaces.
- A responsive install site with `/demo`, `/privacy`, `/terms`, and styled 404 routes.
- A sandboxed demo with three sample projects, reset, and editor-file previews.
- Offline demo shell caching, platform-aware downloads, safe release fallback, and checksum installers.
- Original generated ceramic artwork and three screenshots of the real demo flow.
- A tag-triggered GitHub Actions matrix for macOS Intel/Apple silicon, Windows, and Linux packages.
- Release automation for `SHA256SUMS` and `latest.json`.
- Published release: `https://github.com/B-Divyesh/sf-project-color-beacons/releases/tag/v0.1.0`.

## How to run

```bash
npm ci
npm run dev:site
npm run dev
npm run tauri dev
```

The static deploy command is:

```bash
npm ci && npm run build:site
```

Deploy `dist/site`. Its `index.html` is at that root.

## Verification completed

- `npm test`: 9 passed.
- `npm run build`: passed; produced `dist/app` and `dist/site`.
- `cargo test --manifest-path src-tauri/Cargo.toml --no-default-features`: passed.
- `cargo check --manifest-path src-tauri/Cargo.toml`: passed with Tauri 2 desktop features.
- `npx tsc --noEmit`: passed.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- GitHub Actions release run `33193181021`: passed on all four build targets.
- Published Debian package: SHA-256 verified against the released `SHA256SUMS`.
- Published `latest.json`: valid JSON with 4 macOS, 2 Windows, and 2 Linux download entries.
- Factory `verify-url.sh`: passed with one title, `lang=en`, one `main`, no missing alt text, no unlabeled buttons, and no console errors.
- Playwright Axe checks: no serious or critical issues on home, demo, privacy, terms, 404, or desktop demo screens.
- Mobile check: no horizontal overflow at 390 by 844 pixels.
- Claim tests cover every item in `.factory/claims.json`, including offline reload and demo network isolation.

## Lighthouse-class results

Measured against the production site build on 2026-08-28 with Lighthouse 12.8.0 mobile defaults:

| Category or metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| Largest Contentful Paint | 1.2 s |
| Total Blocking Time | 20 ms |
| Cumulative Layout Shift | 0 |

Initial site JavaScript is 6.53 KB gzip. Initial CSS is 3.37 KB gzip. The mobile hero is 13 KB WebP; the full hero is 36 KB WebP.

## Known gaps

- Zed exposes a supported per-project theme setting but no supported per-project window-title color API. The app supplies the name and symbol in its confirmation strip.
- Release packages are unsigned until the operator supplies platform certificates.
- The success target of 50% fewer wrong-window edits needs a participant study after release. It is not presented as a product claim.

## Needs operator action

1. Register `project-color-beacons` with the Sociobot billing API at $24 one-time before public checkout.
2. Add `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, and `APPLE_TEAM_ID` for macOS signing and notarization.
3. Add `WINDOWS_CERT_PFX` and `WINDOWS_CERT_PASSWORD` for Windows Authenticode signing, then connect them to the release job.
4. Until those secrets are added, keep the published artifacts clearly labelled as unsigned.
