# Independent verification 8 — FAIL

- **Candidate:** `cd9717f8ef4566741c8187fb9a7e0233a91b4f51`
- **Live URL:** <https://project-color-beacons.sociobot.in>
- **Verified:** 2026-08-29 from a clean checkout
- **Work order:** `project-color-beacons-verify-8`
- **Decision:** **FAIL — do not release.** The desktop product still has no
  signed, installable candidate release. Fresh interaction testing also found
  an unhandled 200% text reflow state and an inaccurate editor preview.

## Mandatory first-read gate

**PASS.** A cold 1440×900 visit answers all three questions in the first
viewport:

- What it does: **“Mark the project before you edit.”**
- For whom: **“For dyslexic and ADHD developers who need distinct cues across
  similar project windows.”**
- What to click: **Try it with sample data**, with adjacent copy saying the
  demo opens a completed sample and saves nothing to real project data.

The action was visible at y=677–724 on desktop and y=442–489 at 390×844. One
click opened `/demo` with Atlas API already confirmed, three named projects,
editor-file output, and the persistent demo banner.

## Claims gate

`.factory/claims.json` exists. After the lockfile install, every exact listed
command was run separately through its declared demo/app entry point. All 17
passed:

| Claim | Result |
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
| `settings-preserved` | PASS |
| `editor-settings` | PASS |
| `project-data-local` | PASS |
| `license-token-only` | PASS |
| `checkout-availability` | PASS |

The landing, legal, app, README, and demo claims map to the registry. No new
unlisted marketing claim was found. The editor-selection defect below concerns
the demo's observable behavior rather than an additional written claim.

## Release-blocking defects

### 1. Blocker — no signed candidate desktop release

Fresh GitHub API evidence shows the latest public release remains `v0.1.1`,
published 2026-08-29T13:28:19Z, with body **“Unsigned desktop builds. Check
SHA256SUMS before installing.”** Candidate version `0.1.2` is not published.

- `npm run test:release` exits 1: `The release does not carry the signed-build
  attestation.`
- The live Linux control says **Signed Linux download pending**, has no `href`,
  and is `aria-disabled=true`. There is no macOS or Windows candidate link.
- The live one-line installer exits 1 with **“A signed and notarized release is
  not published yet.”** and installs no file.
- The live site consequently hides checkout, although billing itself is
  healthy: the catalogue has exactly one $24 product and checkout returns 303
  to `checkout.dodopayments.com`.

The old unsigned Debian asset is internally consistent: the downloaded
`Project.Color.Beacons_0.1.1_amd64.deb` is 1,928,474 bytes and has SHA-256
`e752d589fd324f1d948b1fe6a446864ec78ccc5ae53064cfcff34879ba034c35`,
matching both `SHA256SUMS` and GitHub's digest. Its package metadata is version
0.1.1. Integrity does not establish signing, notarization, or candidate
identity.

This fails the desktop-app installer contract and leaves the one-time product
unavailable to buy or install. The browser demo is not a substitute for the
desktop helper that writes editor settings.

### 2. Major — confirmed demo content breaks at 200% text

At 390×844 with the root text size set to 200%, the initial demo reflows with
zero overflow. After checking and confirming **Northwind Store**, document
width becomes 393px for a 390px viewport. More importantly, the project path
and beacon text remain in the confirmation strip's narrow middle column and
run behind/beside the large **View editor files** button. The screenshot showed
the path split and visually colliding with the action.

The current regression test checks only the initial Atlas state, so it misses
the longer post-confirmation state. This fails the explicit requirement that
text resize to 200% without loss. Make the confirmation strip stack at enlarged
text and test the longest sample after confirmation.

### 3. Moderate — desktop demo ignores the chosen editor in its preview

In the desktop-shaped demo, a new **Payments Worker** project was saved with
only **VS Code and Cursor** selected. Its stored record correctly contained
`editors: ["vscode"]`, but after confirmation the preview displayed both
`.vscode/settings.json` and `.zed/settings.json`.

The native Rust writer respects the selected editors; the demo does not. This
makes the one-click sandbox an inaccurate representation of a core user choice.
Render only selected editor files and add a test covering each one-editor case.

## Clean candidate gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 67 packages, 0 vulnerabilities |
| Every command in `.factory/claims.json` | PASS; 17/17 separately |
| `npm test` | PASS; 28/28 Playwright tests |
| `npm run test:unit` | PASS; 6/6 Vitest tests |
| `npm run typecheck` | PASS |
| Lint | No lint script is present |
| `npm audit --audit-level=high` | PASS; 0 vulnerabilities |
| `cargo fmt --manifest-path src-tauri/Cargo.toml --check` | PASS |
| `cargo test --manifest-path src-tauri/Cargo.toml --no-default-features` | PASS; 2/2 |
| `cargo check --manifest-path src-tauri/Cargo.toml` | PASS after installing the release workflow's Linux prerequisites |
| `npm run build` | PASS; produced `dist/app` and `dist/site` |
| `CI=false npm run tauri -- build --bundles deb` | PASS; built candidate v0.1.2 Debian package |
| `npm run test:live:site` | PASS |
| `npm run test:live:billing` | PASS |
| `npm run test:release` | **FAIL**; unsigned release attestation missing |

The candidate Debian package is 1,922,134 bytes, package
`project-color-beacons`, version `0.1.2`, architecture `amd64`, SHA-256
`15edf2724e4b337766cdd70a88595dc80cb65e9f3a48754201a0dca9d9685937`.
Extraction produced the binary and desktop entry, and `ldd` reported no missing
libraries after installing the same Linux packages used in CI.

## End-to-end behavior

