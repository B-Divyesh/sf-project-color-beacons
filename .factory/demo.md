# Demo contract

## Entry point

Use `https://project-color-beacons.sociobot.in/demo` in production or `http://127.0.0.1:4173/demo` during verification.

## Sample data

The demo starts with three local-looking projects:

- Atlas API — Fjord color and half-moon symbol
- Northwind Store — Ember color and cross symbol
- Launch Docs — Iris color and arch symbol

Choose **Check project**, compare the four cues, then choose the named **Confirm** button. The result displays the VS Code and Zed files that the desktop app would merge.

## Isolation and reset

The browser demo writes only to `localStorage` key `demo:pcb:site-state`. The desktop-shaped demo at `?demo=1` uses `demo:pcb:projects`. Neither mode reads or writes the real `pcb:projects` key.

The persistent demo banner names the sandbox. **Reset demo** deletes changes and restores the three samples. **Start for real** deletes the demo storage key before leaving the sandbox. On the web demo it then opens the desktop download section.

The sample data and application shell are precached. After the first visit, the demo can be reloaded without a network connection.
