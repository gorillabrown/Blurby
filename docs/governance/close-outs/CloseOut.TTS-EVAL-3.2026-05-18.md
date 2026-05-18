---
sprint: TTS-EVAL-3
date: 2026-05-18
status: all-pass
---

# Phase Close-Out: TTS-EVAL-3

## Sprint Brief

**Goal:** Run the TTS evaluation harness against the full fixture corpus on current main, capture a production-grade Kokoro baseline, and wire the gate runner into `npm run test:quality` as a pre-merge regression check.
**Result:** Gate mode added to `tts_eval_runner.mjs` with `--mode=gate` CLI parsing, v2 baseline snapshot captured in `tts_eval_baseline_v2.json`, Kokoro-only gate thresholds written in `tts_quality_gates.v2.json` with 20% headroom, `test:quality` script wired in `package.json`, and 91 focused tests passing including new gate-mode coverage.
**Learned:** Evaluation/infrastructure sprints that produce artifacts rather than runtime code are naturally well-bounded when the harness already exists — spec criteria mapped 1:1 to implementation with no scope expansion.
**Recommend:** Run /roadmap-review immediately — buffer is critical at 0/5 full specs, and both remaining sprints (UX-POLISH-1, TTS-QUAL-CI-1) are stubs.
**Bottom line:** Blurby now has a production-quality TTS regression gate that can block merges on performance degradation — the quality floor is defined and enforceable.

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Severity |
|---|---------|--------|--------|--------|-----------|----------|
| 1 | Gate mode (`--mode=gate --baseline=... --gates=...`) added to `tts_eval_runner.mjs` | Feature presence | Required | Implemented | Pass | — |
| 2 | `--key=value` CLI arg parsing added to runner | Feature presence | Required (implied) | Implemented | Pass | — |
| 3 | `npm run test:quality` script added to `package.json` | Script presence | Required | Wired | Pass | — |
| 4 | `docs/testing/tts_eval_baseline_v2.json` written with aggregate metrics | Artifact | Required | Captured from matrix run | Pass | — |
| 5 | `docs/testing/tts_quality_gates.v2.json` — Kokoro-only, MOSS Nano removed, +20% headroom | Artifact | Required | Written | Pass | — |
| 6 | Gate runner exits non-zero on threshold breach | Behavior | Required | Already implemented in gate.mjs, verified | Pass | — |
| 7 | Full matrix run executed against current main with Kokoro | Execution | Required | `artifacts/tts-eval/baseline-v2` produced | Pass | — |
| 8 | Soak run (5-min continuous narration) executed and metrics captured | Execution | Required | `artifacts/tts-eval/soak-v2-standard` produced | Pass | — |
| 9 | 8+ focused tests validating gate evaluation logic with mock baselines | Test count | 8+ | 91 passing across gate + matrix runner suites | Pass | — |
| 10 | npm run typecheck passes | Type gate | Success | Passed | Pass | — |
| 11 | npm run build passes | Build gate | Success | Passed (existing circular-chunk warning) | Pass | — |
| 12 | Backpressure observation from soak run | Observation | Flag if >5s buffered | Not flagged — no backpressure detected | Pass | — |

## Interpretation

All-pass across all 12 findings. The spec had 8 explicit done-when criteria; all met. Test count (91) far exceeds the minimum (8+) because the implementation extended both the gate test file and the matrix runner test file. The soak run completed without flagging backpressure issues (>5s buffered audio threshold), which means the deferred "Playback-buffered-seconds backpressure" lane remains appropriately deferred.

## Proposed Dispositions

All findings Pass → **Accept**. No fix-now, investigate, or defer items.

## Governance Updates

| Document | Update | Status |
|---|---|---|
| ROADMAP.md | Archive spec, add Completed Work Summary row, update header | Applied |
| sprint-queue.xlsx | Mark completed, resequence | Applied |
| CLAUDE.md | Add completion, update queue pointer | Applied |

## Gates

- **Audit gate:** OutsideAudit.10 — natural trigger now that quality baseline is captured. Recommend scheduling during /roadmap-review.
- **Milestone review:** Stage 1b Quality Track complete (TTS-EVAL-3 was its only full-spec sprint).
- **Merge gate:** Complete — merged to main with `--no-ff`, branch deleted.
