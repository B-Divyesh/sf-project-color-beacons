# Handoff — independent verification 7

## Status: FAIL

Candidate 9698abe884e96c97f95b9567ec197453935d2efd was independently tested on
2026-08-29 against <https://project-color-beacons.sociobot.in>.

The first-read gate and all 17 registered claims pass. The exact candidate
build is live, the isolated demo works end to end, local/native builds pass,
privacy behavior is correct, offline reload works, and rate limiting is
enforced. The candidate still fails release acceptance for these defects:

1. **Blocker:** no signed installable desktop release. v0.1.1 explicitly says
   “Unsigned desktop builds”; npm run test:release fails; every live platform
   download and the checkout are disabled.
2. **Major:** the dark landing page has an Axe serious contrast failure on four
   boundary labels: 1.24:1 instead of 4.5:1.
3. **Major:** at 390px and 200% text, the site demo expands to 568px and the
   desktop UI to 573px, requiring horizontal panning.
4. **Moderate:** demo/banner/footer targets measure 25–36px high instead of the
   required 44px.

Full evidence, hashes, commands, rate-limit results, and retest requirements
are in [.factory/verification-7.md](verification-7.md).

## Verification summary

~~~text
npm ci                                                   PASS; 0 vulnerabilities
17 individual claim commands                            PASS
npm test                                                PASS; 25/25
npm run test:unit                                       PASS; 6/6
npm run typecheck                                       PASS
npm run build                                           PASS
cargo fmt --manifest-path src-tauri/Cargo.toml --check  PASS
cargo test --manifest-path src-tauri/Cargo.toml --no-default-features  PASS; 2/2
cargo check --manifest-path src-tauri/Cargo.toml        PASS
CI=false npm run tauri -- build --bundles deb           PASS
npm run test:live:site                                  PASS
npm run test:live:billing                               PASS
npm run test:release                                    FAIL; signed attestation absent
~~~

The native Linux checks require the same packages used in CI:

~~~sh
apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
~~~

The locally built Debian package is 1,921,976 bytes and reports package
project-color-beacons, version 0.1.1, amd64.

## Needs operator action

Provision the signing inputs already named by .github/workflows/release.yml:

- APPLE_CERTIFICATE
- APPLE_CERTIFICATE_PASSWORD
- APPLE_SIGNING_IDENTITY
- APPLE_ID
- APPLE_PASSWORD
- APPLE_TEAM_ID
- WINDOWS_CERT_PFX
- WINDOWS_CERT_PASSWORD

Do not enable download or checkout until a new release is signed/notarized,
contains both macOS architectures plus Windows, AppImage, Debian, SHA256SUMS,
and latest.json, and passes npm run test:release.

Before that release, product code must also be repaired for dark contrast,
200% text reflow, and 44px target sizes. Add dark-mode Axe, 200% text, and
target-size regression coverage. Then rerun every claim and full verification
sequence in .factory/verification-7.md.

## Known non-blocking notes

- The live site appropriately fails closed: it offers the free browser demo
  but no purchase while the desktop release is unsigned.
- The published unsigned Debian checksum matches SHA256SUMS; this proves file
  integrity only, not signing.
- No AI feature is appropriate for this deterministic local accommodation
  utility.
