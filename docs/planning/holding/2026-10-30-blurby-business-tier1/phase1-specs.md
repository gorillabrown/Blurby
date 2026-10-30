# Blurby Business epic — Phase 1 specifications (HB-6..HB-11)

*Written by write-plan 2026-10-30 for the then item-set entry; moved here when the owner re-scoped the entry to epic-scale (an epic is never planned inside a held entry). Seeds the epic charter's Phase 1 worklist. Source entry: `../2026-10-30-blurby-business-tier1.md`.*

<!-- Written by write-plan 2026-10-30 on main @ faf9a725 (register read 2026-10-30T18:31:30Z, connector+snapshot, not stale). -->

### Readiness

| Finding | Result |
|---|---|
| Specification | PASS — rubric v1.2 U1–U4, U6, U7, U9, U10 for HB-6..HB-11 (no project extensions declared); `lessons --check` and `timing --rows-from-spec` exit 0 for all six items (run 2026-10-30) |
| Prerequisites | PENDING, encoded — APP-TABS-1 (Seq 100) In Flight; LIBRARY-COMPLETION-VISIBILITY-1 (Seq 116) In Flight with an owner-approved exclusive source/test window; the Stage 8 release gate open. Each is written into the items as an explicit wait (U5). Not executable now. |
| Repository | PASS for planning — `main` = `origin/main` = `faf9a725`; no branch exists for any HB item; seven held branches touch HB edit sites (`eb/app-tabs-1`: `preload.js`, `CommandPalette.tsx`; `eb/eink-controls-1`: `main/window-manager.js`; `eb/large-folder-sync-3`, `eb/narrate-trace-labels-1`: `main.js`; `eb/library-write-race-2`, `eb/rename-tmp-race-1`: `main/sync-engine.js`; `eb/win-target-nsis-1`: `package.json`). HB items merge after all seven (Merge order, below). |
| External register | READ ONLY — read through the qualified helper (rule 11a guard PASS, helper `fcfa9295`), provider connector+snapshot taken 2026-10-30T18:31:30Z, `stale: false`. Nothing is written to it; `/roadmap-review` creates the items. |
| Execution environment | PASS with transfer — host RodneySr for now (GoG bandwidth, 2026-10-30), per standing rule 53's temporary placement (ROADMAP.md:204): a new worktree from RodneySr's `C:\Projects\bq-main` (never touch its detached `36ac7466` or `stash@{0}`), `git fetch origin`, `npm ci`, Node 24. New dependencies (`pdfjs-dist` pinned to the installed 5.4.296, `tesseract.js`, the English model) come from npm during `npm ci`; network is allowed by `policy.git.networkOperations`. The arm64 launch runs on Rodney at merge time (R-2026-10-30-2). |

### Roadmap placement

- HB-6 — Placement: after Four tabs: Library, Newsroom, Podcasts, Marketplace (APP-TABS-1, Seq 100), before Blurby server (BLURBY-SERVER-1, Seq 104) — new workstream "Blurby Business", Stage 9; no deadline declared; runs in parallel with RSS-AGGREGATOR-1, PODCAST-SOURCE-1 and BROWSER-EXT-FINALIZE-1 (101–103) by lane ownership; starts only after LIBRARY-COMPLETION-VISIBILITY-1's exclusive window closes; does not run ahead of the head.
- HB-7 — Placement: after HB-6, before HB-9 — same workstream; parallel with HB-8 and HB-11.
- HB-8 — Placement: after HB-6, before HB-9 (HB-9 refuses to cache OCR for locked documents) — same workstream.
- HB-11 — Placement: after HB-6 and after `eb/win-target-nsis-1` lands (both edit `package.json` `build`), before BLURBY-SERVER-1 (104) — same workstream.
- HB-9 — Placement: after HB-7 (search) and HB-8, before HB-10 — same workstream.
- HB-10 — Placement: after HB-9, before BLURBY-SERVER-1 (104) — same workstream; last of the set.

Blurby.Roadmap assigns Seq values at absorption (after 100, before 104) through the qualified helper (rule 11a), and adds the workstream through the lanes → workstreams rename.

### Kickoff

```
Blurby Business, Tier 1 — six items  (HB-6, HB-7, HB-8, HB-11, HB-9, HB-10)
Origin: held plan — 2026-10-30-blurby-business-tier1 (HB-6..HB-11), not yet on the roadmap
Placement: after Four tabs (APP-TABS-1), before Blurby server (BLURBY-SERVER-1) — for the review to apply
Effort: high (HB-6, HB-7, HB-9), medium (HB-8, HB-10, HB-11)
Branch: eb/business-shell-1, eb/business-nav-1, eb/business-locked-1, eb/business-default-pdf-1, eb/business-ocr-1, eb/business-send-1 — each from main @ the sha that carries this plan (faf9a725 or later), stacked in prerequisite order
Specification: docs/planning/holding/2026-10-30-blurby-business-tier1.md#hb-6 … #hb-11
Status: planned — held | Prerequisites: APP-TABS-1 (pending), LIBRARY-COMPLETION-VISIBILITY-1 exclusive window (pending), Stage 8 release (pending, merge only)
Readiness: specification ✓ · prerequisites ✗ (encoded waits) · repository ✓ · register ✓ (read only) · environment ✓ (RodneySr transfer)
Host: RodneySr for now (GoG bandwidth, 2026-10-30); arm64 launch on Rodney at merge time

REPOSITORY RECONCILIATION (PowerShell 7, on RodneySr, in C:\Projects\bq-main)
  git fetch origin
  git -C C:\Projects\bq-main worktree add C:\Projects\bb-business origin/main
  Set-Location C:\Projects\bb-business
  git merge-base --is-ancestor faf9a725 HEAD; if ($LASTEXITCODE -ne 0) { throw "HALT: base lacks the held plan" }
  git switch -c eb/business-shell-1
  npm ci
  npm test; if ($LASTEXITCODE -ne 0) { throw "HALT: baseline suite red" }
  # later items: git switch -c eb/business-<next> from the previous item's committed tip
  # publish each: git push origin HEAD:refs/heads/eb/business-<name>   (explicit refspec; memory: eb/ case)
HALT if any command above exits non-zero; do not improvise a repair.
```

