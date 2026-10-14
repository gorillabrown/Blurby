# Sprint Close-Out Governance Staging — UX-POLISH-1

Base `05a5480a` (P5 merged). Branch `eb/ux-polish-1`. `useReaderKeys` ends at `handleEnterNarrate` (slot 28) on the base; `lastReadingMode` is slot 29 as specified. No register writes (standing rule 46).

## Evidence

### Done-when 1 — positive control at C1 (hook unchanged)

`npx vitest run tests/readerKeyboard.test.tsx` → exit 1, 5 failed / 6 passed (11):

- × (a) Space with lastReadingMode focus enters Focus only
- × (b) Space with lastReadingMode flow enters Flow only
- × (c) Space with lastReadingMode narrate enters Narrate only
- × (d) Space with lastReadingMode unset enters Flow
- × (e) Space with lastReadingMode narrate but no enterNarrate bound falls back to Flow

Each fails with `AssertionError: togglePlay: expected "vi.fn()" to be called +0 times, but got 1 times`. (f), (g) and the four existing Flow/N tests pass.

### C2 (`c66d9c9d`)

- Done-when 2: exit 0 (7 files, 156 tests). Done-when 3, 4, 5: each exits 1, empty. Done-when 6: `src/components/ShortcutsOverlay.tsx:3`, exit 0. Done-when 9: fence exact (10 `M` paths plus memo and time log). `npm run typecheck` exit 0, after the C2 test spy was typed as `Mock<() => void>`.
- Done-when 7: `npm test` exit 0 (149 files, 2,049 passed, 1 skipped, 0 failed; worktree with its own `npm ci`); `npm run build` exit 0.
- Done-when 8 (owner smoke): **deferred by the owner to NARRATE-REBUILD-1 P6's G2 production build** (2026-10-13). Record checks (a)–(f) at close-out.
- Reviews: spec compliance APPROVED, with DW7 and DW8 pending at review time (DW7 since passed). Code quality MINOR_FIXES, no blockers. Findings for the planner, not fixed because they are outside this dispatch's edit bounds:
  1. Key repeat: holding Space in Page sends repeats. The first press enters the mode paused, and each repeat hits that mode's Space → `togglePlay`, so it flickers between play and pause. There is no `.repeat` guard in `src`, and the Page iframe forwarder (`src/reader/modes/page/FoliateView.tsx`, forbidden here) drops `repeat`. Smoke (a) or (c) may show it if the key is held.
  2. `lastReadingMode` can lag one IPC round-trip after Shift+Space (`SettingsContext` awaits `saveSettings` before `setSettings`).
  3. `HotkeyMapSettings` renders `key={s.action}`. The spec's Flow rows now duplicate "Previous paragraph" and "Next paragraph", so React warns about duplicate keys in dev. The Focus chapter duplicates were already there.
  4. Stale text left, out of scope: `TECHNICAL_REFERENCE.md` (Shortcut section) still says `] / N`; the comment on `src/types.ts` `lastReadingMode` still says Space "starts" the mode.