### Passed normal, boundary, and recovery paths

- Site demo: Northwind Store showed Ember, cross, name, and path; no editor
  output appeared before the named confirmation; output appeared afterward.
- Reset restored confirmed Atlas API and all three samples. Start for real
  deleted `demo:pcb:site-state`.
- Desktop demo: a fourth Payments Worker project saved, persisted across a
  reload, was checked and confirmed, was removed after named confirmation, and
  was restored with Undo.
- No-editor selection and duplicate-folder attempts were blocked with clear
  recovery text. A 49-character pasted name was constrained to the documented
  48-character maximum.
- At the exact free boundary, three real-mode projects opened the license
  dialog. Submitting an empty license produced recovery text and made zero
  verification requests.
- Malformed `pcb:projects` JSON recovered to the empty state without console or
  page errors.
- Rust fixtures wrote the VS Code/Cursor and Zed settings and retained an
  unrelated editor font size and activity-bar color.

## Live deployment, accessibility, privacy, and performance

### Deployment identity and headers

Candidate `cd9717f` changes only `.factory/handoff.md` relative to deployed
product commit `5c2448d`; a fresh `npm run build` reproduced the live bytes.
Local and live SHA-256 matched exactly for:

| Asset | SHA-256 |
| --- | --- |
| `/` | `8cde325c1553265ef407767f2f3f48ac89e0d8fa881885059606b2ad5d9c99cf` |
| `/sw.js` | `b337cb6174dad8165a69c313863a8a19d3b69756227acecdc5da5580aa210773` |
| `/assets/index-u24ZTMuv.js` | `728f0b1a52375597978fc1abd82b620836065ab9faf8e66416a1ff502938e350` |
| `/assets/index-BT2o4BYT.css` | `4e122bd5f6b6366c96963e8867a223e08014916775e7069d48411d6a64cd9bc8` |
| `/assets/og-beacons.webp` | `252f9fe5ffefd9222736a2704076418dda8c6c2480a969669ae257428f7c4b67` |

HTML uses 30-second revalidation. Hashed JS, CSS, and images use one-year
immutable caching. Root headers include HSTS, `nosniff`, a strict-origin
referrer policy, camera/microphone/geolocation restrictions, and a CSP with
header-delivered `frame-ancestors 'none'`.

### Accessibility and interaction

- `/`, `/demo`, `/privacy`, `/terms`, `/404.html`, and an unknown URL were
  checked in both light and dark modes. Each had `lang=en`, one h1, one main,
  correct titles, complete image alternatives, zero Axe violations, and no
  unexpected console/page errors. The unknown route returned HTTP 404.
- `/opt/fleet/lib/verify-url.sh` passed with HTTP 200, 829ms load, one h1, one
  main, no missing alternatives, no unlabeled buttons, and no console errors.
- At normal text size, the 390px landing and demo had no horizontal overflow.
  The first action worked by keyboard. Focus was a visible 3px solid orange
  outline. Demo banner actions measured at least 44px high. The desktop-shaped
  UI had zero 390px overflow, zero 200% overflow, and no undersized visible
  controls in the tested state.
- Reduced-motion mode reported animation and transition durations of 0.00001s.
- The 200% confirmed-demo defect above remains despite these other passes.

### Requests, storage, PWA, and API allowance

- A direct fresh `/demo` confirmation requested only the document, same-origin
  hashed JS/CSS, and favicon. Its only storage key was
  `demo:pcb:site-state`. The desktop demo used only `demo:pcb:projects` and
  made no external request.
- The landing page additionally requests only the disclosed GitHub release API.
  No analytics, trackers, CDN scripts, or third-party fonts were observed.
- A live invalid-license check was a GET containing only the pasted fixture
  token, with no request body. It returned `{valid:false, reason:"invalid"}` and
  the UI gave a clear recovery message.
- A single-client burst to the license verifier accepted 30 requests and
  rejected 5 with HTTP 429. The 429 responses included `Retry-After: 4` and
  `x-ratelimit-after: 4`. **Observed allowance: 30 accepted requests per active
  window.**
- The product has no first-party backend and no sign-in flow, so persistence,
  concurrency, health/build identity, and Entra authority checks are not
  applicable beyond the external license endpoint above.
- `/sw.js` controlled the demo with cache `pcb-site-v2`; `registration.update()`
  completed. Offline reload returned the demo, banner, and Atlas API sample
  without errors.

### Budgets and links

- Site JS: 21,653 bytes raw / 7,733 bytes gzip.
- Site CSS: 12,859 bytes raw / 3,746 bytes gzip.
- Mobile hero: 12,684 bytes. No font files ship.
- Fresh Lighthouse mobile: performance 97, accessibility 100, best practices
  100, SEO 100; FCP 0.8s, LCP 1.1s, TBT 180ms, CLS 0, total transfer 52 KiB.
- Every discovered HTTP link on the landing, demo, legal, and 404 pages returned
  200. Fragment and `mailto:` links were intentionally not fetched.

## Missed-leverage check

No AI feature is warranted. Stable project identity, deterministic editor-file
merges, and explicit confirmation do not benefit from model inference. Import,
sync, or accounts are not required for the smallest useful local helper.

## Required next steps

1. Provision the documented Apple and Windows signing credentials and publish
   a complete signed/notarized `v0.1.2` release. Re-run `npm run test:release`,
   verify every detected-platform link, and checksum a signed asset.
2. Stack the confirmed demo strip cleanly at 200% text and add a regression for
   the longest sample after confirmation.
3. Make the desktop demo preview honor the saved editor selection and test the
   VS Code-only and Zed-only paths.
