# Handoff — repair work order 6

## Status: PASS — repaired, released, and deployed

The three release blockers in verifier report commit
`238670b60807cfedeae181a853d11013776abb04` are repaired. The researched brief,
desktop-app artifact class, Tauri 2 application, storage model, visual system,
and all previously passing behavior remain intact.

- Release: <https://github.com/B-Divyesh/sf-project-color-beacons/releases/tag/v0.1.2>
- Release source: `0fcfb94c1d96581214396223658ce0b2d1d6b82c`
- Successful workflow: <https://github.com/B-Divyesh/sf-project-color-beacons/actions/runs/33275258389>
- Production site: <https://project-color-beacons.sociobot.in>
- Demo: <https://project-color-beacons.sociobot.in/demo>

## Findings repaired

### 390px at 200% text

Reproduction on the verifier candidate produced exactly 3px of horizontal
overflow after checking and confirming Northwind Store. The path text crossed
the editor-files control. The confirmation layout now wraps long paths, permits
grid children to shrink, and gives its action a full mobile row.

The regression exercises both the static demo and desktop UI at 390x844 with a
200% root font, confirms the longest sample, asserts no horizontal overflow,
and checks every confirmation child pair for geometric overlap.

### Selected editor preview

Reproduction on the verifier candidate saved a VS Code-only project but showed
both `.vscode/settings.json` and `.zed/settings.json`. Preview generation is now
derived from the project's selected editor list. Regression coverage creates
new VS Code-only and Zed-only projects, confirms each, and asserts that only the
selected editor file is present. The existing confirmation claim also asserts
that Northwind Store does not expose a Zed file.

### Signed candidate and source identity

Release `v0.1.2` is public with nine desktop package assets covering macOS Intel
and Apple silicon, Windows MSI/EXE, and Linux AppImage/DEB/RPM. `SHA256SUMS`,
`latest.json`, and `BUILD-PROVENANCE.sigstore.json` are also published.

GitHub's keyless Sigstore attestation binds every package digest to:

```text
repository: B-Divyesh/sf-project-color-beacons
workflow:   .github/workflows/release.yml
tag:        refs/tags/v0.1.2
commit:     0fcfb94c1d96581214396223658ce0b2d1d6b82c
run:        33275258389
Rekor time: 2026-08-29T21:15:07Z
```

`npm run test:release` independently downloads the public metadata, checks
every digest and manifest entry, decodes the signed SLSA statement, and requires
a matching GitHub attestation record for every package.

The published Debian package was also downloaded and verified directly:

```text
Project.Color.Beacons_0.1.2_amd64.deb: OK
size:   1,929,018 bytes
sha256: a0ac9750cfddd340b59f52916003e455f8e21da319eba9647e12223310947e8a
package/version/arch: project-color-beacons / 0.1.2 / amd64
gh attestation verify: PASS for repository, workflow, tag, and commit above
ldd: no missing dynamic libraries in the verification image
```

The first release attempt uncovered a release-only issue: empty Apple secret
environment variables made Tauri attempt an invalid certificate import. Signed
and unsigned macOS paths are now separate, and a regression prevents Apple
credential variables from reaching the unsigned build.

## Installer and consumer evidence

The public Linux one-line installer was run against `v0.1.2` in an isolated
temporary install directory. It downloaded the real AppImage, checked the
published SHA-256, verified the portable Sigstore bundle with GitHub CLI, and
installed an executable with mode 755:

```text
Verified GitHub source identity.
Installed Project Color Beacons at <temporary>/bin/project-color-beacons
size:   76,675,576 bytes
sha256: 309cf5e84e96f5f8319f4d252658becba9df067aa8095e60333cdb807275abb3
```

This test found and repaired a temporary-file suffix bug in `install.sh`:
GitHub CLI requires the supplied provenance bundle path to end in `.json` or
`.jsonl`. A source regression covers that requirement.

## Verification evidence

Final clean-tree gates after the repairs:

```text
npm ci                                                    PASS (147 packages, 0 vulnerabilities)
npm run lint                                              PASS
npm run typecheck                                         PASS
npm run test:unit                                         PASS (6/6)
npm test                                                  PASS (31/31)
all 17 .factory/claims.json tagged tests                  PASS
npm run build                                             PASS (dist/app and dist/site)
npm audit --audit-level=high                              PASS (0 vulnerabilities)
cargo fmt --manifest-path src-tauri/Cargo.toml --check    PASS
cargo test --manifest-path src-tauri/Cargo.toml --no-default-features
                                                            PASS (2/2)
cargo check --manifest-path src-tauri/Cargo.toml           PASS
CI=false npm run tauri -- build --bundles deb              PASS
GitHub release matrix                                      PASS (4/4 builders + publish)
GITHUB_TOKEN=... RELEASE_TAG=v0.1.2 npm run test:release   PASS (9 packages)
npm run test:live:site                                     PASS
npm run test:live:billing                                  PASS
```

The browser suite covers desktop, 390px mobile, 200% text, keyboard focus,
dialog semantics, Axe, privacy request boundaries, demo isolation/disposal,
offline reload and service-worker update, navigation history, release fallback,
real release links, and license behavior.

Live checks on 2026-08-29:

```text
verify-url.sh: HTTP 200; 728ms; no console errors; title/lang/main/alt checks pass
axe-core CLI: 0 violations on /, /demo, /privacy, and /terms
Lighthouse mobile: Performance 100, Accessibility 100,
                   Best Practices 100, SEO 100
FCP 0.8s; LCP 1.7s; TBT 40ms; CLS 0
response policy: 35 invalid-license requests -> 30 x 200, 5 x 429;
                 Retry-After 4; GET requests with no body
```

Built JavaScript is 21.90 kB raw / 7.79 kB gzip for the site and 11.65 kB raw /
4.75 kB gzip for the desktop UI. Built CSS is 12.94 kB and 9.98 kB raw.

## Deployment evidence

`dist/site` was deployed to the existing production Azure Static Web App
`sociobot/sf-project-color-beacons` using the work order's static deployment.
The custom domain returns the repaired build with the expected CSP and security
headers. Selected live/local hashes after deployment:

```text
install.sh 013ccdac7012278ad44ac92ade63d06d55b8ef8eaddc5d9c3cf299b678531374
index.html e761a4f3a9925815aeb0b782870010dcb41c5f3c60a9b640afaa8f1f99277573
site JS    8202501f4970fcb45032c13575a7189c26f3b88c3127402676c706b0d56787af
site CSS   743159ba1ec9bfed3e928e054ae75475d77b8694b3a26222f5e48208b39dbd69
sw.js      ecfb9222a0b9abc16c95c7cb24b25e428c78191dd8036b5c11de724086a51e1e
```

## Needs operator action

The candidate packages have cryptographically verified GitHub/Sigstore source
identity. The macOS and Windows packages are not Apple-notarized or
Authenticode trust-store signed because the repository has no owner
certificates. To add those platform trust signatures, configure
`APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`,
`APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`, `WINDOWS_CERT_PFX`, and
`WINDOWS_CERT_PASSWORD`, then publish a later version. This is disclosed in the
release and README; it does not weaken the verified source provenance for this
candidate.
