---
epic: blurby-business
charter: charter.md
---

# Phase Plan — Blurby Business: a walled-off PDF viewer and editor

<!-- The route, not the contract. The executor may reshape phases as reality teaches —
     log the replan in state.md → Decision log and journal.md. Exit gates may tighten,
     never loosen. Plan at phase altitude: intents and gates here; steps live inside the
     run. Do not pre-generate task backlogs for phases that haven't opened.
     At every exit gate: re-read charter.md before opening the next phase — the gate is
     the re-anchor point; goal drift compounds silently across sessions and compaction. -->

Nine phases rather than the usual three to seven: the owner approved eight delivery
phases ordered by how often each feature is used (D20), and the ninth is the mandatory
completion phase. Order rationale: P2 holds Save because annotation is useless unsaved.
P2's `saveDocument`, backup store, undo history and annotation model are what P3–P6 build
on, so every editing phase follows P2. P7 needs only P1. P8 needs P3's qpdf repair hook.
Within P1 the order is HB-6 → (HB-7, HB-8, HB-11) → HB-9 → HB-10, per the Phase 1 specs'
Interfaces.

## Phases

### P1 — Viewer
- **Intent:** first, verify the charter's assumptions and the start gate. Re-check every
  location cited in `phase1-specs.md` against the code and record the facts in the Working
  set. Baseline `npm test`. Then build HB-6, HB-7, HB-8, HB-11, HB-9 and HB-10 as specified.
  Add the A16 viewing rows (split pane, page grid, rotate view, full screen, history,
  night mode, touch, snapshot, revision view, repair on open). Write
  `scripts/business/check-matrix-coverage.mjs` and `check-licences.mjs`, each with a
  negative control.
- **Exit gate:** charter D1, D2, D3 and D4 pass. Every P1/HB matrix row names its test or
  smoke check, which `check-matrix-coverage.mjs --phase P1` verifies. Package verification
  passes on the phase tip (x64 and arm64 builds, x64 launch, smoke `shell`, `nav`, `locked`,
  `launch`, `ocr --offline`, `send`).
- **Rough size:** 6–8 sessions.

### P2 — Annotation, form fill and save
- **Intent:** the save model (D18): Ctrl+S, Save As, atomic save, the backup store with a
  restore, the unsaved dot, the quit prompt, and the read-only path. Undo and redo. The 16
  annotation rows written with pdf-lib, the comments panel, and AcroForm filling.
- **Exit gate:** charter D5–D11 pass. A pdf.js reload of a saved file renders the saved
  annotations (A11 guard). Coverage is verified with `--phase P2`.
- **Rough size:** 6–8 sessions.

### P3 — Page organisation and merge
- **Intent:** the page grid organiser and the 25 page-organisation rows. Merge, extract,
  and split by page or every N. Repair on open through qpdf, if P8's bundling spike is
  pulled forward; otherwise through pdf-lib.
- **Exit gate:** charter D12 passes, and coverage is verified with `--phase P3`.
- **Rough size:** 4–5 sessions.

### P4 — Editing and metadata
- **Intent:** the 14 editing rows, with in-place text editing partial per A14, and the 8
  metadata rows, including XMP.
- **Exit gate:** charter D13 passes. Coverage is verified with `--phase P4`, and every ◐
  carries its reason.
- **Rough size:** 4–6 sessions.

### P5 — Signatures
- **Intent:** a timeboxed @signpdf spike (≤3h) first. Then the 10 signature rows, the
  signatures panel, `.pfx`/`.p12` signing, and the Windows certificate store (A13).
- **Exit gate:** charter D14 passes, and coverage is verified with `--phase P5`.
- **Rough size:** 3–4 sessions.

### P6 — Form authoring
- **Intent:** create and edit fields, field detection, calculations, FDF/XFDF data,
  flatten, and data merge.
- **Exit gate:** charter D15 passes, and coverage is verified with `--phase P6`.
- **Rough size:** 3–4 sessions.

### P7 — Printing
- **Intent:** print preview, plus the three printing rows through `webContents.print`
  (duplex, n-up, page range).
- **Exit gate:** charter D16 passes, and coverage is verified with `--phase P7`.
- **Rough size:** 1–2 sessions.

### P8 — Optimisation
- **Intent:** a spike first, bundling qpdf for x64 and arm64 under `asarUnpack` and
  checking its licence. Then the 6 optimisation rows (compress, linearise, repair,
  preflight; separations preview partial).
- **Exit gate:** charter D17 and D19 pass, and coverage is verified with `--phase P8`.
- **Rough size:** 2–3 sessions.

### P9 — Completion
- **Intent:** run the full charter DoD fresh in one session on the final tip, including D18
  across every phase, D20 and D21. Get Blurby.Brain's package confirmation. Then follow
  launch.md → Completion protocol.
- **Exit gate:** every DoD row passes with fresh evidence in state.md, and `done.md` is written.
- **Rough size:** 1–2 sessions.

## Gate log

<!-- One line per gate passed: date, phase, evidence pointer (journal entry / command output). -->

| Date | Gate | Evidence |
|------|------|----------|

## Current-phase worklist

<!-- Owned by the executor. Regenerate when a phase opens; keep it short-horizon.
     One item in progress at a time; done items get a one-line evidence note, then move
     the detail to journal.md. Items for future phases do not belong here.
     The open phase's tasks take their rows from each item's specification task list
     (references/task-rows.md), keeping its numbers; phases not yet open keep no backlog. -->

P1 is seeded from `phase1-specs.md`. The task numbers below are each item's own.

- [ ] P1 discovery: the start gate, the Working set facts, re-verifying the cited locations, and the baseline suite (HB-6 task 1)
- [ ] HB-6 tasks 2–10 — Business window and PDF viewer (Wave A: tasks 2–7; Wave B: tasks 8–10)
- [ ] HB-7 tasks 1–8 — Navigation and view controls, including Done-when 5 (native text select)
- [ ] HB-8 tasks 1–5 — Password-protected PDFs
- [ ] HB-11 tasks 1–5 — PDFs open in Blurby Business (the install check per LL-168)
- [ ] HB-9 tasks 1–7 — OCR for scanned PDFs (task 1 is timeboxed to ≤3h)
- [ ] HB-10 tasks 1–5 — Send to Blurby to read
- [ ] A16 viewing rows — split pane, page grid, rotate view, full screen, history, night mode, touch, snapshot, revision view, repair on open
- [ ] Coverage and licence checkers, each with a negative control
- [ ] P1 package verification and exit gate
