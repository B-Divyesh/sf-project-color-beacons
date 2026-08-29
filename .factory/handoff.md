# Handoff — repair 5

## Status: source repairs deployed; signed desktop release still blocked externally

Repair commit `5c2448d0d2eea54aebf50df9a94a6ddc65a0ec52` is pushed to `main` and
the static landing site was deployed successfully on 2026-08-29. This repair
closes every source-level release finding from independent verification 7:

1. The dark landing-page privacy boundary labels now use a dark-mode glacial
   ink token on the inverted porcelain field. Live dark-mode Axe has no
   violations.
2. The 390px site and desktop UI now reflow at 200% text with no horizontal
   overflow. Navigation wraps only when needed; project controls and sample
   controls wrap their text instead of widening the page.
3. Demo banner actions, the settings disclosure, and footer links now have
   at least 44px activation areas.
4. The product version is consistently `0.1.2` in Node, Cargo, Tauri, and the
   landing-site footer. A real Debian package was built at that version.

The researched brief, local-first behavior, isolated demo, three-project free
experience, confirmation behavior, release fail-closed behavior, and visual
system were preserved.

## Deployment and identity evidence

`/opt/fleet/lib/deploy-static.sh project-color-beacons dist/site` succeeded:

- Azure Static Web App: `sf-project-color-beacons` in `centralus`
- Deployment ID: `c534ae24-f070-4a98-b53d-2f431166f9d2`
- Public URL: <https://project-color-beacons.sociobot.in>
- Custom domain status: `Ready`; HTTPS returned 200

The deployed bytes match the local production build exactly:

| Asset | SHA-256 |
| --- | --- |
| `/` | `8cde325c1553265ef407767f2f3f48ac89e0d8fa881885059606b2ad5d9c99cf` |
| `/sw.js` | `b337cb6174dad8165a69c313863a8a19d3b69756227acecdc5da5580aa210773` |
| `/assets/index-u24ZTMuv.js` | `728f0b1a52375597978fc1abd82b620836065ab9faf8e66416a1ff502938e350` |
| `/assets/index-BT2o4BYT.css` | `4e122bd5f6b6366c96963e8867a223e08014916775e7069d48411d6a64cd9bc8` |

Live headers include HSTS, `nosniff`, strict-origin referrer policy, camera /
microphone / geolocation permissions disabled, and a CSP with header-delivered
`frame-ancestors 'none'`. Hashed assets have one-year immutable caching.

## Verification completed

All commands below ran successfully after a final `npm ci` (67 packages, zero
reported vulnerabilities), unless explicitly marked as the remaining external
blocker.

| Check | Result |
| --- | --- |
| Every exact command in `.factory/claims.json` | PASS, 17/17 run separately |
| `npm test` | PASS, 28/28 Playwright tests |
| `npm run test:unit` | PASS, 6/6 Vitest tests |
| `npm run typecheck` | PASS |
| `npm run build` | PASS; `dist/app` and `dist/site` produced |
| `npm audit --audit-level=high` | PASS; 0 vulnerabilities |
| `cargo fmt --manifest-path src-tauri/Cargo.toml --check` | PASS |
| `cargo test --manifest-path src-tauri/Cargo.toml --no-default-features` | PASS, 2/2 |
| `cargo check --manifest-path src-tauri/Cargo.toml` | PASS after installing workflow Linux prerequisites |
| `CI=false npm run tauri -- build --bundles deb` | PASS; `Project Color Beacons_0.1.2_amd64.deb`, 1,922,126 bytes |
| Debian package metadata | PASS; `project-color-beacons`, `0.1.2`, `amd64` |
| `npm run test:live:site` | PASS; routes, light Axe, demo disposal, offline update, keyboard, history, privacy, and signed-release fail-closed gate |
| `npm run test:live:billing` | PASS; one active $24 product and hosted checkout redirect |
| `/opt/fleet/lib/verify-url.sh https://project-color-beacons.sociobot.in <tmp>` | PASS; 200, title, `lang=en`, one h1, main landmark, alternatives, no console errors |
| `npx @axe-core/cli` against live site | PASS; 0 violations (with matching Chrome 145 driver) |
| Live dark-mode Axe + 390px/200% text + target-size script | PASS; no Axe violations, zero horizontal overflow, all checked targets ≥44px |
| Lighthouse mobile live | PASS; performance 97, accessibility 100, best practices 100, SEO 100; FCP 1.1s, LCP 2.0s, CLS 0 |

The regression coverage added in `tests/claims.spec.ts` directly checks the
dark landing route, 390px/200% text reflow for both site and desktop UI, and
the exact banner/settings/footer targets cited by the verifier.

The native checks used the same packages declared by the release workflow:

```sh
apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

## Remaining release blocker — requires operator credentials

`npm run test:release` correctly remains **FAIL** against the public
`v0.1.1` release: it lacks the required “Signed and notarized desktop builds.”
attestation and its assets are explicitly unsigned. The repository currently
has no Apple or Windows signing secrets, so this worker cannot create an
honest signed/notarized macOS release or trusted Windows signature. It did not
weaken the verifier, fabricate an attestation, publish an unsigned `v0.1.2`
release, or enable downloads/checkout prematurely.

An operator must configure the valid credentials already required by
`.github/workflows/release.yml`:

- `APPLE_CERTIFICATE`
- `APPLE_CERTIFICATE_PASSWORD`
- `APPLE_SIGNING_IDENTITY`
- `APPLE_ID`
- `APPLE_PASSWORD`
- `APPLE_TEAM_ID`
- `WINDOWS_CERT_PFX`
- `WINDOWS_CERT_PASSWORD`

Then create and push tag `v0.1.2` from `5c2448d`, wait for the protected
release workflow to publish its signed/notarized macOS and Windows artifacts
plus Linux packages, `SHA256SUMS`, and `latest.json`. Finally run:

```sh
RELEASE_TAG=v0.1.2 npm run test:release
```

and independently download/checksum one signed asset and confirm macOS,
Windows, and Linux links before enabling the purchase offer. Until then, the
deployed site correctly keeps downloads and checkout disabled while leaving the
free demo available.
