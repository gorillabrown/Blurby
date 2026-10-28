# ULTRATHINK Prompt: Kokoro TTS Codebase Review Against Research Findings

## Invocation

```
ULTRATHINK — Critical codebase review of Blurby's Kokoro TTS implementation against best practices from the Blurby.Research findings corpus and leading TTS reader codebases.
```

---

## Context Briefing

### What this is

Blurby is a desktop e-book reader (Electron + React) with a sophisticated narration system powered by Kokoro TTS. Over the past 3 months, 50+ sprints have built a TTS pipeline spanning text normalization, chunk planning, audio generation, pre-scheduled playback, caching, timing metadata, and highlight synchronization. Seven more sprints remain on the TTS Architecture Completion conveyor before the system is considered stable.

Five independent research documents reviewed Blurby's architecture against 9+ external TTS/reader codebases (readest, RealtimeTTS, abogen, sioyek, Coqui, pdf-narrator, ttsreader, ultimate-tts-reader, markor). These findings are the standard of comparison.

### What this is NOT

This is NOT another architecture review. The findings documents already cover architecture. This is an **implementation-quality review** — reading the actual source code and evaluating whether what Blurby built matches the quality patterns the external codebases demonstrate. The question isn't "does Blurby have a normalizer?" (it does) but "does the normalizer's implementation quality match what abogen demonstrates, and is it structured to absorb the 9 new transforms that NORMALIZER-ENRICH-1 will add?"

### Why it matters now

The next 7 sprints build on top of the existing implementation. If load-bearing modules have structural weaknesses — god-object orchestration, tight coupling, fragile state management, or type contract gaps — those sprints will be harder to execute and more likely to introduce regressions. This review catches structural issues before new layers build on them.

---

## Source Materials

### Findings Documents (read all 5 — these are your standard of comparison)

| File | Lines | Focus |
|------|-------|-------|
| `C:\Users\estra\Projects\Blurby.Research\.Findings\TTS_LITERATURE_REVIEW_2026-05-11.md` | 1,252 | Comprehensive deep dive — the primary comparative analysis |
| `C:\Users\estra\Projects\Blurby.Research\.Findings\Blurby_TTS_Literature_Codebase_Review_2026-05-11.md` | 764 | Executive summary + recommended interfaces |
| `C:\Users\estra\Projects\Blurby.Research\.Findings\Adversarial_Review_TTS_Literature_Codebase_Review_2026-05-14.md` | 349 | Adversarial post-mortem — stale gaps, overclaims, residual gaps |
| `C:\Users\estra\Projects\Blurby.Research\.Findings\compass_artifact_wf-255c72a1-1de8-4397-b428-f463db0a63ab_text_markdown.md` | 716 | Independent review (no Blurby repo access — [Blurby-assumed] labels) |
| `C:\Users\estra\Projects\Blurby.Research\.Findings\deep-research-report.md` | 720 | Synthesis from audit package — selective borrowing recommendations |

### Blurby Source Files (read in this order — this IS the review)

**Tier 1: Orchestration & State (highest leverage — structural issues here cascade everywhere)**

| File | Lines | Role |
|------|-------|------|
| `src/hooks/useNarration.ts` | 1,784 | Central narration hook — reducer state machine, engine dispatch, settings, word tracking |
| `src/types/narration.ts` | 251 | Narration types — state, actions, reducer |
| `src/types/ttsProvider.ts` | 53 | Provider capability types — TimingTruth, ProviderStatusKind |
| `src/utils/ttsProviderRegistry.ts` | ~150 | Provider registry — posture, capabilities, labels per engine |

**Tier 2: Audio Pipeline (the crown jewels — praised by every findings doc, but 18 stabilization sprints suggest possible fragility)**

| File | Lines | Role |
|------|-------|------|
| `src/utils/generationPipeline.ts` | 675 | Progressive chunk generation — geometric ramp-up, pipelined IPC |
| `src/utils/audioScheduler.ts` | 818 | Pre-scheduled gapless playback — Web Audio API, crossfade, word timing |
| `src/utils/narrationPlanner.ts` | 333 | Rolling pause-boundary planner — chunk-end authority |
| `src/hooks/narration/kokoroStrategy.ts` | 362 | Kokoro strategy — bridges pipeline + scheduler + cache |

**Tier 3: Text & Identity (directly affected by queued sprints)**

| File | Lines | Role |
|------|-------|------|
| `src/utils/segmentNormalizer.ts` | 387 | Spoken-text normalization — 12 transforms, locale, hashing |
| `main/tts-cache.js` | 658 | Disk cache — v1/v2 schema, structured identity, timing sidecars |
| `src/utils/highlightSyncController.ts` | ~200 | Highlight sync policy — trusted/heuristic/missing timing decisions |
| `src/utils/timingMetadataStore.ts` | ~150 | Timing metadata — stores per-chunk timing truth classification |

**Tier 4: Diagnostics & Support (review if time permits)**

