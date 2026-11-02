# CPU A3-P — protocol and numeric policy draft

Existing NARRATE-CPU-PROFILE-1, Seq95, In Flight. Outcome: a side-effect-free sampler policy module with exact thread, Windows process classification, cumulative CPU and runtime-thread-proof behavior, proved by literal synthetic controls. **Partial A3 only; NOT READY until the findings below close.** Brain owns admissions and executor coordination.

## Authority and decomposition

Binding CPU9/10/11/12/13/14 contracts in this directory govern all semantics, with later rulings prevailing. Brain CPU12 approved dependent P → T → L source checkpoints: P creates policy exports only; T adds transport/watcher/publication to the helper; L changes the launcher against the accepted helper. No transport stubs or pretend implementations in P. CPU14 corrects CPU12/13: original40m A3,140m source and265m whole values are historical ESTIMATES, not cumulative ceilings. Do not impose an accumulated-budget admission gate or imply three automatically allocated hours. Every P/T/L wave still needs a fresh separate admission of at most60m/40aggregatecalls; publishing this technical contract starts none.

CPU14 actual receipt envelopes: A1+A2+V1 sum33m20.538345s/92calls, conservatively including technical holds inside those intervals; dependency preparation5m37.689363s/17calls. These are not pure CPU execution time. Overall item active elapsed remains incompletely certified; preserve that reporting limitation without fabricating a cumulative-budget blocker. Exact receipt hashes and boundaries remain in the verbatim CPU14 record.

## Host, source and ownership

RodneySR Windows x64, existing exclusive C:/Projects/wt-narrate-cpu-profile-1-a1, branch eb/narrate-cpu-profile-1, common Git C:/Users/estra/Projects/Blurby/.git. Exact source dbd4ea3de0b496d4dc2370fe6990625c16a6fbe7, accepted A2 plus A2-V1 validation. Preserve A1 test SHA839c528c0a1d109703e29fd2568717308b3a359ab91e33a01f7850e9170b0aea and both A2 raw hashes recorded in accepted checkpoint. No newer governance commit is a substitute source base.

Add ONLY scripts/narrate-rebuild/lib/cpu-sampler.mjs. No existing source/test/launcher/package/lock/producer/worker/renderer/shared-core edits; no new committed test. Evaluation surfaceB ownership, with no shared-core touches. Business fixture authoring is disjoint in its own worktree; heavy suites/builds remain serialized by Brain. P precedes T, then L; no automatic successor.

## Read order and exact APIs

Read current actual host AGENTS, shipped Virtuoso/Zeus/overlays and applicable live lessons; parent ROADMAP CPU item; CPU9–14 including the exact ledger readout and estimate correction; immutable A1/A2 source; read-only current launcher cpuShare. Preserve ICU guard on the real launcher; never import it as a test shortcut.

Implement only fixed protocol constants, parseProfileThreads(raw,enabled), classifyProfileProcess(row,{root,launcherPid}), createCounterLedger({root,launcherPid}), cpuShare(series,t0,t1,{byType=false}={}), readWarmThreadProof(summary,{label,rate,requestedThreads}). Named fixed limits:500ms sampling,131072-byte line,262144-byte pending stdout,8192-byte retained stderr,2000ms stop/close wait; transport implementation is T. Module import starts no process/timer/probe, performs no filesystem I/O and imports no Electron/app/guard/model/tokenizer code. Built-in path handling is lexical Windows normalization, not native path attestation.

CPU10 supersedes CPU9's accept return: `accept(frame)` returns boolean; closed/faulted ledger returns false without mutation; first-fault object is frozen and sticky. CPU13 fixes the complete ledger API as `{accept,close,getFault,getSamples}`. `getSamples()` returns a fresh array of admitted `{t,sec,byType}` objects, each with a fresh complete five-key map. No raw process descriptors or BigInts escape. Exactly one sample is appended per successful accept and none after rejection/fault/closing. Earlier accepted samples remain failed-run diagnostics, not a healthy-measurement claim. CPU11 requires stop to mark closing synchronously before async drain; P's close is synchronous/idempotent and preserves accepted samples/faults. T later integrates that sequence and consumes `getSamples()` when stop settles.

P exports only the named five policy functions and fixed limit constants; `createCounterLedger` returns the four-method object above. No transport/watcher/publication export, stub, import-time invocation or new dependency in P. Constants retain CPU9's exact values; no new user flags or configurable framework. Use CPU10's frozen first-fault codes/reasons, with implicated frame sequence/PID or null, and no raw command line/error text.

