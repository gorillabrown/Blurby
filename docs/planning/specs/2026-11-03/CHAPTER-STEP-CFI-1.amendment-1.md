# CHAPTER-STEP-CFI-1 — Amendment 1: the landing completes on the relocate, not on the jump's promise

*Planner: Blurby.Roadmap, 2026-11-03. This amends [the full specification](../2026-10-23-5/CHAPTER-STEP-CFI-1.md) (roadmap review 2026-10-23-5). The amendment replaces design 2 and the sections listed below; everything else in the specification stands. The stop that this answers is commit `796282c2` on `eb/chapter-step-cfi-1`: [base memo](../../../studies/investigations/CHAPTER-STEP-CFI-1.base.2026-10-23.md) on that branch, and its governance staging memo. Tier 1 (design within the approved behaviour) is the planner's, as the stop memo records. Blurby.Brain1 reviewed it on 2026-11-03: not superseded; (cl9) and 2a′ added at its ruling.*

## What the stop proved

The control (`4ad4fac4`) was measured on arm64 packaged builds in Focus, Flow and Narrate. Every contents jump and chapter step made two `view.goTo` calls:

1. the runtime's `go-to-href` call, with the entry's fragment;
2. less than 1 ms later, a second call from the mode's own `syncSection` → `surface.goToSection`, with no fragment.

The early `commitShared` in `navigateTo` publishes the entry's word, which is in another section, and the second call chases it. The runtime's own promise resolved in **0 of 11** jumps. Only the competing call resolved, with relocates both before and after it. Design 2 as written ("the landing completes when `surface.goTo` resolves") would therefore never complete a landing, and would save nothing. That is worse than today.

## Amended design (replaces design 2)

- **2a. No competing navigation while a landing is armed.** While `this.landing` is set, each mode's `syncSection` returns at once:
  - Focus `syncSection` (`focus/ModeRuntime.ts:975` at `c5bb507f`);
  - Flow `syncSection` (`flow/ModeRuntime.ts:1181`);
  - Narrate `syncSection` (`narrate/ModeRuntime.ts:594`).

  This removes the second `goTo` that the stop measured.
