# Integrated Blurby TTS Research Synthesis

Generated: 2026-05-11

Source labels are preserved exactly:

- [O] Master Exhaustive Source-Aware Outline: `C:\Users\estra\Projects\Blurby.Research\Blurby_TTS_Master_Exhaustive_Outline_2026-05-11.md`
- [A] Direct static/codebase review: `C:\Users\estra\Projects\Blurby.Research\.Findings\Blurby_TTS_Literature_Codebase_Review_2026-05-11.md`
- [B] Compass / assumed-Blurby review: `C:\Users\estra\Projects\Blurby.Research\.Findings\compass_artifact_wf-255c72a1-1de8-4397-b428-f463db0a63ab_text_markdown.md`
- [C] Deep research report: `C:\Users\estra\Projects\Blurby.Research\.Findings\deep-research-report.md`
- [D] Cowork/direct v1.75.1 review: `C:\Users\estra\Projects\Blurby.Research\.Findings\TTS_LITERATURE_REVIEW_2026-05-11.md`

All five files were readable. No missing-source limitation applies.

---

# 1. Element Ledger

This ledger uses [O] as the controlling anti-orphan structure and cross-checks each element family against [A], [B], [C], and [D]. Rows are source-aware and destination-aware. Where an element family contains multiple subitems, those subitems are named in the description so they are not silently merged away.

| ID | Sources | Original location | Element description | Type | Confidence note | Planned destination | Treatment | Status |
|---|---|---|---|---|---|---|---|---|
| E001 | [O][A][B][C][D] | O §1.1; all executive summaries | Preserve/evolve rather than rewrite Blurby TTS; external projects are donors, not replacements. | consensus, recommendation | [A]/[D] direct/static; [B] assumed; [C] audit-package | Executive Summary; Thesis; Conclusion | main narrative | Included |
| E002 | [O][A][B][C][D] | O §1.1; engine evaluations | Keep Kokoro as default/primary/timing baseline where validated; do not replace without evidence. | consensus, recommendation | [A]/[D] strongest direct evidence; [C] cautious; [B] assumed | Thesis; Model Evaluation; Roadmap | consolidated | Included |
| E003 | [O][A][B][C][D] | O §1.1, §6.2-6.3 | Formalize `TTSProvider`, `ProviderCapabilities`, `TTSProviderRegistry`, fallback order, readiness, health, status, timing truth, UI capability filtering, packaging and license metadata. | recommendation, architecture | all sources agree at different specificity | Recommended Architecture; Gap Matrix | table + narrative | Included |
| E004 | [O][A][B][C][D] | O §1.1, §6.4, §7.4 | Deterministic segment identity and source/display/synthesis text separation; segment IDs from document locators plus local ordinals, not transient queue order or text hash alone. | consensus, current-state gap | [D] direct baseline; [C]/[B] architectural | Current Baseline; Timing; Architecture | main narrative | Included |
| E005 | [O][A][B][C][D] | O §1.1, §3.8, §6.5 | Add `SegmentNormalizer`: pure, versioned, non-destructive, locale-aware design; include currency/time/date/abbrev/NFKC/ligature/ordinal/heteronym/contraction fixtures and pronunciation overrides. | recommendation, gap, test item | [D] calls biggest opportunity; [B] favors pdf-narrator port; [C] warns against destructive normalization | Baseline; Architecture; Gap Matrix; Tests | distinct subsection | Included |
| E006 | [O][A][B][C][D] | O §1.1, §6.10, §7 | Persist timing metadata separately from audio chunks with timing truth, provenance, confidence, drift, provider/model/normalizer versions, word/sentence/segment modes. | consensus, architecture | [B]/[C] conservative; [A]/[D] direct Kokoro timing path | Timing; Architecture; Roadmap | main narrative | Included |
| E007 | [O][A][D] | O §3.2; A §3; D §3.1 | Kokoro current baseline: kokoro-js/ONNX worker thread, q4 model, 24 kHz mono, 28 voices, af_bella default, packaged resolution, warm-up/preflight, fail-closed model-ready gate, idle unload, crash retry/backoff, zero-copy transfer, patched duration tensor. | current-state baseline | direct/static only | Current Blurby Baseline; Model Evaluation | detailed baseline | Included |
| E008 | [O][A][D] | O §3.3; A §3; D §3.1 | MOSS Nano: real ONNX sidecar, recommended opt-in/non-default, lifecycle/readiness gates, owner tokens, segment-following only, `wordTimestamps:null`, no fabricated word timing, large PCM IPC and licensing concerns. | baseline, risk, defer item | direct/static | Baseline; Engine Eval; Risk; Defer | consolidated | Included |
| E009 | [O][A][D] | O §3.4; A §3; D §3.1 | Pocket TTS: opt-in sidecar/engine wrapper, reference WAV/catalog shape, adapter not configured or not production-ready, no word timing, voice-cloning/license posture concerns. | baseline, defer item | direct/static | Baseline; Engine Eval; Risk; Defer | consolidated | Included |
| E010 | [O][A][D] | O §3.5; A §3; D §3.1 | Qwen streaming: disabled at selectable-engine and IPC boundaries, `qwen-disabled` posture, reusable binary-framed PCM protocol, JSON control plane, monotonic frames, stall/cancel/crash handling, CUDA validation and timing gaps. | baseline, defer, risk | direct/static | Baseline; Engine Eval; Roadmap | consolidated | Included |
| E011 | [O][A][D] | O §3.6; A §3; D §3.1 | Experimental gating exists across settings/profile/runtime gates but should become formal `ExperimentalModelGate` with readiness, timing, memory, startup, crash, packaging, license, and UI criteria. | gap, recommendation | direct/static | Architecture; Gap Matrix; Roadmap | main narrative | Included |
| E012 | [O][A][D] | O §3.7; A §3; D §3.1 | Existing text segmentation: `Intl.Segmenter`, abbreviation-aware boundaries, rolling 400-word planner, cold/cruise chunk sizes, sentence snapping, progressive opening ramp, boundary classification, dialogue-aware pauses; gap is stable structural segment IDs. | baseline, gap | direct/static | Baseline; Cross-Codebase; Tests | main narrative | Included |
| E013 | [O][A][D] | O §3.9; A §3; D §3.1 | Audio generation pipeline: IPC to Kokoro, progressive chunk sizing, planner-aware boundary handling, silence injection, stale guards, non-blocking design; needs provider-neutral `AudioGenerationQueue` and buffered-seconds backpressure. | baseline, recommendation | direct/static | Baseline; Architecture | consolidated | Included |
| E014 | [O][A][C][D] | O §3.10, §4.6 | Audio cache: persistent Opus disk cache, manifest, LRU, opening coverage, background builder, strong identity; risks include slash-splitting composite keys, lack of content-addressed secondary index, schema/migration/corruption recovery/timing sidecar. | baseline, risk, recommendation | [A]/[D] direct; [C] key formula | Baseline; Cache Architecture; Risk | distinct subsection | Included |
| E015 | [O][A][D] | O §3.11 | Web Audio scheduler: AudioContext clock, AudioBufferSourceNode scheduling, gapless scheduling, 8 ms crossfade, RAF word timer, epoch token, rate-change future chunk rebuild; preserve and do not rewrite. | baseline, avoid item | direct/static | Baseline; Architecture; Avoid Table | main narrative | Included |
| E016 | [O][A][D] | O §3.12 | Kokoro timing validation: count matching, finite values, monotonicity, word correspondence, overshoot, zero-duration; weighted heuristic fallback and timing source telemetry; need durable store. | baseline, test, gap | direct/static | Timing; Tests | main narrative | Included |
| E017 | [O][A][D] | O §3.13 | Highlight sync: Foliate word offsets/spans, scheduler truth-sync, canonical vs visual separation, cursor lag, boundary sync, contamination prevention; needs `HighlightSyncController` and fallback modes. | baseline, recommendation | direct/static | Timing; Architecture | main narrative | Included |
| E018 | [O][A][C][D] | O §3.14, §7.8 | Pause/resume/seek: AudioContext suspend/resume, scheduler epoch, resume anchors; need segment-level seek contract and provider capability treatment; provider pause semantics vary. | gap, risk | direct/static plus audit-package | Timing; Risk; Tests | consolidated | Included |
| E019 | [O][A][B][D] | O §3.15, §4.8 | Settings/UI controls: current per-engine settings/status, voice/rate/pause/cache/profiles/footnotes; missing pronunciation UI, voice blend UI, per-engine-per-language voice memory, MediaSession, diagnostics panel. | baseline, roadmap | [D] direct; [B] product suggestions | Baseline; Roadmap; Gap Matrix | consolidated | Included |
| E020 | [O][A][C][D] | O §3.16, §4.10 | Error handling/diagnostics: status snapshots, IPC error normalization, worker retry/backoff, renderer fallback, sidecar lifecycle, eval traces; need provider-neutral `NarrationDiagnostics` and exportable bundle. | baseline, recommendation | direct/static plus audit-package | Baseline; Architecture; Risk | main narrative | Included |
| E021 | [O][A][B][C][D] | O §3.17, §11 | Existing test strengths and gaps: scheduler, planner, Kokoro, Nano/Pocket, Qwen, eval traces strong; add golden segmentation, normalizer, drift, provider registry, cache migration/key, content cache, voice formula, experimental gate, soak and corpus tests. | test item | [D] richest test matrix | Test Strategy | detailed section | Included |
| E022 | [O][D] | O §3.18; D §3.2 | Explicit current gaps: voice blending/formula syntax, comprehensive normalization, pronunciation UI, heteronym/contraction disambiguation, SSML/inline tag protocol, export features, language-aware voice memory, MediaSession, startup canary, content-addressed cache, formal registry. | gap | direct/static | Baseline; Gap Matrix | table | Included |
| E023 | [O][A][B][C][D] | O §4.1 | Cross-codebase text lessons: display/source/synthesis separation, deterministic IDs, non-destructive normalization, DOM/locator traversal, Abogen/Coqui/pdf-narrator/Readest evidence; Blurby planner strong but general normalizer weak. | consensus, project lesson | all sources | Cross-Codebase Findings | main narrative | Included |
| E024 | [O][A][B][C][D] | O §4.2-4.3 | Audio pipeline and streaming lessons: separate segmentation/synthesis/queue/cache/scheduler; capability-driven streaming, first fragment, shallow prefetch, buffered seconds, disabled Qwen infrastructure, optional quality swap. | overlapping, recommendation | [B] stronger MediaSource/fast-start; [D] preserves Web Audio | Cross-Codebase; Roadmap | divergence preserved | Included |
| E025 | [O][A][B][C][D] | O §4.4 | Playback control lessons: single controller/FSM, provider-specific pause/resume, Readest state patterns, Sioyek restart-line lesson, Ultimate process-reexec anti-pattern. | project lesson, avoid | all sources | Cross-Codebase; Avoid | main narrative | Included |
| E026 | [O][A][B][C][D] | O §4.5 | Sync lessons: native timings where proven, honest sentence/segment degradation, confidence/provenance, locator mapping, Kokoro/Readest/Sioyek/abogen/ttsreader evidence. | consensus + divergence | [A]/[D] stronger Kokoro; [B]/[C] conservative | Timing; Conflict Map | main narrative | Included |
| E027 | [O][A][B][C][D] | O §4.6 | Caching lessons: structured keys, content address index, timing JSON sidecar, ttsreader/Sioyek/abogen/Readest evidence; external projects weaker than Blurby in persistent live cache. | recommendation | direct/static plus external evidence | Cache Architecture | main narrative | Included |
| E028 | [O][A][B][C][D] | O §4.7 | Voice/model abstraction: capability maps, interchangeable engines, RealtimeTTS BaseEngine, Readest TTSClient, Coqui metadata, abogen formulas. | architecture, roadmap | all sources | Architecture; Engine Eval | consolidated | Included |
| E029 | [O][B][C][D] | O §4.8 | Long-form UX: section/chapter traversal, CFI/page/line locators, readable-node rejection, back-to-current, TTS bar, remaining time, media controls, resume position. | UX recommendation | [B]/[C] Readest emphasis; [D] selective adoption | Cross-Codebase; Roadmap | main narrative | Included |
| E030 | [O][A][B][C][D] | O §4.9 | Offline/packaging: small deterministic default, gated heavy models, licensing/TOS, avoid mandatory Python/Torch/CUDA installs, sidecar/worker patterns. | risk, avoid, recommendation | all sources | Engine Eval; Risk | consolidated | Included |
| E031 | [O][A][B][C][D] | O §5.1 | Abogen lessons: batch audiobook generator, deterministic chunk IDs, text-layer separation, Kokoro normalization, pronunciation store, heteronym overrides, voice formulas, export artifacts; avoid batch pipeline as live core. | project-specific, adopt/avoid | all sources | Project Lessons; Adopt/Avoid | distinct subsection | Included |
| E032 | [O][A][B][C][D] | O §5.2 | RealtimeTTS lessons: streaming orchestration, BaseEngine/TextToAudioStream/StreamPlayer, fallback list, callbacks, buffered-seconds logic, voice blending; avoid Python/PyAudio/mpv/threading runtime. | project-specific, adopt/avoid | all sources | Project Lessons; Engine Eval | distinct subsection | Included |
| E033 | [O][A][B][C][D] | O §5.3 | Readest lessons: reader TTS controller/client abstraction, Foliate traversal, SSML marks, MediaSession/UX, named pause, per-language voice memory; limitations include sentence granularity, audio scheduling, Edge/cloud dependencies. | project-specific, divergence | [B] broad adoption; [D] selective | Project Lessons; Conflict Map | distinct subsection | Included |
| E034 | [O][A][B][C][D] | O §5.4 | Coqui lessons: cleaners, model registry, license/TOS metadata, multilingual/multispeaker breadth; heavy Python/Torch, model licensing, weak interactive timing; reject as default runtime. | project-specific, avoid | all sources | Project Lessons; Engine Eval | distinct subsection | Included |
| E035 | [O][A][B][C][D] | O §5.5 | Sioyek lessons: PDF reader, page/line/char rectangles, coordinate spaces, alignment sidecars, fast-first/good-later; avoid platform TTS events and shell-heavy scripts as core. | project-specific, adopt/avoid | all sources | Project Lessons; Timing | distinct subsection | Included |
| E036 | [O][A][B][C][D] | O §5.6 | PDF Narrator lessons: GUI PDF/EPUB/TXT/HTML Kokoro converter, TOC extraction, OCR fallback, clean pipeline, remove_overlap; destructive normalization and batch orientation; adopt for PDF lane/fixtures only. | project-specific, adopt/avoid | all sources | Project Lessons; Gap Matrix | distinct subsection | Included |
| E037 | [O][A][B][C][D] | O §5.7 | ttsreader lessons: Web Speech wrapper, bug catalog, canary probe, voice scoring, content-hash prefetch; avoid Web Speech boundary truth and global mutable singletons. | project-specific, adopt/avoid | all sources | Project Lessons; Web Speech | distinct subsection | Included |
| E038 | [O][A][B][C][D] | O §5.8 | Ultimate TTS Reader: minimal Windows clipboard pyttsx3/SAPI word-event data point, global hotkey idea, process re-exec stop anti-pattern, otherwise no meaningful reuse. | negative evidence, avoid | all sources | Project Lessons; Negative Evidence | distinct subsection | Included |
| E039 | [O][A][B][C][D] | O §5.9 | Markor: no substantive TTS subsystem; feature request/discussion is not code evidence; do not treat as reusable design. | negative evidence | [D] confirmed absence; [B]/[C] issue-level | Project Lessons; Avoid | distinct subsection | Included |
| E040 | [O][A][B][C][D] | O §6.1 | Core architecture principles: segment-first, provider-agnostic, timing-aware, cache-safe, capability-driven UI/fallback, non-destructive text, preserve scheduler, gate experimental providers by evidence. | architecture | all sources | Recommended Architecture | main narrative | Included |
| E041 | [O][A][B][C][D] | O §6.2 | `TTSProvider` interface: initialize/preload/warmup, status/health, voices, synthesize job/segment, optional streaming frames/timing, stop/pause/resume, capabilities including streaming/timing/offline/network/sidecar/GPU/cacheable/experimental/language/rate/SSML/max chars/blending/package/license/TOS. | architecture | all sources | Recommended Architecture | interface table | Included |
| E042 | [O][A][B][C][D] | O §6.6 | `NarrationJob`: job ID, generation ID, segment, provider, voice/formula, rate/speed/pitch, bucket, override hash/version, cache key, queue state, cancellation, diagnostics; new generation ID on stop/seek/rate/voice/provider change. | architecture | [C] hard requirement; [D] typed map | Recommended Architecture | main narrative | Included |
| E043 | [O][A][B][C][D] | O §6.8-6.9 | `AudioCache` and `PlaybackScheduler` contracts: audio/timing/metadata/checksum, structured keys, schema migration, secondary index; scheduler preserves Web Audio, playhead, drift correction, buffered seconds, no PyAudio/mpv/pygame/HTML churn/platform loops. | architecture, avoid | [D] strongly defends scheduler; [B] MediaSource divergence | Architecture; Conflict Map | preserved divergence | Included |
| E044 | [O][A][B][C][D] | O §6.11-6.13 | `HighlightSyncController`, `NarrationDiagnostics`, `ExperimentalModelGate`: visual following modes, redacted report, provider selection/generation/cache/drift/fallback logs, promotion criteria and hidden experimental UI. | architecture | all sources | Architecture; Risk; Roadmap | main narrative | Included |
| E045 | [O][B][D] | O §6.14 | Runtime topology variants: preserve renderer/main/worker topology; consider MediaSource only if product needs continuous encoded stream and validation passes; do not replace Web Audio without evidence. | divergence, defer | [B] favors MediaSource; [D] Web Audio | Conflict Map; Architecture | flagged resolution | Included |
| E046 | [O][A][B][C][D] | O §7.1-7.6 | Timing policy: current Kokoro word timing through patched tensors, validation before use, fallback to heuristic/sentence/segment, Web Speech low-confidence, minimum truth metadata, future persisted store, evidence before replacing Kokoro. | consensus + conflict | source confidence varies | Timing Section | detailed section | Included |
| E047 | [O][A][B][C][D] | O §8.1-8.10 | Engine evaluations for Kokoro, Nano, Pocket, Qwen, Coqui, RealtimeTTS, Web Speech/native, Edge/cloud, Piper, aligned audio/PDF export workflows. | engine evaluation | all sources | Model and Engine Evaluation | table + commentary | Included |
| E048 | [O][A][B][C][D] | O §9.1-9.4 | Gap matrix: P1, P2, P3+, deferred/blocking items exactly preserved. | gap, roadmap | [D] richest; [O] controlling | Gap Matrix | table | Included |
| E049 | [O][A][B][C][D] | O §10.1-10.6 | Roadmap phases 0-5: validation; abstraction/segmentation/normalization; cache/scheduler; timing/highlight UX; model/provider expansion; production hardening with acceptance criteria. | roadmap | all sources | Roadmap | detailed section | Included |
| E050 | [O][A][B][C][D] | O §11.1-11.4 | Test strategy: unit, integration, golden/regression corpora, eval gates, soak, provider tests, cache tests, drift, CI artifacts, corpus diversity, thresholds. | test item | [D] richest; [B] broader corpus durations | Test Strategy | detailed section | Included |
| E051 | [O][A][B][C][D] | O §12 | Risks/open questions: runtime, product/UX, licensing/commercial, source-confidence, timing drift, patch maintenance, non-English, cache, provider, PDF, voice blending, diagnostics, long-form. | risk | all sources | Risk Register | table | Included |
| E052 | [O][A][B][C][D] | O §13 | Adopt/reject/defer decisions including all required adopt, avoid, defer items. | adopt/avoid/defer | all sources | Adopt/Avoid/Defer | decision table | Included |
| E053 | [O][A] | O §14.1; A entire report | Unique [A] contributions: classification legend, external repos as artifacts not better designs, direct static baseline, cache slash key risk, timing truth enum/capability fields, no runtime/live audio validation. | source-specific unique | direct/static, no runtime | Source Unique Contributions | distinct subsection | Included |
| E054 | [O][B] | O §14.2; B entire report | Unique [B] contributions: repo inaccessible caveat, [Blurby-assumed], broad Readest template adoption, sentence baseline, Kokoro sidecar/ONNX choices, MediaSource, quality swap, EPUB3/SMIL export, Edge/Piper/cloud/BYO options, one-day audit. | source-specific unique, methodological | assumed Blurby | Source Unique Contributions; Limitations | distinct subsection | Included |
| E055 | [O][C] | O §14.3; C entire report | Unique [C] contributions: audit-package caution, five hard requirements, provider-independent narration core, locator-first sync, timing separated from rendering, destructive normalization anti-pattern, `SegmentLocator` union, pause semantics. | source-specific unique | audit-package evidence | Source Unique Contributions | distinct subsection | Included |
| E056 | [O][D] | O §14.4; D entire report | Unique [D] contributions: v1.75.1 direct baseline, POSTV2-ENGINE-1/Desktop v2.0, best-in-cohort claim, exact constants/test counts/details, missing capabilities, rich gaps/interfaces/tests/roadmap/do-not-recommend list. | source-specific unique | direct/static, richest baseline | Source Unique Contributions | distinct subsection | Included |
| E057 | [O] | O overall | [O] contribution: exhaustive consolidation and anti-orphan control structure across consensus, divergence, baseline, projects, architecture, roadmap, tests, risk, source indices. | methodological | controlling outline | Methodology; Traceability | main narrative | Included |
| E058 | [O][A][B][C][D] | O §15 | Final target state: segment-first provider-agnostic timing-aware narrator; preserve Kokoro/Web Audio/word timing/progressive generation/cache/diagnostics; add registry, segment model, normalizer, cache hardening, timing store, highlight sync, gates; differentiator is truthful sync, not more engines. | synthesis | all sources | Conclusion | main narrative | Included |

