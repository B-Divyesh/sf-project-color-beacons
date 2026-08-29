# Adversarial first-read review 2

- Product: Project Color Beacons
- Live URL: <https://project-color-beacons.sociobot.in>
- Reviewed: 2026-08-29
- Source base: `cae342f1eed0b9dd96ea06c7e37859bc7493a8ff`
- Verdict: **FAIL**

The landing page and one-click demo are understandable and usable on a phone. All 16 declared claim commands pass. The product still fails because browser history loses the visitor's scroll position, the downloadable release remains unsigned, three published claims exceed their tests, and the copy/accessibility audit is not at zero findings.

## 1. Cold first read

I opened `/` in fresh browser contexts at 390 × 844 and 1440 × 900. I did not scroll before answering.

| Question | Answer from the first screen | Exact evidence |
| --- | --- | --- |
| What does this do? | It marks the current project with distinct cues before an edit. | “Mark the project before you edit.” |
| For whom? | Dyslexic and ADHD developers working across similar project windows. | “For dyslexic and ADHD developers who need distinct cues across similar project windows.” |
| What should I click first? | **Try it with sample data**. | This is the first primary action at both widths. |

The three short facts about local data, offline demo reload, and the free three-project limit are visible without scrolling at 390 × 844. They also fit within the 1440 × 900 first viewport. This check passes.

## 2. Findings

### F-2-1 — BLOCKING — Back and Forward discard the prior scroll position

- Location: live SPA navigation between `/` and `/demo`; `site/src/main.ts`, `renderRoute()` and the `popstate` handler.
- Exact result: after scrolling the 390 px landing page to `scrollY=2400`, opening **Demo**, and pressing Back, the route and h1 focus were correct but `scrollY` was `0`. Forward also returned to `/demo` at `scrollY=0`.
- Why this fails: the route contract requires Back/Forward to restore both focus and scroll. Resetting a long mobile page to the top makes browser history behave unlike normal navigation. The existing test named “supports the back button” checks only URL and focus, so it misses the failure.
- Fix: store a scroll position per history entry, restore it on `popstate` after rendering, and keep new navigation at the top. Extend the route test to scroll to a fixed nonzero position, navigate, go back and forward, and assert both restored positions and h1 focus.

### F-2-2 — BLOCKING — The earlier unsigned-release finding is only half-fixed

- Prior finding: `F-1-9`.
- Locations: live download status and GitHub release `v0.1.1`.
- Exact quotes: the landing page reports “unsigned build”; the release body says “Unsigned desktop builds. Check SHA256SUMS before installing.”
- Why this fails: review 1 required signed Windows installers and signed/notarized macOS artifacts. The workflow now blocks a future unsigned publication, but every current first-time visitor is still directed to the explicitly unsigned release. That leaves the original install-trust and operating-system warning problem in production. Under the history rule, a half-fixed earlier finding is blocking again.
- Fix: publish a signed Windows build and signed/notarized macOS builds, verify their signatures independently, update the release manifest, and stop serving v0.1.1 as the latest download. Keep the workflow gate.

### F-2-3 — HIGH — “Stable beacon” is an unlisted persistence claim

- Location: `README.md`, introduction.
- Exact quote: “It gives each project folder a stable beacon and a named confirmation strip.”
- Why this fails: `three-cues` checks the three current sample rows, but no registered test reloads or restarts the app and proves that a project's name, color, and symbol remain unchanged. “Stable” is a behavior a user can rely on and is central to the brief.
- Fix: add a `beacon-stability` claim and test that creates a project, reloads/restarts from the same local data, and asserts all three cues are unchanged. Alternatively remove “stable”: “It shows each project folder's beacon and a named confirmation strip.”

### F-2-4 — HIGH — The README signing claim is stronger than its registered test

