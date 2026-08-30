# Verification 12 — FAIL

## Candidate and scope

- **Candidate:** `5734234f2772bcf10ff70cd5ffec58e542a42888` (`fix: repair mobile release reflow`)
- **Live URL:** <https://project-color-beacons.sociobot.in>
- **Date:** 2026-08-30
- **Verdict:** **FAIL — do not accept/release this desktop-app candidate.**

This was an independent, clean-checkout verification. No product code was changed. The deployment is real and is the candidate, rather than a deployment-only failure: freshly built `dist/site/index.html`, `assets/index-D05I_sLG.js`, and `assets/index-CUxbwrA5.css` each matched the live response byte-for-byte by SHA-256.

## Release-blocking defect

### Critical — Windows and macOS users cannot install the desktop app

The product contract for a desktop app requires one obvious install path on each platform. Fresh browser contexts with platform user agents found:

| Platform | Live control | Result |
| --- | --- | --- |
| Linux | `Download for Linux` | Working AppImage link; package provenance verified |
| Windows | `Verified Windows download pending` | `aria-disabled="true"`, no `href`, no checkout link |
| macOS | `Verified macOS download pending` | `aria-disabled="true"`, no `href`, no checkout link |

`npm run test:release` confirms that version `v0.1.4` has all package files, but its own published `platform-signatures.json` reports `authenticodeVerified: false` for Windows and `codeSigned: false`, `notarized: false` for macOS. The site correctly fails closed; it nevertheless does not meet the required all-platform installability outcome. Add the real Windows Authenticode and Apple Developer ID/notarization credentials, publish a new trusted release, and independently verify each detected-platform link.

## Mandatory claims gate

`.factory/claims.json` exists and has 18 entries. After `npm ci`, I ran every declared command separately against the repository's local demo entry points. All passed:

`three-cues`, `confirmation-before-write`, `demo-isolated`, `demo-disposal`, `demo-reset`, `offline-reload`, `free-project-limit`, `beacon-stability`, `release-manifest`, `release-signing`, `release-matrix`, `platform-download`, `platform-signatures`, `settings-preserved`, `editor-settings`, `project-data-local`, `license-token-only`, and `checkout-availability`.

The full suite also passed: `npm test` — **33/33** Playwright tests. Independent normal and recovery checks confirmed the Northwind sample requires its named confirmation before previewing settings; an empty editor selection announces “Choose at least one editor strip, then save the project,” and recovers after selecting VS Code/Cursor.

## First read and end-to-end evidence

Fresh cold open passed the plain-words/demo gate. The first screen says “Mark the project before you edit,” names dyslexic and ADHD developers with similar windows, and has a one-click **Try it with sample data** action whose adjacent text says it opens a completed sample and saves nothing. The demo shows Atlas API already confirmed, plus Northwind Store and Launch Docs.

The native-shaped browser interface, Rust editor-settings core, and live demo were exercised through normal, boundary, and recovery paths. The release download was checked independently: the 74 MiB `Project.Color.Beacons_0.1.4_amd64.AppImage` downloaded from the v0.1.4 release and passed `sha256sum -c SHA256SUMS`.

## Quality, accessibility, privacy, and deployment evidence

- `npm run test:unit`, `npm run lint`, `npm run typecheck`, and `npm run build` passed. The production build produced `dist/app` and `dist/site`. After installing the repository's documented Tauri Linux prerequisites in this disposable container, `cargo fmt --check`, default-feature `cargo test`, `cargo check`, and `cargo clippy -- -D warnings` also passed.
- `npm run test:live:site` passed live routes (including real 404), console checks, zero Axe violations, 390 px mobile, 200% text reflow, keyboard focus, reduced motion, history/focus restoration, demo reset/disposal, SW update, and offline reload. `/opt/fleet/lib/verify-url.sh` also passed: 939 ms, title/lang, one h1, main, alt text, labelled controls, and no console errors. The standalone axe CLI could not locate a system Chrome binary; the pinned Playwright Axe integration was used instead and found no violations.
- Desktop-demo request capture was same-origin only during project work. The live `/demo` flow sent only same-origin requests and stored only `demo:pcb:site-state`; normal project data stays local. A license verification sends only the supplied token to `api.sociobot.in`.
- Live responses have HTTPS/HSTS, `nosniff`, strict referrer policy, `frame-ancestors 'none'`, restricted CSP/Permissions-Policy, 30-second HTML/service-worker revalidation, and one-year immutable caching for hashed JS/CSS/image assets. Site JS is 22,678 bytes raw / 8,111 gzip; CSS is 13,184 bytes raw / 3,815 gzip.
- The live Sociobot verifier accepted 30 invalid-token requests from one client; requests 31–35 returned **429** with `Retry-After: 4` (and `x-ratelimit-after: 4`). Observed allowance: **30 requests per active window**.
- `npm run test:live:billing` passed: exactly one $24 product is listed and checkout issues a 303 redirect to hosted Dodo checkout.

## Required next step

Provision `WINDOWS_CERT_PFX` / `WINDOWS_CERT_PASSWORD` and the documented Apple signing/notarization secrets, republish the release, then rerun this verification on Windows, macOS, and Linux. Do not expose an unsigned package as trusted.
