# First-read product QA review 6

- Product: Project Color Beacons
- Live URL: <https://project-color-beacons.sociobot.in>
- Reviewed: 2026-09-01
- Source base: `5fb2179e0689773dc8e4c321bf0ff325abe5e100`
- Verdict: **PASS**
- Findings: **none**

The first screen explains the job, audience, and first action at phone and desktop sizes. The one-click demo opens a completed example, keeps sample changes separate, resets correctly, and reloads offline. All 20 registered claim commands pass individually from a fresh clone. The live copy has no unlisted claim, long sentence, unclear heading, inconsistent product term, or unclear action.

## 1. Cold first read

I opened `/` in separate new Chromium contexts at 390 × 844 and 1440 × 900. I did not scroll before answering.

| Check | Answer confirmed from the first screen | Exact text |
| --- | --- | --- |
| What does this do? | It marks the current project before an edit. | “Mark the project before you edit.” |
| For whom? | Dyslexic and ADHD developers working with similar project windows. | “For dyslexic and ADHD developers who need distinct cues across similar project windows.” |
| What should I click first? | Open the completed sample workspace. | “Try it with sample data” and “The demo opens a completed sample.” |

Both contexts returned HTTP 200 with no console errors. At 390 px, the primary action and all three privacy, offline, and price facts fit within the first 844 px. The document width was exactly 390 px.

## 2. Copy audit

Counts treat hyphenated terms, paths, prices, versions, and each code token as one word. Punctuation-only separators are not words. No sentence exceeds 22 words. No banned marketing term, unclear metaphor, inconsistent product term, or unsupported adjective was found.

### Landing-page sentences

| Words | Location | Exact sentence | Check |
| ---: | --- | --- | --- |
| 6 | h1 | Mark the project before you edit. | Clear job statement |
| 13 | hero | For dyslexic and ADHD developers who need distinct cues across similar project windows. | Clear audience and situation |
| 6 | demo note | The demo opens a completed sample. | Confirmed by `demo-reset` |
| 3 | demo note | Nothing is saved. | Confirmed as separation from real project data by `demo-isolated` |
| 9 | fact | Project data stays on your device during normal use. | Confirmed by `project-data-local` |
| 8 | fact | The demo reloads offline after its first visit. | Confirmed by `offline-reload` |
| 9 | fact | Three projects are free; unlimited projects cost $24 once. | Confirmed by `free-project-limit` and `price-display` |
| 9 | image alternative | Six distinct ceramic symbols sit beside layered window-like panes. | Describes the image purpose |
| 8 | image caption | Each project repeats one symbol, color, and name. | Confirmed by `three-cues` |
| 7 | preview | The strip repeats the three beacon cues. | Confirmed by `three-cues` |
| 9 | preview | You press the named button before editor settings change. | Confirmed by `confirmation-before-write` |
| 11 | how it works | The app writes supported settings for VS Code, Cursor, and Zed. | Confirmed by `editor-settings` |
| 7 | how it works | Existing unrelated JSON settings stay in place. | Confirmed by `settings-preserved` |
| 9 | step 1 | Name the project and pick its symbol and color. | Clear instruction |
| 9 | step 2 | Check the three beacon cues and the folder path. | Clear instruction |
| 9 | step 3 | The app merges the beacon into supported project files. | Confirmed by `editor-settings` |
| 3 | privacy label | Repeat the cues. | Clear instruction |
| 9 | privacy | Every beacon includes a written name, symbol, and color. | Confirmed by `three-cues` |
| 3 | privacy label | Confirm the project. | Clear instruction |
| 7 | privacy | Editor settings wait for the named confirmation. | Confirmed by `confirmation-before-write` |
| 3 | privacy label | Keep data local. | Clear instruction |
| 9 | privacy | Project data stays on this device during normal use. | Confirmed by `project-data-local` |
| 12 | pricing | Color, name, symbol, and confirmation are free for up to three projects. | Confirmed by `free-project-limit` |
| 7 | pricing | A valid license removes the project limit. | Confirmed by `desktop-license-recovery` |
| 8 | unavailable download | A verified [platform] download is not published yet. | Confirmed by `platform-download` and `platform-signatures` |
| 6 | unavailable download | The free browser demo remains available. | Confirmed on Windows and macOS contexts |
| 5 | Linux download pattern | v0.1.6 · [package] · verified package origin. | Confirmed by `platform-download` |
| 7 | Windows download pattern | v0.1.6 · [package] · verified package origin · Authenticode verified. | Confirmed by `platform-signatures` fixtures; not shown for the current unsigned release |
| 9 | macOS download pattern | v0.1.6 · [package] · verified package origin · Apple signed and notarized. | Confirmed by `platform-signatures` fixtures; not shown for the current unsigned release |
| 10 | purchase state | License purchases open with an installable package for this platform. | Confirmed by `checkout-availability` |
| 4 | purchase detail | $24 one-time · unlimited projects. | Confirmed by `price-display` |
| 5 | purchase state | License purchases are being prepared. | Clear status |
| 6 | purchase state | The free app stores three projects. | Confirmed by `free-project-limit` |
| 4 | license guidance | Already have a license? | Clear prompt |
| 10 | license guidance | In the desktop app, choose License and paste your key. | Confirmed by `desktop-license-recovery` |
| 4 | purchase return | Your license is ready. | Confirmed by `desktop-license-recovery` |
| 9 | purchase return | Copy it, then paste it into the desktop app. | Confirmed by `desktop-license-recovery` |
| 3 | copy result | License key copied. | Confirmed by the live return-flow check |
| 9 | copy result | In the desktop app, choose License and paste it. | Clear instruction |
| 4 | copy fallback | Copy the selected key. | Clear fallback instruction |
| 6 | footer | Mark each project before you edit. | Clear product summary |