- Location: `README.md`, “Install and release”.
- Exact quote: “The release workflow signs Windows packages and signs and notarizes macOS packages before it publishes them.”
- Why this fails: `release-signing` asserts that credential names, certificate-import text, and configuration strings exist in the workflow. It does not inspect a produced package or prove a successful signature/notarization before publication. The latest public release is explicitly unsigned, making the gap material.
- Fix: either delete this sentence and retain the narrower tested sentence, “Publication stops unless macOS signing/notarization and Windows signing credentials are present,” or add release tests that verify Windows signatures, macOS signatures, and Apple notarization on the artifacts before publication.

### F-2-5 — HIGH — The paid terms make an untested multi-device entitlement claim

- Location: live `/terms`, “Free and licensed use”.
- Exact quote: “A valid license supports unlimited projects on your devices.”
- Why this fails: `free-project-limit` proves a fixture license removes the limit in one browser app instance. It does not prove the same entitlement across multiple devices. Paid users could read the plural as a tested licensing right.
- Fix: write “A valid license removes the three-project limit,” which matches the registered claim, or add an entitlement test using two clean app profiles and document the permitted device scope.

### F-2-6 — MEDIUM — All sample-project controls have the same accessible name

- Location: live `/demo`, the Atlas API, Northwind Store, and Launch Docs rows.
- Exact text: each button is named “Check project”.
- Why this fails: a screen-reader button list exposes three indistinguishable controls. The visible row supplies context, but the control's accessible name does not identify its target and does not name the result precisely.
- Fix: use visible labels such as **Check Atlas API**, **Check Northwind Store**, and **Check Launch Docs**, or provide equivalent `aria-label` values. Add a test that asserts unique accessible names.

### F-2-7 — MEDIUM — The demo banner sits outside every landmark

- Location: live `/demo`, `.demo-banner` before the page header.
- Exact Axe result: moderate `region` violation on `.demo-banner > strong` and `a[data-demo-action="exit"]`: “Some page content is not contained by landmarks.”
- Why this fails: the persistent demo status and **Start for real** action can be missed by landmark navigation. The page otherwise has the required header, main, and footer.
- Fix: make the banner an `<aside aria-label="Demo status">` or another named landmark. Add the full Axe result to the route test instead of filtering out moderate violations.

### F-2-8 — MINOR — “Download the app” does not download the app

- Location: landing first screen.
- Exact text and target: **Download the app** links to `#download` on the same page.
- Why this fails: the action names a download result, but it only scrolls to platform and purchase choices.
- Fix: rename it **View downloads** or link it directly to the selected platform package.

### F-2-9 — MINOR — “Check the strip” is unclear out of context

- Location: landing “Set a beacon in three steps”, step 2 heading.
- Exact text: “Check the strip”.
- Why this fails: a heading list does not identify which strip is meant. The page consistently names this component the “confirmation strip” elsewhere.
- Fix: use “Check the confirmation strip”.

## 3. Copy audit

Counts treat hyphenated terms, paths, filenames, prices, and versions as one word. Commands are not prose sentences. No sentence exceeds 22 words and no banned marketing word appears.

### Live landing page sentences

