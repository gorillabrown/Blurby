# BLURBY-BUSINESS-1 — HB6 Task3 IC-T repair1

**Planning draft; NOT Ready; no execution admission.** Recommendation: repair the three reviewed test defects in one separately admitted, test-only quiet-host phase, then retain an honest test-only checkpoint. This is not IC-Q, controller acceptance or epic completion. Brain alone coordinates executors and resources. Roadmap owns readiness, feed and closeout.

## Goal, authority and exact inputs

Correct cleanup restoration and admission-order evidence in the existing untracked `tests/businessRead.test.js`, without creating the production controller or broadening the test suite. Binding technical ruling: [Brain repair1](Brain.BLURBY-BUSINESS-1.HB6-T3-I-C-repair1.2026-11-02.md), complete actual message `exec-be8efab2-85f7-48ce-a8d1-d99f182e063f`, disposition `IC-T-REPAIR-1-20261102`; exact replacements: [Brain repair1 exact](Brain.BLURBY-BUSINESS-1.HB6-T3-I-C-repair1-exact.2026-11-02.md), complete actual message `exec-bf634acd-bfdd-435b-af0d-916ed81d7219`. Both authorize planning/scope only. The [full IC contract](Draft.BLURBY-BUSINESS-1.HB6-T3-I-C.2026-11-02.md) remains governing except for this expressly bounded repair phase and its three exact test changes.

Source parent remains accepted W `a5d22ea7307c84e87e672f4d7749dbd1a0115acc`, tree `7ae79d5dd92c121a8bb50b2f0a761bcc84476764`. No production change is present or authorized. The original IC-T exhausted **40/40 calls, CLOSED PARTIAL**; it is not reopened, replayed or retroactively accepted. All old evidence stays immutable under `C:/Projects/Blurby-artifacts/business-hb6-t3-i-c-t-20261102/`.

The actual stopped untracked test was read in full, all635 lines, from `C:/Projects/Blurby-artifacts/business-ic-t-repair-courier-planning-20261102/tests/businessRead.test.js`; independently computed raw SHA256 `44aeb13865375a39a1b042b636d097948e04f2a4c3ea00f4d17c921e5f6ed891`,40805bytes. Courier `chunks.json` records four contiguous chunks: offset0/12000bytes SHA `5a9abc0c777019d946c1a6fffc60755468064d9352e627db70177035cad16c66`;12000/12000 SHA `ee9efdb9404414d520c957c7a7efb0b48ff273d4f514f234c9da12cc5fe04829`;24000/12000 SHA `5a7b6aeae433350bde8539d89f91f18340a8ed0060b68495ea9821f2d1256adb`;36000/4805 SHA `e226aecdce3c32ebad884a9bf9b0a0f60cbe90f9c6e476eed525ac4632ee77db`. Initial oversized displays were truncated; the subsequent bounded reads supplied the complete source. No source import or test execution occurred in this planning review.

Complete review contents were read in courier `reviews-recorder-metadata.json`:

- Compliance `reviews/compliance.json`,1036bytes, SHA `cba63b3a60d2c4e1d85bb450471fe84d09e216a855e9aaeb6b4653d566a5c197`, identity `/root/ic_t_compliance`, WITH_CONCERNS SC-01: arbitrary preceding if/call is not admission proof.
- Quality `reviews/quality.json`,1927bytes, SHA `aa38a44b6ff9603f36be30b714c76395a0048a92ae7d6c7eda2aa603b03d3ec5`, identity `ic_t_quality`, REQUEST_CHANGES Q01/Q02: unexpected cleanup assertion skips restoration; same misleading AST predicate. Quality was provisional pending compliance.
- Both bind stopped test SHA44aeb… and candidate receipt SHA `dbe98900ef9266e1348518ed3eaa84e3e3384217a6ad3f39ce33d62a8ede6419`. Historical reviews remain findings, not acceptance of repaired bytes.

RecorderV2 metadata is known: `receipts/recorder.v2.json`,5508bytes, SHA `9f5b20c80a1f887da914bcac146c06b148661a5cdc170c005191cd9c14a29d07`; inline UTF-8 recorder SHA `21ae4e295e1cdb2f83d01a429d2d0493d51cddac43450458a7bdd50fe66e3831`. **Its complete body is not couriered/read here.** The qualified actual quiet-host artifact can be consumed as an input; metadata alone is not a claim of local body review or a newly qualified invocation. Historical integrity receipt SHA `b2d2a35cf37c94ad94935a6c742ab86cadae4484fb3a941f79d16c0ebc0ac884` retained actual exit7; red receipt SHA `cc846886b06b8171872e65e5de925afe59116f9690ae4224afdcf19c0f6ce212` retained actual exit1. Those are attributed historical facts from complete reviews/metadata, not reruns in this draft.

