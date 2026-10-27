# PROFILE-QUEUE-ISOLATION-1 — proposed ETW attribution contract, revision 4
Date: 2026-10-27. Local planning continuation of durable cloud thread 01a17a3a-dcdb-7308-8560-3989bd32a015.
Proposal only; packet ROADMAP Seq121 In Flight / Stub is historical; the live provider is authoritative. No execution admission, data repair, main merge, release or terminal status.
Source handoff: 762d38ac53f22245a56f89e489ab367c905dcd91; publication incorporates protocol-only descendant f299675dd8251e550f06ab47abb7c4b6ff1889f2. Revision 2 input f10311a0d8440bcf00c7a3a1a57be2e94601996e; immutable revision 3 commit 6d15e5b16bd6e915a7bba50135508ef74806305c; local branch eb/local-folder-profile-planning-20261027.
Owned writes for this task: only new item-specific reports in docs/planning/roadmap-reviews/cloud-20261026/.

## Goal and evidence boundary
Produce a decisive, bounded future writer/path experiment and conditional repair admission contract. Preserve the completed approved investigation docs/studies/investigations/PROFILE-QUEUE-ISOLATION-1.2026-10-26.md unchanged.

Established: normal queue changed between 17:57:43.376Z and18:09:09.689Z. Candidate write correlation is around18:02:22; unchanged library/settings bytes coexist with changed mtimes. No retained original PID trace identifies the writer. Original pre-Part-B queue bytes are unavailable, so neither an exact semantic diff nor an exactly-one-append claim is justified.

The real save-settings -> sync-queue -> json-store scratch control persisted equal settings bytes and an update-settings operation. Its no-call control caused zero writes. Its different-value control changed settings bytes. All8 observed filesystem operations targeted the owned scratch data path; other synthetic profile and normal file hashes remained unchanged. This proves a controlled mechanism and that queue targeting honors the supplied data path in that process. It does not prove original relaunch identity or original writer.

Recommendation for Brain: admit an observation/harness experiment first; authorize no application repair until PID/path evidence identifies an actual defect. No queue reset, restore, clear, payload export or speculative singleton redesign. A new clean run cannot recover a missing historical writer.

## Authority, adopted Brain planning directions and remaining entry gates
All technical rulings belong to Brain thread01a179e8-7a40-75c0-93f4-d3045ad99027; human retains functionality/account/device choices. Parent01a0cf7f-62f6-7450-abc9-5bb2750923f4 relayed P1–P3 directions for this refinement. The cloud transcript/tool limitation is historical; the local continuation has read Brain directly and sent technical questions through local thread tools. A request is not a ruling. These are PLANNING directions, not harness-write, trace-start, installation, application repair or native-capture admission.

Adopted P1: Windows ETW file-I/O via WPR is preferred. Brain's READ-ONLY local check reports C:/Windows/System32/wpr.exe version10.0.26100 lists FileIO and tracerpt.exe is available. The original cloud planner did not inspect those binaries. The local continuation has performed the read-only inventory below; decoded schema, profile bytes, parser and loss accounting remain NOT qualified. Procmon/WPA not on PATH does not prove absent everywhere.
Adopted P2: separate observation-only owned scratch process plus an independent CLEAN packaged counterpart under the SAME OS recorder; actual initialized data/queue paths after EVERY launch before input. Instrumented/inspector route never becomes clean qualification. No new unrestricted IPC or startup hook.
Adopted P3:120 seconds PER native observation from recorder start through graceful shutdown and recorder stop; >=25 seconds actual native survival; fresh owned profile, identity and exclusive custody for each run. Fixed phases below. Overrun is FAIL/INCONCLUSIVE, no retry-until-green/retroactive shortening; two harness repair passes maximum.

