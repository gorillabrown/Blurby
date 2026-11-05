# Business HB-6 task3 — main-process foundation enrichment draft

Date: 2026-11-02. PLANNING ONLY / NOT READY / NO EXECUTION ADMISSION. Existing epic BLURBY-BUSINESS-1, Seq100.5, P1 viewer. Brain alone coordinates quiet-host execution. This draft neither rewrites the frozen epic/seed nor creates a duplicate epic or registered item.

## Existing task and exact inspected source

Frozen seed: `docs/planning/holding/2026-10-30-blurby-business-tier1/phase1-specs.md`, HB-6 task3: **Business window, partition, CSP, IPC and recent list in main, with tests**, original estimate **2h**, bounded/high. HB-6 Done-when2/3 supply the window and recent-list assertions. Shared D16 requires handler, preload method and renderer type in one commit. The final HB-6 feature includes renderer, entry points, bundle wall and packaged shell acceptance; task3 alone cannot claim those outcomes.

Source inspected as local Git objects, not root-main assumptions: `1bcceb0efede6d33df4bba232f75832247b3f851`, accepted task2 fixture checkpoint. No source/runtime/test operation occurred. That object adds the deterministic fixture/generator and epic state/journal; its state says await a separate task3 admission, HB-6/epic incomplete.

At1bcceb0e:

- `main/business/`, `preload-business.js`, `src/business/`, `tests/businessWindow.test.js` and `tests/businessRecent.test.js` are absent in the Git tree. Recheck actual index/worktree at consumed start; absence in the tree is not permission to overwrite untracked work.
- `main/ipc-handlers.js:8–18` is the domain register coordinator. Seed adds one call: `require("./business/ipc").register(ctx);`.
- `main.js:451–477` context already supplies `getMainWindow`, `getSettings`, `getDataPath`, `getUserDataPath` and other app ports. Do not add Business logic to main.js or expose its whole context to a renderer.
- `main/window-manager.js:31–55` installs default-session CSP;57 onward creates the main BrowserWindow; exports at225–231 do not yet include getPrimaryWindow. Primary-window retarget is seed task4, not task3 by implication.
- `main/json-store.js:32` writeJSON serializes writes per target and uses temp/rename; whenWritesSettled is exported for quit. It does not itself serialize a caller's read-modify-write transaction.
- `main/constants.js:201` exports constants; no BUSINESS constants exist. Seed values: BUSINESS_PARTITION=`persist:blurby-business`, BUSINESS_DATA_DIR=`business`, BUSINESS_RECENT_MAX=20.
- `preload.js:33` exposes existing electronAPI; D16's separate blurbyBusiness launcher and the Business bridge are not present. `package.json` build.files includes main/** and dist/** but not preload-business.js yet. Adding that packaging entry is later scoped work unless Brain explicitly pulls it into a wave.

## Reuse accepted task2, do not regenerate

Keep `scripts/business-smoke/make-fixtures.mjs` and `tests/fixtures/business/report.pdf` unchanged. Accepted source-state generator SHA256164943421fe6b9e8bdaa03b3ff68daee0ee9ec1b24594543a1e1ad0bb8e821a6; PDF SHA256b587c05f21a419b8af6860cc1d7d73f26f35b0fb5bc74d304ff3275995acdcdb. Read actual checkpoint/Brain receipts before relying on host state. Retained report.pdf.tmp and generated perf-baseline-results.json stay untouched/unstaged. No canvas, new dependency, locked/scanned/navigation fixture or PDF rewrite.

## Eligible bounded outcomes and candidate fences

These subwaves are a proposed decomposition for Brain, not three admitted launches. Preserve the seed's120m total; new estimates do not replace historical pricing. Each needs its own <=60m/<=40 aggregate tool admission and reviewed exact paths. Setup/reviews/receipts count; a cap yields an honest partial checkpoint.

