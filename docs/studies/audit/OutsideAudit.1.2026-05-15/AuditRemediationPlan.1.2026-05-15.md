# Audit Remediation Plan — OutsideAudit.1 (2026-05-15)

**Audit:** OutsideAudit.1.2026-05-15
**Auditor verdict:** "Directionally promising but not dispatch-safe as currently written" — Overall 5/10
**Remediation author:** Cowork (Evan/Claude)
**Date:** 2026-05-15

---

## Management Summary

The audit validates the core conveyor sequence (ENGINE-DORMANCY-1 → TTS-INTEGRATE-1 → TTS-CACHE-HARDEN-1) and credits the codebase as stronger than the roadmap's documentary discipline. The primary findings are governance/framing issues (roadmap truncation in audit package, current-state overstatement, scope drift between planning artifacts) and one substantive modeling gap (durable segment identity vs. cache-derived chunkId). No finding requires new architecture or reversal of existing decisions.

**Remediation strategy:** Accept the framing corrections, narrow the language in affected sprint specs, redistribute front-loaded contract testing into existing sprints rather than adding new sprints, and fold segment identity assessment into TTS-EVENT-SYNC-1's Phase 0 gate as a hard decision point.

**Net conveyor change:** Zero new sprints added. Zero sprints removed. Sprint order unchanged. Spec language tightened in 4 sprints. One Phase 0 gate strengthened from advisory to hard stop. Governance repair distributed across sprint closeouts rather than deferred to TTS-ARCH-DOC-1.

---

## Audit Feedback Response Matrix

### F1 — ROADMAP.md Truncation in Audit Package

**Auditor finding:** ROADMAP.md ends mid-sentence during TTS-CACHE-HARDEN-1 in the supplied audit package. The roadmap fails its own "single source of truth" test.

**Disposition:** Accept with narrowing

**Why:** The truncation is a packaging artifact, not a roadmap defect. The canonical ROADMAP.md on disk contains all 8 full sprint specs (872 lines, 60,705 bytes, verified by reading the complete file). The auditor's ingestion system likely hit a file-size limit or the zip tool truncated the file. The roadmap IS complete and internally consistent on the canonical `main` branch.

**Narrowing:** The remediation is to the audit packaging process, not to the roadmap itself. Future audit packages should either (a) split ROADMAP.md across batches with explicit continuation markers, or (b) use the GitHub repo ingestion path for files exceeding ~50KB.

**Immediate next step:** No roadmap change. Document the packaging lesson in audit procedure notes.

**Risk of calibration drift:** None — roadmap content is unchanged.

---

### F2 — Current-State Overstatement (Dormancy Framing)

**Auditor finding:** Nano and Pocket TTS are still selectable, routed, and IPC-live in code. Orientation material and queue language treat them as already dormant. ENGINE-DORMANCY-1 is a real product-posture change, not cleanup of already-dormant code.

**Disposition:** Accept

**Why:** The auditor is correct. The code at `ttsProviderRegistry.ts:94-151`, `useNarration.ts:1064-1091,1259-1288`, and `ipc_tts.js:177-287` confirms Nano and Pocket are still live. The orientation and CLAUDE.md use future-state language ("Kokoro sole active engine") that hasn't landed yet. This is sloppy framing, not a design error.

**Immediate next steps:**
1. Reframe ENGINE-DORMANCY-1's opening paragraph from cleanup language to deliberate posture-shift language: "Disable MOSS-Nano and Pocket TTS at the settings/selection boundary and IPC runtime entry points" (already correct in the What) but ensure the Why explicitly states these engines are **currently live and selectable**, not already dormant.
2. Update CLAUDE.md's "Current System State" to use present-tense accuracy: "Kokoro is default; MOSS-Nano and Pocket TTS remain selectable/routed pending ENGINE-DORMANCY-1; Qwen is disabled."
3. Add ENGINE-DORMANCY-1 criterion: "TECHNICAL_REFERENCE.md updated to reflect post-dormancy engine posture."

**Docs touched:** ROADMAP.md (ENGINE-DORMANCY-1 Why paragraph), CLAUDE.md (system state section).

**Risk of calibration drift:** Low — language change only, no functional change.

---

### F3 — Missing Durable Segment Identity Model

**Auditor finding:** The system conflates cache identity, playback chunk identity, and logical narration segment identity. Current `chunkId` is normalization-sensitive and unsuitable as a durable export/subtitle/highlight anchor. The auditor recommends inserting a new "alignment-and-segment foundation" sprint before TTS-EVENT-SYNC-1.