| Words | Location | Exact sentence | Result |
| ---: | --- | --- | --- |
| 6 | h1 | Mark the project before you edit. | Clear |
| 13 | hero | For dyslexic and ADHD developers who need distinct cues across similar project windows. | Clear |
| 6 | demo note | The demo opens a completed sample. | Covered by `demo-reset` |
| 3 | demo note | Nothing is saved. | Covered as real-data isolation by `demo-isolated` |
| 9 | fact | Project data stays on your device during normal use. | Covered by `project-data-local` |
| 8 | fact | The demo reloads offline after its first visit. | Covered by `offline-reload` |
| 6 | fact | The free app stores three projects. | Covered by `free-project-limit` |
| 9 | hero image alternative | Six distinct ceramic symbols sit beside layered window-like panes. | Clear |
| 8 | hero caption | Each project repeats one symbol, color, and name. | Covered by `three-cues` |
| 7 | preview | The strip repeats the three beacon cues. | Covered by `three-cues` |
| 9 | preview | You press the named button before editor settings change. | Covered by `confirmation-before-write` |
| 11 | how it works | The app writes supported settings for VS Code, Cursor, and Zed. | Covered by `editor-settings` |
| 7 | how it works | Existing unrelated JSON settings stay in place. | Covered by `settings-preserved` |
| 9 | walkthrough 1 alternative | Project list with three sample projects and distinct beacons. | Clear |
| 9 | step 1 | Name the project and pick its symbol and color. | Clear instruction |
| 9 | walkthrough 2 alternative | Confirmation strip for Atlas API above the project list. | Clear |
| 9 | step 2 | Check the three beacon cues and the folder path. | Clear instruction |
| 8 | walkthrough 3 alternative | Editor settings preview after Atlas API is confirmed. | Clear |
| 9 | step 3 | The app merges the beacon into supported project files. | Covered by `editor-settings` |
| 3 | privacy label | Repeat the cues. | Clear |
| 9 | privacy | Every beacon includes a written name, symbol, and color. | Covered by `three-cues` |
| 3 | privacy label | Confirm the project. | Clear |
| 7 | privacy | Editor settings wait for the named confirmation. | Covered by `confirmation-before-write` |
| 3 | privacy label | Keep data local. | Clear |
| 9 | privacy | Project data stays on this device during normal use. | Covered by `project-data-local` |
| 12 | pricing | Color, name, symbol, and confirmation are free for up to three projects. | Covered by `free-project-limit` |
| 7 | pricing | A valid license removes the project limit. | Covered by `free-project-limit` |
| 3 | license label | Have a license? | Clear |
| 6 | license label | Paste it to restore this device. | Clear instruction |
| 6 | footer | Mark each project before you edit. | Clear |

### Landing headings, actions, and live labels

| Type | Exact text | Result |
| --- | --- | --- |
| Eyebrow | A local desktop helper | Clear |
| Primary action | Try it with sample data | Clear and accurate |
| Action | Download the app | F-2-8 |
| h2 | Preview the confirmation strip | Clear |
| h2 | Set a beacon in three steps | Clear |
| Step heading | Choose a folder | Clear |
| Step heading | Check the strip | F-2-9 |
| Step heading | Write editor settings | Clear |
| Eyebrow | Privacy boundaries | Clear |
| h2 | What stays on your device | Clear |
| Eyebrow | Desktop app | Clear |
| h2 | Start with three projects | Clear with the pricing paragraph |
| Action | Download for Linux | Starts the selected download |
| Action | Buy a $24 license | Opens the hosted checkout |
| Offer label | $24 one-time · unlimited projects | Covered by `checkout-availability` and `free-project-limit` |
| Release label | v0.1.1 · Project.Color.Beacons_0.1.1_amd64.AppImage · unsigned build | Reopened F-1-9 / F-2-2 |
| Action | Verify license | Clear |
| Footer provenance | Original generated ceramic image · Version 0.1.1 · Build 2026.08.29 | Concrete provenance and version data |

### README sentences

