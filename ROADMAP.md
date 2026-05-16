# Blurby — Development Roadmap

**Last updated**: 2026-05-16 — ENGINE-DORMANCY-1 executed and verified; TTS-INTEGRATE-1 is now the FIFO head.
**Current state**: v1.75.1 stable. Kokoro is the sole active local/cacheable model engine; Web Speech remains a platform fallback. MOSS-Nano and Pocket TTS are dormant/disabled; Qwen retired/disabled. Desktop v2.0 shipped.
**Finish line**: TTS Architecture Complete — every implicit TTS architecture decision made explicit, tested, and debuggable with Kokoro as the sole active local/cacheable model engine (Web Speech remains a platform fallback).
**Queue**: GREEN depth 7 (7 full specs, 0 stubs).

> **Archives:** Completed sprint full specs across `docs/planning/.Archive/ROADMAP_legacy.md` (Phases 1-6), `docs/planning/.Archive/ROADMAP_2026-05-02.md`, `docs/planning/.Archive/ROADMAP_2026-05-14.md`, and `docs/planning/.Archive/ROADMAP_deferred_2026-05-15.md` (completed phase summaries, Track B Chrome Extension, Track C Android APK, Idea Themes). Closeouts in `docs/governance/close-outs/`. Roadmap review artifacts in `docs/planning/roadmap-reviews/`.
>
> **Sprint closeout convention:** Unless a sprint explicitly says otherwise, every successful CLI sprint auto-merges: stage specific files, commit on sprint branch, merge to `main` with `--no-ff`, push, update governance docs.

---

## Active Conveyor

```
TTS-INTEGRATE-1 → TTS-CACHE-HARDEN-1 → TTS-EVENT-SYNC-1 → NORMALIZER-ENRICH-1
    → TTS-RENDER-MAP-1 → TTS-PIPELINE-1 → TTS-ARCH-DOC-1
        → KOKORO-EXPORT-1 (optional future)
```

**Parallel hotfix lane:** `SK-HYG-2` completed as a Lane E governance/docs reorganization. It did not displace the TTS FIFO conveyor.

**Deferred lanes:** Track B (Chrome Extension EXT-ENR-C), Track C (Android APK-0 through APK-4), Phase 7 (Cloud Sync), Phase 8 (RSS/News), Idea Themes A-K. See `docs/planning/.Archive/ROADMAP_deferred_2026-05-15.md` and `docs/governance/IDEAS.md`.

---

## Parallel Governance Hotfix Lane

#### Sprint SK-HYG-2: Directory Reorganization (Option B)

**Status:** Completed on branch `sprint/sk-hyg-2-directory-reorg` after mid-dispatch Type 3 pivot scope amendment. Exact path-string repairs were allowed in four files (`tests/artifactHygienePolicy.test.ts`, `scripts/tts_engine_scan_index.mjs`, `scripts/qwen_streaming_sidecar.py`, `main/ipc/stats.js`) to restore correctness after the documented moves. IDE metadata and binary audit-package contents are intentionally deferred. This remained a standalone Lane E hotfix and did not change FIFO ordering.

**Decision lock:** Conveyor positioning is the standalone parallel hotfix lane. Artifacts policy is curated Option B: ignore most of `artifacts/` and `tmp/`, then preserve canonical decision evidence in tracked `docs/evidence/`.

**What:** Reorganize `docs/` from 11 top-level folders into 6-7 purpose-specific folders, standardize archives under `.Archive/`, curate canonical evidence out of `artifacts/`, collapse duplicate `tmp_brandcheck*` folders, and update path references.

**Why:** The current docs/archive/artifact layout creates governance drag and clone bloat. This cleanup gives upcoming TTS and release work a clearer tree without touching runtime code.

**Prerequisites:** None. Parallel-safe because it owns Lane E only and has no shared-core touches. Original runtime/test/script edits were forbidden; mid-dispatch amendment allowed only the exact stale path-string repairs required by verification.

**Full spec:** `docs/planning/SK-HYG-2-DISPATCH.md`

