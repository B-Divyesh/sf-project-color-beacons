# Handoff — repair 3

## Independent verification 4: PASS

Candidate `7fcd61ab9d4245eee3a2af1293c5cc3b0bfe9bf5` was independently
verified against https://project-color-beacons.sociobot.in on 2026-08-29 and
**PASSES** release QA. All 11 declared claim commands, the 14-test Playwright
suite, unit tests, typecheck, static production build, live site/billing
checks, accessibility checks, privacy request logging, response-header checks,
mobile/keyboard/reduced-motion checks, and public-release checksum checks
passed. Local and deployed static artifact hashes match exactly. See
`.factory/verification-4.md` for exact commands, observations, rate-limit
evidence, and the container-only AppImage/FUSE limitation.

## Release status: repaired

The two release blockers in verifier report commit
`70f3826a2bf3634492b857a85c61f2aab8693768` are repaired. The repaired source
is version `0.1.1`; the static site is live at
https://project-color-beacons.sociobot.in.

## What changed

### Purchasable one-time license

- Registered and enabled `project-color-beacons` in the production Sociobot
  catalogue as **Project Color Beacons**, USD 2,400 minor units ($24), one
  time.
- The public catalogue now returns exactly one matching product and the
  product checkout endpoint returns HTTP 303 to a hosted
  `checkout.dodopayments.com` session.
- Added `npm run test:live:billing` to check the live catalogue identity,
  price, product URL, checkout URL, and hosted-checkout redirect without
  placing a charge.
- Existing tests still prove returned-token storage and URL stripping,
  restore by pasted token, token-only verification, invalid-token locking,
  and unlimited-project activation from a valid verification response.

### Demo workspace disposal

- Reproduced the verifier's sequence: select **Northwind Store**, choose
  **Start for real**, return to `/demo`; the selected project and
  `demo:pcb:site-state` previously remained.
- **Start for real** now deletes `demo:pcb:site-state` before leaving the web
  demo and deletes `demo:pcb:projects` before leaving the desktop-shaped demo.
- Added claim `demo-disposal` and one exact tagged regression,
  `@claim:demo-disposal`. It exercises both demo surfaces, asserts each key
  existed first, asserts it is removed on exit, and confirms the reopened web
  demo starts at its initial prompt.
- Updated `.factory/demo.md` to state the now-tested behavior.

### Release and live verification coverage

- Added `npm run test:live:site`, which checks every live route for title,
  language, landmarks, one `h1`, image alternatives, console errors, and Axe
  serious/critical findings. It also covers the 390 px layout, keyboard focus,
  same-origin demo requests, demo disposal, reduced motion, service-worker
  update and offline reload, billing UI identity, and returned-license URL
  cleanup.
- Bumped the package, Rust crate, Tauri app, and displayed build identity to
  `0.1.1` so desktop downloads contain the repair.

## Verification evidence

Run from a clean npm install on 2026-08-29:

- `npm ci` — 67 packages installed; 0 vulnerabilities.
- Every exact command in `.factory/claims.json` — **11/11 passed**, with one
  and only one test tagged for each claim.
- `npm test` — **14/14 Playwright tests passed**.
- `npm run test:unit` — **4/4 Vitest tests passed**.
- `npm run typecheck` — passed. There is no separate JavaScript lint script.
- `npm audit --audit-level=high` — 0 vulnerabilities.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check` — passed.
- `cargo test --manifest-path src-tauri/Cargo.toml --no-default-features` —
  **2/2 passed**.
- `cargo check --manifest-path src-tauri/Cargo.toml` — passed with the Linux
  Tauri prerequisites installed.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`
  — passed.
- `npm run build` — passed and produced `dist/app` and `dist/site`.
- `CI=false npm run tauri -- build --bundles deb,appimage` — produced a
  version 0.1.1 amd64 Debian package and AppImage. The Debian executable had no
  unresolved shared libraries, and the AppImage extracted successfully.
- Local Debian SHA-256:
  `194606dd632d1edfede683d9f3356b8cb266711ffd95342b2f142c3e36ac3d43`.
- Local AppImage SHA-256:
  `3f77320df78518c90cdad726b5b4d56dd1ca018163b3820fe4d5cd552c1d7707`.

The static build remains well inside its budget: initial site JavaScript is
19.62 kB raw / 6.89 kB gzip and CSS is 11.15 kB raw / 3.39 kB gzip. The
desktop webview JavaScript is 11.45 kB raw / 4.65 kB gzip.

## Production evidence

- Azure Static Web Apps deployment:
  `6b2bf2bd-d512-4437-8a2e-b8776235e032`; custom-domain response HTTP 200.
- `npm run test:live:site` — passed routes, Axe, mobile, keyboard, privacy,
  demo disposal, offline update/reload, the resolved v0.1.1 Linux download,
  billing UI, and license return.
- `npm run test:live:billing` — passed one matching $24 product and live hosted
  checkout redirect.
- Factory `verify-url.sh` — HTTP 200 in 686 ms; no console errors; correct
  title and `lang=en`; one `h1`; one `main`; no missing image alternatives or
  unlabeled buttons.
- Lighthouse 12.8.2 mobile — performance **100**, accessibility **100**, best
  practices **100**, SEO **100**; LCP 960 ms, CLS 0, TBT 21 ms.
- Live and local SHA-256 values match for `index.html`, hashed JavaScript,
  hashed CSS, and `sw.js`.
- HSTS, CSP, `nosniff`, referrer, and permissions policies are present. Hashed
  assets use one-year immutable caching.
- GitHub Actions run
  https://github.com/B-Divyesh/sf-project-color-beacons/actions/runs/33254820710
  completed successfully: Linux, Windows, both macOS architectures, and the
  final publish job all passed.
- Public release
  https://github.com/B-Divyesh/sf-project-color-beacons/releases/tag/v0.1.1
  is non-draft and non-prerelease. It contains arm64/x64 macOS DMGs and app
  archives, Windows MSI and EXE installers, Linux AppImage/deb/rpm packages,
  `SHA256SUMS`, and `latest.json`.
- Downloaded `latest.json` reports version `0.1.1` and contains 4 macOS, 2
  Windows, and 2 Linux download records. A fresh public Debian download has
  package identity `project-color-beacons` / `0.1.1` / `amd64`; SHA-256
  `e752d589fd324f1d948b1fe6a446864ec78ccc5ae53064cfcff34879ba034c35`
  matches the published `SHA256SUMS` entry.

## Run it again

```bash
npm ci
npm test
npm run test:unit
npm run typecheck
npm run build
npm run test:live:site
npm run test:live:billing
```

## Needs operator action

Desktop artifacts are unsigned. Apple notarization and Windows Authenticode
still require the owner's `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` signing
credentials. No live card charge was placed during repair; the production
catalogue and hosted checkout boundary were verified without completing a
purchase.
