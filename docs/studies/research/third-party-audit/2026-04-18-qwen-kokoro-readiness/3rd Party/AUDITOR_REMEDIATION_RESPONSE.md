# Remediation Response To Third-Party Audit

**Date:** 2026-04-18  
**Packet under review:** `2026-04-18-qwen-kokoro-readiness`  
**Primary audit response reviewed:** `compass_artifact_wf-89dcceb6-7835-4b09-b2ac-1fd026419b13_text_markdown.md`

---

## 1. Executive Response

We accept the auditor's top-line verdict of **proceed with required changes**.

We also agree that the strongest corrective value in the audit is not "Qwen should be blocked," but rather:

- the prototype needs a real success criterion
- the Qwen chunk profile needs to be presented as provisional rather than settled
- the `wordTimestamps` claim in the authoritative record needs tighter wording
- the Kokoro/Qwen transport difference should be called out as a measurement confound
- the prototype spec needs clearer failure behavior, observability, and post-prototype decision handling

At the same time, we are separating two different kinds of value in the audit response:

1. **Accepted audit corrections**
   These improve the existing Qwen + Kokoro v1 prototype spec directly.

2. **Useful design pressure from the extended architecture section**
   These do not automatically replace the submitted v1 architecture, but they did expose missing design dimensions that our original materials under-specified.

This remediation response documents both.

---

## 2. What New Information We Learned

### 2.1 New Information Learned From The Bounded Audit

These are findings we accept as direct improvements to the current packet.

#### A. The current prototype spec is execution-ready, but not yet decision-ready
The audit correctly distinguished between:

- **build-completeness gates**
- **adoption-decision gates**

Our original spec included the former but not the latter. We now recognize that "Qwen runs in-app" is not enough. The spec must also say how the prototype produces a real go or no-go recommendation.

#### B. The current `wordTimestamps` statement is too strong for the enclosed proof
The audit surfaced an important precision issue:

- our packet proves the current Kokoro chain **forwards** `wordTimestamps`
- it does **not** prove that the underlying runtime produces non-null timestamps in practice

That is a better and more honest framing than the current authoritative wording.

#### C. The Qwen chunk profile needs to be explicitly framed as a seed
The audit correctly called out that our Qwen chunk numbers were presented with too much confidence. We learned that the design should separate:

- the principle: Qwen deserves a fairer, Qwen-specific chunk profile
- the current numbers: first-pass seed values, subject to tuning

That distinction was missing.

#### D. Our prototype lacked an explicit evaluation protocol
We learned that the packet needs a defined answer to:

- which fixtures are compared
- who listens
- how comparisons are scored
- what constitutes a "win"
- what happens next if Qwen wins or loses

Without that, the prototype produces implementation output but not decision output.

#### E. The packet needed clearer wording on Kokoro's current evidence posture
The audit usefully sharpened something that was already true in the materials but not stated strongly enough:

- Kokoro is the only **completed empirical lane**
- Kokoro is **not** yet a fully scored audio baseline in this packet

That is an important distinction for honest future comparison.

### 2.2 New Design-Level Information Learned From The Extended Architecture Section

The later sections of the audit response exceeded the bounded packet and should not be treated as authoritative validation of the submitted v1 design. However, they still taught us something useful about what a serious design document for this lane needs to cover.

Specifically, we learned that our original v1 design should have had more explicit sections for:

#### A. Runtime topology
Even if we keep the current v1 Python sidecar design, the materials showed that the design should explicitly spell out:

- what runs where
- which process owns the runtime
- which boundaries are synchronous vs asynchronous
- which pieces are main-process responsibilities vs renderer responsibilities

That is a documentation-quality improvement, regardless of whether we adopt the proposed vLLM-Omni shape.

#### B. Timing strategy as a first-class design topic
Our original v1 spec said "use the heuristic timing path," but it did not treat timing as a design surface with:

- known failure modes
- evaluation caveats
- fallback behavior
- implications for user-facing highlighting quality

The extended material made clear that even a "no new aligner in v1" decision still needs its own explicit subsection and caveat model.