## WHERE and fence

Read in order: current AGENTS/shipped Zeus/Blurby overlays; live lessons through LL-176; frozen Business epic charter/plan/state/last journal/seed; accepted W and current full IC contract; both repair rulings above; full stopped test and complete actual reviews; qualified actual recorderV2 and its retained review/receipts. Inspect exact current working bytes before writing; offsets below refer only to the stopped635-line test.

**Only repository edit:** existing untracked `C:/Projects/bb-business/tests/businessRead.test.js`, exactly three regions below. Do not edit the planning courier copy. No new test, helper, mock implementation, production file, constant, package/lock/dependency, loader configuration, IPC/preload/type/renderer/main/quit, fixture or epic/governance file. Preserve all unrelated tracked/untracked bytes and the original test in external evidence. `main/business/read.js` stays absent; no controller stub is permitted. No source mirror or dependency install.

Execution host is the quiet machine, actual repository `C:/Projects/bb-business`, branch `eb/blurby-business-1`; shared Git common directory `C:/Users/estra/Projects/Blurby/.git`. These are known input identities, not current custody verification. Brain must return the exclusive shared test/Git windows and confirm fresh actual host/repository/branch/HEAD/dirt/tool pins/packet consumption before a separately admitted start. No everyday-host fallback. Preserve accepted W/source/fixture bytes, existing perf/PDF temporary dirt and other executor ownership.

## Exact changes — no investigation delegated to CLI

### R1: cleanup restoration, old lines147–167

Replace the entire existing afterEach with this approved function. Preserve every earlier helper and test assertion. Resolving gates and draining already observed pending promises precedes shutdown; every mapped shutdown is deferred into a Promise so a synchronous throw becomes a settled rejection and cannot abort attempts for later controllers. Nested finally blocks attempt all restoration layers. Unexpected failures stay failures; failed ownership is never relabelled successful closure.

```js
afterEach(async () => {
  const allowedCleanupErrors = new Set(expectedCleanupErrors);
  let cleanup = [];
  try {
    for (const gate of gates) gate.resolve();
    await Promise.all(pending);
    cleanup = await Promise.allSettled(
      controllers.map(controller =>
        Promise.resolve().then(() => controller.shutdown()))
    );
  } finally {
    try {
      vi.restoreAllMocks();
    } finally {
      try {
        if (moduleLoaded) {
          delete require.cache[modulePath];
          if (originalModuleRecord)
            require.cache[modulePath] = originalModuleRecord;
        }
      } finally {
        controllers.length = 0;
        gates.length = 0;
        pending.length = 0;
        expectedCleanupErrors.clear();
        moduleLoaded = false;
        originalModuleRecord = undefined;
      }
    }
  }
  for (const result of cleanup) {
    if (result.status === 'rejected')
      expect(allowedCleanupErrors.has(result.reason?.code)).toBe(true);
  }
});
```

### R2: accurately bound AST evidence, old lines261/265/270 only

Delete exactly these three lines from `assertAllocatorSource`:

```js
  const admissionBefore = [];
    if ((ts.isIfStatement(node) || ts.isCallExpression(node)) && node.end < reservation.pos) admissionBefore.push(node);
  expect(admissionBefore.length).toBeGreaterThan(0);
```

Add this comment adjacent to `openBody`/`queueSites`:

```js
  // bc02/bc11 prove argument/current-generation admission; this AST checks
  // allocator structure and reservation before enqueue, not admission semantics.
```

Keep the exact safe-integer guard/error/private-binding/sole increment/no-reset/write/export checks, single reservation, queueSites existence and reservation-before-every-enqueue assertions. Keep bc12 five opposing source-data fixtures and both formatting positives unchanged. This corrects evidence attribution; it does not loosen actual production admission ordering, introduce a test accessor, mutate Number, or execute source variants.

### R3: bc11 refusal consumes no ID, old lines481–482

Keep all preceding bc11 assertions, including open/stat/read failures consuming reserved IDs and the two-controller global counter. Replace ONLY its final invalid-path/nonconsumption tail:

