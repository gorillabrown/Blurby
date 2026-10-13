# Roadmap Review 2026-10-12 — Phase Brief

**Provenance:** monday:board/18432450217 via connector + snapshot (2026-10-13T00:05:19Z before this review's writes; refreshed after them, see the plan); `kpis`; the read-only code census of `a0e09189` for each item.

## Goal

Rebuild Narrate (the finish line, "Narration rebuilt") while a buffer of five small, fully specified fixes keeps dispatch possible under Rule 5a.

## The belt

| Seq | Item | Effort | Lane | Rubric (spec · prerequisites · repository · register · environment) |
|---|---|---|---|---|
| 9 | Rebuild Narrate with the cursor attached to the playing word (NARRATE-REBUILD-1) | XL | TTS / Narration Engine | epic — chartered by `/epic`, not the dispatch rubric |
| 10 | Give the word-index build-time test headroom under load (TEST-BUDGET-WORDINDEX-1) | XS | Platform & Maintenance | ✓ · ✓ · ✓ · ✓ · ✓ |
| 11 | Make settings writes durable and race-free (SETTINGS-WRITE-DURABLE-1) | S | Platform & Maintenance | ✓ · ✓ · ✓ · ✓ · ✓ (owner needed for smoke) |
| 12 | Diagnose the Focus/Flow reading band and the ResizeObserver flood (READER-VISUAL-DIAG-1) | S | Reader Engine | ✓ · ✓ · ✓ · ✓ · ✓ (owner needed for live sessions) |
| 13 | Remove the unused mode barrel and the legacy mode engines (CLEANUP-MODE-BARREL-1) | XS | Reader Engine | ✓ · ✓ · ✓ · ✓ · ✓ |
| 14 | Space resumes the last-used reading mode (UX-POLISH-1) | S | UX polish | ✓ · ✓ · ✓ · ✓ · ✓ (owner needed for smoke; not during the epic's Core phase) |
| 15 | Measure dev-mode slowness against a production build (DEV-PERF-MEASURE-1) | S | Platform & Maintenance | stub |

## Highlights

- **Settings durability** serializes writes per file instead of changing the temporary-file name, so the write-then-rename rule (standing rule 3, LL-006) holds unchanged; saves report failure without rejecting, and settings are flushed at quit. It must merge before the epic's Core phase writes state.
- **Reader band diagnosis** starts from a strong static reading: the band is the reading-zone mask, sized from a 24 px line-height fallback (about 3 lines instead of 5 at 120% zoom), unrelated to the word cursor in Focus, and driven by a second clock in Flow. The sprint measures before anyone fixes.
- **Space resumes mode** enters the remembered mode paused (owner decision), through the same public path as the buttons, and corrects the shortcut help that still described March's behaviour.
- **Mode barrel** deletes the barrel and three dead engine files and adds a structural test against a returning `NarrateMode`; the `"narrate"` leftovers stay for the rebuild to decide.

## Prerequisites

- Into the buffer: none; NARRATE-REMOVE-1 completed.
- Out of it: SETTINGS-WRITE-DURABLE-1 gates the rebuild's Core phase. UX-POLISH-1 edits one line of `ReaderContainer.tsx` (shared-core freeze set), so it runs before the epic's Core phase or after it merges.

## Exit criteria

Each item's own *Done when* rows. The buffer is spent when items 10–14 close; the next review refills it.

## Risks

1. **Owner time.** Three of the five items, and the epic's Phase 0, need the owner's live checks; dev mode is slow (BUG-189), so smokes should use a production build (LL-152).
2. **Overlap with the epic.** Running buffer items beside the epic is allowed only file-disjoint from its current phase; the settings fix and the Space change carry explicit ordering against the Core phase.

## Buffer gaps

None: 5 of 5 dispatch-ready.
