# Phase Brief — 2026-10-11

## Provenance

| Figure | Source | As of |
|---|---|---|
| Register | monday:board/18432450217 via provider `external`. Snapshot imported 2026-10-11T22:59:59Z after this review's 9 writes, all read back and confirmed | 2026-10-11 |
| Pace | `kpis --json` (plugin 1.14.0) | 2026-10-11 |
| Code facts | `main` @ `cf17a95d`; the LIBRARY-SETTINGS-FIX-1 tree `26423e70` | 2026-10-11 |

## Goal

Clear the small blockers, remove the old Narrate, then rebuild Narrate with the cursor attached to the playing word (finish line "Narration rebuilt").

## The belt

| Seq | Item | State | Path |
|---|---|---|---|
| 5 | **Give the three slow tests explicit time limits** (TEST-TIMEOUT-HEADROOM-1) | Queued, Full Spec, XS, chain 35m | dispatch; parallel with 6 |
| 6 | **Stop the e-ink hover rule wiping overlay backgrounds** (EINK-HOVER-FIX-1) | Queued, Full Spec, XS, chain 40m | dispatch |
| 7 | **Fix Ctrl+K settings routing and live "New"-dot clearing** (LIBRARY-SETTINGS-FIX-1) | Merged; close-out after 5 | close-out only |
| 8 | **Remove Narrate, keeping Kokoro dormant** (NARRATE-REMOVE-1) | Queued, Full Spec, L, chain 11h, 3 waves | dispatch; runs alone |
| 9 | **Rebuild Narrate with the cursor attached to the playing word** (NARRATE-REBUILD-1) | Blocked on 8, stub | **epic** |
| 10 | Remove the unused mode barrel (CLEANUP-MODE-BARREL-1) | Blocked on 8 | dispatch |
| 11 | Space resumes the last-used reading mode (UX-POLISH-1) | Blocked on 8 | dispatch |

**Buffer:** 3 dispatch-ready (5, 6, 8) of the target 5, with 7 needing only its close-out. The epic is excluded from the buffer.

## Readiness per item (five findings)

| Item | Specification | Prerequisites | Repository | External register | Environment |
|---|---|---|---|---|---|
| TEST-TIMEOUT-HEADROOM-1 | PASS (U1–U10; edit sites read on `cf17a95d`) | PASS (none) | PASS | PASS (created, confirmed) | PASS |
| EINK-HOVER-FIX-1 | PASS (U9 re-run) | PASS | PASS | PASS | PASS (owner smoke after merge) |
| NARRATE-REMOVE-1 | PASS (U9, U10 re-run after the rename; revision 3's closure checker and rubric walk stand) | **Pending:** 5, 6 and 7 must read Completed. This wait is encoded in its recipe, step 2 | PASS (no branch or worktree) | PASS (created, confirmed) | PASS (owner smoke, Done-when 16) |

## Top risks

1. **NARRATE-REMOVE-1 is large:** about 30k source lines and 103 test files removed, 3 waves, shared-core freeze set. Mitigations: revision 3 has passed two adversarial reviews, a self-tested closure checker, a resume recipe (D14) and owner smoke checks.
2. **The rebuild depends on Kokoro proving exact.** Phase 0 is the gate. A failure sends it to a bake-off before any building, so the risk is time, not rework.

## Buffer gaps

| Item | Blocking checks | Why |
|---|---|---|
| CLEANUP-MODE-BARREL-1, UX-POLISH-1 | U2, U5 | Their edit sites only settle after NARRATE-REMOVE-1 |
| NARRATE-REBUILD-1 | — | An epic: chartered by `/epic`, not dispatched |

## Lessons applied

See [2026-10-11-lessons-applied.md](2026-10-11-lessons-applied.md).
