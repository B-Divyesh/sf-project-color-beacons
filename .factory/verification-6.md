# Independent verification 6 — FAIL

**Candidate:** `f00224fb384879a8a46478159b5193a8a6816779` (`f00224f`)  
**Live URL:** <https://project-color-beacons.sociobot.in>  
**Verified:** 2026-08-29

## Decision

**FAIL — release-blocking.** The product source, demo, accessibility checks,
privacy flow, and Linux production bundle work. The required installable
desktop release does not exist: the only published GitHub release is explicitly
unsigned, so the live site correctly offers no desktop download while still
offering a $24 one-time license purchase.

## First-read test

A cold, uncached desktop visit showed:

- **What:** “Mark the project before you edit.”
- **For whom:** “For dyslexic and ADHD developers who need distinct cues across
  similar project windows.”
- **First action:** visible **Try it with sample data** link.

It passed the plain-words and one-click-demo gate. Clicking it opened `/demo`
with a completed Atlas API example, three named projects, and the persistent
“Demo — sample data, nothing is saved” banner.

## Mandatory claim registry

`.factory/claims.json` exists and contains 17 claims. From the clean checkout,
`npm ci` was run first and every listed `npm test -- --grep @claim:<id>` command
was run separately against the shipped local demo. All passed. A subsequent
full `npm test` run passed **24/24** (`test-results/.last-run.json` reports
`status: passed`).

| Claim | Result |
| --- | --- |
| three-cues | PASS |
| confirmation-before-write | PASS |
| demo-isolated | PASS |
| demo-disposal | PASS |
| demo-reset | PASS |
| offline-reload | PASS |
| free-project-limit | PASS |
| beacon-stability | PASS |
| release-manifest | PASS |
| release-signing | PASS |
| release-matrix | PASS |
| platform-download | PASS |
| settings-preserved | PASS |
| editor-settings | PASS |
| project-data-local | PASS |
| license-token-only | PASS |
| checkout-availability | PASS |

## Local build and test evidence

- `npm ci` — PASS; 0 vulnerabilities reported.
- `npm test` — PASS, 24/24 Playwright tests.
- `npm run test:unit` — PASS, 6/6 Vitest tests.
- `npm run typecheck` — PASS.
- `npm run build` — PASS. Site bundle: JS 20.80 kB (7.35 kB gzip), CSS
  12.40 kB (3.67 kB gzip); both meet the static budgets.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check` — PASS.
- `cargo test --manifest-path src-tauri/Cargo.toml --no-default-features` —
  PASS, 2/2 tests.
- `cargo check --manifest-path src-tauri/Cargo.toml` — PASS after installing
  the same Linux libraries named by the release workflow.
- `CI=false npm run tauri -- build --bundles deb` — PASS after installing the
  release workflow's Linux packages. Produced
  `src-tauri/target/release/bundle/deb/Project Color Beacons_0.1.1_amd64.deb`
  (1,921,976 bytes).

The first Tauri/Cargo attempt failed only because this disposable verifier image
lacked `glib-2.0` development files. Installing
`libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`, exactly as
the checked-in GitHub Actions workflow does, made the production bundle pass.

## End-to-end and quality checks

- Confirmed Atlas API and Northwind Store flows: selecting a project shows the
  named confirmation strip; confirming Northwind then exposes the VS Code/Zed
  preview. Demo storage was only `demo:pcb:site-state`.
- Recovery paths: the browser UI explains that a sample folder cannot be chosen
  on the web; an empty license submission says to paste the receipt key and
  sends no verification request. Source/Rust tests cover nonexistent folders,
  invalid JSON, preservation of unrelated JSON settings, and supported editor
  output.
- Live 390 px demo had `scrollWidth === clientWidth === 390`; no horizontal
  overflow. Desktop and mobile flows were keyboard-operable with a visible
  3 px focus outline. The mobile sample UI remained usable.
- Live Axe scan: **0 serious/critical violations**. The supplied
  `verify-url.sh` also passed: title present, `lang=en`, one h1, main landmark,
  no missing image alt text, no unlabeled buttons, and no console errors.
- Live `/demo` ran with no page/console errors. It registered `/sw.js`; after
  the first visit, an offline reload of `/demo` succeeded with the demo banner
  and heading present. Reduced-motion rules and the route/accessibility checks
  are also covered by the full Playwright suite.
- Live routes `/`, `/demo`, `/privacy`, `/terms`, `/404.html` each returned
  200; an unknown route returned 404. The deployed JS and CSS SHA-256 hashes
  exactly equal this candidate build:
  `a92b0036091a0985304e020c20fc3c8442899a3e94324764cef4e077beb1574d`
  and
  `7614b051fdff5eab9b5a7dd6b2a3880f6a9dca7f21ce762ccb4d80a4532dabe7`.

## Privacy, security, caching, and API allowance

- During a fresh direct `/demo` flow through confirm, every observed request
  was same-origin (HTML, JS, CSS, favicon); no project name/path left the
  browser. The sole stored key was the separate `demo:pcb:site-state` key.
  Landing-page release/catalogue checks additionally use only the disclosed
  `api.github.com` and `api.sociobot.in` origins and contain no project data.
- Response headers include CSP with `frame-ancestors 'none'`, HSTS,
  `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and a
  restrictive permissions policy. Hashed JS/CSS are cached for one year with
  `immutable`; HTML uses a short revalidation cache.
- The product has no product-owned HTTP endpoint. Its Sociobot license-verify
  endpoint was rate-tested with a nonsecret invalid token: requests 1–30
  returned 200; requests 31–35 returned **429** with `Retry-After` values 3,
  3, 2, 2, 2 seconds. Observed allowance: **30 requests per active window**.

## Defects

### Blocker — no signed, installable desktop release

The desktop-app acceptance contract requires a published signed release with
real packages for macOS Intel/Apple silicon, Windows, and Linux, checksums,
and a live platform-detected download link. Fresh evidence contradicts that:

1. GitHub's current `v0.1.1` release body says **“Unsigned desktop builds.”**
2. The live Linux download control reads **“Signed Linux download pending”**,
has `aria-disabled="true"`, and has no `href`.
3. The live page nevertheless displays **“Buy a $24 license”**.

The source workflow correctly fails closed until platform-signing credentials
exist, and the browser correctly refuses to expose unsigned artifacts. Those
are good safeguards, but they do not replace the required finished release.
Publish signed/notarized macOS builds, a signed Windows installer, and the
Linux packages with `SHA256SUMS`/`latest.json`; then verify that each detected
platform button resolves to its signed asset before resubmission.

## Non-blocking notes

- No additional AI feature is warranted: this local, deterministic
  confirmation aid does not gain user value from model inference, and adding
  it would undermine the local-first privacy design.
- The page intentionally treats a missing signed release as a disabled control;
  after the blocker is fixed, recheck that the enabled download control has a
  real asset URL on each platform.