### Landing headings and actions

| Words | Type | Exact text | Check |
| ---: | --- | --- | --- |
| 4 | eyebrow | A local desktop helper | Names the product class |
| 5 | primary action | Try it with sample data | Names the result |
| 2 | secondary action | View downloads | Names the destination |
| 4 | h2 | Preview the confirmation strip | Names the section |
| 6 | h2 | Set a beacon in three steps | Names the section |
| 3 | step heading | Choose a folder | Clear action |
| 4 | step heading | Check the confirmation strip | Clear action |
| 3 | step heading | Write editor settings | Clear action |
| 2 | eyebrow | Privacy boundaries | Names the topic |
| 5 | h2 | What stays on your device | Names the section |
| 2 | eyebrow | Desktop app | Names the product class |
| 4 | h2 | Start with three projects | Names the free starting point |
| 4 | unavailable action | Verified [platform] download pending | Names the current result |
| 3 | available action | Download for [platform] | Names the result |
| 4 | purchase action | Buy a $24 license | Names the result and price |
| 4 | field label | License key from checkout | Names the value |
| 3 | action | Copy license key | Names the result |

### README sentences

| Words | Location | Exact sentence or text unit | Check |
| ---: | --- | --- | --- |
| 12 | introduction | Mark each project with a color, name, and symbol before you edit. | Clear |
| 14 | introduction | Project Color Beacons is a local desktop helper for developers who juggle similar windows. | Clear |
| 12 | introduction | It keeps each saved project's color, name, and symbol after a restart. | Confirmed by `beacon-stability` |
| 12 | introduction | The app writes supported per-project settings for VS Code, Cursor, and Zed. | Confirmed by `editor-settings` |
| 7 | introduction | Existing unrelated JSON settings stay in place. | Confirmed by `settings-preserved` |
| 9 | sample projects | Open `/demo` or run the site locally and visit: | Clear instruction |
| 12 | sample projects | The demo opens with Atlas API confirmed and its editor-file preview ready. | Confirmed by `demo-reset` |
| 8 | sample projects | It also includes Northwind Store and Launch Docs. | Confirmed by `three-cues` |
| 9 | sample projects | It writes only to a `demo:` browser storage key. | Confirmed by `demo-isolated` |
| 8 | sample projects | Use **Reset demo** to restore that completed sample. | Confirmed by `demo-reset` |
| 12 | develop | Requirements: Node 22, npm, Rust stable, and the Tauri 2 system dependencies. | Concrete prerequisites |
| 14 | test and build | `npm run build` creates desktop assets in `dist/app` and the deployable site in `dist/site`. | Confirmed by the production build |
| 16 | test and build | The static deploy command is `npm ci && npm run build:site` with `dist/site` as its output. | Clear instruction |
| 9 | test and build | The Playwright suite checks every published claim in `.factory/claims.json`. | Confirmed by the registry coverage unit test |
| 12 | test and build | It also checks routes, accessibility, offline reload, mobile width, and console errors. | Confirmed by the 35-test suite |
| 12 | install and release | The release workflow targets these packages when a `v*` tag is pushed: | Confirmed by `release-matrix` |
| 13 | install and release | The workflow publishes `SHA256SUMS`, `latest.json`, a platform-status record, and a GitHub provenance file. | Confirmed by `release-manifest` |
| 12 | install and release | GitHub records the repository, workflow, commit, tag, and checksum for every package. | Confirmed by `release-signing` |
| 15 | install and release | The landing page detects the operating system and reads release details from GitHub's browser-accessible API. | Confirmed by `platform-download` |
| 14 | install and release | Every platform requires verified GitHub provenance and a complete release before its download appears. | Confirmed by `platform-download` |
| 5 | install and release | Windows also requires Authenticode verification. | Confirmed by `platform-signatures` |
| 6 | install and release | macOS requires Apple signing and notarization. | Confirmed by `platform-signatures` |
| 7 | install and release | Unsigned Windows and macOS packages stay unavailable. | Confirmed live and by `platform-signatures` |
| 12 | install and release | Their purchase links also stay hidden until the required trust checks pass. | Confirmed by `checkout-availability` |
| 8 | install and release | After publishing a release, run these independent checks. | Clear instruction |
| 12 | install and release | The first checks release files, checksums, the manifest, and GitHub's package-origin record. | Clear instruction |
| 10 | install and release | The second checks a downloaded package against the repository identity. | Clear instruction |
| 7 | install and release | Windows and macOS signing need owner certificates. | Clear constraint |
| 12 | install and release | The release status and landing page disclose when those signatures are unavailable. | Confirmed by `platform-signatures` |
| 12 | price and privacy | Color, name, symbol, and confirmation are free for up to three projects. | Confirmed by `free-project-limit` |
| 7 | price and privacy | A valid license removes the project limit. | Confirmed by `desktop-license-recovery` |
| 17 | price and privacy | To restore a purchase, open the desktop app, choose **License**, and paste the key from your receipt. | Confirmed by `desktop-license-recovery` |
| 20 | price and privacy | The site shows a purchase link only when checkout is active and an installable package exists for the visitor's platform. | Confirmed by `checkout-availability` |
| 8 | price and privacy | The active catalogue price appears on the page. | Confirmed by `price-display` |
| 13 | price and privacy | Project names, local paths, and settings stay on the device during normal use. | Confirmed by `project-data-local` |
| 11 | price and privacy | A license check sends only the pasted license value to `api.sociobot.in`. | Confirmed by `license-token-only` |
| 9 | price and privacy | Read the shipped `/privacy` and `/terms` pages for details. | Clear instruction |
| 5 | license | Licensed under the MIT License. | Confirmed by `LICENSE` |

