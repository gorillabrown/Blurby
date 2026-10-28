Looking at this task, I don't think it needs clarification or extended research — the auditor's framing is already specific (decision-complete, highest-risk assumptions, evidence overstatement, runtime split soundness, final verdict), and the evidence set is explicitly bounded to the uploaded packet. Extended research would pull in outside sources the auditor explicitly told me not to rely on.

Let me read the packet first before I start auditing.Important — all scoring for Kokoro is "pending-manual-audition". Now let me look at the code excerpts to verify the claims about the current path.Important finding: the worker passes through `result.wordTimestamps || null`. The `wordTimestamps` only exists if the underlying `kokoro-js` library actually returns one. Let me note this — the authoritative record's claim that the "worker emits wordTimestamps" is technically true (the field is passed through), but whether a non-null value is ever produced depends on kokoro-js internals not captured in this packet.Now I have enough context on the code side. Let me glance at what the superseded docs say so I can evaluate the "overstate" risk on the older lane.OK, I now have a very clear picture. The older investigation memo:
1. Incorrectly claimed Kokoro requires external forced aligner (when current code path passes `wordTimestamps` through)
2. Presented numeric scores without methodology 
3. Pushed Qwen3 to 4.75/5 and 5.0/5.0 on Blurby-fit without empirical backing
4. Is full of unresolved citation markers (e.g., ".1", ".2", ".8" instead of actual references)

I have enough to write a rigorous audit now. Let me also check whether the spec has a CPU-fallback story for Qwen — the Qwen model card section 12Hz variant. Based on the packet, the spec is explicit about CUDA-first with no CPU fallback. Let me now write the audit.

---

# Third-Party Audit — Blurby Qwen + Kokoro Prototype Readiness

**Audit date:** 2026-04-18
**Scope:** packet as received (`AUDIT_BRIEF.md`, `IMPLEMENTATION_READINESS_SPEC.md`, `AUTHORITATIVE_RECORD.md`, `EVIDENCE_APPENDIX.md`, `SUPERSEDED_BACKGROUND.md`, engine-scan sources, code excerpts, and artifacts). No repo access, no prior chat history, no web lookup.

---

## 1. Executive Verdict

**Proceed with required changes.**

The packet is internally consistent, honest about its evidence boundaries, and clearly distinguishes the four lanes (`completed empirical`, `attempted-but-dropped`, `active-but-unrun/host-blocked`, `superseded background`). `AUDIT_BRIEF.md` and `AUTHORITATIVE_RECORD.md` correctly refuse to claim Kokoro won on audio quality — the Kokoro run notes themselves mark every prosody dimension as `pending-manual-audition` (`artifacts/kokoro/notes/continuous-chapter-passage.md`, `artifacts/kokoro/notes/literary-punctuation.md`). That posture is the right one.

The implementation-readiness spec (`IMPLEMENTATION_READINESS_SPEC.md`) is also decision-complete enough for engineering execution on most of its surface area: engine enum, IPC shape, runtime config, sidecar protocol, per-engine chunk profiles, settings UX, and packaging posture are all specified with unambiguous defaults.

However, four issues keep this short of an unconditional "proceed":

1. The spec asserts a specific Qwen chunk profile (`[32, 96, 192] / 320 / 2 / 960`) as if it were derived, but the packet contains zero evidence to justify those numbers — they are an untested guess presented as a settled parameter.
2. The spec has no written success criterion for the prototype. "Can narrate a long-form fixture" is a functional check, not an outcome test. Without a pre-registered bar, the prototype cannot actually produce a go/no-go on Qwen adoption — only a "we got it running" result.
3. There is a genuine auditability gap in one of the packet's own foundational claims (the `wordTimestamps` story — see §3.1). This does not sink the prototype, but it should be tightened before the spec is frozen.
4. Temp-WAV-on-disk as the audio transport is an acceptable v1 choice, but it is not the same "transport" as Kokoro's zero-copy `Float32Array` path, and that fact is not flagged as a measurement confound when comparing the two engines.

Fix those four and this is a clean "proceed." Those are not blockers in the strict sense — they are required changes before execution.

---

## 2. Critical Blockers

None.

Nothing in the packet justifies blocking the prototype. The key objections a stricter auditor might raise — "Qwen was never run on this host, therefore you cannot justify prototype investment" — are preempted honestly by the packet itself: `AUDIT_BRIEF.md` explicitly disclaims that it proves Qwen is better than Kokoro or that Kokoro is better than Qwen, and `AUTHORITATIVE_RECORD.md` §5 (`What This Record Does Not Establish`) lists the right four non-claims. That self-honesty is what makes a "proceed with changes" posture defensible rather than a "block."

The prototype's stated purpose — produce a Kokoro-vs-Qwen live-app comparison that currently does not exist — is itself the evidence gate the reviewer would otherwise demand. You cannot fetch that evidence without building the prototype. Blocking on the absence of evidence the prototype is designed to produce would be circular.

---

## 3. Major Risks

### 3.1 The `wordTimestamps` claim is thinner than the packet implies

`AUTHORITATIVE_RECORD.md` (§"Kokoro Baseline Facts From Current Code") states: "the worker emits `wordTimestamps`, the engine forwards `wordTimestamps`, the IPC handler returns `wordTimestamps` to the renderer." That is textually true: `main-tts-worker.js` line 138 reads `wordTimestamps: result.wordTimestamps || null`, `main-tts-engine.js` line 270 does the same, and `main-ipc-tts.js` line 35 does the same.

But `|| null` means every link in that chain is a pass-through, and whether a non-null value ever appears depends on whether the underlying `kokoro-js` library populates `result.wordTimestamps`. The packet does not include a kokoro-js excerpt or a runtime trace showing a populated array. So the record's refutation of the older memo's "Kokoro needs an external forced aligner" claim is not definitively proven by the evidence shown — it is proven only up to "the wire is there." The older memo may still be partially right or partially wrong, and this packet cannot tell.

