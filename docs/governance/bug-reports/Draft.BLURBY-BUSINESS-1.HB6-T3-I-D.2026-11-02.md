# BLURBY-BUSINESS-1 — HB-6 task3 I-D bridge and lifecycle draft

Date: 2026-11-02. PLANNING ONLY / NOT READY / NO SOURCE OR ACTIVATION ADMISSION. Effort: high. Binding inputs: `Brain.BLURBY-BUSINESS-1.HB6-T3-I-architecture.2026-11-02.md`, `Brain.BLURBY-BUSINESS-1.HB6-T3-I-C.2026-11-02.md`, and the complete chronological `Brain.BLURBY-BUSINESS-1.HB6-T3-I-D.2026-11-02.md`, including D15, D16 reservation, sandbox and final STOP-race amendments. Later named precision governs. Brain alone coordinates execution; Roadmap owns canonical planning/feed/closeout. No new item, queue change, reduced feature stub, renderer activation or clock follows.

## Goal, baseline and remaining entry gates

Complete the nine-method Business-owned public bridge together with its six invoke handlers, private file ownership/grants, recent-success acknowledgements, system-theme delivery and shutdown wiring. All handlers/preload/types/lifecycle must be one coherent accepted source candidate. No half handler/bridge/type checkpoint. Full HB-6 task3 remains incomplete until later reserved Task6 launcher integration as well.

Actual accepted R source is `cc7e0018c66186d4a71041b62b7f5c1b14fa1bb2`, tree `a5102932b37ca8f818da96bc150368f426ddd5f3`; read its actual recent.js through read-only Git object, not a guessed checked-out module. Accepted R raw source SHA supplied by parent: `22761ecb0ae0d7addc8d4f14bc64e8035e1d0ba5bf98748ea5dd2e80313eb6dc`. W and I-C are later prerequisites; **I-D execution base must be their actual accepted post-R/W/I-C checkpoint**, not cc7e or an invented future SHA. Their source exceptions do not terminally accept APP-TABS/settings/write-race prerequisites. The existing exception permits only the separately admitted inert source/mock checkpoint, preserving freeze/package/release holds.

Recorded host/placement: RodneySr, `C:/Projects/bb-business`, branch `eb/blurby-business-1`, common Git `C:/Users/estra/Projects/Blurby/.git`. Fresh actual accepted source/tree, ownership/locks/dirt/protected hashes, dependencies, external artifact custody, immutable input consumption, U9/U10 and ordered planning reviews remain entry facts. No probe/install/pull/local-main update is implied. No real Business window before task4 primary-window retarget, complete bridge/renderer/preload/assets and separately admitted scratch/native/package qualification.

Task6 is reserved in full: NO `business-open-window` handler, NO default `preload.js` `blurbyBusiness.open`, NO `src/types/businessLauncher.d.ts`, NO `openPaths` export/stub or path-delivery event in I-D. Task6 later owns those main-handler/default-preload/type/openPaths/delivery contracts atomically after renderer exists. HB-11 cannot consume an unfinished entry point. Validating ctx.getMainWindow now does not authorize using a main-window launcher channel.

## Read order and investigated WHERE

Read AGENTS, shipped Virtuoso/Zeus and declared overlays; current lessons/status updates; frozen Business charter/plan/actual state/latest journal; seed HB-6 plus actual architecture/C/D rulings; actual accepted R/W/I-C source; then the old source sites below. A read-only `git diff --exit-code ac19ea60b6cd8b4fff3e5413b111925b7ef78485 -- <listed old paths>` exited0 during planning, establishing that the inspected checkout copies of main/coordinator/quit/preload/types/theme/settings/test/config sites are unchanged ac19 source. No Git mutation occurred. R changes only its accepted five paths and does not change those sites. Recheck at actual I-D parent; no future source locations are invented.

