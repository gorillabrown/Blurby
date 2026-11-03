# BLURBY-BUSINESS-1 — HB-6 task3 I-D bridge and lifecycle draft

Date: 2026-11-02. PLANNING ONLY / NOT READY / NO SOURCE OR ACTIVATION ADMISSION. Effort: high. Binding inputs: `Brain.BLURBY-BUSINESS-1.HB6-T3-I-architecture.2026-11-02.md`, `Brain.BLURBY-BUSINESS-1.HB6-T3-I-C.2026-11-02.md`, complete chronological `Brain.BLURBY-BUSINESS-1.HB6-T3-I-D.2026-11-02.md` (D15, D16 reservation, sandbox, STOP-race), and final `Brain.BLURBY-BUSINESS-1.HB6-T3-I-D-controls.2026-11-02.md`, BB-HB6-T3-I-D-CONTROLS-20261102. All prior technical/control seams are CLOSED by those actual rulings. Read with `Brain.PARALLEL-REVIEW-20261102.md`/0176 and `Brain.SR44-source-qualification.2026-11-02.md`. Later named precision governs. Brain alone coordinates execution; Roadmap owns canonical planning/feed/closeout. No new item, queue change, reduced feature stub, renderer activation or clock follows.

## Goal, baseline and remaining entry gates

Complete the nine-method Business-owned public bridge together with its six invoke handlers, private file ownership/grants, recent-success acknowledgements, system-theme delivery and shutdown wiring. All handlers/preload/types/lifecycle must be one coherent accepted source candidate. No half handler/bridge/type checkpoint. Full HB-6 task3 remains incomplete until later reserved Task6 launcher integration as well.

Actual accepted R source is `cc7e0018c66186d4a71041b62b7f5c1b14fa1bb2`, tree `a5102932b37ca8f818da96bc150368f426ddd5f3`; read its actual recent.js through read-only Git object, not a guessed checked-out module. Accepted R raw source SHA supplied by parent: `22761ecb0ae0d7addc8d4f14bc64e8035e1d0ba5bf98748ea5dd2e80313eb6dc`. **W is actually accepted:** `a5d22ea7307c84e87e672f4d7749dbd1a0115acc`, tree `7ae79d5dd92c121a8bb50b2f0a761bcc84476764`, bounded component assessment `docs/governance/close-outs/Memo.BLURBY-BUSINESS-1.HB6-T3-W-held.2026-11-02.md`. **I-D execution base must still be ACTUAL qualified post-R/W/I-C source AFTER required cleanup29/final reviews/held-source acceptance**, not W alone, local T9b0, uncommitted Q candidate or invented future SHA. Binding `Brain.BLURBY-BUSINESS-1.HB6-T3-I-C-cleanup.2026-11-02.md`, raw SHA `017ccfe9d41f5a750dca52231b3f996dcdcbd2a1eb980b07051ba9c043f482da`, actual message `exec-433e6e5c-1521-47e0-9ae1-c652e6add85b`, leaves Q uncommitted/CLEANUP_QUALIFICATION_HELD until separately admitted cleanup45m40/29suite/reviews/final inherited-candidate closeout. The Q plan `Draft.BLURBY-BUSINESS-1.HB6-T3-I-C-Q.2026-11-02.md` (frozen planning hash `ca978c90744df7a3ca0c001713bd0081a73dde39d6155506855feff34fdfc55f`) is not an accepted source parent. Their source exceptions do not terminally accept APP-TABS/settings/write-race prerequisites. The existing exception permits only separately admitted inert source/mock checkpoints, preserving freeze/package/release holds. ATOMIC later requires its OWN actual accepted I-D TESTPREP parent; no automatic I-D start or fabricated successor ancestry.

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
| actual accepted W `main/business/window.js` at a5d22/tree7ae79 above | Exact `{createBusinessWindow,getBusinessWindow}` under W ruling. I-D uses only getBusinessWindow; no creation/activation. Read/rebind actual accepted bytes/locations at I-D entry, no invented future W SHA/line. |
| future actual qualified C `main/business/read.js` AFTER cleanup29/final reviews/held-source acceptance | Exact createReadController API from C ruling, including generation/open/read/close/getPath/invalidate/stopNewWork/shutdown. C owns read leases/IDs/global I/O serialization; I-D does not reimplement byte reading or widen C. T9b0/uncommitted Q is NOT this accepted source. Actual accepted bytes/locations remain an explicit entry wait. |
| `preload.js:1` and event wrappers | Existing default preload uses only electron import, contextBridge and narrow wrapped event callbacks. It is READ ONLY. New sandboxed preload must be even narrower: ONLY require("electron"), no node:path/fs/local constants/module. |
| `src/components/ThemeProvider.tsx:157–181,187–215` | Existing provider initial theme blurby, truthy saved theme handling, Boolean(einkMode), separate system resolution, arbitrary accent/font values and renderer fallback. D15 precisely freezes Business projection; do not add theme enums/sanitization/new defaults. |
| `main/migrations.js:298–308`, `src/types.ts:149–153,172` | First-run defaults theme dark/eink false/null accent/null font. Existing BlurbySettings theme enum is NOT BusinessState's string type; new Business type must be independent, no shared src/types.ts edit. |
| `main/ipc/state.js:15–28` | Existing get-state returns broader settings/library and get-system-theme uses existing manager. Business must NOT call/forward it; return only its exact five-field projection and narrow own event. |
| `tests/documentsOpenSource.test.js:14–59`, `tests/ipcPathTrust.test.js` | CJS createRequire/Module._load mock/restore patterns. Use exact parent-module-aware overrides/cache restoration; never load real electron/main.js. Do not copy old fixture cleanup into new retained evidence. |
| `tests/quitSequence.test.js:25–45,101–278,401–425` | Fake app models Electron ignoring async will-quit; real handler tested for cap, failure-continue, repeated quit and uncapped producer; main.js itself only source-inspected because import locks/starts app. New Business quit tests reuse these patterns with REAL quit-sequence plus REAL Business lifecycle; source-check the two main edits separately. Existing tests remain byte-identical. |
| `tsconfig.json`, `vite.config.js`, `tests/setup.js` | Project includes src/tests; Node Vitest setup only supplies PDF DOM shims. No real browser/electron required. Main project typecheck remains later; exact separate TypeScript5.9.3 noEmit controls below use types:[] and explicit fixture files. Root's inspected compiler source establishes negative exit1; actual quiet package/tsc.js/_tsc.js hashes/version/body remain input qualification, not an unknown exit policy. |

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

