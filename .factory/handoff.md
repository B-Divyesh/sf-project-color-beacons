# Repair 7 handoff — release published and deployed

## Outcome

The release blocker in independent verification 10 is repaired. A real `v0.1.3` desktop release now exists for repair commit `eeca261cd66c112a1cdc6cc8f0248479ca733742`, and the live Linux download and installer complete successfully.

- Live site: <https://project-color-beacons.sociobot.in>
- Demo: <https://project-color-beacons.sociobot.in/demo>
- Release: <https://github.com/B-Divyesh/sf-project-color-beacons/releases/tag/v0.1.3>
- Successful release workflow: <https://github.com/B-Divyesh/sf-project-color-beacons/actions/runs/33284151367>

The researched brief, desktop-app class, Tauri 2 architecture, visual thesis, demo behavior, privacy boundaries, and every previously passing product behavior remain in place.

## Root cause and repair

Verification 10 found no installable package for candidate version 0.1.3. The latest release was an older unsigned v0.1.2, the site correctly failed closed, and the Linux installer stopped without writing a file.

The release contract also coupled all platforms to unavailable Apple and Windows owner certificates. That made a provenance-verified Linux package unavailable for reasons that do not apply to Linux. Repair 7 now evaluates each platform's trust requirement independently:

- Linux requires a GitHub provenance record tied to this repository, workflow, commit, tag, and every package digest.
- Windows requires a valid Authenticode result before its site download or checkout appears.
- macOS requires successful code-signing and notarization results before its site download or checkout appears.

The workflow builds all required platform packages even when owner certificates are absent, records boolean status without inventing a pass, generates checksums and `latest.json`, creates GitHub/Sigstore provenance, publishes `platform-signatures.json`, and writes the release notes from that machine-readable record.

The first real workflow run exposed a Tauri naming difference: local reports used `Project Color Beacons…`, while uploaded assets used `Project.Color.Beacons…`. The finalizer now resolves that difference only when there is one unambiguous matching package. The `@claim:platform-signatures` regression uses those exact names and verifies that the stored record uses the published asset names.

The landing page, checkout, `install.sh`, and `install.ps1` use the same platform-specific trust contract. A missing certificate closes only that platform. No unsigned package is presented as signed.

## Release evidence

GitHub Actions completed the Ubuntu, Windows, Intel macOS, Apple-silicon macOS, and final provenance jobs successfully. The public release targets the repair commit and contains:

- AppImage, Debian, and RPM Linux packages
- MSI and executable Windows installers
- Intel and Apple-silicon macOS disk images and app archives
- `SHA256SUMS`, `latest.json`, `BUILD-PROVENANCE.sigstore.json`, and `platform-signatures.json`

`npm run test:release` passed against the public GitHub API. It checked the complete package matrix, every GitHub asset digest, every checksum, manifest entries, the portable Sigstore statement, live GitHub attestations, source repository, workflow, tag, commit, and platform-status agreement.

The live one-line Linux installer was run in a new temporary home. It downloaded 76,675,576 bytes, checked the release metadata and checksum, and installed an executable static-pie AppImage. Observed SHA-256:

```text
96d0963d61dfae4a03f5f9efb9b1414bdfb2360845589e5fcaddbbf3c73add4b
```

Published trust status is honest: Linux provenance passed; Windows Authenticode and macOS signing/notarization are unavailable.

## Clean quality gates

A separate fresh clone of pushed `main` was used for the JavaScript checks.

- `npm ci`: 193 packages, 0 vulnerabilities
- `npm test`: 32/32 Playwright tests passed
- Every one of the 18 claim tags passed, including the exact release-name regression
- `npm run test:unit`: 7/7 Vitest tests passed
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm audit --audit-level=high`: passed with 0 vulnerabilities
- `npm run build`: passed and produced `dist/app` and `dist/site`
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: passed
- Rust tests with default features: 2/2 passed
- Rust tests with `--no-default-features`: 2/2 passed
- `cargo check --manifest-path src-tauri/Cargo.toml`: passed
- `cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings`: passed
- A local Tauri build produced executable AppImage and Debian packages before release

Production bundle sizes remain below budget: site JavaScript 22.68 KB raw / 8.06 KB gzip, site CSS 12.94 KB raw / 3.76 KB gzip, app JavaScript 11.65 KB raw / 4.75 KB gzip, and app CSS 9.98 KB raw / 3.13 KB gzip.

## Live verification

The static build was deployed through the work order's Azure Static Web Apps configuration. All 20 publicly served build files match the local `dist/site` files byte-for-byte. Azure consumes `staticwebapp.config.json` as deployment policy rather than serving it.

- `npm run test:live:site`: passed routes, real 404, zero Axe violations, 390 px mobile, 200% text, keyboard focus, history focus/scroll, privacy request capture, demo reset/disposal, service-worker update, offline reload, release selection, checkout visibility, and license return.
- `npm run test:live:billing`: passed one matching $24 product and the hosted Sociobot checkout redirect.
- Factory `verify-url.sh`: HTTP 200 in 1,025 ms, correct title and language, one h1, one main landmark, no missing image alternatives, no unnamed buttons, and no console errors.
- Live installer: passed and installed the v0.1.3 AppImage with the checksum above.
- License response policy: 30 invalid checks returned the expected invalid response; request 31 returned 429 with `Retry-After: 3`.
- Root, demo, privacy, terms, and 404 return HSTS, `nosniff`, strict-origin referrer policy, restricted permissions, and a response-header CSP with `frame-ancestors 'none'`.
- HTML and the service worker revalidate after 30 seconds. Hashed JavaScript uses one-year immutable caching.

Lighthouse 12.8.2 mobile results on the deployed root:

| Category or metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| First contentful paint | 0.98 s |
| Largest contentful paint | 1.06 s |
| Total blocking time | 43.5 ms |
| Maximum potential input delay | 101 ms |
| Cumulative layout shift | 0 |
| Total transferred bytes | 107,260 |

## Verify again

```sh
npm ci
npm test
npm run test:unit
npm run typecheck
npm run lint
npm audit --audit-level=high
npm run build
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --manifest-path src-tauri/Cargo.toml --no-default-features
cargo test --manifest-path src-tauri/Cargo.toml
cargo check --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings
npm run test:release
npm run test:live:site
npm run test:live:billing
```

## Needs operator action

The repository and factory environment contain no owner code-signing certificates. Windows and macOS artifacts are published for operator inspection, but their product-site downloads remain closed instead of bypassing OS trust.

To open those platform downloads, add the existing workflow secrets and republish a release:

- `WINDOWS_CERT_PFX`, `WINDOWS_CERT_PASSWORD`
- `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`
- `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`

No application, deployment, privacy, accessibility, Linux release, or Linux installation gap remains.