| File/site | Actual inspected fact and exact implementation direction |
|---|---|
| `main/ipc-handlers.js:8–19` | Existing domain register coordinator. Add exactly `require("./business/ipc").register(ctx);` after current bug-report registration and before function close. Existing re-exports untouched. |
| `main.js:451–486` | ipcContext already has getMainWindow/getSettings/getDataPath/getProjectRoot functions and boolean isDev. No ctx edit/new import block is required. getDataPath at41–46 points to app userData/blurby-data; never call actual live ctx from tests. |
| `main.js:631–650` | Existing createWillQuitHandler stop callback/ordered steps. Add `require("./main/business/ipc").stopNewWork();` FIRST in stop callback, before stopFolderWork. Add exactly `["business", () => require("./main/business/ipc").shutdown()],` immediately BEFORE `["pending writes", whenWritesSettled]`. No third main feature block/import refactor; existing producer, timeout, steps and exit policy unchanged. |
| `main/quit-sequence.js:8–24,27–46` | Real runQuitSteps catches/logs each step and continues; cap stops starting later steps, not a currently running operation. Real createWillQuitHandler synchronously prevents first quit, calls stop once, shares repeated quit state, then awaits uncapped producer in finally before final app.quit. READ ONLY; I-D tests this real code, does not replace it. |
| accepted R `main/business/recent.js` | Actual CJS export createRecentStore({getDataPath}); factory snapshots native absolute root without I/O. getRecent/addRecent/removeRecent are queue-ordered Promises; reads latest disk; writes only accepted explicit operations. close marks closing synchronously and returns one Promise draining accepted work, including failed callers; close does not certify all operations succeeded. Internal path helpers are private, not callable exports. I-D must implement equivalent small lexical validation in its own module or use C's open admission, never import a nonexistent R normalizer. |
| future accepted W `main/business/window.js` | Exact `{createBusinessWindow,getBusinessWindow}` under W ruling. I-D uses only getBusinessWindow; no creation/activation. Read actual accepted bytes/locations at entry, never infer a future W commit or line number. |
| future accepted C `main/business/read.js` | Exact createReadController API from C ruling, including generation/open/read/close/getPath/invalidate/stopNewWork/shutdown. C owns read leases/IDs/global I/O serialization; I-D does not reimplement byte reading or widen C. Actual accepted bytes/locations remain an entry gate. |
| `preload.js:1` and event wrappers | Existing default preload uses only electron import, contextBridge and narrow wrapped event callbacks. It is READ ONLY. New sandboxed preload must be even narrower: ONLY require("electron"), no node:path/fs/local constants/module. |
| `src/components/ThemeProvider.tsx:157–181,187–215` | Existing provider initial theme blurby, truthy saved theme handling, Boolean(einkMode), separate system resolution, arbitrary accent/font values and renderer fallback. D15 precisely freezes Business projection; do not add theme enums/sanitization/new defaults. |
| `main/migrations.js:298–308`, `src/types.ts:149–153,172` | First-run defaults theme dark/eink false/null accent/null font. Existing BlurbySettings theme enum is NOT BusinessState's string type; new Business type must be independent, no shared src/types.ts edit. |
| `main/ipc/state.js:15–28` | Existing get-state returns broader settings/library and get-system-theme uses existing manager. Business must NOT call/forward it; return only its exact five-field projection and narrow own event. |
| `tests/documentsOpenSource.test.js:14–59`, `tests/ipcPathTrust.test.js` | CJS createRequire/Module._load mock/restore patterns. Use exact parent-module-aware overrides/cache restoration; never load real electron/main.js. Do not copy old fixture cleanup into new retained evidence. |
| `tests/quitSequence.test.js:25–45,101–278,401–425` | Fake app models Electron ignoring async will-quit; real handler tested for cap, failure-continue, repeated quit and uncapped producer; main.js itself only source-inspected because import locks/starts app. New Business quit tests reuse these patterns with REAL quit-sequence plus REAL Business lifecycle; source-check the two main edits separately. Existing tests remain byte-identical. |
| `tsconfig.json`, `vite.config.js`, `tests/setup.js` | Project includes src/tests; Node Vitest setup only supplies PDF DOM shims. No real browser/electron required. Main project typecheck remains a later full gate unless separately admitted; targeted external declaration checks are specified below, exact installed compiler control exits must be frozen before pointer finalization. |

## Exact owned source fence

- A `main/business/ipc.js` — all new IPC/grant/owner/ack/theme/lifecycle logic, CJS export EXACT `{register,stopNewWork,shutdown}`.
- M `main/ipc-handlers.js` — one register line only.
- A `preload-business.js` — electron-only sandbox preload, exact public Business API.
- A `src/business/businessAPI.d.ts` — exact Result/error/state/document/range/API types and Window.businessAPI declaration, no shared types/default launcher change.
- M `main.js` — ONLY two thin inline cached-require edits above.
- A `tests/businessIpc.test.js`, `tests/businessPreload.test.js`, `tests/businessLifecycle.test.js`, `tests/businessQuit.test.js` — named controls below; no existing test edit or replacement oracle.
- Approved item state.md and append-only journal.md after ordered review; no other canonical governance/timing/BUG/provider mutation.

Preserve accepted R/W/C production/tests/constants, generator/report/tmp, frozen charter/storyboard/seed/matrix and unrelated perf dirt. No `main/quit-sequence.js`, default `preload.js`, native settings/theme store, renderer/viewer/adapter, file associations, package/lock/build/dependency/source-freeze/shared-core change. Product lane Business; execution surface D plus independent declarations/tests, no shared core touches. Serial after actual accepted I-C; no conflicting source writer. `main/**` and root preload are package-included: **PACKAGE QUALIFICATION HELD**, never package unchanged. New preload need not be packaged/activated until later explicit packaging work; do not claim current package includes it.

## Public type contract — nine method names, no raw IPC

`businessAPI.d.ts` exports these types; use equivalent formatting, never widen their semantics:

```ts
export type BusinessSystemTheme = "dark" | "light";
export type BusinessErrorCode =
  | "BUSINESS_INVALID_REQUEST" | "BUSINESS_UNAUTHORIZED" | "BUSINESS_PATH_NOT_GRANTED"
  | "BUSINESS_DOCUMENT_STALE" | "BUSINESS_DOCUMENT_CLOSED" | "BUSINESS_SHUTTING_DOWN"
  | "BUSINESS_ID_EXHAUSTED" | "BUSINESS_FILE_INVALID" | "BUSINESS_FILE_CHANGED"
  | "BUSINESS_FILE_EOF" | "BUSINESS_FILE_NOT_FOUND" | "BUSINESS_FILE_ACCESS_DENIED"
  | "BUSINESS_FILE_IO" | "BUSINESS_RECENT_INVALID_DATA" | "BUSINESS_RECENT_IO"
  | "BUSINESS_DIALOG_FAILED" | "BUSINESS_UNAVAILABLE" | "BUSINESS_INTERNAL_ERROR";
export type Result<T> = { ok: true; data: T } |
  { ok: false; error: { code: BusinessErrorCode; message: string } };
export interface BusinessState {
  theme: string; einkMode: boolean; accentColor: string | null;
  fontFamily: string | null; systemTheme: BusinessSystemTheme;
}
export interface BusinessDocument { id: number; path: string; length: number; initialData: Uint8Array; }
export interface BusinessRange { begin: number; data: Uint8Array; }
export interface BusinessAPI {
  getRecent(): Promise<Result<string[]>>;
  removeRecent(path: string): Promise<Result<null>>;
  openDialog(): Promise<Result<string[]>>;
  readFile(path: string): Promise<Result<BusinessDocument>>;
  readFile(file: File): Promise<Result<BusinessDocument>>;
  readRange(id: number, begin: number, end: number): Promise<Result<BusinessRange>>;
  closeFile(id: number): Promise<Result<{ closed: true }>>;
  documentOpened(id: number): Promise<Result<null>>;
  getState(): Promise<Result<BusinessState>>;
  onSystemThemeChanged(callback: (theme: BusinessSystemTheme) => void): () => void;
}
declare global { interface Window { businessAPI: BusinessAPI; } }
```