register(ctx) import/factory initialization is inert until called. Permanent stopping FIRST throws Error with BOTH code/message BUSINESS_SHUTTING_DOWN, even before ctx validation; otherwise already registered throws Error code/message BUSINESS_ALREADY_REGISTERED. Validate exactly four own-DATA function ports getMainWindow/getSettings/getDataPath/getProjectRoot and own-DATA boolean isDev without invoking accessor ports; validate required root returns. Missing/invalid/accessor ports/booleans/root returns throw TypeError with BOTH code/message BUSINESS_INVALID_CONTEXT, original cause INTERNAL only, BEFORE handlers/listener registration. Do not impose a closed ctx key whitelist: actual main ctx contains other domains.

Call getDataPath once through the inert R factory; snapshot validated absolute getProjectRoot once for the expected production URL, not on every request. getSettings/getMainWindow functions are validated, not called merely to construct a new window; I-D constructs no window. Root lexical validation matches the native absolute rules, without realpath/stat/access. Create R store before registration effects, then acquire exact handlers/theme listener. Keep handlers inactive (UNAVAILABLE) until all registration commits.

Partial registration failure uses only a simple acquired-prefix list/try/catch, not a registration framework. Set permanent stop/poison BEFORE cleanup; residual callbacks refuse work. Record a channel acquired only after THIS ipcMain.handle call returns SUCCESS. Remove ONLY those successful acquired-prefix channels, never the failing/foreign/pre-existing channel or other domains. Off ONLY this exact nativeTheme updated listener if attempted, not removeAllListeners. Attempt all own cleanup, retain primary Error code/message BUSINESS_REGISTRATION_FAILED with original cause/secondary cleanup failures INTERNAL, and throw synchronously. An uncertain native handle-call ownership outcome remains UNCONFIRMED/HOLD; no claim complete unregistration, foreign-handler removal or auto retry. Test-only fresh cache isolation is allowed; the poisoned production module cannot retry. No controller/handle/work exists during registration. These two nonpublic error brands are NOT added to BusinessErrorCode.

Every INITIAL request FIRST verifies current live `getBusinessWindow()` and exact `event.sender === win.webContents`, live wc, `event.senderFrame === wc.mainFrame`, and BOTH `senderFrame.url` and `wc.getURL()` equal the expected FULL route. Dev exactly `http://localhost:5173/business.html`; production exactly pathToFileURL(path.join(the once-validated ctx project root,"dist","business.html")).href. No query/hash/origin-only/basename/relative/file-scheme relaxation. Main/reader/old window/subframe/wrongURL gives BUSINESS_UNAUTHORIZED before payload access, stopping checks, recent read, grant or file I/O. I-D does not implement the reserved primary-main-window sender route. Already-accepted continuations use the separately ruled stop-first precedence below; never reroute them through an initial request gate for a newer owner.

Lazily bind the current trusted Business window/document generation BEFORE accepting work, using its actual controller factory and captured opaque token. Keep owned controller/release provenance for all work still draining; never drop failed release state because current owner changed. Attach wc mainframe did-start-navigation/did-navigate-in-page and render-process-gone/destroyed, plus owned BrowserWindow closed hooks. Actual replacement/navigation/gone synchronously revokes dialog grants/ack admission and invalidates controller generation; immediately observe/retain any asynchronous invalidate failure. A mere blocked will-navigate attempt is not proof navigation committed. Use mainframe event flags/identity, not every subframe event; never serialize generation tokens.

Capture owner/wc/mainframe/generation before ANY awaited permission/dialog/R/read/ack operation. After EVERY await check permanent stopping FIRST -> BUSINESS_SHUTTING_DOWN; ELSE changed/untrusted captured owner/generation -> BUSINESS_DOCUMENT_STALE; otherwise continue. Check before creating any grant/lease/new I/O/recent operation/success handoff. Do not reauthorize against a newer generation. Existing accepted ack R writes drain despite the stale/stopped response. Never close/invalidate all documents for normal one-tab close. Existing active read may finish normal close per C; post-await handoff checks owner/generation/stopping, not a fresh getPath that would incorrectly discard permitted normal-close completion.

Dialog: `dialog.showOpenDialog(currentBusinessWindow,{properties:["openFile","multiSelections"],filters:[{name:"PDF",extensions:["pdf"]}]})`. Read required own-DATA canceled boolean without accessor invocation; missing/wrong type -> DIALOG_FAILED. canceled true ->[]/zero grants; canceled false requires own-DATA filePaths ARRAY of strings, EACH strictly native-path-admissible. Normalize ALL first, then recheck stop-first/captured owner/generation and atomically install grants/return normalized list. Any bad item/nonarray/native rejection -> DIALOG_FAILED and ZERO grants, never an accepted prefix. Empty valid list succeeds[]/zero grants. Preserve valid order/duplicates; grant Set may reuse normalized keys internally, no tab dedup design. Ignore unrelated native result fields such as bookmarks; this native API object is not a closed renderer payload. No stat/read/PDF parse.

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