---

# 2. Conflict and Divergence Map

| Issue | Sources | Nature of disagreement | Why it matters | Supported synthesis/resolution | Unresolved risk |
|---|---|---|---|---|---|
| Source-access confidence | [A][D] vs [B][C][O] | [A]/[D] claim direct/static code review; [B] did not retrieve Blurby and labels current claims [Blurby-assumed]; [C] relies on audit-package docs; [O] consolidates all. | Prevents false equivalence between direct code evidence and assumed architecture. | Treat [A]/[D] as highest-confidence current-state baselines, while preserving [B]/[C] caveats and using them for architecture/product suggestions. | Runtime validation still pending for [A]/[D] static claims. |
| Word-level vs sentence-level baseline | [A][D] vs [B][C] | [A]/[D] treat Kokoro word-level timing as current strength; [B]/[C] set sentence/segment deterministic scheduling as universal production baseline. | Overclaiming universal word timing would mislead UX and tests. | Keep Kokoro word mode where validated; require timing truth labels and degrade to sentence/segment for Nano/Pocket/Web Speech/unknown providers. | Non-English Kokoro timing and long-form drift need measured proof. |
| Readest adoption intensity | [B] vs [A][C][D] | [B] says Readest is near-drop-in/wholesale template; others recommend selective adoption. | Copying Readest's weaker scheduling/cloud dependencies could regress Blurby's stronger path. | Adopt controller/client, traversal, state, MediaSession/UX, mark ideas selectively; do not replace Web Audio scheduler or local Kokoro path without evidence. | Need focused spike before any foliate `tts.js` integration. |
| Web Speech reliability | [B] vs [A][D][C] | [B] calls Web Speech mandatory fallback and suggests broad desktop boundary availability; [A]/[D] emphasize boundary unreliability; [C] treats native/system as fallback. | Web Speech boundary events are not timing truth across platforms. | Keep Web Speech as final fallback/reach/fast-start candidate, with unreliable-boundary capability flag and canary probe. | Current Electron boundary matrix must be revalidated. |
| SSML internal representation | [B]/Readest sections vs [D] | [B] favors SSML marks heavily; [D] rejects SSML as internal segment payload. | Internal SSML can obscure typed cache/timing/normalizer metadata. | Use SSML/marks as provider/export artifacts; keep structured `DocumentSegment`/normalizer trace internally. | Adapter complexity if using foliate marks for EPUB. |
| Kokoro default vs validation | [A][B][D] vs [C] | All keep Kokoro, but [C] is cautious about precise word timing proof; [D] strongest direct confidence. | Default engine and timing baseline should not become unchecked dogma. | Keep Kokoro default/timing baseline; add regression, drift, non-English, patch-maintenance, packaging tests. | Live long-form and non-English validation remain. |
| Direct baseline vs assumed/audit claims | [A][D] vs [B][C] | Baseline details differ because access differed. | Prevents unsupported assumptions about current files or code state. | In final baseline, cite direct details to [A]/[D]; cite [B]/[C] for assumptions, product architecture, and caution. | Future source changes after v1.75.1 could alter baseline. |
| Provider expansion enthusiasm vs experimental gates | [B] more expansive; [A][C][D] more gated | [B] proposes Edge, Piper, cloud/BYO, MediaSource, ONNX migration; [D] says post-v2.0, gated, no stable-path disruption. | Provider expansion can destabilize working narration. | Put all expansion behind `ExperimentalModelGate`, opt-in descriptors, license/TOS metadata, benchmarks, and stable-path isolation. | Product priority for cloud/mobile/export unknown. |
| Current strengths vs gaps | [D]/[A] strong baseline; all identify gaps | [D] says no P0 and production-ready; all still call for registry, normalizer, cache/timing layers. | Avoid both complacency and unnecessary rewrite. | Preserve load-bearing core while adding typed abstractions, metadata, and tests. | Integration could regress core if not incremental. |
| External projects as donors vs replacements | [B] occasionally near-template; [A][C][D] donor-only | Some projects solve subproblems but have weaker runtime assumptions. | Replacement architectures may import anti-patterns. | Mine patterns by subsystem; reject runtime stacks and weaker scheduling. | Requires disciplined scope control in roadmap. |
| MediaSource vs Web Audio scheduler | [B] recommends one `<audio>`/MediaSource; [D]/[A] defend Web Audio | Different playback topology recommendation. | Scheduler is load-bearing; replacement is high-risk. | Preserve Web Audio. Consider MediaSource only after product need and validation. | MediaSource stability and cross-platform behavior unproven in Blurby. |
| PDF lane priority | [D] says weakest format lane; [C] says hardest structural problem; [B] has pdf-narrator adoption ideas | Priority depends on Desktop v2.0 roadmap. | PDF sync can consume large effort. | Add PDF fixtures and normalizer/extraction lessons when PDF lane is active; do not block core EPUB TTS. | PDF locator model remains hard. |

