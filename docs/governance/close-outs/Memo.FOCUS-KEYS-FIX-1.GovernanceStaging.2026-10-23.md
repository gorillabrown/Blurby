# Dispatch Close-Out Governance Staging — FOCUS-KEYS-FIX-1 (code and unit gates done; live check, suite and build held for f0's installer build)

**Run setup:**
- **Branch:** `eb/focus-keys-fix-1` from `refs/remotes/origin/main` @ `b6db250a`.
- **Worktree:** `C:\Projects\Blurby\.worktrees\focus-keys-fix-1`. `node_modules` is a junction to `keep-furthest-fix-1`'s; `package.json` and `package-lock.json` are identical to `36ac7466`.
- **Timing:** after the Stage 8 release (Blurby.Roadmap, 2026-10-23; Seq 76).
- **Register:** nothing was written (standing rule 46).
- **Shared core:** none touched.
- **Bug:** BUG-210.

## The change (per the spec and its prototype)

- **`src/reader/modes/focus/ModeRuntime.ts`, `handleCommand`:**
  - `seek-words` moves the reading word by `delta`.
  - New `sentence` case: moves to `findSentenceBoundary`.
  - New `paragraph` case: moves to `findParagraphStart`, over the surface's paragraph breaks for an EPUB, else the document's.
  - `navigationWord()` gives the word to step from: the engine's word, else the highlighted word.
  - `moveReadingWord(target)` clamps the target. With an engine, it calls `FocusMode.jumpTo`, whose advance publishes the word. Without one, it sets `explicitSelectionAnchor`, the highlight, the display word and the surface highlight.
- **`src/utils/text.ts`:** `findParagraphStart`, v1.28.0's paragraph rule as a pure function.
- **`boundary-policy.json`:** `findParagraphStart` added to `src/utils/text.ts`'s declared exports.
- **`src/reader/modes/ReaderModeAdapter.ts`:** the `paragraph` and `sentence` comments now read `// Page, Focus, Flow`.

## Evidence

| # | Done-when | State | Evidence |
|---|---|---|---|
| 1 | Red first | Done | `1f8ffc40`: the spec's `focusKeys.test.tsx.txt` copied unchanged. On `b6db250a`, 6 of 7 fail, all `AssertionError`; the control passes. |
| 2 | The change | Done | `aa71601b`. The red file passes 7/7. `tests/readerModes/`, `readerModeBoundaries`, `readerModeOwnership`, `focusModeAdapter` and `modes`: 18 files, 132 tests, all passed. `npm run typecheck` exit 0. |
| 3 | Live, `--dir` build, triage re-run of #92–95 | **Held** | Blurby.Roadmap: no live launches while blurby-f0 builds the installers. Runs on Roadmap's confirmation. |
| 4 | `npm test`, typecheck, build | Typecheck done; suite and build **held** | Held for the same reason. |
| 5 | Fence | Done so far | `M src/reader/modes/focus/ModeRuntime.ts`, `M src/utils/text.ts`, `M src/reader/modes/ReaderModeAdapter.ts`, `M .../boundary-policy.json`, `A tests/readerModes/focusKeys.test.tsx`, `M docs/governance/BUG_REPORT.md` (BUG-210), this memo and the time log. `tests/perf-baseline-results.json` is not staged. |

## Lessons

- **Applied:**
  - Standing rule 43: red first, with a control.
  - LL-142: classified from measurement.
  - Reading-mode separation: no sibling import; the helper is shared through the declared `allowedShared` path.
- **Candidate:** none yet.
