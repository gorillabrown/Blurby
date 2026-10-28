# External TTS Audit — Review & Remediation Plan

**Date:** 2026-03-28
**Reviewer:** Cowork (architect role)
**Input:** `deep-research-report.md` (external audit of Narrate mode orientation materials)
**Cross-referenced:** `TTS-AUDIT-2026-03-28.md` (internal code audit, 22 items)

---

## 1. Overall Assessment

The external audit is thorough and well-structured. It confirms every issue from our internal audit, adds valuable context from standards (SSML 1.1, WCAG 2.2, ITU-T P.800/808, NIST AI RMF, BCP-47), and identifies governance gaps we hadn't considered. The findings matrix covers 12 dimensions with clear severity/effort ratings.

That said, the audit was conducted by a TTS specialist evaluating orientation materials for a TTS audit — which means it naturally gravitates toward enterprise-grade TTS concerns (SSML support, pronunciation lexicons, MOS listening tests, NIST AI RMF alignment). Some of these are genuinely valuable for Blurby; others are overkill for a v1.0 desktop reading app that reads user-owned documents aloud with a local model. The remediation plan below separates what we should do now from what we should do later from what we should consciously decline.

---

## 2. Finding-by-Finding Disposition

### ACCEPT — Do now (Sprint scope)

These findings are real, actionable, and block a quality v1.0 Narrate mode.

**A1. State correctness bugs (confirmed)**
External audit dimension: "Prosody, intonation, and naturalness" (High severity).
Maps to internal audit: #5, #6, #7, #8, #9, #10, #20, #21.
Both audits identify the same root cause: `stateRef` not manually synchronized after `dispatch()`, and `preBufferRef` not cleared in all mutation paths. The external audit adds useful framing — these aren't just code bugs, they're a pattern violation. Every function that mutates narration state must synchronize both the reducer (for React consumers) and the ref (for async callbacks).

**Disposition:** Fix all 8 items. Define and enforce a "dual-write rule" — any dispatch that changes `status`, `cursorWordIndex`, `speed`, or `nextChunkBuffer` must also update `stateRef` and clear `preBufferRef` where appropriate.

**A2. Worker crash recovery (confirmed)**
External audit dimension: "Tooling and deployment guidance" (High severity).
Maps to internal audit: #16, #17.
The external audit correctly identifies that worker `error` doesn't reset state, and the `new Promise(async ...)` anti-pattern can hang `loadingPromise` forever. Both are real. The external audit also flags idle timeout (#15) cold-restart UX — valid but lower priority.

**Disposition:** Fix #16 (reset worker/model state on error) and #17 (refactor ensureReady). Add loading indicator for cold restart after idle timeout (#15).

**A3. audioPlayer edge cases (confirmed)**
External audit dimension: "Prosody, intonation, and naturalness" (High severity).
Maps to internal audit: #3, #4.
Resume-then-stop ghost timer and rapid-pause drift. Both are real edge cases.

**Disposition:** Fix both. Small changes with clear remedies already specified.

**A4. Documentation/comment accuracy (confirmed, high value)**
External audit dimension: "Technical accuracy of TTS concepts" (High severity).
Three specific inaccuracies called out:
- NarrateMode.ts comment claims "word boundary events, not timers" — wrong for Kokoro (uses setInterval).
- NarrateMode.ts comment lists "250ms comma, 400ms sentence, 750ms paragraph" — stale values (now 100/200/400).
- tts-worker.js comment says "zero-copy transfer" — actually copies via Array.from.

**Disposition:** Fix all three. These are one-line comment rewrites. The external audit is right that comments are contractual documentation for auditors — inaccurate comments erode trust in the entire codebase.

**A5. KOKORO_DTYPE constant divergence (confirmed)**
External audit dimension: "Technical accuracy" (implicit).
Maps to internal audit: #13.
Renderer says `q8`, worker uses `q4`. Renderer constant is dead code.

**Disposition:** Remove `KOKORO_DTYPE` from renderer constants or update to `q4`. Trivial.

**A6. inFlight guard silent drop (confirmed)**
Maps to internal audit: #11.
External audit doesn't call this out specifically but it's captured under "resilience."

**Disposition:** Fix — call `onError()` instead of silent return so narration doesn't stall permanently.

### ACCEPT — Do now, lightweight (documentation + policy)

