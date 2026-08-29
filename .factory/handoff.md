# Handoff — repair 4

## Status: deployed mitigation; desktop release remains externally blocked

Repair commit: `6994beeea36107074fffe22ab42b790a0ff44388` (`fix: gate checkout on complete signed release`)

The independent verifier’s one finding was reproduced from the production GitHub
release: `v0.1.1` says “Unsigned desktop builds.” The release has no signed
desktop attestation, so it cannot truthfully be offered as a desktop download.

The static site repair is deployed at
`https://project-color-beacons.sociobot.in`. It now keeps both the platform
download and the $24 purchase link unavailable unless a complete signed release
exists. Visitors can still use the free browser demo. This closes the misleading
state where a paid unlock was offered while no installable desktop app existed.

This worker cannot complete the remaining release acceptance requirement because
the GitHub repository has no configured macOS or Windows signing secrets. No
unsigned artifact or false “signed” label was published.

## What changed

- Added one shared release contract. A browser-visible release must be
  published, non-prerelease, carry the signed-build attestation, include both
  macOS DMGs, a Windows package, AppImage, Debian package, `SHA256SUMS`, and
  `latest.json`.
- Made the purchase offer depend on that same complete release contract as the
  download button. An active billing catalogue entry alone is no longer enough.
- Added `npm run test:release`. It checks a published release’s attestation,
  required packages, manifest entries, and the agreement between `SHA256SUMS`
  and GitHub artifact digests.
- Added exact regression coverage for the verifier’s state: active checkout +
  unsigned release yields no purchase link; incomplete “signed” releases also
  yield no download. The live-site verifier now checks that behavior.
- Updated the release claim, README, and copy audit to match the new condition.

## Verification

Clean install and source checks:

```sh
npm ci                                  # PASS; 0 vulnerabilities
npm run typecheck                       # PASS
npm run test:unit                       # PASS; 6/6
npm test                                # PASS; 25/25 Playwright tests
npm run build                           # PASS
cargo fmt --manifest-path src-tauri/Cargo.toml --check  # PASS
cargo test --manifest-path src-tauri/Cargo.toml --no-default-features  # PASS; 2/2
cargo check --manifest-path src-tauri/Cargo.toml        # PASS
CI=false npm run tauri -- build --bundles deb            # PASS
```

The native package build used the same Linux dependencies as the release
workflow (`libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`).
It produced `Project Color Beacons_0.1.1_amd64.deb` (1,921,980 bytes).
`dpkg-deb -I` reports package `project-color-beacons`, version `0.1.1`, amd64.

The full browser suite includes all 17 registered claims, 390 px desktop/site
views, keyboard operation, route focus/history, reduced motion, offline reload,
privacy request recording, and Axe checks. The changed
`@claim:checkout-availability` test explicitly covers active catalogue + signed
release, inactive catalogue, and active catalogue + unsigned release.

Production site build sizes: JavaScript 21.65 kB (7.68 kB gzip); CSS 12.40 kB
(3.67 kB gzip). The deployed hashes equal the local build:

```text
fc37251b1f7e85c22c457acd2ec379fd35a9c52a423aae6205ab9d1221b48669  index-DiPrutmP.js
7614b051fdff5eab9b5a7dd6b2a3880f6a9dca7f21ce762ccb4d80a4532dabe7  index-Du-siQ-1.css
```

Live checks after deployment:

```sh
npm run test:live:site                  # PASS
npm run test:live:billing               # PASS
/opt/fleet/lib/verify-url.sh https://project-color-beacons.sociobot.in <evidence-dir>  # PASS
```

Live site verification passed all routes, 390 px layout, keyboard focus,
privacy/demo disposal, service-worker offline reload, zero Axe violations, and
the signed-release/purchase gate. Response headers include the intended CSP
with `frame-ancestors 'none'`, HSTS, `nosniff`, strict-origin referrer policy,
and restrictive permissions policy. Lighthouse against the deployed site:
performance 100, accessibility 100, LCP 1,648 ms, CLS 0.

## Remaining operator action — required for a releasable desktop app

`npm run test:release` currently fails as intended with:

```text
Release verification failed: The release does not carry the signed-build attestation.
```

The repository’s GitHub Actions secret list was empty during this repair. An
owner must provision these existing workflow inputs, then publish a new `v*`
tag through `.github/workflows/release.yml`:

- `APPLE_CERTIFICATE`
- `APPLE_CERTIFICATE_PASSWORD`
- `APPLE_SIGNING_IDENTITY`
- `APPLE_ID`
- `APPLE_PASSWORD`
- `APPLE_TEAM_ID`
- `WINDOWS_CERT_PFX`
- `WINDOWS_CERT_PASSWORD`

After publication, run `npm run test:release` and confirm it passes before
enabling the purchase link. The new release must contain signed/notarized macOS
Intel and Apple silicon DMGs, a signed Windows installer, Linux AppImage and
Debian packages, `SHA256SUMS`, and `latest.json`. Then rerun the live-site
check on macOS, Windows, and Linux user agents to verify real download links.

## Run locally

```sh
npm ci
npm test
npm run test:unit
npm run typecheck
npm run build
cargo test --manifest-path src-tauri/Cargo.toml --no-default-features
CI=false npm run tauri -- build --bundles deb
npm run test:release
```