README headings are descriptive: **Try sample projects**, **Develop**, **Test and build**, **Install and release**, **Price and privacy**, and **Project layout**. Package and directory list items are factual labels rather than sentences. Terminology remains consistent: a **beacon** contains three **beacon cues**; the **folder path** is a separate check; the UI is the **confirmation strip**; the sample experience is the **demo**.

## 3. Demo and storage separation

- The primary landing action opens `/demo` in one click.
- The first 390 × 844 demo screen contains the persistent demo banner, confirmed Atlas API strip, both editor-file names, and the complete Atlas API project row.
- The realistic sample includes Atlas API, Northwind Store, and Launch Docs with distinct names, paths, colors, and symbols.
- Both `/demo` and `/?demo=1` use `demo:pcb:site-state`. A preloaded `pcb:projects=REAL-SENTINEL` value remained unchanged while selecting, confirming, and resetting a sample.
- **Reset demo** restored confirmed Atlas API and exactly three projects.
- **Start for real** removed the demo state before opening the download section.
- Fresh direct demo request logs contained only `https://project-color-beacons.sociobot.in` requests.
- The sample shell and data reloaded after the browser context was switched offline.

The demo check passes with no finding.

## 4. Registered claims

I cloned the source base into `/tmp/pcb-review6-clean.6qjliX`, ran `npm ci`, and ran every exact command from `.factory/claims.json` separately.

