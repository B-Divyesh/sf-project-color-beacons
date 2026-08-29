# Handoff — polish round 1

## Outcome

All 15 adversarial review findings were addressed in the product, tests, claims registry, copy, routes, and release workflow. The repaired static site is live at <https://project-color-beacons.sociobot.in>. The deployed JavaScript hash matches the local release build.

The repair preserves the generated ceramic-beacon identity, ruled-paper grid, serif display type, teal controls, and red/violet/teal project symbols documented in `.factory/design.md`.

## What changed

- Seeded the isolated demo with a completed Atlas API result and editor-file preview; Reset restores it, and Start for real deletes demo storage.
- Added real known-route rewrites, HTTP 404 behavior, complete route metadata/titles, navigation focus, and a full standalone 404 skeleton.
- Rewrote the flagged first-screen, privacy, demo, cue, pricing, and 404 copy in plain words.
- Expanded `.factory/claims.json` to 16 claims and made every ID map to exactly one tagged observable test.
- Added fixture-backed release-manifest, signing-policy, matrix, and three-platform download tests.
- Made release publication require Windows signing plus macOS signing and notarization credentials.
- Updated the catalog description to: “Mark each project with a color, name, and symbol before you edit.”
- Recorded the full finding-to-evidence map in `.factory/polish-1.md`.

## Verification

Clean clone: `/work/pcb-clean-7uAinI`

- `npm ci` — passed; 0 vulnerabilities.
- All 16 exact `.factory/claims.json` test commands — passed separately.
- `npm test` — 22/22 passed.
- `npm run test:unit` — 6/6 passed.
- `npm run typecheck` — passed.
- `npm run build` — passed; `dist/app` and `dist/site` created.
- `cargo fmt --check --manifest-path src-tauri/Cargo.toml` — passed.
- `cargo test --manifest-path src-tauri/Cargo.toml --no-default-features` — 2/2 passed.
- `cargo check --manifest-path src-tauri/Cargo.toml` — passed with default Tauri features.
- `CI=false npm run tauri -- build --bundles deb` — passed and produced `src-tauri/target/release/bundle/deb/Project Color Beacons_0.1.1_amd64.deb`.

Production:

- Deployment ID `2e64ee36-94f3-4c8f-9685-2bb3ce4a15e3` succeeded.
- `npm run test:live:site` — passed all route, metadata, Axe, 390 px, keyboard, reduced-motion, same-origin privacy, demo, offline, download, billing UI, and license-return checks.
- `npm run test:live:billing` — passed the live $24 catalogue item and hosted checkout redirect.
- Factory `verify-url.sh` — passed with no console errors.
- Route statuses: `/`, `/demo`, `/privacy`, `/terms`, and `/404.html` returned 200; a cold unknown URL returned 404.
- Live Lighthouse — Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.71 s, CLS 0, TBT 34 ms.
- Site bundle — 20.17 kB JS (7.10 kB gzip) and 12.31 kB CSS (3.63 kB gzip).
- Deployed JS SHA-256 — `14fba1e78801849e1548c1440741724e0778cb6362678949ec1ce1b20eef56ec`, identical to the local build.
- Evidence — `.factory/evidence/polish-1/` (live screenshots, verifier output, and Lighthouse JSON; intentionally ignored as generated evidence).

## Run and verify

```sh
npm ci
npm run typecheck
npm run test:unit
npm test
npm run build
npm run test:live:site
npm run test:live:billing
```

## Needs operator action

The existing public v0.1.1 desktop release predates this repair and is unsigned. No Apple or Windows signing credentials are available in the repository, GitHub Actions secrets, or the factory key vault, so it cannot honestly be re-signed in this work order. The workflow now blocks any new unsigned release.

Before creating the next `v*` tag, add these GitHub Actions secrets:

- `APPLE_CERTIFICATE`
- `APPLE_CERTIFICATE_PASSWORD`
- `APPLE_SIGNING_IDENTITY`
- `APPLE_ID`
- `APPLE_PASSWORD`
- `APPLE_TEAM_ID`
- `WINDOWS_CERT_PFX`
- `WINDOWS_CERT_PASSWORD`

Then dispatch the release workflow, verify the macOS notarization ticket and Windows Authenticode signature, and replace the old v0.1.1 assets. This is the only external operator dependency; there are no source, test, site, accessibility, privacy, offline, routing, or deployment gaps.