This matters because the spec's §"Timing Behavior" says Qwen will use "Blurby's existing heuristic timing path when `wordTimestamps` are null" — which implicitly claims Kokoro is already on the *non*-heuristic path. If in practice Kokoro is also on the heuristic path most of the time (because kokoro-js rarely populates the field), then Qwen and Kokoro are on equal timing footing, which changes the comparison story.

**Severity:** medium. Does not block the prototype, but weakens the packet's refutation of the superseded memo and undermines one framing claim.

### 3.2 Qwen chunk-profile numbers are asserted, not derived

The spec gives Kokoro `openingRampWordCounts = [13, 26, 52, 104] / cruiseChunkWords = 148 / queueDepth = 5 / plannerWindowWords = 400` and Qwen `[32, 96, 192] / 320 / 2 / 960`. The Kokoro numbers are presumably production-tuned (no derivation is shown, but they can be assumed load-bearing because Kokoro is shipping). The Qwen numbers have zero evidentiary basis in the packet. They are not in `QWEN3-TTS.md`, not in the older investigation docs, not derived from the 12Hz codec rate, and not justified as a first-pass heuristic with a rationale attached.

The spec has a thoughtful §"Explicit Assumptions To Audit" bullet saying "Qwen-specific chunking is required for a fair test and should not be treated as special pleading." The principle is correct — Qwen's cost-per-inference and context behavior differ from Kokoro's, so fairness requires different windowing. But the principle does not license specific numbers without justification.

If those numbers are wrong by a factor of 2–3×, the Qwen lane will under- or over-feed the sidecar, and the comparison will be unfair in a direction that is invisible to the listener but measurable in latency and seam behavior.

**Severity:** medium. Will not prevent first-utterance but will contaminate the comparison.

### 3.3 The prototype has no success criterion

`IMPLEMENTATION_READINESS_SPEC.md` §"Decision Gates" lists gates like "Qwen can actually run through the Blurby app path" and "engine switching does not destabilize the current Kokoro lane." These are *build-completeness* gates, not *adoption-decision* gates. The spec's stated purpose ("can Qwen produce a meaningfully better long-form narration experience than Kokoro without forcing full product adoption up front?", §"Product Posture") is a comparative-quality question, but the acceptance checks never operationalize "meaningfully better."

Who listens? How many fixtures? Blind? Paired? What's the veto threshold (Qwen must win on N of 6, or win on long-form-continuity specifically, or produce zero catastrophic failures, or what)? What does a "success" verdict commit the project to next? Absent those answers, the prototype will end with running code and a pile of audio but no defensible conclusion — and the same "more evidence needed" posture that triggered this audit will recur one iteration later.

**Severity:** medium-high. The spec can be built without this, but the prototype cannot decide anything without it.

### 3.4 Audio-transport asymmetry becomes a comparison confound

Kokoro returns PCM as transferable `Float32Array` via worker-thread zero-copy (`main-tts-worker.js` line 139: `parentPort.postMessage(msg, [f32.buffer])`). Qwen's sidecar writes a WAV to `userData/tts-qwen/requests/`, main-process reads the file, returns a `Float32Array`, then deletes the file (`IMPLEMENTATION_READINESS_SPEC.md` §"Audio Transfer"). That's a WAV encode in Python, a file-system round-trip, a WAV decode in Node, and a delete, per generation.

For a v1 prototype this is fine and the spec correctly scopes it as prototype-only. But when the manual acceptance check runs "the same long-form fixture can be narrated once with Kokoro and once with Qwen through the live app path" (§"Manual CUDA-Host Acceptance"), the latency difference is not purely model throughput — it includes the transport asymmetry. The spec does not flag this. A human ear will mostly not hear it, but anyone auditing startup-to-first-audio or seam smoothness numbers will attribute the delta to the model when part of it is transport.

**Severity:** low-medium. Cosmetic for listening tests, material for any latency measurement.

### 3.5 CUDA-only posture with no CPU-fallback exit trail

The spec is firm that Qwen is CUDA-first with `device: "cuda:0"`, `dtype: "bfloat16"`, `attnImplementation: "flash_attention_2"` as defaults (§"Qwen Runtime Configuration"). `QWEN3-TTS.md` corroborates that the official runtime is CUDA + FlashAttention 2 oriented. That is reasonable given what the packet documents.

But `QWEN3-TTS.md` also says "CPU path: not documented as a first-class path in the official examples" — *not documented* is not the same as *impossible*. Neither the spec nor the dossier states whether a slower CPU or CUDA-without-FlashAttention configuration is known-broken, known-working-but-slow, or simply untested. If the project later decides to broaden the prototype's host reach, the spec has no exit ramp for that question; it just says "appear unavailable" when CUDA is missing (§"Packaging Posture"). Fine for v1, but this creates a hard binding between the prototype and a single host class. If that one CUDA host becomes unavailable mid-prototype (maintenance, hardware failure, access revoked), the prototype is dark until it returns.

**Severity:** low for v1, medium for schedule risk.

### 3.6 Sequential-only Qwen serialization collides with the `queueDepth = 2` profile

The spec says `queueDepth = 2` for Qwen (§"Per-Engine Chunk Profiles") but also says the sidecar "allows only one in-flight Qwen generation at a time" (§"Qwen Engine Manager"). `queueDepth = 2` implies 2 chunks of buffered-ahead audio should be maintained. With sequential generation, `queueDepth = 2` at `cruiseChunkWords = 320` means the renderer must wait one full cruise-chunk synthesis time before buffer 2 can begin — which, for a ~320-word Qwen inference, is not instant. The numbers may still work in practice, but the spec does not reason about the interaction between serialization and queue depth. On Kokoro, queueDepth = 5 with a fast per-chunk synthesis is viable; on Qwen at cruiseChunkWords = 320 with serialized generation, the steady-state buffer behavior is not obviously the same question.

