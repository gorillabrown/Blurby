# Third-Party Audit Response — Blurby VibeVoice Proposal

**Audit date:** 2026-04-18
**Package reviewed:** `2026-04-18-vibevoice-proposal-third-party-audit`
**Repo baseline:** `5c74a9eb23fd24496070aa3e7293db18bc0ccb10` on `main`
**Reviewer role:** Skeptical principal TTS, runtime, and product-architecture auditor
**Method:** Deep code read of curated package + full-source supplement; independent verification of all time-sensitive claims against primary sources (microsoft/VibeVoice GitHub, Hugging Face model cards, VibeVoice project site).

> **On divergence.** Where `EXTERNAL_FINDINGS.md` and the live sources diverge, this review treats primary sources and the actual code as authoritative. Divergences are called out explicitly in §5 and §9.

---

## 1. Executive Verdict

**Do not proceed with `VIBE-1 → VIBE-2 → VIBE-3` as proposed.**

The proposal is thoughtfully structured, honest about uncertainty, and surfaces one genuinely valuable product idea (segment-following Narrate). But the lane it recommends is **built on a target that does not actually match the product thesis** and that carries three constraints the package significantly understates: Microsoft's explicit "not for commercial or real-world use" guidance, a confirmed audible disclaimer embedded in every synthesized audio file, and license terms that forbid removing that disclaimer or the accompanying watermark.

This is a "good ideas, wrong package" outcome — not "interesting idea, missing evidence." The missing evidence exists elsewhere and mostly removes VibeVoice-Realtime-0.5B from consideration rather than supporting it.

The right next move is to **extract the genuinely good ideas from the proposal and execute them without VibeVoice**, then treat VibeVoice as a watch-list item until its production posture changes. Specifics in §9 and §10.

Severity distribution up front: **2 CRITICAL, 4 MAJOR, 5 MODERATE, 3 MINOR**.

---

## 2. Strongest Reasons To Proceed

These are the credible arguments in favor of the lane. They are real, and they are why the proposal deserves a careful review rather than a fast rejection.

1. **The product instinct behind "segment-following Narrate" is correct.** Perfect per-word visual following is not obviously the best reading experience — in prose, human eyes naturally track phrase-level groupings, and over-precise word cursors can feel uncanny. This is a genuine product idea worth testing, and the proposal deserves credit for surfacing it rather than continuing to assume the current model is correct.

2. **Benchmark-before-commit sequencing is disciplined.** `VIBE-1` in principle — produce comparative evidence before absorbing runtime burden — is the right shape for any backend investigation. The scaffolding of "fixture corpus, latency artifacts, seam behavior, subjective review packet" is solid evaluation practice. Kept backend-agnostic, it has independent value.

3. **The non-goals are well-stated.** The proposal is explicit that this is not a rollout, not a Kokoro replacement, not a 1.5B production commitment. That discipline is rare and worth acknowledging.

4. **VibeVoice's long-form model design is genuinely interesting for narration.** The 1.5B's 64K context / ~90 minute generation window, with its acoustic+semantic tokenizer pairing, is exactly the architecture class one would want for chapter-length continuity. If and when a production-licensed variant appears, Blurby should already have thought through where it would plug in.

5. **Kokoro's user-felt weaknesses are real.** The proposal is not manufacturing pain. `TTS_LIVE_BUG_SWEEP_CHECKLIST.md` and the TTS-EVAL baseline exist for a reason — the team has already put months into Kokoro hardening and the result is "operationally solid but subjectively still flat on prosody." That earns a serious look at alternatives.

6. **The existing scheduler is already partly segment-aware.** `src/utils/audio/segmentKokoroChunk.ts` already breaks a generated chunk into multiple shorter playback segments, and `src/utils/audioScheduler.ts` (lines 365–386) already has a full heuristic fallback for when real word timestamps are unavailable. The architecture will not fight a segment-following redesign — it is partly there already. This is the strongest technical argument that the proposal's product thesis is testable with low refactor cost.

---

## 3. Strongest Reasons Not To Proceed

These are the credible arguments against the lane. They are ordered by severity, and they compound — each one individually is not dispositive, but together they are.

1. **Microsoft explicitly recommends against commercial or real-world use.** The VibeVoice-Realtime-0.5B HF model card, under "Recommendations," states: "We do not recommend using VibeVoice in commercial or real-world applications without further testing and development. This model is intended for research and development purposes only." The 1.5B card has the same language. Blurby is a shipping product with paying or near-paying users. Building a production lane on a research-only model against Microsoft's direct guidance is not a "caveat" — it is the whole frame. The package notes "disclaimer and watermark behavior may be a product blocker"; it does not note that Microsoft's own guidance is itself the more fundamental blocker.

