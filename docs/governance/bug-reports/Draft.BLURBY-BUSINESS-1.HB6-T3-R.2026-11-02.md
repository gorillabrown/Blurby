# BLURBY-BUSINESS-1 — HB-6 task3-R isolated recent-store foundation draft

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
| r09 lexical input only | BOTH addRecent/removeRecent independently reject every invalid portable/Windows input in the literal fixture block below as a Promise, without observed filesystem I/O/mkdir/writeJSON for that call or changed persisted bytes. No new error brand is invented. Positive fully qualified drive/UNC and normalized absolute nonexistent/non-PDF paths remain accepted, proving no extension/stat/content/existence check. Store I/O targets only the owned Business recent file/directory/atomic temp. |
| r10 entire transactions and reads ordered | Hold first add's target read with a manually released Promise. Invoke addA, addB, removeA, getRecent without awaiting between calls. Before release no later target read/write passes it. After release caller results[A],[B,A],[B],[B], disk[B]. No sleeps used to create the race. |
| r11 failed write does not publish success | Reject first case-target jsonStore.writeJSON with chosen native error before delegating; caller rejects same error. Next addB re-reads actual prior disk[], persists/resolves[B], not[B,A]. Queue continues. |
| r12 failed mkdir is observable and recoverable | Reject first owned Business mkdir; addA caller rejects; next addB re-reads actual prior state and succeeds[B]. No fallback writes/cloud queue. |
| r13 returns are defensive and disk is authoritative | Mutate arrays returned by read/add/remove; subsequent getRecent unchanged by caller mutation. Externally rewrite owned fixture with valid[C] between settled calls; next read sees[C], proving no cache. |
| r14 close drains accepted calls | Delay accepted addA, enqueue addB/read, call close twice -> strict Promise identity. New read/add/remove reject BUSINESS_RECENT_CLOSED immediately, no target I/O; release delay -> earlier results[A],[B,A],[B,A], close resolves undefined. |
| r15 close settles failures without hiding them | Accept failing add then close; caller receives original error, close resolves undefined; repeated close Promise remains identical. |

Literal r09 input fixtures (JavaScript source, never shell interpolation):

```js
const invalidPortableInputs = [undefined, 7, '', '\0', 'relative.pdf'];
const invalidWindowsInputs = [
  String.raw`C:relative.pdf`,
  String.raw`\relative.pdf`,
  String.raw`\\?\C:\example.pdf`,
  String.raw`\\.\example`,
];
```

The root-relative fixture contains exactly ONE leading backslash; each device-namespace fixture contains exactly TWO leading backslashes, followed by `?` or `.`, then one separator. Preserve those actual strings; do not double-escape the contents of String.raw templates. Run every portable input and, on Windows, every Windows input against BOTH addRecent and removeRecent independently. Every call returns a Promise rejecting without observed filesystem I/O/mkdir/writeJSON for that invocation; stored bytes remain unchanged and no extra error brand is prescribed. Use retained case roots and a valid stored-list baseline; read before/after bytes outside the operation's spy interval. The same single-leading-backslash root-relative fixture and drive-relative fixture are r02's invalid-root controls. Valid UNC input is a literal fully qualified path such as String.raw`\\server\share\A.pdf`, persisted as data only; no filesystem operation targets that UNC document.

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

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Inert strict recent store, invocation-ordered transactions and close, with retained positive/negative controls | calculable | feature | bounded | high | 40m | — | — |

**Total:** mechanical chain9m · sum9m; 1 of1 rows priced from recorded history. Separate uncalibrated planning estimate R40m; original parent task3 estimate120m remains. Mechanical9m is not an elapsed-time forecast or source allowance. R alone requires separate <=60m/<=40 aggregate-tool admission after final contract/review/input/custody; no allowance is active now. W/I remain independent later, not automatic successors.

At future consumed start verify actual source1bcceb0e/full tree/branch/common Git, locks, no competing source owner, all new target paths absent and immutable published pointer/Brain-ruling bytes received. Preserve all pre-existing tracked hashes except exact constants change and approved item docs; fixture/generator/frozen packet/perf/tmp remain raw-byte identical. Do not borrow CPU/B0/PP1 tools, clocks or custody. Changes outside the exact R fence STOP.

Stage new recent module/test and only two constants' declaration/export hunks; standard exact epic state/journal checkpoint after acceptance. Compare cached paths and complete diff/stat against baseline; retain red test-only commit ancestry. Ordered Solon-role specification compliance -> Plato quality -> Marcus item docs under plugin/overlays, not parallel reviews. Commit/push accepted source checkpoint only under Brain's separately admitted explicit Business refspec; no main merge, package qualification, full HB-6/epic close-out or provider/terminal change. Preserve failures at cap; no cleanup/reset/stash, no scope expansion or automatic reinstall.

