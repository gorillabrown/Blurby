# Held Plan — Blurby Business, Tier 1: PDFs shown as they are, in their own window

<!-- virtuoso-held-plan v1 -->

- **Entry:** 2026-10-30-blurby-business-tier1
- **Size:** item set (5)
- **Origin:** storyboard 2026-10-30. The owner asked to bring KillerPDF's (github.com/SteveTheKiller/KillerPDF) functionality into Blurby, ruled that it lives in a wholly separate, walled-off area called Blurby Business, and asked to scope Tier 1 (the reading-adjacent features) now. Tier 2 (PDF editing) is held back as a product-direction question.

## Trail

| Date | State | By | Note |
|---|---|---|---|
| 2026-10-30 | storyboarded | storyboard | aligned; item set; 5 items (BUSINESS-SHELL/NAV/LOCKED/OCR/SEND, provisional) |

## Storyboard

### Alignment record

**Outcome:** a separate Blurby Business window opens PDFs exactly as they are: page for page, in its own document tabs, with navigation, view controls, OCR for scanned pages and password-protected files. A confirmed toolbar action can send a readable copy into the Library.

**Why now:** the owner wants KillerPDF's capabilities in Blurby. Blurby today converts every PDF to EPUB on import (`pdfToEpub`, `main/file-parsers.js`), which loses the layout of work documents, and it rejects scanned PDFs outright (TECHNICAL_REFERENCE.md §Scanned PDF Detection). Tier 1 is useful on its own and is the foundation for any later Tier 2.

**Done looks like:** from the menu, the command palette or "Open with Blurby Business", a separate window opens a PDF page for page in a tab. Its sidebar holds thumbnails, bookmarks, attachments and layers; the view has zoom, fit and two-page modes, printed page labels, working links and search. A scanned PDF can be recognised, and its words become selectable and searchable. A locked PDF asks for its password once per session. A toolbar button, after a confirmation, puts a readable copy (OCR text included) into the Library.

**Must never happen:**
- Business code imports reading-mode code (Page, Focus, Flow, Narrate), or the reverse.
- A PDF on disk is changed in any way by anything done in Business.
- A password, or OCR text of a locked PDF, reaches disk.
- Business's libraries (pdf.js viewer, tesseract.js) load at main Blurby startup.
- A Business document reaches the Library by any path other than the toolbar button followed by Confirm. There is no automatic send.
- Business's recent list or working files appear in the Library, library search, the reading queue, reading stats or sync; Library items appear in Business's recent list. Temporary work items and readings are never conflated.

