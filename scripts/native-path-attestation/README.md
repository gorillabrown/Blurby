# Native path attestation

This is the external tools bundle for `NATIVE-PATH-ATTESTATION-1`, stage `A-TOOLS-STATIC`.
The capability is `native-path-attestation/runtime-own-data/v1`. These tools observe
owned process data and object identity before input. A successful observation does
not qualify reading behavior, Foliate, product quit, packaging, a merge, or release.

## Current authoring state

**HOLD — incomplete source bundle, no operational qualification.** The thirteen
source paths are being authored in the isolated tools checkout. No process grant
is active. Do not treat the existence of a file, exported constants, the result
schema, a manifest hash, or a queued technical question as successful execution.

The driver currently provides constants, the finite case catalog, closed author
input/admission validation, literal native position pins, source-only freeze
generation, immutable runtime-copy source, exact-byte/hash/path helpers, exclusive
atomic artifact publication, append-only budget primitives, static-input
verification, the static-controls wrapper, result validation, and the literal
custody program. These source paths are unexecuted and not qualified. The full
CLI dispatcher, admitted matrix/canary orchestration, retained-child/IPC/custody
transport and lifecycle wiring remain unimplemented.

The binding capability HOLD is missing authoritative evidence that
`FILE_ATTRIBUTE_REPARSE_POINT` (`0x00000400`) is clear on **every existing host path
component**, from volume root through the selected leaf or real ASAR container.
Node `lstat().isSymbolicLink()` and `realpath()` supply narrower checks. They do not
prove the all-reparse requirement. The direct driver guard and each freeze,
preparation and input-dependent static runner stop at this missing-proof boundary
with HOLD/exit2, reason INPUT_PIN/stage PRECHECK. No accepted inputs are published.
PATH_ALIAS is reserved for an actually detected disallowed alias or reparse state.

The parent consumed Brain's consolidated rulings (SHA256
`f220024802ceed60a32e45ca670041f6a536ac46e14f2a30da18c6cc7f448a36`)
and binding reparse disposition (SHA256
`a4b4d098b8b8087c57b66256bc9996800367e1bd4e7ed8cfe6054d1d1efcfab4`).
The four earlier questions are resolved: executor-selected closed author schema;
actual getters on ctx.getDataPath, queue exports.initSyncQueue and engine
exports.initSyncEngine; child wrong-filename causal DIRECT_EDGE_MISSING while
root wrong-filename remains MODULE_FILENAME; immutable source/config roots
separate from mutable runtime and result roots. The current catalog follows those
decisions. Do not infer a process grant from them.

A future attribute mechanism needs separate contract/review/admission: documented
attribute source (for example GetFileAttributesW), finite component bounds,
identity/freshness, exact allowed paths/fields, own-component reads before
traversal, failure semantics, placement before writes/S0/S1 and unchanged or
explicitly amended process/IPC/deadline limits. INVALID_FILE_ATTRIBUTES or failed
reads mean unavailable proof, never a clean path. Planned nonexistent descendants
remain plans; prove every existing ancestor. No undocumented Node binding, addon,
download, shell-out, inline compilation, new OS probe/helper or custody-protocol
extension is authorized in this stage.

## Authority and source custody

The normative specification is the complete native section of `ROADMAP.md`,
including G1–G8 and Review Focus. Its external technical contract is:

`C:/Projects/Blurby/docs/planning/roadmap-reviews/2026-10-27-native-final-technical-contract.md`

SHA256: `235491ce4948ddd52ae428cb610f1320c1b11e2dbbe3be69936893caafaecdd6`.

The external read-only Zeus protocol is
`C:/Projects/Blurby/.codex/agents/zeus.toml`, pinned to
`3bdbe18856ebce3672870fa5f242df532fd3c4adc7bff63608bb1a180c38335b`.
Absence or drift is HOLD; no fallback, repin, or configuration copy is permitted.
Parent admission determines the actual root, base commit, branch and current
freeze. The historical planning baseline is not execution authority.

Only these thirteen repository paths belong to this bundle:

| File | Responsibility |
| --- | --- |
| README.md | Operator contract and truthful readiness handoff |
| collector.mjs | Shared DATA/location predicates, source tokenizer and bounded two-snapshot collection |
| runtime-client.mjs | Owned CDP connection, opaque handles, fixed RPC whitelist and duplicate-key parser |
| driver.mjs | Constants, freeze/prep/controller/custody orchestration and durable evidence |
| static-controls.mjs | D01–D22 and L01–L11 against the collector's same predicates |
| fixture-entry.cjs | Real root Module, private inherited IPC and finite control dispatch |
| fixtures/main.cjs | Main-family targets, lexical cells, actual app binding and independent probes |
| fixtures/engine.cjs | Engine-family targets, ctx/sync-state cells and real queue require |
| fixtures/queue.cjs | Queue-family targets, queue-path cell and independent probes |
| fixtures/foreign.cjs | Text-only variant/copy specifications |
| fixtures/dummy.cjs | Distinct actual required Modules for MAX128 |
| bundle-manifest.json | Ordered hashes of the other twelve files, constants and finite catalog |
| result.schema.json | Closed JSON Schema Draft 2020-12 result union |

All generated files and receipts belong outside the repository, under:

`C:/Projects/Blurby-artifacts/native-path-attestation-20261027`

The bundle manifest excludes itself. Its own exact stored-byte hash is pinned by
external review and the frozen input/admission. Rebuild the manifest only after
the other twelve source files are stable; a source edit invalidates its record.
Never use a self hash, fabricated hash, null prefreeze hash or normalized-byte
comparison as source custody.

## Stage boundaries

The initial authoring stage permits exactly the source bundle, separately reviewed
built-in Node syntax/pure execution, frozen source/position/case/request manifests,
and the thirty-three static controls. It forbids fixture loading, aliases or
junctions, runtime copy/install, npm, Electron, a custody helper, a native launch,
application input, profile/cloud access, application source changes and main merge.

Before any controlled process, require all of the following:

1. Thirteen stable source files and all twelve manifest records independently reviewed.
2. Reviewed no-top-level-side-effect and static/freeze no-spawn paths.
3. Actual freeze output, source-position agreement, all thirty-three controls and
   subassertions, getter count zero, and actual-code request-site accounting.
4. Independent spec/compliance, protocol/privacy/custody and exact-byte review.
5. A separately admitted complete runtime copy, exact parity readback and a
   separate matrix grant explicitly allowing its custody helper and descendants.

The only modes are `node-fixture-core`, `electron-fixture`, and `native-package`.
No mode, retry, helper or process slot is an implicit fallback. Matrix qualification
precedes a separately admitted, single native canary. Stop after the first complete
two-population PASS. A second run requires one evidence-led correction, fresh review
and a new grant; a second failure is capability HOLD. Never repeat the canary.

A grant binds its exact tool commit, bundle/input hashes, roots, nonce config,
expiry, stage, run identity and consumed budget. One frozen orchestration nonce is
not reusable permission. Consume budget durably before a permitted launch; preserve
failed and partial records. Maximum cumulative budgets are two matrices, four
direct fixture populations, three custody helpers, sixteen live owned runtime
descendants per root, and one native canary. Unused slots cannot be converted.

## Command interfaces

These are the required final interfaces, **not commands authorized by this file**.
Current unimplemented driver commands remain held as stated above. A future
admission supplies absolute `toolsRoot`, `admissionRoot`, `artifactRoot` and
`reviewRoot`; unresolved placeholders block execution.

```powershell
& 'C:/Program Files/nodejs/node.exe' "$toolsRoot/scripts/native-path-attestation/driver.mjs" freeze --input "$admissionRoot/freeze-input.json" --out "$artifactRoot/frozen-inputs"
& 'C:/Program Files/nodejs/node.exe' "$toolsRoot/scripts/native-path-attestation/static-controls.mjs" --manifest "$toolsRoot/scripts/native-path-attestation/bundle-manifest.json" --inputs "$artifactRoot/frozen-inputs/inputs.json" --report "$reviewRoot/static-controls.json"
& 'C:/Program Files/nodejs/node.exe' "$toolsRoot/scripts/native-path-attestation/driver.mjs" prepare-runtime --admission "$admissionRoot/prep.json" --inputs "$artifactRoot/frozen-inputs/inputs.json"
& 'C:/Program Files/nodejs/node.exe' "$toolsRoot/scripts/native-path-attestation/driver.mjs" matrix --admission "$admissionRoot/run1.json" --inputs "$artifactRoot/frozen-inputs/inputs.json" --out "$artifactRoot/run1"
& 'C:/Program Files/nodejs/node.exe' "$toolsRoot/scripts/native-path-attestation/driver.mjs" canary --admission "$admissionRoot/canary.json" --inputs "$artifactRoot/frozen-inputs/inputs.json" --qualification "$reviewRoot/matrix-disposition.json" --out "$artifactRoot/canary1"
```