---

# 3. Unified Final Report Outline

1. Executive Summary
2. Purpose and Scope
3. Source Set and Methodology
4. Source Confidence and Evidence Limitations
5. Consolidated Thesis
6. Current Blurby Baseline
7. Cross-Codebase Findings
8. Project-by-Project Lessons
9. Recommended Architecture
10. Timing, Highlighting, and Synchronization
11. Model and Engine Evaluation
12. Gap Matrix
13. Roadmap
14. Test Strategy
15. Risk Register
16. Adopt / Avoid / Defer Decisions
17. Source-Specific Unique Contributions
18. Conclusion
19. Traceability Appendix
20. Final No-Orphan Audit

---

# 4. Comprehensive Integrated Research Report

## 4.1 Executive Summary

The integrated conclusion is stable across the five-source set: Blurby's TTS architecture should be preserved and evolved, not rewritten [O][A][B][C][D]. The strongest evidence for current-state preservation comes from [A] and [D], which directly/static-review Blurby's existing Kokoro worker path, Web Audio scheduler, progressive generation, Opus cache, diagnostics, timing validation, and experimental-engine gating. [B] reaches a similar phased-refactor conclusion but explicitly did not retrieve Blurby's repository, so its current-code claims remain [Blurby-assumed]. [C] also recommends incremental refactor, but its current-state evidence comes from audit-package documents rather than direct current source.

The strongest consensus points are: keep Kokoro as the default or timing baseline where validated; formalize provider capabilities; add deterministic segment identity; separate source/display/synthesis text; add a `SegmentNormalizer`; persist timing metadata separately from audio; keep the Web Audio scheduler as load-bearing infrastructure; and gate experimental providers by measured evidence [O][A][B][C][D].

The major divergences are not contradictions to erase; they are design constraints. [A] and [D] treat Kokoro word-level timing as a current strength. [B] and [C] set sentence/segment-level scheduling as the universal production baseline and warn against broad word-level promises. The synthesis is therefore: keep Kokoro word-level highlighting where timing is validated, but expose timing truth and degrade honestly to sentence or segment following for providers without validated timings [O][A][B][C][D].

Current Blurby strengths include worker-isolated Kokoro inference, patched word timestamps, fail-closed readiness, progressive chunk generation, planner-driven boundaries, Web Audio scheduling, Opus disk cache, renderer highlight integration, and evidence-based experimental posture for Nano, Pocket, and Qwen [A][D][O]. Current gaps include formal provider registry/capabilities, comprehensive text normalization, pronunciation override UI, durable segment IDs, timing metadata sidecars, content-addressed cache reuse, cache-key safety/migration, highlight fallback modes, diagnostics export, voice blending, MediaSession/per-language voice memory, and long-form soak coverage [O][A][B][C][D].

The recommended direction is evolutionary: wrap the existing path in typed abstractions, add metadata layers, harden cache identity, and expand providers only behind gates. External projects should be mined selectively: Readest for controller/traversal/state/UX patterns, RealtimeTTS for provider/fallback/queue ideas, Abogen for chunk identity/normalization/pronunciation/voice formulas/export concepts, Coqui for cleaner and license metadata patterns, Sioyek for coordinate/line/alignment lessons, pdf-narrator for PDF extraction/OCR/normalizer fixtures, ttsreader for Web Speech caveats/canary/content-hash lessons, and Ultimate/Markor mainly as negative evidence [O][A][B][C][D].

## 4.2 Purpose and Scope

This report synthesizes four Blurby TTS research/codebase reviews and one master exhaustive outline into a single source-traceable, non-duplicative research report. The purpose is to combine overlapping and non-overlapping findings, preserve unique contributions, preserve disagreements, convert the collective findings into architecture/roadmap/test/risk strategy, and ensure that no element from any report is orphaned [O].

The synthesis is topic-first, not report-by-report. Source labels [A], [B], [C], [D], and [O] are preserved throughout. [O] is treated as the controlling anti-orphan ledger, but it does not replace direct reading of [A]-[D].

## 4.3 Source Set and Methodology

[O] is the master exhaustive source-aware outline and anti-orphan inventory. It consolidates consensus, divergence, baseline, project lessons, architecture, roadmap, testing, risk, decision, and source-specific contribution structures [O].

[A] is a direct static/codebase review. It treats Blurby as the baseline, reviews external repositories as source artifacts rather than replacement architectures, classifies findings as already implemented well, weaker, partially implemented, missing, not applicable, or should avoid, and explicitly notes no runtime benchmark or live audio validation was performed [A].

[A] also preserves a relationship-classification method that should remain visible when converting findings into implementation priorities: text segmentation/normalization is partially implemented; audio generation is already implemented well for live Kokoro and partially implemented for provider-neutral orchestration; streaming is partially implemented and intentionally gated; playback control is already implemented well for audio control and partially implemented for reader UX; synchronization is already implemented well for Kokoro and partially implemented for non-Kokoro providers; cache is already implemented well overall but weaker for key hygiene; voice/model abstraction is implemented but weaker than reviewed patterns; long-form UX is partially implemented; offline packaging is already implemented for Kokoro/Nano but missing a formal provider packaging manifest; and error/observability is partially implemented but should become provider-neutral [A].

[B] is the Compass/assumed-Blurby review. It did not retrieve the primary Blurby repo and labels current-Blurby claims as [Blurby-assumed]. It gives the strongest Readest-as-template recommendation, treats sentence-level sync as the safer production baseline, and includes broader product-engine suggestions: Kokoro sidecar/ONNX choices, MediaSource, two-engine quality swap, EPUB3 Media Overlay export, Edge/Piper/cloud/BYO provider options, and a one-day audit gate [B].

[C] is the deep research report. It relies on attached audit-package documents rather than direct current source. It emphasizes segment-first/provider-agnostic architecture, deterministic sentence/segment baseline, timing metadata separated from rendering, locator-first sync, and caution around precise Kokoro word-level promises [C].

[C] further notes two source-confidence limits that must not be lost: current Blurby source was not directly attached in that turn, and Markor/Sioyek issue or discussion pages were not substantively analyzed as local text. Those caveats narrow [C]'s current-state authority while preserving its architecture and evidence-discipline value [C].

[D] is the Cowork/direct v1.75.1 review. It provides the most detailed direct-code baseline, covers Blurby v1.75.1, POSTV2-ENGINE-1, Desktop v2.0 conveyor status, and supplies the richest gap matrix, interfaces, tests, roadmap, risks, and do-not-recommend list. It most strongly asserts Blurby is best-in-cohort for live long-form narration [D].

## 4.4 Source Confidence and Evidence Limitations

Direct/static current Blurby evidence comes from [A] and especially [D]. Static review is still not runtime proof: long-form drift, live audio quality, non-English timing, packaged-app behavior, and low-end performance remain validation items [A][D].

Assumed evidence comes from [B]. Its current-Blurby claims are explicitly [Blurby-assumed] and must not be treated as equivalent to [A]/[D]. Its strongest value is architectural/product synthesis and file-grounded external-codebase review [B].

Audit-package evidence comes from [C]. It provides useful architecture conclusions but cannot prove current source state where direct code was not inspected in that report [C].

Consolidated outline evidence comes from [O]. [O] is authoritative as an anti-orphan control structure, not as a replacement for the four underlying reports [O].

No source file was unreadable. No missing-file caveat applies.

## 4.5 Consolidated Thesis

Blurby should not rewrite its TTS system. The current Kokoro/Web Audio/generation/cache/highlight/eval foundation should remain load-bearing [O][A][C][D]. The work ahead is to add explicit contracts and metadata layers: `TTSProvider`, `ProviderCapabilities`, `TTSProviderRegistry`, `NarrationSegment`/`DocumentSegment`, `SegmentNormalizer`, `NarrationJob`, `AudioGenerationQueue`, hardened `AudioCache`, `TimingMetadataStore`, `HighlightSyncController`, `NarrationDiagnostics`, and `ExperimentalModelGate` [O][A][B][C][D].

Kokoro remains the default/current primary and timing baseline where validated. That does not imply universal word-level promises. Timing truth must be declared per provider and per generated artifact; word-native, word-derived, sentence, segment, estimated, and none should be distinguishable states [O][A][B][C][D].

The differentiator is truthful synchronized reading, not a large provider list. Stable document segments, typed audio/timing sidecars, provider capability truth, cache identity discipline, graceful fallback, and diagnostics are more important than adding engines prematurely [O][C][D].

[C] defines five hard requirements for this provider-independent narration core: deterministic segment IDs; cache keys that include normalization, provider, and model versions; cancel-safe generation IDs; queue-based scheduling with explicit prefetch depth; and a timing metadata contract separated from rendering [C][O].

## 4.6 Current Blurby Baseline

### Provider and Model Abstraction

Blurby already has a `TtsEngine` union and strategy modules for Web/system, Kokoro, Qwen, Nano, and Pocket TTS, with a `TtsStrategy`-like surface and engine selection largely coordinated from `useNarration` [O][A][D]. This is a real boundary, not a monolith. The gap is that capabilities, readiness, health, lifecycle, settings, fallback policies, timing truth, packaging status, and license metadata are distributed rather than centralized in a first-class provider registry [O][A][D].

