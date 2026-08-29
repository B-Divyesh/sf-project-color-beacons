# Adversarial first-read review 3

- Product: Project Color Beacons
- Live URL: <https://project-color-beacons.sociobot.in>
- Reviewed: 2026-08-29
- Source base: `c3a6074146dd79f01b5deb32765eefd6bada01fa`
- Verdict: **FAIL**

The first screen and one-click demo pass. All 17 declared claim commands pass
individually from a clean clone. The product still fails because two historical
findings are not fully fixed, the release claims are not completely enforced by
their registered tests, and the copy audit is not at zero findings.

## 1. Cold first read

I opened `/` in fresh browser contexts at 390 × 844 and 1440 × 900. I did not
scroll before answering.

| Question | Answer in my own words | Exact first-screen evidence |
| --- | --- | --- |
| What does this do? | It marks the project with distinct cues before an edit. | “Mark the project before you edit.” |
| For whom? | Dyslexic and ADHD developers working among similar project windows. | “For dyslexic and ADHD developers who need distinct cues across similar project windows.” |
| What should I click first? | **Try it with sample data**. | This is the first primary action at both widths. |

All three answers are available above the fold. The action note also explains
that the demo opens a completed sample. This part passes.

## 2. Findings

### F-3-1 — BLOCKING — The OS-signing finding remains unresolved

- Historical IDs: `F-1-9` and `F-2-2`.
- Locations: live download section under Windows and macOS user agents,
  `README.md` line 52, `.github/workflows/release.yml` lines 68–100, and the
  `v0.1.2` release description.
- Exact live labels: “Download for Windows” and “v0.1.2 ·
  Project.Color.Beacons_0.1.2_x64-setup.exe · source-signed build”; macOS shows
  the equivalent DMG label.
- Exact README disclosure: “macOS notarization and Windows trust-store signing
  remain optional because their owner certificates are not configured.”
- Why this fails: review 1 required a trust-store-signed Windows installer and
  signed/notarized macOS packages. Review 2 reopened the same issue as blocking.
  The current packages have useful GitHub source provenance, but the current
  handoff confirms that they still lack the platform signatures required by
  those findings. Calling them “source-signed” does not satisfy the earlier fix
  and can be confused with operating-system code signing.
- Concrete fix: publish a Windows Authenticode-signed installer and Apple-signed,
  notarized macOS packages; verify both signatures from downloaded artifacts;
  gate the links on those checks. Until then, label the links “GitHub provenance
  verified; not OS-signed” rather than “source-signed build.”

### F-3-2 — BLOCKING — The standalone 404 footer regressed to version 0.1.1

- Historical ID: `F-1-3`.
- Locations: live `/404.html`, a live unknown URL such as `/review-3-missing`,
  and `site/public/404.html`.
- Exact mismatch: normal routes say “Original generated ceramic image · Version
  0.1.2 · Build 2026.08.29”; both 404 responses say “Original generated ceramic
  image · Version 0.1.1 · Build 2026.08.29”.
- Why this fails: the earlier finding required the standalone 404 to share the
  current site skeleton, including version/build identity. A stale product
  version makes the fallback footer inconsistent and proves that this duplicated
  document can drift from the application shell.
- Concrete fix: generate the 404 footer version from the same build constant as
  the SPA. Add an assertion that `/`, `/404.html`, and an unknown 404 response
  show the same current version.

### F-3-3 — HIGH — The registered provenance test does not prove its claim

- Location: `.factory/claims.json`, claim `release-signing`; test source at
  `tests/claims.spec.ts:235`.
- Exact claim: “Release publication signs package provenance with the GitHub
  repository, workflow, commit, and tag identity.”
- Exact registered test: `npm test -- --grep @claim:release-signing`.
- Why this fails: the tagged test completes by searching the workflow YAML for
  six strings. It does not produce, parse, or cryptographically verify a
  provenance statement, nor does it inspect a published artifact. The separate
  `npm run test:release` command does verify the live v0.1.2 release and passed
  in this review, but it is not the command registered for this claim.
