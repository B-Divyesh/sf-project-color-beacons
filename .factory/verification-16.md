# Verification 16 — PASS

**Candidate:** `e7d441923d4f4f1be481e019439aa891da7893fe`  
**Live URL:** <https://project-color-beacons.sociobot.in>  
**Verified:** 2026-09-01 UTC  
**Decision:** **PASS**

## Scope and build identity

Independent verification began from a clean checkout at the candidate commit.
No product code was changed. The live site matches the candidate production
build byte for byte for the primary public assets:

| Asset | SHA-256 | Match |
| --- | --- | --- |
| `assets/index-CFLiWOpf.js` | `6837f555dd169951c8e31b995a41e7c355cf27b436cca95eaec33ecafe453111` | Yes |
| `assets/index-CKYFeAu2.css` | `e383685885967ea4eea81d78cf8b68ff4a16c9c72ef524205240877a0510a477` | Yes |
| `sw.js` | `6a74c21b00aa2ede0d38fed732e6a22f66a553e00522009882f25b03e7b25820` | Yes |

The live footer identifies version `0.1.6` and build `2026.08.30`.

## Cold first read and demo

A cold live landing-page load returned HTTP 200 with title **Project Color
Beacons — Mark the right project** and no console or page errors. The first
screen says that it marks a project before editing, names dyslexic and ADHD
developers using similar project windows, and offers **Try it with sample
data**. Its adjacent note says the completed sample opens and nothing is saved.
It therefore answers what it does, who it is for, and what to do first in
plain words.

The one-click `/demo` route opened a completed Atlas API sample plus Northwind
Store and Launch Docs. It includes the persistent sample-data banner, Reset
demo, and Start for real. The independent browser check found only same-origin
requests during the demo flow. Full claim coverage also checked named project
confirmation, reset, disposal on leaving demo, offline reload after first
visit, the three-project free boundary, and license recovery.

## Required claims

After `npm ci`, every exact command in `.factory/claims.json` was run
individually through the shipped demo entry points. All 20 passed:

`three-cues`, `confirmation-before-write`, `demo-isolated`, `demo-disposal`,
`demo-reset`, `offline-reload`, `free-project-limit`, `price-display`,
`desktop-license-recovery`, `beacon-stability`, `release-manifest`,
`release-signing`, `release-matrix`, `platform-download`,
`platform-signatures`, `settings-preserved`, `editor-settings`,
`project-data-local`, `license-token-only`, and `checkout-availability`.

The full `npm test` run independently completed with **35/35 passing** tests.

## Local quality gates

- `npm ci` — passed; 193 packages installed and npm reported zero audit
  vulnerabilities.
- `npm test` — passed, 35/35 Playwright tests.
- `npm run test:unit` — passed, 7/7 Vitest tests.
- `npm run lint` and `npm run typecheck` — passed.
- `npm run build` — passed and produced `dist/app` and `dist/site`.
- `cargo test --manifest-path src-tauri/Cargo.toml --no-default-features` —
  passed, 2/2 tests.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check` — passed.
- `git diff --check` — passed; the candidate tree was clean before report
  documentation was added.

The production output is within the stated static budgets: site JavaScript is
23,163 bytes raw / 8,180 bytes gzip, site CSS is 13,252 bytes raw / 3,840 bytes
gzip, and desktop-interface JavaScript is 11,654 bytes raw / 4,750 bytes gzip.

## Live product QA

- `/`, `/demo`, `/privacy`, and `/terms` returned 200 with route-specific
  titles, one `h1`, and a `main` landmark. An unknown route returned the
  designed HTTP 404 page.
- Live `/demo` had zero serious or critical axe findings (zero findings in
  total). The complete local suite also passed its accessibility checks,
  including the desktop-shaped interface.
- Keyboard tabbing reached the skip link and controls in order. The observed
  focus indicator was a visible 3 px orange outline. The desktop test covers
  Enter activation, confirmation, dialog use, and accessible names.
- At 390 px, the live demo had no horizontal overflow. The suite also passed
  200% text reflow and 44 px control checks.
- With reduced motion requested, live animation and transition durations were
  `0.00001s`.
- The demo request log contained only the page, its JavaScript, CSS, and
  favicon from `project-color-beacons.sociobot.in`; it contained no project
  data sent elsewhere. Browser and page-error logs were empty.
- The document response supplies CSP, `X-Content-Type-Options: nosniff`,
  strict-origin referrer policy, HSTS, and a restrictive permissions policy.
  The hashed JavaScript response uses `Cache-Control: public,
  max-age=31536000, immutable`.

This static desktop product has no product-operated server endpoint. The
optional license request belongs to the factory billing service rather than
this product deployment, so no product-endpoint request allowance applies.

## Verification limitation

`cargo check --manifest-path src-tauri/Cargo.toml` could not complete in this
disposable worker because the worker lacks the system GLib development package
required by Tauri. This is an environment dependency issue. The declared
production build, Rust core tests, formatting check, browser desktop-interface
tests, and live release site all passed. Direct package retrieval and checksum
comparison were not performed because this verification scope permits network
access only to the product URL; the shipped release-manifest and provenance
claim tests passed.

## Defects by severity

No P0, P1, P2, or P3 product defects were found.
