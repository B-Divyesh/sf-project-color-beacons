# Verification 14 — FAIL

**Candidate:** `44492d1c7b69d1bfde9a1462ad2d890b3c19163a`  
**Live URL:** <https://project-color-beacons.sociobot.in>  
**Verified:** 2026-08-30 UTC  
**Decision:** **FAIL — release-blocking desktop distribution defect**

## Release blocker

### P0 — Windows and macOS have no installable desktop package

Fresh Chromium checks against the live site, using each operating system's user
agent, found:

| Platform | Live result |
| --- | --- |
| Linux | `Download for Linux` links to `Project.Color.Beacons_0.1.5_amd64.AppImage`; the site says its package origin is verified. |
| Windows | `Verified Windows download pending`; the download control has `aria-disabled="true"` and no `href`. |
| macOS | `Verified macOS download pending`; the download control has `aria-disabled="true"` and no `href`. |

This violates the desktop-app acceptance contract: a release must have real
assets for macOS (Intel and Apple silicon), Windows, and Linux, and the
detected-platform button must link to a real asset. It also prevents the
one-time license from being purchased on Windows and macOS.

The source confirms this is not merely a UI delay: `.github/workflows/release.yml`
hard-fails the Windows and macOS matrix entries when signing credentials are
absent. Since `finish` has `needs: build`, that failure also prevents the
release-finalization job from running. The product may not be accepted until
the signed Windows and notarized macOS packages are published and independently
verified.

## Required claims — all passed

From a clean `npm ci` install, I ran each exact command in
`.factory/claims.json` separately through the shipped demo entry point. All
19 passed; the final Playwright result was `test-results/.last-run.json` =
`passed` with no failed tests.

| Claim ID | Result |
| --- | --- |
| `three-cues` | PASS |
| `confirmation-before-write` | PASS |
| `demo-isolated` | PASS |
| `demo-disposal` | PASS |
| `demo-reset` | PASS |
| `offline-reload` | PASS |
| `free-project-limit` | PASS |
| `desktop-license-recovery` | PASS |
| `beacon-stability` | PASS |
| `release-manifest` | PASS |
| `release-signing` | PASS |
| `release-matrix` | PASS |
| `platform-download` | PASS |
| `platform-signatures` | PASS |
| `settings-preserved` | PASS |
| `editor-settings` | PASS |
| `project-data-local` | PASS |
| `license-token-only` | PASS |
| `checkout-availability` | PASS |

The release/download claims use fixture releases; they do not establish that
the required Windows and macOS packages are actually published. The live
check above is therefore the decisive evidence for the blocker.

## Local verification

- `npm ci` — passed; 193 packages installed, audit reported zero vulnerabilities.
- `npm run lint` — passed.
- `npm run typecheck` — passed.
- `npm run test:unit` — passed, 7/7.
- `npm test` — passed, 34/34 Playwright tests.
- `npm run build` — passed and produced `dist/app` and `dist/site`.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check` — passed.
- `cargo test --manifest-path src-tauri/Cargo.toml --no-default-features` — passed, 2/2.
- `sh -n site/public/install.sh` — passed.
- Initial site JS: 22,966 bytes raw / 8,178 bytes gzip; site CSS: 13,252
  bytes raw / 3,839 bytes gzip. Both are within the static budget.

I also attempted the Linux package build exactly as `CI=false npm run tauri --
build --bundles deb`. It did not complete in this disposable verifier image
because its documented Tauri system prerequisite is absent:
`pkg-config` cannot locate `glib-2.0`. This is an environment limitation, not
evidence of a source failure; the ordinary production asset build above passed.

## Live product QA

### First read

Cold desktop load returned HTTP 200 with the title `Project Color Beacons —
Mark the right project`. The first screen says it is a “local desktop helper,”
states it is for “dyslexic and ADHD developers” using similar project windows,
and exposes the one-click **Try it with sample data** action with the note “The
demo opens a completed sample. Nothing is saved.” This passes the plain-words
and demo first-read gate.

The live HTML references `assets/index-HaB4W1-u.js` and
`assets/index-CKYFeAu2.css`, exactly matching a fresh production build from
the candidate commit.

### Functional, privacy, accessibility, and resilience checks

- The live `/demo` normal flow selected Northwind Store, required a named
  confirmation, displayed only its VS Code preview, and reset back to the
  completed Atlas API sample with all three projects.
- Browser-version desktop app QA covered the same normal flow, a four-project
  boundary, missing required fields, folder-selection recovery, and duplicate
  folder recovery. The recovery messages were specific and no console/page
  errors occurred.
- A fresh demo context recorded requests only to
  `https://project-color-beacons.sociobot.in`; its only storage key was
  `demo:pcb:site-state`. Offline reload after service-worker readiness showed
  Atlas API and the demo heading without errors.
- Desktop and 390px mobile demo checks had zero horizontal overflow, no
  undersized visible interactive controls, and no console/page errors. Dark
  mode also had no Axe violations.
- Axe returned no violations on desktop and 390px mobile demo pages. Keyboard
  Tab reaches the skip link first; keyboard Enter operates project selection
  and confirmation. The tested focus ring was solid, 3px, and visible in dark
  mode. Reduced-motion transition and animation durations were `1e-05s`.
- `/`, `/demo`, `/privacy`, and `/terms` each returned 200. An unknown route
  returned the designed 404 with HTTP 404. Internal links returned 200.
- Response headers include CSP with `frame-ancestors 'none'`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy:
  strict-origin-when-cross-origin`, and a restrictive Permissions Policy.
  Hashed JavaScript is served with `Cache-Control: public, max-age=31536000,
  immutable`.

No product-owned server-side endpoint is present in this static/Tauri product,
so a product API rate-limit/429 test is not applicable. The optional license
verification is a direct client call to the factory billing service, not a
product-operated server endpoint.

## Required remediation

1. Publish and verify Windows MSI/EXE with valid Authenticode signatures.
2. Publish and verify Intel and Apple-silicon macOS packages with Apple signing
   and notarization.
3. Confirm the live Windows and macOS detected-platform buttons have real,
   checksum/provenance-verified asset links; then re-run independent release
   verification.
