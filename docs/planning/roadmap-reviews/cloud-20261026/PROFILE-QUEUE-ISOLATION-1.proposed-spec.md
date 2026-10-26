# PROFILE-QUEUE-ISOLATION-1 — proposed attribution and conditional repair contract
Date: 2026-10-26. Planning owner: durable cloud thread 01a17a3a-dcdb-7308-8560-3989bd32a015.
Proposal only; packet ROADMAP Seq121 In Flight / Stub remains authoritative. No execution admission, data repair, main merge, release or terminal status.
Source handoff: 762d38ac53f22245a56f89e489ab367c905dcd91; publication incorporates protocol-only descendant f299675dd8251e550f06ab47abb7c4b6ff1889f2. Branch eb/cloud-folder-profile-specs-20261026.
Owned writes for this task: only new item-specific reports in docs/planning/roadmap-reviews/cloud-20261026/.

## Goal and evidence boundary
Produce a decisive, bounded future writer/path experiment and conditional repair admission contract. Preserve the completed approved investigation docs/studies/investigations/PROFILE-QUEUE-ISOLATION-1.2026-10-26.md unchanged.

Established: normal queue changed between 17:57:43.376Z and18:09:09.689Z. Candidate write correlation is around18:02:22; unchanged library/settings bytes coexist with changed mtimes. No retained original PID trace identifies the writer. Original pre-Part-B queue bytes are unavailable, so neither an exact semantic diff nor an exactly-one-append claim is justified.

The real save-settings -> sync-queue -> json-store scratch control persisted equal settings bytes and an update-settings operation. Its no-call control caused zero writes. Its different-value control changed settings bytes. All8 observed filesystem operations targeted the owned scratch data path; other synthetic profile and normal file hashes remained unchanged. This proves a controlled mechanism and that queue targeting honors the supplied data path in that process. It does not prove original relaunch identity or original writer.

Recommendation for Brain: admit an observation/harness experiment first; authorize no application repair until PID/path evidence identifies an actual defect. No queue reset, restore, clear, payload export or speculative singleton redesign. A new clean run cannot recover a missing historical writer.

## Authority and open gates
All technical rulings belong to Brain thread01a179e8-7a40-75c0-93f4-d3045ad99027; human retains functionality and account/device choices. No cross-thread send/read/wait tool is exposed. Parent relays or obtains rulings later; silence is not approval.

P1 recorder: choose an available PID-capable native recorder and exact event schema. Recommended: OS-level Windows file I/O trace supporting process identity plus write/create/rename/replace events and loss accounting, with a validated parser. Procmon or ETW are candidate implementations only, not assumed installed or certified. A generic filesystem watcher cannot meet PID attribution. If no such recorder is available, publish LIMITED/ATTRIBUTION OPEN, not PASS.
P2 observation: approve an observer-only instrumented scratch-process route alongside an independent clean packaged route. Wrapping fs.promises for tracing changes the runtime and cannot certify clean-package qualification. No production startup/queue code edits are needed for this experiment. If existing approved inspector access cannot expose actual initialized paths, stop for a separately fenced observation mechanism; never add unrestricted IPC.
P3 scope: default to owned synthetic profiles and read-only metadata/hashes of normal files, no normal process input. OS capture filtered to exact profile targets and necessary process identity; no settings payloads or unrelated user activity. Choose a fixed observation bound for the native run (proposed120 seconds including >=25-second survival, then clean quit). Exceeding the bound is an inconclusive run, not permission to continue indefinitely.
These are specific unresolved technical admission gates, not requests to redo the diagnosis.

## Exact read order
1. AGENTS.md technical authority, source/lane/package rules.
2. .codex/agents/zeus.toml and docs/planning/cloud-handoff/2026-10-26/cloud-startup-addendum.md at f299675d. TOML was missing from initial handoff, now fetched/read.
3. docs/governance/LESSONS_LEARNED.md LL-143, LL-157/159 (flush producers before draining writes), LL-165 (every launch actual identity), LL-167 (package); follow original entries.
4. ROADMAP.md PROFILE-QUEUE-ISOLATION-1, active platform writer/freeze gates and visibility-first ordering.
5. Packet README.md, upload-manifest.json and admission.json. Foliate admission grants no profile-source authority.
6. Approved PROFILE-QUEUE-ISOLATION-1.2026-10-26.md.
7. docs/planning/cloud-handoff/2026-10-26/evidence/parallel-investigation-20261026/queue-path-probe.cjs, queue-path-probe-result.json and investigation-validation.json. Read Windows paths as provenance; never run unchanged against nonexistent C: paths.
8. main.js: env override29; getDataPath41–44; path getters50–54; initialization; actual quit flush629 onward.
9. main/sync-engine.js init around980–984; main/sync-queue.js init153–154/load/save/enqueue; main/ipc/state.js save-settings and exported flushPendingSettingsSave; main/json-store.js writeJSON32 and whenWritesSettled60.
10. Existing launcher/profile preflight scripts and actual package scripts. Before admission parent supplies exact native recorder executable/version/hash, parser and harness paths, all read in their actual committed revisions. Do not substitute guessed scripts.
11. Current package/source/main pins and independent review of the exact experiment contract.