### Shared detail (applies to every item in this set; each specification cites it as "Shared detail")

- **Lane ownership:** Blurby Business (proposed lane); execution surfaces C (renderer under `src/business/`) and D (main under `main/business/`, `preload-business.js`). **Forbidden during a parallel run:** `src/reader/**`, `src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `src/types.ts`, `main/ipc/library.js`, `main/epub-converter.js`, `main/file-parsers.js`. **Shared-core touches:** none — the main-window launcher is typed in a new `src/types/businessLauncher.d.ts`, not `src/types.ts` (D16 below). **Merge order:** after the Stage 8 release and after the seven held branches named under Readiness; within the set HB-6 → HB-7, HB-8, HB-11 → HB-9 → HB-10.
- **D16 (technical, this plan):** the main window reaches Business only through a second, minimal bridge `window.blurbyBusiness = { open(): Promise<void> }` exposed by `preload.js` and declared in `src/types/businessLauncher.d.ts`, so `src/types.ts` (shared-core) is untouched. The Business window's own bridge is `window.businessAPI`, exposed by `preload-business.js` and declared in `src/business/businessAPI.d.ts` (LL-106 three-way contract: main handler, preload method, type, in one commit).
- **D17 (technical, this plan):** fixtures are generated, not hand-made: `scripts/business-smoke/make-fixtures.mjs` (dev only; `scripts/` is not in `build.files`) writes `tests/fixtures/business/{report,locked,scanned}.pdf` with pdfkit (already a dependency) and `@napi-rs/canvas` (installed via pdf-parse) for the scanned page image; page labels and optional-content layers are written as raw catalog dictionaries through pdfkit's `ref()`.
- **Constants (separation rule):** `main/constants.js` gains `BUSINESS_PARTITION = "persist:blurby-business"`, `BUSINESS_DATA_DIR = "business"`, `BUSINESS_RECENT_MAX = 20`; `src/business/constants.ts` holds `ZOOM_STEPS = [50, 75, 100, 125, 150, 200, 300]`, `OCR_MIN_WORDS_PER_PAGE = 5`.
- **Data location:** `<getDataPath()>/business/` — `recent.json` and `ocr/<sha256>.json`; written only through `writeJSON` (`main/json-store.js:32`), so the quit flush (`whenWritesSettled`, `main.js:646`) covers it (LL-157, LL-159).
- **Live checks:** `scripts/business-smoke/smoke.mjs` (new, dev only, modelled on `scripts/ui-sweep/sweep.mjs`) launches a packaged exe with `--remote-debugging-port` and `--user-data-dir=<scratch>`, first proves the opened profile is the scratch one (LL-165: `get-state` data path equals the scratch path), then runs one `--check <name>` and exits 0 on pass, 1 on any failed assertion, 2 on a harness error.
- **Gates are dry-run against the base (LL-143):** every `npx vitest run tests/business*.test.*` row exits 1 on `faf9a725` (no such file); every `git grep` row's base result is stated; the shell is Git Bash from the repository root unless a row names PowerShell.
- **Standard gates for every item:** `npm test` exits 0 with ≥ 2,452 passed and 0 failed; `npm run typecheck` exits 0; `npm run build` exits 0; `git diff --stat main...HEAD` shows no unexpected decrease (truncation check).
- **Package verification (standing rule 53, LL-167):** on RodneySr, `--dir --x64` and `--dir --arm64` of the item's tip, `app.asar` identical across the pair; 25 s x64 scratch launch with no error or crash; asar contents include `preload-business.js`, `dist/business.html` and (from HB-9) the OCR assets; the item's live-check rows re-run on the packaged exe; a "Package verification" section in the close-out; Blurby.Brain's confirmation before the merge go; the arm64 launch on Rodney at merge time.
- **Failure handling:** if a Done-when row fails, fix within the item's edit sites, at most two fix rounds per row; then stop and file an issue to Blurby.Brain. If the pdf.js worker or tesseract WASM is blocked, change only the Business partition's CSP, never the default session's. If a merge with a held branch conflicts beyond re-applying a narrow edit, stop and route to Blurby.Brain. **Rollback:** nothing reaches `main` until the merge go; before it, abandon the branch; after it, `git revert -m 1 <merge sha>` of that item's merge (later items first).
- **Staging plan:** explicit paths only, per item (listed in each specification); never `git add -A`; commit on the item branch; publish with an explicit refspec; merge to `main` with `--no-ff` only on Blurby.Roadmap's go after Brain's package confirmation (rule 5b, held by the Stage 8 freeze).
- **Owner checks:** deferred owner checks join release gate (2)'s list (memory: owner smoke batched at end), not per-item smoke runs.

#### HB-6 — Business window and PDF viewer

- **What:** a separate Blurby Business window, in its own session and CSP, with its own preload and Vite page, that renders PDFs page for page with pdf.js in document tabs, keeps its own recent list, opens files by Open file and drag-in, and is reached from the command palette and the menu flap.
- **Why:** the walled area and viewer every other Business item builds on (alignment record, Outcome; D4, D5, D12).
- **Prerequisites:** APP-TABS-1 merged (shares `preload.js`, `CommandPalette.tsx`); LIBRARY-COMPLETION-VISIBILITY-1's exclusive source/test window closed (start gate); Stage 8 release (merge gate); held branches `eb/eink-controls-1`, `eb/library-write-race-2`, `eb/rename-tmp-race-1` merged first (shared `main/window-manager.js`, `main/sync-engine.js`).
- **Done when:**
    1. `npx vitest run tests/businessBoundary.test.ts` exits 0. It builds the import graph with `buildImportGraph({ roots, withNames: true })` (`docs/planning/roadmap-reviews/reader-mode-separation-2/census/import-graph.mjs:31`) and asserts: (a) the runtime closure of `src/business/main.tsx` contains only files under `src/business/`, `src/styles/` and `src/components/ThemeProvider.tsx`; (b) its external packages are exactly a subset of `react`, `react-dom`, `pdfjs-dist`, `tesseract.js`; (c) the closure of `src/main.tsx` contains no file under `src/business/`; (d) negative controls: a synthetic edge `src/business/x.ts → src/reader/modes/page/index.ts` and a synthetic edge `src/main.tsx → src/business/x.ts` are each reported.
    2. `npx vitest run tests/businessWindow.test.js` exits 0. With `electron` mocked, `createBusinessWindow()` (`main/business/window.js`) constructs a `BrowserWindow` whose `webPreferences` are `{ preload: <path ending "preload-business.js">, contextIsolation: true, nodeIntegration: false, partition: "persist:blurby-business" }`; it installs on `session.fromPartition("persist:blurby-business")` a CSP whose value contains `'wasm-unsafe-eval'` and `worker-src 'self' blob:`; a second call while the window exists focuses it and returns the same instance; and the default-session production policy in `main/window-manager.js` equals, byte for byte, `default-src 'self' blob:; script-src 'self' blob: 'unsafe-inline'; style-src 'self' 'unsafe-inline' blob:; img-src 'self' data: file: blob:; font-src 'self' blob: data:; frame-src 'self' blob:; connect-src 'self' https://huggingface.co https://cdn-lfs.huggingface.co https://cdn-lfs-us-1.huggingface.co`.
    3. `npx vitest run tests/businessRecent.test.js` exits 0: `addRecent(p)` persists through `writeJSON` to `<dataPath>/business/recent.json`; re-adding moves the entry to the front without duplication; the list caps at `BUSINESS_RECENT_MAX` (20); `removeRecent(p)` removes it; a spy proves `writeJSON` is never called with a path ending `library.json`.
    4. `npx vitest run tests/primaryWindowTarget.test.js` exits 0: with `BrowserWindow.getAllWindows()` returning `[businessWin, mainWin]`, the Kokoro download-error and engine-status sends (`main/tts-engine.js`) and the sync `executeJavaScript` (`main/sync-engine.js`) reach `mainWin` only; with no main window, the sends do nothing and the sync call returns `false`.
    5. `git grep -n "getAllWindows()\[0\]" -- main/` exits 1. On the base it prints three lines (`main/sync-engine.js:771`, `main/tts-engine.js:96`, `main/tts-engine.js:171`).
    6. `npx vitest run tests/businessTabs.test.tsx` exits 0: with the pdf.js loader mocked to a 3-page document, opening A then B creates two tabs; moving A to page 3, switching to B and back shows A on page 3; closing B leaves A rendered; a stale load for a closed tab never renders (generation guard, LL-031, LL-169).
    7. `npx vitest run tests/businessOpenError.test.tsx` exits 0 (frame 5): a loader rejection with `ENOENT` or `InvalidPDFException` shows the text "can't open this file", the file path, and a "Remove from list" button that calls `businessAPI.removeRecent(path)` once; the other open tab stays rendered.
    8. `npm run build` exits 0, then `node scripts/business/check-main-bundle.mjs` exits 0: it reads `dist/index.html`, follows its `<script>` and `modulepreload` chunks transitively, and exits 1 if any of them contains the string `pdfjs` or `tesseract`; it also exits 1 if `dist/business.html` is absent (frame 6: "startup unchanged" is read as "the main bundle loads no Business code"; startup time is not separately timed).
    9. `npx vitest run tests/commandPaletteRoutes.test.ts tests/businessEntry.test.tsx` exits 0: the palette lists an action labelled "Open Blurby Business" whose `onSelect` calls `window.blurbyBusiness.open()` once; `MenuFlap` renders an item labelled "Blurby Business" that calls it once.
    10. Packaged live check (frames 1, 2, 6): `node scripts/business-smoke/smoke.mjs --exe <x64 unpacked Blurby.exe> --profile <scratch> --fixture tests/fixtures/business/report.pdf --check shell` exits 0 — Business opens from the main window's `window.blurbyBusiness.open()`, a target whose URL ends `business.html` exists, the fixture opens in one tab titled `report.pdf`, page 1's canvas has more than 1% non-background pixels, closing and reopening Business lists `report.pdf` in the recent list, and the fixture's SHA-256 is identical before and after.
    11. Standard gates (Shared detail) pass.