| Claim | Result | Observable check |
| --- | --- | --- |
| `three-cues` | PASS | All three sample projects repeat color, name, and symbol |
| `confirmation-before-write` | PASS | Editor output appears only after named confirmation |
| `demo-isolated` | PASS | Separate demo key, unchanged real-data sentinel, same-origin requests |
| `demo-disposal` | PASS | Site and desktop demo keys are removed on exit |
| `demo-reset` | PASS | Confirmed Atlas API and all three samples are restored |
| `offline-reload` | PASS | Fresh demo context reloads offline |
| `free-project-limit` | PASS | Four free capabilities and the fourth-project license choice |
| `price-display` | PASS | $24 and $29 fixtures plus the live $24 one-time registration |
| `desktop-license-recovery` | PASS | Checkout key copies to and unlocks a fresh desktop profile |
| `beacon-stability` | PASS | Saved color, name, and symbol remain after reopen |
| `release-manifest` | PASS | Checksums and platform manifest outputs |
| `release-signing` | PASS | Recorded provenance verifies repository, workflow, commit, and tag |
| `release-matrix` | PASS | macOS Intel/Apple silicon, Windows, Linux, and Tauri targets |
| `platform-download` | PASS | Only complete matching packages with required trust records are linked |
| `platform-signatures` | PASS | Windows requires Authenticode; macOS requires signing and notarization |
| `settings-preserved` | PASS | Unrelated editor JSON values remain |
| `editor-settings` | PASS | VS Code, Cursor, and Zed files receive supported settings |
| `project-data-local` | PASS | Normal project use makes no external request |
| `license-token-only` | PASS | License verification sends only the pasted value |
| `checkout-availability` | PASS | Checkout appears only for an active product and installable platform package |

The live landing, metadata, demo, privacy, terms, and README claim-like statements map to these entries or to directly checked repository facts. No unlisted claim remains.

## 5. Earlier finding confirmation

I read all five earlier reviews, all five polish reports, and the incoming handoff. Each earlier finding was checked in the live site and current source.

