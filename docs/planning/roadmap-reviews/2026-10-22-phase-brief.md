# Roadmap Review 2026-10-22 — Phase Brief

**Provenance:** work register `notion:database/3f87c96cc31e800580cfe019c89a56ca` (snapshot rebuilt 2026-10-22T22:45:44Z after two confirmed writes); ROADMAP.md on `eb/rr-2026-10-22`; terminal ledger to TR-075.

## Goal

Ship the Stage 8 wave: get release gate (11) closed so the quiet-machine suite and the batched owner smoke can run, and the 17 merged fixes can close out and ship. At the same time, fix the PDF defect every PDF user hits today.

## Dispatch buffer (5 of 5 dispatch-ready)

1. **Upgrade Electron to 42 so a normal quit does not crash on x64** (ELECTRON-42-UPGRADE-1, Seq 8, the head). It resumes at task 2 on `eb/electron-42-upgrade-1` @ `b979c50d`. The C1 control is done: 18 of 50 launches crashed on 41.10.7. It moves the runtime to 42.11.14, then runs the native-module, ICU and breaking-change checks and the crash-count gates, which need 0 crashed launches.
2. **PDFs convert again: the EPUB converter uses pdf-parse 2's API** (PDF-IMPORT-DIAG-1, Seq 9, new). It adds one shared PDF reader (`main/pdf-text.js`) and surfaces the converter's own message. It adds a test that loads the real `pdf-parse`, and a probe on two of the owner's PDFs under the app's Electron. It is file-disjoint from 1 and may run beside it.
3. **Diagnose the Focus/Flow reading band and the ResizeObserver flood** (READER-VISUAL-DIAG-1, Seq 10). A read-only, live diagnosis that ends in two fix specifications.
4. **Follow-ups from PAGE-POSITION-SAVE-1** (PAGE-POSITION-SAVE-2, Seq 27).
5. **Retire the KF-2 rename waiver** (KF2-WAIVER-RETIRE-1, Seq 28). Governance only.

## Rubric (five findings, per item)

| Item | Specification | Prerequisite | Repository | External register | Execution environment |
|---|---|---|---|---|---|
| ELECTRON-42-UPGRADE-1 | pass (U9 pass; task list parses) | met (GOV-NOTION-MAPPING-1 complete) | branch at `b979c50d` must take `origin/main` in first | Seq 8, Queued, Full Spec | owner's machine for the suite and builds; quiet machine for Done-when 12 |
| PDF-IMPORT-DIAG-1 | pass (U9 pass; U10 chain 10m) | none | new branch from `origin/main` | Seq 9, Queued, Full Spec | owner's machine; Done-when 6 reads `G:\My Drive` (the owner's PDFs) |
| READER-VISUAL-DIAG-1 | pass | none | new branch | Seq 10, Queued, Full Spec | owner-observed live sessions with `sourceFolder` noted |
| PAGE-POSITION-SAVE-2 | pass | PAGE-SAVE-RESTAMP-GUARD-1 and PAGE-SAVE-RESTAMP-2 merged (met); it rebases onto them | new branch | Seq 27, Queued, Full Spec | owner's machine |
| KF2-WAIVER-RETIRE-1 | pass; control amended | the clean full runs it requires | new branch | Seq 28, Queued, Full Spec | any |

## Out of the buffer

- **Prerequisites leaving the buffer:** gate (11) closing unlocks gate (1)'s re-run (Blurby.Brain, quiet machine), then gate (2), the owner smoke. The smoke carries PDF-IMPORT-DIAG-1's Done-when 10 if that item has merged.
- **Exit criteria:** ELECTRON-42-UPGRADE-1 and PDF-IMPORT-DIAG-1 merged; gate (1) re-run passed with 0 crashed launches.
- **Estimated duration:** a working day of implementation for items 1 and 2 in parallel, plus the quiet-machine run.

## Risks

1. **Electron 42 moves word numbering (LL-160) or a native module.** ELECTRON-42-UPGRADE-1's task 3 stops the item on any change to the canonical book's count. If it stops, the release waits on a word-index decision, and WORD-INDEX-UNIFY-1 becomes the path.
2. **PDF conversion speed on very large PDFs.** The 223-page PDF took 366 ms. A much larger one is still bounded by `PDF_PARSE_TIMEOUT_MS` (30 s), and its failure now shows the converter's message instead of a silent generic toast.

## Buffer gaps

None.

## Owner decisions open

- **The next finish line** (recommended: the Stage 8 release).
- LARGE-FOLDER-SYNC-1's design half (very large folders).
- EINK-CONTROLS-1.
- Stage 9's design questions.