**Done when:**
1. `docs/` has `governance/`, `planning/`, `studies/`, `testing/`, `extension/`, `evidence/`, and optionally `brand/`.
2. Filename-suffix archives are replaced by `.Archive/` subfolders.
3. `artifacts/`, `tmp/`, and `tmp_brandcheck*` are ignored or removed per the dispatch, while curated evidence is preserved under `docs/evidence/`.
4. `ROADMAP.md`, `docs/governance/SPRINT_QUEUE.md`, `CLAUDE.md`, `README.md`, and `ROADMAP_SPECS.md` point to the new paths.
5. Verification proves no forbidden code/test/build paths were modified or staged, and dirty 13d implementation files remain unstaged.
6. Mid-dispatch amendment is recorded; binary audit packages and IDE metadata old-path strings are deferred.

**Effort:** M (~3 LOE). Two waves: Wave A folder/archive/evidence cleanup; Wave B cross-reference sweep, verification, docs, and git.

**Roster:** Hermes (mechanical moves/gitignore/git) • Hephaestus (archive/evidence/path judgment) • Hippocrates (test/build sanity if required by final diff) • Solon (spec compliance) • Plato (quality/path-trap review) • Herodotus (governance closeout).

---

## TTS Architecture Completion — Active Conveyor Belt

> **Finish line:** TTS Architecture Complete — make every implicit TTS architecture decision explicit, tested, and debuggable. Desktop v2.0 was achieved; this phase makes the TTS system export-ready.
> **Conveyor sequence:** ~~TTS-SYNC-1~~ PASS/pushed → ~~TTS-DIAG-1~~ PASS/pushed → ~~ENGINE-DORMANCY-1~~ PASS → TTS-INTEGRATE-1 (dispatch-ready) → TTS-CACHE-HARDEN-1 (findings-driven) → TTS-EVENT-SYNC-1 → NORMALIZER-ENRICH-1 → TTS-RENDER-MAP-1 → TTS-PIPELINE-1 → TTS-ARCH-DOC-1.
> **Queue rule:** No exploratory TTS/model or non-desktop expansion work until this conveyor completes. Default engine remains Kokoro; Qwen is retired for Desktop v2 and remains disabled.

### Standing Rules All Skeletons Inherit

1. **PR-2 / PR-3 / POSTV2 type gate:** After any code change run `npm run typecheck` and `npm test`; after any UI/dependency change run `npm run build`.
2. **PR-7:** CSS custom properties for all theming — no inline styles.
3. **PR-10:** All JSON writes must be atomic (write-tmp + rename).
4. **PR-12:** Context for cross-cutting concerns (settings, toasts, theme); props for direct parent-child data.
5. **PR-17:** Never drive imperative DOM animations from React useEffect — use a plain class.
6. **PR-26:** Settings that control a runtime engine must have explicit sync bridges.
7. **SRL-012:** For Full-tier sprints, Solon and Plato tasks MUST be marked parallel-eligible.
8. **Queue depth ≥3:** If queue drops below 3 after completion, stop and backfill before next dispatch.
9. **Spec-compliance before quality:** Each task gets Solon check (does it match spec?) before Plato check (is it well-built?).
10. **Dispatch sizing:** 40 tool-use ceiling per wave. Sprints with 5+ implementation tasks must be pre-split into waves.

Deviation protocol: a skeleton may override a standing rule only by naming the rule and justifying the waiver in its spec.

> **Architecture context:** AD-1 through AD-4, Cross-Sprint Type-Flow Matrix, Dissolved Sprints, and all grounding evidence / implementation detail in [`ROADMAP_SPECS.md`](ROADMAP_SPECS.md).

---

#### Sprint TTS-INTEGRATE-1: Integrate TTS Sync And Diagnostics Stack

**Status:** Dispatch-ready after `ENGINE-DORMANCY-1`. Previous broad verification was blocked by MOSS Nano probe failures; those probes are now gated behind explicit opt-in.

