# Independent verification 11

- **Verdict:** **FAIL — release-blocking**
- **Requested candidate:** `68e77e315c0af5f2c145980d19208b5890cd27a0`
- **Reachable repository commit tested:** `68e77e0bade0af9a633893f7568bc30672d5df02`
- **Live URL:** <https://project-color-beacons.sociobot.in>
- **Demo URL:** <https://project-color-beacons.sociobot.in/demo>
- **Date:** 2026-08-30 UTC

The first-read experience, demo, reachable source build, Linux package, privacy boundary, and automated checks are strong. The candidate cannot be accepted because its commit is absent, the deployed bytes reproduce from a different commit, the landing page breaks 200% text reflow at mobile width, and Windows/macOS visitors have no install action.

## Release-blocking findings

### Critical — the requested candidate does not exist in the supplied repository

The clean clone opened at the stated base commit `68e77e0bade0af9a633893f7568bc30672d5df02`. Fetching the requested candidate returned:

```text
fatal: remote error: upload-pack: not our ref 68e77e315c0af5f2c145980d19208b5890cd27a0
```

Fresh `origin/main` and GitHub both identify `68e77e0bade0af9a633893f7568bc30672d5df02` as the branch head. The GitHub commit API returned HTTP 422 for the requested candidate. Therefore the mandatory candidate checkout, candidate claim run, and candidate-to-live comparison are impossible.

The live deployment is not an unknown build: after building the reachable base, all 20 publicly served files matched local `dist/site` byte-for-byte by SHA-256. The current `v0.1.3` release instead targets `eeca261cd66c112a1cdc6cc8f0248479ca733742`. Neither identity is the requested candidate.

Release requirement: push the exact candidate commit, then rebuild and deploy from it. Re-run every claim and compare the resulting files to production.

### Major — the landing page does not reflow at 200% text on a 390 px viewport

At 390 × 844 CSS pixels, setting the root text size to 200% expanded the live landing document to **721 px** while the viewport remained **390 px**. The `/demo` route remained 390 px wide under the same test.

The overflow comes from the desktop pricing block. Its inner content measured 669 px wide and ended at x=720; the no-wrap purchase row and grid min-content sizing force the section wider than the viewport. This requires two-dimensional scrolling and fails the accessibility requirement that text resize to 200% without loss.

Release requirement: make the pricing grid and purchase row shrink/wrap at enlarged text, and add a 390 px / 200% regression for the landing route, including the loaded purchase state.

### High — Windows and macOS have no installable landing-page action

Fresh platform user-agent checks produced:

| Platform | Landing result |
| --- | --- |
| Linux | `Download for Linux`, linked to the verified v0.1.3 AppImage |
| Windows | `Verified Windows download pending`, no `href`, checkout absent |
| macOS | `Verified macOS download pending`, no `href`, checkout absent |

The GitHub release contains Windows and both macOS architectures, but `platform-signatures.json` records Windows Authenticode as false and macOS signing/notarization as false. The site correctly follows its own fail-closed trust claim, but the desktop acceptance contract requires one obvious install step and a real detected-platform asset on all three platforms.

Release requirement: provide the owner signing credentials, publish signed/notarized artifacts, and verify the Windows and both macOS download paths. Do not weaken the existing trust gate.

## Mandatory first-read test

**PASS.** A cold desktop and 390 px mobile visit answer all three questions in the first screen:

- What it does: **“Mark the project before you edit.”** It uses a stable color, name, and symbol, followed by confirmation.
- Who it is for: **“For dyslexic and ADHD developers who need distinct cues across similar project windows.”**
- What to do first: **“Try it with sample data.”**

One click opened `/demo` with Atlas API already confirmed, its editor-file preview ready, and all three named sample projects. The persistent banner said **“Demo — sample data, nothing is saved”** and exposed **Reset demo** and **Start for real**.

## Claims gate

`.factory/claims.json` exists and contains 18 entries. Because the requested candidate is unavailable, its claims cannot be run and the candidate fails the gate. For diagnostic evidence, I ran every exact command separately after `npm ci` at the reachable base commit; all 18 passed:

| Claim ID | Reachable base result |
| --- | --- |
| `three-cues` | PASS |
| `confirmation-before-write` | PASS |
| `demo-isolated` | PASS |
| `demo-disposal` | PASS |
| `demo-reset` | PASS |
| `offline-reload` | PASS |
| `free-project-limit` | PASS |
| `beacon-stability` | PASS |
| `release-manifest` | PASS |
| `release-signing` | PASS |
| `release-matrix` | PASS |
| `platform-download` | PASS |
| `platform-signatures` | PASS |
| `settings-preserved` | PASS |
| `editor-settings` | PASS |
| `project-data-local` | PASS |
| `license-token-only` | PASS |
| `checkout-availability` | PASS |

The complete Playwright run also passed **32/32** tests. The page and README claims map to this registry; no additional unregistered product promise was found.

## Clean build and static checks

Run at the reachable base after a lockfile install:

- `npm ci` — PASS; 193 packages, 0 vulnerabilities
- `npm test` — PASS; 32/32
- `npm run test:unit` — PASS; 7/7
- `npm run lint` — PASS
- `npm run typecheck` — PASS
- `npm audit --audit-level=high` — PASS; 0 vulnerabilities
- `npm run build` — PASS; produced `dist/app` and `dist/site`
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check` — PASS
- `cargo test --manifest-path src-tauri/Cargo.toml --no-default-features` — PASS; 2/2
- `cargo test --manifest-path src-tauri/Cargo.toml` — PASS; 2/2 after installing the documented Tauri system prerequisites
- `cargo check --manifest-path src-tauri/Cargo.toml` — PASS
- `cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings` — PASS
- `CI=false npm run tauri -- build --bundles deb` — PASS; produced `Project Color Beacons_0.1.3_amd64.deb`
- `npm run test:release` — PASS against the public v0.1.3 release
- `npm run test:live:site` — PASS
- `npm run test:live:billing` — PASS

Production bundle sizes are within contract: site JS 22.68 KB raw / 8.06 KB gzip; site CSS 12.94 KB raw / 3.76 KB gzip; app JS 11.65 KB raw / 4.75 KB gzip; app CSS 9.98 KB raw / 3.13 KB gzip. The largest mobile hero image is 12.68 KB.

## End-to-end behavior

The smallest useful flow works in the browser-shaped desktop app and shipped sample data:

- Confirming a selected project shows the color, written name, symbol, path, and only then the chosen editor settings.
- A 48-character project name saved successfully.
- No selected editor produced the actionable error “Choose at least one editor strip, then save the project.” Selecting VS Code recovered and saved successfully.
- A duplicate folder produced “That folder already has a beacon. Choose a different folder.”
- A VS Code-only project preview contained `.vscode/settings.json` and did not contain `.zed/settings.json`.
- Removal named the project, required confirmation, and Undo restored it.
- The only storage key in the desktop demo was `demo:pcb:projects`; no request left `127.0.0.1`.

The published Debian package downloaded at 1,929,142 bytes. Its SHA-256, `4bf4b041f4cf4439b4ab2b249882e0a596c0f1440e3a0daf8d9ebe5aa8d04bb1`, matched `SHA256SUMS`. Package metadata reports `project-color-beacons` 0.1.3 amd64. It installed with its declared dependencies and remained running for eight seconds under Xvfb. The live shell installer independently downloaded and installed the 76,675,576-byte AppImage; its SHA-256 was `96d0963d61dfae4a03f5f9efb9b1414bdfb2360845589e5fcaddbbf3c73add4b`.

## Live accessibility, privacy, security, and performance

- Desktop and normal-text 390 px layouts had no horizontal overflow. All measured visible interactive targets were at least 44 × 44 px.
- Keyboard Tab reached the skip link and primary demo action; after focus settled, the designed outline was 3 px `#d66f35`. Enter opened `/demo`. There was no trap.
- Reduced-motion mode shortened movement to 0.01 ms. Light and dark checks found no Axe serious or critical violations and no console/page errors.
- The 200% landing reflow failure remains as documented above; Axe does not detect it.
- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, 1,177 ms observed load, correct title and `lang=en`, one h1, one main, no missing image alternatives, no unnamed buttons, and no console errors.
- A direct full demo flow requested only same-origin files. After **Start for real**, the landing made GET requests to GitHub release metadata and the Sociobot product catalogue. No request body or URL contained a sample project name/path. Demo state used only `demo:pcb:site-state` and was deleted on exit.
- The service worker updated from `/sw.js`, controlled `/demo`, used cache `pcb-site-v3`, and reloaded the banner plus confirmed Atlas sample while offline.
- Root, demo, privacy, terms, and the real 404 return HSTS, `nosniff`, a strict-origin referrer policy, restricted permissions, and a response-header CSP with `frame-ancestors 'none'`. The unknown route returned HTTP 404.
- HTML and `sw.js` use 30-second revalidation. Hashed JavaScript uses `public, max-age=31536000, immutable`.
- Lighthouse 12.8.2 mobile: performance **99**, accessibility **100**, best practices **100**, SEO **100**, LCP **1.2 s**, CLS **0**, and total blocking time **130 ms**.
- The Sociobot license endpoint enforced rate limiting. Earlier live checks consumed three requests in the same client window; 27 subsequent invalid checks returned 200 and the next returned **429** with `Retry-After: 3`. Observed allowance: **30 requests per active window**.
- The product has no sign-in and no product-owned backend. Entra authority, backend persistence/concurrency, and backend health identity are not applicable.

## Required next verification

1. Make `68e77e315c0af5f2c145980d19208b5890cd27a0` reachable, or issue a corrected candidate SHA.
2. Repair landing-page reflow at 390 px / 200% text and add coverage for the loaded purchase/download state.
3. Publish signed Windows and signed/notarized macOS artifacts so detected-platform download buttons and checkout are available.
4. Re-run all 18 claim commands and the complete matrix from the exact candidate, then prove the live files match that candidate.

No product code was modified during this verification.
