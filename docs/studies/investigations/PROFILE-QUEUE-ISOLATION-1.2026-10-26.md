# PROFILE-QUEUE-ISOLATION-1 — write identity, unchanged bytes and remaining attribution

**Date:** 2026-10-26. **Role:** read-only investigation with artifact-only production-module controls. **Reviewed source:** main `d8a65cb41f4095a93eb7a198bd91939833c5ea0d`. **Verdict:** the normal-profile queue changed, but the original writer/profile-isolation cause remains unproved. The byte-preservation checks must not be described as proof that no write occurred. No production data was changed or repaired by this lane.

## Evidence narrowed the event

| Evidence | Observed result |
|---|---|
| `folder-live-before.json`,16:41:40.888Z | Normal queue SHA256822de92ae57e3439aa513bc85a7c5f3a091ae71551e3860884c799be42f682f3. |
| `31-after-quit-observation.json`,17:57:43.376Z | All three normal hashes still match, including that queue hash; no Blurby processes reported then. |
| `38-connected-after-quit.json`,18:09:09.689Z | Normal queue SHA256f5dc9fa6121ee01200c802d4b69fe8823bfb2cdca415a434a3cde15573c237c2; normal library/settings content hashes still match; no Blurby processes reported. |
| Current read-only metadata,2026-10-26 | Queue still has the same f5dc… hash,16 operations and2,668bytes. Newest operation is update-settings at18:02:22.760Z; queue mtime18:02:22.761Z. |
| Current normal-file metadata | Library mtime18:02:21.504Z; settings mtime18:02:22.763Z, although their content hashes match the original baseline. |
| Scratch profile metadata | Different files and independently populated queue:61 operations,10,276bytes, last modified18:08:46.899Z. No queue payload or private settings values are copied into this report. |

The16:41→18:09 hash bracket can now be narrowed to a candidate write around18:02:22, after the17:57 preserved-hash receipt. The queue entry timestamp is application-supplied data, and the file mtime is filesystem metadata; neither is an original PID trace. Matching them is useful correlation, not writer attribution.

The latest queue preserves older entries and adds a settings operation. Because the exact pre-Part-B queue bytes were not retained, do not claim an exact semantic diff or that one append was the only mutation. The older pre-install backup is not automatically the missing baseline.

## Original launch/command evidence

The same parent task's local rollout was inspected only around the event and immediately preceding relaunch. Its source identity is task `01a0cf7f-62f6-7450-abc9-5bb2750923f4`; unrelated task content, settings payloads and credentials were not copied.

- At17:58:05.516Z, the parent launches the installed executable with both `BLURBY_USER_DATA_DIR=<folder-profile>` and `--user-data-dir=<folder-profile>`, plus its inspector address. Environment restoration happens after Start-Process returns.
- No new main-process identity/getDataPath/queue-path readback was recorded for that relaunch before input in the inspected turn. The earlier16:41 runtime receipt proves the earlier process's profile, not every later process.
- The inspected18:01–18:03 parent commands read/write smoke artifacts and check processes; none explicitly writes the normal queue. This is evidence about those recorded commands, not proof that no other process wrote it.
- The owner reports Blurby closed; the18:02:37 process check reports no Blurby process. There is no captured file-write PID at18:02:22.

The launch arguments do not clear the missing per-relaunch identity/write-attribution evidence. Conversely, that missing receipt is not proof that the launch used the wrong profile.

## Production source path and controlled reproduction

Source anchors:
- [main](../../../main.js), `BLURBY_USER_DATA_DIR` handling occurs before the lazy `getDataPath`; the cached data path is `app.getPath("userData")/blurby-data`.
- [sync engine](../../../main/sync-engine.js), `initSyncEngine` calls `syncQueue.initSyncQueue(ctx.getDataPath(), syncState.deviceId)`.
- [sync queue](../../../main/sync-queue.js), `initSyncQueue` sets module-local `queuePath = path.join(dataPath, "sync-queue.json")`; `saveQueue` uses the captured path and real `writeJSON`. Initialization loads, not writes, the queue.
- [state IPC](../../../main/ipc/state.js), `save-settings` copies permitted values, then its debounced/quit-flushed save always enqueues update-settings. It does not first require a semantic change. The queue operation's timestamp changes even when identical settings bytes are written.
- [JSON store](../../../main/json-store.js), `writeJSON` serializes immediately, chains per-path writes, writes a.tmp and atomically renames it.

