BLURBY

# Sprint Queue

**Purpose:** Conveyor belt of ready-to-dispatch sprint specs. Pull the top pointer, read the referenced Roadmap section, then execute from the full spec. After completion, remove it, log it, backfill to ≥3.

**Queue rules:** FIFO — top sprint executes next. ≥3 depth maintained at all times. If depth drops below 3 after completion: Cluade Code investigates bottlenecks and issues; Cowork brainstorms and drafts specs (if next work is known) or stops to discuss (if not); Claude CLI performs work/receives dispatches.

No dispatch fires until ≥3 pointers exist with full specs in the Roadmap, and no code-changing pointer is dispatch-ready unless its referenced spec names explicit edit-site coordinates.

Desktop v2.0 scope lock: no exploratory TTS/model or non-desktop expansion work may dispatch inside Desktop v2.0. The only completed TTS/model work in this finish line is MOSS-NANO-13a–13e plus POCKET-TTS-1, and the release posture is Kokoro default/available, MOSS-Nano recommended opt-in, Pocket TTS available opt-in, and Qwen retired/disabled. After `POSTV2-REVIEW-1`, the approved TTS direction is Kokoro deepening, not successor-model exploration.

Parallel dispatch rule: code-changing sprints may run in parallel only when lane ownership is explicit and shared-core freeze files are not edited by both sprints at the same time.

**Pointer format:** Each queue pointer is an abbreviated dispatch, not the full spec. Print and maintain pointers in this exemplar shape:

```text
Sprint: <ID> — <short title>
Status: <why this sprint is queued now; source close-out, blocker, or promotion>
Type: <diagnostic / implementation / cleanup / docs / verification; major non-goals>

WHAT: <exact change, split, investigation, or product behavior to create>

HYPOTHESIS: <what this sprint is proving/falsifying, including decision branches>

WHERE:
  - <primary source file/doc/test coordinates and live anchors>
  - <full Roadmap/spec path and governing evidence docs>

HOW (Phase 0):
  <agent> [model] {effort}: <enumeration, branch, guardrails, read-order, or diagnostic setup>

HOW (Implementation):
  <agent> [model] {effort}: <bounded edits or evidence generation responsibilities>

HOW (Verification):
  <agent> [model] {effort}: <focused tests, full tests/build, artifact checks, expected pass/fail classification>

HOW (Review / Closeout):
  <agent> [model] {effort}: <spec compliance, quality review, docs, commit/merge/push policy>
```

`WHERE` is the source of truth for the full spec; the pointer should be specific enough to route work, but not paste the entire task list.

**How to use:**
1. Pull the top pointer block
2. Open the Roadmap/spec section listed in `WHERE` — that's the full dispatch spec
3. Confirm the full spec includes explicit edit-site coordinates for every planned code change: file, function/method, approximate live anchor, and exact modification type. If any code-changing step lacks coordinates, stop and harden the spec before dispatch.
4. Execute from the Roadmap spec under `gog-lead` orchestration with the named sub-agent roster
5. After successful completion: CLI auto-merges by default unless the sprint spec explicitly says not to; doc-keeper marks the Roadmap section COMPLETED, removes the pointer, and logs it to the completed table
6. Cowork prints the next pointer and checks queue depth


---

```
SPRINT QUEUE STATUS:
Finish line: TTS Architecture Complete — Kokoro as sole active local/cacheable model engine (Web Speech remains a platform fallback), every implicit TTS architecture decision made explicit, tested, and debuggable.
Queue depth: 8 prepared FIFO pointers (GREEN; 8 full specs, 0 stubs)
Active head: ENGINE-DORMANCY-1 — dispatch-ready. SK-HYG-2 completed without displacing this head.
Health: GREEN. Findings integration (2026-05-15 PM2): TTS-CACHE-HARDEN-1 added between TTS-INTEGRATE-1 and TTS-EVENT-SYNC-1 — addresses cache-hit timing parity (impl review A8), timing type harmonization, IPC shape validation, and cache key safety. Source: Kokoro TTS Implementation Review (2026-05-15) + Cross-Codebase TTS Literature Review (2026-05-11). Existing sprints updated with findings-derived criteria: TTS-EVENT-SYNC-1 (A9 note), TTS-PIPELINE-1 (cache parity test + stress fixtures), TTS-ARCH-DOC-1 (error taxonomy + findings provenance + cache evolution). Parallel Lane E hygiene work completed as SK-HYG-2 and did not alter the TTS FIFO conveyor.
Roadmap reviews: 2026-05-02 AM → 2026-05-02 PM → 2026-05-04 PM → 2026-05-10 PM → 2026-05-11 PM → 2026-05-14 PM → 2026-05-15 PM → **2026-05-15 PM2** (findings integration; TTS-CACHE-HARDEN-1 added; 8-sprint conveyor; eager-spec buffer 8/8).
```

## TTS Architecture Completion Conveyor Belt (Active — Kokoro-Only)

| Seq | Sprint | Stage | LOE | Deps | Status |
|-----|--------|-------|-----|------|--------|
| 1 | ENGINE-DORMANCY-1 | Stage 0: Kokoro Focus | S | None | Full spec — dispatch-ready |
| 2 | TTS-INTEGRATE-1 | Stage 1: Sync & Diagnostics | S-M | ENGINE-DORMANCY-1 | UNBLOCKED by dormancy (Nano probes irrelevant) |
| 3 | TTS-CACHE-HARDEN-1 | Stage 1: Cache Hardening | S-M | TTS-INTEGRATE-1 | Full spec (findings: impl review A8 + lit review §4.6) |
| 4 | TTS-EVENT-SYNC-1 | Stage 2: Event-Driven Sync | M-L | TTS-CACHE-HARDEN-1 | Full spec (research: readest + RealtimeTTS + sioyek; audit F3/F7: segment identity Phase 0 hard gate) |
| 5 | NORMALIZER-ENRICH-1 | Stage 2: Normalizer Enrichment | M | TTS-EVENT-SYNC-1 | Full spec (research: abogen) |
| 6 | TTS-RENDER-MAP-1 | Stage 2: Word Position Index | M | NORMALIZER-ENRICH-1 | Full spec (research: sioyek) |
| 7 | TTS-PIPELINE-1 | Stage 3: Pipeline Truth | M | TTS-RENDER-MAP-1 | Full spec (updated: cache parity + stress fixtures + NarrationSegment domain type assessment) |
| 8 | TTS-ARCH-DOC-1 | Stage 4: Governance | S | All above | Full spec (updated: error taxonomy + provenance + cache evolution) |

Dissolved sprints (2026-05-15 Kokoro-only pivot): TEST-HARNESS-1 (Nano probes irrelevant), TTS-CANARY-1 (sidecar engines dormant), TTS-REGISTRY-DISPATCH-1 (single active engine).

TTS-SYNC-1 and TTS-DIAG-1 are PASS/pushed on branches; they land via TTS-INTEGRATE-1.

Full specs: ROADMAP.md § "TTS Architecture Completion — Active Conveyor Belt" (dispatch fields) + ROADMAP_SPECS.md (architecture decisions, grounding evidence, implementation detail).

## Parallel Governance Hotfix Lane (Standalone)

No standalone parallel governance hotfix is currently queued. SK-HYG-2 completed on 2026-05-16 as a Lane E hotfix after a mid-dispatch Type 3 pivot scope amendment for exact stale path-string repairs.

### Desktop v2.0 Conveyor Belt (Completed)

> All 12 Desktop v2.0 sprints plus 4 post-v2 remediation sprints are complete. Full specs archived to `docs/planning/.Archive/ROADMAP_2026-05-14.md`.

| Sprint | Date | Result |
|--------|------|--------|
| SK-HYG-1 | 2026-05-02 | Roadmap hygiene & queue recovery |
| EINK-6A | 2026-05-02 | E-Ink foundation & greyscale runtime |
| EINK-6B | 2026-05-02 | E-Ink reading ergonomics |
| GOALS-6B | 2026-05-02 | Reading goal tracking |
| MOSS-NANO-13a–13e | 2026-05-02–04 | MOSS-Nano productization → NANO_RECOMMENDED_OPT_IN |
| POCKET-TTS-1 | 2026-05-04 | Pocket TTS available opt-in |
| POLISH-1 | 2026-05-04 | Desktop v2 polish |
| RELEASE-1 | 2026-05-04 | Desktop v2.0 release closeout |
| POSTV2-REL-1 through POSTV2-REVIEW-1 | 2026-05-04–11 | Post-v2 audit remediation |
| KOKORO-DEEPEN-1/2/3 | 2026-05-11 | Kokoro deepening arc |
| TTS-REGISTRY-1 | 2026-05-12 | Provider capability registry |
| TTS-NORMALIZE-1 | 2026-05-13 | Segment normalizer & golden fixtures |
| TTS-CACHE-TIMING-1 | 2026-05-13 | Structured cache keys & timing sidecars |

---

## Post-v2 Audit Remediation (Completed)

| Seq | Sprint | Stage | LOE | Deps | Status |
|-----|--------|-------|-----|------|--------|
| ~~1~~ | ~~POSTV2-REL-1~~ | ~~Release truth~~ | ~~M~~ | ~~RELEASE-1~~ | ✅ complete in `postv2-audit-remediation` worktree — package/version truth, sidecar packaged paths, update install gating |
| ~~2~~ | ~~POSTV2-ENGINE-1~~ | ~~Engine contracts~~ | ~~L~~ | ~~POSTV2-REL-1~~ | ✅ complete in `postv2-audit-remediation` worktree — typecheck green, Qwen fail-closed, Pocket portability/errors, settings/type contracts |
| ~~3~~ | ~~POSTV2-NARR-1~~ | ~~Narrate/security/hygiene~~ | ~~M~~ | ~~POSTV2-ENGINE-1~~ | ✅ complete in `postv2-audit-remediation` worktree — Narrate highlight, URL validation, artifact policy, debt map |
| ~~4~~ | ~~POSTV2-REVIEW-1~~ | ~~Review / commit / merge~~ | ~~S~~ | ~~POSTV2-REL-1 through POSTV2-NARR-1~~ | ✅ complete — reviewed, committed, merged, and pushed; Kokoro Deepening lane advanced |

Closeout: `docs/governance/close-outs/CloseOut.POSTV2-AUDIT-REMEDIATION.2026-05-04.md`.

---

## Ready Queue Pointers

```text
Sprint: ENGINE-DORMANCY-1 — Disable MOSS-Nano And Pocket TTS At Settings Boundary
Status: Dispatch-ready. First sprint in Kokoro-only pivot.
Type: Posture change; disables non-Kokoro engines at settings/selection boundary and IPC entry points. No code deletion.

WHAT: Disable MOSS-Nano and Pocket TTS at the settings boundary and IPC runtime entry points, following the same pattern as Qwen. Profile migration to Kokoro. MOSS Nano probe tests skipped or gated. Unblocks TTS-INTEGRATE-1.

HYPOTHESIS: Disabling sidecar engines at the settings boundary removes test instability, unblocks the integration merge, and lets all TTS energy focus on Kokoro optimization.

WHERE:
  - `ROADMAP.md` § "Sprint ENGINE-DORMANCY-1: Disable MOSS-Nano And Pocket TTS At Settings Boundary"
  - `src/utils/ttsProviderRegistry.ts` (posture update)
  - `src/components/settings/TTSSettings.tsx` (dormancy UX)
  - `main/ipc/tts.js` (IPC guards for nano/pocket handlers)
  - `src/hooks/useNarration.ts` (profile migration)
  - `tests/mossNanoProbe.test.js` (skip or opt-in gate)
  - Reference: POSTV2-ENGINE-1 Qwen-disable pattern

HOW (Implementation):
  Hermes [haiku] {medium}: Apply Qwen-disable pattern to MOSS-Nano and Pocket TTS entries. Profile migration, IPC guards, test skip.

HOW (Verification):
  Hippocrates [haiku] {medium}: Full `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`.

HOW (Review / Closeout):
  Solon [sonnet] {low}: Confirm no Nano/Pocket code deleted, engines unselectable, profiles migrate, probes gated.
```

```text
Sprint: TTS-INTEGRATE-1 — Integrate TTS Sync And Diagnostics Stack
Status: UNBLOCKED by ENGINE-DORMANCY-1 (Nano probes irrelevant after dormancy).
Type: Git integration + verification; no new product behavior beyond landing already-reviewed work.

WHAT: Merge `origin/sprint/tts-sync-1-highlight-controller` first, then merge stacked `origin/sprint/tts-diag-1-diagnostics-bundle` onto canonical main after ENGINE-DORMANCY-1 lands.

HYPOTHESIS: With Nano probes gated by dormancy, the integration merge should pass full `npm test` cleanly.

WHERE:
  - Branch `sprint/tts-integrate-1-sync-diag-main` (or fresh from updated main)
  - Merge source branches:
    - `origin/sprint/tts-sync-1-highlight-controller`
    - `origin/sprint/tts-diag-1-diagnostics-bundle`
  - Governance targets: `ROADMAP.md`, `docs/governance/SPRINT_QUEUE.md`, `CLAUDE.md`

HOW (Implementation):
  Zeus/Codex [opus] {medium}: Merge both branches, resolve conflicts preserving canonical governance freshness plus branch implementation.

HOW (Verification):
  Hippocrates [haiku] {medium}: Run focused sync tests, focused diagnostics tests, `npm run typecheck`, `npm run build`, full `npm test`, and `git diff --check`.

HOW (Review / Closeout):
  Solon + Herodotus [sonnet] {medium}: Confirm both sprints landed on main, update governance to reflect landed state.
```

```text
Sprint: TTS-CACHE-HARDEN-1 — Cache/Pipeline Type Safety And Timing Identity Parity
Status: Queued after TTS-INTEGRATE-1. Findings-driven: impl review A8 + lit review §4.6.
Type: Implementation — cache-hit timing parity, type harmonization, IPC shape validation, cache key safety. No architectural changes.

WHAT: Fix cache-hit/miss observational asymmetry (ScheduledChunk from cache lacks timingTruth/boundaryType that fresh chunks carry). Harmonize timing classification types (3 overlapping concepts → single canonical enum with full-record validation: truth + timestamps + count). Add IPC shape validation. Fix v1 cache key slash encoding. Core gate: 7 criteria. Opportunistic (if touched): dangling promise audit, resume backpressure.

HYPOTHESIS: Cache-hit timing parity is required before TTS-EVENT-SYNC-1 — the highlight sync controller needs timingTruth metadata to make correct decisions, and cache hits currently don't carry it.

WHERE:
  - `ROADMAP.md` § "Sprint TTS-CACHE-HARDEN-1: Cache/Pipeline Type Safety And Timing Identity Parity"
  - `src/utils/audioScheduler.ts:79-103` (ScheduledChunk interface — add timingTruth?, chunkId?)
  - `src/utils/ttsCache.ts:26-55` (loadCachedChunk — rehydrate from sidecar)
  - `src/types/ttsCache.ts:36-52` (classifyTiming helper taking full timing record, timingClassification derivation)
  - `src/types/ttsProvider.ts:4-8` (canonical TtsProviderTimingTruth — no change)
  - `main/tts-cache.js:135` (v1 key slash encoding)
  - `main/ipc/tts.js` (IPC shape guard)
  - `src/utils/generationPipeline.ts` (opportunistic: dangling promise audit, resume flush backpressure — only if touched during core work)

HOW (Implementation):
  Hephaestus [sonnet] {medium}: Core gate — ScheduledChunk field additions, sidecar rehydration, timing harmonization (full-record classifyTiming), IPC guard, v1 key encoding. Opportunistic — promise/backpressure audit if generationPipeline.ts is already open.

HOW (Verification):
  Hippocrates [haiku] {medium}: Cache-hit parity tests, timing derivation tests, v1 slash encoding tests, IPC shape rejection tests, full npm test/typecheck/build.

HOW (Review / Closeout):
  Solon [sonnet] {low}: Verify cache-hit/miss metadata parity, no cache eviction changes, no v1 legacy read path deletion, no engine posture changes.
  Plato [sonnet] {low}: Timing ownership review, IPC boundary cleanliness.
```

