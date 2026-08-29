# Independent verification 3 — FAIL

- **Candidate:** `41ab7680e00cad41f468a64d053cf2ea67db6fad`
- **Live URL:** https://project-color-beacons.sociobot.in
- **Verified:** 2026-08-29 from a clean checkout after `npm ci`
- **Decision:** **FAIL — do not release.** The required one-time unlock cannot
  be purchased, and the demo makes an unregistered, false disposal promise.

## First-read test

**Pass.** A fresh, cold visit plainly says “Mark the project before you edit.”
It names dyslexic and ADHD developers using similar windows, says that a
color, name, and symbol make them clear, and offers **Try it with sample
data**. Its adjacent text says the one-click demo opens three sample projects
and saves nothing.

## Release-blocking findings

### Critical — the required one-time license cannot be bought

The brief requires one-time monetization and the product limits the free app
to three projects. Fresh production evidence shows that no active Sociobot
catalogue product exists:

```text
GET https://api.sociobot.in/api/v1/products
matching slug project-color-beacons: 0

GET https://api.sociobot.in/api/v1/products/project-color-beacons/checkout
HTTP 404
{"error":"enabled factory product","status":404}
```

The live UI honestly hides a dead purchase link and says “License purchases
are being prepared,” but a user who reaches the three-project limit has no
way to obtain the advertised unlimited unlock. This does not satisfy the
brief or paid-unlock contract. An operator must register and enable the
product in the Sociobot catalogue at the intended one-time price, then the
checkout, return-token storage, restore, and unlimited-project flow must be
verified live.

### High — the demo falsely says leaving discards its workspace, and no claim test proves it

The privacy page and `.factory/demo.md` say that leaving the demo discards
the sample workspace. In a fresh live context, I selected **Northwind Store**
at `/demo`, followed **Start for real**, and then returned to `/demo`.
`localStorage['demo:pcb:site-state']` was unchanged across the transition and
the confirmation strip still read “Check before editing · Northwind Store.”

This is an unlisted visitor-reliance claim: `demo-isolated` proves the
namespace and outgoing requests, but not reset/disposal on leaving. It fails
the demo-sandbox contract and claims contract. Either clear the `demo:` key
when leaving, or accurately say that the isolated sample remains until Reset
demo; add a tagged observable claim test for the chosen behaviour.

## Clean candidate verification

All ten exact commands in `.factory/claims.json` passed after the mandatory
clean `npm ci` install, each through its declared browser/demo or Rust entry
point:

| Claim ID | Result |
| --- | --- |
| `three-cues` | PASS |
| `confirmation-before-write` | PASS |
| `demo-isolated` | PASS |
| `offline-reload` | PASS |
| `free-project-limit` | PASS |
| `settings-preserved` | PASS |
| `editor-settings` | PASS |
| `project-data-local` | PASS |
| `license-token-only` | PASS |
| `checkout-availability` | PASS |

The unfiltered browser suite also passed **13/13** tests. Other local gates:

- `npm run test:unit` — **4/4** Vitest tests passed.
- `npm run typecheck` — passed; no separate lint script exists.
- `cargo test --manifest-path src-tauri/Cargo.toml --no-default-features` —
  **2/2** passed; `cargo fmt --check` passed.
- `npm run build` — passed and produced `dist/app` and `dist/site`.
- `npm audit --audit-level=high` — 0 vulnerabilities.
- `cargo check --manifest-path src-tauri/Cargo.toml` cannot complete in this
  container because its documented Linux Tauri prerequisite `glib-2.0`
  development package is absent. This is a host dependency, not a candidate
  regression; the published Linux package was independently checked below.

The static site build is within budget: initial JS is 19,544 bytes (6.87 KB
gzip), CSS is 11,149 bytes (3.39 KB gzip), and the mobile hero is 12,684
bytes.

## End-to-end product exercise

In the desktop-shaped `?demo=1` interface at 390 px width, I loaded three
samples; attempted to save with no editor (clear recovery text); attempted a
duplicate folder (clear recovery text); saved a new Payments Worker project;
checked and named-confirmed it; viewed its editor preview; removed and
undid it; and reset the demo to exactly three samples. There were no
console/page errors. The confirmation control has a visible 3 px orange
focus outline and operates by keyboard.

The live `/demo` flow selected Atlas API, showed no editor output before
confirmation, then rendered VS Code and Zed previews after the named
confirmation. Its only online requests were the same-origin document, JS,
CSS, and favicon; its only storage key was `demo:pcb:site-state`. It
reloaded offline after first visit. `registration.update()` completed with
the active `/sw.js` service worker and no errors.

## Live deployment, privacy, accessibility, and release evidence

- Local `npm run build:site` SHA-256 values exactly matched live
  `index.html`, `assets/index-2RGDpD9J.js`, `assets/index-nMnHj5XT.css`, and
  `sw.js`. The deployed product therefore matches this candidate's source
  build (the candidate commit itself changes only the prior handoff record).
- `/`, `/demo`, `/privacy`, `/terms`, and an unknown route each returned 200,
  set a route-appropriate title, `lang=en`, one `main`, and one `h1`; each
  had no console/page errors and no Axe serious or critical violations.
- At 390 × 844 the live landing and demo had 0 px horizontal overflow.
  Reduced motion yielded `animation-duration` and `transition-duration` of
  `0.00001s`.
- CSP restricts scripts to self and connections to self, GitHub API, and
  Sociobot API; HSTS, `nosniff`, referrer, and permissions policies are
  present. Hashed JS/CSS use `Cache-Control: public, max-age=31536000,
  immutable`.
- The landing fetches the GitHub release API and Sociobot catalogue, as
  declared by its download/purchase availability UI. The exercised demo sends
  no project data off-origin. A pasted-license claim test confirms the
  verification request contains only the token.
- The verification endpoint's allowance is enforced: 30 consecutive requests
  from one client returned 200; request 31 returned **429** with
  `Retry-After: 3`. Observed allowance: **30 requests per active window**.
- The public `v0.1.0` release is non-draft and includes macOS arm64/x64,
  Windows MSI/exe, Linux AppImage/deb/rpm, `SHA256SUMS`, and `latest.json`.
  A freshly downloaded Debian package SHA-256 matched `SHA256SUMS`; its
  metadata is `project-color-beacons`, version `0.1.0`, architecture `amd64`.

## Required next steps

1. Register/enable `project-color-beacons` in the public Sociobot catalogue
   and rerun an actual checkout-to-license-to-unlimited-project verification.
2. Make the demo’s leaving behaviour match its privacy/demo copy and add a
   tagged claim test that proves the observable result.
3. Re-run independent verification from a clean checkout and live URL.
