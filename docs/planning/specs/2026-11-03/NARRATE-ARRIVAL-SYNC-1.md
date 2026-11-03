#### NARRATE-ARRIVAL-SYNC-1 — Narrate shows the saved place when you switch to it, so Play starts there *(Seq 88.5; Full Spec 2026-11-03, cited against `origin/main` `c5bb507f`; TTS / Narration Engine; release-candidate hotfix for gate (1) run 5 RED; ahead of every post-RC item)*

- **What:** after switching into Narrate from another mode at a saved place, the view shows that place's section instead of the cover. Play then starts at the saved word's sentence, using the sentence-start rule. PLAY-FIRST-TEXT-1's owner rule ("Play with the view on a section with no words starts at the first text") still applies exactly as written whenever the view really is on a wordless section.
  - **Out of scope:**
    - PLAY-FIRST-TEXT-1's rule itself;
    - the engine;
    - Page, and the Focus and Flow runtimes, unless a red row below sends them back to Blurby.Brain1;
    - the over-budget warm click and the speed at 1.00x. Gate (1) run 6 settles those; any counting warm trial of 2,500 ms or more there goes back to Brain1.
  - **Outcome:** open *Meditations* in Page at word 8723, switch to Narrate and press Play. The first request word is in 8723's sentence, with no play-first-text navigation.
