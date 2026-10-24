# OVERLAY-THEME-SWEEP-1 — base observation (Done-when 1), 2026-10-24

**Build:** packaged `npx electron-builder --win --dir --arm64` of the branch base `d2a70ff1` (= `origin/main` at dispatch), run from a copy of `release\win-arm64-unpacked` (BUG-194) at `C:\Projects\Blurby-artifacts\overlay-theme-sweep-1\base-unpacked`. No source change was in the build.
**Profile:** fresh empty scratch profile (`profile-base-3`), passed as `--user-data-dir` and `BLURBY_USER_DATA_DIR`; the sample book `sample-meditations` is seeded by the app on first launch. Preflight as `scripts/ui-sweep/sweep.mjs` `Session.profilePreflight`: `app.getPath('userData')` read over the main-process inspector equals the scratch profile, not under `%APPDATA%\blurby`; `blurby-data/covers` appeared. Live `library.json` `d4b884bd…` and `settings.json` `2e1d5245…` hashes identical before and after (`liveUnchanged: true`).
**Driver:** `OVERLAY-THEME-SWEEP-1.probe.mjs.txt` (CDP on port 9470, inspector 10470). Every verdict below is read with `Runtime.evaluate` (DOM presence, `document.activeElement`, `getComputedStyle`, `:root` tokens resolved to `rgb()` through a scratch element); presses are `Input.dispatchKeyEvent` / `Input.dispatchMouseEvent`. Tables produced by `OVERLAY-THEME-SWEEP-1.summarize.mjs.txt`. Run 02:57:12–02:57:58Z.

## Positive controls
- **(c1)** Settings → Theme, Light then Dark: `:root --bg` `#f5f3ef` → `#0f0f0f`. **Pass.**
- **(c2)** Reader open in Page mode, no overlay, Escape: `.rbb-mode-btn` present → gone. **Pass.**

## Escape
| Check | Before Escape | 500 ms after Escape | Verdict |
|---|---|---|---|
| (b1) Page mode, `;` | `.highlights-overlay` present, active element `.highlights-search`, `.rbb-mode-btn` present | `.rbb-mode-btn` **gone** (reader exited); `.highlights-overlay` still present, now over the library | Defect confirmed |
| (b2) quick settings | `.quick-settings-popover` present, `.rbb-mode-btn` present | `.rbb-mode-btn` **gone** (reader exited); popover still present over the library | Defect confirmed |

- Expected "both overlays gone and reader exited": the reader exits as expected; the overlay is **not** gone. The library renders its own copy of the same overlay from the same `activeOverlay` state (`LibraryContainer.tsx:728`, `:734`), so the overlay reappears over the library. Either way Escape leaves the book, which is the defect. Neither stop rule fires.
- **(b2) route (BUG-215).** The app has no working route to quick settings: Ctrl+Shift+, with `key ","` reaches the Ctrl+, branch (`useKeyboardShortcuts.ts:323`) and opens Settings. The probe opens quick settings by pressing `;` and then calling the `activeOverlay` hook's own React dispatcher with `"quickSettings"` (the same state `;` sets). The popover and its listener are the ones the app renders.

## Tokens
- **Go-to indicator route (†):** `g` in the library never shows `.goto-indicator` within 600 ms in any theme: `GoToIndicator` mounts on `goToPending` after `startGoTo` has already fired `blurby:goto-pending`, so its listener misses the event. The probe dispatches a second `blurby:goto-pending` while the sequence is still pending (within `G_SEQUENCE_TIMEOUT_MS`), and the indicator appears. Found defect, out of scope (memo).
- Snooze (`h`) and tag (`l`) pickers opened on the focused book (ArrowDown) in the library; highlights (`;`) and quick settings in the reader; then the non-active mode button (Focus) hovered with `Input.dispatchMouseEvent` (`:hover` read back true).
- Expected on the base: panel background `rgb(26, 26, 46)` in every theme; hovered mode button `rgb(68, 68, 68)`. **Observed: exactly that.** No panel already equals the theme tokens, so no panel is dropped.

