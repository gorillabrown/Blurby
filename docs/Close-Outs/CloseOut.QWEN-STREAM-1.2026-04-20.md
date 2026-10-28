---
sprint: QWEN-STREAM-1
date: 2026-04-20
runtime: 23m 38s
tokens: ~838k
status: all-pass
---

# Phase Close-Out: QWEN-STREAM-1

## Findings Table

| # | Finding | Metric | Target | Actual | Pass/Fail | Severity |
|---|---------|--------|--------|--------|-----------|----------|
| 1 | Python streaming sidecar | Implements binary-framed protocol | Required | Implemented | Pass | Pass |
| 2 | JS engine manager | Subprocess lifecycle + frame parser | Required | Implemented | Pass | Pass |
| 3 | Binary frame parser | Distinguishes JSON (0x01) from PCM (0x02) | Required | Implemented + tested | Pass | Pass |
| 4 | startStream command | Emits started + chunks + finished | Required | Implemented + tested | Pass | Pass |
| 5 | cancelStream command | Breaks generator, emits cancelled | Required | Implemented + tested | Pass | Pass |
| 6 | PCM forwarding | Correct streamId at 24kHz | Required | Implemented + tested | Pass | Pass |
| 7 | Warmup with torch.compile | Records timing, confirms optimizations | Required | Implemented | Pass | Pass |
| 8 | Timeout handling | Fires if stream exceeds budget | Required | Implemented + tested | Pass | Pass |
| 9 | Subprocess crash handling | Graceful error propagation | Required | Implemented + tested | Pass | Pass |
| 10 | IPC handlers | 3 new handlers registered | Required | Implemented | Pass | Pass |
| 11 | Preload bridge | 4 new methods exposed | Required | Implemented | Pass | Pass |
| 12 | Streaming types | Typed interfaces exported | Required | Implemented | Pass | Pass |
| 13 | Existing Qwen path | Unchanged | Required | 2120 tests pass | Pass | Pass |
| 14 | Existing Kokoro path | Unaffected | Required | 2120 tests pass | Pass | Pass |
| 15 | Config streaming flag | Accepts `streaming: true` | Required | Implemented + tested | Pass | Pass |
| 16 | Runtime setup docs | Updated | Required | Updated | Pass | Pass |
| 17 | Test count | ≥18 | 18 | 18 | Pass | Pass |
| 18 | Full suite + build | Pass | 0 failures | 2,120 pass, build clean | Pass | Pass |
| 19 | IPC init bug | ctx.getUserDataPath pattern | N/A | Found + fixed (task 9b) | Discovery | Discovery |
| 20 | Payload contract mismatch | preload ↔ types disagreement | N/A | Found + fixed (task 11b) | Discovery | Discovery |
| 21 | cmd/command key divergence | Python "cmd" vs JS "command" | N/A | Found + fixed (task 11b) | Discovery | Discovery |
| 22 | Queue depth | ≥3 GREEN | ≥3 | RED depth 1 | Miss | Miss |

## Interpretation

**Findings 19-21 (Cross-language contract defects):** Three integration bugs in the Python-JS-TypeScript seam. The IPC init bug was a context-access pattern the agent had to discover. The payload mismatch and key divergence were caught by quality review. All preventable with an explicit contract concordance table in the spec. Quality review earned its cost — validates SRL-001.

**Finding 22 (Queue RED):** Both READER-4M-2 and QWEN-STREAM-1 completed in the same session, dropping the queue from GREEN depth 3 to RED depth 1. Backfill required.

## Dispositions

| # | Finding | Disposition | Rationale |
|---|---------|-------------|-----------|
| 19 | IPC init bug | **Log** | Preventable — future streaming IPC tasks should specify exact app-access pattern. See SRL-015. |
| 20 | Payload contract mismatch | **Log** | Preventable — cross-language contract concordance table needed. See SRL-013. |
| 21 | cmd/command key divergence | **Log** | Same root cause as #20. |
| 22 | Queue RED depth 1 | **Fix Now** | Backfill required before next dispatch. |

## Governance Updates

Herodotus pass (task 12) already handled:
- ROADMAP.md: QWEN-STREAM-1 marked complete
- SPRINT_QUEUE.md: removed from queue, logged to completed table, queue status updated to RED depth 1
- CLAUDE.md: version bump to v1.71.0

Net-new: queue backfill (2 sprints to restore GREEN depth 3).

## Next Work

QWEN-STREAM-2 (Accumulator + Strategy + Live Playback).

## Gates

- **Audit gate:** Due for consideration (3+ sprints since last). Not blocking — streaming lane still in prototype phase.
- **Milestone review:** No.
- **Branch/merge gate:** Complete. Merged 6678ce6 to main and pushed.

## Retrospective Entries

- SRL-013: Cross-language IPC sprints need a Contract Concordance table
- SRL-014: Cross-language protocol sprints need aggressive wave-splitting and fix-up task budgets
- SRL-015: Prescribe app-access patterns for IPC handler tasks dispatched to Hermes
