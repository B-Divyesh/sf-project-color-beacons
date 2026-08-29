# Independent verification 7 — FAIL

**Candidate:** 9698abe884e96c97f95b9567ec197453935d2efd  
**Live URL:** <https://project-color-beacons.sociobot.in>  
**Verified:** 2026-08-29  
**Work order:** project-color-beacons-verify-7

## Decision

**FAIL — release-blocking.** The candidate has a useful isolated demo, passes
all registered claim tests, builds a working Linux desktop package locally,
and deploys the exact tested static assets. It is not releasable because no
signed desktop release exists. Fresh accessibility checks also found a serious
dark-theme contrast failure, broken 200% text reflow, and touch targets below
the required size.

The live site correctly hides both downloads and purchase links while the
release is unsigned. That honest mitigation does not satisfy the desktop-app
acceptance contract.

## Mandatory first-read gate

A cold browser context at 1440×900 showed:

- **What it does:** “Mark the project before you edit.”
- **For whom:** “For dyslexic and ADHD developers who need distinct cues across
  similar project windows.”
- **What to click first:** **Try it with sample data**.

The action was visible at top=677px in the first viewport. It opened /demo in
one click with Atlas API already completed, three named sample projects, and
the persistent “Demo — sample data, nothing is saved” banner. The same action
was fully visible at 390×844 (top=442px, bottom=489px). **First-read gate:
PASS.**

## Claims gate

.factory/claims.json exists and contains 17 claims. From the clean candidate
checkout, npm ci completed with zero audit vulnerabilities. Every listed
command was run separately before the general QA work. All passed:

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

The tests use the documented /demo and ?demo=1 entry points and shipped sample
projects. A cross-check of landing copy, legal pages, app copy, README, and
.factory/copy-audit.md found the observable product claims represented in the
registry.

## Build and automated checks

| Check | Result |
| --- | --- |
| npm ci | PASS; 67 packages, 0 vulnerabilities |
| Every claim command, separately | PASS; 17/17 |
| npm test | PASS; 25/25 Playwright tests |
| npm run test:unit | PASS; 6/6 Vitest tests |
| npm run typecheck | PASS |
| npm run build | PASS; dist/app and dist/site produced |
| cargo fmt --manifest-path src-tauri/Cargo.toml --check | PASS |
| cargo test --manifest-path src-tauri/Cargo.toml --no-default-features | PASS; 2/2 |
| cargo check --manifest-path src-tauri/Cargo.toml | PASS after installing the workflow's Linux libraries |
| CI=false npm run tauri -- build --bundles deb | PASS |
| npm run test:live:site | PASS |
| npm run test:live:billing | PASS |
| npm run test:release | **FAIL:** signed-build attestation absent |

The first native check stopped only because the clean verifier image lacked
GLib/WebKit development files. Installing the exact workflow packages
(libwebkit2gtk-4.1-dev, libappindicator3-dev, librsvg2-dev, patchelf) made the
check and bundle pass. The generated Debian package is
Project Color Beacons_0.1.1_amd64.deb, 1,921,976 bytes, package version 0.1.1,
amd64.

## End-to-end behavior

### Normal path

- In the live demo, selecting Northwind Store showed its Ember color, cross
  symbol, name, and path in the confirmation strip.
- No editor output existed before **Confirm Northwind Store**. After the named
  confirmation, both .vscode/settings.json and .zed/settings.json previews
  appeared.
- Reset restored the completed Atlas API state. Start for real discarded the
  demo namespace.
- The desktop-shaped demo saved a fourth “Payments Worker” project with a
  stable Saffron/three-waves beacon, removed it after named confirmation, and
  restored it with Undo.

### Boundaries, invalid input, and recovery

- Malformed real pcb:projects JSON recovered to the designed empty state
  without console or page errors.
- Loading samples reached the exact free boundary: 3 of 3 free projects.
  Adding a fourth opened the license choice.
- An empty license form produced “Paste the license key from your receipt,
  then verify it” and made zero network requests. A mocked invalid license
  produced the explicit inactive-license recovery message.
- Required project name validation, no-editor validation, and duplicate-folder
  validation all blocked saving with actionable messages. A valid fourth demo
  project then saved successfully.
- Rust tests exercised actual VS Code/Zed writes and preservation of unrelated
  JSON values. Source validation rejects nonexistent folders, names outside
  1–48 characters, invalid JSON, and non-object editor settings.

The 390px site and desktop interface had no horizontal overflow at normal text
size. Keyboard-only Tab and Enter reached and opened the demo; each focused
item had a visible 3px orange outline. Dialogs, sample controls, Back/Forward
focus restoration, and native radio-key behavior are covered by the passing
Playwright suite. Reduced motion matched the media query and reduced transition
and animation durations to 0.01ms.

## Accessibility

The supplied verify-url.sh passed: HTTP 200, title, lang=en, one h1, a main
landmark, image alternatives, labeled buttons, and no console errors.
Light-theme Axe checks passed on all routes. Dark-theme Axe passed on /demo,
/privacy, /terms, and the desktop UI.

The landing page does **not** pass the full baseline; see defects 2–4 below.

## Privacy, requests, headers, and API allowance

- A fresh direct /demo flow through confirmation made only four same-origin
  requests: the document, hashed JS, hashed CSS, and favicon. No project name
  or path left the origin.
- The only local-storage key was demo:pcb:site-state. The desktop demo used
  only demo:pcb:projects. Normal desktop use made no external project-data
  request.