**Severity:** low-medium. Will surface during prototype tuning; better to surface in the spec.

---

## 4. Missing or Weak Assumptions

### 4.1 "Heuristic timing path is sufficient for first-round comparison" — stated, not justified

Listed as an explicit assumption under §"Explicit Assumptions To Audit," which is good practice. But the spec does not say what the heuristic path actually does, what its known failure modes are, or why word-level highlighting — which the older investigation memo flagged as a user-facing Blurby feature — won't regress visibly during the Qwen test. If a tester watches the page and the highlight drifts badly on Qwen, they may conclude "Qwen has worse timing" when the real cause is "the heuristic estimator is calibrated for Kokoro's cadence." This needs at minimum a sentence in the acceptance section: "Timing drift is not counted against Qwen in v1; the heuristic is known to be Kokoro-calibrated."

### 4.2 "Built-in speakers only" depends on what Qwen's `list_speakers` returns on the target runtime

The spec defaults the Qwen speaker to `Ryan` "when available; otherwise pick the first reported speaker" (§"Settings and UX"). `QWEN3-TTS.md`'s smoke command uses `speaker='Ryan'`. But the packet contains no `list_speakers` output, so neither `Ryan`-availability nor the speaker-set composition is verified. If `Ryan` doesn't exist in the served checkpoint, or if the speaker list changes per model revision, the UI will silently pick something else and the comparison fixture will use a different voice than the dossier commanded. Low probability, worth a one-liner in the acceptance checks ("speaker listing verified against fixture commands before corpus run").

### 4.3 Kokoro's listening grade is entirely pending

Every Kokoro fixture note in `artifacts/kokoro/notes/*.md` scores "punctuation prosody / long-sentence cadence / dialogue handling / long-form continuity / seam audibility / voice fatigue" as `pending-manual-audition`. Only `runtime practicality: 5` is scored. That means Kokoro's status in the packet is "ran to completion without crashing" — not "sounded good." `SHORTLIST.md` calls Kokoro "Known-good local control with 6/6 captured outputs" and "current leader," which is true only in the narrow sense of *completed the corpus*. Nothing in this packet demonstrates that Kokoro's six WAVs are actually pleasant to listen to, let alone that they are better than what Qwen would produce.

The spec does not depend on Kokoro sounding good — Kokoro is the default because it ships, not because it won on listening. But this gap means the prototype cannot honestly be framed as "Qwen challenges a proven Kokoro baseline." It is "Qwen challenges a known-functional Kokoro baseline whose audio has not yet been scored." The packet should state this one more time in the spec's product-posture section, so the prototype result isn't later over-read.

### 4.4 No stated posture for when Qwen obviously beats Kokoro

If the Qwen listen-through is a clear win, does the project then invest in the packaged-runtime/CPU-fallback/portability work the spec disclaimed? Does Qwen become a premium tier? Does Kokoro get deprecated? The spec is careful about what v1 is *not* (§"Non-Goals"), which is good. But a "success" path that leads nowhere is not an adoption path — it's a demo. At least a sentence acknowledging "if Qwen materially wins, the next phase is a packaged-runtime scoping doc, not shipping Qwen as-is" would close the loop.

### 4.5 No acceptance for observability

The spec adds `qwenPreload`, `qwenModelStatus`, `onQwenEngineStatus`, `onQwenRuntimeError` IPC channels that mirror Kokoro's shape — good. But there is no acceptance check for what happens when they actually fire. "Runtime error propagation" is listed under main-process coverage, but the renderer-side expected behavior on, say, a mid-narration sidecar crash is unspecified. The spec says "Do not silently swap an active Qwen session to Kokoro mid-playback" (§"Failure Rules"), which is the right principle — but what *does* happen? Narration halts? Error modal? Return to idle? This is the kind of gap that shows up in manual testing as "it just stopped."

---

## 5. Recommended Changes to the Spec

In priority order:

1. **Add a pre-registered prototype success criterion.** Before engineering starts. At minimum: (a) a named passage or fixture set to be narrated end-to-end on both engines, (b) a listening-evaluation protocol (blind? paired? one rater or several? which dimensions are scored?), (c) a stated outcome rule ("Qwen proceeds to next-phase scoping if it wins on long-form continuity by X and does not regress dialogue handling below Y") or an explicit admission that the prototype is exploratory and no decision rule will be drawn from it.

2. **Justify the Qwen chunk profile, or mark it as an initial seed.** Either: (a) attach a one-paragraph derivation tied to the 12Hz codec rate, typical Qwen generation latency per N words, and the `queueDepth = 2` buffer goal; or (b) flag `[32, 96, 192] / 320 / 2 / 960` in the spec as "seed values to be tuned in-prototype; not a load-bearing commitment."

3. **Tighten the `wordTimestamps` framing.** Either show a runtime trace of a non-null `wordTimestamps` array coming back from kokoro-js into the renderer, or change `AUTHORITATIVE_RECORD.md` §"Kokoro Baseline Facts From Current Code" to say "the IPC chain forwards `wordTimestamps` when the underlying engine produces them; whether Kokoro currently produces them has not been verified in this record." That small edit converts a weak claim into a honest one without weakening the prototype case.

4. **Flag the audio-transport asymmetry as a measurement confound.** One sentence in §"Audio Transfer": "Temp-file WAV transport is a prototype simplification; latency comparisons against Kokoro's zero-copy Float32Array path are therefore indicative, not definitive."

5. **Name the renderer behavior on Qwen failure.** §"Failure Rules" states the negative ("do not silently swap") — add the positive ("narration halts with a user-visible error state; engine selector remains on Qwen; no automatic retry").

6. **Add a one-line acknowledgment that Kokoro's corpus notes are unscored.** Either in the spec's product-posture section or in `AUTHORITATIVE_RECORD.md`. Something like "Kokoro's 6/6 corpus capture demonstrates functional completion, not audio quality; the spec uses Kokoro as default because it is the shipping baseline." This prevents anyone later reading the record from over-reading "full-corpus-complete" as "sounds good."