```js
    await rejectCode(a.open('relative', a.getGeneration()), 'INVALID_REQUEST');
    io.queue.push(fakeHandle());
    let next = await open(a);
    expect(next.id).toBe(last + 1);
    last = next.id;
    const old = a.getGeneration();
    await a.invalidate();
    for (const token of [old, b.getGeneration(), {}]) {
      const opensBefore = io.open.mock.calls.length;
      await rejectCode(a.open(FILE, token), 'DOCUMENT_STALE');
      expect(io.open).toHaveBeenCalledTimes(opensBefore);
      io.queue.push(fakeHandle());
      next = await open(a);
      expect(next.id).toBe(last + 1);
      last = next.id;
    }
```

The old invalid-path ID check already exists and is retained. Old-generation, foreign-controller and fresh-object tokens must each refuse with DOCUMENT_STALE, no fs.open call and no ID consumed; the next legitimate open increments exactly one from last. Creating controller b reserves no ID. No private counter inference beyond these actual returned descriptors. Do not add other semantic changes.

## Frozen controls and evidence limits

Preserve all28 exact `it` names and each initial `load('bcNN')` boundary; preserve `describe.sequential`, fake-only FS, all original literals, API8-key contract and bc01–bc28 coverage. Static review compares the entire before/after test and confirms ONLY R1/R2/R3 plus their scope comment changed. At accepted W, `load` lines95–105 must still fail at its own `IC_T_MISSING_MODULE_bcNN` assertion before beforeImport, require, controller, parser or deeper opponent invocation.

Inside this separately admitted phase, first qualify the actual selected recorder boundary with its same raw-binary/exit calibration, including preserved exit7/opposite evidence; then run only the following existing exact unit command, cwd `C:/Projects/bb-business`, under that recorder:

```powershell
& 'C:/Program Files/nodejs/node.exe' 'C:/Projects/bb-business/node_modules/vitest/vitest.mjs' run tests/businessRead.test.js --maxWorkers=1 --reporter=verbose
```

Expected actual exit1, successful collection, exactly28 intended in-test missing-module assertion failures with bc01–bc28 names, no setup/import/transform/unhandled-rejection failure and no real-controller FS activity. The classifier remains the accepted V2 classifier. Record expected base-red failures as FAIL cases with qualifying expected/observed causal evidence, not28 functional PASS. An unexpected green, wrong error, collection failure, missing case or harness failure does not qualify.

The cleanup rejection/restoration path, generation ID nonconsumption assertions, semantic AST guard/opponents/formatting positives and every deeper controller/race/API behavior remain **NOT_RUN** behind the absent controller. Do not use a fake positive implementation to reach them here. IC-Q must separately admit and actually exercise cleanup failure/restoration and the retained deeper controls when the real controller exists. No full suite, syntax/typecheck/build, real files/handles/window/Electron/CIM/network/profile/package/native qualification. No IC-Q start follows from this repair.

One quiet-host Node process/worker at a time under Brain's returned exclusive test slot. Child-only `NODE_OPTIONS=--max-old-space-size=2048`; TEMP and TMP equal the fresh root's `os-temp/`. Preserve prior process-local environment in outer try/finally and restore on every outcome. Two GiB limits JavaScript old space, not total host memory. Invoke fixed argv with `shell=False`, explicit cwd/environment and raw binary stdout/stderr, `check=False`; no shell-built child command. Use the actual accepted Python/Node/Vitest/parser inputs from full IC contract, reverified without install or exploration. Interpreter is `C:/Python314/python.exe`; the inline driver is passed on stdin, not written as a new helper script.

## Fresh root, recorder and finite output manifest

Exclusive prospective root: **`C:/Projects/Blurby-artifacts/business-hb6-t3-i-c-t-repair1-20261102/`**. Require it absent before its exclusive creation; after creation verify retained ownership and children, never demand absence again or delete/recreate it. The old root and courier are immutable inputs. No outputs elsewhere except the one repository test and its local Git checkpoint.

Consume the qualified actual V2 artifact and full inline body on the quiet host, verify both raw identities stated above and retain a hash-bound input reference. If V2 can target only the fresh root without byte changes, retain that exact version. If its root/output IDs are hardcoded, author preserved inline **V3** inside this admission, before invocation, using ONLY the authorized old evidence-root literal/output-ID substitutions to this fresh root/manifest. Freeze exact UTF-8 body/hash and a literal before/after diff whitelist; every changed hunk must be solely those substitutions. No guessed replacement count. Fixed executable/argv/env discipline, classifier, binary capture, error/security logic and publication semantics stay unchanged. Any other needed change is STOP to Brain. Never modify V2 or historical reviews/receipts. Do not run an old hardcoded-root driver and hope it writes into the new root.