##### Lessons applied

Current semantic applicability census: `docs/governance/LESSONS_LEARNED.md`, including chronological status updates through LL-175, read on2026-11-02. This section covers R only and changes no lesson status or binding store semantics. Historical generic guidance yields to Brain's exact source-only R exception. Mechanical U9/U10 and published/input/host receipts remain pending; this census is not execution admission.

| Live lesson | Concrete effect in this R draft |
|---|---|
| LL-002, LL-003 | A separately reviewable recent-store CommonJS module/checkpoint keeps the partial foundation out of main.js and avoids a mixed window/IPC/quit feature change. |
| LL-006 | Mutations await existing jsonStore.writeJSON; r04/r11 inspect persisted results/error propagation. No direct store-file writer, cloud fallback or change to the existing atomic writer. |
| LL-031, LL-169 | Closing synchronously prevents new operation admission, while already accepted transactions retain their right to finish. r14/r15 distinguish operation admission, queued-work lifetime and individual failures. No late closing recheck cancels accepted work. |
| LL-063 | The named local isolated Business worktree and exact source parent avoid cloud-synced development. Checkpoint publication occurs only under separate explicit Business admission/refspec; no historical generic pull/push instruction resumes parked work. |
| LL-066 | Read errors other than ENOENT and mkdir/write failures reject their own callers. The fulfilled sequencing tail admits later work but never turns an individual rejection into success (r08/r11/r12/r15). |
| LL-068 | Exact path/hunk staging, protected byte hashes and diff/stat catch truncation or accidental reconstruction. R's explicit no-full-build exception is preserved; targeted tests do not claim build/package qualification. |
| LL-087 | Only two declared/exported constants are added to the actual CJS constants module. Real module import under the combined test command exposes initialization/TDZ defects; no mock constants bypass. |
| LL-088 | One R owner owns createRecentStore and the two constants; W/I are later checkpoints. No concurrent source writer or duplicate export is presumed safe. |
| LL-090 | Exact-base json-store/constants/tests are read; the actual readJSON swallowing behavior and module-object spy pattern drive the specified strict read and write API choices. |
| LL-092 | No product cache is added: each queued operation re-reads persisted state. r13's external valid rewrite distinguishes disk authority from stale in-memory success. |
| LL-096 | Import/factory perform no tracing, app initialization or runtime registration. Tests invoke the inert store explicitly; no always-on production instrumentation is introduced. |
| LL-097, LL-098 | Deterministic retained per-case/run roots and separate red/green logs preserve interruption/failure evidence. Errors remain observable; existing evidence is never overwritten or cleaned to manufacture a new pass. |
| LL-113 | New fixture data/logs live under the exact external root; no scratch source/test mirror is copied into discovery. The one new real test is deliberately inside tests/. |
| LL-118, LL-139 | The actual small CJS dependency boundary is explicit: existing json-store/constants and Node modules, no folder-sync import, app/IPC/window/renderer or hidden runtime dependency. R does not claim a whole-application import census. |
| LL-128 | Fresh target-absence/custody checks precede adding recent.js/businessRecent.test.js and external roots; existing targets are preserved and returned for disposition. |
| LL-134 | Historical task3 estimate120m and provisional uncalibrated R40m are not wall-time promises or automatic allocations; every future wave has its own consumed cap. |
| LL-137 | Raw bytes/SHA256 and explicit UTF-8 logs preserve JSON/source/evidence provenance on Windows; renderer/shell formatting is not byte equality. |
| LL-142 | Targeted synthetic storage tests establish no actual Business window, PDF permission, installed/native/package or full-epic qualification. Lexical identity is explicitly not canonical native identity. |
| LL-143 latest2026-11-02 Observation annotation; standing rule44 | Real red/green commands, exact exits, intact json-store opposing controls and raw input/output identities are required. Missing-module reds are asserted inside tests rather than collection errors; an unexecuted command or planner surrogate does not qualify. Historical rule44 promotion is preserved. |
| LL-144 | Exact source1bcceb0e and red-test commit ancestry remain the reconciliation base; do not infer a new baseline from current main or absence of published work. |
| LL-145 | Binding Brain contract and frozen epic inputs remain intact; sequential independent reviews inspect final bytes and actual receipt identities. Planning approval is not source or package acceptance. |
| LL-157, LL-159 | Before later activation, stop new Business operations, await store.close, then global whenWritesSettled. R tests its own drain only and adds no quit wiring; the existing global flush cannot prove future queued writes are drained. |
| LL-162 | r07/r09 enumerate accepted/invalid record and platform path classes, with valid controls and byte preservation; finite fixture coverage is explicit, not a whole-corpus/native proof. |
| LL-172 | Exact path staging and external accounting avoid timing-helper backfills or change-ledger writes outside R's fence. No F-011 helper call is authorized. |
| LL-174 | API/module-object identity and Promise contracts are checked at the real caller boundary; destructuring writeJSON/readFile is forbidden so spies observe the actual calls. Future IPC forwarding remains W/I work, not claimed integrated here. |
| LL-175 | Accepted task2 PDF/generator/tmp bytes remain protected; no trimming/regeneration or global whitespace-policy change is used to satisfy R checks. Format-specific prior fixture disposition is not generalized to new source. |

