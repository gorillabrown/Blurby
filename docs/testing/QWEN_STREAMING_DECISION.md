# Qwen Streaming — Decision Gate

**Status:** PENDING LIVE DATA
**Date:** [TBD]
**Author:** [TBD]

---

## Decision

- [ ] **PROMOTE** — Streaming Qwen becomes sole successor; retire Kokoro fallback per retirement scorecard.
- [ ] **REJECT** — Fall back to Kokoro; streaming path disabled or gated behind dev flag.
- [ ] **ITERATE** — More hardening needed; re-evaluate after targeted fixes.

---

## Gate Pass/Fail

| Gate Name | Threshold | Measured (p95) | Status | Notes |
|---|---|---|---|---|
| `streamingFirstAudioMs` | ≤ 3000 ms (p95) | [TBD] | [TBD] | [TBD] |
| `streamingStallCount` | 0 per 5-min window | [TBD] | [TBD] | [TBD] |
| `streamingWordsPerMinute` | ≥ 120 WPM @ 1.0x | [TBD] | [TBD] | [TBD] |

---

## Scenario Results

| Scenario ID | First Audio (ms) | WPM | Stall Count | Gap (ms) | Pass/Fail |
|---|---|---|---|---|---|
| `streaming-cold-start` | [TBD] | [TBD] | [TBD] | [TBD] | [TBD] |
| `streaming-warm-start` | [TBD] | [TBD] | [TBD] | [TBD] | [TBD] |
| `streaming-long-chapter` | [TBD] | [TBD] | [TBD] | [TBD] | [TBD] |
| `streaming-rapid-cancel` | [TBD] | [TBD] | [TBD] | [TBD] | [TBD] |
| `streaming-stall-recovery` | [TBD] | [TBD] | [TBD] | [TBD] | [TBD] |

---

## Kokoro Comparison

| Metric | Kokoro Baseline | Qwen Streaming | Delta | Verdict |
|---|---|---|---|---|
| First Audio Latency (p95) | [from TTS-EVAL artifacts] | [TBD] | [TBD] | [TBD] |
| Words Per Minute (sustained) | [from TTS-EVAL artifacts] | [TBD] | [TBD] | [TBD] |
| Stall Rate (per 5-min) | [from TTS-EVAL artifacts] | [TBD] | [TBD] | [TBD] |
| Naturalness (subjective, 1–5) | [from TTS-EVAL artifacts] | [TBD] | [TBD] | [TBD] |

---

## Recommendation

**Observed strengths:**
[TBD]

**Observed weaknesses:**
[TBD]

**Decision rationale:**
[TBD]

**If ITERATE — specific hardening needed:**
[TBD]

---

## Artifacts

- Streaming summary JSON: `tests/perf-artifacts/streaming-summary-<timestamp>.json` (produced by `scripts/tts_eval_runner.mjs` in streaming mode)
- Matrix manifest: `tests/fixtures/narration/matrix.manifest.json` (scenarios tagged `engine: "qwen-streaming"`)
- Gate thresholds: `docs/testing/tts_quality_gates.v1.json` (`streaming` section)
- Kokoro baseline: `docs/testing/TTS_EVAL_BASELINE.md` / prior `summary-*.json` artifacts
