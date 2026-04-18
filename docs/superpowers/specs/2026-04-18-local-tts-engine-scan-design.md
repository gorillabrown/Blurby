# Local TTS Engine Scan Design

**Date:** 2026-04-18  
**Status:** Approved design, pending implementation plan  
**Scope:** Research and evaluation lane for commercially shippable, local/offline-capable TTS backends that may outperform Kokoro for Blurby's long-form narration use case.

---

## Problem

Blurby's current TTS stack is operationally much healthier than it was a few weeks ago, but the core user-facing complaint is still real:

- Kokoro's context is short enough that Blurby must stitch many chunks together
- frequent chunk boundaries amplify seam feel, startup churn, and punctuation prosody weaknesses
- the product pain is not just "latency" or "bugs"; it is that long-form narration still feels more assembled than spoken

Recent evaluation and third-party review clarified two things:

1. **VibeVoice is not the right next backend lane.**
   - production posture is not acceptable
   - disclaimer/watermark behavior is a likely product blocker
   - the runtime/distribution burden is too high for Blurby's current target users

2. **Kokoro is still the practical baseline, but not necessarily the long-form ceiling.**
   - it is local
   - commercially usable
   - already integrated into Blurby's renderer/main-process/runtime shape
   - but its short context means Blurby carries too much orchestration burden to make chapter-length narration feel naturally continuous

The next research step should therefore not be "find any TTS model that sounds exciting." It should be:

> Find the best **commercially shippable, local/offline-capable** TTS candidates that might improve long-form continuity and punctuation prosody over Kokoro, then evaluate them in a Blurby-specific way.

---

## Design Goals

1. Identify realistic local TTS candidates that could replace or complement Kokoro.
2. Prioritize models that may improve:
   - long-form continuity
   - punctuation prosody
   - seam count or seam severity via longer usable inference windows
3. Keep the research grounded in Blurby's actual product constraints:
   - local/offline capable
   - commercially shippable
   - usable on consumer hardware or at least plausibly degradable there
4. Separate "interesting research" from "real product candidate."
5. Produce a final recommendation that is actionable:
   - adopt for prototype
   - keep on watchlist
   - reject

---

## Non-Goals

This design does **not**:

- commit Blurby to replacing Kokoro
- add a new TTS backend yet
- treat API-only engines as primary candidates
- build a generic open-source TTS roundup
- re-open the VibeVoice implementation lane

API-backed engines may still be mentioned later as secondary comparison context, but they are outside the scope of this local-first research lane.

---

## Approved Product Constraints

The research must honor these constraints explicitly:

### 1. Local-first is the default

Primary recommendations must be:

- locally runnable
- offline-capable
- suitable for shipping with or alongside Blurby's desktop app

An optional API backend is acceptable as a later product idea, but it is not the target of this research lane.

### 2. Commercial / production-shippable posture is a hard gate

Primary candidates must:

- permit commercial/product use
- avoid research-only or "not for real-world use" posture
- avoid audible disclaimer or similar product-breaking transparency behavior

Research-only models may be recorded in a watchlist, but they must not be recommended as active engineering targets.

### 3. The core problem is both prosody and context, with prosody-through-context as the primary concern

The research should optimize for:

1. preserving natural phrasing and continuity across long passages
2. reducing seam pressure by allowing meaningfully longer per-inference text windows

The goal is not merely "faster than Kokoro." It is "more like continuous narration and less like many stitched sentences."

---

## Candidate Model Set

This design uses a deliberate split between two candidate classes.

### Track A: Context / Long-Form Challengers

These are candidates whose main appeal is that they may solve more of the "Kokoro context is too short" problem.

#### A1. MOSS-TTS family

Why it is in scope:

- Apache-2.0
- local deployment paths
- explicit long-form positioning
- claims around long-duration generation and token-level duration control
- potentially the strongest fit on paper for Blurby's long-form narration problem

Blurby hypothesis:

- may materially reduce seam pressure
- may improve phrase continuity over longer passages
- may offer a more narration-native shape than Kokoro

#### A2. Qwen3-TTS-12Hz-1.7B-CustomVoice

Why it is in scope:

- Apache-2.0
- stronger modern-TTS profile than small classic engines
- appealing on prosody/context grounds
- clearly a serious model family worth evaluating

Blurby hypothesis:

- may improve expressiveness and contextual phrasing
- may be strong enough to justify heavier runtime complexity

Primary risk:

- heavier Python/CUDA-style runtime burden than Kokoro or MeloTTS