| File | Lines | Role |
|------|-------|------|
| `src/utils/narrateDiagnostics.ts` | 132 | Redacted diagnostics bundle |
| `src/utils/narrationContinuity.ts` | 116 | Resume anchor logic |
| `main/tts-engine.js` | 860 | Worker thread wrapper |
| `main/tts-worker.js` | 204 | Kokoro inference in worker |
| `main/ipc/tts.js` | 393 | IPC handlers — generate/stream/cancel |

### Governing Documents (read for context, not review targets)

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project rules, agent config, current state |
| `docs/governance/LESSONS_LEARNED.md` | Engineering guardrails — especially LL-021 through LL-115 for TTS |
| `ROADMAP.md` § "TTS Architecture Completion" | Queued sprint specs that build on the code being reviewed |

---

## Review Dimensions

For each Tier 1-3 file group, analyze through these lenses. Derive additional lenses if the code demands it.

### 1. Structural Integrity
- **State management:** Is state centralized or scattered? Are there implicit state dependencies (one module reading another's refs/globals)? Does the reducer in `narration.ts` cleanly model all transitions, or are there side-effectful escape hatches?
- **Coupling:** Can modules be tested in isolation? Do they depend on concrete implementations or abstractions? Are there circular dependencies?
- **Cohesion:** Does each module do one thing? Or has stabilization churn (18 TTS-7 sprints) created modules that are "about" multiple things?

### 2. Contract Robustness
- **Type contracts:** Are the interfaces between modules well-typed? Are there `any` casts, optional properties that should be required, or union types that aren't narrowed?
- **The "NarrationSegment" question:** The adversarial review (BC-2) says segment identity is distributed across `SegmentNormalizationResult`, `TtsCacheIdentityV2`, and `PlannedChunk`. Is this distribution coherent (each type owns its concern) or fragmented (the same data is redundantly represented with divergence risk)?
- **Provider contract:** All 5 findings recommend a richer `TTSProvider` interface. `ttsProvider.ts` is 53 lines. Is this thin-by-design (the right abstraction) or thin-by-accident (missing capabilities that the findings envision)?

### 3. Pipeline Correctness
- **Chunk flow:** Trace a single chunk from text selection through normalization → planner boundary check → IPC generation → cache write → scheduler playback → highlight sync. Are there points where data is transformed without clear type narrowing? Where timing metadata could be lost?
- **Error propagation:** When Kokoro inference fails mid-chunk, does the error propagate cleanly through pipeline → scheduler → useNarration → UI? Or are there swallowed errors, dangling promises, or state that gets stuck?
- **Cancellation:** When the user pauses/stops mid-narration, is cleanup atomic? Can a stale async result from a cancelled generation still arrive and corrupt state? (LL-031 says use generation ID guards — verify they're implemented consistently.)

### 4. Best Practice Delta
For each module, contrast the implementation against the specific patterns the findings documents recommend:
- **segmentNormalizer vs. abogen's `kokoro_text_normalization.py`:** Transform count (12 vs 20+), heteronym handling, three-text-layer model (user-visible / original extracted / normalized synthesis), the `normalizedToOriginalMap` that TTS-EVENT-SYNC-1 will need
- **audioScheduler vs. readest's `TTSClient` + `<audio>` pattern:** Pre-scheduling vs. MediaSource, crossfade vs. gap acceptance, word-timing heuristic quality
- **generationPipeline vs. RealtimeTTS's `AudioGenerationQueue`:** Ramp-up strategy, backpressure, prefetch behavior
- **narrationPlanner vs. abogen's deterministic chunk model:** Rolling window vs. full-document, sentence-snap tolerance, content-awareness (dialogue, headings)
- **tts-cache vs. content-addressed caching:** v2 structured identity vs. the `sha1(${docId}:${cfi}:${sentenceIndex})` pattern recommended by the Compass review
- **provider types vs. findings' recommended `TTSProvider` interface:** What capabilities are missing? Does the registry support the dispatch/fallback patterns the findings envision?

### 5. Sprint Readiness
- **TTS-EVENT-SYNC-1 readiness:** The sprint adds `normalizedToOriginalMap` to the normalizer result, promotes `onTruthSync` to primary highlight trigger, and removes RAF polling from the hot path. Is the current code structured to absorb these changes cleanly? Are there hidden dependencies on the RAF polling path that would break?
- **NORMALIZER-ENRICH-1 readiness:** The sprint adds 9 transforms and heteronym disambiguation. Is the normalizer's transform pipeline extensible (add a transform, it just works) or brittle (adding a transform requires updating 5 other places)?
- **TTS-RENDER-MAP-1 readiness:** The sprint builds a word-index→DOM-position lookup table. Does the current FoliatePageView→useNarration data flow support this addition, or would it require threading new state through multiple layers?

---

## Output Format

Produce a single markdown document saved to **both**:
- `C:\Users\estra\Projects\Blurby\docs\project\roadmap-reviews\2026-05-15-codebase-review.md`
- `C:\Users\estra\Projects\Blurby.Research\.Findings\Blurby_Kokoro_TTS_Implementation_Review_2026-05-15.md`

### Document Structure

```
# Kokoro TTS Implementation Review — 2026-05-15

## Methodology
[1 paragraph: what was reviewed, against what standard, what this document IS and ISN'T]

## Assumption Archaeology
[ULTRATHINK Phase 1: surface and label assumptions about the codebase, the findings, and the review itself]

## Constraint Classification
[ULTRATHINK Phase 2: genuine vs. artificial constraints on the codebase's evolution]

## Module Reviews

### 1. useNarration — The Orchestrator (1,784 lines)
#### What It Does Well
[Specific code citations — line ranges, patterns, design choices that work]
#### What the Findings Envision
[The specific TTSProvider/registry/strategy patterns the findings recommend, with doc citations]
#### Implementation Gaps
[Where the actual code falls short — specific, with line numbers and what exactly is wrong]
#### Stabilization Debt
[Evidence of patch-on-patch from TTS-7 stabilization: workarounds, special cases, TODO comments, dead branches]
#### Sprint Impact
[How these findings affect TTS-EVENT-SYNC-1, which must refactor the RAF→event transition inside this file]
#### Verdict: [SOLID / ADEQUATE / FRAGILE / BLOCKING]

### 2. Audio Pipeline (generationPipeline + audioScheduler + narrationPlanner + kokoroStrategy)
[Same subsection structure as above, but analyzed as a unit since they're tightly coupled]

### 3. Text & Identity (segmentNormalizer + tts-cache + highlightSyncController + timingMetadataStore)
[Same subsection structure]

### 4. Provider Types & Registry (ttsProvider + ttsProviderRegistry)
[Same subsection structure — shorter, these are small files]

## Cross-Cutting Findings

### Error Handling Consistency
[Pattern: how errors flow across the pipeline. Antipatterns found. Comparison to RealtimeTTS/readest error handling.]

### The "NarrationSegment" Question
[Is the distributed identity model (SegmentNormalizationResult + TtsCacheIdentityV2 + PlannedChunk) coherent or fragmented? Should the roadmap add a unification sprint?]

### Testing Coverage vs. Findings Recommendations
[Do the existing tests cover the failure modes the findings identify? Are there testing blind spots?]

### Dead Code & Legacy Paths
[Qwen/MOSS-Nano/Pocket TTS code paths: how much of useNarration's 1,784 lines is dormant engine support? Does ENGINE-DORMANCY-1 simplify the file meaningfully?]

## Ranked Action Items

| Priority | Item | Affected Sprint | Effort | Risk if Ignored |
|----------|------|----------------|--------|-----------------|
| ... | ... | ... | ... | ... |

[Ranked by: (a) blocks a queued sprint, (b) high blast radius if deferred, (c) cheap to fix now / expensive later]

## Validation Architecture
[ULTRATHINK Step 9: minimal testable propositions for the most important findings]

## Remaining Uncertainty
[ULTRATHINK Step 10: what would a second review pass focus on?]
```

---

## Review Discipline

### What to do
- **Read the actual code.** Every claim must cite a file path and line range. "The normalizer handles currency" is not a finding. "Lines 147-182 of segmentNormalizer.ts implement currency expansion via regex but miss the `$X.XX million` → `X point XX million dollars` pattern that abogen handles at line 312 of kokoro_text_normalization.py" is a finding.
- **Trace data flows end-to-end.** Pick 2-3 concrete scenarios (cold-start first chunk, mid-narration pause/resume, chapter boundary crossing) and trace them through the code. This catches contract gaps that static review misses.
- **Compare implementations, not architectures.** The findings already compared architectures. Your job is to compare implementation quality — error handling, edge cases, type safety, testability.
- **Be honest about strengths.** Multiple findings say Blurby's audio pipeline exceeds all reviewed codebases. If the code backs that up, say so explicitly. Don't manufacture problems.

### What NOT to do
- Don't re-derive the findings. They exist. Reference them. Focus on code-level verification.
- Don't propose architecture rewrites. The roadmap has 7 sprints left. Propose incremental improvements that fit within the existing conveyor.
- Don't review files not listed above unless you discover a critical dependency. Stay focused.
- Don't conflate dormant engine code (Qwen, MOSS-Nano, Pocket TTS) with Kokoro path quality. The dormant paths are about to be disabled. Review the Kokoro path.

---

## Success Criteria

The review is complete when:
1. Every Tier 1-3 file has been read (not skimmed) and assessed against the findings
2. At least 2 end-to-end data flow traces are documented
3. Every module has a verdict (SOLID / ADEQUATE / FRAGILE / BLOCKING)
4. The sprint readiness assessment covers TTS-EVENT-SYNC-1, NORMALIZER-ENRICH-1, and TTS-RENDER-MAP-1
5. The ranked action list contains specific, actionable items with file paths
6. The NarrationSegment question has a concrete recommendation (unify / keep distributed / defer)
