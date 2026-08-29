# Adversarial first-read review 1

- Product: Project Color Beacons
- Live URL: https://project-color-beacons.sociobot.in
- Reviewed: 2026-08-29
- Source base: `4683d29581555a181fd4c3a08caf8f7ade96a915`
- Verdict: **FAIL**

The first screen is clear, the declared tests pass, and the sandbox is isolated. The product still fails this round because the one-click mobile demo does not initially show a completed example, unknown routes return HTTP 200, and the copy/claim inventory is not at zero findings.

## 1. Cold first read

I opened `/` in fresh browser contexts at 390 × 844 and 1440 × 900 without scrolling.

| Question | Answer from the first screen | Evidence |
| --- | --- | --- |
| What does this do? | It marks a project before an edit with a color, name, and symbol. | “Mark the project before you edit.” and the supporting sentence |
| For whom? | Dyslexic and ADHD developers working among similar windows. | “For dyslexic and ADHD developers…” |
| What should I click first? | **Try it with sample data**. | It is the first and primary action in both viewports. |

This check passes. The three privacy/offline/price facts are also present in the mobile first viewport. The desktop first viewport contains the third fact at its lower edge.

## 2. Findings

### F-1-1 — BLOCKING — The one-click mobile demo does not show a completed sample result

- Location: live `/demo`, first 390 × 844 viewport after selecting **Try it with sample data**.
- Exact copy: “Choose ‘Check project’ to fill this strip.”
- Evidence: the “Sample projects” section begins around y=630, the empty confirmation strip occupies y=689–790, and only the top of “Atlas API” appears at the bottom. No complete project row, selected beacon, named confirmation, or editor result is initially visible. A visitor must scroll, press **Check project**, and then press a named **Confirm** button before seeing the useful result.
- Why this fails: the demo contract requires the first screen after one click to already show the product being used with realistic sample data. The current first screen explains the next steps but does not demonstrate the outcome.
- Fix: seed the demo with Atlas API already confirmed and its editor-file preview visible, then place that selected strip and at least one complete sample row in the initial 390 px viewport. Reset should restore that same useful seeded state.

### F-1-2 — BLOCKING — Unknown URLs are soft 404s

- Location: `https://project-color-beacons.sociobot.in/definitely-missing-review-1` and `site/public/staticwebapp.config.json`.
- Exact result: the page renders “Page not found — Project Color Beacons” but the HTTP response is `200`.
- Why this fails: crawlers, assistive clients, link checkers, and monitoring cannot distinguish a missing route from a real page. This is broken routing, not a real 404 response.
- Fix: explicitly rewrite the known SPA deep links (`/demo`, `/privacy`, and `/terms`) to `index.html`, allow unknown paths to reach the 404 response override, and verify an unknown URL returns HTTP 404 with the designed body.

### F-1-3 — HIGH — The standalone 404 document does not use the site skeleton

- Location: live `/404.html` and `site/public/404.html`.
- Exact result: it has no meta description, canonical URL, Open Graph data, Twitter card, apple-touch icon, skip link, main navigation, product one-liner, Factory credit, or version/build ID. Its header and footer differ from every SPA route.
- Why this fails: the actual fallback document is not metadata-complete or structurally consistent, even though the JavaScript-rendered soft 404 is.
- Fix: give `404.html` the same skip link, header, footer, metadata, icons, and visual tokens as the other routes while preserving one h1 and a home action.

### F-1-4 — HIGH — The hero makes an unlisted outcome claim

- Location: landing hero.
- Exact quote: “For dyslexic and ADHD developers, a color, name, and symbol make similar windows clear.”
- Why this fails: `three-cues` proves that the cues appear; it does not prove that they make similar windows clear. No `claims.json` entry tests this user outcome.
- Fix: use factual situation copy, such as “For dyslexic and ADHD developers who need distinct cues across similar project windows,” or add a valid user-study claim and test.

### F-1-5 — HIGH — The free-feature claim is broader than its registered test

- Locations: landing pricing and README line 56.
- Exact quotes: “Use every safety and accessibility feature for free.” and “All confirmation, editor, symbol, and color-blind features are free for three projects.”
- Why this fails: `free-project-limit` tests the fourth-project gate and valid-license recovery. It does not inventory or prove that every named feature remains free, and “color-blind features” is not defined elsewhere.
- Fix: replace both with “Color, name, symbol, and confirmation are free for up to three projects,” then extend the tagged entitlement test to exercise those four capabilities, or register a separate entitlement claim.