| Words | Location | Exact sentence | Result |
| ---: | --- | --- | --- |
| 12 | introduction | Mark each project with a color, name, and symbol before you edit. | Clear |
| 14 | introduction | Project Color Beacons is a local desktop helper for developers who juggle similar windows. | Clear |
| 13 | introduction | It gives each project folder a stable beacon and a named confirmation strip. | F-2-3 |
| 12 | introduction | The app writes supported per-project settings for VS Code, Cursor, and Zed. | Covered by `editor-settings` |
| 7 | introduction | Existing unrelated JSON settings stay in place. | Covered by `settings-preserved` |
| 9 | sample section | Open `/demo` or run the site locally and visit: | Clear instruction |
| 12 | sample section | The demo opens with Atlas API confirmed and its editor-file preview ready. | Covered by `demo-reset` |
| 8 | sample section | It also includes Northwind Store and Launch Docs. | Covered by `three-cues` |
| 9 | sample section | It writes only to a `demo:` browser storage key. | Covered by `demo-isolated` |
| 8 | sample section | Use **Reset demo** to restore that completed sample. | Covered by `demo-reset` |
| 12 | develop | Requirements: Node 22, npm, Rust stable, and the Tauri 2 system dependencies. | Concrete developer prerequisites; the dependency phrase links to its definition |
| 14 | test and build | `npm run build` creates desktop assets in `dist/app` and the deployable site in `dist/site`. | Confirmed in clean clone |
| 15 | test and build | The static deploy command is `npm ci && npm run build:site` with `dist/site` as its output. | Concrete developer instruction |
| 9 | test and build | The Playwright suite checks every published claim in `.factory/claims.json`. | All 16 commands ran |
| 12 | test and build | It also checks routes, accessibility, offline reload, mobile width, and console errors. | Source and full suite confirm these checks, but F-2-1 and F-2-7 expose gaps |
| 12 | install and release | The release workflow targets these packages when a `v*` tag is pushed. | Covered by `release-matrix` |
| 11 | install and release | Publication stops unless macOS signing/notarization and Windows signing credentials are present. | Covered by `release-signing` |
| 6 | install and release | The workflow publishes `SHA256SUMS` and `latest.json`. | Covered by `release-manifest` |
| 16 | install and release | The landing page detects the operating system and resolves a matching asset through the GitHub API. | Covered by `platform-download` |
| 12 | install and release | Until the first release is published, it links to the Releases page. | Covered by the `platform-download` fallback |
| 16 | install and release | The release workflow signs Windows packages and signs and notarizes macOS packages before it publishes them. | F-2-4 |
| 12 | price and privacy | Color, name, symbol, and confirmation are free for up to three projects. | Covered by `free-project-limit` |
| 7 | price and privacy | A valid license removes the project limit. | Covered by `free-project-limit` |
| 15 | price and privacy | The site shows a purchase link only when the Sociobot catalogue has an active checkout. | Covered by `checkout-availability` |
| 13 | price and privacy | Project names, local paths, and settings stay on the device during normal use. | Covered by `project-data-local` |
| 11 | price and privacy | A license check sends only the pasted license value to `api.sociobot.in`. | Covered by `license-token-only` |
| 9 | price and privacy | Read the shipped `/privacy` and `/terms` pages for details. | Clear instruction |
| 5 | license | Licensed under the MIT License. | Confirmed by the repository `LICENSE` |

### README headings and non-sentence list items

| Type | Exact text | Result |
| --- | --- | --- |
| h1 | Project Color Beacons | Repository title, not a product-page headline |
| h2 | Try sample projects | Clear |
| h2 | Develop | Clear for the repository audience |
| h2 | Test and build | Clear |
| h2 | Install and release | Clear |
| Package item | macOS: Intel and Apple silicon disk images | Covered by `release-matrix` |
| Package item | Windows: MSI or executable installer | Covered by `release-matrix` |
| Package item | Linux: AppImage and Debian package | Covered by `release-matrix` |
| h2 | Price and privacy | Clear |
| h2 | Project layout | Clear |
| Layout item | `app/` — Vite and TypeScript desktop interface | Concrete path description |
| Layout item | `src-tauri/` — Rust folder validation and editor-file merge | Concrete path description |
| Layout item | `site/` — landing, demo, legal pages, service worker, installers | Concrete path description |
| Layout item | `shared/` — beacon data and shared visual tokens | Concrete path description |
| Layout item | `tests/` — Playwright claim and accessibility checks | Concrete path description |
| Layout item | `.factory/` — brief, design, claims, demo, copy audit, and handoff | Concrete path description |