Entry gates still OPEN:
- P1-Q1 exact local binaries/version/SHA256, WPR recording profile/hash, providers/keywords/event versions, native architecture, privileges, session ownership and capture footprint approved BEFORE trace start.
- P1-Q2 decoder/export/parser path/version/hash plus normalized schema, file-name/object/thread/process-start correlations, rename BOTH endpoints and completion/status coverage validated by owned controls. tracerpt presence or XML generation is not parser qualification.
- P1-Q3 per-session lost events/buffers, decode errors, unknown event versions/unresolved maps and truncation census; missing counters remain unknown. No zero/PASS inferred from an omitted field.
- P2-Q separately fenced observation-design admission is REQUIRED by the selected ruling. No established approved mechanism currently proves ACTUAL initialized getDataPath AND sync-queue.queuePath before clean input. Passive initialization-read attribution or strict read-only MAIN inspection must prove causal production-startup provenance under the separate design; userData inference and forced init are invalid. A new hook/export/IPC requires its own fence and security review; none is authorized.
- P3-Q exact native owner/custody/source/package/harness pins and120-second schedule qualification. The selected Brain ruling requires a narrower custom profile; stock FileIO capture is forbidden. Published-index redaction is not raw-scope approval.
The original historical writer remains UNKNOWN; no source fix is presumed.

## Local read-only qualification inventory — 2026-10-27
Revision 2 received bounded documentation approval in independent review commit 38a787be6ea06ea4ea7774788c9534851aee53aa. The local inventory was published in immutable revision 3 commit 6d15e5b16bd6e915a7bba50135508ef74806305c. Revision 4 incorporates the selected Brain P1/P2-Q planning ruling below and requires review of its exact delta; no approval of an earlier revision covers this amendment.

| Read-only inventory field | Actual readback |
|---|---|
| OS API / architecture / privilege | Windows NT 10.0.26300.0; native Arm64; process Arm64; non-elevated |
| WPR | C:/Windows/System32/wpr.exe; file version 10.0.26100.9711; SHA256 A19275562A4ED8F329CE1AB248A44CB4AF60C1091EA2F275097DEE43761BD693 |
| tracerpt | C:/Windows/System32/tracerpt.exe; file version 10.0.26100.1; SHA256 1ACDC2556DAE42A0BC8503A43BB385E5C5ADDD2AAE608969B60BFA3D98529533 |
| Signing | Both Authenticode status Valid, Microsoft Windows signer |
| Banner distinction | tracerpt help reports 10.0.26100.9711; preserve separately from its measured file version |
| WPR status | Not recording at read time; this is not a claim about other recorder technologies |
| Requested profile / resolved profile | FileIO / FileIO.Verbose.Memory |
| System Collector | 1024 KB buffers, 3250 buffers |
| Event Collector | 1024 KB buffers, 650 buffers |

Read commands were Get-Item/VersionInfo, Get-FileHash, Get-AuthenticodeSignature, wpr -status, wpr -profiles, wpr -profiledetails FileIO and tracerpt -?. No recorder was started, stopped or canceled. A help command's nonzero exit is not a failed recording or a privilege test.

The resolved system keywords are CpuConfig, DiskIO, FileIO, FileIOInit, HardFaults, IdealProcessor, Loader, ProcessCounter, ProcessThread and ThreadPriority. Stacks include FileCreate, FileCleanup, FileClose, FileRead, FileWrite, FileSetInformation, FileDelete, FileRename, FileDirEnum, FileFlush, FileQueryInformation, FileFSCTL, FileOpEnd, FileDirNotify and ThreadDCEnd. The event collector includes antimalware, JScript, .NET, NCSI, Win32k, WLAN, BrokerInfrastructure, ProcessStateManager, WPR control and kernel event tracing providers; save-time capture-state providers include JScript, .NET/runtime rundown and power. This is an observed broad raw footprint, not an exact exported profile/host event-schema qualification.

Selected P1 ruling: NO stock FileIO.Verbose.Memory capture. Its measured provider/raw footprint exceeds the approved target/process-identity scope. A custom NARROW profile and decoder require qualification of exact bytes/hash, privileges, event schemas, mappings, loss accounting and owned detector controls before any separately admitted capture. Broader-scope capture is not a current alternative; future supersession requires a new explicit ruling. FileIO name/stack presence does not establish complete successful operation/rename-endpoint coverage. The read-only inventory partially fills P1-Q1 but does not close profile-byte/hash, provider/event-version/schema, actual privilege/start capability, parser, loss, rename, storage ACL or ownership gates.

