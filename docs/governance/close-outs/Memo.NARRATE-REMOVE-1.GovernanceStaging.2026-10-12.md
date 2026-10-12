# Sprint Close-Out Governance Staging — NARRATE-REMOVE-1

This file enumerates every governance change the sprint would have made to
main governance documents during execution, but staged here per virtuoso's
worktree-edit prohibition. pointer-closeout processes this file at sprint
close to apply the fold-ins to canonical main.

Run: the 2026-10-12 dispatch (owner confirmed ownership at session start, D14).
Branch: eb/narrate-remove-1 · Worktree: C:\Projects\Blurby\.worktrees\narrate-remove-1 · Reconciliation: (A) start.
Queue depth at dispatch (read before the In Flight move): 1 queued item, NARRATE-REMOVE-1 itself (/next-pointer, snapshot 2026-10-12T17:38:12Z).

## Run record

(Lines the run appends as it goes: `Base measurement:`, `C4 correction:`, `Smoke:`, `Exception:`, integration. Each sha is the full 40-character sha.)

Base measurement: 612d03f5bdadf861a875d76c6260fd8d3a7520aa — npm run typecheck exit 0; npm test exit 0 (234 files passed, 1 skipped; 3410 tests passed, 133 skipped, 0 failed; 36.15 s); npm run build exit 0; closure check --self-test exit 0 (7/7 forms, 5 lookalikes ignored) and on . exit 0 (dangling relative imports: 0); gate positive controls on the base, each exit 0 with empty stderr: Done-when 1 ls-files 35 lines, 5 grep 9, 8 grep 11, 9 preload 51, 9 src 68, 10 ls-files 9, 10 grep 18, 11 grep 12 (same as b4335606 and 0bd2bbbf). Measured in the branch worktree (reconciliation (A)) on 2026-10-12.
Omission controls (Done-when 7), run before C3 on the C3 working tree, each line removed then restored hash-identical: Omission control [loadSettingsData]: exit 1; Tests  1 failed | 14 passed (15); failing: normalizes a schema-13 object that still holds narrate 8ms || Omission control [applyCloudSettings]: exit 1; Tests  2 failed | 13 passed (15); failing: normalizes before the settings save and keeps unrelated keys 5ms | a newer cloud narrate wins the merge, then apply submits flow 1ms || Omission control [save-settings handler]: exit 1; Tests  1 failed | 14 passed (15); failing: normalizes before get-state and before the debounced save and sync enqueue 6ms
Full-suite note (Done-when 14): the first full run on the C4 working tree failed only tests/wordPositionIndex.test.ts 'builds a 5,000-span section and keeps lookup coverage intact' (AssertionError: expected 218.2757999999999 to be less than 200, the buildTimeMs budget at line 148); it passed alone (5/5, 726 ms) and the second full run passed (134 files passed; 1955 passed, 1 skipped, 0 failed; 22 s). Per the TEST-TIMEOUT-HEADROOM-1 close-out ruling (its line 84): record as a new low bug, not fixed here.
Edit note (within a named edit site, not an Exception): tests/startupStabilization.test.ts also lost its 'preload.js exposes kokoroPreload channel' test, a Narrate part removed by C3 that the spec's list for that file did not name.
Edit note (within named edit sites, for the reviews): unused type imports dropped alongside the prescribed removals (src/reader/ports/ReaderPorts.ts: PauseConfig, PronunciationOverride, TtsEngine; src/utils/narrateDiagnostics.ts: TtsEngine; src/constants.ts: NarrationProfile); comments describing removed wiring reworded in ReaderContainer.tsx, createReaderPorts.ts, ReaderPorts.ts and useKeyboardShortcuts.ts; the kept per-mode helpers' local 'narrate' style-hint test coverage was removed from tests/foliateWordHighlight.test.ts and tests/foliateAnchorNavigation.test.ts (that src code is kept and now untested; candidate for CLEANUP-MODE-BARREL-1); tests/useKeyboardShortcuts.test.ts turned its T-key not.toBe('toggleNarration') checks into toBe('none'); tests/readerModeIsolation.test.ts's teardown test asserts toContain('settings.update{isNarrating}') in place of 'audio.stop'.
Gate record (Done-when 1-15) on committed C4 75095813985d7e07dcd48ee23f7ebef245e83aa5 (tree 76d0e6334168b0cd2fcf4e5f16bb51182c3d798c), PowerShell 7, 2026-10-12: 34/34 PASS. Targeted suites: DW2 27, DW3 15, DW4 42, DW5 5, DW6 6, DW7 9, DW9 21, DW12 73 tests; DW7 wiring 7/7 exact; DW5/8/9/10/11 greps exit 1 with no output; DW8 Kokoro main files and DW12 baselines byte-identical to origin/main; DW12 only the three ModeRuntime.ts changed; DW13 typecheck 0 errors, closure self-test 7/7, 0 dangling imports; DW14 npm test exit 0 (134 files; 1955 passed, 1 skipped, 0 failed), npm run build exit 0 (built in 1.91 s), git diff --check <base> exit 0; DW15 fence D=247 M=66 A=2, 0 outside.
C4 correction: 75095813985d7e07dcd48ee23f7ebef245e83aa5 — spec-compliance review finding 1 (MEDIUM): the deleted src/styles/tts-settings.css also held the Reading Goals settings styles (nine classes used by the retained src/components/settings/ReadingGoalsSettings.tsx; no surviving stylesheet defines them). Owner decision 2026-10-12: restore the block verbatim into a new src/styles/reading-goals.css, imported from src/styles/index.css; amend C4; re-run Done-when 1-15 and both reviews.
Exception: src/styles/reading-goals.css — new retained stylesheet holding, verbatim, the Reading Goals block of the deleted src/styles/tts-settings.css (its lines 12 to the end of the .reading-goal-delete rule on origin/main), so the retained Reading Goals settings page keeps its styling. Added as an A outside the Done-when 15 fence by owner decision 2026-10-12 (spec-compliance review finding 1).

## Target: ROADMAP.md

### Fold-in 1 — Mid-Dispatch Amendment (Reading Goals styles restored)
Section: §NARRATE-REMOVE-1 (inline full spec)
Action: Migrate
Source: This amendment block (below)
Destination: Close-out memo §Mid-Dispatch Decisions
Content:
##### Mid-Dispatch Amendment — 2026-10-12 — Reading Goals styles restored
Decision Type: scope widening by one excepted path (C4 correction)
Context: the spec-compliance review of C1–C4 found that the Delete-list file src/styles/tts-settings.css also carried the Reading Goals settings styles (.reading-goals-create, .reading-goal-row, .reading-goal-unit, .reading-goal-progress, .reading-goal-streak, .reading-goals-empty, .reading-goal-delete and the inputs inside them), used by the retained ReadingGoalsSettings.tsx and defined nowhere else. The spec-compliant deletion would leave Settings → Reading Goals unstyled.
Decision: restore that block verbatim into a new src/styles/reading-goals.css and import it from src/styles/index.css (an edit site); record it as an Exception: path; amend C4; rerun Done-when 1–15 and both reviews; the owner confirms the page in smoke 16(c).
Rationale: smallest diff that keeps the retained page styled; no TTS or Narrate rule travels with it; the spec anticipates review findings folded into C4 by amend with Exception lines.

