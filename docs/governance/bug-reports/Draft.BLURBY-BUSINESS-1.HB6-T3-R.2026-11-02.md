# HB-6 task3-R — isolated recent-store foundation draft

Date: 2026-11-02. PLANNING ONLY / NOT READY / NO ADMISSION. Binding technical input: `Brain.BLURBY-BUSINESS-1.HB6-T3-R.2026-11-02.md`, actual BB-HB6-T3-R-20261102. This enriches existing Business HB-6 task3, not a new epic/register item. Brain alone coordinates execution. W/I, security, primary-window retarget and quit integration remain later separately specified work.

## Base, exception and protected fence

Exact inspected source: `1bcceb0efede6d33df4bba232f75832247b3f851`, accepted task2 fixture checkpoint. Branch `eb/blurby-business-1`, intended quiet-host worktree `C:/Projects/bb-business`, common Git `C:/Users/estra/Projects/Blurby/.git`; fresh actual receipt required. Source exception is expressly approved for this inert unregistered store before APP-TABS/settings/write-race merges; it does not terminally accept those dependencies or admit any actual window/IPC/profile use.

ONLY production/test paths:

- A `main/business/recent.js`
- M `main/constants.js`: ONLY declarations/exports `BUSINESS_DATA_DIR = "business"`, `BUSINESS_RECENT_MAX = 20`; no PARTITION constant.
- A `tests/businessRecent.test.js`
- Exact approved epic state/journal checkpoint through standard documentation lifecycle.

