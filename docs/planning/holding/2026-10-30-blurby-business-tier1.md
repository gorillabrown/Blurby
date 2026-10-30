# Held Plan — Blurby Business: a walled-off PDF viewer and editor (epic)

<!-- virtuoso-held-plan v1 -->

- **Entry:** 2026-10-30-blurby-business-tier1
- **Size:** epic-scale (8 phases, 121 features; re-scoped 2026-10-30 from item set (6))
- **Origin:** storyboard 2026-10-30. The owner asked to bring KillerPDF's (github.com/SteveTheKiller/KillerPDF) functionality into Blurby, ruled that it lives in a wholly separate, walled-off area called Blurby Business, and asked to scope Tier 1 (the reading-adjacent features) now. Tier 2 (PDF editing) is held back as a product-direction question.

## Trail

| Date | State | By | Note |
|---|---|---|---|
| 2026-10-30 | storyboarded | storyboard | aligned; item set; 5 items (BUSINESS-SHELL/NAV/LOCKED/OCR/SEND, provisional) |
| 2026-10-30 | storyboarded | storyboard | reopened for entry points: PDF default handler (HB-11); re-aligned; 6 items HB-6..HB-11 |
| 2026-10-30 | storyboarded | storyboard | re-scoped to epic-scale: PDF viewer and editor, 8 phases, 121 features; aligned; Phase 1 specs (HB-6..HB-11) moved to 2026-10-30-blurby-business-tier1/phase1-specs.md as charter seed |

## Storyboard

### Alignment record

**Outcome:** a separate Blurby Business window opens PDFs exactly as they are: page for page, in its own document tabs, with navigation, view controls, OCR for scanned pages and password-protected files. A confirmed toolbar action can send a readable copy into the Library.

**Why now:** the owner wants KillerPDF's capabilities in Blurby. Blurby today converts every PDF to EPUB on import (`pdfToEpub`, `main/file-parsers.js`), which loses the layout of work documents, and it rejects scanned PDFs outright (TECHNICAL_REFERENCE.md §Scanned PDF Detection). Tier 1 is useful on its own and is the foundation for any later Tier 2.

**Done looks like:** Blurby Business acts as a standard PDF viewer: it is the registered handler for `.pdf`, so double-clicking a PDF in File Explorer opens it there; it is also reached from the command palette, the menu flap, and Business's own Open file and drag-in. A separate window opens the PDF page for page in a tab. Its sidebar holds thumbnails, bookmarks, attachments and layers; the view has zoom, fit and two-page modes, printed page labels, working links and search. A scanned PDF can be recognised, and its words become selectable and searchable. A locked PDF asks for its password once per session. A toolbar button, after a confirmation, puts a readable copy (OCR text included) into the Library.

**Must never happen:**
- Business code imports reading-mode code (Page, Focus, Flow, Narrate), or the reverse.
- A PDF on disk is changed in any way by anything done in Business. *(superseded 2026-10-30 by the epic re-scope: holds only until an explicit Save or Save As)*
- A password, or OCR text of a locked PDF, reaches disk.
- Business's libraries (pdf.js viewer, tesseract.js) load at main Blurby startup.
- A Business document reaches the Library by any path other than the toolbar button followed by Confirm. There is no automatic send.
- Business's recent list or working files appear in the Library, library search, the reading queue, reading stats or sync; Library items appear in Business's recent list. Temporary work items and readings are never conflated.

