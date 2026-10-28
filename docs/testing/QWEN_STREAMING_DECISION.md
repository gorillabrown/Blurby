# Qwen Streaming — Decision Gate

**Status:** ITERATE — Live Validation Required
**Date:** 2026-04-21
**Author:** Claude Code CLI (QWEN-STREAM-4)

---

## Decision

- [ ] **PROMOTE** — Streaming Qwen becomes sole successor; retire Kokoro fallback per retirement scorecard.
- [ ] **REJECT** — Fall back to Kokoro; streaming path disabled or gated behind dev flag.
- [x] **ITERATE** — More hardening needed; re-evaluate after targeted fixes.

> **Preliminary decision** based on automated-only evidence. Final PROMOTE/REJECT call requires live validation on a CUDA host with the Qwen streaming sidecar running. See [Recommendation](#recommendation) for specific action items.

---

## Gate Pass/Fail

| Gate Name | Threshold | Measured (p95) | Status | Notes |
|---|---|---|---|---|
| `streamingFirstAudioMs` | ≤ 3000 ms (p95) | `pending_live_data` | ⏸ PENDING | Requires live Qwen sidecar on CUDA host. Stub mode returned `null` for all 5 scenarios. |
| `streamingStallCount` | 0 per 5-min window | 0 (stub mode) | ⏸ PENDING | Stub returned 0 stalls, but stall detection only exercises under real latency. Needs sustained 5+ min live run. |
| `streamingWordsPerMinute` | ≥ 120 WPM @ 1.0x | `pending_live_data` | ⏸ PENDING | WPM cannot be computed without real audio timing. |

All three gate statuses are `pending_live_data` — streaming eval ran successfully against the harness, but no CUDA host was available to produce real telemetry.

---

## Scenario Results

| Scenario ID | Words Achieved | First Audio (ms) | Stall Count | Pass/Fail |
|---|---|---|---|---|
| `streaming-cold-start` | 19 | `null` | 0 | pending_live_data |
| `streaming-warm-start` | 21 | `null` | 0 | pending_live_data |
| `streaming-long-chapter` | 113 | `null` | 0 | pending_live_data |
| `streaming-rapid-cancel` | 9 | `null` | 0 | pending_live_data |
| `streaming-stall-recovery` | 14 | `null` | 0 | pending_live_data |

All 5 scenarios executed end-to-end via the streaming runner mode. Word counts match fixture expectations, so scenario wiring is correct. `firstAudioLatencyMs` is `null` because the stub does not emit PCM frames; `stallCount=0` reflects absence of real latency, not a positive pass signal.

**Artifact:** `artifacts/tts-eval/streaming-baseline/streaming-summary-2026-04-21T04-33-52-299Z.json`

---

## Kokoro Comparison

Kokoro baseline collected via Task 3b full eval run against the trace fixture corpus (9 scenarios, all PASS, all 10 quality gates PASS — 7 hard + 3 warn).

| Metric | Kokoro Baseline | Qwen Streaming | Delta | Verdict |
|---|---|---|---|---|
| First Audio Latency (p95) | 507.6 ms | `pending_live_data` | — | pending |
| First Audio Latency (p50) | 465 ms | `pending_live_data` | — | pending |
| Startup Latency (p95) | 507.6 ms | `pending_live_data` | — | pending |
| Rate Response Latency (p95) | 210 ms | `pending_live_data` | — | pending |
| Drift (p95 / max) | 2 / 2 | `pending_live_data` | — | pending |
| Stall Rate (per 5-min) | 0 | `pending_live_data` | — | pending |
| Pause/Resume Failures | 0 | `pending_live_data` | — | pending |
| Handoff Failures | 0 | `pending_live_data` | — | pending |
| Startup Spikes > 3000 ms | 0 | `pending_live_data` | — | pending |
| Naturalness (subjective, 1–5) | baseline (Evan's ear) | `pending_live_data` | — | Evan's call |

**Kokoro is the bar to beat.** Streaming Qwen must materially improve at least one of: first-audio latency, sustained WPM under load, or subjective naturalness, without regressing on stall rate, pause/resume reliability, or handoff correctness.

---

## Recommendation

### Observed strengths

- **Streaming architecture is complete.** QWEN-STREAM-1 shipped the binary-framed PCM protocol, Python streaming sidecar, and JS engine manager. QWEN-STREAM-2 added the `StreamAccumulator`, streaming strategy, and live playback wiring with non-streaming fallback preserved.
- **Hardening pass landed.** QWEN-STREAM-3 added stall detection (`TTS_STREAM_STALL_TIMEOUT_MS = 8000 ms`), crash recovery (2 s poll), warmup gate, and cancellation guards per LL-109. The full `tts-qwen-stream-finished` IPC wire (engine → ipc → preload → renderer → `acc.flush()` → `onEnd`) is in place — no more dangling streams.
- **Eval harness ready.** Five streaming scenarios defined (`streaming-cold-start`, `streaming-warm-start`, `streaming-long-chapter`, `streaming-rapid-cancel`, `streaming-stall-recovery`), gate thresholds published in `tts_quality_gates.v1.json`, eval runner `--streaming` mode wired. All 5 scenarios execute end-to-end against the stub with correct word counts.
- **Kokoro baseline is strong.** Current Kokoro performance (p95 first audio 507.6 ms, zero stalls, zero handoff failures) sets a high bar but also establishes confidence in the eval pipeline itself — if Qwen streaming clears this bar live, the result is trustworthy.
- **Non-streaming fallback preserved.** If streaming proves unstable live, users do not lose Qwen entirely — the non-streaming strategy remains available.

### Observed weaknesses

- **No live CUDA evidence.** All automated measurements are `pending_live_data`. The 5 live decision criteria for PROMOTE/REJECT cannot be evaluated from stub data:
  1. First-audio latency materially better than non-streaming Qwen
  2. Continuation stable across ≥ 5 minutes sustained playback
  3. Narrate start/pause/resume/stop without lockups
  4. Long-form playback survives past the first chunk
  5. Subjective quality remains better than Kokoro
- **Stall detection untested under load.** `stallCount=0` in stub mode proves the counter exists; it does not prove the 8 s timeout fires correctly when the sidecar actually stalls.
- **Warmup gate unverified.** The warmup gate is code-complete but has not been exercised against a cold CUDA sidecar where model load time is measurable.
- **Subjective quality gap.** Even with strong numbers, Evan's ear is the final judge on naturalness vs. Kokoro — this cannot be automated.

### Decision rationale

**ITERATE** because promotion requires live evidence the automated harness cannot produce. The streaming architecture is feature-complete and hardened, the eval pipeline works, and Kokoro baseline is solid — but the gate itself (three `pending_live_data` rows) cannot be closed without a CUDA host run. Promoting now would be a leap of faith; rejecting now would discard a fully built path before we know whether it wins.

### If ITERATE — specific action items for completing the gate

1. **Live CUDA host validation pass.** Run the streaming eval (`scripts/tts_eval_runner.mjs --streaming`) on a CUDA-equipped host with the Qwen streaming sidecar active. Replace `pending_live_data` cells in the Gate Pass/Fail table and Kokoro Comparison table with measured values.
2. **Sustained playback test.** Manually launch the app in Narrate mode on a long-form chapter (≥ 5 minutes of audio). Verify:
   - No stalls, no chunk cutoffs, no silent gaps > 2 s
   - Pause / resume / stop are responsive
   - No memory or handle leaks over the session
3. **Rapid-control stress.** Manually exercise rapid pause/resume, rate changes, and cancel/restart within the first 10 s of playback to validate the cancellation guards and stream-finished wire under contention.
4. **Kokoro A/B subjective pass.** Evan listens to identical passages under Kokoro and streaming Qwen, rates naturalness on the 1–5 scale. Record in the Kokoro Comparison table.
5. **Re-evaluate this document.** With live rows populated, re-run the gate pass/fail check:
   - All three gates PASS + subjective ≥ Kokoro → **PROMOTE** (proceed to `KOKORO-RETIRE-1`).
   - Any hard gate FAIL or subjective < Kokoro → **REJECT** (keep streaming behind dev flag; continue with Kokoro as default).
   - Partial pass with identified regression → **ITERATE** again with targeted fix sprint (`QWEN-STREAM-5`).

---

## Artifacts

- **Streaming summary JSON:** `artifacts/tts-eval/streaming-baseline/streaming-summary-2026-04-21T04-33-52-299Z.json` (produced by `scripts/tts_eval_runner.mjs --streaming`)
- **Matrix manifest:** `tests/fixtures/narration/matrix.manifest.json` (scenarios tagged `engine: "qwen-streaming"`)
- **Gate thresholds:** `docs/testing/tts_quality_gates.v1.json` (`streaming` section — `streamingFirstAudioMs`, `streamingStallCount`, `streamingWordsPerMinute`)
- **Kokoro baseline:** `docs/testing/TTS_EVAL_BASELINE.md` and the Task 3b summary artifact under `artifacts/tts-eval/` (9 scenarios PASS, 10/10 gates PASS)
- **Streaming architecture refs:**
  - `scripts/qwen_streaming_sidecar.py` (Python streaming sidecar)
  - `main/qwen-streaming-engine.js` (JS engine manager, stall/crash recovery)
  - `src/utils/streamAccumulator.ts` (PCM → sentence-boundary buffering)
  - `src/utils/tts/qwenStreamingStrategy.ts` (streaming strategy, cancellation guards)
- **Sprint history:** QWEN-STREAM-1 (v1.71.0), QWEN-STREAM-2 (v1.73.0), QWEN-STREAM-3 (v1.74.0), QWEN-STREAM-4 (this document)

---

## How to close this gate

1. Pull `main` on a CUDA host.
2. Start the Qwen streaming sidecar (`python scripts/qwen_streaming_sidecar.py`) and verify it binds.
3. Run `npm run tts-eval -- --streaming` (or the equivalent invocation of `scripts/tts_eval_runner.mjs` with `--streaming`). Capture the new `streaming-summary-<timestamp>.json`.
4. Launch the app, open a long-form EPUB, enter Narrate mode, run the sustained playback + rapid-control manual tests above.
5. A/B-compare Kokoro vs. streaming Qwen on the same passage.
6. Edit this document in place: flip the Decision checkbox (PROMOTE / REJECT / ITERATE), replace `pending_live_data` cells with measured values, and append an "Observed live behavior" section below Recommendation before the Artifacts section.
7. If PROMOTE: dispatch `KOKORO-RETIRE-1`. If REJECT: gate the streaming path behind the dev-only flag and file a follow-up. If ITERATE: spec `QWEN-STREAM-5` with the specific regression.
