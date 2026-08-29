# Independent verification 10 — FAIL

- **Candidate commit:** `ba67ec25836d62eb4c53dd2b322d0ef3330924c3`
- **Live URL:** <https://project-color-beacons.sociobot.in>
- **Demo URL:** <https://project-color-beacons.sociobot.in/demo>
- **Verified:** 2026-08-29 from the supplied clean checkout
- **Work order:** `project-color-beacons-verify-10`
- **Decision:** **FAIL — release blocked.** The site is deployed and matches the candidate, but no verified candidate desktop package can be downloaded or installed.

## Release-blocking finding

### Blocker — the desktop product has no verified installable candidate release

The acceptance contract is for a desktop app whose smallest useful job writes supported editor settings. The browser demo explains that job, but it cannot choose a real folder or perform the native write.

Fresh release evidence:

- `npm run test:release` exited nonzero: the latest release has no verified-release marker, no passed Windows signature record, no passed macOS signing/notarization records, and no `platform-signatures.json`.
- GitHub's latest public release is `v0.1.2`, published from predecessor commit `0fcfb94c1d96581214396223658ce0b2d1d6b82c`. The candidate declares version `0.1.3`; there is no `v0.1.3` release or release workflow run for this candidate.
- The live landing page therefore says **Verified Linux download pending**, exposes no package or checkout link, and says verified downloads are not published.
- Running the live one-line Linux installer in an isolated temporary home exited `1` with `A verified desktop release is not published yet.` It installed no file.
- The historical v0.1.2 Debian file still matches its published checksum (`a0ac9750cfddd340b59f52916003e455f8e21da319eba9647e12223310947e8a`) and identifies as `project-color-beacons 0.1.2 amd64`, but it is not the candidate and lacks the new required platform trust record.

The fail-closed download behavior is correct safety behavior. It does not satisfy the installable-desktop definition of done. An operator must provide signing credentials and publish a verified v0.1.3 release before acceptance.

## Mandatory first-read gate

**PASS.** A fresh 1440×900 browser context loaded the live root cold.

- **What it does:** “Mark the project before you edit.”
- **For whom:** “For dyslexic and ADHD developers who need distinct cues across similar project windows.”
- **What to click first:** the visible primary link **Try it with sample data**.
- **What happens next:** “The demo opens a completed sample. Nothing is saved.”

The one-click action opens `/demo` with Atlas API already confirmed, three realistic sample projects, an editor-file preview, and the persistent “Demo — sample data, nothing is saved” banner. At 390×844 the action is 245.7×46.8 CSS px and the price fact remains in the initial viewport.

## Claims gate

`.factory/claims.json` exists and contains 18 entries. The first pre-install invocation could not load the absent local `@playwright/test`, as expected in the clean clone. After `npm ci`, every exact registered command was run separately; **18/18 passed**.

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
| `platform-signatures` | PASS |
| `settings-preserved` | PASS |
| `editor-settings` | PASS |
| `project-data-local` | PASS |
| `license-token-only` | PASS |
| `checkout-availability` | PASS |

Landing, legal, demo, and README reliance statements were cross-checked against the registry. No unlisted functional claim was found.

## Clean-checkout quality gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 193 packages; audit reported 0 vulnerabilities |
| Every command in `.factory/claims.json` | PASS — 18/18 |
| `npm test` | PASS — 32/32 Playwright tests |
| `npm run test:unit` | PASS — 7/7 Vitest tests |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities |
| `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` | PASS |
| `cargo test --manifest-path src-tauri/Cargo.toml --no-default-features` | PASS — 2/2 |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS — 2/2 after installing the exact Linux libraries declared by the workflow |
| `cargo check --manifest-path src-tauri/Cargo.toml` | PASS |
| `cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings` | PASS |
| `npm run build` | PASS — produced `dist/app` and `dist/site` |
| `npm run test:live:site` | PASS |
| `npm run test:live:billing` | PASS — one $24 product and hosted checkout redirect |
| `npm run test:release` | **FAIL — release blocker described above** |

The full default-feature Rust build initially reported missing `glib-2.0`. README points developers to Tauri prerequisites; after installing the workflow's exact Ubuntu packages, the test, check, and Clippy runs passed. This was an environment prerequisite, not a source defect.

## Candidate and deployment identity

The checkout was clean and `HEAD` was the requested candidate. A fresh production build was compared byte-for-byte with the live origin. **All 19 public build artifacts matched**, including HTML, JS, CSS, service worker, installers, manifest, icons, and images.

Key SHA-256 values:

| Artifact | SHA-256 |
| --- | --- |
| `/index.html` | `6925c172100b452267fa09685e3de4d54e7d5d1509b0eede409016a8435e9bd9` |
| `/assets/index-Cqf0NjHx.js` | `ac73008b73c3c8fbbe10d4f22d8b6f9c1f60bb9cc50554ae7b23eb7d020162cd` |
| `/assets/index-Bi9YgpBX.css` | `743159ba1ec9bfed3e928e054ae75475d77b8694b3a26222f5e48208b39dbd69` |
| `/sw.js` | `ecfb9222a0b9abc16c95c7cb24b25e428c78191dd8036b5c11de724086a51e1e` |
| `/install.sh` | `4f3e16d7ccd44e2aa237cbd78218c4b0bf3a58d24dcecec141e0136dd1a2901b` |