### F-1-6 — MEDIUM — Reset behavior is a tested observation but an unlisted published claim

- Location: README line 15.
- Exact quote: “Use Reset demo for a clean sample workspace.”
- Why this fails: manual live testing confirmed Reset works, but no entry in `.factory/claims.json` owns this promise. `demo-disposal` checks **Start for real**, not **Reset demo**.
- Fix: add a `demo-reset` claim whose tagged test changes and confirms a sample, presses Reset, and asserts the initial sample state and empty output.

### F-1-7 — MEDIUM — Release-file behavior is claimed outside the claims registry

- Location: README line 50.
- Exact quote: “The workflow publishes `SHA256SUMS` and `latest.json`.”
- Why this fails: a unit test may cover release configuration, but the visitor-facing promise has no `.factory/claims.json` entry and therefore is not part of the mandatory claim run.
- Fix: add a release-manifest claim pointing to the existing unit coverage and assert both files in a generated fixture, or remove this sentence.

### F-1-8 — MEDIUM — Platform-specific download behavior is claimed outside the claims registry

- Location: README line 50.
- Exact quote: “The landing page detects the operating system and resolves a matching asset through the GitHub API.”
- Why this fails: the live verifier checks Linux and unit coverage checks configuration, but no claim entry requires Windows, macOS, and Linux resolution to remain correct.
- Fix: register a `platform-download` claim with user-agent fixtures for all three platforms and matching release assets, or describe only the stable Releases-page fallback.

### F-1-9 — MEDIUM — Published desktop packages are unsigned

- Locations: live download status and README lines 44–52.
- Exact copy: “unsigned build” and “Unsigned apps may show an operating-system warning.”
- Why this matters: a first-time desktop user may stop at an unidentified-publisher or Gatekeeper warning. The current copy is honest, but the install path still carries avoidable trust and completion friction.
- Fix: sign Windows installers and sign/notarize macOS artifacts, publish verification evidence, and remove the bypass instructions once signed packages are live.

### F-1-10 — MINOR — The same cue is called both a shape and a symbol

- Locations: landing hero caption and surrounding copy.
- Exact quotes: “Each project repeats one shape, color, and name.” versus “a color, name, and symbol”.
- Why this fails: “shape” and “symbol” name the same cue. The terminology rule requires one word for one concept.
- Fix: write “Each project repeats one symbol, color, and name.”

### F-1-11 — MINOR — The cue count changes from three to four

- Locations: landing preview/how-it-works copy and demo status.
- Exact quotes: “The confirmation strip repeats all three cues.”, “Match the name, symbol, color, and local path.”, and “Check all four cues.”
- Why this fails: the reader cannot tell whether the path is a beacon cue or a separate safety check.
- Fix: consistently call color, name, and symbol the “three beacon cues,” then say “Check the three beacon cues and the folder path.”

### F-1-12 — MINOR — A section heading does not name the UI being shown

- Location: landing preview section.
- Exact quote: “See the project before the action”
- Why this fails: “the action” is unspecified, so the heading is weak when heard out of context.
- Fix: “Preview the confirmation strip”.

### F-1-13 — MINOR — The privacy heading is a mood line

- Location: landing privacy section.
- Exact quote: “Keep the project in view”
- Why this fails: the heading does not identify privacy or local storage when heard in the page’s heading list.
- Fix: “What stays on your device”.

### F-1-14 — MINOR — “Safe” labels assert mood instead of naming the demo

- Locations: README heading “Try the safe demo” and `/demo` eyebrow “Safe sample workspace”.
- Why this fails: “safe” is a broad adjective; the useful fact is that the workspace uses separate browser storage.
- Fix: use “Try sample projects” and “Separate sample workspace”.

### F-1-15 — MINOR — The 404 uses brand metaphor instead of plain error copy

- Locations: SPA 404 and `404.html`.
- Exact quotes: “404 · marker missing”, “This project marker is not here.”, and “Return to the project shelf.”
- Why this fails: a missing marker and project shelf are product lore, not a direct account of the routing error.
- Fix: use “Page not found”, “This address does not match a page.”, and “Return home”.