- **Effort:** high
- **Owners:** planner (this plan), implementation agent, reviewer (Solon, Plato), repository operator (Blurby.Roadmap for the merge go; Blurby.Brain for package confirmation).
- **Source:** alignment record (D4, D5, D12–D16); `main/window-manager.js:30-55,57-92,149-161`; `main.js:28-29,41-46,489-527`; `main/ipc-handlers.js:8-18`; `preload.js:33-228`; `vite.config.js:12-16`; `package.json:36-43`; `src/components/CommandPalette.tsx:78-96`; `src/components/MenuFlap.tsx`; `src/components/ThemeProvider.tsx:157-212`; `main/json-store.js:32-60`; `tests/readerModeBoundaries.test.ts:23-85`.
- **Origin:** held plan — 2026-10-30-blurby-business-tier1 (HB-6), not yet on the roadmap

##### Implementation detail
- **Edit sites:** new `main/business/window.js` (create/focus, own partition and CSP), `main/business/recent.js`, `main/business/ipc.js` (`register(ctx)`: `business-open-window`, `business-get-recent`, `business-remove-recent`, `business-open-dialog`, `business-read-file`, `business-get-state` returning theme settings); `main/ipc-handlers.js` (one line: `require("./business/ipc").register(ctx);`); `main/window-manager.js` (export `getPrimaryWindow()` set by `createMainWindow`); `main/sync-engine.js:771`, `main/tts-engine.js:96,171` (use `getPrimaryWindow()`); `main/constants.js` (three constants); new `preload-business.js`; `preload.js` (second `exposeInMainWorld("blurbyBusiness", …)`); new `src/types/businessLauncher.d.ts`; new `business.html`, `src/business/main.tsx`, `src/business/` components (window shell, tab strip, page view, recent list, error view), `src/business/businessAPI.d.ts`, `src/business/constants.ts`, `src/business/business.css` (`.bb-` prefix, theme tokens only); `vite.config.js` (`rollupOptions.input = { main: "index.html", business: "business.html" }`); `package.json` (`pdfjs-dist` as a direct dependency pinned `5.4.296`; `preload-business.js` in `build.files`); `src/components/CommandPalette.tsx` (one action); `src/components/MenuFlap.tsx` (one item); new `scripts/business/check-main-bundle.mjs`, `scripts/business-smoke/{smoke,make-fixtures}.mjs`, `tests/fixtures/business/report.pdf`; new tests named in Done when.
- **Theme (D15):** the Business renderer reads `business-get-state` on load and on window `focus`, applies the same CSS variables and `data-theme` as `ThemeProvider` (importing its exported `themes` map only), and subscribes to the system-theme event.
- **Tests:** the eight test files named in Done when 1–4, 6, 7, 9 (new, except `tests/commandPaletteRoutes.test.ts`, which gains one assertion: currently it asserts the existing routes; it additionally asserts the "Open Blurby Business" route).
- **Constants:** `BUSINESS_PARTITION`, `BUSINESS_DATA_DIR`, `BUSINESS_RECENT_MAX` (Shared detail).
- **Branch:** `eb/business-shell-1` from `main` at the sha carrying this plan.
- **Staging plan:** the new and edited paths listed under Edit sites and Tests, by exact path.
- **Failure handling:** Shared detail; additionally, if `main/sync-engine.js` conflicts with `eb/library-write-race-2` or `eb/rename-tmp-race-1`, re-apply the one-line retarget on their merged result.

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Baseline suite green on the RodneySr worktree | repeat | baseline-suite | mechanical | low | 20m (estimated) | — | — |
| 2 | Fixture generator and report.pdf fixture | calculable | setup | bounded | medium | 45m (estimated) | — | — |
| 3 | Business window, partition, CSP, IPC and recent list in main, with tests | repeat | feature | bounded | high | 2h (estimated) | — | A |
| 4 | Main-window retarget of the three `getAllWindows()[0]` sites, with test | repeat | main-process-fix | bounded | medium | 40m (estimated) | — | A |
| 5 | Business renderer: page view, tabs, recent list, error view, theme, with tests | repeat | feature | cross-cutting | high | 3h (estimated) | — | — |
| 6 | Entry points: launcher bridge, palette action, menu-flap item, with tests | repeat | ui-fix | bounded | medium | 45m (estimated) | — | — |
| 7 | Boundary test and main-bundle check | calculable | test-edit | bounded | medium | 1h (estimated) | — | — |
| 8 | Standard gates and review (Solon, Plato) | repeat | review | bounded | medium | 1h (estimated) | — | — |
| 9 | Package verification and live check on RodneySr | repeat | packaging-verify | bounded | medium | 1h30m (estimated) | — | — |
| 10 | Docs close-out (MarcusAurelius) | repeat | merge-and-docs | bounded | low | 40m (estimated) | — | — |

