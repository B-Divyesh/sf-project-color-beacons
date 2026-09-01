# Adversarial first-read review 5

- Product: Project Color Beacons
- Live URL: <https://project-color-beacons.sociobot.in>
- Reviewed: 2026-09-01
- Source base: `57bb6c2d2a4d694d189bfba320e6135cabe501c3`
- Verdict: **FAIL**

The first screen, one-click demo, core accessibility checks, and declared
claim commands are clear and testable. This review remains a failure because
an earlier blocking release-trust finding has regressed, and the landing-page
price is a published claim without a matching `claims.json` entry.

## 1. Cold first read

I opened `/` in separate fresh Chromium contexts at 390 x 844 and 1440 x 900,
without scrolling. The landing page made all three required answers available
in the first screen.

| Check | Answer confirmed from the first screen | Exact evidence |
| --- | --- | --- |
| What does this do? | It marks a project with several stable cues before an edit. | “Mark the project before you edit.” |
| For whom? | Dyslexic and ADHD developers moving among similar project windows. | “For dyslexic and ADHD developers who need distinct cues across similar project windows.” |
| What should I click first? | Try the completed sample workspace. | “Try it with sample data” and “The demo opens a completed sample.” |

The phone view keeps the primary action, result note, privacy fact, offline
fact, and price fact visible before the hero image. The desktop view also
keeps those items visible. This check passes.

## 2. Findings

### F-4-1 — BLOCKING — Unsigned Windows and macOS packages are exposed again

- Earlier finding retained as required by the history check: `F-4-1`.
- Locations: `shared/release-contract.mjs`, `site/src/main.ts`,
  `tests/claims.spec.ts`, README line 58, and the live download behaviour
  encoded in the delivered site bundle.
- Exact quotes:
  - “Operating-system signatures are recorded and disclosed separately because the public build is intentionally unsigned when owner certificates are unavailable.”
  - “Unsigned Windows and macOS packages remain available with an operating-system warning.”
  - “This build is unsigned. Windows may show a publisher warning.”
- Check performed: `releaseMarksPlatformVerified()` returns true from source
  provenance alone. `setupDownloads()` then assigns a package `href`; its
  `unsigned` branch only adds “unsigned; your system may show a warning.” The
  registered `@claim:platform-signatures` test explicitly expects Windows and
  macOS download links when their signature status is unavailable.
- Why this blocks acceptance: the prior finding required the product to
  withhold unsigned Windows and macOS packages and checkout access. A first
  visitor can now be sent to an executable that the operating system cannot
  identify, despite the known warning. Source provenance is useful evidence,
  but it does not replace Authenticode, Apple code signing, or notarization.
- Concrete fix: make `releaseMarksPlatformVerified()` (or a dedicated
  installability gate) require `authenticodeVerified === true` for Windows and
  both `codeSigned === true` and `notarized === true` for macOS before adding a
  download or purchase link. Keep the exact pending state visible instead.
  Change the platform-signature test to assert no Windows/macOS link for
  unavailable OS signatures, and remove the README availability statement.

### F-5-1 — HIGH — The published $24 price has no exact registered claim

- Location: landing first-screen fact and README line 73.
- Exact quote: “Three projects are free; unlimited projects cost $24 once.”
- Check performed: no entry in `.factory/claims.json` claims an exact $24
  one-time price. `free-project-limit` covers the free capabilities and
  project count. `checkout-availability` uses a `$24` fixture while checking
  conditional link rendering, but its registered claim is only that a link is
  shown when checkout and a verified package are available.
- Why this matters: a price is a visitor decision input. The test suite does
  not register or describe a test that confirms the first-screen price agrees
  with the current catalogue value.
- Concrete fix: add a `price-display` claim such as “The landing page shows
  the active catalogue price for an unlimited license,” with a tagged test
  that supplies at least two catalogue prices and asserts the displayed price
  changes accordingly. Alternatively, remove the hard-coded `$24` first-screen
  fact and show the catalogue price only after it is loaded.

## 3. Copy audit

Word counts treat hyphenated terms, paths, prices, and versions as one word.
Commands, navigation labels, and headings without sentence punctuation are
listed separately. No landing or README sentence exceeds 22 words. No banned
marketing adjective, jargon-only heading, inconsistent `shape`/`symbol` term,
or non-result-naming action was found. The one price claim is flagged above.

### Landing sentences