## 3. Copy audit

Word counts treat a hyphenated term, path, version, or price as one word. Code blocks are commands rather than sentences. No sentence exceeds 22 words, and no banned marketing word appears.

### Live landing page sentences

| Words | Location | Exact sentence |
| ---: | --- | --- |
| 6 | h1 | Mark the project before you edit. |
| 14 | hero | For dyslexic and ADHD developers, a color, name, and symbol make similar windows clear. |
| 6 | demo note | The demo opens three sample projects. |
| 3 | demo note | Nothing is saved. |
| 9 | fact | Project data stays on your device during normal use. |
| 8 | fact | The demo reloads offline after its first visit. |
| 6 | fact | The free app stores three projects. |
| 9 | hero image alt | Six distinct ceramic shapes sit beside layered window-like panes. |
| 8 | hero caption | Each project repeats one shape, color, and name. |
| 7 | preview | The confirmation strip repeats all three cues. |
| 9 | preview | You press the named button before editor settings change. |
| 11 | steps | The app writes supported settings for VS Code, Cursor, and Zed. |
| 7 | steps | Existing unrelated JSON settings stay in place. |
| 9 | step 1 | Name the project and pick its symbol and color. |
| 8 | step 2 | Match the name, symbol, color, and local path. |
| 9 | step 3 | The app merges the beacon into supported project files. |
| 3 | boundary label | Repeat the cues. |
| 9 | boundary | Every beacon includes a written name, symbol, and color. |
| 3 | boundary label | Confirm the project. |
| 7 | boundary | Editor settings wait for the named confirmation. |
| 3 | boundary label | Keep data local. |
| 9 | boundary | Project data stays on this device during normal use. |
| 8 | pricing | Use every safety and accessibility feature for free. |
| 7 | pricing | A valid license removes the project limit. |
| 3 | license label | Have a license? |
| 6 | license label | Paste it to restore this device. |
| 6 | footer | Mark each project before you edit. |

### Live landing headings, actions, and labels

| Words | Type | Exact text | Result |
| ---: | --- | --- | --- |
| 4 | eyebrow | A local desktop helper | Clear |
| 5 | primary action | Try it with sample data | Clear result; demo entry is one click |
| 3 | action | Download the app | Clear result |
| 6 | h2 | See the project before the action | Flagged F-1-12 |
| 6 | h2 | Set a beacon in three steps | Clear |
| 3 | step heading | Choose a folder | Clear |
| 3 | step heading | Check the strip | Clear |
| 3 | step heading | Write editor settings | Clear |
| 2 | eyebrow | Privacy boundaries | Clear |
| 5 | h2 | Keep the project in view | Flagged F-1-13 |
| 2 | eyebrow | Desktop app | Clear |
| 4 | h2 | Start with three projects | Clear |
| 3 | action | Download for Linux | Clear result |
| 4 | action | Buy a $24 license | Clear result |
| 4 | offer label | $24 one-time · unlimited projects | Clear |
| 2 | action | Verify license | Clear result |
| 12 | footer provenance | Original generated ceramic image · Version 0.1.1 · Build 2026.08.29 | Useful provenance |

### README sentences and text units