## Lane, source and test fence
Lane Platform & Maintenance / Evaluation Harness for the proposed experiment, serial custody of one scratch desktop process. No shared-core changes.
Current task writes reports only. Future portable-test proposal: new tests/profileQueueWriteIdentity.test.js. Future native observation harness proposal: scripts/profile-queue-isolation/observe.mjs and scripts/profile-queue-isolation/launch.ps1, plus item-owned receipts. Those are proposed names requiring separate admission, not files created by this chat.
Read-only application fence: main.js, main/ipc/state.js, main/sync-engine.js, main/sync-queue.js, main/json-store.js, existing startup/quit harnesses.
No app changes are admitted. No main/preload/schema/auth/account/device/reader/build/dependency/default settings changes, no shared ROADMAP/provider/register writes by this worker. Repair fences remain empty until a proven branch below obtains Brain approval.
No overlapping edits with Foliate dependency patch/tests or visibility LibraryView. Investigation reports and raw packet evidence remain immutable.
Merge order: observation planning may proceed in parallel; visibility remains first app fix; native desktop experiments serialize with all other native runs. A proven repair gets its own pin/fence/admission after evidence review.

## Future experiment A: actual production-module detector
Use the real CommonJS modules in an isolated process per case; permit Electron IPC registration/theme/status boundary shims only, disclosed in receipt. Do not copy queue/store/save logic into a fake implementation. Fresh owned synthetic fixtures only. Fixture writes are logged separately from measured operations.

1. Establish canonical owned root and other-profile sentinel. Resolve aliases/symlinks and reject destinations outside owned scratch. Never initialize a production module against normal files for a test.
2. Record module hashes, Node/Electron version, process PID plus start time, fixture file identities/metadata/hashes and queue operation count. Do not record settings values, library content or queue payloads beyond synthetic controls.
3. Initialize actual queue with scratch getDataPath. No-call control: zero write/rename events and equal bytes; distinguish initialization reads from writes.
4. Invoke actual save-settings IPC with identical permitted synthetic setting and explicitly flushPendingSettingsSave, then whenWritesSettled after all enqueue producers settle. Assert actual equal-byte settings rewrite and real queue append; validate source stack and target of both tmp writes and destination renames. Do not assert equal bytes means no write.
5. Different synthetic setting control: changed settings bytes plus scratch queue persistence. Assert a second synthetic profile untouched.
6. Debounce/quit arm control: issue real IPC and perform real exposed flush path before the500 ms timer; assert one durable enqueue/write set, not a second timer write after flush. Queue length assertions apply to synthetic controlled fixture only.
7. Recorder detector controls: a deliberate owned equal-byte rewrite must be detected even when hashes match; an owned atomic tmp->target replacement must report both source/destination identities; a second owned child process writes its own sentinel and is attributed to that child's PID/start identity, not the parent. No deliberate normal-path write.
8. Compare metadata/hashes after flush and exit. Detector failure, stack shim error or missing file is HARNESS FAIL, not proof of production isolation.

Red/opposite meaning: the current application is expected to pass the mechanism test, including equal-byte rewrite+append. Do NOT manufacture a pre-change application red for an unproved isolation bug. The red control belongs to a deliberately wrong detector or known owned cross-root test fixture: it must reject a forbidden target before a module write and separately detect a permitted second-process sentinel write. A guard proving prevention is not evidence a real production escape occurred.

## Future experiment B: one native packaged run
Prerequisite: P1–P3 ruling, recorder controls pass, exact final package/native environment available and exclusive desktop/profile custody. Cloud session cannot execute or certify this native route.
- Start recorder before launch, include exact normal and scratch library/settings/queue paths, their parents and tmp/rename operations; cover replace/delete/create as well as WriteFile. Retain recorder start/stop, coverage filters, dropped events, permissions/errors and clock reference.
- Capture before metadata, SHA256, canonical path and volume/file identity for normal and scratch targets. Mark missing files explicitly. Read metadata/hashes only; never copy normal content into output. Preserve current normal queue.
- Enumerate process identities before launch; distinguish existing normal app from owned scratch process. Do not terminate another chat's/user's process. Conflict -> no input and hold.
- Launch one owned packaged executable with BOTH BLURBY_USER_DATA_DIR and --user-data-dir. Before any UI/IPC action, capture actual main PID + start time, parent PID, executable/hash, architecture/isPackaged, app.getPath('userData'), initialized getDataPath and observed queue initialization/actual queue destination. A direct standalone initSyncQueue(dataPath) is insufficient startup proof.
- Read initialized path through the existing approved main-process observation mechanism. Claimed launch args, covers directory existence, renderer settings or one earlier session's identity do not substitute. Repeat identity receipt after EVERY relaunch; any mismatch stops before interaction.
- Perform a quiet no-input phase, same-value synthetic save-settings and durable flush, then different-value control and durable flush, then clean quit. Record action acknowledgments and save/queue settlement boundaries. Do not infer completion from the fire-and-forget IPC return. Observe actual application quit flush and process absence.
- The observer-only variant logs PID/start identity, resolved target/source stack and fs write/rename start/end without changing arguments, results, error handling, timestamps or queue operations. No catch/filter/retry corrective wrapper. OS trace remains necessary to see other actors.
- End after the approved bound, retain all errors/rejections/error.log/dump census and recorder loss status. Hash/metadata census after durable flush AND after process absence. At least25 s native survival is required independently of test action speed.
- Capture a clean uninstrumented exact-package counterpart with the OS recorder and the same synthetic actions. Label observations separately. No debugger-paused run, observer wrapper or instrumented package may be relabeled clean.
- Do not use account login, network sync changes, normal setting seeds or device resets to simplify the route. Preserve actual default/account choices. If a clean process produces other legitimate writes, enumerate and attribute them; do not discard them as noise.