**Out of scope:**
- All Tier 2 editing: markup saved into the PDF, text editing, page organisation, compare, conversion/export, forms, redaction, encryption, certificate signing, automation, printing, "Save searchable copy".
- Document tabs in the main Blurby app (a separate storyboard; it reopens APP-TABS-1's "reader stays full-screen" decision).
- Merging the Business window into the main window (the owner expects it later; Tier 1 only guards for it).
- OCR languages other than English.
- Syncing Business's recent list.
- Reading aloud, focus or flow reading inside Business.

**You said:**
- "Let's build this into a future version of blurby: https://github.com/SteveTheKiller/KillerPDF"
- "I think this would be separate. Let's build this wholly separate, walled off area within the app for this for now and call it Blurby Business"
- "I like the notion of engaging with a tab approach for quick switching on the primary blurby app and across modes."
- "Scope tier 1"
- On the window: "A but I think in the future we merge the two"
- On frame 3: "there should be no auto send to library action. This should be a button to be pressed in the toolbar + a confirmation. We want to be very careful [not] to muddy, confuse, conflate temporary work items with other readings."
- Every other question: option (a).

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
| Sending to the Library happens automatically after OCR | corrected → only by a toolbar button plus a confirmation (frame 3) |

**Decisions:**

| Decision | Chosen | Decided by | Date |
|---|---|---|---|
| D1 Which tier to scope | Tier 1 (reading-adjacent); Tier 2 held | the user | 2026-10-30 |
| D2 How tabs split from Business | Business has its own document tabs; main-app tabs are a separate storyboard | the user | 2026-10-30 |
| D3 Who Business is for | the owner and readers like them: work documents where layout matters; Tier 1 is useful alone and is Tier 2's base | the user | 2026-10-30 |
| D4 How you get into Business | its own window, from the menu, the command palette or "Open with Blurby Business"; a future merge into the main window is expected, so its interface is one self-contained root either window can host | the user | 2026-10-30 |
| D5 Where documents come from | Business's own recent list in its own file; PDFs stay PDFs; "Send to Blurby to read" is the one bridge | the user | 2026-10-30 |
| D6 What OCR produces | view-only: words selectable and searchable, cached in Business data; plus the bridge carries the OCR text | the user | 2026-10-30 |
| D7 Passwords | asked once, held in memory for the session only, never on disk; OCR text of a locked PDF is never cached to disk | the user | 2026-10-30 |
| D8 Placement | recommend a new Stage 9 workstream, built in parallel, held, merged after the Stage 8 release; not ahead of current application repairs | the user (recommendation to the review) | 2026-10-30 |
| D9 OCR model delivery | the English model ships in the installer; no runtime download | the agent under the delegated technical vertical (CLAUDE.md rule 11) | 2026-10-30 |
| D10 pdf.js dependency | make `pdfjs-dist` a direct, pinned dependency (today it is only transitive through pdf-parse 2) | the agent under the delegated technical vertical | 2026-10-30 |
| D11 Library bridge trigger | toolbar button + confirmation only; never automatic | the user | 2026-10-30 |

**Impact map:**

| Direction | Item / artifact | Relationship | Effect | Source |
|---|---|---|---|---|
| Upstream | Stage 8 release | merge gate | building may start; merges wait for the release | CLAUDE.md current state; ROADMAP.md |
| Upstream | `pdfjs-dist` | dependency | present only via pdf-parse 2; must become direct and pinned | `package.json:113`; `node_modules/pdfjs-dist` |
| Sideways | Four tabs: Library, Newsroom, Podcasts, Marketplace (APP-TABS-1), In Flight | same edit site `src/components/CommandPalette.tsx` | item 1 merges after APP-TABS-1 for that file | `docs/planning/specs/2026-10-23-5/APP-TABS-1.md:197` |
| Sideways | Library write-race items (LIBRARY-WRITE-RACE-1/2/3) | main import / library IPC area | item 5's narrow import touch must check file ownership at /write-plan | ROADMAP.md:867-870 |
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

1. **Main success** — Given a 60-page report PDF, when the user chooses "Open with Blurby Business", then a separate window opens with the report in a tab, page for page like the original, with thumbnails and bookmarks in the sidebar; Ctrl+F finds text, and printed page labels ("iv", "12") show in the page box. *(confirmed)*
2. **Several documents** — Given three PDFs open in tabs, when the user switches between them, then each returns at its own page, zoom and two-page setting; closing the window and reopening Business lists all three in the recent list. *(confirmed)*
3. **Scanned book** — Given a scanned PDF with no text, when it opens, then a bar offers "Recognise text"; once started, progress shows page by page and the words become selectable and searchable. Pressing "Send to Blurby to read" in the toolbar asks for confirmation; only on Confirm does a readable copy appear in the Library, where focus, flow and Narrate work on it. *(corrected: no automatic send; toolbar button plus confirmation)*
4. **Locked file (failure)** — Given a password-protected PDF, when the user enters a wrong password, the prompt says so and asks again; Cancel closes the tab with nothing saved. With the right password the document opens, and reopening it in the same session does not ask again; after restarting Blurby it asks again. *(confirmed)*
5. **Broken or missing file (failure)** — Given a recent-list entry whose file has moved or is corrupt, when the user opens it, then the tab shows a plain "can't open this file" message with the path and a "Remove from list" option; other tabs and the main Blurby window are unaffected. *(confirmed)*
6. **What does not change** — Given Blurby with Business never opened, when the user starts Blurby and reads in any mode, then startup time, the Library and all four reading modes are exactly as today and no Business library loads; any PDF is byte-for-byte unchanged after anything done in Business. *(confirmed)*

### Approach

A second Electron window with its own preload (`preload-business.js`) and its own page in the Vite build (`business.html`, `src/business/`). It renders with pdf.js and runs OCR with tesseract.js in a worker, all inside the walled area; main-process support lives in `main/business/`. The Business interface is one self-contained root so a later merge into the main window can host it.

Considered and set aside: a fifth pinned APP-TABS tab — couples Business to APP-TABS-1 (held under the Stage 8 freeze) and shares the library window, weakening the wall. A new reading mode inside the reader — contradicts the owner's ruling that Business is wholly separate and would touch the reading-mode router.

### Draft stub

#### HB-1 — Business window and PDF viewer (proposed BUSINESS-SHELL-1)

- **What:** Business's own window, preload and Vite page; pdf.js renders pages exactly; document tabs; Business's own recent list; entry points from the menu, the command palette and "Open with Blurby Business".
- **Why:** the walled area and viewer every other item builds on.
- **Done when (draft):** 1. Frame 1's display (page-for-page rendering in a tab). 2. Frame 2. 3. Frame 5. 4. Frame 6 (startup unchanged, no Business library at main startup, PDFs byte-identical). 5. No import between `src/business/` and `src/reader/`.
- **Out of scope:** sidebar panels, view controls, search, OCR, passwords, the Library bridge.
- **Edit sites (expected):** `main.js` (window creation, menu); new `main/business/` (window, recent list, IPC); new `preload-business.js`; new `business.html` and `src/business/`; `vite.config` (second page); `package.json` (direct pinned `pdfjs-dist`, `build.files`); `src/components/CommandPalette.tsx` (one entry).
- **Prerequisites:** none to build; merges after the Stage 8 release and after Four tabs (APP-TABS-1) for `CommandPalette.tsx`.
- **Effort:** high
- **Interfaces:** produces the Business IPC namespace and the per-tab document session (path, page, zoom, two-page setting, unlock handle).

#### HB-2 — Navigation and view controls (proposed BUSINESS-NAV-1)

- **What:** sidebar with thumbnails, bookmarks, attachments (save a copy out) and layers (show/hide); zoom, fit and two-page view; printed page labels; internal and external links; Ctrl+F search.
- **Why:** fixed-layout documents need these to be usable.
- **Done when (draft):** 1. Frame 1's sidebar, search and labels. 2. External links open in the default browser; internal links jump. 3. Saving an attachment writes only the chosen copy; the PDF is unchanged.
- **Out of scope:** any write into the PDF.
- **Edit sites (expected):** `src/business/` only.
- **Prerequisites:** Business window and PDF viewer.
- **Effort:** high
- **Interfaces:** consumes the document session; produces the search index the OCR item extends.

#### HB-3 — Password-protected PDFs (proposed BUSINESS-LOCKED-1)

- **What:** password prompt; password held in memory for the session only.
- **Why:** work documents are often locked.
- **Done when (draft):** 1. Frame 4. 2. No password or locked-document OCR text on disk (checked by scanning Business's data directory).
- **Out of scope:** remembering passwords across restarts; encrypting files.
- **Edit sites (expected):** `src/business/`; `main/business/` (session memory only).
- **Prerequisites:** Business window and PDF viewer.
- **Effort:** medium
- **Interfaces:** consumes and fills the session's unlock handle.

#### HB-4 — OCR for scanned PDFs (proposed BUSINESS-OCR-1)

- **What:** detect scanned pages and offer "Recognise text"; run tesseract.js in a worker with the bundled English model; recognised words become selectable and searchable; cached in Business data except for locked files.
- **Why:** scanned documents are unreadable in Blurby today.
- **Done when (draft):** 1. Frame 3's OCR half. 2. OCR runs only when started. 3. Works with no network.
- **Out of scope:** other languages; "Save searchable copy".
- **Edit sites (expected):** `src/business/` (worker, text layer); `main/business/` (cache); `package.json` (tesseract.js and the English model in `build.files`).
- **Prerequisites:** Business window and PDF viewer; Navigation and view controls (search).
- **Effort:** high
- **Interfaces:** produces a recognised-word cache keyed by file content hash.

#### HB-5 — Send to Blurby to read (proposed BUSINESS-SEND-1)

- **What:** a toolbar button and a confirmation dialog that import a copy of the document, with any OCR text, into the Library through the existing import path.
- **Why:** the one deliberate bridge to focus, flow and Narrate.
- **Done when (draft):** 1. Frame 3's send half. 2. Nothing reaches the Library without the button and Confirm. 3. The Library copy is an ordinary book; Business's recent list and working file are unaffected; neither list shows the other's items.
- **Out of scope:** any automatic or background send; linking the two records.
- **Edit sites (expected):** `src/business/` (button, dialog); `preload-business.js`; one narrow entry on the main import path (exact file chosen at /write-plan).
- **Prerequisites:** Business window and PDF viewer; OCR for scanned PDFs.
- **Effort:** medium
- **Interfaces:** consumes the document and its OCR text; produces one Library record via today's import.

**Placement recommendation (for the review):** a new Stage 9 workstream, "Blurby Business": HB-1, then HB-2 and HB-3 in parallel, then HB-4, then HB-5. Built in parallel with other Stage 9 work, touching no shared-core file; held, merging after the Stage 8 release; HB-1 after APP-TABS-1. Not ahead of the current application repairs.

**Impact actions (for the review):** mark IDEAS E3 absorbed; decide the product lane (recommend a new "Blurby Business" lane); open a separate storyboard for main-app document tabs; optionally point the scanned-PDF import message at Business.

### Alignment verdict

Aligned — 2026-10-30. The user approved: "Approved" (draft stub) and "A" (storyboard).

## Plan
