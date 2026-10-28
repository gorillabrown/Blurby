# KOKORO-EXPORT-1 Close-Out

**Date:** 2026-05-17
**Sprint:** KOKORO-EXPORT-1 — Long-form Audio Export Pipeline
**Branch:** `sprint/kokoro-export-1-long-form-audio-export`
**Status:** Implementation-complete, merge-deferred
**Git state:** Worktree at `.worktrees/kokoro-export-1`, not merged to main

---

## Sprint Brief

**Goal:** Build the long-form Kokoro audio export pipeline (WAV + chapter markers + optional SRT/VTT + manifest) so users can produce audiobook-quality files from cached TTS output.

**Result:** Full pipeline implemented in an isolated worktree — `kokoro-export.js` assembles structured cache chunks into chapter-marked WAV with optional subtitle tracks, new IPC endpoint wired through preload, type contracts defined, 37 tests passing — but intentionally NOT merged to main because the sprint is deferred until the TTS Architecture phase completes.

**Learned:** Worktree isolation is the correct pattern for "build it now, ship it later" sprints — implementation stays fresh (tests run against current main-adjacent state) without polluting the active conveyor or blocking parallel work. However, specs should include a rebase-readiness checklist when deferral spans 3+ sprints editing the same files.

**Recommend:** Leave the worktree parked as-is; when the current TTS Quality + Reading Experience v2 phase completes, rebase onto main and merge with a focused integration verification pass.

**Bottom line:** The export pipeline is implementation-complete and test-verified, waiting only for the phase gate to open before merge.

---

## Findings

| # | Finding | Target | Actual | Pass/Fail | Severity |
|---|---------|--------|--------|-----------|----------|
| 1 | Export pipeline assembles cached chunks into WAV | Working pipeline | `kokoro-export.js` complete | Pass | — |
| 2 | IPC endpoint + preload bridge wired | End-to-end renderer→main path | `tts-kokoro-export-long-form` IPC + `kokoroExportLongForm` preload method | Pass | — |
| 3 | Structured cache helpers for export assembly | `listStructuredBookVoiceChunks` + `readStructuredBookVoiceChunks` | Both implemented in `tts-cache.js` | Pass | — |
| 4 | Type contracts for export request/response | Renderer-side contracts | Added to `src/types.ts` | Pass | — |
| 5 | Test coverage | Focused suite passing | 5 files / 37 tests pass | Pass | — |
| 6 | Typecheck | Clean | Passes | Pass | — |
| 7 | Merged to main | Sprint merged | NOT merged — worktree parked | Discovery | — |
| 8 | Governance docs updated | Updated per Herodotus protocol | NOT updated — intentionally skipped | Discovery | — |

---

## Interpretation

**Finding 7 & 8 — Intentional deferral, not a failure.** KOKORO-EXPORT-1 was implemented ahead of schedule in a worktree while the TTS Architecture conveyor was still running. The decision to defer merge was correct — the active conveyor (TTS-PIPELINE-1, TTS-ARCH-DOC-1, and predecessors) touched overlapping files (`tts-cache.js`, `types.ts`) and merging would have created integration conflicts. The worktree is now behind main by several commits from the completed TTS Architecture phase; a rebase will be needed at merge time.

---

## Dispositions

| # | Finding | Disposition |
|---|---------|-------------|
| 7 | Not merged to main | **Defer** — merge after current phase completes; rebase first |
| 8 | Governance docs not updated | **Defer** — update CLAUDE.md and ROADMAP.md at merge time, not now |

---

## Governance Updates

**None required at this time.**
- `sprint-queue.xlsx` already marks KOKORO-EXPORT-1 as `Blocked` with the note "Deferred to post-TTS-Architecture phase. Worktree preserved at .worktrees/kokoro-export-1 (37 tests pass)."
- `ROADMAP.md` lists it in Deferred Lanes as "Long-form audio export (M4B/SRT/ASS). Optional future after Reading Experience v2."
- No further governance edits required until merge.

---

## Files Touched (Worktree Only)

| File | Change |
|------|--------|
| `main/kokoro-export.js` | New — export pipeline core |
| `main/ipc/tts.js` | New IPC endpoint `tts-kokoro-export-long-form` |
| `main/tts-cache.js` | New helpers: `listStructuredBookVoiceChunks`, `readStructuredBookVoiceChunks` |
| `preload.js` | New bridge method `kokoroExportLongForm` |
| `src/types.ts` | New export request/response type contracts |
| `tests/kokoroExport.test.js` | New test suite (37 tests) |

---

## Rebase Advisory

When merge time arrives, these files on main will have diverged:
- `main/tts-cache.js` — edited by TTS-CACHE-HARDEN-1, TTS-EVENT-SYNC-1, TTS-PIPELINE-1
- `src/types.ts` — edited by TTS-EVENT-SYNC-1, NORMALIZER-ENRICH-1, TTS-RENDER-MAP-1
- `preload.js` — edited by TTS-RENDER-MAP-1

Recommend a dedicated rebase mini-sprint (~2h) before merging, with re-run of all 37 export tests plus full `npm test` and `npm run build` after rebase.

---

## Gate Checks

- **Audit gate:** Not triggered — deferred sprint, not a phase boundary.
- **Milestone review:** Not triggered — no shippable milestone reached.
- **Merge gate:** Explicitly deferred. Rebase + full verification pass required at merge time.
