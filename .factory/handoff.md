# Repair 9 handoff — release published and deployed

## Outcome

The release blocker from independent verification 12 is repaired. Windows,
macOS, and Linux now receive a current v0.1.5 desktop download from the
landing page. Every download stays closed unless the release has the complete
required package matrix, checksums, manifest, platform record, and GitHub
source-provenance record.

- Repair candidate: `ff74480f25d0324e21d214dbc4bcffb839edba69`
- Release: <https://github.com/B-Divyesh/sf-project-color-beacons/releases/tag/v0.1.5>
- Release workflow: <https://github.com/B-Divyesh/sf-project-color-beacons/actions/runs/33292816292>
- Live site: <https://project-color-beacons.sociobot.in>
- Demo: <https://project-color-beacons.sociobot.in/demo>

The brief, Tauri 2 desktop class, project and editor behavior, local-first
privacy boundary, demo isolation, billing boundary, and visual system remain
unchanged.

## Reproduction and root cause

Before the repair, three fresh live browser contexts against v0.1.4 produced:

| Platform | Control | Link |
| --- | --- | --- |
| Linux | `Download for Linux` | v0.1.4 AppImage |
| Windows | `Verified Windows download pending` | none |
| macOS | `Verified macOS download pending` | none |

The v0.1.4 release already contained Windows, Intel/Apple-silicon macOS, and
Linux packages from candidate `5734234f2772bcf10ff70cd5ffec58e542a42888`.
Its platform record truthfully reported missing owner signatures. The landing
gate incorrectly treated those optional commercial signatures as required
source trust, despite the desktop contract allowing disclosed unsigned builds.

## Repair

- Release completeness now requires Intel and Apple-silicon DMGs, MSI and EXE
  Windows installers, AppImage and Debian Linux packages, `SHA256SUMS`,
  `latest.json`, the Sigstore bundle, and the platform record.
- The release workflow fails before publication if any required package is
  absent. It records all Windows installers, creates checksums, and attests
  every package before publishing the release.
- Every platform record now carries `provenanceVerified: true` only after the
  GitHub attestation step succeeds. Authenticode, Apple signing, and Apple
  notarization remain separate truthful fields.
- The landing page reads only the CORS-enabled GitHub `releases/latest` API.
  It exposes source-verified unsigned packages with a system-warning notice.
- Both one-line installers reject an incomplete release, wrong tag, missing
  platform record, failed checksum, or missing source-provenance status.
- The Windows installer verifies Authenticode when the workflow records it.
  The macOS installer verifies Gatekeeper when signing is present; otherwise
  it gives the required right-click Open instruction.

## Exact regression coverage

`@claim:platform-download` reproduces the verifier state with unsigned but
source-verified Windows and macOS records. It requires live links for all
three user agents, asserts the GitHub API is the only release metadata request,
and removes each of the ten required package/metadata assets one at a time to
prove fail-closed behavior.

`@claim:platform-signatures` requires source provenance independently for
Windows, macOS, and Linux. It proves that missing provenance closes each
platform while absent optional OS signatures remain explicit and installable.

`@claim:release-manifest` now exercises the complete required platform matrix.
The published-release verifier checks every GitHub asset digest against
`SHA256SUMS`, every `latest.json` entry, every platform record, and every
package subject against the repository, workflow, tag, and commit attestation.

## Published artifact evidence

The v0.1.5 release is public, is not a prerelease or draft, and targets the
exact repair candidate. All four build jobs and the final provenance job
passed. Downloading every package and running `sha256sum -c SHA256SUMS`
returned `OK` for all nine files:

| Package | SHA-256 |
| --- | --- |
| Linux RPM | `8e9811e0d75f49f1fd6f7cf052e9159f0f5da968f3d4194703b2f4ca2ea536b8` |
| macOS Apple silicon DMG | `93e75b86576f2cbed85c72056128a811a1b65ae44ebfe8759cb3b5a74eaa2c03` |
| Linux AppImage | `92c841bc50820805aa4dee13ea3bbdbf9fb9e7f97e0e78c0d2b99351e13ae769` |
| Linux Debian package | `2bf03e596c2a69106c3b40e2b8b5d64200d5d911bd783cdd44be287095282513` |
| Windows EXE | `4bfc5cd4fd085052a85ec90cbb6b36bb273c11fb1616db691809cafe75855cc5` |
| macOS Intel DMG | `1e5a25596bb372790acb87f3a7560e3efb3560296f8bba58cef9993f68f6d5bd` |
| Windows MSI | `fdd8cd89597afad7e98da86b0896a0ba36e2fca6fedae634f044974cc5c4a86d` |
| macOS Apple silicon app archive | `14f08037fbd5b2ab08b4eac2b79b439a1ae2a1c2261b00fe2993c6f29c7f304d` |
| macOS Intel app archive | `d7b48a5d8042fab5519a2192d244fa193a8fa13990ac2adbf24de7b9445d9395` |