- Concrete fix: make the tagged test verify a recorded Sigstore bundle and its
  subjects against repository, workflow, commit, and tag fixtures. Keep the live
  `npm run test:release` check as the post-publication verification.

### F-3-4 — HIGH — The full-package download gate exceeds its tagged test

- Location: `README.md` line 52 and `tests/claims.spec.ts:278–323`.
- Exact quote: “It keeps downloads unavailable until every platform package and
  the source-signature bundle exist.”
- Why this fails: `@claim:platform-download` tests platform selection and an
  unsigned release. The only test that removes required platform files and
  metadata is the separate untagged test “a signed release is not installable
  until all desktop packages and release metadata are published.” The exact
  command in `claims.json` uses `--grep @claim:platform-download`, so it excludes
  the assertion that proves this sentence.
- Concrete fix: move the incomplete-release assertions into the tagged
  `@claim:platform-download` test, or register a separate completeness claim and
  tag that test with its new ID.

### F-3-5 — HIGH — The platform-signing status is an unlisted claim

- Location: `README.md` line 52.
- Exact quote: “macOS notarization and Windows trust-store signing remain
  optional because their owner certificates are not configured.”
- Why this fails: visitors deciding whether to install rely on this release
  status, but `.factory/claims.json` has no entry that verifies the current
  Windows signature or macOS signing/notarization state. `release-signing`
  covers GitHub source provenance, which is a different trust mechanism.
- Concrete fix: after resolving F-3-1, add a `platform-signatures` claim whose
  test downloads the Windows and macOS release artifacts and verifies their
  platform signatures. If unsigned packages remain available, state that fact
  beside each download and register an artifact-status test.

### F-3-6 — MEDIUM — The first-screen price fact omits the paid price

- Location: landing first screen, third plain fact.
- Exact quote: “The free app stores three projects.”
- Why this fails: it states the free limit but not the price. The plain-words
  first-screen contract requires privacy, offline, and price facts; the $24
  one-time price appears only later on the page.
- Proposed rewrite: “Three projects are free; unlimited projects cost $24 once.”
  The existing `free-project-limit` and `checkout-availability` tests already
  cover the two facts.

### F-3-7 — MINOR — Release trust is described with unexplained jargon

- Locations: live download label and `README.md` lines 50–52.
- Exact text: “source-signed build”, “SLSA provenance statement”, and
  “source-signature bundle”.
- Why this fails: these terms do not explain what was verified and make the
  distinction from Windows/macOS platform signing harder to understand.
- Proposed rewrite: “GitHub verifies that each package came from this
  repository, workflow, commit, and tag.” Use “GitHub provenance file” for the
  bundle, and show platform-signature status separately.

No marketing adjective, metaphor heading, inconsistent product term, or
non-result-naming landing action was found beyond the issues above.

## 3. Copy audit

Counts treat hyphenated terms, paths, filenames, prices, and versions as one
word. Commands are not prose sentences. No sentence exceeds 22 words and no
banned marketing word appears.

### Live landing-page sentences