**A7. Privacy data-flow documentation**
External audit dimension: "Privacy and data handling guidance" (High severity).
This is a fair gap. We should document what happens to text during narration: Kokoro runs locally (no network), Web Speech may use platform services (network-dependent by OS), model download hits HuggingFace CDN, no text is logged or cached beyond IPC transit. This is a one-page document, not a NIST Privacy Framework alignment exercise.

**Disposition:** Write a concise "Narrate Mode Privacy" section in TECHNICAL_REFERENCE.md. One page. Cover: local inference, model download endpoint, Web Speech fallback behavior, what's logged, what's cached, retention.

**A8. Voice label cleanup**
External audit dimension: "Voice selection and consistency" (Medium) + "Accessibility and inclusivity" (Medium).
The audit flags gendered voice labels ("American Female") as exclusionary. This is a reasonable concern for a shipping product. The fix is simple: change display labels to voice name + accent descriptor ("Bella — American", "Daniel — British") without gender prefix. The underlying voice IDs stay the same.

**Disposition:** Update `KOKORO_VOICE_NAMES` in constants.ts. Small change, good optics.

**A9. Web Speech voice selection hardening**
External audit dimension: "Voice selection and consistency" (Medium).
Currently picks "first voice whose lang starts with 'en'" which could select en-AU or en-IN unexpectedly. Should prefer en-US, then en-GB, then any en-*.

**Disposition:** Fix the voice selection priority in useNarration.ts. Small change.

### ACCEPT — Do later (post-v1.0)

**A10. Pronunciation exceptions / user dictionary**
External audit dimension: "Phoneme/lexicon handling" (Medium severity, High effort).
Valid concern — names, technical terms, abbreviations will be mispronounced. But this is a feature, not a bug fix, and High effort. PLS-aligned lexicon format is overkill; a simple JSON dictionary (`{ "regex": "pronunciation" }`) passed to Kokoro would be sufficient.

**Disposition:** Add to IDEAS.md for post-v1. Sprint 26+ territory.

