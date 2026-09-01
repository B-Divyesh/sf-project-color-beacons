# Copy audit

Checked 2026-09-01 for polish round 5. Hyphenated terms, paths, prices, and versions count as one word. No sentence exceeds 22 words. No user-facing sentence contains a banned marketing term.

## Landing page sentences

| Words | Location | Sentence |
| ---: | --- | --- |
| 6 | h1 | Mark the project before you edit. |
| 13 | hero | For dyslexic and ADHD developers who need distinct cues across similar project windows. |
| 6 | demo note | The demo opens a completed sample. |
| 3 | demo note | Nothing is saved. |
| 9 | fact | Project data stays on your device during normal use. |
| 8 | fact | The demo reloads offline after its first visit. |
| 9 | fact | Three projects are free; unlimited projects cost $24 once. |
| 9 | image alternative | Six distinct ceramic symbols sit beside layered window-like panes. |
| 8 | image caption | Each project repeats one symbol, color, and name. |
| 7 | preview | The strip repeats the three beacon cues. |
| 9 | preview | You press the named button before editor settings change. |
| 11 | how it works | The app writes supported settings for VS Code, Cursor, and Zed. |
| 7 | how it works | Existing unrelated JSON settings stay in place. |
| 9 | step 1 | Name the project and pick its symbol and color. |
| 9 | step 2 | Check the three beacon cues and the folder path. |
| 9 | step 3 | The app merges the beacon into supported project files. |
| 9 | privacy | Every beacon includes a written name, symbol, and color. |
| 7 | privacy | Editor settings wait for the named confirmation. |
| 9 | privacy | Project data stays on this device during normal use. |
| 12 | pricing | Color, name, symbol, and confirmation are free for up to three projects. |
| 7 | pricing | A valid license removes the project limit. |
| 8 | download state | A verified [platform] download is not published yet. |
| 6 | download state | The free browser demo remains available. |
| 7 | trusted Linux state pattern | v0.1.6 · [package filename] · verified package origin. |
| 10 | trusted Windows state pattern | v0.1.6 · [package filename] · verified package origin · Authenticode verified. |
| 12 | trusted macOS state pattern | v0.1.6 · [package filename] · verified package origin · Apple signed and notarized. |
| 10 | purchase state | License purchases open with an installable package for this platform. |
| 4 | purchase detail | $24 one-time · unlimited projects. |
| 5 | purchase state | License purchases are being prepared. |
| 6 | purchase state | The free app stores three projects. |
| 4 | license guidance | Already have a license? |
| 10 | license guidance | In the desktop app, choose License and paste your key. |
| 4 | purchase return | Your license is ready. |
| 9 | purchase return | Copy it, then paste it into the desktop app. |
| 3 | copy result | License key copied. |
| 9 | copy result | In the desktop app, choose License and paste it. |
| 4 | copy fallback | Copy the selected key. |
| 6 | footer | Mark each project before you edit. |

## Landing headings and actions

| Words | Type | Text |
| ---: | --- | --- |
| 4 | eyebrow | A local desktop helper |
| 5 | primary action | Try it with sample data |
| 2 | action | View downloads |
| 4 | h2 | Preview the confirmation strip |
| 6 | h2 | Set a beacon in three steps |
| 3 | step heading | Choose a folder |
| 4 | step heading | Check the confirmation strip |
| 3 | step heading | Write editor settings |
| 2 | eyebrow | Privacy boundaries |
| 5 | h2 | What stays on your device |
| 2 | eyebrow | Desktop app |
| 4 | h2 | Start with three projects |
| 4 | unavailable action | Verified [platform] download pending |
| 4 | field label | License key from checkout |
| 3 | action | Copy license key |

## Demo and error copy checked

The demo uses “three beacon cues” for color, name, and symbol. It calls the local path a separate “folder path.” Each project control includes its project name. The demo eyebrow is “Separate sample workspace.” Both 404 versions say “Page not found,” “This address does not match a page,” and “Return home.”

## README check

Every prose sentence in `README.md` is 22 words or fewer. “Safe” is absent from headings and labels. The persistence sentence matches `beacon-stability`. Release-manifest, release-matrix, GitHub-provenance, platform-signature, reset, platform-selection, and checkout-release statements each have a tagged claim test.

The release status uses “verified package origin” for GitHub provenance. It reserves “signed” and “notarized” for operating-system trust checks.

The README states that every platform needs a complete release with verified GitHub provenance. It states the additional Windows and macOS trust checks. It also states that unsigned Windows and macOS packages and their purchase links stay unavailable.

The first-screen and purchase prices come from the active catalogue when it loads. The registered live product is $24 once.

The README uses “browser-accessible API” instead of browser-security jargon. It directs license holders to the desktop app and makes no website restoration promise.

## Terminology

| Concept | One term |
| --- | --- |
| A project's combined identity | beacon |
| Its three repeated identity parts | beacon cues |
| The local directory check | folder path |
| The pre-action identity display | confirmation strip |
| The isolated sample experience | demo |
| An entitlement that passed verification | valid license |
| Configuration written into an editor folder | editor settings |
| GitHub record of package origin | GitHub provenance file |

Catalog description: “Mark a project with a color, name, and symbol before you edit.” (12 words, 62 characters without the newline.)