The exact same “library/settings hashes unchanged, queue hash changed” pattern is reproducible without a profile escape:

```powershell
node C:/Projects/Blurby-artifacts/parallel-investigation-20261026/queue-path-probe.cjs
```

The probe loads the unmodified state handler, sync-queue and JSON store. It mocks only Electron IPC registration, theme-window side effect and the sync-engine status revision. Filesystem persistence is real. An instrumentation guard refuses every write/rename outside this lane's artifact root and records actual PID, path and source stack.

| Control | Actual observed result |
|---|---|
| Initialize a queue at the owned scratch data path, then perform no IPC call |0writes; all hashes unchanged. |
| Call real save-settings with the same theme value; flush its actual pending write | Settings file is rewritten with equal bytes; library hash unchanged; one update-settings queue operation is persisted and its hash changes. |
| Call real save-settings with a different theme value | The settings hash changes, proving the detector can see semantic content changes too. |
| Separate other-profile sentinel plus the actual normal-profile hashes | Other-profile fixture unchanged; normal library/settings/queue hashes unchanged before/after probe. All8 recorded filesystem operations target only the owned scratch data path. |

Result: `queue-path-probe-result.json` has assertionsPassed=true, real module hashes, actual target, PID and file-operation stacks. It shows that content-hash equality does not prove write isolation and that queue target selection honors the supplied data path in this controlled process.

It does **not** prove which data path the original18:02 process initialized, which original process wrote a file, or whether some other actor wrote/rewrote/restored the normal files. No hardcoded normal queue path was found in the inspected path; a static null is not proof that every runtime launch is isolated.

## Recommendation and bounded next experiment

**Do not reset/restore/clear the queue or prescribe a source fix from this evidence.** Preserve the current queue and existing receipts. Separate byte preservation from write attribution in every future verdict.

A minimal repeatable isolation experiment requires:
1. Capture normal library/settings/queue content hashes, mtimes and canonical path/file identity before launch; retain a content-free manifest. Use only owned synthetic scratch settings/library/queue fixtures.
2. Start one explicitly identified packaged process with both isolation levers. Before its first interaction, read its main-process PID, executable, userData and initialized getDataPath. Do this after **every** relaunch, not once per smoke session.
3. Start a path-and-PID file-write recorder before launch, covering the normal and scratch targets and their.tmp/rename operations. Prove the recorder sees an owned positive-control write. A FileSystemWatcher or unchanged hash alone cannot attribute PID. Use an existing approved OS recorder if available; lack of PID-capable recording leaves attribution open.
4. In the verified scratch process, wrap the actual filesystem writeFile/rename calls for observation only, without changing their arguments/results; record paths and PID but never settings payloads. This observer can attribute that process's writes, while the OS recorder covers unrelated processes.
5. Perform one no-op settings IPC and flush, then a different-value control. Assert that both writes target only the scratch data path. Compare normal metadata and hashes after durable flush and after process exit.
6. If a normal-path write is seen, stop further input and identify its PID/executable/initialized profile. A wrong initialized data path, a second normal process and an external rewrite are distinct branches; select the source fix only after that evidence.
7. If the scratch process writes only scratch and normal metadata remains unchanged, report that specific candidate/run passed; do not retroactively close the original smoke event's attribution.

The original writer cannot be recovered from the currently retained hashes/mtimes alone. The missing pre-event PID trace is a historical evidence limit, not a reason to keep changing app code until a theory passes.

## Regression specification once attribution is known

- Wrong-profile initialization: test actual main startup path/queue initialization with both isolation levers, not merely direct initSyncQueue arguments; assert the resulting durable target after an actual save-settings/quit flush.
- Second process: harden the harness's process/session admission and per-relaunch identity receipts; do not patch the queue implementation for a harness identity failure.
- Correct path but stale singleton initialization: reproduce the actual duplicate initialization/lifecycle before changing module state. Directly forcing a second init at another directory is not evidence that production does so.
- External writer: fix or isolate that actor and repeat the same detector controls. Preserve evidence and queue data.

No full-suite/build/package or original writer-attribution PASS is claimed. These are an evidence-led diagnosis and concrete next experiment; PROFILE-QUEUE-ISOLATION-1 remains unresolved until a decisive PID/path trace exists.
