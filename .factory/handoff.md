# Handoff — polish round 2

## Outcome

The cumulative source and live-site findings are repaired and deployed from commit `8d5eeb99f605b8e4b453c5f0e6b6f0ee5d5e421c`.

The live product no longer offers the unsigned v0.1.1 packages. A new trusted Windows/macOS release cannot be created until the owner supplies platform signing credentials; this is the only remaining operator action and is outside repository control.

## What changed

- Restored independent scroll positions through SPA Back and Forward while retaining h1 focus and route announcements.
- Added unique project names to every demo and desktop Check control.
- Put the demo status banner in a named landmark and tightened Axe checks to require zero violations.
- Rewrote “Download the app” and “Check the strip” to name their actual results.
- Aligned paid terms with the tested three-project entitlement.
- Added the `beacon-stability` claim and a close/reopen persistence test.
- Filtered fresh and cached GitHub responses to signed/notarized releases only. The landing page and both installer scripts refuse the current unsigned release.
- Updated the claim registry, README, copy audit, demo wording, and the ≤120-character verb-first catalogue description.
- Preserved the glacial ceramic visual system and original assets.

The full finding-to-change-to-evidence map is in `.factory/polish-2.md`.

## Verification

From a fresh local clone of the repair commit:

```sh
npm ci
# Every one of the 17 exact commands in .factory/claims.json, run separately
npm test
npm run test:unit
npm run typecheck
npm run build
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo test --manifest-path src-tauri/Cargo.toml --no-default-features
cargo check --manifest-path src-tauri/Cargo.toml
npm audit --audit-level=high
```

Results: 17/17 individual claim commands passed; the full Playwright rerun passed 24/24; Vitest passed 6/6; Rust passed 2/2; typecheck, build, default Cargo check, formatting, and audit passed. The first full clean-clone Playwright run experienced a Chromium process crash during `platform-download`; its assertion had passed individually, and the immediate full clean rerun passed 24/24.

Additional checks:

- `CI=false npm run tauri -- build --bundles deb` passed and produced `Project Color Beacons_0.1.1_amd64.deb` (1,921,976 bytes).
- `npm run test:live:site` passed routes, real 404, zero Axe violations, mobile, keyboard, history, privacy, demo disposal, offline reload, signed-release gating, billing UI, and license return.
- `npm run test:live:billing` passed the live $24 product and hosted checkout redirect.
- `/opt/fleet/lib/verify-url.sh https://project-color-beacons.sociobot.in .factory/evidence/polish-2/verify-url` passed with no console errors.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.655 s, CLS 0, TBT 55 ms.
- Built site payload: 7.35 KB gzip JS, 3.67 KB gzip CSS, 12.7 KB mobile hero.
- Local/live JavaScript SHA-256 match: `a92b0036091a0985304e020c20fc3c8442899a3e94324764cef4e077beb1574d`.
- Azure deployment: `ed10553b-add5-4521-8418-43547c409902`; live `/` and `/demo` return 200; an unknown route returns 404.

Live evidence is under `.factory/evidence/polish-2/` in the worker workspace, including landing, demo, terms, 404, Lighthouse, and history-state records.

## Needs operator action

Add these GitHub Actions secrets, then dispatch `.github/workflows/release.yml` for a new version:

- `APPLE_CERTIFICATE`
- `APPLE_CERTIFICATE_PASSWORD`
- `APPLE_SIGNING_IDENTITY`
- `APPLE_ID`
- `APPLE_PASSWORD`
- `APPLE_TEAM_ID`
- `WINDOWS_CERT_PFX`
- `WINDOWS_CERT_PASSWORD`

The repository currently has zero Actions secrets. The workflow will fail closed until all required credentials exist. After it publishes a release whose body starts with “Signed and notarized desktop builds.”, verify Windows Authenticode and Apple notarization independently. The product page will then expose the matching platform asset automatically.

## Run and deploy

```sh
npm ci
npm test
npm run build:site
/opt/fleet/lib/deploy-static.sh project-color-beacons dist/site
```