| Words | Location | Exact sentence | Result |
| ---: | --- | --- | --- |
| 6 | h1 | Mark the project before you edit. | Clear |
| 13 | hero | For dyslexic and ADHD developers who need distinct cues across similar project windows. | Clear |
| 6 | demo note | The demo opens a completed sample. | `demo-reset` |
| 3 | demo note | Nothing is saved. | Read with the separate-demo context; `demo-isolated` |
| 9 | fact | Project data stays on your device during normal use. | `project-data-local` |
| 8 | fact | The demo reloads offline after its first visit. | `offline-reload` |
| 6 | fact | The free app stores three projects. | F-3-6 |
| 9 | hero image alternative | Six distinct ceramic symbols sit beside layered window-like panes. | Descriptive |
| 8 | hero caption | Each project repeats one symbol, color, and name. | `three-cues` |
| 7 | preview | The strip repeats the three beacon cues. | `three-cues` |
| 9 | preview | You press the named button before editor settings change. | `confirmation-before-write` |
| 11 | how it works | The app writes supported settings for VS Code, Cursor, and Zed. | `editor-settings` |
| 7 | how it works | Existing unrelated JSON settings stay in place. | `settings-preserved` |
| 9 | walkthrough 1 alternative | Project list with three sample projects and distinct beacons. | Descriptive |
| 9 | step 1 | Name the project and pick its symbol and color. | Clear instruction |
| 9 | walkthrough 2 alternative | Confirmation strip for Atlas API above the project list. | Descriptive |
| 9 | step 2 | Check the three beacon cues and the folder path. | Clear instruction |
| 8 | walkthrough 3 alternative | Editor settings preview after Atlas API is confirmed. | Descriptive |
| 9 | step 3 | The app merges the beacon into supported project files. | `editor-settings` |
| 3 | boundary label | Repeat the cues. | Clear |
| 9 | boundary | Every beacon includes a written name, symbol, and color. | `three-cues` |
| 3 | boundary label | Confirm the project. | Clear |
| 7 | boundary | Editor settings wait for the named confirmation. | `confirmation-before-write` |
| 3 | boundary label | Keep data local. | Clear |
| 9 | boundary | Project data stays on this device during normal use. | `project-data-local` |
| 12 | pricing | Color, name, symbol, and confirmation are free for up to three projects. | `free-project-limit` |
| 7 | pricing | A valid license removes the project limit. | `free-project-limit` |
| 3 | license prompt | Have a license? | Clear |
| 6 | license prompt | Paste it to restore this device. | Clear instruction |
| 6 | footer | Mark each project before you edit. | Clear |

### Landing headings, actions, and labels

| Words | Type | Exact text | Result |
| ---: | --- | --- | --- |
| 4 | eyebrow | A local desktop helper | Clear |
| 5 | primary action | Try it with sample data | Clear result |
| 2 | action | View downloads | Clear result |
| 4 | h2 | Preview the confirmation strip | Clear |
| 6 | h2 | Set a beacon in three steps | Clear |
| 3 | step heading | Choose a folder | Clear |
| 4 | step heading | Check the confirmation strip | Clear |
| 3 | step heading | Write editor settings | Clear |
| 2 | eyebrow | Privacy boundaries | Clear |
| 5 | h2 | What stays on your device | Clear |
| 2 | eyebrow | Desktop app | Clear |
| 4 | h2 | Start with three projects | Clear |
| 3 | action | Download for Linux | Clear result |
| 4 | action | Buy a $24 license | Clear result |
| 4 | offer label | $24 one-time · unlimited projects | `checkout-availability` |
| 4 | release label | v0.1.2 · Project.Color.Beacons_0.1.2_amd64.AppImage · source-signed build | F-3-1, F-3-7 |
| 2 | action | Verify license | Clear result |
| 8 | footer provenance | Original generated ceramic image · Version 0.1.2 · Build 2026.08.29 | Clear on normal routes; F-3-2 on 404 |

### README sentences

