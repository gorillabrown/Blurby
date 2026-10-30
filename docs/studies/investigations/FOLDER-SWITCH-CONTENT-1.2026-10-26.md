# FOLDER-SWITCH-CONTENT-1 — transition presentation and phase attribution

**Date:** 2026-10-26. **Role:** read-only investigation. **Reviewed production source:** main `d8a65cb41f4095a93eb7a198bd91939833c5ea0d`; no application source change in this lane. **Verdict:** stale-card/loading cause confirmed; original long-delay phase budget remains unmeasured. No fix or smoke PASS is claimed.

## Findings that are established

1. The real library hook changes the selected folder optimistically while retaining the old library array and leaving `loadingContent` false. It does not expose a folder-transition loading state.
2. The real main-process switch handler updates the source folder, saves settings and starts its watcher, then awaits the full sync before returning. The hook's `getState` refresh occurs after that return. Existing `library-updated` events can supply intermediate updates, but nothing in the hook marks the entire transition as loading.
3. The real full-sync module can wait exactly30,000ms before abandoning a cancelled old run. The save/broadcast interval is30,000ms, but it is a throttle during a long import, not a mandatory30-second sleep. A quick import broadcasts at completion immediately.
4. The existing smoke evidence proves a long transition and eventual arrivals. It cannot identify how much of the observed93.2seconds was cancellation, recursive listing/stat, extraction or persistence.

## Reproduction and controls

Artifact root: `C:/Projects/Blurby-artifacts/parallel-investigation-20261026`. Probe files are investigation scripts outside the test suite; none is a committed test.

| Probe / actual production path | Measured result | Opposite/control outcome |
|---|---|---|
| `folder-hook-probe.cjs`: actual useLibrary, actual React state/effects in JSDOM; Electron API promise/data only mocked | During pending A→B: selected folderB, library IDs [old-A], loadingContent=false. No copied hook/filter logic. | Resolve the IPC and return stateB: library IDs become [new-B]. The observer sees the change it needs to detect. |
| `folder-phase-probe.cjs`: unmodified createFolderSync, injected scan/extract dependencies and virtual clock | A hung old scan delays B scan until30,000ms; at29,999ms B has not begun. | Settle the old scan: B begins at virtual0ms, without waiting for the timeout. |
| Same module, four-file batch plus one controlled slow last extraction | First four results enter main's live library, but no broadcast request occurs while elapsed time is100ms. First broadcast request occurs at30,100ms when the controlled last extraction resolves. | One fast file broadcasts at100ms, proving no blanket30-second minimum delay. |

Run commands:

```powershell
node C:/Projects/Blurby-artifacts/parallel-investigation-20261026/folder-hook-probe.cjs
node C:/Projects/Blurby-artifacts/parallel-investigation-20261026/folder-phase-probe.cjs
```

Results: `folder-hook-probe-result.json` and `folder-phase-probe-result.json`; both report assertionsPassed=true, production-source hashes and actual observed events. No desktop/app launch occurred. The phase measurements use controlled virtual time, not a performance benchmark of the owner's Drive.

## Source anchors

- [useLibrary](../../../src/hooks/useLibrary.ts), `switchFolder`: optimistic settings, `await api.switchFolder(folder)`, then `api.getState()`; library state remains unchanged while awaiting. Its `loadingContent` paths cover document/URL/drop imports, not folder selection/switch.
- [LibraryContainer](../../../src/components/LibraryContainer.tsx), the `LibraryView` call: passes `library`, `settings` and `loadingContent` directly from the hook.
- [LibraryView](../../../src/components/LibraryView.tsx), the `loadingContent &&` overlay and `filteredLibrary`: no pending-folder state or source-folder containment rule.
- [state IPC](../../../main/ipc/state.js), `switch-folder` and `select-folder`: watcher starts before awaiting `syncLibraryWithFolder`.
- [folder sync](../../../main/folder-sync.js), `syncAll`: cancellation Promise.race uses `FOLDER_LIST_TIMEOUT_MS`; `runFullSync` scans first, extracts batches and saves/broadcasts at interval or completion. Old folder records are pruned only after a successful run, preserving data when the root is unreadable.
- [folder watcher](../../../main/folder-watcher.js), `scanFolderAsync.walkDir`: recursive directory listing and supported-file stat are awaited serially. Each operation's `timeLimit` uses30,000ms. Yield every500 entries is an event-loop yield, not an import cap.
- [constants](../../../main/constants.js): FOLDER_SYNC_BATCH_SIZE=4; FOLDER_SYNC_SAVE_INTERVAL_MS=30,000; FOLDER_LIST_TIMEOUT_MS=30,000; BROADCAST_DEBOUNCE_MS=200 in main's separate broadcast layer.