Before the first invocation, bounded side-effect/closed-path review must read the actual selected body and exact diff, verify it can produce only this finite manifest and preserve every failure, and record its acceptance. This is inside-phase author/freeze/review under SR44, not a requirement to execute unbuilt controls before Ready. Body metadata alone is insufficient. Actual binary/exit calibration precedes trusting the unit evidence; old calibration is input history, not this phase's execution.

Closed owned outputs (relative to the fresh root; optional entries stay absent when unused):

| Paths | Purpose |
|---|---|
| `logs/admission-accounting.jsonl`, `logs/commands.jsonl` | Actual consumed start/deadline/all aggregate calls; each child command's exact argv/cwd/env/exit/raw hashes persisted before classification. |
| `receipts/start.json`, `receipts/inputs.json`, `receipts/source-before.json`, `receipts/source-after.json` | Actual custody/inputs, before/after test bytes/hash/diff, preserved source identities and explicit controller absence. |
| `receipts/recorder.v2-input.json`, optional `receipts/recorder.v3.json`, optional `receipts/recorder.v3-diff.json` | Exact consumed V2 reference; preserved selected V3 inline text/hash and root/output-ID-only diff if necessary. |
| `reviews/recorder.json`, `receipts/control-plan.json` | Before-invoke side-effect/output review and exact frozen run IDs/paths/argv/expected exits/classifier. |
| `logs/integrity-01.stdout.bin`, `logs/integrity-01.stderr.bin`, `receipts/integrity-01.json` | Actual same binary/exit calibration and preserved verdict; expected calibration exit7 is not a failed source red. |
| `logs/red-01.stdout.bin`, `logs/red-01.stderr.bin`, `receipts/red-01.json` | First exact verbose28-case causal red and classification. |
| `receipts/candidate.json`, `reviews/compliance.json`, `reviews/quality.json`, `receipts/docs-closeout.json`, `receipts/local-checkpoint.json` | Same-byte frozen candidate/reviews, external Marcus intent/limits and local-only exact-path Git receipt. |
| `repair-1/`, `repair-2/` each owning ONLY `source-before.json`, `source-after.json`, `recorder.json`, `recorder-diff.json`, `recorder-review.json`, `control-plan.json`, `integrity.stdout.bin`, `integrity.stderr.bin`, `integrity.json`, `red.stdout.bin`, `red.stderr.bin`, `red.json`, `compliance.json`, `quality.json` | Optional at most two identified in-fence corrections; retain earlier failures and exact changed bytes/hash. Unneeded files absent. Any changed recorder re-reviewed/calibrated before use; changed test requalifies affected red/reviews. |
| `os-temp/` | Owned child TEMP/TMP only; inventory actual generated temporary descendants in final receipt, preserve them, no generic removal. These are environmental scratch, not extra evidence/helper/source permissions. |
| `control-receipt.json.tmp`, `control-receipt.json` | Complete final manifest/receipt, same-volume exclusive publication and byte readback, both retained. |

No arbitrary extra directories, compact projection, runner file, helper, source copy or output-ID is admitted. Preserve stopped/review-failed bytes in the relevant JSON record as exact UTF-8 text/hash without creating another repository file. If actual selected recorder cannot implement this finite root/output-ID mapping solely through the ruled substitutions, STOP to Brain before invocation; no silent classifier/output/schema redesign.

The exact existing raw-binary/exit-calibration subprocess bytes/argv and complete selected recorder body are qualified existing inputs to consume, not reconstructed from this metadata. Freeze those exact inputs in `control-plan.json` before invoke; this draft does not invent their bodies or claim they were re-read locally. Retain full test/case names, causal evidence and every unrun subcase. Use the full IC `blurby.business.ic-controls.v1` schema, actual cut `IC-T-REPAIR-1`, actual source parent/commit/branch/worktree, real start/deadline/tools, commands/exits/raw byte lengths+hashes and review identities. Explicit source absence replaces any invented controller hash. The finite final manifest lists each actual file/hash and any unused optional path as absent.

Persist raw streams by exclusive creation, awaited write/flush/fsync/close, then append the full command JSONL record BEFORE expected-result classification. A truncated record, hash/length mismatch, incidental stdout, relabelled exit or collision is HARNESS_FAILURE/HOLD. Publish complete final UTF-8 receipt through exclusively created `.tmp`, awaited sync/close/readback, then same-volume exclusive hard link to final, verify bytes; keep both names. No overwrite/rename/delete/direct-write fallback. Do not repair old evidence in place.