| Words | Location | Sentence | Check |
| ---: | --- | --- | --- |
| 6 | h1 | Mark the project before you edit. | Clear |
| 13 | lede | For dyslexic and ADHD developers who need distinct cues across similar project windows. | Clear |
| 6 | action note | The demo opens a completed sample. | Claimed by demo tests |
| 3 | action note | Nothing is saved. | Claimed by demo isolation |
| 9 | fact | Project data stays on your device during normal use. | Claimed |
| 8 | fact | The demo reloads offline after its first visit. | Claimed |
| 9 | fact | Three projects are free; unlimited projects cost $24 once. | **F-5-1** |
| 8 | hero caption | Each project repeats one symbol, color, and name. | Claimed |
| 7 | preview | The strip repeats the three beacon cues. | Claimed |
| 9 | preview | You press the named button before editor settings change. | Claimed |
| 11 | steps | The app writes supported settings for VS Code, Cursor, and Zed. | Claimed |
| 7 | steps | Existing unrelated JSON settings stay in place. | Claimed |
| 9 | step 1 | Name the project and pick its symbol and color. | Clear instruction |
| 9 | step 2 | Check the three beacon cues and the folder path. | Clear instruction |
| 9 | step 3 | The app merges the beacon into supported project files. | Claimed |
| 3 | boundary label | Repeat the cues. | Clear instruction |
| 9 | boundary | Every beacon includes a written name, symbol, and color. | Claimed |
| 3 | boundary label | Confirm the project. | Clear instruction |
| 7 | boundary | Editor settings wait for the named confirmation. | Claimed |
| 3 | boundary label | Keep data local. | Clear instruction |
| 9 | boundary | Project data stays on this device during normal use. | Claimed |
| 12 | pricing | Color, name, symbol, and confirmation are free for up to three projects. | Claimed |
| 7 | pricing | A valid license removes the project limit. | Claimed |
| 6 | footer | Mark each project before you edit. | Clear |
| 9 | hero image alt | Six distinct ceramic symbols sit beside layered window-like panes. | Purposeful alt text |

### Landing headings and actions

| Type | Text | Check |
| --- | --- | --- |
| Eyebrow | A local desktop helper | Clear context |
| Primary action | Try it with sample data | Result-naming verb |
| Secondary action | View downloads | Result-naming verb |
| h2 | Preview the confirmation strip | Names the content |
| h2 | Set a beacon in three steps | Names the content |
| Step heading | Choose a folder | Clear action |
| Step heading | Check the confirmation strip | Clear action |
| Step heading | Write editor settings | Clear action |
| h2 | What stays on your device | Names the content |
| h2 | Start with three projects | Clear pricing context |
| Dynamic action | Download for Linux | Result-naming verb |
| Dynamic action | Buy a $24 license | Result-naming verb; price is F-5-1 |
| Action | Copy license key | Result-naming verb |

### README sentences and text units

