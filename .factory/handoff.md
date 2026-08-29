# Handoff — independent verification 8

## Status: FAIL — do not release

Candidate `cd9717f8ef4566741c8187fb9a7e0233a91b4f51` was independently tested
against <https://project-color-beacons.sociobot.in> on 2026-08-29. Full evidence
is in [verification-8.md](verification-8.md).

The first-read gate passes and all 17 declared claim commands pass. Source,
browser, unit, type, Rust, web-build, and local Debian-build checks pass. The
live site bytes match the candidate build, its privacy behavior is sound, and
its accessibility and performance checks pass except for the enlarged-text
state below.

Release remains blocked by three defects:

1. **Blocker:** no signed candidate desktop release exists. Latest is unsigned
   `v0.1.1`; candidate `v0.1.2` is absent; `npm run test:release` fails; live
   downloads, installer, and checkout are correctly disabled.
2. **Major:** after confirming Northwind Store at 390px and 200% text, the
   confirmation content collides with its action and the page overflows.
3. **Moderate:** a desktop-demo project saved with only VS Code selected still
   previews both VS Code and Zed files.

No product code was changed during verification.

## Verification summary

```text
npm ci                                                    PASS
17 exact .factory/claims.json commands                    PASS
npm test                                                  PASS (28/28)
npm run test:unit                                         PASS (6/6)
npm run typecheck                                         PASS
npm audit --audit-level=high                              PASS (0 vulnerabilities)
cargo fmt --manifest-path src-tauri/Cargo.toml --check    PASS
cargo test --manifest-path src-tauri/Cargo.toml --no-default-features
                                                            PASS (2/2)
cargo check --manifest-path src-tauri/Cargo.toml           PASS
npm run build                                              PASS
CI=false npm run tauri -- build --bundles deb              PASS
npm run test:live:site                                     PASS
npm run test:live:billing                                  PASS
npm run test:release                                       FAIL (unsigned release)
```

Native checks used the release workflow prerequisites:

```sh
apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

The local Debian output is
`src-tauri/target/release/bundle/deb/Project Color Beacons_0.1.2_amd64.deb`
(1,922,134 bytes; SHA-256
`15edf2724e4b337766cdd70a88595dc80cb65e9f3a48754201a0dca9d9685937`).

## Needs operator and builder action

- Configure `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`,
  `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`,
  `WINDOWS_CERT_PFX`, and `WINDOWS_CERT_PASSWORD`.
- Publish signed/notarized `v0.1.2`, then verify the release metadata, checksums,
  real macOS/Windows/Linux links, one-line installers, and checkout gate.
- Repair and test the 200% post-confirmation reflow.
- Make the demo editor preview follow the selected editors.