The evolution should wrap rather than replace the existing strategies: formal `TTSProvider`, provider capabilities, registry resolution, fallback order, UI selection/status, and timing-truth-driven highlight behavior [O][A][B][C][D].

### Kokoro Integration

[A] and [D] describe a mature local Kokoro path: `kokoro-js`/ONNX pipeline, worker-thread inference, q4 quantized ONNX, 24 kHz mono, 28 voices, `af_bella` default, packaged-module resolution across asar boundaries, warm-up/preflight readiness, fail-closed distinction between informational model-loaded and actual model-ready, idle unload after five minutes, crash retry/backoff, patched duration tensor/word timestamp path, and zero-copy Float32Array transfer [A][D][O].

This is a current strength and should remain default/timing baseline. Risks are patch maintenance against upstream `kokoro-js`, timing drift, non-English reliability, single-voice-at-a-time limitations, lack of voice blending, and weaker heteronym/contraction handling than Python Kokoro/Coqui text front-ends [O][A][D].

[D] adds implementation constants and file-evidence details that matter for sprint specs: `kokoro-js@^1.2.1` and `onnxruntime-node@1.24.3`; crash retry capped at two retries with `1000ms * n` backoff; Qwen stall detection at `TTS_STREAM_STALL_TIMEOUT_MS=8000ms`; progressive generation from 13-word cold chunks to 148-word cruise chunks via `TTS_COLD_START_CHUNK_WORDS` and `TTS_CRUISE_CHUNK_WORDS`; scheduler crossfade at `TTS_CROSSFADE_MS=8`; cache cap at `TTS_CACHE_MAX_MB=2000`; cache manifest fields including `chunks`, `totalBytes`, and `lastNarrated`; and `getOpeningCoverageMs` for warm-cache UX [D].

### MOSS Nano

MOSS Nano is an opt-in sidecar path with lifecycle/readiness gates, real ONNX sidecar validation, owner-token/lifecycle protection, segment-following only, and `wordTimestamps:null`. It does not fabricate word timing and should remain non-default until timing parity, licensing, packaging, and promotion gates pass [O][A][D]. Large PCM-over-IPC concerns and model/commercial license clarity remain risks [O][A][D].

### Pocket TTS

Pocket TTS exists as an opt-in sidecar/engine wrapper with renderer strategy and reference catalog shape, but the real adapter is not configured/production-ready, no word timing exists, and voice-cloning/license posture needs care. It should remain disabled or opt-in until a real adapter and provider gates pass [O][A][D].

### Qwen Streaming

Qwen is disabled at selectable-engine and IPC runtime boundaries per POSTV2-ENGINE-1. Its historical infrastructure is valuable: binary-framed PCM protocol with 4-byte little-endian length prefix plus type/payload, JSON control plane, monotonic frame parsing, stall detection, cancellation guards, crash recovery, stream-finished forwarding, and CUDA/CPU timeout buckets [O][A][D]. Live CUDA validation and timing metadata are unproven. Keep Qwen disabled, but do not delete the reusable sidecar protocol [O][A][D].

### Experimental Model Gating

Blurby already has settings/profile/runtime gates, engine status sections, and disabled Qwen runtime responses. The gap is formalization: `ExperimentalModelGate` should centralize readiness, timing, memory, startup latency, crash rate, packaging, license, UI visibility, and promotion criteria for MOSS Nano, Pocket TTS, Qwen, Coqui/Python sidecars, Edge/Piper/cloud/BYO providers [O][A][B][C][D].

### Text Segmentation

Blurby uses `Intl.Segmenter`, abbreviation-aware sentence boundaries, rolling narration planner, progressive opening ramp, sentence snapping, boundary classification, dialogue-aware pause tuning, a 400-word forward window, and min chunk sizing [O][A][D]. This is stronger than regex-only splitters and should remain. The gap is stable segment IDs with structural metadata and source/display/synthesis separation [O][A][B][C][D].

### Text Normalization

Blurby has pronunciation override hooks and override hash participation in cache identity, but general normalization is minimal [O][A][D]. Missing items include currency, time, date, abbreviation tables, NFKC, ligature handling, ordinal/cardinal disambiguation, heteronym/contraction disambiguation, URLs, initials, citations, and comprehensive fixtures [O][D]. `SegmentNormalizer` is the biggest quality-lift gap and should be pure, non-destructive, versioned, provider-agnostic with optional provider final pass, English-first but locale-aware [O][A][B][C][D].

### Audio Generation

The generation pipeline coordinates IPC to Kokoro, progressive cold/cruise chunk sizing, planner-aware boundary handling, silence injection, stale output guards, and non-blocking generation [O][A][D]. The evolution is `AudioGenerationQueue`: rolling queue, cache-first generation, shallow prefetch, generation IDs for cancellation, buffered-seconds budget, and stop generation during long pauses [O][A][B][C][D].

### Audio Caching

Blurby has persistent Opus disk cache, manifest tracking, LRU eviction, opening coverage, background cache builder, rate-bucket and override-hash identity, orphan/zero-byte/corruption cleanup, and a 2GB cap in [D] [O][A][D]. It is stronger than most reviewed external caches. Risks include composite key/slash-splitting corruption noted in [A], lack of content-addressed secondary reuse for identical normalized text across books, schema/migration needs, timing sidecars, and possible manifest scaling [O][A][C][D].

### Playback Scheduling

Blurby's Web Audio scheduler uses AudioContext time as source of truth, pre-scheduled `AudioBufferSourceNode`s, gapless playback, 8 ms crossfade, RAF word timer, sliding boundary prune, epoch tokens against stale callbacks, tempo stretch and future chunk rebuilds on rate change [O][A][D]. It is best-in-cohort relative to HTML audio churn, PyAudio/mpv/pygame, and platform TTS loops [A][D]. It should not be rewritten. Provider-neutral wrappers and timing confidence should be added around it [O][A][D].

### Timing Metadata

Kokoro word timestamps flow through patched duration tensors and IPC into scheduler validation. Scheduler validates count, finite values, monotonicity, correspondence, overshoot, zero duration, and fallback behavior [O][A][D]. The gap is durable `TimingMetadataStore` with provenance, confidence, drift validation, provider/model/normalizer versions, timing truth levels, and sentence/word separation [O][A][B][C][D].

### Highlight Synchronization

Blurby maps Foliate word offsets/spans into rendered text, uses scheduler truth-sync, distinguishes canonical audio cursor from visual cursor, and has cursor lag/boundary-sync contamination prevention where supported [O][A][D]. The evolution is `HighlightSyncController` owning word/sentence/segment/off modes, mapping timing spans to document ranges, and degrading gracefully when timing confidence is low [O][A][B][C][D].

### Pause, Resume, and Seek

Current behavior includes AudioContext suspend/resume, stop epochs, resume anchors, and provider strategy pause/resume surfaces [O][A][D]. A formal segment-level seek contract is needed. Pause/resume must be capability-driven: true in-place resume only where supported; otherwise pause at safe boundary or replay current segment from stable mark [O][C].

### Settings and UI Controls

Current UI has per-engine settings/status, voice, WPM/rate, pause, cache, profile, and footnote-related controls where supported [O][A][D]. Missing or deferred surfaces include pronunciation UI/store, voice formula/blend UI, per-engine-per-language voice memory, MediaSession, diagnostics panel, and explicit timing-confidence UI [O][B][D].

### Error Handling, Logging, Diagnostics

Existing strengths include engine status snapshots, IPC error normalization, worker retry/backoff, renderer fallback, sidecar lifecycle, narrate diagnostics, perf/eval traces, and decision docs [O][A][D]. `NarrationDiagnostics` should make these provider-neutral and user-report-friendly: generation IDs, provider selection, queue state, cache events, drift, fallback reasons, redacted export [O][A][C][D].

### Tests

Existing coverage is strong for scheduler, planner, Kokoro strategy, timing, Nano/Pocket, Qwen hardening, eval traces, caching hooks, and rate continuity [O][A][D]. Gaps include provider registry, golden segmentation/normalization, normalizer fixtures, content-addressed cache, cache key migration, drift regression, invalid timing fallback, voice formula parser, experimental gate, PDF fixtures, long-form soak, and provider-specific tests [O][A][B][C][D].

## 4.7 Cross-Codebase Findings

### Text Segmentation and Normalization

The common lesson is to preserve three text layers: visible/display text, original/source extracted text, and normalized synthesis text [O][A][C]. Abogen provides deterministic chunk IDs and text-layer separation; Coqui provides cleaners and number/currency/time/date/abbreviation patterns; pdf-narrator provides NFKC/ligature/TOC overlap/OCR-oriented normalization but is too destructive for live highlighting; Readest/Foliate provides locator-aware traversal and marks; Blurby already has a strong planner but lacks comprehensive general normalization [O][A][B][C][D].

[B] is more specific about the pdf-narrator lift: port `clean_pipeline` plus `remove_overlap` to TypeScript, including NFKC normalization, wrapped-line joining, abbreviation and initial expansion, number-to-words conversion, sentence-end punctuation injection, artifact stripping, and final whitespace collapse. [B] estimates this as roughly 200-300 LOC. The same source explicitly rejects pdf-narrator's `s/;/,/g` and "add period to long fragments" mutations for Blurby because they corrupt prosody and break display-to-synthesis alignment. For non-Foliate/PDF cases, [B] suggests `wink-nlp` or `sbd`, not bare regex splitting [B].

[B] uniquely claims that foliate-js's `tts.js` module, which emits SSML with `<mark>` boundaries from `Intl.Segmenter`-walked DOM ranges, "eliminates ~80% of the segmentation work" for EPUB documents and provides cross-iframe sentence walking. [A]/[D] recommend investigating Foliate `tts.js`/`textWalker` but do not necessarily advocate replacing current Blurby internals. This claim remains unvalidated against current Blurby source [B].

### Audio Generation Pipeline

Best practice separates segmentation, provider synthesis, queueing, cache lookup, and playback scheduling [O][A][C]. RealtimeTTS demonstrates provider/queue/fallback concepts; abogen and pdf-narrator show batch extraction/generation/export; Blurby already has stronger live progressive generation and should add provider-neutral orchestration without replacing its scheduler [O][A][D].

### Streaming and Latency

Streaming should be capability-driven. Useful patterns include sentence-fragment-first generation, buffered-seconds prefetch, shallow 2-4 segment pre-generation, disabled-but-reusable Qwen framing, and optional fast-start/quality-swap where Web Speech starts immediately and Kokoro replaces on a boundary [O][B][C][D]. However, [D] does not support destabilizing the current stable path for speculative streaming. Qwen remains disabled pending live validation [O][A][D].

### Playback Control

A single controller/state machine should own playback, provider lifecycle, queue, and visual sync [O][B][C][D]. Readest's named pause states and TTS control UX are useful. Sioyek's restart-line workaround and Ultimate TTS Reader's process re-exec stop are anti-patterns. Provider pause/resume must be capability-dependent [O][C][D].

### Text/Audio Synchronization

Synchronization must be honest. Use provider-native timings where proven, locator mappings always, timing confidence/provenance, and fallback to sentence/segment where needed [O][A][B][C][D]. Kokoro word timing is a current Blurby strength per [A]/[D]; Readest marks are a sentence-level reference; Sioyek alignment sidecars are future enhanced-sync/export ideas; abogen subtitles inform export/fallback; ttsreader warns against trusting Web Speech boundaries [O][A][B][C][D].

### Caching and Reuse

Blurby's existing persistent Opus cache is stronger than most donors. External lessons add content hashing, structured keys, timing JSON sidecars, and audio/alignment sidecars [O][A][C][D]. The integrated target is a structured cache with audio file/blob, timing JSON, metadata JSON, checksum, schema version, migration, corruption recovery, and secondary content-addressed index [O][A][C][D].

