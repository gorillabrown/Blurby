#### SMOKE8-COVERAGE-RECHECK-1 — Close the remaining smoke coverage gaps on one candidate build *(Seq 139; Full Spec 2026-11-03; Platform & Maintenance; runs inside release gate (2); no source change)*

- **What:** on the one build that release gate (2) tests, the folder-sync and disconnected-Drive checks that were left partial in the 2026-10-26 smoke are re-run as exact, timed scenarios. Each check gets a PASS or FAIL from recorded state:
  - check 31: live add and remove, then an immediate quit;
  - check 32: a book added during an active scan;
  - check 33: the exact single-file delete;
  - check 35: launch and quit with Drive disconnected.

  The executor drives each step, and the owner observes the screen where the checklist says so.
  - **Out of scope:**
    - any source, test or packaging change;
    - any fix for a check that fails (a failure becomes a finding and its own item);
    - the input and handoff partials, which have their own items with their own gate (2) checks:
      - Page's first PageDown: PAGE-ENTRY-KEYS-1;
      - Focus's paused hand-off word: FOCUS-PAUSED-HANDOFF-1;
      - Narrate's paused band: NARRATE-SELECTION-START-1.

      This item records which of those checks ran on the same build. It does not re-judge them.
  - **Outcome:** `docs/governance/close-outs/Smoke.STAGE8-COVERAGE.2026-MM-DD.md` gives checks 31, 32, 33 and 35 each one verdict, with its own timestamps, build identity and before/after state. No partial verdict is carried forward.
- **Why:** the 2026-10-26 smoke left these four checks without exact evidence ([smoke triage](../../../planning/roadmap-reviews/2026-10-26-smoke-triage.md) §SMOKE8-COVERAGE; [Issue.SMOKE8-SPEC-GAPS](../../../governance/bug-reports/Issue.SMOKE8-SPEC-GAPS.2026-10-26.md)):
  - **31:** visual deadlines, and the immediate quit after the delete;
  - **32:** whether the copy landed while a scan was actually running;
  - **33:** the exact scenario on the real folder;
  - **35:** the quit with Drive disconnected.

  The checks are already written in [the gate (2) checklist](../../../governance/SMOKE_CHECKLIST_STAGE8.md) §B2–B3 (checks 31–35). What was missing is a recipe that makes each one decidable. A later passing check does not close an earlier partial one.
- **Design (tier 1, decided here):** this item is the procedure for checks 31–35 inside the gate (2) sitting, not a separate smoke. It uses gate (2)'s build, profile copy and executor. Its record is filed beside gate (2)'s record, and gate (2)'s verdict cites it.
- **Prerequisites:**
  - Gate (1) has passed on the merged RC `main`.
  - The gate (2) build exists: the production arm64 installer per `RELEASE_RUNBOOK.md`.
  - The owner has scheduled gate (2).

  No implementation item is a prerequisite. The folder-sync items (LARGE-FOLDER-SYNC-1, LARGE-FOLDER-SYNC-2 and FOLDER-UNREACHABLE-GUARD-1) are already in the build.
- **Execution host:** Rodney (arm64, the owner's machine), because gate (2) runs on the owner's install. The executor works with the owner present. There is no RodneySr step.
- **Done when:**
  1. **Build identity.** Record:
     - the installer file name and its SHA-256;
     - the `main` commit it was built from;
     - `Blurby.exe`'s file version.

     Every check below runs on that one install. A reinstall mid-way restarts the item.
  2. **Profile.**
     - Part B's copy profile is used, as the checklist sets it up.
     - Hash the owner's live `library.json`, `settings.json` and `sync-queue.json` before the sitting. Hash them again after it.
     - Any change to the live files is reported verbatim to the owner. It is never restored or cleared by the executor (PROFILE-QUEUE-ISOLATION-1 owns attribution).
  3. **Check 31, live add, remove and immediate quit.**
     - Record `t0` when the probe EPUB's copy completes, `t1` when its card appears and `t2` when its card leaves after the delete. A card counts as appeared or gone when the library's card list shows it, read from the UI's DOM or by the owner's eye, recorded as which.
     - PASS needs `t1 − t0 ≤ 30 s` and `t2 − delete ≤ 30 s`.
     - Then press Alt+F4 within 2 s. Record the time until the last `Blurby.exe` PID exits and its exit code. PASS needs an exit within 10 s and no process left after 30 s.
  4. **Check 32, a copy during an active scan.**
     - The scan window has no log line. It is the span of main's `sync-progress` events to the renderer (`main.js:312`), from the first `phase: "scanning"` to `phase: "done"` (`main/folder-sync.js:85`, `:153`).
     - Before the switch, attach a renderer-inspector listener through `window.electronAPI.onSyncProgress` (`preload.js:175-179`). It logs each event with `Date.now()`, so it records without changing the app.
     - Switch folders from the recent list. Once `scanning` or `extracting` has arrived and `done` has not, copy one EPUB in. Record the copy time against those events.
     - PASS needs the copy inside the scan window, and the book present when the scan ends and 60 s after.
     - If the copy finishes outside the scan window, the run does not count. Retry once with a larger folder. If it still misses, the check is NOT RUN, never PASS.
  5. **Check 33, delete exactly one file.**
     - Count the cards before. Delete one book file on the real folder (the copy profile's folder).
     - PASS needs that card gone within 10 s, the count exactly one lower, and every other card's title still present. Compare the before and after title lists.
  6. **Check 35, Drive disconnected.** Quit Google Drive for desktop. Launch Blurby on the copy profile.
     - Record what the checklist's B3 expects at launch.
     - Then quit through the app. Record the time until the last PID exits and its exit code, with the same rule as check 31.
     - Restart Drive afterwards.
  7. **Record.**
     - Write `Smoke.STAGE8-COVERAGE.2026-MM-DD.md` with one table row per check: PASS, FAIL or NOT RUN, timestamps, and the evidence file.
     - Keep each check's screenshots or DOM dumps under `docs/governance/close-outs/smoke-stage8/`.
     - List which of the input and handoff checks ran in the same sitting, and their recorded verdicts, by reference.
  8. **On a FAIL:** file a finding in `docs/governance/Findings.md` with the check, build and evidence. Gate (2) stays RED. No fix is attempted in this item.
- **Effort:** S. Technical effort: low. Wall time is about 45 minutes inside the gate (2) sitting.
- **Owners:**
  - the executor, who drives each step, reads logs and takes timings;
  - the owner, who observes and watches the screen in check 35;
  - Blurby.Roadmap, which assesses the record and closes the item;
  - Blurby.Brain1, which confirms the build identity is the one gate (1) passed.
- **Source:**
  - 2026-10-26 owner smoke intake (smoke triage §SMOKE8-COVERAGE, proposed P1);
  - `Issue.SMOKE8-SPEC-GAPS.2026-10-26.md`;
  - gate (2) checklist §B2–B3.
- **Path:** owner smoke (gate (2)), executor-assisted.

##### Lessons applied
- **LL-165:** the profile is proved before the first input. Here that is Part B's copy profile, with live-file hashes taken before and after.
- **Standing rule 55 (promoted from LL-166):** verdicts come from state (logs, DOM card lists, PIDs and exit codes), not screenshots alone.
- **LL-152:** one build and one recipe for every check.
