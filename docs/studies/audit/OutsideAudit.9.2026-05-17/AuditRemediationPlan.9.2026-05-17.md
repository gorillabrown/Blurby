# Audit Remediation Plan — OutsideAudit.9

**Date:** 2026-05-17
**Audit:** OutsideAudit.9 — Full TTS Architecture Post-Implementation Audit
**Auditor verdict:** 7/10 overall confidence
**Goal:** Reach 9/10 on re-audit

---

## 1. Management Summary

The auditor confirmed the TTS architecture is structurally sound but identified three real code defects, one packaging gap, and two sequencing suggestions. All three code defects are verified against source. The packaging gap is trivial. The sequencing feedback is partially accepted.

**Corrective actions required before claiming "TTS Quality Confidence":**
1. Fix cache-hit silence parity (code defect)
2. Fix trusted `getAudioProgress()` semantics (code defect)
3. Fix resume backpressure bypass (code defect)
4. Repackage audit with missing files (packaging fix)
5. Resequence roadmap: move NARR-SPOKEN-1 earlier

---

## 2. Audit Feedback Response Matrix

| # | Finding | Severity | Disposition | Next Step |
|---|---------|----------|-------------|-----------|
| 1 | Cache-hit silence parity defect | High | **Accept** | New hardening sprint: TTS-PARITY-1 |
| 2 | Trusted getAudioProgress() artificially lagged | High | **Accept** | Fix in TTS-PARITY-1 |
| 3 | Missing wordPositionIndex.ts from package | High (audit gap) | **Accept** — packaging error | Include in re-audit package |
| 4 | Resume bypasses pipeline backpressure | Medium | **Accept** | Fix in TTS-PARITY-1 |
| 5 | Registry truth not driving operational dispatch | Medium | **Defer** | Post-v2 (TTS-REGISTRY-DISPATCH-1 was explicitly dissolved) |
| 6 | Current-main quality evidence not yet locked | Medium | **Accept with narrowing** | Already addressed by TTS-EVAL-3 at conveyor sequence 6 |
| 7 | NARR-SPOKEN-1 should move earlier (before baselines) | Sequencing | **Accept** | Resequence: move to Stage 1a after TTS-PARITY-1 and before NARR-CURSOR-2/TTS-EVAL-3 |
| 8 | NARR-CURSOR-2 should depend on parity fixes | Sequencing | **Accept** | Resequence: after TTS-PARITY-1 |
| 9 | Missing KOKORO_MODEL_DTYPE constant from package | Low (audit gap) | **Accept** — packaging error | Include main/constants.js in re-audit |
| 10 | State duplication in useNarration.ts (reducer + stateRef) | Low | **Defer** | Acknowledged tech debt; NARR-PAUSE-1 partially addresses |
| 11 | Dormant strategies still constructed in useNarration.ts | Low | **Defer** | Post-v2; IPC gates are strong enough |

---

## 3. Detailed Disposition Reasoning

### Finding 1 — Cache-hit silence parity (ACCEPT)

**Evidence:** `generationPipeline.ts:525` writes pre-silence `audio`/`durationMs` to cache. `ttsCache.ts:94-104` reconstructs chunks without `silenceMs`. Fresh chunks carry silence; cached chunks don't.

**Fix:** In the cache write path, persist `finalAudio`/`finalDurationMs` (post-silence) and write `silenceMs` to the timing sidecar. On cache read, restore `silenceMs` from the sidecar into the reconstructed `ScheduledChunk`. Add a parity assertion test comparing fresh vs cached chunk properties.

**Calibration risk:** None — this is a bug fix, not a behavior change. Fresh audio already sounds correct; cache should match.

### Finding 2 — getAudioProgress() lag on trusted timings (ACCEPT)

**Evidence:** `audioScheduler.ts:515` bypasses lag for trusted boundaries; `audioScheduler.ts:839` always applies `cursorLagSec`. Visual interpolation lags behind event delivery.

**Fix:** In `getAudioProgress()`, check `isTrustedWordTiming` on the current chunk. If trusted, use raw `audioCtx.currentTime`; if heuristic/fallback, use the lagged value. This matches the boundary delivery logic.

**Calibration risk:** Low — visual cursor will advance slightly earlier on trusted paths. This is the correct behavior and makes NARR-CURSOR-2 (silence-aware hold) actually work as designed.

### Finding 3 — Missing wordPositionIndex.ts (ACCEPT — packaging error)

**Evidence:** File exists at `src/utils/wordPositionIndex.ts` in the codebase. Was omitted from zip batches by oversight (not in the inventory list).

**Fix:** Include in Batch 2 for re-audit. No code change needed.

### Finding 4 — Resume backpressure bypass (ACCEPT)

**Evidence:** `generationPipeline.ts:662-670` flushes pause buffer in a tight loop without checking `pendingChunks >= queueDepth`.

**Fix:** Gate the resume flush: yield to the backpressure mechanism between emissions, or cap at `queueDepth - pendingChunks` synchronous emissions and buffer the rest for demand-driven pull.

**Calibration risk:** None — prevents scheduler overload on resume after long pauses.

### Finding 5 — Registry not driving dispatch (DEFER)

**Rationale:** `TTS-REGISTRY-DISPATCH-1` was explicitly dissolved during the Kokoro-only pivot (2026-05-15). With one active engine, handwritten dispatch is functionally correct and the IPC layer gates dormant engines. Registry-driven dispatch is a post-v2 improvement when/if additional engines return.