## Classification and conditional repair decision tree
| Observation | Allowed conclusion | Next proposed work, after Brain ruling |
|---|---|---|
| All recorded writes are scratch; normal metadata/hash unchanged; recorder loss0 and controls pass | This candidate/run isolated for observed interval | Preserve historical writer unknown; no source fix warranted |
| Scratch PID writes normal target and initialized path is normal | Proven initialization/launch defect for this run | Trace actual override/cache timing; minimally fence startup path and startup regression, not queue reset |
| Scratch PID initialized scratch but real queue destination is normal | Proven runtime path divergence for this run | Capture initialization lifecycle/call stacks; only reproduce stale/duplicate singleton init if actually observed |
| A distinct normal Blurby PID writes normal files | Separate process, not demonstrated scratch escape | Harness exclusive-session/process custody; do not patch queue for the wrong actor |
| External PID writes/replaces normal file | External actor for captured event | Identify executable/start identity and fix/isolate proven actor under separate scope |
| Hash unchanged but write/rename observed | Equal-byte write occurred | Record actor/path; byte equality is not no-write |
| Hash changed or metadata moved but recorder has gap/no PID | Change observed, attribution unresolved | Stop input and preserve; improve recorder only after explicit ruling |
| No normal mutation, recorder control missed or events dropped | No reliable isolation verdict | HARNESS FAIL / INCONCLUSIVE, never PASS |
| Original event lacks PID trace despite future clean run | Historical attribution unknown | Explicit evidence limit, no retroactive closure |

No repair follows from guessed original writer PID, launch args alone, direct forced second queue init, static absence of a hardcoded normal path or a successful narrow scratch probe. Conditional branches are not execution-ready patches until the actual culprit is established and Brain supplies exact source edits and regression red.

## Acceptance/evidence schema
Each run receipt must include run ID, actual task ID, start/end UTC plus monotonic durations, package/ASAR/source/harness hashes, actual command and shell, platform/runtime, PID+start/executable chain, canonical initialized paths, readback time before input, initial/final content-free metadata manifests, detector controls, OS event index/loss census, observed fs operation PID/path/source stack, each action and flush acknowledgment, errors/rejections/dumps, shutdown/absence and verdict per branch.
OS raw trace is retained in owned evidence storage with a content-free published index/hash; never commit unrelated process data, settings payloads or credentials. A published redaction notes removed fields, never rewrites the retained raw source. Collector/parse failure retains raw trace and blocks a null claim.
Positive controls must run with the same filtering/parser configuration as the experiment. PID reuse is resolved with start time/executable identity. Wall-clock timestamps and mtime correlation alone do not identify PID. Canonical path check includes tmp and rename destination; string-prefix comparison alone is insufficient.

Success for this proposed experiment means a valid bounded trace and correctly scoped classification, including an explicit UNKNOWN when warranted. Success does not require finding an application bug. No exact original writer-attribution PASS is possible from the presently retained historical evidence.

## Bounded waves and failure handling
Wave A (<40 tool uses): Brain P1–P3 ruling; parent current pins/live register/owner custody; exact harness/recorder fence; production-module detector and opposite controls on existing code. No application edits.
Wave B (<40): one native instrumented observation and clean counterpart with persisted intermediate receipts. Split before budget; do not relaunch without a fresh identity receipt. Maximum two harness repair passes; preserve first failure and escalate material recording gaps.
Wave C (<40): independent trace/classification review and exact-candidate evidence index; proposal for a minimal repair ONLY if a branch is proven. App repair requires separate Full Spec/admission; this experiment is not authority.
On any unexpected normal-target write: stop further input, preserve trace and current files, capture PID/executable/profile identity, shut down only owned scratch process safely and retain write/quit evidence. Do not restore files, append cleanup operations or try a queue reset. An error during shutdown is evidence, not grounds to delete artifacts.
If a later source patch is admitted: actual culprit regression must fail the real base and pass candidate; startup tests exercise real main initialization and actual save-settings/quit durable target. Then normal suite/typecheck/build and native exact-package gates remain. Harness-only changes cannot claim a source isolation fix.
Parent handoff pointer is NON-DISPATCHABLE until P1–P3 and source/harness fences integrated: PROFILE-QUEUE-ISOLATION-1 / packet Seq121 / live URL and final baseline supplied by parent / proposed spec at this path. Parent alone integrates ROADMAP/register. No completion/merge/release or normal data mutation is authorized.