- **2a′. Narrate's owed arrival sync (Blurby.Brain1, 2026-11-03).** NARRATE-ARRIVAL-SYNC-1 adds `arrivalSyncOwed`, cleared on every user intent. A contents jump is a user intent, so Narrate's `go-to-href` clears `arrivalSyncOwed` (through the hotfix's own clear path) **before** it arms the landing. Otherwise `settleArrivalSync` and the landing would make competing `goTo`s, the very failure that stopped run 1. Design 1 already stops `navigateTo` from publishing the word early on an EPUB, so 2a is a guard, not the only fix.
- **2b. The landing completes at the earliest of:**
  1. `surface.goTo` resolves and a cfi was captured;
  2. `LANDING_SETTLE_MS` (500) after the most recent relocate captured for this landing, which handles a promise that never settles.

  Each relocate captured while armed overwrites `landing.cfi` and restarts the settle timer, so the landing uses the last cfi of the settle burst. The base memo shows the range relocate up to about 410 ms after the jump, and repeats of the landed cfi after it.
- **2c. No landing, no save.** `LANDING_TIMEOUT_MS` (5000) after arming, a landing that has captured no cfi is cleared and saves nothing. The no-move case still saves nothing, as (cl2) pins.
- **2d. One completion per landing.**
  - `completeLanding(landing)` returns at once unless `this.landing === landing`, and it clears both of the landing's timers.
  - A newer jump replaces the landing, and the old landing's timers then find `this.landing !== landing` and do nothing.
  - `stop()` clears the landing, its timers and `pendingJumpWord`.
- **2e. Constants.** `LANDING_SETTLE_MS = 500` and `LANDING_TIMEOUT_MS = 5000` are module-level constants in each mode's `ModeRuntime.ts`, beside that file's existing timing constants (Focus `:353-355`, Flow `:448`). This is the mode-local pattern; no shared import, and no edit to `src/constants.ts`.

Designs 1, 3, 4 and 5 are unchanged. The `completeLanding` body (the commit with the landed cfi, Narrate's restart while playing, Focus's design 3, and the owner's question 2 ruling, which keeps Focus playing) is unchanged. Only when it runs changes.

## Base and edit sites (replaces "Baseline" and the line numbers of Done-when 3)

- **`<base>`** is `origin/main` at dispatch.
  - It is at or after `c5bb507f`, the RC integration merge, which contains both prerequisites: `eb/band-align-2` and `eb/jump-landing-save-1` are ancestors of `c5bb507f`.
  - It also contains the run-5 hotfix NARRATE-ARRIVAL-SYNC-1 (Seq 88.5; Blurby.Brain1 ruling `Brain1.NARRATE-ARRIVAL-SYNC-1.2026-11-03.md`). That hotfix edits Narrate's `go-to-href` handler (`narrate/ModeRuntime.ts:499-507`, `pendingFirstText`), which this item also edits, so this item starts after it lands.
- **Edit sites at `c5bb507f`** (re-grep at `<base>`, standing rule 36):

  | Mode | `navigateTo` | `go-to-href` | `onRelocate` | `syncSection` | `commitShared` |
  |---|---|---|---|---|---|
  | Focus | `:756` | `:797` | `:863` | `:975` | `:1202` |
  | Flow | `:929` | `:976` | `:1042` | `:1181` | `:1594` |
  | Narrate | `:477` | `:501` (`handleCommand`) | `:510` | `:594` | `:846` |

  Each mode's `surface.ts` `goTo` still discards the promise; re-grep it.
- **Branch.** Start a fresh branch `eb/chapter-step-cfi-1-r2` from `<base>`, in `C:\Projects\Blurby\.worktrees\chapter-step-cfi-1-r2` on the executing machine. Cherry-pick the red file `9e59a123` (`tests/readerModes/chapterStepLanding.test.ts`) and the stopped run's driver from `796282c2`. Leave `eb/chapter-step-cfi-1` as it is: it is the record of the stop.

## Done-when changes

- **Done-when 1 (control):**
  - Re-measure the control on `<base>` with the existing driver. Use the same book, actions (i)–(v), probes and recipe, reduced to two things: the saves, and the `goTo`/relocate order.
  - The RC changed these files since `4ad4fac4`, so the 2026-10-23 table is history, not this run's control (LL-152).
  - The stop condition becomes: **if the control shows a mode already saving the landed cfi, record it and drop that mode from step 3.** The order is recorded, not a stop: this amendment is designed for both orders.
- **Done-when 2 (red first):** the cherry-picked file keeps (cl1)–(cl5) unchanged. Add, in the same red commit:
  - **(cl6), all three modes, the stop's order:** the stub's `goTo` calls `onRelocate({ cfi: "cfi:new" })` and returns a promise that never settles. After `vi.advanceTimersByTime(LANDING_SETTLE_MS)` the only `updateDocProgress` since the jump is `["doc-1", 20, "cfi:new"]`.

    The value is reached through behaviour, by advancing 600 ms, so the file runs on the base. On the base it fails by assertion, with the early `"cfi:old"` save.
  - **(cl7), all three modes:** between `go-to-href` and completion, a published word in another section does not make `surface.goToSection` run. That is, the stub's `goToSection` spy is not called while the landing is armed. On the base it fails.
  - **(cl8), all three modes:** a `goTo` that never settles and fires no relocate saves nothing. After 6 s of fake time, a relocate takes the normal path again: `onRelocate` reaches `scheduleRelocateSave` once `resumeAnchor` is clear. On the base it fails, because of the early save.
  - **(cl9), Narrate only (Blurby.Brain1 2026-11-03):**
    - Arrive in Narrate from Page at a saved word, with the arrival sync still owed (the section map not yet loaded).
    - Then make a contents jump.
    - Exactly one `goTo` follows, the landing's, and the only save since the jump is the landing's word with its cfi.
    - Before writing (cl6)–(cl9), re-grep `pendingFirstText`, `arrivalSyncOwed` and `syncSection` on the hotfix merge.
- **Done-when 3 (the change):**
  - Add 2a to each mode's `syncSection`, and 2b–2d to the `go-to-href` case, `onRelocate`, `completeLanding` and `stop()`.
  - `go-to-href` arms the landing and the timeout, then `void this.surface.goTo(href).then(() => { if (landing.cfi != null) this.completeLanding(landing); })`.
  - `onRelocate`, while armed: store `detail.cfi`, restart the settle timer, `s.notify()`, and return before the passive highlight and `scheduleRelocateSave`, as design 1 specified.
- **Done-when 4 (tests):** add to the command `tests/readerModes/chapterStepLanding.test.ts` (cl6)–(cl9). The rest is unchanged.
- **Done-when 5 (fixed build):** (a)–(e) stand. Add:
  - **(f)** Each of (i)–(iii) in each mode makes **exactly one** `view.goTo` call: the runtime's, with the fragment.
  - **(g)** For each landing, record which path completed it (resolve or settle), and whether the runtime's `goTo` resolved. Either path passes. A landing completed by neither path, or a second save, stops the item.
- **Done-when 8 (fence):** unchanged. The new constants and guards live in the same six files and the one test file.

## Fold-ins from the stop (for this item's close-out)

- **BUG-217 number collision.** The planner checks `docs/governance/BUG_REPORT.md` at close-out. If two entries still share BUG-217, the later one takes the next free number.
- **Flow quit not finishing** (control Flow run, 30 s, killed by PID). It is recorded in the base memo. If the fixed-build Flow run reproduces it, the record goes to the existing quit-sequence lane (QUIT-FLUSH-1 record) as a finding, not into this item.
- **Owner question 3 is decided by the count.** *Meditations* has 5 contents entries that point inside a section another entry starts. Under the owner's ruling ("decided by Done-when 1's count"), that selects **A**: a follow-up in a `ReaderContainer.tsx` integration window, registered as TOC-FRAGMENT-WORD-1.

## Lessons applied

- **LL-142:** measure the order on the control before designing on it. The amendment designs for the measured order, and keeps the measurement in Done-when 1 and 5.
- **LL-152:** one recipe for control and fixed builds, re-run on the new base.
- **LL-165:** the scratch profile is proved before the first input.
- **Standing rule 55 (promoted from LL-166):** verdicts come from state, not screenshots.
- **Standing rule 53 (promoted from LL-167):** package verification, unchanged as Done-when 7.
- **Candidate lesson from the stop (proposed for LESSONS_LEARNED at close-out):** a test stub of foliate's `goTo` that relocates and then resolves encodes an order the app does not keep while a mode's `syncSection` races. Measure the promise on the packaged build before designing on "after `goTo` resolves".
