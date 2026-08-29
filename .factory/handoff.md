# Verification 10 handoff — FAIL

## Status

**FAIL — release blocked.** Candidate `ba67ec25836d62eb4c53dd2b322d0ef3330924c3` was verified on 2026-08-29 against <https://project-color-beacons.sociobot.in> and <https://project-color-beacons.sociobot.in/demo>.

The static deployment is healthy and all 19 public build artifacts match a fresh candidate build byte-for-byte. The blocker is not static deployment: no verified v0.1.3 desktop release exists, so the real desktop job cannot be installed.

Full evidence is in `.factory/verification-10.md`.

## Release blocker

- `npm run test:release` fails because the latest public release has no verified-release marker, no passed Windows/macOS trust statuses, and no `platform-signatures.json`.
- The latest release is v0.1.2 from predecessor commit `0fcfb94c1d96581214396223658ce0b2d1d6b82c`; candidate version 0.1.3 has no release.
- The live site correctly shows **Verified Linux download pending** and hides checkout.
- The live Linux installer exits 1 with “A verified desktop release is not published yet” and installs nothing.

## What passed

- First-read and one-click sample-data gate.
- All 18 exact claim commands after `npm ci`.
- Playwright 32/32; Vitest 7/7; lint; typecheck; npm audit.
- Production app/site build; Rust formatting, default and no-default-feature tests, full check, and full-feature Clippy.
- Live site and live billing checks.
- Normal, boundary, invalid-input, recovery, reset, disposal, privacy, keyboard, mobile, 200% text, dark mode, offline update/reload, and 404 flows.
- Axe: zero serious/critical findings. No console or page errors in successful flows.
- Lighthouse mobile: performance 97, accessibility 100, best practices 100, SEO 100; LCP 1.9 s; CLS 0; 54 KiB.
- License verifier rate limit: 30 accepted requests, then 429 with `Retry-After: 4`.

## Reproduce

```sh
npm ci
npm test
npm run test:unit
npm run lint
npm run typecheck
npm run build
cargo test --manifest-path src-tauri/Cargo.toml --no-default-features
cargo test --manifest-path src-tauri/Cargo.toml
cargo check --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings
npm run test:live:site
npm run test:live:billing
npm run test:release
```

On Ubuntu, install the exact Tauri libraries from `.github/workflows/release.yml` before full-feature Rust commands.

## Required operator action

Add the documented signing secrets, then publish and verify tag `v0.1.3`:

- `WINDOWS_CERT_PFX`, `WINDOWS_CERT_PASSWORD`
- `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`
- `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`

The release must contain macOS Intel and Apple-silicon, Windows, and Linux packages plus `SHA256SUMS`, `latest.json`, `BUILD-PROVENANCE.sigstore.json`, and `platform-signatures.json`. Re-run independent verification only after the live detected download and installer resolve to those candidate packages.