P2-Q remains a concrete source-backed blocker: main.js:41-44 caches getDataPath in module-local _dataPath; main/sync-queue.js:15 holds private queuePath, initialized at 153-154 before loadQueue reads the target. Initialization need not write a file. Existing scripts/ui-sweep/sweep.mjs:250-275 reads userData through the inspector, checks covers existence and library/settings hashes; it does not read initialized getDataPath or the actual queue destination. Covers, command-line arguments and a forced queue initialization cannot fill the gap. Selected P2-Q ruling: a SEPARATELY FENCED observation-design admission is REQUIRED; no established approved mechanism currently proves the actual initialized getDataPath and sync-queue.queuePath before CLEAN input. The clean counterpart remains BLOCKED until that design is separately approved and recorder entry controls qualify. No hook is added by this proposal, and instrumented evidence must not be relabeled clean.

No desktop/app launch, recording, harness write, normal-profile read/write or capability control occurred during this inventory. Application repair fence remains EMPTY; the original historical writer PID remains UNKNOWN.

## Selected P1/P2-Q ruling and provenance — revision 4
The parent relayed the exact Brain ruling on 2026-10-27 through source thread 01a0cf7f-62f6-7450-abc9-5bb2750923f4. Direct Brain turn 01a17dce-7c65-76f0-9148-7c036d4a9130 commentary separately confirms that the stock profile is too broad and a narrower recorder plus separate path-observation design is needed. Commentary does not settle F3 or force-download ordering. These are planning choices, not installation, profile/harness writing, recorder start or capture admission.

P1 choice is CLOSED: no stock FileIO capture and no broader-scope alternative under the present ruling. Require a custom NARROW profile/decoder qualification; exact configuration bytes/hash, privilege capability, actual event schemas, process/thread/file/rename/outcome mappings, loss census and same-configuration owned detector controls all remain entry gates. Redacting a published index cannot approve a broader raw recording.

P2-Q choice is CLOSED as a required separate observation-design admission; actual observation/qualification remains OPEN. The future proposal may passively attribute actual initialization reads of the exact queue/settings/library targets with proven process and call-phase mapping, OR use a strict read-only MAIN inspector of ACTUAL initialized values. A formula from userData, inferred path, forced initialization or prose description is insufficient. The proposal must prove causal production-startup provenance. A new hook, export or IPC requires its own explicit fence and security review; none is authorized here. No paused/debugger run is clean; instrumented and clean observations remain distinct. Clean input is BLOCKED until the separately approved design and qualified recorder entry controls establish the actual initialized targets.

The application repair fence stays EMPTY. Historical writer identity stays UNKNOWN. The fixed 120-second observation contract, >=25-second survival, normal-data preservation, raw-storage restrictions, separate native custody and two harness-repair-pass limit remain unchanged.

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

