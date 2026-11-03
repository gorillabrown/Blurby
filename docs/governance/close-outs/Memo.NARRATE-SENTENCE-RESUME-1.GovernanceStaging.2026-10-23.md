# Dispatch Close-Out Governance Staging — NARRATE-SENTENCE-RESUME-1

Built during the Stage 8 code/lockfile freeze. It merges after the freeze lifts, on Blurby.Roadmap's go, immediately after NARRATE-TOKEN-CAP-1. Its live check waited out Roadmap's window hold.
- **Branch:** `eb/narrate-sentence-resume-1`, stacked on `eb/narrate-token-cap-1` @ `814ddc78`. Both items edit `chunkPlan.ts`.
- **Shared core:** none.
- **Not touched:** `src/reader/modes/narrate/FoliateView.tsx`, which NARRATE-KEY-REPEAT-1 holds. No merge-order dependency on that item.

## Evidence

- **Re-grep (rule 36)** on `814ddc78`. No commit touches the narrate files after the base.
  - `isSentenceEnd`: `chunkPlan.ts:58`.
  - `narrateEngine.ts`: `resume()` at `:217-240`, with its doc comment at `:217`.
  - `ModeRuntime.ts`: `start()` at `:256-302`, `jumpToWord` at `:358`, the click path at `:430`, `navigateTo` at `:443`.
  - The exact-resume test is at `narrate.engine.test.ts:253`.
- **Done-when 1 (positive control).** The tests were committed alone as `06f86809`.
  - `npx vitest run tests/narrate/narrate.engine.test.ts tests/narrate/narrate.mode.test.ts -t "sentence start"` exited 1: 3 failed, 2 passed.
  - **(s1):** resumed at the paused sample, `expected 118679 to be 97200`.
  - **(s2):** no new epoch, `expected 1 to be greater than 1`.
  - **(s4):** started at 7, `expected 7 to be 5`.
  - **(s3) and (s5):** controls, passed.
  - **Method:** the three source files were set aside in a scratch folder, restored to HEAD for the red run, then put back.
- **The change** (`fe2c7caf`):
  - `sentenceStartAt(words, i, breaks)` added to `chunkPlan.ts`. It walks back to the sentence's first word, never across a break, and returns an out-of-range index unchanged.
  - **Engine `resume()`:**
    - At a sentence start, it resumes at the exact sample.
    - Mid-sentence in a buffered chunk, it resumes from the `sampleStart` of the unit holding the sentence's first word (the trim for unit 0).
    - If the sentence began in an earlier chunk, or in the gap case, it calls `play(start, cause)`, a new epoch.
  - **`ModeRuntime.start()`:** Play, Space, a reopened book and a page turn rewind the start word. `jumpToWord`, `navigateTo` and the playing-click path are unchanged.
- **Decision recorded (tier 1, within the specification's "What"):** a start that comes from an explicit word click (`explicitSelectionAnchor`) is not rewound.
  - **Why:** the specification says "an explicit word target keeps its word, because the reader chose it". A click while stopped, followed by Play, is that case, and (s5) pins it.
- **Tests updated in scope (standing rule 50).** The specification named one pinned test; nine existing tests pinned the old behaviour.
  - `narrate.engine.test.ts`:
    - The exact-resume test now pauses at a sentence's first word, and becomes (s3).
    - The gap-resume test now expects the rewind to "Of my grandfather".
    - The replay test now expects the replay from word 0, still without regenerating.
  - `narrate.mode.test.ts`: the fixture gains a paragraph break after w6, so w7 stays a start word. This covers 4 tests.
  - `narrate.crossings.test.ts`: the fixture text reads "learned. To be religious", so the start three words before the section end begins a sentence.
  - `narrate.trace.test.ts`: the resume request and first voiced word are now word 0, the sentence start.
- **Done-when 2:** `npx vitest run tests/narrate` gave `Tests 135 passed (135)`, exit 0. Assertions check text as well as index (LL-161).
- **Done-when 3:** the exact-resume test is updated, and the engine doc comment changed to match.
- **Done-when 4 (live).** Packaged `--dir` builds, scratch profiles, the model from the `Blurby-artifacts` copy, *Meditations*. The driver is `C:\Projects\Blurby-artifacts\narrate-sentence-resume-1\live.mjs`, and the screenshots are beside it.
  - **(a) Pause, then resume.** Paused at 217 "from" and resumed at 204 "Annius", the first word of the engine's sentence. The A/B base build (`814ddc78`) resumed at 218 "Numa,", the next word, with no rewind.
    - **Finding, out of scope:** the existing segmentation ends a sentence at "M." before a capitalised name ("M. Annius Verus"). Roadmap is filing a follow-up.
  - **(b) Page turn.** After the turn, Page mode's first word was "Marcus," (highlighted). Play started at 390 "Hence", whose previous word is "emperor.", the start of the sentence "Hence it came about that Antoninus, having no son, adopted Marcus, …". The driver's first-visible probe misread Page mode's columns (198); the screenshots are the evidence.
  - **(c) Relaunch, then Play.** Blocked by BUG-206, which is pre-existing. On relaunch the app shows "Failed to execute 'setEnd' on 'Range': The offset 7 is larger than the node's length (4)", from `foliateHelpers.ts:165`, and Play does not start. The A/B base build shows the identical banner on the same route. Roadmap filed BUG-206 from the smoke on `47ae6e1f`.
- **Done-when 5:** the owner row is on the next batched smoke.
- **Done-when 6:** `git grep -n -F "sentenceStartAt" -- src` prints **5** lines, not the specified 3: the declaration, the two uses, and the two `import` lines those uses need. This is a specification miscount, and Roadmap noted it for close-out.
- **Done-when 7** (tree `fe2c7caf`): `npm test` exited 0 with `Test Files 177 passed (177)` and `Tests 2440 passed | 1 skipped (2441)`. Nothing failed, so nothing was re-run. `npm run typecheck` exited 0, and `npm run build` exited 0.
- **Done-when 8, fence.**
  - Against the parent (`eb/narrate-token-cap-1...HEAD`), plus this memo:
    - `M src/reader/modes/narrate/engine/chunkPlan.ts`, `narrateEngine.ts` and `ModeRuntime.ts`.
    - `M tests/narrate/narrate.chunkPlan.test.ts`, `narrate.engine.test.ts` and `narrate.mode.test.ts`.
    - `M tests/narrate/narrate.crossings.test.ts` and `narrate.trace.test.ts`, the rule 50 updates outside the specification's list.
  - Against `origin/main`: these paths plus the parent's memo.

## Lessons

- **Applied:** standing rules 36, 41, 43, 44, 45 (the owner row), 47, 48 and 50; LL-160 (the packaged app's ICU); LL-161 (text and index).
- **Added:** none in the register.
  - The A/B against the parent build is what separated the item's behaviour from a pre-existing failure, for both (a) and (c).