## External controls — independent expected answers

Proposed fresh evidence root C:/Projects/Blurby-artifacts/cpu-a3-p-20261102/; actual absent-target and custody receipt required before creation. Builders and verifiers live only here, outside discovery. No imports of implementation to derive expected values. One receipted Node24.14.1 verification child at a time, process-local2GiB heap; no app-node/PowerShell/CIM/Electron/model/profile/full suite/build/install. Do not infer native or exhaustive CPU qualification from these mocks.

External files are exactly `policy.controls.mjs` and `import.controls.mjs` under that root, plus their separately named `.receipt.json.tmp` and `.receipt.json` evidence outputs. They use only Node built-ins. Each takes exactly `--module <absolute-helper-path> --receipt <absolute-own-receipt-path>`; no path defaults, launcher imports, module-loader mock flags or global patches. Both inspect the exact unmodified source; neither imports it to manufacture expected answers. `policy.controls.mjs` then dynamically imports the module only to invoke the five named APIs. Expected values below are literal independent assertions.

### p01–p04: threads, membership and actual Windows parser

Shared classification options are the literal `options` object in the fixture block below, with root `C:\Projects\cpu` and launcherPid999. A valid selected row is the M row below. In this table, JavaScript String.raw literals preserve each displayed backslash; they are fixture text, never shell commands.

- **p01:** `parseProfileThreads('1',true)` through `'4'` return1 through4. These eight distinct raw values each throw `TypeError` with exact message `CPU_PROFILE_THREADS_REQUIRED` when enabled: `undefined`, `''`, `'default'`, `'0'`, `'5'`, `' 4'`, `'4.0'`, `'4e0'`. With enabled false, each of those eight, each valid string and number4 returns null. Include number4 as an additional non-literal-string rejection when enabled. No producer override is executed.
- **p02:** prefix each command line with `String.raw` + the quoted executable `"C:\Projects\cpu\electron.exe"`, then a space and one of these literal suffixes:

| Suffix | Exact class |
|---|---|
| empty | main |
| `--type=renderer` | renderer |
| `--type renderer` | renderer |
| `--type=gpu-process` | gpu |
| `--type=utility --utility-sub-type=audio.mojom.AudioService` | audio |
| `--type=utility --service-sandbox-type=audio` | audio |
| `--type=utility --utility-sub-type=network.mojom.NetworkService` | other |
| `--type=unknown` | other |
| `--note=--type=renderer` | main |
| `--note=audio` | main |
| `--type=utility --note=audio` | other |

- **p03:** selected path `String.raw` + `c:/PROJECTS/CPU/sub/../electron.exe` remains main under the same root. Launcher PID999 returns null. Known outside paths `C:\Projects\other\electron.exe` and `C:\Projects\cpu-old\electron.exe` return null even with null commandLine; exclusion precedes command parsing. A selected row with null executablePath or null commandLine throws `TypeError('CPU_SAMPLER_MEMBERSHIP')`. The suffixes `--type=`, `--type`, `--type=renderer --type=renderer`, and `--type=utility --utility-sub-type=x --utility-sub-type=y` each throw that exact membership TypeError. Preserve the neighboring valid selected-row control for each mutation.
- **p04:** these are the full `String.raw` command-line literals, not text to interpolate through PowerShell:

| Full literal command line | Exact class/result |
|---|---|
| `"C:\Projects\cpu\electron.exe" --type="renderer"` | renderer |
| `"C:\Projects\cpu\electron.exe" "--note=two words" --type renderer` | renderer |
| `"C:\Projects\cpu\electron.exe" "--note=a\" --type=renderer"` | main: one backslash makes the quote literal, so type text stays inside note |
| `"C:\Projects\cpu\electron.exe" "--note=a\\" --type=renderer` | renderer: two backslashes close the quoted note |
| `"C:\Projects\cpu\electron.exe" "--note=a\\\" --type=renderer"` | main: three backslashes preserve the quote inside note |
| `"C:\Projects\cpu\electron.exe" "--note=a\\\\" --type=renderer` | renderer: four backslashes close note |
| `"C:\Projects\cpu\electron.exe" "--note=a"" --type=renderer"` | main: doubled quote is literal inside quoted note |
| `"C:\Projects\cpu\electron.exe" "--note=unterminated --type=renderer` | TypeError `CPU_SAMPLER_MEMBERSHIP` |

These cases exercise the real classification parser; no exported/private-parser bypass or mock role label is allowed.