Two readFile overloads share ONE method name/implementation; no public third source argument. Promise Result remains public, not unwrapped into custom Errors whose code is lost across contextBridge. Uint8Array bytes use Electron structured clone; do not JSON.stringify them into arrays/objects or expose Buffer.buffer. Expose exactly the nine names on `contextBridge.exposeInMainWorld("businessAPI", api)`, no raw invoke/send/ipcRenderer/source override/File.path/getPathForDrop/window-opening method or metadata object.

### Fixed public error messages

| Code | Exact message |
|---|---|
| BUSINESS_INVALID_REQUEST | Invalid Business request. |
| BUSINESS_UNAUTHORIZED | This window cannot perform that action. |
| BUSINESS_PATH_NOT_GRANTED | Choose this file before opening it. |
| BUSINESS_DOCUMENT_STALE | This document is no longer current. |
| BUSINESS_DOCUMENT_CLOSED | This document is closed. |
| BUSINESS_SHUTTING_DOWN | Business is closing. |
| BUSINESS_ID_EXHAUSTED | No further document identifiers are available. |
| BUSINESS_FILE_INVALID | This file cannot be opened. |
| BUSINESS_FILE_CHANGED | This file changed while it was open. |
| BUSINESS_FILE_EOF | This file ended unexpectedly. |
| BUSINESS_FILE_NOT_FOUND | This file was not found. |
| BUSINESS_FILE_ACCESS_DENIED | This file cannot be accessed. |
| BUSINESS_FILE_IO | The file operation failed. |
| BUSINESS_RECENT_INVALID_DATA | The recent-file list is invalid. |
| BUSINESS_RECENT_IO | The recent-file list could not be updated or read. |
| BUSINESS_DIALOG_FAILED | The file dialog failed. |
| BUSINESS_UNAVAILABLE | Business is unavailable. |
| BUSINESS_INTERNAL_ERROR | The Business operation failed. |

Map exact C codes into this fixed table; no error.message/native code/path/stack/cause echo. R invalid data preserves its public code; R BUSINESS_RECENT_CLOSED -> SHUTTING_DOWN; all other R I/O -> RECENT_IO; dialog reject -> DIALOG_FAILED; unexpected main fault -> INTERNAL_ERROR. Preload invoke/serialization transport failure -> UNAVAILABLE with its fixed message. Invalid subscription callback alone throws TypeError("BUSINESS_INVALID_REQUEST") before registering; malformed ordinary public invocation resolves INVALID_REQUEST Result before invoke to the sandbox extent below. Missing/invalid theme fields use D15 projection, not an error or enum redesign.

## Channels, payloads and sandbox validation

Register exactly these six invoke handlers; theme is a separate event. Main accepts one payload argument only; no omitted payload or extra positional arguments. Each payload is a plain Object.prototype/null-prototype object with EXACT enumerable own DATA string keys, no extra/nonenumerable/accessor/symbol key, no arrays/custom prototypes/coercion. Inspect descriptors/Reflect.ownKeys, never invoke getters to validate. Catch validation-trap failures as invalid request; sender gate precedes payload access/I/O. No generic validation framework or new dependency.

| Channel | Exact payload | Success data / API |
|---|---|---|
| business-get-recent | `{}` | string[] / getRecent |
| business-remove-recent | `{path}` | null / removeRecent |
| business-open-dialog | `{}` | string[] / openDialog |
| business-read-file | `{op:"open",path,source:"path"|"file"}` | BusinessDocument / readFile |
| business-read-file | `{op:"read",id,begin,end}` | BusinessRange / readRange |
| business-read-file | `{op:"close",id}` | `{closed:true}` / closeFile |
| business-document-opened | `{id}` | null / documentOpened |
| business-get-state | `{}` | BusinessState / getState |
| business-system-theme-changed | event payload ONLY dark or light | onSystemThemeChanged; no invoke handler |

Preload requires ONLY electron `{contextBridge,ipcRenderer,webUtils}`. No Node path/fs/local constants/shared main module or hidden import framework. Strict wrapper arity; scalar string/id/offset validation without coercion; safe positive id, safe offsets0<=begin<end. Noargs wrappers always invoke with `{}`. String path must be nonempty/NUL-free; full native absolute/normalization/device/drive-root rules are MAIN authoritative. Do not duplicate main path parser, range chunk constant, descriptor length or1MiB limit in sandbox preload merely to avoid an invoke. Welltyped invalid native path/span goes main -> INVALID_REQUEST before file I/O.

For readFile exactly one string uses private source:path. Every nonstring goes directly to native webUtils.getPathForFile(input) inside catch; native File brand validation decides it. Returned path must be string/nonempty/NUL-free, else INVALID_REQUEST without invoke; forged object, constructed File with empty disk path and native webUtils throw return fixed INVALID_REQUEST, never raw error. No .path read or cross-world instanceof File. Native absolute/path grammar of that returned string is checked in MAIN before I/O. No public provenance flag or File object crosses IPC.

onSystemThemeChanged validates function, registers one wrapped event handler that drops IPC event and invalid payloads, calls callback only with dark/light, returns idempotent unsubscribe removing THAT exact wrapper once. No broad removeAllListeners or unrelated listener removal.

## Ownership, path grants and awaited admission

register(ctx) import/factory initialization is inert until called. Validate exactly four functions getMainWindow/getSettings/getDataPath/getProjectRoot and boolean isDev before effects. Create actual R store at register using ctx.getDataPath; add one nativeTheme updated listener; register once, second call throws Error BUSINESS_ALREADY_REGISTERED. stop/shutdown before register are harmless permanent stop: later registration cannot reopen Business. Exact failure branding of pre-stopped/invalid ctx registration remains a narrow technical seam below; do not invent half registration side effects.

