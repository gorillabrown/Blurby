---
epic: blurby-business
id: BLURBY-BUSINESS-1
item: BLURBY-BUSINESS-1
origin: roadmap — BLURBY-BUSINESS-1
created: 2026-10-30
status: active   # active | complete | aborted — set complete only per launch.md Completion protocol
---

# Epic Charter — Blurby Business: a walled-off PDF viewer and editor

<!-- FROZEN after launch. Only the user amends this file; the executor treats it as the
     contract. If reality proves the contract wrong, that is a BLOCKER(USER), not an edit. -->

## Outcome

Blurby Business is a standard Windows PDF viewer and editor. It is the registered `.pdf`
handler, and it is walled off from Blurby's four reading modes. It delivers every Blurby
Business row of the four-app matrix that carries a phase marker (131 rows at scaffold).
That covers Viewing, Annotation, Editing, Page organisation, Forms, Optimisation,
Signatures, Metadata and Printing, plus merge, extract and split. Every write to a PDF
happens through an explicit Save or Save As, with a restorable backup. The one bridge
into the Library is a toolbar button followed by Confirm.

Sources: the roadmap item BLURBY-BUSINESS-1 (Seq 100.5, `Path: epic`, lane Blurby
Business) and its held storyboard `docs/planning/holding/2026-10-30-blurby-business-tier1.md`.
That storyboard holds the alignment record (D1–D22, A1–A16) and the frames (1–13). Phase 1's
specifications are in `docs/planning/holding/2026-10-30-blurby-business-tier1/phase1-specs.md`
(HB-6..HB-11). The matrix is `docs/studies/2026-10-30-pdf-competitor-matrix.md`. These three
files, **as they stand at the commit that adds this charter**, are part of this contract.
The executor reads them and never edits them, except for the matrix's Blurby Business
column, which D18 says to update.

## Definition of Done — all rows must pass

All commands run from the repository root, in Git Bash unless a row names PowerShell 7.
"Smoke" means `node scripts/business-smoke/smoke.mjs --exe <x64 unpacked Blurby.exe>
--profile <scratch> --fixture <fixture> --check <name>`, run against the packaged build of
the run branch's final tip. It exits 0 on pass, 1 on a failed assertion and 2 on a harness
error. It proves the scratch profile before acting (LL-165). It also proves that each fixture's
SHA-256 is unchanged unless the check names a Save.

