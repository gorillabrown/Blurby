# Dispatch Close-Out Governance Staging — FLOW-KEYS-FIX-1 (code and unit gates done; live check, suite and build held for f0's installer build)

**Run setup:**
- **Branch:** `eb/flow-keys-fix-1`, stacked on `eb/focus-keys-fix-1` (`aa71601b`, later merged up to `4ea05617` for BUG-210 and its memo, then up to `48203707` for Focus's ruling A paragraph keys).
- **Worktree:** `C:\Projects\Blurby\.worktrees\flow-keys-fix-1`. `node_modules` is a junction, as for FOCUS-KEYS-FIX-1.
- **Timing:** after the Stage 8 release (Blurby.Roadmap, 2026-10-23; Seq 77).
- **Register:** nothing was written (standing rule 46).
- **Shared core:** none touched. Flow's line pacer copy is not edited.
- **Bug:** BUG-211.

## The change (per the spec and its prototype)

- **`src/reader/modes/flow/ModeRuntime.ts`, `handleCommand`:**
  - **`flow-line`:** when the line pacer runs, it jumps a line, and then `this.engine?.jumpTo(this.scrollEngine.getWordIndex())` moves the word timer to the same word.
  - **New `seek-words`, `sentence` and `paragraph` cases.** `navigationWord()` gives the word to step from: the playing word timer's word, else the highlighted word. `moveReadingWord(target)` clamps the target.
    - Playing, it calls `engine.jumpTo` and `scrollEngine.jumpToWord`.
    - Otherwise, it sets `explicitSelectionAnchor`, the highlight, and the surface highlight when the surface is ready.
- **`docs/governance/IDEAS.md`:** A5, FLOW-PAUSED-LINE-1 (paused line keys, which are not in this item).

## Evidence

| # | Done-when | State | Evidence |
|---|---|---|---|
| 1 | Red first | Done | `5d88cd28`: the spec's `flowKeys.test.tsx.txt` copied unchanged. On `aa71601b`, 8 of 9 fail, all `AssertionError`; the control passes. |
| 2 | The change | Done | `a054f55a`. Both red files pass. `tests/readerModes/`, `readerModeBoundaries`, `readerModeOwnership`, `flowModeAdapter`, `focusModeAdapter`, `modes`, `readerSpeedDialog` and `useReadingModeInstance`: 22 files, 204 tests, all passed. `npm run typecheck` exit 0. |
| 2b | Merge of `48203707` (Focus ruling A) | Done | Clean merge. Re-run (2026-10-23): the same suites plus `bookParagraphStart`: 24 files, 213 tests, all passed; `npm run typecheck` exit 0. |
| 3 | Live, `--dir` build, triage re-run of #100–103 | **Held** | Blurby.Roadmap: no live launches while blurby-f0 builds the installers. |
| 4 | `npm test`, typecheck, build | Typecheck done; suite and build **held** | Held for the same reason. |
| 5 | Fence (against `eb/focus-keys-fix-1`) | Done so far | `M src/reader/modes/flow/ModeRuntime.ts`, `A tests/readerModes/flowKeys.test.tsx`, `M docs/governance/BUG_REPORT.md` (BUG-211), `M docs/governance/IDEAS.md` (A5), this memo and the time log. |

## Open question for Brain

Flow's `paragraph` case still steps over `this.surface.getParagraphBreaks()` on an EPUB. Those are indices into the loaded slice: the defect Focus's live run measured (187 to 5290) and fixed with `findBookParagraphStart` (ruling A). If Flow reads full-book words too, the same jump is likely. This merge does not change Flow. The held live re-run of #100–103 should check Shift+Right on an EPUB; whether Flow adopts ruling A is Brain's ruling.

## Lessons

- **Applied:**
  - Standing rule 43: red first, with a control.
  - LL-142: classified from measurement. The playing failure is the word timer overwriting the line pacer.
  - Reading-mode separation.
- **Candidate:** when a mode has two pacers (here, Flow's word timer and line pacer), a navigation command must move both. A test must read each pacer's own position, because the published word alone can't tell them apart.