```text
Sprint: TTS-EVENT-SYNC-1 — Event-Driven Word Boundary Sync
Status: Queued after TTS-CACHE-HARDEN-1. Priority: IMMEDIATE (user directive).
Type: Architecture change — event-driven word boundary sync (measurement-conditional RAF demotion, not removal). Research-driven (readest, RealtimeTTS, sioyek). Introduces NarrationSegmentAnchor (content-stable segment identity, see AD-1 in ROADMAP_SPECS.md).

WHAT: Promote onTruthSync from visual-only hint to primary highlight-advance trigger. Add normalized→original word alignment table (normalizedToOriginalMap) to segmentNormalizer. Demote RAF getAudioProgress() + queryTime() polling from word-highlight hot path (measurement-conditional — RAF preserved as fallback). Elevate word-boundary emission to provider-level contract (emitsWordBoundaryEvents). Introduce NarrationSegmentAnchor = { bookId, startIdx, endIdx } as content-stable durable identity alongside cache-scoped chunkId.

HYPOTHESIS: Event-driven word boundaries eliminate time→word resolution jitter and reduce highlight latency. The alignment table solves the token-expansion mapping problem (normalized text has more tokens than original). TTS-CACHE-HARDEN-1's timing parity fix ensures cache hits carry timingTruth metadata needed for correct highlight decisions.

A9 NOTE: The TransformFn contract (string→string) is NOT changed. The normalizedToOriginalMap is built during normalization by diffing token lists before/after each transform, not by changing the transform interface. Upgrade deferred unless this approach proves insufficient.

PHASE 0 GATE (hard stop — all must pass before Phase 1 implementation begins):
  (1) Segment identity validation — confirm NarrationSegmentAnchor = { bookId, startIdx, endIdx } is sufficient for all downstream consumers identified in TTS-PIPELINE-1's domain type assessment (criterion 9). Verify chunkId and NarrationSegmentAnchor coexist without collision (AD-1 contract).
  (2) Contract consistency check — verify planner→normalizer→cache→timing type contracts before building on them (TTS-CACHE-HARDEN-1 should have resolved any type-contract drift).
  (3) Alignment map fixture proof — write standalone test covering hard cases (repeated words, punctuation loss, abbreviation/date/currency expansion, ordinals, contractions). If naive diff-based mapping fails ≥2 cases, escalate to tracked-transform or scoped-map approach.
  (4) Baseline latency measurement — record current RAF p50/p95 word-highlight latency.
  (5) RAF fallback preservation — event-driven replaces RAF only for word-native timing; removal is measurement-conditional.

WHERE:
  - `ROADMAP.md` § "Sprint TTS-EVENT-SYNC-1: Event-Driven Word Boundary Sync"
  - `src/utils/segmentNormalizer.ts` (alignment table)
  - `src/types/ttsProvider.ts` (provider-level WordBoundaryEvent type)
  - `src/hooks/narration/kokoroStrategy.ts` (resolve normalizedIdx → originalIdx)
  - `src/hooks/useNarration.ts` (event-driven trigger, remove RAF polling)
  - `src/utils/narrateDiagnostics.ts` (word-boundary-event type)
  - `tests/fixtures/tts-normalization/english-v1.json` (alignment maps)

HOW (Implementation):
  Hephaestus [sonnet] {medium}: Alignment table in normalizer + fixture updates.
  Athena [opus] {medium}: Event-driven sync wiring + provider contract + useNarration refactor.

HOW (Verification):
  Hippocrates [haiku] {medium}: Alignment table tests, event-driven sync tests, full npm test/typecheck/build.

HOW (Review / Closeout):
  Solon [sonnet] {low}: Verify LL-079 (lastConfirmedAudioWordRef ownership unchanged), LL-077 (RAF glide removed from hot path), alignment map integrity.
  Plato [sonnet] {low}: Timing ownership review, provider contract cleanliness.
```

```text
Sprint: NORMALIZER-ENRICH-1 — Kokoro Text Normalization Gap Fill
Status: Queued after TTS-EVENT-SYNC-1.
Type: Normalizer enrichment — 9 new transforms + heteronym disambiguation. Research-driven (abogen kokoro_text_normalization.py).

WHAT: Add missing normalization transforms identified by comparing Blurby's 12-transform pipeline against abogen's 20+ transforms. Add context-window heteronym disambiguation. Bump TTS_NORMALIZER_VERSION.

HYPOTHESIS: Richer normalization produces better Kokoro phonemization for fractions, decimals, URLs, address abbreviations, number ranges, and heteronyms currently sent raw to the model.

WHERE:
  - `ROADMAP.md` § "Sprint NORMALIZER-ENRICH-1: Kokoro Text Normalization Gap Fill"
  - `src/utils/segmentNormalizer.ts` (9 new transform functions + heteronym table)
  - `tests/fixtures/tts-normalization/english-v1.json` (≥18 new fixture entries)

HOW (Implementation):
  Hephaestus [sonnet] {medium}: Add transforms, heteronym table, fixtures. Validate ordering.

HOW (Verification):
  Hippocrates [haiku] {medium}: Golden fixture validation, alignment map integrity, full npm test/typecheck.

HOW (Review / Closeout):
  Solon [sonnet] {low}: Confirm existing fixtures unchanged, version bumped, transform ordering validated.
```

```text
Sprint: TTS-RENDER-MAP-1 — Pre-Built Word Position Index
Status: Queued after NORMALIZER-ENRICH-1.
Type: Performance optimization — O(1) word→DOM position lookup at narration rate. Research-driven (sioyek parallel-array architecture).

WHAT: Build a WordPositionIndex once at render time (when foliate-js renders word spans). Event-driven word-boundary events resolve position via index lookup instead of live DOM querySelector + getBoundingClientRect.

HYPOTHESIS: Pre-built index reduces word-advance latency from ~5-8ms to ≤2ms at p95, eliminating the DOM query bottleneck in the event-driven sync path.

WHERE:
  - `ROADMAP.md` § "Sprint TTS-RENDER-MAP-1: Pre-Built Word Position Index"
  - new `src/utils/wordPositionIndex.ts`
  - `src/components/FoliatePageView.tsx` (build/invalidate/consume index)
  - `src/utils/narrateDiagnostics.ts` (build/miss event types)

HOW (Implementation):
  Hephaestus [sonnet] {medium}: WordPositionIndex class, FoliatePageView integration, invalidation wiring.

HOW (Verification):
  Hippocrates [haiku] {medium}: Performance benchmarks, regression suite, full npm test/typecheck/build.

HOW (Review / Closeout):
  Solon [sonnet] {low}: Verify graceful degradation, invalidation triggers, no narration state machine changes.
```

```text
Sprint: TTS-PIPELINE-1 — Narration Pipeline Integration Test And Normalization Fixture Expansion
Status: Queued after TTS-RENDER-MAP-1.
Type: Test-only (Kokoro pipeline); production edits allowed only for pure-helper extraction that preserves behavior.

WHAT: Cross-module integration test tracing one Kokoro chunk through planner → normalizer (with alignment map) → production cache identity → timing sidecar → word-boundary event → word position index lookup. Cache-hit parity verification (TTS-CACHE-HARDEN-1 end-to-end). Stress fixtures (mixed-length, boundary-edge, rapid pause/resume, all-cache-hit). Expand golden normalization fixtures from 8 to 15+. NarrationSegment domain type assessment: audit the 4 overlapping segment-related types (ScheduledChunk, NarrationSegmentAnchor, NarrationEvent, CacheIdentity) and verify NarrationSegmentAnchor sufficiency for all downstream consumers (export, subtitle, bookmark).

WHERE:
  - `ROADMAP.md` § "Sprint TTS-PIPELINE-1"
  - new `tests/narrationPipelineIntegration.test.ts`
  - `tests/fixtures/tts-normalization/english-v1.json`
  - imports from `src/utils/narrationPlanner.ts`, `src/utils/segmentNormalizer.ts`, `src/types/ttsCache.ts`

HOW (Implementation):
  Hippocrates [haiku] {medium}: Build integration test(s), expand fixture array to 15+.

HOW (Verification):
  Hippocrates [haiku] {low}: Run new integration tests, existing normalizer tests, full tests, build, and diff checks.

HOW (Review / Closeout):
  Solon [sonnet] {low}: Confirm fixture count ≥ 15, integration test covers full Kokoro pipeline chain including event-driven sync and alignment.
```

```text
Sprint: TTS-ARCH-DOC-1 — TTS Architecture Decisions Document
Status: Full spec. Last in conveyor. Documentation-only — no code changes.
Type: Documentation-only; extracts adopt/reject/defer framework + dormancy rationale into standing governance doc.

WHAT: Create docs/governance/TTS_ARCHITECTURE_DECISIONS.md with engine posture decisions, architecture layer inventory, adopt/reject/defer register, key invariants, dormancy contract, research provenance, error taxonomy, findings provenance (both research documents), cache evolution roadmap, and future work sections (11 sections total).

HYPOTHESIS: A single durable governance document for TTS decisions prevents re-litigation and provides onboarding context for future engine evaluation.

WHERE:
  - `ROADMAP.md` § "Sprint TTS-ARCH-DOC-1: TTS Architecture Decisions Document"
  - new `docs/governance/TTS_ARCHITECTURE_DECISIONS.md`
  - Source docs: TECHNICAL_REFERENCE §Narrate, MOSS_DECISION_LOG, QWEN_SUPPORTED_HOST_POLICY, literature review, adversarial review, all sprint closeouts

HOW (Implementation):
  Herodotus [sonnet] {medium}: Read source documents (including both research findings documents), synthesize into 11-section governance doc.

HOW (Verification):
  Solon [sonnet] {low}: Verify every engine has posture entry, every TTS subsystem has layer entry, error taxonomy ≥4 classes, findings provenance covers all P1/P2 items, TECHNICAL_REFERENCE links to new doc.

Effort: S (~1).
```

## Deferred Lanes (Beyond TTS Architecture Completion)

| Lane | Status | Resume Condition |
|------|--------|-----------------|
| MOSS-Nano | Dormant/disabled (ENGINE-DORMANCY-1) | Disabled at settings boundary. Code preserved. Reactivate by changing registry posture + separate product decision. |
| Pocket TTS | Dormant/disabled (ENGINE-DORMANCY-1) | Disabled at settings boundary. Code preserved. Reactivate by changing registry posture + separate product decision. |
| KOKORO-EXPORT-1 | Deferred | Do not queue until TTS Architecture Completion conveyor finishes. Export depends on durable segment identity, cache, timing, and highlight truth. |
| KOKORO-RETIRE-1/2 | Not active | N/A — Kokoro is the sole active local/cacheable model engine; Web Speech remains a platform fallback. |
| Qwen Streaming | Retired/disabled (QWEN-STREAM-4 ITERATE) | Post-v2.0 only by separate approval. |
| EXT-ENR-C | Optional | Post-v2.0. |
| APK-0 through APK-4 | Investigation gates not cleared | Post-v2.0. |
| Phase 7 (Cloud Sync) | Not spec'd | Post-v2.0. |
| Phase 8 (RSS/News) | Not spec'd | Post-v2.0. |

---

## Completed Sprints (Recent — Desktop v2.0 Review Window)