### Track B: Practical Integration Challengers

These are candidates whose main appeal is not maximal context, but plausible near-term product fit.

#### B1. Chatterbox Turbo

Why it is in scope:

- MIT license
- strong quality/prosody positioning
- more plausible product engine than VibeVoice
- a strong candidate for "sounds better than Kokoro even if context is not radically longer"

Blurby hypothesis:

- may be the best quality-focused practical alternative
- may improve punctuation and expressive prosody even if it does not radically change context length

#### B2. MeloTTS

Why it is in scope:

- MIT license
- well-known practical local deployment story
- CPU-friendly and lower-friction than heavier modern backends

Blurby hypothesis:

- may not solve the context problem deeply
- but may be the best "easy to prototype, easy to ship" challenger to Kokoro

### Baseline

#### Kokoro

Kokoro remains the baseline and control:

- already integrated
- already evaluated in Blurby's live and matrix paths
- operationally stable enough to compare against

The point of this lane is not to assume Kokoro is beaten. The point is to test whether any of the above candidates earn the right to displace it or complement it.

---

## Explicit Exclusions

These models may be interesting, but they are not active candidates in this lane.

### Voxtral-4B-TTS-2603

Excluded because:

- non-commercial licensing makes it unsuitable as a primary Blurby recommendation

### Irodori-TTS-500M-v2

Excluded because:

- it is too language-specific to be the right general Blurby backend target

### VibeVoice

Excluded because:

- production posture is not acceptable today
- disclaimer/watermark behavior is too risky or outright blocking
- runtime/distribution burden is not justified by current evidence

---

## Research Questions

The research should answer these questions directly.

### Core product questions

1. Which local TTS engine sounds most natural on Blurby's actual reading content?
2. Which engine handles punctuation, long sentences, and prose cadence better than Kokoro?
3. Which engine materially reduces seam count or seam severity by tolerating longer useful inference windows?
4. Which engine is realistic to integrate into Blurby's desktop runtime without creating a packaging and support burden larger than its quality gain?

### Runtime questions

5. Can the candidate run locally on plausible Blurby user hardware?
6. What runtime shape does each engine require?
   - Node/ONNX
   - Python sidecar
   - CUDA-only
   - CPU fallback
7. Does the candidate expose timing metadata, or would Blurby need to rely on existing heuristic / segment-following models?

### Product-fit questions

8. Is the engine commercially shippable?
9. Does it preserve or damage exact-speed expectations?
10. Is it better treated as:
    - a primary replacement candidate
    - an experimental optional engine
    - a watchlist item only

---

## Approaches Considered

### Approach 1: Broad TTS roundup

Survey every exciting open TTS model and rank them loosely.

Pros:

- broad awareness
- lower risk of missing a hidden gem

Cons:

- low signal for Blurby
- easy to drift into research theater
- does not produce a usable next move

### Approach 2: Focus only on one "most exciting" new model

Pick one model family and investigate it deeply.

Pros:

- faster
- simpler reporting

Cons:

- high selection risk
- too easy to overfit the research to one engine narrative

### Approach 3: Recommended — two-track focused scan

Split the field into:

- **context challengers** (`MOSS`, `Qwen`)
- **practical challengers** (`Chatterbox Turbo`, `MeloTTS`)

and compare both tracks against Kokoro.

Pros:

- directly maps to Blurby's real decision
- distinguishes "best on paper" from "best practical fit"
- prevents one good-sounding but unshippable model from dominating the conversation

Cons:

- slightly more work than a single-candidate deep dive

**Recommendation:** use Approach 3.

---

## Proposed Research Lane

This lane should run in three linked phases.

### Phase 1: Candidate Viability and Source Verification

Goal:

- verify that each candidate is still active, licensed appropriately, and realistically deployable

Required outputs:

- source-verified model sheet for each candidate
- runtime requirements summary
- licensing / commercial-use status
- deployment notes:
  - CPU viability
  - GPU expectation
  - Python/torch/llama.cpp/ONNX path

Exit gate:

- remove any candidate that fails the commercial or local-first gate

### Phase 2: Audio Quality and Long-Form Behavior Evaluation

Goal:

- compare the shortlisted engines on Blurby's actual narration use case

Fixture corpus must include:

- punctuation-heavy literary prose
- long sentences
- dialogue
- short headings and short lines
- at least one 5-10 minute continuous passage

Required outputs:

- side-by-side audio artifacts
- subjective rating sheet
- seam / continuity notes
- prosody notes
- "felt narration quality" summary