C4 amended: 317931826ce13d0b948c9a0434659005cf335eed — the Reading Goals correction is folded in (src/styles/reading-goals.css added, src/styles/index.css imports it); the correction on 75095813985d7e07dcd48ee23f7ebef245e83aa5 is finished.
Gate record (Done-when 1-15) on amended C4 317931826ce13d0b948c9a0434659005cf335eed (tree 0c9c29fea7f52c6b5435938e684b2ff1cbaf0c16), PowerShell 7, 2026-10-12: 34/34 PASS, same per-row results as on 75095813 (DW14 npm test exit 0: 134 files; 1955 passed, 1 skipped, 0 failed; build exit 0, built in 1.61 s; typecheck 0; closure 0; baselines byte-identical); DW15 fence D=247 M=66 A=3 (the third A is src/styles/reading-goals.css, named on the Exception: line), 0 outside. git grep for tts|kokoro|narrat|qwen|moss|pocket in src/styles/reading-goals.css exits 1.
Smoke prep (Done-when 16(e), owner decision 2026-10-12): with Blurby closed, lastReadingMode set to 'narrate' in the live profile %APPDATA%\blurby\blurby-data\settings.json (schemaVersion 12, readingMode flow, key count unchanged); a pre-upgrade settings.json.bak from an earlier upgrade already existed before this smoke. The app is started with npm run dev from the branch worktree at C4 317931826ce13d0b948c9a0434659005cf335eed.
Paused by the owner on 2026-10-12 before the smoke's dev server was started (row 7 waiting on the owner). State: eb/narrate-remove-1 at C4 317931826ce13d0b948c9a0434659005cf335eed (n = 4), no unfinished C4 correction, Done-when 1-15 gate and both reviews recorded above on this sha, no Smoke: line yet; the live settings.json already reads lastReadingMode 'narrate'; no Blurby or dev server process running.
Smoke: 317931826ce13d0b948c9a0434659005cf335eed 16(a) pass
Smoke: 317931826ce13d0b948c9a0434659005cf335eed 16(b) pass
Smoke: 317931826ce13d0b948c9a0434659005cf335eed 16(c) pass
Smoke: 317931826ce13d0b948c9a0434659005cf335eed 16(d) pass
Smoke note: on this first launch the live profile migrated to schemaVersion 13 (lastReadingMode narrate -> flow) and the pre-upgrade settings.json.bak (schema 12, narrate) was kept, as D13 predicts. The dev log shows BUG-185 at startup: ENOENT on rename settings.json.tmp -> settings.json and sync-queue.json.tmp (shared .tmp path race), out of scope by the spec. The owner reported the app too slow to run 16(e) and 16(f); the profile error.log received 7226 "ResizeObserver loop completed with undelivered notifications" lines between 22:50:46Z and 22:56:10Z; investigation below.
A/B on the slowness (owner decision 2026-10-12): the base (main @ 612d03f5, primary checkout, npm run dev, same profile) was run for about a minute with the same actions; the owner reports it equally slow (library included). error.log grew by 0 lines during the base run (0 ResizeObserver). Conclusion: pre-existing dev-mode slowness on this machine, not a regression of this sprint; the ResizeObserver-loop flood (seen in May 2026 on earlier builds too) is filed as a new low bug in the fold-ins. Profile re-primed (lastReadingMode narrate at schema 13) for the repeated smoke of 16(e) and 16(f); no new backup expected (D13).
Observation (open, not a Done-when row): during the owner's ~1 minute on the base the error.log did not grow at all, while the sprint build's 13-minute session logged 7226 ResizeObserver-loop warnings between 22:50:46Z and 22:56:10Z; the sessions differ in length and actions, so the flood's cause (pre-existing May-2026 pattern vs. a change of this sprint) is undetermined and is filed for a read-only diagnosis (Aristotle) outside this sprint, which may not touch the Page, Focus or Flow views where the five observers live.
Smoke: 317931826ce13d0b948c9a0434659005cf335eed 16(e) pass
Smoke note: 16(e) was run on the second launch of C4 after the profile was re-primed at schema 13 (lastReadingMode narrate); loadSettingsData normalized it to flow on load and no new settings.json.bak was written (bak mtime unchanged), as D12/D13 predict.
Observation (pre-existing, not a Done-when row): the owner reports the Flow horizontal cursor in the wrong place on the sprint build and confirms the base build (main @ 612d03f5, same profile, A/B run 2026-10-12) shows it wrong the same way. Evidence that the removal cannot have caused it: the only Flow files changed are src/reader/modes/flow/ModeRuntime.ts (three tts fields in startEngine), src/styles/index.css (import lines), src/styles/page-reader.css (.kokoro-loading-toast rule only) and the new src/styles/reading-goals.css; every rule in the deleted src/reader/modes/narrate/mode.css was scoped under .rm-narrate-root, and its header states that .flow-shrink-cursor and the .foliate-page-view--chunk-visual cursor rule were not copied into it; .flow-shrink-cursor lives in src/styles/flow.css and src/reader/modes/flow/mode.css, both unchanged. Filed for triage (likely the known Flow band item listed as out of scope by the spec).
Smoke: 317931826ce13d0b948c9a0434659005cf335eed 16(f) pass
Smoke note (16(f) basis): owner decision 2026-10-12 to accept the static verification of the Shift+Space slots as the (f) record, because dev-mode slowness on this machine (equally slow on the base, A/B above) made the key sequence hard to judge. Live observations recorded: in Page, Shift+Space opened no mode ("it seemed like nothing"), which is the pass condition the spec names (a mode opening from Page would be the fail); from Flow, Shift+Space switched reading modes. The outline movement in Page was not visually confirmed. Static re-derivation by the orchestrator: useReaderKeys parameters 151-155 are openChapterList, cycleMode, cycleAndStart, sentencePrev, sentenceNext and the ReaderContainer.tsx call (line 709) passes handleOpenChapterList, handleCycleMode, handleCycleAndStart, handleSentencePrev, handleSentenceNext in those positions (27 arguments, 27 parameters); both reviewers confirmed the same.
Smoke summary on C4 317931826ce13d0b948c9a0434659005cf335eed: 16(a) pass, (b) pass, (c) pass (Reading Goals page styled), (d) pass, (e) pass, (f) pass (owner-accepted static record, live observations consistent). Pre-existing observations filed, not failures: dev-mode slowness (equal on the base), the ResizeObserver-loop warning flood (cause undetermined; the base did not reproduce it in a shorter session), the Flow horizontal-cursor placement (same on the base), BUG-185 rename races at startup.

### Fold-in 2 — Mid-Dispatch Amendment (16(f) recorded from static verification)
Section: §NARRATE-REMOVE-1 (inline full spec)
Action: Migrate
Source: This amendment block (below)
Destination: Close-out memo §Mid-Dispatch Decisions
Content:
##### Mid-Dispatch Amendment — 2026-10-12 — Done-when 16(f) recorded from static verification
Decision Type: acceptance-evidence substitution (owner)
Context: the owner reported the dev-mode app too slow to drive the Shift+Space sequence reliably; an A/B on the base build (main @ 612d03f5) was equally slow, so the slowness is pre-existing. The owner observed that Shift+Space in Page opened no mode and that from Flow it switched modes, but could not confirm the outline movement.
Decision: record 16(f) as pass on the basis of the two reviewers' and the orchestrator's static verification of the useReaderKeys slot alignment (D8/D15), with the live observations noted. The owner made this decision explicitly when asked.
Rationale: the fail condition the spec names for (f) (a mode opening from Page) was observed not to occur; the slot alignment that (f) guards is verified three ways; repeating the live check requires a faster build (a production build, or the pre-existing slowness fixed first).

Evidence for the horizontal-cursor observation: the owner's screenshot (sent to the planner session, 2026-10-12; copy at the executing session's scratchpad as owner-screenshot-horizontal-cursor.png, 1250x849) shows The Raven in Focus on the sprint build: bar Page | Focus | Flow with Focus active, greyed speed chip 1.60x, A- 120% A+, Play; a three-line dark band over lines 3-5 of the visible page while the blue word underline sits under 'borrow' on line 6. The owner identifies the misplaced horizontal cursor as the issue and confirms the base build shows it the same way. Not a Done-when failure; filed for triage with the Flow band item. The close-out should archive the screenshot with the bug.

---

(Appended by MarcusAurelius, 2026-10-12, after the review and smoke gates. Fold-ins below continue the numbering of the targets above. No merge sha is known yet: every place that needs one reads `<merge sha, recorded at close-out>` (LL-148). Lesson and bug numbers are PROVISIONAL and are reassigned at fold-in against the live catalog tips, LL-149 and BUG-185.)

## Target: ROADMAP.md

### Fold-in 3 — Header: Last updated line
Section: §header, line 3 (`**Last updated**`)
Action: Replace
Content:
Old (verbatim prefix of line 3; the rest of the line, from ` Earlier that day, OutsideAudit.10 closed`, stays):
```
**Last updated**: 2026-10-12 (close-outs: TEST-TIMEOUT-HEADROOM-1, EINK-HOVER-FIX-1 and LIBRARY-SETTINGS-FIX-1 completed; NARRATE-REMOVE-1 heads the queue).
```
New:
```
**Last updated**: 2026-10-12 (close-out: NARRATE-REMOVE-1 completed, merge <merge sha, recorded at close-out>; NARRATE-REBUILD-1 heads the queue). Earlier that day, TEST-TIMEOUT-HEADROOM-1, EINK-HOVER-FIX-1 and LIBRARY-SETTINGS-FIX-1 completed.
```

### Fold-in 4 — Header: Current state line
Section: §header, line 4 (`**Current state**`)
Action: Replace
Content:
Old:
```
**Current state**: v1.75.1 baseline. Page, Focus, Flow and Narrate run as independent runtimes behind a thin router (READER-MODE-SEPARATION-2, 2026-10-11). The full suite passes on the owner's machine (3,410 passed / 133 skipped, two runs, 2026-10-12), and typecheck exits 0. Kokoro is the sole engine. Narrate is next to be removed (NARRATE-REMOVE-1) and rebuilt from scratch (NARRATE-REBUILD-1).
```
New:
```
**Current state**: v1.75.1 baseline. Page, Focus and Flow run as independent runtimes behind a thin router (READER-MODE-SEPARATION-2, 2026-10-11). Narrate is removed (NARRATE-REMOVE-1, completed 2026-10-12; merge <merge sha, recorded at close-out>): the mode, its hooks, strategies, UI and tests are deleted, and so are the dormant MOSS-Nano, Pocket and Qwen engines. Kokoro stays in the main process, dormant and unreachable from the UI, until NARRATE-REBUILD-1 builds the new Narrate on it. The full suite passes on the owner's machine (1,955 passed / 1 skipped in 134 files, 0 failed, 2026-10-12; the base had 3,410 passed / 133 skipped in 235 files), and typecheck exits 0.
```

