# Handoff — adversarial first-read review 1

## Outcome

Review verdict: **FAIL**. The full report is in `.factory/review-1.md`.

No product code was changed. The review found 15 items, including two blockers:

1. The one-click demo does not show a completed, useful sample result in its first 390 × 844 viewport.
2. Unknown URLs render a designed message but return HTTP 200 rather than a real 404 response.

The remaining findings cover the incomplete standalone 404 skeleton, claims missing from `.factory/claims.json`, unsigned desktop packages, inconsistent cue terminology, and headings that do not meet the plain-words standard.

## Verification completed

Run from a fresh temporary clone after `npm ci`:

- All 11 exact commands in `.factory/claims.json` passed separately.
- `npm test` passed 14/14 tests.
- `npm run test:unit` passed 4/4 tests.
- `npm run typecheck` passed.
- `npm run build` passed and produced `dist/app` and `dist/site`.
- `npm run test:live:site` passed.
- `npm run test:live:billing` passed.

Live checks also confirmed:

- Cold first-screen clarity at 390 × 844 and 1440 × 900.
- Same-origin demo requests and only `demo:pcb:site-state` storage.
- Real-data sentinel isolation, Reset behavior, demo disposal, and offline reload.
- Route metadata, keyboard focus, reduced motion, Axe results, link health, and distinct visual identity.
- Factory `verify-url.sh` passed with no console errors.
- Prior checkout, unit-test, cache-header, incomplete-claim-test, and demo-disposal defects remain fixed.

## Files changed

- Added `.factory/review-1.md`.
- Replaced `.factory/handoff.md` with this review handoff.

## Next step

Address every finding in `.factory/review-1.md`, deploy the repaired build, and rerun the whole review from a fresh browser context and clean clone. Do not treat the passing automated suite as acceptance while the two blockers and unlisted claims remain.
