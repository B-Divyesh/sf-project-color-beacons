# Polish round 3 — complete finding map

Scope: candidate `c1cde2049563e449f8c58742bfbc2cf370c4c24e`, all
`.factory/review-*.md` and `.factory/polish-*.md`, with review report
`519be82584423a7fb5ba4a0889ccee0459988045`. Repair code is
`52090c8104b07f86667fb6ba474aa6c3dc5931da`; static deployment is
<https://project-color-beacons.sociobot.in>.

The browser proof below is from a cold live check after deployment. Its
screenshots are in `evidence/polish-3/`; `npm run test:live:site` includes
zero-violation Playwright Axe checks on `/`, `/demo`, `/privacy`, `/terms`,
`/404.html`, and an unknown route. All 18 exact commands in
`.factory/claims.json` passed separately from a clean checkout, followed by
the complete 32-test browser suite.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Direct `/demo` and `?demo=1` seed confirmed Atlas API, editor-file output, and the full first sample row; reset restores that state. | `@claim:demo-reset`; `@claim:confirmation-before-write`; `evidence/polish-3/live-demo-query-mobile.png`; live `/?demo=1`. |
| F-1-2 | Explicit route handling plus the SWA response override make unknown addresses real 404 responses. | Live-route suite; `evidence/polish-3/live-404-desktop.png`; live `/missing-live-screenshot` returned HTTP 404. |
| F-1-3 | The generated standalone 404 uses the shared header, skip link, navigation, footer, metadata, and current build identity. | `tests/unit/release-config.test.ts`; live-route suite; live `/404.html`. |
| F-1-4 | Replaced the unproved outcome wording with factual audience and cue wording. | `.factory/copy-audit.md`; `@claim:three-cues`; live `/`. |
| F-1-5 | Limits free copy to the four exercised capabilities and three projects. | `@claim:free-project-limit`; live `/#download` and `/terms`. |
| F-1-6 | Registered and proved Reset demo as an observable claim. | `@claim:demo-reset`; live `/?demo=1`. |
| F-1-7 | Registered manifest generation and tests its actual outputs. | `@claim:release-manifest`. |
| F-1-8 | Requires matching platform asset plus every release record before a link can appear. | `@claim:platform-download`; `evidence/polish-3/live-download-gate-desktop.png`; live `/#download`. |
| F-1-9 | The workflow now hard-fails without real platform credentials and the site/installers refuse historical unsigned packages. | `@claim:platform-download`; `@claim:platform-signatures`; `sh -n site/public/install.sh`; live gate has no `href`. |
| F-1-10 | Uses **symbol** consistently for the visual cue. | `.factory/copy-audit.md`; `@claim:three-cues`; live `/`. |
| F-1-11 | Defines exactly three beacon cues—color, name, symbol—and keeps the folder path separate. | `.factory/copy-audit.md`; `@claim:three-cues`; live `/?demo=1`. |
| F-1-12 | Names the preview section “Preview the confirmation strip.” | `.factory/copy-audit.md`; `evidence/polish-3/live-landing-mobile-first-screen.png`; live `/`. |
| F-1-13 | Names the privacy section “What stays on your device.” | `.factory/copy-audit.md`; live `/`. |
| F-1-14 | Uses “Separate sample workspace” and the direct demo banner instead of subjective safety language. | `.factory/copy-audit.md`; `@claim:demo-isolated`; live `/?demo=1`. |
| F-1-15 | Uses direct not-found wording and a return-home action. | Live-route suite; `evidence/polish-3/live-404-desktop.png`; live unknown route. |
| F-2-1 | Stores scroll per history entry, restores it after render, moves focus to h1, and announces route changes. | `SPA Back and Forward restore focus and each history entry scroll position`; `npm run test:live:site`. |
| F-2-2 | Removed every product-controlled path to unsigned downloads; a release must pass the full verified-release contract. | `@claim:platform-download`; `@claim:platform-signatures`; live `/#download` has no link. |
| F-2-3 | Registered beacon persistence and proves all three values survive reopening. | `@claim:beacon-stability`; `.factory/claims.json`. |
| F-2-4 | Replaced broad signing language with the exact verified-release requirements and cryptographic provenance test. | `@claim:release-signing`; README; `@claim:platform-signatures`. |
| F-2-5 | Removes the multi-device entitlement promise; a valid license removes only the project limit. | `@claim:free-project-limit`; live `/terms`. |
| F-2-6 | Gives sample controls unique target names, for example “Check Northwind Store.” | `demo project controls have unique accessible names`; `npm run test:live:site`; live `/demo`. |
| F-2-7 | Makes the persistent demo status a named complementary landmark. | Live route/Axe suite; live `/demo`. |
| F-2-8 | Says “View downloads” for the in-page secondary action. | `.factory/copy-audit.md`; live `/`. |
| F-2-9 | Says “Check the confirmation strip” for step 2. | `.factory/copy-audit.md`; live `/`. |
| F-3-1 | Closes the unsafe exposure: untrusted existing packages cannot be linked, bought, or installed by the product. Actual OS signatures remain intentionally pending rather than faked because owner credentials are absent. | `@claim:platform-signatures`; `@claim:platform-download`; `evidence/polish-3/live-download-gate-desktop.png`; live `/#download`. |
| F-3-2 | Generates `404.html` from shared version/build values, preventing footer drift. | `generated standalone 404 shares the current build identity`; live `/404.html`; `evidence/polish-3/live-404-desktop.png`. |
| F-3-3 | Cryptographically verifies a recorded GitHub Sigstore bundle and rejects a mutated signature before checking package, repo, workflow, commit, and tag. | `@claim:release-signing`; `tests/fixtures/release-v0.1.2-provenance.base64`. |
| F-3-4 | Extends the tagged platform-download test with missing macOS package, checksum, provenance, and platform-record cases. | `@claim:platform-download` (clean checkout). |
| F-3-5 | Registers platform-signature records as a claim and rejects absent, failed-Windows, failed-macOS-signing, and failed-notarization records. | `@claim:platform-signatures`; `.factory/claims.json`; live `/#download`. |
| F-3-6 | Adds the exact “Three projects are free; unlimited projects cost $24 once.” fact within the 390 × 844 first screen. | `first screen includes exact paid price`; `evidence/polish-3/live-landing-mobile-first-screen.png`; live `/`. |
| F-3-7 | Replaces jargon with a plain explanation of what GitHub records and what the release gate checks. | `.factory/copy-audit.md`; README; `@claim:release-signing`. |

## External release boundary

The previous review correctly identified that OS signing cannot be supplied by
source code. No signing secrets or certificates are available in this work
order. The repair makes that condition fail closed and gives no visitor an
unsigned download. To finish physical package publication, an operator must
provide the Windows Authenticode and Apple signing/notarization secrets listed
in `.factory/handoff.md`, then run `v0.1.3`. That is an external authority
requirement, not a deferred code task.