| Words | Location | Exact text | Result |
| ---: | --- | --- | --- |
| 12 | line 3 | Mark each project with a color, name, and symbol before you edit. | Clear |
| 14 | line 5 | Project Color Beacons is a local desktop helper for developers who juggle similar windows. | Clear |
| 13 | line 5 | It gives each project folder a stable beacon and a named confirmation strip. | Clear |
| 12 | line 5 | The app writes supported per-project settings for VS Code, Cursor, and Zed. | Clear |
| 7 | line 5 | Existing unrelated JSON settings stay in place. | Clear |
| 4 | heading | Try the safe demo | Flagged F-1-14 |
| 9 | line 9 | Open `/demo` or run the site locally and visit: | Clear |
| 10 | line 15 | The demo includes Atlas API, Northwind Store, and Launch Docs. | Covered claim |
| 9 | line 15 | It writes only to a `demo:` browser storage key. | Covered claim |
| 8 | line 15 | Use **Reset demo** for a clean sample workspace. | Flagged F-1-6 |
| 1 | heading | Develop | Clear |
| 12 | line 19 | Requirements: Node 22, npm, Rust stable, and the Tauri 2 system dependencies. | Clear for developers |
| 3 | heading | Test and build | Clear |
| 16 | line 38 | `npm run build` creates desktop assets in `dist/app` and the deployable site in `dist/site`. | Clear |
| 17 | line 38 | The static deploy command is `npm ci && npm run build:site` with `dist/site` as its output. | Clear |
| 11 | line 40 | The Playwright suite checks every published claim in `.factory/claims.json`. | Confirmed |
| 12 | line 40 | It also checks routes, accessibility, offline reload, mobile width, and console errors. | Confirmed |
| 3 | heading | Install and release | Clear |
| 11 | line 44 | GitHub Actions builds unsigned packages when a `v*` tag is pushed: | Clear; unsigned gap is F-1-9 |
| 7 | list | macOS: Intel and Apple silicon disk images | Clear |
| 5 | list | Windows: MSI or executable installer | Clear |
| 5 | list | Linux: AppImage and Debian package | Clear |
| 7 | line 50 | The workflow publishes `SHA256SUMS` and `latest.json`. | Flagged F-1-7 |
| 16 | line 50 | The landing page detects the operating system and resolves a matching asset through the GitHub API. | Flagged F-1-8 |
| 12 | line 50 | Until the first release is published, it links to the Releases page. | Clear fallback description |
| 7 | line 52 | Unsigned apps may show an operating-system warning. | Clear warning; gap is F-1-9 |
| 8 | line 52 | On macOS, right-click the app and choose **Open**. | Clear |
| 8 | line 52 | On Windows, review the publisher warning before installation. | Clear |
| 3 | heading | Price and privacy | Clear |
| 12 | line 56 | All confirmation, editor, symbol, and color-blind features are free for three projects. | Flagged F-1-5 |
| 7 | line 56 | A valid license removes the project limit. | Covered claim |
| 15 | line 56 | The site shows a purchase link only when the Sociobot catalogue has an active checkout. | Covered claim |
| 13 | line 58 | Project names, local paths, and settings stay on the device during normal use. | Covered claim |
| 13 | line 58 | A license check sends only the pasted license value to `api.sociobot.in`. | Covered claim |
| 9 | line 58 | Read the shipped `/privacy` and `/terms` pages for details. | Clear |
| 2 | heading | Project layout | Clear |
| 6 | list | `app/` — Vite and TypeScript desktop interface | Clear |
| 7 | list | `src-tauri/` — Rust folder validation and editor-file merge | Clear |
| 8 | list | `site/` — landing, demo, legal pages, service worker, installers | Clear |
| 7 | list | `shared/` — beacon data and shared visual tokens | Clear |
| 6 | list | `tests/` — Playwright claim and accessibility checks | Clear |
| 9 | list | `.factory/` — brief, design, claims, demo, copy audit, and handoff | Clear |
| 5 | line 69 | Licensed under the MIT License. | Clear |

## 4. Demo and sandbox evidence

- The landing action reaches `/demo` in one click.
- The sample data is realistic: Atlas API, Northwind Store, and Launch Docs, with local-looking paths and distinct cues.
- The persistent banner, **Reset demo**, and **Start for real** are present.
- Selecting Northwind Store wrote only `demo:pcb:site-state`; a pre-seeded `pcb:projects` sentinel remained byte-for-byte unchanged.
- Reset restored the empty confirmation strip and reported “Demo reset to three sample projects.”
- A fresh direct live `/demo` flow requested only the document, same-origin JS, same-origin CSS, and favicon. The only localStorage key was `demo:pcb:site-state`.
- `npm run test:live:site` confirmed Start for real disposal and offline reload.

Isolation passes. Initial demo usefulness fails under F-1-1.

## 5. Claims

I cloned the repository into a fresh temporary directory, ran `npm ci`, and then ran every exact command from `.factory/claims.json` separately.

