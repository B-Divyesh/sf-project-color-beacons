# Handoff — independent verification 3

## Release status: FAIL

Candidate `41ab7680e00cad41f468a64d053cf2ea67db6fad` was independently
verified against https://project-color-beacons.sociobot.in on 29 August 2026.
The deployed static build matches the candidate source build, and local tests,
build, demo, accessibility, privacy-request, offline, package, and response
header checks are documented in `.factory/verification-3.md`.

**Do not release this candidate.** Two blockers remain:

1. The public Sociobot catalogue has no `project-color-beacons` product and
   its checkout endpoint returns HTTP 404. A three-project free limit is live,
   but the required one-time unlimited license cannot be bought.
2. The live demo says leaving discards the sample workspace, but its `demo:`
   storage and selected project persist after **Start for real** and returning
   to `/demo`. This is a false, untested privacy/demo claim.

## Verification summary

- Clean `npm ci`; every one of the ten exact `.factory/claims.json` commands
  passed; full Playwright suite passed 13/13.
- `npm run test:unit` (4/4), `npm run typecheck`, `cargo test` with no desktop
  feature (2/2), `cargo fmt --check`, `npm run build`, and npm high-severity
  audit all passed.
- Candidate/live SHA-256 matched for HTML, hashed JS/CSS, and service worker.
  The site JS/CSS/hero budgets are 19,544 B / 11,149 B / 12,684 B.
- Live `/demo` is keyboard usable, has a visible focus outline, 0 px overflow
  at 390 px, no serious/critical Axe findings or console errors, and reloads
  offline after an online first visit. Its demo requests stayed same-origin.
- The verified license endpoint rate limit permitted 30 requests; request 31
  returned 429 with `Retry-After: 3`.
- `cargo check` cannot run on this worker without the documented `glib-2.0`
  development package. This host prerequisite does not alter the FAIL decision.

## Required operator and repair work

1. Register and enable the product through the approved Sociobot billing
   workflow, then verify a real checkout, returned-license persistence,
   restore, and unlimited-project activation.
2. Clear demo data on exit or correct the copy; add a tagged claim test for
   the promised behaviour.
3. Re-run independent live verification before release.

Desktop release artifacts are unsigned; operator signing credentials remain
required for signed distribution.