No existing tests or json-store/IPC/window/preload/renderer/package/dependency/lock/source policies change. Keep frozen charter/storyboard/seed/matrix, accepted generator/report fixture, retained report.pdf.tmp and known perf dirt byte-identical. Main/** is package-included: native/package qualification remains HELD; never say package unchanged.

Read AGENTS/plugin/overlays, frozen charter/plan/last state+journal and HB-6 seed, binding R ruling, this draft, then exact-base `main/json-store.js`, `main/constants.js`, `tests/jsonStore.test.js`. Source checks below are against Git object1bcceb0e, not current-root files.

## Exact implementation contract

CommonJS `module.exports = { createRecentStore }`. Hold module objects: `const jsonStore = require("../json-store")` and the actual `fs/promises` module object; call `jsonStore.writeJSON(...)` and `fsPromises.readFile(...)` through those references. Do not destructure writeJSON/readFile or introduce DI/singleton/registry infrastructure. These objects are the spy targets, using `createRequire(import.meta.url)` from the test.

`createRecentStore({getDataPath})` synchronously validates a function and a root returned by exactly one call, snapshots `path.resolve(root)`. Invalid context: TypeError message BUSINESS_RECENT_CONTEXT; invalid root: TypeError message BUSINESS_RECENT_DATA_PATH. Root must be nonempty/NUL-free/native absolute; Windows must be fully qualified drive/UNC, never drive-relative/root-relative. Import/factory performs no I/O/timer/Electron/app/library/sync action. Future IPC will own one store per root; no multiwriter/native-alias claim.

Return `{getRecent, addRecent, removeRecent, close}`. First three always return Promises; valid mutations resolve defensive result arrays. Persist exactly a newest-first JSON array of normalized absolute path strings at `<snapshot-root>/business/recent.json`. No timestamps/wrapper/version/content/password/OCR metadata. Input paths: nonempty string, NUL-free, native absolute; Windows drive/UNC only, no device namespace or drive/root-relative. Normalize lexically using path.resolve; compare lowercase only on Windows; latest normalized spelling wins on re-add. Do not stat/read the PDF, check extension/existence, resolve realpath/junctions or infer read permission. Invalid path input rejects with no persistence; error branding beyond the binding ruling is not invented here.

Every accepted read and mutation is queued in invocation order, covering complete read/modify/mkdir/write transaction. Read latest disk state inside each operation, no cache. Strict async readFile + JSON.parse: ONLY read ENOENT yields[]. Other native I/O errors propagate. Invalid JSON, nonarray, invalid/non-normalized entry, duplicate comparison key or >20 entries reject Error with code AND message BUSINESS_RECENT_INVALID_DATA; preserve bytes, no mkdir/write. Empty array is valid. Do not call readJSON, which swallows errors.

addRecent(p): normalize p, remove equal keys, prepend latest spelling, slice20, await recursive async mkdir of Business directory then existing jsonStore.writeJSON. removeRecent(p): filter key; absent match returns unchanged copy without mkdir/write, including absent file. Failed mkdir/write rejects the caller unchanged. Internal sequencing tail recovers only to admit later operations; failed operation never turns into success or an unpersisted cached update.

close(): set closing synchronously, reject subsequent three operations with Error code/message BUSINESS_RECENT_CLOSED. Already accepted work completes normally; do not recheck closing later and cancel it. Repeat close returns the SAME Promise; resolve undefined once accepted queue settled, including rejected individual operations. It means drained, not all operations succeeded. No quit hook here. Before real activation, later integration must stop new Business operations, await close, THEN global whenWritesSettled; existing global flush cannot drain not-yet-started store writes.

## Test mechanism and literal cases

New `tests/businessRecent.test.js` uses Vitest and Node built-ins only. Obtain actual CJS fs/promises and json-store objects with createRequire; vi.spyOn each object property. Path-filter fault/delay spies to the case-owned exact recent target; restore spies in finally/afterEach after accepted operations/close settle. Do not change tests/jsonStore.test.js or mock away real read/modify/write behavior. No suite-global Electron/runtime import.

Base-red mechanism: address new module through a variable and load inside each test using `Promise.resolve().then(() => cjsRequire(modulePath))`; use a resolves assertion for exported createRecentStore before dereferencing it. The missing module produces an assertion failure, not a collection/top-level failure. No beforeAll import of the missing module. Existing json-store controls remain collected and unchanged. Preserve the red-only test commit and failing output before implementation.

Define case paths using current-platform path.resolve under retained test-owned root, with basenames A.pdf/B.pdf/C.pdf and p00.pdf…p20.pdf. The Windows host must execute the Windows-specific cases; do not substitute Linux inference. Required named cases:

| Name | Literal assertions / opposing control |
|---|---|
| r01 factory and import are inert | Import/factory call no observed readFile/mkdir/writeJSON/stat/realpath; getter called exactly once; changing its later return cannot relocate store. Valid factory is the positive control for invalid factory cases. |
| r02 factory rejects invalid context/root synchronously | Missing/nonfunction getter -> BUSINESS_RECENT_CONTEXT; empty/NUL/relative root -> BUSINESS_RECENT_DATA_PATH; on Windows reject C:relative and root-relative paths. Fully qualified owned root succeeds. |
| r03 missing read and remove do not create | Missing store getRecent()->[]; removeRecent(A)->[]; read only exact recent target; zero mkdir/writeJSON; Business directory remains absent. addRecent(A) in separate case proves write detector observes a write. |
| r04 add/re-add/removal preserve order | addA->[A], addB->[B,A], readdA->[A,B], removeB->[A]; persisted array agrees after each. Unknown C removal returns same list with no mkdir/write. |
| r05 Windows comparison retains latest spelling | add absolute A spelling then its case variant -> one latest-normalized entry; POSIX case-sensitive opposite control is conditional on that platform, not a Windows expectation. Fully qualified UNC input accepted lexically without I/O at the UNC path. |
| r06 cap exactly20 | Add p00…p20 in invocation order -> result/persisted list[p20,…,p01], length20, p00 absent. Stored21-entry input is invalid rather than silently truncated. |
| r07 strict corruption refusal | Independent retained cases: malformed JSON, object/null instead of array, nonstring/NUL/relative entry, non-normalized string, duplicate key,21 entries -> code/message BUSINESS_RECENT_INVALID_DATA and unchanged raw bytes/no writes. Valid[] control is accepted. |
| r08 native read error is observable | readFile exact target rejects chosen native EACCES object -> same error to caller, no mkdir/write; no conversion to[]. Missing ENOENT is the opposing accepted case. |
| r09 lexical input only | Invalid add/remove path rejects with no mutation; normalized absolute nonexistent/non-PDF-named path is accepted, proving no extension/stat/content/existence check. All I/O targets are within case root/business/recent.json and its atomic temp/directory. |
| r10 entire transactions and reads ordered | Hold first add's target read with a manually released Promise. Invoke addA, addB, removeA, getRecent without awaiting between calls. Before release no later target read/write passes it. After release caller results[A],[B,A],[B],[B], disk[B]. No sleeps used to create the race. |
| r11 failed write does not publish success | Reject first case-target jsonStore.writeJSON with chosen native error before delegating; caller rejects same error. Next addB re-reads actual prior disk[], persists/resolves[B], not[B,A]. Queue continues. |
| r12 failed mkdir is observable and recoverable | Reject first owned Business mkdir; addA caller rejects; next addB re-reads actual prior state and succeeds[B]. No fallback writes/cloud queue. |
| r13 returns are defensive and disk is authoritative | Mutate arrays returned by read/add/remove; subsequent getRecent unchanged by caller mutation. Externally rewrite owned fixture with valid[C] between settled calls; next read sees[C], proving no cache. |
| r14 close drains accepted calls | Delay accepted addA, enqueue addB/read, call close twice -> strict Promise identity. New read/add/remove reject BUSINESS_RECENT_CLOSED immediately, no target I/O; release delay -> earlier results[A],[B,A],[B,A], close resolves undefined. |
| r15 close settles failures without hiding them | Accept failing add then close; caller receives original error, close resolves undefined; repeated close Promise remains identical. |

Correct write target is verified against root/business/recent.json, never library.json/settings.json/sync-queue.json or a supplied document path. Spy recording must include writeJSON invocation and actual persisted-state check so a no-op implementation cannot pass. Do not introduce actual getters/profile paths from main.js into tests.

## Fresh retained artifacts and exact command draft

Proposed fresh external root `C:/Projects/Blurby-artifacts/business-hb6-t3-r-20261102/`, require absent before ownership/creation. Under it use separate `red/data/<case>` and `green/data/<case>` roots, plus logs/receipts and per-run red/os-temp or green/os-temp. Test-local case counters/names are deterministic; create each data root nonrecursively under an already owned parent so collision is refusal. Keep every new businessRecent fixture file/directory after success/failure; no fs.rm/unlink/rmdir/cleanup hook. Spies may be restored and stores closed; those are not artifact deletion.

The test requires process-local BUSINESS_RECENT_TEST_ROOT set to the exact owned red/green data parent; missing value fails clearly instead of falling back to os.tmpdir/live profile. No global environment change. Export retained-case directory list and exact error/control outcomes through test logs; tests write only inside that root. External accounting `logs/admission-accounting.jsonl` names separately consumed start/deadline/aggregate calls, all workers/reviews included. UTF-8/raw-byte hashes, no F-011 timing mutation.

PowerShell7, exact receipted Node24.14.1 and accepted Business worktree, only after separate admission:

```powershell
$env:BUSINESS_RECENT_TEST_ROOT = 'C:/Projects/Blurby-artifacts/business-hb6-t3-r-20261102/red/data'
$env:TEMP = 'C:/Projects/Blurby-artifacts/business-hb6-t3-r-20261102/red/os-temp'
$env:TMP = $env:TEMP
$env:NODE_OPTIONS = '--max-old-space-size=2048'
& 'C:/Program Files/nodejs/node.exe' './node_modules/vitest/vitest.mjs' run tests/businessRecent.test.js tests/jsonStore.test.js --maxWorkers=1
# Red: exit1, new cases fail intended missing-module assertions; old controls pass; collection succeeds.
# After separately committed implementation, use fresh .../green/data and .../green/os-temp for the three task-local root variables.
# Green: same exact command exit0, both suites pass, all fixtures/failed evidence retained.
```

This heap option is process-local JavaScript old-space limit, not total memory containment. One Node child at a time. No full suite/build/native/installation or application imports. Capture stdout/stderr/actual exits and case directory hashes; preserve red and green outputs separately, no replay over old roots. At most two identified repair passes inside remaining cap require fresh owned external case roots and preserved previous results.

**Existing control lifecycle, explicitly bounded:** Brain prescribed the unchanged combined command. `tests/jsonStore.test.js` creates only `path.join(os.tmpdir(), "blurby-test-json-store-" + Date.now())` and its existing afterAll removes that generated fixture tree. Preserve that test byte-for-byte and its ordinary isolated lifecycle; no new deletion/mocking permission is inferred. Before tests, prove the process-local TEMP/TMP resolve to the fresh owned external os-temp directory, including absence of redirects/aliases outside that ownership boundary. Record resolved absolute paths; the existing generated JSON-store fixture tree must remain within that parent. If actual host confinement cannot be proved, stop on that concrete custody gap. New businessRecent roots, logs, receipts, red/failing evidence and all workspace/local work remain retained. No arbitrary rm, evidence cleanup, existing-test edit, skipped control or new fs.rm spy follows. No test ran during planning.

## Task rows, staging and stop

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 3-R | Inert strict recent store, invocation-ordered transactions and close, with retained positive/negative controls | repeat | feature | bounded | high | 40m | — | — |

Total original parent task3 estimate120m remains; R40m is provisional/un-calibrated, not a completion promise or a fresh priced U10 result. R alone requires separate <=60m/<=40 aggregate-tool admission after final contract/review/input/custody; no allowance is active now. W/I remain independent later, not automatic successors.

At future consumed start verify actual source1bcceb0e/full tree/branch/common Git, locks, no competing source owner, all new target paths absent and immutable published pointer/Brain-ruling bytes received. Preserve all pre-existing tracked hashes except exact constants change and approved item docs; fixture/generator/frozen packet/perf/tmp remain raw-byte identical. Do not borrow CPU/B0/PP1 tools, clocks or custody. Changes outside the exact R fence STOP.

Stage new recent module/test and only two constants' declaration/export hunks; standard exact epic state/journal checkpoint after acceptance. Compare cached paths and complete diff/stat against baseline; retain red test-only commit ancestry. Ordered Solon-role specification compliance -> Plato quality -> Marcus item docs under plugin/overlays, not parallel reviews. Commit/push accepted source checkpoint only under Brain's separately admitted explicit Business refspec; no main merge, package qualification, full HB-6/epic close-out or provider/terminal change. Preserve failures at cap; no cleanup/reset/stash, no scope expansion or automatic reinstall.

## Applied lessons / held gates

LL-003 isolated CommonJS module; LL-006 existing serialized atomic writer; LL-066 visible errors with internal sequencing tail only; LL-128 absence checks; LL-113 external retained fixtures; LL-137 UTF-8/raw bytes; LL-157/159 close drains future queued writes before later global flush (not wired here); LL-169 operation acceptance versus retained store lifetime; standing rules36/41/42/43/44/46/47/48/50/52/53/55 preserve exact pins, accounting, red/opposite controls and source/package gates. LL-106 bridge integration is deferred because no handler/bridge exists in R. No PDF rendering/native/profile/permission claim. Final U9/U10 and independent pointer review remain pending.

Only this new draft is authored. No helpers/provider/runtime/tests/source/executor contacts. R API/security choices are fixed by Brain's actual ruling; final host root/custody receipts, exact immutable pointer and independent/mechanical readiness checks remain, with no new owner decision inferred from existing test teardown.