| Words | Location | Exact sentence | Result |
| ---: | --- | --- | --- |
| 12 | introduction | Mark each project with a color, name, and symbol before you edit. | Clear |
| 14 | introduction | Project Color Beacons is a local desktop helper for developers who juggle similar windows. | Clear |
| 12 | introduction | It keeps each saved project's color, name, and symbol after a restart. | `beacon-stability` |
| 12 | introduction | The app writes supported per-project settings for VS Code, Cursor, and Zed. | `editor-settings` |
| 7 | introduction | Existing unrelated JSON settings stay in place. | `settings-preserved` |
| 9 | sample section | Open `/demo` or run the site locally and visit: | Clear instruction |
| 12 | sample section | The demo opens with Atlas API confirmed and its editor-file preview ready. | `demo-reset` |
| 8 | sample section | It also includes Northwind Store and Launch Docs. | `three-cues` |
| 9 | sample section | It writes only to a `demo:` browser storage key. | `demo-isolated` |
| 8 | sample section | Use **Reset demo** to restore that completed sample. | `demo-reset` |
| 12 | develop | Requirements: Node 22, npm, Rust stable, and the Tauri 2 system dependencies. | Clear for repository users |
| 14 | test/build | `npm run build` creates desktop assets in `dist/app` and the deployable site in `dist/site`. | Verified |
| 16 | test/build | The static deploy command is `npm ci && npm run build:site` with `dist/site` as its output. | Clear instruction |
| 9 | test/build | The Playwright suite checks every published claim in `.factory/claims.json`. | Registry count test passes; F-3-3 and F-3-4 cover quality gaps |
| 12 | test/build | It also checks routes, accessibility, offline reload, mobile width, and console errors. | Verified by full suite |
| 12 | release | The release workflow targets these packages when a `v*` tag is pushed: | `release-matrix` |
| 7 | release | The workflow publishes `SHA256SUMS`, `latest.json`, and `BUILD-PROVENANCE.sigstore.json`. | `release-manifest` |
| 9 | release | GitHub signs one SLSA provenance statement covering every package. | `release-signing`; F-3-3, F-3-7 |
| 12 | release | The statement binds each checksum to this repository, workflow, commit, and tag. | `release-signing`; F-3-3 |
| 16 | release | The landing page detects the operating system and resolves a matching package through the GitHub API. | `platform-download` |
| 13 | release | It keeps downloads unavailable until every platform package and the source-signature bundle exist. | F-3-4, F-3-7 |
| 15 | release | macOS notarization and Windows trust-store signing remain optional because their owner certificates are not configured. | F-3-1, F-3-5 |
| 8 | release | After publishing a release, run these independent checks. | Clear instruction |
| 12 | release | The first verifies the release files, checksums, manifest, and GitHub attestation records. | Clear instruction |
| 11 | release | The second cryptographically verifies one downloaded package against the repository identity. | Clear instruction |
| 12 | price/privacy | Color, name, symbol, and confirmation are free for up to three projects. | `free-project-limit` |
| 7 | price/privacy | A valid license removes the project limit. | `free-project-limit` |
| 15 | price/privacy | The site shows a purchase link only when the Sociobot catalogue has an active checkout. | `checkout-availability` |
| 13 | price/privacy | Project names, local paths, and settings stay on the device during normal use. | `project-data-local` |
| 11 | price/privacy | A license check sends only the pasted license value to `api.sociobot.in`. | `license-token-only` |
| 9 | price/privacy | Read the shipped `/privacy` and `/terms` pages for details. | Clear instruction |
| 5 | license | Licensed under the MIT License. | Confirmed by `LICENSE` |

### README headings and list items

| Words | Type | Exact text | Result |
| ---: | --- | --- | --- |
| 3 | h1 | Project Color Beacons | Clear repository title |
| 3 | h2 | Try sample projects | Clear |
| 1 | h2 | Develop | Clear |
| 3 | h2 | Test and build | Clear |
| 3 | h2 | Install and release | Clear |
| 7 | package item | macOS: Intel and Apple silicon disk images | `release-matrix` |
| 5 | package item | Windows: MSI or executable installer | `release-matrix` |
| 5 | package item | Linux: AppImage and Debian package | `release-matrix` |
| 3 | h2 | Price and privacy | Clear |
| 2 | h2 | Project layout | Clear |
| 6 | layout item | `app/` — Vite and TypeScript desktop interface | Clear |
| 7 | layout item | `src-tauri/` — Rust folder validation and editor-file merge | Clear |
| 8 | layout item | `site/` — landing, demo, legal pages, service worker, installers | Clear |
| 7 | layout item | `shared/` — beacon data and shared visual tokens | Clear |
| 6 | layout item | `tests/` — Playwright claim and accessibility checks | Clear |
| 9 | layout item | `.factory/` — brief, design, claims, demo, copy audit, and handoff | Clear |

Terminology is otherwise consistent: a **beacon** has three **beacon cues**
(color, name, symbol); the **folder path** is a separate check; the pre-write UI
is the **confirmation strip**; and isolated sample use is the **demo**.

## 4. Demo and sandbox

- The landing primary action opens `/demo` in one click.
- At 390 × 844, the first demo viewport contains the persistent banner,
  confirmed Atlas API strip, editor-file result, and a complete Atlas API row.