| Claim ID | Result | Observable coverage |
| --- | --- | --- |
| `three-cues` | PASS | All three sample projects and confirmation strip |
| `confirmation-before-write` | PASS | No output before named confirmation; VS Code/Zed output after |
| `demo-isolated` | PASS | Demo namespace and no outside requests |
| `demo-disposal` | PASS | Site and desktop-shaped demo keys removed on exit |
| `offline-reload` | PASS | Reload after context goes offline |
| `free-project-limit` | PASS | Fourth-project gate and valid-license recovery |
| `settings-preserved` | PASS | Rust JSON merge fixture |
| `editor-settings` | PASS | VS Code/Cursor and Zed files |
| `project-data-local` | PASS | Desktop-shaped sample flow has no outside request |
| `license-token-only` | PASS | Verification URL contains only fixture token; no body |
| `checkout-availability` | PASS | Matching and mismatched catalogue responses |

No listed claim test failed. F-1-4 through F-1-8 identify published claims that are missing from the registry or exceed their current test.

## 6. Earlier finding regression check

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files. I read the existing handoff and all four verification reports and rechecked every prior defect.

| Earlier defect | Live/code recheck | Result |
| --- | --- | --- |
| Paid checkout missing | Live catalogue has one matching $24 product; checkout resolves to a hosted page; `test:live:billing` passes. | Fixed |
| `npm run test:unit` collected Playwright tests | Fresh clone: 4/4 Vitest tests pass. | Fixed |
| Old unlisted privacy/editor claims | Old phrases are removed; current registered privacy/editor tests pass. New unlisted copy is reported separately above. | Fixed, no regression of the old text |
| Hashed assets cached for 30 seconds | Live JS/CSS return `public, max-age=31536000, immutable`. | Fixed |
| `three-cues` checked only Atlas | Test source loops through Atlas API, Northwind Store, and Launch Docs. | Fixed |
| Checkout test covered only unavailable state | Test source covers mismatched and active matching catalogue states. | Fixed |
| Leaving demo retained sample state | Live suite and `demo-disposal` confirm site and desktop demo keys are removed. | Fixed |

## 7. Structure, accessibility, and links

Passed checks:

- `/`, `/demo`, `/privacy`, and `/terms` have route-specific titles, one h1, one main, `lang=en`, meta descriptions, canonical links, Open Graph/Twitter data, favicon, apple-touch icon, and consistent SPA header/footer.
- Direct deep links work. History navigation restores the prior route, updates h1 focus, and retains a nonzero prior-page scroll position.
- All discovered internal routes, image/icon assets, GitHub Releases links, the checkout boundary, and the Factory link resolved successfully. Mail links were treated as explicit non-HTTP links.
- `robots.txt` and `sitemap.xml` are present; the sitemap lists all four public routes.
- Factory `verify-url.sh` passed with no console errors, one h1, one main, complete image alt attributes, and no unlabeled buttons.
- The Playwright Axe integration reported no serious or critical violations on all routes.
- The 390 px layouts have no horizontal overflow, keyboard focus is a visible 3 px outline, reduced motion is respected, and no route logged a console/page error.
- The ceramic-tile art, typography, ruled background, asymmetric panels, palette, and motion form a distinct product-specific identity rather than a generic SaaS template.

Failures are F-1-2, F-1-3, and F-1-15.

## 8. Missed leverage

No additional AI feature is justified. The job is a deterministic, local project-identity safeguard; model inference would add latency, cost, and disclosure without improving the core confirmation step. Cloud sync would weaken the local-first privacy model. Import/export is not clearly implied because the app writes supported editor configuration directly. No finding is raised here.

## 9. Verification commands

- Every one of the 11 exact claim commands — PASS
- `npm test` — 14/14 PASS
- `npm run test:unit` — 4/4 PASS
- `npm run typecheck` — PASS
- `npm run build` — PASS; produced `dist/app` and `dist/site`
- `npm run test:live:site` — PASS
- `npm run test:live:billing` — PASS
- `/opt/fleet/lib/verify-url.sh https://project-color-beacons.sociobot.in <temp-dir>` — PASS
- Link crawl — no dead links among discovered HTTP links

## What would make this perfect

Resolve all 15 findings: make the mobile demo open on a complete, useful sample result; return a real 404 with a fully structured fallback page; register or narrow every published claim; sign desktop packages; and replace the remaining inconsistent, vague, subjective, or metaphorical copy. Then rerun this entire review from a fresh browser and clean clone. A pass requires zero remaining findings and no untested claim.