Every request FIRST verifies current live `getBusinessWindow()` and exact `event.sender === win.webContents`, live wc, `event.senderFrame === wc.mainFrame`, and BOTH `senderFrame.url` and `wc.getURL()` equal the expected FULL route. Dev exactly `http://localhost:5173/business.html`; production exactly `pathToFileURL(path.join(ctx.getProjectRoot(),"dist","business.html")).href`. No query/hash/origin-only/basename/relative/file-scheme relaxation. Main/reader/old window/subframe/wrongURL is unauthorized before any payload getter, recent read, grant or file I/O. I-D does not implement the reserved primary-main-window sender route.

Lazily bind the current trusted Business window/document generation BEFORE accepting work, using its actual controller factory and captured opaque token. Keep owned controller/release provenance for all work still draining; never drop failed release state because current owner changed. Attach wc mainframe did-start-navigation/did-navigate-in-page and render-process-gone/destroyed, plus owned BrowserWindow closed hooks. Actual replacement/navigation/gone synchronously revokes dialog grants/ack admission and invalidates controller generation; immediately observe/retain any asynchronous invalidate failure. A mere blocked will-navigate attempt is not proof navigation committed. Use mainframe event flags/identity, not every subframe event; never serialize generation tokens.

Capture owner/wc/mainframe/generation before ANY awaited permission/dialog/R/read/ack operation. After EVERY await check both SAME trusted owner/generation AND !stopping before creating a grant/lease/new I/O/recent operation/success handoff. Do not reauthorize a stale continuation against a newer current generation. Never close/invalidate all documents for normal one-tab close. Existing active read may finish normal close per C; post-await handoff checks owner/generation/stopping, not a fresh getPath that would incorrectly discard permitted normal-close completion. For stale/stopping failures use the final ruled precedence below, still awaiting Brain's exact tie disposition.

Dialog: `dialog.showOpenDialog(currentBusinessWindow,{properties:["openFile","multiSelections"],filters:[{name:"PDF",extensions:["pdf"]}]})`. Canceled -> []; normalize/validate all selected paths with the same strict R native lexical rules, no stat/read/PDF parse. AFTER await revalidate captured owner/gen/!stopping before installing reusable generation-local grants and returning paths. Do not install partial grants from a failed/invalid dialog list. Exact treatment of malformed non-canceled native dialog output remains a narrow control seam below.

Path open: normalize MAIN native lexical input first after sender/payload checks, never device/root-relative/drive-relative/NUL/relative. Private source:file is accepted only through trusted sandbox preload discriminator, not a renderer-controlled flag. Source:path must match this generation's reusable dialog grants OR actual CURRENT R.getRecent() list at that open invocation. Await R read inside handler then recheck captured owner/gen/!stopping BEFORE controller.open. No cached recent list, extension/magic/existence access, ungranted file read or new grant on arbitrary removeRecent. Removing recent leaves independent dialog grants intact. Trusted-main openPaths grants remain Task6, not currently active.

Controller.open(path, capturedGeneration) owns pending lease before filesystem open by C. IPC does not reopen the file or allocate/read entire PDF. Delegate range bounds/1MiB/metadata/partial read/error/close/ID rules to accepted C. No new document-length or document-count cap, no claim of hard whole-viewer RAM. Controller close resolves undefined/no-op on absent syntactically valid id; IPC success wraps `{closed:true}` only after its awaited result and owner checks. Failed close remains failed, never false closure. A renderer may request close only after exact sender gate.

## Acknowledgement is successful-open reporting, not read success

Renderer Task5 will call documentOpened ONLY after actual PDF.js successful open. Main cannot independently prove decoder/password status; read/open alone NEVER calls R.addRecent. Wrong-password/cancel/read-error workflow sends no acknowledgement. Acknowledge id only, never renderer path.

For a new ack, capture synchronous controller.getPath(id) and current generation, install a pending map entry keyed by owner/generation/id and immediately admit exactly one R.addRecent(path) operation. Concurrent acknowledgements admitted while live join that pending write. Successful live-id duplicate returns Result(null) without another write. Failed write does not set recorded; later manual ack can retry only while descriptor remains live/same generation, no automatic retry.

closeFile marks any ack entry closed and starts controller.close immediately (before waiting for admitted recent write); already-admitted ack write cannot be canceled/erased and must drain. Previously joined callers receive success if captured owner/gen still trusted and not stopping after write, even if that document closed in the meantime; do not require getPath again after completion. New ack after closed is refused. Retain pending closed entry only until write settles, then remove; successful live marker remains only with its live lease. No forever-growing closed-ID tombstone map.

On owner navigation/shutdown, revoke future ack admission immediately; already admitted R writes still drain. Stale/stopping response does not mean persisted write was rolled back. Observe caller/native failures separately from R.close's fulfilled drain. Every pending write/retained cleanup Promise gets a rejection observer at creation; no unhandled Promise or ignored catch.

## D15 exact state and theme event

getState success has EXACT five keys `{theme,einkMode,accentColor,fontFamily,systemTheme}`. Get settings via trusted ctx; inspect own property DATA descriptors only, never accessor values. Missing/accessor/nonobject treated missing:

- theme is ANY nonempty string EXACT, including whitespace/unknown; else blurby. Preserve system unchanged. Actual defaults dark remain dark because getSettings supplies dark, not because Business invents a dark fallback.
- einkMode Boolean(own value).
- accentColor/fontFamily: any string EXACT including empty/arbitrary CSS; otherwise null. No trimming, length/hex/font/theme whitelist, brand override or glow parsing in main.
- systemTheme only dark/light from nativeTheme.shouldUseDarkColors.