7. **(Optional) Drop or archive the `TTS Model Evaluation for Blurby App.md` and `deep-research-report.md` files out of the active packet.** `SUPERSEDED_BACKGROUND.md` already names them as non-authoritative, but they are included in full with their unresolved citation markers intact. The packet states the retention is intentional — to show the auditability problem — and that is defensible. But a reviewer less careful than required would still absorb their numbers. Moving them to `archive/` or a subfolder marked `DO_NOT_CITE/` would reduce that risk without deleting the history.

8. **(Optional) Add a low-priority CPU-or-reduced-CUDA fallback investigation as an out-of-band spike,** not part of v1, so that if the CUDA host becomes unavailable the prototype is not indefinitely blocked.

---

## 6. Final Recommendation

**Proceed with required changes.**

The packet honestly documents what it knows and what it doesn't. The implementation-readiness spec is executable on most of its surface. The runtime split (Kokoro default, Qwen as CUDA-first external-runtime prototype engine, no cloning/instruct UI in v1) is sound for the stated question. The non-goals are well-drawn.

The required changes before engineering execution begins are items 1, 2, 3, and 4 from §5. Items 5 and 6 should be folded in during the same editing pass. Items 7 and 8 are nice-to-have.

Without items 1 and 2, the prototype will build cleanly but will not be able to answer its own question. Those are the two that, if ignored, would convert this verdict to "block pending more evidence" on re-review.



# Blurby Qwen-native TTS runtime spec

Blurby's Kokoro-shaped runtime — "chunk → WAV → Float32Array → scheduler," with every speech act rendered as a temp WAV, fixed per-sentence chunking, and no style control — leaves most of what **Qwen3-TTS-12Hz-1.7B-CustomVoice** was built to do on the table. This spec redesigns the runtime Qwen-first. The three pivots are: (1) replace temp-WAV with a **WebSocket PCM stream** from vLLM-Omni, so narration starts within ~200 ms instead of one synthesis-round later; (2) treat **author-curated `instruct` strings** as a first-class narration primitive selected by a text-segmentation heuristic, not as a user input; and (3) pipe **Qwen3-ForcedAligner-0.6B** per chunk in parallel with playback, giving sub-60 ms word-highlight accuracy with zero added user-perceived latency. The rest of Blurby — Electron shell, reader UI, play/pause/rate/seek — is untouched. Model claims below are cited to the QwenLM/Qwen3-TTS repo, the Hugging Face card, the Qwen3-TTS arXiv tech report (2601.15621), and vLLM-Omni's official docs. Claims not found in those sources are flagged `DESIGN ASSUMPTION`.

## 1. Executive summary and decision gates

**Recommended runtime:** `vllm-omni` (official sub-project of vLLM, day-0 Qwen3-TTS support) running as a long-lived localhost server, invoked over its OpenAI-compatible WebSocket streaming endpoint. The `qwen-tts` PyPI package is rejected as the primary runtime because it does not expose a streaming audio API — GitHub issue #10 in QwenLM/Qwen3-TTS confirms "the model appears to only support text token streaming (not audio streaming)" and the current `generate_custom_voice()` returns a fully-decoded `(wavs, sr)` tuple. Any streaming path that uses `qwen-tts` requires us to reimplement the streaming codec-decoder glue that vLLM-Omni already ships.

**Transport:** WebSocket `/v1/audio/speech/stream`, binary PCM frames at **24 kHz mono s16le** (per vllm-omni docs), consumed by the Electron main process, forwarded to the renderer via IPC, decoded into `AudioBuffer` chunks, and scheduled on a Web Audio API `AudioBufferSourceNode` chain. Temp WAV files are eliminated from the hot path.

**Decision gates for calling this design a success** — pre-registered, measured on a single-CUDA workstation (RTX 4090-class, 24 GB VRAM):

| Gate | Kokoro-shaped baseline (today) | Qwen-native target | Source of target |
|---|---|---|---|
| Time-to-first-audio from play | ≈ one chunk synthesis + WAV write | **< 400 ms** | Model TTFP 101 ms + packet 320 ms |
| Chunk-boundary audio gap | Audible (WAV swap) | **Inaudible (< 20 ms)** | 24 kHz PCM continuous stream |
| Word-highlight error vs. audio | N/A (chunk-granular only) | **< 80 ms avg** | FA AAS 27.8–52.9 ms |
| Narration tone variation | None | **≥ 4 distinguishable modes** | `instruct` tested on Qwen3-TTS |
| Resume/seek latency | Full re-synthesis of chunk | **< 500 ms** | Pre-rendered look-ahead queue |
| Steady-state VRAM | n/a | **< 12 GB** | 3.83 GB TTS + 1.84 GB FA + activations |
| Cold start to first audio | Uncontrolled | **< 45 s** | vLLM graph capture one-time |

If four of the seven gates are missed after a two-week tune-up window, the Qwen-native design is not materially better than forcing Qwen through Kokoro's shape and we would revisit.

## 2. Why vLLM-Omni, not qwen-tts or a roll-your-own server

QwenLM officially endorses exactly two local paths: the `qwen-tts` PyPI library and vLLM-Omni. The QwenLM/Qwen3-TTS README states "vLLM officially provides day-0 support for Qwen3-TTS! Welcome to use vLLM-Omni for Qwen3-TTS deployment and inference." The library path has **no server, no streaming audio API, and no built-in concurrency** — it's a reference implementation wrapped around `Qwen3TTSModel.from_pretrained()`. The README's streaming claim ("output the first audio packet immediately after a single character is input, with end-to-end synthesis latency as low as 97ms") is realized only in the **DashScope cloud realtime API** or in **vLLM-Omni's streaming endpoint**, not in the library.