### Voice and Model Abstraction

RealtimeTTS and Readest support a small provider/client interface; Coqui and abogen contribute model/voice metadata and voice formula lessons. Blurby should expose capabilities rather than assuming providers support word timing, streaming, pause, seek, SSML, offline operation, GPU, sidecar, cacheability, or voice blending [O][A][B][C][D].

### Long-Form Reading UX

Long-form narration is not just synthesis. It requires section/chapter traversal, CFI/page/line/locator mapping, rejection of non-readable nodes, back-to-current controls, persistent TTS bar, remaining time, media controls, resume position, and section-aware prefetch [O][B][C][D]. Adopt selectively without regressing current core.

### Offline and Packaging

The default runtime should remain small, deterministic, offline, and supportable. Heavy Python/Torch/CUDA stacks should be opt-in or research-only, with explicit license/TOS and packaging gates [O][A][B][C][D]. Avoid mandatory PyTorch, broad Python peer installs, and cloud services as offline core.

[B] distinguishes two Kokoro out-of-process options: a Python sidecar spawned by Electron main using FastAPI/WebSocket over localhost, modeled on Kokoro-FastAPI, and `kokoro-onnx` with `onnxruntime-node` inside a Node worker. [B] prefers `onnxruntime-node` long-term because it avoids a second runtime and eases code signing, but treats the frozen Python sidecar as faster to ship. This is preserved as [B]'s product-engine option, not adopted over [A]/[D]'s current working Kokoro path without validation [B].

### Error Handling and Observability

Expected aborts, stale generations, sidecar crashes, hidden fallbacks, queue state, drift correction, and provider health need structured events and exportable diagnostics [O][A][C][D]. Diagnostics are part of the architecture, not console clutter.

## 4.8 Project-by-Project Lessons

| Project | Purpose and reviewed features | Strengths to adopt | Weaknesses / avoid | Roadmap impact |
|---|---|---|---|---|
| Abogen | EPUB/audiobook batch generator using Kokoro; chunking, normalization, pronunciation, voice formulas, export artifacts. | Deterministic chunk IDs; raw/display/normalized separation; Kokoro normalization; pronunciation store; heteronym overrides; voice formulas; M4B/SRT/ASS/EPUB3/SMIL export concepts. | Batch pipeline is not a live narration core; hardcoded CPU blend fallback; export flow is future feature, not architecture replacement. | P1 normalizer/pronunciation; P2 voice formulas; P3+ export. |
| RealtimeTTS | Streaming orchestration library with BaseEngine, TextToAudioStream, StreamPlayer, fallback engines, callbacks, buffered logic. | Provider contract; queue/backpressure; fallback list; callbacks; voice blend parser; lazy engine concepts. | Python/PyAudio/mpv/threading runtime; busy-wait pauses; not an Electron dependency. | Reimplement concepts in TypeScript. |
| Readest | Cross-platform ebook reader with TTS controller/client, Foliate traversal, marks, state, UX. | Controller/client abstraction; section traversal; mark mapping; named pause states; MediaSession; per-engine-per-language voice memory; back-to-current/time UI. | Sentence-only granularity; synthetic/HTML audio scheduling; Edge/cloud dependencies; reverse-engineered token risk. | Selective UX/controller/traversal adoption. |
| Coqui TTS | Large Python TTS toolkit with cleaners, model registry, model metadata. | Cleaners; language/model metadata; license/TOS patterns; multilingual awareness. | Heavy Python/Torch runtime; model-specific license risk; XTTS CPML/non-commercial in [B]/[D]; weak interactive timing. | Donor only; reject default runtime. |
| Sioyek | Research PDF reader with native TTS and scripts. | Coordinate-space discipline; page/line/char rectangles; line following; alignment sidecars; fast-first/good-later concept. | Platform TTS events as primary truth; restart-line resume; shell-heavy scripts. | Future PDF/enhanced-sync/export patterns. |
| PDF Narrator | GUI PDF/EPUB/TXT/HTML to Kokoro audiobook converter. | TOC extraction; OCR fallback; clean pipeline; remove_overlap; PDF fixtures. | Destructive normalization; batch/blocking orientation; no live sync/cache rigor. | PDF lane and normalizer fixtures. |
| ttsreader | Browser/Web Speech wrapper with optional server TTS. | Web Speech bug catalog; canary probe; voice scoring; content-hash prefetch. | Web Speech boundaries unreliable; global mutable singleton patterns; hobby-grade structure. | Web Speech fallback diagnostics; silent canary; content-address idea. |
| Ultimate TTS Reader | Minimal Windows clipboard pyttsx3/SAPI reader. | SAPI/pyttsx3 word-event data point; global hotkey concept. | Process re-exec to stop; abandoned/minimal; no architecture reuse. | Negative evidence; optional hotkey P3+. |
| Markor | Android markdown/notes editor. | No substantive TTS implementation found. | Feature request/discussion is not code evidence; do not mine as implementation. | Negative evidence; no roadmap lift. |

> **Full project details:** Per-project reviewed file lists, specific features, anti-patterns with technical detail, and roadmap impact are preserved in the [Project Detail Appendix](Blurby_TTS_Project_Detail_Appendix_2026-05-11.md).

## 4.9 Recommended Architecture

Core principles: segment-first, provider-agnostic, timing-aware, cache-safe, capability-driven UI/fallback, non-destructive text handling, preserved Web Audio scheduler, and experimental providers gated by evidence [O][A][B][C][D].

`TTSProvider` should initialize/preload/warm up, report status/health, list voices, synthesize a segment/job, optionally stream frames, emit timing metadata if supported, stop/pause/resume if supported, and declare capabilities: streaming, timing tier, native pause/resume, seek, offline/network, sidecar, GPU, cacheable, experimental, languages, sample rate, rate range, SSML support, max utterance chars, voice blending, packaging status, license, and TOS [O][A][B][C][D].

`TTSProviderRegistry` should register providers, list/filter, resolve provider for a request, resolve fallback order, enforce capability requirements, hide experimental providers unless allowed, drive UI selection/status, and degrade highlighting based on timing truth [O][A][B][C][D].

`DocumentSegmenter`/`NarrationSegment`/`DocumentSegment` should consume EPUB/PDF/flat text, reject non-readable nodes, emit stable segment objects, preserve source/display/synthesis text, locators, offsets, structural roles, and deterministic IDs from document location plus local ordinal [O][A][B][C][D].

`SegmentNormalizer` should be a pure, non-destructive, versioned, provider-agnostic function with optional provider final pass, applying pronunciation overrides and returning normalized text plus trace/hash. `normalizerVersion` must enter cache identity [O][A][B][C][D].

`NarrationJob` should carry job/generation ID, segment, provider, voice/formula, rate/speed/pitch, generation bucket, override hash/version, cache key, queue state, cancellation signal, and diagnostics channel. Stop/seek/rate/voice/provider changes create a new generation ID [O][C][D].

`AudioGenerationQueue` should keep a rolling prefetch window, prefer cache hits, cancel stale generation, support shallow speculative warmup, gate on buffered seconds, and avoid burning CPU during long pauses [O][A][B][C][D].

`AudioCache` should store audio, timing JSON sidecar, metadata JSON, checksum, structured key components, schema version/migration, corruption recovery, growth controls, and secondary content-addressed index [O][A][C][D].

`PlaybackScheduler` should preserve the current Web Audio scheduler and expose start/stop/pause/resume, playhead, segment boundaries, scheduler events, drift correction, and buffered seconds. It should not be replaced by PyAudio, mpv, pygame, HTML audio churn, or platform TTS event loops [O][A][D].

`TimingMetadataStore` should put/get timings by segment, find segment/word at absolute ms, store sentence and word timings separately, and store provenance, confidence, drift, provider version, model version, and normalizer version. Timing truth levels: word-native, word-derived, sentence, segment, estimated, none [O][A][B][C][D].

`HighlightSyncController` should own visual following, attach/detach to scheduler and timing store, support word/sentence/segment/off modes, map timing spans to document ranges, and degrade gracefully [O][A][B][C][D].

`NarrationDiagnostics` should log namespaced events, spans, provider selection, generation IDs, queue state, cache events, drift, fallback reasons, and export redacted reports [O][A][C][D].

`ExperimentalModelGate` should surface and enforce criteria for MOSS Nano, Pocket, Qwen, Coqui/Python sidecars, Edge/Piper/cloud providers: health, readiness, timing truth, memory, startup latency, crash rate, packaging, license/TOS, and explicit opt-in [O][A][B][C][D].

Runtime topology should preserve the stable renderer/main/worker topology. MediaSource may be considered only if a continuous encoded stream architecture becomes a product need and validation passes. It should not displace the current Web Audio scheduler without evidence [O][B][D].

[B]'s alternative MediaSource topology is a persistent renderer-owned `<audio>` element backed by `MediaSource` and `SourceBuffer`, with chunks appended per sentence, `<audio>.currentTime` used for drift reconciliation on `timeupdate`, and seek-to-segment implemented by computing SourceBuffer offsets or by starting a new MediaSource session for cached segments. [B] pairs this with SHA-256 content keys, Opus encoding, and a possible `fluent-ffmpeg` sidecar. The integrated recommendation does not adopt this over [D]'s current Web Audio scheduler, but preserves it as a validation-gated alternative [B][D].

> **Full interface definitions:** The complete field-level interface specifications from all four sources, including `SegmentLocator` union, normalizer pipeline stages, cache key formula, and runtime topology variants, are preserved in the [Architecture Detail Appendix](Blurby_TTS_Architecture_Detail_Appendix_2026-05-11.md).

## 4.10 Timing, Highlighting, and Synchronization

Current acceptable behavior: Kokoro can use native real word timestamps through patched duration tensors where supported; scheduler validates them before use; invalid/missing timestamps fall back to heuristic; Nano/Pocket remain segment-following; Web Speech fallback is low-confidence; highlighting maps document word offsets/spans to rendered text [O][A][D].

Minimum production behavior: every scheduled chunk references a stable `segmentId`; every timing record declares timing truth, provider ID, provider/model version, normalizer version, duration, and drift validation; missing/invalid word timing degrades to sentence/segment; pause/resume/seek are tested by provider capability [O][A][B][C][D].

Preferred future behavior: persist timing metadata keyed by segment/provider/voice/rate/normalizer/override/text hash; use native word timing only when drift checks pass; let `HighlightSyncController` choose mode; add drift diagnostics, boundary snapping, and silence-aware cursor hold where supported [O][A][B][C][D].

Segment IDs and offsets should include EPUB CFI, section index, paragraph ID, sentence/segment ordinal; PDF page index, text-layer node path, char offsets, line rectangles/coordinate spaces; flat text character offsets; and raw/display/source/synthesis text [O][C].

[C] specifically highlights Readest-style PDF reject filters that exclude annotations, canvases, `<br>` noise, decorative footnote markers, and split-span artifacts from narration. PDF locators should include page index, text-layer node path, character offsets, and, where needed, line rectangles or coordinate-space data [C].

`SegmentLocator` should be treated as a typed union rather than a generic string: EPUB locator via CFI and section path; PDF locator via page index, text-layer node path, character offsets, and optional line rectangles; flat-text locator via character offsets [C][O].

Fallback when precise timing is unavailable: default to sentence or segment mode. Estimated word mode is allowed only if clearly labeled low-confidence; estimated timing must never be presented as truth [O][B][C][D].

Evidence required before replacing Kokoro timing includes long-form live runs with bounded drift, first-audio p95 at/below Kokoro baseline unless quality justifies otherwise, timing monotonicity tests, pause/resume/seek regression, memory/CPU/GPU packaged profile, cache reproducibility across restart, correct highlights across reader modes, and long-form soak tests [O][A][B][C][D].

[C] sets additional synchronization evidence thresholds before replacing the current approach: median word-level highlight error under roughly 150 ms, low segment-boundary miss rate, stable pause/resume/seek semantics under rapid interaction, no stale playback after repeated rate or voice changes, and deterministic cache reuse across sessions [C].