| Words | Location | Sentence or text unit | Check |
| ---: | --- | --- | --- |
| 12 | line 3 | Mark each project with a color, name, and symbol before you edit. | Clear |
| 14 | line 5 | Project Color Beacons is a local desktop helper for developers who juggle similar windows. | Clear |
| 12 | line 5 | It keeps each saved project's color, name, and symbol after a restart. | Claimed |
| 12 | line 5 | The app writes supported per-project settings for VS Code, Cursor, and Zed. | Claimed |
| 7 | line 5 | Existing unrelated JSON settings stay in place. | Claimed |
| 9 | line 9 | Open `/demo` or run the site locally and visit: | Clear instruction |
| 12 | line 15 | The demo opens with Atlas API confirmed and its editor-file preview ready. | Claimed |
| 8 | line 15 | It also includes Northwind Store and Launch Docs. | Claimed |
| 9 | line 15 | It writes only to a `demo:` browser storage key. | Claimed |
| 8 | line 15 | Use **Reset demo** to restore that completed sample. | Claimed |
| 12 | line 19 | Requirements: Node 22, npm, Rust stable, and the Tauri 2 system dependencies. | Developer text unit; clear |
| 16 | line 38 | `npm run build` creates desktop assets in `dist/app` and the deployable site in `dist/site`. | Clear |
| 17 | line 38 | The static deploy command is `npm ci && npm run build:site` with `dist/site` as its output. | Clear |
| 11 | line 40 | The Playwright suite checks every published claim in `.factory/claims.json`. | Confirmed |
| 12 | line 40 | It also checks routes, accessibility, offline reload, mobile width, and console errors. | Confirmed |
| 12 | line 44 | The release workflow targets these packages when a `v*` tag is pushed: | Claimed |
| 14 | line 50 | The workflow publishes `SHA256SUMS`, `latest.json`, a platform-status record, and a GitHub provenance file. | Claimed |
| 12 | line 52 | GitHub records the repository, workflow, commit, tag, and checksum for every package. | Claimed |
| 15 | line 54 | The landing page detects the operating system and reads release details from GitHub's browser-accessible API. | Claimed |
| 14 | line 56 | Every platform requires verified GitHub provenance and a complete release before its download appears. | Regresses under F-4-1 for OS trust |
| 7 | line 58 | The release records missing owner certificates honestly. | Release-status claim; covered by platform-signature test |
| 11 | line 58 | Unsigned Windows and macOS packages remain available with an operating-system warning. | **F-4-1** |
| 8 | line 60 | After publishing a release, run these independent checks. | Clear instruction |
| 12 | line 60 | The first checks release files, checksums, the manifest, and GitHub's package-origin record. | Clear |
| 10 | line 62 | The second checks a downloaded package against the repository identity. | Clear |
| 7 | line 69 | Windows and macOS signing need owner certificates. | Clear constraint |
| 12 | line 69 | The release status and landing page disclose when those signatures are unavailable. | Claimed |
| 12 | line 73 | Color, name, symbol, and confirmation are free for up to three projects. | Claimed |
| 7 | line 73 | A valid license removes the project limit. | Claimed |
| 17 | line 75 | To restore a purchase, open the desktop app, choose **License**, and paste the key from your receipt. | Claimed |
| 20 | line 77 | The site shows a purchase link only when checkout is active and a source-verified package exists for the visitor's platform. | Regresses under F-4-1 for unsigned platforms |
| 13 | line 79 | Project names, local paths, and settings stay on the device during normal use. | Claimed |
| 13 | line 79 | A license check sends only the pasted license value to `api.sociobot.in`. | Claimed |
| 9 | line 79 | Read the shipped `/privacy` and `/terms` pages for details. | Clear instruction |
| 5 | line 90 | Licensed under the MIT License. | Clear |

README headings are descriptive: “Try sample projects”, “Develop”, “Test and
build”, “Install and release”, “Price and privacy”, and “Project layout”. The
platform bullet labels are factual fragments rather than sentences.

## 4. Demo and sandbox behaviour

- The landing primary action reaches `/demo` in one client-side navigation.
- A fresh 390 px `/demo` view already shows the named Atlas API confirmation,
  both selected editor-file names, the first complete sample row, and the
  persistent “Demo — sample data, nothing is saved” banner.
- The sample contains Atlas API, Northwind Store, and Launch Docs, with local
  paths and distinct color/name/symbol combinations.
- Checking Northwind Store removes the editor output until the named Confirm
  action. Reset restores confirmed Atlas API and exactly three samples.
- The direct demo request log contained only the document and same-origin
  JavaScript, CSS, and favicon. Browser storage contained only
  `demo:pcb:site-state`; the demo does not read or write `pcb:projects`.
- `Start for real` disposal and offline reload are covered by their separate
  fresh-context claim tests. This demo check passes.

## 5. Claims and local verification

I made a fresh local clone at
`/tmp/project-color-beacons-review5.sWvsgl`, ran `npm ci`, then executed each
of the 19 exact commands in `.factory/claims.json` separately. All 19 passed.
The full suite also passed 34/34, Vitest passed 7/7, and `npm run build`,
`npm run typecheck`, and `npm run lint` completed successfully. The build
produced `dist/site/index.html`.

| Claim ID | Result |
| --- | --- |
| `three-cues` | PASS |
| `confirmation-before-write` | PASS |
| `demo-isolated` | PASS |
| `demo-disposal` | PASS |
| `demo-reset` | PASS |
| `offline-reload` | PASS |
| `free-project-limit` | PASS |
| `desktop-license-recovery` | PASS |
| `beacon-stability` | PASS |
| `release-manifest` | PASS |
| `release-signing` | PASS |
| `release-matrix` | PASS |
| `platform-download` | PASS |
| `platform-signatures` | PASS, but encodes the F-4-1 regression |
| `settings-preserved` | PASS |
| `editor-settings` | PASS |
| `project-data-local` | PASS |
| `license-token-only` | PASS |
| `checkout-availability` | PASS, but does not register the fixed $24 price |

## 6. Earlier-finding check

I read every earlier review, polish record, and the prior handoff. The table
records an independent live/source check rather than relying on a prior
“fixed” label.