**Total:** chain 46m · sum 49m; 10 of 10 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate) Waves (LL-091): Wave A = tasks 1–7; Wave B = tasks 8–10.

##### Lessons applied
- LL-003 — new main-process code lives in `main/business/`; `main.js` gets no Business logic (only HB-11's launch routing).
- LL-006 — recent list written only through `writeJSON` (atomic temp-and-rename); Done when 3.
- LL-007 — Business gets its own CSP on its own partition; the default-session policy is pinned byte for byte (Done when 2).
- LL-031, LL-169 — tab loads carry a generation/currentness guard; Done when 6 tests a stale load.
- LL-066 — no silent `.catch(() => {})`; load failures surface as the error view (Done when 7).
- LL-091 — ten tasks pre-split into Wave A and Wave B.
- LL-092 — pdf.js is reachable only from `business.html`; Done when 8 proves the main bundle excludes it.
- LL-106 — main handler, preload method and type land together for each bridge (D16).
- LL-128 — every "new" file was verified absent on `faf9a725` (`main/business/`, `preload-business.js`, `business.html`, `src/business/`, `src/types/businessLauncher.d.ts`).
- LL-139 — the wall is enforced by an import-graph test, not a file list (Done when 1).
- LL-143 — every gate names its shell and exact exit code, and its base result.
- LL-157, LL-159 — Business data uses `writeJSON`, which `whenWritesSettled` drains at quit.
- LL-165 — the smoke harness proves the scratch profile before acting.

#### HB-7 — Navigation and view controls

- **What:** a dockable sidebar with thumbnails, bookmarks, attachments (save a copy out) and layers (show/hide); zoom, fit-width, fit-page and two-page view; printed page labels in the page box; internal and external links; Ctrl+F search.
- **Why:** fixed-layout documents need these to be usable (frame 1; A4, A5).
- **Prerequisites:** HB-6.
- **Done when:**
    1. `npx vitest run tests/businessNav.test.tsx` exits 0: with a mocked document (6 pages; `getOutline` → 2 items, the second pointing at page 3; `getPageLabels` → `["i","ii","1","2","3","4"]`; `getAttachments` → `{ "notes.txt": … }`; one optional-content group), the sidebar shows 6 thumbnails and 2 bookmarks; clicking the second bookmark shows page 3; on page 2 the page box reads `ii`; toggling the layer calls `setVisibility(<id>, false)` and re-renders; "Save a copy" on `notes.txt` calls `businessAPI.saveAttachmentCopy("notes.txt", <bytes>)` once.
    2. `npx vitest run tests/businessView.test.tsx` exits 0 (frame 2): zoom-in from 100 goes to 125 and zoom-out from 50 stays 50 (`ZOOM_STEPS`); fit-width scale equals container width ÷ page width; two-page view lays pages 1–2 side by side; after setting tab A to page 3, zoom 150 and two-page on, switching to B and back restores all three.
    3. `npx vitest run tests/businessLinks.test.tsx tests/businessIpc.test.js` exits 0: an internal destination link moves to its page; an external `https://example.com` link calls `businessAPI.openExternal` once; the main handler calls `shell.openExternal` only for `http:`, `https:` and `mailto:` schemes and rejects `javascript:alert(1)` and `file:///C:/x` without calling it (LL-095); `saveAttachmentCopy` writes exactly once, to the path the mocked save dialog returned, and never to the open document's path.
    4. `npx vitest run tests/businessSearch.test.tsx` exits 0: with text content mocked so "quarterly" occurs on pages 2 and 5, Ctrl+F then typing "quarterly" reports 2 matches and Enter moves from page 2 to page 5; with focus in the search box, Ctrl+F is not swallowed by another handler (LL-080).
    5. `npx vitest run tests/businessTextSelect.test.tsx` exits 0: on a text PDF (not scanned) the pdf.js text layer is rendered over each page; selecting the words "Quarterly results" on page 2 and pressing Ctrl+C puts exactly `Quarterly results` on the clipboard (`navigator.clipboard.writeText` spy).
    6. Packaged live check: `node scripts/business-smoke/smoke.mjs … --fixture tests/fixtures/business/report.pdf --check nav` exits 0 — 6 thumbnails, 2 bookmarks, page box `ii` after one next-page, the fixture's SHA-256 unchanged.
    7. Standard gates (Shared detail) pass.
- **Effort:** high
- **Owners:** as HB-6.
- **Source:** alignment record (frame 1, A4, A5, D3); `main/ipc/url-validation.js`; pdf.js `PDFDocumentProxy` API (`getOutline`, `getPageLabels`, `getAttachments`, `getOptionalContentConfig`) in `node_modules/pdfjs-dist` 5.4.296.
- **Origin:** held plan — 2026-10-30-blurby-business-tier1 (HB-7), not yet on the roadmap

##### Implementation detail
- **Edit sites:** `src/business/` (sidebar, thumbnails, outline, attachments, layers, view controls, page-label box, link layer, search); `main/business/ipc.js` (`business-open-external`, `business-save-attachment-copy`); `preload-business.js` and `src/business/businessAPI.d.ts` (two methods); `scripts/business-smoke/make-fixtures.mjs` (outline, labels, layer, attachment, link in `report.pdf`).
- **Tests:** the six test files named in Done when 1–5 (new).
- **Constants:** `ZOOM_STEPS` (Shared detail).
- **Branch:** `eb/business-nav-1` from the committed tip of `eb/business-shell-1`.
- **Staging plan:** the paths above, by exact path.
- **Failure handling:** Shared detail.

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Fixture: outline, page labels, layer, attachment, link | frontier | setup | bounded | medium | — | ≤1h30m — stop and file an issue | — |
| 2 | Sidebar panels with tests | repeat | feature | bounded | high | 2h (estimated) | — | A |
| 3 | Zoom, fit and two-page with tab restore, with tests | repeat | feature | bounded | medium | 1h30m (estimated) | — | A |
| 4 | Links and attachment copy (renderer and main), with tests | repeat | feature | bounded | medium | 1h15m (estimated) | — | B |
| 5 | Search with tests | repeat | feature | bounded | medium | 1h15m (estimated) | — | B |
| 6 | Standard gates and review | repeat | review | bounded | medium | 1h (estimated) | — | — |
| 7 | Package verification and live check | repeat | packaging-verify | bounded | medium | 1h (estimated) | — | — |
| 8 | Docs close-out | repeat | merge-and-docs | bounded | low | 30m (estimated) | — | — |

**Total:** chain 36m · sum 54m + 1 timeboxed ≤1h30m; 7 of 7 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate) Waves (LL-091): Wave A = tasks 1–5; Wave B = tasks 6–8.