shutdown is a non-async wrapper returning ONE retained identical Promise, calls stop synchronously, attempts ALL owned controller.shutdown releases and R.close, waits their owned pending opens/reads/releases/accepted ack work with all-settled semantics, then surfaces first deterministic release failure after all attempts. Do not chase an ever-growing unrelated global I/O queue; C defines owned snapshots. R.close itself drains failed callers without changing their failures into success. Never erase failed handles/releases or silently clear them. Use stable controller creation order followed by retained release-job creation order and R.close for the outer all-settled traversal; each accepted C itself selects first release failure by reserved document ID under its binding controls. Completion timing never selects a different first error. No extra public diagnostic API or lifecycle helper is added.

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

Exact DISTINCT phase roots are `C:/Projects/Blurby-artifacts/business-hb6-t3-i-d-t-20261102/` (TESTPREP) and `C:/Projects/Blurby-artifacts/business-hb6-t3-i-d-q-20261102/` (ATOMIC). Require only current phase root absent/owned before creation, never require old T root absent for Q. Each owns logs/, receipts/, os-temp/, types/ with EXACT eight files listed below, identified repair-1/repair-2 if needed, exact review reports, append-only logs/admission-accounting.jsonl and control-receipt.json.tmp/final. No arbitrary external generic runner/framework, source mirror or real application fixture.

New tests use process-local BUSINESS_ID_TEST_ROOT exactly the current phase's root, explicitly set/restored; no os.tmpdir/live-profile fallback. Permitted actual test filesystem resources are tiny own typed fixtures/receipts; mock real C/R calls are path-filtered to synthetic locations under that owned root, never actual PDFs/user profile. No deletion/cleanup/overwrite reuse. Q copies accepted T's eight fixture/config templates BYTE-EXACT into Q/types before compiling against the actual declaration; their relative files targets resolve locally in Q. Never rewrite T evidence. Logs/accounting are external, not repository discovery.

## Named controls and opposing cases

Each row expands into independent named Vitest cases with literal expected fixed Result/error/side-effect counts. Use deterministic manual Promise releases and fake timers, never elapsed sleep races. Preserve negative-before-prescribed evidence under SR44 source-phase interpretation before checkpoint acceptance, not a claim that unbuilt tests have run before readiness.

| Case ID | Required exact observation |
|---|---|
| id01-import-register | Import creates no store/controller/window/handler/theme listener/I/O. Validate own-DATA ctx functions/boolean/root returns, reject accessors without invocation/no handler or listener effects. Prestop wins with exact SHUTTING_DOWN; alreadyregistered ALREADY_REGISTERED; invalid ctx TypeError INVALID_CONTEXT. getDataPath/projectRoot called once, other ports not called just to construct. During each acquired-prefix failure poison first, remove ONLY successful own channels, off only own attempted listener, attempt all cleanup, preserve failing/foreign channel and secondary errors; throw REGISTRATION_FAILED. Residual handler returns UNAVAILABLE, no controller/I/O; uncertain failing-call ownership UNCONFIRMED/HOLD, no same-module retry. All nonpublic code/message exact, no extra public enum. |
| id02-sender-first | Primary main, reader, old wc, destroyed wc, subframe, wrong mainframe identity, frameURL!=wcURL, query/hash, origin-only/basename-only URLs all UNAUTHORIZED before payload getters/R/dialog/C. Exact dev and exact pathToFileURL prod pass; basename-same sibling does not. |
| id03-closed-payloads | Every channel/op valid exact own DATA shape passes its control; arrays/custom prototypes/null payload, extra/missing/nonenumerable/accessor/symbol keys, omitted/extra invoke args, bad op/source/id/range reject INVALID_REQUEST without I/O. Getter spies stay0. Null-prototype exact objects accepted. |
| id04-recent | Real getRecent successful string[]; removeRecent wraps null (does not expose store array). R invalid data -> exact RECENT_INVALID_DATA, Rclosed -> SHUTTING_DOWN, EACCES/other native -> RECENT_IO with no raw details. Removing recent does not revoke independent current dialog grant. |
| id05-dialog | Exact owned modal/options; own-DATA canceled boolean required/getters0; true[]/zero grants; false own-DATA array with all strings normalized FIRST/atomically installed only after trust. Missing/wrong/accessor canceled/filePaths, nonarray or one invalid later item -> DIALOG_FAILED/zero prefix grants; native reject same. Empty list succeeds[]; valid order/duplicates preserved, unrelated bookmarks ignored. No stat/read/PDF check. |
| id06-path-permission | Untitled/unknown string path -> PATH_NOT_GRANTED, zero C.open. Current recent at invocation or reusable current dialog grant authorizes; Windows case-equivalent normalized match; stale prior-generation grant rejected. source:file accepts only valid main shape/path; public API cannot expose source override. No read or ack write on permission failure. |
| id07-stop-during-dialog | Hold modal, call stop/shutdown then resolve valid paths: SHUTTING_DOWN wins even when owner also changed; no grant/lease/new R operation/success. Navigation-only -> DOCUMENT_STALE. Rclose snapshot misses no admitted work. |
| id08-stop-during-recent | Hold current R.getRecent for open, stop/shutdown then resolve containing path: SHUTTING_DOWN, C.open0/no late lease/read/success. Navigation/replacement only -> STALE; stopped+stale -> SHUTTING_DOWN. Initial wrong sender stays UNAUTHORIZED before payload/stopping. |
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

## Approved finite staging — no half bridge

Brain APPROVED I-D-TESTPREP → I-D-ATOMIC as dependent separately admitted cuts. Volume remains six invokes/nine methods plus validation/ownership/ack/state/lifecycle/realquit; parent task3 estimate120m is historical, not an automatically allocated budget or forecast.

