# Review 4 handoff — FAIL

## Outcome

Independent review of the live product failed. No product code was changed.

Blocking finding: the landing page again links to and sells unsigned Windows and macOS packages. This regresses historical findings `F-1-9`, `F-2-2`, and `F-3-1`; see [review-4.md](review-4.md).

Additional findings: the landing license field falsely promises to restore the device, and the README uses unexplained “CORS-safe” jargon.

## What was verified

- Fresh browser contexts at 390 × 844 and 1440 × 900; clear first screen and one-click completed demo.
- Demo storage isolation, reset/disposal, offline reload, request log, keyboard, accessibility, route history, 404 behavior, metadata, links, and distinct visual system.
- Fresh clone: all 18 registered claim commands passed; full `npm test` passed 33/33; `npm run test:unit` passed 7/7; typecheck and production build passed.
- Live Windows/macOS user-agent checks found direct package links and a purchase link. Release `v0.1.5` records `authenticodeVerified: false`, `codeSigned: false`, and `notarized: false`.

## Required next steps

1. Publish verified Windows Authenticode and Apple signed/notarized packages, or remove Windows/macOS links and purchase access until they exist.
2. Replace the web license-restoration promise with a truthful desktop recovery flow and add an end-to-end claim test.
3. Replace “CORS-safe” with plain language in the README.

## Reproduce

```sh
npm ci
npm test
npm run test:unit
npm run typecheck
npm run build
```

Use <https://project-color-beacons.sociobot.in/demo> for the isolated sample workspace.
