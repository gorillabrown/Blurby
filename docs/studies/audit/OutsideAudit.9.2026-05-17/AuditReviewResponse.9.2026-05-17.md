# Audit Review Response — OutsideAudit.9 (2026-05-17)

## Auditor Line-by-Line Dispositions

| # | Disposition | Response |
|---|-------------|----------|
| 1 | Accept | Cache-hit silence parity correctly treated as high-severity. Persist post-silence audio/duration, carry `silenceMs` through sidecar/read path, add fresh-vs-cache parity assertion. Close only after test proves cached and fresh chunks equivalent for audio length, `durationMs`, `silenceMs`, and timing metadata. |
| 2 | Accept | Trusted `getAudioProgress()` should not apply artificial cursor lag when trusted timing already bypasses lag for boundary delivery. Trusted/no-lag unit test is correct closure condition. |
| 3 | Accept | Packaging error. `wordPositionIndex.ts` must be in OutsideAudit.10 package. No code change required unless re-audit cannot verify import resolution. |
| 4 | Accept | Resume backpressure bypass is real robustness defect. Cap/yield behavior correct. Close only after test proves pause buffer larger than `queueDepth` cannot synchronously flood scheduler on resume. |
| 5 | Defer | Registry-driven dispatch not required for Kokoro-only posture. Deferral valid only while no second active local/cacheable engine reintroduced. Reopen if Nano, Pocket, or another engine becomes active. |
| 6 | Accept with narrowing | `TTS-EVAL-3` can cover current-main quality evidence; separate baseline-lock sprint unnecessary. Required wording fix: final conveyor places `TTS-EVAL-3` at sequence 6, not position 5. |
| 7 | Accept with narrowing | Moving `NARR-SPOKEN-1` before eval baselines correct. Required wording fix: matrix should say "move to Stage 1a after TTS-PARITY-1 and before NARR-CURSOR-2/TTS-EVAL-3" (not "position 3"). |
| 8 | Accept | `NARR-CURSOR-2` must depend on parity fixes. New order correctly places it after `TTS-PARITY-1` and `NARR-SPOKEN-1`. |
| 9 | Accept | Packaging error. Include `main/constants.js` in re-audit package. No code change required. |
| 10 | Defer | Reducer/stateRef duplication is real tech debt but not blocking. Keep visible; allow `NARR-PAUSE-1` to reduce risk. |
| 11 | Defer | Dormant strategy construction low severity if IPC/selection gates strong. Reopen only if it causes startup cost, telemetry ambiguity, or reachable side effects. |

## Summary Verdict

Remediation accepted as closure plan with two required wording corrections (items 6 and 7). Decision-ready path: land TTS-PARITY-1, include `wordPositionIndex.ts` and `main/constants.js` in re-audit package, update roadmap with new sequence, re-audit after parity tests pass.