## ETW grounding and qualification contract (no trace execution here)
Microsoft documents that ETW sessions can lose events and expose EventsLost; buffer/file configuration and provider selection govern capture. It identifies FileIo event families rather than generic disk traffic as file-level evidence. These pages ground required checks, not a claim that the local built-in FileIO profile enables every necessary family (Microsoft,2022, https://learn.microsoft.com/en-us/windows-hardware/test/wpt/sessions; Microsoft,2021, https://learn.microsoft.com/en-us/windows/win32/etw/fileio).

The decoder must use the actual provider GUID, event ID/opcode, version and architecture from the captured host. FileIo_Info exposes thread ID, file-object/key and information class; FileIo_ReadWrite supplies operation correlation and requested byte count. FileIo_OpEnd can correlate operation completion and status through the request identifier. A rename event name alone does NOT prove its payload contains a destination path (Microsoft,2021, https://learn.microsoft.com/en-us/windows/win32/etw/fileio-info; Microsoft,2021, https://learn.microsoft.com/en-us/windows/win32/etw/fileio-readwrite; Microsoft,2021, https://learn.microsoft.com/en-us/windows/win32/etw/fileio-opend).

Before any capture admission, parent/native owner must commit an item-specific qualification manifest containing:
1. Exact wpr.exe and tracerpt.exe absolute paths, versions, architectures, SHA256 and signing identity; exact OS build/native architecture and command shell. Reported version10.0.26100 is not a measured hash. Procmon alternative, if used, requires same facts and separate Brain approval.
2. WPR profile ID and exported/custom .wprp bytes/hash; every collector/provider GUID/keyword/level/stack option/buffer count/size/logging mode. FileIO name in a list is not evidence of profile contents. Specify unique owned session/file names and restricted local output directory/ACL. Do not stop/cancel another session or install a tool.
3. Exact capture command arrays and stop/status commands, parser/export command arrays and hashes. This planning report intentionally supplies no unqualified WPR start command. Qualification must identify who may execute them under a subsequent admission.
4. Actual event metadata/TDH/MOF/manifest decoder sources for that host and a coverage matrix for process/thread start/rundown/end, name/create/rundown, write, set-information, replace/delete, rename, flush, cleanup/close and operation completion. Preserve raw provider/event identity and payload field names beside normalized values. Do not hardcode generic DiskIO offsets or assume old MOF pointer widths match ARM64 event versions.
5. Precise raw capture footprint. Kernel FileIO may collect machine-wide names/process activity even if publication is filtered. BEFORE capture disclose actual raw scope, duration, stacks/command-line data and restrictions. A post-filter is not a narrow raw recording. The measured built-in profile exceeds approved targets/necessary identity and is forbidden by the selected ruling; qualify a custom NARROW configuration. A broader recording would require a future explicit superseding ruling, not approval under this contract. No claim that path filtering is supported without evidence.
6. Process identity: PID+process-start timestamp/unique process key+executable path/hash. For each event resolve emitting/performance thread to its owning process over a bounded lifetime. PID/TID/file-object reuse must not join unrelated actors. Header PID alone may be insufficient for kernel/asynchronous I/O. Unresolved identity means attribution UNKNOWN.
7. File identity: canonical volume path and volume/file ID metadata where available, file-object/key lifetimes, name/rundown updates, handle create/cleanup/close and source/destination rename mapping. Capture existing files' identities before recording, then replacements afterward. Do not treat file-object address as persistent filesystem ID. Record missing identities explicitly.
8. Operation outcome: preserve request/IRP correlation, requested bytes and available completion/status. Begin event is attempted I/O, not necessarily successful mutation. Failed writes/renames are retained with status, not counted as successful writes. Flush observation is distinct from application enqueue/durable quit acknowledgment.
9. Loss census from every relevant session: EventsLost, available lost-buffer/realtime/logfile counters, recorder status/warnings, parser unknown/decode-error counts, map gaps and unpaired operations. Store unavailable as null+reason, never0. EventsLost=0 alone does not prove providers covered required activity. Any nonzero loss or target mapping gap makes a no-write/isolation verdict INCONCLUSIVE.
10. Parser normalized JSONL plus synthetic expected-event fixtures and validation script. Parser output includes run/session ID, UTC and raw/QPC clock mapping, provider/event/version, operation start/end/status, PID/start/exe/TID, fileObject/key/IRP when provided, source/destination canonical path/file identity, resolution confidence and raw event reference. No file payloads, settings values or unrelated published events.

Required owned qualification controls under EXACT same recorder/profile/filter/parser configuration:
- no-call/quiet window: no controlled synthetic operation; do not mislabel recorder's own output file IO as app writes.
- equal-byte rewrite of owned synthetic settings: hashes equal but attributed write+completion present.
- actual json-store tmp write + atomic rename/replacement: both endpoints/identities and process attribution, existing file replacement path accounted for.
- owned create, delete, explicit flush and failed operation: detect respective attempts and outcomes. If Windows omits a requested family or decoder cannot resolve it, coverage remains OPEN.
- second owned child process writes a sentinel while parent also writes a different sentinel: preserve BOTH process identities. Never filter only scratch PID; that would exclude the unknown original actor class.
- deliberate parser fixtures with event loss, missing process/name/rename destination, unknown event version, pointer/PID reuse and out-of-order begin/end: verdict must be INCONCLUSIVE rather than silently filling from nearest timestamp.
Use owned synthetic data only; never write normal targets as a control. Validate source/destination target filtering retains file-name/process mapping events needed before the target write. Publish expected/observed counts and raw trace hash; a hand-authored normalized event is a parser unit test, not native recorder validation. Native qualification controls themselves require separate capture admission; none were run here.

For final observation, retain raw ETL and decoder exports in owned RESTRICTED local storage, hash them and publish only a content-free filtered index plus coverage/redaction limits. The index covers exact normal/scratch library.json/settings.json/sync-queue.json, parents, temp files and both rename endpoints, and only required actor identity. Missing rename destination, ambiguous System/thread actor, failed decoder, unreported loss or excessive raw scope blocks attribution. Do not upload unfiltered system ETL to this repository.

## Fixed120-second native observation schedule
Two independent runs use fresh profiles: I (instrumented observation) and C (clean packaged counterpart), same OS recorder/profile/parser and synthetic action sequence. Neither run borrows the other's identity/readback. Qualification controls occur separately under their own explicitly admitted bounds.

| Time from recorder-start monotonic t0 | Phase / required completion |
|---|---|
| t0–10 s | Start already-admitted owned recorder; launch one app; obtain PID/start/exe/native/isPackaged and actual initialized userData/getDataPath/queue target BEFORE input. If not obtained by10 s, no input; graceful owned cleanup, verdict INCONCLUSIVE. |
| t10–30 s | No-input baseline. Continue process survival/OS observation; initial identity/readback and baseline metadata captured before actions. No settings seeding after launch. |
| t30–50 s | One same-value permitted synthetic settings IPC; record actual pending-save flush + queue enqueue + JSON write settlement. Remain quiet after acknowledgment; do not repeat. |
| t50–70 s | One different-value synthetic setting IPC; actual durable flush/queue settlement, record changed-byte positive control. |
| t70–90 s | Quiet observation and final prequit metadata/hash/file-identity census; process must have survived >=25 s in real native execution, not debugger pause or assumed wall time. |
| t90–110 s | Request normal graceful quit once; await real application quit producers/flush and process absence. No killing unrelated process. |
| t110–120 s | Postabsence metadata/hash/identity, stop only owned recorder while retaining raw/error/loss data and stop acknowledgment. Snapshot of stop failures recorded. |

Each phase has a deadline; no late operation is moved to the next phase and relabeled on-time. Timeout immediately stops new input; necessary owned cleanup stays recorded even past120 s and the run is FAIL/INCONCLUSIVE. Do not truncate cleanup logs to satisfy the bound. Parser/export analysis may occur after recorder stop, clearly timed separately; it does not extend the observation interval or hide recorder-stop overrun. If a genuine app control cannot meet this schedule, preserve the failure and return to Brain for a new proposed contract, not an unrecorded retry. Two harness-repair passes maximum.
Unexpected normal-target write: stop input immediately, capture actor/path/process-start identity, retain evidence and gracefully shut down ONLY owned scratch process; keep recorder through cleanup if possible, report actual duration/overrun. Normal contents/queue are never reset/restored for controls.

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
Prerequisite: adopted P1–P3 planning directions refined through P1-Q1/Q2/Q3, P2-Q and P3-Q capability/custody gates, independent review, separately admitted recorder controls pass, exact final package/native environment available and exclusive desktop/profile custody. Cloud session cannot execute or certify this native route.
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
Wave A (<40 tool uses): exact P1-Q1/Q2/Q3, P2-Q and P3-Q qualification manifest and independent review; separate normal admission before any harness write/capture; parent current pins/live register/owner custody; exact harness/recorder fence; production-module detector and opposite controls on existing code. No application edits.
Wave B (<40): one native instrumented observation and clean counterpart with persisted intermediate receipts. Split before budget; do not relaunch without a fresh identity receipt. Maximum two harness repair passes; preserve first failure and escalate material recording gaps.
Wave C (<40): independent trace/classification review and exact-candidate evidence index; proposal for a minimal repair ONLY if a branch is proven. App repair requires separate Full Spec/admission; this experiment is not authority.
On any unexpected normal-target write: stop further input, preserve trace and current files, capture PID/executable/profile identity, shut down only owned scratch process safely and retain write/quit evidence. Do not restore files, append cleanup operations or try a queue reset. An error during shutdown is evidence, not grounds to delete artifacts.
If a later source patch is admitted: actual culprit regression must fail the real base and pass candidate; startup tests exercise real main initialization and actual save-settings/quit durable target. Then normal suite/typecheck/build and native exact-package gates remain. Harness-only changes cannot claim a source isolation fix.
No installation, trace start, harness write or local capture occurred in this planning task. The local continuation performed only the explicitly listed read-only binary/profile/source inventory. Microsoft sources were read as public documentation only. Parent handoff pointer is NON-DISPATCHABLE until P1-Q1/Q2/Q3, P2-Q, P3-Q and exact source/harness fences integrated under separate admission: PROFILE-QUEUE-ISOLATION-1 / packet Seq121 / live URL and final baseline supplied by parent / proposed spec at this path. Parent alone integrates ROADMAP/register. No completion/merge/release or normal data mutation is authorized.