- **Why** (Blurby.Brain1 ruling, `C:\Projects\Blurby-artifacts\brain1-rulings\Brain1.NARRATE-ARRIVAL-SYNC-1.2026-11-03.md`; Aristotle diagnosis on RodneySr, evidence `C:\Projects\Blurby-artifacts\aristotle-warm-click-20261103\` and `rc-gate1-run5-20261103\` there):
  - On `c5bb507f`, switching into Narrate leaves the view on the cover (section 0), and arrival sync can't move it:
    - `jumpDisplayToWord` is a no-op (`narrate/ModeRuntime.ts:862`);
    - `syncSection` gives up while the section map loads (`:594-597`);
    - its effect (`narrate/useModeBindings.ts:29-31`) does not re-run when the map arrives.
  - PLAY-FIRST-TEXT-1 (C2 `c57a7b4f`, integrated as `655df7b5`) then applies the owner's rule to that cover. Play starts at section 1's first word instead of the saved 8723.
  - Gate (1) run 5's D6 warm trial then clicked page-relative spans in section 1's contents list. Span 151 is a link, which Narrate's FoliateView ignores (`:842`). No click request was made, and the trial timed out after 30 s.
  - The engine is not at fault: leads (a)–(d) are ruled out.
  - **Users see:** open a book at a saved place, switch to Narrate, press Play, and it reads the title page.
- **Design decision:** technical, with no new design (Blurby.Brain1). The owner's rule keys on what the view shows. Here the view shows the cover only because arrival sync is defective. Restoring arrival sync restores run 4's behaviour (start at 8723), and the owner's rule still applies once the view is right. The owner is informed; gate (2)'s existing (vi) row stays (`SMOKE_CHECKLIST_STAGE8.md`, RC additions).
- **The change (Aristotle diagnosis items 1–6, adopted as written by Blurby.Brain1; `src/reader/modes/narrate/ModeRuntime.ts` only):**
  1. Two new private fields: `arrivalSyncOwed` (set when the runtime arrives through a mode handover at a saved word) and `arrivalSyncInFlight`.
  2. A new private method, `settleArrivalSync()`, which moves the view to the section of the arrival word once the section map exists, then clears `arrivalSyncOwed`. It is called from two places:
     - the frame that `queuePostModeAnchorSync` schedules (`:808-…`);
     - `adoptDocument` (`:242-…`), when `bookWords` with sections arrives.
  3. `startAtFirstText` (`:756-…`) returns `false` while an arrival sync is owed or in flight. The play-first-text rule never judges a view that has not yet been moved.
  4. `arrivalSyncOwed` is cleared by every user intent: a click or selection, the keys, a contents jump, Play started by the user, and `navigateTo`. `destroy()` (`:387-…`) also clears it.
  5. `pendingFirstText`'s existing clears (`:252`, `:275`, `:338`, `:368`, `:395`, `:448`, `:486`, `:500`) are unchanged.
  6. No sibling-mode import, and no edit to `useModeBindings.ts`, FoliateView, `ReaderContainer.tsx`, `src/types.ts` or `FlowScrollEngine.ts`.

  The implementer re-greps every cited line at the cut (standing rule 36) and reads the diagnosis memo on RodneySr before the first edit.
- **Harness hardening (approved by Blurby.Brain1), `main/narrate/trial.js`:**
  - `clickWord` (`:59`) and `CLICK_WORD` (`:106`) skip spans inside `a[href]`.
  - After the first Play, the trial fails fast (exit 1, with a message naming the word) unless the first request word lies in the section that holds `cfg.position`.
  - Record in the memo that click targets can differ from run 4 by the skipped link spans.
- **Prerequisites:** none. It is cut from `origin/main` at `c5bb507f` or later.
- **Execution host:** RodneySr (x64) for the implementation, the tests, the rule 53 pair and gate (1) run 6. Rodney (arm64) is used only if Brain1 asks for an arm64 probe.
- **Branch:** `eb/narrate-arrival-sync-1` at `C:\Users\estra\Projects\Blurby\.worktrees\narrate-arrival-sync-1` on RodneySr.
- **Done when:**
  1. **Red first (standing rule 43).** Commit alone `tests/narrate/narrate.playSavedPosition.test.ts`:
     - sp1–sp3 are RED on `c5bb507f` by assertion;
     - sp4 and sp5 are GREEN controls.

     Commit alongside it the sp1 equivalents for Focus and Flow:
     - `tests/readerModes/focus.arrivalSavedPosition.test.ts`;
     - `tests/readerModes/flow.arrivalSavedPosition.test.ts`.

     Each arrives from Page at a saved word, with the cover still shown, then presses Play. Record every result in the memo.
     - **If the Focus or Flow row is RED:** STOP to Blurby.Brain1 with the trace before editing that runtime. Mode isolation makes each runtime's fix its own scope decision.
     - **If both are GREEN:** they stay as regression rows. Focus's row is also input to FOCUS-PAUSED-HANDOFF-1's Wave A.
  2. **The change** as above. `tests/narrate/narrate.playFirstText.test.ts` rows n1–n9 and nc1–nc5 are green and **unedited** (standing rule 50).
  3. `npx vitest run tests/narrate tests/readerModes tests/readerModeIsolation.test.ts` exits 0. Then `npm test`, `npm run typecheck` and `npm run build` exit 0 (standing rules 47 and 48). Record the counts.
  4. **Packaged probe**, on RodneySr's `--dir` package of the tip, with a scratch profile proved before the first input (LL-165):
     - open *Meditations* in Page at 8723, switch to Narrate, press Play;
     - the first request word is in 8723's sentence, with no play-first-text navigation.
  5. **Control:** the same probe on `c5bb507f` starts at section 1's first word. This is the base RED, recorded.
  6. **Rule 53 pair on RodneySr:**
     - the tip's package plus `origin/main`'s;
     - a 25 s scratch-profile launch with no error;
     - asar contents checked;
     - steps 4–5 re-run on the packaged exe;
     - a "Package verification" section in the close-out;
     - Blurby.Brain1's confirmation before the merge go.
  7. **Gate (1) run 6** in full on the merge: the full quiet suite, plus NARRATE-REBUILD-1 D3 and D6. The 21 RC close-outs and PLAY-FIRST-TEXT-1's close-out wait for run 6's record. PLAY-FIRST-TEXT-1's close-out cites this item as its follow-up.
  8. **Fence (standing rule 41).** `git diff --name-status <base>` lists exactly the following, plus the memo and time log:
     - `M src/reader/modes/narrate/ModeRuntime.ts`
     - `M main/narrate/trial.js`
     - `A tests/narrate/narrate.playSavedPosition.test.ts`
     - `A tests/readerModes/focus.arrivalSavedPosition.test.ts`
     - `A tests/readerModes/flow.arrivalSavedPosition.test.ts`
- **Effort:** S. Technical effort: medium.
- **Owners:**
  - Blurby.Brain1 coordinates, confirms the rule 53 pair and records run 6;
  - RodneySr implements;
  - spec-compliance, then quality review;
  - Blurby.Roadmap gives the merge go and closes it out.
- **Merge order:** first among post-RC items. CHAPTER-STEP-CFI-1 (amendment 1, 2a′ and (cl9)) re-greps after it, because both edit Narrate's `go-to-href` path.
- **Path:** dispatch (hotfix).

##### Lessons applied
- **LL-142:** the order is measured on the control, and the base RED is recorded, before the fix is trusted.
- **LL-152:** one recipe for the probe on base and on tip.
- **LL-165:** the scratch profile is proved before the first input.
- **LL-160:** gate (1)'s epic checkers run under the app's own Electron ICU.
- **Standing rule 55 (promoted from LL-166):** verdicts come from the first request word and saves, not screenshots.
- **Standing rule 53 (promoted from LL-167):** package verification.