#### C. Failure-mode ladders and graceful degradation
The extended material was strongest when it forced explicit thinking about:

- runtime unavailable at startup
- runtime failure mid-playback
- timing unavailable
- host under-provisioned
- mode or speaker selection errors

We are not adopting its full architecture, but we did learn that our original spec was too thin on failure-mode detail.

#### D. Startup/readiness and host-class expectations
The extended material made it obvious that any CUDA-first prototype needs a clearer written stance on:

- target host class
- runtime readiness states
- what "available" means
- what happens when the expected host class is absent

Our original spec implied these things, but did not present them cleanly enough.

#### E. Assumption labeling discipline
The extended material overreached in several places, but it also modeled something useful:

- it labeled many uncertain claims as assumptions to validate

That highlighted a gap in our own packet. We had an assumptions section, but we should do a better job of tagging which parts of the design are:

- proven by current evidence
- adopted v1 design choice
- open assumption
- deferred follow-on option

#### F. Post-prototype branch planning
The audit's best strategic push was that a prototype without a clear next-phase branch is just a demo. We learned that our v1 spec should explicitly describe what happens in three outcomes:

- Qwen materially wins
- Qwen is mixed or inconclusive
- Qwen loses or proves too operationally fragile

That was under-specified in our original materials.

---

## 3. How The Audit Improved Our Design

The audit did **not** convince us to replace the submitted v1 design with the later vLLM-Omni plus aligner plus streaming redesign.

It **did** improve the current design in the following concrete ways.

### 3.1 Improvements We Will Make To The Existing V1 Design

#### 1. Add a pre-registered prototype success criterion
We will revise the spec so the prototype has a real decision protocol, including:

- the required comparison fixture set
- the listening-review protocol
- the minimum dimensions that matter for promotion
- what result is needed for a follow-on Qwen productization or enablement spec

#### 2. Reframe the Qwen chunk profile as seed values
We will keep the principle of Qwen-specific chunking, but we will rewrite the numbers as:

- first-pass seed values
- selected for initial fairness testing
- subject to tuning during the prototype

We will also add short rationale for why Qwen should not be judged under Kokoro-sized windows.

#### 3. Tighten the `wordTimestamps` claim
We will revise the authoritative record so it says:

- the current Kokoro IPC chain forwards `wordTimestamps` when produced
- the enclosed packet does not prove the runtime returns non-null timestamps in practice

This makes the record more precise without weakening the case for the prototype.

#### 4. Explicitly flag transport asymmetry
We will add language to the spec that:

- Kokoro and Qwen use different prototype transport shapes
- latency measurements across the two lanes are therefore informative, not absolute
- listening comparisons matter more than raw startup metrics in this v1 phase

#### 5. Add explicit renderer failure behavior
We will upgrade the v1 failure rules from negative-only to positive behavior, including:

- what the renderer shows when Qwen fails
- what happens to narration state
- whether retry is manual or automatic
- how engine selection behaves after failure

#### 6. State Kokoro's evidence posture more clearly
We will explicitly note that:

- Kokoro's current 6/6 artifact set proves functional completion
- Kokoro's audio scoring in the current packet is still incomplete
- Kokoro is the default because it is the current shipped baseline, not because the packet proved it won on listening quality

#### 7. Add speaker verification to acceptance
The audit correctly noted that the packet assumed `Ryan` without showing a live speaker list. We will add an acceptance step to verify:

- the reported Qwen speakers on the target runtime
- the chosen default speaker for the comparison run

#### 8. Add explicit next-step branches
We will add a short "what happens next" section for:

- Qwen win
- inconclusive result
- Qwen loss / operational failure

This closes the loop between prototype and product decision-making.

### 3.2 Design-Doc Quality Improvements We Will Carry Forward

Even while keeping the original v1 architecture, we will improve the document structure itself by adding or strengthening sections for:

- runtime topology
- timing strategy and caveats
- observability expectations
- failure-mode and fallback behavior
- host-class assumptions
- assumption labeling and validation ownership