**What:** Land the already-complete `TTS-SYNC-1` and stacked `TTS-DIAG-1` branches into canonical `main` from a clean integration context.

**Why:** `TTS-SYNC-1` and `TTS-DIAG-1` are complete, verified, pushed, and governance-recorded, but downstream sprints should not start from canonical `main` until their sync/diagnostics architecture is actually present there. The original main worktree had unrelated dirty files, so integration must be handled deliberately rather than hidden as a prerequisite on `TEST-HARNESS-1`.

**Prerequisites:** `TTS-SYNC-1` PASS/pushed at `142dc24`; `TTS-DIAG-1` PASS/pushed at `c97e446`; both branches available from origin.

**Done when:**
1. A clean integration context exists, preferably a temporary worktree if canonical `main` remains dirty.
2. `sprint/tts-sync-1-highlight-controller` is merged first, preserving the centralized `TimingMetadataStore` and `HighlightSyncController` behavior and closeout docs.
3. `sprint/tts-diag-1-diagnostics-bundle` is merged second, preserving the redacted `tts-diagnostics-v1` bundle, settings export, eval-runner validation, runbook docs, and redaction guardrails.
4. Any conflicts are resolved by preserving canonical governance freshness plus the branch implementation facts; do not resurrect stale Desktop v2.0 queue state from either branch.
5. Verification passes after the combined merge: focused sync tests, focused diagnostics tests, `npm run typecheck`, `npm run build`, `npm test`, and `git diff --check`.
6. Canonical governance is updated from "PASS/pushed, merge pending" to "landed on main" for both sprints only after the broad verification gate is resolved and the integration branch is committed/pushed/merged or PR-approved.
7. The final integration branch is committed, pushed, and either merged to `main` or prepared for PR according to the repository's current dirty-worktree constraints.

**Effort:** S/M (~2). Git integration plus verification; no intentional product behavior change beyond landing already-reviewed work.

**Roster:** Zeus/Codex parent (merge orchestration) • Hippocrates (focused/full verification) • Solon (governance freshness check) • Herodotus (closeout/governance staging if merge cannot land directly).

**Source:** TTS-SYNC-1 closeout, TTS-DIAG-1 closeout, and 2026-05-15 queue correction that integration is the true prerequisite before `TEST-HARNESS-1`.

---

#### Sprint TTS-CACHE-HARDEN-1: Cache/Pipeline Type Safety And Timing Identity Parity

**What:** Fix cache-hit/miss observational asymmetry, harmonize timing classification types, add runtime shape validation at the main↔renderer IPC boundary, and harden pipeline edge cases (dangling promises, backpressure on resume, cache key safety). This sprint makes the cache layer honest — downstream consumers (highlight sync controller, diagnostics bundle, event-driven sync) can trust that a cached chunk carries the same metadata as a freshly generated one.

**Why:** `loadCachedChunk` returns fewer metadata fields than fresh chunks — cache hits and misses are observably different to the scheduler and HighlightSyncController. Composite voice IDs with `/` can break v1 cache keys. Timing classification has three overlapping concepts that need harmonization. See [`ROADMAP_SPECS.md`](ROADMAP_SPECS.md) for full grounding.

**Prerequisites:** `TTS-INTEGRATE-1` (needs `HighlightSyncController` and `TimingMetadataStore` on `main` to verify parity fixes).

