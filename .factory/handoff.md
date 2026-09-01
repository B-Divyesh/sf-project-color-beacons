# Project Color Beacons — polish round 5 handoff

## Outcome: PASS

Every finding in reviews 1–5 is resolved in source and on the deployed site.
Repair commit `d04670b867dee25966362e6e65844c1a3e8a9e2a` is live at
<https://project-color-beacons.sociobot.in>.

The app keeps its glacial-workbench visual system. The implementation remains
a Tauri 2 desktop app with a Vite/TypeScript interface and a static landing
site in `dist/site`.

## What changed

- Restored a fail-closed release contract. Windows now requires verified
  Authenticode. macOS requires verified Apple signing and notarization.
- Applied the same trust decision to the landing download, hosted checkout,
  PowerShell installer, shell installer, release workflow, release status, and
  tests. The current unsigned Windows/macOS assets cannot be selected through
  the product. Their purchase actions are absent.
- Kept Linux v0.1.6 available because its package and GitHub provenance pass
  the published checks.
- Added the `price-display` claim. The page reads the active catalogue price;
  its test exercises $24 and $29 fixtures and verifies the live registration
  is exactly one $24 USD one-time product.
- Retained the direct `/demo` and `/?demo=1` sample workspace, persistent demo
  banner, reset/exit controls, `demo:` storage isolation, offline reload, true
  routes and 404, route focus/announcement, legal pages, and mobile layout.
- Updated README, demo contract, copy audit, catalogue description, claims,
  and the complete review-to-evidence map in `.factory/polish-5.md`.

## Clean-clone verification

Clean clone: `/tmp/pcb-polish5-clean.sVU5xA`, checked out at
`d04670b867dee25966362e6e65844c1a3e8a9e2a`.

- `npm ci` — passed; audit reported 0 vulnerabilities.
- Each of the 20 exact `test` commands in `.factory/claims.json` was run
  separately — 20/20 passed.
- `npm test` — 35/35 Playwright tests passed.
- `npm run test:unit` — 7/7 Vitest tests passed.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run build` — passed and produced `dist/app` plus `dist/site`.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` — passed.
- `cargo test --manifest-path src-tauri/Cargo.toml --no-default-features` —
  2/2 passed.
- `cargo check --manifest-path src-tauri/Cargo.toml` — passed with the
  documented Tauri system libraries installed in the disposable worker.
- `npm audit --audit-level=moderate` — 0 vulnerabilities.
- `sh -n site/public/install.sh` — passed.

Build sizes remain below the static-product budgets:

- Site JavaScript: 23,163 bytes raw, 8,180 bytes gzip.
- Site CSS: 13,252 bytes raw, 3,840 bytes gzip.
- Desktop-interface JavaScript: 11,654 bytes raw, 4,750 bytes gzip.
- Desktop-interface CSS: 9,980 bytes raw, 3,120 bytes gzip.

## Deployment and cold-live verification

The site was deployed with the work-order static deployment configuration:

```text
/opt/fleet/lib/deploy-static.sh project-color-beacons dist/site
deployment id: a4ff42f5-ace8-4efd-bb2c-16b607076b19
```

Only the product's `sf-project-color-beacons` deployment resource was used.

- `npm run test:live:site` — passed routes, route Axe checks, mobile layout,
  keyboard navigation, Back/Forward focus and scroll, reduced motion, privacy,
  offline reload, demo reset/disposal, Linux download, Windows/macOS gates,
  and license guidance.
- `npm run test:live:billing` — passed; one matching live product is registered
  at 2,400 USD minor units and checkout redirects to the hosted payment page.
- `/opt/fleet/lib/verify-url.sh https://project-color-beacons.sociobot.in
  .factory/evidence/polish-5/verify-url` — HTTP 200, no console errors, `lang`,
  title, one h1, main landmark, alt text, and control-name checks passed.
- Playwright Axe on the live home and demo found 0 serious or critical issues.
- Cold `/?demo=1` used only same-origin requests and only
  `demo:pcb:site-state`; reset restored confirmed Atlas API and all three
  samples.
- Cold Windows and macOS user agents had no download href and no checkout
  link. Both showed a verified-download-pending state. Cold Linux linked the
  v0.1.6 AppImage and exposed the $24 checkout.
- `/`, `/demo`, `/privacy`, `/terms`, and `/404.html` returned 200 with their
  route-specific titles. `/polish-5-not-found` returned the designed HTTP 404.
- Mobile Lighthouse: performance 100, accessibility 100, best practices 100,
  SEO 100; FCP 0.8 s, LCP 1.7 s, TBT 50 ms, CLS 0, transfer 95 KiB.
- The live JavaScript SHA-256 is
  `6837f555dd169951c8e31b995a41e7c355cf27b436cca95eaec33ecafe453111`,
  identical to the local `dist/site` file.

Evidence: `.factory/evidence/polish-5/live-verification.json` and the six
screenshots in the same directory.

## Run and verify

```bash
npm ci
npm run dev:site
npm test
npm run test:unit
npm run typecheck
npm run lint
npm run build
cargo test --manifest-path src-tauri/Cargo.toml --no-default-features
npm run test:release
npm run test:live:site
npm run test:live:billing
```

Demo entry points:

- Production query route: <https://project-color-beacons.sociobot.in/?demo=1>
- Production path route: <https://project-color-beacons.sociobot.in/demo>
- Local site: `http://localhost:5173/?demo=1`
- Desktop interface: `http://localhost:5173/?demo=1`

## Needs operator action

No code or review finding remains open. Windows and macOS installers stay
unavailable until the owner supplies signing credentials to the repository and
publishes a new release. The workflow expects:

- Windows: `WINDOWS_CERT_PFX`, `WINDOWS_CERT_PASSWORD`.
- macOS: `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`,
  `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`.

The workflow fails instead of publishing an unsigned installer when these are
missing. After the credentials are added, dispatch a new `v*` release and run
`npm run test:release`; the site will expose each platform only after the
release status proves its required trust checks.

## Independent verification 16 — PASS

Candidate `e7d441923d4f4f1be481e019439aa891da7893fe` was independently
verified against <https://project-color-beacons.sociobot.in> on 2026-09-01 UTC.
All 20 required claim commands passed individually; the complete Playwright
suite passed 35/35; unit, lint, type, production-build, Rust-core-test, and
format checks passed. The live JavaScript, CSS, and service-worker bytes match
the local candidate production build by SHA-256. Cold first-read, demo,
privacy-request, route/header, keyboard, 390 px, reduced-motion, and axe
checks passed with no product defects found.

The worker lacks the GLib development package needed for a full Tauri
`cargo check`; this is the only verification environment limitation. See
`.factory/verification-16.md` for exact evidence and the release decision.
