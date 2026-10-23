# Dispatch Close-Out Governance Staging — READER-VISUAL-DIAG-1

This is a read-only diagnosis and the change is docs-only, so it may merge during the Stage 8 freeze on Blurby.Roadmap's go.
- **Branch:** `eb/reader-visual-diag-1` from `77f1502c`.
- **Shared core:** none.

## Evidence

- **Report:** `docs/studies/investigations/READER-VISUAL-DIAG-1.2026-10-12.md`. It holds H1–H4 verdicts with session data and two fix specifications, BAND-ALIGN-1 and FOLIATE-OBSERVER-LEAK-1.
  - Session artifacts are outside the repository, in `C:\Projects\Blurby-artifacts\reader-visual-diag-1\`.
- **`docs/governance/BUG_REPORT.md`:** BUG-187's and BUG-188's status, location and root cause now point to the report.
- **Done-when 4:** `git diff --name-only refs/remotes/origin/main...HEAD -- src main preload.js` prints nothing. Every piece of instrumentation was injected over CDP at run time.
- **Independent measurement review** (read-only, against the session JSONs and the scratch `error.log` files).
  - **Confirmed:**
    - the four flood counts (14,428 / 451 / 499 / 750);
    - the H3 out-of-band counts (136 / 134 / 106 / 133);
    - the S13 step values;
    - S4's 85 callbacks and its 92 and 147 writes;
    - the 120 px zone.
  - **Corrections applied before merge:**
    - **Census:** two leaked `View` observers on 0×0 bodies plus one observing nothing, not three on 0×0 bodies.
    - **S13 attribution:** the steps are cumulative, so the result means the step-5 observer, or both leaked `View`s together. It is not "the single Focus-era observer".
    - **Onset:** in the instrumented runs the flood starts at Focus entry, which shows the wrapper perturbs the onset. This is now recorded.
    - **Mechanism:** the `expand()` account is withdrawn, because the callbacks ran once and `expand()` throws on a detached frame. The loop's mechanism is now recorded as open.
    - **TypeError:** the one `Cannot destructure property 'style'` TypeError at Focus entry is now recorded.
    - **Rates:** per-minute rates are recomputed from the measured session lengths of 328.4–336.6 s (S1: 2,634, not 2,886).
    - **Other figures:** frames are 181–182; equal-value writes are 96.7–97.3%; margin writes are 3 of 3.
    - **H3 run table:** recomputed. The last 89 s of S4 are mostly above the band, not below, and "runs lengthen" is restated.
    - **Missing sessions:** S5, S9 and S10–S12 are added.
    - **H1 provenance:** body-line figures come from session E only.
  - **BAND-ALIGN-1 corrections:**
    - The two `FlowScrollEngine.ts:788` sites are added.
    - `src/utils/FlowScrollEngine.ts` is shared core. It is only type-imported, so it is not edited, and a dispatch-time grep guards that.
    - Concrete line numbers replace the "area" cites.
    - (b3) is fixed at 200 ticks, and the three Focus checks are defined.
    - Part B, where the band sits, is split out and held for the owner as Rule 11 tier 3, with a recommendation.
  - **FOLIATE-OBSERVER-LEAK-1 corrections:**
    - Done-when 1 is now a mechanical source-text test, because `View` is not exported and jsdom has no `ResizeObserver`.
    - The full route is restated, including the open-book and contents-jump steps.
    - The script's provenance is recorded in the close-out.

## Lessons

- **Applied:** rule 43 (positive control: the S13 intervention and the S6/S7 route control) and rule 36 (re-grep table).
- **Added:** none in the register.
  - The observation that a CDP `ResizeObserver` wrapper shifts the loop's onset is recorded in the report, for any future observer diagnosis.
