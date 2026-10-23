# Dispatch Close-Out Governance Staging — BAND-ALIGN-1 (Part A)

This item was built during the Stage 8 code/lockfile freeze. It merges after the freeze lifts, on Blurby.Roadmap's go.
- **Branch:** `eb/band-align-1`, from `refs/remotes/origin/main` @ `6dd452e4`.
- **Owner approval:** tier 2, given 2026-10-23 ("Band yes").
- **Out of scope:** Part B, which stays out under BAND-ALIGN-2.
- **Shared core:** none.
- **Overlap watch:** `src/reader/modes/*/helpers/foliateStyles.ts`, which the BUG-208 release fix is expected to edit, is not touched.

## Evidence

- **Dispatch-time shared-core guard:** `git grep -n "from \"[./]*utils/FlowScrollEngine\"" -- src | grep -v "import type"` printed nothing (exit 1). This means `src/utils/FlowScrollEngine.ts` has no run-time importer and is not edited.
- **Re-grep (standing rule 36)** on `6dd452e4`: all 8 fallback sites and all 6 `injectStyles(` calls are where the specification cites them.
  - `focus/FoliateView.tsx:469`, `:1171`, `:677`, `:1146`.
  - `flow/FoliateView.tsx:499`, `:1247`, `:722`, `:1222`.
  - `flow/useModeBindings.ts:39`; `flow/helpers/FlowScrollEngine.ts:788`.
  - `narrate/FoliateView.tsx:530`, `:1300`, `:765`, `:1275`.
  - The zone host is `containerRef.current`, which is what `getFlowZoneHost()` returns at `flow/FoliateView.tsx:1113`.
- **Done-when 1 (positive control):** `tests/readerModes/zoneLineStep.test.ts` was committed alone as `adeabb1f`. `npx vitest run tests/readerModes/zoneLineStep.test.ts` exited 1, with 7 of 7 failing for the named reasons:
  - (b1a), (b1b) and (b1c) in each of the three modes: `helpers/foliateLayout.ts has no measureBodyLineStepPx` / `readZoneLineStepPx`.
  - (b1d): `zone bottom 34.04761904761905% (the 24 px fallback gives 34.05%)`, against an expected 36.43%.
- **The change** (`695c658d`):
  - **Helpers:** each mode's `helpers/foliateLayout.ts` gains its own copy of `measureBodyLineStepPx`, `readZoneLineStepPx` and `writeZoneLineStepPx`, to keep the modes isolated.
  - **Writers:** after each `injectStyles` call (at section load, and in the settings effect), each `FoliateView` measures the first loaded section, writes `--zone-line-step-px` on its zone host, and re-applies the zone through an `applyZoneRef`.
  - **Readers:** all 8 fallback sites now call `readZoneLineStepPx`. It reads the property first, then the computed line-height, then 24.
  - **Flow engine:** its `container` is the scroll element inside foliate-view's shadow root, and the custom property reaches it by inheritance. The live run confirmed this (`inheritedByRenderer` below).
  - **jsdom:** (b1d) needed no failure-handling fallback, because jsdom reflects the inline custom property.
- **Done-when 2:** `npx vitest run tests/readerModes tests/flowReadingZone.test.ts tests/flowZoneAuto.test.ts tests/flow-scroll-engine.test.js` passed: `Test Files 16 passed`, `Tests 167 passed (167)`, exit 0.
- **Done-when 3:**
  - `git grep -n "lineHeight) || 24" -- src/reader/modes` printed nothing and exited 1.
  - `src/utils/FlowScrollEngine.ts:788` still prints its one line; that file was not edited.
  - `git diff --name-only refs/remotes/origin/main -- src/utils src/components/ReaderContainer.tsx src/types.ts` printed nothing.
- **Done-when 4 (live).** A packaged `--dir` build with a scratch profile (`sourceFolder` null), reading *Meditations* at INTRODUCTION, paused.
  - **Tools:** READER-VISUAL-DIAG-1's `band-probe.js`, run by `C:\Projects\Blurby-artifacts\band-align-1\band-live.mjs`. The record is `band-live.json` plus four screenshots.

  | Case | Zone height | Body `<p>` step | Ratio | `--zone-line-step-px` on the host / inherited by the renderer |
  |---|---|---|---|---|
  | Focus 100% | 135 px | 27 px | **5.00** | 27px / 27px |
  | Focus 120% | 165 px | 33 px | **5.00** | 33px / 33px |
  | Flow 120% | 165 px | 33 px | **5.00** | 33px / 33px |
  | Flow 100% | 135 px | 27 px | **5.00** | 27px / 27px |

  - **Baseline:** 120 px in every case (READER-VISUAL-DIAG-1, H1), a ratio of 4.4 or 3.6.
  - **Pass mark:** at least 4.5 in all four cases. Met.
- **Done-when 5** (owner's machine, tree `695c658d`):
  - `npm test` exited 0: `Test Files 178 passed (178)`, `Tests 2437 passed | 1 skipped (2438)`. Nothing failed, so nothing was re-run.
  - `npm run typecheck` exited 0, and `npm run build` exited 0.
- **Done-when 6 (fence, `origin/main...HEAD`):** exactly these, plus this memo. No time log was kept.
  - The 8 `src/reader/modes` paths the specification lists.
  - `A tests/readerModes/zoneLineStep.test.ts`.
  - `M docs/governance/BUG_REPORT.md`.
- **Done-when 7:** BUG-188 reads "band height RESOLVED in source (BAND-ALIGN-1); band placement open (Part B …)", with no sha.
- **Done-when 8:** the owner's row for the next smoke is: "in Focus and Flow at 100% and 120%, the band is about 5 lines tall".
- **Review:** self-review, effort S.
  - The helpers are identical in all three modes.
  - Section-load and settings-change re-measure exactly where `injectStyles` runs.
  - An image-only section keeps the previous step, because `measureBodyLineStepPx` returns `null` and the writer then writes nothing.
  - Page mode is untouched.
  - **Merge order (from the specification):** this item merges after NARRATE-KEY-REPEAT-1, and re-greps `narrate/FoliateView.tsx:530` and `:1300`. NARRATE-SENTENCE-RESUME-1 does not edit `narrate/FoliateView.tsx`, so no re-grep is needed there.

## Lessons

- **Applied:** standing rules 36, 41, 43, 44, 45 (the owner row), 47, 48, 49 and 50; LL-032 (`getContents()`); LL-142; LL-146; LL-152.
- **Added:** none.
