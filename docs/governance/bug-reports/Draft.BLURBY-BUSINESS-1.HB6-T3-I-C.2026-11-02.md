# BLURBY-BUSINESS-1 — HB6 task3-I-C inert read-controller draft

PLANNING ONLY / NOT READY / NO ADMISSION. Binding complete technical ruling: `Brain.BLURBY-BUSINESS-1.HB6-T3-I-C.2026-11-02.md`, BB-HB6-T3-I-C-20261102. Read with the actual I architecture ruling and Brain.SR44-source-qualification.2026-11-02.md. This adds no register item/epic, active allowance or actual filesystem/window/IPC/native authority. Root reviews/publishes; Brain alone rules/adopts the final technical cuts and coordinates execution. R/W stay independent of I drafting; I-C implementation waits for the **actual accepted post-R/W parent**.

## Parent, read order and exact fence

Known accepted R is cc7e0018c66186d4a71041b62b7f5c1b14fa1bb2, treea5102932b37ca8f818da96bc150368f426ddd5f3. W's eventual accepted source checkpoint is not supplied here; **do not invent its SHA or start from R alone**. At that actual parent read all listed sources and freeze exact commit/tree, branch and protected-byte manifest. No newer governance commit is a substitute source parent.

Recorded placement is RodneySR quiet Windows host, Business branch eb/blurby-business-1, worktree C:/Projects/bb-business, common Git C:/Users/estra/Projects/Blurby/.git. These labels are not fresh custody. Actual W acceptance, branch/worktree/dirt/locks/current owner, dependencies, Node pins, external artifact ownership and immutable input consumption must be receipted before source admission. No bq-main/stash manipulation, everyday-machine fallback, install or pull is implicit.

Read: actual AGENTS/shipped Zeus/overlays; live lesson chronology through LL-175; frozen epic charter/plan/state/last journal/seed; actual I architecture and I-C rulings; accepted R/W source and relevant checks; this draft; accepted-parent main/constants.js and main/business/recent.js; tests/jsonStore.test.js and tests/documentsOpenSource.test.js for existing CJS object-spy/cache-restoration patterns. Source search found no reusable FileHandle positional-read loop among inspected main/tests patterns; do not silently import a whole-file reader or unrelated filesystem module as an adapter.

I-C source/test fence is exactly:

- A **main/business/read.js**.
- A **tests/businessRead.test.js**.
- M **main/constants.js**: only `BUSINESS_READ_CHUNK_BYTES = 1048576` declaration/export. Preserve R's two constants, accepted W partition and every other byte/hunk.
- Exact approved epic **state.md** checkpoint and append-only **journal.md** under docs/planning/epics/2026-10-30-blurby-business/ after ordered review.

