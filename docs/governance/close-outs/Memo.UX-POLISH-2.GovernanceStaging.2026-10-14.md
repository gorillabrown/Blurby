# Sprint Close-Out Governance Staging — UX-POLISH-2

Worktree-resident run (`eb/ux-polish-2`, `C:\Projects\Blurby\.worktrees\ux-polish-2`, from `refs/remotes/origin/main` @ `e476aed1`), dispatched by Blurby.Roadmap 2026-10-14. Light waves (A, B and the reviews) run while the NARRATE-REBUILD-1 completion waits for a quiet machine. Wave C's heavy gates run after the epic merges. Blurby.Roadmap runs the close-out.

## Gate evidence

### Setup (2026-10-14)
- Reconciliation recipe: every STOP passed; `npm ci` exit 0; at `e476aed1`.
- Re-grep on `e476aed1` (standing rule 36): the hook's Escape line is still `:241`. The forwarders are at `page:680`, `focus:805` and `flow:880` (narrate `:934`, untouched). `ShortcutsOverlay.tsx:177-190`, `HotkeyMapSettings.tsx:130`, `ReaderBottomBar.tsx:55`, `types.ts:188`, `keyboard.css:269-270` and `:297`, `page-reader.css:463` and `:490`, and the test anchors (`readerKeyboard` `:135` and `:259`, `foliate-bridge` `:40`, `readerBottomBarControls` `:272`) all match. **Drift:** the `TECHNICAL_REFERENCE.md` `] / N` sentence is at `:784` (the specification says `:785`); content identical.
- Shared core: `git diff --name-only refs/remotes/origin/main refs/heads/eb/narrate-rebuild-1-p6` lists no code path (epic docs and two governance files only), so the `src/types.ts` comment edit collides with nothing.

### Owner smoke (Done-when 12)
Owner smoke deferred to batched smoke by Blurby Brain 2026-10-14 (Rule 11; owner is away).

### Done-when 1 — positive control at C1 (re-run by the orchestrator)
`npx vitest run tests/readerKeyboard.test.tsx tests/foliate-bridge.test.ts tests/readerBottomBarControls.test.tsx tests/helpSurfaces.test.tsx`: **exit 1**, `Tests 11 failed | 29 passed (40)`.
- Failing, exactly the expected set:
  - (h): `enterFlow` called once.
  - (i): `togglePlay` called.
  - (j): `cycleMode` called once.
  - (k) ×3: page, focus and flow lack `repeat: ke.repeat`.
  - (l): the old hint string.
  - (m): "Encountered two children with the same key" logged, with 83 `.hotkey-row` elements, so the check is non-vacuous.
  - (n): `exitReader` called beside `onClose`.
  - (o): `--color-bg` defined in 0 theme maps.
  - (p): the `.rbb-mode-btn` border does not read `var(--border)`.
- Passing: control (q) and every existing test in the four files.

### Done-when 2–10 — at C2 (re-run by the orchestrator; working tree, then committed)
- DW2: 21 files, 177 tests passed, **exit 0**.
- DW3, DW4, DW5, DW6 (grep): exit 1, empty.
- DW7: `:1` on page, focus and flow; narrate exit 1, empty.
- DW8: `src/hooks/useKeyboardShortcuts.ts:243` (one line). DW9: `src/components/ShortcutsOverlay.tsx:189` (one line).
- DW10: `src/styles/keyboard.css:5`; the old `.rbb-mode-btn--last` border line exits 1, empty.
- Numstat (working tree, implementation agent): `src/types.ts` `1 1`; `src/reader` three `1 1` lines.
- `npm run typecheck` (implementation agent): exit 0.