1. **TESTPREP <=45minutes/40 aggregate calls:** ONLY four new tests businessIpc/businessPreload/businessLifecycle/businessQuit plus eight external type/config templates, compiler-smoke controls and receipts. ALL five production/declaration paths untouched. Run causal new-module/interface assertion red after successful collection on actual accepted I-C; no main.js import, bridge export/registration acceptance or fake stub. Independent frozen-test reviews and local TEST_ONLY_HELD checkpoint follow; docs here are external receipts, not epic source edits. Positive/wrong Business declaration gates are NOT RUN until ATOMIC creates the declaration. Stop; no automatic next allowance.
2. **ATOMIC <=60minutes/40 aggregate calls:** parent is EXACT accepted test-only checkpoint. ALL five production/declaration paths land TOGETHER, with frozen four tests, all28 complete groups, typed/opposing/syntax gates, parallel same-byte independent reviews, then two epic docs/Git. Preserve test/oracle bytes unless separately reviewed identified repair. No accepted half API/method stub or code checkpoint that exposes incomplete handlers/preload/types/lifecycle. At cap/failure preserve PARTIAL, do not publish a working half bridge or omit controls.

Within ATOMIC, possible separately priced disjoint authors A (ipc.js/coordinator/two main edits) and B (preload/types) share NO production file; test preparation is already frozen. This scheduling idea dispatches nobody and changes no cap. Every worker/review/receipt/docs/Git call counts toward the SAME phase's aggregate limit. Independent compliance/quality reviewers read SAME frozen bytes concurrently under0176; consume compliance PASS FIRST, then accept quality on SAME bytes; early quality is provisional. Repair invalidates affected old-byte evidence, both accepted gates precede Marcus/docs/Git.

##### TESTPREP task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Four deterministic mock/realquit tests, eight external type templates and compiler-smoke/base-red receipts | calculable | test-preparation | bounded | high | 32m | — | — |
| 2 | Independent frozen-test review pair and external held receipt/local test-only checkpoint | calculable | review-checkpoint | bounded | medium | 8m | — | — |

**Total:** conservative serial planner40m,0of2 estimates calibrated;5m reserve under approved45m40 ceiling. Review row includes concurrent readers without a speculative timing discount. Qualified mechanical U10 remains pending; estimates are not medians/ETA/active clocks. No epic-doc/production change in TESTPREP.

##### ATOMIC task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Complete main ownership/handler/ack/theme/lifecycle plus bridge/types and exact thin wiring | calculable | feature | bounded | high | 32m | — | — |
| 2 | Frozen28 source groups, typed/opposing compiler controls and four syntax gates qualify coherent bytes | calculable | qualification | bounded | high | 13m | — | — |
| 3 | Same-byte parallel review pair, compliance-first acceptance, two docs and exact held checkpoint | calculable | review-checkpoint | bounded | medium | 10m | — | — |

**Total:** conservative serial planner55m,0of3 estimates calibrated;5m reserve under approved60m40 ceiling. Full T+Q chain95m is planning, not a new cumulative hard cap or automatically granted time. Qualified U10 pending. If actual requirements cannot fit, preserve partial and STOP before accepting/publishing incomplete work. Maximum two identified in-fence repair passes per phase within remaining cap; fresh outputs retain old failures. No cleanup/reset/reinstall/borrowed clock/source push/main merge/automatic successor. Each cut still needs final readiness, custody, Brain admission and consumed start.

## Frozen literal unit/syntax commands

Use actual qualified Node24.14.1, PowerShell7, existing worktree/dependencies and current phase-owned root. Preserve/restore previous presence/value of NODE_OPTIONS/BUSINESS_ID_TEST_ROOT/TEMP/TMP in ONE outer try/finally. Set NODE_OPTIONS exactly `--max-old-space-size=2048`; TEMP/TMP exactly current root/os-temp. One global quiet test slot, one Node/compiler process/unit worker at a time, no implied full/heavy suite. This is a JavaScript old-space limit, not total RAM confinement.

Freeze this exact argv FROM THE START for red AND green, including absolute Vitest entry, file order and verbose reporter:

```powershell
& 'C:/Program Files/nodejs/node.exe' 'C:/Projects/bb-business/node_modules/vitest/vitest.mjs' run tests/businessIpc.test.js tests/businessPreload.test.js tests/businessLifecycle.test.js tests/businessQuit.test.js --maxWorkers=1 --reporter=verbose
```

Explicit cwd `C:/Projects/bb-business`. TESTPREP env BUSINESS_ID_TEST_ROOT=`C:/Projects/Blurby-artifacts/business-hb6-t3-i-d-t-20261102`; red exit1 from each intended in-case missing new module/interface assertion after successful collection. Do not import main.js or read a missing module source before that causal assertion. ATOMIC env root ends `i-d-q-20261102`; same test bytes/argv, prescribed exit0/all28 groups and subcases accounted for. Environment root is the expected phase difference, not a hidden mode/test classifier. Preserve every actual stdout/stderr/exit; no argv normalization midway through proof.

After coherent ATOMIC implementation ONLY, four serial syntax commands, each expected0; no imports or app launch:

```powershell
& 'C:/Program Files/nodejs/node.exe' --check main/business/ipc.js
& 'C:/Program Files/nodejs/node.exe' --check main/ipc-handlers.js
& 'C:/Program Files/nodejs/node.exe' --check preload-business.js
& 'C:/Program Files/nodejs/node.exe' --check main.js
```

## Exact eight type/config files — no ambient or generated output

Both phase roots own ONLY these types/ files:

1. business-api.positive.ts
2. business-api.wrong.ts
3. tsconfig.positive.json
4. tsconfig.wrong.json
5. compiler-smoke.good.ts
6. compiler-smoke.bad.ts
7. tsconfig.smoke.good.json
8. tsconfig.smoke.bad.json