| Proposed subwave | Recognizable outcome | Proposed original-estimate allocation | Candidate source/test fence |
|---|---|---:|---|
| T3-R | Isolated recent store honors deduplication/cap/removal and never writes library | 40m | A main/business/recent.js; M main/constants.js (DATA_DIR/MAX only); A tests/businessRecent.test.js |
| T3-W | Singleton Business window uses its own secure partition/CSP; default policy unchanged | 40m | A main/business/window.js; M main/constants.js (PARTITION only); A tests/businessWindow.test.js |
| T3-I | Typed/guarded Business IPC surface is implemented and registered with exact bridge contract | 40m | A main/business/ipc.js; M main/ipc-handlers.js; A tests/businessIpc.test.js; preload/type paths require explicit Brain resolution below |

Run serially on the existing `eb/blurby-business-1` lane, not parallel writers to main/constants.js or epic docs. Each next cut is the accepted prior checkpoint, with new custody/input receipt. The seed's old two-hour task cannot be declared one <=60m dispatch; mechanical table pricing is not elapsed-time feasibility.

T3-I is structurally held until its API/security/D16 and missing-renderer dependencies are frozen. Brain may choose a narrower first recent-store outcome rather than launching all three. No change to the task3 outcome or owner product design is proposed.

## Exact seed acceptance carried forward

### Recent store — tests/businessRecent.test.js

- addRecent(p) persists via existing writeJSON to `<getDataPath()>/business/recent.json`.
- Re-adding moves an existing entry to front without duplication.
- Keep at most20 entries; removeRecent(p) removes the matching entry.
- A spy proves no writeJSON target ends in library.json.
- Freeze tests for concurrent update ordering, failed write and invalid stored data after Brain prescribes the exact store/IPC contract. No direct filesystem write fallback or cloud-sync enqueue.

### Window — tests/businessWindow.test.js

With Electron mocked, createBusinessWindow constructs webPreferences containing preload ending preload-business.js, contextIsolation=true, nodeIntegration=false, partition persist:blurby-business. Its partition CSP includes wasm-unsafe-eval and worker-src self/blob; second call focuses/returns same live instance. Default-session production policy remains byte-identical to the seed's full string (read actual1bcceb0e source), including its approved connect-src list.

The exact Business CSP directive string, development/production URL loading, constructor arguments, closed-window reset and dependency injection contract need Brain prescription before the doer starts. Do not launch a real window to discover these decisions. Window-only mocks are not proof that absent business.html/preload renders or is packaged.

### IPC — tests/businessIpc.test.js, exact API pending

Seed channels are business-open-window, business-get-recent, business-remove-recent, business-open-dialog, business-read-file and business-get-state. Preserve their names; freeze complete payload/return/error and sender/path authorization before authoring. Mock-based registration/round-trip controls must cover allowed callers and wrong-origin/path cases. Do not reuse an unrestricted library handler or expose secrets/library/queue state to Business.

Red tests committed first on the prescribed checkpoint must fail by the intended missing behavior with collection/controls functioning; green commands use PowerShell7 and exact exit0. Candidate commands are the respective complete test paths above; final full-suite/typecheck/build and rule53 remain separately bounded HB-6 gates. No mock pass substitutes for native/packaged shell behavior.

## Technical decisions required from Brain

