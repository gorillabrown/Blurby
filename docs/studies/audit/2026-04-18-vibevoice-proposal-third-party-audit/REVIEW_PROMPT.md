# Third-Party Review Prompt

Assume the role of a **skeptical principal TTS, runtime, and product-architecture auditor**. You are reviewing a proposal for Blurby, an Electron desktop reading and narration application, to investigate Microsoft VibeVoice as a possible alternative or complement to its current Kokoro narration stack.

Your job is not to validate the proposal by default. Your job is to determine whether it is technically sound, properly scoped, correctly sequenced, and likely to address the user's actual pain points.

## Review Mandate

- Use the included code and documentation as the source of truth.
- Distinguish clearly between:
  - proven facts
  - plausible but unproven hypotheses
  - unsupported assumptions
- Evaluate whether the proposal answers the real product problem, not just whether it is interesting technically.
- Be explicit about what should proceed, what should be revised, and what should be rejected.

## Proposal Context

The proposal under review is:

- `VIBE-1`: benchmark harness and research baseline
- `VIBE-2`: local Python sidecar prototype for `VibeVoice-Realtime-0.5B`
- `VIBE-3`: alignment and Narrate-truth evaluation

The proposal also asks whether `Narrate` should evolve toward **audio-derived natural-break following** rather than treating strict per-word timing as the only valid truth model.

## Required Evaluation Areas

Please evaluate all of the following:

1. How strong is the case that VibeVoice would improve the real user pain points better than continued Kokoro tuning?
2. Is `VibeVoice-Realtime-0.5B` the right first target?
3. Is keeping `VibeVoice-1.5B` as research context only the correct choice?
4. Is the proposed order of `benchmark -> prototype -> alignment evaluation` correct?
5. Is the lack of clear native word-level timing fatal, manageable, or mostly irrelevant?
6. Is the Python sidecar approach an acceptable runtime path for Blurby?
7. Is disclaimer or watermark behavior likely to be a product blocker?
8. Is the "Narrate follows natural breaks" idea strong, weak, or premature?

## Required Output Structure

Produce your review with these sections:

### 1. Executive Verdict

One clear verdict:

- proceed as proposed
- proceed with revisions
- do not proceed

### 2. Strongest Reasons To Proceed

List the most credible arguments in favor of the lane.

### 3. Strongest Reasons Not To Proceed

List the most credible arguments against the lane.

### 4. Missing Evidence

Identify what critical evidence is still absent.

### 5. Technical Findings by Severity

Use severity levels:

- CRITICAL
- MAJOR
- MODERATE
- MINOR

### 6. `VIBE-1` Evaluation

Assess whether the benchmark harness is well-scoped and sufficient.

### 7. `VIBE-2` Evaluation

Assess whether the sidecar prototype is the right next step and whether the runtime burden is acceptable.

### 8. `VIBE-3` Evaluation

Assess whether the alignment and Narrate-truth evaluation is necessary, well-timed, and likely to be useful.

### 9. Recommendation

State exactly what should happen next.

### 10. Suggested Scope or Order Changes

If the proposal should be revised, specify how.

## Reviewer Standard

Please separate:

- "good idea, wrong order"
- "interesting idea, missing evidence"
- "technically unsound"
- "valuable but too expensive right now"

Do not collapse these into one generic verdict.
