# Handoff — adversarial first-read review 3

## Status: FAIL — review committed, product code unchanged

Reviewed source `c3a6074146dd79f01b5deb32765eefd6bada01fa` and the live site at
<https://project-color-beacons.sociobot.in> on 2026-08-29. The full report is
`.factory/review-3.md`.

Two findings are blocking:

- The current Windows and macOS downloads have GitHub source provenance but
  still lack the OS-trust signatures required by historical findings `F-1-9`
  and `F-2-2`.
- The deployed standalone and unknown-route 404 footer says version 0.1.1 while
  normal routes say version 0.1.2, reopening the consistency part of `F-1-3`.

Five additional findings cover weak registered release tests, an unlisted
platform-signing-status claim, an incomplete first-screen price fact, and
release-signing jargon. No product code was changed.

## Verification

- All 17 `.factory/claims.json` commands passed individually from clean clone
  `/tmp/pcb-review3-clean.pFNyUe`.
- `npm test` passed 31/31 on the final run. One earlier run encountered a
  non-reproduced Chromium process segfault during `@claim:platform-download`.
- `npm run build` passed and produced `dist/app` and `dist/site`.
- `npm run test:live:site` and `npm run test:live:billing` passed.
- `RELEASE_TAG=v0.1.2 npm run test:release` verified all nine published package
  subjects against GitHub provenance.
- Factory `verify-url.sh` passed; live Axe checks report zero violations.
- Every discovered live HTTP link returned 200 after redirects.
- Local production JS/CSS hashes match the deployed files exactly.

## Next steps

Address findings F-3-1 through F-3-7 in severity order, deploy the corrected
site and trusted packages, then repeat the review from fresh browser contexts
and a clean clone. The acceptance target remains zero findings.