The technical proper nouns in the README identify actual tools, files, APIs, or directories needed by its developer audience. They are not used as substitutes for explaining product behavior.

## 4. Demo and sandbox

- The landing primary action opens `/demo` in one click.
- At 390 × 844, the first demo viewport already contains the persistent banner, confirmed Atlas API strip, editor-file result, and the complete Atlas API row. The row ended at y=787.
- The samples are specific: Atlas API, Northwind Store, and Launch Docs, with local-looking paths and distinct cues.
- I preloaded `pcb:projects` with `REAL-SENTINEL`, confirmed Northwind Store, and reset. The sentinel remained byte-for-byte unchanged. Demo changes used `demo:pcb:site-state`.
- Reset restored confirmed Atlas API, its editor preview, and exactly three samples.
- **Start for real** removed the demo key; reopening `/demo` restored the initial completed sample.
- A fresh direct `/demo` request log stayed same-origin. The landing page separately calls the disclosed GitHub release and Sociobot catalogue endpoints before demo entry; neither request contains project data.
- The offline reload claim passed after service-worker activation.

The demo behavior passes. Accessibility findings F-2-6 and F-2-7 remain on the demo page.

## 5. Claims

I cloned `main` at `cae342f1eed0b9dd96ea06c7e37859bc7493a8ff` into a new temporary directory, ran `npm ci`, and ran every exact command from `.factory/claims.json` separately.

| Claim ID | Result | Evidence checked by its test |
| --- | --- | --- |
| `three-cues` | PASS | Name, color, and symbol on all three samples |
| `confirmation-before-write` | PASS | No preview before confirmation; both editor previews after |
| `demo-isolated` | PASS | Separate storage key, real sentinel unchanged, no outside request |
| `demo-disposal` | PASS | Site and desktop demo keys removed on exit |
| `demo-reset` | PASS | Completed Atlas state and all three samples restored |
| `offline-reload` | PASS | Demo reload after browser context goes offline |
| `free-project-limit` | PASS | Four free capabilities, fourth-project gate, valid-license recovery |
| `release-manifest` | PASS | Fixture checksums and platform manifest |
| `release-signing` | PASS | Workflow credential/configuration strings; insufficient for F-2-4's stronger copy |
| `release-matrix` | PASS | macOS Intel/Apple silicon, Windows, Linux, and Tauri action |
| `platform-download` | PASS | Matching macOS, Windows, and Linux fixture assets plus fallback |
| `settings-preserved` | PASS | Rust merge preserves unrelated editor JSON |
| `editor-settings` | PASS | Rust core writes VS Code/Cursor and Zed settings |
| `project-data-local` | PASS | Desktop-shaped flow makes no outside request |
| `license-token-only` | PASS | Verification URL contains only the fixture token and no body |
| `checkout-availability` | PASS | Matching and mismatched catalogue states |

No declared test failed. The unlisted or overbroad claims are F-2-3 through F-2-5.

## 6. Earlier findings and verification history

I read `review-1.md`, `polish-1.md`, all five earlier verification reports, and the incoming handoff. Every review-1 finding was checked against both the live site and current source.