##### Lessons applied
- LL-080 — Ctrl+F handling checks the input target; Done when 4.
- LL-095 — external links pass a scheme allow-list in main; Done when 3.
- LL-091 — eight tasks pre-split into waves.
- LL-143 — exact exit codes, named shell, base results.
- LL-165 — the live check proves the scratch profile.

#### HB-8 — Password-protected PDFs

- **What:** a password prompt for locked PDFs; the password is held in main-process memory for the session only and is never written to disk.
- **Why:** work documents are often locked (frame 4; D7).
- **Prerequisites:** HB-6.
- **Done when:**
    1. `npx vitest run tests/businessLocked.test.tsx` exits 0 (frame 4): a loader `PasswordException` with code `NEED_PASSWORD` shows the prompt; `INCORRECT_PASSWORD` shows "Incorrect password" and asks again; Cancel closes the tab and leaves the recent list unchanged; the right password renders page 1; reopening the same path in the same session renders without a prompt.
    2. `npx vitest run tests/businessSecrets.test.js` exits 0: `main/business/session-secrets.js` stores and returns a password for a path; spies on `fs.promises.writeFile`, `fs.promises.appendFile` and `writeJSON` record no call whose arguments contain the password; re-requiring the module (a new session) returns nothing.
    3. Packaged live check: `node scripts/business-smoke/smoke.mjs … --fixture tests/fixtures/business/locked.pdf --check locked` exits 0 — a wrong password is refused, the fixture's password opens it, reopening in the same run does not prompt, and afterwards no file under the scratch profile contains the password's bytes.
    4. Standard gates (Shared detail) pass.
- **Effort:** medium
- **Owners:** as HB-6.
- **Source:** alignment record (D7, frame 4); pdf.js `PasswordException` / `PasswordResponses` in `pdfjs-dist` 5.4.296.
- **Origin:** held plan — 2026-10-30-blurby-business-tier1 (HB-8), not yet on the roadmap