All switches are mandatory once, unknown/duplicate switches fail. No PATH resolver,
shell expansion, install, HTTP target discovery or fallback runtime is allowed.
Existing output roots, reparse points and failed artifacts are preserved with HOLD.
Run2 uses fresh `run2.json` and `run2`, never a reused run1 output.

Exit codes: `0` only verified PASS; `2` HOLD/precondition;
`3` qualification/canary failure; `4` cleanup or absence failure.
Preserve primary and cleanup faults independently. Write reviewable receipts before
returning the disposition when the observed shape and known pins permit a receipt.
Never fill missing observed fields with expected values.

## Literal protocol and observation boundary

A child is started only with an absolute pinned executable, `shell:false`, a
retained ChildProcess, and an actual UTC/monotonic spawn bracket. Its own stderr
provides exactly one canonical `ws://127.0.0.1:<port>/<UUID>` endpoint. Bind the
endpoint UUID to its child PID, executable hash, run nonce and bracket. Fixtures
also prove the nonce/PID through private inherited IPC. The native app does not
echo a harness nonce and never receives fixture IPC.

The only evaluate expression is seven ASCII bytes, `process`. The method whitelist
is `Runtime.evaluate`, `Runtime.getProperties`, `Runtime.callFunctionOn`, and
`Runtime.releaseObjectGroup`, with the exact arguments in the contract. The three
literal function bodies are exported in `driver.mjs` and independently repeated
in the transport whitelist; byte equality is a pre-process review requirement.

Only own DATA descriptors pass. No getter, initializer, probe invocation, cache
fallback, prototype fallback, Debugger, pause, input, extra application call, raw
CDP response or handle identifier is persisted. Duplicate JSON keys, stale or
unknown RPC IDs, malformed objects, proxies and over-cap messages fail closed.
The only app observation is the once-only userData/isPackaged pair after complete
S0 graph, family, grammar, paths and tuple-uniqueness acceptance.

Each snapshot freshly selects four Module roles, two arrays, actual ctx, nine
target functions, app when applicable, and the three initialized path cells.
Native root and main-family are two named roles sharing one actual Module.
Prove real reference identity with sixteen Node or seventeen Electron/native
ordered comparisons. Object IDs and source coordinates do not prove identity.

Independent probes choose the unique precomputed D/F/P/B coordinate rule. Targets
never determine expected coordinates. Source bytes are strict UTF8 with no BOM or
NUL; LF/CRLF and UTF16 offsets are preserved. A declared native source hash is a
static pin, not proof that cryptographic bytes were observed loaded in a runtime.

## Finite schedule and clocks

Caps and deadlines are literal `LIMITS`, `DEADLINES` and `REQUEST_SCHEDULE` exports
and are pinned by the bundle manifest. The conservative per-snapshot bound is
304 RPCs, including fresh process evaluation and versions. At most three S0
attempts, nine independent probe metadata reads per attempt, one S1, three group
releases, four tuples, seventeen comparisons and one app pair give 1268 requests;
Node omits one comparison and the pair, giving 1266. MAX128 one-attempt bounds are
640 Electron and 638 Node. These are bounds, not measured timing or actual-code counts.

A single absolute 10000 ms monotonic deadline covers connection, RPCs, startup
backoffs, fixture barrier ACKs, both snapshots, comparisons, release ACKs and the
two-way socket close handshake. RPCs wait at most min(2000 ms, remaining);
connection/barrier waits at most min(1000 ms, remaining). Nothing resets the clock.
At most eight independent requests are sent in fixed index-order batches.