## 4.11 Model and Engine Evaluation

| Engine/category | Evaluation | Recommendation |
|---|---|---|
| Kokoro | Offline, integrated, cacheable, CPU viable, word-timed through patch, current/default/timing baseline; risks include patch maintenance, timing drift, non-English reliability, voice blending compatibility. | Keep default and regression-test [O][A][B][C][D]. |
| MOSS Nano | Complementary opt-in local engine, segment-only, IPC/licensing concerns, no word timing. | Keep opt-in/non-default; no promotion until gates pass [O][A][D]. |
| Pocket TTS | Experimental scaffold/opt-in wrapper, real adapter missing/not production, no timing, license/voice cloning concerns. | Keep disabled/opt-in until adapter and gates pass [O][A][D]. |
| Qwen streaming | Deferred GPU/streaming engine with reusable binary frame protocol; live CUDA/timing unproven. | Keep disabled; retain infrastructure [O][A][D]. |
| Coqui/XTTS | Valuable cleaners/model registry/license metadata; heavy Python/Torch, model-specific licenses, weak interactive timing. | Reject as default runtime; optional sidecar/research only [O][A][B][C][D]. |
| RealtimeTTS | Strong provider/queue/fallback concept; Python/PyAudio/runtime risks. | Architecture reference only; reimplement in TypeScript [O][A][B][C][D]. |
| Web Speech/system/native | Low install cost/reach; boundary events unreliable; pause/resume inconsistent. | Fallback/reach/fast-start candidate only with unreliable-boundary flag/canary [O][A][B][C][D]. |
| Edge/cloud/BYO | High-quality voices, remote/network/auth/ToS risks. | Optional opt-in provider, not offline core [O][B][D]. |
| OpenAI/ElevenLabs/Azure and other cloud APIs | Highest-quality or specialized remote voices may be useful for power users, but they introduce paid API, privacy, network, auth, and provider-specific timing constraints. | Optional BYO-key providers only; never default/offline core [B][O]. |
| Piper/lightweight local | Lightweight ONNX/MIT possibilities, usually no native word timings, variable quality. | Consider Phase 4 optional secondary if gates pass [O][B][D]. |
| Sioyek alignment/PDF export | Useful for forced alignment, audiobook export, PDF line following; not default live narration. | Defer to enhanced-sync/export modes [O][B][C][D]. |

## 4.12 Gap Matrix

| Priority | Items |
|---|---|
| P1 / High | `SegmentNormalizer`; pronunciation override UI/store; formal `TTSProvider`/registry; deterministic segment IDs; source/display/normalized records; provider capability metadata; golden segmentation/normalization fixtures; cache key encoding/safety and migration; timing metadata groundwork. |
| P2 / Medium | Content-addressed cache index; buffered-seconds backpressure; silent canary probe; voice blending/formula parser; `ExperimentalModelGate`; timing/confidence store and highlight fallback modes; drift diagnostics; PDF extraction/normalization fixtures if active; voice asset prefetch idempotency. |
| P3+ / Optional | Per-engine-per-language voice memory; MediaSession; named pause reasons; adaptive cursor lag; M4B/SRT/ASS/EPUB3/SMIL export; global hotkey/clipboard narration; cloud/BYO API providers; Piper/lightweight local alternatives; forced alignment/Whisper alignment. |
| Deferred/blocking | Qwen promotion; MOSS Nano default promotion; Pocket production mode; Coqui sidecar/runtime; non-Kokoro word timing claims; universal word-level highlighting. |

[D] specifically notes that the gap matrix contains **no P0 (critical/blocking) items**. Blurby's TTS is assessed as production-ready today; all recommendations are P1 (high priority) or lower. This framing indicates that the work is evolutionary enhancement, not critical remediation [D].

## 4.13 Roadmap

Phase 0 - Findings and validation: convert findings into sprint issues/specs; validate disputed assumptions/current source; confirm priorities; rerun current TTS tests; benchmark current pipeline; catalog segmentation/caching/playback/sync; make no behavior changes. Exit: sprint queue/specs, baseline ambiguity closed, measurable documented behavior [O][A][B][C][D]. [B] requires a one-day code audit of the actual Blurby repository as a prerequisite before any architecture work, because [B]'s current-Blurby claims are [Blurby-assumed] and must be replaced with verified ones. This audit must precede commitment to the Phase 1–5 timeline [B].

Phase 1 - Core abstraction, segmentation, normalization: add/rename `TTSProvider`, `ProviderCapabilities`, `TTSProviderRegistry`, `NarrationSegment`/`DocumentSegment`, `SegmentNormalizer`, pronunciation override integration, `normalizerVersion` in cache identity; preserve Kokoro behavior; add registry/golden fixtures. Acceptance: UI queries capabilities, deterministic segment IDs, Kokoro tests pass [O][A][B][C][D].

Phase 2 - Cache and playback scheduler/infrastructure polish: harden cache identity/key encoding, schema/migration, include segment/provider/model/normalizer/voice/rate/override identities, add content-addressed index, `getBufferedSeconds`, generation backpressure, silent canary, and scheduler regression protection. Acceptance: old cache readable or safely invalidated, no composite-key corruption, no scheduler regression [O][A][D].

Phase 3 - Timing and highlighting correctness/UX: add `TimingMetadataStore`, timing truth/confidence/provenance, `HighlightSyncController`, word/sentence/segment modes, drift diagnostics, seek-within-segment where feasible, selective Readest controls. Acceptance: Kokoro word-followed, Nano/Pocket segment-followed, invalid timing never produces fake word highlights [O][A][B][C][D].

If EPUB3 Media Overlay / SMIL export is implemented in this phase or later, [B] requires production output to pass EPUB3 validation with `epubcheck` before it is considered release-ready. Export should remain a product-goal feature, not a dependency of the live narration core [B][O].

Phase 4 - Model/provider expansion and user-visible features: harden KokoroProvider, add voice formula parser/tensor blend and bounded tensor LRU, `ExperimentalModelGate` criteria UI, license-aware descriptors, optional Edge/Piper/cloud/BYO behind opt-in, keep Qwen disabled unless gates pass. Acceptance: voice formula persists and audibly blends, criteria surfaced, expansion cannot affect stable path [O][B][D].

[D] gives a concrete Phase 4 acceptance example that should survive into sprint specs: formula `"0.5*af_bella + 0.5*am_adam"` should produce audibly blended output distinguishable from either source voice; identical formulas across sessions should hit a bounded LRU and skip recomputation; settings should save and reload formulas; `ExperimentalModelGate.getPromotionCriteria("nano")` should surface criteria such as "Word timing parity: not met / First-audio p50 budget: met / Drift eval: not run / License clarity: met"; and stable-path tests must not regress [D].

Phase 5 - Production hardening: long-form stress tests, real EPUB/PDF fixtures, crash/restart telemetry, diagnostics bundle, cache growth controls, package validation, CPU/memory budgets, provider support matrix, CI/eval gates. Acceptance: responsive long sessions, explainable provider failures, bounded cache, unchanged Kokoro behavior [O][A][B][C][D].

## 4.14 Test Strategy

Unit tests: audio scheduler drift/chunk callbacks/pause/resume/tempo/silence hold/adaptive lag; planner paragraphs/dialogue/quotes/abbreviations/headings/footnotes/tables; pause classification; strategy/provider contract; cache identity/invalidation/corruption/migration; normalizer currency/time/date/abbrev/initials/URLs/decimals/citations; voice formula parser; experimental gate; diagnostics/perf [O][A][D].

Integration tests: Kokoro pipeline; provider registry; generation queue; cache/playback; timing metadata; highlight sync; pause/resume/seek; renderer/main/worker IPC; sidecar lifecycle; crash injection; model load failure; idle unload race; Qwen stall/cancel remains gated; Nano owner-token/stale-start; fallback within target [O][A][B][C][D]. [D] proposes a specific integration test criterion: mid-stream rate changes must produce no >100 ms audible gap [D].

Regression tests: existing Kokoro behavior, word timing, rate changes, cache reuse, resume anchors, reader mode switching, composite cache key encoding, invalid timing fallback [O][A][D].

Long-form/soak tests: 10/30/60-minute and longer sessions where specified, including [B]'s 12-hour concept as expensive/nightly; drift bounds, memory growth, CPU load, cache growth, pause/resume, restart recovery, 50k/150k/300k-word books, 20 EPUB + 5 PDF corpus when feasible [O][A][B][C][D].

Golden/regression corpora should preserve [B]/[C]/[D]'s concrete fixture guidance: children's book, dialogue-heavy fiction, technical/code/list/headings samples, sci-fi/proper-noun-dense samples, non-fiction/footnotes, historical samples, OCR-like PDF text, scanned and native PDFs, tables, footnotes, marginalia, CJK/non-English cases later, and fixed expected segment IDs, word offsets, and normalized text hashes. [B] proposes a 10-EPUB benchmark corpus and 20 EPUB + 5 PDF regression set; [D] adds 10/30/60-minute long-form runs and treating expensive 60-minute soaks as nightly rather than per-PR [B][C][D].

Provider-specific tests: Kokoro timing/packaging; Nano opt-in segment following; Pocket disabled/adapter gates; Qwen disabled/runtime guards; Web Speech canary/boundary reliability; optional providers behind explicit gates [O][A][B][C][D].

CI/eval gates: first-audio p50 advisory, p95 hard gate around [D]'s 900 ms recommendation, drift threshold around 200 ms over 5 min, cache size cap, fallback behavior, crash count, memory profile, packaging validation, license/TOS metadata, CI-uploadable JSON eval artifacts [O][D].

[D] records the current Kokoro baseline as first-audio p50 = 465 ms and p95 = 507.6 ms. CI should treat p50 as advisory or alert-on-regression, p95 as the hard gate at 900 ms, drift over five minutes as a hard gate at 200 ms, and heuristic fallback rate as telemetry-only rather than a gate [D].

## 4.15 Risk Register

| Risk | Source(s) | Mitigation |
|---|---|---|
| Kokoro patch maintenance and upstream divergence | [O][A][D] | Regression tests; monitor upstream; contribute timestamp support if possible. |
| Timing drift, especially long-form/rate changes | [O][A][B][C][D] | Soak tests, drift diagnostics, boundary snap, fallback modes. |
| Non-English timing uncertainty | [O][B][D] | Do not claim multi-language word timing without empirical validation. |
| Overclaiming universal word-level highlighting | [O][B][C][D] | Timing truth labels and provider capabilities. |
| Cache key corruption/composite slash splitting | [O][A] | Structured/encoded keys and migration tests. |
| Content-addressed migration risk | [O][A][D] | Secondary index, schema version, safe invalidation. |
| Provider expansion destabilizing stable path | [O][A][B][C][D] | Experimental gates and stable-path isolation. |
| Heavy Python/Torch packaging | [O][A][B][C][D] | Avoid as default; sidecar spike only. |
| Cloud/Edge ToS/network/auth risk | [O][B][D] | Opt-in/BYO only; license/TOS descriptors. |
| Web Speech boundary unreliability | [O][A][B][D] | Canary probe; fallback-only; unreliable-boundary flag. |
| Qwen CUDA validation gaps | [O][A][D] | Keep disabled until live metrics. |
| MOSS Nano timing gaps | [O][A][D] | Segment-only until timing proven. |
| Pocket adapter gaps | [O][A][D] | Disabled/opt-in until real adapter. |
| SSML internal-model overreach | [O][D] | Use SSML as adapter/export only. |
| Destructive normalization harming highlighting | [O][B][C][D] | Non-destructive normalizer with separate text layers. |
| PDF extraction/OCR complexity | [O][B][C][D] | Dedicated PDF fixtures/lane, coordinate model. |
| Voice blending tensor/device risks | [O][D] | One-off probe before feature commitment. |
| Insufficient diagnostics for bug reports | [O][A][C][D] | `NarrationDiagnostics` export. |
| Long-form memory/performance degradation | [O][A][B][D] | Soak tests, cache caps, memory/CPU budgets. |

