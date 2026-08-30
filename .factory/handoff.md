# Project Color Beacons — verification 14 handoff

## Outcome: **FAIL**

Candidate `44492d1c7b69d1bfde9a1462ad2d890b3c19163a` was independently
verified against <https://project-color-beacons.sociobot.in> on 2026-08-30.
It is not releasable as a desktop app: the live site offers a verified Linux
download, but both Windows and macOS show a pending state with no package link.
This fails the required all-platform desktop release contract.

See `.factory/verification-14.md` for complete evidence, claim results, and
remediation.

Repair commits:

- `db35e4933b73d11052af84461192c43b77a73d9d` — platform trust gates, license handoff, claims, copy, tests, and release workflow.
- `a500849268c86715715cbd1ecdb676f67afff524` — deterministic route scroll restoration and reduced-motion handling.
- `fa186752248d506c66b89a00093eeb8525e8e160` — suppress stale scroll events during route transitions.

Deployment ID: `b982f36e-7491-4b53-9461-6aa9bbabce0c`.

## Previous builder handoff (superseded by the FAIL above)

- Windows downloads now require Authenticode verification.
- macOS downloads now require Apple signing and notarization.
- The release workflow stops before publication when those credentials or checks are missing.
- The landing page, checkout, and install scripts withhold untrusted packages. Current v0.1.5 Windows/macOS artifacts are not linked or sold.
- Website license verification and storage were removed. A checkout return can be copied once and pasted into the desktop License dialog.
- Added the tagged `desktop-license-recovery` claim and expanded trust, checkout, mobile, privacy, and live tests.
- Replaced README jargon, updated the 66-character verb-first catalog description, and refreshed the copy audit.
- Removed implicit smooth route scrolling and isolated transition events so Back and Forward restore each entry exactly. Explicit preview motion respects reduced-motion settings.
- Preserved the glacial ceramic identity, Tauri desktop class, local-first app, and isolated `demo:` storage.

## Verification

Clean clone `/tmp/project-color-beacons-clean.QmZ7oa` at `fa186752248d506c66b89a00093eeb8525e8e160`:

- `npm ci` — 193 packages, 0 vulnerabilities.
- Every one of the 19 `.factory/claims.json` commands — passed separately.
- `npm test -- --reporter=line` — 34/34 passed.
- `npm run test:unit` — 7/7 passed.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run build` — passed; site JS 22.97 kB raw / 8.13 kB gzip, CSS 13.25 kB raw / 3.84 kB gzip.
- `npm audit --audit-level=moderate` — 0 vulnerabilities.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check` — passed.
- `cargo test --manifest-path src-tauri/Cargo.toml --no-default-features` — 2/2 passed.

Additional checks:

- `CI=false npm run tauri -- build --bundles deb` — produced `src-tauri/target/release/bundle/deb/Project Color Beacons_0.1.5_amd64.deb`.
- `npm run test:release` — v0.1.5 package checksums, manifest, GitHub provenance, and platform records passed. Result: Linux installable; Windows/macOS withheld.
- `npm run test:live:site` — routes, zero-violation Axe scans, mobile, keyboard, history, privacy, demo disposal, offline reload, trust gates, and license handoff passed.
- `npm run test:live:billing` — one active $24 product and hosted checkout redirect passed.
- `/opt/fleet/lib/verify-url.sh` — `/`, `/demo`, `/privacy`, and `/terms` each had a title, `lang=en`, one h1, main, alt text, and no console errors.
- Cold unknown route — `/not-a-page` returned HTTP 404 with the designed 404 page.
- Lighthouse mobile — performance 99, accessibility 100, best practices 100, SEO 100; LCP 1.7 s, CLS 0, TBT 70 ms, transfer 103 KiB.
- `sh -n site/public/install.sh` — passed.

Evidence: `.factory/evidence/polish-4/` and `.factory/polish-4.md`.

## Run locally

```sh
npm ci
npm run dev:site
npm run dev
npm test
npm run build
```

The isolated browser demo is <https://project-color-beacons.sociobot.in/demo>.

## Needs operator action

No source-code or review work remains. To publish Windows/macOS downloads, add
these GitHub Actions secrets and trigger the next `v*` release:

- Windows: `WINDOWS_CERT_PFX`, `WINDOWS_CERT_PASSWORD`.
- Apple: `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`.

Until those checks pass, the product intentionally offers only the verified
Linux package. Windows/macOS links and purchase access remain unavailable.