### Fold-in 5 — Header: Queue line
Section: §header, line 6 (`**Queue**`)
Action: Replace
Content:
Old:
```
**Queue**: NARRATE-REMOVE-1 (8, Full Spec revision 4, 3 waves, runs alone: shared-core freeze set; the queue-depth gate is waived for this one dispatch, R1) → NARRATE-REBUILD-1 (9, **Path: epic**) → CLEANUP-MODE-BARREL-1 (10) and UX-POLISH-1 (11), both after the removal. Stage 6 (5–7) completed 2026-10-12.
```
New:
```
**Queue**: NARRATE-REBUILD-1 (9, **Path: epic**, unblocked: `/epic` may start) → CLEANUP-MODE-BARREL-1 (10) and UX-POLISH-1 (11), both unblocked stubs awaiting re-authoring against the separated graph. NARRATE-REMOVE-1 (8) completed 2026-10-12, and Stage 6 (5–7) completed the same day. **Dispatch-ready depth is below 3** (no full specification is queued; the epic is excluded from the buffer): standing rule 8 and CLAUDE.md Rule 5a apply again, so `/roadmap-review` backfills before the next dispatch.
```

### Fold-in 6 — Header: Last sprint line
Section: §header, line 7 (`**Last sprint**`)
Action: Replace
Content:
Old (verbatim prefix of line 7; the rest of the line stays):
```
**Last sprint**: TEST-TIMEOUT-HEADROOM-1, EINK-HOVER-FIX-1 and LIBRARY-SETTINGS-FIX-1, all completed 2026-10-12 (close-outs:
```
New:
```
**Last sprint**: NARRATE-REMOVE-1, completed 2026-10-12 (merge <merge sha, recorded at close-out>; [close-out](docs/governance/close-outs/CloseOut.NARRATE-REMOVE-1.2026-10-12.md)). Before it, TEST-TIMEOUT-HEADROOM-1, EINK-HOVER-FIX-1 and LIBRARY-SETTINGS-FIX-1, all completed 2026-10-12 (close-outs:
```

### Fold-in 7 — Migrate the NARRATE-REMOVE-1 specification to the archive; leave a completion stub
Section: §Stage 3 — Narration rebuild, the whole `#### NARRATE-REMOVE-1 — Narrate removal (keep Kokoro dormant) *(position 8 — Full Spec)*` section
Action: Migrate
Source: ROADMAP.md, from the line `<a id="narrate-remove-1"></a>` (line 192 at this branch's tip) through the line before `<a id="narrate-rebuild-1"></a>` (line 762); the section is moved verbatim, anchors included. Do not paste it here.
Destination: `docs/planning/.Archive/ROADMAP_legacy.md`, appended at the end under the heading `### NARRATE-REMOVE-1 (archived 2026-10-12; completed, merge <merge sha, recorded at close-out>)`, with this sentence above the moved text: "Full Spec revision 4, authorized by OutsideAudit.10 D4b. The two mid-dispatch amendments (staging fold-ins 1 and 2) are recorded in the close-out `docs/governance/close-outs/CloseOut.NARRATE-REMOVE-1.2026-10-12.md` §Mid-Dispatch Decisions."
Content (the stub that replaces the moved section in ROADMAP.md, at the same place, directly before `<a id="narrate-rebuild-1"></a>`):
```
**Completed 2026-10-12:** NARRATE-REMOVE-1 — the Narrate mode, its hooks, strategies, renderer UI, and the dormant MOSS-Nano, Pocket and Qwen engines are deleted; Kokoro stays dormant in the main process with no UI path; a v13 migration and three ingestion points turn a saved `narrate` reading mode into `flow`; the Page, Focus and Flow baselines are byte-identical (merge <merge sha, recorded at close-out>; [close-out](docs/governance/close-outs/CloseOut.NARRATE-REMOVE-1.2026-10-12.md); specification archived to `docs/planning/.Archive/ROADMAP_legacy.md`). <a id="narrate-remove-1"></a>
```

### Fold-in 8 — Stage 3 intro: NARRATE-REMOVE-1 completed
Section: §Stage 3 — Narration rebuild, after the paragraph ending "Their stubs are archived to `docs/planning/.Archive/ROADMAP_legacy.md`. <a id="narrate-heard-cursor-1"></a>…"
Action: Insert after
Content:
```

NARRATE-REMOVE-1 completed 2026-10-12 (merge <merge sha, recorded at close-out>), so NARRATE-REBUILD-1 has no open prerequisite and `/epic` may start. The removal base is `612d03f5bdadf861a875d76c6260fd8d3a7520aa` (the `NARRATE-REMOVE-1-Base:` trailer of C1, `238e12e6`); the deleted fixtures and code are recoverable at that sha (`git show 612d03f5bdadf861a875d76c6260fd8d3a7520aa:<path>`).
```

### Fold-in 9 — NARRATE-REBUILD-1: prerequisite reads completed
Section: §NARRATE-REBUILD-1 — Rebuild Narrate with the cursor attached to the playing word, the `- **Prerequisites:**` bullet
Action: Replace
Content:
Old:
```
- **Prerequisites:** NARRATE-REMOVE-1.
```
New:
```
- **Prerequisites:** NARRATE-REMOVE-1 (completed 2026-10-12; merge <merge sha, recorded at close-out>).
```

### Fold-in 10 — NARRATE-REBUILD-1: charter inputs from the removal run
Section: §NARRATE-REBUILD-1, directly after the `- **Charter carry-over (OutsideAudit.10 F6; LL-144):**` bullet
Action: Insert after
Content:
```
- **Charter inputs from the NARRATE-REMOVE-1 run (2026-10-12; `/epic` turns each into a charter requirement with a test):**
  1. **Fixture recovery.** The Phase 0 corpus is copied from the removal base: `git show 612d03f5bdadf861a875d76c6260fd8d3a7520aa:tests/fixtures/narration/<file>`. Two fixture directories and 139 test files were deleted in C4.
  2. **Initialize the cache before use.** `main.js` no longer calls `ttsCache.init` at launch, while the `tts-cache-*` IPC handlers stay registered in `main/ipc/tts.js`. The rebuild must call `ttsCache.init` before it reads or writes the cache (and, per rule R10, never plays the old cache).
  3. **Nothing starts Kokoro at launch.** The five Kokoro main-process files (`main/tts-engine.js`, `main/tts-engine-marathon.js`, `main/tts-worker.js`, `main/tts-cache.js`, `main/tts-opus.js`) are byte-identical to the base; the handlers (`tts-kokoro-*`, marathon, `extract-epub-words`, `tts-cache-*`) are registered but unreachable, and `preload.js` exposes none of them except `extractEpubWords` and the eval-trace bridge. The rebuild adds its own preload surface.
  4. **Leftovers to retire.** The kept per-mode helpers carry a local `"narrate"` style-hint literal that is now untested (`src/utils/foliateWordHighlight.ts`, `startWordIndex.ts`, `persistentReadingAnchor.ts`, `chunkReadingVisualState.ts`, the three per-mode copies, `src/types/eval.ts`, `src/types/chunkReading.ts`), and `src/reader/modes/ReaderModeAdapter.ts` keeps an `"audio-truth"` `clockOwner` member with no producer (`tests/readerModeAdapterContract.test.ts` still lists it). CLEANUP-MODE-BARREL-1 or the rebuild retires them; if the rebuild uses either value, it re-adds it with tests.
  5. **Runtime normalization.** `normalizeReaderModes` is called in `loadSettingsData` (`main/migrations.js`), `applyCloudSettings` (`main/sync-engine.js`) and the `save-settings` handler (`main/ipc/state.js`); the Then-list item above retires these calls only if the rebuilt mode's id is `"narrate"`. The run proved by omission controls that removing the call at each site fails its test.
```

### Fold-in 11 — CLEANUP-MODE-BARREL-1: unblocked
Section: §CLEANUP-MODE-BARREL-1 — Remove the unused mode barrel and update structural tests: heading and `- **Prerequisites:**` bullet
Action: Replace
Content:
Old (heading):
```
#### CLEANUP-MODE-BARREL-1 — Remove the unused mode barrel and update structural tests *(position 10 — blocked stub)*
```
New:
```
#### CLEANUP-MODE-BARREL-1 — Remove the unused mode barrel and update structural tests *(position 10 — unblocked stub)*
```
Old (bullet):
```
- **Prerequisites:** NARRATE-REMOVE-1, which deletes `src/hooks/useReadingModeInstance.ts`, the barrel's only importer (READER-MODE-SEPARATION-2 completed 2026-10-11).
```
New:
```
- **Prerequisites:** none open. NARRATE-REMOVE-1 completed 2026-10-12 (merge <merge sha, recorded at close-out>) and deleted `src/hooks/useReadingModeInstance.ts`, the barrel's only importer; READER-MODE-SEPARATION-2 completed 2026-10-11. Re-author against the post-removal tree: the two structural suites named below may already have been edited or deleted by the removal (re-check with `git ls-files tests`). The kept helpers' local `"narrate"` style-hint literals and the `"audio-truth"` `clockOwner` member are candidates for this item (NARRATE-REBUILD-1 charter inputs, item 4).
```

### Fold-in 12 — UX-POLISH-1: unblocked, plus the hotkey-map stale hint
Section: §UX-POLISH-1 — Space resumes the last-used reading mode: heading, `- **Prerequisite:**` bullet, and after the `- **Re-authoring note (OutsideAudit.10 F5c):**` bullet
Action: Replace (heading and prerequisite), then Insert after (new bullet)
Content:
Old (heading):
```
#### UX-POLISH-1 — Space resumes the last-used reading mode *(position 11 — blocked stub)*
```
New:
```
#### UX-POLISH-1 — Space resumes the last-used reading mode *(position 11 — unblocked stub)*
```
Old (prerequisite bullet):
```
- **Prerequisite:** NARRATE-REMOVE-1 (its v13 migration turns a saved `narrate` mode into `flow`, so this item only ever sees Page, Focus or Flow).
```
New:
```
- **Prerequisite:** none open. NARRATE-REMOVE-1 completed 2026-10-12 (merge <merge sha, recorded at close-out>); its v13 migration turns a saved `narrate` mode into `flow`, so this item only ever sees Page, Focus or Flow.
```
Insert after the Re-authoring note bullet:
```
- **Re-authoring note (NARRATE-REMOVE-1 run, 2026-10-12):** `src/components/settings/HotkeyMapSettings.tsx` still shows `] / N` for Next chapter, though bare `N` is unbound after the removal; fix the hint when this item re-authors the shortcut help. The owner's live smoke on the removal (Done-when 16(f)) saw Shift+Space open no mode from Page and switch modes from Flow, consistent with D15.
```

