# Dispatch Close-Out Governance Staging — NARRATE-YEARS-1

This item was built during the Stage 8 code/lockfile freeze. It merges after the freeze lifts, on Blurby.Roadmap's go.
- **Branch:** `eb/narrate-years-1`, from `refs/remotes/origin/main` @ `79b26e6e`.
- **Shared core:** none.
- **Fixes:** the rest of BUG-191.
- **Scope:** the specification plus the owner's pre-dispatch amendment of 2026-10-23, rows (y7)–(y10).

## Evidence

- **Re-grep (standing rule 36)** on `79b26e6e`: every site matches the specification, and `git grep preNormalize -- main` exited 1.
  - `main/narrate/normalize.js`: `normalize` at `:34-47`, `spokenWordsOf` at `:65`, `module.exports` at `:137`.
  - `main/narrate/capture.js`: `synthesize` calls `tts.generate(text, …)` at `:53`.
- **Done-when 1 (positive control).** The new tests were committed alone as `dab87e4a`.
  - `npx vitest run tests/narrate/narrate.normalize.test.js tests/narrate/narrate.reconcile.test.js` exited 1.
  - The failures name the cause: `TypeError: preNormalize is not a function`, and the reconcile chunk gives `expected [ '1066' ] to deeply equal [ '10', '66' ]`.
- **The change** (`0f61b869`):
  - `preNormalize(e)` is added to `normalize.js`. It first turns an en dash (U+2013) between two bare four-digit numbers, both in 1000–2099, into a hyphen, so kokoro's own hyphen rule reads it "to".
  - It then rewrites a bare `10dd` and its decade form into kokoro's own year forms:
    - "1066" becomes "10 66", and "1005" becomes "10 oh 5".
    - "1060s" becomes "10 60s", and "1000s" becomes "10 hundreds".
    - "1000" stays a cardinal.
  - The look-arounds exclude amounts, decimals and thousands-separated counts: a digit, `$`, `£`, `.` or `,` before, and `[.,]digit` after.
  - It is applied in `spokenWordsOf` and in `synthesize` (`tts.generate(preNormalize(text), …)`). The record's `text` stays the original.
- **Decisions (tier 1, within the owner's rulings):**
  - "the 1000s" uses kokoro's x00s decade form ("ten hundreds"), as "the 1900s" already reads "nineteen hundreds".
  - "Year range" for an en-dash range means 1000–2099.
  - "1914–18" (a two-digit end) is left unchanged.
- **Done-when 2:**
  - The `preNormalize` table covers every Evidence row and rows (y7)–(y9) through `normalize(preNormalize(x))`.
  - **Changed expectation (owner's amendment):** `spokenCounts(["1066,", "1,974", "1914–1918", "1990s", "1060s"])` is `[2, 1, 5, 2, 2]`. The base specification's `3` for "1914–1918" predates the amendment, which makes the en dash read "to".
  - The `mapUnitsToSourceWords` test maps "1066" onto one merged unit carrying the span.
  - **Reconcile tests (real espeak through `synthesize`):**
    - "In 1066 the Normans came, and 1,974 coins were struck." maps "1066" to ["10","66"] and "1,974" to ["1974"].
    - (y10): "From 1914–1918 and in the 1060s, pages 10–12 were lost." maps "1914–1918" to ["19","14","to","19","18"] and "1060s," to ["10","60s"], and the chunk reconciles.
  - `1634; 1701; 1906.` and every other existing test pass unchanged.
  - The narrate tests give `Tests 151 passed (151)`.
- **Done-when 3:** `git grep -n "preNormalize" -- main` prints exactly 5 lines:
  - `capture.js:9` (require) and `:55` (use in `synthesize`);
  - `normalize.js:64` (definition), `:90` (use in `spokenWordsOf`) and `:162` (export).
- **Done-when 4 (sweeps under the app's Electron via `app-node.ps1`; counts only).** The owner corpus is the library copies in `…\bbe4b04a-…\scratchpad\owner-epub-copy`; the profile was never touched.

  | Run | Gate | D2 route `--from 2970 --to 6700` | Control | Owner |
  |---|---|---|---|---|
  | Base (`normalize.js` and `capture.js` at `origin/main`) | — | — | — | 21 of 11,030; 18 class E, 3 ruled residual, **0 other** |
  | This item | 0 of 3,683, exit 0 | 0 of 172, exit 0 | 127 of 3,683, exit 1 | 21 of 11,030; 18 class E, 3 ruled residual, **0 other** (same as the base) |
  | Combined with NARRATE-TOKEN-CAP-1's `chunkPlan.ts` (`814ddc78`) | 0 of 3,685, exit 0 | 0 of 173, exit 0 | — | **3 of 11,258; 0 class E, 3 ruled residual, 0 other** |

  - This item adds no failure of any class, and the year mapping stays exact across the whole owner corpus (LL-162).
  - Every temporary checkout was restored to HEAD.
- **Done-when 5 (owner's machine, tree `94c1711f`):** `npm test` exited 0 with `Test Files 177 passed (177)` and `Tests 2456 passed | 1 skipped (2457)`. Nothing failed, so nothing was re-run. `npm run typecheck` and `npm run build` exited 0.
- **Done-when 6 (fence, `origin/main...HEAD`):** exactly these, plus this memo. No time log was kept, and `tests/perf-baseline-results.json` is not staged.
  - `M main/narrate/normalize.js` and `M main/narrate/capture.js`;
  - `M tests/narrate/narrate.normalize.test.js` and `M tests/narrate/narrate.reconcile.test.js`;
  - `M docs/governance/BUG_REPORT.md`.
- **Done-when 7:** BUG-191 reads `RESOLVED in source (NARRATE-YEARS-1)`. It names NARRATE-REBUILD-1 for 1100–2099 and this item for 1001–1099, their decades and en-dash ranges, and gives no sha.
- **Done-when 8:** the owner's listening row goes to the next batched smoke: "1066", "1974", "1,974 coins", "the 1060s" and "1914–1918".

## Lessons

- **Applied:** LL-142, LL-160, LL-161 and LL-162; standing rules 36, 41, 43, 44, 47, 48, 49 and 50.
- **Added:** none.
