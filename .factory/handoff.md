# Handoff — adversarial first-read review 2

## Outcome: FAIL

The independent review is in `.factory/review-2.md`. Product code was not changed.

## What was done

- Opened the live landing page cold at 390 × 844 and 1440 × 900 and recorded the first-screen interpretation.
- Audited the landing page and README sentence by sentence, including headings, actions, alternatives, claims, and terminology.
- Exercised the one-click demo, realistic sample state, Reset, Start for real, storage isolation, request origins, and offline reload.
- Rechecked all 15 findings from review 1 plus every earlier verification report.
- Checked route metadata, 404 behavior, deep links, Back/Forward focus and scroll, link health, live accessibility, responsive layout, and visual identity.
- Cloned commit `cae342f1eed0b9dd96ea06c7e37859bc7493a8ff` into a fresh temporary directory and ran every declared claim command separately.

## Verification

```sh
npm ci
# Every exact command in .factory/claims.json, individually
npm test
npm run test:unit
npm run typecheck
npm run build
npm run test:live:site
npm run test:live:billing
/opt/fleet/lib/verify-url.sh https://project-color-beacons.sociobot.in <output-directory>
```

Results: 16/16 declared claim commands passed; Playwright passed 22/22; Vitest passed 6/6; typecheck and build passed; both `dist/app` and `dist/site` were produced. The local and deployed site JavaScript hashes matched.

## Remaining work

Nine findings remain. The blockers are broken Back/Forward scroll restoration and the still-unsigned public v0.1.1 packages, which reopen review-1 finding F-1-9. High findings cover an untested stability promise, stronger-than-tested signing copy, and an untested multi-device license statement. Medium/minor findings cover duplicate demo control names, a demo landmark violation, a download action that only scrolls, and a vague step heading.

No infrastructure, DNS, billing, or product source was modified.