### p05–p08: literal full frames, sticky faults and defensive samples

The external control file contains these literal fixtures; `R` is identical to M except the fields explicitly shown. Tick strings are not JSON numbers. Each ledger scenario starts fresh.

```js
const options = { root: String.raw`C:\Projects\cpu`, launcherPid: 999 };
const M = {name:'electron.exe',pid:101,startUtcTicks:'100',
  executablePath:String.raw`C:\Projects\cpu\electron.exe`,
  commandLine:String.raw`"C:\Projects\cpu\electron.exe"`,
  kernel100ns:'20000000',user100ns:'0'};
const R = {...M,pid:102,startUtcTicks:'200',
  commandLine:String.raw`"C:\Projects\cpu\electron.exe" --type=renderer`,
  kernel100ns:'10000000'};
const F1 = {schemaVersion:'narrate.cpu-sampler.v1',sequence:1,
  t:1700000000000,rows:[M,R]};
const F2 = {schemaVersion:'narrate.cpu-sampler.v1',sequence:2,
  t:1700000001000,rows:[{...M,kernel100ns:'60000000'},R]};
const S1 = {t:1700000000000,sec:3,
  byType:{main:2,renderer:1,gpu:0,audio:0,other:0}};
const S2 = {t:1700000001000,sec:7,
  byType:{main:6,renderer:1,gpu:0,audio:0,other:0}};
```

- **p05:** initial `getSamples()` is `[]`, getFault is null. Accept cloned F1/F2: both return true; `getSamples()` deep-equals literal `[S1,S2]`; samples have exactly t/sec/byType and maps exactly the five keys. No descriptor/ticks/BigInt appears. Mutate the returned array (pop/push), sample.sec and map.main; a new getSamples still equals `[S1,S2]` and is a different array/sample/map by identity. This is CPU13's required mutation-isolation control.
- **p06:** accept F1/F2, then construct sequence3/t1700000002000 from F2 and apply only the mutation below. Accept returns false; sample prefix remains `[S1,S2]`. Expected fault has code `CPU_COUNTER_DISCONTINUITY`, sequence3, the implicated PID shown, and the exact reason below. It is frozen. Submitting a later valid frame returns false and preserves that first fault/prefix. Also submit a second invalid frame to prove failure is not replaced.

| Mutation of third frame | Reason / pid |
|---|---|
| Drop renderer row102 | PROCESS_DISAPPEARED /102 |
| Row101 changes startUtcTicks to `'101'` | PID_REUSED /101 |
| Row101 kernel becomes `'59999999'` | COUNTER_DECREASE /101 |
| Row101 command becomes the renderer command, same executable | CLASS_CHANGED /101 |
| Row101 executable becomes `C:\Projects\cpu\alt\electron.exe`, still selected | EXECUTABLE_CHANGED /101 |
| Row101 executable becomes `C:\Projects\outside\electron.exe` | MEMBERSHIP_CHANGED /101 |
| Duplicate an exact copy of row101 in rows | DUPLICATE_IDENTITY /101 |

For UNSAFE_COUNTER, use a fresh first frame with only M and kernel `'9007199254740992'`; expected code `CPU_COUNTER_DISCONTINUITY`, reason `UNSAFE_COUNTER`, sequence1, pid101, no samples. This exercises BigInt validation before Number conversion. Do not derive a rounded counter in the fixture.

- **p07:** use independent fresh ledgers and exactly one invalid mutation per case. Wrong schema string, numeric kernel100ns20million, noncanonical kernel `'01'`, and startUtcTicks `'0'` reject with code `CPU_SAMPLER_FRAME`, reason `INVALID_SCHEMA`. First sequence2, then separately F1 followed by F2 with sequence3, reject with FRAME/SEQUENCE. F1 followed by F2 with equal or earlier t rejects with FRAME/TIME. Do not assert an implicated pid where CPU10 permits null; assert full shape, frozen status and the correct sequence. No rejected frame appends a sample; the first frozen fault survives a later valid frame.
- **p08:** after F1/F2, call close twice; getSamples remains `[S1,S2]`, fault remains null. A later complete valid frame returns false and changes neither samples nor fault. On a separate already-faulted ledger, close twice retains its fault and prefix. No final-zero/disappearance sample is manufactured.

### p09–p11: CPU arithmetic and loaded-thread proof

The base CPU series is exactly CPU9's literal: cores8, host `[{t:0,idle:0,total:0},{t:1000,idle:3200,total:8000}]`, app `[{t:0,sec:3,byType:{main:2,renderer:1,gpu:0,audio:0,other:0}},{t:1000,sec:7,byType:{main:6,renderer:1,gpu:0,audio:0,other:0}}]`.