[B] provides comparative packaging size estimates: Python sidecar (PyInstaller-frozen) adds ~200–400 MB; `kokoro-onnx` + `onnxruntime-node` adds ~150–300 MB (CPU build); base Electron install is ~80–100 MB before models. A 1 GB+ Electron app "feels wrong; users expect <200 MB" [B].

## 4.16 Adopt / Avoid / Defer Decisions

| Item | Decision | Sources | Rationale | Reconsideration condition |
|---|---|---|---|---|
| Formal `TTSProvider`, registry, capabilities | Adopt | [O][A][B][C][D] | Centralizes current informal strategy boundary. | N/A |
| Deterministic segment IDs and text-layer separation | Adopt | [O][A][B][C][D] | Enables cache/timing/highlight correctness. | N/A |
| `SegmentNormalizer` and pronunciation UI/store | Adopt | [O][A][B][C][D] | Highest quality lift; currently missing. | N/A |
| `TimingMetadataStore` and `HighlightSyncController` | Adopt | [O][A][B][C][D] | Makes timing truth explicit and durable. | N/A |
| `NarrationDiagnostics` and `ExperimentalModelGate` | Adopt | [O][A][C][D] | Observability and promotion safety. | N/A |
| Buffered-seconds backpressure, content-addressed secondary cache | Adopt | [O][A][B][C][D] | Improves latency and reuse without replacing core. | N/A |
| Selective Readest/RealtimTTS/Abogen/Coqui/ttsreader/Sioyek patterns | Adopt selectively | [O][A][B][C][D] | Donor patterns are valuable at subsystem level. | Only after compatibility validation. |
| Full rewrite | Avoid | [O][A][B][C][D] | Current architecture is strong. | Only if future evidence falsifies baseline. |
| Replace Web Audio scheduler | Avoid | [O][A][D] | Best-in-cohort and load-bearing. | Only with measured better topology. |
| PyAudio/mpv/pygame/RealtimeTTS Python runtime | Avoid | [O][A][B][C][D] | Electron-hostile runtime/playback stack. | N/A |
| Coqui/Torch default runtime | Avoid | [O][A][B][C][D] | Packaging, licensing, timing risks. | Sidecar spike passes all gates. |
| Web Speech boundary events as timing truth | Avoid | [O][A][B][D] | Known unreliability. | Platform matrix proves reliability, still capability-scoped. |
| Edge/cloud as offline core | Avoid | [O][B][D] | Network/ToS/auth risks. | Opt-in remote only. |
| SSML as internal payload | Avoid | [O][D] | Typed internal model is clearer. | Use as adapter/export only. |
| Regex-only segmentation and destructive live normalization | Avoid | [O][A][B][C][D] | Harms offsets/highlighting/prosody. | N/A |
| Batch generation as live core, shell-heavy scripts, process re-exec stop | Avoid | [O][A][B][C][D] | Poor fit for live narration. | N/A |
| Fake word timing | Avoid | [O][A][B][C][D] | Violates timing truth. | N/A |
| ttsreader runtime method-rewriting state model | Avoid | [O][D] | State encoded by mutating methods is brittle and produced visible bugs in [D]. | N/A |
| pdf-narrator fixed 50-pixel header/footer thresholds | Avoid | [O][D] | Hardcoded page thresholds do not generalize; derive from page geometry instead. | N/A |
| pdf-narrator concat-then-write monolithic audio assembly | Avoid | [D] | Batch assembly conflicts with Blurby's live streaming/playback model. | N/A |
| Coqui god-object Synthesizer | Avoid | [D] | Constructor and runtime responsibilities are too monolithic for Blurby's typed provider model. | N/A |
| Readest hard-coded reverse-engineered Edge TTS auth token | Avoid | [D] | Service-token fragility and ToS risk make it unsuitable as a core dependency. | N/A |
| abogen hardcoded `device="cpu"` blend fallback | Avoid | [O][D] | Silently regresses GPU/accelerated voice blending paths. | Probe tensor/device compatibility before voice blending. |
| RealtimeTTS busy-wait pause loops and in-place timing mutation | Avoid | [O][D] | Busy-waits waste resources and timing mutation obscures provenance. | N/A |
| Sioyek restart-line-on-resume workaround | Avoid | [O][D] | Restarting a line is an acceptable workaround only when UX is designed around it; not a primary pause/resume model. | N/A |
| Qwen promotion | Defer | [O][A][D] | Live CUDA/timing gaps. | Gates pass. |
| MOSS Nano default promotion | Defer | [O][A][D] | No word timing parity/licensing concerns. | Timing/license/gates pass. |
| Pocket production mode | Defer | [O][A][D] | Adapter missing. | Real adapter and gates pass. |
| Coqui sidecar/runtime | Defer | [O][A][B][C][D] | Heavy/law/perf risks. | Spike proves packaging/license/latency/memory/timing. |
| Universal word-level highlighting | Defer | [O][B][C][D] | Provider-specific timing proof absent. | Validated alignment/timings. |
| Export, forced alignment, Piper, cloud/BYO, MediaSession, named pauses | Defer/P3+ | [O][B][D] | Product-priority dependent. | Roadmap/product need and gates. |
| Android/native plugin TTS patterns | Defer | [O][D] | Useful only when a mobile shell exists; not relevant to Desktop v2 core. | Android/mobile shell enters roadmap. |
| Language-aware per-engine voice memory | Defer/P3 | [O][D] | Implement when multi-language reading becomes a roadmap priority. | Multi-language narration roadmap is active. |
| PDF text-cleaning and OCR-specific normalization patterns | Defer until PDF lane sprint | [O][D] | Preserve pdf-narrator/Sioyek lessons without blocking EPUB TTS core on PDF-specific extraction work. | PDF lane becomes active. |
| Deleting Qwen streaming infrastructure | Avoid | [O][D] | Qwen remains disabled, but the binary-framed PCM/control-plane infrastructure is reusable for future GPU-resident streaming engines. | Only if superseded by a measured better protocol and migration plan. |
| Sioyek shell-heavy operational stack | Avoid | [O][D] | Sioyek's scripts depend on PowerShell, SoX, Aeneas, pygame, Flask, and local-path assumptions; preserve alignment ideas, not the operational shell stack. | N/A |

## 4.17 Source-Specific Unique Contributions

[A] contributes direct static/codebase framing, a classification legend, an explicit warning that external repos are not inherently better designs, strong defense of Kokoro/Web Audio/cache/diagnostics/timing integration, the cache-key slash-splitting risk, timing truth/capabilities interface ideas, and the no-runtime/live-audio-validation caveat [A][O].

[B] contributes the explicit repo-access caveat and [Blurby-assumed] label, the strongest Readest-as-template argument, sentence-level production conservatism, Kokoro sidecar/ONNX options, MediaSource topology, two-engine quality swap, EPUB3 Media Overlay/SMIL export emphasis, Edge/Piper/cloud/BYO suggestions, broad corpus/12-hour test ideas, and runtime validation concerns around Kokoro-ONNX, non-English timing, Web Speech, MediaSource, Edge TOS, and code signing [B][O].

[C] contributes audit-package caution, the provider-independent narration core with five hard requirements, segment-first/provider-agnostic/timing-aware conclusion, locator-first sync, timing metadata separated from rendering, destructive normalization as a central anti-pattern, the `SegmentLocator` union idea, precise Kokoro timing caution, PDF mapping difficulty, provider-specific pause semantics, and diagnostics as a first-class subsystem. [C] also proposes an explicit four-tier fallback chain for provider resolution: (1) preferred provider if healthy, (2) secondary provider with same language/voice if available, (3) system/browser TTS with sentence-level follow only, (4) segment-only highlight without precise timing if needed. Fallback must preserve the same `DocumentSegment` sequence and generation ID semantics [C][O].

[D] contributes the most detailed direct v1.75.1 baseline, POSTV2-ENGINE-1/Desktop v2.0 conveyor status, the strongest best-in-cohort claim, exact constants and details such as q4 Kokoro, 28 voices, 24 kHz mono, fail-closed ready gate, five-minute idle unload, progressive 13/148-word chunks, 8 ms crossfade, 350 ms cursor lag, truth sync every six words, 2GB cache cap, Qwen 8s stall timeout, 181 test files/2,397+ tests, the richest gap matrix, proposed interfaces, test/CI gates, risk tables, do-not-recommend list, no SSML internal payload, and no removal of Qwen infrastructure [D][O].

[O] contributes exhaustive source-aware consolidation and the anti-orphan control structure used here [O].

## 4.18 Conclusion

Blurby should be preserved and evolved rather than rewritten [O][A][B][C][D]. Kokoro should remain the default/timing baseline where validated [O][A][B][C][D]. The next work should focus on provider abstraction, deterministic segment identity, non-destructive normalization, durable timing metadata, cache hardening, highlight fallback modes, diagnostics, and evidence-gated provider expansion [O][A][B][C][D]. External projects should be mined selectively as donors, not treated as replacement architectures [O][A][C][D]. No universal word-level highlighting should be claimed without provider-specific timing truth and validation [O][A][B][C][D].

---

# 5. Traceability Appendix

> **Evidence standard (added during remediation):** A row's "Included" status requires that the element's substantive content — not merely its topic — appears at the cited destination in the report body or a linked appendix. Destination assignment without body evidence is insufficient for PASS.

The following matrix maps every element-ledger row to its final destination. The Element Ledger in Section 1 contains the detailed original-location and description fields; this appendix proves destination and status closure at the element-family level. The companion proof appendix `artifacts/Blurby_TTS_Child_Element_Ledger_2026-05-11.md` expands [O] into 727 heading/list child elements and adds 23 source-only remediation rows from [A], [B], [C], and [D], each with source-confidence, body-evidence destination, treatment, adequacy, and inclusion status.

