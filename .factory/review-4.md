# Adversarial first-read review 4

- Product: Project Color Beacons
- Live URL: <https://project-color-beacons.sociobot.in>
- Reviewed: 2026-08-30
- Source base: `51677ee65b12e8a264abb86d4c759b3ba8d52fe9`
- Verdict: **FAIL**

The landing screen and demo are clear and immediately usable. The product fails because it again sells and links directly to unsigned Windows and macOS desktop packages, reopening the prior blocking release-trust finding. The landing-page license field also promises to restore the device but only checks a key in the website's separate browser storage.

## 1. Cold first read

I opened `/` in new browser contexts at 390 × 844 and 1440 × 900. I did not scroll before answering.

| Question | Answer in my own words | First-screen evidence |
| --- | --- | --- |
| What does this do? | It marks a project with a color, name, and symbol before I edit it. | “Mark the project before you edit.” |
| For whom? | Dyslexic and ADHD developers with similar project windows. | “For dyslexic and ADHD developers who need distinct cues across similar project windows.” |
| What should I click first? | **Try it with sample data**. | It is the primary button in both viewports and says what opens. |

This check passes. At 390 px the first viewport also contains the local-data, offline-demo, and exact $24 price facts. The page has no horizontal overflow.

## 2. Findings

### F-4-1 — BLOCKING — Unsigned Windows and macOS packages are linked and sold again

- Historical finding: regression of `F-3-1` (also `F-2-2` and `F-1-9`). Polish round 3 closed that history by withholding every unsigned package link.
- Location: live landing download section under Windows and macOS user agents; live release `v0.1.5` `platform-signatures.json`.
- Exact live Windows text: “Download for Windows” and “v0.1.5 · Project.Color.Beacons_0.1.5_x64-setup.exe · verified package origin · unsigned; your system may show a warning”.
- Exact live macOS text: “Download for macOS” and “v0.1.5 · Project.Color.Beacons_0.1.5_aarch64.dmg · verified package origin · unsigned; your system may show a warning”. Both contexts also expose **Buy a $24 license**.
- Evidence: the linked release record declares `windows.authenticodeVerified: false`, `macOS.codeSigned: false`, and `macOS.notarized: false`. The landing source deliberately makes those packages installable when GitHub provenance passes.
- Why this fails: the prior blocking review required a safe resolution to the unsigned-package exposure. The intervening repair made the product fail closed: no untrusted package could be linked, bought, or installed. The current deployment reverses that protection. An honest warning does not make an unidentified-publisher or Gatekeeper bypass a completed, trusted desktop-install experience.
- Concrete fix: publish and independently verify Windows Authenticode signatures plus Apple signing and notarization before restoring those links and the purchase offer. If owner certificates remain unavailable, remove the Windows/macOS download `href`s and purchase offer as Polish 3 did, while retaining the browser demo.

### F-4-2 — HIGH — The landing license field promises restoration but only verifies a website-local key

- Location: live landing download section and `site/src/main.ts` (`verifySiteLicense`).
- Exact label: “Have a license? Paste it to restore this device.”
- Observed result after a mocked valid key: “License verified. Paste the same key into the desktop app.” The page stores `sb_license:project-color-beacons` and `pcb:license-verdict` under the website origin; it does not change the installed desktop app or its separate local storage.
- Why this fails: a paid visitor is told that pasting a key into this field restores the device, then is told to paste it elsewhere. The result is neither the named result nor an unlocked desktop app. The assertion is also absent from `claims.json`: `license-token-only` proves request minimisation, while `free-project-limit` proves the desktop dialog, not this landing control.
- Concrete fix: remove this web field and state “In the desktop app, choose License and paste your key,” or implement a verified handoff that actually unlocks the installed app. Register a claim that proves the chosen end-to-end recovery path from a fresh desktop profile.

### F-4-3 — MINOR — README uses unexplained browser-security jargon

- Location: `README.md`, Install and release.
- Exact sentence: “The landing page detects the operating system and reads release metadata from the CORS-safe GitHub API.”
- Why this fails: “CORS-safe” is an implementation term that gives a first-time reader no usable information. The plain-words rule applies to README copy as well.
- Concrete rewrite: “The landing page detects the operating system and reads release details from GitHub's browser-accessible API.”