**Done when (core gate — required for sprint completion):**
1. `ScheduledChunk` interface (`src/utils/audioScheduler.ts:79-103`) gains optional fields: `timingTruth?: TtsProviderTimingTruth`, `chunkId?: string`. `boundaryType` and `wordTimestamps` already exist as optional fields.
2. `loadCachedChunk` (`src/utils/ttsCache.ts:26-55`) reads the timing sidecar via the `TtsCacheReadResult.timing` field and populates `timingTruth` and `boundaryType` on the returned `ScheduledChunk` from sidecar data. Cache hits now carry the same timing/boundary metadata as fresh chunks.
3. Timing classification harmonized: `TtsProviderTimingTruth` is the single canonical enum. `classifyTiming()` derives `"trusted"` only when truth is `"word-native"` AND timestamps non-empty AND count matches chunk span. `classifyTiming` is the single decision point — no parallel classification logic.
4. Legacy v1 cache key (`main/tts-cache.js:135`) encodes `/` in voice IDs to prevent path traversal (e.g., `voiceId.replace(/\//g, '__')` or equivalent safe encoding). V2 keys already use hashed identity and are safe.
5. `main/tts-cache.js` IPC responses (the `TtsCacheReadResult` shape returned to renderer) include a lightweight runtime shape check at the IPC boundary — verify that `durationMs` is a number (not a string) and that `wordTimestamps`, when present, is an array of `{word, startTime, endTime}` objects. Log and reject malformed responses rather than propagating garbage downstream. This is a guard, not a schema validator — keep it cheap.
6. All existing cache tests pass. New tests cover: cache-hit metadata parity (a cached chunk has the same `timingTruth`/`boundaryType` as the originally generated chunk), timing classification derivation (including the full-record validation — truth + timestamps + count), v1 slash encoding, IPC shape validation rejection.
7. `npm test` passes, `npm run typecheck` passes, `npm run build` passes.


**Effort:** S-M (~2). Type additions, sidecar reading in cache path, IPC guard, and edge-case fixes. No architectural changes.

**Roster:** Hephaestus (cache/pipeline fixes) • Hippocrates (parity tests + regression suite) • Solon (spec compliance) • Plato (timing ownership review).

**Source:** Implementation Review (2026-05-15) P1 #2-3, P2 #7-11; Literature Review (2026-05-11) §4.6.

---

#### Sprint TTS-EVENT-SYNC-1: Event-Driven Word Boundary Sync

