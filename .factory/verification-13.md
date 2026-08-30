# Verification 13 — PASS

## Candidate and scope

- **Candidate:** `5ab7ae5cb31ee9a07568945c73803ceeeb82d187` (`docs: record repair 9 verification`)
- **Live URL:** <https://project-color-beacons.sociobot.in>
- **Date:** 2026-08-30
- **Verdict:** **PASS — accept this desktop-app candidate.**

This was an independent clean-checkout verification. Product code was not changed. A fresh `npm run build` reproduced the deployed site: all 20 publicly served build files matched the live responses byte-for-byte. `staticwebapp.config.json` is deployment configuration and correctly returns the styled 404 rather than being publicly served.

## Required first-read and demo gate

A cold desktop browser visit passed the plain-words gate. The first screen says **“Mark the project before you edit.”** It identifies **dyslexic and ADHD developers who need distinct cues across similar project windows**, and the first primary action is **“Try it with sample data.”** The adjacent explanation says that it opens a completed sample and saves nothing. The action opens `/demo` in one click.

The sample begins with Atlas API confirmed and includes Northwind Store and Launch Docs. The exercised Northwind flow withheld editor-file output until the named confirmation; reset restored the completed Atlas state; Start for real discarded the `demo:` browser state. The live verification also exercised 390 px layout, 200% text reflow, keyboard focus, history focus restoration, reduced motion, service-worker update, and offline demo reload.

## Mandatory claims gate

`.factory/claims.json` exists and contains 18 claims. After `npm ci`, every exact command declared in it was run separately against the local demo entry point and passed:

`three-cues`, `confirmation-before-write`, `demo-isolated`, `demo-disposal`, `demo-reset`, `offline-reload`, `free-project-limit`, `beacon-stability`, `release-manifest`, `release-signing`, `release-matrix`, `platform-download`, `platform-signatures`, `settings-preserved`, `editor-settings`, `project-data-local`, `license-token-only`, and `checkout-availability`.

`npm test` then passed the complete Playwright suite: **33/33**.

## Local build and native checks

All checks passed from the requested commit:

- `npm ci` — 193 packages, zero reported vulnerabilities.
- `npm test` — 33/33 Playwright tests.
- `npm run test:unit` — 7/7 Vitest tests.
- `npm run lint`, `npm run typecheck`, and `npm run build` — passed.
- Build outputs: `dist/app` and `dist/site`; app JS 4.75 KB gzip, site JS 8.15 KB gzip, site CSS 3.81 KB gzip.
- With normal Tauri Linux prerequisites installed in this disposable container: `cargo fmt --check`, `cargo test --manifest-path src-tauri/Cargo.toml` (2/2), `cargo check`, and `cargo clippy -- -D warnings` — passed.

## Live deployment, accessibility, privacy, and performance

- `npm run test:live:site` passed live route titles/statuses (including real 404), demo behavior, 390 px/200% reflow, keyboard-visible focus, reduced-motion behavior, request isolation, service-worker update/offline reload, and its pinned Playwright Axe audit with **zero violations**.
- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, 1.474 s load, title, `lang="en"`, one h1, main landmark, image alternatives, labelled controls, and no console/page errors.
- The standalone `npx @axe-core/cli` was attempted. Its bundled ChromeDriver only supports Chrome 152 while the preinstalled Playwright Chromium is 145, so the CLI could not start; this is a verifier-tool environment mismatch, not an audit failure. The repository’s pinned `@axe-core/playwright` audit above is the valid zero-violation result.
- Fresh landing-page request capture had no errors. It requested only same-origin assets plus the explicitly CSP-allowed GitHub release API and Sociobot product catalogue. The `/demo` interaction captured by the live suite remained same-origin only and used `demo:pcb:site-state`; project work stays local. License verification is limited to the supplied token, as covered by its claim test.
- Headers include HSTS, `nosniff`, strict-origin referrer policy, a restrictive CSP with `frame-ancestors 'none'`, and Permissions-Policy. HTML/service-worker responses revalidate at 30 seconds; hashed JS/CSS/images have immutable one-year caching.
- Idle Lighthouse 12.8.2: **Performance 90, Accessibility 100, Best Practices 100, SEO 100**; FCP 1.0 s, LCP 1.1 s, TBT 420 ms, CLS 0.

## Release, installability, and rate allowance

`npm run test:release` passed for v0.1.5 and verified all published package identities against SHA256SUMS, the release manifest, and GitHub provenance. Fresh browser contexts exposed enabled source-verified download links for Linux, Windows, and macOS; Windows and macOS plainly warn that OS signatures are absent.

A freshly downloaded `Project.Color.Beacons_0.1.5_amd64.AppImage` was 76,675,576 bytes and matched its published SHA-256:

`92c841bc50820805aa4dee13ea3bbdbf9fb9e7f97e0e78c0d2b99351e13ae769`.

The documented product-scoped license verifier allowance is enforced. Thirty consecutive invalid-token requests from one client returned 200; requests 31–35 returned **429** with `Retry-After: 4` (also `x-ratelimit-after: 4`). Observed allowance: **30 requests per active window**.

## Findings

No critical, high, medium, or low product defects found.

The public Windows and macOS packages remain unsigned, but this is disclosed in the current UI and release status, while source provenance and checksums are verified. It is not a release blocker under the desktop-app contract; owner certificate configuration remains an optional future improvement.