These are genuine design improvements learned from the audit response.

---

## 4. What We Are Not Adopting Into The Current V1 Design

We want to be explicit here to avoid any ambiguity.

We are **not** adopting the following into the current Qwen + Kokoro v1 spec solely because they appeared in the later portion of the audit response:

- a vLLM-Omni streaming-server replacement for the current Python sidecar shape
- a separate FastAPI alignment sidecar in v1
- a mandatory Qwen forced-aligner integration in v1
- WebSocket PCM streaming as the v1 transport
- paragraph-streaming architecture as the new required baseline
- six narration-mode `instruct` orchestration as part of the first prototype
- the specific latency, VRAM, or concurrency targets asserted in the redesign section

These ideas may be useful as **future-track design options**, but they are not accepted into the audited v1 scope by default.

---

## 5. How We Are Reframing The Extended Design Material

The extended architecture material was not valid as bounded audit proof, but we do not consider it worthless. We are reclassifying it as:

- **design exploration input**
- **future-track option inventory**
- **documentation-quality pressure**

That means:

### Accept As Useful Design Questions
- Should a future Qwen-native lane use a more Qwen-specific runtime topology than the current v1 sidecar?
- Should a later phase evaluate Qwen's official aligner?
- Should a later phase explore `instruct`-based narration control?
- Should a later phase move from temp-file transport to a more direct PCM path?

### Do Not Treat As Current Audit-Backed Conclusions
- That vLLM-Omni is the required runtime
- That the official aligner belongs in v1
- That paragraph-streaming and mode orchestration are already the correct product direction
- That the cited latency/VRAM numbers are now part of the accepted design baseline

---

## 6. Remediation Actions By File

We plan to revise the packet in these places.

### `IMPLEMENTATION_READINESS_SPEC.md`
- add prototype success criterion and listening-evaluation rule
- mark Qwen chunk profile as seed values
- add transport-confound note
- add explicit renderer failure behavior
- add timing-caveat wording for heuristic highlighting
- add explicit post-prototype branch outcomes
- add speaker verification to acceptance checks
- strengthen runtime topology and observability sections

### `AUTHORITATIVE_RECORD.md`
- tighten `wordTimestamps` wording from "worker emits" to "current chain forwards when present"
- add a plain statement that Kokoro's current artifacts show functional completion, not completed listening-grade proof

### `AUDIT_BRIEF.md` or packet summary materials
- make Kokoro's "completed empirical lane" status even more visibly distinct from "scored listening winner"
- optionally make the future-track separation clearer:
  - v1 scoped prototype
  - future Qwen-native expansion options

### Extended design material handling
- keep the auditor's full response for record
- do not treat sections beyond the bounded audit as accepted redesign
- optionally label the later section as exploratory architecture input rather than primary audit content

---

## 7. Final Response Back To Auditor

Thank you for the review. We accept the central verdict of **proceed with required changes** and agree that the most important improvements are:

- adding a real prototype success criterion
- making the Qwen chunk profile provisional rather than settled
- tightening the `wordTimestamps` evidence claim
- calling out Kokoro/Qwen transport asymmetry
- clarifying failure behavior, observability, and post-prototype branching

We also found value in the later design-heavy portion of the response, but we are treating that material as **future-track design exploration**, not as an accepted replacement for the submitted v1 prototype architecture.

The main concrete things we learned from that extended section were not "we must switch to this new design," but rather:

- our own spec needed better runtime-topology exposition
- timing strategy needed to be treated as a first-class design topic
- failure-mode ladders needed more explicit handling
- host-class assumptions and readiness states needed clearer expression
- assumption labeling needed to be stronger
- the prototype needed a better stated branch for what happens after a Qwen win or loss

In that sense, the audit materially improved the design even where we are not adopting the proposed redesign literally.

---

## 8. Requested Follow-Up Review

After we revise the packet documents above, the most useful follow-up review question will be:

> Does the revised v1 packet now have enough precision, decision logic, and failure clarity to justify execution without silently expanding scope?

That is the next review bar we intend to meet.