| # | Condition | Verify by | Expected evidence |
|---|-----------|-----------|-------------------|
| D1 | Phase 1 (viewer) is complete as specified | Re-run every Done-when row of HB-6 (1–10), HB-7 (1–6), HB-8 (1–3), HB-11 (1–5), HB-9 (1–6) and HB-10 (1–6) exactly as written in `phase1-specs.md`. HB-11 row 5 and HB-9 row 6 are recorded results. | Every row exits with the code it names. Each output is pasted per row. |
| D2 | The wall holds in the renderer | `npx vitest run tests/businessBoundary.test.ts` | Exit 0. The closure of `src/business/main.tsx` stays inside `src/business/`, `src/styles/` and `src/components/ThemeProvider.tsx`. Its external packages are a subset of the allow-list in the test, which may hold only permissive Business engines (D19). The closure of `src/main.tsx` holds no `src/business/` file. Both synthetic negative controls are reported. |
| D3 | The wall holds in the main process and the shared core | `git grep -n -E "require\(['\"]\./business/\|require\(['\"]\.\./business/\|business/(ipc\|launch-args)" -- main main.js ':!main/business'`, and `git diff --exit-code <base>...HEAD -- src/reader src/components/ReaderContainer.tsx src/utils/FlowScrollEngine.ts src/types.ts main/ipc/library.js main/epub-converter.js main/file-parsers.js` | The grep prints only the registration line in `main/ipc-handlers.js` and the launch-routing lines in `main.js`. The diff exits 0. |
| D4 | No Business engine loads in the main window | `npm run build`, then `node scripts/business/check-main-bundle.mjs` | Both exit 0. The check also fails on `pdf-lib`, `signpdf` and `qpdf` strings in the main bundle, as well as `pdfjs` and `tesseract`. |
| D5 | Annotate and save (frame 8) | `npx vitest run tests/business*.test.*` (the annotation and save tests are part of it), then smoke `--check annotate-save` on `report.pdf` | Vitest exits 0 and the smoke exits 0. After Ctrl+S the tab's unsaved dot clears, and a backup of the original exists in `<profile>/business/backups/`. The saved file, read back with pdf-lib and `qpdf --check`, carries a `/Highlight` and a `/Text` annotation, each with an `/AP` appearance stream. |
| D6 | All 16 Annotation rows, the comments panel and undo/redo (A10) | Business vitest suite; smoke `--check annotate-all` | Exit 0. Each Annotation row in the matrix that is marked P2 names its test (D18). |
| D7 | Fill forms (P2) | Business vitest suite; smoke `--check form-fill` on a generated AcroForm fixture | Exit 0. The filled values read back from the saved file with pdf-lib. |
| D8 | Nothing is written without Save, and backups behave (D18, A12) | Smoke `--check no-save`. Business vitest suite (backup store). | Smoke exit 0: after annotating and editing with no Save, quitting with Don't Save leaves the fixture's SHA-256 unchanged. Tests prove the following. The first overwrite in a session is preceded by a backup. Later saves in the same session make no new backup. Only the most recent 20 files keep backups. A failed backup aborts the save and leaves the original untouched. |
| D9 | Unsaved at quit (frame 9) | Business vitest suite; smoke `--check quit-prompt` | Exit 0. Quitting with unsaved edits offers Save, Don't Save and Cancel. Cancel keeps Blurby running with the edits intact. The prompt goes through the existing quit sequence (`main/quit-sequence.js`) without an async quit listener (LL-157). |
| D10 | A read-only or locked file (frame 12) | Business vitest suite; smoke `--check readonly-save` on a fixture with the read-only attribute set | Exit 0. Ctrl+S reports that Business cannot overwrite the file and offers Save As. Nothing is lost, and the fixture is unchanged. |
| D11 | Restore the original (frame 13, A12) | Business vitest suite; smoke `--check restore` | Exit 0. File → Restore original asks for confirmation, then replaces the file with the backup's bytes, so the SHA-256 equals the pre-save hash. |
| D12 | Reorganise, merge, extract and split (frame 10, D21; all 25 Page-organisation rows) | Business vitest suite; smoke `--check reorganise` | Exit 0. Two fixtures are merged, page 5 is moved to the front, page 2 is deleted and the result is saved with Save As. The output's page order matches the expected list, read with pdf-lib, and `qpdf --check` exits 0. Both originals are byte-identical. Extract and split (by page, and every N) produce the expected page counts. |
| D13 | Editing and metadata (P4: 14 Editing and 8 Metadata rows) | Business vitest suite; smoke `--check edit-text` and `--check metadata` | Exit 0. An edited text line reads back from the saved file's text content. Title, author, subject, keywords and XMP round-trip. Rows that are partial under A14 are marked ◐ in the matrix with their reason. |
| D14 | Sign (frame 11; all 10 Signature rows) | Business vitest suite; smoke `--check sign` with a generated self-signed `.pfx` fixture | Exit 0. The saved PDF shows as validly signed in Business's signatures panel, which uses the same verification code the test drives. After a later edit and save, it shows as modified after signing. USB tokens are ◐ (A13). |
| D15 | Form authoring (P6) | Business vitest suite; smoke `--check form-author` | Exit 0. An authored text field, checkbox and calculated field fill, flatten and round-trip through pdf-lib. FDF and XFDF export, then re-import, restore the same values. |
| D16 | Printing (P7: 3 rows) | Business vitest suite (with `webContents.print` mocked) | Exit 0. The preview page count equals the document's page count. The duplex, n-up and page-range options reach the `print` call. No real printer is used. |
| D17 | Optimisation and the bundled qpdf (P8: 6 rows) | Business vitest suite; smoke `--check optimise --offline`; `node scripts/business/check-qpdf.mjs` | Exit 0. The reduced fixture is smaller and passes `qpdf --check`. Preflight lists the fixture's known seeded issues. qpdf runs from the packaged app's unpacked resources for x64 and for arm64, with no network. |
| D18 | Every in-scope matrix row is delivered or a recorded partial | `node scripts/business/check-matrix-coverage.mjs docs/studies/2026-10-30-pdf-competitor-matrix.md` | Exit 0. All 131 Blurby Business rows that carry a phase marker at the charter commit are still present. Each reads ✅ and names an existing test file or smoke check, or reads ◐ with an A14, D19 or A13 reason. No in-scope row reads — and no row was dropped. |
| D19 | Permissive licences only (D19) | `node scripts/business/check-licences.mjs` | Exit 0. Every dependency the run added, direct or bundled (including the qpdf binaries and the OCR model), carries an MIT, Apache-2.0, BSD-2/3-Clause, ISC or zlib licence. Nothing is AGPL, GPL or commercial. |
| D20 | The rest of Blurby is unchanged (frame 6) | `npm test`; `npm run typecheck`; `npm run build`; `git diff --stat <base>...HEAD` | npm test passes with at least as many tests as the base (≥ 2,452) and 0 failed. Typecheck and build exit 0. The diffstat shows no unexpected shrink in any file outside `src/business/` and `main/business/` (truncation check). |
| D21 | Package verification on the final tip (standing rule 53, LL-167) | On RodneySr, `--dir --x64` and `--dir --arm64` builds of the final tip; a 25 s x64 launch on a scratch profile; every smoke check above re-run on the packaged x64 exe; the asar contents listed | Both builds exit 0, with identical `app.asar` across the pair. The launch shows no error and no crash. The asar holds `preload-business.js` and `dist/business.html`, plus the OCR assets, with qpdf unpacked. A "Package verification" section is in `done.md`, and Blurby.Brain's confirmation of the package is recorded in state.md → Evidence. |

