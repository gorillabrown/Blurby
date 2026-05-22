# docs/testing/ — Test Plans, Runbooks & Eval Artifacts

Manual test checklists, evaluation runbooks/policies, decision logs, listening-review
records, and machine-readable eval baselines/quality gates.

## Files (by category)
| Category | Files |
|----------|-------|
| Checklists | `TTS_ADVERSARIAL_REVIEW_CHECKLIST.md`, `TTS_EVAL_RELEASE_CHECKLIST.md`, `TTS_ITERATIVE_AUDIT_TRACE_CHECKLIST.md`, `TTS_LIVE_BUG_SWEEP_CHECKLIST.md`, `tts-browser-test-checklist.md`, `tts-electron-test-checklist.md`, `tts-manual-test-checklist.md`, `chrome-clickthrough-checklist.md` |
| Runbooks / protocols | `TTS_EVAL_MATRIX_RUNBOOK.md`, `perf-manual.md`, `chrome-test-runner-protocol.md`, `auto-update-e2e.md` |
| Policies / decisions | `TTS_EVAL_BASELINE_POLICY.md`, `MOSS_DECISION_LOG.md`, `QWEN_STREAMING_DECISION.md`, `KOKORO_RETIREMENT_SCORECARD.md` |
| Setup / feasibility | `MOSS_RUNTIME_SETUP.md`, `MOSS_RUNTIME_SHAPE_COMPARISON.md`, `MOSS_FLAGSHIP_FEASIBILITY.md`, `QWEN_RUNTIME_SETUP.md` |
| Listening reviews / SOWs | `moss-vs-kokoro-listening-review.md`, `qwen-vs-kokoro-listening-review.md`, `kokoro-voice-mixing-evidence.md`, `flow-narrate-live-iterative-sow.md`, `flow-narrate-sow-closeout-2026-05-20.md` |
| Test-run records | `test-run-2026-03-28.md`, `test-run-CT3-2026-03-28.md`, `test-run-2026-04-16-tts-live-sweep.md`, `bug-sweep-2026-05-20.md` |
| Eval data (json) | `tts_eval_baseline_v1.json`, `tts_eval_baseline_v2.json`, `tts_quality_gates.v1.json`, `tts_quality_gates.v2.json` |
| Diagnostics | `tts-diagnostics-bundle.md` |

## What does NOT belong here
Automated test source (those live in `tests/`).