Only DELAYED_INITIALIZATION uses fixture startup pending. It must observe pending,
release its attempt group, then trigger the once-only initialization barrier and
observe success on a later attempt. Other settled negatives never retry.
Incomplete S0 spends no tuple or app calls. Release a group at most once; handles
never cross released groups. Cleanup after expiry is mandatory and cannot turn a
failure into PASS.

The real matrix contains eighty-eight ordered cases per population, round-robin
Node then Electron; FINAL_RESTORED runs last. Node's two app-only cases are N/A;
every other case must execute. The fifteen lexical path cases use distinct IDs
`PATH_DATA_*`, `PATH_QUEUE_*`, `PATH_SYNCSTATE_*` to avoid confusing the lexical
QUEUE_MISSING control with the graph QUEUE_MISSING control. Each negative must
reach its declared causal reason and release/close successfully. A parser,
transport or deadline failure never counts as the intended rejection.

Each population has a 1200000 ms charged-work ceiling; both roots and the
controller share a single absolute 2450000 ms wall ceiling. Fixture teardown
requires SHUTDOWN ACK within 1000 ms, exit within 3000 ms, then bounded owned force
cleanup if needed. Any forced fixture stop fails qualification.

A native canary must survive at least 25000 ms without unexpected exit, application
error or dump. Observation ends by 35000 ms; lifecycle ends by 45000 ms, followed by
at most 10000 ms metadata finalization. It permits one declared force termination
of the retained owned root, records FORCE_TERMINATED and always records
`productQuitQualified:false`. This is never a product successful-quit claim.

## Windows custody

The only custody helper is the literal constant PowerShell program embedded in
`driver.mjs`, passed as UTF16LE EncodedCommand to the absolute admitted
`SystemRoot/System32/WindowsPowerShell/v1.0/powershell.exe`. Freeze/admission pin
both its executable and program hashes. No extra script file, helper replacement,
taskkill, bare-PID stop, WM_CLOSE, arbitrary command or arbitrary path is permitted.

The helper verifies the frozen config hash before READY. Its private protocol
accepts only REGISTER, SNAPSHOT, STOP_OWNED, ABSENCE and EXIT. It retains Process
and SafeHandle identities with actual .NET UTC start ticks, exact executable hash
and a proven parent chain. Candidate CIM metadata is ephemeral until ownership is
proved. Parent PID alone, a reused PID, unknown/intermediate parent or an ambiguous
creation interval is HOLD and never permission to kill. The helper kills only
proved descendants; the driver retains responsibility for its direct child.
Stage-specific snapshot caps remain 2500 for matrix and 45 for canary.

The current literal program is **authored, unexecuted and independently unreviewed**.
Its existence grants no custody capability. No helper transport, spawn, periodic
scheduler or lifecycle controller has yet been wired.

## Runtime and profile custody

Node is exactly 24.14.0 arm64 at `C:/Program Files/nodejs/node.exe`.
Electron is exactly 42.11.18 arm64 copied once, completely, from the pinned held
worktree distribution to `artifactRoot/runtime/electron-42.11.18-arm64`.
Use complete source-before/source-after/destination file/size/hash parity, including
DLLs, locales, resources and licenses. No Electron41 fallback, recopy, normalization
or custom default app is permitted. All mandatory executable, distribution, ASAR
and three family pins are exported by `driver.mjs`.

Writable outputs and fixture scratch paths must be exact admitted new descendants
of the artifact root. Reject UNC, device paths, relative paths, dot segments,
trailing-dot/space aliases, short-name disagreement and reparse ancestors. ASAR
member paths are virtual: prove the real admitted container and host ancestors,
then exact case-sensitive entry suffixes. Never realpath a virtual ASAR member.

Child environments contain only admitted SystemRoot/WINDIR and owned home, temp,
roaming/local and scratch userData paths. No inherited PATH, NODE_OPTIONS,
ELECTRON_RUN_AS_NODE, secrets, cloud/auth/proxy configuration or arbitrary BLURBY
variables is allowed. Fixture private IPC and nonce are fixture-only.