## 3. Copy audit

Hyphenated terms, paths, versions, prices, and code/file names count as one word. No listed sentence exceeds 22 words. The only copy finding is `F-4-3`; all landing headings name their sections, terminology is consistent, and buttons name their results except for the false restoration promise in `F-4-2`.

### Landing page sentences

| Words | Location | Sentence | Review |
| ---: | --- | --- | --- |
| 6 | h1 | Mark the project before you edit. | Clear |
| 13 | hero | For dyslexic and ADHD developers who need distinct cues across similar project windows. | Clear |
| 6 | action note | The demo opens a completed sample. | Covered by demo reset/disposal behavior |
| 3 | action note | Nothing is saved. | `demo-isolated` |
| 9 | fact | Project data stays on your device during normal use. | `project-data-local` |
| 8 | fact | The demo reloads offline after its first visit. | `offline-reload` |
| 9 | fact | Three projects are free; unlimited projects cost $24 once. | `free-project-limit`, `checkout-availability` |
| 9 | hero image alternative | Six distinct ceramic symbols sit beside layered window-like panes. | Descriptive alt text |
| 8 | hero caption | Each project repeats one symbol, color, and name. | `three-cues` |
| 7 | preview | The strip repeats the three beacon cues. | `three-cues` |
| 9 | preview | You press the named button before editor settings change. | `confirmation-before-write` |
| 11 | how it works | The app writes supported settings for VS Code, Cursor, and Zed. | `editor-settings` |
| 7 | how it works | Existing unrelated JSON settings stay in place. | `settings-preserved` |
| 9 | step 1 | Name the project and pick its symbol and color. | Usable instruction |
| 9 | step 2 | Check the three beacon cues and the folder path. | Usable instruction |
| 9 | step 3 | The app merges the beacon into supported project files. | `editor-settings` |
| 3 | privacy label | Repeat the cues. | Clear |
| 9 | privacy | Every beacon includes a written name, symbol, and color. | `three-cues` |
| 3 | privacy label | Confirm the project. | Clear |
| 7 | privacy | Editor settings wait for the named confirmation. | `confirmation-before-write` |
| 3 | privacy label | Keep data local. | Clear |
| 9 | privacy | Project data stays on this device during normal use. | `project-data-local` |
| 12 | pricing | Color, name, symbol, and confirmation are free for up to three projects. | `free-project-limit` |
| 7 | pricing | A valid license removes the project limit. | `free-project-limit` |
| 12 | live Windows/macOS release status | v0.1.5 · [package] · verified package origin · unsigned; your system may show a warning. | `F-4-1` |
| 10 | purchase state | License purchases open with a verified package for this platform. | `checkout-availability` |
| 4 | purchase detail | $24 one-time · unlimited projects. | `checkout-availability` |
| 5 | unavailable purchase state | License purchases are being prepared. | Plain status |
| 6 | unavailable purchase state | The free app stores three projects. | `free-project-limit` |
| 3 | license label | Have a license? | `F-4-2` context |
| 6 | license label | Paste it to restore this device. | `F-4-2` |
| 6 | footer | Mark each project before you edit. | Clear |

Landing headings/actions checked: **A local desktop helper**, **Try it with sample data**, **View downloads**, **Preview the confirmation strip**, **Set a beacon in three steps**, **Choose a folder**, **Check the confirmation strip**, **Write editor settings**, **Privacy boundaries**, **What stays on your device**, **Desktop app**, **Start with three projects**, **Download for [platform]**, **Buy a $24 license**, and **Verify license**. They are plain and result-naming; the field label in `F-4-2` is the exception.

### README sentences and text units

