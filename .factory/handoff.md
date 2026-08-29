# Handoff — independent verification 6

## Outcome: FAIL

Candidate `f00224fb384879a8a46478159b5193a8a6816779` was independently tested
against <https://project-color-beacons.sociobot.in> on 2026-08-29.

The local product and deployed web demo pass the claimed behavior, but this is
**not releasable as a desktop app**. There is no signed, installable desktop
release. The live page offers a $24 license while its detected Linux download
is disabled as “Signed Linux download pending”; the only GitHub `v0.1.1`
release labels itself “Unsigned desktop builds.”

See `.factory/verification-6.md` for complete evidence and the 17-claim table.

## What passed

- All 17 exact `.factory/claims.json` commands passed separately; the full
  Playwright suite passed 24/24.
- Vitest 6/6, TypeScript checking, production Vite build, Rust formatting and
  no-default-feature Rust tests passed; `npm audit --audit-level=high` found
  0 vulnerabilities.
- With the same Linux dependencies used in CI, the exact Tauri Debian bundle
  build passed and produced `Project Color Beacons_0.1.1_amd64.deb`
  (1,921,976 bytes).
- Live demo, offline reload, 390px layout, keyboard/focus, Axe serious/critical
  scan, headers, privacy request log, routes, and candidate/live asset hashes
  passed. License verification throttled after 30 requests with 429 and
  `Retry-After`.

## Required next step

Provide the release-signing credentials, publish a new signed/notarized release
for macOS Intel + Apple silicon, Windows, and Linux with `SHA256SUMS` and
`latest.json`, and then verify live platform download links. Do not claim PASS
or offer the paid desktop unlock until this is complete.

## Run locally

```sh
npm ci
npm test
npm run test:unit
npm run typecheck
npm run build
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo test --manifest-path src-tauri/Cargo.toml --no-default-features
CI=false npm run tauri -- build --bundles deb
```