Before a native canary, hash only the predeclared normal protected files and
enumerated adjacent backup/temp siblings; do not parse, clone or display content.
Store exact bigint `mtimeNs` and dev/ino identity decimal strings. File nanoseconds
are not process .NET startUtcTicks. Preserve absence and compare the complete
before/after set after owned absence. Any change remains visible; never restore
or delete it to manufacture unchanged status.

## Receipts and independent review

`result.schema.json` is the literal closed union for static, collection, matrix and
canary receipts. All result objects reject additional fields. Partial collection
receipts contain nulls or actual ordered prefixes only; expected values never
stand in for unavailable observations. Complete PASS requires all applicable
observations, true tuples/comparisons, acknowledged release/close and no overrun.
A collection need not prove population absence; matrix/canary must prove full
root/descendant/helper absence.

Expected negatives remain FAIL collection receipts; the matrix records
EXPECTED_REJECT with the exact causal reason and a hash of that receipt.
No raw stdout, stderr, CDP payload, user content, module cache or unselected
filename inventory belongs in the receipt JSON. Separately permitted content-free
logs have their own immutable manifests/hashes.

Artifacts use sorted-key UTF8/LF JSON, exact stored-byte SHA256, async exclusive
temporary creation, complete write, file fsync, close, then rename to the absent
final. Preserve temporary and partial artifacts on failure. There is no Windows
directory-fsync claim. A single serialized budget writer appends, fsyncs and
confirms durable content before spawn; it never rewrites a consumed record.

The source schema also has explicit driver checks for sibling numeric ordering,
equal assertion counts, equal acknowledged release counts, and expected frozen
values/receipt linkage; JSON Schema does not compare arbitrary sibling values.
Independent review must evaluate these checks and the actual final code, not just
whether JSON parses.

One unqualified precheck edge remains: invalid collector configuration may return
an object with no frozen externalSourceHashes, while the result schema requires
the three actual frozen pins. Do not publish that object as a valid collection
receipt or fill it with invented pins. This checkpoint does not qualify malformed
input receipt construction; the final dispatcher must surface an unavailable-pin
precondition without counterfeit observations.

Parent owns governing-document/register closeout and completion markers. This
bundle is not complete, published or qualified at this checkpoint. No commit,
main merge, fixture/helper launch, runtime copy, native observation, package
confirmation or release has occurred.


## Closed freeze author input and generated mapping

The authoring interface is implementation-local, not a grant. It has exactly six
required keys, no defaults and no caller-defined roots/caps/cases/modes:

| Key | Type and bound | Validation and output provenance |
| --- | --- | --- |
| schemaVersion | literal string npa.freeze-author.v1 | Author-interface version only |
| toolCommit | 40 lowerhex characters | Must equal the actual isolated checkout HEAD read from Git metadata without a Git subprocess; never label an unchanged base HEAD as an implementation commit |
| runNumber | integer 1 or 2 | Selects the fixed run1/run2 source/runtime/result plans; does not consume or authorize a process slot |
| systemRoot | absolute local Windows path, 1–4096 UTF16 units | Must match the current admitted SystemRoot and fixed System32/WindowsPowerShell/v1.0/powershell.exe location |
| normalDataRoot | absolute local Windows path, 1–4096 UTF16 units | Must equal the parent's APPDATA plus blurby/blurby-data; records a plan only, with no owner-profile file reads during authoring |
| custodyExecutableSha256 | 64 lowerhex characters | Compared to exact stored bytes of the fixed system executable; no alternate executable or helper is permitted |

Unknown, duplicate, malformed or conflicting fields fail. The source validates
strict UTF8 without BOM and duplicate JSON keys before reading these fields.
Chronology is resolved by the 2026-10-27 candidate-commit ruling: only an
independently reviewed LOCAL capability-held/test-pending candidate may precede
freeze. Freeze remains blocked by authoritative all-reparse evidence; no
publication or completion follows.

The source generator derives hashes, file inventories and positions from actual
static bytes. It compares the three native families with the literal eighteen
function D/F/P/B tables and prescribed package/executable/distribution pins.
It reads the supplied four text copies as text only. It does not import fixtures.
Its proposed output mapping is:

- sourcePins records the copied package-source-manifest bytes/hash, native family
  source bytes/hashes/positions and copied package.json text pin.
- runtimePins records the fixed Node executable, complete supplied Electron and
  held package file inventories, and admitted SystemRoot. A runtime copy is a
  separate future preparation operation.
- custodyPins records the fixed helper executable hash, UTF16LE literal-program
  hash, one generated config path/hash, and the unchanged maximum of three.
  The config contains one cryptographic 32-lowerhex orchestration nonce.
- generatedFiles inventories every emitted source/config/static manifest with
  exact relative path, size, SHA256 and explicit require edges. Terminal
  inputs.json is excluded from its own inventory; its actual stored-byte hash is
  computed afterward by the static runner. There is no self-reference.
- cases is the finite ordered eighty-eight-row catalog, with the three authorized
  wrong-child-filename causal corrections.
- requestSchedule points to the separately stored conservative schedule manifest.
  Actual-code request-site/batch accounting remains an independent uncompleted
  review gate; constant arithmetic does not claim that review.
- modeConfigs records one planned matrix's two immutable code/config roots and
  separate mutable runtime/result plans, plus the fixed held-package canary plan.
- normalProtectionPlan contains only the resolved planned normal root, fixed
  protected filenames, adjacent-name policy, optional metadata names and units.
  Actual protected-file metadata/hashes are canary-stage observations.

For run1, immutable sources/configs are under
`freezeRoot/populations/run1/{node,electron}`. Mutable scratch roots are under
`artifactRoot/populations/run1/{node,electron}`, with only cwd/, user-data/,
roaming/, local/, home/, temp/ and controls/ planned there; dataRoot is
user-data/blurby-data. Matrix resultRoot is artifactRoot/run1. Freeze creates no
mutable runtime/result trees. Requires/module filenames resolve from immutable
codeRoot, while cached path cells refer to runtimeRoot. These trees do not alias
or contain one another. Existing leaves remain preserved with HOLD.

Each population's immutable tree contains baseline and three static family
variants, byte-identical foreign families, 113 root dummies and 127 engine dummies,
the actual entry and its closed config. The missing-witness variant retains one
truthful static probeSync declaration inside an unused enclosing function outside
the target lexical chain; it never calls that holder or substitutes an observed
witness. Every variant gets its own actual source hash/coordinates.
No source/config is relocated or rewritten during a later runtime run.

This generator and immutable-copy source are retained for review under the
capability guard. Neither has been executed. The guard is not a qualification
substitute, and this document does not claim their complete runtime correctness.

## Authoring metadata

The parent verified the worker role `driver_schema` ran on actual
`gpt-6.1-sol` with `high` reasoning in rollout
`01a1806c-8f7a-7c03-aca3-6cff31590bcb`.
Sibling roles `pure_core` and `transport_fixtures` own their separate files;
this worker does not change them. Parent retains the complete dispatch/runtime
evidence and each readiness hold.


## Local candidate identity — capability held

Brain's ruling permits a reviewed, clearly labelled LOCAL checkpoint commit on `eb/native-path-attestation-1` before static freeze solely to identify the implementation under test. `inputs.toolCommit` must be that actual 40-hex candidate commit; record the governing base separately. Independently read back HEAD, tree and all thirteen committed blobs and prove their bytes match the working bundle and manifest's twelve records. A commit ID or matching ref alone is insufficient. The checkpoint is test-pending and capability-held; it makes no stage PASS, publication, merge, completion or release claim. Do not put the candidate hash in this README because that would self-reference the bundle.

Any change to any of the thirteen files requires a new candidate, fresh committed-blob correspondence, and a new preserved external freeze root; never amend or rewrite a prior candidate or frozen identity. Freeze remains blocked until every precondition is met, including resolution of the actual reparse-capability HOLD. Existing timeboxes and process gates are unchanged.

Preserved source defect: the embedded custody program skips candidates whose
parent was never retained; if ever activated, its records-only ABSENCE check could
falsely acknowledge absence while an unretained grandchild remains alive. This is
a MAJOR_REVISION requirement before runtime admission. The local candidate
exception grants no waiver or activation; current command guards remain held and
the runtime controller is absent.