2. **The audible disclaimer is confirmed, and the license prohibits removing it.** The HF model card states: "Embedded an audible disclaimer (e.g. 'This segment was generated by AI') automatically into every synthesized audio file. Added an imperceptible watermark to generated audio so third parties can verify VibeVoice provenance." The out-of-scope uses section of the same model card prohibits "any act to circumvent, disable, or otherwise interfere with any technical or procedural safeguards implemented in this release, including but not limited to security controls, watermarking and other transparency mechanisms." This is not "may be a blocker" — it is a definitive blocker for a reader UX. You cannot ship Blurby with "This segment was generated by AI" prepended to every audio chunk, and you cannot legally strip it. The package's framing ("if this applies in a reader context, it could be an immediate blocker") implies uncertainty that does not exist in the source material.

3. **VibeVoice-Realtime-0.5B is a category mismatch with the stated product thesis.** The product thesis centers on "long-form continuity, natural phrasing, multi-speaker." Realtime 0.5B is a *different model class*: 8K context (~10 min max), single-speaker only, acoustic-tokenizer-only (semantic tokenizer removed), optimized for streaming LLM output rather than long-form narration. The advantages the proposal attributes to VibeVoice (90-minute continuity, up to 4 speakers) are 1.5B properties, not 0.5B properties. Using 0.5B to test hypotheses about 1.5B's strengths is a category error that will yield either a non-answer or a misleading answer.

4. **The target hardware for real-time is not Blurby's user hardware.** The `vibevoice-realtime-0.5b.md` doc explicitly states: "NVIDIA T4 / Mac M4 Pro achieve real-time performance in our tests; other devices with weaker inference capability may require further testing and speed optimizations." Most Blurby users are on commodity Windows laptops without discrete GPUs. They will not hit real-time. The package notes a generic "runtime burden" concern without establishing that the target hardware profile even works for the target users.

5. **The installation story is Docker + NVIDIA container + flash-attention.** The realtime doc's installation section starts with a `docker run --gpus all` command against an NVIDIA PyTorch container. Blurby ships as a packaged Electron app to non-developer users. Bridging that installation model to a consumer laptop is not "a Python sidecar" — it is a distribution problem an order of magnitude larger than the package implies.

6. **The "streaming text input" feature is an unchecked TODO.** The realtime doc's "TODO" section contains: "[ ] Implement streaming text input function to feed new tokens while audio is still being generated." This is listed despite the same doc's feature bullets claiming "Streaming text input" as a key feature. In other words, at the current implementation state, you submit a complete text chunk and receive streamed audio back — the same request-response shape as Kokoro. The "streaming text input" advantage the proposal anticipates is not yet available in the open code.

7. **Realtime 0.5B provides no word-level timing.** The package correctly notes the public demo shows timestamps labeled "derived from generated audio and may contain errors." What the package does not make clear is that those demo-page timestamps are *presentation artifacts* (almost certainly post-hoc forced alignment), not an API output. The Realtime 0.5B API produces streaming audio chunks, not word timestamps. If Blurby wants any timing from VibeVoice, it must run a separate alignment step (e.g., VibeVoice-ASR, whisper-timestamped, MFA) — adding a second model load, a second runtime pipeline, and alignment latency on top of synthesis latency.

8. **The listed user pain points are only partly voice-engine problems.** The brief lists: choppiness, startup/handoff latency, punctuation prosody, visual following discomfort. Of these, only prosody is unambiguously a voice-model concern. Choppiness is usually a scheduling/seam problem (Blurby already has `TTS-RATE-2: Segmented Live Rate Response` v1.61). Startup latency is a loading problem (Blurby already has `TTS-START-1: Startup Parity & Opening Cache Contract` v1.62). Visual-following discomfort is a product-design problem independent of the engine. Swapping the voice engine will not fix most of what the proposal says it is trying to fix.

9. **The team has heavily invested in Kokoro-specific infrastructure.** Per `ROADMAP.md`: NARR-TIMING real word timestamps (v1.44), TTS-RATE-1 pitch-preserving tempo (v1.58), TTS-RATE-2 segmented live rate (v1.61), TTS-HARDEN-1/2, TTS-START-1, TTS-CONT-1. Much of this is *specifically* infrastructure that Kokoro enables and VibeVoice does not: real word timestamps are a Kokoro duration-tensor feature, pitch-preserving exact-speed control fits Kokoro's natural-rate model, etc. The sunk cost isn't itself a reason to stay on Kokoro, but it is a reason to be honest that moving to VibeVoice means abandoning or rebuilding a meaningful fraction of recent work. The proposal does not price this in.