| Earlier finding | Live/code result | Status |
| --- | --- | --- |
| F-1-1 mobile demo lacks a completed result | Confirmed Atlas result and full Atlas row fit the first 390 × 844 viewport. | Fixed |
| F-1-2 unknown routes return 200 | `/review-2-missing` returned HTTP 404 with the designed document. | Fixed |
| F-1-3 incomplete standalone 404 | `/404.html` has shared header/footer, metadata, icons, skip link, one h1, and build/provenance text. | Fixed |
| F-1-4 unlisted “make similar windows clear” outcome | The live lede now describes the user's situation without promising an outcome. | Fixed |
| F-1-5 overbroad free-feature claim | Copy names color, name, symbol, and confirmation; the tagged test exercises all four. | Fixed |
| F-1-6 unlisted Reset behavior | `demo-reset` exists and passed. | Fixed |
| F-1-7 unlisted release-manifest claim | `release-manifest` exists and passed. | Fixed |
| F-1-8 unlisted platform-download claim | `platform-download` exists and passed for all three platforms. | Fixed |
| F-1-9 unsigned packages | Live v0.1.1 and its release body still explicitly say unsigned. | **Not fixed; blocking as F-2-2** |
| F-1-10 shape/symbol inconsistency | “Symbol” is used consistently for the cue. | Fixed |
| F-1-11 cue count inconsistency | The three beacon cues and separate folder path are distinguished. | Fixed |
| F-1-12 vague preview heading | It is now “Preview the confirmation strip”. | Fixed |
| F-1-13 mood privacy heading | It is now “What stays on your device”. | Fixed |
| F-1-14 subjective “safe” labels | They are now “Try sample projects” and “Separate sample workspace”. | Fixed |
| F-1-15 metaphorical 404 copy | Both 404 paths use direct address/page language. | Fixed |

Earlier verification defects also remain fixed: the $24 catalogue entry and hosted checkout are live; Vitest passes; hashed assets use immutable caching; all three samples are tested; both checkout catalogue states are tested; and leaving the demo discards its key.

## 7. Structure, links, accessibility, and identity

Passed checks:

- `/`, `/demo`, `/privacy`, `/terms`, `/404.html`, and the unknown-route response have route-appropriate titles, `lang=en`, one h1, one main, descriptions, canonical links, Open Graph/Twitter data, favicon, apple-touch icon, and consistent header/footer navigation.
- Known deep links return 200. An unknown route returns 404. The sitemap lists all four public routes.
- Route navigation moves focus to the new h1 and announces it. Scroll restoration fails under F-2-1.
- Every discovered HTTP link resolved: internal routes and anchors, the GitHub AppImage, the hosted checkout, and Param Factory. `mailto:` links were treated as explicit non-HTTP links.
- Factory `verify-url.sh` returned HTTP 200 with no console errors, one h1, one main, complete alt attributes, and no unlabeled buttons.
- Axe found no serious or critical violations. Its moderate demo-landmark failure is F-2-7; duplicate button names are F-2-6.
- The 390 px pages have no horizontal overflow, focus styling is visible, and reduced motion disables the tile animation.
- The porcelain tiles, cut symbols, glacial palette, serif display type, ruled field, asymmetric panels, and restrained motion form a distinct product-specific identity rather than a generic SaaS template.

## 8. Missed leverage

No additional AI feature is justified. This is a deterministic local safeguard; model inference would add disclosure, network dependency, and cost without improving the confirmation step. Cloud sync would weaken the stated local-first behavior. The app already writes the supported editor configuration directly, so a separate import/export feature is not an obvious missing part of the brief.

## 9. Verification record

- All 16 exact claim commands — PASS individually
- Full `npm test` — 22/22 PASS
- `npm run test:unit` — 6/6 PASS
- `npm run typecheck` — PASS
- `npm run build` — PASS; `dist/app` and `dist/site` produced
- `npm run test:live:site` — PASS under its current serious/critical Axe threshold
- `npm run test:live:billing` — PASS; one $24 product and hosted checkout
- Factory `verify-url.sh` — PASS
- Local/live site JavaScript SHA-256 — exact match: `14fba1e78801849e1548c1440741724e0778cb6362678949ec1ce1b20eef56ec`
- Link crawl — no dead HTTP links

## What would make this perfect

Resolve all nine findings. Preserve scroll positions through Back/Forward, publish signed current installers, align every claim with an observable test, give each sample control a unique name, put the demo banner in a landmark, and make the two remaining action/heading labels exact. Then rerun the entire cold-read, copy, demo, claims, history, routing, accessibility, and link checklist. A PASS requires zero remaining findings.
