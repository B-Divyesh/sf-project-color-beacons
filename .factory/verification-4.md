# Independent verification 4 — PASS

- **Candidate:** `7fcd61ab9d4245eee3a2af1293c5cc3b0bfe9bf5`
- **Live URL:** https://project-color-beacons.sociobot.in
- **Verified:** 2026-08-29 from a clean checkout
- **Decision:** **PASS — release candidate satisfies the researched brief and factory contract.**

## First-read test

**Pass.** A cold, cache-free visit says **“Mark the project before you edit.”**
It says it is for dyslexic and ADHD developers using similar windows, explains
that a color, name, and symbol make them clear, and presents **Try it with
sample data** as the first primary action. The adjacent copy says that it opens
three sample projects and saves nothing. The action reaches `/demo` in one
click.

## Claim contract

`.factory/claims.json` exists and contains 11 claims. After `npm ci`, every
declared command was run separately against the shipped local demo entry point
and passed:

| Claim ID | Result |
| --- | --- |
| `three-cues` | PASS |
| `confirmation-before-write` | PASS |
| `demo-isolated` | PASS |
| `demo-disposal` | PASS |
| `offline-reload` | PASS |
| `free-project-limit` | PASS |
| `settings-preserved` | PASS |
| `editor-settings` | PASS |
| `project-data-local` | PASS |
| `license-token-only` | PASS |
| `checkout-availability` | PASS |

The unfiltered Playwright suite also passed **14/14**. This includes the
separate demo namespace and disposal behavior, no pre-confirmation output,
offline reload, named-confirmation flow, fourth-project limit and valid-license
recovery, Rust merge behavior, and supported VS Code/Cursor (`.vscode`) and
Zed (`.zed`) output.

## Local quality gates

- `npm ci` — passed; 0 npm audit vulnerabilities.
- `npm test` — **14/14** passed.
- `npm run test:unit` — **4/4** passed.
- `npm run typecheck` — passed; repository has no lint script.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check` — passed.
- `cargo test --manifest-path src-tauri/Cargo.toml --no-default-features` —
  **2/2** passed.
- `cargo check --manifest-path src-tauri/Cargo.toml` — passed after installing
  the documented Linux Tauri build packages.
- `npm run build` — passed and produced `dist/app` and `dist/site`.

The static site build contains 19,617 bytes of initial JS (6.89 KB gzip) and
11,149 bytes of CSS (3.39 KB gzip), within the static budget. A fresh mobile
Lighthouse run scored performance **96**, accessibility **100**, best
practices **100**, and SEO **100** (LCP 1.01 s, CLS 0, TBT 213 ms).

`CI=false npm run tauri -- build --bundles deb,appimage` built the desktop
binary and Debian package. Its AppImage phase cannot complete in this
disposable container because it exposes no `/dev/fuse`; Tauri reports only
`failed to run linuxdeploy`. This is a container capability limitation, not a
source failure: the public GitHub Actions release is non-draft, includes the
AppImage and all platform assets, and its public Debian artifact is
`project-color-beacons` version `0.1.1` for `amd64`.

## End-to-end, accessibility, privacy, and deployment evidence

- On live `/demo` at 390 × 844, I selected and confirmed Atlas API. Before
  confirmation no editor output appeared; after it, VS Code and Zed settings
  previewed. There was 0 px horizontal overflow and no console or page errors.
- The live demo request log contained only
  `https://project-color-beacons.sociobot.in`; its only storage key was
  `demo:pcb:site-state`. `Start for real` removed it. The demo reloaded
  offline after service-worker activation.
- The live suite checked `/`, `/demo`, `/privacy`, `/terms`, and a missing
  route: each returned 200, had route title, `lang=en`, one `<main>`, one
  `<h1>`, image alternatives, no console/page errors, and no Axe serious or
  critical findings. Keyboard focus is visible; reduced motion is respected.
- Response headers include CSP with only self, GitHub API, and Sociobot API
  connections; HSTS; `nosniff`; strict-origin referrer policy; permissions
  policy; and immutable one-year caching for hashed assets.
- Local and live SHA-256 values matched exactly for `index.html`,
  `assets/index-D4qOuEUU.js`, `assets/index-nMnHj5XT.css`, and `sw.js`.
  The public deployment therefore matches this candidate's product source.
- Live billing passed: exactly one active Project Color Beacons product at
  $24 USD, and `/checkout` answered 303 to the hosted Dodo checkout. The
  public v0.1.1 Debian checksum was
  `e752d589fd324f1d948b1fe6a446864ec78ccc5ae53064cfcff34879ba034c35`,
  exactly matching `SHA256SUMS`.
- The product verification API enforced its allowance: calls 1–30 returned
  200; calls 31–35 returned **429** with `Retry-After: 4`. Observed allowance:
  **30 requests per active window**.

## Defects by severity

None in the candidate. The AppImage local-bundling limitation above is an
environmental limitation of this verification container and is covered by the
published successful multi-platform release; it is not a release defect.