Only one nativeTheme updated listener per registration, no polling/settings write/default broadcaster widening. Before owner exists, after navigation/loss/destroy/untrusted route or stop, send nothing. For current trusted owner send ONLY business-system-theme-changed with the scalar dark/light. Full sender/mainframe/route trust applies at delivery too; no historical wc or main-window broadcast. Remove this exact listener on stop before any async shutdown wait.

## Permanent stop, owned drain and real quit ordering

stopNewWork synchronously FIRST sets global permanent stopping, invalidates ALL current binding generations/revokes all grants/ack admission, stops delivery/removes theme listener and stops all owned controllers. Observe/retain invalidation/release jobs. This must happen BEFORE shutdown snapshots controllers/acks, so an already-awaited dialog or R.getRecent cannot resume later to create a new grant, lease or recent operation after close/snapshot.

shutdown is a non-async wrapper returning ONE retained identical Promise, calls stop synchronously, attempts ALL owned controller.shutdown releases and R.close, waits their owned pending opens/reads/releases/accepted ack work with all-settled semantics, then surfaces first deterministic release failure after all attempts. Do not chase an ever-growing unrelated global I/O queue; C defines owned snapshots. R.close itself drains failed callers without changing their failures into success. Never erase failed handles/releases or silently clear them. The precise deterministic failure traversal can be stable controller creation order followed by retained release-job order and R.close; if Brain requires a different existing ordering, freeze it before admission rather than letting completion timing select a winner.

Exact main edits only:

```js
// FIRST line inside the existing stopNewWork callback:
require("./main/business/ipc").stopNewWork();
// Exactly one new step, immediately before existing ["pending writes", whenWritesSettled]:
["business", () => require("./main/business/ipc").shutdown()],
```

Existing runQuitSteps failure logs Business then continues to pending writes; timeout warns/cuts and may leave Business unresolved; neither is successful drain qualification. No timeout increase, async will-quit listener, new hard-exit policy or quit-sequence edit. Preserve uncapped producer await even after cap/failure. Repeated quit during flush remains canceled and starts no duplicate work; final quit proceeds once.

## Exact test surfaces and mock ownership

All new tests use Vitest/Node source controls only. No real Electron/window/browser/profile/CIM/network/application import. Snapshot/restore Module._load and only exact require.cache entries for module-under-test plus relevant accepted Business modules in finally/afterEach, including rejected cases. Parent-module-match fake replacements avoid intercepting unrelated require requests. Never fall through require("electron") to a binary. Restore fs module-object spies and fake timers only after owned promises settle; retained failed promises remain observed. No global process/env mutation left behind.

- IPC suite: actual new ipc.js, mocked W getBusinessWindow, fake Electron ipcMain/dialog/nativeTheme/wc/frame EventEmitters. Use actual R/C in selected composition cases; small explicit R/C doubles only for isolated permission/race orchestration, never claim their mock result requalifies R/C file behavior.
- Preload suite: read actual preload source then execute it in Node vm sandbox with ONLY a controlled require("electron") and contextBridge capture. Any other require fails. No process/Buffer/path/fs or renderer-controlled import is injected as a product capability. Capture exact nine exposed methods; use fake webUtils native-brand route (identity sentinel/WeakMap) to prove method forwarding, never claim Electron's real File-brand behavior from that mock. Cross-realm IPC payloads in integrated mocks must be structured-cloned into main's realm before main plain-object validation, matching Electron's actual transport; do not relax main's prototype rule merely to accommodate vm objects.
- Lifecycle suite: use REAL accepted R store/C controller with their real module-object references; path-filter fs.promises/read-handle and jsonStore.writeJSON spies to the exact case-owned Business paths. Fake metadata/read handles/deferred recent writes exercise composition/drain without user I/O. R durability/C range algorithms were accepted earlier; this suite verifies their actual queue/lifecycle APIs are invoked/awaited in correct order. No production DI framework or reimplemented close stub is substituted for these composition controls.
- Quit suite: REAL createWillQuitHandler/runQuitSteps from unchanged quit-sequence, REAL new Business lifecycle, fake app that ignores handler's Promise and only honors synchronous preventDefault, fake timers/deferred operations. Read main.js source for exact two-line wiring (do not import main.js); combine real behavior test with exact source-site assertion. Existing quit tests remain untouched.

Prospective new artifact root `C:/Projects/Blurby-artifacts/business-hb6-t3-i-d-20261102/`, require fresh absence/ownership before creation. New tests take process-local BUSINESS_ID_TEST_ROOT explicitly for retained case artifacts; no fallback to os.tmpdir/live profile. Under an admitted phase use distinct prep/base/opposing/green/repair subdirectories. Permitted actual test filesystem resources are tiny own fixture/receipt/source-copy files only, never a PDF/user profile; mocked real C/R operations are confined by spies to explicit synthetic paths below this root. No deletion/cleanup of new files, local work or evidence. Parent/root directories precreated only by separately admitted owner; no recursive overwrite reuse. Logs/accounting remain external, not discovery.

## Named controls and opposing cases

Each row expands into independent named Vitest cases with literal expected fixed Result/error/side-effect counts. Use deterministic manual Promise releases and fake timers, never elapsed sleep races. Preserve negative-before-prescribed evidence under SR44 source-phase interpretation before checkpoint acceptance, not a claim that unbuilt tests have run before readiness.

