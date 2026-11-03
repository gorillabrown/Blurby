# Business bc06 timeout — factual source investigation

2026-11-03. **READ-ONLY INVESTIGATION / NO RETRY OR FIX ADMISSION.** Recommendation: route the bounded test-cost finding to Brain before any new execution. The observed failure is Vitest's per-test timeout, not the collector's deadline. Source tracing finds a concrete expensive test construction and no unresolved fake-I/O gate on the bc06 success path. It does not prove which statement consumed the measured time, establish a production defect, authorize a test-oracle/timeout change, or qualify the controller.

## Actual evidence and read scope

Read existing quiet Business chat `01a19e5f-a0f9-7831-ab5a-c864e33a3a30`, actual Q2 turn `01a1a017-8e81-7771-ae60-c8e7709ae51b`; no new quiet commands, courier or executor contact. Complete existing output `exec-bf83b3c3-4b5f-49fc-bff3-67087455239f` contains raw green stdout/stderr and the green receipt. Existing `exec-2bb87765-e3a1-45c7-b658-2760a8b88cff` contains the complete preinvoke review plus actual four-mode outcomes. Final commands `exec-55d8799a...`, `exec-0be719b7...`, `exec-72ffb897...` contain immutable-receipt and post-publication accounting projections. The full920657-byte receipt was NOT transferred or read in full here.

- Actual command: `C:/Program Files/nodejs/node.exe C:/Projects/bb-business/node_modules/vitest/vitest.mjs run tests/businessRead.test.js --maxWorkers=1 --reporter=verbose`; cwd `C:/Projects/bb-business`, child2GiB heap and owned TEMP/TMP.
- Actual green exit1;27 named tests PASS, bc06 FAIL. Raw report: `bc06 one-MiB edge and oversize are distinct 13773ms` and `Test timed out in 10000ms.` Failure location `tests/businessRead.test.js:385:5`. Suite14.52s; tests14.11s. No assertion-value mismatch, branded controller error or unresolved-promise stack is reported.
- Green execution06:38:08.856459–06:38:24.334124UTC. Outer green timedOut=false, killAttempted=false, exit2 because classification failed, confirmedClosure=true/drainComplete=true; the operational Node exit was1. Outer deadline06:40:38.800079UTC was not reached. These are different exit domains.
- Green raw stdout4431bytes/SHA256 `3aa0533c56a3e7b9d667212e820d62dc884b97083095f66a189a6cf755578699`; stderr730bytes/SHA256 `d89b48ddb304dfed10040fc6aad19d02089a43cb2f2a696d71b2ff95d4490f81`, as reported in the actual complete green receipt.
- Frozen input source HEAD `9b0f29d48c5df2eb66b9458e87da2d8ce7549293`, unchanged. `main/business/read.js`8509bytes/SHA256 `d6c157f99fc8da0e82768b52200e2d65792eb5b4a2d04d930b5602ba899e65aa`; constants14972/`d1d685abb97ed51a55a48871381770c9b67a3fef9f60667567c0399b3cd1e653`; frozen test41366/`6c06052105e813bbfe3df4b675c7a68d9af8e6e90d800506f22806520c47f38b`.
- Final receipt path on QUIET: `C:/Projects/Blurby-artifacts/business-hb6-t3-i-c-q-qualify2-20261102/control-receipt.json`,920657bytes/SHA256 `6074c1ed00c6533d99e658dc0443ccefc25b7d3f31c6423dcb45e4e1a6c7d5ce`. Published at38calls; actual final accounting supplement40/40, SHA256 `66dc617fdb1f917b5c357934146becb76bd3cdb883f1d145841e939591cbb4b3`. Do not relabel the immutable38-call publication as the final40-call count.

Read COMPLETE8509-byte controller display from existing prior Q turn `01a19fcc-6a8b-74a0-b3b3-f4f8e733da78`, `exec-dddff9f7-465c-4f6f-9bdc-2765edf8709c`, including actual constants diff and frozen input identities. This was DATA only, not import/evaluation or a fresh filesystem read. Read actual current test's staged addition at existing accepted T-closeout turn `01a19f9e-e8e5-7062-9f65-29c4d987a7a3`, `exec-33ead027-45a2-4c32-9f0c-b66bd82233c0` and continuation `exec-f0759f5e-832f-4efc-b871-db50352f1cd8`. Relevant complete fake/controller fixture, cleanup, bc04–bc09 and exact bc06 region were visible. Did NOT consume all41366bytes as a contiguous independently rehashed current test; current identity is bound by those actual staged/frozen projections, not the older Root review copy44aeb. Display continuation numbers are DIFF line ordinals; subtract six diff header lines for current test source lines (bc06 begins385, matching actual failure).

## Exact bc06 predicates and execution trace

Current test385–396, as actual staged data:

```js
it("bc06 one-MiB edge and oversize are distinct", async () => {
  const { createReadController } = load("bc06");
  const handle = fakeHandle(new Uint8Array(1048577).fill(0xA5)); installFs([handle]); const c = make(createReadController); const d = await open(c);
  expect(d.length).toBe(1048577); expect(d.initialData.length).toBe(CHUNK);
  for (const byte of d.initialData) expect(byte).toBe(0xA5);
  const full = await c.read(d.id, 0, CHUNK); expect(full.data.length).toBe(CHUNK);
  for (const byte of full.data) expect(byte).toBe(0xA5);
  const calls = handle.calls.length;
  await rejectCode(c.read(d.id, 0, 1048577), "INVALID_REQUEST"); expect(handle.calls).toHaveLength(calls);
  assertExactView((await c.read(d.id, 1048576, 1048577)).data, [0xA5]);
  expect(handle.calls.filter(x => x.op === "read").every(x => x.out.length <= CHUNK)).toBe(true);
});
```