Rules: the session claiming completion re-runs **every** row fresh and pastes the outputs
into state.md → Evidence. Any row unverified ⇒ the epic is not done. Rows may be tightened
by the user, never loosened by the executor. `<base>` is the base commit recorded in
state.md's Working set when the run branch was created.

## Constraints — hard limits

- **Git, from `policy.git` (push):** all work happens on the branch `eb/blurby-business-1`, in the
  worktree `C:\Projects\bb-business` on RodneySr. The branch is cut from `origin/main` at
  the first session, at or after the commit that adds this packet (scaffold base
  `5d07b515`). Stage exact paths only, never `git add .` or `-A`. Commit at every
  checkpoint. Push to `origin` after each checkpoint with an explicit refspec:
  `git push origin HEAD:refs/heads/eb/blurby-business-1`. Never force-push, rebase, reset,
  stash or clean. Divergence is a BLOCKER(USER). The recipe is launch.md's GIT WORK.
- **The run never merges into `main`.** Merges are Blurby.Roadmap's, on its go after
  Blurby.Brain confirms the package (rule 5b). They wait for the Stage 8 release, for Four tabs
  (APP-TABS-1), and for the seven held branches named in `phase1-specs.md` → Readiness. At each
  phase exit gate the executor may file a merge request (an issue to Blurby.Roadmap). It
  keeps working while that request waits.
- **Start gate:** no source or test edit until LIBRARY-COMPLETION-VISIBILITY-1's exclusive
  source/test window is closed. The register reads it as terminal, or its Notes say the
  window closed. The first session checks this before its first edit.
- **Execution host:** RodneySr (x64, the quiet machine), temporarily, under standing rule
  53's placement (rule 6b). Never touch `C:\Projects\bq-main`'s detached `36ac7466` or its
  `stash@{0}`. The arm64 native launch runs on Rodney at merge time, outside this run.