Promoted histories are applied as standing rules, not revived as live lessons: rule37 unique export ownership; rule39 isolated source boundary; rule40 no speculative mutation-plan; rule41 exact path/accounting permissions; rule42 committed reconciliation/input pointer; rules43/44 causal/opposing actual command receipts; rule45 no automated perceptual/native verdict; rule46 provider status stays with ceremonies; rule47 named actual quiet host; rule48 full verification remains deferred by R's explicit partial admission; rule49 no file must name its own future merge; rule50 no waived/regressed existing oracle; rule51 preserve current lesson statuses; rule52 keep evidence out of test discovery; rule53 package qualification HELD because main/** changes; rule54 no claimed live commit-trigger acceptance; rule55 absent/no-write/error checks carry positive detectors. The existing jsonStore.test.js owned scratch teardown is part of Brain's exact command, not a new permission to delete retained R evidence.

**Considered live lessons not applicable to R implementation, by exact scope:**

- LL-004, LL-007, LL-008: no CI/distribution, content-security policy/BrowserWindow, React context or prop architecture.
- LL-014, LL-015, LL-016, LL-017, LL-018, LL-019, LL-020, LL-021, LL-022, LL-023, LL-024, LL-025, LL-026, LL-027, LL-028, LL-029, LL-030, LL-032, LL-033, LL-034: no animation, layout, reading mode, DOM, selection, engagement, word segmentation or audio chunking behavior.
- LL-065, LL-067, LL-069, LL-070, LL-071, LL-072, LL-073, LL-074, LL-075, LL-076, LL-077, LL-078, LL-079, LL-080, LL-081, LL-082, LL-083, LL-084, LL-085, LL-086: no format conversion/rendering, reader IPC normalization, cursor/anchor/navigation, UI setting, layout fallback, keyboard, browser fetch or Foliate geometry.
- LL-089, LL-093, LL-094, LL-095: no patched dependency, component/effect reduction target, URL/auth scheme or token refresh.
- LL-099, LL-100, LL-101, LL-102, LL-103, LL-104, LL-105, LL-106, LL-107, LL-108, LL-109, LL-110, LL-111: no Kokoro state, extraction callback, playback speed, token joining, warmup, mode guard, IPC/preload/language protocol, streaming or eval matrix. Future bridge registration is explicitly outside R.
- LL-114, LL-115, LL-116, LL-117, LL-119, LL-120, LL-121, LL-122, LL-123, LL-124, LL-125, LL-126, LL-127: no speech normalization/cache migration, assembled audit archive, directory migration, React hook identity, mode ownership/alias, prosody or heard-audio calibration. Complete draft/ruling inputs are preserved without pretending R is an audit package.
- LL-129, LL-131, LL-132, LL-133, LL-140, LL-150, LL-152: no bulk document transform, dead-code deletion census, child kill/exit fake, charter completion, user parity observation, asset deletion or live A/B timing diagnosis.
- LL-154, LL-155, LL-163, LL-171: no connector formula/view/text/schema/alias/sequence mutation. Required final provider confirmation is separately owned, not performed by R source/tests.
- LL-160, LL-161, LL-165, LL-168, LL-170, LL-173: no word numbering/content acceptance, app/profile driver action, installer, DOM canonicalization or audio-output fake. Owned temporary storage is not a claimed initialized Blurby profile and never substitutes for future native gates.

Retired/superseded entries and promoted histories were considered only for current status; none is restored as a live requirement. The retired task-count splitting rule is replaced by the actual plugin per-wave60m/40-call rule. Semantic census is complete for R; parent qualified U9/U10 and ordered independent reviews passed; final updated-pointer byte-bound receipt and fresh host/input custody remain separate. No new owner question or Brain API choice is created.

Only this new draft is authored. No helpers/provider/runtime/tests/source/executor contacts. R API/security choices are fixed by Brain's actual ruling; final host root/custody receipts, exact immutable pointer and independent/mechanical readiness checks remain, with no new owner decision inferred from existing test teardown.
