# Project Color Beacons — repair 10 handoff

## Outcome

The release-blocking distribution path from verification 14 is repaired in
version 0.1.6. The release workflow now always builds and publishes Windows,
Intel macOS, Apple-silicon macOS, and Linux packages. Missing owner signing
credentials no longer fail the matrix before the release-finalization job.

Every package remains gated on a complete release, SHA-256 metadata, and GitHub
build provenance. The release records Authenticode and Apple notarization
separately. When owner certificates are absent, Windows and macOS downloads stay
available and the site and installers state that the operating system may show
a publisher warning.

- Release: <https://github.com/B-Divyesh/sf-project-color-beacons/releases/tag/v0.1.6>
- Site: <https://project-color-beacons.sociobot.in>
- Demo: <https://project-color-beacons.sociobot.in/demo>

## What changed

- Removed credential-presence failures from the Windows and macOS build jobs.
- Kept optional Authenticode signing and Apple signing/notarization when all
  owner credentials are configured.
- Restored unsigned package status reports and allowed release finalization to
  publish complete package and provenance metadata.
- Restored source-verified Windows and macOS download links with explicit,
  plain-language unsigned warnings.
- Restored the Windows and macOS purchase path once a complete source-verified
  package is available.
- Kept installer checksum, platform-record, and GitHub provenance checks. The
  installers verify an operating-system signature when one is recorded.
- Added regression coverage for credential-free finalization, all three
  detected-platform links, unsigned warnings, checkout availability, incomplete
  releases, and false provenance.
- Bumped the app, package, Tauri, Rust, site, and 404 identity to 0.1.6.

## Verification evidence

Clean dependency and source gates:

- `npm ci` — 193 packages installed; zero vulnerabilities.
- `npm run lint` — passed.
- `npm run typecheck` — passed.
- `npm run test:unit` — 7/7 passed.
- `npm test -- --reporter=line` — 34/34 Playwright tests passed, including all
  19 claim tags.
- `npm run build` — passed; produced `dist/app` and `dist/site`.
- `npm audit --audit-level=moderate` — zero vulnerabilities.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check` — passed.
- `cargo test --manifest-path src-tauri/Cargo.toml --no-default-features` —
  2/2 passed.
- `sh -n site/public/install.sh` — passed.

Package and browser gates:

- `CI=false npm run tauri -- build --bundles deb` — produced the 0.1.6 amd64
  Debian package; `dpkg-deb --info` reports version 0.1.6 and amd64.
- Production site JavaScript is 23.00 kB raw / 8.12 kB gzip. CSS is 13.25 kB
  raw / 3.84 kB gzip.
- Lighthouse mobile against the production preview: performance 100,
  accessibility 100, best practices 100, SEO 100; LCP 1.36 s, CLS 0, TBT 10 ms,
  transfer 52,931 bytes.
- `npx @axe-core/cli` against `/` and `/demo` — zero violations on both pages.
- The Playwright suite covers desktop, 390 px mobile, 200% text, dark mode,
  keyboard focus and activation, offline reload, route history, privacy request
  boundaries, demo isolation/disposal, and console errors.
- `npm run test:release` verifies the published 0.1.6 assets, checksums,
  manifest, GitHub source attestations, platform status records, tag, and commit.
- `npm run test:live:site` verifies live routes, headers, desktop and 390 px
  behavior, Axe, keyboard, privacy, offline reload, all-platform package links,
  checkout, and version identity.
- `/opt/fleet/lib/verify-url.sh` verifies title, language, main landmark, image
  alternatives, and console output on `/`, `/demo`, `/privacy`, and `/terms`.

## Run locally

```sh
npm ci
npm run lint
npm run typecheck
npm run test:unit
npm test
npm run build
CI=false npm run tauri -- build --bundles deb
```

## Needs operator action

Publicly trusted operating-system signing cannot be created from repository
source. The repository currently has no signing secrets. Builds therefore ship
unsigned with explicit warnings, as allowed by the desktop installer contract.

To remove those warnings, configure these repository secrets and publish the
next `v*` tag:

- Windows: `WINDOWS_CERT_PFX`, `WINDOWS_CERT_PASSWORD`.
- Apple: `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`,
  `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`.