- The sample contains Atlas API, Northwind Store, and Launch Docs with distinct
  names, paths, colors, symbols, and editor selections.
- A seeded `pcb:projects=REAL-SENTINEL` value remained byte-for-byte unchanged
  after checking and confirming Northwind Store and resetting the demo.
- Demo changes used only `demo:pcb:site-state`. Reset restored confirmed Atlas
  API and all three projects. **Start for real** deleted the demo key, and the
  next `/demo` visit restored the seed.
- A fresh direct `/demo` request log remained same-origin. The landing page calls
  the disclosed GitHub release and Sociobot catalogue endpoints before demo
  entry, but sent no project data.
- The service worker served `/demo` after the context was switched offline.

Demo behavior passes.

## 5. Claims

I cloned `main` at `c3a6074146dd79f01b5deb32765eefd6bada01fa` to
`/tmp/pcb-review3-clean.pFNyUe`, ran `npm ci`, and ran every exact `test` command
from `.factory/claims.json` separately.

| Claim ID | Result | Evidence exercised |
| --- | --- | --- |
| `three-cues` | PASS | All three sample projects and confirmation strip |
| `confirmation-before-write` | PASS | No output before confirmation; selected editor output after |
| `demo-isolated` | PASS | Demo namespace, real sentinel, request origins |
| `demo-disposal` | PASS | Site and desktop demo keys removed on exit |
| `demo-reset` | PASS | Completed Atlas state and three projects restored |
| `offline-reload` | PASS | Fresh context reloaded after going offline |
| `free-project-limit` | PASS | Four free capabilities, fourth-project gate, license recovery |
| `beacon-stability` | PASS | Saved name, color, and symbol after reopening |
| `release-manifest` | PASS | Fixture checksums and platform manifest |
| `release-signing` | PASS | Workflow strings only; inadequate outcome coverage is F-3-3 |
| `release-matrix` | PASS | macOS Intel/Apple silicon, Windows, Linux workflow matrix |
| `platform-download` | PASS | Platform fixture selection and unsigned fallback; gap is F-3-4 |
| `settings-preserved` | PASS | Rust merge preserves unrelated editor JSON |
| `editor-settings` | PASS | Rust core writes VS Code/Cursor and Zed settings |
| `project-data-local` | PASS | Desktop-shaped sample flow sends no outside request |
| `license-token-only` | PASS | Verification sends the fixture token in the URL and no body |
| `checkout-availability` | PASS | Matching, mismatched, and unsigned release states |

The separate live `RELEASE_TAG=v0.1.2 npm run test:release` check passed for all
nine packages and their GitHub attestation records. That extra result does not
repair the registered-test defect in F-3-3.

## 6. Earlier finding regression check

I read `review-1.md`, `review-2.md`, `polish-1.md`, `polish-2.md`, and the full
incoming handoff. Each earlier review finding was checked on the live site and
in current source.

| Earlier ID | Live and code recheck | Status |
| --- | --- | --- |
| F-1-1 | Mobile demo opens with confirmed Atlas, its editor result, and a full Atlas row. | Fixed |
| F-1-2 | `/review-3-missing` returns HTTP 404 with the designed page. | Fixed |
| F-1-3 | 404 has the shared structure, but its footer still says 0.1.1 while the site is 0.1.2. | **Regressed: F-3-2** |
| F-1-4 | The unproved “make similar windows clear” outcome is absent. | Fixed |
| F-1-5 | Free copy names four tested capabilities and three projects. | Fixed |
| F-1-6 | `demo-reset` is registered and passes. | Fixed |
| F-1-7 | `release-manifest` is registered and passes. | Fixed |
| F-1-8 | `platform-download` is registered and platform selection passes. | Fixed, with new coverage gap F-3-4 |
| F-1-9 | Current Windows/macOS files still lack the demanded OS-trust signatures. | **Unfixed: F-3-1** |
| F-1-10 | “Symbol” is used consistently for the cue. | Fixed |
| F-1-11 | Three beacon cues and the separate folder path are distinguished. | Fixed |
| F-1-12 | Heading is “Preview the confirmation strip”. | Fixed |
| F-1-13 | Heading is “What stays on your device”. | Fixed |
| F-1-14 | “Safe” demo labels remain absent. | Fixed |
| F-1-15 | Both 404 paths use direct page/address language. | Fixed |
| F-2-1 | Live Back/Forward restores each route's scroll and focuses its h1. | Fixed |
| F-2-2 | Source provenance exists, but current Windows/macOS packages remain without the required platform signatures. | **Unfixed: F-3-1** |
| F-2-3 | `beacon-stability` is registered and passes. | Fixed |
| F-2-4 | The old claim that the workflow always platform-signs packages is absent. | Fixed; current provenance coverage gap is F-3-3 |
| F-2-5 | Terms now say a valid license removes the three-project limit. | Fixed |
| F-2-6 | Demo buttons have project-specific accessible names. | Fixed |
| F-2-7 | Demo banner is a named complementary landmark; live Axe is clean. | Fixed |
| F-2-8 | Hero action says “View downloads”. | Fixed |
| F-2-9 | Step heading says “Check the confirmation strip”. | Fixed |