## Sequence, task sizing and stop rules

One fresh phase, ceiling **30minutes/30 aggregate calls**, including doer, recorder, independent reviews, docs and Git. Original40/40 remains closed. Estimates below are an uncalibrated prospective serial plan, not measured durations, elapsed forecasts, renewed budgets or active allowances. Planner total25minutes leaves5minutes contingency inside the independently admitted30minute ceiling. Call accounting is aggregate across agents; no private subagent allowance. Stop before required verification/review/Git would overrun remaining resources. No automatic successor or enlarged clock.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Bind fresh host/source/untracked-test/recorder inputs and create owned evidence root after consumed admission | calculable | custody | bounded | medium | 4m (four bounded input/root outcomes at planner1m each) | — | — |
| 2 | Apply exactly R1/R2/R3 and freeze full before/after test/diff | calculable | test-only | bounded | high | 6m (three ruled regions at planner2m each) | — | — |
| 3 | Consume V2 or preserve permitted V3, review side effects, qualify actual binary/exits, record exact28-case red | calculable | controls | bounded | high | 7m (recorder freeze/review3m plus calibration/red2m each, planner allowances) | — | — |
| 4 | Independently review same frozen test/recorder/receipts; accept compliance before quality | calculable | compliance-quality | bounded | high | 5m (two bounded reviews at planner2.5m each, conservative serial) | — | — |
| 5 | External Marcus intent, exact-path local checkpoint and complete preserved receipt after returned resource windows | calculable | checkpoint | bounded | medium | 3m (three closeout outcomes at planner1m each) | — | — |

**Total:** mechanical chain6m · sum6m;5 of5 rows priced by recorded kind/tier history, including zero medians; not a credible elapsed forecast. Separate conservative planner chain25m · sum25m is uncalibrated, using the explicit prospective formulas in each row. These formulas are planning assumptions, not measured history or a fresh allowance. Protected mechanical U10 pricing does not replace the planner estimate or change the30/30 cap.

Do these dependent tasks in order. Standard independent compliance and Plato quality reviewers may read the SAME frozen candidate concurrently, but quality remains provisional until compliance PASS is accepted; neither reviewer authors the repair. Both inspect exact test/selected-recorder/receipt hashes and full source diff, the3regions and28 boundaries, calibration/red causal evidence and explicit NOT_RUN inventory. Any changed bytes invalidate affected review coverage; preserve prior reviews and requalify. At most two identified in-fence corrections, each inside actual remaining30/30 and limited to the same3regions or authorized recorder root/output-ID substitution. No automatic retry after exhaustion or out-of-fence problem. Unknown hunk, changed source parent/test input, unreturned slot, output collision, wrong red, unexpected FS/module effect or loss of restoration: retain failure and STOP to Brain; never erase dirt, weaken oracle, add hook or substitute fake implementation.

Only after both reviews accepted, returned Brain Git/test windows, exact source/test/fence inspection and external Marcus intent: stage **only** `tests/businessRead.test.js`, inspect staged diff/stat/path list and local parent, then create a local test-only checkpoint on existing Business branch. Record actual commit/tree/parent and postcommit status. No source push, merge/main/controller/constants/epic-document edit or governance/provider/terminal mutation. If Git window is not returned or time/calls cannot cover checkpoint, retain untracked repaired test and honest PARTIAL receipt; no pretend commit. This phase does not complete Task3, HB6 or BLURBY-BUSINESS-1; it supplies an accepted test-only input only if Brain later accepts the actual receipt.

## Done when and five readiness findings

1. Full raw stopped input verified; exact3regions changed; all28 names/load boundaries, bc12guard/private/queue/opponents/formatting checks and all unrelated bytes retained. Evidence: complete before/after bytes/diff/static reviews.
2. Actual selected V2/V3 is consumed/frozen/reviewed; only permitted root/output-ID delta, actual raw-binary/exit calibration and exact verbose28-case missing-module red retained under fresh root. Evidence: recorder/input hashes, review, raw streams, commands JSONL and classifier receipts. This qualifies test collection/sensitivity, not deeper behavior.
3. Same frozen test+recorder+receipts receive independently accepted compliance FIRST then quality; external Marcus records exact scope/nonclaims. Local test-only checkpoint only under separately returned custody and remaining cap.
4. Old40/40 root/inputs remain immutable; complete new receipt records actual start/end/tools/ownership, unchanged W/source, every preserved failure, exact manifest and all unrun gates. No controller/code/runtime/epic/status/merge/push claim.

