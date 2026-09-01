# Polish round 5 — complete finding map

Scope: released candidate `5e77643d0af43ddcb7ca72b10689f9aa2da6aebd`,
review report `8c4c6771ba9e8432c909cecf4f75a2c4741c5262`, and every
earlier `.factory/review-*.md` and `.factory/polish-*.md` record.

Repair commit `d04670b867dee25966362e6e65844c1a3e8a9e2a` is deployed at
<https://project-color-beacons.sociobot.in>. Screenshots and the machine-readable
live summary are in `.factory/evidence/polish-5/`. Every one of the 20 claim
commands passed separately from clean clone `/tmp/pcb-polish5-clean.sVU5xA`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | `/demo` and `/?demo=1` open the completed Atlas API sample in one click. The banner, reset, three sample projects, and editor result are visible at 390 px. | `@claim:demo-reset`; `@claim:confirmation-before-write`; `demo-mobile.webp`; live `/?demo=1`. |
| F-1-2 | Unknown addresses use the designed standalone response with HTTP 404. | `routes have accessible structure`; `not-found.webp`; live `/polish-5-not-found` returned 404. |
| F-1-3 | The standalone 404 has its own title, description, canonical, header, main, footer, legal links, and current build identity. | `the landing page and both 404 responses use the same generated build identity`; live `/404.html`. |
| F-1-4 | The first screen names the task and audience without claiming an unsupported outcome. | `.factory/copy-audit.md`; `@claim:three-cues`; `home-mobile.webp`. |
| F-1-5 | Free copy is limited to the tested color, name, symbol, confirmation, and three-project boundary. | `@claim:free-project-limit`; live `/#download`; live `/terms`. |
| F-1-6 | Reset is a registered claim and restores the completed Atlas sample plus all three projects. | `@claim:demo-reset`; `demo-mobile.webp`; live `/?demo=1`. |
| F-1-7 | Release manifest behavior is registered and checks package entries plus SHA-256 values. | `@claim:release-manifest`; `npm run test:release`. |
| F-1-8 | Platform selection is registered and links only the complete matching package after every required trust check. | `@claim:platform-download`; platform gate screenshots; live `/#download`. |
| F-1-9 | Windows requires Authenticode; macOS requires signing and notarization. Unsigned packages and purchases are withheld. | `@claim:platform-signatures`; `@claim:checkout-availability`; Windows/macOS gate screenshots. |
| F-1-10 | “Symbol” is the single term for the visual cue. | `.factory/copy-audit.md`; `@claim:three-cues`; live `/`. |
| F-1-11 | Copy defines exactly three beacon cues and treats the folder path separately. | `@claim:three-cues`; `@claim:confirmation-before-write`; live `/demo`. |
| F-1-12 | The section heading is “Preview the confirmation strip.” | `.factory/copy-audit.md`; `home-mobile.webp`. |
| F-1-13 | The privacy heading is “What stays on your device.” | `.factory/copy-audit.md`; live `/`. |
| F-1-14 | Demo language says “Separate sample workspace” and states the `demo:` storage boundary. | `@claim:demo-isolated`; `demo-mobile.webp`; live `/?demo=1`. |
| F-1-15 | Both not-found paths use direct address/page wording and a Return home action. | `routes have accessible structure`; `not-found.webp`. |
| F-2-1 | History entries retain their own scroll positions. Back and Forward restore scroll, focus the new h1, and announce the route. | `SPA Back and Forward restore focus and each history entry scroll position`; `npm run test:live:site`. |
| F-2-2 | All product-controlled download, installer, workflow, and checkout paths fail closed for unsigned Windows and macOS releases. | `@claim:platform-download`; `@claim:platform-signatures`; `@claim:checkout-availability`; gate screenshots. |
| F-2-3 | Saved color, name, and symbol survive a fresh app page. | `@claim:beacon-stability`. |
| F-2-4 | Documentation and tests distinguish GitHub provenance, Authenticode, Apple signing, and notarization. | `@claim:release-signing`; `@claim:platform-signatures`; README. |
| F-2-5 | Entitlement copy promises only that a valid license removes the project limit. | `@claim:desktop-license-recovery`; live `/terms`. |
| F-2-6 | Every sample control includes its project name. | `demo project controls have unique accessible names`; live `/demo`. |
| F-2-7 | The demo status is a named complementary landmark. | Live Axe checks report zero serious or critical issues; `demo-mobile.webp`. |
| F-2-8 | The secondary first-screen action says “View downloads.” | `.factory/copy-audit.md`; `home-mobile.webp`. |
| F-2-9 | Step 2 says “Check the confirmation strip.” | `.factory/copy-audit.md`; live `/`. |
| F-3-1 | The release workflow now refuses to publish Windows without verified Authenticode or macOS without verified signing and notarization. The site mirrors that policy. | `@claim:platform-signatures`; workflow assertions; live Windows/macOS cold-user-agent checks. |
| F-3-2 | `404.html` is generated from the shared version and build values. | Shared-build-identity route test; live `/404.html` shows version 0.1.6 and build 2026.08.30. |
| F-3-3 | The recorded Sigstore bundle is cryptographically checked against package, repository, workflow, commit, and tag. | `@claim:release-signing`; `npm run test:release`. |
| F-3-4 | The platform claim rejects every incomplete package/metadata class and unsigned Windows/macOS state. | `@claim:platform-download`. |
| F-3-5 | Platform trust records reject false or missing provenance, Authenticode, Apple signing, and notarization. | `@claim:platform-signatures`; release workflow hard-gate assertions. |
| F-3-6 | The first screen states the free limit and catalogue-backed one-time price at 390 × 844. | `@claim:free-project-limit`; `@claim:price-display`; `home-mobile.webp`. |
| F-3-7 | Release documentation explains package origin and OS trust in plain words. | `.factory/copy-audit.md`; README; `@claim:release-signing`. |
| F-4-1 | Restored strict fail-closed gates in the release contract, site, both installers, workflow, and checkout. The current unsigned v0.1.6 Windows/macOS files have no download or purchase link; Linux remains available. | `@claim:platform-download`; `@claim:platform-signatures`; `@claim:checkout-availability`; `windows-download-gate.webp`; `macos-download-gate.webp`; live `/#download`. |
| F-4-2 | Checkout return keys are session-only on the website and are copied into the desktop License dialog; the site does not claim to restore a device. | `@claim:desktop-license-recovery`; live `/?license=fixture`; terms and README. |
| F-4-3 | README uses “browser-accessible API” instead of unexplained browser-security jargon. | `.factory/copy-audit.md`; README banned-word audit. |
| F-5-1 | Added `price-display`. The first-screen fact and purchase copy now use the active catalogue value; the test exercises $24 and $29 fixtures and checks that the single live registration is exactly $24 USD one-time. | `@claim:price-display`; `npm run test:live:billing`; `home-mobile.webp`; live `/`. |