---

## 4. Missing Evidence

These are the pieces of evidence that are absent from the package and that a responsible decision requires. I am listing what is missing, not speculating about the answer.

1. **A measured subjective A/B of Kokoro vs VibeVoice-Realtime-0.5B on Blurby's actual book content.** No audio samples are in the package. No MOS comparison exists. The proposal is asking to commit to `VIBE-1 → VIBE-2 → VIBE-3` without the reviewer ever hearing whether VibeVoice sounds better than Kokoro on Blurby's use case. A one-hour Colab session with the 0.5B, reading five representative book passages, would establish the upside hypothesis before any sidecar work begins.

2. **A measured benchmark against the segment-following hypothesis *using Kokoro alone*.** The proposal conflates "is VibeVoice better than Kokoro" with "should Narrate follow segments instead of words." These are separable. Given that `src/utils/audio/segmentKokoroChunk.ts` and the fallback path in `src/utils/audioScheduler.ts` already exist, a feature-flagged experiment that suppresses real word timestamps and forces the heuristic segment timeline, then compares user comfort against the current per-word mode, would test the more important of the two hypotheses without any new backend work. That experiment's result would likely change the whole conversation.

3. **A licensing opinion on shipping VibeVoice output to end users.** The MIT license on VibeVoice is permissive on code, but the model card's "out-of-scope uses" section reads more like an acceptable-use policy, and explicitly prohibits circumventing watermarks/disclaimers. Blurby's general counsel (or equivalent) needs to have said whether shipping a product built on this stack — with Microsoft's "research only" language on the label — is acceptable. The package does not cite such review.

4. **A characterization of the disclaimer's actual behavior in output.** Is the disclaimer spoken once at the start of a synthesis call, or injected at chunk boundaries, or at fixed intervals? The model card says "into every synthesized audio file" which is ambiguous on this exact point. Fifteen minutes with the Colab demo would answer this definitively. It has not been done.

5. **A realistic hardware profile for Blurby's install base.** What fraction of current Blurby users have a GPU capable of running VibeVoice-Realtime-0.5B at real-time? If most users are on integrated graphics, `VIBE-2` can succeed at sidecar integration and still produce an unshippable product because the audio lags speech. Anonymized hardware telemetry, if available, or a conservative "typical user" profile, would scope this.

6. **A spec for the Python sidecar's actual shape.** Is it a long-running stdio child process, a local HTTP server, a WebSocket server, or a gRPC endpoint? Each choice has different crash-recovery, startup-latency, and packaging implications. The proposal names the outcome (sidecar) without specifying which flavor. The crash/retry/idle/warm-up machinery in `main/tts-engine.js` is substantial and each sidecar flavor matches it differently.

7. **A decision on what happens to the Kokoro-specific roadmap investments.** If VibeVoice is adopted, do `KokoroRatePlan`, `resolveKokoroBucket`, the rate-bucket cache identity, and the pitch-preserving tempo stage become dead code? Do they stay as Kokoro-only? Does the useNarration hook grow to a third parallel state shape? The proposal does not state which.

---

## 5. Technical Findings by Severity

### CRITICAL

**C-1. The primary target is a categorical mismatch with the product thesis and the proposal does not acknowledge this.**

The product thesis rests on VibeVoice's long-form continuity, multi-speaker quality, and expressive prosody. These are properties of the VibeVoice-TTS family (1.5B, 7B / "Large"), which use the semantic+acoustic tokenizer pairing, 64K (1.5B) or 32K (Large) context, and ~45–90 minute generation windows. VibeVoice-Realtime-0.5B is a separate architecture: 0.5B params / 1B total, 8K context, ~10 min max, single speaker, **semantic tokenizer removed**, optimized for LLM-output streaming rather than long-form narration. Treating the 0.5B as a proxy for the 1.5B's strengths is a category error. If the thesis is about long-form continuity, the test subject must support long-form continuity.

**C-2. Microsoft's own guidance and the disclaimer+license stack are a categorical blocker, not a "maybe."**

Three stacking constraints, each sourced directly from the VibeVoice-Realtime-0.5B HF model card:

- **Research-only recommendation**: "We do not recommend using VibeVoice in commercial or real-world applications..."
- **Audible disclaimer**: "Embedded an audible disclaimer (e.g. 'This segment was generated by AI') automatically into every synthesized audio file."
- **Circumvention prohibition**: "Any act to circumvent, disable, or otherwise interfere with any technical or procedural safeguards implemented in this release, including but not limited to security controls, watermarking and other transparency mechanisms" is listed under out-of-scope uses.

The package frames these as product-adoption risks. They are not risks — they are established facts that would require either Microsoft to relax its policy (not in Blurby's control) or Blurby to accept a narration product that opens every audio segment with a spoken disclaimer (not viable for a reading product). There is no path between these two that respects the license.

### MAJOR

**M-1. Repo status claim in `EXTERNAL_FINDINGS.md` is misleading.**

The package states "on 2025-09-05 the repo was disabled after misuse concerns." The primary source shows the `microsoft/VibeVoice` GitHub repo is currently very active: 33k stars, 3.7k forks, 98 commits, 105 open issues, regular commits through 2026. What was removed on 2025-09-05 was the original long-form TTS code (the 1.5B/Large inference path); the repo itself was never permanently disabled and has since added VibeVoice-Realtime-0.5B (2025-12-03), experimental voices (2025-12-16), VibeVoice-ASR (2026-01-21), and an HF Transformers integration for ASR (2026-03-06). The current state is "repo alive, TTS code gone, realtime and ASR variants alive." This nuance changes the implementation story materially.

**M-2. Latency claim is slightly optimistic.**

`EXTERNAL_FINDINGS.md` states "roughly 200 ms first audible latency, hardware dependent." The HF model card now states ~300ms. The realtime doc reconciles this: "Due to network latency, the time when audio playback is heard may exceed the ~300 ms first speech chunk generation latency" — suggesting ~200ms generation + network/buffer = ~300ms audible. For a local (no-network) sidecar this may be closer to 200ms, but only on the documented reference hardware.

**M-3. "Streaming text input" is an unchecked TODO.**

The feature bullets on both the HF model card and the vibevoice-realtime-0.5b.md doc list "streaming text input" as a key feature. The TODO section in the same doc lists it as `[ ]` (unchecked): "Implement streaming text input function to feed new tokens while audio is still being generated." Today, the realtime model accepts a complete text chunk and produces streaming audio — the same request-response shape Blurby already has with Kokoro. The proposal anticipates behavior that is not yet implemented upstream.

**M-4. The proposal conflates two separable hypotheses.**

"Is VibeVoice better than Kokoro" and "should Narrate follow segments instead of words" are independent questions. The second is testable with Kokoro alone using existing code paths (the heuristic fallback in `src/utils/audio/segmentKokoroChunk.ts:160`). Conflating them forces a backend investigation in order to answer a product-design question, which is strictly more work than necessary and biases the decision toward "try VibeVoice."

### MODERATE

**MD-1. The scheduler already has the fallback path the proposal claims to need.**

`src/utils/audioScheduler.ts:285-386` and `src/utils/audio/segmentKokoroChunk.ts:132-180` implement a full heuristic word-timing path based on punctuation/length weights distributed across a chunk's voiced duration. The comment at `src/types/narration.ts:193-199` — "Duration remains the primary authority; optional word bounds are reserved for conservative fallback paths when real word timestamps are unavailable" — was written with this exact situation in mind. A non-timestamping backend is not a new architectural requirement; the architecture already assumes it. The evidence matrix's claim that "Blurby currently depends on timing truth" is *only partially* correct: Blurby *prefers* timing truth, but has a tested fallback.

**MD-2. The `TtsStrategy` interface is backend-agnostic, but `useNarration` is not.**

`src/types/narration.ts:164-177` defines `TtsStrategy` as a minimal four-method interface with a word-index callback. This is clean. But in `src/hooks/useNarration.ts`, line 42 defines `type TtsEngine = "web" | "kokoro"`, and the hook carries ~20 Kokoro-specific state fields, refs, and event listeners (kokoroReady, kokoroDownloading, kokoroDownloadProgress, kokoroVoices, kokoroLoading, kokoroStatus, kokoroError, kokoroVoiceRef, kokoroStatusRef, applyKokoroStatusSnapshot, and on). Adding a third backend is not a strategy-pattern drop-in — it requires parallel state, parallel events, and parallel rate-plan logic, or a meaningful refactor of useNarration first. The proposal treats "integrate VibeVoice" as a strategy addition; the code says it is more.

**MD-3. Kokoro worker lifecycle machinery is substantial and heavier to replicate across process boundaries.**

`main/tts-engine.js` (434 lines) handles: worker creation, worker crash detection and retry with exponential backoff (MAX_CRASH_RETRIES=2, lines 15-17, 157-205), idle unload (lines 48-64), warm-up gating (separate `model-loaded` and `model-ready` events, lines 227-240), model load timeout (line 344-350), loading state signal, engine status event stream (lines 94-120), and lifecycle ownership tracking via WeakSets (lines 20-21). A Python sidecar needs all of this **plus** process-crash detection (not just worker-crash), port conflict handling, Python environment integrity, CUDA driver compatibility, OOM recovery, and antivirus/firewall interactions on Windows. The proposal's "Electron-managed Python sidecar" phrasing understates this.

**MD-4. Exact speed control is Kokoro-native and not obviously achievable with VibeVoice.**

`src/utils/kokoroRatePlan.ts`, `src/hooks/narration/kokoroStrategy.ts:78`, and the `KokoroSchedulerRatePlanMetadata` type work together to give Blurby exact-speed playback via pitch-preserving tempo shaping on bucketed generation. VibeVoice generates at its own natural pace; user speed control would have to be applied post-synthesis (Web Audio API playbackRate or a resampler), which does not preserve pitch without additional DSP. The package notes "speed-control uncertainty" once; the code shows this is a significant feature regression, not an uncertainty.

**MD-5. The `KokoroRatePlan` is leaking into the scheduler surface.**

`ScheduledChunk`, `SegmentedKokoroChunk`, and `AudioScheduler.refreshBufferedTempo` all carry `KokoroRatePlan` metadata. The scheduler is not backend-agnostic; it is "Kokoro-with-optional-rate-plan." Adding a second backend will force either a refactor of these seams or an unsatisfying "leave the Kokoro fields null and hope" pattern. This is addressable, but it is design work the proposal does not currently scope.

### MINOR

**Mi-1. Realtime 0.5B cannot read code, formulas, or uncommon symbols.**

Per the model card: "Code, formulas, and special symbols – The model does not currently support reading code, mathematical formulas, or uncommon symbols." Blurby's EPUB content includes all three. This is a text-preprocessing burden that Kokoro does not currently impose at the same level.

**Mi-2. Realtime 0.5B stability degrades on very short inputs.**

"When the input text is extremely short (three words or fewer), the model's stability may degrade." Blurby will encounter many ≤3-word spans (chapter titles, "Part One," short dialogue) where this matters.

**Mi-3. The 1.5B model card reports inference request logging.**

"Logged inference requests (hashed) for abuse pattern detection and publishing aggregated statistics quarterly." This is listed on the 1.5B card, not the Realtime 0.5B card. If the 1.5B is ever reconsidered, this has privacy implications for a local desktop app (even hashed, the existence of the log channel may be relevant).

---

## 6. `VIBE-1` Evaluation — Benchmark Harness and Research Baseline

**Structural assessment:** the scaffolding is sound — fixture corpus, comparative artifacts (startup, seams, continuity, drift), subjective review packet — and maps well onto existing Blurby TTS evaluation work (`TTS_EVAL_MATRIX_RUNBOOK.md`, `TTS_EVAL_BASELINE_POLICY.md`, `tts_eval_baseline_v1.json`). The harness idea is the single strongest piece of `VIBE-1/2/3`.

**Problems, in order of severity:**

1. **The harness is coupled to VibeVoice adoption rather than standing alone.** The acceptance criterion "the same fixture corpus can run across Kokoro and VibeVoice-Realtime" presumes a VibeVoice implementation path already exists. It does not, and building one to prove the harness is circular. A backend-agnostic harness that runs against Kokoro + Web Speech + (optionally) Colab-generated VibeVoice audio samples is strictly more valuable and strictly cheaper.

2. **It does not test the segment-following hypothesis.** The proposal's own thesis says Narrate may benefit from segment-following. The harness as written does not have a mode that tests segment-following vs word-following against either backend. That is the single highest-value experiment the harness could run, and it is absent.

3. **It does not establish a prosody baseline before declaring Kokoro's prosody weak.** The proposal asserts Kokoro prosody is flat. The current TTS eval baseline focuses on timing accuracy, seam integrity, and startup, not on subjective prosody A/B against alternatives. `VIBE-1` should formalize a prosody evaluation path *before* using it as a reason to change backends, not as part of a sprint that has already chosen a direction.

**Recommendation:** approve the *harness*, detach it from VibeVoice, rename to make this explicit (e.g., `TTS-EVAL-PROSODY-1`), and include segment-following as a first-class test dimension. This is substantively the right piece of work.

---

## 7. `VIBE-2` Evaluation — Local Sidecar Prototype

**Structural assessment:** the acceptance criterion "the team knows whether runtime burden and disclaimer behavior are blockers" is well-framed. If the sprint ran, it would produce a yes/no answer to a real question.

**Problems, in order of severity:**

1. **Much of the answer is already available from primary sources and does not need a sprint to produce.** The disclaimer behavior is stated in the HF model card. The license position is stated in the same card. The hardware profile requirement (NVIDIA T4 / Mac M4 Pro for real-time) is stated in the realtime doc. Spending a sprint to confirm what is already documented is weak discipline.

2. **The runtime burden is substantially larger than "a Python sidecar."** Docker + NVIDIA container + flash-attention is the upstream recommended install path. On a Windows consumer laptop with no discrete GPU, the realistic path is a custom Python embed with manual torch+flash-attn installation, which is fragile. The sprint as scoped does not capture this — "Electron-managed Python sidecar" reads as though the sidecar flavor and dependency story are solved when they are not.

3. **The prototype cannot answer the product question.** Even if the sidecar comes up cleanly on a developer laptop with a 4090, it tells you nothing about whether a user on integrated graphics will have a usable product. A "sidecar works on the architect's machine" outcome is a trap.

4. **It commits runtime burden before product benefit is established.** `VIBE-2` follows `VIBE-1`, but `VIBE-1` does not require `VIBE-2` to produce its value. If `VIBE-1` produced a clear "VibeVoice is much better" result, then `VIBE-2` becomes justified. If `VIBE-1` did not, `VIBE-2` is wasted. The proposal does not gate `VIBE-2` on `VIBE-1`'s findings strongly enough.

**Recommendation:** do not undertake `VIBE-2` at all in its current form. If `VIBE-1` (revised per §6) produces strong evidence of VibeVoice benefit and primary-source updates remove or soften the disclaimer/license constraints, revisit at that time with a sharper sidecar spec that names the exact sidecar flavor, the Windows install story, and the minimum hardware profile.

---

## 8. `VIBE-3` Evaluation — Alignment and Narrate-Truth Evaluation

**Structural assessment:** the *question* `VIBE-3` asks — whether Narrate should follow segments instead of words — is genuinely important and deserves an answer. This is the single most valuable idea in the proposal.

**Problems, in order of severity:**

1. **Order is wrong.** `VIBE-3` runs after `VIBE-1` and `VIBE-2`, meaning the segment-following question only gets answered after the backend investigation already happened. But the segment-following question is *independent of the backend* and significantly cheaper to test, and its answer would meaningfully change `VIBE-1`'s and `VIBE-2`'s framing. If segment-following turns out to produce a better Narrate experience, then the question of whether backends need native word timestamps collapses — which is exactly the architectural question that makes VibeVoice's no-native-timestamps posture acceptable or unacceptable. `VIBE-3` should run *first*, as a Kokoro-only experiment, not last.

2. **It assumes VibeVoice-derived segment timing exists.** The deliverable "comparison of Kokoro word timestamps vs VibeVoice-derived segment timing" presumes VibeVoice produces segment timing. It does not — the Realtime 0.5B API outputs streaming audio chunks without timing metadata. Any "segment timing" would come from post-hoc alignment that Blurby would have to build. This is unscoped work hiding inside a deliverable bullet.

3. **It does not exploit the existing codebase.** `segmentKokoroChunk.ts` and the heuristic fallback in `audioScheduler.ts` are exactly the infrastructure `VIBE-3` would use. The proposal does not reference them. An experiment using these paths is a 1–2 day feature-flag change, not a sprint.

**Recommendation:** promote `VIBE-3`'s question to a standalone pre-work sprint (`NARR-SEGMENT-1`, per §10) using Kokoro alone, behind a feature flag, exploiting existing code. Run it before any VibeVoice work is scoped. Its outcome then drives whether VibeVoice is even worth evaluating.

---

## 9. Recommendation

**What should happen next, concretely:**

1. **Close the VibeVoice investigation lane in its current form.** Do not dispatch `VIBE-1 / VIBE-2 / VIBE-3` as written. The target model is a category mismatch with the thesis (C-1), and Microsoft's stated position plus the disclaimer/license stack (C-2) make the lane's destination unshippable regardless of benchmark outcome.

2. **Extract the segment-following Narrate question as a Kokoro-only sprint.** This is the highest-value idea surfaced by the proposal. Run it first. See §10 for the spec shape.

3. **Build the benchmark harness as a backend-agnostic TTS evaluation sprint**, decoupled from VibeVoice. It has standalone value and will serve Kokoro tuning, future backend evaluation, and regression protection.

4. **Establish a prosody-focused Kokoro tuning pass** before concluding Kokoro prosody cannot be improved further. The last several sprints have focused on rate, startup, and continuity; prosody has not had its own explicit investigation.

5. **Move VibeVoice to a watch-list item**, not an implementation lane. Track it in a lightweight doc (e.g., `docs/studies/research/WATCH_LIST.md`). Re-evaluate if any of three things change: (a) Microsoft relaxes the "research only" language on a variant, (b) the disclaimer/license posture changes for a production path, (c) a long-form variant becomes available with a production-intended license and reasonable consumer hardware requirements.

6. **Do not frame this outcome as "the proposal was wrong."** The proposal surfaced a real product insight (segment-following) and a real engineering discipline (benchmark-first). The right outcome is to execute those ideas in a shape that matches Blurby's actual constraints.

**On the "good idea, wrong order" vs "technically unsound" vs "valuable but too expensive right now" vs "interesting idea, missing evidence" axis the review prompt asks me to separate:**

- **`VIBE-1` as a general TTS evaluation harness:** *good idea, wrong order* — it belongs before, and independent of, any specific backend investigation.
- **`VIBE-1` as currently scoped (VibeVoice-coupled):** *valuable but too expensive right now* — the scaffolding is good, the coupling to a target that will almost certainly fail the product test wastes the work.
- **`VIBE-2` (Python sidecar prototype):** *technically unsound for Blurby's user population as currently scoped* — the hardware and distribution model assumptions do not hold; and separately, its question is mostly already answered by primary sources.
- **`VIBE-3`'s question (segment-following Narrate):** *good idea, wrong order* — run it first, standalone, with Kokoro.
- **`VIBE-3` as a VibeVoice alignment exercise:** *interesting idea, missing evidence* — would need VibeVoice to produce timing it does not currently produce, and the segment-following question is answerable without it.
- **The underlying thesis that VibeVoice might fix Blurby's UX:** *interesting idea, missing evidence* — no Kokoro-vs-VibeVoice Blurby-content A/B has been captured; until it is, the whole basis for the investigation is inference from product marketing.

---

## 10. Suggested Scope or Order Changes

Concretely, a revised four-sprint lane that replaces `VIBE-1 / VIBE-2 / VIBE-3`:

### `NARR-SEGMENT-1` — Segment-Following Narrate Experiment (Kokoro-only, first)

**Goal:** answer the segment-following-vs-word-following product question with the cheapest, most direct experiment possible.

**Deliverables:**
- feature flag that forces `chunk.wordTimestamps = null` in the Kokoro path, exercising the existing heuristic fallback (`src/utils/audioScheduler.ts:365-386`, `src/utils/audio/segmentKokoroChunk.ts:160-180`)
- a second feature flag that further degrades to segment-only advancement (fire `onWordAdvance` at segment boundaries only, not per word)
- subjective review packet: the same book passage narrated three ways (per-word strict, heuristic per-word, segment-only)
- a short-form internal vote or reader panel

**Acceptance criteria:**
- the team can answer "does segment-following feel better than word-following" without touching any backend
- if the answer is yes, the underline/cursor model redesign becomes the next priority, and the backend question drops in importance
- if the answer is no, the current per-word model is vindicated and backend investigation can focus narrowly on prosody

**Estimated effort:** much smaller than `VIBE-1/2/3` — days, not sprints.

### `TTS-EVAL-PROSODY-1` — Prosody-Focused Evaluation Harness (backend-agnostic)

**Goal:** produce the benchmark scaffolding `VIBE-1` envisioned, but uncoupled from any specific backend.

**Deliverables:**
- a prosody evaluation mode added to the existing TTS-EVAL matrix runner
- fixture corpus covering: punctuation-heavy prose, dialogue, long-sentence continuity, short-sentence stability, numbers, code/formula edge cases
- subjective rating sheet usable across engines
- comparative artifacts for Kokoro configurations, Web Speech, and optional audio samples pulled from Colab runs of other engines (VibeVoice, ElevenLabs self-hosted alternatives, Sherpa-ONNX TTS, etc.)

**Acceptance criteria:**
- the same corpus can be evaluated by a human rater across any audio source
- baseline prosody scores for Kokoro's current configuration are captured

### `KOKORO-PROSODY-1` — Kokoro Punctuation Prosody Investigation

**Goal:** before declaring Kokoro's prosody ceiling too low, exhaust the tuning space inside Kokoro.

**Deliverables:**
- investigation of punctuation handling in the text-normalization pre-stage (`applyPronunciationOverrides`, whitespace/ellipsis handling, sentence boundary inference)
- an audit of `PauseConfig` and `WordWeightConfig` in `src/hooks/narration/kokoroStrategy.ts:264-276` for under-utilized knobs
- voice-level A/B against alternative Kokoro voices on the same content
- graded results against the `TTS-EVAL-PROSODY-1` harness

**Acceptance criteria:**
- the team has evidence-backed answers to "how much of the 'flat prosody' complaint is tunable inside Kokoro" and "is a specific voice+config combination materially better for Blurby's content"

### `VIBEVOICE-WATCH` — Lightweight Watch Item (no engineering scope)

**Goal:** keep VibeVoice visible as a future candidate without committing engineering resources now.

**Deliverables:**
- a tracked doc (e.g., `docs/studies/research/VIBEVOICE_WATCH.md`) that summarizes the current VibeVoice posture, the three gating conditions (§9 item 5), and the freshness date of the last review
- quarterly (or event-driven) review

**Acceptance criteria:**
- VibeVoice is not forgotten
- no engineer-hours are spent on VibeVoice until at least one gating condition changes

---

### Condensed Answers to the `REVIEW_QUESTIONS.md` items, for the record

These are folded into the body above but collected here for traceability.

| # | Question | Answer |
|---|---|---|
| 1 | Is `VibeVoice-Realtime-0.5B` the right first target for Blurby? | No — category mismatch with the stated thesis (C-1). |
| 2 | Is it correct to keep `VibeVoice-1.5B` out of implementation scope? | Yes, but for sharper reasons than the package gives: Microsoft's production guidance and the disclaimer/watermark stack apply equally to 1.5B. |
| 3 | Is `benchmark → prototype → alignment evaluation` the right order? | No. Run the alignment/Narrate-truth experiment *first*, on Kokoro alone. See §10 `NARR-SEGMENT-1`. |
| 4 | Does VibeVoice appear likely to improve the real user pain points better than continued Kokoro tuning? | Insufficient evidence. The in-package assumption is inference from marketing; no Blurby-content A/B exists. Prosody tuning inside Kokoro has not been exhausted. |
| 5 | Should `Narrate` evolve toward segment-following? | Strongly worth testing, but using Kokoro alone — decoupled from the backend question. |
| 6 | Does the public VibeVoice timing model change how Blurby should think about narration truth? | Yes, but the proposal overreads the demo-site timestamps, which are presentation artifacts. The Realtime API outputs no timing. Blurby's own heuristic fallback path is the relevant piece of evidence about whether non-authoritative timing is viable, and it is. |
| 7 | Is the lack of native word-level timing fatal, manageable, or irrelevant? | Manageable — the heuristic fallback already exists (`audioScheduler.ts:365-386`, `segmentKokoroChunk.ts:160-180`). Fatal only if segment-following Narrate is also rejected. |
| 8 | Is a Python sidecar a reasonable integration strategy? | Not as currently scoped. The upstream install path is Docker+CUDA; the target hardware profile excludes most of Blurby's users. The sidecar *flavor* (stdio / HTTP / WebSocket) is unspecified. |
| 9 | Is disclaimer or watermark behavior likely to block adoption? | Yes, definitively. Disclaimer is embedded in every file (per model card), and removal is prohibited by the license's out-of-scope uses clause. |
| 10 | What evidence is still missing? | See §4. Most important: a measured Kokoro-vs-VibeVoice A/B on Blurby content, a segment-following experiment result, a licensing opinion, a characterization of disclaimer cadence, a realistic user hardware profile. |
| 11 | Is the current scope too conservative, too aggressive, or appropriately staged? | Wrong-shaped rather than wrong-sized. The sequencing locks in a premise (VibeVoice as the answer) the evidence does not yet support. |
| 12 | Should any part of `VIBE-1/2/3` be reordered, split, or merged? | Yes. Split `VIBE-3`'s question into `NARR-SEGMENT-1` and run it first; generalize `VIBE-1` into a backend-agnostic prosody harness; defer `VIBE-2` until the evidence from the first two justifies it and external conditions permit it.

---

*End of third-party audit response. Ready to drop into `docs/studies/audit/2026-04-18-vibevoice-proposal-third-party-audit/` as the reviewer deliverable.*