| Sprint | Date | Decision/Result |
|--------|------|-----------------|
| TTS-INTEGRATE-1 | 2026-05-15 | BLOCKED — Clean integration worktree `C:\tmp\Blurby-tts-integrate-1` on branch `sprint/tts-integrate-1-sync-diag-main` merged TTS-SYNC-1 first and stacked TTS-DIAG-1 second. Focused sync verification passed 9 files / 94 tests; focused diagnostics verification passed 4 files / 18 tests; `npm run typecheck` and `npm run build` passed. Full `npm test` failed in `tests/mossNanoProbe.test.js` with 3 performance-class failures, so no commit, push, or merge was performed. |
| TTS-DIAG-1 | 2026-05-15 | PASS — Provider-neutral `tts-diagnostics-v1` narration diagnostics bundle is implemented on stacked branch `sprint/tts-diag-1-diagnostics-bundle` at `c97e446`; canonical `main` merge remains gated until TTS-INTEGRATE-1 is unblocked. Bundle captures provider capabilities, selected engine/voice/rate, segment IDs, original/normalized hashes, cache key components, timing sidecar summaries, scheduler truth events, highlight sync decisions, and relevant errors without exporting audio payloads or raw book text by default. Redaction guardrails recursively strip/reject `rawText`, `originalText`, `normalizedText`, and audio-shaped fields; diagnostics observe `HighlightSyncController` decisions without changing cursor ownership. Verification: focused diagnostics slice 4 files / 18 tests, full `npm test` 184 files / 2606 tests, `npm run typecheck`, `npm run build` with existing circular chunk warning, and `git diff --check` passed. |
| TTS-SYNC-1 | 2026-05-15 | PASS — Timing metadata and highlight sync policy are centralized on pushed branch `sprint/tts-sync-1-highlight-controller` at `142dc24`; canonical `main` merge is pending because the main worktree contains unrelated dirty work. `TimingMetadataStore` stores chunk timing metadata with trusted/heuristic/missing classification and queries by chunk, segment, word, or time; `HighlightSyncController` allows word-synced decisions only for trusted word-native timing and downgrades heuristic/missing timing to chunk/segment decisions with no active word. Scheduler/Kokoro/useNarration wiring publishes and stores timing metadata; `ReaderContainer` consumes controller decisions without changing Flow WPM timing, Narrate spoken timing, autoplay behavior, provider defaults, Qwen disablement, or `lastConfirmedAudioWordRef` ownership. Verification: focused pre-change sync baseline 8 files / 85 tests, focused sync regression 9 files / 93 tests, full `npm test` 181 files / 2598 tests, `npm run typecheck`, `npm run build` with existing circular chunk warning, and `git diff --check` passed. |
| TTS-CACHE-TIMING-1 | 2026-05-13 | PASS — Structured v2 TTS cache identity landed alongside legacy v1 compatibility. New entries carry schema/versioned provider, voice, rate bucket, model, source/normalized hashes, normalizer version, pronunciation override hash, document locator, chunk ID, sample rate, and timing truth; v2 disk paths are safe hashed directories under `tts-cache/v2/`. Manifest/audio/sidecar writes are atomic; `.timing.json` sidecars persist duration, trusted/heuristic classification, chunk boundaries, and trusted word timestamps only; corrupt sidecars do not discard readable audio. Verification: focused cache/timing/Kokoro/background suite 8 files / 75 tests, `npm run typecheck`, `npm run build` with existing circular chunk warning, and `git diff --check` passed. Full serialized `npm test -- --maxWorkers=1` reached 186 files / 2642 tests and failed only the pre-existing resource-sensitive MOSS Nano performance probe (`2641` passed / `1` failed); isolated rerun of that file remained unrelated with timeout/performance-threshold failures. |
| TTS-NORMALIZE-1 | 2026-05-13 | PASS — Segment normalizer truth added via `src/utils/segmentNormalizer.ts` and `TTS_NORMALIZER_VERSION = "en-v1"`. Golden fixtures cover conservative English normalization, pronunciation overrides remain first transform and hash-visible, Kokoro receives normalized spoken text while scheduler/display words stay original, and cache identity now includes normalizer version plus source/normalized text hash pair without destructive migration. Verification: focused normalizer/Kokoro/pipeline slice 4 files / 38 tests; broader TTS/provider/settings slice 8 files / 56 tests; `npm run typecheck`; serialized full `npm test -- --maxWorkers=1` 184 files / 2634 tests; `npm run build` passed with existing `settings -> tts -> settings` circular chunk warning; `git diff --check` passed. Default parallel `npm test` reruns were resource-sensitive in pre-existing MOSS Nano performance-threshold tests, which passed isolated. |
| TTS-REGISTRY-1 | 2026-05-12 | PASS — Provider capability truth added for Web Speech, Kokoro, disabled Qwen, MOSS-Nano, and Pocket TTS via `src/types/ttsProvider.ts` and `src/utils/ttsProviderRegistry.ts`. Settings/status surfaces now read scoped provider labels, posture, and readiness hints from registry metadata. Runtime playback behavior, Kokoro default selection, explicit-only fallback semantics, Qwen disablement, Kokoro availability, and public voice-mixing UX were unchanged. Verification: focused registry/settings slice 6 files / 32 tests; broader TTS/settings/narration slice 9 files / 52 tests; `npm run typecheck`; full `npm test` 183 files / 2629 tests; `npm run build` passed with existing `settings -> tts -> settings` circular chunk warning; `git diff --check` passed. |
| KOKORO-DEEPEN-3 | 2026-05-11 | PASS (evidence closeout) — Weighted Kokoro formula mixing is non-viable on Blurby's current `kokoro-js` / ONNX runtime. Evidence probe added at `scripts/kokoro_voice_mix_probe.mjs` with live artifact run `artifacts/kokoro/voice-mix-probe/kokoro-deepen-3-evidence/summary.json`; focused tests added in `tests/kokoroVoiceMixProbe.test.js` to cover formula parsing and non-viability verdict behavior. Findings: valid single voices pass, weighted formula strings are rejected as unknown voice IDs, and zero/negative weights are invalid at parser level. No public voice-mixing UX was introduced and no default Kokoro behavior changed. |
| KOKORO-DEEPEN-2 | 2026-05-11 | PASS (branch closeout) — Long-form chunk/timing narration hardening implemented on `sprint/kokoro-deepen-2-clean-main`: shared natural chunks remain deterministic, Narrate chunk visuals are driven via Kokoro chunk boundaries, active-word highlight is trusted-timestamp gated, and chunk-only fallback is enforced when timing is missing. Verification: focused chunk/timing lane passed (`96/96`), `npm run typecheck` passed, `npx vite build --configLoader runner` passed, `git diff --check` passed. Full-suite run remains blocked by unrelated pre-existing `tests/mossNanoProbe.test.js` python-env failures and unrelated `.tmp` mirror test imports. |
| KOKORO-DEEPEN-1 | 2026-05-11 | PASS — Kokoro preflight/status truth implemented across main process, worker, IPC/preload, renderer settings, shared types, tests, and setup/troubleshooting docs. Existing Kokoro playback semantics preserved. Verification: focused affected tests passed 5 files / 78 tests; full `npm test` passed 181 files / 2617 tests; `npm run build` passed with existing circular chunk warning. |
| POSTV2-REVIEW-1 | 2026-05-11 | PASS — Post-v2 remediation and CHUNK-SYNC Flow visual work reviewed, committed, merged, and pushed. Queue advanced into Kokoro Deepening. |
| POSTV2-AUDIT-REMEDIATION | 2026-05-04 | PASS — Post-v2 audit remediation implemented in isolated worktree `C:\tmp\Blurby-worktrees\postv2-audit-remediation` on branch `postv2-audit-remediation`. POSTV2-REL-1 fixed package/release truth, version `1.75.1`, packaged sidecar path resolution, update install gating, and release-doc honesty. POSTV2-ENGINE-1 made `npm run typecheck` green, fail-closed Qwen IPC/stream compatibility, stale Qwen profile migration to Kokoro, Pocket profile support, Pocket/Nano error separation, and settings/type contract tightening. POSTV2-NARR-1 fixed EPUB Narrate highlighting, `open-doc-source` URL validation, artifact policy, Kokoro/Qwen copy, and debt mapping. Verification: `npm run typecheck` passed; full `npm test` passed 170 files / 2521 tests; `npm run build` passed with existing `settings -> tts -> settings` circular chunk warning; `git diff --check` passed; focused `tests/mossNanoProbe.test.js` passed 132 tests. Subsequently landed by `POSTV2-REVIEW-1`. |
| RELEASE-1 | 2026-05-04 | PASS — Desktop v2.0 release closeout completed. Release notes/checklist: `docs/planning/desktop-v2.0-release-notes.md`, `docs/planning/desktop-v2.0-release-checklist.md`. Engine posture preserved exactly: Kokoro default/available, MOSS-Nano recommended opt-in, Pocket TTS available opt-in with upstream synthesis scaffolded pending separately approved adapter work, Qwen retired/disabled. |
| POLISH-1 | 2026-05-04 | PASS — Desktop v2 polish completed across TTS, E-Ink, and Reading Goals settings surfaces. Copy now consistently states Kokoro default/operational floor, MOSS-Nano recommended opt-in, Pocket TTS available opt-in with upstream synthesis scaffolded pending separately approved adapter work, and Qwen retired/disabled for Desktop v2. E-Ink switches gained keyboard-operable switch semantics; Reading Goals empty/action states were cleaned up. Focused settings regression suite passed 9 files / 36 tests; full `npm test` passed 170 files / 2550 tests; `npm run build` passed with the existing `settings -> tts -> settings` circular chunk warning; `git diff --check` passed; `npm audit --audit-level=high` passed with 3 moderate `uuid` findings and no high-severity findings. RELEASE-1 is unblocked. |
| POCKET-TTS-1 | 2026-05-04 | PASS — Pocket TTS added as a third explicit opt-in engine path. Engine posture: Kokoro remains default/available, MOSS-Nano remains recommended opt-in from 13e, Pocket TTS is available opt-in, and Qwen remains disabled. Scope guardrails held: no comparative engine gate, no MOSS-Nano productization changes, no Kokoro default change, no Qwen reactivation, and no public voice-cloning UX in v2.0. Verification: focused Pocket tests 4 files / 30 tests; full `npm test` 169 files / 2548 tests; `npm run build` passed with the existing `settings -> tts -> settings` circular chunk warning. |
| MOSS-NANO-13e | 2026-05-04 | PASS — product decision closeout recorded Nano as `NANO_RECOMMENDED_OPT_IN` from 13d's existing canonical evidence. Evidence path: `artifacts/tts-eval/moss-nano-13d-live-capture/moss-nano-13d-live-evidence.json`; final gate output: `artifacts/tts-eval/moss-nano-13d-live-capture/gate/`; trace counts Page 42, Focus 44, Flow 43, Narrate 39; gate PASS with hard failures 0/7 and warnings 0/3. Product posture: MOSS-Nano recommended opt-in local engine, Kokoro default/available, Qwen disabled, no Kokoro retirement lane. No live-capture rerun, no model comparison, no Pocket TTS work, no default-engine change. Memo: `docs/testing/moss-nano-13e-productization-memo.md`. |
| MOSS-NANO-13d | 2026-05-03 | PASS — live four-mode capture evidence is ready for the productization decision. Automated Electron live capture became the primary path after manual fallback was paused. Real app-selected Nano evidence artifact: `artifacts/tts-eval/moss-nano-13d-live-capture/moss-nano-13d-live-evidence.json`; schema `moss-nano-live-evidence.v2`; `evidenceKind/source: real-app-selected-nano`; real selected Nano; `runtime.syntheticAudio: false`; `timingTruth: segment-following`; `wordTimestamps: null`. Trace counts: Page 42, Focus 44, Flow 43, Narrate 39. Provenance was tightened after review to require observed `engine-selection selectedEngine:nano` and observed `fallback-policy policy:explicit-only`; top-level assertions cannot substitute. Final gate command: `node scripts/tts_eval_runner.mjs --matrix --tag moss-nano-12 --run-id moss-nano-13d-live-capture-gate --out artifacts/tts-eval/moss-nano-13d-live-capture/gate --nano-live-evidence artifacts/tts-eval/moss-nano-13d-live-capture/moss-nano-13d-live-evidence.json --gates`. Final gate: PASS, hard failures 0/7, warnings 0/3, decision `NANO_RECOMMENDED_OPT_IN`, reasons none. Sprint decision: `LIVE_CAPTURE_READY_FOR_PRODUCT_DECISION`. Verification: focused 7 files / 113 tests; full `npm test` 165 files / 2518 tests; `npm run build` passed with circular chunk warning `settings -> tts -> settings`; `npm audit --audit-level=high` passed with 3 moderate `uuid` findings; `git diff --check` passed; no Electron process left. No default-engine change, no Kokoro retirement, no Qwen reactivation. |
| MOSS-NANO-13c | 2026-05-03 | PASS — provenance-backed live evidence schema/producer/gate landed for selected Nano productization decisions. `scripts/tts_eval_runner.mjs` now builds `moss-nano-live-evidence.v2` artifacts from explicit per-mode live trace inputs via `--nano-live-evidence-out` and repeated `--nano-live-trace mode=path`, and `evaluateMossNanoLiveEvidenceGate()` requires top-level provenance, linked trace artifacts, event-count agreement, selected Nano in the trace, segment-following timing, `wordTimestamps: null`, quantitative latency/cache/prefetch/recycle fields, and `runtime.syntheticAudio: false`. Legacy boolean JSON, simulated evidence, missing modes, non-Nano-selected traces, and synthetic audio traces cannot promote. Decision label: `PROVENANCE_GATE_READY_NO_LIVE_CAPTURE`; at 13c closeout Nano remained experimental/non-default pending a clean four-mode live capture run, which 13d has since supplied for the 13e decision. Verification: focused 6 files / 94 tests; full `npm test` 163 files / 2495 tests; `npm run build` passed with existing `settings -> tts -> settings` circular chunk warning; `npm audit --audit-level=high` passed with moderate-only `uuid` advisories; `git diff --check` passed. |
| GOALS-6B | 2026-05-02 | PASS — optional local-first reading goals shipped for daily pages, daily minutes, and weekly books with settings create/edit/delete, library widget progress, page/word advance tracking, active reading minutes, book completion progress, local daily/weekly resets, and streak display. Review hardening added latest-goals overwrite protection, idle/visibility-gated page-mode minutes, high-water page deltas, DST-safe local weekly reset math, and aligned Electron API stub defaults. Verification: full `npm test` 156 files / 2429 tests, `npm audit --audit-level=high` with only existing moderate `uuid` advisories, `git diff --check`, `npm run build` with existing circular chunk warning (`settings -> tts -> settings`). Solon final spec spot-check APPROVED; Plato quality re-review READY. Branch: `sprint/goals-6b-reading-goals`. |
| EINK-6B | 2026-05-02 | PASS — e-ink Flow now uses instant 20-line stepped chunks instead of smooth/per-line scroll; Focus e-ink phrase grouping is shared/tested for 2-3 word bursts; adaptive ghosting refresh accumulates content-change load while preserving manual page-turn interval fallback. Verification: focused EINK/Flow slice 5 files / 93 tests, full `npm test` 151 files / 2407 tests, `npm run build`, `npm audit --audit-level=high`, `git diff --check`. |
| EINK-6A | 2026-05-02 | PASS — e-ink display behavior decoupled from theme via independent `einkMode`; v9 settings migration/defaults added; `[data-eink="true"]` carries runtime behavior while `[data-theme="eink"]` remains optional greyscale palette. Verification: focused EINK/NARR 36 tests, full `npm test` 150 files / 2397 tests, build, high audit, diff check. |
| SK-HYG-1 | 2026-05-02 | Roadmap hygiene & queue recovery. Archive-forward, Desktop v2.0 conveyor restored. BRAND-HYG-1 later shelved/no-op in this checkout because scoped brand edits were absent. |
| QWEN-STREAM-4 | 2026-04-21 | ITERATE — streaming not promoted |
| READER-4M-3 | 2026-04-19 | Global word anchor + cross-mode continuity |
| READER-4M-2 | 2026-04-18 | Standalone narrate mode + four-button controls |
| QWEN-STREAM-3 | 2026-04-20 | Streaming hardening + evidence + decision gate |
| QWEN-STREAM-2 | 2026-04-20 | StreamAccumulator + streaming strategy + live playback |
| QWEN-STREAM-1 | 2026-04-18 | Streaming sidecar foundation |
| MOSS-NANO-12 | 2026-05-02 | NANO_EXPERIMENTAL_ONLY |
| MOSS-NANO-11 | 2026-05-01 | NANO_EXPERIMENTAL_ONLY / KEEP_KOKORO_DEFAULT |

---

## Completed Sprints (MOSS-NANO Track — Historical)

---

```text
Sprint: MOSS-NANO-13B — Real MOSS Nano App Audio Bridge
Status: COMPLETED 2026-05-03 on main with decision PROMOTE_NANO_TO_REAL_APP_AUDIO_PROTOTYPE.
Type: Runtime integration + readiness truth hardening. No default-engine change, no Qwen reactivation, no Kokoro retirement, no synthetic promotion.

WHAT: Replaced the app-sidecar synthetic preview tone path with real local MOSS-TTS-Nano ONNX synthesis through the Electron tts-nano-* IPC path. The Python bridge validates repo/model/tokenizer/dependencies before reporting ready, disables WeText text normalization for parity with the diagnostic resident path, writes WAV output under .tmp, returns PCM/sample-rate/duration/runtime metadata, and marks real output syntheticAudio:false. Synthetic audio now requires explicit mock mode.

EVIDENCE: Direct app-sidecar smoke reached status ready with backend moss-nano-onnx and modelVariant moss-tts-nano-onnx, then synthesized "MOSS Nano real audio smoke test." to a 48000 Hz WAV with durationMs 3360, audioLength 161280, outputPath under .tmp/moss-nano-app-sidecar, and syntheticAudio:false. Focused Nano sidecar/settings/strategy verification passed 4 files / 43 tests; Python compile passed. Integration closeout focused Qwen-disable/Nano verification passed 10 files / 92 tests. Full `npm test` passed 163 files / 2489 tests; `npm run build` passed with the existing circular chunk warning; `npm audit --audit-level=high` passed with moderate-only `uuid` advisories; `git diff --check` passed. Branch `sprint/moss-nano-13b-real-app-audio-bridge` merged to main as c7c133c after cleanup commit 45ff48c.

LIMITS: Nano narration remains segment-following only with wordTimestamps:null. The real sidecar returns PCM over IPC plus outputPath, so long-form usage must remain bounded until live evidence and payload-size hardening are captured. Kokoro remains available; no silent fallback occurs when Nano is selected and blocked.

NEXT: MOSS-NANO-13c builds the provenance-backed live evidence schema/producer/gate on top of the real app audio path.
```

```text
Sprint: MOSS-NANO-12 — Live Four-Mode Evidence Capture
Status: COMPLETED 2026-05-02 with final decision NANO_EXPERIMENTAL_ONLY. This pointer is closed; Nano remains experimental and readiness-gated.
Type: Evidence capture / recommended opt-in gate. No default-engine change, no Kokoro retirement, no simulated-output promotion.

WHAT: Added a live-evidence gate for selected Nano across Page / Focus / Flow / Narrate, plus `--nano-live-evidence` artifact input for future live observations.

EVIDENCE: `scripts/tts_eval_runner.mjs` exports `evaluateMossNanoLiveEvidenceGate()` and writes `mossNanoLiveEvidenceGate` into explicit Nano-12 rollups; `tests/fixtures/narration/matrix.manifest.json` contains four `moss-nano-12` selected-Nano evidence slots; `artifacts/tts-eval/moss-nano-12-live-four-mode-evidence/summary.json` records `mossNanoLiveEvidenceGate.decision: NANO_EXPERIMENTAL_ONLY` because no live observation artifact was supplied.

VERIFICATION: Focused `npm test -- --run tests/ttsEvalMatrixRunner.test.ts` passed `1` file / `26` tests; `npm run tts:eval:matrix -- --run-id moss-nano-12-live-four-mode-evidence --tag moss-nano-12 --out artifacts\tts-eval\moss-nano-12-live-four-mode-evidence` completed `4` runs and wrote the experimental-only decision.

NEXT: Capture real app-selected observations for all four modes and pass them through `--nano-live-evidence` before reconsidering `NANO_RECOMMENDED_OPT_IN`.
```

```text
Sprint: MOSS-NANO-11 — Productization Gate + Default Decision
Status: COMPLETED 2026-05-02 with final decision NANO_EXPERIMENTAL_ONLY / KEEP_KOKORO_DEFAULT. This pointer is closed; Nano remains experimental and readiness-gated.
Type: Evidence-first product gate. No default-engine change, no recommended opt-in promotion, no Kokoro retirement lane.

WHAT: Added an explicit Nano product-gate evaluator, a tagged Page/Focus/Flow/Narrate selected-Nano matrix shape, release/adversarial/audit checklist coverage, and a conservative gate-shape artifact.

EVIDENCE: `scripts/tts_eval_runner.mjs` exports `evaluateMossNanoProductGate()` and writes `mossNanoProductGate` into explicit Nano-11 matrix rollups; `tests/fixtures/narration/matrix.manifest.json` contains four `moss-nano-11` selected-Nano scenarios; untagged matrix runs exclude Nano product-gate scenarios; `artifacts/tts-eval/moss-nano-11-product-gate-shape/summary.json` records `mossNanoProductGate.maxDecision: NANO_EXPERIMENTAL_ONLY`.

VERIFICATION: Focused `npm test -- --run tests/ttsEvalMatrixRunner.test.ts` passed `1` file / `20` tests; `npm run tts:eval:matrix -- --run-id moss-nano-11-product-gate-shape --tag moss-nano-11 --out artifacts\tts-eval\moss-nano-11-product-gate-shape` completed `4` runs and wrote the experimental-only decision cap.

NEXT: MOSS-NANO-12 has now closed as `NANO_EXPERIMENTAL_ONLY`; no recommended opt-in, default change, or Kokoro retirement is recorded here.
```

```text
Sprint: MOSS-NANO-10 — Settings UX + Engine Selection
Status: COMPLETED 2026-05-02 with final decision PROMOTE_NANO_TO_PRODUCTIZATION_GATE. This pointer is closed; Nano is promoted only to productization-gate readiness.
Type: Settings-only experimental opt-in. No default-engine change, no Kokoro retirement, no silent fallback while Nano is selected.

WHAT: Added visible experimental Nano settings option, local sidecar/runtime and bounded lifecycle warning copy, truthful blocked/ready status, ready-only Test Voice preview, and settings-selected Nano narration activation.

EVIDENCE: `src/components/settings/TTSSettings.tsx` shows `Nano AI (Experimental)` while keeping use disabled until `nanoStatus` is ready; `src/components/settings/useMossNanoSettingsStatus.ts` separates visible selection surface from readiness truth; `src/components/settings/ttsPreview.ts` routes ready Nano preview through `nanoStatus` + `nanoSynthesize` and never falls back to another engine; `src/hooks/useNarration.ts` uses Nano only when experimental Nano is enabled and `ttsEngine` is `nano`; `src/types.ts` admits `nano` as an experimental engine.

VERIFICATION: Focused `npm test -- --run tests/mossNanoStrategy.test.ts tests/useNarrationMossNano.test.tsx tests/ttsPreviewTruth.test.ts tests/ttsSettingsMossNano.test.tsx` passed `4` files / `35` tests; adjacent settings/profile/default tests passed `7` files / `60` tests; full `npm test` passed `155` files / `2427` tests; `npm run build` passed with the existing `settings -> tts -> settings` circular chunk warning.

NEXT: MOSS-NANO-11 has now closed as `NANO_EXPERIMENTAL_ONLY` / `KEEP_KOKORO_DEFAULT`; no default change or Kokoro retirement is recorded here.
```

```text
Sprint: MOSS-NANO-9 — Cache/Prefetch + Continuity Handoffs
Status: COMPLETED 2026-05-02 with final decision PROMOTE_NANO_TO_EXPERIMENTAL_UI_CANDIDATE. This pointer is closed; Nano is promoted only to experimental UI candidate readiness.
Type: Experimental continuity prototype. No public UI toggle, no default-engine change, no public TtsEngine change, no Kokoro behavior change.

WHAT: Added bounded Nano segment cache/prefetch and continuity orchestration for adjacent segments, pause/resume, section handoff, and cross-book cleanup while preserving segment-following timing truth.

EVIDENCE: `src/hooks/narration/mossNanoStrategy.ts` now owns a bounded segment cache and prefetch path; cached/prefetched audio is admitted only when generation, book/section scope, voice, rate, start index, and text hash still match. `src/hooks/useNarration.ts` owns Nano continuity scope, next-segment/next-section prefetch, playback trace emission, pause/resume routing, and handoff cache cleanup. `src/types/eval.ts`, `src/utils/ttsEvalTrace.ts`, and `scripts/tts_eval_runner.mjs` now carry Nano segment latency/cache/prefetch summary fields with `timingTruth: "segment-following"` and `wordTimestamps: null`.

VERIFICATION: Focused `npm test -- --run tests/mossNanoStrategy.test.ts tests/useNarrationMossNano.test.tsx tests/ttsEvalTrace.test.ts tests/ttsEvalMatrixRunner.test.ts` passed `4` files / `57` tests; full `npm test` passed `154` files / `2423` tests; `npm run build` passed with the existing `settings -> tts -> settings` circular chunk warning. Local Solon/Plato review found no Kokoro/default/public-UI drift.

NEXT: MOSS-NANO-10 may dispatch as explicit experimental UI candidate work. Nano remains hidden from public engine selection until that sprint deliberately exposes an opt-in surface.
```

