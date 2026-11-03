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
| 4 | `npm test`, typecheck, build | Done on the amended tip `64c2c0b6` | See the amendment below. |
| 5 | Fence (against `eb/focus-keys-fix-1`) | Done so far | `M src/reader/modes/flow/ModeRuntime.ts`, `A tests/readerModes/flowKeys.test.tsx`, `M docs/governance/BUG_REPORT.md` (BUG-211), `M docs/governance/IDEAS.md` (A5), this memo and the time log. |

## Amendment — the browse-away listener ignores modified arrows (rebuilt 2026-10-23)

**Run setup:** this session's worktree `C:\Projects\Blurby\.claude\worktrees\dreamy-wing-fe8fb8`, on a local branch tracking `origin/eb/flow-keys-fix-1` (the local `eb/flow-keys-fix-1` is checked out in `C:\Projects\Blurby\.worktrees\flow-keys-fix-1`, left untouched at `60b86aff`). Merged `origin/eb/focus-keys-fix-1` (`3bfb016e`; one conflict, `BUG_REPORT.md`, every entry kept, BUG-211 in its resolved form) at `6a956841`, then `origin/main` (`013ce8aa`, clean) at `5af83141`. The listener was re-grepped on that tree (rule 36): `FoliateView.tsx`'s `handleKey`, unchanged since `60b86aff`.

**The change:**
- `src/reader/modes/flow/helpers/flowBrowseKey.ts` (new): `isFlowBrowseKey(e)` is true only for PageUp and PageDown with no Shift, Ctrl, Alt or Meta.
- `src/reader/modes/flow/FoliateView.tsx`: the window keydown listener calls `isFlowBrowseKey` and turns the page forward on PageDown, back on PageUp. The arrows no longer mark browse-away or turn a page; `useReaderKeys` owns them.
- **Shortcuts overlay (Fix 3):** `src/components/ShortcutsOverlay.tsx` already lists Flow's ←/→ as "Adjust WPM (-25)" and "Adjust WPM (+25)". No key documentation describes them as look-ahead, so nothing changed.

| # | Done-when | State | Evidence |
|---|---|---|---|
| k1 | Red first | Done | `79909736`, committed alone: the helper keeps today's condition. 18 of 25 fail by assertion (every arrow case, plain or with each modifier, and PageUp/PageDown with each modifier); plain PageUp/PageDown and the five other-key controls pass. `C:\Projects\Blurby-artifacts\keys-fix\flowbrowse-k1-red.log`. Fix `64c2c0b6`: 25 of 25 pass. |
| — | `npm test`, typecheck, build on `64c2c0b6` | Done | 186 files, 2,504 passed / 1 skipped / 0 failed; `npm run typecheck` exit 0; `npm run build` exit 0 (`flowkeys-amend-{test,typecheck,build}.log`). |
| k2 | Live, playing, on the rebuilt package | Done | x64 `--dir` package from a `git archive` of `64c2c0b6` with its own `npm ci` (`eb-out-64c2c0b6`); scratch profile copied from `profile-pristine`, preflight passed (userData = the scratch profile); probe `flow-k2-probe.mjs` (from `flow-play-para-probe.mjs.txt`, adding speed, browse-away and book-view location). Route: *Meditations*, TOC jump to INTRODUCTION, Flow, play from 187. Live profile unchanged. `flow-64c2c0b6-k2.json`, `flow-64c2c0b6-k2-ctrlleft.json`. |

**k2 rows** (each pressed while playing; "after" is the word timer's distinct words over the window):

| Key | At the key | After | Speed | Book view |
|---|---|---|---|---|
| Ctrl+→ | playing, 191 → 192 | 192–196 | 300 | unchanged, not browsed away |
| Ctrl+← | playing, 197 → 196 | 196, 197 in 1.5 s; re-run ×3 over 3 s: 190–197, 197–203, 204–216 | 300 | unchanged |
| Shift+→ | playing, 198 → 5290 | 5290–5295 | 300 | unchanged |
| Shift+← | playing, 5299 → 5290 | 5290–5295 | 300 | unchanged |
| → | playing, 5299 | 5299–5306 | 300 → 325 (+25) | unchanged |
| ← | playing, 5311 | 5311–5315 | 325 → 300 (−25) | unchanged |
| Ctrl+↓ (control) | playing, 5319 → 5355 | 5355–5359 | 300 | unchanged |
| PgDn | **paused**, browsed away | 5364 | 300 | page 0 → 1 (start 191 → 809) |

- **Control on the base:** the same probe on the `60b86aff` package (`flow-60b86aff-k2.json`): Ctrl+→ 191 → 192, then `playing` false and browsed away, and every later row starts paused. The probe sees the defect.
- **Shift+→ landing on 5290** is the slice-index paragraph jump (BUG-217), fixed by FLOW-PARA-KEYS-1, which takes this tip in next. k2 asks only that playback continues.

**Fence (amendment):** `A src/reader/modes/flow/helpers/flowBrowseKey.ts`, `M src/reader/modes/flow/FoliateView.tsx`, `A tests/readerModes/flowBrowseKey.test.ts`, `M docs/governance/BUG_REPORT.md` (BUG-211), this memo. No shared-core file. `tests/perf-baseline-results.json`, rewritten by `npm test`, is left uncommitted.

**Merge order:** this tip lands first; FLOW-PARA-KEYS-1 (`68504ba5`) then takes it in and re-runs its live Shift+→ check.

## Open question for Brain

Flow's `paragraph` case still steps over `this.surface.getParagraphBreaks()` on an EPUB. Those are indices into the loaded slice: the defect Focus's live run measured (187 to 5290) and fixed with `findBookParagraphStart` (ruling A). If Flow reads full-book words too, the same jump is likely. This merge does not change Flow. The held live re-run of #100–103 should check Shift+Right on an EPUB; whether Flow adopts ruling A is Brain's ruling.

## Lessons

- **Applied:**
  - Standing rule 43: red first, with a control.
  - LL-142: classified from measurement. The playing failure is the word timer overwriting the line pacer.
  - Reading-mode separation.
- **Candidate:** when a mode has two pacers (here, Flow's word timer and line pacer), a navigation command must move both. A test must read each pacer's own position, because the published word alone can't tell them apart.