The incoming handoff's 390 px/200% layout fix, selected-editor preview fix, and
GitHub source-provenance verification also pass. Its stated lack of Apple and
Windows certificates confirms F-3-1 rather than resolving the earlier signing
requirement.

## 7. Structure, accessibility, links, and identity

- `/`, `/demo`, `/privacy`, `/terms`, `/404.html`, and an unknown 404 response
  have route-specific titles, `lang=en`, one h1, one main, descriptions,
  canonicals, Open Graph/Twitter data, favicon, and apple-touch icon.
- Known deep links return 200 and unknown paths return 404. Back/Forward restores
  focus and scroll. The route announcement is present.
- Every HTTP link found across the five public documents returned 200 after
  redirects. Both `mailto:` links were treated as explicit non-HTTP links.
- The live Playwright Axe scan reports zero violations on every route. The 390
  px and 200% text checks, 44 px targets, keyboard flow, focus outline, dark
  theme, and reduced-motion checks pass.
- `/opt/fleet/lib/verify-url.sh` reports HTTP 200, no console errors, one h1, one
  main, complete image alternatives, and no unlabeled buttons.
- The site JavaScript is 7.79 kB gzip. The locally built JS and CSS hashes exactly
  match the deployed assets.
- The porcelain marker art, cut symbols, glacial palette, ruled background,
  serif display type, asymmetric ceramic panels, and tile motion are visibly
  product-specific rather than a generic SaaS template.
- Footer structure is consistent, but its stale 404 version is F-3-2.

## 8. Missed leverage

No additional AI feature is justified. This safeguard needs deterministic local
identity cues; model inference would add network, cost, and disclosure without
improving confirmation. Cloud sync would conflict with the local-first brief,
and direct editor-setting output already covers the obvious export need.

## 9. Verification record

- 17/17 exact claim commands from a clean clone: PASS individually
- `npm test`: first run hit a Chromium process segfault in
  `@claim:platform-download`; immediate unchanged rerun: 31/31 PASS
- `npm run build`: PASS; `dist/app` and `dist/site` produced
- `npm run test:live:site`: PASS
- `npm run test:live:billing`: PASS; one $24 product and hosted checkout
- `RELEASE_TAG=v0.1.2 npm run test:release`: PASS; nine package attestations
- Factory `verify-url.sh`: PASS
- Link crawl: no dead HTTP links

The one browser-process crash was not reproducible and did not recur in the
individual clean-clone claim run or immediate full-suite rerun, so it is
recorded here rather than treated as a product finding.

## What would make this perfect

Resolve all seven findings. Publish and verify OS-trust-signed Windows and macOS
artifacts, synchronize the 404 version with the application shell, make the
tagged release tests prove their full claims, register the platform-signature
status, put the exact paid price in the first-screen facts, and replace release
jargon with explicit trust wording. Then rerun the entire checklist from a new
clone and fresh browser contexts. A PASS requires zero findings.
