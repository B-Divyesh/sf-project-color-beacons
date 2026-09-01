# Verification 15 — PASS

**Candidate:** `5e77643d0af43ddcb7ca72b10689f9aa2da6aebd`  
**Live URL:** <https://project-color-beacons.sociobot.in>  
**Verified:** 2026-09-01 UTC  
**Decision:** **PASS**

## Scope and build identity

This was an independent verification from a clean checkout. Product code was
not changed. The candidate's product source builds to the same public bytes as
the live site: all 19 public files in `dist/site` matched the corresponding
live responses by SHA-256, including HTML, JavaScript, CSS, service worker,
installers, manifest, images, favicon, and 404 page. The live footer reports
version `0.1.6`, build `2026.08.30`, which matches `shared/build-info.mjs`.

## First read and demo

A cold live desktop load returned HTTP 200 and showed the title **Project Color
Beacons — Mark the right project**. The first screen says it is a local desktop
helper, names dyslexic and ADHD developers using similar project windows, and
offers **Try it with sample data** with the plain result note: “The demo opens a
completed sample. Nothing is saved.” It passes the required first-read and
one-click demo gate.

The live `/demo` route opened with three realistic sample projects and a
completed Atlas API result. Checking Northwind Store left editor output empty;
the named confirmation then revealed only its VS Code settings preview. Reset
restored Atlas API and all three samples. The desktop-shaped local app completed
the same path. It gave specific, recoverable messages for no selected editor
and a duplicate folder, and rendered only the selected Zed preview after a
valid save.

## Required claims

After `npm ci`, every exact command in `.factory/claims.json` was run
separately against the shipped demo entry points. All 19 passed:

| Claim | Result |
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
| `platform-signatures` | PASS |
| `settings-preserved` | PASS |
| `editor-settings` | PASS |
| `project-data-local` | PASS |
| `license-token-only` | PASS |
| `checkout-availability` | PASS |

## Local quality gates

- `npm ci` — passed; 193 packages installed, zero audit vulnerabilities.
- `npm test` — passed, 34/34 Playwright tests.
- `npm run test:unit` — passed, 7/7 Vitest tests.
- `npm run lint` and `npm run typecheck` — passed.
- `npm run build` — passed; emitted `dist/app` and `dist/site`.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check` — passed.
- `cargo test --manifest-path src-tauri/Cargo.toml --no-default-features` —
  passed, 2/2.
- `sh -n site/public/install.sh` and `git diff --check` — passed.

The production site bundle is 23,087 bytes JavaScript (8,199 bytes gzip) and
13,252 bytes CSS (3,840 bytes gzip), within the static budgets.

## Live product QA

- `/`, `/demo`, `/privacy`, and `/terms` returned 200 with correct per-route
  titles, one `h1`, one `main`, and no normal-load console or page errors.
  An unknown route returned the designed HTTP 404 page.
- Axe on live desktop landing, demo, privacy, terms, designed 404, and 390 px
  mobile demo found zero serious or critical findings. The full local suite
  found zero Axe findings, including dark mode.
- At 390 px the demo had zero horizontal overflow. The full suite also passed
  200% text reflow, 44 px controls, route history, focus restoration, and
  keyboard activation. A live keyboard check showed a visible 3 px focus ring;
  reduced-motion durations were `0.00001s`.
- A fresh demo flow used only `demo:pcb:site-state`; its request log contained
  no external request and no project data. The claimed offline reload passed
  from a new browser context after service-worker readiness.
- Live HTML sends CSP with `frame-ancestors 'none'`, `nosniff`, strict-origin
  referrer policy, HSTS, and a restrictive permissions policy. Hashed JS and
  CSS use `Cache-Control: public, max-age=31536000, immutable`; the service
  worker is short-cache, must-revalidate.
- Live OS checks exposed real source-verified download links for Linux
  (`.AppImage`), Windows (`.exe`), and macOS (`.dmg`). Windows and macOS show
  the explicit unsigned-system-warning text before download. The license offer
  was available for all three complete platform states.

This static/Tauri product has no product-operated server endpoint. The optional
license check is a client request to the factory billing service, so a
product-endpoint allowance/429 check is not applicable.

## Defects by severity

No P0, P1, P2, or P3 defects were found in the verified scope.

