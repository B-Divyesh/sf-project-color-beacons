# Handoff — Project Color Beacons repair

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

Post-deploy evidence, including live response headers and `verify-url.sh`, is appended after the static deployment completes.

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