- **p09:** window0..1000 with byType true gives exactly `{hostPct:60,appPct:50,foreignPct:10,byType:{main:50,renderer:0,gpu:0,audio:0,other:0}}`. Default/explicit false gives exactly `{hostPct:60,appPct:50,foreignPct:10}`, with no additive key.
- **p10.a minimum window:** base series with requested window400..600 gives the same literal p09 result after symmetric widening.
- **p10.b ties:** use host samples `(t,idle,total)` = `(0,0,0),(500,0,4000),(1000,3200,8000),(1500,8000,12000)` and app samples `(t,sec,main,renderer)` = `(0,3,2,1),(500,6,5,1),(1000,7,6,1),(1500,8,7,1)`, other classes0. Requested window250..1250 gives the same p09 result: nearest ties select first, not the later entries.
- **p10.c raw-before-rounding:** cores8; host `(0,0,0),(1000,3333,10000)`; app sec0→1.23456 with main=sec and other classes0. Window0..1000 yields exactly host66.7/app15.4/foreign51.2; byType main15.4/others0. Foreign51.3 would expose subtraction of rounded percentages.
- **p10.d missing coverage:** remove both endpoint maps, then separately only the second map; aggregate remains60/50/10 and flagged byType is null. Never fabricate type zeros.
- **p10.e malformed coverage:** independently remove one required map key, set main toNaN, set main negative, or make map sum differ from sec by0.01; flagged call throws. Independently change second map to `{main:1,renderer:6,gpu:0,audio:0,other:0}` so total remains7 but selected main delta is negative; flagged call throws. Positive base runs immediately before each negative. No exact new error message is invented for cpuShare where CPU9 specifies only a throw.
- **p10.f unchanged aggregate missing-data behavior:** null series, empty host/app arrays and a single shared-time sample return null. Do not add a new default-mode malformed-series policy; unspecified malformed values are outside these controls.
- **p11:** literal summary is `{config:{kind:'warm',label:'warm-1.00',rate:1},error:null,steps:[{name:'warm-up done',detail:{runtime:{threads:4}}}]}`; options `{label:'warm-1.00',rate:1,requestedThreads:4}` returns4. Independent one-change variants: missing summary; absent steps; zero matching steps; duplicate matching steps; threads string`'4'`; numeric threads3; kind`'cold'`; wrong label; rate`'1'`; numeric rate2; error`'failure'`. Each throws TypeError with exact message `CPU_PROFILE_THREAD_PROOF`. No filename/environment proof is substituted.

### p12: import outcome plus independent top-level proof

`import.controls.mjs` reads/hashes the helper without altering it, enumerates import declarations and independently reviews the top-level code. P needs no runtime dependency beyond lexical built-in path handling; imports of app/Electron/guard/model/tokenizer/child_process/filesystem/timer modules or import-time calls into those surfaces fail the compliance review. The separately invoked import.controls.mjs process is itself the fresh receipted Node child; it dynamically imports the exact helper file URL within that process, launches no additional process, confirms the five named function exports/fixed constants and that no transport stubs are exported, and verifies no helper-created output in the fresh owned evidence root. Function-valued exports must be exactly the five named APIs; the fixed exported numeric limit values must be the literal multiset `[500,2000,8192,131072,262144]` (sorted ascending), without inventing additional numeric defaults. CPU9 defines those values; constant binding names are recorded from the accepted source for T's imports rather than guessed into a new algorithm contract here. No function is called by this import control. A successful import alone cannot detect every transient filesystem read: do not label it instrumentation proof; the independent source review of all top-level code/imports is required alongside the observed import result. No module-loader mock flag or global patch is introduced. T's later runtime injections are outside P.

### Runner receipts and commands

Each runner writes its own completed receipt through the CPU8 external evidence protocol: fresh deterministic `<receipt>.tmp`, wx/write/sync/close/readback, exclusive hard-link to final receipt, final byte readback; preserve both names. Existing name/publication failure stops and preserves evidence. Do not use the new helper to publish or to compute expectations. The policy runner records synthetic results only.