```text
Sprint: MOSS-NANO-8 — Narration Strategy + Segment Timing
Status: COMPLETED 2026-05-01 with final decision PROMOTE_NANO_TO_CONTINUITY_PROTOTYPE. This pointer is closed; Nano is promoted only to bounded continuity prototype readiness.
Type: Experimental renderer strategy prototype. No public UI, no default-engine change, no user-facing engine selection, no Kokoro behavior change.

WHAT: Added an experimental Nano narration strategy and test-only useNarration selection plumbing that requests Nano segment audio through the optional sidecar IPC contract and advances only on truthful segment-following boundaries.

EVIDENCE: Added `src/hooks/narration/mossNanoStrategy.ts`; added `useNarration({ experimentalNano: true })`; kept public `TtsEngine` as `web | kokoro | qwen`; used optional `nanoStatus`, `nanoSynthesize`, and `nanoCancel`; scheduled PCM audio through the scheduler with `markPipelineDone()`; set `timingTruth: "segment-following"` and `wordTimestamps: null`; propagated structured `nanoError`; guarded late synth results and stale callbacks after stop/handoff/rate restart/engine switch/unmount; preserved Kokoro default behavior.

VERIFICATION: Focused `npm test -- --run tests/mossNanoStrategy.test.ts tests/useNarrationMossNano.test.tsx` passed `2` files / `20` tests; full `npm test` passed `154` files / `2412` tests; `npm run build` passed with the existing `settings -> tts -> settings` circular chunk warning. Solon approved spec compliance; Plato final quality review APPROVED.

NEXT: MOSS-NANO-9 may dispatch as the bounded cache/prefetch/continuity prototype. Nano remains hidden from public engine selection and Kokoro remains default.
```

```text
Sprint: MOSS-NANO-7 — Sidecar Contract + IPC Prototype
```text
Sprint: MOSS-NANO-7 — Sidecar Contract + IPC Prototype
Status: COMPLETED 2026-05-01 with final decision PROMOTE_NANO_TO_STRATEGY_PROTOTYPE. This pointer is closed; Nano is promoted only to bounded strategy prototype readiness.
Type: App-boundary sidecar + IPC prototype. No renderer engine selection, no normal playback wiring, no user-facing Nano, no Kokoro behavior change.

WHAT: Added an experimental Nano sidecar manager, protocol placeholder, IPC/preload methods, shared API types, and sidecar/IPC tests while preserving Kokoro as the operational floor.

EVIDENCE: Added `main/moss-nano-engine.js` with injectable sidecar adapter, readiness/failure semantics, bounded lifecycle config snapshot, stale-output/request ownership guards, startup-before-request, and cancel/shutdown/restart in-flight settlement; added `main/moss-nano-sidecar.js`; registered experimental `tts-nano-status`, `tts-nano-synthesize`, `tts-nano-cancel`, `tts-nano-shutdown`, and `tts-nano-restart`; exposed `nanoStatus`, `nanoSynthesize`, `nanoCancel`, `nanoShutdown`, and `nanoRestart`; added Nano status/result/failure/Electron API types; added `tests/mossNanoEngine.test.js` and `tests/mossNanoIpc.test.js`.

VERIFICATION: Focused `npm test -- --run tests/mossNanoEngine.test.js tests/mossNanoIpc.test.js` passed `2` files / `14` tests after sandbox `EPERM` escalated rerun; full `npm test` passed `152` files / `2392` tests; `npm run build` passed with the existing `settings -> tts -> settings` circular chunk warning. Solon approved spec compliance; Plato final quality check READY.

NEXT: MOSS-NANO-8 may dispatch as the bounded narration-strategy/segment-timing prototype. `TtsEngine` remains `web | kokoro | qwen`; Nano is not user-facing and Kokoro remains default.
```

```text
Sprint: MOSS-NANO-6F — Full Bounded Soak Promotion Confirmation
Status: COMPLETED 2026-05-01 with final decision PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE_WITH_BOUNDED_LIFECYCLE. This pointer is closed; Nano is promoted only to app-prototype candidate with bounded lifecycle.
Type: Runtime promotion confirmation and governance closeout. No app integration, no renderer work, no Kokoro behavior change.

WHAT: Recorded the final approved bounded lifecycle promotion decision from the full 1800-second/100-segment confirmation, with 6E child-process lifecycle proof included by reference.

EVIDENCE: Canonical artifact `artifacts/moss/moss-nano-6f-full-bounded-soak-promotion-confirmation-v2/promotion-confirmation.json` records source status `ok`, failure class `null`, measured resident soak `1800.0015s`, `100/100` book-like adjacent segments fresh, stale output reuse `0`, readiness memory slope `0.3261MB/min <= 1.5`, p95 final RTF `0.4826 <= 1.5`, p95 first decoded `280ms <= 1500`, crash count `0`, unclassified restarts `0`, and `99` classified RSS-threshold in-process runtime resets at `1750MB`. Shutdown/restart child-process lifecycle evidence is present and passing by reference to `artifacts/moss/moss-nano-6e-lifecycle-proof-v2/summary.json`.

CAVEAT: Raw summary `artifacts/moss/moss-nano-6f-full-bounded-soak-promotion-confirmation-v2/summary.json` still carries older persisted `promotionDecision` / `not-promoting`; consumers must use `promotion-confirmation.json` as canonical for 6F.

NEXT: MOSS-NANO-7 may dispatch as the first app-prototype onboarding sprint. Nano is not the default engine, Kokoro is not retired, and no app integration drift occurred in the 6F confirmation.
```

```text
Sprint: MOSS-NANO-6E — Shutdown / Restart Lifecycle Proof
Status: COMPLETED 2026-05-01 with final decision ITERATE_NANO_RESIDENT_RUNTIME. This pointer is closed; Nano was not promoted to app prototype and no app integration was unlocked.
Type: Runtime lifecycle proof. No app integration, no renderer work, no Kokoro behavior change.

WHAT: Implemented and measured truthful child-process shutdown/restart proof while preserving 6D bounded-recycle evidence as a separate in-process reset shape.

EVIDENCE: `artifacts/moss/moss-nano-6e-lifecycle-proof-v2/summary.json` records `shutdownObserved: true`, `restartObserved: true`, `processRestartActual: true`, clean child PID `24484`, restart child PID `3408`, forced-kill child PID `27340`, no zombie, restart-failed child exit `2`, in-flight child killed/rejected, stale output reuse `0`, and short bounded confirmation `2/2` fresh with p95 post-recycle RTF `1.4647`. The artifact is intentionally `not-promoting` because it is not the full 1800-second/100-segment gate.

HARDENING: `scripts/moss_nano_probe.mjs --shutdown-restart-evidence` now measures clean shutdown, forced kill, no-zombie, restart-clean, restart-failed, and in-flight rejection around real child processes. Promotion-class bounded lifecycle evidence now requires actual child-process restart, measured lifecycle classes, stale-output clean evidence across shutdown/restart/in-flight, and no hidden runtime reuse classification.

VERIFICATION: Focused Nano probe tests passed `132/132`; real lifecycle proof command exited `0`.

NEXT: Do not dispatch MOSS-NANO-7 from 6E alone. A future runtime-only confirmation may rerun the full 1800s/100-segment bounded gate with `--shutdown-restart-evidence`. No app integration, renderer/IPC/selectable-engine work, Kokoro behavior change, or MOSS-3 reopen is unlocked.
```

```text
Sprint: MOSS-NANO-6D — Bounded Resident Lifecycle / Process Recycling
Status: COMPLETED 2026-05-01 with final decision ITERATE_NANO_RESIDENT_RUNTIME. This pointer is closed; Nano was not promoted to app prototype and no app integration was unlocked.
Type: Runtime architecture rescue. No app integration, no renderer work, no Kokoro behavior change.

WHAT: Tested bounded resident lifecycle control instead of assuming one infinite resident Nano process. Implemented and measured in-process runtime reset/recycle controls, restart/prewarm cost, RSS-threshold and segment-limit recycle evidence, stale-output safety, and post-recycle memory/tail metrics.

EVIDENCE: `artifacts/moss/moss-nano-6d-bounded-soak-1800-rss-threshold/summary.json` requested `1800s`, measured `1800.0033s`, completed `100/100` adjacent fresh, stale output reuse `0`, same-identity `runtimeReuseActual: false`, bounded recycle evidence `boundedRuntimeReuseActual: true`, bounded lifecycle actual for measured in-process reset, `processRestartActual: false`, `99` RSS-threshold recycles, restart p50/p95 `8649/8726ms`, prewarm p50/p95 `246/258ms`, readiness memory slope `0.3555MB/min`, post-warmup slope `0`, p95 first decoded `264ms`, p95 final RTF `0.4631`, and readiness failed on `shutdownEvidence`. Targeted evidence: `moss-nano-6d-rss-threshold-b` completed `20/20` fresh with readiness slope `0`, inference slope `1.4665MB/min`, p95 RTF `0.4703`; `moss-nano-6d-recycle-5b` completed `20/20` fresh with recycle count `3`, segments per runtime `[5,5,5,5]`, and p95 RTF `0.5026`.

HARDENING: Bounded lifecycle evidence distinguishes measured in-process reset from same-identity resident reuse and true child-process restart; recycle evidence records count, reasons, segments per runtime, restart/prewarm cost, post-recycle memory slope, and post-recycle tail metrics; warm spare remains unsupported/not observed; stale-output reuse remains fail-closed across recycle/reset.

VERIFICATION: Focused final tests passed 153/153; full npm test passed 2374/2374; npm run build passed with the existing circular chunk warning.

NEXT: Do not dispatch MOSS-NANO-7. Next Nano work must implement/measure true process-boundary shutdown/restart lifecycle before any app-prototype reconsideration. No app integration, renderer/IPC/selectable-engine work, Kokoro behavior change, or MOSS-3 reopen is unlocked.
```

```text
Sprint: MOSS-NANO-3 — In-Process Runtime Reuse And First-Audio Truth
Status: COMPLETED 2026-04-28 with final decision ITERATE_NANO_RESIDENT_RUNTIME.
Type: Runtime diagnostic + evidence hardening only. No app integration, no sidecar IPC, no renderer work, no selectable engine behavior, no Kokoro behavior change.

WHAT: Resident/in-process Nano diagnostic path now exists via scripts/moss_nano_resident_probe.py, wrapper scripts/moss_nano_probe.mjs --runtime-mode resident, and package script npm run moss:nano:resident.

EVIDENCE: Focused tests npm test -- tests/mossNanoProbe.test.js passed 28/28 after known sandbox EPERM escalated rerun; full npm test passed 150 files / 2268 tests; npm run build passed with existing circular chunk warning. Canonical artifacts: moss-nano-3-short-resident internalFirstDecodedAudioMs 513 / RTF 1.7005 / runtimeReuseActual true / memoryGrowthAcrossRunsMb 36.59; moss-nano-3-punctuation-resident internalFirstDecodedAudioMs 541 / RTF 1.2042 / runtimeReuseActual true / memoryGrowthAcrossRunsMb 62.92; moss-nano-3-ort-session-resident requested/applied ORT split with CPU provider intraOp 2 interOp 1 applied, usePerSessionThreads unsupported, internalFirstDecodedAudioMs 516, RTF 1.0962, runtimeReuseActual true; moss-nano-3-stale-output-guard outputFileExistedBeforeRun false, reusedExistingOutputFile false, memory evidence present.

RATIONALE: Nano now proves true resident reuse and internal first decoded audio, improving over MOSS-NANO-2 v2 observed first audio 13.9036s/15.2025s short and 20.0393s/18.6516s punctuation with runtimeReuseActual false. Kokoro baseline remains 1385ms/RTF 0.3337 short and 5616ms/RTF 0.7414 punctuation. Short RTF 1.7005 misses the promotion threshold <=1.5 and memory growth needs soak/tuning, so iterate resident runtime rather than promote.