| Earlier finding | Current check | Result |
| --- | --- | --- |
| F-1-1 | Direct mobile demo starts with confirmed Atlas output and a visible sample row. | Fixed |
| F-1-2 | `/review-5-not-found` returns HTTP 404; known routes return 200. | Fixed |
| F-1-3 | `/404.html` has matching metadata, header, main, footer, legal links, and build identity. | Fixed |
| F-1-4 | The unsupported user-outcome wording is absent. | Fixed |
| F-1-5 | Free copy names only four tested capabilities and three projects. | Fixed |
| F-1-6 | Reset is registered and restores the seeded sample. | Fixed |
| F-1-7 | Manifest generation is registered and its exact command passes. | Fixed |
| F-1-8 | Platform selection is registered and its fixture command passes. | Fixed |
| F-1-9 | Windows/macOS unsigned packages are again allowed. | Regressed as **F-4-1** |
| F-1-10 | `symbol` is the one visual-cue term. | Fixed |
| F-1-11 | The three cues and separate path are distinguished. | Fixed |
| F-1-12 | “Preview the confirmation strip” names the section. | Fixed |
| F-1-13 | “What stays on your device” names the section. | Fixed |
| F-1-14 | Demo wording identifies the separate sample workspace. | Fixed |
| F-1-15 | Both not-found paths use direct page/address language. | Fixed |
| F-2-1 | Full route test confirms back/forward scroll restoration, h1 focus, and route announcement. | Fixed |
| F-2-2 | The unsigned-platform exposure has returned. | Regressed as **F-4-1** |
| F-2-3 | Beacon persistence has a registered passing test. | Fixed |
| F-2-4 | Signing/provenance wording is specific, except for the F-4-1 policy regression. | Fixed otherwise |
| F-2-5 | Terms limit the entitlement statement to removing the project limit. | Fixed |
| F-2-6 | Sample controls include the project name. | Fixed |
| F-2-7 | The demo banner is a named complementary landmark; Axe route test passes. | Fixed |
| F-2-8 | “View downloads” names the destination. | Fixed |
| F-2-9 | “Check the confirmation strip” is clear out of context. | Fixed |
| F-3-1 | The unsigned-platform exposure has returned. | Regressed as **F-4-1** |
| F-3-2 | Generated 404 shares the current build identity. | Fixed |
| F-3-3 | The registered provenance test checks the recorded bundle cryptographically. | Fixed |
| F-3-4 | Platform fixtures reject incomplete release metadata. | Fixed |
| F-3-5 | Signature status is registered and tested; the policy outcome is F-4-1. | Fixed otherwise |
| F-3-6 | The exact free/paid fact appears in the mobile first screen. | Fixed, with new claim gap F-5-1 |
| F-3-7 | README uses a plain explanation of GitHub release data. | Fixed |
| F-4-1 | Source and its passing test now explicitly permit unsigned Windows/macOS downloads. | **Regressed; blocking** |
| F-4-2 | Website return flow copies a one-session key and directs the visitor to the desktop app. | Fixed |
| F-4-3 | The earlier unexplained “CORS-safe” wording is absent. | Fixed |

## 7. Structure, links, and visual checks

- The landing, demo, privacy, terms, and both 404 paths have route-specific
  titles, one h1, description, canonical URL, OG/Twitter data, favicon, and
  language declaration. The local route/Axe test passed.
- Internal link crawl: `/`, `/demo`, `/privacy`, `/terms`, `/404.html`,
  `/robots.txt`, `/sitemap.xml`, `/favicon.svg`, `/apple-touch-icon.png`, and
  `/manifest.webmanifest` returned 200. An unknown route returned 404.
  `mailto:` links are explicit. The external Factory credit was not fetched,
  following the work-order network boundary; its href is present and labelled
  as external in the source.
- Header, skip link, footer, privacy link, terms link, back/forward focus, and
  deep-link behaviour are present and covered by the full browser suite.
- The ceramic/glacial visual system follows the recorded design direction. It
  uses product-specific imagery, geometric beacon shapes, offset tile shadows,
  and a grid rather than a generic SaaS hero/card treatment.

## 8. Missed leverage

No additional AI feature is expected by the brief. The core job is a local,
attention-supporting project marker, and the existing import/export or sync
features are not implied by that job. Adding an AI or sync control would add
scope without improving the required confirmation step.

## What would make this perfect

Require verified Windows and macOS operating-system signatures before exposing
their packages or purchase path, while keeping an explicit pending state.
Then register the displayed unlimited-license price as a catalogue-backed claim
and test price changes, not only checkout-link availability. After those two
checks pass, this review has no remaining finding.