1. **Decomposition/fence:** accept/revise serial R/W/I outcome boundaries and estimate allocation. Name exact source/test paths before each kickoff; no whole2h task inside a60m cap.
2. **Recent-store contract:** exported API/ctx setup, exact persisted shape and initial/corrupt-data policy; Windows path identity/deduplication without importing library/folder-sync runtime; serialized read-modify-write ordering and failed-save results. The seed only fixes behavioral invariants, not these API choices.
3. **Window contract:** complete partition-only CSP, function arguments/exports, dev/prod loading paths and singleton lifecycle; no policy relaxation on defaultSession. State how this source-only checkpoint handles missing renderer HTML/preload before later tasks.
4. **IPC trust boundary:** exact allowed sender/frame/origin for each channel; open-dialog cancellation/result and file-read payload/limits/allowed-path grant (including drag-in); exact safe get-state theme fields. Context getSettings contains more than Business should receive. Do not defer these choices to CLI investigation.
5. **D16 atomic interface:** must T3-I include preload-business.js and src/business/businessAPI.d.ts (and what exact tests), or stage the whole bridge/handler interface together in a later subwave? Shared D16 says handler/preload/type in one commit. Do not silently violate it or widen into task5/6. The main blurbyBusiness launcher belongs to task6 unless explicitly amended.
6. **Primary-window safety/dependencies:** existing getAllWindows()[0] send/execute sites are task4. Decide whether task4 must precede any real Business window launch; no live launch here before that safety decision. No getPrimaryWindow/window-manager/sync/tts edits are smuggled into task3.
7. **Held prerequisite exception:** current seed says APP-TABS merged and held settings/write-race branches before HB-6; owner/Brain already admitted baseline/task2 after visibility source-window closure, not a blanket exemption for task3 shared runtime writes. Cite the actual permitted source-only start versus integration/merge gate and recheck lane ownership.

## Placement, scope and persistent holds

Product lane Blurby Business, execution surfaceD. Quiet host RODNEYSR, existing C:/Projects/bb-business, branch eb/blurby-business-1, common Git C:/Users/estra/Projects/Blurby/.git, subject to fresh actual receipts. All sustained implementation/checks use that host; root only plans/reviews. Pin exact1bcceb0e or later accepted checkpoint by full commit/tree and immutable enrichment input separately. Recheck protected tracked hashes, frozen packet, fixture, perf dirt and tmp without cleanup.

Forbidden: reader runtimes/shared-core, library/import/TTS/queue behavior, main.js Business logic, task4 retarget files, task5 renderer, task6 entrypoints, package/dependency/lock edits and later fixture enrichment unless Brain explicitly revises a narrow fence. No live provider/status/Seq/terminal operations.

Use standard Virtuoso roles and Blurby overlays; Marcus compliance FIRST, Plato quality SECOND, then item-owned state/journal checkpoint. Exact-path stage source/tests plus approved epic docs; preserve all unrelated dirt and fixture tmp. Source checkpoints may commit/push only under Brain's exact admitted Business refspec; never main merge/release/whole-HB6 completion or automatic successor.

Each eventual subwave needs its own fresh external evidence root and UTF-8 `logs/admission-accounting.jsonl` with consumed start/deadline/aggregate calls across workers/reviews/receipts. No F-011 timing-helper writes. At most two scoped repair passes per failing row within the same remaining allowance; new source/security ambiguity, dependency drift, unexpected writes or cap stops for Brain. No reinstall, reset, clean, stash or destructive rollback. Preserve failing evidence; a later scoped revert requires its own disposition.

Original baseline receipt and fixture acceptance remain inputs, not a fresh current full-suite pass. Rule53 x64/arm64 package pair, x64 scratch proof/packaged shell route, merge-time ARM64 launch, Brain package confirmation, designated integration merge go and owner gate2 remain mandatory later. This task changes package-included main/** files: do not label the application package unchanged merely because package.json is untouched.

## Lessons to apply during final enrichment

LL-003 isolated main/business modules; LL-006 atomic existing writeJSON and ordered store updates; LL-007 partition-only CSP; LL-066 visible failures; LL-106 handler/preload/type interface together; LL-128 absent-target checks; LL-113 external controls outside discovery; LL-137 UTF-8/raw bytes; LL-139 actual import wall remains HB-6's later gate; LL-157/159 existing quit write draining; standing rules36/41/42/43/44/46/47/48/50/52/53/55 govern pins, accounting, reconciliation, red controls, provider permissions and native/package gates. LL-174 applies if the eventual chosen contract adds callback hops; do not assume that architecture now. U9/U10 and independent final pointer review are still pending.

Only this planning draft is authored; no source/helper/provider/runtime operations or executor contacts. No Ready/admission claim.