### Fold-in 13 — Work lanes table: Reader Engine, TTS, UX rows
Section: §Work lanes (table rows)
Action: Replace
Content:
Old (Reader Engine row):
```
| Reader Engine | Page/Focus/Flow/Narrate mode lifecycle, EPUB rendering, selection/resume anchors, section handoff, visual highlighting and scroll-follow | READER-MODE-SEPARATION-2 is step 1; isolate Page/Focus/Flow/Narrate before downstream fixes; S9 Flow lazy-follow remains deferred; mode-barrel removal stub at position 10 |
```
New:
```
| Reader Engine | Page/Focus/Flow mode lifecycle (Narrate returns with NARRATE-REBUILD-1), EPUB rendering, selection/resume anchors, section handoff, visual highlighting and scroll-follow | READER-MODE-SEPARATION-2 (2026-10-11) and NARRATE-REMOVE-1 (2026-10-12) are complete: Page, Focus and Flow are independent runtimes and Narrate is removed; S9 Flow lazy-follow remains deferred; mode-barrel removal stub at position 10 (unblocked); the Focus/Flow horizontal cursor band placement is filed as a new bug (see BUG_REPORT) |
```
Old (TTS row, disposition cell):
```
HEARD-CURSOR probe, APPLYRATECHANGE-COLLAPSE, conditional SUBSCRIBER-CURSOR, all held behind mode separation; KOKORO-EXPORT deferred; sidecar/engine deduplication stubs at positions 7–8 |
```
New:
```
NARRATE-REBUILD-1 (epic, position 9, unblocked) is the only open item; Kokoro is dormant in the main process; MOSS-Nano, Pocket and Qwen are deleted; the earlier HEARD-CURSOR, APPLYRATECHANGE-COLLAPSE and SUBSCRIBER-CURSOR items are superseded and KOKORO-EXPORT dissolved (2026-10-11) |
```
Old (UX polish row, disposition cell):
```
UX-POLISH-1 (Space resumes saved mode), blocked on mode separation; BUG-184 Settings transparency is an open, unqueued candidate |
```
New:
```
UX-POLISH-1 (Space resumes saved mode), unblocked stub awaiting re-authoring (also carries the stale `] / N` hotkey hint); BUG-184 Settings transparency is resolved in source and open until the owner's e-ink smoke |
```

### Fold-in 14 — Frontmatter: buffer figures
Section: §the HTML frontmatter comment at the end of the file
Action: Replace
Content:
Old:
```
buffer_actual_full_specs: 1
buffer_dispatch_readiness: 1 dispatch-ready (NARRATE-REMOVE-1, under the R1 waiver) + 1 epic (excluded from buffer)
```
New:
```
buffer_actual_full_specs: 0
buffer_dispatch_readiness: 0 dispatch-ready (NARRATE-REMOVE-1 completed 2026-10-12; below the dispatchBuffer, so /roadmap-review backfills before the next dispatch) + 1 epic (NARRATE-REBUILD-1, unblocked, excluded from buffer) + 2 unblocked stubs awaiting re-authoring (CLEANUP-MODE-BARREL-1, UX-POLISH-1)
```

### Fold-in 15 — Standing rules 22–32 (SRL-060 to SRL-070): scope note
Section: §Standing Rules All Skeletons Inherit, directly after rule `32. **SRL-070:** …`
Action: Insert after
Content:
```
    - *Scope note (NARRATE-REMOVE-1, 2026-10-12):* rules 22–32 (SRL-060 to SRL-070) are Narrate-specific. Narrate is removed, so they have no code to govern today; they are kept, not deleted, and apply to NARRATE-REBUILD-1 (its charter restates the ones it adopts).
```

### Fold-in 16 — Standing rule 8 status note
Section: §Standing Rules All Skeletons Inherit, directly after rule `8. **Queue depth >=3:** …`
Action: Insert after
Content:
```
    - *Status (2026-10-12):* after NARRATE-REMOVE-1 the dispatch-ready depth is 0 full specs plus one epic (excluded); this rule and CLAUDE.md Rule 5a stop the next dispatch until `/roadmap-review` backfills.
```

## Target: CLAUDE.md

### Fold-in 1 — Current System State heading
Section: §Current System State
Action: Replace
Content:
Old:
```
## Current System State (v1.75.1 — restart audit 2026-09-23)
```
New:
```
## Current System State (v1.75.1 — NARRATE-REMOVE-1 completed 2026-10-12)
```

### Fold-in 2 — Retire the "Qwen disabled" guardrail
Section: §Current System State › Active guardrails
Action: Replace
Content:
Old:
```
- **Qwen disabled** — Qwen status/generate/stream calls return unavailable with `reason: “qwen-disabled”` and must not start a Qwen runtime for Desktop v2.
```
New:
```
- **Qwen code deleted** — NARRATE-REMOVE-1 (2026-10-12) deleted every Qwen, MOSS-Nano and Pocket module, handler, preload method, test and packaging entry. The earlier "qwen-disabled" stub no longer exists; no engine other than Kokoro (dormant) is in the tree.
```

### Fold-in 3 — Engine posture
Section: §Current System State › Current operational state
Action: Replace
Content:
Old:
```
- **Engine posture:** Kokoro is the sole engine. NARRATE-REMOVE-1 deletes the Narrate mode and the dormant MOSS-Nano, Pocket and Qwen code, leaving Kokoro dormant in the main process until NARRATE-REBUILD-1 builds the new Narrate on it (or, if Phase 0 fails, on a bake-off winner). Desktop v2.0 shipped.
```
New:
```
- **Engine posture:** Kokoro is the sole engine and is dormant. NARRATE-REMOVE-1 (2026-10-12) removed the Narrate mode and deleted the MOSS-Nano, Pocket and Qwen code; the Kokoro main-process files (`main/tts-engine.js`, `tts-engine-marathon.js`, `tts-worker.js`, `tts-cache.js`, `tts-opus.js`) are byte-identical to the base, their IPC handlers stay registered in `main/ipc/tts.js`, nothing starts Kokoro at launch, and the renderer and `preload.js` have no path to it. NARRATE-REBUILD-1 builds the new Narrate on it (or, if Phase 0 fails, on a bake-off winner) and must call `ttsCache.init` before using the cache. The reading modes are Page, Focus and Flow; settings schema 13 turns a saved `narrate` mode into `flow`. Desktop v2.0 shipped.
```