No other source, existing tests, package/lock/dependency, preload/types/IPC/main registration, quit, renderer, native policy or shared governance change. No new DI/framework/security registry. Preserve accepted generator/report/PDF temp/perf and frozen packet bytes. Main/** is package-included: package/native qualification remains HELD, never package unchanged. The eventual I-D bridge/quit integration and Task5 range adapter are not implemented here. Task4 primary-window retarget must precede ANY real Business window creation, regardless of mock results.

## Exact module and API contract

CommonJS **module.exports = { createReadController }**, no other export. `createReadController()` has no options; import/factory perform no explicit I/O, timer, Electron/app/window/model/IPC action. Keep `const fsPromises = require('fs/promises')` as a module-object reference for real createRequire/vi.spyOn; use node:path lexical helpers. Do not destructure open, inject fs via public options or require main.js/window/launcher modules. Constants are fixed main constants, no new flags/caps.

Returns EXACT **{ getGeneration, open, read, close, getPath, invalidate, stopNewWork, shutdown }**. No public internal lease/fault/handle registry. One controller belongs to one future Business window owner; authorization/grants belong to later I-D and MUST precede controller.open.

| Method | Ruled result / synchronous boundary |
|---|---|
| getGeneration() | Synchronously returns this controller's current opaque frozen empty-object identity token; never IPC-serialized. |
| open(path,generation) | Promise resolving exactly `{id,path,length,initialData}`; invalid arguments reject before I/O. Before enqueue/open, synchronously reserve the process-global positive safe ID and register an owned opening lease. |
| read(id,begin,end) | Promise resolving exactly `{begin,data}`; valid owned/live current lease only. Validate strict positive safe ID and safe offsets/span, never coerce. |
| close(id) | Invalid ID rejects Promise. Otherwise synchronously mark the owned lease closing; retained same close Promise while lease exists, including rejection. Valid absent ID resolvesundefined/no-op; successful release removes the record, no tombstone. |
| getPath(id) | Synchronously returns normalized path only for current/notclosing/notstopping live lease; throws branded validation/lifecycle error otherwise. No file I/O and no future sender/grant bypass. |
| invalidate() | Synchronously replace generation token and mark all old leases invalid; clear future path access. Promise settles after the call's owned pending/open/read/release snapshot and all release attempts; first deterministic release failure rejects only after all attempts settle. |
| stopNewWork() | Synchronous permanent stop of new open/read/getPath. No I/O and no new timer. close/invalidate remain usable; no reopening switch. |
| shutdown() | Synchronously stop+invalidate ONCE; return one retained identical Promise<void>. Await only owned accepted operations/releases, including pending opens, not an ever-changing global tail owned by other controllers. |

Only tokens obtained from the controller are valid caller inputs. Current token succeeds; an obtained prior token is STALE; primitive/null token input is INVALID_REQUEST. The ruling calls the token opaque/frozen/empty; exact treatment of forged/foreign object-shaped tokens must be frozen by Brain before Ready, not improvised into a capability framework. No tests grant trust from matching object contents.

## Lease ownership, module-global IDs and queue

At module scope maintain a process-local monotonically increasing safe document ID sequence and **one fulfilled ioTail shared across ALL factory instances**. No ID reuse while this module/process lives. Exhaustion must reject BUSINESS_ID_EXHAUSTED before any filesystem call. This is not a persisted cross-process identity, signer or generic capability store.

Each controller keeps its owned lease records and operation promises privately. Register the opening lease before enqueue/fs.open so close/invalidate/shutdown can own work whose handle is not yet acquired. Do not allocate queued buffers or call fs outside its queued turn. A rejected operation's own Promise stays rejected; only the internal sequencing tail is fulfilled to admit later operations. Never swallow the caller's error or report it as successfully loaded.

All actual open/stat/read/close I/O is serialized through that **single module-global tail**. At most one main chunk buffer is active across controllers. Retained returned arrays are caller-owned outputs and not included in that bound; no hard worker/canvas/PDF.js/viewer memory claim. Use per-controller owned-operation/release snapshots so shutdown does not wait for unrelated future work appended by another controller.

close(id) marks closing immediately: a read already executing may complete under a normal close; unstarted queued read/open fails CLOSED. A pending fs.open can acquire a handle after close; its owned task must release it and never return its descriptor. An active read must still reject/discard data if its generation is invalidated, even though normal closing alone does not cancel that already-active read. Closing one document never invalidates another or changes the whole controller token.

invalidate()/shutdown() replace the applicable generation before any await. Every old queued/active open/read checks generation before I/O and again before returning descriptor/bytes; STALE data is discarded. Marked leases remain internally owned until release settles. shutdown's repeated calls return the exact retained Promise even when it rejects; no hidden retry.

## FileHandle and exact byte/metadata algorithm

Open authorized normalized native absolute path once with `fsPromises.open(normalizedPath,'r')`; lexical path acceptance matches R (nonempty string, NUL-free, current-platform absolute; Windows fully qualified drive/UNC, no device/drive-relative/root-relative). No PDF extension/magic parser, stat-by-filename, existence probe, readFile, full-file allocation or reopen-per-range.

Use retained handle.stat({bigint:true}). Require isFile(), size>0n and size≤BigInt(Number.MAX_SAFE_INTEGER); **dev/ino/size/mtimeNs/ctimeNs must each actually be bigint**. dev/ino zero is permitted; no Number rounding or unrelated pathname stat. Length becomes a safe Number only after validation. Snapshot those five fields. Compare all five exactly against the snapshot before/after initial read and every range; changed retained-handle metadata gives FILE_CHANGED and invalidates/releases that lease. This is ordinary retained-handle mutation detection, not pathname replacement, immutable bytes, alias or native-attestation proof.

Initial data length is min(length,1048576). For each queued range require Number.isSafeInteger(begin/end), 0≤begin<end≤length and end-begin≤1048576; invalid/oversized is INVALID_REQUEST, never clamp. At its own I/O turn allocate exactly `new Uint8Array(span)`. Positional reads fill this one view until span complete; use handle.read(out,filled,span-filled,begin+filled) or the exact equivalent Node FileHandle positional API. Each bytesRead must be an integer between0 and remaining; zero before completion yields FILE_EOF. Do not return an underlying Buffer.buffer, take a view of a larger backing allocation or trust a mock's returned buffer instead of the owned exact-sized output. Compare metadata and generation again before exposing bytes.

FileHandle/open/stat/read/close failures use the error table below. On internal operation failure/mutation, release **inline inside the same queued task** through one owned-release primitive. Never enqueue close on ioTail and await that new tail from within itself. Normal close queues release after active I/O; release attempts are recorded/observed so no internal rejected close Promise is left unhandled.

Successful close removes lease/handle ownership; valid absent-ID close is a no-op. Failed close **retains the failed owned record, handle provenance and identical rejected close Promise**; no erase, false closure or automatic retry. Preserve primary open/read/mutation error and secondary close error internally. Later explicit close/shutdown must not pretend that record closed; prior failed close is an observed failed release, not permission for an automatic re-close loop. invalidate/shutdown attempt every other owned release before reporting their first deterministic failure. Exact deterministic ordering and malformed-read-return mapping need the bounded clarifications listed below; do not invent another exported diagnostic API.

## Error branding — exact approved strings

Every I-C error has code AND message equal to its selected string; no arbitrary renderer path/stack/native text is part of the stable contract. Native causes remain private internal diagnostics. I-D later serializes safe code/message envelopes; that code does not exist here.

| Approved string | Single-fault control scope |
|---|---|
| BUSINESS_INVALID_REQUEST | Bad path, ID, range or token type; strict noncoercion; oversized chunk. |
| BUSINESS_DOCUMENT_STALE | Obtained old generation token or invalidated lease; discarded stale descriptor/data. |
| BUSINESS_DOCUMENT_CLOSED | Closing/closed/unknown read/getPath ID; queued unstarted operation closed before its turn. Valid absent close is a no-op. |
| BUSINESS_SHUTTING_DOWN | Permanent stop refuses new open/read/getPath. |
| BUSINESS_ID_EXHAUSTED | No next positive safe process-local ID; before I/O. |
| BUSINESS_FILE_INVALID | Not regular, unsafe/nonpositive length or invalid required BigInt metadata. |
| BUSINESS_FILE_CHANGED | Exact retained-handle metadata differs from its snapshot. |
| BUSINESS_FILE_EOF | Positional read returns0 before the required span is filled. |
| BUSINESS_FILE_NOT_FOUND | Native ENOENT from the owned open/stat/read/close path. |
| BUSINESS_FILE_ACCESS_DENIED | Native EACCES/EPERM. |
| BUSINESS_FILE_IO | Other native open/stat/read/close failure. |

Test errors as `.rejects.toMatchObject({code:<literal>,message:<same literal>})` or synchronous getPath throw equivalently, not merely any rejection. Avoid combined-invalid-input cases that imply an unruled precedence; freeze any required precedence rather than change observable outcomes to fit a test.

## Mock mechanics, retained external artifacts and red

New tests/businessRead.test.js uses Vitest + Node built-ins and the real CJS module-object spy pattern only. Derive the absent prospective absolute module path lexically; no unguarded require.resolve of missing read.js before its test assertion. Load inside each test's Promise/assertion boundary, assert createReadController resolves as a function before dereferencing. Import/factory tests observe fs method counters and prohibited app/timer side effects; a missing-module assertion is the permitted base red, not collection failure.

Use createRequire(import.meta.url) for the SAME fs/promises object; spy on its open/readFile/stat/realpath and any prohibited filename I/O. fs.open returns controllable fake FileHandles with actual-method-shaped async stat/read/close; keep all control data in memory or retained external owned fixture bytes. No real file opens through production controller, Electron/module-loader dependency mocking, app/profiles or user PDFs. Every unexpected unowned filesystem call must fail a recorded assertion before delegating to real I/O. Test logs/receipts are written only by the separately fenced external recorder, not a production callback.

Fake handle keeps independent call list/closed state, metadata copies, manually gated open/read/close Promises and a fixed byte source. Partial reads copy literal expected bytes into the supplied output buffer at the requested offset and return bytesRead; no same-function helper computes expected results from implementation. Store creation/opening tasks must be drainable in afterEach; settle any admitted manually gated tasks before restoring spies. Do not suppress failed controller shutdown as success or erase failed close diagnostics. A fake's cleanup is controlled test state, never actual handle ownership proof.

Fresh proposed external evidence root **C:/Projects/Blurby-artifacts/business-hb6-t3-i-c-20261102/**; require actual absence/ownership before creating it, then retain all test/negative/failed logs, case byte fixtures and receipts. Use distinct IC-T-red, IC-Q-green, opposing and repair-N directories, never overwrite/delete old evidence. No new committed fixture/source mirror. No whole-PDF size cap or new dependency. No automatic fs.rm/unlink/rmdir, existing test edit or global Git policy exception.

## Required named controls — independent literals and races

Fixture A uses literal bytes `[37,80,68,70,45,49,46,55,10,65,66,67]` (length12), metadata `{dev:0n,ino:0n,size:12n,mtimeNs:100n,ctimeNs:200n}`, isFile true. Byte contents are arbitrary test data, not a PDF magic-validation rule. Whole first open returns exactly these bytes; read( id,9,12 ) returns begin9/data `[65,66,67]`. Large fixture is exactly1048577 bytes each0xA5, with size1048577n and the same other metadata; each accepted byte is independently asserted0xA5. This is retained/in-memory test data, not a product sample or user document.

| ID / exact proposed name | Assertions and opposing evidence |
|---|---|
| bc01 import/factory are inert and exports closed | Exactly createReadController; factory's exact eight keys, frozen empty token identity stable until invalidation; zero open/stat/read/close/readFile/app/timer work. Explicit mock open in bc04 proves I/O recorder sees effects. |
| bc02 strict path/token refusal precedes I/O | open rejects undefined/number/empty/NUL/relative path; Windows C:relative, one-leading-backslash root-relative and two-leading-backslash device namespace, reusing the exact accepted R String.raw fixture spellings; primitive/null generation rejects INVALID_REQUEST. Getter token with valid path is the positive case; obtained old token rejects STALE. |
| bc03 strict IDs/ranges and unknown leases | read/close invalid IDs0,-1,1.5,'1',NaN,Infinity reject INVALID_REQUEST; getPath throws it. Valid absent close resolvesundefined with no I/O; valid unknown read/getPath gives CLOSED. Range invalids include begin<0, equal/reversed/end>length/noninteger/string/NaN. No allocation/read on rejected requests. |
| bc04 owned one-open descriptor and exact initial bytes | open A with current token reserves positive safe ID, calls fs.open once with normalized path/'r', only handle.stat({bigint:true}); descriptor path/length12/initialData literal exact. No filename stat/readFile/reopen. |
| bc05 partial positional reads fill an exact view | A ranges9..12 delivered through partial returns1 then2: read positions9,10, offsets0,1, lengths3,2; result data `[65,66,67]`, byteOffset0, byteLength3, backing ArrayBuffer byteLength3. No larger Buffer exposure. |
| bc06 one-MiB edge and oversize are distinct | size1048577: initialData1048576, exact span1048576 succeeds,1048577-span rejects INVALID_REQUEST before read, final one-byte range succeeds; never clamp or allocate the whole oversized document. |
| bc07 stat validation rejects bad files safely | Independent isFile false, size0n/unsafe size, missing metadata field or number instead of BigInt gives FILE_INVALID, owned handle released. dev/ino0n and negative time BigInts do not fail merely for zero/time sign; do not invent metadata policy. |
| bc08 every metadata field detects mutation | Independently change dev/ino/size/mtimeNs/ctimeNs before or after initial/range read; each gives FILE_CHANGED, releases/inactivates lease, exposes no descriptor/bytes. Stable snapshot is positive control. |
| bc09 EOF and native errors are branded | Premature bytesRead0 gives FILE_EOF; open/stat/read/close ENOENT=>NOT_FOUND, EACCES/EPERM=>ACCESS_DENIED, EIO=>FILE_IO. Full code/message exact; real native object remains internal, not stable text/public payload. |
| bc10 global queue spans two controllers | Hold controllerA open/stat/read; accepted controllerB work makes no fs call and no early buffer allocation until A turn releases. Then deterministic call/results order; two factories do not create independent concurrent I/O tails. |
| bc11 IDs are module-global and never reused | Two controllers share monotonically increasing distinct IDs; after successful close, next open gets a strictly higher ID. IDs are not array indices/handle numbers and no process-persistence claim follows. |
| bc12 exhaustion rejects before I/O | Boundary helper must qualify exact MAX_SAFE_INTEGER allocation/exhaustion without looping or adding a production hook; test mechanism requires the explicit clarification below. Expect ID_EXHAUSTED and zero new fs calls; no ID wrap/reuse. |
| bc13 pending open then normal close stays owned | Gate fs.open before it resolves; call close on reserved ID via the deterministic mocked opening-ID record/recorded allocator expectation, release open; handle closes once, open rejects CLOSED, no descriptor. Repeated close before release is same Promise. Exact opening-ID observation mechanism must be finalized without new public export. |
| bc14 pending open then invalidate discards descriptor | Open with captured token; synchronously invalidate, old token differs, release handle acquisition; open rejects STALE, handle released once, invalidate waits owned snapshot. No returned path/bytes or getPath access. |
| bc15 pending open then shutdown drains once | shutdown synchronously stops/invalidates while fs.open pending; same Promise on repeat, old open STALE, late acquired handle closes once before shutdown resolves; new open/read/getPath refuse SHUTTING_DOWN. |
| bc16 active read may finish before normal close | Gate active positional read, call close; lease getPath now CLOSED; release read yields exact original data under same generation, then close occurs once, repeated close same Promise, successful record removed. |
| bc17 active read is stale after invalidation | Same active read gate, invalidate first; after release no bytes returned, STALE and owned close attempted, invalidate waits. Fresh generation open is the positive later case. |
| bc18 queued unstarted read rejects after close | Hold preceding owned task; enqueue read then call close synchronously; when queue advances, queued read rejects CLOSED without handle.read/allocation; release waits prior active work. |
| bc19 closing one tab preserves other lease | Two current descriptors, close one; other getPath/read succeeds and getGeneration identity unchanged. No all-window invalidation on single close. |
| bc20 successful close removes without tombstones | Valid absent close after prior success resolvesundefined/no I/O; read/getPath closed ID rejects CLOSED. Reopen path gets a new ID, not resurrected ownership. |
| bc21 failed close retains rejected identity and ownership | Fake close rejects EIO; first and repeated close are exact same rejected Promise, no second handle.close. getPath cannot return path/read cannot succeed. Later invalidate/shutdown reports retained release failure without falsely removing the failed record or automatic retry. |
| bc22 primary failure survives secondary release failure | Force metadata change or read native failure then inline close EACCES. Operation retains its primary CHANGED/native-mapped code; subsequent close exposes retained secondary mapped failure with same Promise and no extra close. Both internal causes retained; no raw path/stack/message is serialized. |
| bc23 all owned releases attempted before first failure | Multiple descriptors/opening leases; one release rejects, every other release is attempted; invalidate/shutdown waits all, then rejects deterministic first failure. Required deterministic ordering is frozen before acceptance, not chosen from completion timing. |
| bc24 repeated shutdown remains identical on failure | shutdown twice returns same pending Promise; after one release failure it remains same rejected Promise, no retry/cleared-fault result. close/invalidate remain usable under stop as ruled. |
| bc25 own shutdown ignores unrelated future global tail | Accept one finite A-owned operation; after A shutdown capture, enqueue B operation held indefinitely. A's shutdown resolves/rejects from its owned work without waiting for B's later held task; settle B explicitly before test teardown. |
| bc26 internal failure release cannot await its own queue | Read/initial-open failure triggers same-task release; record call order and controlled gates to show operation/release settles without waiting on a close task appended behind itself. No time-based “seems not hung” substitute. |
| bc27 late generation responses never publish | Fake final after-read handle.stat returns a manually gated Promise after bytes are filled. Invalidate while that stat is pending, then resolve the same stable metadata; await continuation must reject old open/read STALE with no leaked bytes/path and release ownership. Normal generation run returns actual data. No production hook is needed. |
| bc28 no prohibited filesystem path is used | Spies reject readFile/stat-by-name/realpath/PDF-content probe/reopen; no actual document filesystem reads. fs.open only normalized chosen path, positional I/O only captured owned handle. Exact lexical Windows/UNC acceptance does not claim native identity or file permission. |

Both invalid/open/close/range methods must return rejecting Promises rather than synchronous exceptions; getPath/getGeneration/stop boundaries are synchronous as ruled. Tests attach rejection observers before releasing gated work. Do not mutate process.platform, Number.MAX_SAFE_INTEGER, real global loader state or production exports to shortcut Windows/exhaustion tests. Windows-specific cases must actually run on the qualified Windows host.

Opposing detectors reuse the same assertions over test-local intentionally wrong observations: wrong returned byte66 instead of65; oversized backing buffer; a second overlapping active I/O; different repeated-close Promise; stale descriptor delivered; false removed record after close failure. Assert those observations fail the same detector, then actual module output passes. Wrong fixtures are test-only; full source-counterexample mechanism/bytes must be frozen for any source variant, never silently change the real baseline. Exact source-error and race controls belong inside the admitted qualification phase under SR44, not a false pre-phase execution claim.

## Proposed coherent split and exact command

The28-control lifecycle/ownership contract is too substantial to promise implementation, test authoring, race qualification, two reviews/docs/Git in one uncalibrated50m wave. **Propose two dependent source-only cuts for Brain approval**, not automatically allocated time:

1. **IC-T test-only preparation:** add only tests/businessRead.test.js; freeze all control fixtures/detectors/commands and collect actual missing-module assertion red on the accepted W parent, with successful collection. Independently review test contract and preserve local test-only ancestry/receipt. No read.js/constants edit or accepted controller/API claim. No fabricated stub exports. Exact unresolved test seams below must close first.
2. **IC-Q full controller qualification:** actual parent is that exact reviewed test-only checkpoint. Add full read.js plus one constant/export; implement the **entire ruled API/behavior**, run all required original/opposing/prescribed controls and ordered compliance→quality→docs, then exact held checkpoint. No accepted partial lifecycle API or reduced test list. If cap prevents completion, preserve local PARTIAL and STOP for a fresh scoped continuation; I-D cannot consume an unqualified controller.

This proposed split requires Brain's explicit approval and fresh cut-specific limits before source work. It does not reuse R/W clocks or silently grant≤60m twice. Both cuts individually≤60m/40aggregate calls, including all workers/reviews/docs/Git/receipt work. No API stub or public half-interface is exposed at either stage; the module remains unregistered/inert throughout.

PowerShell7, exact accepted Node24.14.1/qualified existing dependencies, accepted worktree/current directory, only after separate consumed admission:

```powershell
& 'C:/Program Files/nodejs/node.exe' './node_modules/vitest/vitest.mjs' run tests/businessRead.test.js --maxWorkers=1
```

Base plus new frozen test: exact exit1, intended in-test missing-module assertions and successful collection; no real file read/error as red. Same exact command after full implementation: exit0, all28 named/control subcases present with raw fixture/outcome evidence, no omitted race. After source exists, serial syntax gates expected0:

```powershell
& 'C:/Program Files/nodejs/node.exe' --check main/business/read.js
& 'C:/Program Files/nodejs/node.exe' --check main/constants.js
```

One Node worker at a time; outer try/finally preserves/restores prior process-local NODE_OPTIONS and applies `--max-old-space-size=2048`. It caps JavaScript old space, not all memory. No install/full suite/typecheck/build/package/native/Electron/window or real controller file-I/O invocation. Capture exact argv/cwd/env/shell/source/test/fixture hashes, stdout/stderr/exit and all case/subcase names. Every repair uses new retained output names; at most two identified in-fence repairs within the actual remaining cap, no replay over failed evidence.

## Failure, acceptance, checkpoint and later holds

Source drift, unresolved test seam, unknown ownership, unexpected filesystem effect, unhandled rejection, missed release, nonqualifying red or external output collision: preserve evidence and stop to Brain. No auto retries, cleanup/reset/stash/prune, policy weakening or oracle change. An unreleased close failure remains owned and failed, not a success/absence claim. Rollback is an authorized item-specific revert after custody disposition, not erasing partial work/receipts.

Before accepting IC-Q: all frozen controls actually executed under the named shell with prescribed/opposing receipts, final exact bytes reviewed by actual host standard specification-compliance role, THEN Plato quality, THEN Marcus epic state/journal. No mock PASS from source inspection alone. Stage only the three source/test paths and exact two epic docs; preserve accepted R/W/frozen fixtures/perf/tmp/source hashes and complete diffs/stat. Keep red test-only ancestry. Commit/push only under separately admitted Business refspec **HEAD:refs/heads/eb/blurby-business-1**; never main merge/provider/terminal/phase/HB6 completion. Any changed source invalidates affected prior receipt/review coverage.

I-C acceptance qualifies only the inert controller/policy under mocks. No actual grant provenance, sender/full-URL/frame identity, bridge types/error transport, native File provenance, R documentOpened ack, quit wiring, renderer range adapter, CSP/worker behavior or real handles/window/profile/native/package is qualified. I-D remains atomic handler/preload/types/quit work; Task4 retarget and all renderer/preload/assets/scratch/native gates still precede ANY real Business launch.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | IC-T fixtures and all argument/byte/ownership/race/opposing detectors are frozen and actual base red collected | calculable | test-preparation | bounded | high | 26m | — | — |
| 2 | IC-T independent test review and retained local partial test-only receipt close the bounded preparation cut | calculable | review-checkpoint | bounded | medium | 7m | — | — |
| 3 | IC-Q complete inert controller/constant satisfies exact global queue/generation/release/error contract | calculable | file-controller | bounded | high | 30m | — | — |
| 4 | IC-Q full original/opposing controls and syntax results qualify final bytes | calculable | qualification | bounded | high | 12m | — | — |
| 5 | IC-Q ordered independent compliance/quality/docs and exact held checkpoint preserve all exclusions | calculable | review-checkpoint | bounded | medium | 9m | — | — |

**Total:** prospective serial chain84m · sum84m; 0of5 estimates calibrated. Proposed IC-T33m and IC-Q51m are planner estimates, not measured medians, historical120m reallocation, clocks or an ETA. No parallel group/timebox. The actual per-cut≤60m/40-call allowance and stop reserve are separately Brain-admitted; exhaustion means partial hold, never skipped controls/reviews. Mechanical qualified U10 remains parent-owned/pending.

##### Lessons applied

Current roster/status chronology through LL-175 was considered; this paragraph is semantic application, not mechanical U9 PASS. No promoted/retired entry regains live status.

- LL-002/003: inert isolated CommonJS controller, no main.js/IPC monolith or public stub interface.
- LL-031/109/169: generation/currentness checks before/after async work; owned pending-open/retained failed-handle lifetime survives cancellation. Inline same-task release prevents self-await; explicit normal-close versus invalidation tests separate their semantics.
- LL-063/066/068: isolated exact accepted parent, observable original caller errors, protected bytes/diffs and preserved partial checkpoints. Ruled source-only scope does not claim build/package acceptance.
- LL-087/088/090: read accepted actual module/spy patterns, fixed initialized main constant, single module-global queue/ID owner; no duplicate per-controller queue mistaken for the global bound.
- LL-092: retained failed ownership is deliberate protocol state, not an invented evictable cache; no tombstones or cache replacing actual handles/metadata.
- LL-096/097/098/113/137: opt-in mock controls only, deterministic retained external evidence, failed outcomes preserved with raw identities/UTF-8, no scratch discovery or production logging shortcut.
- LL-118/128/139: exact new-target absence and small CJS import boundary; no full-file reader/launcher/Electron dependency or unsafe imported helper.
- LL-134: split pricing is uncalibrated; separate caps/partial stops govern, not automatic allocations or elapsed forecasts.
- LL-142/143: mock/structure/label is not native/provenance proof; actual prescribed/opposing named-shell receipts qualify the source checkpoint under SR44, not a fake pre-phase PASS. Current rule44 annotation/status is preserved.
- LL-144/145: exact accepted W→test-only→controller ancestry and verbatim rulings remain inputs; ordered independent review of final bytes, no recomputed main base or whole-epic acceptance.
- LL-162: every accepted/error/metadata/race shape has explicit controls; finite mock coverage is not exhaustive real filesystem qualification.
- LL-172/174: no timing-helper backfill; actual external caller APIs and fs module-object calls are tested through their real boundary, not detached pure copies.
- LL-175: accepted Business PDF/generator/tmp bytes stay untouched; no whitespace policy exception or fixture regeneration used to qualify JS.

Standing rules37/39/40/41/42/43/44/45/46/47/48/49/50/51/52/53/54/55 apply through current promoted guards: exact ownership/fences/input pointers, causal/opposite receipts, preserved statuses/oracles, real quiet host, deferred full/package/native gates and no provider/terminal permission. LL-006's atomic production JSON writer is not used by this read-only module; external evidence still follows its separately frozen recorder integrity contract. LL-132 child kill fakes, LL-157/159 production quit/drain integration and LL-165/168 real profile/installer checks remain later, not exercised by I-C.

Other live families considered and not implemented here: LL-004/007/008 and014–034 except031 (CI/CSP/React/DOM/reader/audio); LL-065/067/069–086 (format/layout/anchors/keyboard/URL); LL-089/093–095/099–108/110/111/114–117/119–127 (patches/refactors/auth/model/IPC/text/streaming/audio/cache); LL-129/131/133/140/150/152/154/155/160/161/163/170/171/173 (bulk docs/dead-code/charter/parity/assets/live latency/provider/word/canonical/audio-fake work). Their relevant later native/application gates remain held. Parent must reconcile the exact live-ID census/mechanical U9 before Ready; range notation here is a scoped semantic roster decision, not proof of helper acceptance.

## Exact remaining planning clarifications / five findings

**Specification NOT READY:** close these finite mechanisms before implementation, not by executor guessing: (1) forged/foreign object-shaped generation-token validation/error; (2) deterministic first-release-failure order; (3) malformed bytesRead return classification, distinct from0→EOF and thrown native errors; (4) exhaustion boundary control without production test hook/global mutation; (5) a pending-open close test's reserved ID observation without a new exported accessor; (6) Brain approval of IC-T→IC-Q split and recorder/test commands/output schema. Candidate mechanism for pending ID is per-fresh-module known sequence across observed successful reservations; boundary/source-gate test artifacts need exact separately reviewed bytes rather than an unapproved public injection API. These are technical control seams, not new user design choices.

Prerequisites: actual accepted W post-R parent is still needed; do not wait for I-D or block independently admitted R/W. Repository: exact final source parent/new-target absence/protected hashes/branch/worktree ownership and test-only ancestry remain fresh-read obligations. External register: existing epic only, no Seq/status change; final parent pointer/readback is separately owned. Environment: actual host/dependencies/resource slot/evidence-root ownership/immutable input consumption plus mechanical U9/U10/ordered planning review remain pending. No phase Ready or admission follows from this draft.

Only this new planning document is authored. No source/test/runtime/helper/Git mutation/provider/executor communication performed. Root owns review/publication; Brain alone resolves the listed technical seams and separately admits execution.