##### Implementation detail
- **Edit sites:** `src/business/` (password prompt, unlock flow); new `main/business/session-secrets.js`; `main/business/ipc.js` (`business-get-session-password`, `business-set-session-password`); `preload-business.js`, `src/business/businessAPI.d.ts`; `scripts/business-smoke/make-fixtures.mjs` (`locked.pdf` via pdfkit `userPassword`, password `blurby-fixture`).
- **Tests:** the two test files in Done when 1–2 (new).
- **Constants:** none.
- **Branch:** `eb/business-locked-1` from the committed tip of `eb/business-shell-1`.
- **Staging plan:** the paths above, by exact path.
- **Failure handling:** Shared detail.

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Locked fixture | calculable | setup | mechanical | low | 20m (estimated) | — | — |
| 2 | Prompt, unlock flow and session secrets, with tests | repeat | feature | bounded | medium | 1h30m (estimated) | — | — |
| 3 | Standard gates and review | repeat | review | bounded | medium | 45m (estimated) | — | — |
| 4 | Package verification and live check | repeat | packaging-verify | bounded | medium | 1h (estimated) | — | — |
| 5 | Docs close-out | repeat | merge-and-docs | bounded | low | 30m (estimated) | — | — |

**Total:** chain 28m · sum 28m; 5 of 5 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- LL-066 — the wrong-password path surfaces an error; no swallowed rejection.
- LL-143 — exact exit codes, named shell, base results.
- LL-165 — the live check proves the scratch profile before scanning it for the password.

#### HB-11 — PDFs open in Blurby Business

- **What:** the installer registers Blurby Business as a `.pdf` handler; a `.pdf` path given at launch, or to an already-running Blurby, opens in the Business window; a PDF-only launch opens only Business.
- **Why:** the owner: "Imagine BB is a standard PDF viewer and editor app, which acts as the default app when engaging with a PDF from windows explorer." (D4, A8, A9; frames 1 and 7.)
- **Prerequisites:** HB-6; `eb/win-target-nsis-1` merged (both edit `package.json` `build`); `eb/large-folder-sync-3` and `eb/narrate-trace-labels-1` merged (both edit `main.js`).
- **Done when:**
    1. `node -e "const b=require('./package.json').build;const f=(b.fileAssociations||[]).find(a=>a.ext==='pdf');process.exit(f&&f.role==='Viewer'&&f.name==='PDF document'?0:1)"` exits 0. On the base it exits 1.
    2. `npx vitest run tests/businessLaunchArgs.test.js` exits 0: `pdfPathsFromArgv(argv)` (`main/business/launch-args.js`) returns `["C:\\docs\\A.PDF"]` for `["C:\\Blurby.exe","C:\\docs\\A.PDF"]`, `[]` for `["electron",".","--inspect=1"]`, and both paths, in order, for two `.pdf` arguments; flags beginning `--` are never returned.
    3. `npx vitest run tests/businessLaunchRouting.test.js` exits 0 (frame 7, A8): a `second-instance` event whose argv carries a `.pdf` path calls the Business open-paths entry with it and neither restores nor focuses the main window; one without a `.pdf` path restores and focuses the main window as today; `shouldOpenMainWindowAtStartup(argv)` returns `false` when a `.pdf` path is present and `true` otherwise; the tray's open action, with no main window, creates one once and shows that same window on the next click (tray takes a getter, not a captured window).
    4. Packaged live check: `node scripts/business-smoke/smoke.mjs … --fixture tests/fixtures/business/report.pdf --check launch` exits 0 — launched with the fixture path, there is a `business.html` target and no `index.html` target; a second launch with `locked.pdf` exits 0 within 10 s and the first instance's Business window then has 2 tabs; a launch with no path shows an `index.html` target and no `business.html` target.
    5. Install check (PowerShell 7, RodneySr; LL-168): export both Blurby uninstall keys first; install the branch's NSIS package; `reg query "HKCU\Software\Classes\.pdf\OpenWithProgids"` exits 0 and lists the Blurby ProgId; uninstall; restore the exported keys; `reg query` of the restored keys exits 0.
    6. Standard gates (Shared detail) pass.
- **Effort:** medium
- **Owners:** as HB-6.
- **Source:** alignment record (D4, A8, A9, frames 1 and 7); `main.js:489-499,520-526`; `main/window-manager.js:149-161`; `package.json:55-70`; electron-builder `fileAssociations` (`build` schema, electron-builder 26).
- **Origin:** held plan — 2026-10-30-blurby-business-tier1 (HB-11), not yet on the roadmap

##### Implementation detail
- **Edit sites:** `package.json` (`build.fileAssociations: [{ ext: "pdf", name: "PDF document", description: "PDF document", role: "Viewer", icon: "assets/icon.ico" }]`); new `main/business/launch-args.js`; `main.js:494-499` (`second-instance` routes `.pdf` paths) and `main.js:520-526` (skip `createMainWindow` when `shouldOpenMainWindowAtStartup` is `false`; open Business with the paths); `main/window-manager.js:149-161` (`createTray(getMainWindow, createWindowFn)`).
- **Owner check (deferred):** choosing Blurby Business once in Windows' "Open with → Always" and double-clicking a PDF joins release gate (2)'s list.
- **Tests:** the two test files in Done when 2–3 (new).
- **Constants:** none.
- **Branch:** `eb/business-default-pdf-1` from the committed tip of `eb/business-shell-1`.
- **Staging plan:** the paths above, by exact path.
- **Failure handling:** Shared detail; if the install check cannot run (the old Blurby 1.1.2 x64 install on RodneySr shares `com.blurby.app`), stop after exporting the keys and route to Blurby.Brain — never install without the export.

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Argv parsing and launch routing in main, tray getter, with tests | repeat | main-process-fix | bounded | medium | 1h30m (estimated) | — | — |
| 2 | File association in the build config | calculable | setup | mechanical | low | 15m (estimated) | — | — |
| 3 | Standard gates and review | repeat | review | bounded | medium | 45m (estimated) | — | — |
| 4 | Package verification, live launch check and install check | repeat | packaging-verify | bounded | medium | 1h30m (estimated) | — | — |
| 5 | Docs close-out | repeat | merge-and-docs | bounded | low | 30m (estimated) | — | — |

