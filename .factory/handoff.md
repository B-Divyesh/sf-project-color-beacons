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
- Release workflow: <https://github.com/B-Divyesh/sf-project-color-beacons/actions/runs/33299843030>
- Release commit: `1cffc3b84824f51def901b5c323412f052573b00`
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
- Production site JavaScript is 23,087 bytes raw / 8,199 bytes gzip. CSS is
  13,252 bytes raw / 3,840 bytes gzip.
- Lighthouse mobile against the production preview: performance 100,
  accessibility 100, best practices 100, SEO 100; LCP 1.36 s, CLS 0, TBT 10 ms,
  transfer 52,931 bytes.
- `npx @axe-core/cli@4.13.0` against the live `/` and `/demo` routes — zero
  violations on both pages (axe-core 4.10.3).
- The Playwright suite covers desktop, 390 px mobile, 200% text, dark mode,
  keyboard focus and activation, offline reload, route history, privacy request
  boundaries, demo isolation/disposal, and console errors.
- `npm run test:release` verifies the published 0.1.6 assets, checksums,
  manifest, GitHub source attestations, platform status records, tag, and commit.
- Release workflow run `33299843030` passed Linux, Windows, Intel macOS,
  Apple-silicon macOS, and finalization for the release commit above.
- `npm run test:live:site` verifies live routes, headers, desktop and 390 px
  behavior, Axe, keyboard, privacy, offline reload, all-platform package links,
  checkout, and version identity.
- `npm run test:live:billing` verifies one live $24 product and its hosted
  checkout redirect.
- `/opt/fleet/lib/verify-url.sh` verifies title, language, main landmark, image
  alternatives, and console output on `/`, `/demo`, `/privacy`, and `/terms`.
- Live HTML, JavaScript, and CSS SHA-256 values exactly match `dist/site`.
- The live shell installer downloaded and checksum-verified the 0.1.6 AppImage,
  installed it in an isolated temporary bin directory, and the installed app
  remained running through a ten-second headless launch smoke test.
- The static bundle was deployed only to the `sf-project-color-beacons` Static
  Web App production environment.

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
