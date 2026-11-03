# Dispatch Close-Out Governance Staging — NARRATE-TOKEN-CAP-1

Built in a worktree during the Stage 8 code/lockfile freeze. It merges after the freeze lifts, on Blurby.Roadmap's go, and before NARRATE-SENTENCE-RESUME-1, which stacks on this branch because both edit `chunkPlan.ts`.
- **Branch:** `eb/narrate-token-cap-1` from `refs/remotes/origin/main` @ `dcafc800`.
- **Shared core:** none.

## Evidence

- **Re-grep (rule 36)** on `dcafc800`: `estimateTokens` is at `src/reader/modes/narrate/engine/chunkPlan.ts:20` and `PACK_TARGET_TOKENS` at `:18`. The steady-state cut loop is at `:131-140`. The DW5 grep exited 1 on the base.
- **Done-when 1, positive control:** the tests were committed alone in `5c37e0da`. `npx vitest run tests/narrate/narrate.chunkPlan.test.ts -t "digit"` exited 1, with 1 failed and 1 passed.
  - The digit-dense test failed with `expected 1 to be greater than or equal to 2`: the 30-word passage was planned as one chunk.
  - The control ("no digit … as before") passed.
  - **Passage:** 30 words of long algebraic chess notation (`21. e2e4 e7e5 22. g1f3 …`) containing exactly 60 digits. The test asserts both counts.
  - **First draft:** its digit-count regex lost its backslash in the shell and counted the letter "d". It was fixed in the file before this red run.
- **The change** (`bcfc5732`), as the specification's implementation detail gives it:
  - `export const DIGIT_TOKEN_WEIGHT = 13`, with the measured range in its comment.
  - `estimateTokens` counts the digits at that weight and every other character at 1.15.
  - The "estimate only packs" sentence is kept. No planner line changed.
- **Done-when 2:** `tests/narrate/narrate.chunkPlan.test.ts` gave `Tests 10 passed (10)`, exit 0.
- **Done-when 3:** the owner sweep ran on the library copies under the app's Electron, through `app-node.ps1`, using `--owner …\bbe4b04a-…\scratchpad\owner-epub-copy`. The profile was not touched.
  - **Fix:** `OWNER: 3 fail-closed chunks of 11258 in 8 books; 0 class E, 3 ruled residual, 0 other`, exit 0.
  - **Base, re-measured under Electron 42 in the same run** (the base `chunkPlan.ts` was checked out temporarily, then restored to HEAD): `OWNER: 21 fail-closed chunks of 11030 in 8 books; 18 class E, 3 ruled residual, 0 other`, exit 0. This matches the 2026-10-15 record.
  - **Chunk total:** 11,030 becomes 11,258 (+228) as digit-dense passages split. Counts only; no text was stored.
- **Done-when 4:**
  - `--gate` printed `GATE: 0 fail-closed chunks of 3685`, exit 0.
  - `--gate --from 2970 --to 6700` printed `GATE: 0 fail-closed chunks of 173`, exit 0. The D2 route did not change.
  - `--gate --control` printed `127 fail-closed chunks of 3685`, exit 1.
- **Done-when 5:** `git grep -n -F "DIGIT_TOKEN_WEIGHT" -- src` printed exactly two lines, `chunkPlan.ts:24` (the declaration) and `:31` (its use). The constant's name was removed from the docstring so that the grep counts only code.
- **Done-when 6** (owner's machine, tree `bcfc5732`):
  - `npm test` exited 0 with `Test Files 177 passed (177)` and `Tests 2432 passed | 1 skipped (2433)`. Nothing failed, so nothing was re-run.
  - `npm run typecheck` exited 0, and `npm run build` exited 0.
- **Done-when 7, fence** (`origin/main...HEAD`): `M src/reader/modes/narrate/engine/chunkPlan.ts` and `M tests/narrate/narrate.chunkPlan.test.ts`, plus this memo. No time log was kept.
  - Untouched: `main/narrate/**`, `ModeRuntime.ts`, `narrateEngine.ts`, `FoliateView.tsx`, `PACK_TARGET_TOKENS` and the 400-id cap.
- **Review:** self-review (effort S, a single function).
  - Text without digits gives exactly the old value, which the control test pins.
  - The weight sits at the top of the measured range, and no class-E chunk remains on the full owner corpus.

## Lessons

- **Applied:**
  - LL-162: the whole owner corpus is the gate.
  - LL-160: every sweep ran under the app's Electron.
  - LL-142: the weight is the measured cost.
  - Standing rules 36, 43, 44 and 50.
- **Added:** none.