| Words | Location | Sentence or text unit | Review |
| ---: | --- | --- | --- |
| 12 | introduction | Mark each project with a color, name, and symbol before you edit. | Clear |
| 14 | introduction | Project Color Beacons is a local desktop helper for developers who juggle similar windows. | Clear |
| 13 | introduction | It keeps each saved project's color, name, and symbol after a restart. | `beacon-stability` |
| 12 | introduction | The app writes supported per-project settings for VS Code, Cursor, and Zed. | `editor-settings` |
| 7 | introduction | Existing unrelated JSON settings stay in place. | `settings-preserved` |
| 9 | sample projects | Open `/demo` or run the site locally and visit: | Clear instruction |
| 12 | sample projects | The demo opens with Atlas API confirmed and its editor-file preview ready. | Demo reset/disposal coverage |
| 8 | sample projects | It also includes Northwind Store and Launch Docs. | `three-cues` |
| 9 | sample projects | It writes only to a `demo:` browser storage key. | `demo-isolated` |
| 8 | sample projects | Use **Reset demo** to restore that completed sample. | `demo-reset` |
| 12 | develop | Requirements: Node 22, npm, Rust stable, and the Tauri 2 system dependencies. | Appropriate developer prerequisite |
| 14 | test and build | `npm run build` creates desktop assets in `dist/app` and the deployable site in `dist/site`. | Verified |
| 16 | test and build | The static deploy command is `npm ci && npm run build:site` with `dist/site` as its output. | Clear instruction |
| 9 | test and build | The Playwright suite checks every published claim in `.factory/claims.json`. | Verified |
| 12 | test and build | It also checks routes, accessibility, offline reload, mobile width, and console errors. | Verified |
| 12 | install and release | The release workflow targets these packages when a `v*` tag is pushed: | `release-matrix` |
| 7 | package item | macOS: Intel and Apple silicon disk images | `release-matrix` |
| 5 | package item | Windows: MSI or executable installer | `release-matrix` |
| 5 | package item | Linux: AppImage and Debian package | `release-matrix` |
| 13 | install and release | The workflow publishes `SHA256SUMS`, `latest.json`, a platform-status record, and a GitHub provenance file. | `release-manifest`, `release-signing` |
| 12 | install and release | GitHub records the repository, workflow, commit, tag, and checksum for every package. | `release-signing` |
| 16 | install and release | The landing page detects the operating system and reads release metadata from the CORS-safe GitHub API. | `F-4-3` |
| 14 | install and release | Every platform requires verified GitHub provenance and a complete release before its download appears. | `platform-download` |
| 7 | install and release | The release records missing owner certificates honestly. | `platform-signatures` |
| 11 | install and release | Unsigned Windows and macOS packages remain available with an operating-system warning. | `F-4-1` |
| 8 | install and release | After publishing a release, run these independent checks. | Clear instruction |
| 12 | install and release | The first checks release files, checksums, the manifest, and GitHub's package-origin record. | Clear instruction |
| 10 | install and release | The second checks a downloaded package against the repository identity. | Clear instruction |
| 7 | install and release | Windows and macOS signing need owner certificates. | Clear constraint |
| 12 | install and release | The release status and landing page disclose when those signatures are unavailable. | `platform-signatures` |
| 12 | price and privacy | Color, name, symbol, and confirmation are free for up to three projects. | `free-project-limit` |
| 7 | price and privacy | A valid license removes the project limit. | `free-project-limit` |
| 20 | price and privacy | The site shows a purchase link only when checkout is active and a verified package exists for the visitor's platform. | `checkout-availability` |
| 13 | price and privacy | Project names, local paths, and settings stay on the device during normal use. | `project-data-local` |
| 11 | price and privacy | A license check sends only the pasted license value to `api.sociobot.in`. | `license-token-only` |
| 9 | price and privacy | Read the shipped `/privacy` and `/terms` pages for details. | Clear instruction |
| 5 | license | Licensed under the MIT License. | Confirmed |

README headings are descriptive: **Try sample projects**, **Develop**, **Test and build**, **Install and release**, **Price and privacy**, and **Project layout**. The release file names are necessary technical names; `F-4-3` is the one unexplained jargon term.

## 4. Demo and sandbox