TESTPREP authors/freezes all eight; Q copies them BYTE-EXACT to its own types/. Relative explicit `files` names mean identical configs consume their own local phase copies. The Business import is the exact candidate absolute module `C:/Projects/bb-business/src/business/businessAPI` in both fixtures/phases, never another checkout/default shared src/types.ts.

Exact compiler options in EACH of four configs:

```json
{"compilerOptions":{"noEmit":true,"strict":true,"target":"ES2020","module":"ESNext","moduleResolution":"Bundler","lib":["ES2022","DOM"],"skipLibCheck":true,"types":[]},"files":["business-api.positive.ts"]}
```

tsconfig.positive.json is exactly this shape; wrong changes ONLY files[0] to business-api.wrong.ts. Smoke good/bad configs use IDENTICAL compilerOptions and ONLY files target compiler-smoke.good.ts or compiler-smoke.bad.ts. No include/exclude/extends/ambient types or incremental/composite output. No emitted JavaScript/.tsbuildinfo permitted; unexpected output remains preserved failure, never cleaned away.

Literal positive Business fixture (compile DATA, never executed):

```ts
import type { BusinessAPI, BusinessDocument, BusinessRange, BusinessState, BusinessErrorCode, Result } from "C:/Projects/bb-business/src/business/businessAPI";
declare const api: BusinessAPI;
declare const file: File;
const recent: Promise<Result<string[]>> = api.getRecent();
const removed: Promise<Result<null>> = api.removeRecent("C:/fixture.pdf");
const dialog: Promise<Result<string[]>> = api.openDialog();
const openedPath: Promise<Result<BusinessDocument>> = api.readFile("C:/fixture.pdf");
const openedFile: Promise<Result<BusinessDocument>> = api.readFile(file);
const range: Promise<Result<BusinessRange>> = api.readRange(1, 0, 1);
const closed: Promise<Result<{closed:true}>> = api.closeFile(1);
const acknowledged: Promise<Result<null>> = api.documentOpened(1);
const state: Promise<Result<BusinessState>> = api.getState();
const unsubscribe: () => void = api.onSystemThemeChanged((theme) => {
  const exact: "dark" | "light" = theme;
});
const validState: BusinessState = {theme:"unknown-string",einkMode:false,accentColor:"",fontFamily:null,systemTheme:"dark"};
function inspect(result: Result<BusinessDocument>): void {
  if (result.ok) {
    const bytes: Uint8Array = result.data.initialData;
    const id: number = result.data.id;
  } else {
    const code: BusinessErrorCode = result.error.code;
    const message: string = result.error.message;
  }
}
// @ts-expect-error Forbidden raw invocation is not public.
api.invoke('forbidden');
// @ts-expect-error Private provenance cannot be a public argument.
api.readFile("C:/fixture.pdf", "file");
// @ts-expect-error Task6 launcher is not this bridge.
api.open();
// @ts-expect-error Noargs method has strict typed arity.
api.getRecent("extra");
// @ts-expect-error IPC event is not a callback parameter.
api.onSystemThemeChanged((_event: unknown, _theme: "dark" | "light") => {});
// @ts-expect-error System theme remains the two-value type.
const invalidState: BusinessState = {...validState,systemTheme:"system"};
// @ts-expect-error Public calls return Result envelopes.
const invalidResult: Promise<Result<null>> = Promise.resolve(null);
```

Wrong fixture is a byte copy with ONLY the comment line immediately before `api.invoke('forbidden');` removed. All other bytes, imports/annotations/options/declaration/compiler remain identical. It must produce EXACT diagnostic TS2339 for that property and exit1; missing module, ambient/config diagnostic or other accidental failure is not the opposing proof. Positive exit0 also rejects unused @ts-expect-error widening. No template changes/oracle adjustment just to obtain a desired diagnostic.

Literal compiler-smoke.good.ts: `const value: number = 1;` plus newline. Literal bad: `const value: number = 'bad';` plus newline. TESTPREP executes good first (exit0), bad (exit1/TS2322); neither imports Business declarations. Positive/wrong Business compiler invocations remain NOT_RUN until ATOMIC has created the actual declaration, never count missing-module output as their negative.

CPU-independent source fact supplied by Brain: Root read installed TypeScript5.9.3 `_tsc.js` emitFilesAndReportErrorsAndGetExitStatus; noEmit diagnostic =>EXIT1, success0. This is NOT quiet-host qualification. Future inputs MUST pin actual existing installed package/version, bin/tsc, lib/tsc.js and lib/_tsc.js raw hashes plus enum/body, pinned5.9.3 lock; mismatch ->HOLD, no install/alternate compiler guessed into the recipe.

Exact compiler argv pattern uses the SAME Node/tsc/cwd/options; only owned config path changes:

```powershell
# TESTPREP:
& 'C:/Program Files/nodejs/node.exe' './node_modules/typescript/bin/tsc' -p 'C:/Projects/Blurby-artifacts/business-hb6-t3-i-d-t-20261102/types/tsconfig.smoke.good.json' --pretty false
& 'C:/Program Files/nodejs/node.exe' './node_modules/typescript/bin/tsc' -p 'C:/Projects/Blurby-artifacts/business-hb6-t3-i-d-t-20261102/types/tsconfig.smoke.bad.json' --pretty false
# ATOMIC, after exact T templates copied and actual declaration created:
& 'C:/Program Files/nodejs/node.exe' './node_modules/typescript/bin/tsc' -p 'C:/Projects/Blurby-artifacts/business-hb6-t3-i-d-q-20261102/types/tsconfig.positive.json' --pretty false
& 'C:/Program Files/nodejs/node.exe' './node_modules/typescript/bin/tsc' -p 'C:/Projects/Blurby-artifacts/business-hb6-t3-i-d-q-20261102/types/tsconfig.wrong.json' --pretty false
```