**Disposition:** Accept with narrowing

**Why:** The auditor's technical analysis is correct — `chunkId` is `${bookId}:${startIdx}:${normalizationHash}` and varies with normalizer version changes. However:

1. The finish line is "TTS Architecture Complete" — not "export-ready." KOKORO-EXPORT-1 is explicitly deferred and is the consumer of durable segment identity.
2. TTS-EVENT-SYNC-1 already has a Phase 0 gate that addresses the alignment contract, and criterion 9 of TTS-PIPELINE-1 already requires a `NarrationSegment` domain type assessment.
3. Adding a new sprint disrupts a stable, reviewed conveyor with 8 full specs. The assessment work is better folded into existing sprint gates.

**Narrowing:** Instead of a new sprint:
- **Strengthen TTS-EVENT-SYNC-1's Phase 0 gate** to a hard stop that includes segment identity scoping: "Before implementation, assess whether a `NarrationSegment` type (structure-stable, normalization-independent) is needed for the alignment map to be coherent. If yes, define the type in this sprint's implementation (it's a type definition + one usage site, not a separate sprint). If no, document why `chunkId` suffices for the current phase and what would trigger a standalone sprint."
- **Enrich `documentLocator`** as part of TTS-CACHE-HARDEN-1 (the auditor correctly notes the type already anticipates `sectionId` and `cfi` but `kokoroStrategy.ts` currently populates only `{ bookId }`). Add as an opportunistic criterion.
- **Retain TTS-PIPELINE-1 criterion 9** (NarrationSegment domain type assessment) as the formal decision gate for whether a standalone sprint is needed before KOKORO-EXPORT-1.

**Prerequisite changes:** None — no new sprint, no resequencing.

**Risk of calibration drift:** Medium — if the Phase 0 assessment reveals the type IS needed, implementation adds ~1 day to TTS-EVENT-SYNC-1. This is acceptable because TTS-EVENT-SYNC-1 is already sized M (~3-4 days).

---

### F4 — TTS-CACHE-HARDEN-1 Scope Contradictions

**Auditor finding:** The PM2 phase brief maps "triple-storage reduction" into TTS-CACHE-HARDEN-1, but the ROADMAP spec's Done-when criteria don't capture it. Planning artifacts are internally inconsistent.

**Disposition:** Accept with narrowing

**Why:** The auditor is correct that the PM2 brief and ROADMAP spec use different language. However, they describe the same work from different angles:
- PM2 brief's "triple-storage reduction" = ROADMAP criterion 3 (timing classification harmonization — `TtsProviderTimingTruth` as single canonical enum, `timingClassification` as derived).
- The ROADMAP spec is actually more precise than the brief. The brief uses shorthand; the spec describes the exact harmonization approach.

**Narrowing:** Add a Source note to ROADMAP criterion 3 explicitly mapping it to the PM2 brief's "triple-storage" language so the connection is discoverable. No criterion changes needed.

**Immediate next step:** Append to ROADMAP TTS-CACHE-HARDEN-1 criterion 3: "(This criterion addresses the PM2 brief's 'triple-storage reduction' — timing truth expressed via one canonical enum, not three overlapping representations.)"

**Risk of calibration drift:** None — documentation clarification only.

---

### F5 — TTS-EVENT-SYNC-1 "Replace RAF" Wording Risk

**Auditor finding:** The spec's language about "replacing RAF polling with word-boundary events" risks being misread as removing RAF entirely. If it means "remove render-layer polling for discrete word decisions while retaining scheduler-authoritative interpolation," it's coherent. If it means "remove RAF as a core visual transport," it violates LL-077/LL-079 guardrails.

**Disposition:** Accept

**Why:** The spec already has the correct guardrails (Phase 0 gate: "RAF fallback preservation," criterion 4: "demoted from the word-highlight hot path only after measurement"), but the opening What paragraph says "Replace the RAF-based audio-progress polling loop" which IS easy to misread. The auditor's narrower framing is better.

**Immediate next step:** Rewrite TTS-EVENT-SYNC-1's opening What paragraph:

**Current:** "Replace the RAF-based audio-progress polling loop with direct word-boundary event callbacks from the Kokoro scheduler."

**Revised:** "Promote direct word-boundary event callbacks from the Kokoro scheduler to the primary highlight-advance trigger, demoting the RAF-based audio-progress polling loop from the word-highlight hot path. RAF interpolation is retained for progress bar display, time-remaining estimation, and as a fallback for non-word-native timing modes."

**Risk of calibration drift:** None — language tightening, no functional change.

---

### F6 — TTS-PIPELINE-1 Under-Sized and Too Late

**Auditor finding:** TTS-PIPELINE-1 wants to verify the entire chain + add stress fixtures + expand normalization fixtures + assess NarrationSegment + verify cache-hit parity. Some of that testing belongs earlier as gates. The PM2 plan also mentions a NarrationSegment assessment obligation not visible in the queue summary.

**Disposition:** Accept with narrowing

**Why:** The auditor is right that contract tests should be front-loaded. However, the existing specs already distribute some of this work:
- Cache-hit parity is already TTS-CACHE-HARDEN-1 criterion 6 ("New tests cover: cache-hit metadata parity")
- Alignment adversarial fixtures are already TTS-EVENT-SYNC-1 Phase 0 gate item 2 ("Alignment map fixture proof")
- NarrationSegment assessment IS in TTS-PIPELINE-1 criterion 9 (visible in ROADMAP, less visible in SPRINT_QUEUE summary — queue truncation issue, not scope drift)

**Narrowing:** Rather than splitting TTS-PIPELINE-1 into two sprints:
1. **Strengthen the existing front-loaded gates** — TTS-CACHE-HARDEN-1's cache-hit parity test (criterion 6) and TTS-EVENT-SYNC-1's Phase 0 fixture proof are already the "earlier contract gate" the auditor wants. Make these hard gates, not advisory.
2. **TTS-PIPELINE-1 remains as the E2E integration + stress sprint** — its value is the cross-module chain trace, not redundant contract tests. It builds ON the gates from earlier sprints.
3. **Update SPRINT_QUEUE.md pointer** for TTS-PIPELINE-1 to explicitly mention the NarrationSegment assessment criterion so the queue summary doesn't create the impression of scope drift.

**Risk of calibration drift:** Low — no scope change, just gate enforcement.

---

### F7 — Alignment Model Gap (TransformFn = string → string)

**Auditor finding:** The normalizer's `TransformFn` is one-way and doesn't natively support alignment mapping. The implementation review's A9 warning says extensibility doesn't imply alignment readiness.

**Disposition:** Accept with narrowing (subsumed by F3 and F5 dispositions)

**Why:** TTS-EVENT-SYNC-1 already addresses this directly:
- A9 note explicitly acknowledges the gap and specifies the diff-based approach
- Phase 0 gate item 2 requires proving the approach with adversarial fixtures BEFORE implementation
- Criterion 1 specifies the alignment map contract
- The spec includes an escalation path if diff-based mapping fails (tracked-transform approach or scoped mapping)

**Narrowing:** The Phase 0 gate (strengthened per F3 disposition) covers this. No additional sprint or spec change needed beyond what F3 and F5 already prescribe.

**Risk of calibration drift:** Medium — the diff-based approach may not survive Phase 0 testing. The spec's escalation path handles this.

---

### F8 — Registry Not Yet Runtime Dispatch

**Auditor finding:** `useNarration.ts` hard-codes engine branches for start/speak/pause/resume/rate. The registry is informational, not runtime dispatch.

**Disposition:** Defer

**Why:** TTS-REGISTRY-DISPATCH-1 was dissolved on 2026-05-15 with explicit rationale: registry-driven strategy dispatch adds no value with a single active engine. The registry exists (`TTS-REGISTRY-1`) but dispatch routing is unnecessary until a second engine is reactivated. The auditor's observation is correct but explicitly addressed by the dissolution decision.

**Placement:** This work reactivates only if/when a second engine is promoted from dormancy. It is not on the TTS Architecture Completion critical path.

**Risk of calibration drift:** None — deliberate deferral, not oversight.

---

## Exact Roadmap Rewrite Actions

### Action 1: ENGINE-DORMANCY-1 Why paragraph — reframe as posture shift

**File:** ROADMAP.md, line ~558-559

**Current Why:** "MOSS-Nano and Pocket TTS are functional but add maintenance surface area and test instability (the MOSS Nano probe failures that block TTS-INTEGRATE-1). Disabling them at the settings boundary removes distractions, unblocks the integration merge, and lets us focus entirely on Kokoro narration quality, timing accuracy, and reliability."

**Revised Why:** "MOSS-Nano and Pocket TTS are currently live and selectable — both are registered with available posture, routed by useNarration, and exposed through active IPC handlers. They are functional but add maintenance surface area and test instability (the MOSS Nano probe failures that block TTS-INTEGRATE-1). This sprint performs a deliberate product-posture reduction: disabling them at the settings boundary and IPC runtime entry points, unblocking the integration merge, and focusing all TTS energy on Kokoro narration quality, timing accuracy, and reliability."

### Action 2: TTS-CACHE-HARDEN-1 — add PM2 mapping note + documentLocator enrichment

**File:** ROADMAP.md, TTS-CACHE-HARDEN-1 criterion 3

**Append to criterion 3:** "(This criterion addresses the PM2 phase brief's 'triple-storage reduction' — timing truth expressed via one canonical enum, not three overlapping representations.)"

**Add new opportunistic criterion 10:** "Enrich `documentLocator` construction in `kokoroStrategy.ts:151-168` to populate `sectionId` (current EPUB section identifier) in addition to `bookId`. The `TtsCacheDocumentLocator` type already anticipates these fields but they are currently unpopulated. *(Do if kokoroStrategy.ts is already open for cache-parity work; otherwise defer.)*"

### Action 3: TTS-EVENT-SYNC-1 — narrow opening + strengthen Phase 0 gate

**File:** ROADMAP.md, TTS-EVENT-SYNC-1

**Revised What (first sentence):** "Promote direct word-boundary event callbacks from the Kokoro scheduler to the primary highlight-advance trigger, demoting the RAF-based audio-progress polling loop from the word-highlight hot path. RAF interpolation is retained for progress bar display, time-remaining estimation, and as a fallback for non-word-native timing modes."

**Strengthened Phase 0 gate — add item 5 (hard stop):**
"- **Segment identity scoping (hard stop):** Before implementation, assess whether a `NarrationSegment` type (structure-stable, normalization-independent) is needed for the alignment map and downstream highlight anchoring to be coherent. If yes: define the type in this sprint (type definition + initial usage in alignment map — bounded addition, not a separate sprint). If no: document why cache-derived `chunkId` suffices for the current finish line and what conditions would trigger a standalone segment identity sprint before KOKORO-EXPORT-1. This assessment is a hard gate — do not proceed to implementation without a documented decision."

### Action 4: TTS-PIPELINE-1 — update SPRINT_QUEUE.md pointer

**File:** SPRINT_QUEUE.md, TTS-PIPELINE-1 pointer

Add to the WHAT or WHERE section: "Includes NarrationSegment domain type assessment (criterion 9 in ROADMAP spec) — evaluates whether PlannedChunk / SegmentNormalizationResult / TtsCacheIdentityV2 / TimingMetadataChunk should consolidate into a single domain type."

### Action 5: CLAUDE.md system state — fix present-tense accuracy

**File:** CLAUDE.md, "Current System State" header line

**Current snippet (representative):** "Engine posture: Kokoro sole active engine; MOSS-Nano dormant/disabled; Pocket TTS dormant/disabled; Qwen retired/disabled."

**Revised:** "Engine posture: Kokoro default/active; MOSS-Nano and Pocket TTS live/selectable (dormancy pending ENGINE-DORMANCY-1); Qwen retired/disabled."

### Action 6: Governance repair cadence — not deferred to TTS-ARCH-DOC-1

**No file change.** Standing practice: each sprint closeout's Herodotus pass already verifies governance alignment (CLAUDE.md, ROADMAP.md, TECHNICAL_REFERENCE.md, LESSONS_LEARNED.md). The audit's concern about "TTS-ARCH-DOC-1 as the only governance correction point" is already addressed by the mandatory Herodotus pass. No additional mechanism needed.

---

## Grouped Implementation Packages

### Package A: Immediate Governance Repairs (pre-dispatch, Cowork-only)

1. Apply Action 1 (ENGINE-DORMANCY-1 Why reframe) — ROADMAP.md edit
2. Apply Action 2 (TTS-CACHE-HARDEN-1 PM2 note + documentLocator) — ROADMAP.md edit
3. Apply Action 3 (TTS-EVENT-SYNC-1 narrowing + Phase 0 strengthening) — ROADMAP.md edit
4. Apply Action 4 (TTS-PIPELINE-1 queue pointer update) — SPRINT_QUEUE.md edit
5. Apply Action 5 (CLAUDE.md present-tense accuracy) — CLAUDE.md edit

**Effort:** ~15 minutes. Text edits only. No code changes.

### Package B: Sprint Execution (unchanged sequence)

Execute the conveyor belt as specified, in unchanged order:

1. ENGINE-DORMANCY-1 (with revised framing)
2. TTS-INTEGRATE-1 (unchanged)
3. TTS-CACHE-HARDEN-1 (with PM2 mapping note + opportunistic documentLocator)
4. TTS-EVENT-SYNC-1 (with narrowed language + hard-stop Phase 0 gate including segment identity scoping)
5. NORMALIZER-ENRICH-1 (unchanged)
6. TTS-RENDER-MAP-1 (unchanged)
7. TTS-PIPELINE-1 (with NarrationSegment assessment visible in queue pointer)
8. TTS-ARCH-DOC-1 (unchanged)

### Package C: Audit Procedure Lessons

1. Document ROADMAP.md truncation risk for future audit packaging
2. For files >50KB, either split across batches or use GitHub repo ingestion path

---

## Blocking Decisions Requiring User Input

**None.** All dispositions are actionable without user input. The segment identity assessment in TTS-EVENT-SYNC-1's Phase 0 gate will produce a decision (define the type in-sprint or defer to KOKORO-EXPORT-1), but that decision is made by the implementer during sprint execution, not by the user before dispatch.

---

## Testing/Validation Plan

| Sprint | Front-Loaded Gate | Sprint-Internal Tests | What It Proves |
|--------|-------------------|----------------------|----------------|
| TTS-CACHE-HARDEN-1 | — | Cache-hit parity test (criterion 6) | Cached chunks carry same metadata as fresh chunks |
| TTS-EVENT-SYNC-1 | Phase 0 fixture proof (hard stop) + segment identity scoping (hard stop) | Alignment map golden fixtures, event-driven sync E2E | Diff-based alignment is correct; segment identity is scoped |
| NORMALIZER-ENRICH-1 | TTS-EVENT-SYNC-1 alignment table exists | ≥18 new golden fixtures | Enriched transforms maintain alignment compatibility |
| TTS-PIPELINE-1 | All upstream gates passed | Cross-module E2E trace + stress fixtures + NarrationSegment assessment | Full pipeline chain is honest; domain type decision documented |

---

## Corrected Execution Order

**No change to sprint sequence.** The auditor's recommendations are addressed by tightening existing specs and gates, not by resequencing or inserting sprints.

| Seq | Sprint | Change from Current |
|-----|--------|-------------------|
| 1 | ENGINE-DORMANCY-1 | Why paragraph reframed (Action 1) |
| 2 | TTS-INTEGRATE-1 | No change |
| 3 | TTS-CACHE-HARDEN-1 | PM2 mapping note + opportunistic documentLocator (Action 2) |
| 4 | TTS-EVENT-SYNC-1 | What narrowed + Phase 0 gate strengthened with segment identity scoping (Action 3) |
| 5 | NORMALIZER-ENRICH-1 | No change |
| 6 | TTS-RENDER-MAP-1 | No change |
| 7 | TTS-PIPELINE-1 | Queue pointer updated (Action 4) |
| 8 | TTS-ARCH-DOC-1 | No change |

---

## Final Decision-Ready Conclusion

The audit identifies real framing and documentary discipline issues but no architectural flaws. The codebase is stronger than the roadmap's documentary discipline — a finding we agree with.

**What we accept:** Current-state language repair, ENGINE-DORMANCY-1 reframing, TTS-EVENT-SYNC-1 narrowing, Phase 0 hard-stop gates, front-loaded contract testing through existing sprint criteria, PM2↔ROADMAP reconciliation.

**What we narrow:** The segment identity sprint insertion (folded into TTS-EVENT-SYNC-1 Phase 0 assessment), the TTS-PIPELINE-1 split (existing gates already provide the earlier contract verification), and the TTS-CACHE-HARDEN-1 scope expansion (opportunistic items already in spec).

**What we defer:** Registry-driven runtime dispatch (deliberate dissolution, single active engine).

**What we reject:** Nothing — all findings have merit and are addressed.

The conveyor remains 8 sprints in the same order. Package A (governance text edits) can be applied immediately. The roadmap becomes dispatch-safe after those edits land.