| Theme | data-theme / data-eink | --bg-raised | --border | --text | Panel | background | border-top | color | bg=raised | border=border | color=text |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Blurby | blurby / - | rgb(34, 52, 86) | rgb(45, 74, 110) | rgb(255, 255, 255) | goto † | rgb(26, 26, 46) | rgb(51, 51, 51) | rgb(224, 224, 224) | false | false | false |
| Blurby | blurby / - | rgb(34, 52, 86) | rgb(45, 74, 110) | rgb(255, 255, 255) | snooze | rgb(26, 26, 46) | rgb(51, 51, 51) | rgb(255, 255, 255) | false | false | true |
| Blurby | blurby / - | rgb(34, 52, 86) | rgb(45, 74, 110) | rgb(255, 255, 255) | tag | rgb(26, 26, 46) | rgb(51, 51, 51) | rgb(255, 255, 255) | false | false | true |
| Blurby | blurby / - | rgb(34, 52, 86) | rgb(45, 74, 110) | rgb(255, 255, 255) | highlights | rgb(26, 26, 46) | rgb(51, 51, 51) | rgb(255, 255, 255) | false | false | true |
| Blurby | blurby / - | rgb(34, 52, 86) | rgb(45, 74, 110) | rgb(255, 255, 255) | quickSettings | rgb(26, 26, 46) | rgb(51, 51, 51) | rgb(255, 255, 255) | false | false | true |
| Dark | dark / - | rgb(24, 24, 24) | rgb(42, 42, 42) | rgb(232, 228, 222) | goto † | rgb(26, 26, 46) | rgb(51, 51, 51) | rgb(224, 224, 224) | false | false | false |
| Dark | dark / - | rgb(24, 24, 24) | rgb(42, 42, 42) | rgb(232, 228, 222) | snooze | rgb(26, 26, 46) | rgb(51, 51, 51) | rgb(232, 228, 222) | false | false | true |
| Dark | dark / - | rgb(24, 24, 24) | rgb(42, 42, 42) | rgb(232, 228, 222) | tag | rgb(26, 26, 46) | rgb(51, 51, 51) | rgb(232, 228, 222) | false | false | true |
| Dark | dark / - | rgb(24, 24, 24) | rgb(42, 42, 42) | rgb(232, 228, 222) | highlights | rgb(26, 26, 46) | rgb(51, 51, 51) | rgb(232, 228, 222) | false | false | true |
| Dark | dark / - | rgb(24, 24, 24) | rgb(42, 42, 42) | rgb(232, 228, 222) | quickSettings | rgb(26, 26, 46) | rgb(51, 51, 51) | rgb(232, 228, 222) | false | false | true |
| Light | light / - | rgb(255, 255, 255) | rgb(212, 208, 202) | rgb(26, 26, 26) | goto † | rgb(26, 26, 46) | rgb(51, 51, 51) | rgb(224, 224, 224) | false | false | false |
| Light | light / - | rgb(255, 255, 255) | rgb(212, 208, 202) | rgb(26, 26, 26) | snooze | rgb(26, 26, 46) | rgb(51, 51, 51) | rgb(26, 26, 26) | false | false | true |
| Light | light / - | rgb(255, 255, 255) | rgb(212, 208, 202) | rgb(26, 26, 26) | tag | rgb(26, 26, 46) | rgb(51, 51, 51) | rgb(26, 26, 26) | false | false | true |
| Light | light / - | rgb(255, 255, 255) | rgb(212, 208, 202) | rgb(26, 26, 26) | highlights | rgb(26, 26, 46) | rgb(51, 51, 51) | rgb(26, 26, 26) | false | false | true |
| Light | light / - | rgb(255, 255, 255) | rgb(212, 208, 202) | rgb(26, 26, 26) | quickSettings | rgb(26, 26, 46) | rgb(51, 51, 51) | rgb(26, 26, 26) | false | false | true |
| E-ink | eink / true | rgb(222, 218, 208) | rgb(184, 180, 168) | rgb(26, 26, 26) | goto † | rgb(26, 26, 46) | rgb(51, 51, 51) | rgb(224, 224, 224) | false | false | false |
| E-ink | eink / true | rgb(222, 218, 208) | rgb(184, 180, 168) | rgb(26, 26, 26) | snooze | rgb(26, 26, 46) | rgb(51, 51, 51) | rgb(26, 26, 26) | false | false | true |
| E-ink | eink / true | rgb(222, 218, 208) | rgb(184, 180, 168) | rgb(26, 26, 26) | tag | rgb(26, 26, 46) | rgb(51, 51, 51) | rgb(26, 26, 26) | false | false | true |
| E-ink | eink / true | rgb(222, 218, 208) | rgb(184, 180, 168) | rgb(26, 26, 26) | highlights | rgb(26, 26, 46) | rgb(51, 51, 51) | rgb(26, 26, 26) | false | false | true |
| E-ink | eink / true | rgb(222, 218, 208) | rgb(184, 180, 168) | rgb(26, 26, 26) | quickSettings | rgb(26, 26, 46) | rgb(51, 51, 51) | rgb(26, 26, 26) | false | false | true |

| Theme | hovered button | :hover | backgroundColor | --border | equal |
|---|---|---|---|---|---|
| Blurby | Focus mode | true | rgb(68, 68, 68) | rgb(45, 74, 110) | false |
| Dark | Focus mode | true | rgb(68, 68, 68) | rgb(42, 42, 42) | false |
| Light | Focus mode | true | rgb(68, 68, 68) | rgb(212, 208, 202) | false |
| E-ink | Focus mode | true | rgb(68, 68, 68) | rgb(184, 180, 168) | false |

- Panel `color` equals `--text` on four of the five panels on the base because those containers set no `color` and inherit it; the go-to indicator sets `var(--color-text, #e0e0e0)` and shows `rgb(224, 224, 224)` in every theme (light text on Light and E-ink).
- Page exceptions in this run: none. App log: nine `[ws-server] … EADDRINUSE 127.0.0.1:48924` lines; the port is held by the owner's installed Blurby (`AppData\Local\Programs\blurby\Blurby.exe`, PID 16120), known noise under rule 53.
- Earlier attempts: `profile-base-1` stopped before any verdict (the settings flap opens on the reading queue; probe fixed to press its settings button); `profile-base-2` recorded (c1), (c2) and (b1) as above, then stopped because the overlay left over the library covered the book card (probe fixed to close it with the library's Escape). A later control run (`profile-base-4`, after the tip runs) repeated every figure above and logged one page exception during the Light round, `TypeError: Cannot destructure property 'style' of 'r' as it is null.` from foliate's `paginator` chunk; the same exception appears on the tip (after memo), so it predates this item.
