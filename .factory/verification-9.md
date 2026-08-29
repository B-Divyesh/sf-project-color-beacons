# Independent verification 9 — PASS

- **Candidate commit:** `c1cde2049563e449f8c58742bfbc2cf370c4c24e`
- **Live URL:** <https://project-color-beacons.sociobot.in>
- **Demo URL:** <https://project-color-beacons.sociobot.in/demo>
- **Verified:** 2026-08-29 from this clean checkout
- **Work order:** `project-color-beacons-verify-9`
- **Decision:** **PASS — release candidate accepted.**

## Mandatory first-read gate

**PASS.** A new browser context at 1440×900 loaded the live landing page cold
with no console or page errors. The first screen says:

- **What it does:** “Mark the project before you edit.”
- **For whom:** “For dyslexic and ADHD developers who need distinct cues across
  similar project windows.”
- **What to do first:** the visible one-click **Try it with sample data** link,
  immediately followed by “The demo opens a completed sample. Nothing is
  saved.”

The action opened `/demo`; Atlas API was already confirmed, its editor-file
preview was visible, and the persistent banner said “Demo — sample data,
nothing is saved.” At 390×844 the same action was 245.7×46.8 CSS px and opened
the completed sample with no horizontal overflow.

## Claims gate

`.factory/claims.json` is present. After `npm ci`, every exact command in the
registry was run separately against its declared demo/app sandbox. All 17
passed:

| Claim | Result |
| --- | --- |
| `three-cues` | PASS |
| `confirmation-before-write` | PASS |
| `demo-isolated` | PASS |
| `demo-disposal` | PASS |
| `demo-reset` | PASS |
| `offline-reload` | PASS |
| `free-project-limit` | PASS |
| `beacon-stability` | PASS |
| `release-manifest` | PASS |
| `release-signing` | PASS |
| `release-matrix` | PASS |
| `platform-download` | PASS |
| `settings-preserved` | PASS |
| `editor-settings` | PASS |
| `project-data-local` | PASS |
| `license-token-only` | PASS |
| `checkout-availability` | PASS |

Landing-page and README reliance claims were cross-checked against that
registry. No unlisted functional marketing claim was found.

## Clean-checkout quality gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 147 packages installed; audit reported 0 vulnerabilities |
| `npm test` | PASS — 31/31 Playwright tests |
| `npm run test:unit` | PASS — 6/6 Vitest tests |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `cargo test --manifest-path src-tauri/Cargo.toml --no-default-features` | PASS — 2/2 |
| `npm run build` | PASS — produced `dist/app` and `dist/site` |
| `npm run test:release` | PASS — public v0.1.2 metadata, checksums, manifest, and all nine source attestations |
| `npm run test:live:site` | PASS |
| `npm run test:live:billing` | PASS — one $24 product and hosted-checkout redirect |

The Rust test emits six ordinary `dead_code` warnings in the non-Tauri test
configuration; it exits successfully and no warning represents an observed
functional failure.

## End-to-end product evidence

- In a fresh live demo, selecting Northwind Store removed all editor output;
  only **Confirm Northwind Store** exposed its editor preview. Reset restored
  confirmed Atlas API and all three sample projects. **Start for real** returned
  to `/` and removed `demo:pcb:site-state`.
- In a fresh browser-shaped desktop app, the empty state opened the add flow.
  Required name/folder fields used browser validation; a no-editor submission
  gave “Choose at least one editor strip, then save the project.” Selecting VS
  Code and Cursor recovered successfully, saved Payments Worker under
  `pcb:projects`, and showed no preview until confirmation. Confirmation opened
  the selected `.vscode/settings.json` preview with no console errors.
- Rust fixtures confirm supported VS Code/Cursor and Zed setting output while
  preserving an unrelated font size and activity-bar color.
- The three-project boundary opened the license choice; a fixture valid license
  removes the limit. The live billing catalogue exposes exactly one $24 hosted
  Sociobot checkout.

## Deployment identity, desktop package, and installers

The live deployment is the candidate build. Fresh `npm run build` output
matched live SHA-256 bytes for all checked deployable artifacts:

