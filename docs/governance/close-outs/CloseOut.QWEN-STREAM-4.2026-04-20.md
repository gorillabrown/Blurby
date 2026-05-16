# Phase Close-Out Report: QWEN-STREAM-4

**Sprint:** QWEN-STREAM-4 | **Version:** v1.75.0 | **Date:** 2026-04-20
**Branch:** sprint/qwen-stream-4 → main (merge 192f42c)
**Runtime:** 10m 32s | **Tool calls:** ~64

---

## Problem

Sprint QWEN-STREAM-4 existed because QWEN-STREAM-2 and QWEN-STREAM-3 built and hardened the streaming Qwen narration path, but the actual promotion decision required live-app evidence on a real CUDA host. The decision gate document was a stub — all values [TBD]. No decision (PROMOTE/ITERATE/REJECT) had been made.

## Solution

Ran the automated evaluation harness, captured Kokoro baseline data, populated the decision gate document with all available evidence, and committed an ITERATE decision: the streaming architecture is complete and hardened, but live CUDA validation on all 5 promotion criteria has not been performed. The document now contains a step-by-step runbook for Evan to complete the gate. A minor runner bug was discovered and fixed (streaming scenarios crashing the --matrix path).

---

## Findings

| # | Area | Finding | Result | Disposition |
|---|------|---------|--------|-------------|
| 1 | Eval Harness | Streaming eval matrix ran 5 scenarios, all returned `pending_live_data` | Expected — no CUDA host in CLI | Accept |
| 2 | Eval Harness | Kokoro baseline captured cleanly: 9/9 pass, first-audio p50=465ms, p95=507.6ms | Pass | Accept |
| 3 | Runner Bug | `--matrix` path crashed when streaming scenarios were included | Defect found/fixed | Accept (LL-111 logged) |
| 4 | Runner Fix | `tts_eval_runner.mjs` updated to filter streaming scenarios from `--matrix` | Pass | Accept |
| 5 | Decision Gate | QWEN_STREAMING_DECISION.md populated with all 5 criteria, all `pending_live_data` | Pass — document complete with ITERATE decision | Accept |
| 6 | Decision Gate | Step-by-step live CUDA runbook included for Evan to complete promotion gate | Pass | Accept |
| 7 | Test Suite | npm test: 2,154 pass, 9 known failures, 0 regressions | Pass | Accept |
| 8 | Docs | Herodotus updated CLAUDE.md (v1.75.0), ROADMAP.md, SPRINT_QUEUE.md | Pass | Accept |
| 9 | Git | Commit 9eff694, merge 192f42c, pushed, branch deleted | Pass | Accept |
| 10 | Agent Routing | Herodotus (task #7) used 24 tool calls for docs-only work — high | Miss | Note (pre-composed diffs would cut ~50%) |
| 11 | Queue | Queue now RED depth 1 (GOALS-6B only). STOP SIGNAL active. | Gate flag | Must backfill ≥2 before next dispatch |
| 12 | Decision | ITERATE verdict — streaming architecture complete but unvalidated on live CUDA | Expected | Accept — ball is with Evan for live gate |

---

## Agent Utilization

| Agent | Tasks | Tool Calls | Notes |
|-------|-------|------------|-------|
| cli | #1 | 8 | Coordination only |
| general-purpose [haiku] | #2, #3, #4, #6 | ~8 | hippocrates role |
| general-purpose [haiku] | #3b | 4 | re-run after fix |
| general-purpose [sonnet] | #3a | 3 | runner bug fix |
| Athena (opus/Strategist) | #5 | 2 | decision doc |
| general-purpose [sonnet] | #7 | 24 | herodotus docs pass |
| Hermes (haiku/Messenger) | #8 | 15 | git closeout |

---

## Governance Status

- ROADMAP.md: Updated by Herodotus (v1.75.0)
- SPRINT_QUEUE.md: Updated — action 57 complete, queue RED depth 1
- CLAUDE.md: Updated to v1.75.0
- LESSONS_LEARNED.md: LL-111 logged (runner bug)
- Audit gate: 8+ sprints overdue — flagging, not blocking

## Outcome

ITERATE — streaming Qwen architecture is complete and hardened across 4 sprints (QWEN-STREAM-1 through 4). Promotion to default requires live CUDA validation by Evan using the runbook in QWEN_STREAMING_DECISION.md. KOKORO-RETIRE-1 remains conditional on PROMOTE.