The prior deployment concern is not reproduced: the static candidate is live, current, and exact. The failing condition is desktop release publication and signing.

## End-to-end behavior

Independent flows were exercised in addition to the repository tests.

- **Normal demo:** Atlas API opened completed. Selecting Northwind Store cleared editor output; only confirming the named project exposed `.vscode/settings.json`. Reset restored completed Atlas API and all three samples. Start for real removed `demo:pcb:site-state`.
- **Normal desktop-shaped app:** a fresh browser build showed the empty state. Payments Worker saved after a folder, beacon, and editor were chosen. No editor preview appeared before checking and confirming it. The preview contained only the selected VS Code/Cursor file.
- **Invalid input and recovery:** blank required fields triggered browser validation; choosing no editor produced a clear live error; restoring one editor saved successfully. Reusing a folder produced “That folder already has a beacon.” Removal required confirmation and Undo restored the project.
- **Boundary:** loading three samples made the fourth-project action open the license choice. Submitting a blank license produced a specific recovery instruction. Fixture coverage confirms a valid license removes the limit.
- **Native core:** Rust fixtures wrote VS Code/Cursor and Zed settings and retained unrelated existing JSON values.
- **Responsive boundary:** both live demo and production app UI fit 390 CSS px with text enlarged to 200% (`scrollWidth = clientWidth = 390`) after confirming the longest sample.

No console or page errors occurred in these successful flows.

## Privacy, network, and headers

- A fresh live demo interaction through select, confirm, reset, and storage inspection made only same-origin requests. Its only relevant storage key was `demo:pcb:site-state`; leaving demo removed it.
- A cold landing load requested only same-origin HTML/assets plus the disclosed GitHub releases API. No analytics, trackers, third-party scripts, or remote fonts appeared.
- The app privacy claim is covered by the passing `project-data-local` request capture. The license request test confirms only the pasted token is sent to `api.sociobot.in`.
- Root, demo, privacy, terms, and real 404 responses carry HSTS, `nosniff`, strict-origin referrer policy, camera/microphone/location restrictions, and response-header CSP with `frame-ancestors 'none'`.
- HTML and service-worker responses revalidate after 30 seconds. Hashed JS, CSS, and image assets use `public, max-age=31536000, immutable`.
- All discovered navigable links returned 200; mail links were explicit. The disabled pending-download element intentionally has no URL.

## Accessibility, mobile, offline, and performance

- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, 1217 ms load, title, `lang=en`, one h1, main landmark, complete image alternatives, labelled buttons, and no console errors.
- Independent Axe scans of root, demo, privacy, terms, and 404 in both light and dark treatments found zero serious/critical findings. The full suite found zero Axe violations.
- Keyboard Tab begins with Skip to content. Sampled interactive elements show the designed `3px` orange focus outline and operate with Enter. Dialog focus starts in the named input or heading. No trap was found.
- Sampled mobile demo controls were at least 44×44 CSS px. The 390px layout had zero horizontal overflow. The viewport permits zoom and the 200% text checks passed.
- Reduced-motion media reduced sampled animation and transition durations to `0.00001s`.
- The service worker at `/sw.js` was activated, `registration.update()` completed, and `/demo` reloaded successfully after the context went offline.
- Clean mobile Lighthouse: performance **97**, accessibility **100**, best practices **100**, SEO **100**; FCP 0.9 s, LCP 1.9 s, CLS 0, TBT 190 ms, 54 KiB transferred, no runtime error.
- Production bundles: site JS 22.14 KB raw / 7.88 KB gzip; site CSS 12.94 KB raw / 3.76 KB gzip; app JS 11.65 KB raw / 4.75 KB gzip; app CSS 9.98 KB raw / 3.13 KB gzip.

## API allowance and sign-in scope

The static product has no first-party backend and no sign-in flow, so Entra External ID does not apply. The Sociobot product verifier is the only runtime product endpoint tested for allowance.

From one client, invalid license checks 1–30 returned 200 with `{ valid: false, reason: "invalid" }`. Requests 31–33 returned **429** with `Retry-After: 4` and `x-ratelimit-after: 4`. Observed allowance: **30 accepted requests per active window**.

## Defects by severity

- **Release blocker:** no verified, signed, installable desktop release for candidate v0.1.3; the live download and installer are unavailable.
- **Major:** none found beyond the blocker.
- **Moderate:** none found.
- **Minor:** none found.

## Required next step

Provide the Windows and Apple signing/notarization secrets documented in the workflow, publish tag `v0.1.3`, confirm the release contains every platform package plus `SHA256SUMS`, `latest.json`, `BUILD-PROVENANCE.sigstore.json`, and `platform-signatures.json`, then rerun this verification. Acceptance requires `npm run test:release`, the detected live download, checksum/signature checks, and the one-line installer to pass against that candidate release.