### Fold-in 4 — Queue paragraph
Section: §Current System State › Current operational state, the `- **Queue (close-outs 2026-10-12):**` bullet
Action: Replace
Content:
Old (verbatim prefix of the bullet; the rest of the bullet stays):
```
- **Queue (close-outs 2026-10-12):** monday.com board 18432450217. NARRATE-REMOVE-1 (8, Full Spec revision 4, authorized by OutsideAudit.10 D4b; runs alone; the queue-depth gate is waived for this one dispatch, R1) → NARRATE-REBUILD-1 (9, Path: epic) → CLEANUP-MODE-BARREL-1 (10) and UX-POLISH-1 (11). Completed 2026-10-12:
```
New:
```
- **Queue (close-outs 2026-10-12):** monday.com board 18432450217. NARRATE-REBUILD-1 (9, Path: epic, unblocked: `/epic` may start) → CLEANUP-MODE-BARREL-1 (10) and UX-POLISH-1 (11), both unblocked stubs awaiting re-authoring. **Dispatch-ready depth is below 3**, so Rule 5a applies: `/roadmap-review` backfills before the next dispatch. Completed 2026-10-12: NARRATE-REMOVE-1 (merge <merge sha, recorded at close-out>),
```

### Fold-in 5 — NARRATE-REMOVE-1 completion sub-bullet
Section: §Current System State › Current operational state, directly before the sub-bullet `  - READER-MODE-SEPARATION-2 completed 2026-10-11 …`
Action: Insert after (as the first sub-bullet under the Queue bullet)
Content:
```
  - NARRATE-REMOVE-1 completed 2026-10-12 (merge <merge sha, recorded at close-out>; close-out `docs/governance/close-outs/CloseOut.NARRATE-REMOVE-1.2026-10-12.md`; OutsideAudit.10 D4b): the Narrate mode, its hooks and strategies, its renderer UI, the dormant MOSS-Nano, Pocket and Qwen engines and 139 test files are deleted (diff against the base: 247 deleted, 66 modified, 3 added); a v13 settings migration plus three ingestion points (`loadSettingsData`, `applyCloudSettings`, the `save-settings` handler) normalize `narrate` to `flow`; the Reading Goals styles moved to `src/styles/reading-goals.css` by owner decision; the Page, Focus and Flow baselines are byte-identical. Suite 1,955 passed / 1 skipped in 134 files.
```

### Fold-in 6 — Open bugs
Section: §Current System State › Current operational state, `- **Open bugs:** 3 — …`
Action: Replace
Content:
Old (verbatim prefix; the BUG-184 and BUG-185 text after it stays):
```
- **Open bugs:** 3 — BUG-154 (parked, likely not a bug, needs live verification),
```
New:
```
- **Open bugs:** 7 (new numbers provisional, reassigned at fold-in) — BUG-186 (a 5,000-span word-index test asserts a 200 ms build time and failed once under load at 218 ms; Low), BUG-187 (dev-mode `ResizeObserver loop` warning flood in the profile error.log; Low, needs read-only diagnosis), BUG-188 (Focus and Flow horizontal cursor band sits apart from the word cursor; pre-existing; Low), BUG-189 (dev-mode slowness across the whole app, equal on the base; Low), BUG-154 (parked, likely not a bug, needs live verification),
```
Also append to the BUG-185 clause of the same bullet, after `Low, unscheduled)`: `; observed live at startup during the NARRATE-REMOVE-1 smoke (ENOENT on the settings.json and sync-queue.json renames)`.

### Fold-in 7 — Deferred lanes
Section: §Current System State › Current operational state, `- **Deferred lanes:**`
Action: Replace
Content:
Old:
```
MOSS-Nano, Pocket TTS and Qwen are removed by NARRATE-REMOVE-1.
```
New:
```
MOSS-Nano, Pocket TTS and Qwen were deleted by NARRATE-REMOVE-1 (2026-10-12).
```

### Fold-in 8 — Most recent implementation and suite counts
Section: §Current System State › Current operational state
Action: Replace
Content:
Old:
```
- **Most recent implementation:** TEST-TIMEOUT-HEADROOM-1 (merge `072a65f3`, 2026-10-12): 30 s timeouts for the three load-sensitive tests and the `seenBatcher` typing fix. Before it, EINK-HOVER-FIX-1 (`61bad595`) and LIBRARY-SETTINGS-FIX-1 (`8c41095e`).
- Suite on the owner's machine (2026-10-12): 3,410 passed / 133 skipped / 0 failed in two full runs; `npm run typecheck` exits 0.
```
New:
```
- **Most recent implementation:** NARRATE-REMOVE-1 (merge <merge sha, recorded at close-out>, 2026-10-12): Narrate and the dormant non-Kokoro engines removed, Kokoro kept dormant, settings schema 13. Before it, TEST-TIMEOUT-HEADROOM-1 (`072a65f3`), EINK-HOVER-FIX-1 (`61bad595`) and LIBRARY-SETTINGS-FIX-1 (`8c41095e`).
- Suite on the owner's machine (2026-10-12, sprint tree): 1,955 passed / 1 skipped / 0 failed in 134 files (base: 3,410 passed / 133 skipped in 235 files); `npm run typecheck` exits 0; `npm run build` exits 0. One full run showed `tests/wordPositionIndex.test.ts` over its 200 ms budget under load (BUG-186, provisional); the next full run passed.
```

### Fold-in 9 — Tech Stack engine line
Section: §Tech Stack
Action: Replace
Content:
Old:
```
- Kokoro TTS engine (28 voices, worker thread, q4 quantization) — sole active engine. MOSS-Nano dormant/disabled; Pocket TTS dormant/disabled; Qwen retired/disabled.
```
New:
```
- Kokoro TTS engine (28 voices, worker thread, q4 quantization) — the only engine in the tree, dormant (no UI or launch path) until NARRATE-REBUILD-1. MOSS-Nano, Pocket TTS and Qwen were deleted by NARRATE-REMOVE-1 (2026-10-12).
```

### Fold-in 10 — Post-Completion Checklist test count
Section: §Post-Completion Checklist
Action: Replace
Content:
Old:
```
- [ ] `npm test` passes (1,575+ tests, 0 failures)
```
New:
```
- [ ] `npm test` passes (1,955+ tests, 0 failures; count as of 2026-10-12 after NARRATE-REMOVE-1) and `npm run typecheck` exits 0
```

### Fold-in 11 — Owner priority section
Section: §Division of Labor › Owner priority: remove Narrate, then rebuild it
Action: Replace
Content:
Old (heading):
```
#### Owner priority: remove Narrate, then rebuild it
```
New:
```
#### Owner priority: rebuild Narrate (removal complete 2026-10-12)
```
Old (first paragraph):
```
Reading-mode separation is complete (READER-MODE-SEPARATION-2, 2026-10-11): Page, Focus, Flow and Narrate own independent state, lifecycle, timers, rendering and tests behind a thin router. Keep that isolation: no sibling-runtime imports, no shared mutable mode store.
```
New:
```
Reading-mode separation is complete (READER-MODE-SEPARATION-2, 2026-10-11): Page, Focus and Flow own independent state, lifecycle, timers, rendering and tests behind a thin router; Narrate is removed (NARRATE-REMOVE-1, 2026-10-12). Keep that isolation: no sibling-runtime imports, no shared mutable mode store, and the rebuilt Narrate joins as a fourth independent runtime.
```
Old (second paragraph, verbatim prefix):
```
Owner ruling #31: remove Narrate (NARRATE-REMOVE-1, keeping the Kokoro engine dormant with no UI path), then rebuild it from scratch (NARRATE-REBUILD-1, `Path: epic`).
```
New:
```
Owner ruling #31: remove Narrate (NARRATE-REMOVE-1, done 2026-10-12, keeping the Kokoro engine dormant with no UI path), then rebuild it from scratch (NARRATE-REBUILD-1, `Path: epic`, now unblocked).
```

### Fold-in 12 — Shared-Core Freeze Set: a deleted file
Section: §Division of Labor › Shared-Core Freeze Set
Action: Remove
Content:
Remove this bullet (the file is deleted by NARRATE-REMOVE-1; NARRATE-REBUILD-1 names its own owner file in its charter):
```
- `src/hooks/useNarration.ts`
```
Note for the reviewer: the next bullet, `src/hooks/useFlowScrollSync.ts`, is also absent from the tree at this branch's tip (not deleted by this sprint; the list was already stale). Drop it in the same edit if `git ls-files src/hooks/useFlowScrollSync.ts` prints nothing at close-out.

## Target: docs/governance/TECHNICAL_REFERENCE.md

