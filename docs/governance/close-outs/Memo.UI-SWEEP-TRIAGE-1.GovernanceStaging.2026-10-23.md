# Dispatch Close-Out Governance Staging — UI-SWEEP-TRIAGE-1

Seq 74. Diagnosis only, non-shipping.
- **Branch:** `eb/ui-sweep-triage-1`, from `main` @ `420efa85` (the UI-SWEEP-1 merge).
- **Merge:** on Blurby.Roadmap's go. Docs and `scripts/` only, so it may merge during the freeze.
- **Build:** UI-SWEEP-1's `--dir` package of `97527896`.
- **Report:** `docs/studies/investigations/UI-SWEEP-TRIAGE-1.2026-10-23.md`.

## Evidence (Done-when)

1. **The triage table** has 107 rows: the 104 NO-EFFECT candidates plus W1–W3. None is unclassified.
   - WORKS: 42.
   - BY-DESIGN: 39, plus W1.
   - DEFECT: 23, plus W2 and W3. Of those, 18 are Medium and 5 are Low; W2 and W3 are both Low.
2. **Positive control:** passed before every run.
   - "dark theme" from light: `--bg` `#f5f3ef` → `#0f0f0f`.
   - Library J: the strong probe saw `library.focused` change, while the sweep's digest changed in no field.
3. **Every DEFECT row is reproduced twice, with severity and `file:line`.** Two caveats:
   - #5 has one run of its own; it is the same control as #1, which has two.
   - #75 and #77 each have one triage run; the chapter bisect adds two Flow presses on each of two builds.
4. **W1–W3** are confirmed by code reads, with `file:line`.
5. **Fence and profile.** The fence is the report, this memo, `scripts/ui-sweep/triage.mjs` (new) and `scripts/ui-sweep/sweep.mjs` (exports, plus the profile preflight). There is no product code.
   - The triage runs left the live profile's hashes unchanged.
   - The one live change, settings.json at 03:24:45, came from the bisect incident below, not from the triage.

**Instrument corrections during the run** (each found by checking a null against a control or a screenshot):
- The parser missed the four destructive-pass rows (87–90).
- Route steps (`click`) fell through to the label path.
- "all (N)" is the status tab, not the type filter.
- The flap's open state is a class.
- Form values were not read.
- Reader rows must reach the text through Page: a TOC jump inside Focus or Flow leaves the reader on the cover, so run 2's Focus and Flow "nothing" results were discarded and the rows re-run (run 4).

**Release-blocking candidate sent to Blurby.Brain (2026-10-23):** the Focus and Flow navigation keys (#92–95, #100–103). They regressed in the READER-MODE-SEPARATION-2 cutover (`3dd4b504`), which predates the release line. Brain rules on it.

**Priority slot inside this dispatch (Blurby.Roadmap): the chapter bisect.**
- Chapter Previous/Next and ] are dead at v1.28.0 and at `97527896`, while Next page (the control) moved on both.
- 249f12ae was not measured: its app did not accept the debug connection. Roadmap ruled that no retry is needed.
- Verdict: pre-existing, not a release gate, and it goes to JUMP-LANDING-SAVE-1 (B).

## Lessons

- **Applied:**
  - Standing rule 43: the positive control ran first, and every null was checked against a control.
  - LL-142: every class comes from a measurement or a code read, never from a label.
  - Standing rule 46: nothing was written to the register.
- **Added:** none in the register. Lesson candidates for Blurby.Roadmap to record at close-out:
  1. **A driver must prove the profile it opened before its first action** (Blurby.Brain standing guardrail, 2026-10-23).
     - **Evidence:** the chapter bisect launched a v1.28.0 `--dir` build with `BLURBY_USER_DATA_DIR` set. v1.28.0 predates that variable (it landed in `238f47ec`, 2026-10-13), so the build opened `%APPDATA%\blurby` while the owner's app was running on it. Through it, the script's `saveSettings` rewrote the owner's settings.json at 03:24:45: hash `1a4a40c6…` → `2e1d5245…`, with readingMode and lastReadingMode set to "flow". It also wrote sync-queue.json. library.json was unchanged. Roadmap assessed the damage, and the owner's app rewrites settings on its next save or quit.
     - **Rule now in sweep.mjs `Session.profilePreflight`:**
       - The app launches with `--inspect` and `--user-data-dir=<scratch>`, plus `BLURBY_USER_DATA_DIR`.
       - Over the Node inspector, `app.getPath('userData')` must equal the scratch profile and must not be under `%APPDATA%\blurby`.
       - The scratch `blurby-data/covers` must appear, and the live hashes must not move during the run.
       - If any check fails, the driver exits 4.
       - A build older than `238f47ec` runs only if this preflight proves it honoured `--user-data-dir`; otherwise it does not run on this machine.
  2. **A sweep detector must read state, not just text.** UI-SWEEP-1's digest (DOM text, aria state and root attributes) reported 42 working controls as NO-EFFECT. They changed classes, CSS custom properties, settings, focus or form values, which the digest does not read.
  3. **A no-effect press needs a state where the control should act.** 39 candidates did nothing only because the sweep pressed them in a state where they had nothing to do, such as an already-selected theme, a closed flap or the first page.