**Total:** chain 22m · sum 22m; 5 of 5 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- LL-003 — launch routing logic lives in `main/business/launch-args.js`; `main.js` only calls it.
- LL-157 — closing the only (Business) window follows the existing `window-all-closed` path; no new async quit listener.
- LL-165 — the live check proves the scratch profile.
- LL-168 — the install check exports both uninstall keys first.
- LL-143 — exact exit codes, named shell, base results.

#### HB-9 — OCR for scanned PDFs

- **What:** detect scanned pages and offer "Recognise text"; on the user's start, run tesseract.js in a worker with the English model bundled in the app; recognised words become selectable and searchable; results are cached in Business data except for locked documents.
- **Why:** scanned documents are unreadable in Blurby today (`main/epub-converter.js:746-755`; frame 3; D6, D9, A1, A3).
- **Prerequisites:** HB-7 (search), HB-8 (locked-document flag).
- **Done when:**
    1. `npx vitest run tests/businessOcrDetect.test.ts` exits 0: a page whose `getTextContent` yields 0 words and whose operator list paints an image is scanned; a page with 60 words is not; the threshold is `OCR_MIN_WORDS_PER_PAGE` (5).
    2. `npx vitest run tests/businessOcr.test.tsx` exits 0 (frame 3, A3): a scanned document shows a bar with "Recognise text"; no worker is created before the click (spy on `createWorker`); after the click `createWorker` receives `workerPath`, `corePath` and `langPath` that are all relative or `file:` URLs (none begins `http`); progress reads "Page 1 of 3"; recognised words become a text layer that search (HB-7) finds.
    3. `npx vitest run tests/businessOcrCache.test.js` exits 0: `saveOcr(sha256, data)` writes `<dataPath>/business/ocr/<sha256>.json` through `writeJSON`; for a session-locked document it writes nothing and returns `{ cached: false }`; `loadOcr` returns the saved data for the same hash.
    4. `npm run build` exits 0, `node scripts/business/check-main-bundle.mjs` exits 0, and `test -f dist/business/ocr/eng.traineddata.gz` exits 0.
    5. Packaged live check, offline: `node scripts/business-smoke/smoke.mjs … --fixture tests/fixtures/business/scanned.pdf --check ocr --offline` exits 0 — launched with `--proxy-server=127.0.0.1:9`, OCR completes, search finds the fixture's word `BLURBY`, and the CDP network log shows no request with an `http:` or `https:` scheme.
    6. The installer-size change of the x64 package against `origin/main` is recorded in the close-out (`(Get-Item <installer>).Length` on both, PowerShell 7).
    7. Standard gates (Shared detail) pass.
- **Effort:** high
- **Owners:** as HB-6.
- **Source:** alignment record (D6, D9, A1, A3, frame 3); `main/epub-converter.js:746-755`; `main/window-manager.js:44-47` (no `worker-src`, no `'wasm-unsafe-eval'` in the default CSP, hence D12).
- **Origin:** held plan — 2026-10-30-blurby-business-tier1 (HB-9), not yet on the roadmap

##### Implementation detail
- **Edit sites:** `src/business/` (scanned detection, OCR bar and progress, OCR worker wrapper, text layer); `main/business/ocr-cache.js` (new), `main/business/ipc.js` (`business-save-ocr`, `business-load-ocr`); `preload-business.js`, `src/business/businessAPI.d.ts`; `package.json` (`tesseract.js` and the English model package, exact versions pinned at execution and recorded in the close-out); `vite.config.js` (copy the worker, core WASM and `eng.traineddata.gz` to `dist/business/ocr/`); `scripts/business-smoke/make-fixtures.mjs` (`scanned.pdf`: 3 image-only pages containing `BLURBY` and `invoice`).
- **Tests:** the three test files in Done when 1–3 (new).
- **Constants:** `OCR_MIN_WORDS_PER_PAGE` (Shared detail).
- **Branch:** `eb/business-ocr-1` from the committed tip of `eb/business-nav-1` with `eb/business-locked-1` merged in.
- **Staging plan:** the paths above, by exact path.
- **Failure handling:** Shared detail; if tesseract.js cannot run from the packaged `file://` origin within the timebox, stop and file an issue to Blurby.Brain with the CSP and console evidence — do not fall back to a CDN.

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Bundle tesseract.js, core WASM and English model locally under the Business CSP | frontier | dependency-upgrade | cross-cutting | high | — | ≤3h — stop and file an issue | — |
| 2 | Scanned fixture and detection, with tests | repeat | feature | bounded | medium | 1h (estimated) | — | A |
| 3 | OCR bar, worker, progress and text layer, with tests | repeat | feature | cross-cutting | high | 2h30m (estimated) | — | — |
| 4 | OCR cache in main, with tests | repeat | main-process-fix | bounded | medium | 45m (estimated) | — | A |
| 5 | Standard gates and review | repeat | review | bounded | medium | 1h (estimated) | — | — |
| 6 | Package verification, offline live check, installer-size record | repeat | packaging-verify | bounded | medium | 1h30m (estimated) | — | — |
| 7 | Docs close-out | repeat | merge-and-docs | bounded | low | 30m (estimated) | — | — |

**Total:** chain 36m · sum 39m + 1 timeboxed ≤3h; 6 of 6 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate) Waves (LL-091): Wave A = tasks 1–4; Wave B = tasks 5–7.

##### Lessons applied
- LL-092 — OCR assets load only in the Business window; Done when 4.
- LL-142 — the offline OCR claim is proved by executing the packaged build offline, not by configuration (Done when 5).
- LL-007 — WASM and worker permissions are added only to the Business partition's CSP.
- LL-091 — seven tasks pre-split into waves.
- LL-143 — exact exit codes, named shell, base results.

