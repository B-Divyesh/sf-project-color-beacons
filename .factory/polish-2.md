# Polish round 2

- Source reviewed: `cae342f1eed0b9dd96ea06c7e37859bc7493a8ff`
- Adversarial report: `07a44e68900e2925481a2e89a323352034e53518`
- Repair commit: `8d5eeb99f605b8e4b453c5f0e6b6f0ee5d5e421c`
- Live URL: <https://project-color-beacons.sociobot.in>
- Deployed: 2026-08-29, Azure Static Web Apps deployment `ed10553b-add5-4521-8418-43547c409902`

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the demo seeded with confirmed Atlas API, visible editor files, and a full first project row at 390 × 844. Reset restores that state. | `one-click mobile demo opens with a completed result and full sample row`; `@claim:demo-reset`; `evidence/polish-2/live-demo-mobile.png`; live `/demo`. |
| F-1-2 | Kept explicit rewrites for known SPA routes and the real SWA 404 override for unknown routes. | `routes have accessible structure, complete metadata, and no Axe findings`; `test:live:site`; `evidence/polish-2/live-404-desktop.png`; live `/polish-2-missing` returned 404. |
| F-1-3 | Kept the standalone 404 on the shared header/footer skeleton with complete metadata and icons. | Route test for `/404.html`; `verify-url.sh`; `evidence/polish-2/live-404-desktop.png`; live `/404.html`. |
| F-1-4 | Kept the factual audience wording and removed the unproved user-outcome promise. | `.factory/copy-audit.md`; `@claim:three-cues`; `evidence/polish-2/live-landing-mobile.png`; live `/`. |
| F-1-5 | Kept the free entitlement limited to the four tested capabilities and three projects. | `@claim:free-project-limit`; live `/` and `/terms`. |
| F-1-6 | Kept Reset demo as a registered observable claim. | `@claim:demo-reset`; `evidence/polish-2/live-demo-mobile.png`; live `/demo`. |
| F-1-7 | Kept release metadata generation in the claims registry. | `@claim:release-manifest`; clean-clone claim run. |
| F-1-8 | Strengthened platform selection: macOS, Windows, and Linux assets resolve only from a release marked signed and notarized; unsigned fixtures remain disabled. | `@claim:platform-download`; `evidence/polish-2/live-landing-mobile.png`; live `/#download` says the signed download is pending and has no `href`. |
| F-1-9 | The workflow still hard-fails without platform credentials. The site, cached responses, and both installer scripts now refuse the unsigned public release, so visitors are no longer sent to it. | `@claim:release-signing`; `@claim:platform-download`; `sh -n site/public/install.sh`; live `/#download`. A new trusted release still requires operator-owned Apple and Windows credentials. |
| F-1-10 | Kept “symbol” as the single term for the visual cue. | `.factory/copy-audit.md`; `@claim:three-cues`; live `/`. |
| F-1-11 | Kept color, name, and symbol as the three beacon cues; the folder path remains a separate check. | `.factory/copy-audit.md`; `@claim:three-cues`; live `/demo`. |
| F-1-12 | Kept “Preview the confirmation strip” as the section heading. | Route/copy test; `evidence/polish-2/live-landing-mobile.png`; live `/`. |
| F-1-13 | Kept “What stays on your device” as the privacy heading. | `.factory/copy-audit.md`; live `/`. |
| F-1-14 | Kept “Try sample projects” and “Separate sample workspace”; no subjective “safe” label remains. | `.factory/copy-audit.md`; README; live `/demo`. |
| F-1-15 | Kept direct 404 language: “Page not found”, “This address does not match a page”, and “Return home”. | Route test; `evidence/polish-2/live-404-desktop.png`; live `/polish-2-missing`. |
| F-2-1 | Added manual per-history-entry scroll storage, restoration after render, new-navigation top positioning, h1 focus, and route announcement. | `SPA Back and Forward restore focus and each history entry scroll position`; `test:live:site`; `evidence/polish-2/live-evidence.json` records 1706→1705 and 754→754 with h1 focus both ways. |
| F-2-2 | Removed the live path to unsigned downloads. Signed packages become links only when a release passes the signed/notarized marker; existing unsigned v0.1.1 is disabled on the product page and in installers. | `@claim:platform-download`; `@claim:release-signing`; live `/#download`; `evidence/polish-2/live-evidence.json`. Trusted package publication remains impossible until the owner supplies signing credentials. |
| F-2-3 | Registered `beacon-stability` and proved name, color, and symbol survive closing and reopening the app with the same local storage. | `@claim:beacon-stability`; `.factory/claims.json`; README. |
| F-2-4 | Removed the stronger claim that the workflow itself proves completed signatures. README now states the tested credential gate and site release filter. | `@claim:release-signing`; `@claim:platform-download`; README. |
| F-2-5 | Replaced the multi-device paid claim with “A valid license removes the three-project limit.” | `@claim:free-project-limit`; `evidence/polish-2/live-terms-desktop.png`; live `/terms`. |
| F-2-6 | Named each site and desktop control for its target: Check Atlas API, Check Northwind Store, and Check Launch Docs. | `demo project controls have unique accessible names`; desktop accessibility test; `evidence/polish-2/live-demo-mobile.png`; live `/demo`. |
| F-2-7 | Changed the persistent demo banner to a named complementary landmark and made the route and desktop Axe assertions require zero violations. | `routes have accessible structure, complete metadata, and no Axe findings`; `test:live:site`; live `/demo`; `evidence/polish-2/live-evidence.json` records one named complementary landmark. |
| F-2-8 | Renamed the hero secondary action to “View downloads”, matching its in-page result. | `.factory/copy-audit.md`; `evidence/polish-2/live-landing-mobile.png`; live `/`. |
| F-2-9 | Renamed step 2 to “Check the confirmation strip”. | `.factory/copy-audit.md`; `evidence/polish-2/live-landing-mobile.png`; live `/`. |

## Verification summary

- Fresh local clone: all 17 exact `.factory/claims.json` commands passed individually.
- Fresh local clone: full Playwright rerun passed 24/24; Vitest passed 6/6; typecheck, both Vite builds, Rust formatting, 2 Rust tests, default-feature Cargo check, and npm audit passed.
- Native Linux build: `CI=false npm run tauri -- build --bundles deb` produced a 1,921,976-byte Debian package.
- Live suite: routes, HTTP 404, zero Axe violations, keyboard, mobile, history, privacy, offline, billing, signed-release gate, and license-return tests passed.
- Factory verifier: title, language, one h1, main, alternatives, labels, and console checks passed.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.655 s, CLS 0, TBT 55 ms.
- Deployment identity: local and live `index-COUeKTTk.js` both hash to `a92b0036091a0985304e020c20fc3c8442899a3e94324764cef4e077beb1574d`.

## External signing boundary

The repository has no Apple or Windows signing secrets. Creating a trusted Windows signature or Apple notarization without the owner's certificates is impossible and would be dishonest. The repair therefore blocks every unsigned package path. The owner must add the secrets listed in the handoff and run the gated release workflow; only that resulting release can appear on the product page.