WHERE:
  - ROADMAP.md: Sprint MOSS-NANO-3 full spec under Flagship-First MOSS Operational Narration Lane
  - scripts/moss_nano_probe.mjs and scripts/moss_nano_probe.py: preserve existing subprocess baseline, share validation if useful
  - scripts/moss_nano_probe.mjs --runtime-mode resident and scripts/moss_nano_resident_probe.py: resident orchestration/runtime path
  - .runtime/moss/MOSS-TTS-Nano/infer_onnx.py: read-only upstream contract source; do not commit .runtime/**
  - tests/mossNanoProbe.test.js: resident summary/reuse/timing/ORT/stale-output coverage
  - artifacts/moss/moss-nano-3-*: canonical resident runtime evidence
  - docs/testing/MOSS_DECISION_LOG.md and docs/testing/MOSS_FLAGSHIP_FEASIBILITY.md: final decision and evidence

NEXT: No app integration, no MOSS-3 reopen, no Kokoro behavior change. Future work, if queued, should be resident runtime tuning/soak/perf only.
```

```text
Sprint: MOSS-NANO-4 — Resident Runtime Optimization + Promotion Retest
Status: COMPLETED 2026-04-29 with final decision ITERATE_NANO_RESIDENT_RUNTIME, explicitly not PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE.
Type: Runtime optimization + promotion retest only. No app integration, no MOSS-3 reopen, no sidecar/renderer/selectable-engine work, no Kokoro behavior change.

EVIDENCE: Best short run moss-nano-4-short-resident-ort-intra2 recorded true reuse; ORT applied CPU intraOp 2 / interOp 1 / sequential / graph all; first decoded 659ms; final RTF 1.3734; p50/p95 1.3734/1.4329; memory growth about 42.57MB. Baseline short was RTF 1.7116 and first decoded 565ms. Best punctuation was first decoded 944ms and final RTF 1.6540. Best bookwarm used the long-form built-in substitute, had 3/3 fresh internal first decoded warm runs, stale output reuse 0, first decoded 727ms, and RTF 1.1252. Decode-full is disqualified/caveated: first decoded 6099ms and memory growth about 103.16MB.

HARDENING: Precompute was requested but precomputeInputsActual=false; no false reuse/precompute claim. Promotion-class summaries now require numeric thresholds/metrics and block requested-vs-actual contradictions. Focused verification only passed 42/42; full verification is reserved for Hippocrates.

NEXT: No app integration, no MOSS-3 reopen, no Kokoro behavior change. Future Nano work, if any, remains resident runtime tuning/soak/perf only.
```

```text
Sprint: MOSS-NANO-5B — Precompute + Adjacent Continuity Closure
Status: COMPLETED 2026-04-29 with final decision ITERATE_NANO_RESIDENT_RUNTIME. This pointer is closed, not dispatch-ready.
Type: Runtime-only rescue. No app integration, no sidecar IPC, no renderer work, no selectable engine behavior, no cache/continuity app integration, no .runtime commits, no Kokoro behavior change.

WHAT: Closed the 5B precompute-request-row and adjacent-continuity evidence loop without unlocking app integration.

EVIDENCE: Focused verification passed: python -m py_compile scripts\moss_nano_resident_probe.py; npm test -- tests/mossNanoProbe.test.js passed 75/75 after known sandbox EPERM escalated rerun. Canonical artifacts: moss-nano-5b-short-resident-ort-intra2 ok, first audio 0.340s, RTF 0.6440, p50/p95 0.6440/0.6610, memory delta 5.81MB, stale false; moss-nano-5b-short-resident-decode-full runtime ok but gate failed, first audio 2.963s > 2.5s, RTF 0.7142, p50/p95 0.6969/0.7142, memory delta 5.60MB, stale false; moss-nano-5b-short-resident-precompute-requestrows runtime ok but precompute blocked, first audio 0.418s, RTF 0.7183, p50/p95 0.7882/0.8012, memory delta 6.15MB, requested=true actual=false partial=true, blocker NO_PRECOMPUTE_REQUEST_ROWS_HOOK, preparedBeforeRun=false, consumedByMeasuredRun=false, requestRowCount=0; moss-nano-5b-adjacent-segments-resident-stable ok, first audio 0.428s, RTF 0.6003, p50/p95 0.5996/0.6003, memory delta 8.14MB, stale false, 5/5 fresh, fair trend ratio 0.0081 <=0.15, crossSegmentStateActual=false, blocker NO_CROSS_SEGMENT_MODEL_STATE_HOOK.

HARDENING: Preserve top-level crossSegmentStateActual; explicit decode-full re-threshold evidence support; fair adjacent trend metric separate from true cross-segment/prosody state; precompute row-consumption evidence required for promotion.

RATIONALE: Do not promote to soak because decode-full misses first-audio gate and precompute request rows are still not consumed. Adjacent fair trend improved and clears runtime stability, but does not prove true cross-segment model state.

WHERE:
  - ROADMAP.md: Sprint MOSS-NANO-5B completed section
  - scripts/moss_nano_resident_probe.py: actual precompute/prompt/audio-tokenizer reuse or named blocker
  - scripts/moss_nano_probe.mjs: summary normalization and promotion-to-soak gates
  - tests/mossNanoProbe.test.js: precompute/decode/adjacent-segment tests
  - artifacts/moss/moss-nano-5b-*: canonical evidence
  - docs/testing/MOSS_DECISION_LOG.md and docs/testing/MOSS_FLAGSHIP_FEASIBILITY.md

NEXT: No app integration, no MOSS-3 reopen, no Kokoro behavior change. At the 5B closeout, MOSS-NANO-6 remained gated until a future sprint met soak/package criteria; MOSS-NANO-5C later supplied that runtime-only soak-candidate gate.
```

```text
Sprint: MOSS-NANO-5C — Segment-First Soak Gate
Status: COMPLETED 2026-04-30 with final decision PROMOTE_NANO_TO_SOAK_CANDIDATE_WITH_SEGMENT_FIRST_GATE. This pointer is closed; it unlocks only MOSS-NANO-6 runtime soak/package work, not app integration.
Type: Runtime-only soak-candidate gate. No app integration, no renderer integration, no sidecar IPC, no selectable engine/cache changes, no Kokoro behavior change, no MOSS-3 reopen, no .runtime commits.

WHAT: Recorded the final2 segment-first product-path gate as a soak-candidate decision while preserving decode-full and precompute caveats.

EVIDENCE: Final artifact artifacts/moss/moss-nano-5c-segment-first-soak-gate-final2/summary.json status ok, promote true, decision PROMOTE_NANO_TO_SOAK_CANDIDATE_WITH_SEGMENT_FIRST_GATE. Gate metrics: first decoded 0.449s <= 0.5s; segment-first short RTF 0.6513 <= 1.5; adjacent fair RTF trend 0.0105 <= 0.15; fresh segments 5 >= 5; stale output reuse 0; session restarts 0; precompute classification non-product-required with status not-required; decode-full classification diagnostic-only-non-product-path.

SUPPORTING DIAGNOSTICS: moss-nano-5c-short-resident-decode-full-diagnostic measured decode-full as diagnostic, not a product blocker. moss-nano-5c-short-resident-precompute-requestrows-rca requested precompute but actual=false with blocker NO_PRECOMPUTE_REQUEST_ROWS_HOOK; RCA says the current high-level path lacks prepared-row consumption, while the lower ONNX path has build/request rows and generate frames for future runtime work.

NEXT: MOSS-NANO-6C later closed as ITERATE_NANO_RESIDENT_RUNTIME. Do not dispatch app integration, renderer integration, sidecar IPC, selectable engine/cache work, Kokoro behavior changes, MOSS-3 reopen, or Kokoro retirement from this closeout.
```

```text
Sprint: MOSS-NANO-6C — Memory / Tail-Latency / Lifecycle Fix
Status: COMPLETED 2026-04-30 with final decision ITERATE_NANO_RESIDENT_RUNTIME. This pointer is closed; Nano was not promoted to app prototype and no app integration was unlocked.
Type: Runtime-only memory/tail-latency/lifecycle hardening. No app integration, no renderer work, no Kokoro behavior change.

WHAT: Recorded targeted 20-segment hardening evidence and kept Nano in runtime iteration.

EVIDENCE: `artifacts/moss/moss-nano-6c-adjacent-20-escalated/summary.json` completed `20/20` fresh with readiness memory slope `9.7639MB/min`, inference slope `10.6414MB/min`, hold slope `0`, p95 first decoded `1240ms`, p95 RTF `3.0416`, and lifecycle not implemented. `artifacts/moss/moss-nano-6c-ort-no-arena-20-escalated/summary.json` completed `20/20` fresh with readiness memory slope `8.563MB/min`, inference slope `8.8964MB/min`, hold slope `0`, p95 first decoded `1768ms`, p95 RTF `3.3251`, and lifecycle not implemented.

HARDENING: Memory endpoint slope is diagnostic-only; readiness memory gate uses the authoritative max of readiness/post-warmup/inference phase slopes; phase fields are required; tail latency failures include machine-readable slow segment evidence; lifecycle validation accepts `lifecycleEvidence.lifecycleClasses` and requires all six measured classes; Nano-6 decision set is only `PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE` / `ITERATE_NANO_RESIDENT_RUNTIME` / `PAUSE_NANO_RUNTIME_RELIABILITY`.

VERIFICATION: Focused final tests passed 143/143; full npm test passed 2364/2364; npm run build passed with the existing circular chunk warning.

NEXT: Do not dispatch MOSS-NANO-7. Targeted gates already failed, so the full 30-minute soak was deferred. Next Nano work must continue resident runtime iteration only. No app integration, renderer/IPC/selectable-engine work, or Kokoro behavior change.
```

```text
Sprint: MOSS-NANO-6B — Resident Soak Memory / Lifecycle Closure
Status: COMPLETED 2026-04-30 with final decision ITERATE_NANO_RESIDENT_RUNTIME. This pointer is closed; Nano was not promoted to app prototype and no app integration was unlocked.
Type: Runtime soak + package feasibility. No app integration, no renderer work, no Kokoro behavior change.

WHAT: Recorded hardened resident soak/package readiness evidence and kept Nano in runtime iteration.

EVIDENCE: canonical long artifact `artifacts/moss/moss-nano-6b-soak-1800-adjacent-100-escalated/summary.json` requested `1800s`, measured `1800.0012s`, completed `100/100` adjacent fresh, recorded stale output reuse `0`, session restarts `0`, crash count `0`, memory slope `12.8416MB/min` failing the `1.5MB/min` gate, adjacent p95 internal first decoded `1088ms` passing the `1500ms` gate, and adjacent p95 final RTF `2.3007` failing the `1.5`/`1.45` gates. Shutdown classes clean/forced/zombie/restart/inflight remain `not-observed`/`not-implemented`; readiness is `not-promoting`.

HARDENING: Real wall-clock soak duration, memory slope based on wall-clock RSS samples, deterministic 100+ book-like adjacent segments, fail-closed synthetic lifecycle evidence, Nano-specific package readiness not inherited from dev/flagship `.runtime` config, machine-readable failed gates/reasons in Nano-6 readiness, clearer preflight source-vs-package evidence fields.

VERIFICATION: Focused tests passed 133/133; final full npm test passed 2354/2354; npm run build passed with the existing circular chunk warning.

NEXT: Do not dispatch MOSS-NANO-7 because app-prototype promotion did not happen. Next Nano work must continue resident runtime iteration only. No app integration, renderer/IPC/selectable-engine work, or Kokoro behavior change.

WHERE:
  - ROADMAP.md: Sprint MOSS-NANO-6 full spec
  - scripts/moss_nano_probe.mjs and scripts/moss_nano_resident_probe.py
  - scripts/moss_preflight.mjs
  - tests/mossNanoProbe.test.js and tests/mossProvisioning.test.js
  - docs/testing/MOSS_RUNTIME_SETUP.md
  - artifacts/moss/moss-nano-6b-soak-1800-adjacent-100-escalated/summary.json

HOW:
  Closed by Herodotus docs closeout against hardened artifacts. No implementation dispatch remains active from this pointer.
```

```text
Sprint: MOSS-NANO-7 — Sidecar Contract + IPC Prototype
Status: COMPLETED with final decision `PROMOTE_NANO_TO_STRATEGY_PROTOTYPE`. Historical pointer only; do not dispatch again.
Type: Main-process sidecar + IPC prototype. No renderer engine selection, no normal playback wiring, no user-facing Nano, no Kokoro retirement.

WHAT: Wrapped resident Nano as a managed Electron main-process sidecar with truthful status, synthesize/cancel/shutdown/restart, request ownership, stale-output guards, and preload bridge methods.

WHERE:
  - ROADMAP.md: Sprint MOSS-NANO-7 full spec
  - main/moss-nano-engine.js and main/moss-nano-worker.js or main/moss-nano-sidecar.js
  - main/ipc/tts.js
  - preload.js
  - src/types.ts
  - tests/mossNanoEngine.test.js and IPC integration tests
```

```text
Sprint: MOSS-NANO-8 — Narration Strategy + Segment Timing
Status: COMPLETED 2026-05-01 with final decision PROMOTE_NANO_TO_CONTINUITY_PROTOTYPE.
Type: Bounded renderer strategy prototype. No default-engine change, no user-facing engine selection, and no Kokoro retirement.

WHAT: Added moss-nano narration strategy, segment-boundary scheduling, global-anchor truth, pause/resume/cancel/status behavior, structured failure propagation, stale-callback ownership guards, and no fake word-level timestamps.

WHERE:
  - ROADMAP.md: Sprint MOSS-NANO-8 full spec
  - src/hooks/narration/mossNanoStrategy.ts
  - src/hooks/useNarration.ts
  - src/types.ts
  - src/utils/audioScheduler.ts only if a generic segment metadata field is needed
  - tests/mossNanoStrategy.test.ts and tests/useNarrationMossNano.test.tsx
```

```text
Sprint: MOSS-NANO-9 — Cache/Prefetch + Continuity Handoffs
Status: READY after MOSS-NANO-8 closed `PROMOTE_NANO_TO_CONTINUITY_PROTOTYPE`.
Type: Continuity/prefetch/cache prototype. No default-engine change.

WHAT: Add Nano startup warm segment, next-segment prefetch, pause/resume, section handoff, cross-book cleanup, cache invalidation, memory/backpressure, and truthful fallback when Nano cannot keep up.

WHERE:
  - ROADMAP.md: Sprint MOSS-NANO-9 full spec
  - src/hooks/narration/mossNanoStrategy.ts
  - src/hooks/useNarration.ts
  - src/utils/ttsCache.ts
  - main/tts-cache.js
  - src/utils/ttsEvalTrace.ts and scripts/tts_eval_runner.mjs
  - tests/narrationContinuity.test.ts and tests/useNarrationMossNano.test.tsx
```

```text
Sprint: MOSS-NANO-10 — Settings UX + Engine Selection
Status: Conditional; dispatch only after MOSS-NANO-9 continuity gates pass.
Type: Experimental user-visible engine onboarding. Kokoro remains default.

WHAT: Expose Nano as an opt-in experimental/local engine with truthful runtime status, provisioning hints, preview/test voice, safe enable/disable, and profile persistence.

WHERE:
  - ROADMAP.md: Sprint MOSS-NANO-10 full spec
  - src/types.ts
  - src/components/settings/TTSSettings.tsx
  - src/components/settings/ttsPreview.ts
  - src/components/ReaderBottomBar.tsx
  - preload.js and main/ipc/tts.js
  - tests/ttsSettingsMossNano.test.tsx, tests/ttsPreviewTruth.test.ts, tests/narrationProfiles.test.ts
```

```text
Sprint: MOSS-NANO-11 — Productization Gate + Default Decision
Status: Conditional final gate after MOSS-NANO-10 ships a green opt-in experimental engine.
Type: Release matrix + adversarial review + default decision. No automatic Kokoro retirement.

WHAT: Decide whether Nano stays experimental, becomes recommended opt-in, becomes default-candidate, or opens a separate Kokoro-retirement lane.

WHERE:
  - ROADMAP.md: Sprint MOSS-NANO-11 full spec
  - docs/testing/TTS_EVAL_MATRIX_RUNBOOK.md
  - docs/testing/TTS_EVAL_RELEASE_CHECKLIST.md
  - docs/testing/TTS_ADVERSARIAL_REVIEW_CHECKLIST.md
  - docs/testing/TTS_ITERATIVE_AUDIT_TRACE_CHECKLIST.md
  - scripts/tts_eval_runner.mjs
  - tests/fixtures/narration/matrix.manifest.json
  - docs/testing/MOSS_DECISION_LOG.md and docs/testing/MOSS_FLAGSHIP_FEASIBILITY.md
```

---

## Queue

| # | Sprint ID | Version | Branch | Tier | CLI Ready? | Blocker |
|---|-----------|---------|--------|------|-----------|---------|
| 1 | MOSS-0 | v1.76.0 | sprint/moss-0-flagship-feasibility | Full | CLOSED | Historical feasibility/setup evidence is recorded in `docs/testing/MOSS_DECISION_LOG.md`. No active dispatch. |
| 2 | MOSS-1 | v1.77.0 | sprint/moss-1-runtime-bringup | Full | CLOSED | Historical x64 first-audio/runtime bring-up evidence is recorded. No active dispatch. |
| 3 | MOSS-2 | v1.78.0 | sprint/moss-2-live-book-feasibility | Full | CLOSED | Historical live-book/Kokoro pairing evidence led to `PAUSE_FLAGSHIP_MOSS`. No active dispatch. |
| 4 | MOSS-RCA-1 | v1.78.1 | sprint/moss-rca-1-runtime-root-cause | Diagnostic | CLOSED | Root-cause autopsy recorded `KEEP_PAUSED_ROOT_CAUSE_CONFIRMED`: configured x64 path is batch-only, prior quant/thread/max-token labels were non-assertive under the current command, raw-code generation and ONNX decode are both expensive, and punctuation first-sentence repeats remain intermittently unstable or far too slow. |
| 5 | MOSS-RUNTIME-1 | v1.78.2 | sprint/moss-runtime-1-make-flagship-real | Runtime rescue | CLOSED | Closed with `KEEP_PAUSED_RUNTIME_CONFIRMED`: truthful Q4/max-token x64 evidence remained non-viable (firstAudioMs `81438`, RTF `20.125`), minimized punctuation reproduced native `0xC0000374`, threads are unsupported by the local native target, Q5/Q6 first-class quants are unavailable locally, and native ARM64 clang/WSL2 shapes remain blocked. No active dispatch. |
| 6 | MOSS-HOST-1 | v1.78.3 | sprint/moss-host-1-native-wsl-escape-hatch | Host/runtime rescue | CLOSED | Closed with `KEEP_PAUSED_HOST_CONFIRMED`: LLVM/clang install failed on Chocolatey host permissions, native ARM64 build remains blocked before configure, WSL2 is present but only Docker Desktop internal distros exist and no usable repo/toolchain runtime path is available. No active dispatch. |
| 7 | MOSS-HOST-2 | v1.78.4 | sprint/moss-host-2-closeout | Governance closeout | CLOSED | Closed with `KEEP_PAUSED_HOST_CONFIRMED`: fresh WSL ARM64 host2 binary at `/mnt/c/Users/estra/Projects/Blurby/.runtime/moss/llama.cpp/build-wsl-arm64-host2/bin/llama-moss-tts` was built with `GGML_NATIVE=OFF`, `GGML_CPU_ARM_ARCH=armv8.6-a+dotprod+i8mm+nosve`, and `CMAKE_BUILD_TYPE=Release`; shape gate is available on `aarch64` Ubuntu-24.04, but short/punctuation Q4 tokens128 runs remained non-viable at RTF `42.0902777777778` and `16.2615979381443`. No active dispatch. |
| 8 | MOSS-NANO-1 | v1.78.5 | sprint/moss-nano-1-cpu-realtime-candidate | Runtime probe | CLOSED | Closed with `ITERATE_NANO_RUNTIME`: Nano source and ONNX assets were provisioned locally, direct `infer_onnx.py` probe contract was fixed, focused tests passed `8/8`, and live short/punctuation probes generated audio at firstAudioSec `15.5075` / RTF `4.4` and firstAudioSec `18.7613` / RTF `1.6526`. Better than flagship, but not promoted; Kokoro unchanged. |
| 9 | MOSS-NANO-2 | v1.78.6 | sprint/moss-nano-2-runtime-latency-rescue | Runtime rescue | CLOSED | Closed with `KEEP_KOKORO_ONLY`: harness added stage/profile fields, warm/cold, segmentation/window, ORT request metadata, prewarm metadata, venv preference, passage aliases, and empty-passage fail-closed guard; focused tests passed `23/23` after sandbox `spawn EPERM` and escalated rerun. Canonical v2 real-text Nano still missed live viability: short first observed `13.9036s`, total `14.4591s`, RTF `3.9291` cold and first observed `15.2025s`, total `15.8170s`, RTF `4.2981` warm with `runtimeReuseActual: false`; punctuation first observed `20.0393s`, total `20.6641s`, RTF `1.7572` cold and first observed `18.6516s`, total `19.2688s`, RTF `1.6385` warm with `runtimeReuseActual: false`. v2 first observed uses reset file observation, not internal decoded audio. Segmentation, ORT options, and prewarm/cache did not help/apply. No app prototype; Kokoro unchanged. |
| 10 | MOSS-NANO-3 | v1.78.7 | sprint/moss-nano-3-resident-runtime-truth | Runtime instrumentation | CLOSED | Closed with `ITERATE_NANO_RESIDENT_RUNTIME`: resident runtime path `scripts/moss_nano_resident_probe.py`, wrapper `scripts/moss_nano_probe.mjs --runtime-mode resident`, and package script `npm run moss:nano:resident` proved true reuse and internal first decoded audio. Focused tests passed `28/28` after known sandbox `EPERM` escalated rerun; full `npm test` passed `150` files / `2268` tests; `npm run build` passed with existing circular chunk warning. Canonical short resident: `513ms`, RTF `1.7005`, `runtimeReuseActual: true`, memory growth `36.59MB`; punctuation resident: `541ms`, RTF `1.2042`, `runtimeReuseActual: true`, memory growth `62.92MB`; ORT session run truthfully applied CPU provider / `intraOp 2` / `interOp 1` and recorded unsupported `usePerSessionThreads`; stale-output guard showed fresh output. Not promoted because short RTF missed `<=1.5` and memory needs soak/tuning. |
| 11 | MOSS-NANO-4 | v1.78.8 | sprint/moss-nano-4-runtime-optimization | Runtime optimization + promotion retest | CLOSED | Closed with `ITERATE_NANO_RESIDENT_RUNTIME`, explicitly not `PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE`: best short `moss-nano-4-short-resident-ort-intra2` proved true reuse and applied ORT CPU `intraOp 2` / `interOp 1` / sequential / graph all, first decoded `659ms`, final RTF `1.3734`, p50/p95 `1.3734`/`1.4329`, memory growth about `42.57MB`; baseline short was RTF `1.7116`, first decoded `565ms`; punctuation best was first decoded `944ms`, RTF `1.6540`; bookwarm best used long-form built-in substitute with `3/3` fresh internal first decoded warm runs, stale output reuse `0`, first decoded `727ms`, RTF `1.1252`; decode-full is caveated/disqualified at first decoded `6099ms`, memory growth about `103.16MB`; precompute requested but `precomputeInputsActual=false`; promotion hardening focused tests passed `42/42`. No app integration, no MOSS-3 reopen, no Kokoro behavior change. |
| 12 | MOSS-NANO-5B | v1.78.9 | sprint/moss-nano-5b-precompute-adjacent-continuity | Runtime rescue | CLOSED | Closed with `ITERATE_NANO_RESIDENT_RUNTIME`, explicitly not `PROMOTE_NANO_TO_SOAK_CANDIDATE`: focused verification passed `python -m py_compile scripts\moss_nano_resident_probe.py` and `npm test -- tests/mossNanoProbe.test.js` passed `75/75` after known sandbox `EPERM` escalated rerun. Canonical artifacts: short ORT ok first audio `0.340s`, RTF `0.6440`, p50/p95 `0.6440`/`0.6610`, memory delta `5.81MB`, stale `false`; decode-full runtime ok but gate failed at first audio `2.963s` > `2.5s`; precompute request rows blocked with `requested=true`, `actual=false`, `partial=true`, `preparedBeforeRun=false`, `consumedByMeasuredRun=false`, `requestRowCount=0`, blocker `NO_PRECOMPUTE_REQUEST_ROWS_HOOK`; adjacent stable ok with `5/5` fresh, fair trend ratio `0.0081` <= `0.15`, but `crossSegmentStateActual=false` with blocker `NO_CROSS_SEGMENT_MODEL_STATE_HOOK`. Runtime-only scope preserved; no app integration, no `.runtime` commits, no Kokoro change. |
| 13 | MOSS-NANO-5C | v1.78.9 | sprint/moss-nano-5c-segment-first-soak-gate | Runtime gate closeout | CLOSED | Closed with `PROMOTE_NANO_TO_SOAK_CANDIDATE_WITH_SEGMENT_FIRST_GATE`: final2 artifact status ok/promote true; first decoded `0.449s <= 0.5s`; segment-first short RTF `0.6513 <= 1.5`; adjacent fair RTF trend `0.0105 <= 0.15`; fresh segments `5 >= 5`; stale output reuse `0`; session restarts `0`; precompute `non-product-required`/`not-required`; decode-full `diagnostic-only-non-product-path`. Runtime-only scope preserved; no app integration, no `.runtime` commits, no Kokoro change. |
| 14 | MOSS-NANO-6B | v1.78.10 | sprint/moss-nano-6-soak-packaging-readiness | Runtime/package readiness | CLOSED | Closed with `ITERATE_NANO_RESIDENT_RUNTIME`: canonical long artifact `artifacts/moss/moss-nano-6b-soak-1800-adjacent-100-escalated/summary.json` measured `1800.0012s` of requested `1800s`, completed `100/100` adjacent fresh, recorded stale reuse/session restarts/crashes all `0`, but failed memory slope at `12.8416MB/min` and adjacent p95 final RTF at `2.3007`; shutdown classes remain not implemented and Nano was not promoted to app prototype. |
| 15 | MOSS-NANO-6C | v1.78.10 | sprint/moss-nano-6-memory-tail-lifecycle | Runtime hardening | CLOSED | Closed with `ITERATE_NANO_RESIDENT_RUNTIME`: targeted artifacts `moss-nano-6c-adjacent-20-escalated` and `moss-nano-6c-ort-no-arena-20-escalated` each completed `20/20` fresh, but failed promotion gates on memory slope/RTF/lifecycle; full 30-minute soak deferred because targeted gates already proved non-promotable state. Verification passed focused `143/143`, full `2364/2364`, and build with existing circular chunk warning. |
| 16 | MOSS-NANO-6D | v1.78.10 | sprint/moss-nano-6d-bounded-lifecycle | Runtime lifecycle | CLOSED | Closed with `ITERATE_NANO_RESIDENT_RUNTIME`: bounded in-process reset made memory/tail gates plausible but did not prove child-process lifecycle. No app integration or Kokoro behavior change. |
| 17 | MOSS-NANO-6E | v1.78.10 | sprint/moss-nano-6e-lifecycle-proof | Runtime lifecycle proof | CLOSED | Closed with `ITERATE_NANO_RESIDENT_RUNTIME`: child-process lifecycle proof passed, but short `2/2` confirmation did not replace the full 1800-second/100-segment promotion gate. |
| 18 | MOSS-NANO-6F | v1.78.10 | sprint/moss-nano-6f-full-bounded-soak-promotion-confirmation | Runtime promotion confirmation | CLOSED | Closed with `PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE_WITH_BOUNDED_LIFECYCLE`: canonical `promotion-confirmation.json` records status `ok`, failure class `null`, measured soak `1800.0015s`, `100/100` fresh adjacent segments, stale reuse `0`, readiness memory slope `0.3261MB/min`, p95 final RTF `0.4826`, p95 first decoded `280ms`, crash count `0`, unclassified restarts `0`, and `99` classified bounded lifecycle recycles. |
| 19 | MOSS-NANO-7 | v1.79.0 | sprint/moss-nano-7-sidecar-ipc-prototype | Prototype sidecar | CLOSED | Closed with `PROMOTE_NANO_TO_STRATEGY_PROTOTYPE`: added experimental app-boundary sidecar manager, protocol placeholder, `tts-nano-*` IPC handlers, preload methods, Nano API types, and engine/IPC tests. No renderer selection, no normal playback wiring, no user-facing Nano, and no Kokoro behavior change. |
| 20 | MOSS-NANO-8 | v1.80.0 | sprint/moss-nano-8-narration-strategy | Renderer strategy prototype | CLOSED | Closed with `PROMOTE_NANO_TO_CONTINUITY_PROTOTYPE`: added experimental test-only Nano narration strategy, optional IPC calls, scheduler-compatible segment audio, `segment-following` timing truth, `wordTimestamps: null`, structured failure/cancel/status propagation, speed/rate handling, and stale request/callback ownership guards. No public `TtsEngine`, no settings UI, no default-engine change, and no Kokoro behavior change. |
| 21 | MOSS-NANO-9 | v1.81.0 | sprint/moss-nano-9-cache-prefetch-continuity | Continuity prototype | CLOSED | Closed with `PROMOTE_NANO_TO_EXPERIMENTAL_UI_CANDIDATE`: added bounded Nano cache/prefetch, continuity handoffs, cross-book cleanup, and Nano eval trace fields while preserving hidden/test-only selection, no default change, and no Kokoro behavior change. |
| 22 | MOSS-NANO-10 | v1.82.0 | sprint/moss-nano-10-settings-ux | Experimental UX onboarding | CLOSED | Closed with `PROMOTE_NANO_TO_PRODUCTIZATION_GATE`: added settings-only Nano opt-in, truthful blocked/ready status, ready-only Nano preview, and no silent fallback while Nano is selected. Defaults and Kokoro behavior remain unchanged. |
| 23 | MOSS-NANO-11 | v1.83.0 | sprint/moss-nano-11-productization-gate | Productization gate | CLOSED | Closed with `NANO_EXPERIMENTAL_ONLY` / `KEEP_KOKORO_DEFAULT`: four-mode selected-Nano matrix shape and product-gate decision cap are in place, but live product evidence was not supplied, so no recommended opt-in, default-candidate, or Kokoro-retirement lane is opened. |
| 24 | MOSS-NANO-12 | v1.84.0 | sprint/moss-nano-12-live-four-mode-evidence | Live evidence gate | CLOSED | Closed with `NANO_EXPERIMENTAL_ONLY`: Page/Focus/Flow/Narrate selected-Nano live-evidence slots and `--nano-live-evidence` input are in place, but no live observation artifact was supplied, so recommended opt-in is not promoted. |
| 25 | MOSS-3 | v1.79.0 | sprint/moss-3-sidecar-contract | Legacy flagship full | SUPERSEDED/PAUSED | Superseded by Nano-specific onboarding path. Do not dispatch unless a separate flagship promotion decision is recorded. |
| 26 | MOSS-4 | v1.80.0 | sprint/moss-4-live-narration-strategy | Legacy flagship full | SUPERSEDED/PAUSED | Superseded by Nano-specific onboarding path. |
| 27 | MOSS-5 | v1.81.0 | sprint/moss-5-timing-truth | Legacy flagship full | SUPERSEDED/PAUSED | Superseded by Nano-specific onboarding path. |
| 28 | MOSS-6 | v1.82.0 | sprint/moss-6-cache-continuity | Legacy flagship full | SUPERSEDED/PAUSED | Superseded by Nano-specific onboarding path. |
| 29 | MOSS-7 | v1.83.0 | sprint/moss-7-productization-gate | Legacy flagship full | SUPERSEDED/PAUSED | Superseded by Nano-specific onboarding path. |

**Dispatch status:** `POSTV2-AUDIT-REMEDIATION` is CLOSED as an implemented, verified, uncommitted candidate in the `postv2-audit-remediation` worktree. Desktop v2.0 release posture remains Kokoro default/available, MOSS-Nano recommended opt-in, Pocket TTS available opt-in with upstream synthesis scaffolded pending separately approved adapter work, and Qwen retired/disabled. Do not rerun live capture, start a comparative gate, reopen MOSS-Nano productization, expose voice-cloning UX in v2.0, demote/remove Kokoro, or reactivate Qwen. Dispatch `POSTV2-REVIEW-1` next for review, commit, and merge.

### Parallel Dispatch Guardrails

Before dispatching two queued sprints in parallel, verify all of these are true:

1. Both ROADMAP sprint specs include:
   - `Lane Ownership`
   - `Forbidden During Parallel Run`
   - `Shared-Core Touches`
   - `Merge Order`
2. The two sprints do not both edit the shared-core freeze set in the same execution window:
   - `src/hooks/useNarration.ts`
   - `src/hooks/useFlowScrollSync.ts`
   - `src/components/ReaderContainer.tsx`
   - `src/utils/FlowScrollEngine.ts`
   - `src/types.ts`
3. If one sprint needs shared-core integration, it runs as a second phase after the first sprint merges.

If any guardrail fails, run the sprints sequentially.

**Next Cowork actions:**
1. ~~Dispatch FLOW-INF-A to CLI~~ — COMPLETE (v1.41.0)
2. ~~Dispatch FLOW-INF-B to CLI~~ — COMPLETE (v1.42.0)
3. ~~Backfill queue to ≥3~~ — DONE (FLOW-INF-C spec'd)
4. ~~Dispatch EXT-ENR-B to CLI~~ — COMPLETE (v1.43.0)
5. ~~Backfill queue to ≥3~~ — DONE (HOTFIX-15 spec'd, queue GREEN)
6. ~~Dispatch HOTFIX-15 to CLI~~ — COMPLETE (v1.43.1)
7. ~~Dispatch NARR-TIMING to CLI~~ — COMPLETE (v1.44.0)
8. ~~Backfill queue~~ — STAB-1A spec'd (queue YELLOW, depth 2)
9. ~~Backfill queue to ≥3~~ — DONE (PERF-1 spec'd, queue GREEN depth 3)
10. ~~Dispatch STAB-1A to CLI~~ — COMPLETE (v1.45.0)
11. ~~Dispatch FLOW-INF-C to CLI~~ — COMPLETE (v1.46.0)
12. ~~Dispatch PERF-1 to CLI~~ — COMPLETE (v1.47.0)
13. ~~Backfill queue to ≥3~~ — DONE (REFACTOR-1A/1B + TEST-COV-1 spec'd from Aristotle audit, queue GREEN depth 3)
14. ~~Dispatch REFACTOR-1A to CLI~~ — COMPLETE (v1.48.0)
15. **Backfill queue to ≥3** — YELLOW, depth 2. Spec a third sprint before dispatching REFACTOR-1B.
16. ~~Dispatch REFACTOR-1B to CLI~~ — COMPLETE (v1.49.0)
17. ~~Backfill queue to ≥3~~ — DONE (NARR-LAYER-1A + NARR-LAYER-1B spec'd from narration-as-layer investigation, queue GREEN depth 3)
18. ~~Dispatch TEST-COV-1 to CLI~~ — COMPLETE (v1.50.0)
19. ~~Dispatch NARR-LAYER-1A to CLI~~ — COMPLETE (v1.51.0)
20. ~~Backfill queue~~ — DONE (`TTS-EVAL-1` spec'd; queue remains YELLOW depth 2 until a third active sprint is added)
21. ~~Dispatch NARR-LAYER-1B to CLI~~ — COMPLETE (v1.52.0)
22. ~~Backfill queue to ≥3~~ — COMPLETE. TTS-EVAL-2 and TTS-EVAL-3 added; queue depth restored to 3 (GREEN).
23. ~~Dispatch TTS-EVAL-1 to CLI~~ — COMPLETE (v1.53.0)
24. **Backfill queue to ≥3** — YELLOW, depth 2. Add one additional sprint before next dispatch beyond TTS-EVAL-2.
25. ~~Dispatch TTS-EVAL-2 to CLI~~ — COMPLETE (v1.54.0)
26. ~~Backfill queue to ≥3~~ — COMPLETE. Added `TTS-RATE-1` and `EPUB-TOKEN-1`; queue depth restored to 3 (GREEN).
27. ~~Dispatch TTS-EVAL-3 to CLI~~ — COMPLETE (v1.55.0)
28. ~~Backfill queue to ≥3~~ — COMPLETE. Added `TTS-HARDEN-1` and `TTS-HARDEN-2`; queue depth restored to 4 (GREEN).
29. ~~Dispatch TTS-HARDEN-1 to CLI~~ — COMPLETE (v1.56.0). Truthful Kokoro readiness now flows end-to-end from engine snapshot to renderer consumers; crash/load/warm-up failures fail closed and recover cleanly.
30. ~~Dispatch TTS-HARDEN-2 to CLI~~ — COMPLETE (v1.57.0). Section-end continuation now has one active owner, handoff uses the stronger narration core contract, foliate fallback releases ownership once full-book metadata arrives, and active extraction follows the shared dedupe path.
31. ~~Backfill queue to ≥3~~ — COMPLETE. Re-promoted `EINK-6A` as a parked but fully spec'd fallback pointer so queue depth remains 3 (GREEN) while TTS/token work stays first.
32. ~~Dispatch TTS-RATE-1 to CLI~~ — COMPLETE (v1.58.0). Kokoro now offers exact `1.0x`–`1.5x` UI speeds in `0.1x` steps over fixed generation buckets (`1.0` / `1.2` / `1.5`), uses pitch-preserving tempo shaping instead of pitch-shifting playbackRate changes, keeps in-bucket speed edits restart-free via live buffered retiming, and passed the gated six-rate matrix release evidence (`artifacts/tts-eval/final-gate-22`). Existing Vite circular chunk warning unchanged.
33. ~~Backfill queue to ≥3~~ — COMPLETE. Added `TTS-CONT-1`, `TTS-RATE-2`, and `TTS-START-1`; queue depth restored to 4 (GREEN) with the TTS continuity lane prioritized ahead of parked e-ink work.
34. ~~Backfill queue to ≥3~~ — EXPIRED. Queue fell to depth 1 after `TTS-START-1` closeout; replace with a stronger stop condition.
35. ~~Dispatch TTS-START-1 to CLI~~ — COMPLETE (v1.62.0). Cached and uncached starts now share one opening-ramp planner contract, entry coverage warms the same startup shape before cruise coverage, cache replay reconstructs exact nonzero-start word spans from full context, and startup parity is now recorded in eval artifacts. Verification passed with the focused startup/cache neighborhood (`6` files, `70` tests), a dedicated startup-parity matrix (`artifacts/tts-eval/start1-startup-parity`) showing cached/uncached startup `370 / 508 ms` with matching opening ramps, the gated release matrix (`9` runs, PASS), full `npm test` (`125` files, `2005` tests), and `npm run build`; existing circular-chunk warning unchanged.
36. ~~Backfill queue to ≥3~~ — RED at the time, depth 1 after `TTS-START-1`; superseded by the four-mode reader restoration backfill below.
37. ~~Backfill queue to ≥3~~ — COMPLETE. Added `READER-4M-1`, `READER-4M-2`, and `READER-4M-3` from the approved four-mode reader/Narrate restoration design; queue depth restored to 4 (GREEN) with `READER-4M-1` as the next dispatch.
38. ~~Dispatch READER-4M-1 to CLI~~ — COMPLETE (v1.63.0). Live Foliate Flow now boots from an explicit rendered-word provider contract plus readiness-gated rebuilds, `narrate` is back in the shared reader/persisted mode contracts, compatibility aliases are localized, and the closeout fix keeps `narrate` on the flow-surface Foliate `onLoad` path.
39. ~~Backfill queue to ≥3~~ — COMPLETE. Finalized and retired the Qwen/Kokoro audit packet, added `QWEN-PROT-1` as the next bounded prototype slice, reprioritized the queue ahead of `READER-4M-2`, and preserved depth 3 without the parked e-ink fallback pointer.
40. ~~Dispatch QWEN-PROT-1 to CLI~~ — COMPLETE (v1.64.0). Qwen is now a first-class prototype engine across shared types, persistence, preload/main status plumbing, settings UI, and the browser test harness; selecting it no longer silently falls through to another engine, and the app reports truthful unavailable/warming/error states without attempting live synthesis.
41. ~~Backfill queue to ≥3~~ — COMPLETE. Added `QWEN-PROT-2` as the next bounded Qwen sidecar/playback slice and kept queue depth 3 while preserving the reader restoration lane behind it.
42. ~~Dispatch QWEN-PROT-2 to CLI~~ — COMPLETE (v1.65.0). Blurby can now spawn a configured Qwen Python sidecar, expose `qwenGenerate` through main/preload, route live narration through a dedicated Qwen strategy with restart-based rate changes, load truthful runtime speakers, and perform live in-app Qwen playback without silent fallback, packaged runtime work, or aligner scope.
43. ~~Backfill queue to ≥3~~ — COMPLETE. Promoted the approved Qwen-default / Kokoro-deprecation program, inserted `QWEN-DEFAULT-1` through `KOKORO-RETIRE-2` ahead of the reader-restoration lane, and restored queue depth to 7 (GREEN).
44. ~~Dispatch QWEN-DEFAULT-1 to CLI~~ — COMPLETE (v1.66.0). Qwen is now the default narration posture in product/UI/settings, Kokoro remains explicit legacy, and governance promotion landed.
45. ~~Dispatch QWEN-HARDEN-1 to CLI~~ — COMPLETE (v1.67.0). Qwen startup/playback hardening landed with timing budgets, playback reliability coverage, gate artifacts, and the retirement scorecard/listening-review evidence scaffold.
46. ~~Dispatch QWEN-PROVISION-1 to CLI~~ — COMPLETE (v1.68.0). Qwen now has an explicit CUDA-first supported-host policy, a deterministic one-shot preflight probe, typed `qwenPreflight` bridge coverage, and settings/runtime setup guidance that distinguishes not configured, broken, unsupported, and healthy host states without putting provisioning work on the narration hot path.
47. ~~Dispatch KOKORO-RETIRE-1 to CLI~~ — PAUSED on 2026-04-20. Subsequent live validation showed the current non-streaming local Qwen lane is not a sufficient successor path for sustained CPU narration, so retirement work is suspended pending the approved streaming-Qwen lane.
48. ~~Backfill queue to ≥3~~ — COMPLETE. Added `QWEN-STREAM-1` (streaming sidecar foundation) as queue position 3. Queue depth restored to 3 (GREEN). Spec based on approved design at `docs/planning/specs/2026-04-20-qwen-streaming-kokoro-backup-design.md`. Voice path: CustomVoice model with streaming generator (Option A), Kokoro reference samples as fallback (Option B).
49. ~~Dispatch READER-4M-2 to CLI~~ — COMPLETE (v1.69.0, 2026-04-20). Standalone Narrate mode landed alongside four-button bottom-bar controls. `N` is now the universal "enter Narrate paused" shortcut from any mode; `T` narration toggle removed. Pause/resume verified to stay in-mode for flow and narrate. 14 new tests (`tests/readerBottomBarControls.test.tsx`, `tests/useKeyboardShortcuts.test.ts`). Full `npm test` (2,102 tests) and `npm run build` passed.
50. ~~Dispatch READER-4M-3 to CLI~~ — COMPLETE (v1.72.0, 2026-04-20). One canonical global word anchor now drives entry/save/resume across page, focus, flow, and narrate; Flow↔Narrate preserve the exact shared-surface anchor; Narrate follow/highlight now uses spoken-word truth; and verification passed with `npm test` (`141` files, `2136` tests) plus `npm run build`.
51. ~~Dispatch QWEN-STREAM-1 to CLI~~ — COMPLETE (v1.71.0, 2026-04-20). Streaming sidecar foundation: binary-framed PCM protocol, JS engine manager, IPC handlers, preload bridge, streaming types. 18 new tests. Build clean.
52. ~~Backfill queue to ≥3 before the next dispatch.~~ — COMPLETE. Added QWEN-STREAM-2 (accumulator + strategy + live playback), QWEN-STREAM-3 (hardening + evidence + decision gate), and QWEN-STREAM-4 (live validation + promotion decision). Queue depth restored to 3 (GREEN). Full streaming lane spec'd end-to-end.
53. ~~Dispatch QWEN-STREAM-2 to CLI~~ — COMPLETE (v1.73.0, 2026-04-20). StreamAccumulator + streaming Qwen strategy wired. PCM buffering to sentence boundaries, streaming strategy instantiated when engine ready, fallback preserved. 21 new tests. Build clean.
54. ~~Backfill queue to ≥3.~~ — COMPLETE. Added GOALS-6B as position 3 (independent track). Queue GREEN depth 3.
55. ~~Dispatch QWEN-STREAM-3 to CLI~~ — COMPLETE (v1.74.0). Stall detection, crash recovery, warmup gate, cancellation guards, stream-finished IPC wire, 5 streaming eval scenarios, gate thresholds, decision template. 16 new tests. Build clean.
56. ~~Backfill queue to ≥3.~~ — COMPLETE. Added KOKORO-RETIRE-1 as conditional position 3. Queue GREEN depth 3.
57. ~~Dispatch QWEN-STREAM-4 to CLI~~ — COMPLETE (v1.75.0, ITERATE). Eval harness executed, Kokoro baseline captured, QWEN_STREAMING_DECISION.md populated. Live CUDA validation deferred to Evan.
58. ~~Backfill queue to ≥3.~~ COMPLETE. Added the flagship-first MOSS operational narration lane (`MOSS-0` through `MOSS-7`) from `docs/planning/plans/2026-04-26-moss-flagship-operational-lane.md`; queue depth was restored to 8 (GREEN) at that time. Superseded by the task #10g runtime-unstable pause state below. Kokoro retirement remains paused behind continuous-live-playback proof and a separately approved retirement lane. Nano remains conditional only after `DEMOTE_TO_NANO` evidence.
59. ~~Dispatch MOSS-0 to CLI.~~ Superseded by MOSS evidence through MOSS-SPEED-1 task #10g; flagship MOSS is now paused as runtime-unstable and MOSS app-integration dispatch is blocked.

---

## Deferred Sprints

| Sprint ID | Disposition |
|-----------|-------------|
| HOTFIX-13 | **Dissolved.** BUG-151/152/153 absorbed into SELECTION-1. BUG-154 parked (likely not a bug — needs live verification). |
| KOKORO-RETIRE-1 | **Superseded / not active.** Kokoro is the default and operational floor again. Retirement is no longer the active posture; the approved post-v2 lane is Kokoro deepening. Reopen only by separate future product decision. |
| KOKORO-RETIRE-2 | **Superseded / not active.** Final Kokoro removal is blocked indefinitely behind a future decision that does not exist in the current roadmap. |
| CHUNK-SYNC Narrate migration | **Deferred / rerouted.** Dispatch 1/2 foundations and Dispatch 3 Flow chunk visuals are present locally; Narrate active-word highlighting resumes only through `KOKORO-DEEPEN-2` so it is tied to Kokoro timing truth. |
| MOSS-NANO follow-up | **Active only as MOSS-NANO-13a–13e inside Desktop v2.0.** MOSS-NANO-12 closed as NANO_EXPERIMENTAL_ONLY. Both third-party audits: "proceed only with scope changes." Nano remains experimental-only unless the 13a–13e provenance-backed productization lane records `PAUSE_NANO_PRODUCTIZATION`, `NANO_EXPERIMENTAL_ONLY`, or `NANO_RECOMMENDED_OPT_IN`. No other exploratory MOSS/TTS/model lane is approved inside Desktop v2.0. |
| EINK-6A | **Active.** Moved to Desktop v2.0 conveyor belt (Seq 2). Full spec in ROADMAP.md. |
| EINK-6B | **Active.** Moved to Desktop v2.0 conveyor belt (Seq 3). Depends on EINK-6A. |
| GOALS-6B | **Completed 2026-05-02.** Optional local-first daily pages, daily minutes, and weekly books goal tracking landed on `sprint/goals-6b-reading-goals`; next conveyor item is MOSS-NANO-13a. |
| EXT-ENR-C | Documented but deferred. In-browser reader is lower priority than connection fixes. |
| APK-0 | Roadmapped, not yet execution-ready. Needs detailed WHERE/Tasks/SUCCESS CRITERIA. |
| APK-1–4 | Roadmapped, not yet execution-ready. Depend on APK-0. |

---

## Completed Sprints (Recent History)

| Sprint ID | Completed | Outcome | Key Result |
|-----------|-----------|---------|------------|
| SK-HYG-2 | 2026-05-16 | PASS | Directory reorganization Option B completed: `docs/` collapsed into 7 top-level folders, archive filenames standardized under `.Archive/`, bulk `artifacts/` and `tmp/` ignored/untracked, 40 canonical evidence artifacts preserved in `docs/evidence/`, `tmp_brandcheck*` collapsed to one folder, and old path references normalized across the tracked text surface. Mid-dispatch Type 3 pivot allowed four exact path-string repairs in `tests/`, `scripts/`, and `main/` to restore correctness after moved docs. Verification passed full `npm test` (`186` files / `2642` tests) and `npm run build` with the existing circular chunk warning; binary audit ZIP contents and IDE metadata old-path strings intentionally deferred. |
| MOSS-NANO-8 | 2026-05-01 | PROMOTE_NANO_TO_CONTINUITY_PROTOTYPE | Experimental test-only Nano narration strategy with optional IPC calls, scheduler-compatible segment audio, segment-following timing truth, no fake word timestamps, structured failure/cancel/status propagation, speed/rate handling, and stale request/callback ownership guards. Verification passed focused `2` files / `20` tests, full `npm test` `154` files / `2412` tests, and `npm run build` with existing circular chunk warning. No public `TtsEngine`, no settings UI, no default-engine change, and no Kokoro behavior change. |
| MOSS-NANO-7 | 2026-05-01 | PROMOTE_NANO_TO_STRATEGY_PROTOTYPE | App-boundary sidecar/IPC prototype only. Added `main/moss-nano-engine.js` with injectable sidecar adapter, readiness/failure semantics, bounded lifecycle config snapshot, stale-output/request ownership guards, startup-before-request, cancel adapter rejection settlement, and cancel/shutdown/restart in-flight settlement; added `main/moss-nano-sidecar.js`; registered experimental `tts-nano-status`, `tts-nano-synthesize`, `tts-nano-cancel`, `tts-nano-shutdown`, and `tts-nano-restart`; exposed `nanoStatus`, `nanoSynthesize`, `nanoCancel`, `nanoShutdown`, and `nanoRestart`; added Nano status/result/failure/Electron API types plus `tests/mossNanoEngine.test.js` and `tests/mossNanoIpc.test.js`. Verification passed focused `2` files / `14` tests after sandbox `EPERM` escalated rerun, full `npm test` `152` files / `2392` tests, and `npm run build` with existing circular chunk warning. No renderer engine selection, no normal playback wiring, no user-facing Nano, no `TtsEngine` expansion beyond `web | kokoro | qwen`, and no Kokoro behavior change. |
| MOSS-NANO-6F | 2026-05-01 | PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE_WITH_BOUNDED_LIFECYCLE | Full bounded soak promotion confirmation. Canonical artifact `artifacts/moss/moss-nano-6f-full-bounded-soak-promotion-confirmation-v2/promotion-confirmation.json` records status `ok`, failure class `null`, measured resident soak `1800.0015s`, `100/100` book-like adjacent segments fresh, stale output reuse `0`, bounded lifecycle actual/truthful with `99` RSS-threshold in-process runtime resets at `1750MB`, shutdown/restart child-process lifecycle proof present by 6E reference, readiness memory slope `0.3261MB/min`, p95 final RTF `0.4826`, p95 first decoded `280ms`, crash count `0`, and unclassified restarts `0`. Raw `summary.json` still carries older persisted `promotionDecision` / `not-promoting`; use `promotion-confirmation.json` as canonical. No app integration drift, no Kokoro behavior change, and no Kokoro retirement. |
| MOSS-NANO-6E | 2026-05-01 | ITERATE_NANO_RESIDENT_RUNTIME | Runtime lifecycle proof only. Artifact `artifacts/moss/moss-nano-6e-lifecycle-proof-v2/summary.json` recorded `shutdownObserved: true`, `restartObserved: true`, `processRestartActual: true`, clean and restart child PIDs, forced-kill/no-zombie evidence, restart-failed exit `2`, in-flight shutdown rejected, stale output reuse `0`, and short bounded confirmation `2/2` fresh with p95 post-recycle RTF `1.4647`. The artifact is intentionally `not-promoting` because it is not the full 1800-second/100-segment promotion gate. Verification passed focused `132/132`, full `npm test` `2378/2378`, and `npm run build` with existing circular chunk warning. Nano was not promoted to app prototype; no app integration or Kokoro behavior change. |
| MOSS-NANO-6D | 2026-05-01 | ITERATE_NANO_RESIDENT_RUNTIME | Bounded resident lifecycle/process recycling only. Canonical artifact `artifacts/moss/moss-nano-6d-bounded-soak-1800-rss-threshold/summary.json` measured `1800.0033s`, completed `100/100` adjacent fresh, recorded stale output reuse `0`, readiness memory slope `0.3555MB/min`, post-warmup slope `0`, p95 first decoded `264ms`, and p95 final RTF `0.4631`, but failed on shutdown evidence because recycle was in-process (`processRestartActual: false`). Nano was not promoted to app prototype; no app integration or Kokoro behavior change. |
| MOSS-NANO-6C | 2026-04-30 | ITERATE_NANO_RESIDENT_RUNTIME | Memory/tail-latency/lifecycle hardening only. Targeted artifacts `artifacts/moss/moss-nano-6c-adjacent-20-escalated/summary.json` and `artifacts/moss/moss-nano-6c-ort-no-arena-20-escalated/summary.json` both completed `20/20` fresh segments. Adjacent-20 recorded readiness memory slope `9.7639MB/min`, inference slope `10.6414MB/min`, hold slope `0`, p95 first decoded `1240ms`, p95 RTF `3.0416`, and lifecycle not implemented. ORT no-arena recorded readiness memory slope `8.563MB/min`, inference slope `8.8964MB/min`, hold slope `0`, p95 first decoded `1768ms`, p95 RTF `3.3251`, and lifecycle not implemented. Full 30-minute soak was deferred because targeted gates already failed. Verification passed: focused `143/143`, full `npm test` `2364/2364`, and `npm run build` with existing circular chunk warning. Nano was not promoted to app prototype; no app integration or Kokoro behavior change. |
| MOSS-NANO-6B | 2026-04-30 | ITERATE_NANO_RESIDENT_RUNTIME | Resident soak memory/lifecycle closure only. Canonical long artifact `artifacts/moss/moss-nano-6b-soak-1800-adjacent-100-escalated/summary.json` requested `1800s`, measured `1800.0012s`, completed `100/100` adjacent fresh, and recorded stale output reuse `0`, session restarts `0`, and crash count `0`; memory slope `12.8416MB/min` failed the `1.5MB/min` gate; adjacent p95 internal first decoded `1088ms` passed the `1500ms` gate; adjacent p95 final RTF `2.3007` failed the `1.5`/`1.45` gates; shutdown classes remained `not-observed`/`not-implemented`; readiness was `not-promoting`. Hardening covered real wall-clock soak duration, wall-clock RSS memory slope, deterministic 100+ book-like adjacent segments, fail-closed synthetic lifecycle evidence, Nano-specific package readiness not inherited from dev/flagship `.runtime` config, machine-readable failed gates/reasons in Nano-6 readiness, and clearer preflight source-vs-package evidence fields. Verification passed: focused `133/133`, full `npm test` `2354/2354`, and `npm run build` with existing circular chunk warning. Nano was not promoted to app prototype; no app integration, renderer/IPC/selectable-engine work, or Kokoro behavior change. |
| MOSS-NANO-5C | 2026-04-30 | PROMOTE_NANO_TO_SOAK_CANDIDATE_WITH_SEGMENT_FIRST_GATE | Runtime-only segment-first soak gate. Final artifact `artifacts/moss/moss-nano-5c-segment-first-soak-gate-final2/summary.json` recorded `status: ok`, `promote: true`, first decoded `0.449s <= 0.5s`, segment-first short RTF `0.6513 <= 1.5`, adjacent fair RTF trend `0.0105 <= 0.15`, fresh segments `5 >= 5`, stale output reuse `0`, session restarts `0`, precompute classification `non-product-required` with status `not-required`, and decode-full classification `diagnostic-only-non-product-path`. Supporting diagnostics: decode-full remains non-product and precompute RCA remains actual false with blocker `NO_PRECOMPUTE_REQUEST_ROWS_HOOK`. MOSS-NANO-6E has since closed without app-prototype promotion; app integration remains gated. |
| MOSS-NANO-5B | 2026-04-29 | ITERATE_NANO_RESIDENT_RUNTIME | Runtime-only precompute + adjacent continuity closure. Focused verification passed `python -m py_compile scripts\moss_nano_resident_probe.py`; `npm test -- tests/mossNanoProbe.test.js` passed `75/75` after known sandbox `EPERM` escalated rerun. Canonical artifacts: `moss-nano-5b-short-resident-ort-intra2` ok, first audio `0.340s`, RTF `0.6440`, p50/p95 `0.6440`/`0.6610`, memory delta `5.81MB`, stale `false`; `moss-nano-5b-short-resident-decode-full` runtime ok but gate failed, first audio `2.963s` > `2.5s`, RTF `0.7142`, p50/p95 `0.6969`/`0.7142`, memory delta `5.60MB`, stale `false`; `moss-nano-5b-short-resident-precompute-requestrows` runtime ok but blocked with `requested=true`, `actual=false`, `partial=true`, `preparedBeforeRun=false`, `consumedByMeasuredRun=false`, `requestRowCount=0`, blocker `NO_PRECOMPUTE_REQUEST_ROWS_HOOK`; `moss-nano-5b-adjacent-segments-resident-stable` ok with `5/5` fresh and fair trend ratio `0.0081` <= `0.15`, but `crossSegmentStateActual=false`, blocker `NO_CROSS_SEGMENT_MODEL_STATE_HOOK`. Hardening preserves top-level `crossSegmentStateActual`, separates fair adjacent trend from true cross-segment/prosody state, and requires consumed precompute rows for promotion. No app integration, no `.runtime` commits, no Kokoro behavior change. |
| MOSS-NANO-4 | 2026-04-29 | ITERATE_NANO_RESIDENT_RUNTIME | Runtime optimization + promotion retest only. Final valid decision is explicitly not `PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE`. Best short `moss-nano-4-short-resident-ort-intra2` recorded true reuse, applied ORT CPU `intraOp 2` / `interOp 1` / sequential / graph all, first decoded `659ms`, final RTF `1.3734`, p50/p95 `1.3734`/`1.4329`, and memory growth about `42.57MB`; baseline short was RTF `1.7116`, first decoded `565ms`. Best punctuation recorded first decoded `944ms`, final RTF `1.6540`. Best bookwarm used the long-form built-in substitute with `3/3` fresh internal first decoded warm runs, stale output reuse `0`, first decoded `727ms`, and RTF `1.1252`. Decode-full is disqualified/caveated at first decoded `6099ms`, memory growth about `103.16MB`. Precompute requested but `precomputeInputsActual=false`; no false reuse claim. Promotion-class summaries now require numeric thresholds/metrics and block requested-vs-actual contradictions. Focused verification only passed `42/42`; full verification is reserved for Hippocrates. No app integration, no MOSS-3 reopen, no Kokoro behavior change. |
| MOSS-NANO-3 | 2026-04-28 | ITERATE_NANO_RESIDENT_RUNTIME | Runtime-only resident sprint. New resident path `scripts/moss_nano_resident_probe.py`, wrapper `scripts/moss_nano_probe.mjs --runtime-mode resident`, and package script `npm run moss:nano:resident`. Focused tests passed `28/28` after known sandbox `EPERM` escalated rerun; full `npm test` passed `150` files / `2268` tests; `npm run build` passed with existing circular chunk warning. Canonical short resident artifact recorded `internalFirstDecodedAudioMs` `513`, RTF `1.7005`, `runtimeReuseActual: true`, memory growth `36.59MB`; punctuation resident recorded `541`, RTF `1.2042`, `runtimeReuseActual: true`, memory growth `62.92MB`; ORT session artifact recorded requested/applied ORT split with CPU provider, `intraOp 2`, `interOp 1`, and unsupported `usePerSessionThreads`; stale-output guard proved fresh output. Compared with MOSS-NANO-2 v2 observed first audio `13.9036s`/`15.2025s` short and `20.0393s`/`18.6516s` punctuation with `runtimeReuseActual: false`; Kokoro baseline remains `1385ms`/RTF `0.3337` short and `5616ms`/RTF `0.7414` punctuation. No app integration, no Kokoro behavior change, no MOSS-3 reopen. |
| MOSS-NANO-2 | 2026-04-28 | KEEP_KOKORO_ONLY | Runtime rescue/evidence only. Harness added stage/profile fields, warm/cold modes, segmentation/window modes, ORT option request metadata, prewarm metadata, Python selection precedence of explicit `--python`, then `PYTHON`, then repo-local `.runtime/moss/.venv-nano`, then system `python`, aliases `short` -> `short-smoke` and `punctuation` -> `punctuation-heavy-mid`, and empty passage fail-closed guard. Superseded wrong-system-Python blocked artifacts, zero-word venv artifacts, and non-v2 real-text/segmented artifacts are documented as non-canonical. Current canonical v2 real-text evidence remained non-viable: short first observed `13.9036s`, total `14.4591s`, RTF `3.9291` cold and first observed `15.2025s`, total `15.8170s`, RTF `4.2981` warm with `runtimeReuseActual: false`; punctuation first observed `20.0393s`, total `20.6641s`, RTF `1.7572` cold and first observed `18.6516s`, total `19.2688s`, RTF `1.6385` warm with `runtimeReuseActual: false`. v2 first observed uses reset file observation with `fileResetBeforeRun: true`, but is still not internal decoded audio. Segmented v2 output-path contract is fixed: token-window punctuation total `52.8842s` / RTF `2.7204` and char-window punctuation total `51.2033s` / RTF `3.2002`, with `outputWavPath` / `outputPath` `null` and `segmentOutputWavPaths` present. Segmentation, ORT options, and prewarm/cache did not help/apply. Kokoro remains far ahead and remains the only integrated engine. |
| MOSS-NANO-1 | 2026-04-28 | ITERATE_NANO_RUNTIME | Nano source and ONNX assets were provisioned under `.runtime/moss`, direct `infer_onnx.py` contract was fixed (`--output-audio-path`, `--cpu-threads`, `--prompt-audio-path`), focused tests passed `8/8`, and live probes generated audio for short and punctuation-heavy passages. Metrics: short firstAudioSec `15.5075`, RTF `4.4`, output `706604` bytes; punctuation firstAudioSec `18.7613`, RTF `1.6526`, output `2257964` bytes. Nano is better than flagship but misses realtime/promotion thresholds; Kokoro remains the app default and only integrated engine. |
| MOSS-HOST-2 | 2026-04-28 | KEEP_PAUSED_HOST_CONFIRMED | Fresh WSL ARM64 host2 evidence confirmed the flagship binary was not stale, but short and punctuation Q4 tokens128 runs remained non-viable at total `121.22s` / RTF `42.0902777777778` and total `126.19s` / RTF `16.2615979381443`. MOSS-3 stayed blocked and Kokoro stayed unchanged. |
| MOSS-HOST-1 | 2026-04-27 | KEEP_PAUSED_HOST_CONFIRMED | Host escape hatch confirmed no runnable non-x64 MOSS path in the current environment: LLVM/clang install failed on Chocolatey permissions, native ARM64 build remains blocked before CMake configure, and WSL2 is present but only Docker Desktop internal distros are installed with no repo mount or build/runtime toolchain. MOSS-3 remains blocked, Kokoro unchanged, and no Nano demotion was recorded. |
| MOSS-RUNTIME-1 | 2026-04-27 | KEEP_PAUSED_RUNTIME_CONFIRMED | Runtime rescue made Q4/max-token truth assertive via an in-memory first-class overlay, marked threads unsupported/non-assertive, attempted native ARM64 clang and WSL2/Linux shapes, recorded truthful short Q4 firstAudioMs `81438` with RTF `20.125`, and reproduced minimized punctuation failure `0xC0000374`; MOSS-3 remains blocked, Kokoro unchanged, and no Nano demotion was recorded. |
| QWEN-STREAM-4 | 2026-04-21 | ITERATE | Streaming eval harness executed (5 scenarios, pending_live_data). Kokoro baseline captured (9/9 pass, first-audio p50=465ms/p95=507.6ms). Decision gate document populated with ITERATE recommendation — live CUDA validation required before PROMOTE/REJECT. Eval runner fix: streaming scenarios filtered from --matrix path. v1.75.0. |
| QWEN-STREAM-3 | 2026-04-20 | PASS | Streaming hardening: stall detection (8000ms), crash recovery (2s poll), warmup gate, cancellation guards (LL-109 sentinel fix), stream-finished IPC wire (tts-qwen-stream-finished: engine→ipc→preload→renderer→acc.flush()→onEnd). 5 streaming eval scenarios, gate thresholds, eval runner --streaming mode, QWEN_STREAMING_DECISION.md template. 16 new tests. v1.74.0. |
| QWEN-STREAM-2 | 2026-04-20 | PASS | StreamAccumulator + streaming Qwen strategy + live playback. PCM frames buffer to sentence boundaries, streaming strategy instantiated when engine is "qwen" and streaming ready, fallback to non-streaming preserved. Plato flag: async IIFE listener gap (low-risk, QWEN-STREAM-3). 21 new tests. v1.73.0. |
| READER-4M-3 | 2026-04-20 | PASS | Canonical global word anchor + spoken-truth Narrate continuity. Save/resume/mode switching now resolve through one anchor, Flow↔Narrate preserve the same shared-surface position, and Narrate follow/highlight consumes `narration.cursorWordIndex`. 16 new tests plus expanded continuity coverage. v1.72.0. |
| QWEN-STREAM-1 | 2026-04-20 | PASS | Streaming sidecar foundation. Binary-framed PCM protocol, engine manager, IPC/preload bridge, 18 new tests. v1.71.0. |
| READER-4M-2 | 2026-04-20 | PASS | Standalone Narrate mode + four-button controls. N key universal narrate entry. T toggle removed. 14 new tests. v1.69.0. |
| QWEN-PROVISION-1 | 2026-04-20 | PASS | Qwen provisioning/machine-realism hardening shipped at v1.68.0: `main/qwen-engine.js` gained a deterministic `preflight()` probe, IPC/preload/shared types now expose `qwenPreflight`, and settings now surface validation/setup guidance with explicit config-missing, broken-runtime, and supported-host reporting. The standalone `scripts/qwen_preflight.mjs` validator, `docs/testing/QWEN_RUNTIME_SETUP.md`, and `docs/governance/QWEN_SUPPORTED_HOST_POLICY.md` define the setup path and support matrix. Subsequent same-day live testing broadened current non-streaming local Qwen support to CPU-backed hosts but also showed that lane is still too slow for sustained continuous CPU narration, which is why Kokoro-retirement work is now paused behind the approved streaming-Qwen successor design. Verification passed with the focused provisioning suite (`16` tests across `4` files), full `npx vitest run tests`, and `npm run build`; the existing Vite circular-chunk warning remained unchanged. |
| QWEN-HARDEN-1 | 2026-04-20 | PASS | Qwen startup/playback hardening shipped at v1.67.0: `main/qwen-engine.js` now enforces per-command timeouts, deduplicates warmup/voice-list flights, and records truthful preload/status/generate timing plus spike metadata; renderer playback now stops cleanly on engine switches and authoritative handoffs, Qwen first-audio truth is scheduler-backed, and settings preview surfaces truthful timeout/error metadata instead of swallowing failures. Eval artifacts now capture warm preview and warm first-audio budgets, the gated matrix passes with `Warm preview latency p50/p95 = 1120 / 1156 ms`, `Warm first-audio latency p50/p95 = 465 / 507.6 ms`, and `0` startup spikes above `3000 ms`, and the retirement scorecard/listening-review artifacts are now in place with remaining provisioning and human-review blockers explicitly recorded. Verification passed with the focused Qwen hardening suites, adjacent eval/settings reruns, full `npx vitest run tests` (`138` files, `2083` tests), `npm run build`, and `node scripts/tts_eval_runner.mjs --matrix --gates`; the existing Vite circular-chunk warning remained unchanged. |
| QWEN-DEFAULT-1 | 2026-04-19 | PASS | Qwen-first default posture shipped at v1.66.0: new settings and narration profiles now default to Qwen, continuity/portability helpers preserve explicit legacy Kokoro selections without keeping it as a peer default, settings/runtime copy now presents Qwen as the primary live narration lane, and governance docs promoted the approved Qwen-default / Kokoro-deprecation program to the top of the queue. Verification passed with focused default/copy/persistence suites, full `npx vitest run tests`, and `npm run build`; the existing Vite circular-chunk warning remained unchanged. |
| QWEN-PROT-2 | 2026-04-18 | PASS | Bounded live Qwen prototype playback shipped at v1.65.0: Blurby now manages a configured Python sidecar in `main/qwen-engine.js`, exposes `qwenGenerate` over IPC/preload, uses a dedicated Qwen narration strategy with restart-based rate changes and heuristic/null-backed timing, surfaces truthful ready speaker lists in settings, and supports live in-app Qwen preview/playback without changing Kokoro defaults or adding packaged runtime/alignment work. Verification passed with focused Qwen runtime/settings/narration suites, broader touched-neighborhood reruns, full `npx vitest run tests` (`132` files, `2047` tests), and `npm run build`; the existing Vite circular-chunk warning remained unchanged. |
| QWEN-PROT-1 | 2026-04-18 | PASS | Bounded Qwen prototype foundation shipped at v1.64.0: `qwen` is now a first-class engine across shared types, persistence, preload/main status IPC, settings UI, and the browser test harness; `main/qwen-engine.js` truthfully reports config-missing/python-missing/prototype-stub states; and selecting Qwen no longer silently falls through to Web Speech or Kokoro. Verification passed with focused Qwen/settings/persistence suites plus full `vitest` and `npm run build`; a broad `npm test` invocation was blocked by unrelated vendored MeloTTS tests under `tmp/tts-candidates/`, and the existing Vite circular-chunk warning remained unchanged. |
| READER-4M-1 | 2026-04-18 | PASS | Infinite-scroll surface recovery and explicit mode foundation shipped at v1.63.0: `FoliatePageView` now exposes explicit rendered-word roots to `FlowScrollEngine`, live Flow boot/rebuild waits on `waitForSectionReady()` plus `foliateRenderVersion`, shared `ReaderMode` / persisted last-mode fields now admit `narrate`, keyboard compatibility is localized, and `ReaderContainer` Foliate `onLoad` now treats `narrate` as a flow-surface mode. Verification passed with focused reader/foundation suites, full `npm test` (`125` files, `2021` tests), and `npm run build`; existing circular-chunk warning unchanged. |
| TTS-START-1 | 2026-04-17 | PASS | Startup parity shipped at v1.62.0: cached and uncached starts now share one opening-ramp planner contract (`13 -> 26 -> 52 -> 104 -> 148`), entry coverage warms that same shape before cruise coverage, `loadCachedChunk()` reconstructs exact nonzero-start spans from full-word context plus `startIdx`, and eval artifacts now record cached-vs-uncached startup parity plus opening-ramp shape. Verification passed with the focused startup/cache neighborhood (`6` files, `70` tests), dedicated startup-parity evidence (`artifacts/tts-eval/start1-startup-parity`) showing cached/uncached startup `370 / 508 ms` with `Opening ramp parity: match`, the gated release matrix (`9` runs, PASS), full `npm test` (`125` files, `2005` tests), and `npm run build`; existing circular-chunk warning unchanged. |
| TTS-RATE-2 | 2026-04-17 | PASS | Segmented live Kokoro rate response shipped at v1.61.0: generated/cache buckets stay fixed, playback now splits into short scheduler-ready segments so same-bucket edits take effect by the next segment boundary instead of the full parent chunk, scheduler boundary semantics remain parent-chunk aware, and eval artifacts now record trusted `rateResponseLatencyMs` from real segment-start signals. Verification passed with the focused rate slice (`5` files, `42` tests), gated matrix release evidence (`artifacts/tts-eval/rate2-closeout`) showing `Rate response latency p50/p95: 210 / 210 ms`, full `npm test` (`124` files, `1995` tests), and `npm run build`; existing circular-chunk warning unchanged. |
| TTS-CONT-1 | 2026-04-17 | PASS | Readiness-driven continuity shipped at v1.60.0: same-book and cross-book narration handoffs now resume from actual foliate/read-surface readiness instead of fixed `300ms` and `2500ms + 300ms` sleeps, the cross-book overlay is fallback-only rather than a blocking minimum dwell, and eval artifacts now record `sectionHandoffLatencyMs` and `crossBookResumeLatencyMs`. Verification passed with `npm test` (`123` files, `1976` tests), `npm run build`, a gated handoff matrix with non-null cross-book latency, and a section fixture run with non-null section latency; existing circular-chunk warning unchanged. |
| EPUB-TOKEN-1 | 2026-04-17 | PASS | Dropcap/split-token lexical stitching shipped at v1.59.0: no-whitespace contiguous styled fragments now resolve to one logical word across extraction, rendering, click/selection, and narration start paths; rendered spans carry token metadata; stitched-fragment interactions collapse to one stable global word index. Verification passed: focused sli
