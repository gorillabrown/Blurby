# BLURBY-BUSINESS-1 — HB-6 task3-W inert Business window foundation

Date: 2026-11-02. PLANNING ONLY / NOT READY / NO ADMISSION. Effort: high. Binding technical input: [Brain's actual W contract](Brain.BLURBY-BUSINESS-1.HB6-T3-W.2026-11-02.md), BB-HB6-T3-W-20261102. This is the W slice of existing HB-6 task3, serial after R, before separately specified I/activation work. It creates no item, new epic, queue change, source allowance or automatic successor. Brain alone coordinates execution; Roadmap owns canonical planning/feed/closeout.

## Baseline, read order and entry HOLD

Actual accepted R execution parent: `cc7e0018c66186d4a71041b62b7f5c1b14fa1bb2`, tree `a5102932b37ca8f818da96bc150368f426ddd5f3`, on the Business branch. Historical HB-6 task2 source `1bcceb0efede6d33df4bba232f75832247b3f851` is not W's execution parent. Brain accepted R's source checkpoint and controls; Roadmap fetched the exact candidate and confirmed its cumulative five-path R fence, unchanged existing window manager, and exported `getThemeColors(settings)` contract. Re-read the listed files at cc7e; new source drift outside the accepted R fence returns to Brain before implementation. Preserve R's recent store and two constants; W adds only its own partition declaration/export. Fresh quiet-host custody and consumed W inputs remain entry gates, not an unresolved R implementation dependency.

Placement: RodneySr, `C:/Projects/bb-business`, branch `eb/blurby-business-1`, common Git directory `C:/Users/estra/Projects/Blurby/.git`. These are recorded placement, not fresh ownership/custody certification. Recheck actual host, repository/common directory, branch/full HEAD/tree, existing dirt/hashes, locks, source owner, qualified dependency inputs and exact new-target absence at consumed start. Never retarget `C:/Projects/bq-main`, its detached state/stash, or the everyday computer. No install/update/pull is implied.

Read in order: AGENTS.md; shipped Virtuoso/Zeus and declared overlays; current lessons with chronological statuses; frozen Business charter, plan, actual accepted state and last journal entry; `docs/planning/holding/2026-10-30-blurby-business-tier1/phase1-specs.md` HB-6 task3/Done-when2; actual R ruling/checkpoint; W ruling and this draft; accepted-parent `main/window-manager.js` (theme helper, constructor, default-session CSP), `main/constants.js`, `tests/documentsOpenSource.test.js` (CJS mock/cache restoration pattern). Historical source references are current-base-read obligations, not permission to modify them.

Brain's held-prerequisite **SOURCE-ONLY exception** extends to an inert, unregistered window module and Electron-MOCK tests before APP-TABS/settings/write-race integrations. It does not terminally accept those dependencies or weaken the existing Stage8 freeze, package gate or frozen charter. The real Business window remains forbidden until task4 primary-window retarget, complete typed I bridge, renderer/preload/assets, scratch custody and qualification are separately complete/admitted. Missing actual `preload-business.js` / `dist/business.html` is an explicit launch HOLD; never create placeholders or use index.html as fallback.

## Exclusive ownership and protected paths

Only three production/test paths:

- A `main/business/window.js`.
- M `main/constants.js`: ONLY `BUSINESS_PARTITION = "persist:blurby-business"` declaration and export; preserve every R constant/other byte except the narrow insertion.
- A `tests/businessWindow.test.js`.

Approved item documents after ordered review: `docs/planning/epics/2026-10-30-blurby-business/state.md` and append-only `journal.md`, under the standard lifecycle. No other canonical governance/timing/BUG/ROADMAP/register write is part of W. The planning file itself is authored now; future W admission does not authorize editing its own contract.

Execution surface D (platform/main) plus its targeted mock test; no shared-core touch. W is serial after accepted R; I/task4 and all activations are later, not parallel writers of constants/window integration. No default `main/window-manager.js` policy/edit, `main.js`, default launcher, IPC/quit/sync/tts/preload/renderer/package/build/lock/dependency change. No real BrowserWindow, Electron binary/application, native probe, profile or provider action. Keep frozen charter/storyboard/seed/matrix, accepted generator/report fixture, retained `report.pdf.tmp`, R source and known performance dirt intact. No regeneration/trimming/cleanup/reset/stash/broad stage.

`main/**` is package-included. **Package qualification HELD; do not say package unchanged.** Mock success does not establish that missing production assets work, that Chromium enforces CSP/worker/WASM behavior, or that Business is safe to activate. All existing charter and package rows remain unmet unless separately evidenced.

## Exact public API and lifecycle

CommonJS exports exactly `{ createBusinessWindow, getBusinessWindow }`.

- `createBusinessWindow(settings = {}, isDev = false)` returns a Promise resolving the owned BrowserWindow. `settings` is trusted main settings forwarded to the existing exported `getThemeColors`; do not add a new settings schema or theme decision. Only boolean `isDev` is accepted; reject nonboolean input without session/window creation. No extra error brand is prescribed for that invalid-type case.
- Require `app.isReady()`; otherwise reject an Error with code `BUSINESS_WINDOW_NOT_READY` BEFORE session/window creation. `getBusinessWindow()` returns the current live instance or null and never creates anything. Import creates no process, timer, session or window. Requiring an existing helper module is not permission to call its CSP installer.
- Keep one current owned window and one pending creation operation. Concurrent valid same-mode calls await that same creation; after successful load all resolve the same instance. Do not require public Promise-object identity where Brain specifies shared creation rather than identity. Later live-window calls restore if minimized, show, focus and return that instance; no new constructor/session handler registration.
- Attach all ownership, denial and ready/closed handlers BEFORE `loadURL`/`loadFile`. Construct with `show: false`; `ready-to-show` shows ONLY if that exact instance is still current and live. A stale ready event never shows a closed/replaced instance.
- A `closed` handler clears ONLY its matching current instance. Closing during unresolved load rejects creation with code `BUSINESS_WINDOW_CLOSED_DURING_LOAD`, clears matching state, and handles the eventual underlying load settlement so it cannot leave an unhandled rejection. The closed old instance's late events cannot clear/show a newer window.
- Failed load rejects the original error object. Destroy ONLY that owned instance if still live; clear only matching window/pending state. No silent catch, false success or automatic retry. A later explicit fresh same-mode call can retry. Observe both each caller rejection and any delayed load rejection in tests; no abandoned Promises.

Session policy is owned only by `session.fromPartition(BUSINESS_PARTITION)`. Configure that session's handlers once per module/session, with the first boolean mode fixing its policy. A subsequent different mode rejects with code `BUSINESS_WINDOW_MODE_CHANGED`; it must not relax policy or focus/create a window. Mode locking remains for the configured module/session even after a window closes or load fails. Never access `session.defaultSession` from Business, call `installContentSecurityPolicy`, or open an external shell URL.

## Exact constructor and route contract

Use existing constants `MAIN_WINDOW_WIDTH`, `MAIN_WINDOW_HEIGHT`, `MAIN_WINDOW_MIN_WIDTH`, `MAIN_WINDOW_MIN_HEIGHT` (historical values1000,720,600,500); do not redeclare sizes. Reuse `getThemeColors(settings)` from `../window-manager` for `backgroundColor: colors.bg` and existing title-bar colors. Title `Blurby Business`; icon absolute repository-root `assets/icon.ico`; `autoHideMenuBar: true`; `show: false`.

Copy the existing platform-specific title bar: macOS `titleBarStyle: "hiddenInset"`, `trafficLightPosition: {x:16,y:16}`; otherwise `titleBarStyle: "hidden"`, `titleBarOverlay: {color: colors.titleBar, symbolColor: colors.titleText, height:32}`. This reuses current appearance, not a new design. Tests receipt actual platform and assert its exact branch; do not claim a native macOS check on Windows.

Exact webPreferences, no weaker fallback:

```js
{
  preload: path.join(__dirname, "..", "..", "preload-business.js"),
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: true,
  webviewTag: false,
  partition: BUSINESS_PARTITION,
  webSecurity: true,
}
```

`isDev === true`: await `win.loadURL("http://localhost:5173/business.html")`. Production: await `win.loadFile(path.join(__dirname, "..", "..", "dist", "business.html"))`. The root is relative to `main/business/window.js`, not cwd. One configured route per new window; no index.html, remote/placeholder fallback, insecure-content flag or preload fallback. Tests mock these load calls; they never add production assets or actually navigate.

## Exact Business CSP and denials

Production policy is this single exact value:

```text
default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data: blob:; connect-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'
```

Development changes ONLY script-src to `script-src 'self' 'wasm-unsafe-eval' 'unsafe-inline'` and connect-src to `connect-src 'self' blob: ws://localhost:5173`; all other clauses/order remain identical. No CDN/model host, file fetch, unrestricted script eval or frame permission.

Business session `webRequest.onHeadersReceived` preserves every other response header, removes ALL key spellings whose lowercase equals `content-security-policy`, then inserts one `"Content-Security-Policy": [csp]`. Callback exactly once. Test ordinary and mixed-case headers; original non-CSP headers and their values remain. No second/default-session installer is called by production Business.

Register on owned Business webContents: `will-navigate` and `will-redirect` call event.preventDefault; `setWindowOpenHandler` returns exactly `{action: "deny"}`; `will-attach-webview` prevents default. Partition `will-download` prevents default; `setPermissionRequestHandler` invokes the supplied permission callback exactly once with false; `setPermissionCheckHandler` returns false. Session-level registrations occur once, including retries/reopens. Deny each request independently of supplied URL/permission. Programmatic configured loadURL/loadFile remains the only route; no page-initiated exception or implicit save/print/link flow is added.

Pin the existing default-session production CSP byte-for-byte, unchanged in `main/window-manager.js`:

```text
default-src 'self' blob:; script-src 'self' blob: 'unsafe-inline'; style-src 'self' 'unsafe-inline' blob:; img-src 'self' data: file: blob:; font-src 'self' blob: data:; frame-src 'self' blob:; connect-src 'self' https://huggingface.co https://cdn-lfs.huggingface.co https://cdn-lfs-us-1.huggingface.co
```

The regression tests the existing installer under a separate Electron MOCK harness; invoking it from the test solely to capture that existing literal is not permission for Business to invoke it. Keep Business-call and separate-regression counters independent so the regression cannot mask a forbidden defaultSession call.

## Mock module mechanism — no actual Electron

New `tests/businessWindow.test.js` uses Vitest and Node built-ins. Reuse `createRequire(import.meta.url)`, CJS `Module._load` and exact require.cache handling from existing tests; do not introduce a production dependency-injection framework or edit any existing test. For each harness:

1. Snapshot `Module._load` and the pre-existing cache entries for the resolved Business module and existing window-manager. Delete only those exact entries in MEMORY so every case starts a fresh module/mode/singleton. Restore original cache entries or their absence and Module._load in finally/afterEach, including failing cases. No filesystem deletion.
2. Intercept `request === "electron"` with an in-memory fake app/BrowserWindow/session/nativeTheme/Tray/Menu. Never fall through for electron. Reject/record any attempt to spawn/launch Electron or access a live defaultSession. The real window-manager may load with mocked electron; it has no import-time window creation. Real getThemeColors executes against fake nativeTheme; do not stub away its colors. Default-session regression uses a separate fake defaultSession recording its one installer call; Business-only harness makes defaultSession access observable/refused.
3. Use EventEmitter-based fake window and webContents objects. Record constructor options, lifecycle/load/denial handler registration order, show/focus/restore/destroy calls, closed/live/minimized state and load arguments. `loadURL`/`loadFile` return manually controlled deferred Promises. Attach load fulfillment/rejection observers before releasing/closing; no arbitrary sleeps to create races. A fake destroy emits only its owned close; tests may explicitly replay stale callbacks to exercise identity guards.
4. Fake partition has recorded header/download/permission registrations and explicitly invoked callbacks. Its `fromPartition` records the exact string; repeated registrations and any defaultSession use fail independent assertions. No network, session, PDF, native file-dialog/profile or browser work occurs.

**Base-red collection:** dynamically require the prospective Business module inside each test's Promise/assertion boundary, through a variable path. Assert the module load resolves and exported functions exist before dereferencing them. On the accepted R parent the new module is absent, so intended cases fail missing-module assertions after successful collection; do not turn this into a top-level import/collection error. Preserve the red test-only commit/log, then implement window/constant within the same bounded wave if remaining allowance permits. Existing source tests and production modules remain unchanged.

## Required named controls and opposing observations

| Name | Literal expected outcome and detector |
|---|---|
| w01 import and getter are inert | Fresh import + getBusinessWindow return null; zero app/session/constructor/load/timer/process operations. The explicit valid create in w03 proves those counters can observe creation. |
| w02 readiness and boolean input refusal | app.isReady false -> rejected BUSINESS_WINDOW_NOT_READY, zero session/constructor. True with isDev undefined/default false succeeds via normal production path; explicit true succeeds in fresh harness; strings/numbers/null reject before session/window. Do not invent an extra error brand. |
| w03 exact production constructor and route | Ready fake, settings.theme="light": constructor1000x720/min600x500 from constants, title/icon/background/titlebar/show/menu plus all seven security preferences exact; loadFile absolute repo/dist/business.html once, never loadURL/index. Capture handlers already registered at load call. Deferred load resolves -> same owned instance returned and getter agrees. |
| w04 development has only approved deltas | Fresh module true: exact localhost business.html loadURL, no loadFile; all constructor/security values same; exact dev CSP. Compare complete prod/dev strings, not substring-only permissiveness tests. |
| w05 concurrent creation is singleton | Hold first load; call create twice same mode; one constructor/configuration/load, both pending until release; both resolve identical window; getter current. No Promise-identity assertion beyond contract. |
| w06 live reuse restores shows focuses | After load complete, mark minimized; next create same mode restores/shows/focuses once and returns same object without new load/constructor/session handlers. Nonminimized call omits restore. |
| w07 ready-to-show is identity guarded | Current live event shows once; replay captured old ready callback after old close/new creation -> no extra old/new show. show:false constructor verified independently. |
| w08 close clears only matching instance | Close loaded old window -> getter null; explicit next create gets second instance. Replay old closed callback while second is live -> getter still second. No spontaneous retry. |
| w09 close during load rejects and permits fresh call | Hold load, close owned window -> creation rejects BUSINESS_WINDOW_CLOSED_DURING_LOAD, getter null; explicit next same-mode create succeeds. Settle old load both fulfilled and rejected in separate cases; no unhandled rejection, stale show/clear or second-window destruction. |
| w10 failed load preserves original error and ownership | Reject load with exact Error("chosen-load-failure"); caller receives same object, owned still-live window destroyed once/getter null. Explicit next call succeeds, no autoretry; replay old failure/close callbacks cannot destroy/clear newer instance. Closed already -> no duplicate destroy. |
| w11 fixed mode refuses relaxation | Configure prod then request dev, both while pending and after close/failure in separate harnesses -> BUSINESS_WINDOW_MODE_CHANGED; no policy reinstall/constructor/load/focus/restore side effect. Reverse dev→prod also refuses. |
| w12 partition registrations and CSP replacement | Exact persist:blurby-business only; headers {"Content-Security-Policy":["old1"],"cOnTeNt-SeCuRiTy-PoLiCy":["old2"],"X-Keep":["same"]} -> single canonical exact policy array plus X-Keep unchanged, callback once. Reopen/retry leaves one set of session handlers. |
| w13 Business webContents denies navigation/popups/webview | Invoke captured will-navigate, will-redirect and will-attach-webview handlers with recording preventDefault spies -> once each; popup handler(any URL)->{action:"deny"}. No shell call, alternate navigation or external route. |
| w14 partition denies download and permissions | Invoke will-download -> preventDefault once; permission request callback once(false), permission check false for independent chosen inputs. DefaultSession remains unaccessed, handlers once. |
| w15 default production CSP unchanged | Separate mocked existing window-manager installer(false) captures the exact pinned historical default CSP; compare full value byte-for-byte. Production Business-call harness separately proves it never invokes this installer/defaultSession. |
| w16 mock restoration survives rejection | After both successful and deliberately failing mock cases, Module._load and both original require.cache entries/absence equal their saved originals. New harness observes no previous current window/mode/registration. |

Opposing controls use the SAME assertion/detector, without modifying production source or adding a production negative-control switch: test-local fake header data with a second unremoved mixed-case CSP key must fail the one-key assertion; fake constructor options with sandbox:false must fail the exact-options assertion; an unprevented event must fail the denial assertion; a test-local getter still holding the old instance must fail the same identity assertion. Assert these deliberate wrong observations throw inside their control tests, so the suite itself exits0 when detectors reject them. Log each chosen wrong observation/result. Real production callbacks/options then pass those exact assertions. A trivial missing-module red alone cannot prove the security/lifecycle detectors are sensitive. Do not substitute source-string existence checks for callback/state assertions.

## Exact command draft and retained evidence

Prospective new root `C:/Projects/Blurby-artifacts/business-hb6-t3-w-20261102/`, required absent/owned before creation. Retain `red/`, `green/`, logs and receipts; every identified repair uses a fresh `repair-1/` or `repair-2/` subdirectory and preserves earlier failures. `logs/admission-accounting.jsonl` records the separately consumed allowance/start/UTC deadline, all workers/reviews/calls and final outcomes. `control-receipt.json` names accepted R parent/tree, source/test hashes, exact Node/shell/commands/exits, red assertion failure names, green names/negative detectors and final checkpoint identities. UTF-8 and raw hashes; no F-011 timing/helper writes.

PowerShell7, from the accepted Business worktree, only after separately named Brain admission and receipt of existing qualified Node/dependencies:

```powershell
& 'C:/Program Files/nodejs/node.exe' --check main/business/window.js
& 'C:/Program Files/nodejs/node.exe' --check main/constants.js
& 'C:/Program Files/nodejs/node.exe' './node_modules/vitest/vitest.mjs' run tests/businessWindow.test.js --maxWorkers=1
```

Syntax commands belong only after their files exist/implementation. Expected each syntax exit0; unexpected stderr or nonzero stops. Before implementation run the SAME exact Vitest command against accepted R plus the new red test: exit1 with intended missing-module assertion failures, successful collection, no actual Electron/asset fallback. After implementation exit0, all required named/opposing controls pass. Record every stdout/stderr/actual exit separately; no piping that masks exit status. One Node worker at a time, process-local `NODE_OPTIONS='--max-old-space-size=2048'`; preserve/restore its prior presence/value around admitted commands in outer try/finally. This is a JavaScript old-space cap, not a total RAM guarantee. No install/full suite/typecheck/build/package/native invocation or PDF fixture generation in this mock-only source slice.

Before accepting this source phase checkpoint, exact committed acceptance checks must name their shell and have input-identified base/prescribed/wrong-variant output/exit receipts under current standing rule44. The detector controls above satisfy opposite-outcome coverage only when actually run, not merely written here. Binding phase-scope interpretation is Brain.SR44-source-qualification.2026-11-02.md: the admitted W source-qualification phase creates/freezes/executes those controls before checkpoint acceptance; phase readiness never claims unbuilt tests have passed. Later whole-item/integration gate qualifications remain binding. Source-only planning does not claim these executions happened or activate them now. If final checks cannot fit remaining cap, return partial rather than skipping a review or borrowing R/CPU/B0 time.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Inert owned Business window, fixed partition/CSP/denials and complete mocked lifecycle/security controls | calculable | feature | bounded | high | 50m | — | — |

**Total:** mechanical chain9m · sum9m, 1of1 rows priced from recorded history; separate planner chain50m · sum50m, uncalibrated as an elapsed forecast; serial, no parallel group/timebox. Mechanical price is not an ETA or the admission ceiling. Original HB-6 task3 estimate120m remains historical parent sizing, not W's allowance or elapsed forecast. Proposed W alone <=60minutes/<=40 aggregate calls, including doer, receipts, both ordered reviews, docs and checkpoint; inactive until a fresh Brain admission. R/I/task4 are separate waves, never borrowed/automatic. Maximum two identified in-fence repairs within remaining cap; each changed byte receives ordered re-review. At cap/failure preserve dirt/partial receipts and STOP; no cleanup, reset, new allowance or silent reduced control set.

## Done when — narrow checkpoint only

1. Actual accepted R parent/custody, consumed immutable ruling/pointer, ownership and new targets proved; no unexpected baseline drift.
2. All three path changes match exact API/constructor/security/lifecycle contracts; R's store/two constants and existing default CSP remain intact.
3. Red intended assertion evidence, green named controls/negative detectors and syntax exits are retained with exact input/command/byte identities; no actual Electron/window/session/profile/asset launch occurred.
4. Full diff/stat, exact cached paths/hunks and protected before/after hashes show no truncation or change outside three paths plus approved state/journal. No global Git configuration/hook bypass, fixture modification, package/lock or unrelated dirt staged.
5. Standard Solon-role specification compliance FIRST, Plato quality SECOND on final exact bytes, THEN Marcus state/journal documents. Changed docs/source are covered by the final byte-bound review/checkpoint receipt. Commit/push only the accepted Business checkpoint under Brain's separately admitted explicit `HEAD:refs/heads/eb/blurby-business-1` refspec; verify actual local/remote full identity if publication admitted. No main merge, terminal/provider update, HB-6/phase/epic completion or activation claim.
6. State/journal state W is a mocked source foundation only, package/runtime/primary-window-retarget/I/renderer/preload/assets/scratch/native qualification HELD. D1–D21 and later acceptance remain as recorded; no automatic successor.

## Lessons applied — current scope and statuses

Read current lessons including chronological statuses through LL-175; do not treat a promoted history as a new live lesson. Applicability below is for W, not the whole future Business epic.

| Current lesson or standing rule | Concrete W application |
|---|---|
| LL-002, LL-003 | One isolated main/business module and narrow checkpoint; no main.js/launcher/IPC monolith change. |
| LL-004, LL-063 | Actual isolated quiet-host inputs/branch and explicit publication receipt; no implied CI, pull or live activation. |
| LL-007 | Exact partition-specific deny-by-default CSP, sandbox/security flags, case-insensitive replacement and callback controls; default policy untouched. |
| LL-031, LL-169 | Matching-instance lifecycle/late callbacks preserve newer ownership; w07–w11 exercise stale closes/load settlements and explicit retry only. |
| LL-066, LL-098 | Original load errors remain visible; no unhandled deferred rejection, swallowed caller failure or lost failed receipts. |
| LL-068 | Exact paths/hunks/protected hashes/full diffstat, no reconstruction/truncation or package-unchanged claim. |
| LL-087, LL-088 | Existing CJS constants plus one declaration/export; one serial W owner prevents duplicate initialization/exports. |
| LL-090 | Read actual accepted R parent window-manager/constants/mock sites before edits; historical source alone is insufficient. |
| LL-096, LL-097 | No import-time runtime/session/instrumentation; deterministic per-wave retained logs separate from product behavior. |
| LL-113 | External evidence roots; no scratch mirrored test tree or generated fixtures in repository discovery. |
| LL-118, LL-139 | Explicit dependency closure electron/constants/window-manager/theme-only use; tests forbid hidden default-session/launcher effects. Full product import/native wall remains later. |
| LL-128 | New module/test/artifact-root absence and custody checked before creation; existing targets stop rather than overwrite. |
| LL-134 |50m planner sizing/120m historical parent are not clocks; hard separate60m/40 aggregate admission and bounded repairs govern. |
| LL-137 | UTF-8/raw source/log byte hashes and exact Git parent/tree prevent display normalization from becoming provenance. |
| LL-142 | Synthetic Node/Electron-MOCK results are source checks, not Chromium CSP/worker/WASM/preload/package/native acceptance. |
| LL-143 latest2026-11-02 Observation; rules43/44/55 | Exact commands, collection-safe base red, positive/negative security detectors, named shell and actual identified output/exits; no planner surrogate PASS. |
| LL-144, LL-145 | Actual accepted R checkpoint plus immutable W ruling/pointer, ordered independent reviews and retained frozen charter; no planning-to-execution inference. |
| LL-172 | External accounting only; no timing backfill/change-ledger helper mutation beyond fence. |
| LL-174 | Assert actual outer create call reaches exact constructor/load/denial callback arguments. No new bridge here; complete I/preload/renderer wiring remains separately required. |
| LL-175 | Preserve accepted report.pdf/generator/tmp byte-for-byte; no whitespace cleanup, regeneration or global format exception. |

Other live lesson families were considered by W's actual fence: reading-mode/layout/token/audio/anchor/clock/DOM/format/engagement/cache/auth/cloud/import/normalization (LL-008,014–034,065,067,069–086,089,092–095,099–111,114–117,119–127,129,131,140,150,152,160,161,170,173) have no implemented behavior here. LL-006 atomic product JSON writer, LL-132 child-kill process control, LL-133 charter completion, LL-154/155/163/171 provider schema/text/Seq, LL-157/159 quit drains and LL-165/168 real profile/installer controls are not invoked; their later gates remain held. LL-162 finite coverage is explicit in w01–w16 and never claims all real Electron behavior. Retired/superseded entries stay retired; promoted histories apply through current rules36–55, especially41 exact write fence,46 no provider completion,47 placement,48 deferred full checks,50 no weakened oracle,51 statuses,52 discovery,53 held package gate and54 no claimed native commit-trigger evidence. This semantic scope statement does not claim mechanical U9 or U10 has run.

## Remaining readiness facts

Accepted R source is now pinned above. Remaining entry facts: fresh host/repository/branch/tree/dirt/lock/ownership/absence and existing dependencies, committed ruling+draft consumption, final byte-bound protected U9/U10, independently reviewed exact acceptance checks and Brain's separately named W admission/consumed start. No new algorithm/design question is created by drafting; newly observed contradictory source/security behavior goes to Brain. Only this planning draft is authored now; no source/test/runtime or executor contact has occurred. Historical protected planning-helper reads do not qualify implementation controls.