### Fold-in 1 — Main-process diagram: Kokoro files are dormant
Section: §2 Architecture Overview › Process Model (the two `main/tts-*` lines in the diagram)
Action: Replace
Content:
Old:
```
│  main/tts-engine.js ─── Kokoro TTS worker wrapper            │
│  main/tts-worker.js ─── Kokoro inference (worker thread)     │
```
New:
```
│  main/tts-engine.js ─── Kokoro TTS worker wrapper (dormant)  │
│  main/tts-worker.js ─── Kokoro inference (dormant)           │
```

### Fold-in 2 — Renderer diagram: mode count
Section: §2 Architecture Overview › Process Model (the `src/modes/` line)
Action: Replace
Content:
Old:
```
│  src/modes/ ─── ReadingMode strategy pattern (4 modes)       │
```
New:
```
│  src/modes/ ─── ReadingMode strategy pattern (3 modes)       │
```

### Fold-in 3 — BlurbySettings: ttsEngine row
Section: §4 Data Model › BlurbySettings (user preferences), the `ttsEngine` table row
Action: Replace
Content:
Old:
```
| `ttsEngine` | `"web"` | `"web" | "kokoro" | "qwen" | "nano" | "pocket-tts"`; Desktop v2.0 product posture keeps Kokoro default, MOSS-Nano recommended opt-in, Pocket TTS available opt-in, and Qwen disabled. |
```
New:
```
| `ttsEngine` | `"web"` | `"web" | "kokoro"`; the MOSS-Nano, Pocket and Qwen engines and their values were deleted by NARRATE-REMOVE-1 (2026-10-12). Kokoro is dormant: no UI path selects or starts it until NARRATE-REBUILD-1. |
```

### Fold-in 4 — BlurbySettings: reading-mode fields and schema 13
Section: §4 Data Model › BlurbySettings, the `readingMode` and `lastReadingMode` rows, and a new subsection after the table (before `### EPUB CFI Position Tracking`)
Action: Replace (rows), then Insert after (subsection)
Content:
Old:
```
| `readingMode` | `"focus"` | Active mode type |
| `lastReadingMode` | `"flow"` | Space bar starts this mode from Page view |
```
New:
```
| `readingMode` | `"focus"` | Active mode type: `"page"`, `"focus"` or `"flow"` (a saved `"narrate"` is normalized to `"flow"`) |
| `lastReadingMode` | `"flow"` | Space bar starts this mode from Page view; same three values, same normalization |
```
Insert after the BlurbySettings table:
```
#### Settings schema 13 and reading-mode normalization (NARRATE-REMOVE-1, 2026-10-12)

`settings.json` is at `schemaVersion` 13. The v13 migration in `main/migrations.js` runs `normalizeReaderModes(data)`, which maps `readingMode` and `lastReadingMode` from `"narrate"` to `"flow"`; the migration framework keeps the pre-upgrade backup (`settings.json.bak`). Because the removed mode can reappear from sources other than the local file, the same function is also applied at every ingestion point, so a saved or synced `narrate` never reaches the renderer:

| Ingestion point | File | Behaviour |
|---|---|---|
| Startup load | `loadSettingsData` in `main/migrations.js` | Normalizes on every launch after migration; writes no new backup when the file is already schema 13 |
| Cloud apply | `applyCloudSettings` in `main/sync-engine.js` | Normalizes after the merge and before the settings save |
| Renderer write | the `save-settings` handler in `main/ipc/state.js` | Normalizes before `get-state`, before the debounced save and before the sync enqueue |

Each site has an omission control in `tests/` (removing the call fails its test). NARRATE-REBUILD-1 retires these calls only if the rebuilt mode's id is `"narrate"`. Settings durability is unchanged: writes stay fire-and-forget with a shared `.tmp` path (BUG-185).
```

### Fold-in 5 — Reading Modes intro
Section: §5 Reading Modes, first paragraph
Action: Replace
Content:
Old:
```
Blurby exposes four user-facing reading modes: Page, Focus, Flow, and Narrate. Page/Focus/legacy Flow still use the mode-interface pattern where appropriate, but current Foliate Flow and Narrate are orchestrated by hook-level runtime owners in `ReaderContainer.tsx`, `useReaderMode.ts`, `useFlowScrollSync.ts`, and `useNarration.ts`.
```
New:
```
Blurby exposes three user-facing reading modes: Page, Focus and Flow. Each is an independent runtime under `src/reader/modes/{page,focus,flow}/` (own state, lifecycle, timers, rendering and tests) behind a thin router; there is no sibling-runtime import and no shared mutable mode store (READER-MODE-SEPARATION-2, 2026-10-11). Narrate was removed by NARRATE-REMOVE-1 (2026-10-12) and is rebuilt from scratch by NARRATE-REBUILD-1; until then a saved `narrate` mode is normalized to `flow` (see §4, Settings schema 13). The mode runtimes keep `narrating: false` / `isNarrating: false` and a `click-to-narrate` tag deliberately (decision D5), so the rebuilt mode can join without a router change.
```

### Fold-in 6 — Narrate Mode section is historical
Section: §5 Reading Modes › `### Narrate Mode (hook-driven via useReaderMode.ts + useNarration.ts)`
Action: Replace
Content:
Old (heading only; the body bullets that follow stay as history under the note):
```
### Narrate Mode (hook-driven via `useReaderMode.ts` + `useNarration.ts`)
```
New:
```
### Narrate Mode (REMOVED 2026-10-12 — historical; NARRATE-REBUILD-1 rebuilds it)

> **Removed by NARRATE-REMOVE-1.** `useNarration.ts`, `useNarrationSync.ts`, `useNarrationCaching.ts`, the narration strategies under `src/hooks/narration/`, `audioScheduler`, the Narrate mode runtime (`src/reader/modes/narrate/`), its bottom-bar entry and settings pages, and the narration-only tests no longer exist. The bullets below describe the deleted design and are kept for the rebuild's reference; the installed Kokoro export emits no durations (LL-142), so none of its timing claims survive.
```

### Fold-in 7 — Hook table rows for deleted hooks
Section: §5 Reading Modes › the ReaderContainer decomposition table
Action: Remove
Content:
Remove these two rows (both files are deleted):
```
| `useNarrationSync` | `src/hooks/useNarrationSync.ts` | 12 | TTS cursor sync, narration state, audio glide wiring |
| `useNarrationCaching` | `src/hooks/useNarrationCaching.ts` | 4 | TTS preload, cache invalidation, voice change |
```

### Fold-in 8 — TTS Engine Landscape intro
Section: §7 TTS Engine Landscape, first paragraph (the line beginning "Blurby's Desktop v2.0 TTS product posture is Kokoro as the default")
Action: Replace
Content:
Old:
```
Blurby's Desktop v2.0 TTS product posture is Kokoro as the default and available operational floor, MOSS-Nano as a recommended opt-in local engine after MOSS-NANO-13e, Pocket TTS as an available opt-in third engine after POCKET-TTS-1, and Qwen disabled. Web Speech remains the platform TTS backend where available, but the v2.0 successor-engine posture is bounded to these explicit engine states and keeps Kokoro available.
```
New:
```
**Status since NARRATE-REMOVE-1 (2026-10-12): Kokoro is the only engine in the tree and it is dormant.** Nothing starts it at launch, the renderer has no narration path, and `preload.js` exposes no Kokoro or TTS-cache methods (it keeps `extractEpubWords` and the eval-trace bridge). In `main/ipc/tts.js` the handlers `tts-kokoro-generate`, `tts-kokoro-voices`, `tts-kokoro-model-status`, `tts-kokoro-preflight`, `tts-kokoro-download`, `tts-kokoro-preload`, `tts-kokoro-generate-marathon`, `tts-kokoro-preload-marathon`, `extract-epub-words` and the `tts-cache-*` family (`read`, `write`, `has`, `chunks`, `evict-book`, `evict-voice`, `info`, `opening-coverage`) stay registered but unreachable from the UI. The five Kokoro main files (`main/tts-engine.js`, `main/tts-engine-marathon.js`, `main/tts-worker.js`, `main/tts-cache.js`, `main/tts-opus.js`) are unchanged. `main.js` no longer calls `ttsCache.init`, so NARRATE-REBUILD-1 must call it before using the cache. The MOSS-Nano, Pocket and Qwen modules (the shared sidecar adapter and engine, the provider configurations, the Qwen engine, sidecar and streaming files, their scripts, IPC handlers, preload methods, packaging entries, CI paths and tests) were deleted. The paragraphs below describe the pre-removal landscape and are historical wherever they name a deleted engine, provider-registry entry, strategy or setting.

Pre-removal text of this paragraph, kept for history: Blurby's Desktop v2.0 TTS product posture was Kokoro as the default and available operational floor, MOSS-Nano as a recommended opt-in local engine after MOSS-NANO-13e, Pocket TTS as an available opt-in third engine after POCKET-TTS-1, and Qwen disabled.
```

