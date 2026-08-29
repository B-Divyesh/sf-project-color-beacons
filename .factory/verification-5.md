# Independent verification 5 — PASS

**Candidate:** `4a7878f6f6c545f6833f77797709b3548cd0b0ce`  
**Verified URL:** <https://project-color-beacons.sociobot.in>  
**Date:** 2026-08-29  
**Scope:** independent clean-checkout verification against the researched brief and factory acceptance contract. Product source was not changed.

## Result

**PASS.** The deployed site matches the candidate build and the complete sample workflow works. No release-blocking defect was found.

## First read

Cold-opening the live landing page answers all three required questions in plain words: it is a local desktop helper that marks a project before editing; it is for dyslexic and ADHD developers working across similar project windows; and the first action is **Try it with sample data**. That action is visible on the first screen and opens the completed, isolated Atlas API sample in one click.

## Clean-checkout gates

- `npm ci` passed; 0 reported vulnerabilities.
- `.factory/claims.json` exists with 16 claims. Every exact registered `npm test -- --grep @claim:<id>` command passed individually.
- `npm test` passed: 22/22 Playwright tests.
- `npm run test:unit` passed: 6/6 Vitest tests.
- `npm run typecheck` passed.
- `npm run build` passed and produced `dist/app` and `dist/site`.
- `cargo fmt --check --manifest-path src-tauri/Cargo.toml` passed.
- `cargo test --manifest-path src-tauri/Cargo.toml --no-default-features` passed: 2/2.
- Default `cargo check` initially correctly reported a missing container system dependency (`glib-2.0`), not a code failure. After installing the same Linux prerequisites declared in the release workflow (`libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, `patchelf`) it passed.
- `CI=false npm run tauri -- build --bundles deb` passed after those prerequisites and produced `src-tauri/target/release/bundle/deb/Project Color Beacons_0.1.1_amd64.deb` (1,921,838 bytes).

The claim coverage includes the three-cue beacon, confirmation before output, isolated/disposable/resettable demo, offline reload, three-project free limit, release metadata/signing/matrix/platform selection, preserving existing settings, VS Code/Cursor/Zed settings, local project data, license-token-only verification, and checkout availability.

## Product and accessibility evidence

- Demo normal path: Atlas API starts confirmed with editor-file preview; checking Northwind then pressing its named confirmation reveals the editor settings only afterwards. Reset restores Atlas and Start for real deletes demo state.
- Boundary/error paths exercised by the suite: fourth free project, unavailable/invalid license, offline reload, unknown route, and release-fetch fallback. The Rust core separately verifies editor JSON preservation and supported editor output.
- Desktop and 390 px mobile flows passed with no horizontal overflow. The 390 px live demo starts with a complete Atlas row in the viewport.
- Keyboard flow, visible 3 px solid focus outline, back-button focus restoration, and reduced-motion styles passed.
- Axe found no serious or critical violations on `/`, `/demo`, `/?demo=1`, `/privacy`, `/terms`, `/404.html`, unknown-route 404, and the desktop UI. No console or page errors were observed on successful routes.
- Live link crawl returned 200 for all internal and external HTTP links (in-page anchors excluded).

## Privacy, headers, performance, and identity

- A clean demo request log contained only `https://project-color-beacons.sociobot.in`; it never sent project data externally. The normal desktop simulation is also covered by the `project-data-local` claim.
- License verification sends only the pasted license token to `https://api.sociobot.in`; product catalog/release metadata calls are limited to the disclosed Sociobot and GitHub endpoints.
- The deployment sends HTTPS/HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, a matching CSP with `frame-ancestors 'none'`, and immutable one-year caching for hashed JS. No product-owned server-side endpoint exists, so an application request allowance/429 check is not applicable.
- Built site JS is 20.17 kB (7.10 kB gzip); CSS is 12.31 kB (3.63 kB gzip), well within the static budgets.
- Candidate/deployment identity is exact: local and live `assets/index-CkTBOpZv.js` SHA-256 are both `14fba1e78801849e1548c1440741724e0778cb6362678949ec1ce1b20eef56ec`; local and live CSS SHA-256 are both `ea59edaa4d17e1fd8d0d60348b380f0cec2e039aede0c9e28095b92ac4d653da`.

## Desktop release check

GitHub release `v0.1.1` exposes macOS (Intel and Apple silicon), Windows, and Linux assets, plus `latest.json` and `SHA256SUMS`. `latest.json` lists all three platforms. Downloaded `Project.Color.Beacons_0.1.1_amd64.deb` hashes to `e752d589fd324f1d948b1fe6a446864ec78ccc5ae53064cfcff34879ba034c35`, exactly matching `SHA256SUMS`; package metadata identifies version 0.1.1 and the documented Linux runtime dependencies.

The published v0.1.1 artifacts visibly disclose that they are unsigned. This is a documented operator limitation, not a mismatch or concealed claim; the checked-in future-release workflow requires signing credentials.

## Defects

None found. The failed first native check was a verifier-container prerequisite issue and passed after the workflow's documented dependencies were installed.