vLLM-Omni (Apache-2.0, `github.com/vllm-project/vllm-omni`, v0.14.0 stable, aligned to upstream vLLM v0.19.0) ships a Qwen3-TTS model registry entry at `vllm_omni/model_executor/models/qwen3_tts/` and a stage config at `qwen3_tts.yaml`. **The QwenLM README's warning that "only offline inference is supported" is stale** — vllm-omni's own docs (`docs.vllm.ai/projects/vllm-omni/en/stable/user_guide/examples/online_serving/qwen3_tts/`) document a working `vllm serve Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice --omni --port 8091` and a WebSocket stream endpoint. We verify the running version supports online serving on first install; if the nightly is regressed we pin to v0.14.0+.

**Rejected alternatives:** TensorRT-LLM, SGLang, LMDeploy, and Triton have no Qwen3-TTS model class — integrating any of them would mean re-implementing the dual-track LM + causal 15-layer RVQ decoder. The third-party `nano-qwen3tts-vllm` is interesting (claims 8 concurrent streams near-realtime on H100) but unofficial and not a defensible production dependency. DashScope is remote-only and violates the local-CUDA constraint. Raw `transformers` + FastAPI re-invents what vLLM-Omni already debugged, including paged attention for the LM stage and async_chunk decoding for the 12 Hz tokenizer.

## 3. What Qwen3-TTS-12Hz-1.7B-CustomVoice actually does

The model is a two-stage system whose internals matter for everything downstream. **Stage 1** is a Qwen3-derived 1.7 B-parameter LM with a Multi-Token Prediction head that emits discrete codec tokens. **Stage 2** is `Qwen-TTS-Tokenizer-12Hz`, a Mimi-style multi-codebook tokenizer with 16 residual codebooks of 2048 entries each, running at **12.5 Hz — each token corresponds to 80 ms of audio** (arXiv 2601.15621 §2.2, §3.4). A speech packet is defined as **4 tokens = 320 ms** (§3.4). Crucially, the decoder is a "pure left-context streaming codec decoder" built on a lightweight causal ConvNet, which is why streaming works without waiting for future context.

Measured first-packet latency at concurrency 1 on the 1.7 B variant is **101 ms** (LM TTFP 97 ms + tokenizer decode 4 ms), with **LM TPOT 21 ms and RTF 0.313** (arXiv Table 2). At concurrency 3 these degrade to 195 ms / RTF 0.363; at concurrency 6 to 333 ms / RTF 0.463 — relevant because pre-rendering lookahead is concurrent with active playback.

**Context was extended to 32,768 tokens during post-training** (§3.2), which at 12.5 Hz is a theoretical upper bound of ~43 minutes of audio per generation call. The tech report evaluates outputs "exceeding 10 minutes in duration" (§4.2.6); the Blurby chunk design treats 10 minutes as the practical ceiling for a single LM call and stays well below it. Output sample rate is **not stated in any Qwen document we accessed** — community code and Baseten templates assume 24 kHz, and vLLM-Omni's streaming endpoint documents 24 kHz mono s16le output. We adopt **24 kHz as a design assumption validated by vllm-omni's public API contract**.

The nine built-in speakers and their native languages are fixed and listed in the README:

| Speaker | Character | Native language |
|---|---|---|
| Ryan | Dynamic male, strong rhythmic drive | English |
| Aiden | Sunny American male, clear midrange | English |
| Vivian | Bright, slightly edgy young female | Chinese |
| Serena | Warm, gentle young female | Chinese |
| Uncle_Fu | Seasoned male, low mellow timbre | Chinese |
| Dylan | Youthful Beijing male | Chinese (Beijing) |
| Eric | Lively Chengdu male, husky brightness | Chinese (Sichuan) |
| Ono_Anna | Playful Japanese female, light timbre | Japanese |
| Sohee | Warm Korean female, rich emotion | Korean |

Per README: "each speaker can speak any language supported by the model," so for English audiobooks both **Ryan and Aiden** are on-language and are the defaults we expose. **The "-CustomVoice" suffix does not mean voice cloning** — the README explicitly calls it "style control over target timbres via user instructions; supports 9 premium timbres." Voice cloning is the sibling `-Base` model's `generate_voice_clone(ref_audio, ref_text)`, which remains out of scope per v1 product direction. The 10 supported languages are Chinese, English, Japanese, Korean, German, French, Russian, Portuguese, Spanish, Italian.

## 4. Runtime architecture and IPC

The runtime is a **local server sidecar**, not an in-process module. Three processes coexist:

1. **vLLM-Omni TTS server** (`vllm serve ... --omni --port 8091`), holding the TTS LM + codec decoder in VRAM.
2. **Alignment sidecar** (Python FastAPI wrapping `Qwen3ForcedAligner` from the `qwen-asr` package), `POST /align` on localhost:8092.
3. **Electron main process**, which opens a WebSocket to the TTS server and an HTTP client to the aligner, coordinates chunk state, and forwards audio/timing to the renderer over Electron IPC.

**Why a sidecar and not embedded:** Electron's renderer cannot hold a 6 GB CUDA context, Node-side Python embeddings are fragile, and vLLM-Omni needs its own Python 3.12 venv with CUDA-matched PyTorch. The sidecar pattern also lets the Python side restart without taking down the reader UI.

**TTS API surface** (from vllm-omni docs, `/serving/speech_api/`):

- `POST /v1/audio/speech` — non-streaming, returns complete WAV/PCM. Used only for sync previews (voice selector).
- `POST /v1/audio/voices` — voice-cloning upload endpoint. **Disabled** at the app layer; not exposed in UI.
- `WS /v1/audio/speech/stream` — **primary path.** Client opens WebSocket, sends a JSON `session.config` event with `model`, `voice`, `task_type: "CustomVoice"`, `response_format: "pcm"`, `instruct` (see §6), then sends `input.text` events as chunks become ready. Server emits `audio.start`, zero-or-more binary PCM frames, `audio.done`. `stream=true` requires `response_format="pcm"` and disables server-side `speed` — **rate control is implemented renderer-side via Web Audio `playbackRate`**, not via model parameters.