**Specification readiness:** three repairs are resolved/source-bound; this draft still requires independent planning reviews and final byte-bound U9/U10. **Prerequisite readiness:** old T is PARTIAL, not terminal; this explicitly ruled test-only repair exception preserves W source parent and encodes no IC-Q start. Fresh actual Brain start/custody is WAIT. **Repository readiness:** quiet actual branch/HEAD/source/test/dirt and one-file staging plan need current confirmation; resulting repaired hash/local commit are outputs qualified inside the admitted phase, not imaginary pre-Ready inputs. **External-register readiness:** Root must SQL-read current item/prerequisites/holds and protect status/Seq, never infer them from this draft. **Execution-environment readiness:** current quiet-host accepted tools/recorder-body consumption/root absence and returned Git/test slots remain entry gates. No Ready or admission follows from authoring this document.

## Universal checks

U1 scope: test-only3regions, finite external evidence; all production/runtime/provider/Q excluded. U2 edit sites: actual stopped147–167,261/265/270 and481–482 with complete approved replacements. U3 tests: exact existing28 names/boundaries in full test plus literal verbose command; calibration uses consumed exact qualified existing input. U4 acceptance: byte/diff/raw-exit/causal-case/same-byte review/manifest criteria above. U5 prerequisites: explicit W source exception, old T partial, no Qactivation and fresh Brain admission/resource waits. U6 failures: retained STOP/two in-fence repairs/nooverrun. U7 source evidence: actual complete rulings, complete635-line test, actual reviews and attributed metadata; no uninspected recorder-body claim. U8 repository: named actual Business branch/W parent/quiet worktree, exact one-file local-only checkpoint, no push. U9 semantic application below; Root final live-ID census/check remains required. U10 whole-number task rows/serial25minute estimate/separate30/30 ceiling; final mechanical price/check Root-owned, no elapsed forecast.

##### Lessons applied

Apply the current full IC lesson roster through LL-176 with its actual live/promoted/retired statuses preserved; this narrow repair does not reactivate promoted or retired lessons. Concrete applications: LL-031/109/169 preserve generation/ownership protocol and pending drains; add refused old/foreign/object token no-ID/no-I/O checks rather than arbitrary AST admission claim. LL-063/066/068 preserve unrelated bytes, exact stopped checkpoint/failures and one-test fence. LL-087/088/090 require reading the whole actual test before applying approved literal regions; keep one global allocator/queue evidence. LL-096/097/098/113/137 retain opt-in causal red/raw identities/exits, never map harness failure to expected source failure. LL-118/128/139 retain narrow CJS cache/fs-object boundary and no new loader/helper/unsafe import; absent controller prevents deeper imports. LL-134 separates25minute uncalibrated planning estimate from independently admitted30/30 cap. LL-142/143 and standing rule44 distinguish STATIC repaired evidence from actual later behavior, exact named command/counter-outcome records from planner assertions. LL-144/145 require W→repaired-test ancestry, actual rulings and independent same-byte reviews with compliance accepted first. LL-162 preserves all28 controls rather than dropping an inconvenient negative. LL-172/174 preserve external evidence ownership/real boundaries without timing-helper backfill. LL-175 preserves accepted PDF/generator/temp bytes, no whitespace regeneration.

**LL-176 (live Observation) specifically applied:** selected Python recorder must requalify its own structured output/raw bytes/exact positive/opposite exit boundary inside this admission before evidence acceptance. If outer PowerShell copies streams, discard only completion-only copy return objects at EVERY layer, while preserving actual byte arrays, stderr, exceptions and exit codes. A `[void]` cast is not Python-output qualification. No B0/registry/globalhelper/historical receipt change. New output guard is required inside phase, not a manufactured pre-Ready execution PASS. All other live families and deferred native/IPC/quit/UI/renderer/audio/profile/package lessons retain their full-IC semantic disposition: no work in those areas here, all later holds intact. Final U9 live-ID applicability and byte-bound mechanical check remain Root-owned.

**End state ceiling:** corrected test-only built/held checkpoint or honest PARTIAL; no full controller, business epic or release completion. Brain may accept actual repaired evidence and separately consider Q; no automatic elevation or runtime permission.