| Earlier ID | Current live and source confirmation | Result |
| --- | --- | --- |
| F-1-1 | The mobile demo opens with confirmed Atlas output and a complete first row. | Fixed |
| F-1-2 | Unknown addresses return the designed document with HTTP 404. | Fixed |
| F-1-3 | The standalone 404 has complete metadata, shared navigation/footer, legal links, and current build identity. | Fixed |
| F-1-4 | The unsupported outcome wording is absent. | Fixed |
| F-1-5 | Free copy names only the four tested capabilities and three-project limit. | Fixed |
| F-1-6 | Reset is registered and restores the completed sample. | Fixed |
| F-1-7 | Manifest generation is registered and checks actual output files. | Fixed |
| F-1-8 | Platform selection is registered and checks every supported platform. | Fixed |
| F-1-9 | Unsigned Windows/macOS packages and their purchase links remain unavailable. | Fixed |
| F-1-10 | **Symbol** is the single visual-cue term. | Fixed |
| F-1-11 | Copy distinguishes the three cues from the folder path. | Fixed |
| F-1-12 | The heading is “Preview the confirmation strip.” | Fixed |
| F-1-13 | The heading is “What stays on your device.” | Fixed |
| F-1-14 | Demo copy names the separate sample workspace and storage boundary. | Fixed |
| F-1-15 | Both not-found versions use direct page/address wording. | Fixed |
| F-2-1 | Back and Forward restore each scroll position, focus the h1, and announce the route. | Fixed |
| F-2-2 | Windows/macOS links and checkout remain withheld without required operating-system trust. | Fixed |
| F-2-3 | Beacon persistence is registered and passes after reopening. | Fixed |
| F-2-4 | README and tests distinguish GitHub provenance from operating-system signing. | Fixed |
| F-2-5 | Terms promise only removal of the three-project limit. | Fixed |
| F-2-6 | Every sample control includes its project name. | Fixed |
| F-2-7 | The demo banner is a named complementary landmark; Axe reports no issue. | Fixed |
| F-2-8 | The secondary action says “View downloads.” | Fixed |
| F-2-9 | Step 2 says “Check the confirmation strip.” | Fixed |
| F-3-1 | The release contract requires Authenticode for Windows and signing plus notarization for macOS before linking or selling. | Fixed |
| F-3-2 | Generated 404 and normal routes show version 0.1.6 and the same build identity. | Fixed |
| F-3-3 | The tagged provenance test performs cryptographic verification of the recorded bundle. | Fixed |
| F-3-4 | The tagged platform test checks incomplete package and metadata cases. | Fixed |
| F-3-5 | Platform trust status has a registered test covering false and missing fields. | Fixed |
| F-3-6 | The active $24 one-time price is visible in the first phone screen. | Fixed |
| F-3-7 | README explains package origin and operating-system trust in plain words. | Fixed |
| F-4-1 | The current unsigned Windows/macOS release has no package link or purchase link; the same ID from review 5 remains fixed. | Fixed |
| F-4-2 | The website uses a one-session copy handoff and directs the buyer to the desktop License dialog. | Fixed |
| F-4-3 | The unexplained browser-security term is absent. | Fixed |
| F-5-1 | `price-display` checks changing catalogue fixtures and the exact live $24 one-time registration. | Fixed |

No earlier finding is open, partial, or regressed.

## 6. Structure, links, accessibility, and identity

- `/`, `/demo`, `/privacy`, `/terms`, and `/404.html` return 200. An unknown address returns HTTP 404.
- Each route has its expected title, one h1, one main landmark, description, canonical URL, Open Graph/Twitter metadata, favicon, apple-touch icon, shared header, and shared footer.
- The title pattern is plain and route-specific. The home title is “Project Color Beacons — Mark the right project.”
- `robots.txt` points to the sitemap. The sitemap lists the four public routes.
- Deep links, Back/Forward scroll, h1 focus, and the polite route announcement pass.
- Every discovered HTTP link returned 200 after redirects. The two `mailto:` links are explicit.
- Live Axe checks report zero violations on all routes and the dark landing view. Keyboard focus, 44 px targets, 200% text reflow, and reduced-motion behavior pass.
- The factory URL check reports HTTP 200, no console errors, `lang="en"`, one h1, one main, complete image alternatives, and named controls.
- Site JavaScript is 23.16 KB raw and 8.18 KB gzip. The deployed JavaScript, CSS, and service worker SHA-256 values match the local production build.
- The porcelain marker art, cut symbols, ruled frost field, serif display type, asymmetric ceramic panels, and restrained tile motion match `.factory/design.md` and are visually specific to this product.

## 7. Missed leverage

No additional feature is clearly implied by the brief. The core task is deterministic and local. Model assistance would add network use and cost without improving the named confirmation step. Sync would weaken the local-first boundary. The app already provides the editor-setting output needed for the job, and a three-project local list does not create an obvious import/export need.

## 8. Verification record

- 20/20 exact claim commands from a fresh clone: PASS
- `npm test`: 35/35 PASS
- `npm run test:unit`: 7/7 PASS
- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS; `dist/app` and `dist/site` produced
- `npm run test:live:site`: PASS
- `npm run test:live:billing`: PASS; one $24 product and hosted checkout redirect
- Factory URL check: PASS
- Live link check: no dead HTTP link
- Local/live asset hashes: exact match

## What would make this perfect

Nothing remains to change for the current product contract. The first read, sample workspace, registered claims, storage boundary, release gates, routes, accessibility baseline, documentation, and visual identity all have direct passing evidence.