### Fold-in 9 — Settings sub-pages
Section: §10 Settings System › Current Structure, after the page table
Action: Insert after
Content:
```

The narration settings pages (voice, engine and Narrate options) were deleted by NARRATE-REMOVE-1. The Reading Goals page (`ReadingGoalsSettings.tsx`) is retained; its styles live in `src/styles/reading-goals.css` (restored verbatim from the deleted `tts-settings.css` by owner decision, 2026-10-12). `HotkeyMapSettings.tsx` still shows `] / N` for Next chapter although bare `N` is unbound (to be fixed with UX-POLISH-1).
```

### Fold-in 10 — Test inventory note
Section: §14 Testing › Test File Inventory (end of the inventory, before `### Current Coverage`)
Action: Insert after
Content:
```

**Suite size after NARRATE-REMOVE-1 (2026-10-12):** 134 files, 1,955 passed / 1 skipped / 0 failed (base: 235 files, 3,410 passed / 133 skipped). 139 test files and two fixture directories were deleted with the narration code (recoverable from `612d03f5bdadf861a875d76c6260fd8d3a7520aa`), and 32 mixed tests were edited. Two new positive-control suites cover the v13 migration and the ingestion normalization (they fail on the base). Coverage gap: the kept per-mode helpers' local `"narrate"` style-hint literals are no longer exercised by any test, and `tests/foliate-bridge.test.ts` dropped its `page-reader.css` assertions together with the narration ones.
```

## Target: docs/governance/BUG_REPORT.md

(Provisional numbers; the live tip is BUG-185. The fold-in step reassigns them in order. Newest entries go first, as in the file.)

### Fold-in 1 — File BUG-186 to BUG-189
Section: §Incomplete (insert directly under the `## Incomplete` heading, above `### BUG-185 — …`)
Action: Insert after
Content:
```
### BUG-189 — Dev-mode (`npm run dev`) is slow across the whole app
**Reported:** 2026-10-12 (NARRATE-REMOVE-1 live smoke)
**Severity:** LOW (development and owner-smoke friction; the production build was not measured)
**Status:** OPEN — unscheduled. Lane: Platform & Maintenance.
**Location:** the dev server and Electron dev build on the owner's machine; no source location identified.
**Description:** The whole app, the library included, is too slow in dev mode to drive timing-sensitive live checks. The owner could not judge the Shift+Space sequence (Done-when 16(f)), which was accepted from static verification instead.
**Root cause:** Undetermined. An A/B on 2026-10-12 ran the base (`main` @ `612d03f5`, same profile, same actions) and the owner reported it equally slow, so the cause is pre-existing and not the removal.
**Evidence:** The NARRATE-REMOVE-1 run record (staging memo, "A/B on the slowness"); LL-152 (provisional).
**Fix path:** Measure first (Pike rule 1): compare a production build against dev on the same actions, then profile the renderer. Until then, specs with live owner gates name a production-build smoke route.

### BUG-188 — Focus and Flow horizontal cursor band sits apart from the word cursor
**Reported:** 2026-10-12 (NARRATE-REMOVE-1 live smoke; owner screenshot)
**Severity:** LOW (visual; reading stays possible)
**Status:** OPEN — pre-existing; triage together with BUG-169 and the "Flow band" item the removal spec lists as out of scope. Lane: Reader Engine.
**Location:** `src/styles/flow.css` and `src/reader/modes/flow/mode.css` (`.flow-shrink-cursor`); the Focus and Flow word-cursor positioning code. Not touched by the removal.
**Description:** In Focus (owner screenshot: *The Raven*, speed chip 1.60x) a three-line dark band covers lines 3–5 of the visible page while the blue word underline sits under "borrow" on line 6. The horizontal cursor band is in the wrong place relative to the word cursor.
**Root cause:** Undetermined. The base build (`main` @ `612d03f5`, same profile, A/B 2026-10-12) shows the same placement, so the removal did not cause it. Every rule in the deleted Narrate `mode.css` was scoped under `.rm-narrate-root`, and `.flow-shrink-cursor` was never copied into it.
**Evidence:** Owner screenshot 1250x849 (copy in the executing session's scratchpad, `owner-screenshot-horizontal-cursor.png`; archive it with this bug at close-out); the staging memo's observation and evidence paragraph.
**Fix path:** Triage first (read-only diagnosis, Aristotle): decide whether this is BUG-169, the known Flow band item, or new, then spec a fix.

### BUG-187 — Dev-mode `ResizeObserver loop completed with undelivered notifications` flood in error.log
**Reported:** 2026-10-12 (NARRATE-REMOVE-1 live smoke)
**Severity:** LOW (log noise and possible render cost; no visible failure reported)
**Status:** OPEN — cause undetermined; needs a read-only diagnosis. Lane: Reader Engine.
**Location:** the five `ResizeObserver` instances in the Page, Focus and Flow Foliate view files, which NARRATE-REMOVE-1 did not touch.
**Description:** The profile `error.log` received 7,226 `ResizeObserver loop completed with undelivered notifications` lines between 22:50:46Z and 22:56:10Z (about five minutes) on the sprint build in dev mode. The same message flooded the log in May 2026 on earlier builds.
**Root cause:** Undetermined. A base session of about one minute the same day logged none, but the sessions differ in length and actions, so a pre-existing pattern and a change of this sprint are both still open.
**Evidence:** The staging memo's smoke note and observation (counts, timestamps).
**Fix path:** Aristotle: reproduce on the base with a comparable session, then locate the observer callback that writes layout state inside its own notification; guard with an equality check or a deferred write.

### BUG-186 — `wordPositionIndex` 5,000-span test asserts a 200 ms build time and fails under load
**Reported:** 2026-10-12 (NARRATE-REMOVE-1 full-suite run)
**Severity:** LOW (test flake; the product code is not implicated)
**Status:** OPEN — unscheduled, not fixed in NARRATE-REMOVE-1 (per the TEST-TIMEOUT-HEADROOM-1 close-out ruling: a new low bug, not an in-sprint fix). Lane: Platform & Maintenance.
**Location:** `tests/wordPositionIndex.test.ts`, test "builds a 5,000-span section and keeps lookup coverage intact", the `buildTimeMs` budget at line 148.
**Description:** The first full run on the C4 working tree failed this test only (`AssertionError: expected 218.2757999999999 to be less than 200`). It passed alone (5/5, 726 ms) and in the second full run (134 files; 1,955 passed, 1 skipped, 0 failed; 22 s).
**Root cause:** A hard wall-clock assertion on a machine under full-suite load; the same family as the three tests TEST-TIMEOUT-HEADROOM-1 gave 30 s timeouts.
**Evidence:** The staging memo's full-suite note.
**Fix path:** Widen or relax the budget (assert a generous multiple, or compare against a same-run baseline) and keep the coverage assertions strict.

```

### Fold-in 2 — BUG-185: dated status note
Section: §Incomplete › BUG-185 — Settings writes are fire-and-forget and share one .tmp path, directly after its `**Severity rationale:**` line
Action: Insert after
Content:
```
**Update 2026-10-12 (NARRATE-REMOVE-1 smoke):** observed live at startup on the sprint build: the dev log shows ENOENT on the rename `settings.json.tmp` → `settings.json` and `sync-queue.json.tmp` → `sync-queue.json` (the shared `.tmp` path race described above). Out of scope for NARRATE-REMOVE-1 by its spec; the app wrote schema 13 correctly. Status stays OPEN, unscheduled. Note for the rebuild: the v13 migration and the three ingestion points add settings writes on launch, so the race is exercised on every start.
```

### Fold-in 3 — BUG-184: no status change
Section: §Incomplete › BUG-184, directly after its `**Severity rationale:**` line
Action: Insert after
Content:
```
**Update 2026-10-12 (NARRATE-REMOVE-1):** no change to the e-ink hover rule; the removal deleted `src/styles/tts-settings.css`, which held no e-ink rule. Status stays "RESOLVED in source — OPEN until rebuild + owner smoke (SRL-079)".
```

## Target: docs/governance/LESSONS_LEARNED.md

(Entries append at the end of the file, after `### LL-138 — status (pointer-closeout, 2026-10-12)`, in the standing entry format. Numbers are PROVISIONAL; the live tip is LL-149.)

