# Polish round 4 — complete finding map

Scope: released candidate `5ab7ae5cb31ee9a07568945c73803ceeeb82d187`,
review report `31a2b61771bd0920c0baecee6ace96d6ea940ccb`, every earlier
review and polish report, and repair commits `db35e4933b73d11052af84461192c43b77a73d9d`,
`a500849268c86715715cbd1ecdb676f67afff524`, and
`fa186752248d506c66b89a00093eeb8525e8e160`.

The repair is deployed at <https://project-color-beacons.sociobot.in>.
Evidence screenshots and the live summary are in `.factory/evidence/polish-4/`.
All 19 claim commands passed separately from clean clone
`/tmp/project-color-beacons-clean.QmZ7oa`, then the full 34-test suite passed.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | `/demo` and `?demo=1` open a completed Atlas API sample in one click, with the persistent demo banner, reset, and exit actions. | `@claim:demo-reset`, `@claim:confirmation-before-write`; `.factory/evidence/polish-4/demo-mobile.webp`; live `/demo`. |
| F-1-2 | Unknown addresses return the standalone product 404 with HTTP 404. | `routes have accessible structure`; `.factory/evidence/polish-4/not-found.webp`; live `/not-a-page` returned 404. |
| F-1-3 | The standalone 404 has its own title, metadata, canonical, header, main, footer, legal links, and build identity. | `the landing page and both 404 responses use the same generated build identity`; live `/404.html`. |
| F-1-4 | The first-screen statement is factual and audience-specific, with no unproved outcome language. | `.factory/copy-audit.md`; `@claim:three-cues`; `.factory/evidence/polish-4/home-mobile.webp`. |
| F-1-5 | Free copy names only color, name, symbol, and confirmation for three projects. | `@claim:free-project-limit`; live `/#download` and `/terms`. |
| F-1-6 | Reset demo is registered and tested as an observable claim. | `@claim:demo-reset`; live `/demo`. |
| F-1-7 | The release manifest claim checks real checksum and per-platform entries. | `@claim:release-manifest`; `npm run test:release`. |
| F-1-8 | Platform detection links only a matching complete package after its required trust checks pass. | `@claim:platform-download`; `.factory/evidence/polish-4/windows-download-gate.webp`; live `/#download`. |
| F-1-9 | The workflow refuses unsigned Windows/macOS publication; site and installers withhold those packages. | `@claim:platform-signatures`; `sh -n site/public/install.sh`; Windows/macOS gate screenshots. |
| F-1-10 | “Symbol” is the single term for the visual cue. | `.factory/copy-audit.md`; `@claim:three-cues`; live `/`. |
| F-1-11 | The copy defines exactly three beacon cues and keeps the folder path separate. | `@claim:three-cues`; `.factory/copy-audit.md`; live `/demo`. |
| F-1-12 | The section heading is “Preview the confirmation strip.” | `.factory/copy-audit.md`; `.factory/evidence/polish-4/home-mobile.webp`. |
| F-1-13 | The privacy heading is “What stays on your device.” | `.factory/copy-audit.md`; live `/`. |
| F-1-14 | Demo language says “Separate sample workspace” and makes the storage boundary explicit. | `@claim:demo-isolated`; `.factory/evidence/polish-4/demo-mobile.webp`. |
| F-1-15 | Both 404 paths use direct not-found wording and a Return home action. | `routes have accessible structure`; `.factory/evidence/polish-4/not-found.webp`. |
| F-2-1 | History state stores scroll per entry, restores it deterministically, focuses h1, and announces route changes. Route transitions suppress stale scroll events. | `SPA Back and Forward restore focus and each history entry scroll position` passed 20 repeats and the clean full suite; `npm run test:live:site`. |
| F-2-2 | No product-controlled path exposes unsigned Windows or macOS installers or checkout. | `@claim:platform-download`, `@claim:checkout-availability`; platform gate screenshots; live cold user-agent checks. |
| F-2-3 | Saved color, name, and symbol survive a fresh app page. | `@claim:beacon-stability`. |
| F-2-4 | Documentation distinguishes GitHub provenance, Authenticode, Apple signing, and notarization. | `@claim:release-signing`, `@claim:platform-signatures`; README. |
| F-2-5 | Copy promises only that a valid license removes the project limit. | `@claim:desktop-license-recovery`; live `/terms`. |
| F-2-6 | Each sample control includes its project name. | `demo project controls have unique accessible names`; live `/demo`. |
| F-2-7 | The demo status is a named complementary landmark. | Live Axe route suite; `.factory/evidence/polish-4/demo-mobile.webp`. |
| F-2-8 | The secondary first-screen action says “View downloads.” | `.factory/copy-audit.md`; `.factory/evidence/polish-4/home-mobile.webp`. |
| F-2-9 | Step 2 says “Check the confirmation strip.” | `.factory/copy-audit.md`; live `/`. |
| F-3-1 | Windows now requires verified Authenticode; macOS requires Apple signing and notarization. Historical unsigned packages and sales are withheld. | `@claim:platform-signatures`, `@claim:platform-download`, `@claim:checkout-availability`; both platform gate screenshots. |
| F-3-2 | `404.html` is generated from the shared version and build values. | `the landing page and both 404 responses use the same generated build identity`; live `/404.html`. |
| F-3-3 | A recorded Sigstore bundle is cryptographically checked against package, repository, workflow, commit, and tag. | `@claim:release-signing`; `npm run test:release`. |
| F-3-4 | The platform claim rejects each missing package and metadata class, plus unsigned platform states. | `@claim:platform-download` from the clean clone. |
| F-3-5 | Platform trust records reject false or missing provenance, Authenticode, Apple signing, and notarization. | `@claim:platform-signatures`; release workflow hard-gate test. |
| F-3-6 | The 390 × 844 first screen states “Three projects are free; unlimited projects cost $24 once.” | `landing fits a 390 pixel screen and its first action works`; `.factory/evidence/polish-4/home-mobile.webp`. |
| F-3-7 | Release documentation uses plain descriptions of what GitHub and each operating system verify. | `.factory/copy-audit.md`; README; `@claim:release-signing`. |
| F-4-1 | Download, install-script, workflow, and purchase gates now fail closed on the real unsigned v0.1.5 Windows/macOS state. | Live Windows and macOS screenshots; `npm run test:release` reports both withheld and Linux installable; live suite confirms no links. |
| F-4-2 | Removed website “restore this device” verification and storage. Checkout returns expose a one-session copy action, then direct the buyer to the desktop License dialog. | `@claim:desktop-license-recovery`; `.factory/evidence/polish-4/checkout-return.webp`; live `/?license=fixture` stores nothing and sends no verify request. |
| F-4-3 | Replaced “CORS-safe” with “GitHub’s browser-accessible API.” | README; banned-word scan; `.factory/copy-audit.md`. |

## Final evidence

- Clean clone: all 19 exact `.factory/claims.json` commands passed; `npm test` passed 34/34; unit tests passed 7/7.
- Native: Rust tests passed 2/2; Tauri produced `Project Color Beacons_0.1.5_amd64.deb`.
- Release audit: v0.1.5 checksum, manifest, provenance, and platform records passed; Linux is installable; unsigned Windows/macOS are withheld.
- Live: route, Axe, keyboard, mobile, history, privacy, offline, demo-disposal, billing, download-gate, and license-handoff checks passed.
- Mobile Lighthouse: 99 performance; 100 accessibility, best practices, and SEO; LCP 1.7 s; CLS 0.

No review finding remains open. Publishing Windows and macOS downloads requires
the owner certificates listed in `.factory/handoff.md`; until then, those links
and their purchase access remain unavailable by design.