| Element ID | Sources | Final report destination | Treatment method | Inclusion status | Notes |
|---|---|---|---|---|---|
| E001 | [O][A][B][C][D] | Executive Summary; Thesis; Conclusion | Integrated narrative | Included | Preserve/evolve thesis retained. |
| E002 | [O][A][B][C][D] | Thesis; Engine Evaluation | Consolidated | Included | Kokoro kept with validation caveat. |
| E003 | [O][A][B][C][D] | Architecture; Gap Matrix | Table + narrative | Included | Provider abstraction retained. |
| E004 | [O][A][B][C][D] | Baseline; Timing; Architecture | Integrated | Included | Segment identity retained. |
| E005 | [O][A][B][C][D] | Baseline; Architecture; Tests | Distinct subsection | Included | Normalizer details retained. |
| E006 | [O][A][B][C][D] | Timing; Architecture | Integrated | Included | Timing store retained. |
| E007 | [O][A][D] | Current Baseline; Engine Eval | Detailed baseline | Included | Kokoro direct details retained. |
| E008 | [O][A][D] | Baseline; Engine Eval; Risk | Consolidated | Included | Nano segment-only posture retained. |
| E009 | [O][A][D] | Baseline; Engine Eval | Consolidated | Included | Pocket adapter gap retained. |
| E010 | [O][A][D] | Baseline; Engine Eval; Defer | Consolidated | Included | Qwen disabled + infra retained. |
| E011 | [O][A][D] | Architecture; Roadmap | Integrated | Included | Gate criteria retained. |
| E012 | [O][A][D] | Baseline; Cross-Codebase; Tests | Integrated | Included | Planner details retained. |
| E013 | [O][A][D] | Baseline; Architecture | Consolidated | Included | Queue/backpressure retained. |
| E014 | [O][A][C][D] | Baseline; Architecture; Risk | Distinct subsection | Included | Cache risks retained. |
| E015 | [O][A][D] | Baseline; Avoid Table | Integrated | Included | Scheduler preservation retained. |
| E016 | [O][A][D] | Timing; Tests | Integrated | Included | Validation checks retained. |
| E017 | [O][A][D] | Timing; Architecture | Integrated | Included | Highlight sync retained. |
| E018 | [O][A][C][D] | Timing; Risk; Tests | Consolidated | Included | Pause semantics retained. |
| E019 | [O][A][B][D] | Baseline; Roadmap; Gap Matrix | Consolidated | Included | UI gaps retained. |
| E020 | [O][A][C][D] | Baseline; Architecture; Risk | Integrated | Included | Diagnostics retained. |
| E021 | [O][A][B][C][D] | Test Strategy | Detailed section | Included in Test Strategy | Test matrix retained. |
| E022 | [O][D] | Baseline; Gap Matrix | Table | Included in Table | Explicit gaps retained. |
| E023 | [O][A][B][C][D] | Cross-Codebase | Integrated | Included | Text lessons retained. |
| E024 | [O][A][B][C][D] | Cross-Codebase; Roadmap | Divergence preserved | Included | Streaming/media nuance retained. |
| E025 | [O][A][B][C][D] | Cross-Codebase; Avoid | Integrated | Included | Playback anti-patterns retained. |
| E026 | [O][A][B][C][D] | Timing; Conflict Map | Integrated | Included | Sync divergence retained. |
| E027 | [O][A][B][C][D] | Cache Architecture | Integrated | Included | Cache donor lessons retained. |
| E028 | [O][A][B][C][D] | Architecture; Engine Eval | Consolidated | Included | Voice/model abstraction retained. |
| E029 | [O][B][C][D] | Cross-Codebase; Roadmap | Integrated | Included | Long-form UX retained. |
| E030 | [O][A][B][C][D] | Engine Eval; Risk | Consolidated | Included | Packaging/licensing retained. |
| E031 | [O][A][B][C][D] | Project Lessons; Decisions | Distinct row | Included | Abogen retained. |
| E032 | [O][A][B][C][D] | Project Lessons; Engine Eval | Distinct row | Included | RealtimeTTS retained. |
| E033 | [O][A][B][C][D] | Project Lessons; Conflict Map | Distinct row | Included | Readest divergence retained. |
| E034 | [O][A][B][C][D] | Project Lessons; Engine Eval | Distinct row | Included | Coqui retained. |
| E035 | [O][A][B][C][D] | Project Lessons; Timing | Distinct row | Included | Sioyek retained. |
| E036 | [O][A][B][C][D] | Project Lessons; Gap Matrix | Distinct row | Included | PDF Narrator retained. |
| E037 | [O][A][B][C][D] | Project Lessons; Web Speech | Distinct row | Included | ttsreader retained. |
| E038 | [O][A][B][C][D] | Project Lessons; Negative Evidence | Distinct row | Included | Ultimate retained as negative. |
| E039 | [O][A][B][C][D] | Project Lessons; Avoid | Distinct row | Included | Markor retained as negative. |
| E040 | [O][A][B][C][D] | Recommended Architecture | Integrated | Included | Core principles retained. |
| E041 | [O][A][B][C][D] | Recommended Architecture | Interface table/narrative | Included | Provider capabilities retained. |
| E042 | [O][A][B][C][D] | Recommended Architecture | Integrated | Included | NarrationJob retained. |
| E043 | [O][A][B][C][D] | Architecture; Conflict Map | Divergence preserved | Included | Cache/scheduler retained. |
| E044 | [O][A][B][C][D] | Architecture; Roadmap | Integrated | Included | Sync/diagnostics/gates retained. |
| E045 | [O][B][D] | Conflict Map; Architecture | Flagged resolution | Included | MediaSource/Web Audio tension retained. |
| E046 | [O][A][B][C][D] | Timing Section | Detailed section | Included | Timing policy retained. |
| E047 | [O][A][B][C][D] | Engine Evaluation | Table + commentary | Included in Table | All engines retained. |
| E048 | [O][A][B][C][D] | Gap Matrix | Table | Included in Table | P1/P2/P3/defer retained. |
| E049 | [O][A][B][C][D] | Roadmap | Detailed section | Included in Roadmap | Phases retained. |
| E050 | [O][A][B][C][D] | Test Strategy | Detailed section | Included in Test Strategy | Tests retained. |
| E051 | [O][A][B][C][D] | Risk Register | Table | Included in Risk Register | Risks retained. |
| E052 | [O][A][B][C][D] | Adopt/Avoid/Defer | Decision table | Included in Table | Decisions retained. |
| E053 | [O][A] | Source Unique Contributions | Distinct subsection | Included | [A] unique retained. |
| E054 | [O][B] | Source Unique Contributions; Limitations | Distinct subsection | Included | [B] unique retained. |
| E055 | [O][C] | Source Unique Contributions | Distinct subsection | Included | [C] unique retained. |
| E056 | [O][D] | Source Unique Contributions | Distinct subsection | Included | [D] unique retained. |
| E057 | [O] | Methodology; Traceability | Integrated | Included | [O] role retained. |
| E058 | [O][A][B][C][D] | Conclusion | Integrated | Included | Target state retained. |

No element in the element-family ledger lacks a final destination. No row in the companion body-evidence ledger lacks an evidence anchor.

## 5.1 Child-Element Traceability Addendum

This addendum tracks the child-level deficiencies identified by the second adversarial review and patched in the report body. It is now supplemented by the regenerated all-source child-element proof appendix at `artifacts/Blurby_TTS_Child_Element_Ledger_2026-05-11.md`, which includes every extracted [O] heading, subheading, numbered item, and bullet plus the source-only remediation rows required to keep [A], [B], [C], and [D] visible outside the master-outline family rows.

| Child ID | Parent / Source | Child element | Body destination | Treatment | Status |
|---|---|---|---|---|---|
| C2-001 | [B] provider expansion | OpenAI, ElevenLabs, Azure named as cloud/BYO provider examples. | §4.11 Model and Engine Evaluation | Added explicit provider row. | Included |
| C2-002 | [B] export validation | EPUB3/SMIL Media Overlay export must pass `epubcheck`. | §4.13 Roadmap | Added validation requirement and live-core caveat. | Included |
| C2-003 | [C] locator model | `SegmentLocator` as union: EPUB CFI/section path, PDF page/text-node/offset/line-rect, flat text offsets. | §4.10 Timing, Highlighting, and Synchronization | Added explicit typed-union sentence. | Included |
| C2-004 | [O][D] mobile/native deferral | Android/native plugin TTS patterns deferred until mobile shell exists. | §4.16 Adopt / Avoid / Defer Decisions | Added defer row. | Included |
| C2-005 | [O][D] language-aware voice memory | Language-aware per-engine voice memory deferred until multi-language roadmap. | §4.16 Adopt / Avoid / Defer Decisions | Added defer/P3 row. | Included |
| C2-006 | [O][D] PDF lane deferral | PDF text-cleaning and OCR-specific normalization patterns deferred until PDF lane sprint. | §4.16 Adopt / Avoid / Defer Decisions | Added defer row. | Included |
| C2-007 | [O][D] Qwen infrastructure | Deleting Qwen streaming infrastructure is an explicit avoid item. | §4.16 Adopt / Avoid / Defer Decisions | Added avoid row. | Included |
| C2-008 | [O][D] Sioyek scripts | Sioyek shell-heavy stack depends on PowerShell, SoX, Aeneas, pygame, Flask, and local paths; adopt ideas, not stack. | §4.16 Adopt / Avoid / Defer Decisions | Added avoid row. | Included |

---

# 6. Final No-Orphan Audit

Correction status after adversarial review Option B, second Option B patch, and regenerated child-ledger proof: the draft has been patched with source-specific detail blocks for [A], [B], [C], and [D], including classification outcomes, concrete Kokoro and Qwen constants, [B]'s normalization and MediaSource payloads, [C]'s five hard requirements and validation thresholds, [D]'s anti-pattern list, expanded roadmap/test acceptance details, named cloud/BYO providers, `epubcheck` validation, explicit `SegmentLocator` union details, and the remaining defer/avoid rows identified by the second adversarial review. The companion body-evidence ledger contains 750 rows (727 extracted from [O] and 23 source-only remediation rows from [A], [B], [C], and [D]), each with a specific text anchor proving body or appendix presence.

1. Has every element from [O] been incorporated? Yes. The body-evidence ledger expands [O] into one row per extracted heading, subheading, numbered item, and bullet, and every row has a body-evidence anchor and Included status.
2. Has every unique contribution from [A], [B], [C], and [D] been incorporated? Yes. The previously underdeveloped unique contributions identified in the adversarial review have been inserted into the body and are represented in the source-only remediation rows.
3. Have all known disagreements been preserved? Yes. The Conflict and Divergence Map preserves source confidence, timing baseline, Readest adoption intensity, Web Speech reliability, SSML representation, Kokoro validation, provider expansion, current strengths vs gaps, donor vs replacement framing, MediaSource vs Web Audio, and PDF-lane priority.
4. Have all source-confidence differences been preserved? Yes. Sections 4.3-4.4 distinguish direct/static, assumed, audit-package, and outline evidence, and now include [C]'s source-not-attached and discussion-page limitations.
5. Have all avoid and defer items been preserved? Yes. Section 4.16 preserves the concrete avoid and defer items flagged by the adversarial reviews, including runtime method rewriting, fixed 50-pixel thresholds, concat-then-write batch audio, Coqui god-object Synthesizer, hard-coded Edge auth token, hardcoded CPU blend fallback, busy-wait pauses, restart-line resume, Android/native deferral, language-aware voice-memory deferral, Qwen infrastructure retention, and Sioyek shell-heavy stack avoidance.
6. Have all roadmap items been preserved? Yes. The roadmap section preserves phases, acceptance criteria, and the added concrete acceptance examples; the body-evidence ledger verifies each extracted roadmap row from [O].
7. Have all test items been preserved? Yes. The corpus, benchmark, p50/p95, drift, telemetry, provider-specific, soak, regression, and CI/eval details are represented in the Test Strategy and child ledger.
8. Have all risks been preserved? Yes. The risk register plus inserted body details preserve the identified technical, product, packaging, licensing, timing, cache, provider, validation, and UX risks.
9. Have all negative findings been preserved? Yes. Low-utility projects and concrete anti-patterns are explicit in the project lessons, risk register, decision table, and child ledger.
10. Have all low-priority items been preserved? Yes. P3+, optional, and deferred items remain represented in the Gap Matrix, Roadmap, Adopt/Avoid/Defer table, and child ledger.
11. Are any elements flagged for review rather than silently omitted? No unresolved orphan flags remain. The generated child ledger assigns every extracted row a destination; no row is marked missing or orphaned.
12. Does every item in the traceability matrix have a destination? Yes. The element-family matrix assigns destinations and the body-evidence ledger confirms presence with text anchors.
13. Is any report disproportionately underrepresented? No. [A], [B], [C], [D], and [O] each have visible methodological, architectural, risk, roadmap, test, project-specific, and source-unique treatment.
14. Were any precise technical recommendations weakened into vague summaries? No unresolved weakening remains from the adversarial-review findings; the restored detail is retained in the body, §5.1, and the child ledger.
15. Were any unsupported additions introduced? No new unsupported factual additions were introduced; the patch confines itself to material from [O], [A], [B], [C], and [D].

PASS: No orphaned elements detected. This PASS is based on the integrated report body, Architecture Detail Appendix, Project Detail Appendix, body-evidence ledger (750 rows, 0 flagged), and the final audit transcript. The previous PASS was downgraded during remediation because it lacked body-evidence verification; this PASS is evidence-backed.

> **Audit evidence chain:**
> - [Architecture Detail Appendix](Blurby_TTS_Architecture_Detail_Appendix_2026-05-11.md)
> - [Project Detail Appendix](Blurby_TTS_Project_Detail_Appendix_2026-05-11.md)
> - [Body-Evidence Ledger](Blurby_TTS_Body_Evidence_Ledger_2026-05-11.md)
> - [Final Audit Transcript](Blurby_TTS_Final_Audit_Transcript_2026-05-11.md)