| Artifact | SHA-256 |
| --- | --- |
| `/index.html` | `e761a4f3a9925815aeb0b782870010dcb41c5f3c60a9b640afaa8f1f99277573` |
| `/assets/index-Bi9YgpBX.css` | `743159ba1ec9bfed3e928e054ae75475d77b8694b3a26222f5e48208b39dbd69` |
| `/assets/index-BoeXwlAG.js` | `8202501f4970fcb45032c13575a7189c26f3b88c3127402676c706b0d56787af` |
| `/sw.js` | `ecfb9222a0b9abc16c95c7cb24b25e428c78191dd8036b5c11de724086a51e1e` |

`v0.1.2` contains macOS Intel/Apple-silicon, Windows MSI/EXE, and Linux
AppImage/DEB/RPM packages plus `SHA256SUMS`, `latest.json`, and
`BUILD-PROVENANCE.sigstore.json`. The downloaded Debian package’s SHA-256 was
`a0ac9750cfddd340b59f52916003e455f8e21da319eba9647e12223310947e8a`, exactly
matching `SHA256SUMS`; its metadata is `project-color-beacons 0.1.2 amd64` and
declares its GTK/WebKit runtime dependencies.

The candidate’s deployed Linux installer was also run in an isolated temporary
install location. It exited 0, checked the published checksum, and installed a
76,675,576-byte executable. GitHub CLI was absent in this verifier image, so
the installer correctly printed its documented checksum-only fallback; the
separate `npm run test:release` check verified the published GitHub source
attestation bundle.

The v0.1.2 release source is predecessor commit
`0fcfb94c1d96581214396223658ce0b2d1d6b82c`; candidate `c1cde20` changes the
handoff, live-site regression coverage, and deployed installer provenance-file
suffix, not the packaged desktop executable. This is consistent with the
matching deployed candidate assets and the successful current installer run.

## Live privacy, accessibility, and performance evidence

- Cold landing requests were only same-origin assets plus the disclosed GitHub
  releases API and Sociobot product catalogue; no analytics, trackers,
  third-party scripts, or CDN fonts were observed. A fresh `/demo` interaction
  made only same-origin requests and stored only `demo:pcb:site-state`.
  Project data was not sent externally.
- The live root has HSTS, `nosniff`, strict-origin referrer policy,
  `frame-ancestors 'none'` in a response-header CSP, camera/microphone/location
  restrictions, 30-second HTML revalidation, and one-year immutable caching
  for hashed JS. `/privacy`, `/terms`, `/demo`, and `/404.html` return 200;
  an unknown path returns 404.
- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, 1155ms load, title,
  `lang=en`, exactly one h1, main landmark, complete image alts, labelled
  buttons, and no console errors. Independent Playwright Axe scans of `/` and
  `/demo` found zero serious/critical violations. The full suite also covers
  all legal/404 routes and dark treatment.
- Keyboard Tab begins with Skip to content and every sampled interactive demo
  control had a visible `rgb(214, 111, 53) solid 3px` focus outline. At 390px
  the completed demo fit exactly (`scrollWidth=390`, `innerWidth=390`).
  In reduced-motion media, transitions and animations are reduced to 0.01ms.
- Production initial JS is 21.90 kB raw / 7.79 kB gzip and site CSS is 12.94
  kB raw / 3.76 kB gzip; both are well under the static budget.

## API allowance and sign-in scope

The static product has no first-party backend or sign-in flow. Its documented
Sociobot license verifier was tested from one client with a harmless invalid
fixture token: requests 1–30 returned 200, and requests 31–35 returned **429**
with both `Retry-After: 4` and `x-ratelimit-after: 4`. Observed allowance: **30
accepted verification requests per active window**. No Entra tenant applies.

## Defects by severity

No release-blocking, major, moderate, or minor product defects were found.

**Environment note (not a product defect):** extracted Debian-package launch
could not start in this minimal verifier container because its declared GTK and
WebKit shared libraries are not installed. The package metadata explicitly
depends on those libraries; checksum, architecture, contents, installer, and
native Rust behavior were verified independently.

## Follow-up

No code change is required for this candidate. Optional operator work remains
the already-disclosed Apple notarization and Windows trust-store signing
credentials for a future release.