| Case ID | Required exact observation |
|---|---|
| id01-import-register | Import creates no store/controller/window/handler/theme listener/I/O. Invalid ctx function/boolean shapes cause no side effect; valid register creates one R factory, six invokes and one theme listener. Re-register fails ALREADY_REGISTERED. No Task6 handler/openPaths export. Pre-stop then register cannot reopen. |
| id02-sender-first | Primary main, reader, old wc, destroyed wc, subframe, wrong mainframe identity, frameURL!=wcURL, query/hash, origin-only/basename-only URLs all UNAUTHORIZED before payload getters/R/dialog/C. Exact dev and exact pathToFileURL prod pass; basename-same sibling does not. |
| id03-closed-payloads | Every channel/op valid exact own DATA shape passes its control; arrays/custom prototypes/null payload, extra/missing/nonenumerable/accessor/symbol keys, omitted/extra invoke args, bad op/source/id/range reject INVALID_REQUEST without I/O. Getter spies stay0. Null-prototype exact objects accepted. |
| id04-recent | Real getRecent successful string[]; removeRecent wraps null (does not expose store array). R invalid data -> exact RECENT_INVALID_DATA, Rclosed -> SHUTTING_DOWN, EACCES/other native -> RECENT_IO with no raw details. Removing recent does not revoke independent current dialog grant. |
| id05-dialog | Exact owned modal/options; canceled []; multiple valid paths normalize, become reusable only after post-await trust check. No stat/read/PDF check. Dialog native reject -> DIALOG_FAILED. Malformed-output outcome awaits narrow ruling below. |
| id06-path-permission | Untitled/unknown string path -> PATH_NOT_GRANTED, zero C.open. Current recent at invocation or reusable current dialog grant authorizes; Windows case-equivalent normalized match; stale prior-generation grant rejected. source:file accepts only valid main shape/path; public API cannot expose source override. No read or ack write on permission failure. |
| id07-stop-during-dialog | Hold modal, call stop/shutdown, then resolve valid selected paths: no grant/lease/new R operation/success output; proper stopped/stale Result. Rclose snapshot does not miss late work. |
| id08-stop-during-recent | Hold current R.getRecent used for open, call stop/shutdown then resolve list containing path: C.open remains0; no late lease/read/success. Navigation/replacement variants likewise fail old generation without reauthorizing current owner. |
| id09-open-read-close | Real C composition returns exact descriptor/Uint8Array and range DTO, no full buffer leak; IDs/path delegated; wrong id/span/length -> C's mapped errors, no clamping. Close wraps closed:true only after awaited close; close absent valid id no-op. No R.addRecent on open/read. |
| id10-post-read-ownership | Hold open/read, replace owner/navigate/gone/stop then settle: no byte/descriptor handoff. Normal single close does not invalidate sibling tab; accepted active normal-close read may complete per C while queued ones refuse. No old callback clears new owner. |
| id11-revoke-events | Mainframe actual navigation/in-page/render gone/destroy/closed synchronously revoke generation and grants, call real invalidate, observe failed release. Subframe event and blocked will-navigate attempt do not manufacture committed navigation. |
| id12-ack-success | After simulated successful PDF.js workflow ack id -> exactly one R.addRecent(controller-owned path), Result(null); concurrent pending acknowledgements join once, successful live duplicates no new write. No renderer path accepted. |
| id13-no-ack-no-recent | Open/read/wrong password/cancel/read failure without ack leaves recent writes0. Reject ack for unknown/closed/stale descriptor before write. This verifies main's reporting contract, not real decoder proof. |
| id14-ack-failure-retry | Chosen native R.write rejects -> RECENT_IO/no recorded marker; one later explicit same-live-id retry writes once; no automatic retry. Later close/replacement prevents new retry; native message/path never escapes. |
| id15-close-during-ack | Hold accepted Rwrite, call closeFile: controller closing/release initiated immediately, no wait on ack first; settle accepted write persists/drains and earlier ack callers succeed if owner/gen/notstop still trusted. Pending map removed after closed write settlement, no tombstone; new ack closed refused. |
| id16-invalidate-during-ack | Navigation/stop after accepted write never cancels it; it drains, old caller receives proper stale/stopped Result and persisted work remains. Pending failures are observed; R.close's fulfilled drain does not relabel failed ack success. |
| id17-state-d15 | Only five exact keys. Absent/null/nonobject/accessor settings -> blurby/false/null/null plus dark/light. Own theme "system", " ", unknown string preserved; actual defaults dark preserved. eink truthy object/string -> true; strings including empty/arbitrary accent/font preserved, other types null. Getter spies0, no nested settings/library/path/auth/schema secrets. |
| id18-theme-target | Before owner no send; current trusted owner receives exact scalar dark/light on one nativeTheme listener. Wrong route/oldwc/destroy/navigation/subframe/stopping never receives. No default event/broadcaster/settings write/polling. |
| id19-bridge-nine | Execute actual sandbox preload source with electron-only require; exposed own method names EXACT nine, full closed Result envelopes/typed bytes remain, no rawinvoke/open/source flag/path accessor. Every wrapper strict arity and noargs {}; invoke rejection/sync throw -> UNAVAILABLE. |
| id20-bridge-file | String uses private path; accepted fake native File route uses getPathForFile once/private file; forged/constructed-empty/throw/nonstring returned path invalid beforeinvoke. A throwing `.path` getter is never read; no instanceofFile. Welltyped invalid native grammar invokes main then fails before I/O. |
| id21-bridge-range | Unsafe/noninteger id/offset/end<=begin rejects locally without invoke. Welltyped over1MiB/end>length reaches MAIN and refuses before I/O; preload imports no chunk constant or path module. |
| id22-bridge-theme | Invalid callback TypeError exact before on; valid callback sees only dark/light and no event; invalid payload drops; unsubscribe same wrapper exactly once, unrelated subscriptions intact. |
| id23-lifecycle-allsettled | REAL lifecycle stop synchronously before snapshot; shutdown same Promise repeated, all controllers/release jobs and Rclose attempted even if first release fails; deterministic first failure retained after all settle. Pending opening handle retained by C and awaited; no fake closed claim. |
| id24-realquit-order | REAL createWillQuitHandler: first call synchronously cancels; real Business.stop precedes captures; actual accepted ack/controller drains resolve BEFORE global pendingwrites begins. Producer shutdown runs once, final app.quit once. Source assertions tie exact two main lines/order to this configuration. |
| id25-realquit-repeat | Second quit during pending Business/producer flush canceled; no duplicate Business shutdown/Rclose/controller close; final repeated handler does not reflush. |
| id26-realquit-failure | Real Business release fails after all attempts -> existing runQuitSteps logs `[quit] business failed:` with stable failure evidence then starts pendingwrites, not a successful Business qualification. No hard-exit blocking change. |
| id27-realquit-timeout | Hold Business shutdown; advance exact existing QUIT_FLUSH_TIMEOUT_MS: warn/cut, pendingwrites not started; Business still unresolved, not qualified closed. Settle later and verify no new cut steps. Separate producer5000ms case keeps final exit pending after cap until producer resolves. |
| id28-restoration-fence | Rejected tests restore Module._load/exact cache entries/fs spies/timers/env; no actual electron/main.js import, Wcreate call, defaultpreload/sharedtypes modification or Task6 channel. Main old code remains unchanged except exact three coordinator/quit insertions. |

