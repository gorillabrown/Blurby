# Phase Brief — 2026-10-10

## Provenance

| Figure | Source | As of |
|---|---|---|
| Register state | monday:board/18432450217 via provider `external`; snapshot imported 2026-10-10T20:06:30Z after this review's writes (readback-confirmed) | 2026-10-10 |
| Pace | `kpis --json` (plugin 1.13.0), deadline `mode-separation` | 2026-10-10 |
| Code facts | read-only investigation of `main` @ `8d491cab` | 2026-10-10 |

## Goal

Close the reading-mode separation (owner gate OS-1), finish the sidecar-sharing line, and make the terminal ledger whole, so pace and calibration read real history.

## The belt, in sequence

| Seq | Item | State | Path |
|---|---|---|---|
| 1 | **Separate the four reading modes' runtimes** (READER-MODE-SEPARATION-2) | In Flight; paused at owner gate OS-1 | epic (excluded from the buffer) |
| 6 | **Share the MOSS/Pocket engine lifecycle** (TTS-ENGINE-SHARED-1) | Queued, Full Spec, dispatch-ready | dispatch, M, chain 1h50m |
| 7 | **Record the 51 historical terminal items in the ledger** (TERMINAL-BACKFILL-1) | Queued, Full Spec, dispatch-ready | dispatch, S, chain 35m |

**Buffer: 2 dispatch-ready of the policy target of 5.** Items 6 and 7 are file-disjoint and may run in parallel with each other and with the epic.

## Implementation highlights

- **Engine sharing:** Task 1 adds 13 characterization tests on the unmodified engines, using fake adapters and only the async, pid-less child fake. Task 2 extracts `main/python-sidecar-engine.js` with thin provider files. One approved behavior change: a missing MOSS config key in the status snapshot becomes `null`.
- **Backfill:** 51 records in manifest order through the plugin ledger API as `pointer-closeout`. Additions only (51/0); a verification script checks ledger, register and manifest agreement, and a re-run is a no-op.

## Readiness per item (five findings)

| Item | Specification | Prerequisites | Repository | External register | Execution environment |
|---|---|---|---|---|---|
| TTS-ENGINE-SHARED-1 | PASS (U1–U10; edit sites verified on `8d491cab`) | PASS (TTS-SIDECAR-SHARED-1 Completed) | PASS (branch and base named; exact staging; Rule 5b merge) | PASS (Queued, fresh snapshot) | PASS (node/npm; no network or hardware) |
| TERMINAL-BACKFILL-1 | PASS (U1–U10; manifest reviewed) | PASS (none) | PASS | PASS (created and confirmed 2026-10-10) | PASS (Python with the plugin installed; launcher may need `VIRTUOSO_PLUGIN_ROOT` until 1.13.0 is recorded) |

## Prerequisites into and out of the belt

- Into: none outstanding for items 6 and 7. READER-MODE-SEPARATION-2 needs the owner's OS-1.
- Out: mode separation unblocks NARRATE-HEARD-CURSOR-1, NARRATE-APPLYRATECHANGE-COLLAPSE-1, NARRATE-SUBSCRIBER-CURSOR-1, UX-POLISH-1 and CLEANUP-MODE-BARREL-1. Each then needs re-specification against the separated runtimes.

## Exit criteria and duration

Items 6 and 7 together: about 2.5 executor hours (uncalibrated estimates). Mode separation: OS-1 (about 45 minutes of owner time) plus under one executor session for F1–F5. Deadline 2026-11-30 (`policy.roadmap.deadlines.mode-separation`).

## Top risks

1. **Owner time is the critical path.** Pace reads `behind` only because the one XL item waits on OS-1.
2. **Thin queue after mode separation closes.** Five blocked items will need specifications at once. Run a roadmap review promptly after the mode-separation close-out.

## Buffer gaps

| Item | Checks blocking | Why |
|---|---|---|
| NARRATE-HEARD-CURSOR-1, NARRATE-APPLYRATECHANGE-COLLAPSE-1, NARRATE-SUBSCRIBER-CURSOR-1, UX-POLISH-1, CLEANUP-MODE-BARREL-1 | U2, U5 | Edit sites exist only after mode separation (owner priority) |
| KOKORO-EXPORT-1 | — | Deferred by choice |

## Lessons applied

See [2026-10-10-lessons-applied.md](2026-10-10-lessons-applied.md).