**A11. Word alignment improvement**
External audit dimension: "Prosody, intonation, and naturalness" (High severity, Medium effort).
The uniform-duration-per-word timer is a known limitation (internal #2). The audit suggests model-provided alignments or heuristic timing by token class. Both are good ideas but scope-expanding. Current behavior is acceptable for v1.0 — sentence-length chunks keep drift small.

**Disposition:** Add to IDEAS.md. Post-v1 improvement. Could explore Kokoro's alignment output if available.

**A12. Narrate mode test plan + KPIs**
External audit dimension: "Testing, QA, and evaluation metrics" (High severity, High effort).
The audit wants unit tests for chunking, integration tests for IPC/worker recovery, latency instrumentation, and listening tests. We already have 776+ tests including narration unit tests from Sprint TH-1. What we're missing: integration tests for worker crash/recovery, and any latency/alignment instrumentation. MOS/listening tests are academic-grade — not appropriate for our scale.

**Disposition:** Add worker crash/recovery integration tests to the sprint. Latency instrumentation goes to IDEAS.md. Listening tests are out of scope.

**A13. Idle timeout UX**
Maps to internal audit: #15.
External audit confirms this under "resilience."

**Disposition:** Add to the sprint — show loading indicator when model re-warms after idle timeout.

### DECLINE — Out of scope for Blurby

**D1. SSML support**
External audit dimension: "SSML usage and markup quality" (Medium).
Kokoro doesn't consume SSML. Web Speech API SSML support is inconsistent across platforms. Adding SSML would mean building a preprocessor that strips/transforms markup before sending to each engine. The audit itself acknowledges this is "not applicable today" and frames it as a gap "relative to audit dimensions." This is an audit-framework artifact, not a product need.

**Disposition:** Decline. Document the stance: "Blurby sends plain text to both TTS engines. SSML is not supported. Kokoro handles prosody through its neural model; Web Speech API handles it through platform synthesis." Add this to TECHNICAL_REFERENCE.md.

**D2. NIST AI RMF / Privacy Framework alignment**
External audit dimension: "Bias, offensive content, and safety" + "Privacy" (Medium).
Blurby reads the user's own documents aloud. It doesn't generate content, recommend content, or share content. The "safety posture" is simple: spoken output mirrors user content, full stop. Aligning to NIST AI RMF is governance theater for a local-only reading app.

**Disposition:** Decline formal framework alignment. Add a one-paragraph safety stance to TECHNICAL_REFERENCE.md: "Narrate mode reads user-provided text verbatim. No content filtering, generation, or sharing occurs. Voice personas are user-selected."

**D3. ITU-T P.800/P.808 listening tests**
External audit dimension: "Testing, QA, and evaluation metrics" (High severity, High effort).
Formal MOS evaluation requires test panels, audio corpus design, and statistical analysis. This is appropriate for a TTS vendor shipping a synthesis API. Blurby uses Kokoro as a dependency — we don't control the model's perceptual quality, we just need to play it correctly.

**Disposition:** Decline. Our QA strategy is: fix the correctness bugs, then smoke-test narration manually across voice/speed combinations.

**D4. BCP-47 locale mapping for voices**
External audit dimension: "Voice selection and consistency" + "Accessibility" (Medium).
The audit wants voice IDs mapped to BCP-47 locale tags. Kokoro voices are all English (en-US or en-GB). The accent is in the voice name. Adding formal locale metadata would only matter if we supported multiple languages — we don't, and Kokoro doesn't.

**Disposition:** Decline. The voice labels already indicate accent. No locale-selection logic needed for English-only voices.

**D5. Onboarding flow for auditors**
External audit dimension: "Onboarding flow and learning objectives" (Medium).
The Mermaid diagrams are nice but this is process documentation for an audit that's already complete. We don't need to build onboarding flows for hypothetical future auditors.

**Disposition:** Decline as a deliverable. The orientation doc already exists and is sufficient.

---

## 3. Remediation Plan — Sprint Structure

Based on the dispositions above, the work splits into two sprints: one focused code-correctness sprint (blocks v1.0), and a lightweight documentation + polish pass.

### Sprint TTS-1: Narration Correctness & Recovery

**Goal:** Fix all confirmed state synchronization bugs, worker recovery, audioPlayer edge cases, and documentation inaccuracies. This is the "deterministic narration" sprint.

**Scope:** 19 code changes + 3 comment fixes + 1 constant removal + worker recovery

**Tier:** Full (npm test + npm run build + manual smoke test)

| # | Task | Source | Files | Agent | Model |
|---|------|--------|-------|-------|-------|
| 1 | **Dual-write rule: preBufferRef clearing** — Clear `preBufferRef.current = null` in `updateWpm`, `adjustRate`, `resyncToCursor`, `stop()` | Internal #7, #8, #9, #10 | `useNarration.ts` | renderer-fixer | sonnet |
| 2 | **Dual-write rule: stateRef.cursorWordIndex** — Update stateRef after CHUNK_COMPLETE dispatch in speakNextChunkKokoro onEnd | Internal #6 | `useNarration.ts` | renderer-fixer | sonnet |
| 3 | **Dual-write rule: stateRef.status** — Update stateRef to "paused" in pause(), "speaking" in resume() | Internal #20, #21 | `useNarration.ts` | renderer-fixer | sonnet |
| 4 | **Pre-buffer readiness check** — Change `computeChunkPauseMs` to read `preBufferRef.current !== null` instead of `currentState.nextChunkBuffer !== null` | Internal #5 | `useNarration.ts` | renderer-fixer | sonnet |
| 5 | **audioPlayer: resume ghost timer** — Add `if (!currentSource) return;` guard in resume's `.then()` callback | Internal #3 | `audioPlayer.ts` | renderer-fixer | sonnet |
| 6 | **audioPlayer: rapid pause guard** — Add `if (audioCtx.state === "suspended") return;` in `pause()` | Internal #4 | `audioPlayer.ts` | renderer-fixer | sonnet |
| 7 | **inFlight silent drop** — Call `onError()` instead of bare `return` when inFlight is true | Internal #11 | `kokoroStrategy.ts` | renderer-fixer | sonnet |
| 8 | **Worker crash recovery** — Reset `worker = null; modelReady = false; loadingPromise = null;` in worker error handler | Internal #16 | `tts-engine.js` | electron-fixer | sonnet |
| 9 | **Async executor refactor** — Rewrite `ensureReady` to avoid `new Promise(async ...)` | Internal #17 | `tts-engine.js` | electron-fixer | sonnet |
| 10 | **Idle timeout loading indicator** — Send `tts-kokoro-loading` IPC event when re-warming after idle timeout | Internal #15 | `tts-engine.js`, `preload.js` | electron-fixer | sonnet |
| 11 | **Comment fixes** — Correct NarrateMode.ts word-timing + rhythm pause comments; fix tts-worker.js "zero-copy" comment | External A4 | `NarrateMode.ts`, `tts-worker.js` | doc-keeper | sonnet |
| 12 | **KOKORO_DTYPE removal** — Remove dead `KOKORO_DTYPE` constant from renderer | Internal #13 | `constants.ts` | renderer-fixer | sonnet |
| 13 | **Voice label cleanup** — Remove gender prefix from KOKORO_VOICE_NAMES ("Bella — American" not "Bella (American Female)") | External A8 | `constants.ts` | renderer-fixer | sonnet |
| 14 | **Web Speech voice priority** — Prefer en-US > en-GB > en-* in default voice selection | External A9 | `useNarration.ts` | renderer-fixer | sonnet |
| 15 | **Worker crash + recovery integration tests** — Test that generate() works after simulated worker crash | External A12 | `tests/` (new file) | electron-fixer | sonnet |
| 16 | **Run tests + build** | — | — | test-runner | haiku |

**Execution order:**
```
[1-7] PARALLEL: All renderer fixes (renderer-fixer, same file batch)
[8-10] PARALLEL: All main-process fixes (electron-fixer)
[11-12] PARALLEL: Comment + constant cleanup
    ↓
[13-14] Voice label + selection (renderer-fixer, depends on constants.ts from step 12)
    ↓
[15] Integration tests (depends on step 8-9)
    ↓
[16] npm test + npm run build
```

### Sprint TTS-2: Documentation & Policy (lightweight, no code)

**Goal:** Close the governance gaps identified by the external audit. Documentation only.

**Tier:** None (docs-only)

| # | Task | Source | File | Agent | Model |
|---|------|--------|------|-------|-------|
| 1 | **Privacy data-flow section** — Local inference, model download endpoint, Web Speech fallback, logging, caching, retention | External A7 | `TECHNICAL_REFERENCE.md` | doc-keeper | sonnet |
| 2 | **SSML stance documentation** — "Plain text only, no SSML. Here's why." | External D1 | `TECHNICAL_REFERENCE.md` | doc-keeper | sonnet |
| 3 | **Safety posture statement** — "Reads user content verbatim. No filtering, generation, or sharing." | External D2 | `TECHNICAL_REFERENCE.md` | doc-keeper | sonnet |
| 4 | **TTS glossary** — Define phonemizer, lexicon, prosody, SSML, pre-buffer, generation ID for future engineers | External audit dimension: "Developer documentation clarity" | `TECHNICAL_REFERENCE.md` | doc-keeper | sonnet |
| 5 | **Dual-write rule documentation** — Codify the stateRef/dispatch pattern as an engineering rule in LESSONS_LEARNED.md | Synthesis of internal + external | `LESSONS_LEARNED.md` | doc-keeper | sonnet |
| 6 | **Update TECHNICAL_REFERENCE.md** — Narrate mode architecture section reflecting all TTS-1 changes | — | `TECHNICAL_REFERENCE.md` | doc-keeper | sonnet |

---

## 4. What Goes to IDEAS.md (Post-v1)

These are real improvements but not v1.0 blockers:

- **Pronunciation exceptions / user dictionary** (External A10) — Simple JSON dictionary for name/term overrides. Sprint 26+ scope.
- **Word alignment improvement** (External A11) — Explore Kokoro alignment output or heuristic per-token timing. Replaces setInterval approach.
- **Transferable buffer optimization** (Internal #14) — Zero-copy Float32Array transfer from worker. ~1-2ms per chunk savings.
- **Float32Array input hardening** (Internal #1) — Always construct fresh Float32Array regardless of input type.
- **Latency instrumentation** (External A12) — Add timing telemetry for generation, playback start, and alignment error measurement.
- **Legacy speak() cleanup** (Internal #18) — Remove or modernize the closure-captured legacy function.
- **adjustRate ordering in NarrateMode** (Internal #19) — Eliminate unnecessary generationId increment on initial start.

---

## 5. Summary

| Category | Count | Sprint |
|----------|-------|--------|
| Code fixes (MUST + SHOULD) | 14 changes | TTS-1 |
| Comment/constant fixes | 4 changes | TTS-1 |
| New integration tests | 1 file | TTS-1 |
| Documentation sections | 6 sections | TTS-2 |
| Deferred to IDEAS.md | 7 items | Post-v1 |
| Declined (out of scope) | 5 items | Never |

**Recommendation:** TTS-1 is the priority. It can be dispatched to Claude Code CLI as a single sprint — all the fixes are well-specified with exact file locations and remedies. TTS-2 can be done by doc-keeper in parallel or immediately after. Both should complete before the v1.0.0 tag.
