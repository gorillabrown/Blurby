# Issue — QUIT-FLUSH-1 — 2026-10-14 — code-quality review: two in-scope quit-flush defects (W1, W2)

**tl;dr:** The quality review (MINOR_FIXES) found two small defects in the prescribed quit flush. W1: the cloud sync's merged library is never saved at quit. W2: a step that finishes after the cap lets later saves start during exit. Fixing either changes the quit block, so the Done-when 9 smoke on `00dbba06` would have to be re-run.

**Executive Summary:** C2 (`00dbba06`, merged with origin/main as `cfd07f9d`) passes Done-when 1–8 and 10–12. The spec-compliance review is APPROVED_WITH_CONCERNS, with no deviation found. The code-quality review returned MINOR_FIXES with two confirmed in-scope warnings, each confirmed by reading the code.
- **W1** is a gap in the specification's step 7, not a deviation from it. It is the same class as BUG-192.
- **W2** contradicts the specification's stated intent that later steps do not run after the cap. Test (b) cannot see it, because its hanging step never settles.

Both fixes depart from the prescribed code, and W1 extends the owner's step list, so the merge waits on a ruling.

**Evidence of issue:**
- **W1.** In `main/sync-engine.js`, the library branch of `startSync` ("GC expired tombstones", `:836-841`) calls `ctx.saveLibrary()` after a `downloaded` or `merged` result. `saveLibrary` in `main.js` (`:129-140`, "Debounced library persistence") only arms a 500 ms timer and starts no write. The quit step "writes after sync" (`whenWritesSettled`, `main/json-store.js`) awaits only writes already in `writeTails`, so it returns at once. `app.quit()` then drops the timer. Result: when signed in and another device's changes merge during the quit sync, `library.json` keeps the pre-merge state until the next sync. The cloud copy holds the merge, so nothing is lost permanently.
- **W2.** In `runQuitSteps` (`main/quit-sequence.js`), the cap only resolves the race. The `run` loop keeps going. If the library write takes 3.4 s, the cap fires at 3.0 s and `app.quit()` starts the exit. At 3.4 s the loop starts "pending settings save", "settings" and "cloud sync" while the process exits, and a cut write leaves a stale `*.tmp`. Under LL-006 the previous file stays intact.
- Gate state: Done-when 2–8 green on `cfd07f9d` (tree `07915e21`); the Done-when 9 checklist has been sent for the `00dbba06` build.

**Possible cause(s):**
1. The specification's step 7 lists only the cloud sync's own settings, sync-state and queue writes. It missed the debounced library save that `startSync` arms. (W1, confidence high.)
2. The prescribed runner has no "cut" state: "abandoned, not cancelled" covered a hanging step, not a slow step that finishes after the cap. (W2, confidence high.)

**Likely solution(s):**
- **A (recommended): fix both now as one fix round, then re-smoke.**
  - W2: in `runQuitSteps`, set `cut = true` in the cap callback and `if (cut) break;` at the top of the loop. New test (h): step 2 resolves 100 ms after the cap, and step 3 is never called.
  - W1: in `main.js`'s step list, add `["library after sync", () => (_libraryDirty ? saveLibraryNow() : undefined)]` between "cloud sync" and "writes after sync". It writes only when the sync re-dirtied the library. New source-text test in `tests/quitSequence.test.js`: the step list holds "library after sync" between "cloud sync" and "writes after sync".
  - The same files are touched, so the diff fence is unchanged except for this issue file.
  - Then re-run Done-when 2–8, make a new `--dir` build, and re-smoke Done-when 9.
  - Cost: about 20 minutes plus one owner smoke. If the owner has not run the `00dbba06` smoke yet, hold it for the fixed build so there is only one owner session.
- **B: merge as specified, and route W1 and W2 to a follow-up.** For example, LARGE-FOLDER-SYNC-1 already edits `stopNewWork` and merges after this item. This keeps the current smoke valid, but leaves a known quit-time save gap (W1) in a BUG-192 fix.
- Optional hardening (N1): a `try/finally` in `onWillQuit` so a throw outside the guards cannot leave the state at "flushing", which would block every later quit. No realistic throw path exists today.
- Planner-only (no action this run):
  - S1: the sequential, library-first order. A library write over 3 s starves the settings flush.
  - S2: `autoUpdater.quitAndInstall` spawns the installer before `app.quit()`, so the installer starts while the flush runs (up to 3 s, or 30 s when the producer is stopping).

**Confidence in cause and solution identification (1–10):** 9 — both defects are confirmed by reading the code paths end to end. The fixes are a few lines each, with a test that fails without them.