- **Wall:** no import between Business and the reading modes (Page, Focus, Flow,
  Narrate), in either direction. Nothing in the shared-core freeze set is touched
  (`src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `src/types.ts`),
  and nothing in the import code (`main/ipc/library.js`, `main/epub-converter.js`,
  `main/file-parsers.js`). Main-process Business code lives in `main/business/`. Outside the
  wall, only the edit sites the Phase 1 specs name may change.
- **Data safety:** a file is written only through an explicit Save or Save As. The first
  overwrite of a file in a session happens only after its backup is in place. A password,
  or the OCR text of a locked PDF, never reaches disk. Business's recent list and the
  Library never mix. The Library receives a document only through the toolbar button
  followed by Confirm, and receives the last saved state (A15).
- **Engines:** permissive licences only: pdf.js, pdf-lib, @signpdf, qpdf (bundled for x64
  and arm64) and tesseract.js with the bundled English model. Nothing is fetched at runtime.
- **Tests and builds** run with the Business fixtures generated by
  `scripts/business-smoke/make-fixtures.mjs`. Never use a real user document, the live
  profile or a real printer, and never install a signing certificate into the Windows store
  (a test `.pfx` file only).
- **Never publish or release.** No version number (memory: Blurby is not public). No
  installer is distributed. The NSIS install check (HB-11 row 5) exports both uninstall keys
  first (LL-168).
- **Budget:** about 40 sessions. Each session stays under about 40 tool uses per wave (Standing Rules).

## Non-goals — explicitly out of scope

- Merge/split rows beyond merge, extract and split by page or every N. Also out:
  Conversion, Comparison, Automation, Accessibility, and the UI/platform extras other than
  undo/redo (D21).
- Security beyond opening locked files: no redaction, encryption or sanitising.
- OCR languages other than English, and "Save searchable copy".
- Main-app document tabs, the main app's EPUB default and intake paths, and merging the
  Business window into the main window. These are separate storyboards; the run guards
  for the merge only by keeping one self-contained Business root.
- Reading aloud, focus or flow reading inside Business, and any "Open in Blurby Business"
  action on Library cards.
- A commercial or AGPL engine, such as MuPDF.
- Syncing Business's recent list or backups.

## Autonomy grants — the executor decides alone (log each call in state.md → Decision log)

- Ordering of work within a phase, and test structure, naming and fixture contents.
- New smoke check names and new test files. The DoD names the checks it requires, and more
  are welcome.
- Visual layout of Business controls within Blurby's theme tokens and the `.bb-` CSS
  prefix. Layouts follow familiar PDF-app conventions. The owner's look-and-feel review
  joins release gate (2)'s list, not a stop in this run.
- Exact pinned versions of permissive dependencies, and how qpdf is bundled and located
  per architecture. Each version and licence is recorded in the Working set.
- Marking a row ◐ when the permissive stack cannot do it fully (A14). The reason is
  recorded in the matrix row and the Decision log.
- Refactors under about 50 lines inside `src/business/` or `main/business/` that enable
  testing.
- Splitting or reordering phases (the plan may be replanned), provided Interfaces stay
  satisfied and exit gates only tighten.
- Network operations under `policy.git.networkOperations: allow`: fetch, push of the run
  branch, and `npm ci`/`npm install` of the dependencies above.
- Routing a technical question to Blurby.Brain (rule 11). Brain's ruling is charter-grade
  for technical matters. Log it, and keep working on other fronts while waiting.

## Escalation triggers — STOP and surface to the user

- Any action that is destructive, irreversible, or outward-facing beyond the grants above.
- A DoD row that appears unachievable as written, or a matrix row that would have to drop
  from ✅/◐ to —.
- Reality contradicting this charter or a listed assumption's guard failing.
- The session/time budget in Constraints is exhausted with DoD rows still unmet.
- A design or functionality choice that changes what a frame shows, adds or removes a
  feature, or changes the save model. These belong to the owner (rule 11).
- The start gate is closed at a session's start (LIBRARY-COMPLETION-VISIBILITY-1's window
  still open). In that case, work only on fronts that edit no source or test file.
- A dependency needed for a row is only available under a non-permissive licence.
- A conflict with a held branch or with `main` that needs more than re-applying a narrow edit.
- Anything that would write to the live Blurby profile, the Windows certificate store, or
  the PDF association outside the HB-11 install check.

When triggered: write a BLOCKER(USER) in state.md with the exact question and what it
unblocks, advance any unblocked front; if every front is blocked, append a final journal
entry and stop cleanly.

## Assumptions — gaps accepted at launch (unattended launches especially)

| Assumption | Risk if wrong | Guard |
|------------|---------------|-------|
| RodneySr has Node 24, git access to `origin`, and room for a new worktree; the run's session there can act unattended | The run stalls at its first command | The first session's GIT WORK and `npm ci` are the check. If either fails, raise BLOCKER(tech) and route it to Blurby.Brain, which runs RodneySr. |
| pdf-lib can write the annotation, form and page-organisation objects that other readers show (A11) | Saved annotations are invisible elsewhere | D5 reads back `/AP` streams. A P2 exit gate checks that a pdf.js reload renders the saved annotation. The owner's Acrobat check is deferred to release gate (2). |
| @signpdf with a `.pfx` gives a valid PAdES/PKCS#7 signature, and the Windows certificate store is reachable from main (A13) | Signing rows fail | P5 opens with a timeboxed spike (≤3h). If it fails, file an issue to Brain. The store is ◐ if unreachable. |
| qpdf binaries exist under Apache-2.0 for win-x64 and win-arm64 and run from the packaged `app.asar.unpacked` | Optimisation and repair rows fail on one architecture | P8 opens with a spike. D17 checks both architectures. If no arm64 binary exists, file a BLOCKER(USER) with the options. |
| In-place text editing is feasible only partially on pdf-lib content streams (A14) | Expectations for the P4 rows | Mark those rows ◐ with the reason. D18 accepts ◐ only with a reason. |
| The Stage 8 release and the held branches may land mid-run | The run branch drifts far from `main` | Journal each base move. Never merge to catch up. A conflict at merge time is Blurby.Roadmap's to route. |
| The prior Phase 1 specs remain accurate against the code at the first session | Their line numbers and edit sites have moved | P1 is discovery-first: re-verify every cited location, and journal the corrections. Done-when rows are unchanged unless a row is impossible, in which case escalate. |

## Lessons applied — the project's own history, read before the run

| Lesson | Bears on | Applied as |
|--------|----------|------------|
| LL-003 — main.js is large | D3 | Business main code lives in `main/business/`; `main.js` only calls it |
| LL-006 — atomic JSON writes | D8, D11 | recent list, backups index and OCR cache through `writeJSON`; PDF saves write to a temp file and rename |
| LL-007 — CSP in Electron | D2, D4 | Business's own partition and CSP; the default-session policy is pinned byte for byte (HB-6 row 2) |
| LL-031, LL-169 — generation guards; currentness vs lifetime | D1, D5 | tab loads and saves carry a currentness guard; a closed tab never renders or saves |
| LL-066 — no silent catch | D8, D10 | save and backup failures surface; a failed backup aborts the save |
| LL-080 — keyboard guard checks the input target | D6, D1 | Ctrl+S, Ctrl+Z and Ctrl+F respect focused inputs |
| LL-091 — waves for 5+ tasks | Budget | each phase's worklist is split into waves |
| LL-092 — check that a file exists before "create" tasks; lazy-load heavy libraries | D4 | engines are reachable only from `business.html`; files are verified absent before creation |
| LL-095 — URL scheme validation | D1 | external links pass the main-side allow-list |
| LL-106 — three-way IPC contract | D2 | each bridge method lands with its main handler, preload method and type together |
| LL-139 — import-graph census | D2, D3 | the wall is an import-graph test, not a file list |
| LL-142 — execute, don't declare | D17, D19, D21 | offline OCR and qpdf claims are proved on the packaged build |
| LL-143 — dry-run gates against the base | every row | each new test is shown failing on the base before it passes; the shell and exact exit code are named |
| LL-151, LL-166 — a gate must be able to fail; a no-effect verdict needs a detector that reads state | D8, D18 | the no-save, coverage and licence checks each get a negative control |
| LL-157, LL-159 — quit-time writes | D9 | the quit prompt goes through the quit sequence; no async quit listener; Business writes are drained |
| LL-165 — prove the profile | every smoke row | the smoke harness asserts the scratch profile before acting |
| LL-167 — packaged verification | D21 | the final tip is packaged and verified before done.md |
| LL-168 — NSIS install test exports keys | D1 (HB-11 row 5) | export both uninstall keys first |

Read: 118 live lessons (`docs/governance/LESSONS_LEARNED.md`, through LL-171). The rest
concern reading modes, Narrate, governance tooling or the register, and do not bear on this outcome.
