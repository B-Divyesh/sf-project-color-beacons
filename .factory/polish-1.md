# Polish round 1

- Candidate: `7fcd61ab9d4245eee3a2af1293c5cc3b0bfe9bf5`
- Review: `b63db1835d44f10ac70942069a4a8ec3ccf2b636`
- Repair: `845167bbef4e036d17a854520c95fd90c72af6c2`
- Live URL: <https://project-color-beacons.sociobot.in>
- Reviewed again: 2026-08-29

No earlier `.factory/review-*.md` or `.factory/polish-*.md` files existed. Every finding in `review-1.md` was handled.

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | `/demo` and `/?demo=1` now open with Atlas API confirmed, its editor-file preview visible, and a complete Atlas row in the first 390 × 844 viewport. Reset restores the same state. | `one-click mobile demo opens with a completed result and full sample row`; `@claim:demo-reset`; [live mobile screenshot](evidence/polish-1/live-demo-mobile.png); live `/demo`. |
| F-1-2 | Known routes have explicit rewrites. Unknown routes now reach the SWA 404 response override. | `routes have accessible structure...`; `npm run test:live:site`; live `/definitely-missing-review-1` returned HTTP 404. |
| F-1-3 | Rebuilt `404.html` with the shared skip link, navigation, main/footer skeleton, metadata, icons, one-liner, Factory credit, and build ID. | Route test for `/404.html`; [live 404 screenshot](evidence/polish-1/live-404-desktop.png); live `/404.html`. |
| F-1-4 | Replaced the unproved outcome with factual situation copy for developers who need distinct cues across similar windows. | `copy-audit.md`; live `/`; `@claim:three-cues` covers only the observable cue claim. |
| F-1-5 | Standardized the entitlement copy to color, name, symbol, and confirmation for three projects. Expanded the entitlement test to exercise all four before testing the fourth-project gate and licensed recovery. | `@claim:free-project-limit`; live `/#download`; README. |
| F-1-6 | Registered `demo-reset` and added an observable reset test. | `@claim:demo-reset`; live `/demo`. |
| F-1-7 | Registered `release-manifest`; its test creates fixture packages, runs the shipped generator, and validates `SHA256SUMS` and `latest.json`. | `@claim:release-manifest`. |
| F-1-8 | Registered `platform-download`; its test uses macOS, Windows, and Linux user agents with matching fixture assets. | `@claim:platform-download`; live Linux asset checked by `npm run test:live:site`. |
| F-1-9 | Release jobs now fail before publication unless Windows signing and macOS signing/notarization credentials exist. The workflow imports both certificates, passes Apple notarization variables to Tauri, and no longer publishes an unsigned-copy field. | `@claim:release-signing`; `.github/workflows/release.yml`. The already-published v0.1.1 remains honestly labeled unsigned until the owner supplies signing credentials; see handoff operator action. |
| F-1-10 | Replaced “shape” with “symbol” for the beacon cue everywhere. | `copy-audit.md`; live `/`. |
| F-1-11 | Defined color, name, and symbol as the three beacon cues; the folder path is consistently a separate check. | `copy-audit.md`; live `/` and `/demo`. |
| F-1-12 | Renamed the preview heading to “Preview the confirmation strip”. | Route copy assertion and live `/`. |
| F-1-13 | Renamed the privacy heading to “What stays on your device”. | Route copy assertion and live `/`. |
| F-1-14 | Replaced “safe” labels with “Try sample projects” and “Separate sample workspace”. | `copy-audit.md`; README; live `/demo`. |
| F-1-15 | Replaced 404 lore with “Page not found”, “This address does not match a page”, and “Return home”. | Route test; `npm run test:live:site`; [live 404 screenshot](evidence/polish-1/live-404-desktop.png). |

## Acceptance evidence

- Clean-clone `npm ci`: passed with zero audit vulnerabilities.
- Every one of the 16 commands in `.factory/claims.json`: passed separately from the clean clone.
- Clean-clone `npm test`: 22/22 passed.
- Clean-clone `npm run test:unit`: 6/6 passed.
- Clean-clone `npm run typecheck`, `npm run build`, `cargo fmt --check`, and `cargo test --no-default-features`: passed.
- Local default-feature `cargo check`: passed after installing the documented Tauri Linux dependencies.
- Local `CI=false npm run tauri -- build --bundles deb`: produced `Project Color Beacons_0.1.1_amd64.deb`.
- `npm run test:live:site`: passed routes, Axe, mobile layout, keyboard, privacy, demo disposal, offline reload, download, billing UI, and license return.
- `npm run test:live:billing`: passed the live $24 product and hosted checkout redirect.
- Factory `verify-url.sh`: HTTP 200, no console errors, title/lang/one h1/main/alt/button checks passed.
- Live Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.71 s, CLS 0, TBT 34 ms.
- Live unknown-route check: HTTP 404 with the designed document.
- Deployed JS SHA-256 exactly matched `dist/site/assets/index-CkTBOpZv.js`.