## Final evidence

- Clean clone: all 20 exact `.factory/claims.json` commands passed separately;
  Playwright passed 35/35 and Vitest passed 7/7.
- Build and static analysis: app/site builds, TypeScript, ESLint, Rust format,
  Rust tests (2/2), Tauri `cargo check`, shell syntax, and npm audit all passed.
- Live: routes, titles, metadata, true 404, Axe, keyboard, mobile layout,
  Back/Forward focus and scroll, reduced motion, privacy, offline reload,
  demo disposal/reset, billing, platform gates, and license handoff passed.
- Live billing: exactly one matching product, `2400` USD minor units, with a
  hosted checkout redirect. The landing fact displays `$24 once`.
- Live release: Linux v0.1.6 is installable; Windows and macOS remain withheld
  because their required operating-system signatures are absent.
- Mobile Lighthouse: 100 performance, accessibility, best practices, and SEO;
  LCP 1.7 s, CLS 0, TBT 50 ms, transferred 95 KiB.
- Deployment `a4ff42f5-ace8-4efd-bb2c-16b607076b19` serves JavaScript SHA-256
  `6837f555dd169951c8e31b995a41e7c355cf27b436cca95eaec33ecafe453111`,
  identical to the local `dist/site` build.

No review finding remains open. Windows and macOS publication needs the owner
certificates listed in `.factory/handoff.md`; the product stays fail-closed
until a future release verifies those signatures.