TESTPREP smoke does not qualify actual Business types; ATOMIC positive0/wrong1+TS2339 do. Unexpected compiler diagnostic/exit stops after raw logs are persisted. No generic nonzero, full project typecheck, source-text-only type pass or framework substituted.

## Inline recorder, complete receipts and immutable outputs

Use ONLY an INLINE Python standard-library coordination driver supplied on stdin to the actual qualified interpreter, no persistent runner/helper framework. Before TESTPREP consume/recheck exact EXISTING interpreter absolute executable/hash/identity, Node/Vitest/compiler entry/version/transitive startup, actual cwd/environment and ACTUAL qualified post-cleanup C source. **The recorder itself may be authored/frozen/bounded side-effect-and-closed-path reviewed INSIDE separately admitted I-D TESTPREP, BEFORE FIRST child invocation**, applying the actual I-D-controls recorder scope together with SR44-SOURCE-QUALIFICATION-20261102. No unbuilt driver/control PASS or another preparation-before-preparation phase is required before Ready. Record exact UTF8 inline text/hash, fixed argv/cwd/env, finite outputs/run IDs and expected exits as immutable data before use. ATOMIC consumes the accepted immutable T recorder/template evidence and freezes/reviews any phase-root/version substitution before its first child; every changed version preserves prior bytes/hash/failures and requalifies affected integrity before reuse. All author/freeze/review/controls count within EACH phase's existing45m40 or60m40, no extra clock or borrowed IC-T admission.

No guessed Python path/install/global config. Driver subprocess uses exact frozen argv lists, shell=False, explicit cwd/env, raw binary stdout/stderr capture and check=False. One process at a time, same global quiet slot/2GiB/TEMP/TMP policy. Persist fresh exclusive raw binary logs, await flush/fsync/close, hash bytes and append a complete JSONL command record BEFORE interpreting/asserting exit/case results. Native diagnostic/execution failure is never silently retried or mislabeled expected red. Actual selected-recorder structured-output/raw-byte/exit integrity qualifies INSIDE the phase BEFORE any compiler/unit evidence is trusted; historical labels/static review/PowerShell casts are not that proof. The SAME integrity predicate must reject extra stdout, malformed JSON/UTF8, wrong exit or raw stream-hash observations, and preserve real failure rather than reclassify it source/compiler negative. Freeze its exact literal inputs/code/argv/expected outputs within the manifest before invocation under SR44, not as unperformed pre-entry proof.

Each phase has its OWN complete UTF8 control-receipt.json.tmp -> final control-receipt.json using IC's explicit exclusive create/write/sync/close/readback/exclusive same-volume hard link/final readback protocol. Retain BOTH names, all failed logs/reviews/typed fixtures; collision or publication failure is preserved STOP. No rename/copy/direct-write fallback, deletion, truncation or backfill. Exact separately persisted reviews are receipts/review-compliance.json and receipts/review-quality.json plus their .tmp companions, same immutable protocol. Append-only logs/admission-accounting.jsonl and logs/commands.jsonl are flushed/synced per complete record; Q only reads immutable T receipts/templates.

### Finite exact artifact and run-ID map

The approved roots remain EXACT `C:/Projects/Blurby-artifacts/business-hb6-t3-i-d-t-20261102/` (TESTPREP) and `C:/Projects/Blurby-artifacts/business-hb6-t3-i-d-q-20261102/` (ATOMIC), no new namespace. Require current root absence only BEFORE exclusive creation, retained ownership/children afterward; no delete/recreate or demand old T absence when Q starts. Freeze the full map below inside admitted TESTPREP before first invocation. ATOMIC's corresponding map is the same literal scheme under its OWN root and actually frozen/copied input templates, never an open wildcard collector.

**Finite run IDs:** TESTPREP owns exactly `recorder-positive`, `recorder-negative`, `compiler-smoke-good`, `compiler-smoke-bad`, `unit-base-red`. ATOMIC owns exactly `recorder-positive`, `recorder-negative`, `unit-prescribed`, `type-positive`, `type-wrong`, `syntax-ipc`, `syntax-coordinator`, `syntax-preload`, `syntax-main`. These names label the EXACT already specified argv: compiler-smoke-good/bad and type-positive/wrong use their explicit respective configs above; unit IDs use the fixed four-file verbose Vitest argv unchanged; syntax IDs map in order to the four already specified Node--check paths. No name filter, alternate unit mode, extra real application/native child or additional compiler command is inferred. Fixture/opposing observations remain recorded inside the existing named unit/type/integrity controls, not extra production variants/children.

Recorder integrity uses the pinned Node and same actual inline driver BEFORE compiler/unit commands. Exact positive argv tail is `['-e','process.stdout.write(JSON.stringify({kind:"business-id-recorder",literal:17,status:"PASS"})+"\\n");']`, expected exit0, stdout literal `{"kind":"business-id-recorder","literal":17,"status":"PASS"}` plus LF, stderr EMPTY. Exact negative tail is `['-e','process.stdout.write(JSON.stringify({kind:"business-id-recorder",literal:17,status:"FAIL"})+"\\n");process.stderr.write("E");process.exitCode=7;']`, expected exit7, stdout literal same fixed JSON with statusFAIL plus LF, stderr exact byte[69]. These are finite recorder-boundary controls, not a new generic helper or API/production behavior. The same detector must catch extra stdout/non-JSON/invalidUTF8/wrongexit/stream-hash observation counterexamples without modifying captured raw evidence; record their caught expected rejections in the one integrity receipt. A collector exception or incidental completion object never counts as successful negative7. Freeze exact actual argv strings/UTF8 bytes before use and do not alter them to fit an outcome. Both phases qualify their actual selected/frozen recorder; no label-only inheritance.

**Exact relative files (no other output filenames):**