**Alignment API surface** (internal, defined by us around the `qwen-asr` library):

```
POST /align
  body: { chunk_id, audio_b64 (16kHz PCM), text, language }
  returns: { chunk_id, items: [{text, start_time, end_time}, ...] }
```

Timestamps are seconds since the start of the chunk. The main process adds a `chunk_offset_seconds` before sending to the renderer.

**Electron IPC:** the renderer receives two streams via `ipcRenderer.on`:

- `tts:audio` → `{ chunk_id, frame_index, pcm: ArrayBuffer (s16le 24kHz mono) }` as frames arrive.
- `tts:timing` → `{ chunk_id, chunk_offset_seconds, items: [...] }` when a chunk finishes aligning.

The renderer never sees a temp file path.

## 5. Chunking strategy derived from the codec and aligner ceilings

Four documented numbers fix the chunking window without guessing:

1. **Codec frame rate** — 12.5 Hz, 80 ms/token, 320 ms/packet (arXiv §3.4).
2. **LM context** — 32,768 tokens trained (§3.2); practical demonstrated ceiling ~10 minutes of audio.
3. **Aligner hard cap** — 5 minutes of audio per `align()` call (Qwen3-ForcedAligner HF card: "supports timestamp prediction for arbitrary units within up to 5 minutes of speech").
4. **First-packet latency** — 101 ms at concurrency 1, 195 ms at concurrency 3 (arXiv Table 2). Recommendation: **never exceed concurrency 2** on a single GPU for a single user to protect TTFP for the actively-playing chunk.

These yield **two chunk tiers**:

- **Render chunk** = one paragraph, clamped to 300 s of audio max. The TTS server streams this via WebSocket. The paragraph boundary is chosen because it matches the natural instruct-mode boundary in prose (§6) and because `async_chunk`'s default `chunk_size=25, left_context_size=25` tokens (~2 s) inside vllm-omni already handles sub-paragraph streaming internally. We don't subdivide paragraphs.
- **Look-ahead queue depth** = 2 (current render chunk playing + next paragraph pre-rendering). With RTF 0.313 and concurrency 2 (effective RTF ~0.363), prefetching the next paragraph while the current plays provides a large safety margin; a 30 s paragraph pre-renders in ~11 s. Queue depth 3+ provides no perceptible benefit on a single-user desktop and doubles transient VRAM pressure.

**Seek behavior:** seeking into a different paragraph cancels in-flight WebSocket streams (vllm-omni supports session cancellation), resets the queue, and issues a new render request starting from the target paragraph. Expected resume latency is 101 ms TTFP + one 320 ms packet ≈ **~420 ms to first audible frame**, well inside the 500 ms gate.

**Rate control (0.5×–2×):** Web Audio `playbackRate` scalar on the `AudioBufferSourceNode`, because vllm-omni's `speed` parameter is explicitly disabled under `stream=true`. Pitch preservation via a small-footprint time-stretch (soundtouch.js, WASM, ~120 kB) is kept behind a flag — the MVP ships with the native pitch-shifted playbackRate, matching the current Kokoro-shape behavior.

## 6. Instruct prompt strategy — six named narration modes

The `instruct` field is a Qwen3-TTS kwarg on `generate_custom_voice()` (README) and a field in the vllm-omni `session.config`. Documented evidence that it works: the arXiv paper claims "fine-grained control" and a "probabilistically activated thinking pattern during training to improve instruction following" (§3.3); the README demonstrates `instruct="用特别愤怒的语气说"` (angry tone, Chinese) and a batch example `instruct=["", "Very happy."]`; VoiceDesign examples (same instruct semantics) include complex English prompts like "Speak in an incredulous tone, but with a hint of panic beginning to creep into your voice." **Dialogue tags and multi-speaker syntax are not documented — any such behavior is a DESIGN ASSUMPTION to validate.**

Our narration modes are author-curated, not user-facing. Selection is rule-based from the source text. We preserve the instruct string exactly; model-facing prompts are English because most English docs and examples are English, and empirical robustness on Chinese+English is asserted in the tech report.

| Mode | Trigger (text heuristic) | `instruct` string | Voice pairing |
|---|---|---|---|
| `neutral-prose` | Default, narration outside dialogue | `""` (empty — baseline neutral narration) | Ryan or Aiden |
| `calm-descriptive` | Paragraph detected as scenic/descriptive (low verb density, long sentences, no quotes) | `"Speak in a calm, measured narrator voice with slightly slower pacing."` | Aiden |
| `action-paced` | High verb density, short sentences, exclamation marks, action verbs from a curated list | `"Speak with energetic pacing and heightened intensity."` | Ryan |
| `dialogue-expressive` | Sentence wrapped in quotation marks or dialogue tag detected | `"Speak this line of dialogue with natural expressiveness and clear character voice."` | Same speaker as surrounding narration |
| `somber-reflective` | Sentiment-flagged as reflective/sad (lexicon lookup) | `"Speak softly and reflectively, with a gentle gravity."` | Aiden |
| `emphatic-quote` | Inline emphasis (italics, ALL-CAPS word) | `"Emphasize the marked phrase with slightly raised intensity."` | Same speaker |

Mode selection runs in the Electron main process during paragraph segmentation, before the WebSocket `session.config` is sent. Switching modes requires **one new WebSocket session per mode change**, because `instruct` is set at session config time — not per `input.text` event. This is cheap (TTFP 101 ms) and is precisely why we segment by paragraph, not by sentence: paragraph-granular instruct changes are perceptually smooth; sentence-granular changes would add perceptible seam latency.