- The landing action opens `/demo` in one click.
- At 390 × 844 the initial demo viewport includes the persistent “Demo — sample data, nothing is saved” banner, confirmed Atlas API strip, editor-file result, and a complete Atlas API row.
- The three realistic samples are Atlas API, Northwind Store, and Launch Docs. Their local-looking paths, colors, names, symbols, and editor selections are visible.
- The banner offers **Reset demo** and **Start for real**. Reset restores confirmed Atlas API and three samples. Start for real removes `demo:pcb:site-state` before leaving.
- Fresh direct `/demo` request logs contained only same-origin document, JS, CSS, and favicon requests. The only storage written was `demo:pcb:site-state`; no `pcb:projects` key was created. The offline reload also worked after service-worker activation.
- The desktop-shaped `?demo=1` interface uses its separate `demo:pcb:projects` namespace. The full browser suite verifies a real-storage sentinel remains unchanged.

Demo behavior passes; no sample data was observed leaving the browser. The landing page separately calls the GitHub release API and Sociobot product catalogue without project data.

## 5. Claims and verification

I cloned the current repository into a new temporary directory, ran `npm ci`, and ran every exact command listed in `.factory/claims.json`. All 18 claim tags passed. A subsequent complete Playwright run passed 33/33, including every registered tag.

| Claim ID | Result |
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

Additional clean-clone checks passed: `npm test` (33/33), `npm run test:unit` (7/7), `npm run typecheck`, and `npm run build`. The site production JavaScript is 23.03 KB raw / 8.15 KB gzip.

The passed tests do not remove `F-4-1`: `platform-signatures` intentionally treats source-provenance-verified but OS-unsigned packages as installable. They also do not prove the restoration promise in `F-4-2`.

## 6. Earlier finding regression check

I read every earlier `review-*.md`, `polish-*.md`, and the handoff. Live and source checks confirm the following:

| Earlier finding(s) | Current result |
| --- | --- |
| F-1-1 | Fixed: direct demo starts with a completed Atlas result and visible row at 390 px. |
| F-1-2 | Fixed: an unknown live URL returned HTTP 404 with the designed page. |
| F-1-3, F-3-2 | Fixed: `/404.html` and an unknown URL use shared metadata/header/footer and current build identity. |
| F-1-4 through F-1-8 | Fixed: unproved outcome copy is gone; entitlement, reset, manifest, and platform claims are registered and tested. |
| F-1-10 through F-1-15 | Fixed: symbol terminology, cue count, headings, demo wording, and 404 wording remain clear. |
| F-2-1 | Fixed: back/forward restores scroll, moves focus to the h1, and announces the route. |
| F-2-3 through F-2-9 | Fixed: persistence is registered; no multi-device entitlement remains; controls have unique names; the demo banner is a named landmark; labels are clear. |
| F-3-3 through F-3-7 | Fixed: provenance test is cryptographic, package completeness/signature status are registered, the $24 fact is above the fold, and release wording is plainer. |
| F-1-9, F-2-2, F-3-1 | **Regressed — reopened as F-4-1.** Current Windows and macOS links and purchase offer expose packages with false Authenticode/code-sign/notarization states. |

## 7. Structure, accessibility, links, and identity

- `/`, `/demo`, `/privacy`, `/terms`, and `/404.html` returned 200; an unknown route returned 404. Their titles, language, one h1, main landmark, descriptions, canonical URLs, Open Graph/Twitter tags, favicon, apple-touch icon, headers, and footers checked out.
- Internal routes, the current GitHub package URL, hosted checkout, Param Factory link, and mailto links were crawled. No dead link was found.
- The complete Axe suite passed without violations. Keyboard focus, 44 px touch targets, 200% text reflow, and reduced-motion behavior passed. No live page console errors were observed.
- The porcelain tiles, cut symbols, ruled frost field, glacial palette, serif display face, asymmetric ceramic panels, and original generated still-life art are distinct and fit the documented visual direction; this is not a generic SaaS template.

## 8. Missed leverage

No AI feature is justified: the core safety step is deterministic and local, while inference would add network disclosure and cost. Cloud sync would conflict with the local-first privacy boundary. The existing editor-setting write is the directly useful integration implied by the brief; import/export is not an obvious missing requirement for a small local set of project markers.

## What would make this perfect

Publish verified OS-signed Windows and signed/notarized macOS packages, or fail closed until they exist. Make the license restoration path truthful and end-to-end, then remove the CORS jargon from the README. Re-run this complete cold-read, demo, claim, history, accessibility, routing, and link review. Only zero findings merits PASS.