### Fold-in 1 — LL-150 (provisional): a Delete-list file can carry rules for retained features
Section: §end of file (append)
Action: Append row
Content:
```
### LL-150 (provisional; reassign at fold-in) — A Delete-list file can carry rules for retained features: census every deleted stylesheet's selectors (NARRATE-REMOVE-1, 2026-10-12)
**Verdict:** The deletion spec listed `src/styles/tts-settings.css` as narration-only. It also held the Reading Goals settings styles (nine classes: `.reading-goals-create`, `.reading-goal-row`, `.reading-goal-unit`, `.reading-goal-progress`, `.reading-goal-streak`, `.reading-goals-empty`, `.reading-goal-delete` and the inputs inside them), used by the retained `ReadingGoalsSettings.tsx` and defined nowhere else. The import-graph census (LL-139) found no dangling import because CSS selectors and assets are not imports; a spec-compliant deletion would have left Settings → Reading Goals unstyled.
**Evidence:** Spec-compliance review of C1–C4 (finding 1, MEDIUM). Fix: the block was restored verbatim into `src/styles/reading-goals.css`, imported from `src/styles/index.css`, as an `Exception:` path by owner decision (staging memo, "C4 correction"); the owner confirmed the page styled in smoke 16(c). A `git grep` for `tts|kokoro|narrat|qwen|moss|pocket` in `src/styles/reading-goals.css` exits 1.
**Recommendation:** A deletion spec that removes any stylesheet (or other asset: image, font, JSON) adds a selector-usage census to its readiness step: list every class the file defines, `git grep` each against retained `className` and CSS uses, and name every hit as a move, not a delete, with a Done-when row that checks it.
**Applies to:** Deletion and removal specs (NARRATE-REMOVE-1 and its siblings, CLEANUP-MODE-BARREL-1), any CSS consolidation, and spec-compliance review checklists.
**Status:** Observation
Related: LL-139 (import-graph census; this is its CSS and asset gap), LL-143.
```

### Fold-in 2 — LL-151 (provisional): prove a gate recorder can record a failure
Section: §end of file (append)
Action: Append row
Content:
```
### LL-151 (provisional; reassign at fold-in) — A gate recorder must be proven able to record a failure before its PASS is trusted (INSTRUMENT-CONTROL) (NARRATE-REMOVE-1, 2026-10-12)
**Verdict:** The first run of the 34-check Done-when gate script recorded nothing while every check ran: its PowerShell recorder function was named `R`, which the built-in alias for `Invoke-History` silently shadowed, so no result reached the summary. It was caught only because the summary read 0 PASS / 0 FAIL. A recorder that cannot record a failure also cannot record a pass, and a summary of zero is not a pass.
**Evidence:** The gate run on C4, 2026-10-12: summary "0 PASS / 0 FAIL"; the function was renamed to a name no alias owns and the script re-run (34/34 PASS on C4 `75095813`, then on amended C4 `31793182`). Same discipline as the spec's positive controls (LL-138): a check is proven only once it has been seen to fail.
**Recommendation:** A gate script (1) uses a recorder name with no alias or built-in collision (verb-noun; `Get-Alias <name>` finds nothing), (2) asserts at the end that PASS + FAIL equals the number of checks it defines and exits non-zero otherwise, and (3) is run once with a deliberately failing check to prove the recorder shows a FAIL. Specs that ship a gate script say so.
**Applies to:** Every Done-when gate script, PowerShell especially, and its use by `/pointer-closeout`.
**Status:** Observation
Related: LL-138 (positive controls), LL-143 (acceptance-command convention).
```

### Fold-in 3 — LL-152 (provisional): A/B a blocked live gate on the base build
Section: §end of file (append)
Action: Append row
Content:
```
### LL-152 (provisional; reassign at fold-in) — When a live owner gate is blocked by environment slowness, A/B the same actions on the base build before attributing it (NARRATE-REMOVE-1, 2026-10-12)
**Verdict:** The owner reported the sprint build too slow in dev mode to run Done-when 16(e) and 16(f). Running the base (`main` @ `612d03f5`, same profile, same actions, about one minute) showed it equally slow, which settled the slowness as pre-existing in minutes rather than leaving the sprint blocked. The same A/B settled the horizontal cursor band's placement as pre-existing (BUG-188, provisional) but was inconclusive on the ResizeObserver flood (BUG-187, provisional), because the sessions differed in length. An A/B proves "same on the base" only for like-for-like sessions.
**Evidence:** The staging memo's "A/B on the slowness" and "Observation" lines; the owner's confirmation for each case.
**Recommendation:** (1) When a live gate is blocked or surprising, run the same actions on the base before attributing the cause, and record the session length and actions so the comparison is fair. (2) Specs with live owner gates name a production-build smoke route (the built app), not only `npm run dev`, because dev mode is slow on this machine (BUG-189, provisional). (3) When a gate cannot be driven live, an owner-accepted static verification is recorded as such, with the live observations beside it.
**Applies to:** Spec authoring for any item with a live smoke row, and the owner-gate steps in `/next-pointer` dispatch prompts.
**Status:** Observation
Related: LL-141 (owner-observed route and throttle check), LL-147 (local session for owner-machine gates).
```

### Fold-in 4 — Status records for lessons the run exercised
Section: §end of file (append, one block per lesson, in the file's `### LL-nnn — status (...)` form)
Action: Append row
Content:
```
### LL-138 — status (NARRATE-REMOVE-1, 2026-10-12)
**Status:** Observation — held: the two new positive-control tests failed on the base 15/15 (C1, `238e12e6`) and passed after C3 (`0d411010`); the omission controls held (removing `normalizeReaderModes` from `loadSettingsData` fails (a); from `applyCloudSettings` fails (b) and (c); from the `save-settings` handler fails (e)), each line restored hash-identical. Each control's output is kept in the staging memo.

### LL-139 — status (NARRATE-REMOVE-1, 2026-10-12)
**Status:** Observation — held with a gap: the import-graph census gave 0 import fix rounds, and the closure check (self-test 7/7) reported 0 dangling relative imports. The gap is CSS and asset references, which the census does not cover (see LL-150, provisional).

### LL-143 — status (NARRATE-REMOVE-1, 2026-10-12)
**Status:** Observation — held: every gate named its shell and exit code and passed only on an exact code; the 34-check gate script ran on C4 and on amended C4. One spec typo found by review (INFO): `git log --format=%H -- tests/perf-baseline-results.json 612d03f5..HEAD` puts the range after `--`, where git reads it as a path; the correct form is `git log --format=%H 612d03f5..HEAD -- tests/perf-baseline-results.json`. Recorded for the next spec edit; no change to the recurrence count.

### LL-144 — status (NARRATE-REMOVE-1, 2026-10-12)
**Status:** Observation — held: the resume base was taken from C1's `NARRATE-REMOVE-1-Base:` trailer (`612d03f5bdadf861a875d76c6260fd8d3a7520aa`), never recomputed against `origin/main`.

### LL-146 — status (NARRATE-REMOVE-1, 2026-10-12)
**Status:** Observation — held: the closure-check script was kept outside the repository, so it added no collectable `*.test.*` file.

### LL-147 — status (NARRATE-REMOVE-1, 2026-10-12)
**Status:** Observation — held: the run was a local session, and the owner-machine gates (full suite, build, live smoke) ran on the owner's machine. Caveat: dev-mode slowness blocked the timing-sensitive live checks (see LL-152, provisional).

### LL-148 — status (NARRATE-REMOVE-1, 2026-10-12)
**Status:** Observation — held: no committed file on the branch names the merge sha; the sha is recorded in what is written after the merge (close-out, register evidence, terminal ledger), and every staged fold-in reads `<merge sha, recorded at close-out>`.

### LL-136 — status (NARRATE-REMOVE-1, 2026-10-12)
**Status:** Observation — held (standing rule 41): the time log `docs/governance/close-outs/Timing.NARRATE-REMOVE-1.jsonl` was kept in the worktree under the exact-path-fence exemption and was not counted in the Done-when 15 fence (D=247, M=66, A=3).

### LL-068 — status (NARRATE-REMOVE-1, 2026-10-12)
**Status:** Observation — held: `git diff --stat` shrinkage was checked per commit (C2 24,827 deletions; C3 16,123; C4 41,916 in its original form, then amended with the restored stylesheet); every large decrease was a listed deletion, and no file was truncated.
```

## Target: CLAUDE.md (correction to the freeze-set note above)

### Fold-in 13 — Shared-Core Freeze Set: two entries are deleted files
Section: §Shared-Core Freeze Set
Action: Replace
Old:
- `src/hooks/useNarration.ts`
- `src/hooks/useFlowScrollSync.ts`
New:
- `src/hooks/useNarration.ts` (deleted by NARRATE-REMOVE-1, 2026-10-12; entry retired)
- `src/hooks/useFlowScrollSync.ts` (deleted by NARRATE-REMOVE-1, 2026-10-12; entry retired)
Note: the earlier reviewer flag in this memo saying this sprint did not delete useFlowScrollSync.ts is wrong; both files are in the spec Delete list (legacy cluster, D4) and are D in the branch diff. The planner decides whether to retire the two lines or keep them annotated; the remaining freeze-set files (ReaderContainer.tsx, FlowScrollEngine.ts, types.ts) stand.