**Out of scope:**
- All Tier 2 editing: markup saved into the PDF, text editing, page organisation, compare, conversion/export, forms, redaction, encryption, certificate signing, automation, printing, "Save searchable copy". *(superseded 2026-10-30: markup, text editing, page organisation, forms, certificate signing and printing are now phases 2–8; compare, conversion/export, redaction, encryption, automation and "Save searchable copy" stay out)*
- Document tabs in the main Blurby app (a separate storyboard; it reopens APP-TABS-1's "reader stays full-screen" decision).
- Merging the Business window into the main window (the owner expects it later; Tier 1 only guards for it).
- OCR languages other than English.
- Syncing Business's recent list.
- Reading aloud, focus or flow reading inside Business.
- Making the main Blurby app the default for EPUBs, and the main app's other ways of bringing in material (a separate storyboard, alongside main-app document tabs).
- Any "Open in Blurby Business" action on Library cards.

**You said:**
- "Let's build this into a future version of blurby: https://github.com/SteveTheKiller/KillerPDF"
- "I think this would be separate. Let's build this wholly separate, walled off area within the app for this for now and call it Blurby Business"
- "I like the notion of engaging with a tab approach for quick switching on the primary blurby app and across modes."
- "Scope tier 1"
- On the window: "A but I think in the future we merge the two"
- On frame 3: "there should be no auto send to library action. This should be a button to be pressed in the toolbar + a confirmation. We want to be very careful [not] to muddy, confuse, conflate temporary work items with other readings."
- Every other question: option (a).
- On entry points (reopened 2026-10-30): "Blurby Business will be default (for me) for PDFs, so if I double click a PDF it'll open in BB. Otherwise, Blurby App will have an option to find and load materials, along with various other ways to bring in materials, such as default for epub documents."
- "Imagine BB is a standard PDF viewer and editor app, which acts as the default app when engaging with a PDF from windows explorer. All looks good as recommended, I believe"

**Assumed — each one confirmed, corrected, or accepted with a guard before the verdict:**

| Assumption | Resolution |
|---|---|
| A1 OCR is English-only in Tier 1 | confirmed 2026-10-30 |
| A2 Business has no read-aloud, focus or flow reading; "Send to Blurby to read" is the route to those | confirmed |
| A3 OCR is offered when a scanned page is detected, but runs only when the user starts it | confirmed |
| A4 Attachments can be listed and saved out as a copy; layers can be shown or hidden; nothing is written back into the PDF | confirmed |
| A5 External links open in the default browser; internal links jump within the document | confirmed |
| A6 Business follows Blurby's current theme | confirmed |
| A7 Windows only, ARM64 and x64, same as Blurby | confirmed |
| A8 When a PDF double-click launches Blurby, only the Business window opens; the library window stays closed until opened from the tray or a shortcut | confirmed 2026-10-30 (reopened storyboard) |
| A9 Windows 11 does not let an app make itself the default; the installer registers Blurby Business as a `.pdf` handler and the owner picks it once in Windows' "Open with → Always" | confirmed 2026-10-30 |
| Sending to the Library happens automatically after OCR | corrected → only by a toolbar button plus a confirmation (frame 3) |

**Decisions:**

| Decision | Chosen | Decided by | Date |
|---|---|---|---|
| D1 Which tier to scope | Tier 1 (reading-adjacent); Tier 2 held | the user | 2026-10-30 |
| D2 How tabs split from Business | Business has its own document tabs; main-app tabs are a separate storyboard | the user | 2026-10-30 |
| D3 Who Business is for | the owner and readers like them: work documents where layout matters; Tier 1 is useful alone and is Tier 2's base | the user | 2026-10-30 |
| D4 How you get into Business (revised 2026-10-30 on reopening) | its own window; Business is the registered `.pdf` handler, so a File Explorer double-click opens it; also the command palette, the menu flap (no app menu exists), and Business's own Open file and drag-in; no Library-card action. A future merge into the main window is expected, so its interface is one self-contained root either window can host | the user | 2026-10-30 |
| D5 Where documents come from | Business's own recent list in its own file; PDFs stay PDFs; "Send to Blurby to read" is the one bridge | the user | 2026-10-30 |
| D6 What OCR produces | view-only: words selectable and searchable, cached in Business data; plus the bridge carries the OCR text | the user | 2026-10-30 |
| D7 Passwords | asked once, held in memory for the session only, never on disk; OCR text of a locked PDF is never cached to disk | the user | 2026-10-30 |
| D8 Placement | recommend a new Stage 9 workstream, built in parallel, held, merged after the Stage 8 release; not ahead of current application repairs | the user (recommendation to the review) | 2026-10-30 |
| D9 OCR model delivery | the English model ships in the installer; no runtime download | the agent under the delegated technical vertical (CLAUDE.md rule 11) | 2026-10-30 |
| D10 pdf.js dependency | make `pdfjs-dist` a direct, pinned dependency (today it is only transitive through pdf-parse 2) | the agent under the delegated technical vertical | 2026-10-30 |
| D11 Library bridge trigger | toolbar button + confirmation only; never automatic | the user | 2026-10-30 |
| D12 Business session and CSP | the Business window uses its own session partition `persist:blurby-business` with its own CSP (adds `worker-src` and `'wasm-unsafe-eval'` for pdf.js and tesseract.js); the main app's default-session CSP (`main/window-manager.js:30-55`) is unchanged | the agent under the delegated technical vertical | 2026-10-30 |
| D13 Second-window message targeting | `main/sync-engine.js:771` and `main/tts-engine.js:96,171` address `BrowserWindow.getAllWindows()[0]`; they are changed to address the main window, so a Business window can never receive sync scripts or TTS status | the agent under the delegated technical vertical | 2026-10-30 |
| D14 Send-to-Blurby route | no edit to the existing import code: Business's main-side handler reuses `convertToEpub` (text PDFs) and `htmlToEpub` (OCR text wrapped as HTML, as `main/ws-server.js:383-404` does) plus `ctx.addDocToLibrary`, `saveLibrary`, `broadcastLibrary`; the only touch outside the wall is one registration line in `main/ipc-handlers.js` | the agent under the delegated technical vertical | 2026-10-30 |
| D15 Theme in the Business window | read `get-state` on load and on window focus, and follow `onSystemThemeChanged`; no new settings broadcast in the main app | the agent under the delegated technical vertical | 2026-10-30 |

**Impact map:**

| Direction | Item / artifact | Relationship | Effect | Source |
|---|---|---|---|---|
| Upstream | Stage 8 release | merge gate | building may start; merges wait for the release | CLAUDE.md current state; ROADMAP.md |
| Upstream | `pdfjs-dist` | dependency | present only via pdf-parse 2; must become direct and pinned | `package.json:113`; `node_modules/pdfjs-dist` |
| Sideways | Four tabs: Library, Newsroom, Podcasts, Marketplace (APP-TABS-1), In Flight | same edit site `src/components/CommandPalette.tsx` | item 1 merges after APP-TABS-1 for that file | `docs/planning/specs/2026-10-23-5/APP-TABS-1.md:197` |
| Sideways | Library write-race items (LIBRARY-WRITE-RACE-1/2/3) | main import / library IPC area | D14 removes any edit to the import code; LIBRARY-WRITE-RACE-3 treats `main/sync-engine.js` as read-only during its run, so HB-6's one-line D13 change there must not run in parallel with it | ROADMAP.md:867-870 |
| Sideways | Windows installer (NSIS) | `build.fileAssociations` | HB-11 registers `.pdf`; install tests export both uninstall keys first | LL-168; `package.json:60` |
| Downstream | IDEAS E3 "OCR for Scanned PDFs" | absorbed | the review marks it absorbed | `docs/governance/IDEAS.md:75` |
| Downstream | Scanned-PDF "unsupported" import message | could point to Business | optional follow-up for the review | TECHNICAL_REFERENCE.md §Scanned PDF Detection |
| Downstream | Main-app document tabs | new storyboard | reopens APP-TABS-1's "reader stays full-screen with no tab bar" decision; touches `ReaderContainer.tsx` (shared-core) | APP-TABS-1 spec line 11 |
| Downstream | Notion Lane field | no lane fits | review decides; recommend a new "Blurby Business" lane | CLAUDE.md product lanes |
| External | Installer size | grows | roughly 15-20 MB (tesseract WASM + English model), estimate | estimate |
| External | Package verification (standing rule 53) | new window, preload and assets | packaged check on both architectures | CLAUDE.md post-completion checklist |
| External | KillerPDF licence | GPLv3, C#/WPF | features only, no code reuse; implement on pdf.js (Apache-2.0) and tesseract.js (Apache-2.0) | KillerPDF README |
| Deadline | none declared | — | not computable — no deadlines declared | preflight 2026-10-30 |

Register provenance: overlap check read the snapshot `Virtuoso/work-register.snapshot.json` taken 2026-10-28T19:04:46Z (board stale since the roadmap changed); no item covered native PDF display, OCR or a Business area. A live read is due at /write-plan under the registry-helper guard (CLAUDE.md rule 11a).

### Frames

1. **Main success** — Given Blurby Business is the default PDF app and a 60-page report PDF, when the user double-clicks it in File Explorer, then a separate window opens with the report in a tab, page for page like the original, with thumbnails and bookmarks in the sidebar; Ctrl+F finds text, and printed page labels ("iv", "12") show in the page box. *(corrected 2026-10-30: the trigger is a File Explorer double-click)*
2. **Several documents** — Given three PDFs open in tabs, when the user switches between them, then each returns at its own page, zoom and two-page setting; closing the window and reopening Business lists all three in the recent list. *(confirmed)*
3. **Scanned book** — Given a scanned PDF with no text, when it opens, then a bar offers "Recognise text"; once started, progress shows page by page and the words become selectable and searchable. Pressing "Send to Blurby to read" in the toolbar asks for confirmation; only on Confirm does a readable copy appear in the Library, where focus, flow and Narrate work on it. *(corrected: no automatic send; toolbar button plus confirmation)*
4. **Locked file (failure)** — Given a password-protected PDF, when the user enters a wrong password, the prompt says so and asks again; Cancel closes the tab with nothing saved. With the right password the document opens, and reopening it in the same session does not ask again; after restarting Blurby it asks again. *(confirmed)*
5. **Broken or missing file (failure)** — Given a recent-list entry whose file has moved or is corrupt, when the user opens it, then the tab shows a plain "can't open this file" message with the path and a "Remove from list" option; other tabs and the main Blurby window are unaffected. *(confirmed)*
6. **What does not change** — Given Blurby with Business never opened, when the user starts Blurby and reads in any mode, then startup time, the Library and all four reading modes are exactly as today and no Business library loads; any PDF is byte-for-byte unchanged after anything done in Business. *(confirmed)*
7. **Already running** — Given Business already has two tabs open, when the user double-clicks another PDF in File Explorer, then it opens as a third tab in the same Business window, with no second app instance. *(confirmed 2026-10-30)*

### Approach

A second Electron window, in its own session partition with its own CSP (D12), with its own preload (`preload-business.js`) and its own page in the Vite build (`business.html`, `src/business/`). It renders with pdf.js and runs OCR with tesseract.js in a worker, all inside the walled area; main-process support lives in `main/business/`. The Business interface is one self-contained root so a later merge into the main window can host it.

Considered and set aside: a fifth pinned APP-TABS tab — couples Business to APP-TABS-1 (held under the Stage 8 freeze) and shares the library window, weakening the wall. A new reading mode inside the reader — contradicts the owner's ruling that Business is wholly separate and would touch the reading-mode router.

### Draft stub

#### Draft stub — Business window and PDF viewer (proposed BUSINESS-SHELL-1)

- **What:** Business's own window, preload and Vite page; pdf.js renders pages exactly; document tabs; Business's own recent list; Open file and drag-in; entry points from the command palette and the menu flap; the three `getAllWindows()[0]` sites retargeted to the main window (D13).
- **Why:** the walled area and viewer every other item builds on.
- **Done when (draft):** 1. Frame 1's display (page-for-page rendering in a tab). 2. Frame 2. 3. Frame 5. 4. Frame 6 (startup unchanged, no Business library at main startup, PDFs byte-identical). 5. No import between `src/business/` and `src/reader/`.
- **Out of scope:** sidebar panels, view controls, search, OCR, passwords, the Library bridge.
- **Edit sites (expected):** new `main/business/` (window in its own partition and CSP, recent list, IPC); `main/ipc-handlers.js` (one registration line); `main/sync-engine.js:771` and `main/tts-engine.js:96,171` (D13); new `preload-business.js`; new `business.html` and `src/business/`; `vite.config.js` (second input); `package.json` (direct pinned `pdfjs-dist`, `build.files`); `src/components/CommandPalette.tsx` (one entry); the menu flap (one item).
- **Prerequisites:** none to build; merges after the Stage 8 release and after Four tabs (APP-TABS-1) for `CommandPalette.tsx`.
- **Effort:** high
- **Interfaces:** produces the Business IPC namespace and the per-tab document session (path, page, zoom, two-page setting, unlock handle).

#### Draft stub — Navigation and view controls (proposed BUSINESS-NAV-1)

- **What:** sidebar with thumbnails, bookmarks, attachments (save a copy out) and layers (show/hide); zoom, fit and two-page view; printed page labels; internal and external links; Ctrl+F search.
- **Why:** fixed-layout documents need these to be usable.
- **Done when (draft):** 1. Frame 1's sidebar, search and labels. 2. External links open in the default browser; internal links jump. 3. Saving an attachment writes only the chosen copy; the PDF is unchanged.
- **Out of scope:** any write into the PDF.
- **Edit sites (expected):** `src/business/` only.
- **Prerequisites:** Business window and PDF viewer.
- **Effort:** high
- **Interfaces:** consumes the document session; produces the search index the OCR item extends.

#### Draft stub — Password-protected PDFs (proposed BUSINESS-LOCKED-1)

- **What:** password prompt; password held in memory for the session only.
- **Why:** work documents are often locked.
- **Done when (draft):** 1. Frame 4. 2. No password or locked-document OCR text on disk (checked by scanning Business's data directory).
- **Out of scope:** remembering passwords across restarts; encrypting files.
- **Edit sites (expected):** `src/business/`; `main/business/` (session memory only).
- **Prerequisites:** Business window and PDF viewer.
- **Effort:** medium
- **Interfaces:** consumes and fills the session's unlock handle.

#### Draft stub — OCR for scanned PDFs (proposed BUSINESS-OCR-1)

- **What:** detect scanned pages and offer "Recognise text"; run tesseract.js in a worker with the bundled English model; recognised words become selectable and searchable; cached in Business data except for locked files.
- **Why:** scanned documents are unreadable in Blurby today.
- **Done when (draft):** 1. Frame 3's OCR half. 2. OCR runs only when started. 3. Works with no network.
- **Out of scope:** other languages; "Save searchable copy".
- **Edit sites (expected):** `src/business/` (worker, text layer); `main/business/` (cache); `package.json` (tesseract.js and the English model in `build.files`).
- **Prerequisites:** Business window and PDF viewer; Navigation and view controls (search).
- **Effort:** high
- **Interfaces:** produces a recognised-word cache keyed by file content hash.

#### Draft stub — Send to Blurby to read (proposed BUSINESS-SEND-1)

- **What:** a toolbar button and a confirmation dialog that import a copy of the document, with any OCR text, into the Library through the existing import path.
- **Why:** the one deliberate bridge to focus, flow and Narrate.
- **Done when (draft):** 1. Frame 3's send half. 2. Nothing reaches the Library without the button and Confirm. 3. The Library copy is an ordinary book; Business's recent list and working file are unaffected; neither list shows the other's items.
- **Out of scope:** any automatic or background send; linking the two records.
- **Edit sites (expected):** `src/business/` (button, dialog); `preload-business.js`; `main/business/` send handler reusing `convertToEpub` / `htmlToEpub` and `ctx.addDocToLibrary` / `saveLibrary` / `broadcastLibrary` (D14); no edit to `main/ipc/library.js` or `main/epub-converter.js`.
- **Prerequisites:** Business window and PDF viewer; OCR for scanned PDFs.
- **Effort:** medium
- **Interfaces:** consumes the document and its OCR text; produces one Library record via today's import.

#### Draft stub — PDFs open in Blurby Business (proposed BUSINESS-DEFAULT-PDF-1)

- **What:** the installer registers Blurby Business as a `.pdf` handler (`build.fileAssociations`); a `.pdf` path given at launch or to an already-running Blurby (`second-instance`) opens in the Business window; a PDF-only launch opens only Business (A8).
- **Why:** the owner wants Business to behave as a standard PDF app, the default when a PDF is opened from File Explorer.
- **Done when (draft):** 1. Frame 1's trigger. 2. Frame 7. 3. A8: a PDF-only launch shows no library window. 4. A launch with no path behaves exactly as today.
- **Out of scope:** forcing the Windows default (not possible on Windows 11; A9); EPUB association for the main app; other file types.
- **Edit sites (expected):** `package.json` (`build.fileAssociations`); `main.js:489-494` (single-instance lock and `second-instance` handler) and first-launch argv; `main/business/` (open-path routing).
- **Prerequisites:** Business window and PDF viewer.
- **Effort:** medium
- **Interfaces:** consumes HB-6's open-document entry point; produces nothing for later items.

**Placement recommendation (for the review):** a new Stage 9 workstream, "Blurby Business": HB-6, then HB-7, HB-8 and HB-11 in parallel, then HB-9, then HB-10. Built in parallel with other Stage 9 work, touching no shared-core file; held, merging after the Stage 8 release; HB-6 after APP-TABS-1. Not ahead of the current application repairs.

**Impact actions (for the review):** mark IDEAS E3 absorbed; decide the product lane (recommend a new "Blurby Business" lane); open a separate storyboard for main-app document tabs and the main app's EPUB default and intake paths; optionally point the scanned-PDF import message at Business.

### Epic re-scope (reopened 2026-10-30)

After reviewing the four-app feature matrix (`docs/studies/2026-10-30-pdf-competitor-matrix.md`), the owner widened Blurby Business from a Tier 1 viewer to a full PDF viewer and editor. Size ratcheted from item set (6) to epic-scale. Everything above stands as the record of Phase 1, except where marked superseded.

**Outcome (epic):** Blurby Business is a standard Windows PDF viewer and editor and the default PDF app, covering every feature row of the matrix in Viewing, Annotation, Editing, Page organisation, Forms, Optimisation, Signatures, Metadata and Printing, plus merge, extract pages and split by page or every N — 121 features — walled off from the reading modes.

**You said:**
- "We need all rows in viewing, Annotation, Editing, Page organisation, Forms, Optimisation, Signatures, Metadata, and Printing now"
- Save model, engine licence, phase order, extra rows: option (a) each; write-back "Confirmed"; frames "confirm"; draft stub "Approved"; storyboard "A".

**Must never happen (epic):**
- A file is written without an explicit Save or Save As.
- The first overwrite of a file in a session happens before its backup is in place.
- Unsaved edits are lost at quit without a prompt.
- Every Phase 1 wall rule above still holds: no import between Business and the reading modes; passwords and locked-document OCR text never on disk; no Business code in the main bundle; Library and Business lists never mix; Library sends only by toolbar button plus Confirm.

**Out of scope (epic, for now):** the other Merge/split rows; Conversion; Security beyond opening locked files (so no redaction, encryption or sanitising); Comparison; OCR beyond Phase 1; Automation; Accessibility; UI/platform extras other than undo/redo; a commercial or AGPL engine; main-app tabs and the EPUB default.

**Decisions:**

| Decision | Chosen | Decided by | Date |
|---|---|---|---|
| D18 Save model | Acrobat-style: Ctrl+S overwrites, Save As writes a copy; a one-time backup of the original in Business data before the first overwrite in a session, restorable; unsaved dot on the tab; quit prompt | the user | 2026-10-30 |
| D19 Engine licence | permissive only: pdf.js, pdf-lib, @signpdf, bundled qpdf; rows that need a heavy engine are built as far as the stack allows and marked partial | the user | 2026-10-30 |
| D20 Phase order | by frequency of use: P1 viewer; P2 annotation, form filling and save; P3 page organisation and merge; P4 editing and metadata; P5 signatures; P6 form authoring; P7 printing; P8 optimisation (save moved into P2 because annotations must be saved) | the user (the P2 correction by the agent, accepted) | 2026-10-30 |
| D21 Extra rows | add merge PDFs, extract pages, split by page or every N | the user | 2026-10-30 |
| D22 Size and route | epic-scale: held; `/roadmap-review` places it as `Path: epic` after Seq 100 and before Seq 104 (values assigned at absorption, through the qualified helper); `/epic` charters it with Phase 1's specs as its first worklist | the agent under the storyboard rule; route agreed with Blurby.Roadmap | 2026-10-30 |
| D6, D7 (amended) | "Tier 1 never writes to a PDF" now holds only until an explicit Save or Save As | the user (via D18) | 2026-10-30 |

**Assumed:**

| Assumption | Resolution |
|---|---|
| A10 Undo/redo is in scope although it sits under UI/platform | confirmed 2026-10-30 |
| A11 Annotations and form data are written as standard PDF objects that Acrobat and other readers show | confirmed |
| A12 Backups: one per file per session, the most recent 20 files kept, restorable from Business's File menu | confirmed |
| A13 Signing uses .pfx/.p12 files and the Windows certificate store; USB tokens partial | confirmed |
| A14 Partial rows accepted (D19): likely separations preview, full text reflow, deskew and perspective correction | confirmed |
| A15 "Send to Blurby to read" sends the last saved state, never unsaved edits | confirmed |
| A16 Viewing rows beyond the six planned items (split pane, page grid, rotate view, full screen, history, night mode, touch, snapshot, revision view) join Phase 1's worklist at charter time; the comments panel joins P2 and the signatures panel P5 | accepted — guard: the charter's P1 worklist lists them by matrix row |

**Frames (epic):**

8. **Annotate and save** — Given a contract open in Business, when the user highlights a clause, adds a sticky note and presses Ctrl+S, then the tab's unsaved dot clears, a backup of the original is in Business data, and Acrobat shows the highlight and note. *(confirmed)*
9. **Unsaved at quit** — Given a tab with unsaved edits, when the user quits Blurby, then a prompt offers Save, Don't Save or Cancel, and Cancel keeps Blurby open with the edits intact. *(confirmed)*
10. **Reorganise and merge** — Given two PDFs, when the user merges them, drags page 5 to the front, deletes page 2 and chooses Save As, then the new file has the expected order and both originals are byte-identical. *(confirmed)*
11. **Sign** — Given a .pfx certificate, when the user places a signature and signs, then the saved PDF validates as signed in Business's signatures panel, and a later edit shows it as modified after signing. *(confirmed)*
12. **Read-only or locked file (failure)** — Given a PDF in a read-only location or open in another program, when the user presses Ctrl+S, then Business says it cannot overwrite and offers Save As, and nothing is lost. *(confirmed)*
13. **Restore** — Given a file overwritten earlier today, when the user chooses File → Restore original, then the backup replaces the file after confirmation. *(confirmed)*

**Approach (epic):** one Business window; pdf.js renders and edits annotations in view; pdf-lib writes files; @signpdf signs; qpdf (bundled for x64 and ARM64) optimises and repairs; all inside the wall. Considered and set aside: MuPDF under a commercial licence (recurring cost) or AGPL (source-release obligation if Blurby is distributed) — D19.

**Draft stub (epic phases):**

| Phase | What | Done when (draft) | Edit sites (expected) | Prerequisites | Effort |
|---|---|---|---|---|---|
| P1 Viewer | HB-6..HB-11 as specified in `2026-10-30-blurby-business-tier1/phase1-specs.md` (with native text select and copy added to HB-7), plus the A16 viewing rows | frames 1–7; the specs' Done-when rows | as in the specs | APP-TABS-1; LIBRARY-COMPLETION-VISIBILITY-1's window; Stage 8 release (merges) | high |
| P2 Annotation, form fill, save | 16 annotation rows; fill AcroForms; Ctrl+S, Save As, backup, unsaved dot, quit prompt; undo/redo; comments panel | frames 8, 9, 12, 13 | `src/business/` (annotation layer, form layer, save flow); `main/business/` (atomic save, backup store, quit hook); pdf-lib | P1 | xhigh |
| P3 Page organisation and merge | 25 page-organisation rows; merge, extract, split by page or every N | frame 10 | `src/business/` (page grid, organiser); pdf-lib; qpdf repair | P2 | high |
| P4 Editing and metadata | 14 editing rows (in-place text editing partial per A14); 8 metadata rows | an edited text line shows after save; metadata round-trips | `src/business/`; pdf-lib content streams | P2 | xhigh |
| P5 Signatures | 10 signature rows; signatures panel | frame 11 | `main/business/` (@signpdf, Windows certificate store); signatures panel | P2 | high |
| P6 Form authoring | create and edit fields, detection, calculations, FDF/XFDF data, flatten, data merge | an authored field fills, flattens and round-trips through Acrobat | `src/business/`; pdf-lib AcroForm | P2 | high |
| P7 Printing | 3 printing rows | preview page count matches; duplex and n-up reach the print dialog | `src/business/`; Electron `webContents.print` | P1 | medium |
| P8 Optimisation | 6 optimisation rows (separations partial) | reduced fixture is smaller and opens; preflight lists the fixture's known issues | `main/business/` (bundled qpdf); `package.json` `build.files` | P3 | high |

**Interfaces:** P1 produces the document session and `openPaths`; P2 produces `saveDocument`, the backup store, undo history and the annotation model, consumed by every later phase.

**Placement recommendation (for the review):** one item, `Path: epic`, after Four tabs (APP-TABS-1, Seq 100) and before Blurby server (BLURBY-SERVER-1, Seq 104), Seq values assigned at absorption through the qualified helper; a new "Blurby Business" workstream added through the lanes → workstreams rename (AGENT-PROTOCOL-CONSOLIDATION-1), its name confirmed with the owner.

**Impact actions (for the review):** mark IDEAS E3 absorbed; decide and name the workstream; separate storyboard for main-app tabs and the EPUB default; the matrix's Blurby Business column now shows each in-scope row's phase.

### Alignment verdict

Aligned — 2026-10-30. The user approved: "Approved" (draft stub) and "A" (storyboard). Reopened 2026-10-30 for entry points (D4, HB-11, A8, A9, frames 1 and 7); re-approved: "All looks good as recommended, I believe". Reopened 2026-10-30 for the epic re-scope (D18–D22, A10–A16, frames 8–13, phases P1–P8); re-approved: "Approved" (draft stub) and "A" (storyboard).

## Plan