Successful stdout is exactly the serialized final receipt plus one newline. Receipt schema: `{schemaVersion:'narrate.cpu-policy-controls.v1',inputKind:'synthetic-source-controls',helperSha256:<actual>,runnerSha256:<actual>,groups:[{id:'p01'..'p12',cases:[{id,expected,actual,status:'PASS'|'FAIL'}]}],failures:[]}`. Policy receipt contains p01–p11; separate import receipt contains p12. Cases name every table row/mutation. No omitted negative counts as PASS. On failed assertions, preserve a FAIL receipt and exit1; on publication failure, stderr OUTPUT_WRITE_FAILED, exit1, no success stdout. A run returning0 requires every applicable group/case PASS. Source-control evidence is not measurement/runtime qualification.

After separate admission, bind `$ReceiptedNode` to the exact accepted absolute Node24.14.1 path; it is not a PATH lookup or version-discovery command. Bind `$SourceRoot` to the fresh accepted isolated worktree (currently proposed `C:/Projects/wt-narrate-cpu-profile-1-a1`), and `$EvidenceRoot` to the accepted fresh external root above. Record actual literal paths in the host receipt before these commands:

```powershell
& $ReceiptedNode --max-old-space-size=2048 --check "$SourceRoot/scripts/narrate-rebuild/lib/cpu-sampler.mjs"
& $ReceiptedNode --max-old-space-size=2048 "$EvidenceRoot/import.controls.mjs" --module "$SourceRoot/scripts/narrate-rebuild/lib/cpu-sampler.mjs" --receipt "$EvidenceRoot/import.receipt.json"
& $ReceiptedNode --max-old-space-size=2048 "$EvidenceRoot/policy.controls.mjs" --module "$SourceRoot/scripts/narrate-rebuild/lib/cpu-sampler.mjs" --receipt "$EvidenceRoot/policy.receipt.json"
```

Run serially, each expected exit0; preserve complete stdout/stderr/exit plus helper/runner/receipt raw hashes. stderr or an unexecuted command is not a clean pass. Fresh source baseline, target absence, protected hashes and discovery census are rechecked. Full A1/A2 compatibility runs once in L unless changed dependencies/failure justify earlier repetition. These commands are specification text and have not run.

## Failure, acceptance and persistence

Ambiguous API, custody/tool drift, expired admission or unrelated failure stops to Brain before source changes. At most two identified scoped repair passes within the same remaining admission; no unchanged retry over preserved evidence. No cleanup/reset/stash/delete/prune. Rollback is preserve the local partial checkpoint and request an item-scoped disposition, never erase it. Stop at the earlier admitted deadline/call cap; no rollover.

After actual controls pass: actual host standard compliance role, then Plato quality, then Marcus documentation. Both reviews inspect final bytes; no mock PASS claims by source inspection alone. Stage exactly the new helper only and make local checkpoint with accepted A2 parent; no push or merge. Preserve external evidence, return commit/parent/tree, all raw hashes, protected-path/discovery checks and actual wave elapsed/calls against its named admission. Mark P accepted only for named exports; whole A3/CPU remains incomplete. Runtime, collector, A4, full suite/build/install, measurement, package and release remain unperformed.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 2P.1 | Exact pure protocol, ledger/readout, CPU and thread-proof exports satisfy the frozen contract | calculable | source-policy | bounded | high | 30m | — | — |
| 2P.2 | Independent literal policy/import controls distinguish accepted inputs from every named opposing case | calculable | synthetic-control | bounded | high | 12m | — | — |
| 2P.3 | Ordered independent reviews, documentation and exact local checkpoint preserve all excluded bytes | calculable | review-checkpoint | bounded | medium | 8m | — | — |

**Total:** proposed chain50m · sum50m; no parallel group or timebox included. These are new, uncalibrated planner estimates for P's decomposed outcomes, not original A3's historical40m estimate and not an allocation or measured active duration. The qualified permitted read-only pricing/mechanical check remains required before claiming U10 PASS. CPU14 removes the erroneous140m/265m cumulative-ceiling gate. Brain separately admits this wave with fresh exact deadline and call cap, never more than60m/40aggregatecalls; no clock or extra time follows from this table.

## Five readiness findings — not a dispatch

Specification: CPU13 accessor, CPU14 estimate correction and literal control/runner contract now incorporated; current lesson census/U9/U10 and ordered independent review remain unperformed for this draft. Prerequisites: accepted A2/V1 evidence exists; fresh item custody still required, with no cumulative-budget blocker. Repository: exact source known, target absence/dirt/exclusive ownership and immutable published input consumption not yet freshly verified. External register: existing item remains In Flight95, no new item/Seq; refresh required for final pointer. Execution environment: source-support Node subset only, current host pins/capacity/inputs not yet consumed for P. **NOT READY.**
