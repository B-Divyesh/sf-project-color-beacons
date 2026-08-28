# Independent verification — FAIL

- **Candidate:** `b454a845d8b7603aefc16f71c65ef8047d960757` (`fix: set metadata for every site route`)
- **Live URL:** https://project-color-beacons.sociobot.in
- **Verified:** 2026-08-28 (fresh `npm ci` checkout)
- **Decision:** **FAIL — do not release.** The advertised paid purchase path is unavailable and one repository quality-gate command fails.

## First-read result

**Pass.** On a cold desktop visit the first viewport plainly says: “Mark the
project before you edit.” It names dyslexic and ADHD developers with similar
windows, and exposes a one-click **Try it with sample data** action. The
nearby text says that it opens three samples and saves nothing.

## Release blockers

### Critical — paid unlock cannot be purchased

The live **Buy a $24 license** link resolves to
`https://api.sociobot.in/api/v1/products/project-color-beacons/checkout`.
Fresh `GET` evidence on 2026-08-28 was:

```
HTTP/2 404
{"error":"enabled factory product","status":404}
```

This makes the stated one-time unlimited-project purchase unavailable, while
the app stops a fourth project behind that license. It contradicts the visible
price/purchase promise and fails the required Sociobot unlock flow. The
service needs to be registered/enabled before release. No allowance/rate-limit
test is possible for this unavailable product endpoint; the repository does
not document an allowance and has no first-party HTTP API.

### High — `npm run test:unit` fails

From the clean checkout, `npm run test:unit` runs `vitest run`, collects
`tests/claims.spec.ts`, and exits 1:

```
Error: Playwright Test did not expect test() to be called here.
tests/claims.spec.ts:5:1
Test Files  1 failed (1)
Tests  no tests
```

Vitest must exclude the Playwright specification (or have an actual Vitest
suite) so every advertised quality command passes.

### High — published claims are not all registered and demonstrated

`.factory/claims.json` has six entries, but the landing page and README make
additional visitor-reliance claims without corresponding claim IDs/tests. In
particular:

- “No monitoring. The app does not watch keystrokes or score mistakes.”
- “No project upload. Names, paths, and settings stay on your device.”
- “The app adds supported settings for VS Code, Cursor, and Zed.”
- “The desktop app works offline.”

The `demo-isolated` test proves only a browser-demo request/storage flow; it
does not prove the installed desktop privacy claims. `offline-reload` proves a
browser service-worker reload, not the stated desktop-app behaviour. The
claims contract requires a registered observable test for every such claim.

## Other defects

### Medium — hashed production assets are not long-lived cached

Live response headers for both
`/assets/index-CNueZORv.js` and `/assets/index-DBqwL4P7.css` are:

```
cache-control: public, must-revalidate, max-age=30
```

The performance contract requires long-lived immutable caching for hashed
assets. The 6.71 KB gzip initial JS and 3.37 KB gzip CSS are within budget,
but the caching policy is not.

## Passed checks and evidence

| Check | Result |
| --- | --- |
| Clean install | `npm ci` passed; audit found 0 high vulnerabilities. |
| Required claim commands | All six exact commands in `.factory/claims.json` passed. |
| Full browser suite | `npm test` passed: 9 Playwright tests. |
| Rust core tests | `cargo test --manifest-path src-tauri/Cargo.toml --no-default-features` passed: 1 test. |
| TypeScript | `npx tsc --noEmit` passed. |
| Production web build | `npm run build` passed; emitted `dist/app` and `dist/site`. |
| Default Cargo check | Not completed in this clean container: `cargo check --manifest-path src-tauri/Cargo.toml` stops because system `glib-2.0` development files are absent. This is an environment dependency noted by the README, not used as a product defect. |
| Live deployment identity | Local-vs-live SHA-256 matched for `index.html`, `assets/index-CNueZORv.js`, `assets/index-DBqwL4P7.css`, and `sw.js`. `main` is the candidate commit. |
| Desktop release | Downloaded `Project.Color.Beacons_0.1.0_amd64.deb`; its SHA-256 matched published `SHA256SUMS`. Debian metadata names version 0.1.0. |
| Live route/a11y smoke | `/`, `/demo`, `/privacy`, `/terms`, and an unknown route each returned one `main`, one `h1`, `lang=en`, route-correct title, no browser console/page errors, and no axe serious/critical findings. |
| Privacy observation | On a fresh live `/demo` flow, outgoing requests were only same-origin document, JS, CSS, and favicon; storage contained only `demo:pcb:site-state`. |
| Responsive/keyboard/motion | Live landing had 0 px horizontal overflow at 390 px. The sample action reached `/demo`; keyboard Enter exposed the named confirmation button; focus outline was `rgb(214,111,53) solid 3px`; reduced-motion CSS is present. |
| Demo error/recovery | The app demo rejects no selected editor with a clear error, then saves a repaired project (`4 projects · unlimited`) without console errors or axe serious/critical findings. |

The requested `verify-url.sh` is not present in this repository. Its intended
title/lang/main/alt/console coverage was independently exercised through the
live Playwright checks above.

## Required next steps

1. Enable/register the `project-color-beacons` Sociobot product and re-test a
   live checkout and license restore path.
2. Repair the Vitest configuration, then rerun `npm run test:unit`.
3. Either remove the untestable marketing/privacy statements or add isolated,
   observable claim tests that prove the installed-app scope.
4. Configure immutable caching for content-hashed static assets, then deploy
   and reverify headers.