**Validation protocol before shipping modes:** A/B blind test 20 audiobook paragraphs per mode against `instruct=""` baseline; retain a mode only if the targeted perceptual axis (pace, warmth, intensity) is reliably distinguishable by listeners. Modes that fail are mapped back to `neutral-prose`.

## 7. Timing and alignment via Qwen3-ForcedAligner-0.6B

The aligner is officially released (2026-01-29, Apache-2.0, `huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B`, part of the `qwen-asr` package not `qwen-tts`) and is the right tool for word-level highlighting. It's a **non-autoregressive** timestamp predictor with measured Average Alignment Shift of **27.8–42.9 ms on short audio, 52.9 ms on 300-second audio** (HF card eval table), which beats WhisperX (92–165 ms on raw, up to 5720 ms on concatenated Italian), NFA (~130 ms), and MFA (~50 ms) on clean long-form. **All of these are well under the ~100 ms audio-visual sync threshold humans perceive.** It supports 11 languages — all 10 Qwen3-TTS languages plus Cantonese — and consumes raw audio at 16 kHz plus the ground-truth text.

Two architectural facts shape the integration:

1. **It is post-hoc per chunk, not streaming.** Input is a full `(audio, text, language)` triple. It cannot emit partial timings as audio arrives. The TTS README is silent on aligner integration, so there's no "free" token-level alignment from TTS internals, and the tech report describes a multi-codebook architecture where attention is not designed for monotonic alignment (DESIGN ASSUMPTION that TTS-internal attention won't yield clean word boundaries).
2. **It hard-caps at 5 minutes of audio per call.** Our 300-second paragraph ceiling is set below this on purpose.

**Pipeline:**

```
t0          TTS streams chunk N PCM → renderer plays chunk N
                                    ↘
                                     chunk N PCM buffered in main
                                    ↘
t0+play_N   Main resamples to 16 kHz, POSTs to aligner
                                    ↘
                                     aligner returns items in T_align
t0+play_N+T_align  Renderer receives tts:timing → starts highlighting
```

Because alignment starts as soon as chunk N's **generation** finishes (not when playback finishes), and playback of chunk N-1 is still in progress, alignment overlaps with audible playback. The first chunk is the cold case: first-word highlight cannot begin until generation of chunk 1 + alignment of chunk 1 completes. With paragraph-sized chunks and RTF ~0.313, generation of a 30 s paragraph takes ~9.4 s and playback begins ~400 ms in; alignment of the same 30 s on a similar-size NAR model is plausibly sub-second (Qwen3-ASR-0.6B sibling claims 2000×realtime throughput at high concurrency per arXiv 2601.21337, though single-request latency is **not published — DESIGN ASSUMPTION** that it lands ≤1 s for a 30 s chunk on RTX 4090; benchmark on install).

**Consequence for UX:** after a ~1 s first-paint warm-up, every subsequent paragraph's word highlighting is ready before its audio plays. Highlighting runs on a simple timer driven by `AudioContext.currentTime` and the per-chunk items array.

**Fallback order if alignment fails:**

1. **Primary:** Qwen3-ForcedAligner-0.6B.
2. **Language fallback:** if the text is in a non-supported language (outside the 11), **`torchaudio.functional.forced_align`** against a pre-downloaded MMS/wav2vec2 model — monotonic Viterbi, CPU-capable, covers 1000+ languages; timestamp precision is lower but still usable.
3. **Hard fallback:** emit **synthetic word timings** linearly interpolated across the chunk duration proportional to word character counts. Word highlighting becomes approximately correct; listener-visible degradation is graceful rather than absent.
4. **Aligner unreachable after N retries:** disable highlighting for the session, display a non-blocking toast ("Word highlighting unavailable"), keep audio streaming.

## 8. Voice selection and UI surface

The existing Blurby voice picker keeps its shape — a list with a preview button — but its contents change. On app start, the main process calls `/v1/audio/speech` once with a short cached phrase per speaker to warm the server and cache a 2-second preview WAV per voice. The picker exposes **all 9 speakers** with language and character descriptions from the README table in §3; English audiobooks default to Ryan with Aiden as a one-click alternative. "Native language" is surfaced as a badge, not a filter, because the README confirms cross-language generation works for all speakers. **No documented quality/stability ranking exists among the 9 speakers in any Qwen source** — we ship all nine and collect telemetry on user selection and skip-rate to build our own ranking over time (DESIGN ASSUMPTION that cross-language quality varies; validate).

## 9. Provisioning, VRAM, and dependency footprint

**Disk (one-time fetch):**

- `Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice` — 4.52 GB repo, `model.safetensors` 3.83 GB BF16.
- `Qwen/Qwen3-ForcedAligner-0.6B` — 1.84 GB BF16 (name is misleading; HF metadata reports ~0.9 B params end-to-end including the audio encoder, though a community inspection identifies a 601 M transformer backbone).
- Python env (vLLM 0.19.0 CUDA 13.0 wheel + vLLM-Omni + qwen-asr) — ~3–5 GB DESIGN ASSUMPTION, vLLM wheel alone is GB-scale per their install docs.
- ffmpeg + sox system deps.

**VRAM at steady state:** weights 3.83 GB (TTS) + 1.84 GB (aligner) + KV cache + activations. Official Qwen docs do not publish a VRAM number; third-party community benchmarks report ~6 GB for the TTS 1.7 B variant alone on RTX 4080 SUPER (DESIGN ASSUMPTION). Budget: **10–12 GB at steady state on a 24 GB card**, leaving headroom for concurrency 2 prefetch and OS display.

**Software stack (pinned):**

