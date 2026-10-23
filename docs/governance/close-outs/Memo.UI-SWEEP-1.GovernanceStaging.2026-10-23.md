# Dispatch Close-Out Governance Staging — UI-SWEEP-1

**Status:** the full live run is complete, and the report is committed.
- **Pause:** UI-SWEEP-1 was parked on 2026-10-23 while the release fixes went first. It resumed after BOOK-TYPE-SCALE-1 merged.
- **Merge:** on Blurby.Roadmap's go. The freeze admits it: the script and report do not ship, because `scripts/` is not in `build.files`.

- **Branch:** `eb/ui-sweep-1`.
  - The script and self-test were pushed at `3ce8ed88` on 2026-10-22.
  - The harness fixes are `21222650`, `6f6e8adc` and `cbe5a9d1`, plus `--build` at close-out.
- **Base change (Blurby.Roadmap, 2026-10-23):** the specification names a `--dir` package of `47ae6e1f`. The run used a `--dir` x64 package of the release-fix sha `97527896` (tree `4cda8d7c`), because the shipping tree is what matters now.
  - The package was built in `C:\Projects\Blurby\.worktrees\book-type-scale-1`, whose HEAD has the same tree.
  - The sweep runs from a copy at `C:\Projects\Blurby-artifacts\ui-sweep-1\build-97527896-x64\`, because of BUG-194.
  - Done-when 2 and 8 therefore read `97527896` in place of `47ae6e1f`. FOLIATE-OBSERVER-LEAK-1 is not merged at `97527896`, so BUG-187's flood is still the known defect.
- **Seeds** (copies in `C:\Projects\Blurby-artifacts\ui-sweep-1\seeds\`): the bundled sample, plus `g0-converted-text.epub`, `Superhuman_Keyboard_Shortcuts.pdf` and `prose-basic.txt`, all tracked repository files.
- **Runner:** `C:\Projects\Blurby-artifacts\ui-sweep-1\run-sweep.ps1 -Label <name> -TimeboxMin 120 -Live [-Build build-<sha>-x64]`.
  - It uses debug port 9370 and a fresh scratch profile under `%TEMP%`.
  - The live profile is only hashed, never opened.

## Evidence (Done-when)

1. **Script, no new dependency.** `node --check scripts/ui-sweep/sweep.mjs` exits 0. It uses Node 24 built-ins only. `git diff --name-only refs/remotes/origin/main -- package.json package-lock.json` prints nothing.
2. **Positive control on `97527896`.** It was confirmed before the full run, in a Flow-only run (`ctl97527896`): 25 ERROR rows on "Keyboard — Flow" carry the ResizeObserver message in `error.log` growth. In the full run it passes again, with 34 such rows on Flow surfaces.
3. **Method:** per control, as specified. Escape resets after each press, and the route is replayed when the surface is lost.
4. **Coverage:** 57 surface sections, with 369 controls and no UNKNOWN rows. Twelve surfaces are UNREACHABLE, each with its reason. Three of them have a code reason, listed in the report as W1–W3: TextSizeSettings is not routed; the QuickSettingsPopover shortcut cannot fire on a US layout; and NotePopover has no listener.
5. **Summary:** `docs/studies/investigations/UI-SWEEP-1.2026-10-23.md` gives the totals: 145 OK, 97 ERROR, 107 NO-EFFECT, 10 SKIPPED-SAFETY, 0 SKIPPED-DIALOG and 10 UNREACHABLE (run time 67.4 min).
   - All 97 ERROR rows carry only the BUG-187 evidence and are reported once. No other ERROR candidate remains.
   - The report lists 104 NO-EFFECT bug candidates for the planner's triage. Many are text inputs, where a press only focuses the field.
   - Screenshots are in `C:\Projects\Blurby-artifacts\ui-sweep-1\full4\`, referenced by file name and not committed.
6. **Live profile untouched:** `library.json` `d4b884bd…cffbdf6` and `settings.json` `1a4a40c6…818debd4` are equal before and after.
7. **Fence:** `scripts/ui-sweep/sweep.mjs`, `scripts/ui-sweep/README.md`, the report and this memo. There is no time log.
8. **No product code.** The suite, typecheck and build are not gates. The `--dir` package of `97527896` was the run's own step.

**A note on the report:** the report's title and its BUG-187 label were written by the harness while it still hard-coded `47ae6e1f`. Both were corrected by hand to `97527896`, and the report says so in its opening Base line. The harness now takes `--build <sha>`, so a rerun prints the base itself. Nothing else in the report was edited.

## Run history

1. **Trial runs found harness faults.** These were fixed in `21222650`, `6f6e8adc` and `cbe5a9d1`, none of which touches product code:
   - the CRLF end marker;
   - seed visibility and matching;
   - a failing surface ending the whole run;
   - "Archive document" archiving the sample in the main pass;
   - icon-prefixed settings items;
   - clipboard focus.
2. **Full run 2** was on `47ae6e1f`, before `cbe5a9d1`. It reached 19 of 57 surfaces and was superseded.
3. **Full run 3** was on `47ae6e1f`. It stopped when the priority changed.
4. **The first full4 start**, on `47ae6e1f`, was stopped a few minutes in when the base moved. Its output was discarded.
5. **Full run 4**, on `97527896`, is the reported run.

## Lessons

- **Applied:**
  - Standing rule 43: the positive control gates the run, and it was re-confirmed on the new base before the run.
  - LL-142.
  - LL-146: the scripts stay out of collectable test names.
  - Standing rule 46: nothing is written to the register.
- **Added:** none in the register.
  - Candidate: a harness that names its build in the report should take the sha as an argument. A hard-coded sha goes stale when the base moves.