| Path set | Boundary |
|---|---|
| `logs/admission-accounting.jsonl`, `logs/commands.jsonl` | Append-only complete accounting/command records; no tmp companion. |
| For EACH run ID listed for THIS phase: `logs/<run-id>.stdout.bin`, `logs/<run-id>.stderr.bin`, `receipts/command.<run-id>.json` | This is finite expansion of the explicit5 or9 IDs, not an arbitrary stem/glob. Raw streams persisted before classification; each command receipt has exact `.tmp` companion. |
| `receipts/inputs.json`, `receipts/candidate.json`, `receipts/recorder.json`, `receipts/recorder-integrity.json`, `receipts/unit.json`, `receipts/types.json`, `receipts/local-checkpoint.json`, optional `receipts/publication.json`, `receipts/Marcus-closeout.json` | Use existing closed ID receipt fields/input rows and exact manifest raw-hash bindings; no new final-receipt schema/extra top-level fields. Store full driver UTF8 text as DATA in recorder receipt with its identity, never another executable utility. |
| `receipts/review-compliance.json`, `receipts/review-quality.json`, `receipts/recorder-review.json` | Exact independent/frozen-driver reviews; compliance accepted FIRST then quality. |
| `control-receipt.json.tmp`, `control-receipt.json`; optional `receipts/control-receipt.compact.json.tmp`, `receipts/control-receipt.compact.json` | Complete final durable receipt and only the already permitted≤18k optional projection binding full hash/all unrun gates; not an extra schema or substitute original. |
| `types/business-api.positive.ts`, `types/business-api.wrong.ts`, `types/tsconfig.positive.json`, `types/tsconfig.wrong.json`, `types/compiler-smoke.good.ts`, `types/compiler-smoke.bad.ts`, `types/tsconfig.smoke.good.json`, `types/tsconfig.smoke.bad.json` | EXACT existing EIGHT fixture/config files; exclusive direct creation/readback as source DATA, NO `.tmp` companions/ninthtype/generatedJS/tsbuildinfo. Q copies exact accepted T bytes, only root/cwd/env changes as already ruled. |
| `os-temp/` | Actual owned process scratch descendants inventoried/preserved, no new fixtures/source/helper/receipt collector or cleanup permission. C/R filesystem interactions in unit cases stay path-filtered MOCK observations, no actual application/user/document files written under an invented case root. |

Every listed durable JSON under receipts, including reviews/manifest data, has EXACT appended `.tmp` companion retained through existing exclusivewrite/sync/close/readback/hardlink protocol. The eight compile-input files are explicitly the exception and have no `.tmp` names. Missing/unused optional files are recorded absent. No arbitrary report/output extension/third manifest root/persistent helper/source mirror. Optional identified `repair-1/` and `repair-2/` may own ONLY the IDENTICAL finite relative map for THIS phase within its actual remaining cap; preserve failed parent-root bytes/results and freeze/review changed version/affected controls before reuse. No third repair or auto budget. Unexpected output/new filename is preserved FAILURE/STOP to Brain, never deleted or silently admitted.

The final complete record uses ONLY `blurby.business.id-controls.v1` below; all source/test/type/config/compiler/driver identities are existing inputs rows and source/test review bindings are exact immutable manifest hashes. These filename clarifications do not widen fiveproduction/fourtest/eighttype fences, sixhandlers/ninemethods/28controls, commandexpectedexits, phasecaps or later gates. Inside-phase freeze/preinvoke review/actual integrity are required before checkpoint acceptance, not fictitious completed pre-entry work.

Receipt contract mirrors IC's closed complete schema with item BLURBY-BUSINESS-1, cut I-D-TESTPREP/I-D-ATOMIC, actual host/admission/start/deadline/end, phase limits/aggregate calls, input path/commit/blob/raw SHA, actual source parent/tree/branch/worktree, command argv/cwd/env/UTC/exit/raw stdout/stderr paths+SHA, source/test/type/config/compiler hashes and every case/subcase expected/observed/status/opposing evidence. Case status PASS/FAIL/NOT_RUN never silently drops an unreached case; receipt status TEST_ONLY_HELD/BRIDGE_SOURCE_HELD/PARTIAL/FAILED. Keep unrunGates explicit. TESTPREP expected causal red is FAIL-with-expected-red evidence, NOT28 implementation PASS; Business type gates NOT_RUN then. ATOMIC no group/subcase/opposing control unexecuted can PASS. Own absent production bytes in T are explicitly absent, never invented hashes. Input fixtures serialize BigInts as canonical decimal strings and bytes as arrays or length+SHA, not backing buffers.

Closed I-D receipt shape, all fields required/no extras; byte identities for all source/test/type/config/compiler/driver inputs are rows in inputs, and multi-file source/test review bindings use their exact immutable manifest raw SHA:

```text
{schemaVersion:'blurby.business.id-controls.v1',admission,item,cut,host,
 startUTC,deadlineUTC,endUTC,limits:{minutes,tools},usage:{aggregateTools},
 inputs:[{path,commit,blob,sha256}],source:{base,parent,commit,tree,branch,worktree},
 commands:[{runId,argv,cwd,environment:{NODE_OPTIONS,BUSINESS_ID_TEST_ROOT,TEMP,TMP},
   startedUTC,endedUTC,exitCode,stdout:{path,sha256},stderr:{path,sha256},
   testBytesSha256,sourceBytesSha256,
   cases:[{id,name,status:'PASS'|'FAIL'|'NOT_RUN',evidenceKind:'FUNCTIONAL'|'STATIC',expected,observed,opposingEvidence}]}],
 reviews:[{role,identity,verdict,sourceSha256,testSha256}],preserved:[{path,sha256}],
 status:'TEST_ONLY_HELD'|'BRIDGE_SOURCE_HELD'|'PARTIAL'|'FAILED',unrunGates:[string]}
```