Opposing detectors must use the SAME named assertions: unauthorized fake mainframe/url despite same basename, extra own payload/accessor spy, missing post-await stopping check in a test-owned historical/wrong mock path, duplicate ack-write observation, unwrapped raw error, extra exposed preload method and realquit pendingwrites-before-deferred-Business observation must fail. Preserve those failures/counterexamples before prescribed PASS. Do not weaken predicates/expected messages or production source to fit a failure; copied external wrong variants only where a committed command requires them, never execute real app. Base missing new module/preload assertions fail inside test functions after collection, not top-level missing-import abort.

## Proposed finite staging — no half bridge

Volume is materially larger than R/W: six invoke channels, nine public methods, validation/error table, async ownership/ack/state/lifecycle and real quit integration. Do not call original parent task3 estimate120m or a mechanical row price a promise that all source/tests/reviews fit60minutes. Recommended proposal to Brain: a separately bounded TEST PREPARATION phase, then a separately bounded COMPLETE I-D source checkpoint. Preparation may add only the four test files and explicitly owned external type/fixture files, produce honest base-red receipts on actual accepted I-C, and expose no handler/preload/type/lifecycle. It must stop after its own review/docs/checkpoint. Source phase subsequently lands ALL five production/declaration paths together with complete controls and typed interface; no partial method stub or automatic second admission.

Within the complete source phase, if Brain prices/approves parallel authorship, disjoint author A owns ipc.js + coordinator + two main edits; author B owns electron-only preload + Business declaration. No shared production file ownership; tests frozen from prep except specifically reviewed identified repairs. Sequential compliance -> quality -> docs still inspect one final coherent candidate; all agents/calls/reviews count against ONE aggregate cap. This draft proposes placement/ownership only, does not dispatch agents or authorize executor contact. If the final literal work still cannot fit the separate cap, return a coherent method-GROUP split proposal to Brain BEFORE source authoring; every exposed group's handler/preload/type/lifecycle must remain atomic and full final nine-method outcome stays required. Do not silently publish a reduced API.

##### Proposed preparation task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Author all four deterministic mock/realquit test surfaces plus external type cases and preserve exact accepted-base red receipts | calculable | tests | bounded | high | 45m | — | — |

**Total:** uncalibrated planner45m serial; mechanical price not computed. Separate proposed admission<=60minutes/<=40 aggregate calls includes prep reviews/docs/receipts/checkpoint. No active allowance.

##### Proposed complete source task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Complete coherent main ownership/handlers/ack/theme/lifecycle and bridge/type/quit wiring; qualify frozen source controls and review one atomic candidate | calculable | feature | bounded | high | 55m | — | — |

**Total:** uncalibrated planner55m serial row (possible disjoint-author schedule requires separately reviewed pricing, no automatic Group). Mechanical price/qualified U10 pending. Separate proposed<=60minutes/<=40 aggregate calls includes EVERY worker, control, receipt, ordered review, docs/checkpoint. Each phase max two identified in-fence repair passes within remaining cap; no unchanged retry, cleanup/reset, borrowed clock/calls, reinstall, source push/merge or automatic successor. Cap/failure -> preserve partial/unaccepted candidate and STOP. Estimates are not new grants. Final exact phase split and fence need Brain acceptance before Ready.

## Literal prospective commands and receipt obligations

Use receipted Node24.14.1/PowerShell7 and actual accepted worktree/dependencies, one worker/2GiB process-local JavaScript heap; no total-RAM containment claim. Preserve and restore NODE_OPTIONS and BUSINESS_ID_TEST_ROOT previous presence/value in one outer try/finally around actual commands. Parent must own/create the new external root before tests; no suite-global fixture cleanup. Final flags/exits are phase controls, NOT RUN now.

```powershell
$env:NODE_OPTIONS = '--max-old-space-size=2048'
$env:BUSINESS_ID_TEST_ROOT = 'C:/Projects/Blurby-artifacts/business-hb6-t3-i-d-20261102/base'
& 'C:/Program Files/nodejs/node.exe' './node_modules/vitest/vitest.mjs' run tests/businessIpc.test.js tests/businessPreload.test.js tests/businessLifecycle.test.js tests/businessQuit.test.js --maxWorkers=1
# Prep base: exit1, intended new-interface assertions fail after successful collection; no unrelated control failure.
# Complete source: SAME command, fresh green root, exit0; required named/opposing controls all present.
& 'C:/Program Files/nodejs/node.exe' --check main/business/ipc.js
& 'C:/Program Files/nodejs/node.exe' --check main/ipc-handlers.js
& 'C:/Program Files/nodejs/node.exe' --check preload-business.js
& 'C:/Program Files/nodejs/node.exe' --check main.js
# Four syntax exits0 only after coherent implementation; these parse source without importing/launching it.
```