- The landing page additionally checks the disclosed GitHub release API. No
  analytics, trackers, CDN scripts, or third-party fonts were observed.
- A license check is explicit and sends the pasted token only to
  api.sociobot.in. There is no sign-in flow, so Entra authority checks are not
  applicable.
- The root response sends CSP (including header-only frame-ancestors 'none'),
  HSTS, nosniff, strict-origin referrer policy, and a restrictive permissions
  policy. Hashed assets use Cache-Control: public, max-age=31536000, immutable;
  HTML uses 30-second revalidation. Unknown routes return HTTP 404.
- The product owns no backend. Its Sociobot license verification endpoint was
  tested with a nonsecret invalid value. Requests 1–30 returned 200. Requests
  31–35 returned 429 with Retry-After: 3, 2, 2, 2, 2. **Observed allowance:
  30 requests per active window.**

All HTTP links found on /, /demo, /privacy, /terms, and /404.html returned 200;
the two mailto links were treated as explicit non-HTTP links.

## Offline, deployment identity, and performance

- /sw.js installed and controlled the page with cache pcb-site-v2.
  registration.update() completed. After switching offline, /demo reloaded
  with the demo banner and heading intact.
- Live HTML, JS, and CSS SHA-256 hashes exactly equal the candidate production
  build:
  - HTML: 06b433bd38c5c364eb90e776e4a02e27979241cdaf9f8b71c033602468775ac5
  - JS: fc37251b1f7e85c22c457acd2ec379fd35a9c52a423aae6205ab9d1221b48669
  - CSS: 7614b051fdff5eab9b5a7dd6b2a3880f6a9dca7f21ce762ccb4d80a4532dabe7
- Site JavaScript is 21.65 kB raw / 7.68 kB gzip. CSS is 12.40 kB raw /
  3.67 kB gzip. There are no font files. The mobile hero is 12.68 kB.
- Fresh mobile Lighthouse: performance 94, accessibility 100 in its default
  light theme, best practices 100, SEO 100; FCP 0.8 s, LCP 1.1 s, CLS 0,
  total blocking time 280 ms. Total transfer was about 53 kB. No console errors
  were reported. The independent dark-mode Axe failure remains valid because
  Lighthouse audited only the default light treatment.

## Release evidence

The current GitHub release is v0.1.1, published 2026-08-29. Its body says
**“Unsigned desktop builds.”** It contains macOS, Windows, and Linux artifacts,
SHA256SUMS, and latest.json, but it does not carry the required signed and
notarized attestation. npm run test:release therefore fails correctly.

The published Debian asset was downloaded independently. Its SHA-256
e752d589fd324f1d948b1fe6a446864ec78ccc5ae53064cfcff34879ba034c35
matches SHA256SUMS, but checksum integrity does not make the release signed.
The live macOS, Windows, and Linux controls all say “Signed … download pending,”
have no href, and have aria-disabled=true. The purchase-link count is zero.
The one-line Linux installer exits 1 with “A signed and notarized release is
not published yet.”

## Defects

### 1. Blocker — no signed, installable desktop release

The artifact class is desktop-app, but no signed release can be installed from
the live product. The current release explicitly identifies its packages as
unsigned, the release verifier fails, all platform download controls are
disabled, and the one-line installer fails closed. A useful browser demo does
not replace the required desktop helper that writes editor settings.

**Required:** configure the documented Apple signing/notarization and Windows
signing credentials; publish a new complete signed release; make npm run
test:release pass; independently verify one checksum and real macOS, Windows,
and Linux links before enabling checkout.

### 2. Major — dark landing page has a serious contrast violation

At prefers-color-scheme: dark, Axe reports color-contrast with serious impact
on four elements in the “What stays on your device” section. The hard-coded
#a8e4e9 text is rendered on the dark theme's inverted #f5f1e8 section
background at **1.24:1**, versus the required 4.5:1. Affected text is “Privacy
boundaries,” “Repeat the cues,” “Confirm the project,” and “Keep data local.”

**Required:** add a dark treatment for this section using palette tokens with
verified 4.5:1 text contrast, and run Axe in both color schemes in CI.

### 3. Major — 200% text size breaks horizontal reflow

At 390px with text resized to 200%, the live demo document becomes 568px wide;
the header navigation extends off screen. The desktop-shaped app becomes 573px
wide because project cards and actions do not reflow. Users must pan
horizontally to reach content and controls.

**Required:** make navigation wrap or condense and make project cards/actions
reflow at 200% text size. Add automated 200% text checks for both the site demo
and desktop UI.

### 4. Moderate — several mobile targets are below 44px

At 390px, live target measurements found **Reset demo** and **Start for real**
at 36px high, **View settings** at 36px, and footer links at 25px. This violates
the product accessibility baseline even though default Axe does not flag it.

**Required:** give every interactive target a 44×44px activation area and add a
mobile target-size assertion.

## Missed-leverage check

No AI feature is warranted. Stable project identity, local editor settings,
and explicit confirmation are deterministic tasks; model inference would add
privacy and reliability costs without improving the brief's job. Import/export
or sync is not required for the smallest useful local helper.

## Retest order

1. Fix dark contrast, 200% reflow, and target sizes; add regression tests.
2. Provision signing secrets and publish a new signed/notarized release.
3. Run every claim command, full source/native gates, dark/light Axe, 200% text,
   mobile target measurements, npm run test:release, and all live checks.
4. Download and checksum a signed asset and confirm each detected-platform link
   before allowing checkout.