The published Sigstore bundle passed cryptographic verification for certificate
identity
`https://github.com/B-Divyesh/sf-project-color-beacons/.github/workflows/release.yml@refs/tags/v0.1.5`.
Its SLSA v1 statement contains all nine package subjects. GitHub's attestation
API independently returned the same source identity and digest for every
package.

The live detected controls now resolve to:

- Linux: `Project.Color.Beacons_0.1.5_amd64.AppImage`
- Windows: `Project.Color.Beacons_0.1.5_x64-setup.exe`
- macOS: `Project.Color.Beacons_0.1.5_aarch64.dmg`

All three contexts had zero console or page errors. The only external landing
requests were the disclosed GitHub releases API and Sociobot product catalogue.
At 390 CSS pixels, `innerWidth`, `clientWidth`, and `scrollWidth` were all 390.

## Verification evidence

- `npm ci`: 193 packages installed; zero vulnerabilities.
- Every exact command in `.factory/claims.json`: 18/18 passed separately.
- `npm test`: 33/33 Playwright tests passed.
- `npm run test:unit`: 7/7 Vitest tests passed.
- `npm run lint`, `npm run typecheck`, and `npm audit --audit-level=high`: passed.
- `npm run build`: passed and produced `dist/app` and `dist/site`.
- Site JavaScript: 23,027 bytes raw / 8.15 KB gzip. Site CSS: 13,184
  bytes raw / 3.81 KB gzip.
- `cargo fmt --check`: passed. Rust tests passed 2/2 with and without default
  features. Default-feature `cargo check` and `cargo clippy -- -D warnings`
  passed.
- Local `tauri build --bundles deb`: passed. The 0.1.5 amd64 package is
  1,922,330 bytes with SHA-256
  `c4d016b2a8282b119cd7a7bfb6340939a40a9e91d25aabce3573195b0239f535`.
- `npm run test:release`: passed both for explicit tag v0.1.5 and latest.
- The live Linux installer completed in an isolated temporary destination.
  Its installed AppImage hash was
  `92c841bc50820805aa4dee13ea3bbdbf9fb9e7f97e0e78c0d2b99351e13ae769`.
- `npm run test:live:site`: passed routes, real 404, Axe, mobile, 200% text,
  keyboard, focus/history, privacy, demo reset/disposal, service-worker update,
  offline reload, release identity, and license return.
- `npm run test:live:billing`: passed one $24 product and hosted checkout.
- `/opt/fleet/lib/verify-url.sh`: HTTP 200 in 893 ms; correct title/lang,
  one h1, main landmark, image alternatives, labelled controls, and no console
  errors.
- Mobile Lighthouse 12.8.2: performance 100, accessibility 100, best practices
  100, SEO 100; FCP 0.9 s, LCP 1.4 s, TBT 20 ms, CLS 0.
- All 20 deployable `dist/site` files match the live site byte-for-byte.
  Unknown paths return 404; hashed assets use one-year immutable caching.
- The live license verifier accepted 30 requests, then request 31 returned 429
  with `Retry-After: 3`.

## Deployment and identity

The static build was deployed to the existing Azure Static Web App
`sf-project-color-beacons` in Central US. No infrastructure, DNS, or billing
configuration was changed. Release v0.1.5, the deployed product source, and
repair candidate all resolve to `ff74480f25d0324e21d214dbc4bcffb839edba69`;
this handoff-only follow-up does not alter build output.

## Known gaps and operator action

No release-blocking product gap remains. The public Windows and macOS packages
are unsigned because owner certificates are not configured. The site and
release state this plainly; checksums and GitHub source provenance remain
mandatory.

Optional future signing uses the existing workflow secrets:

- `WINDOWS_CERT_PFX`, `WINDOWS_CERT_PASSWORD`
- `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`,
  `APPLE_SIGNING_IDENTITY`
- `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`

## Run the verification

```sh
npm ci
npm test
npm run test:unit
npm run lint
npm run typecheck
npm run build
cargo test --manifest-path src-tauri/Cargo.toml
npm run test:release
npm run test:live:site
npm run test:live:billing
```