`CHUNK=1048576`. If both successful data paths reach their complete equality loops, they invoke **2,097,152 individual Vitest expect/toBe assertions**, in addition to fixture allocation/copy and the remaining predicates. This exact count follows source lengths; it is not a measured assertion throughput or proof that both loops completed in the failed run. The test has no timing checkpoints marking the last reached statement.

The opposing predicates are substantive and must remain requirements: length1048577 with initial chunk1048576; full legal span returns1048576 exact0xA5 bytes; illegal span1048577 rejects BUSINESS_INVALID_REQUEST **before any additional fake call**; final one-byte range returns exact tight view[0xA5]; every fake read allocation remains at mostCHUNK. Neither a larger timeout nor a weaker sampling assertion is admitted by this investigation.

Actual fixture facts: fakeHandle copies input into Uint8Array, `stat()` immediately resolves unchanged BigInt metadata with isFile=true; `read(out,offset,length,position)` immediately copies `Math.min(length,data.length-position)` bytes with `out.set(...)`, returns that count and an intentionally unrelated buffer; all hooks are null by default. bc06 sets NO statHook/readHook/closeHook/deferred gate. `installFs([handle])` has exactly one queued fake descriptor and spies `fs/promises.open`; it rejects an unexpected extra open rather than delegating to real I/O. Prohibited filename-I/O spies throw. Thus bc06 is a mocked descriptor/control test, not a disk, Electron, native or source-download workload.

Controller trace from actual full source:

1. `read.js:12–16` module-global queue: `result=ioTail.then(operation)`; sequencing tail absorbs success/failure into undefined, while caller retains result. Prior bc01–bc05 passed; no bc06 source branch creates an independent unresolved gate.
2. `149–178` open validates path/token/current generation before ID reservation, owns lease then enqueues fake open/stat. Line171 reads `[0,min(length,1048576))`; ready descriptor publishes at173–174.
3. `126–142` readChunk checks metadata, allocates EXACT `end-begin`, loops while filled<data.length, awaits fake read at133, validates positive bounded integer bytesRead, increments filled138, checks metadata again. With bc06's positive fake read, a full chunk requires ONE fake read, not1,048,576 iterations. Initial open likewise uses one fake read. Metadata is stable by fixture construction. The returned unrelated fake buffer is correctly ignored.
4. `181–202` read rejects `end-begin>1048576` at185 BEFORE enqueue or handle I/O. Legal full span and final one-byte span enqueue readChunk; the latter is `[1048576,1048577)`, within length. No release/failedOperation path is expected for those positive fake inputs.
5. Normal final cleanup requests shutdown/invalidation/releases through tracked operations. The actual current test cleanup has nested finally for restoration and gate/pending/controller draining. bc06 itself creates no deferred gate needing cleanup release. No cleanup error or source acceptance was reported. This does not measure cleanup duration or prove no unknown runtime scheduling cost.

## What is proved, inferred and still unknown

**Proved by actual report:** one per-test10s timeout;27 sibling controls PASS; collector calibration and two silent syntax checks PASS; raw output and direct closure retained; no source/test correction/Git operation in Q2. The final projection reports four outer/four operational direct handles and both EOF closed, slot released; no universal descendant-absence claim. Final source compliance/quality were deliberately NOT_RUN after the suite failed. Preinvoke review PASS qualified static collector shape, not controller correctness.

**Source-derived strongest explanation:** bc06 uniquely places two million assertion-library calls around two bounded fake chunk reads. The fixture has immediate settling async methods, fixed stable metadata and no waiting gate. Controller algorithm uses bounded positive filled increments; no source-backed infinite loop/self-tail await is identified on this exact path. This makes test assertion overhead/runtime scheduling the leading hypothesis, **not a proved sole root cause**. The timer's delayed13.773s report is compatible with synchronous work delaying timer servicing; it does not itself locate the blocked statement or establish clock/worker contention causality.

**Not established:** whether the timeout happened in first or second equality loop, at a later await, or during a different elapsed component; exact per-region wall times; actual host contention; eventual completion of all bc06 assertions; a production performance defect; a queue deadlock; required implementation changes. Raw report has no predicate progress trace, pending promise identity, CPU profile or per-stage timings. Do not turn missing instrumentation into an invented native/collector defect or request an automatic rerun.

## Narrow technical disposition for Brain

Please decide whether the observed bounded two-million-assertion construction is sufficient to prescribe a source-only **test-cost correction retaining every exact byte and boundary/early-refusal/allocation predicate**, or whether a separately bounded admitted observation is necessary to identify the last reached predicate before any correction. That is a technical question, not a new owner design choice. Any subsequent changed test, measurement instrumentation, timeout/argv adjustment, collector reuse or repeat suite requires its own exact investigation/specification, independent review/current inputs and fresh admission; none follows automatically from this document. Preserve failed run,28 frozen predicates/current source, old receipts and exhausted40/40 clock. Cleanup29, controller acceptance, I-D, package/native/owner/register/whole-Business completion remain held.

Only this new factual audit was authored. No application/module execution, new quiet command, source/test edit, provider/helper/Git mutation or executor contact occurred.