Absent/uncreated identity fields remain present with null plus the explicit absence observation in case expected/observed; never use a fake hash. Type checks/main-wiring source checks are STATIC, actual IPC/preload/lifecycle unit behavior FUNCTIONAL. Complete final receipt/command logs distinguish qualified local compiler smoke from unrun Business types in T and actual declared-type compilation in Q.

Retain all source/test/type fixture hashes, failed/success command logs, exact actual exits, protected before/after full fence/stat and restore evidence. No production callback writes the receipt. Full receipt remains authoritative; optional compact<=18k projection binds full original hash and preserves every unrun case, never replaces/truncates original. No F-011 helper backfill/canonical ledger/BUG write. Concurrent frozen-byte compliance and quality reading, compliance-first acceptance, both before Marcus/docs/Git under0176. Checkpoint publication/refspec remains separately Brain-admitted; no default main merge or source publication permission.

## Closed technical seams and remaining facts

**All remaining technical/control seams CLOSED** by actual I-D-controls: initial sender-first; accepted stop-first then stale; own-DATA canceled/filePaths atomic normalization and zero-grant failure/order/duplicate preservation; exact nonpublic registration brands/own ports/one-time roots/poison/acquired-prefix cleanup and foreign handler preservation/UNCONFIRMED; approved45m40 TESTPREP then60m40 complete ATOMIC; exact TypeScript5.9.3 noEmit exits/TS2339/independent TS2322 smoke/types:[] eight fixtures and same-declaration controls; separate roots/verbose unit argv/inline Python exclusive recorder. No owner design question is reopened, no raw-default new framework or half bridge is substituted.

**Specification:** full source/control/typed/lifecycle contract compiled. Final qualified U9/U10/live lesson census and concurrent independent same-byte planning review pair remain after this enrichment. Actual source controls run INSIDE their separately admitted phase before checkpoint acceptance under SR44; future unbuilt tests are not a false pre-authoring PASS/failure gate.

**Prerequisites/repository:** accepted W is actuala5d22/tree7ae79; I-D still WAITS for ACTUAL qualified C source AFTER required cleanup29/final reviews/held-source acceptance, then exact accepted I-D TESTPREP parent for ATOMIC. Local T9b0/uncommitted Q candidate is not that source. Current branch/worktree/common-repo/locks/owner/new-target absence/protected hashes and preserved R/W/C/fixture/tmp/perf remain entry facts. No future SHA or unavailable private source is fabricated. Main mechanical WHERE is already investigated; no W-before-planning loop or automatic I-D execution is introduced.

**External register/environment:** existing epic only, no new Status/Seq/terminal operation. Root supplies fresh guarded register/pointer readback; quiet Node/Vitest/TypeScript package+bin/lib hashes/version/exit implementation and Python/driver qualification, current phase's exact absent/owned root/TEMP/TMP/resource slot, immutable consumed input hashes and Brain's separate actual admission/start remain pending. These are custody/qualification facts, not reopened technical choices. Native/package/owner/Task6 gates stand.

## Lessons applied

Apply current statuses through LL-176: LL-003 small Business module/thin main; LL-006/R writer retained; LL-007 sandbox/preload boundary; LL-031/169 owner-generation/post-await/stop invalidation; LL-063 actual quiet isolated source; LL-066/098 caller errors and failed receipts observed; LL-068 exact full fence/diffstat; LL-088 disjoint ownership; LL-090 actual source tracing; LL-096/097 explicit source controls/external deterministic receipts; LL-106/107 closed handler/preload/type contract and op fields; LL-113 no discovery pollution; LL-118/139 import/security boundary; LL-128 new-target absence/custody; LL-134 measured price versus uncalibrated estimates; LL-137 raw byte identity; LL-142 source mocks not actual qualification; LL-143 latest44/55 negative/prescribed actual command receipts inside admitted source phase before acceptance; LL-144/145 frozen source/rulings/ordered independent reviews; LL-157/159 real quit drain ordering/uncapped producer; LL-162 finite named cases; LL-172 external accounting/no helper spill; LL-174 wrapper forwards every permitted argument while stripping event/source exposure; LL-175 preserve accepted PDF bytes. Promoted histories apply as current standing rules, never revived live IDs; retired histories do not change fences. Other reading/audio/layout/renderer/cache/native-install/provider mutation lessons are considered outside this inert bridge implementation and remain later gates; final semantic census and qualified U9 remain pending rather than a claimed full mechanical PASS.

**LL-176 (live Observation) changes this I-D plan concretely:** the actual inline Python recorder must qualify its OWN structured stdout/raw bytes/native exit/receipt boundary inside separately admitted TESTPREP before any child compiler/unit evidence is trusted. Exact recorderpositive0/negative7, literal streams, same-detector incidental-output/malformedUTF8/wrongexit/hash opponents and closed paths are specified above. A PowerShell completion-value cast or static review/history label is not Python proof. If any outer PowerShell copy layer is used, discard ONLY completion-only objects at EVERY layer, preserving actual byte arrays, stderr, exceptions and native exit. A harness/recording/collector failure is never an intended source/compiler negative or green. Preserve changed recorder versions/hashes/old failures, bounded sideeffectreview before each use and actual integrity before checkpoint acceptance. No globalhelper/registry/settings/closedhistoricalinput mutation or infinite pre-entry authoring phase. Root final protected U9/U10/livecensus/independent same-byte reviews remain pending.

Task4 primary-window retarget; Task5 PDF.js adapter/actual successful-open acknowledgement; reserved Task6 primary launcher/openPaths; renderer/preload asset inclusion, scratch/native/CSP/worker/package verification; full suite/build/typecheck/integration; all charter D1–D21 and owner/release gates remain separate. No actual window, user file, profile, PDF decoder, network, module runtime, helper, test or provider action occurred in this drafting task. **NOT READY:** initial full specification draft for technical review and finite staging, not an admission or reduced-feature substitute.