- Python **3.12** (required by both `qwen-tts` and vllm-omni).
- `transformers==4.57.3` (qwen-tts 0.1.1 hardcodes this per issue #237).
- `flash-attn` 2.x — recommended by README with `MAX_JOBS=4 pip install -U flash-attn --no-build-isolation` for workstations with <96 GB RAM.
- CUDA: vLLM-Omni v0.18+ aligns to CUDA 12.9; vLLM 0.19.0 ships CUDA 13.0 wheels. Workstation needs matching driver. Compute capability ≥ 8.0 required for FlashAttention 2.
- PyTorch: use the version bundled in the vLLM wheel; do not mix a Conda PyTorch (NCCL static-link incompatibility per vLLM docs).

**Startup:** `--enforce-eager` is used in every vllm-omni Qwen3-TTS example to skip CUDA graph capture; we keep it. Cold start to first audio is DESIGN ASSUMPTION ≤ 45 s; we gate this at startup and display a readiness indicator in the reader.

## 10. Renderer-side flow replacing the Kokoro shape

Old flow: `text chunk → TTS call → WAV file on disk → fetch() → decodeAudioData() → Float32Array → AudioBufferSourceNode.start()`.

New flow:

1. Renderer requests playback of paragraph `P` from main via `ipcRenderer.invoke('tts:playParagraph', { paragraph_id: P })`.
2. Main resolves the narration mode for `P` from its segmentation analyzer, opens or reuses a WebSocket with the correct `instruct` and `voice`, sends `input.text`.
3. As binary PCM frames arrive, main forwards each frame to the renderer as a transferable `ArrayBuffer` via `webContents.send('tts:audio', ...)`.
4. Renderer accumulates frames into a ring of small `AudioBuffer` objects (each 320 ms = one codec packet, 7680 s16 samples at 24 kHz), schedules them back-to-back on the `AudioContext` using `source.start(nextStartTime)`; `nextStartTime += buffer.duration`.
5. When alignment for `P` arrives, renderer caches `{items, chunk_offset_seconds}` under `P`'s id and begins driving word-highlight updates from a `requestAnimationFrame` loop comparing `AudioContext.currentTime` to `item.start_time + chunk_offset_seconds`.
6. Pause: renderer calls `AudioContext.suspend()` and sends `tts:pause` to main, which leaves the WebSocket open; resume re-primes by `AudioContext.resume()`. Seek: main cancels the WebSocket session and opens a new one at the target paragraph.

The Float32Array → `AudioBuffer` conversion (s16le → float32 normalized to [-1, 1]) happens once per frame in the renderer; at 320 ms frames and 24 kHz, per-frame cost is negligible.

## 11. Failure modes and graceful degradation

**Streaming fails mid-paragraph (WebSocket drops, server OOM, model exception):** main catches the error, records the partially-played offset, tears down the session, fires a `tts:streamFailed` IPC with the offset, and retries the same paragraph from the offset using a **fallback non-streaming `POST /v1/audio/speech` call** that returns a full WAV. Listener hears a ≤2 s pause, then narration resumes. Three consecutive failures on the same paragraph escalates to a toast and halts playback.

**Alignment fails:** chain of fallbacks per §7 — torchaudio MMS → synthetic linear timings → disable highlighting. Audio playback is never blocked on alignment.

**Server unreachable on app start:** reader UI launches normally with a persistent "Voice engine starting…" badge; play button is disabled. Main polls `GET /health` on both sidecars every 500 ms with a 60 s overall budget. After budget exhaustion, reader remains functional (text visible, scrollable, bookmarkable) and a "Voice engine unavailable — check sidecar logs" banner appears.

**VRAM exhausted during generation:** vllm-omni returns a 500 or the WebSocket drops with a CUDA OOM. Main reduces effective concurrency to 1 (cancels any prefetch session), restarts the TTS server if necessary (one-shot), and falls back to per-paragraph sequential rendering. A persistent low-VRAM flag lowers queue depth for the session.

**Instruct-mode misbehavior (model ignores or over-reacts to a prompt):** modes are A/B tested before shipping (§6); at runtime we add a "report this paragraph" UI affordance that captures the input text, chosen mode, and audio for offline review. Baked-in fallback: a `NarrationMode.Neutral` flag is persisted per document after three user reports of mode misbehavior on that document.

**Model-version drift (vllm-omni nightly regression):** we pin vllm-omni and the Qwen3-TTS model revision by commit SHA in `requirements.txt`, not by tag. Upgrades are gated behind the §1 decision-gate re-run.

## 12. Key uncertainties flagged for validation

Four claims in this spec rest on DESIGN ASSUMPTIONS that official Qwen sources do not confirm and that should be validated during the first implementation sprint before the decision gates are run.

First, **output sample rate is not quoted in any Qwen README or model card**; we adopt 24 kHz from vllm-omni's public streaming contract. Second, **VRAM** for the 1.7 B variant is a community measurement, not a Qwen number; the 10–12 GB total budget is safe but not official. Third, **Qwen3-ForcedAligner single-request latency** is not published — its concurrency-128 throughput is documented, but our "alignment completes in <1 s for a 30 s paragraph" claim is inferred and must be benchmarked on the target workstation. Fourth, **instruct-mode robustness beyond single-axis emotion control** (pacing, dialogue tone, emphasis) is asserted by the tech report but not quantified; the mode catalog in §6 is the right shape to test but may shrink after A/B validation.

## Conclusion

Going Qwen-first instead of Qwen-in-Kokoro-shape unlocks three things the current runtime cannot deliver at any amount of polish: sub-400 ms time-to-first-audio via the streaming codec decoder, sub-100 ms word-highlight accuracy via the official forced aligner, and a real narration-mode vocabulary via the `instruct` field. The cost is a localhost vLLM-Omni sidecar and a Python 3.12 CUDA toolchain — substantial but bounded, and officially endorsed by QwenLM rather than improvised. The biggest risk is not in any one piece but in their composition on a single GPU — the decision gates in §1 are the test of whether the composition holds. If four or more gates are met on first benchmark, this design is defensible; if three or fewer are met, the right move is to reduce ambition (drop prefetch, drop alignment, or drop instruct modes) one axis at a time rather than revert to the Kokoro frame.