Targeted external type fixture `<artifactroot>/types/business-api.types.ts` imports exported BusinessAPI/Result/DTO types from the exact candidate absolute declaration. Positive assignments exercise all nine methods/both readFile overloads/discriminated Result/Uint8Array/state string; `@ts-expect-error` cases reject raw invoke/source override, extra method/callback event, wrong state shape and non-result returns. A separate wrong-variant copy deliberately removes the expected error annotation/changes required Result and must be rejected by the SAME installed compiler. Proposed exact command:

```powershell
& 'C:/Program Files/nodejs/node.exe' './node_modules/typescript/bin/tsc' --noEmit --strict --target ES2020 --module ESNext --moduleResolution bundler --lib ES2022,DOM --skipLibCheck 'C:/Projects/Blurby-artifacts/business-hb6-t3-i-d-20261102/types/business-api.types.ts'
```

Positive expected exit0. The exact installed compiler's diagnostic-exit convention and no-ambient-extra-type assumptions must be read/frozen from qualified dependencies before the final pointer; no compiler/dependency exists in this planning checkout and no exit number is invented for its opposing diagnostic. This is a remaining CONTROL-spec seam, not an owner/API question. Do not substitute source-text-only type assertions, full project typecheck, installation or an unpriced extra generic helper. Type fixture/control paths/argv and receipt names are part of the separately admitted external fence.

Retain source/test/type-template/fixture hashes, raw stdout/stderr/actual exact exits, named base/opposing/prescribed verdicts, full actual source parent/tree/pins, cache/mock/environment restoration, protected before/after paths/stat and all failed evidence. External `logs/admission-accounting.jsonl` counts aggregate calls/deadline; `control-receipt.json` names each phase and exact complete/partial outcomes. Receipts must be persisted independently before reporting PASS/STOP, never by skipping failed runs. No F-011 timing backfill or canonical ledger/BUG write. Standard Solon-role compliance FIRST, Plato quality SECOND, then Marcus exact state/journal; no mocked native/package/owner acceptance. Checkpoint disposition/refspec must be separately named by Brain; no default main merge or source publication implied.

## Remaining genuine technical/control seams

All named architecture, nine API methods, error table, sandbox restrictions, task6 reservation and STOP-race requirement are ruled; do not re-ask them. Before final CLI freeze resolve only:

1. **Precise response precedence:** initial exact sender gate FIRST is fixed. For an already accepted request after await, both permanent stopping and stale owner/generation may now be true. Recommend SHUTTING_DOWN before STALE for stopped continuations, otherwise DOCUMENT_STALE; unauthorized only for initial sender rejection. Brain should confirm this exact public classification once, including already-admitted ack writes whose persistence remains intact. No new I/O/handoff is allowed regardless of code choice.
2. **Malformed native dialog return and synchronous registration failures:** native canceled output is[], native rejection DIALOG_FAILED and valid selected paths are ruled. Confirm malformed non-canceled response/path list maps DIALOG_FAILED (recommended), with zero grants; do not invent a new public code. Invalid ctx/pre-stopped registration must fail before effects; exact synchronous Error/TypeError message/code for these nonpublic calls is not named. Freeze only those narrow failure-control expectations; second registration ALREADY_REGISTERED is already fixed.
3. **Actual future accepted C/W and lifecycle control placement:** exact source cut/APIs/private imports must be read when accepted, not presumed. The proposed real-C/R module-object spy composition and deterministic all-settled failure order should be reviewed against those actual bytes; no production DI/refactor permission follows. R's actual private normalizer was verified nonexported, so no missing-helper dependency is assumed.
4. **Finite preparation/source split and targeted type-control diagnostic exit:** accept/prices/fences for the proposed phases (or another coherent grouping), plus exact qualified compiler controls/paths/exits before pointer finalization. No total140/265-style budget fiction or automatic second phase. Host/dependencies/input/provider/readiness facts are separately pending, not algorithm/design questions.

## Lessons and held outcomes

Apply current statuses through LL-175: LL-003 small Business module/thin main; LL-006/R writer retained; LL-007 sandbox/preload boundary; LL-031/169 owner-generation/post-await/stop invalidation; LL-063 actual quiet isolated source; LL-066/098 caller errors and failed receipts observed; LL-068 exact full fence/diffstat; LL-088 disjoint ownership; LL-090 actual source tracing; LL-096/097 explicit source controls/external deterministic receipts; LL-106/107 closed handler/preload/type contract and op fields; LL-113 no discovery pollution; LL-118/139 import/security boundary; LL-128 new-target absence/custody; LL-134 measured price versus uncalibrated estimates; LL-137 raw byte identity; LL-142 source mocks not actual qualification; LL-143 latest44/55 negative/prescribed actual command receipts inside admitted source phase before acceptance; LL-144/145 frozen source/rulings/ordered independent reviews; LL-157/159 real quit drain ordering/uncapped producer; LL-162 finite named cases; LL-172 external accounting/no helper spill; LL-174 wrapper forwards every permitted argument while stripping event/source exposure; LL-175 preserve accepted PDF bytes. Promoted histories apply as current standing rules, never revived live IDs; retired histories do not change fences. Other reading/audio/layout/renderer/cache/native-install/provider mutation lessons are considered outside this inert bridge implementation and remain later gates; final semantic census and qualified U9 remain pending rather than a claimed full mechanical PASS.

Task4 primary-window retarget; Task5 PDF.js adapter/actual successful-open acknowledgement; reserved Task6 primary launcher/openPaths; renderer/preload asset inclusion, scratch/native/CSP/worker/package verification; full suite/build/typecheck/integration; all charter D1–D21 and owner/release gates remain separate. No actual window, user file, profile, PDF decoder, network, module runtime, helper, test or provider action occurred in this drafting task. **NOT READY:** initial full specification draft for technical review and finite staging, not an admission or reduced-feature substitute.