### Finding 6 — Quality evidence not locked (ACCEPT WITH NARROWING)

**Rationale:** `TTS-EVAL-3` is already in the conveyor at sequence 6 (after resequencing). The auditor's concern is valid but already addressed by the planned work. Narrowing: we do NOT add a separate "baseline lock" sprint — TTS-EVAL-3 covers this.

### Finding 7 — NARR-SPOKEN-1 should move earlier (ACCEPT)

**Rationale:** The auditor correctly identifies that spoken/display separation improves timing classification and reduces heuristic fallback. This directly benefits the quality baselines that TTS-EVAL-3 will establish. Moving it before eval baselines is the right call.

### Finding 8 — NARR-CURSOR-2 depends on parity fixes (ACCEPT)

**Rationale:** Silence-aware cursor hold is meaningless if silence only exists on fresh chunks. And trusted interpolation is undermined if `getAudioProgress()` lags. Both fixes must land before NARR-CURSOR-2.

---

## 4. Roadmap Rewrite Actions

### New sprint: TTS-PARITY-1 (S-M effort, ~2 days)

Inserted at conveyor position 3 (after NARR-PAUSE-1, before NARR-SPOKEN-1).

**Scope:**
1. Fix cache write to persist post-silence audio + silenceMs in sidecar
2. Fix cache read to reconstruct silenceMs from sidecar
3. Fix `getAudioProgress()` to bypass lag on trusted word-native timing
4. Fix resume flush to respect backpressure gate
5. Add fresh-vs-cache auditory equivalence test
6. Add trusted-progress-no-lag unit test

### Resequenced conveyor (new order):

| Seq | Sprint | Stage | Rationale |
|---|---|---|---|
| 1 | NARR-MEDIA-1 | 1a | No change — standalone, no dependencies |
| 2 | NARR-PAUSE-1 | 1a | No change — prerequisite for cursor work |
| 3 | **TTS-PARITY-1** (NEW) | 1a | Hardening gate before cursor/eval work |
| 4 | NARR-SPOKEN-1 | 1a | Moved from position 5 → 4 (before baselines) |
| 5 | NARR-CURSOR-2 | 1a | Moved from position 3 → 5 (after parity + spoken) |
| 6 | TTS-EVAL-3 | 1b | Moved from position 4 → 6 (after spoken separation for cleaner baselines) |
| 7 | UX-POLISH-1 | 2 | Stub — no change |
| 8 | TTS-QUAL-CI-1 | 2 | Stub — no change |

### Stage reassignment:
- Stage 1a becomes: NARR-MEDIA-1 → NARR-PAUSE-1 → TTS-PARITY-1 → NARR-SPOKEN-1 → NARR-CURSOR-2 (serial, narration UX + hardening)
- Stage 1b becomes: TTS-EVAL-3 only (parallel-safe with Stage 2)
- Stage 2: UX-POLISH-1, TTS-QUAL-CI-1 (stubs)

---

## 5. Testing/Validation Plan

| Fix | Test |
|---|---|
| Cache silence parity | New test: generate chunk fresh, write to cache, read from cache, assert `silenceMs` and `audio.length` match |
| getAudioProgress trusted | New test: with trusted timing, assert `getAudioProgress()` returns un-lagged time matching boundary delivery |
| Resume backpressure | New test: pause with 10 chunks buffered, resume, assert scheduler receives ≤ queueDepth chunks synchronously |
| wordPositionIndex inclusion | Verify `import` resolves in re-audit package |

---

## 6. Re-Audit Package Fixes

For the re-audit (OutsideAudit.10), the package will additionally include:
- `src/utils/wordPositionIndex.ts` (the missing implementation file)
- `main/constants.js` (contains KOKORO_MODEL_DTYPE and other TTS constants)
- Updated ROADMAP.md with TTS-PARITY-1 inserted and resequenced conveyor

---

## 7. Corrected Execution Order

```
NARR-MEDIA-1 (standalone, dispatch now)
    ↓
NARR-PAUSE-1 (named-pause state machine)
    ↓
TTS-PARITY-1 [NEW] (cache parity + progress lag + resume backpressure)
    ↓
NARR-SPOKEN-1 (spoken/display word separation — moved earlier)
    ↓
NARR-CURSOR-2 (silence-aware cursor hold — now has correct foundations)
    ↓
TTS-EVAL-3 (quality eval gate — baselines now include spoken separation)
    ↓
UX-POLISH-1 / TTS-QUAL-CI-1 (stubs, parallel)
```

---

## 8. Decision-Ready Conclusion

The audit found three real code defects that are individually small (each ~30-50 lines of change) but collectively undermine the "TTS Architecture Complete" confidence claim. Fixing them requires one new sprint (TTS-PARITY-1, S-M effort) plus a resequencing of NARR-SPOKEN-1 earlier in the conveyor.

**After these changes, expected re-audit improvements:**
- Code correctness: 7 → 9 (parity + progress + backpressure fixed)
- Engine efficiency: 7 → 8-9 (parity makes auditory quality consistent)
- Cursor/page tracking: 7 → 9 (wordPositionIndex verifiable + progress fix)
- Test coverage: 7 → 8-9 (parity and progress tests added)
- Overall confidence: 7 → 9 (corrective gate clears the path)

The packaging gap (missing files) and the sequencing improvement cost nothing in implementation effort — they're free points.

**Blocking decisions:** None. All dispositions are unambiguous. Proceed directly to re-audit after TTS-PARITY-1 lands + package fix.