#### HB-10 — Send to Blurby to read

- **What:** a toolbar button, "Send to Blurby to read", with a confirmation dialog that imports a copy of the document — with any OCR text — into the Library.
- **Why:** the one deliberate bridge from Business to focus, flow and Narrate (D5, D11, D14; frame 3).
- **Prerequisites:** HB-6, HB-9.
- **Done when:**
    1. `npx vitest run tests/businessSend.test.tsx` exits 0 (D11): the toolbar shows "Send to Blurby to read"; clicking it opens a dialog reading "Add a copy of report.pdf to your Blurby library?"; Cancel calls nothing; Confirm calls `businessAPI.sendToLibrary({ path, ocrPages })` exactly once.
    2. `npx vitest run tests/businessSendMain.test.js` exits 0: for a text PDF the handler calls `convertToEpub(path, <dataPath>/converted, <docId>, meta)` and then `ctx.addDocToLibrary`, `ctx.saveLibrary` and `ctx.broadcastLibrary` once each, with a doc shaped like the `source: "manual"` branch of `import-dropped-files` (`main/ipc/library.js:310-350`); with `ocrPages`, it writes a temp HTML file of one `<section>` per page and one `<p>` per line, HTML-escaped (an OCR line `<script>x</script>` appears as `&lt;script&gt;x&lt;/script&gt;`), then calls `htmlToEpub`; on a conversion error it returns `{ error }` and adds nothing; the temp file is removed in both cases.
    3. `git grep -n "business-send-to-library" -- main src preload.js preload-business.js` prints matches only in `main/business/`, `src/business/` and `preload-business.js`, and exits 0. On the base it exits 1.
    4. `npx vitest run tests/businessRecent.test.js` exits 0 and now also asserts that after a send `recent.json` is unchanged and `business-get-recent` never returns a Library document.
    5. Packaged live check: `node scripts/business-smoke/smoke.mjs … --fixture tests/fixtures/business/scanned.pdf --check send` exits 0 — after OCR and Confirm, the main window's `get-state` library has exactly one more document, titled `scanned`; Business's recent list is unchanged; the fixture's SHA-256 is unchanged.
    6. `git diff --exit-code main...HEAD -- main/ipc/library.js main/epub-converter.js main/file-parsers.js` exits 0 (D14: no edit to the import code).
    7. Standard gates (Shared detail) pass.
- **Effort:** medium
- **Owners:** as HB-6.
- **Source:** alignment record (D5, D11, D14, frame 3 as corrected); `main/ipc/library.js:245-357`; `main/epub-converter.js:588,991,1125-1134`; `main/ws-server.js:304-431`.
- **Origin:** held plan — 2026-10-30-blurby-business-tier1 (HB-10), not yet on the roadmap

##### Implementation detail
- **Edit sites:** `src/business/` (toolbar button, confirmation dialog); new `main/business/send.js` and `main/business/ipc.js` (`business-send-to-library`); `preload-business.js`, `src/business/businessAPI.d.ts`.
- **Tests:** the two new test files in Done when 1–2; `tests/businessRecent.test.js` (from HB-6) gains the assertions in Done when 4 — currently it asserts add/dedupe/cap/remove and the `library.json` spy; it additionally asserts the post-send invariants.
- **Constants:** none.
- **Branch:** `eb/business-send-1` from the committed tip of `eb/business-ocr-1`.
- **Staging plan:** the paths above, by exact path.
- **Failure handling:** Shared detail; if the main window is closed when Confirm is pressed, the doc is still added and saved, and `broadcastLibrary` is a no-op (its existing behaviour, `main.js:263-267`).

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Toolbar button and confirmation, with tests | repeat | ui-fix | bounded | low | 45m (estimated) | — | A |
| 2 | Main send handler (text PDF and OCR HTML), with tests | repeat | main-process-fix | bounded | medium | 1h30m (estimated) | — | A |
| 3 | Standard gates and review | repeat | review | bounded | medium | 45m (estimated) | — | — |
| 4 | Package verification and live check | repeat | packaging-verify | bounded | medium | 1h (estimated) | — | — |
| 5 | Docs close-out, including IDEAS E3 absorbed | repeat | merge-and-docs | bounded | low | 40m (estimated) | — | — |

**Total:** chain 23m · sum 26m; 5 of 5 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- LL-006 — the Library record is added through the existing `ctx` save path (atomic `writeJSON`).
- LL-066 — conversion errors return `{ error }` to the dialog; nothing is swallowed.
- LL-143 — exact exit codes, named shell, base results.
- LL-165 — the live check proves the scratch profile.

### Review focus (across the set)

1. A second window receiving main-window traffic — covered by HB-6 Done when 4–5.
2. A Business document leaking into the Library without Confirm — covered by HB-10 Done when 1, 3, 4.
3. A password or locked OCR text reaching disk — covered by HB-8 Done when 2–3 and HB-9 Done when 3.
4. pdf.js or tesseract.js loading in the main window — covered by HB-6 Done when 1, 8 and HB-9 Done when 4.
5. OCR silently fetching from a CDN — covered by HB-9 Done when 2, 5.

### Interfaces

- HB-6 produces `window.businessAPI` (`getRecent`, `removeRecent`, `openDialog`, `readFile`, `getState`), `window.blurbyBusiness.open`, the per-tab document session `{ id, path, page, zoom, twoPage, unlocked }`, and `main/business/ipc.js`'s `openPaths(paths)` entry.
- HB-7 consumes the session and produces the search index and text-layer API (`registerTextLayer(page, words)`).
- HB-8 consumes and sets `session.unlocked`; produces `isSessionLocked(path)` for HB-9.
- HB-11 consumes `openPaths(paths)`.
- HB-9 consumes `registerTextLayer` and `isSessionLocked`; produces `ocrPages` for the open document.
- HB-10 consumes the document path and `ocrPages`; produces one Library record.
