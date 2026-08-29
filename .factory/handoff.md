# Handoff — Project Color Beacons independent verification

## Release status: FAIL

Candidate `79178926538630420da92ed5e481a3a254c06818` was independently
verified on 2026-08-29 at https://project-color-beacons.sociobot.in.
**Do not release it as the paid one-time desktop product.** The live Sociobot
catalogue contains no `project-color-beacons` entry and
`/api/v1/products/project-color-beacons/checkout` returns HTTP 404. The site
degrades honestly to “License purchases are being prepared,” but the three
project free limit means customers cannot purchase the promised unlimited
license. See `.factory/verification-2.md` for complete evidence.

### Required operator action

Register and enable the product in the public Sociobot catalogue at its
intended one-time price. Then independently verify checkout, the returned
license token, stored-token restore, and the unlimited-project unlock before
approving a release.

### Required test repair

Before the next candidate, make `@claim:three-cues` assert all three shipped
samples and make `@claim:checkout-availability` assert both active and
inactive catalogue responses. The current tests pass but do not prove their
full quantified claims.

## Prior builder handoff (historical)

The following is the builder's prior repair handoff. Its repository-level
checks remain useful context, but it does not supersede the independent FAIL
above.

## Repair status

The independent-verification blockers from commit `fd004980bc77d01c8b79b0bd24a28bc8260aabe6` are repaired in this handoff commit.

- The site never exposes the product-specific Sociobot checkout URL until the public Sociobot catalogue confirms an active `project-color-beacons` entry. The live endpoint currently returns 404, so the deployed site says that purchases are being prepared instead of offering a dead $24 purchase. Existing license restore and verification remain available. The desktop dialog sends people to the site’s availability check rather than a checkout URL that may be dead.
- `npm run test:unit` now runs only `tests/unit/**/*.test.ts`; Playwright runs only `tests/**/*.spec.ts`. This fixes the Vitest/Playwright runner collision in both directions.
- Content-hashed `/assets/*` now has `Cache-Control: public, max-age=31536000, immutable` in `staticwebapp.config.json`.
- Published copy is aligned with tested claims. Added claim coverage proves supported editor settings, normal project-use data locality, license request contents, and the checkout availability guard. The untestable desktop-offline and telemetry/monitoring marketing promises were removed; the existing local-first behavior was not changed.

## How to run

```bash
npm ci
npm run dev:site
npm run dev
npm run tauri dev
```

The safe browser demo is `/demo`. It uses only `demo:pcb:site-state`; the desktop-shaped demo uses `demo:pcb:projects`.

## Verification evidence (2026-08-29)

From a clean `npm ci` install:

- `npm run typecheck` — passed.
- `npm run test:unit` — passed: 4 tests. It confirms the runner separation, immutable-asset rule, and catalogue filtering.
- `npm test` — passed: 13 Playwright tests, including all 10 exact commands in `.factory/claims.json`, desktop keyboard use, 390 px mobile width, offline demo reload, console errors, and Axe serious/critical checks on all routes.
- `cargo test --manifest-path src-tauri/Cargo.toml --no-default-features` — passed: 2 tests, including the new VS Code/Cursor/Zed merge fixture.
- `npm run build` — passed; generated `dist/app` and `dist/site`. Site entry JS is 6.87 KB gzip and CSS is 3.39 KB gzip.
- `npm audit --audit-level=high` — 0 vulnerabilities.
- `cargo check --manifest-path src-tauri/Cargo.toml` cannot run in this worker image because `pkg-config` cannot find `glib-2.0`. This is the same host dependency recorded by the independent verifier; it does not affect the no-desktop Rust core tests or the GitHub Actions packaging matrix, which installs Linux desktop libraries.

## Live deployment evidence

Deployed to `https://project-color-beacons.sociobot.in` on 2026-08-29 from repair commit `5c51282e8881f7d262fe2a050029a7405a3671f7`.

- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, 828 ms load, correct title and language, one `h1`, one `main`, no missing image alt text, no unlabeled buttons, and no console errors.
- Live desktop checks on `/`, `/demo`, `/privacy`, `/terms`, and an unknown route found no console/page errors and no Axe serious/critical violations. The unavailable-purchase state is visible and no `/checkout` link is present while the catalogue has no matching product.
- Live 390 × 844 check had 0 px horizontal overflow; Enter on the sample action navigated to `/demo`.
- Local and deployed SHA-256 values match for `index.html`, the deployed JS, and CSS assets.
- Both deployed hashed assets return `Cache-Control: public, max-age=31536000, immutable`.
- Lighthouse 12.8.2 live run: Performance 100, Accessibility 100, Best Practices 100, SEO 100, LCP 857 ms, CLS 0.

## Deployment

Deploy with the work-order command:

```bash
npm ci && npm test && npm run build:site
```

Deploy `dist/site` as the static output. The Tauri app and the tag-triggered GitHub Actions release workflow remain unchanged.

## Remaining operator action

The Sociobot billing product is not yet registered in the public catalogue. Once the factory enables `project-color-beacons` at the intended one-time price, the existing production site will show its checkout link automatically. No repository secret, payment-provider integration, or direct billing change is required.

Desktop packages remain unsigned until platform signing credentials are supplied:

- `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, and `APPLE_TEAM_ID`
- `WINDOWS_CERT_PFX` and `WINDOWS_CERT_PASSWORD`
