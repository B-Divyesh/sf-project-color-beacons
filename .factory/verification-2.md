# Independent verification 2 — FAIL

- **Candidate commit:** `79178926538630420da92ed5e481a3a254c06818`
- **Live URL:** https://project-color-beacons.sociobot.in
- **Verified:** 2026-08-29 from a clean `npm ci` checkout
- **Decision:** **FAIL — do not release as the paid, one-time desktop product.**

The web/demo and packaged-release checks pass, and the live static assets are
the candidate build. The release is blocked because the required Sociobot
one-time purchase cannot be made: the catalogue has no product entry and the
documented checkout endpoint returns 404. Hiding the checkout link gives a
calm failure state, but it does not make the advertised unlimited-project
license purchasable.

## First-read test (cold live visit)

**Pass.** The first viewport says “Mark the project before you edit.” It says
this is for dyslexic and ADHD developers with similar windows and explains
that color, name, and symbol make them clear. The first primary action is
**Try it with sample data**; its adjacent copy says it opens three sample
projects and saves nothing. It is one click to `/demo`.

## Release blockers

### Critical — no active one-time-purchase path

The live `GET https://api.sociobot.in/api/v1/products` response is in `live`
mode and contains **0** entries whose slug is `project-color-beacons`.

The required endpoint returns:

```text
GET /api/v1/products/project-color-beacons/checkout
HTTP 404
{"error":"enabled factory product","status":404}
```

The UI consequently says “License purchases are being prepared,” while the
free app has a three-project limit and the terms say a valid license enables
unlimited projects. This does not meet the one-time monetization brief or the
paid-unlock requirement for a buy link, price, and usable checkout. Enabling
and registering this product in the Sociobot catalogue is external operator
work; no code change was made during verification.

### High — two quantified published claims are not fully proved by their required claim tests

This is not a runtime failure, but it violates the claims-test contract:
each tagged test must assert the observable claim.

- `@claim:three-cues` claims **each** sample project repeats color, name, and
  symbol. Its only assertion inspects `Atlas API`; it never checks Northwind
  Store or Launch Docs.
- `@claim:checkout-availability` claims a checkout link appears **only when**
  the catalogue has an active checkout. It tests the unavailable case only;
  it does not mock an active catalogue product and assert that the matching
  checkout link appears.

The live product behaviour observed in the demo is sound, but these tests do
not independently establish the full quantified claims advertised on the
site and README.

## Passed verification

### Clean repository gates

All commands below were run after `npm ci` from this checkout.

| Check | Evidence |
| --- | --- |
| Required claims | All 10 exact commands listed in `.factory/claims.json` were run against their shipped demo/app entry points; the clean full `npm test` run passed all 10 tagged claims. |
| Browser suite | `npm test` passed: **13/13** Playwright tests. |
| Unit suite | `npm run test:unit` passed: **4/4** Vitest tests. |
| Types | `npm run typecheck` passed. |
| Production web build | `npm run build` passed and produced `dist/app` and `dist/site`. |
| Rust core | `cargo test --manifest-path src-tauri/Cargo.toml --no-default-features` passed: **2/2**. |
| Dependency audit | `npm audit --audit-level=high` found **0** vulnerabilities. |
| Native host check | `cargo check --manifest-path src-tauri/Cargo.toml` is blocked by this container missing the documented `glib-2.0` development package. The release workflow installs the Linux Tauri libraries; this host-only prerequisite failure is not the release decision. |

Build output is within static budgets: site JS is 19.54 kB (6.87 kB gzip),
site CSS is 11.15 kB (3.39 kB gzip), and the mobile hero is 12,684 bytes.

### Live identity, response, and release checks

- SHA-256 matched exactly between local candidate build and production for
  `index.html`, `assets/index-2RGDpD9J.js`,
  `assets/index-nMnHj5XT.css`, and `assets/og-beacons.webp`.
- Hashed live JS and CSS return
  `Cache-Control: public, max-age=31536000, immutable`. CSP is restrictive
  and includes only the needed GitHub and Sociobot connect origins; HSTS,
  `nosniff`, referrer policy, and permissions policy are present.
- `/`, `/demo`, `/privacy`, `/terms`, and an unknown URL each returned 200,
  had correct route title, `lang=en`, exactly one `main`, exactly one `h1`, no
  console/page errors, and no axe serious or critical violations.
- All discovered internal, GitHub Release, and Factory links returned 200;
  hash and mail links were intentionally excluded from HTTP crawling.
- The published v0.1.0 release contains macOS (arm64/x64), Windows
  (MSI/exe), and Linux (AppImage/deb/rpm) artifacts plus `SHA256SUMS` and a
  valid `latest.json`. Downloaded
  `Project.Color.Beacons_0.1.0_amd64.deb` has matching published SHA-256 and
  Debian metadata `project-color-beacons`, version `0.1.0`, architecture
  `amd64`.

### Product, privacy, accessibility, and PWA exercise

- Live `/demo` was exercised from a fresh browser: selecting Atlas API,
  confirming it, and rendering VS Code/Zed preview works. Its outgoing
  requests were only same-origin document, JS, CSS, and favicon; storage was
  only `demo:pcb:site-state`.
- The desktop-shaped demo was exercised with an invalid empty-name attempt,
  browser sample-folder recovery, save, check/confirm, preview, remove, and
  undo. It finished with four sample projects, no console errors, no
  serious/critical axe findings, and only `demo:pcb:projects` storage.
- At 390 x 844 the landing page has 0 px horizontal overflow and its primary
  action reaches `/demo`. Keyboard Enter on **Check project** shows the named
  confirmation control; visible focus is a 3 px `rgb(214, 111, 53)` outline.
  Reduced-motion mode has no running animation (durations are reduced to
  `0.00001s`).
- The live service worker controls `/demo`; `registration.update()` completed
  using `/sw.js`. After an online visit, an offline reload showed the demo
  heading, banner, and Atlas sample with no console errors.
- The license verification endpoint was tested with an invalid fixture token:
  it returned `{valid:false, reason:"invalid"}` and no project data was sent.
  In a single-client rate test, 30 requests succeeded and request 31 returned
  `429` with `Retry-After: 3` and `x-ratelimit-after: 3` (observed allowance:
  30 requests per active window).

## Required next steps

1. Register/enable `project-color-beacons` in the public Sociobot product
   catalogue at its intended one-time price, then reverify a checkout,
   return-token persistence, and unlock path.
2. Strengthen the two claim tests above so they prove every sample and both
   active/inactive catalogue states before the next release candidate.
