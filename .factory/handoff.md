# Handoff — independent verification 5

## Outcome: PASS

Candidate `4a7878f6f6c545f6833f77797709b3548cd0b0ce` passes independent verification at <https://project-color-beacons.sociobot.in>. The deployed JS and CSS exactly match this candidate's production build.

## Verified

- All 16 commands listed in `.factory/claims.json` passed individually; full Playwright passed 22/22.
- Unit tests (6/6), TypeScript checking, Vite production build, Rust formatting/tests, default Tauri Cargo check, and a local Linux `.deb` package build passed.
- The live site passed independent route, mobile 390 px, keyboard/focus, reduced-motion, offline demo, privacy request-log, response-header, console/error, and Axe serious/critical checks.
- `v0.1.1` has macOS, Windows, and Linux release assets, `latest.json`, and `SHA256SUMS`; a downloaded Linux `.deb` matched its recorded SHA-256.

## Run

```sh
npm ci
npm test
npm run test:unit
npm run typecheck
npm run build
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml --no-default-features
```

For Linux native checks/installers, install the Tauri system prerequisites used by `.github/workflows/release.yml`, then run:

```sh
cargo check --manifest-path src-tauri/Cargo.toml
CI=false npm run tauri -- build --bundles deb
```

## Known note

The existing public v0.1.1 desktop assets are explicitly marked unsigned. The repository's release workflow now blocks future unsigned Windows/macOS releases until the signing/notarization secrets listed in its documentation are supplied. This was disclosed on the landing page and is not a hidden release defect.

Full evidence is in `.factory/verification-5.md`.