Primary scoring dimensions:

- punctuation prosody
- long-sentence cadence
- chapter-like continuity
- seam audibility
- voice fatigue over time

### Phase 3: Integration Fit and Recommendation

Goal:

- decide whether any candidate should move into a real Blurby prototype lane

Required outputs:

- integration shape for each surviving candidate
- timing-truth implications
- rate-control implications
- packaging/distribution implications
- final recommendation:
  - prototype now
  - keep on watchlist
  - reject

Exit gate:

- at least one candidate must show a believable user-value gain over Kokoro **and** a realistic integration path, or the final recommendation remains "stay on Kokoro and continue internal tuning"

---

## Evaluation Matrix

Each candidate should be evaluated against these dimensions.

| Dimension | Why It Matters For Blurby |
|---|---|
| Commercial / production posture | Hard gate for shipping |
| Local/offline viability | Core product constraint |
| Consumer hardware realism | Blurby is not a datacenter product |
| Long-form continuity | Directly addresses Kokoro's short-context weakness |
| Punctuation prosody | One of the most visible current complaints |
| Seam count / per-inference window | Determines how much stitching Blurby still has to do |
| Timing metadata or timing compatibility | Affects Narrate follower model |
| Speed-control compatibility | Prevents regression against Kokoro's exact-speed work |
| Packaging / distribution complexity | Determines whether the quality win is affordable |
| Overall narration feel | Final user-facing outcome |

The final recommendation should not be based on one headline metric. It should be based on the combination of:

- quality gain
- integration cost
- product-fit risk

---

## Expected Deliverables

The research lane must produce:

1. A candidate dossier for:
   - Kokoro
   - MOSS-TTS family
   - Qwen3-TTS
   - Chatterbox Turbo
   - MeloTTS
2. A shortlist decision table ranking:
   - best long-form challenger
   - best practical challenger
   - best overall next prototype candidate
3. Audio comparison artifacts for the common corpus
4. A final recommendation memo for Blurby:
   - stay on Kokoro for now
   - prototype one candidate
   - prototype two candidates
   - watchlist only

---

## Artifact and Documentation Shape

Recommended output locations:

- research spec: `docs/superpowers/specs/`
- candidate notes: `docs/research/tts-engine-scan/`
- audio comparison artifacts: `artifacts/tts-eval/engine-scan/`
- final decision memo: `docs/research/tts-engine-scan/FINAL_RECOMMENDATION.md`

The final report should be readable by both:

- engineering
- product / strategy

without assuming they followed the entire investigation in real time.

---

## Success Criteria

This design is successful if the resulting research can answer:

1. Is there a **commercially shippable local engine** that is meaningfully better than Kokoro for Blurby's long-form narration problem?
2. If yes, which one is the best next prototype target?
3. If no, what is the clearest reason to stay on Kokoro and focus on:
   - segment-following Narrate
   - Kokoro prosody tuning
   - long-context backend watchlisting

---

## Risks

### 1. We may discover that no candidate is clearly better overall

That is an acceptable outcome. The lane is still valuable if it converts uncertainty into a confident "stay on Kokoro for now."

### 2. The best-sounding engine may also be the least shippable

That is why the design separates context challengers from practical challengers. The research should not confuse "best demo" with "best product candidate."

### 3. Audio quality judgments may become too subjective

To reduce this:

- use a fixed corpus
- use the same rubric across engines
- preserve raw artifacts
- keep the recommendation tied to both sound and runtime fit

---

## Recommended Next Step After This Spec

If this design is approved, the next document should be an implementation/research plan that breaks the lane into concrete steps, likely along these lines:

1. source verification and hard-gate screening
2. candidate runtime setup notes
3. audio artifact generation on the shared corpus
4. evaluation and ranking
5. final recommendation memo

That plan should assume:

- local-first
- commercial-shippable-first
- no commitment to implementation until the research earns it

---

## Final Recommendation

Blurby should not jump from "Kokoro feels limited" straight to "replace Kokoro with the most exciting new model."

The right move is a disciplined local-engine scan with this candidate priority:

1. **MOSS-TTS family** — best current long-form challenger
2. **Qwen3-TTS** — strongest high-capability challenger
3. **Chatterbox Turbo** — strongest practical quality challenger
4. **MeloTTS** — strongest low-friction practical challenger

with **Kokoro** as the baseline and **VibeVoice / Voxtral / Irodori** outside the active recommendation set for now.