## Historical evidence and its limits

The immutable smoke artifacts remain at `C:/Projects/Blurby-artifacts/smoke-stage8-20261026-145107`.

- Settings persisted Readings at17:10:11.999Z.
- At17:11:05.596Z the saved library still had six records and zero Readings paths.
- `28-folder-state-observation.json` at17:11:45.238Z reports34 records,28 Readings paths and93.2seconds since the settings write.
- `folder-app.stderr.log` contains “a cancelled sync did not stop in time; starting the new one”, with no event timestamp/run ID. It proves a timeout occurred in that process, not that it occupied a specified portion of the93.2seconds.
- These are saved-state observations and owner UI verdicts, not continuous DOM/per-phase timing. The eventual arrivals refute a permanent-stuck conclusion.
- The duplicate-looking samples are different source paths with equal content hashes, already recorded separately. They are not evidence of repeated import of one exact path.

The30-second cancellation control and30-second import throttle cannot simply be added to explain93.2seconds. Listing/stat may each await their own timeout, extraction latency varies, and filesystem writes/renderer broadcasts are separate events.

## Safe fix/specification direction

**Recommendation:** split the proven transition-presentation repair from performance optimization. The owner already approved showing loading instead of old-folder cards. Preserve the existing cancellation, unreachable-root and pruning contracts until separately measured.

Precise implementation entry points for a bounded presentation specification:
- `src/hooks/useLibrary.ts`: own an explicit pending folder-transition state for select/switch; preserve the library array on disk and in memory, and clear pending state on successful refresh, refusal, rejection and unmount.
- `src/components/LibraryContainer.tsx`: forward that dedicated state.
- `src/components/LibraryView.tsx`: show the approved loading state instead of the old-folder card list while the transition is pending. Do not clear the persisted library, change wordCount/progress or force a prune to make the screen look current.
- Serial integration after LIBRARY-COMPLETION-VISIBILITY-1 because LibraryView has an exclusive owner now. Preserve APP-TABS home/status filtering when its held stack is integrated later.
- Before a Full Spec: choose the actual concurrency contract for rapid repeated selections. A simple shared boolean/finally is unsafe when an earlier request completes after a later one. Cover success, refusal, thrown rejection, stale library broadcasts and out-of-order IPC/getState completion. Do not infer a backend run ID from folder text alone.

Concrete regression requirements:
1. Extend `tests/useLibrary.test.ts` with `(fs-loading-pending)`: initialA IDs retained, requestB unresolved, headerB plus explicit pendingB; `(fs-loading-finish)`: freshB state then pending=false.
2. `(fs-loading-refusal)` and `(fs-loading-rejection)`: preserve data, restore/read the correct main-owned folder and clear pending state once the current request settles; no unhandled rejection.
3. `(fs-loading-race)`: two deferred requests and getState calls resolve in both orders; only the current transition may change current UI or clear its loader. Specify the exact main-owned end state before implementation.
4. Render the real LibraryView/container in `(fs-old-cards-hidden)`: pendingB hides oldA cards and shows loading; after completion B cards appear exactly once in list/grid. Include already-complete positions from the visibility fix.
5. Retain `tests/folderSwitchWatcherFirst.test.js`'s `(ws-wait)` wait contract and `tests/folderSync.test.js`'s interval/cancellation controls. Do not change the timeout constants as part of presentation work.

This report clears the source-cause question for the missing transition indicator. It does not claim that the full folder-responsiveness item is dispatch-ready or that a loading indicator makes the original latency acceptable.

## Remaining latency experiment

On one verified scratch-profile process and owned local fixture folders, timestamp: request/run ID, old run cancellation requested/settled/abandoned, new scan start/end, first/last extraction batch, first added doc, save requested/start/end, broadcast requested/sent and renderer receipt/first current-folder card. Use actual committing triggers and count processed files/batches; preserve failed/unreachable cases.

Prove the recorder with controlled delayed scan and delayed extraction cases before using a null/performance verdict. Repeat against the Drive only after local controls and owner permission for its content access. Attribute the recorded93.2second observation only if contemporaneous trace exists; a new run measures current behavior rather than retroactively proving that old budget.

No source fix, app suite/build, package qualification, profile repair, deletion or release decision occurred in this investigation.
