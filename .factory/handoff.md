# Handoff — polish round 3

## Status

The static site repair is deployed at
<https://project-color-beacons.sociobot.in>. It is built from repair commit
`52090c8104b07f86667fb6ba474aa6c3dc5931da` (against candidate
`c1cde2049563e449f8c58742bfbc2cf370c4c24e` and review
`519be82584423a7fb5ba4a0889ccee0459988045`).

Every review finding that can be repaired in this repository is closed. The
only remaining external release condition is real Windows signing and macOS
signing/notarization: no owner certificate credentials are available. The
application now fails closed: the workflow refuses to publish without them,
the existing unsigned GitHub release is not linked by the site or installers,
and checkout is withheld until a fully verified release exists. It does not
pretend that the historical packages are trusted.

## What changed

- Rewrote the first screen in plain words and put the exact one-time $24 price
  in its initial mobile viewport. The catalogue sentence is now: “Mark each
  project with a color, name, and symbol before editing.”
- Kept the ceramic/glacial visual system while making `?demo=1` and `/demo`
  open the seeded Atlas API workspace. The persistent banner identifies demo
  storage, resets it, and discards it on “Start for real.”
- Completed real routing, titles, focus transfer, history scroll restoration,
  legal pages, metadata, canonical/OG data, real HTTP 404 handling, and a
  generated shared build footer for normal and standalone 404 pages.
- Added the required claims registry entry for platform signature records and
  expanded the release tests: a recorded GitHub Sigstore bundle is verified
  cryptographically, package completeness is tested inside its tagged claim,
  and missing/invalid platform-signature records are rejected.
- Hardened the release workflow and both installer scripts. A download is
  usable only after the published release has all platform packages, checksums,
  provenance, platform verification record, and the Windows/macOS verification
  statuses. Plain language replaced release-trust jargon.

## Verification

Fresh checkout: `/tmp/pcb-polish3-clean.1g72iX/repo` at `52090c8`.

- `npm ci` completed with `0` audit vulnerabilities.
- Every one of the 18 commands listed in `.factory/claims.json` passed
  separately from that checkout (`/tmp/pcb-polish3-claims.4AbCjv.log`).
- `npm test` passed 32/32 browser, demo, accessibility, privacy, offline, and
  release-gate checks from that checkout.
- `npm run typecheck`, `npm run lint`, `npm run test:unit` (7/7), and
  `npm run build` passed. Production app/site JavaScript gzip sizes are 4.75 KB
  and 7.88 KB; CSS gzip sizes are 3.13 KB and 3.76 KB.
- `cargo fmt --check`, `cargo test --manifest-path src-tauri/Cargo.toml
  --no-default-features` (2/2), and the full `cargo check` passed. A local
  Tauri Debian bundle was built successfully:
  `src-tauri/target/release/bundle/deb/Project Color Beacons_0.1.3_amd64.deb`
  (1,922,336 bytes).
- `npm audit --audit-level=high` reported `0` vulnerabilities.
- `npm run test:live:site` passed after deployment: all public routes,
  metadata, Axe checks, mobile fit, focus/history, demo isolation/disposal,
  offline reload, privacy request capture, license return, and the fail-closed
  download gate.
- `npm run test:live:billing` passed: the catalogue has one $24 product and a
  hosted checkout redirect.
- `/opt/fleet/lib/verify-url.sh https://project-color-beacons.sociobot.in
  evidence/polish-3` passed: HTTP 200, no console errors, title, `lang=en`,
  one h1, main landmark, image alt text, and labelled buttons.
- The project’s Playwright Axe suite found zero violations on every live route.
  The standalone `@axe-core/cli` was also attempted, but its Selenium launcher
  cannot find a Chrome binary in this container; it is not the accessibility
  result used for acceptance.
- The mobile Lighthouse report in `evidence/polish-3/lighthouse-mobile.json`
  has no runtime error: performance 100, accessibility 100, FCP 0.8 s, LCP
  1.6 s, CLS 0, and 54 KiB transferred.
- A cold live crawl of all site links returned 200 (or an explicit `mailto:`),
  recorded in `evidence/polish-3/live-route-link-check.json`.

## Evidence

- `evidence/polish-3/live-landing-mobile-first-screen.png`
- `evidence/polish-3/live-demo-query-mobile.png`
- `evidence/polish-3/live-404-desktop.png`
- `evidence/polish-3/live-download-gate-desktop.png`
- `evidence/polish-3/verify.json`
- `.factory/polish-3.md` maps every historical finding to its repair and proof.

## Run locally

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
cargo test --manifest-path src-tauri/Cargo.toml --no-default-features
```

For the landing site only, run `npm run build:site`; its output is `dist/site`.
For the desktop bundle, run `npm run tauri -- build --bundles deb` on Linux.

## Required operator action for verified desktop downloads

The repository has no GitHub Actions signing secrets, and neither an Apple
certificate nor a Windows signing certificate is available in the factory
environment. Add these repository secrets, then create/run tag `v0.1.3`:

- `WINDOWS_CERT_PFX`, `WINDOWS_CERT_PASSWORD`
- `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`
- `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`

The hardened release workflow will then produce and verify Windows
Authenticode, macOS signing/notarization, checksums, provenance, and
`platform-signatures.json` before it can publish. Until that succeeds, the
live site intentionally says “Verified desktop download pending” and exposes
no package link or purchase link.