**What:** Promote `onTruthSync` from a visual-only hint to the primary highlight-advance trigger, demoting the RAF-based polling loop from the word-highlight hot path. RAF is retained for progress bar, time-remaining display, and as fallback for non-word-native timing modes. Add a normalized→original word index alignment table to `segmentNormalizer` so Kokoro-emitted token positions (in normalized text space) correctly resolve to original word positions in the DOM. Elevate word-boundary emission from a strategy implementation detail to a provider-level contract (inspired by RealtimeTTS's `TimingInfo` interface where every engine emits `{word, start_time, end_time}` through a unified callback).

**Why:** Research codebases achieve word-level highlighting via explicit word-boundary events, not duration estimation. Blurby has the pieces (`onTruthSync`, `highlightSyncController`) but the hot path still polls via RAF. Event-driven sync is simpler and eliminates the time-to-word resolution layer. Word-boundary emission should be a provider-level contract.

**Prerequisites:** `TTS-INTEGRATE-1` (needs `HighlightSyncController` and `TimingMetadataStore` on `main`), `TTS-CACHE-HARDEN-1` (cache-hit timing parity — event-driven sync needs `timingTruth` on cached chunks to make correct highlight decisions).

**Done when:**
1. `segmentNormalizer.ts` produces a `normalizedToOriginalMap: number[]` in the `SegmentNormalizationResult` — a parallel array where `map[normalizedTokenIndex] = originalWordIndex`, accounting for token expansions (e.g., "$5" → ["five", "dollars"] both map back to the original "$5" word's index). Golden fixtures updated with expected maps.
2. Kokoro strategy emits word-boundary events (via `onTruthSync` or equivalent callback) on each word advance during playback, carrying the resolved **original** wordIndex (using the alignment map from criterion 1).
3. `useNarration` consumes word-boundary events as the primary highlight-advance trigger, calling `resolveHighlightSync` from the event handler instead of RAF.
4. RAF polling demoted from word-highlight hot path only after measurement confirms event-driven achieves equal or better p95 latency. RAF retained for progress bar, time-remaining, and non-word-native fallback.
5. `highlightSyncController.resolve()` interface is unchanged — called from the event handler instead of RAF, receiving the already-resolved original wordIndex.
6. `narrateDiagnostics` adds a `"word-boundary-event"` event type tracking event timing, source wordIndex (normalized), resolved wordIndex (original), and any alignment corrections.
7. `lastConfirmedAudioWordRef` ownership unchanged (LL-079) — events feed into the existing write path, not a new one.
8. Provider-level timing contract: `ttsProvider.ts` `ProviderCapabilities` gains an `emitsWordBoundaryEvents: boolean` field. Kokoro sets `true`; dormant engines set `false`. The word-boundary callback type is defined at the provider level, not per-strategy.
9. Fallback preserved: when `timingTruth !== "word-native"`, the controller downgrades to chunk/segment mode — no change to fallback behavior.
10. Adaptive cursor lag: event-driven sync bypasses fixed `NARRATION_CURSOR_LAG_MS`; constant retained as non-event-driven fallback.
11. `npm test` passes, `npm run typecheck` passes, `npm run build` passes.

**Effort:** M-L (~4-5). Changes span normalizer, strategy, useNarration, provider types, and diagnostics; Phase 0 hard gate adds segment identity assessment overhead; core highlight controller interface unchanged.

**Roster:** Hephaestus (alignment table + normalizer) • Athena (event-driven sync wiring + provider contract + segment identity assessment) • Hippocrates (regression suite + alignment fixtures) • Solon (spec compliance) • Plato (timing ownership review).

**Source:** Cross-codebase research (2026-05-15): readest, RealtimeTTS, sioyek. OutsideAudit.1 F3/F7.

---

#### Sprint NORMALIZER-ENRICH-1: Kokoro Text Normalization Gap Fill

**What:** Fill normalization gaps identified by comparing Blurby's `segmentNormalizer.ts` (12 transforms) against abogen's `kokoro_text_normalization.py` (20+ transforms). Add missing transforms that improve Kokoro speech quality for English text. Add a heteronym disambiguation layer using context heuristics.

**Why:** abogen's normalizer handles cases Blurby currently sends raw to Kokoro: fractions ("3/4" → "three quarters"), decimal numbers ("3.14" → "three point one four"), number ranges ("10–20" → "ten to twenty"), URLs ("www.example.com" → "example dot com"), address abbreviations ("St." → "Street" before number conversion), dotted acronyms ("U.S.A." → "USA"), terminal punctuation enforcement, and all-caps quote downcasing ("THE STORM" → "the storm" inside quotes). Each of these produces better Kokoro phonemization than letting the model guess. abogen also disambiguates heteronyms ("read" past-tense → /rɛd/, "wind" verb → /waɪnd/) via POS-tag heuristics — Blurby can approximate this with simpler context-window rules since full POS tagging is heavy.

**Prerequisites:** `TTS-EVENT-SYNC-1` (word alignment table must exist before adding transforms that change token count).

**Done when:**
1. `segmentNormalizer.ts` adds at minimum these new transforms (in correct pipeline order): `dotted-acronym-normalization`, `address-abbreviation-expansion`, `url-normalization`, `fraction-expansion`, `decimal-expansion`, `number-range-expansion`, `terminal-punctuation-enforcement`, `all-caps-quote-downcasing`, `heteronym-disambiguation`.
2. Transform ordering validated: address abbreviations before number conversion (avoids "St." → "Saint" false positives); dotted acronyms before abbreviation expansion; URL normalization before number conversion; heteronym disambiguation after all text transforms.
3. Each new transform has ≥2 golden fixture entries in `english-v1.json` with input/expected-output pairs, including edge cases (e.g., "St. Louis" should NOT expand "St." to "Street").
4. `normalizedToOriginalMap` correctly tracks token expansions from new transforms (verified against TTS-EVENT-SYNC-1's alignment table contract).
5. Heteronym disambiguation uses context-window heuristics (not full POS tagging): check surrounding words for tense/usage indicators. Initial heteronym list: `read` (past vs. present), `wind` (noun vs. verb), `tear` (noun vs. verb), `close` (adjective vs. verb), `lead` (noun vs. verb), `live` (adjective vs. verb), `bow` (noun vs. verb), `minute` (noun vs. adjective). Disambiguation replaces the word with an alternate spelling that Kokoro phonemizes correctly (same approach as abogen's `heteronym_overrides.py`).
6. All existing golden fixtures continue to pass unchanged — new transforms must not alter text that existing transforms already handle.
7. `TTS_NORMALIZER_VERSION` is bumped (triggers cache invalidation for affected segments).
8. `npm test` passes, `npm run typecheck` passes.

**Effort:** M (~3). Normalizer additions with fixtures; no architectural changes.

**Roster:** Hephaestus (transforms + fixtures) • Hippocrates (golden fixture validation) • Solon (spec compliance).

**Source:** 2026-05-15 cross-codebase research — abogen `kokoro_text_normalization.py` (20+ transforms, heteronym overrides), abogen `pronunciation_store.py` (per-book pronunciation overrides).

---

#### Sprint TTS-RENDER-MAP-1: Pre-Built Word Position Index

**What:** Build a word-index→DOM-position lookup table once at render time (when foliate-js renders word spans), replacing the live DOM querying that currently happens during narration highlight updates. Complement the event-driven sync from `TTS-EVENT-SYNC-1` with O(1) position resolution.

**Why:** sioyek's architecture pre-builds parallel arrays (`text[i] → rect[i]`) during PDF rendering via `get_page_text_and_line_rects_after_rect()`, giving O(1) word-position lookup during TTS playback — no search needed. Blurby already has `data-word-index` attributes on word spans in the foliate-js DOM, but highlight updates currently query the DOM live (finding the span by attribute selector, getting its bounding rect, computing overlay position). With event-driven sync (`TTS-EVENT-SYNC-1`), word-boundary events fire at audio rate — the DOM query on each event is the remaining bottleneck. A pre-built index eliminates it and makes the event→visual path purely computational.

**Prerequisites:** `TTS-EVENT-SYNC-1` (event-driven sync is the consumer), `NORMALIZER-ENRICH-1` (alignment table covers enriched transforms).

**Done when:**
1. A `WordPositionIndex` class/utility is built once when foliate-js renders or re-renders a section's word spans — captures each word's bounding rect (`{top, left, width, height}`) relative to the content container, keyed by `data-word-index`.
2. The index is invalidated and rebuilt on: section change, container resize (via existing `ResizeObserver`), foliate re-render (`foliateRenderVersion` change), and zoom/font-size change.
3. Event-driven word-boundary events in `FoliatePageView` resolve word position via O(1) index lookup (`wordPositionIndex.get(wordIndex)`) instead of live `querySelector('[data-word-index="N"]')` + `getBoundingClientRect()`.
4. The narration highlight overlay (collapsing cursor band) uses indexed positions directly for both initial placement and per-word advance.
5. Performance: word-advance latency (event → visual update) is ≤2ms at p95, measured via the existing `narrateDiagnostics` infrastructure. Current estimated latency with live DOM queries is ~5-8ms.
6. Index build time is ≤50ms for sections with ≤5,000 word spans (typical chapter). Measured and logged via diagnostics.
7. Diagnostic event tracks index builds (word count, build time), cache hits/misses per word advance, and rebuild triggers.
8. Graceful degradation: if the index is stale or missing (e.g., mid-rebuild during resize), falls back to live DOM query transparently — no narration interruption.
9. `npm test` passes, `npm run typecheck` passes, `npm run build` passes.

**Effort:** M (~3). New utility + integration with FoliatePageView event-driven sync path.

**Roster:** Hephaestus (WordPositionIndex utility + FoliatePageView integration) • Hippocrates (performance benchmarks + regression suite) • Solon (spec compliance).

**Source:** 2026-05-15 cross-codebase research — sioyek `get_page_text_and_line_rects_after_rect()` (parallel arrays built at render time, O(1) playback lookup via positional identity), cross-cutting insight from readest/RealtimeTTS/sioyek corpus.

---

#### Sprint TTS-PIPELINE-1: Narration Pipeline Integration Test And Normalization Fixture Expansion

**What:** Add a cross-module integration test that traces one narration chunk through planner → normalizer → cache identity → timing sidecar, and expand the golden normalization fixtures from 8 to 15+.

**Why:** Each pipeline stage (narrationPlanner, segmentNormalizer, TtsCacheIdentityV2, timing sidecar) is individually tested, but no test currently verifies the end-to-end chain. The adversarial review (2026-05-14) identified this as the highest-leverage, lowest-cost residual gap. Additional fixture coverage for OCR text, poetry, tables, and footnote-heavy documents improves normalizer confidence before export work.

**Prerequisites:** `TTS-NORMALIZE-1`, `TTS-CACHE-TIMING-1` (both landed), `TTS-EVENT-SYNC-1` (event-driven sync + alignment table), `NORMALIZER-ENRICH-1` (enriched transforms), `TTS-RENDER-MAP-1` (word position index).

**Done when:**
1. At least one integration test constructs a realistic text segment, runs it through `buildNarrationPlan()` → `normalizeSegmentText()` (including `normalizedToOriginalMap` verification) → the production cache identity construction path (or a newly extracted pure helper used by production) → timing sidecar shape → word-boundary event emission → word position index lookup — end-to-end in a single test.
2. The integration test asserts: planner output (`PlannedChunk` with `startIdx`, `endIdx`, `boundaryType`, `silenceMs`) feeds correctly into the normalizer; normalizer output (`SegmentNormalizationResult` with `originalText`, `normalizedText`, `sourceTextHash`, `normalizedTextHash`, `normalizerVersion`) feeds into production cache identity; cache identity `schemaVersion` is 2 with correct provider/voice/hash fields.
3. Golden fixture count in `tests/fixtures/tts-normalization/english-v1.json` is ≥15 (currently 8: ordinary-prose-nfkc-time-date, dialogue-currency-abbreviation, heading-roman-spaced-initials, line-break-delimiters, number-ordinals-cardinals, safe-footnote-marker, numeric-us-date, abbreviations).
4. New fixtures cover: OCR artifacts (misrecognized characters), poetry/verse (line breaks as semantic units), tabular data (numbers with alignment spaces), footnote-heavy academic text, mixed-language segments (English with embedded foreign words), ellipsis and em-dash normalization, and nested quotation marks.
5. All existing normalizer tests continue to pass. Production code changes are allowed only if needed to extract an existing cache-identity builder into a pure helper for testable production-path coverage; no normalization behavior changes.
6. **Cache-hit parity verification:** Generate → cache → read-back → assert cached `ScheduledChunk` matches original metadata end-to-end.
7. **Stress fixtures:** Mixed-length segments, boundary-edge chunks, rapid pause/resume (≥5 cycles), all-cache-hit playback.
8. **Content-addressed cache assessment:** Assess whether V2 identity could support content-addressed lookup. Document as test comment; no production change unless trivially clean.
9. **Unified NarrationSegment domain type assessment:** Assess whether `PlannedChunk`, `SegmentNormalizationResult`, `TtsCacheIdentityV2`, `TimingMetadataChunk` should consolidate into `NarrationSegment`. Document; extract only if clean.

**Effort:** M (~2-3). Test and fixture work plus NarrationSegment domain type assessment (criterion 9); optional pure-helper extraction only if needed to avoid duplicating cache identity logic in tests.

**Roster:** Hippocrates (integration test + fixtures) • Athena (NarrationSegment assessment) • Solon (spec compliance).

**Source:** 2026-05-14 adversarial review of TTS literature; `docs/planning/roadmap-reviews/2026-05-14-plan.md`. OutsideAudit.1.2026-05-15 F3 (NarrationSegment domain type assessment elevated from optional to expected deliverable).

---

#### Sprint TTS-ARCH-DOC-1: TTS Architecture Decisions Document

**Status:** Full spec. Docs-only — no code changes.

**What:** Create `docs/governance/TTS_ARCHITECTURE_DECISIONS.md` — a standing governance document that captures every explicit TTS architecture decision made during the TTS Architecture Completion phase. This document becomes the authoritative reference for why the TTS system is built the way it is.

**Why:** The TTS literature review (2026-05-11), adversarial review (2026-05-14), Kokoro-only pivot (2026-05-15), and each sprint's closeout contain valuable architectural decisions, engine evaluation criteria, and the dormancy/retirement rationale. These currently live scattered across review artifacts, roadmap entries, close-out files, and LESSONS_LEARNED. A single governance document makes them discoverable and durable.

**Prerequisites:** All preceding sprints in the TTS Architecture Completion conveyor (ENGINE-DORMANCY-1 through TTS-PIPELINE-1).

**Effort:** S (~1). Documentation-only sprint — no code changes, no tests, Tier: None.

**Roster:** Herodotus (sonnet) — documentation specialist.

**Source files (read order):**
1. `docs/governance/TECHNICAL_REFERENCE.md` § "Narrate Mode Architecture" — current architecture description
2. `docs/testing/MOSS_DECISION_LOG.md` — engine posture decisions
3. `docs/governance/QWEN_SUPPORTED_HOST_POLICY.md` — Qwen disable rationale
4. `docs/planning/roadmap-reviews/2026-05-11-literature-review.md` — TTS literature review
5. `docs/planning/roadmap-reviews/2026-05-14-adversarial-review.md` — adversarial review of literature gaps
6. `docs/planning/roadmap-reviews/2026-05-15-plan.md` — final conveyor plan
7. Sprint closeouts in `docs/governance/close-outs/` for: TTS-SYNC-1, TTS-DIAG-1, ENGINE-DORMANCY-1, TTS-INTEGRATE-1, TTS-CACHE-HARDEN-1, TTS-EVENT-SYNC-1, NORMALIZER-ENRICH-1, TTS-RENDER-MAP-1, TTS-PIPELINE-1
7a. `Blurby.Research/.Findings/Blurby_TTS_Literature_Codebase_Review_2026-05-11.md` — cross-codebase analysis (findings provenance source)
7b. `Blurby.Research/.Findings/Blurby_Kokoro_TTS_Implementation_Review_2026-05-15.md` — implementation review (findings provenance source)
8. `src/types/ttsProvider.ts` + `src/utils/ttsProviderRegistry.ts` — registry implementation
9. `src/utils/segmentNormalizer.ts` — normalization layer
10. `main/tts-cache.js` — cache identity and timing sidecars

**Done when:** See `ROADMAP_SPECS.md` § TTS-ARCH-DOC-1 for full 9-item acceptance criteria. Summary: `docs/governance/TTS_ARCHITECTURE_DECISIONS.md` exists with all 11 sections (engine posture, architecture layers, adopt/reject/defer register, invariants, dormancy contract, research provenance, future work, error taxonomy, findings provenance, cache evolution roadmap, AD-1–AD-4 migration), TECHNICAL_REFERENCE.md links to it, and ROADMAP_SPECS.md is updated to reference the governance document.

---

#### Sprint KOKORO-EXPORT-1: Long-Form Audio And Subtitle Export (Optional Future)

**Goal:** Explore Abogen-style offline audiobook export for Blurby after Kokoro runtime and chunk/timing truth are stable: audio file export, chapter markers, and optional subtitle/timestamp artifacts.

**Why:** This is valuable, but it is not on the immediate Kokoro reliability path. It should stay optional until live reading playback, offline readiness, and timing truth are solid.

**WHERE:** Future spec should start from `scripts/kokoro_pair_baseline.mjs`, `scripts/moss_kokoro_benchmark.mjs`, Kokoro generation IPC, chunk metadata from `KOKORO-DEEPEN-2`, and Abogen's export/subtitle code.

**Status:** Deferred. Do not dispatch until TTS Architecture Completion conveyor completes (TTS-SYNC-1 through TTS-ARCH-DOC-1). Export depends on durable segment identity, cache identity, timing sidecars, and highlight/timing truth; it is not the next sprint.
