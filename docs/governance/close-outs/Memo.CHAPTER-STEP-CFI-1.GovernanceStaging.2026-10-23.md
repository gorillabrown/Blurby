# Dispatch Close-Out Governance Staging — CHAPTER-STEP-CFI-1

**State: STOPPED at Done-when 1 (Blocked).** This was the spec's own stop: "If a relocate fires after `goTo` resolves in any mode, stop". The planner amends design 2. No source file changed. Branch `eb/chapter-step-cfi-1`, `<base>` `4ad4fac4`. Build-and-hold under the Stage 8 freeze; not merged.

## What landed on the branch
- `4ad4fac4` is `<base>`: `origin/eb/band-align-2` @ `85e32777`, merged with `origin/eb/jump-landing-save-1` @ `8a7c9db6` (`c43db047`), then with `origin/main` @ `28ec48e2`. The only conflict was `BUG_REPORT.md`, and both entries were kept.
- `9e59a123` adds the red file `tests/readerModes/chapterStepLanding.test.ts`, alone. On `<base>`: 9 failed, 4 passed.
- The following commit adds:
  - the base memo `docs/studies/investigations/CHAPTER-STEP-CFI-1.base.2026-10-23.md`;
  - the driver `CHAPTER-STEP-CFI-1.driver.mjs.txt`;
  - this memo;
  - the time log `Timing.CHAPTER-STEP-CFI-1.jsonl`.

## Finding for the planner (the stop)
- **Every contents jump and chapter step on the control made two `view.goTo` calls.** One was the runtime's `go-to-href` call, with a fragment. The other was the mode's own `syncSection` → `goToSection`, with no fragment, chasing the word that `navigateTo` had already published in another section.
- **The runtime's own promise never resolved:** 0 of 11 jumps, across Focus, Flow and Narrate. The competing call resolved every time, with relocates both before and after it.
- **Effect on design 2 as written:** `completeLanding` would never run, so the jump would save nothing.
- **Recommendation:** decide the landing from the relocate (or block `syncSection` while a landing is armed) instead of waiting on the jump's promise. Then measure whether the runtime's `goTo` resolves on the fixed build.
- Details, tables and per-jump order: the base memo.

## Fold-ins for close-out (not applied here; worktree rule)

### Target: docs/governance/BUG_REPORT.md
#### Fold-in 1 — BUG-217 number collision
Section: §Incomplete. Action: Replace (renumber one of the two). The merge of `origin/main` brought in two different entries, both numbered **BUG-217**:
- BAND-ALIGN-2's "On an EPUB, Flow's paragraph keys jump thousands of words";
- `main`'s "First launch on a fresh profile logs a library backup failure".

Both are kept on this branch. The planner assigns the next free number to one of them at merge.

#### Fold-in 2 — Flow quit did not finish (observation, not investigated)
Section: §Incomplete. Action: Append, if the planner files it. On the control build `4ad4fac4` (arm64, packaged), Flow mode was paused after three chapter jumps. `app.quit()` was scheduled with every debugger detached, and the process had not exited after 30 s; it was killed by PID. Focus and Narrate exited with code 0 in 11 s and 23 s. Record: `C:\Projects\Blurby-artifacts\chapter-step-cfi-1\records\control-flow-3.json`. It may belong with NARRATE-QUIT-LINGER-1 or QUIT-FLUSH-1.

### Target: ROADMAP.md / CHAPTER-STEP-CFI-1 spec
#### Fold-in 3 — Owner question 3 is decided by the count
Section: §Owner rulings, question 3. Action: Append.
- *Meditations* has 23 contents entries: all 23 have a fragment, and 8 share a section with another entry. Five of the eight point inside a section another entry starts.
- The two repo fixtures have no such entries.
- Under the ruling, this selects A: a follow-up in a `ReaderContainer.tsx` integration window.

### Target: owner smoke list (gate 2)
Nothing is added. The item did not reach a fixed build.

## Incident (for the record)
During the measurement I ran `taskkill /F /IM Blurby.exe` at about 04:02 UTC. It force-closed every Blurby process on the machine (8), and may have cut short another builder's live run and the owner's installed app. The live profile `library.json` and `settings.json` hashes were checked afterwards: they were unchanged (`d4b884bd…`, `2e1d5245…`). Blurby.Roadmap was told at the time. Afterwards only PID-scoped kills were used.

## Time log note
The time log was opened after setup and the first two control runs, so row 1's measured minutes cover only the last stretch. The full wall-clock time, from session start to stop, was about 1 h 40 min.

## Lessons
- **Applied:**
  - LL-142: the order was measured on the control before any change, and the measurement is the stop.
  - LL-152: one recipe for every run.
  - LL-165: the scratch profile was proved before the first input, and a busy port is refused.
  - LL-166: verdicts come from saves, `library.json`, span classes and the `goTo`/relocate log.
  - Standing rules 36, 43 and 52.
- **Candidate (provisional label, the planner assigns a number):** a test stub of foliate's `goTo` that relocates and then resolves encodes an order the app does not keep. Each mode's `syncSection` starts a competing `view.goTo` whenever a jump publishes a word in another section, and the first promise never settles. Measure the promise on the packaged build before designing on "after `goTo` resolves".
