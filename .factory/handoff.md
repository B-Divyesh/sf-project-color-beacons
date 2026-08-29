# Handoff — Project Color Beacons repair 2

## Release status

Repository repair candidate `884fe95` is built, pushed to `main`, and deployed
to https://project-color-beacons.sociobot.in on 29 August 2026. The two
claim-test defects reported in `.factory/verification-2.md` are fixed and all
local, package, browser, accessibility, privacy, offline, response-policy, and
live identity checks pass.

The release still needs one external operator action before it can be approved
as a paid product: the public Sociobot catalogue has no
`project-color-beacons` entry, so the production checkout endpoint still
returns HTTP 404. Repository instructions prohibit changing billing
infrastructure from this repo, and the approved `fleet/new-paid-product.sh`
registration helper is not available in this worker. The product continues to
show its honest unavailable state and never exposes a dead checkout link.

## Repairs

- `@claim:three-cues` now checks Atlas API, Northwind Store, and Launch Docs.
  For every sample it asserts the written name plus the named color and symbol
  in both the project card and the confirmation strip.
- `@claim:checkout-availability` now serves the local candidate under the real
  HTTPS production origin. It proves both catalogue branches: a missing or
  mismatched entry renders no checkout link, while an active matching entry
  renders exactly the Sociobot `$24` checkout URL and one-time price.
- `.factory/claims.json` now documents both checkout test states.
- The Rust core was mechanically formatted so `cargo fmt --check` is a clean
  release gate. No product behavior changed.

## Clean verification evidence

The work-order deployment command was run verbatim after the repair:

```bash
npm ci && npm test && npm run build:site
```

It passed with 13/13 Playwright tests and produced `dist/site`. Every one of
the ten commands in `.factory/claims.json` was also run separately and passed.

Additional gates:

- `npm run test:unit` — 4/4 Vitest tests passed.
- `npm run typecheck` — passed. The repository has no separate JavaScript lint
  command.
- `npm run build` — passed for `dist/app` and `dist/site`.
- `npm audit --audit-level=high` — 0 vulnerabilities.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check` — passed.
- `cargo test --manifest-path src-tauri/Cargo.toml --no-default-features` —
  2/2 tests passed.
- `cargo check --manifest-path src-tauri/Cargo.toml` — passed after installing
  the same Linux Tauri prerequisites used by the release workflow.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`
  — passed.
- A native release build produced a 1,921,740-byte Debian package and a
  76,663,288-byte AppImage. Debian metadata is
  `project-color-beacons 0.1.0 amd64`.

Static budgets remain well inside the product limits: site JS is 19,544 bytes
(6.87 KB gzip), CSS is 11,149 bytes (3.39 KB gzip), and the mobile hero is
12,684 bytes.

## Live deployment evidence

Azure Static Web Apps deployment
`b9844f73-7577-4bb8-a481-aca3768c7a53` succeeded. The custom domain returned
HTTP 200 immediately after deployment.

- `/opt/fleet/lib/verify-url.sh` passed in 781 ms with the correct title and
  language, one `h1`, one `main`, complete image alt text, labelled buttons,
  and no console errors.
- `/`, `/demo`, `/privacy`, `/terms`, and an unknown route each returned 200,
  had route-correct titles, one `h1`, one `main`, no console/page errors, and
  no serious or critical Axe findings.
- At 390 × 844, horizontal overflow was 0 px and keyboard Enter on the primary
  sample action opened `/demo`. The live demo focus ring is a 3 px solid
  `rgb(214, 111, 53)` outline.
- The service worker update completed. After an online visit, `/demo` reloaded
  offline with its heading and sample data and no console errors.
- The live demo requested only its own origin and stored only
  `demo:pcb:site-state`.
- Local and live SHA-256 values match for `index.html`, the hashed JavaScript,
  and the hashed CSS. Hashed assets return
  `Cache-Control: public, max-age=31536000, immutable`.
- The live response includes HSTS, `nosniff`, the expected referrer and
  permissions policies, and the restrictive CSP with only GitHub API and
  Sociobot API connect origins.
- Lighthouse 12.8.2: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100, LCP 1,613 ms, total blocking time 23 ms, CLS 0.
- Published release `v0.1.0` remains non-draft and contains macOS arm64/x64,
  Windows MSI/exe, Linux AppImage/deb/rpm, `SHA256SUMS`, and `latest.json`.
  A fresh Debian download matched its published SHA-256 exactly and reported
  package `project-color-beacons`, version `0.1.0`, architecture `amd64`.

## Live billing result and required operator action

Read-only production checks after deployment still return:

```text
GET https://api.sociobot.in/api/v1/products
matching project-color-beacons entries: 0

GET https://api.sociobot.in/api/v1/products/project-color-beacons/checkout
HTTP 404
{"error":"enabled factory product","status":404}
```

An operator must register and enable `project-color-beacons` in the public
Sociobot catalogue at the intended `$24` one-time price using the factory's
approved billing workflow. Then verify a real checkout, returned-license URL
storage, license restore, and unlimited-project activation. Do not replace the
Sociobot checkout with a direct payment-provider integration.

Desktop packages remain unsigned until the operator supplies the signing
credentials already documented by the release workflow.
