# Blurby — Development Roadmap

**Last updated**: 2026-05-11 PM — `KOKORO-DEEPEN-2` closeout completed on `sprint/kokoro-deepen-2-clean-main`: Narrate chunk/timing hardening now runs through Kokoro timing truth (chunk-first visuals, trusted-word-only bold highlight, chunk-only fallback when timing is missing), with focused verification passing. `POSTV2-REVIEW-1` remains the separate review/commit/merge gate for the post-v2 remediation worktree. Desktop v2 posture remains Kokoro default/available, MOSS-Nano recommended opt-in, Pocket TTS available opt-in, and Qwen retired/disabled.
**Current branch**: `main`
**Current state**: v1.75.1 stable, with package metadata aligned to v1.75.1. EINK-6A, EINK-6B, GOALS-6B, MOSS-NANO-13a, MOSS-NANO-13B, MOSS-NANO-13c, MOSS-NANO-13d, MOSS-NANO-13e, POCKET-TTS-1, POLISH-1, RELEASE-1, POSTV2-REL-1, POSTV2-ENGINE-1, and POSTV2-NARR-1 have landed in the Desktop v2.0/post-v2 remediation conveyor. QWEN-STREAM-4 closed with ITERATE. MOSS-NANO-12 closed as NANO_EXPERIMENTAL_ONLY. MOSS-NANO-13d produced the first real app-selected Nano four-mode evidence artifact and the gate passed cleanly with decision `NANO_RECOMMENDED_OPT_IN`. MOSS-NANO-13e records that as the bounded product decision: Nano is recommended opt-in, Kokoro remains default/available, and Qwen is retired for Desktop v2 and remains disabled. POCKET-TTS-1 adds Pocket TTS as an available opt-in engine with sidecar, IPC/preload, renderer strategy, settings/preview selection, and no public voice-cloning UX in v2.0. POLISH-1 completed the release-readiness polish pass, RELEASE-1 recorded the release closeout, and POSTV2 remediation implemented the audit cleanup candidate pending review/commit/merge. After the post-v2 review gate, the approved TTS investment path is Kokoro: deterministic asset/runtime readiness, long-form chunk/timing hardening, and evidence-first voice-profile exploration.
**Governing roadmap**: This file is the single source of truth. Phase overview archived from `docs/project/ROADMAP_V2_ARCHIVED.md`.
**Finish line**: Desktop v2.0 Shipping — Blurby desktop feature-complete and polished (E-Ink independence, reading goals, brand finalized, UX polish pass) AND **three TTS engines available**: **Kokoro** as the default and operational floor, **MOSS-Nano** as the recommended opt-in (per 13d's clean `NANO_RECOMMENDED_OPT_IN` provenance-backed gate result and 13e's product decision closeout), and **Pocket TTS** as an available opt-in (per POCKET-TTS-1 integration, scaffolded for voice cloning but UX-deferred to v2.1). **Qwen is retired for Desktop v2 and remains disabled.** Post-v2 TTS work now doubles down on Kokoro as the primary product baseline rather than reopening default-engine churn. Android, Cloud Sync, RSS/News remain deferred lanes beyond this finish line.
**Roadmap reviews**: 2026-05-02 AM (initial ceremony, baseline) → 2026-05-02 PM (scope expanded for MOSS-NANO) → 2026-05-04 PM (13d evidence closeout; 13e product-decision rescope) → 2026-05-10 PM (Abogen Kokoro review; Kokoro Deepening Program approved after POSTV2 review). Verdict: GREEN on Desktop v2 closeout / YELLOW on pending review-merge; no new successor-model exploration is approved. Latest assessment: `docs/project/roadmap-reviews/2026-05-02-pm-assessment-addendum.md`. Latest plan: `docs/project/roadmap-reviews/2026-05-02-pm-plan.md`. Audit basis: `docs/audit/2026-05-02-moss-nano-productization-third-party-audit/Response/`.

> **Navigation:** Forward-looking sprint specs below. Completed sprint full specs archived in two files: `docs/project/ROADMAP_ARCHIVE.md` (legacy, Phases 1–6) and `docs/project/ROADMAP_ARCHIVE_2026-05-02.md` (recent migrations from 2026-05-02 roadmap review). Phase 1 fix specs in `docs/audit/AUDIT 1/AUDIT 1. STEP 2 TEAM RESPONSE.md`.
>
> **Sprint closeout convention:** Unless a sprint explicitly says otherwise, every successful CLI sprint auto-merges as part of closeout: stage specific files, commit on the sprint branch, merge to `main` with `--no-ff`, push, then update governance docs to reflect the landed state.

---

## Execution Order

```
Phase 1: Stabilization (AUDIT-FIX 1A–1F) ── COMPLETE (v1.4.14)
    │
    ▼
Phase 2: EPUB Content Fidelity ── COMPLETE (v1.5.1)
    │
    ▼
Phase 3: Flow Mode Redesign ── COMPLETE (v1.6.1)
    │
    ▼
Phase 4: Blurby Readings ── COMPLETE (v1.9.0)
    │
    ▼
Phase 5: Read Later + Chrome Extension
  ├── 5A ✅ E2E + Queue (v1.10.0)
  └── 5B → EXT-5B: Pairing UX ✅
    │
    ▼
Phase 6: TTS Hardening & Stabilization ── COMPLETE (v1.37.1)
  ├── TTS-6C→6S + HOTFIX-11 ✅ (v1.14.0–v1.28.0)
  ├── TTS-7A→7R + EXT-5C + HOTFIX-12 ✅ (v1.29.0–v1.37.1)
  │
  │  Desktop v2.0 Conveyor (active — see § Desktop v2.0)
  ├── EINK-6A: E-Ink Foundation ✅
  ├── EINK-6B: E-Ink Reading Ergonomics ✅
  └── GOALS-6B: Reading Goal Tracking ✅
    │
    ▼
SELECTION-1: Word Anchor Contract (BUG-151/152/153 absorbed) ✅
    │
HOTFIX-14: Import & Connection Fixes (BUG-155/156/157/158) ✅
    │
HOTFIX-15: Narration Cursor Polish (BUG-159/160/161) ✅
    │
    ├───────────────────────────────────┐
    ▼                                   ▼
Track A: Flow Infinite Reader    Track B: Chrome Extension Enrichment
  ├── FLOW-INF-A: Reading Zone ✅   ├── EXT-ENR-A: Resilient Connection ✅
  ├── FLOW-INF-B: Timer Cursor ✅  ├── EXT-ENR-B: Auto-Discovery Pairing ✅
  └── FLOW-INF-C: Cross-Book ✅     └── EXT-ENR-C: In-Browser Reader (optional)
    │                                   │
    └──────────────┬────────────────────┘
                   │
    NARR-TIMING: Real Word Timestamps ✅ (v1.44.0)
                   │
    STAB-1A: Startup & Flow Stabilization ✅ (v1.45.0)
                   │
    PERF-1: Full Performance Audit & Remediation ✅ (v1.47.0)
                   │
    REFACTOR-1A: ReaderContainer Decomposition ✅ (v1.48.0)
                   │
    REFACTOR-1B: Component & Style Cleanup ✅ (v1.49.0)
                   │
    TEST-COV-1: Critical Path Test Coverage + Security ✅ (v1.50.0)
                   │
    NARR-LAYER-1A: Narration as Flow Layer — Foundation ✅ (v1.51.0)
                   │
    NARR-LAYER-1B: Narration as Flow Layer — Consolidation ✅ (v1.52.0)
                   │
    TTS-EVAL-1: Flow/Narration Sync and Audio Quality Harness ✅ (v1.53.0)
                   │
    TTS-EVAL-2: TTS Evaluation Matrix & Soak Runner ✅ (v1.54.0)
                   │
    TTS-EVAL-3: TTS Quality Gates & Release Baseline ✅ (v1.55.0)
                   │
    TTS-HARDEN-1: Kokoro Bootstrap & Engine Recovery ✅ (v1.56.0)
                   │
    TTS-HARDEN-2: Narration Handoff Integrity & Extraction Dedupe ✅ (v1.57.0)
                   │
    TTS-RATE-1: Pitch-Preserving Tempo for Kokoro ✅ (v1.58.0)
                   │
    EPUB-TOKEN-1: Dropcap + Split-Token Word Stitching ✅ (v1.59.0)
                   │
    TTS-CONT-1: Readiness-Driven Continuity ✅ (v1.60.0)
                   │
    TTS-RATE-2: Segmented Live Rate Response ✅ (v1.61.0)
                   │
    TTS-START-1: Startup Parity & Opening Cache Contract ✅ (v1.62.0)
                   │
    READER-4M-1: Infinite-Scroll Surface Recovery & Explicit Mode Foundation
                   │
    QWEN-PROT-2: Qwen Sidecar Runtime & Live Prototype Playback
                   │
    QWEN-DEFAULT-1: Flip the Product Default to Qwen
                   │
    QWEN-HARDEN-1: Startup, Playback, and Decision-Quality Evidence
                   │
    QWEN-PROVISION-1: Deterministic Provisioning and Supported-Host Policy
                   │
    QWEN-STREAM-1: Streaming Sidecar Foundation (Lane D — parallel-safe) ✅ (v1.71.0)
                   │
    QWEN-STREAM-2: Accumulator + Strategy + Live Playback ✅ (v1.73.0)
                   │
    QWEN-STREAM-3: Streaming Hardening + Evidence + Decision Gate ✅ (v1.74.0)
                   │
    QWEN-STREAM-4: Live Validation + Promotion Decision ✅ (v1.75.0, ITERATE)
      ├── *Historical posture (as of QWEN-STREAM-4 close, v1.75.0):* Qwen was the default narration engine; Kokoro was the deprecated legacy fallback; streaming Qwen lane closed at ITERATE rather than PROMOTE.
      ├── *Current posture (as of v1.75.1, post MOSS-NANO-13e):* Qwen is **retired for Desktop v2 and disabled**; Kokoro is the **default and operational floor**; MOSS-Nano is **recommended opt-in** from 13d's clean `NANO_RECOMMENDED_OPT_IN` provenance gate and 13e's product decision closeout. This is not a default-engine change.
      └── See `docs/governance/QWEN_SUPPORTED_HOST_POLICY.md` for current Qwen disable rationale and `docs/testing/MOSS_DECISION_LOG.md` for the latest engine-posture decisions.
                   │
    MOSS-0: Flagship Feasibility And Host Truth ✅
                    │
    MOSS-1: CPU-Only Runtime Bring-Up Outside Blurby ✅
                    │
    MOSS-2: Live-Book Flagship Feasibility And Decision Evidence ✅
                    │
    MOSS-SPEED-1: Flagship Runtime Performance Rescue ✅ (PAUSE_RUNTIME_UNSTABLE)
                    │
    MOSS-RCA-1: Flagship Runtime Root-Cause Autopsy ✅ (KEEP_PAUSED_ROOT_CAUSE_CONFIRMED)
                    │
    MOSS-RUNTIME-1: Make Flagship Runtime Real ✅ (KEEP_PAUSED_RUNTIME_CONFIRMED)
                    │
    MOSS-HOST-1: Native/WSL Runtime Escape Hatch ✅ (KEEP_PAUSED_HOST_CONFIRMED)
                    │
    MOSS-HOST-2: WSL ARM64 Evidence Normalization ✅ (KEEP_PAUSED_HOST_CONFIRMED)
                    │
    MOSS-NANO-1: CPU Realtime Candidate Bring-Up ✅ (ITERATE_NANO_RUNTIME)
                    │
    MOSS-NANO-2: Runtime Latency Rescue ✅ (KEEP_KOKORO_ONLY)
                    │
    MOSS-NANO-3: In-Process Runtime Reuse And First-Audio Truth ✅ (ITERATE_NANO_RESIDENT_RUNTIME)
                    │
    MOSS-NANO-4: Resident Runtime Optimization + Promotion Retest ✅ (ITERATE_NANO_RESIDENT_RUNTIME)
                    │
    MOSS-NANO-5B: Precompute + Adjacent Continuity Closure ✅ (ITERATE_NANO_RESIDENT_RUNTIME)
                    │
    MOSS-NANO-5C: Segment-First Soak Gate ✅ (PROMOTE_NANO_TO_SOAK_CANDIDATE_WITH_SEGMENT_FIRST_GATE)
                    │
    MOSS-NANO-6B: Resident Soak Memory / Lifecycle Closure ✅ (ITERATE_NANO_RESIDENT_RUNTIME)
                    │
    MOSS-NANO-6C: Memory / Tail-Latency / Lifecycle Fix ✅ (ITERATE_NANO_RESIDENT_RUNTIME)
                    │
    MOSS-NANO-6D: Bounded Resident Lifecycle / Process Recycling ✅ (ITERATE_NANO_RESIDENT_RUNTIME)
                    │
    MOSS-NANO-6E: Shutdown / Restart Lifecycle Proof ✅ (ITERATE_NANO_RESIDENT_RUNTIME)
                    │
    MOSS-NANO-6F: Full Bounded Soak Promotion Confirmation ✅ (PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE_WITH_BOUNDED_LIFECYCLE)
                    │
    MOSS-NANO-7: Sidecar Contract + IPC Prototype ✅ (PROMOTE_NANO_TO_STRATEGY_PROTOTYPE)
                    │
    MOSS-NANO-8: Narration Strategy + Segment Timing ✅ (PROMOTE_NANO_TO_CONTINUITY_PROTOTYPE)
                    │
    MOSS-NANO-9: Cache/Prefetch + Continuity Handoffs ✅ (PROMOTE_NANO_TO_EXPERIMENTAL_UI_CANDIDATE)
                    │
    MOSS-NANO-10: Settings UX + Engine Selection ✅ (PROMOTE_NANO_TO_PRODUCTIZATION_GATE)
                    │
    MOSS-NANO-11: Productization Gate + Default Decision ✅ (NANO_EXPERIMENTAL_ONLY / KEEP_KOKORO_DEFAULT)
                    │
    MOSS-NANO-12: Live Four-Mode Evidence Capture ✅ (NANO_EXPERIMENTAL_ONLY)
                    │
    MOSS-3: Legacy flagship sidecar lane (SUPERSEDED/PAUSED)
                    │
    MOSS-4: Live Narration Strategy And Engine Selection (PAUSED)
                    │
    MOSS-5: Timing Truth And Segment-Following Narrate (PAUSED)
                    │
    MOSS-6: Cache, Prewarm, And Long-Form Continuity (PAUSED)
                    │
    MOSS-7: Productization Gate And Promotion Decision (PAUSED)
      ├── Kokoro: default and operational floor. Retirement is no longer the active posture; post-v2 work deepens Kokoro asset readiness, chunk/timing truth, and voice-profile capability.
      └── Nano: 13d produced canonical live evidence and `NANO_RECOMMENDED_OPT_IN`; 13e records the recommended opt-in product decision without changing the default engine. Kokoro remains default/available; Qwen is retired for Desktop v2 and remains disabled.
                   │
    READER-4M-2: Standalone Narrate Mode & Four-Button Controls ✅ (v1.69.0)
                   │
    READER-4M-3: Global Word Anchor & Cross-Mode Continuity ✅ (v1.72.0)
                   │
                   ▼
        Track C: Android APK
          ├── APK-0: Modularization (prerequisite)
          ├── APK-1: WebView Shell + Local Library
          ├── APK-2: All Reading Modes
          ├── APK-3: Bidirectional Sync
          └── APK-4: Mobile-Native Features
                   │
                   ▼
        Phase 7: Cloud Sync Hardening (parallel with APK-3)
                   │
                   ▼
        Phase 8: RSS/News Feeds
```

---

## Phases 2–5 — COMPLETE

> All Phase 2–5 sprint specs archived to `docs/project/ROADMAP_ARCHIVE.md`. Summary below.

| Phase | Sprints | Final Version | Key Deliverables |
|-------|---------|---------------|------------------|
| 2: EPUB Fidelity | EPUB-2A, EPUB-2B | v1.5.1 | Format preservation, image extraction, DOCX/URL→EPUB, single rendering path |
| 3: Flow Mode | FLOW-3A, FLOW-3B | v1.6.1 | Infinite scroll, FlowScrollEngine, dead code removal |
| 4: Readings | READINGS-4A, 4B, 4C | v1.9.0 | Card metadata, queue, author normalization, metadata wizard |
| 5: Chrome Extension | EXT-5A, EXT-5B + TTS Smoothness | v1.11.0 | E2E pipeline tests, 6-digit pairing, background cache wiring |

---

## Phase 6 — TTS Hardening & Stabilization + Follow-On Hotfixes

> All TTS-6 and TTS-7 sprint specs archived to `docs/project/ROADMAP_ARCHIVE.md`. Summary below.

| Lane | Sprints | Versions | Key Deliverables |
|------|---------|----------|------------------|
| TTS-6 | TTS-6C→6S + HOTFIX-11 | v1.14.0–v1.28.0 | Native-rate buckets, startup hardening, pronunciation overrides, word alignment, accessibility, profiles, portability, runtime stability, performance budgets, session continuity, diagnostics, cursor sync |
| TTS-7 (stabilization + hotfix) | TTS-7A→7L | v1.29.0–v1.33.7 | Cache correctness, cursor contract (dual ownership), throughput/backpressure, integration verification, proactive entry-cache coverage + cruise warm, clean Foliate DOM probing, first-chunk IPC verification, visible-word/startup fixes, Foliate follow-scroll unification + exact miss recovery, final Foliate section-sync / word-source dedupe / initial-selection protection, EPUB global word-source promotion, and exact text-selection mapping. TTS hotfix lane CLOSED at v1.33.7. |

**Architecture post-stabilization:** Narration state machine, cache identity contract (voice + override hash + word count), cursor ownership (playing = TTS owns, paused = user owns), pipeline pause/resume (emission gating), backpressure (TTS_QUEUE_DEPTH), narration start <50ms per microtask. Documented in TECHNICAL_REFERENCE.md § "Narrate Mode Architecture."

**Closeout note:** Live testing on 2026-04-04 showed that cold-start narration on freshly opened EPUBs still had page-jump and ramp-up continuity regressions after `TTS-7E`. `TTS-7F` closed the reactive-cache side of that gap, and `TTS-7G` verified that `BUG-117` (910ms first-chunk IPC handler) was already resolved by prior work. `TTS-7H` fixed the frozen-start-index and section-fallback pieces, `TTS-7I` unified follow-scroll ownership and exact miss recovery, `TTS-7J` resolved section-sync blink, word-source duplication, and initial-selection overwrite, `TTS-7K` promoted full-book EPUB words as the active source of truth, and `TTS-7L` closed the final selection-path gap by preserving exact word identity across click and native text selection. Phase 6 TTS is now fully stabilized and closed at `v1.33.7`.

> All TTS-7E through TTS-7R, EXT-5C, and HOTFIX-12 sprint specs archived to `docs/project/ROADMAP_ARCHIVE.md`.

---


## Completed Work Summary

> Full specs for all completed sprints archived to `docs/project/ROADMAP_ARCHIVE_2026-05-02.md`.

| Sprint | Version | Date | Result | Archive |
|--------|---------|------|--------|--------|
| EINK-6B | v1.75.2 | 2026-05-02 | E-ink Flow now advances by instant 20-line chunks instead of smooth/per-line scroll; Focus phrase grouping is shared/tested for 2-3 word bursts when `einkMode` + `einkPhraseGrouping` are enabled; adaptive ghosting refresh accumulates content-change load while preserving manual page-turn interval fallback. Verification: focused EINK/Flow slice 5 files / 93 tests, full `npm test` 151 files / 2407 tests, `npm run build`, `npm audit --audit-level=high`, `git diff --check`. | Active sprint closeout; full spec retained below until next archive pass. |
| EINK-6A | v1.75.1 | 2026-05-02 | E-ink display mode decoupled from theme; `einkMode` schema/defaults/migration added; behavioral CSS now keys off `[data-eink="true"]`; greyscale palette remains optional under `[data-theme="eink"]`. Verification: focused EINK/NARR tests 36 pass, full `npm test` 150 files / 2397 tests, `npm run build`, `npm audit --audit-level=high`, `git diff --check`. | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) (full spec migrated 2026-05-02 PM) |
| SELECTION-1 | v1.38.0 | 2026-04-06 | Word anchor contract, BUG-151/152/153 resolved | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| HOTFIX-14 | v1.38.2 | 2026-04-06 | URL extraction + connection fixes, BUG-155/156/157/158 | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| NARR-CURSOR-1 | v1.40.0 | 2026-04-07 | Collapsing narration cursor | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| HOTFIX-15 | v1.43.1 | 2026-04-07 | Narration cursor polish, BUG-159/160/161 | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| STAB-1A | v1.45.0 | 2026-04-07 | Startup & flow stabilization, BUG-162/163/164/165 | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| PERF-1 | v1.47.0 | 2026-04-07 | Full performance audit & remediation | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| REFACTOR-1A | v1.48.0 | 2026-04-07 | ReaderContainer decomposition, 5 custom hooks | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| REFACTOR-1B | v1.49.0 | 2026-04-07 | Component & style cleanup, CSS split | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| TEST-COV-1 | v1.50.0 | 2026-04-16 | Critical path test coverage + security hardening | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| NARR-LAYER-1A | v1.51.0 | 2026-04-16 | Narration as flow layer foundation | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| NARR-LAYER-1B | v1.52.0 | 2026-04-16 | Narration as flow layer consolidation | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| TTS-EVAL-1 | v1.53.0 | 2026-04-16 | Flow/narration sync and audio quality harness | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| TTS-EVAL-2 | v1.54.0 | 2026-04-16 | TTS evaluation matrix & soak runner | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| TTS-EVAL-3 | v1.55.0 | 2026-04-16 | TTS quality gates & release baseline | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| TTS-HARDEN-1 | v1.56.0 | 2026-04-16 | Kokoro bootstrap truth & engine recovery | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| TTS-HARDEN-2 | v1.57.0 | 2026-04-17 | Narration handoff integrity & extraction dedupe | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| TTS-RATE-1 | v1.58.0 | 2026-04-17 | Pitch-preserving tempo for Kokoro | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| EPUB-TOKEN-1 | v1.59.0 | 2026-04-17 | Dropcap + split-token word stitching | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| FLOW-INF-A | v1.41.0 | 2026-04-07 | Reading zone & visual pacing | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| FLOW-INF-B | v1.42.0 | 2026-04-07 | Timer cursor & pacing feedback | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| EXT-ENR-A | v1.39.0 | 2026-04-07 | Resilient extension connection | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| EXT-ENR-B | v1.43.0 | 2026-04-07 | Auto-discovery pairing | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| NARR-TIMING | v1.44.0 | 2026-04-07 | Real word-level timestamps from Kokoro TTS | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| TTS-CONT-1 | v1.60.0 | 2026-04-17 | Readiness-driven section & cross-book continuity | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| TTS-RATE-2 | v1.61.0 | 2026-04-17 | Segmented live Kokoro rate response | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| TTS-START-1 | v1.62.0 | 2026-04-17 | Startup parity & opening cache contract | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| READER-4M-2 | v1.69.0 | 2026-04-18 | Standalone narrate mode & four-button controls | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| READER-4M-3 | v1.72.0 | 2026-04-19 | Global word anchor & cross-mode continuity | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| QWEN-STREAM-1 | v1.71.0 | 2026-04-18 | Streaming sidecar foundation | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| QWEN-STREAM-4 | v1.75.0 | 2026-04-21 | Live validation + promotion decision (ITERATE) | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| MOSS-NANO-6F | — | 2026-05-01 | Full bounded soak promotion confirmation | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| MOSS-HOST-1 | — | 2026-04-27 | Native/WSL runtime escape hatch | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| MOSS-HOST-2 | — | 2026-04-27 | Evidence normalization + governance closeout | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| MOSS-NANO-1 | — | 2026-04-28 | CPU realtime candidate bring-up | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| MOSS-NANO-2 | — | 2026-04-28 | Runtime latency rescue | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| MOSS-NANO-3 | — | 2026-04-28 | In-process runtime reuse & first-audio truth | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| MOSS-NANO-4 | — | 2026-04-29 | Resident runtime optimization + promotion retest | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| MOSS-NANO-5B | — | 2026-04-29 | Precompute + adjacent continuity closure | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| MOSS-NANO-5C | — | 2026-04-29 | Segment-first soak gate | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| MOSS-NANO-6E | — | 2026-04-30 | Shutdown/restart lifecycle proof | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| MOSS-NANO-6D | — | 2026-04-30 | Bounded resident lifecycle / process recycling | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| MOSS-NANO-6C | — | 2026-04-30 | Memory / tail-latency / lifecycle fix | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| MOSS-NANO-6B | — | 2026-04-29 | Resident soak memory / lifecycle closure | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| MOSS-NANO-7 | — | 2026-04-30 | Sidecar contract + IPC prototype | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| MOSS-NANO-8 | — | 2026-04-30 | Narration strategy + segment timing | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| MOSS-NANO-9 | — | 2026-05-01 | Cache/prefetch + continuity handoffs | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| MOSS-NANO-10 | — | 2026-05-01 | Settings UX + engine selection | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| MOSS-NANO-11 | — | 2026-05-01 | Productization gate + default decision | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| MOSS-NANO-12 | — | 2026-05-02 | Live four-mode evidence capture | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| MOSS-RCA-1 | — | 2026-04-27 | Flagship runtime root-cause autopsy | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| MOSS-RUNTIME-1 | — | 2026-04-27 | Make flagship runtime real | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| MOSS-0 | — | 2026-04-26 | Flagship feasibility & host truth | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| MOSS-1 | — | 2026-04-26 | CPU-only runtime bring-up outside Blurby | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| MOSS-2 | — | 2026-04-26 | Flagship quality & performance benchmark | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| MOSS-SPEED-1 | — | 2026-04-27 | Flagship runtime performance rescue | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| READER-4M-1 | v1.63.0 | 2026-04-18 | Infinite-scroll surface recovery + explicit four-mode foundation | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| QWEN-PROT-1 | v1.64.0 | 2026-04-18 | Qwen engine surface + unavailable-state foundation | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| QWEN-PROT-2 | v1.65.0 | 2026-04-18 | Qwen sidecar runtime + live prototype playback | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| QWEN-STREAM-2 | v1.73.0 | 2026-04-20 | StreamAccumulator + streaming strategy + live playback | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| QWEN-STREAM-3 | v1.74.0 | 2026-04-20 | Streaming hardening + evidence + decision gate | [Archive](docs/project/ROADMAP_ARCHIVE_2026-05-02.md) |
| SK-HYG-1 | — | 2026-05-02 | Roadmap hygiene & queue recovery (governance only). Archive-forward discipline, queue GREEN, Standing Rules, Desktop v2.0 conveyor. | [Review artifacts](docs/project/roadmap-reviews/) |


## Track B: Chrome Extension Enrichment (EXT-ENR)

> **Vision:** The Chrome extension connection becomes effortless and resilient. No manual code entry on reconnect, no dropped connections on sleep/wake, and the app actively invites pairing when it senses an incoming connection attempt.

### Current State (v1.38.2)

- **WebSocket server** (`main/ws-server.js`, 529 lines) — localhost port 48924, custom RFC 6455, pairing token auth via `safeStorage`. HOTFIX-14: auth-filtered `getClientCount()`, 15s heartbeat, 5s UI polling.
- **Chrome extension** (`chrome-extension/`, in-repo) — service-worker.js (592 lines), popup.js (238 lines), popup.html, manifest.json. Flat 5s reconnect, fire-and-forget article send, no pending persistence.
- **Pairing flow** — 6-digit short code with 5min TTL, long-lived token stored in safeStorage (server) + chrome.storage.local (extension). Token survives app restart.
- **Article import** — `add-article` message type, HTML→EPUB conversion, hero image extraction, auto-queue. No delivery confirmation.
- **Known pain points (post-HOTFIX-14):** Flat 5s reconnect (no backoff), pending articles lost on service worker kill, no delivery confirmation, unbounded EADDRINUSE retry, no auth timeout, binary connected/disconnected UI.

### Investigation Gate — Track B: ✅ CLEARED

All three investigation areas resolved:
- **WebSocket lifecycle:** Fully traced. `_clients` Set: add at line 144 (pre-auth), delete on socket close (152), error (157), WS close frame (174), heartbeat fail (466), heartbeat error (473). `getClientCount()` now auth-filtered (HOTFIX-14).
- **Extension source code:** Located at `chrome-extension/` in-repo. Full reconnect logic, state vars, message flow traced.
- **IPC event emission:** Renderer polled via `get-ws-short-code` IPC every 15s (ConnectorsSettings). Push events `ws-connection-attempt` / `ws-pairing-success` now emitted by server (EXT-ENR-B, v1.43.0) — renderer subscribes via `onWsConnectionAttempt` / `onWsPairingSuccess` preload listeners.


### Sprint EXT-ENR-C: In-Browser Reader (Optional/Future)

**Goal:** Standalone RSVP speed-reader in the Chrome extension popup — read articles without Blurby app running.

**Deliverables:**
1. Popup RSVP view (400x500px) — play/pause, WPM slider (100-1200), progress bar
2. Readability extraction in extension — extract article text from current tab
3. Reading queue in extension — `chrome.storage.local`, 50 articles max, 5MB limit
4. Sync with desktop — when Blurby is running, sync queue bidirectionally

**Note:** This is a lower priority enhancement. EXT-ENR-A and EXT-ENR-B address the core pain points. This sprint is documented for completeness but can be deferred.

**Key files:** Chrome extension source (separate repo/directory)

**Tier:** Full | **Depends on:** EXT-ENR-B

---

## Track C: Android APK (APK)

> **Vision:** Blurby on Android — sideloaded APK first, Play Store later. All readings available, reading position synced bidirectionally, new readings addable from mobile, all four reading modes working.

### Prerequisites & Architecture Decision

**Framework decision needed:** Two specs exist:
- `docs/superpowers/specs/.Archive/2026-03-27-android-app-design.md` — React Native + Expo monorepo (better native feel, larger effort)
- `docs/superpowers/specs/.Archive/phase-10-android-app.md` — Capacitor wrapper (max code reuse, faster to ship)

**Recommendation:** Capacitor for sideload MVP. Reasons: (1) reuses existing React code directly, (2) foliate-js already runs in WebView, (3) faster path to testable APK, (4) can always migrate to React Native later if WebView performance is insufficient.

**Mandatory prerequisite:** Modularization — extract platform-independent core from Electron coupling. See APK-0 below.

### Investigation Gate — Track C (Cowork — before any APK dispatch)

| Area | What We Know | What We Don't Know | Investigation Action |
|------|-------------|-------------------|---------------------|
| Framework decision | Two specs exist (RN vs Capacitor). Recommendation: Capacitor. | **User hasn't confirmed.** Also: has Capacitor been tested with foliate-js in a WebView? Does the EPUB rendering actually work? | **Cowork: Decision + POC.** Get user confirmation on Capacitor. Then scaffold minimal Capacitor project, load foliate-js in WebView, open an EPUB. If it works → proceed. If not → re-evaluate. |
| Coupling audit | 5 problem areas identified at high level (TTS worker, auth, sync, file I/O, IPC). | **Exact coupling depth.** How many `require('electron')` calls exist? How many `fs.` calls? Which renderer code accidentally imports Node modules? What's the true scope of modularization? | **Cowork: Deep audit.** Grep for all Electron-specific imports across the codebase. Map every coupling point with file:line. Estimate LOC per abstraction layer. Produce a scoped modularization plan that CLI can execute module-by-module. |
| Mobile TTS | Kokoro uses Node worker with ONNX. Model is ~80MB. | **Does ONNX Runtime work in Capacitor WebView?** Can we use WebAssembly ONNX runtime instead of Node? What's the performance on ARM? | **Cowork: Research.** Check ONNX Runtime Web (WASM) compatibility. Test if Kokoro model loads in browser context. If not, TTS on mobile may need a different approach (Web Speech API fallback, or native ONNX via Capacitor plugin). |
| Cloud sync on mobile | Sync engine is `main/sync-engine.js`, main-process-driven with `fs.promises`. | **Can the sync protocol run in a WebView?** The transport (OneDrive/Google Drive HTTP APIs) could work from browser context, but the file storage layer assumes Node `fs`. | **Cowork: Map sync dependencies.** Identify which sync-engine functions are pure logic (portable) vs platform-bound (Node fs). Estimate extraction effort. |

**Dispatch readiness:** NOT READY. Framework POC, coupling audit, and TTS feasibility all needed before APK-0 can be spec'd to CLI-ready detail.

### Sprint APK-0: Modularization (Prerequisite)

**Goal:** Extract a platform-independent core from the Electron-coupled codebase.

**Responsibility:** Cowork audits and specs each abstraction layer → CLI executes module-by-module extraction.

**Problem areas identified by 3rd-party audit:**
1. **Kokoro TTS worker** (`main/tts-worker.js` L5-L37) — Node-specific module resolution hacks
2. **Auth** (`main/auth.js` L294-L304) — depends on Electron `BrowserWindow` for OAuth popup
3. **Sync engine** (`main/sync-engine.js`) — main-process-driven, uses `fs.promises` directly
4. **File I/O** — all via Node `fs`, no abstraction layer
5. **IPC** — tight coupling between `preload.js` bridge and main-process handlers

**Deliverables (pending investigation gate):**
1. Storage abstraction — interface for file read/write/list/delete
2. Auth abstraction — interface for OAuth flows
3. TTS abstraction — interface for Kokoro model loading and inference
4. Sync transport abstraction — decouple sync logic from Node fs
5. Shared types and constants — extract to `shared/` directory

**Estimated effort:** 2-3 sprints (each sub-module is a separate CLI dispatch)

**Tier:** Full | **Depends on:** Investigation gate cleared

---

### Sprint APK-1: WebView Shell + Local Library

**Goal:** Sideloadable APK that opens Blurby's React UI in a WebView.

**Responsibility:** Cowork specs (after APK-0 modularization lands) → CLI executes scaffolding and integration.

**Investigation gate:** Blocked on APK-0 completion + Capacitor POC from Track C investigation gate.

**Deliverables:**
1. Capacitor project scaffolding — Android project, WebView configuration, build pipeline
2. Local library storage — SQLite or JSON file via Capacitor Filesystem
3. EPUB rendering — foliate-js in WebView (validated by POC)
4. File import — Android file picker + share sheet
5. APK build — signed debug APK for sideloading

**Tier:** Full | **Depends on:** APK-0

---

### Sprint APK-2: All Reading Modes

**Responsibility:** Cowork specs (after APK-1, with mobile gesture design) → CLI executes.

**Investigation gate:** Blocked on APK-1. Touch gesture mapping needs design decisions after seeing the WebView shell.

**Deliverables:**
1. Touch gesture mapping — swipe for page turn, tap zones for mode controls
2. Focus mode — RSVP display adapted for mobile viewport
3. Flow mode — infinite scroll with touch scroll detection
4. Narrate mode — Kokoro TTS via approach determined in investigation gate
5. Bottom bar adaptation — mobile-friendly control layout

**Tier:** Full | **Depends on:** APK-1

---

### Sprint APK-3: Bidirectional Sync

**Responsibility:** Cowork specs (sync protocol design, informed by Phase 7 if available) → CLI executes.

**Investigation gate:** Blocked on APK-2. Sync protocol depends on modularization outcome from APK-0.

**Deliverables:**
1. Cloud sync integration — OneDrive/Google Drive via Capacitor HTTP + OAuth
2. Bidirectional position sync — CFI-based with last-write-wins timestamps
3. Library sync — three-tier storage (metadata local, content on-demand, user-pinned)
4. Settings sync — theme, WPM, voice preferences
5. Conflict resolution — per-field last-write-wins

**Tier:** Full | **Depends on:** APK-2

---

### Sprint APK-4: Mobile-Native Features

**Responsibility:** Cowork specs → CLI executes.

**Investigation gate:** Blocked on APK-3. Native features depend on what the platform supports after integration.

**Deliverables:**
1. Share sheet integration — "Share to Blurby" from Chrome, other apps
2. Notification for reading goals/streaks (if GOALS-6B is implemented)
3. Background TTS playback — audio continues when backgrounded
4. Deep links — `blurby://open/{docId}`
5. Offline-first — graceful degradation when no network

**Tier:** Full | **Depends on:** APK-3

---

## Idea Themes (Roadmap Placeholders)

> Ideas grouped by theme in `docs/governance/IDEAS.md`. Each theme maps to potential future sprints. Not yet spec'd — reviewed at phase pauses.

| Theme | Key Ideas | Roadmap Alignment |
|-------|-----------|-------------------|
| **A: Infinite Reader** | Reading zone, cross-book flow, paragraph jumps | → Track A (FLOW-INF) above |
| **B: Chrome Extension** | Auto-discovery, resilient connection, in-browser reader, RSS | → Track B (EXT-ENR) above |
| **C: Android & Mobile** | APK wrapper, position sync, share sheet, Chromecast | → Track C (APK) above |
| **D: Reading Intelligence** | Goals, streaks, analytics, AI recommendations | GOALS-6B active (Desktop v2.0 conveyor); rest backlog |
| **E: Content & Formats** | Chapter detection, auto TOC, OCR PDFs | Backlog (Phase 10+) |
| **F: Library & UX Polish** | 3-line cards, auto-clear dots, vocab builder, annotation export | Backlog (fold into any sprint) |
| **G: Settings & Ctrl+K** | Combine settings pages, all settings searchable | Backlog (small wins) |
| **H: Reading Tweaks** | Space bar mode, arrow speed, voice cloning, AI summaries | Backlog (bundleable) |
| **I: Branding** | Remove [Sample], Blurby icon, brand theme, window controls | Backlog (cosmetic, anytime) |
| **J: Social** | Reading clubs, shared lists, group discussions | Someday (needs server) |
| **K: E-Ink** | Display mode decoupling, e-ink reading ergonomics | Done for Desktop v2.0 (EINK-6A/6B complete) |

---

## Desktop v2.0 — Active Conveyor Belt

> **Finish line:** Desktop v2.0 Shipping. Twelve active conveyor sprints complete; post-v2 audit remediation is also implemented in the `postv2-audit-remediation` worktree pending review/commit/merge. 2026-05-04 direction: POLISH-1 completed after MOSS-Nano recommended opt-in and Pocket TTS opt-in closeout; RELEASE-1 recorded release closeout; POSTV2 remediation hardened release truth, type contracts, Qwen disable boundaries, Narrate/security, and artifact hygiene.
> **Conveyor sequence:** ~~SK-HYG-1~~ ✅ → ~~BRAND-HYG-1~~ SHELVED / no-op in this checkout → ~~EINK-6A~~ ✅ → ~~EINK-6B~~ ✅ → ~~GOALS-6B~~ ✅ → ~~MOSS-NANO-13a~~ ✅ → ~~MOSS-NANO-13B~~ ✅ → ~~MOSS-NANO-13c~~ ✅ → ~~MOSS-NANO-13d~~ ✅ → ~~MOSS-NANO-13e~~ ✅ → ~~POCKET-TTS-1~~ ✅ → ~~POLISH-1~~ ✅ → ~~RELEASE-1~~ ✅ → ~~POSTV2-REL-1~~ ✅ → ~~POSTV2-ENGINE-1~~ ✅ → ~~POSTV2-NARR-1~~ ✅ → **POSTV2-REVIEW-1 (next up)**.
> **Queue rule:** No exploratory TTS/model or non-desktop expansion work until this conveyor is green or explicitly paused. The only approved TTS/model work inside Desktop v2.0 is MOSS-NANO-13a–13e (single-engine MOSS-Nano productization, decision based on 13d's existing canonical evidence) plus POCKET-TTS-1 (third-engine integration without comparative gate; voice-cloning UX deferred to v2.1). Default engine remains Kokoro; Qwen is retired for Desktop v2 and remains disabled.

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

---

### Sprint SK-HYG-1: Roadmap Hygiene & Queue Recovery ✅ COMPLETED 2026-05-02

Governance-only sprint completed during the 2026-05-02 roadmap review ceremony. All done-when criteria met. See Completed Work Summary table for ledger entry.

---

### Sprint BRAND-HYG-1: Brand Theme Commit — SHELVED / NO-OP 2026-05-02

- **What:** Test and commit the uncommitted brand theme changes (deep blue dominant + coral accent) across 13+ files. This is worktree hygiene, not feature work.
- **Why:** Brand theme edits were expected from the pre-review session, but they are not present in this checkout after the governance hygiene commit.
- **Prerequisites:** None.
- **Disposition:** SHELVED / no-op for this checkout, not completed as implementation.
- **Evidence:** Remaining dirty tracked files are local noise only: `.idea/workspace.xml` and `tests/perf-baseline-results.json`. No brand/theme/style/icon/source files are available to stage.
- **Done when:** Recorded as shelved so EINK-6A is not blocked by absent brand work.
- **Effort:** S (~0.5). Test + commit only.
- **Roster:** CLI/Hermes (mechanical commit after test).
- **Source:** SK-HYG-1 residual, 2026-05-02 roadmap review.

**Tier:** Quick | **Result:** No-op / not present in this checkout.

---

## Phase 6 Continued — E-Ink & Goals (ACTIVE — Desktop v2.0 Conveyor)

> EINK-6A, EINK-6B, GOALS-6B, MOSS-NANO-13a, MOSS-NANO-13B, MOSS-NANO-13c, MOSS-NANO-13d, MOSS-NANO-13e, POCKET-TTS-1, POLISH-1, RELEASE-1, POSTV2-REL-1, POSTV2-ENGINE-1, and POSTV2-NARR-1 completed by 2026-05-04. **POSTV2-REVIEW-1 is next: review, commit, and merge the post-v2 remediation branch**.

---

### Historical Program: Qwen Default / Kokoro Deprecation

**Goal:** This was the approved program that moved Blurby to a Qwen-first product posture, hardened the existing local sidecar lane, and prepared Kokoro deprecation.

**Execution order:**
1. `QWEN-DEFAULT-1`
2. `QWEN-HARDEN-1`
3. `QWEN-PROVISION-1`
4. `KOKORO-RETIRE-1`
5. `KOKORO-RETIRE-2`

**Execution-ready plan:** [docs/superpowers/plans/2026-04-19-qwen-default-kokoro-deprecation.md](C:/Users/estra/Projects/Blurby/docs/superpowers/plans/2026-04-19-qwen-default-kokoro-deprecation.md)

**Historical posture delivered:**
- Qwen is the default narration engine going forward.
- Kokoro remains present only as a deprecated fallback path until the retirement scorecard is fully green.
- No new code path may silently fall back from Qwen to Kokoro.
- Startup latency, runtime provisioning, fallback UX, and retirement gating remain first-class workstreams.

**Retirement gates:**
- Playback reliability
- Startup and responsiveness
- Provisioning and machine realism
- Narration quality
- Replacement completeness

**Current governance decision:** The completed Qwen work remains historical context, but the product posture changed after QWEN-STREAM-4, MOSS-NANO-13e, POCKET-TTS-1, and POLISH-1. Qwen is retired for Desktop v2.0 and remains disabled; Kokoro is the default and operational floor; MOSS-Nano is recommended opt-in; Pocket TTS is available opt-in with real upstream synthesis still scaffolded until separately approved runtime/API adapter work. `QWEN-STREAM-4` closed with ITERATE rather than PROMOTE — streaming iteration deferred to post-Desktop v2.0. No other exploratory MOSS/TTS/model successor work is active inside Desktop v2.0.

---

### Post-v2 Program: Kokoro Deepening (Abogen-informed) — QUEUED AFTER POSTV2-REVIEW-1

**Decision:** On 2026-05-10, the active TTS direction changed from "find/retire Kokoro" to "double down on Kokoro." Abogen was reviewed as a Kokoro product/reference implementation. The takeaway is not to replace Blurby's app architecture with Abogen, but to adopt the strongest Kokoro-specific product patterns: deterministic asset predownload, offline readiness truth, voice/profile exploration, natural chunk boundaries, timestamp honesty, and long-form export posture.

**Reference project:** `https://github.com/denizsafak/abogen`

**Program order:**
1. `POSTV2-REVIEW-1` — finish the pending post-v2 audit review/commit/merge gate first.
2. `KOKORO-DEEPEN-1` — Kokoro asset preflight and offline runtime truth.
3. `KOKORO-DEEPEN-2` — Kokoro long-form chunk/timing narration hardening. ✅ COMPLETED 2026-05-11
4. `KOKORO-DEEPEN-3` — Kokoro voice profiles and voice-mixing evidence spike.
5. `KOKORO-EXPORT-1` — optional future audiobook/subtitle export lane after the first three are stable.

**Program non-goals:**
- No Qwen reactivation.
- No Kokoro retirement lane.
- No default-engine churn.
- No new successor-model exploration.
- No wholesale Abogen/PyQt/WebUI import.
- No PyTorch/KPipeline replacement for Blurby's current `kokoro-js` / ONNX runtime unless a bounded evidence sprint proves it is necessary.
- No CHUNK-SYNC Narrate timing/word-sync migration until the resumed work is explicitly tied to Kokoro timing truth.

#### Sprint KOKORO-DEEPEN-1: Kokoro Asset Preflight And Offline Runtime Truth

**Goal:** Make Kokoro readiness deterministic and user-visible the way Abogen does: model, config, voices, runtime dependencies, cache location, offline state, and download/retry status must be inspectable before live narration.

**Why:** Blurby already has a strong Kokoro playback path, but Abogen's product posture is clearer around predownload, voice/model cache checks, and offline use. This sprint turns Kokoro from "it usually warms when needed" into a first-class, diagnosable local runtime.

**Primary Abogen patterns to adapt:**
- Voice/model/config predownload and cache verification.
- Status UI for missing assets vs healthy local runtime.
- Explicit offline posture after assets are present.
- Device/runtime truth without starting narration.

**WHERE:**
1. `main/tts-worker.js` — Kokoro model ID, model loading, warmup, generation result, and `wordTimestamps` pass-through.
2. `main/ipc/tts.js` — existing `tts-kokoro-*` handlers (`generate`, `voices`, `model-status`, `download`, `preload`).
3. `preload.js` — Kokoro bridge methods exposed to the renderer.
4. `src/components/settings/KokoroStatusSection.tsx` and `src/components/settings/TTSSettings.tsx` — current settings surface for model status/download/preview.
5. `src/hooks/narration/kokoroStrategy.ts` — live Kokoro strategy and fallback behavior.
6. `src/constants.ts`, `main/constants.js`, and `src/types.ts` — default model IDs, sample rate, status/result types.
7. Tests near `tests/ttsSettingsKokoroTruth.test.tsx`, `tests/kokoro*.test.*`, and `tests/componentStyleCleanup.test.ts`.
8. Reference only: Abogen `voice_cache.py`, `predownload_gui.py`, `utils.py`, and README install/offline sections.

**Tasks:**
1. Add a Kokoro preflight/status contract that separates `ready`, `loading`, `missing-assets`, `download-needed`, `download-failed`, `runtime-error`, and `offline-ready`.
2. Add an IPC/preload path for deterministic Kokoro preflight that does not start narration.
3. Surface the preflight result in settings with actionable copy, cache path, model/voice availability, and a download/retry action.
4. Add regression coverage for healthy, missing, failed, and offline-ready states.
5. Update Kokoro setup/troubleshooting docs with asset locations and expected recovery steps.

**Success criteria:**
1. A user can tell whether Kokoro is ready before pressing Play.
2. Missing model/voice/config assets produce specific remediation copy instead of generic failure.
3. Offline-ready Kokoro status is explicit after assets are present.
4. Existing Kokoro playback behavior remains unchanged except for clearer status and recovery.
5. Focused Kokoro settings/runtime tests, full tests, build, and `git diff --check` pass.

**Tier:** Full | **Depends on:** `POSTV2-REVIEW-1`.

---

#### Sprint KOKORO-DEEPEN-2: Long-Form Chunk/Timing Narration Hardening ✅ COMPLETED 2026-05-11

**Goal:** Resume the CHUNK-SYNC work through Kokoro: natural chunks are the visible narration unit, Kokoro word timestamps drive bold active-word highlight only when truthful timestamps exist, and the fallback is chunk-only highlighting.

**Why:** The approved reading UX shift still stands, but it should be grounded in the engine we are committing to. Abogen's subtitle/timing approach reinforces the same rule: chunk/segment timing can be trusted broadly, but word-level highlighting must only appear when the engine provides real timing.

**Relationship to current CHUNK-SYNC work:** `CHUNK-SYNC-1` and `CHUNK-SYNC-2` are additive foundations already present locally. `CHUNK-SYNC-3` has implemented Flow's WPM-clocked chunk visual migration; Kokoro-backed Narrate chunk/timing migration should resume here rather than as an engine-agnostic timing migration.

**WHERE:**
1. `docs/superpowers/plans/2026-05-10-chunk-synchronized-reading.md` — approved shared chunk/visual plan.
2. `docs/superpowers/specs/2026-05-10-chunk-synchronized-reading-design.md` — approved design record.
3. `src/types/chunkReading.ts`, `src/utils/naturalChunks.ts`, `src/utils/chunkReadingVisualState.ts`, and `src/utils/foliateWordHighlight.ts` — existing chunk model/visual layer.
4. `src/components/FoliatePageView.tsx` and `src/components/ReaderContainer.tsx` — Foliate root/render adapter and reader orchestration.
5. `src/hooks/narration/kokoroStrategy.ts`, `src/utils/generationPipeline.ts`, and `src/utils/audioScheduler.ts` — Kokoro chunk generation, scheduled audio, handoff, and `wordTimestamps`.
6. Tests near `tests/naturalChunks.test.ts`, `tests/chunkReadingVisualState.test.ts`, `tests/foliateChunkHighlight.test.ts`, `tests/audioScheduler*.test.ts`, and `tests/useNarration*.test.tsx`.
7. Reference only: Abogen `chunking.py`, `webui/conversion_runner.py`, and `pyqt/conversion.py`.

**Tasks:**
1. Connect Kokoro-generated chunks to the shared `ReadingChunk` / `ChunkReadingVisualState` path.
2. Render light chunk highlight for the whole current Kokoro chunk in Narrate.
3. Render bold active word only from Kokoro-provided `wordTimestamps` or equivalent trusted timing.
4. Suppress active-word highlighting when Kokoro returns `wordTimestamps: null`; keep chunk highlight.
5. Preserve Flow as WPM-clocked and Narrate as spoken-timing-clocked.
6. Keep natural chunk rules: prefer sentence-ending punctuation, then semicolon/colon, then comma fallback, source line breaks after punctuation as hard delimiters, and headings as standalone chunks even without punctuation.
7. Add focused tests for word-timed Kokoro, chunk-only Kokoro, handoff between chunks, and no invented per-word timing.

**Success criteria:**
1. Narrate and Flow share the same natural chunk model.
2. Kokoro Narrate shows exactly one light chunk highlight.
3. Kokoro Narrate shows bold word highlight only when truthful word timing exists.
4. Timestamp-missing lanes never invent word progress; they fall back to chunk-only.
5. Focused chunk/narration tests, full tests, build, and `git diff --check` pass.

**Closeout (2026-05-11):**
1. Kokoro chunk-boundary metadata now drives Narrate chunk visual progression through shared `ChunkReadingVisualState`.
2. Narrate active-word visuals are gated to trusted word timing only; heuristic/null timestamp lanes remain chunk-only.
3. Narrate legacy duplicate flow-cursor rendering is suppressed when chunk-state narrate visuals are active.
4. Natural chunk punctuation priority is explicit and deterministic: sentence enders (`.!?`) > semicolon/colon (`;:`) > comma fallback.
5. Verification in this branch: focused chunk/timing lane passed (`96/96`), `npm run typecheck` passed, `npx vite build --configLoader runner` passed, `git diff --check` passed. Full-suite run is blocked by an unrelated pre-existing `tests/mossNanoProbe.test.js` python-env lane and unrelated `.tmp` mirror tests.

**Tier:** Full | **Depends on:** `KOKORO-DEEPEN-1`, local CHUNK-SYNC Dispatch 1/2 foundations.

---

#### Sprint KOKORO-DEEPEN-3: Kokoro Voice Profiles And Voice-Mixing Evidence Spike

**Goal:** Determine whether Abogen-style Kokoro voice profiles and weighted voice mixing can be implemented safely in Blurby's current Kokoro runtime.

**Why:** Abogen exposes a genuinely useful Kokoro-specific capability: saved voice profiles and weighted formulas across Kokoro voices. Blurby should investigate this as a Kokoro-first personalization lane, but only after proving whether the current `kokoro-js` / ONNX stack can support it without switching runtimes.

**WHERE:**
1. `main/tts-worker.js` — current Kokoro model/voice loading and generation boundary.
2. `main/ipc/tts.js` and `preload.js` — Kokoro voices/status/generation bridge.
3. `src/types.ts`, `src/types/narration.ts`, and `src/constants.ts` — voice/profile type surfaces and defaults.
4. `src/components/settings/TTSSettings.tsx`, `src/components/settings/KokoroStatusSection.tsx`, and existing profile UI components — settings/profile surface.
5. `src/utils/narrationPortability.ts` and `src/utils/narrationContinuity.ts` — persisted profile/continuity behavior.
6. Reference only: Abogen `voice_profiles.py`, `voice_formulas.py`, and `voice_cache.py`.

**Tasks:**
1. Spike whether the current Kokoro ONNX voice representation supports weighted voice blending in-process.
2. If viable, create a hidden/dev-only prototype for saved Kokoro voice formulas with deterministic preview tests.
3. If not viable, write an evidence memo explaining the blocker and whether a separate PyTorch/KPipeline lane is worth considering later.
4. Do not expose public voice-mixing UX until the runtime path is proven.
5. Add tests or artifacts showing the decision, including invalid voice IDs, zero/negative weights, and profile persistence safety if the prototype is viable.

**Success criteria:**
1. The sprint ends with either a working evidence-backed hidden prototype or a clear non-viability memo.
2. No default voice behavior regresses.
3. No runtime replacement is introduced without explicit follow-up approval.
4. Focused profile/voice tests or evidence artifacts, full tests, build, and `git diff --check` pass.

**Tier:** Investigation + bounded prototype | **Depends on:** `KOKORO-DEEPEN-1`.

---

#### Sprint KOKORO-EXPORT-1: Long-Form Audio And Subtitle Export (Optional Future)

**Goal:** Explore Abogen-style offline audiobook export for Blurby after Kokoro runtime and chunk/timing truth are stable: audio file export, chapter markers, and optional subtitle/timestamp artifacts.

**Why:** This is valuable, but it is not on the immediate Kokoro reliability path. It should stay optional until live reading playback, offline readiness, and timing truth are solid.

**WHERE:** Future spec should start from `scripts/kokoro_pair_baseline.mjs`, `scripts/moss_kokoro_benchmark.mjs`, Kokoro generation IPC, chunk metadata from `KOKORO-DEEPEN-2`, and Abogen's export/subtitle code.

**Status:** Deferred. Do not dispatch until `KOKORO-DEEPEN-1`, `KOKORO-DEEPEN-2`, and `KOKORO-DEEPEN-3` close or are explicitly paused with evidence.

---

### Sprint EINK-6A: E-Ink Foundation & Greyscale Runtime ✅ COMPLETED 2026-05-02

**Closeout:** `einkMode` is now an independent settings/schema flag (`CURRENT_SETTINGS_SCHEMA = 9`) with renderer, main-process, migration, and test-harness defaults. `ThemeProvider` applies `data-eink="true"` independently from `data-theme`; `ThemeSettings` exposes E-Ink Display Mode above the theme picker; reader WPM cap, refresh overlay, controller, and library repaint debounce now consume `settings.einkMode`. E-ink runtime behavior moved under `[data-eink="true"]`; the optional greyscale palette remains under `[data-theme="eink"]`.

**Verification:** `npm test -- --run tests/einkFoundation.test.ts tests/narrLayer1bConsolidation.test.ts` (36 tests), full `npm test` (150 files / 2397 tests), `npm run build` (existing circular chunk warning unchanged), `npm audit --audit-level=high`, and `git diff --check`.

**Key files touched:** `src/types.ts`, `src/constants.ts`, `src/contexts/SettingsContext.tsx`, `src/components/settings/ThemeSettings.tsx`, `src/styles/global.css`, `src/hooks/useEinkController.ts`, `src/components/ReaderContainer.tsx`, plus EINK-6A foundation tests in `tests/einkFoundation.test.ts`.

**Full original spec** (Goal / Problem / Design decisions / Baseline / WHERE / Tasks / SUCCESS CRITERIA): archived in `docs/project/ROADMAP_ARCHIVE_2026-05-02.md` (appended 2026-05-02 PM during second-pass roadmap review).

---

### Sprint EINK-6B: E-Ink Reading Ergonomics & Mode Strategy ✅ COMPLETED 2026-05-02

**Closeout:** `FlowScrollEngine` now treats `einkMode` as a stepped chunk surface: it presents up to `EINK_LINES_PER_PAGE` lines, waits based on chunk word count and WPM, then advances instantly to the next chunk without smooth scrolling or line-completion flash. Focus phrase grouping is centralized in `src/utils/einkErgonomics.ts` and displayed only when both `einkMode` and `einkPhraseGrouping` are enabled; non-eink and grouping-disabled focus remain single-word. `useEinkController` now supports adaptive refresh from cumulative content-change load while retaining the EINK-6A manual page-turn interval fallback.

**Verification:** Focused EINK/Flow slice passed 5 files / 93 tests; full `npm test` passed 151 files / 2407 tests; `npm run build` passed with the existing circular chunk warning; `npm audit --audit-level=high` passed with moderate-only findings; `git diff --check` passed.

**Key files touched:** `src/utils/FlowScrollEngine.ts`, `src/components/ReaderView.tsx`, `src/hooks/useEinkController.ts`, `src/hooks/useFlowScrollSync.ts`, `src/components/ReaderContainer.tsx`, `src/constants.ts`, `src/utils/einkErgonomics.ts`, `tests/einkErgonomics.test.ts`, `tests/flow-scroll-engine.test.js`.

**Goal:** Add e-ink-aware reading mode variants that respect the physical constraints of e-ink displays: slow refresh (120–450ms), coarse pixel density, touch-only input, and ghosting artifacts. Stepped flow (chunk-based page advance) and burst focus (multi-word grouping with tuned timing) give e-ink users reading modes that feel native to their hardware instead of fighting it.

**Problem:** All four reading modes (Page, Focus, Flow, Narration) assume a fast LCD/OLED display. Flow mode's smooth per-line scroll causes severe ghosting on e-ink. Focus mode's rapid single-word RSVP flashes cause incomplete refresh cycles. Page mode works acceptably but page turns are slow. Users on e-ink devices get a degraded experience in every mode except Page, and even Page could be better with larger paragraph-level navigation.

**Design decisions:**
- **Stepped Flow mode.** When `einkMode` is on and Flow mode is active, replace per-line smooth scroll with chunk-based page advance: display N lines (configurable, default `EINK_LINES_PER_PAGE = 20`), pause for reading time based on WPM, then full-page advance to next N lines. No animation — instant replace. Cursor behavior: shrinking underline still paces within the visible chunk, but page transitions are instant.
- **Burst Focus mode.** When `einkMode` is on and Focus mode is active, group words into 2–3 word phrases (using existing `einkPhraseGrouping` setting). Display each group for the duration that single words would take at current WPM. This reduces the number of screen redraws per minute by 2–3x, making focus mode usable on e-ink.
- **Adaptive refresh heuristic.** Replace the fixed-interval refresh counter with a content-change-aware heuristic: track cumulative pixel change area across page turns (estimate from word count delta). Trigger refresh when estimated ghosting exceeds a threshold. Keep manual interval as fallback/override. New constants: `EINK_GHOSTING_THRESHOLD`, `EINK_ADAPTIVE_REFRESH_ENABLED`.
- **No changes to Narration or Page modes.** Narration is audio-driven (e-ink display updates are sparse). Page mode already works well with the behavioral CSS from EINK-6A.

**Baseline:**
- `src/modes/FlowMode.ts` — word-by-word timing, `FlowScrollEngine` integration
- `src/modes/FocusMode.ts` — single-word RSVP timing
- `src/hooks/useEinkController.ts` — fixed-interval refresh counter (from EINK-6A: now einkMode-aware)
- `src/utils/FlowScrollEngine.ts` — scroll container, cursor rendering
- `src/constants.ts` — `EINK_LINES_PER_PAGE = 20`, phrase grouping defaults

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — this section + EINK-6A spec
4. `src/modes/FlowMode.ts` — current word-by-word advance logic
5. `src/modes/FocusMode.ts` — current RSVP logic
6. `src/utils/FlowScrollEngine.ts` — scroll engine internals
7. `src/hooks/useEinkController.ts` — refresh controller (post-EINK-6A)
8. `src/constants.ts` — e-ink constants

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Hephaestus (renderer-scope) | **Stepped Flow mode** — In FlowMode.ts: when `einkMode` is on, switch from per-line scroll to chunk-based advance. Display `EINK_LINES_PER_PAGE` lines, pause for calculated reading time, then instant-replace with next chunk. Cursor behavior: shrinking underline paces within visible chunk. Page transitions have no animation (`transition: none` already in eink behavioral CSS). | `src/modes/FlowMode.ts`, `src/utils/FlowScrollEngine.ts` |
| 2 | Hephaestus (renderer-scope) | **Burst Focus mode** — In FocusMode.ts: when `einkMode` is on and `einkPhraseGrouping` is true, group words into 2–3 word phrases. Display each phrase for the combined word duration at current WPM. Use the existing segmentation (whitespace-based) with configurable max group size (new constant `EINK_BURST_GROUP_SIZE = 3`). | `src/modes/FocusMode.ts`, `src/constants.ts` |
| 3 | Hephaestus (renderer-scope) | **Adaptive refresh heuristic** — Extend `useEinkController.ts`: track cumulative word count across page turns since last refresh. When cumulative words exceed `EINK_GHOSTING_THRESHOLD` (new constant, default 500), trigger refresh. Existing manual interval remains as override (refresh at whichever threshold triggers first). Add `EINK_ADAPTIVE_REFRESH_ENABLED` constant (default true). | `src/hooks/useEinkController.ts`, `src/constants.ts` |
| 4 | Hippocrates | **Tests** — (a) Stepped flow: einkMode on → chunk-based advance with correct timing. (b) Stepped flow: einkMode off → normal per-line scroll (no regression). (c) Burst focus: 2–3 word grouping with combined timing. (d) Burst focus: single-word fallback when phrase grouping off. (e) Adaptive refresh: triggers at word threshold. (f) Adaptive refresh: manual interval still works as override. ≥10 new tests. | `tests/` |
| 5 | Hippocrates | **`npm test` + `npm run build`** | — |
| 6 | Solon | **Spec compliance** | — |
| 7 | Herodotus | **Documentation pass** | All 6 governing docs |
| 8 | Hermes | **Git: auto-merge on successful sprint** — stage specific files, commit on the sprint branch, merge to `main` with `--no-ff`, and push unless the sprint is explicitly marked no-merge. | — |

#### SUCCESS CRITERIA

1. Flow mode in einkMode uses chunk-based page advance (no smooth scroll)
2. Chunk size configurable via `EINK_LINES_PER_PAGE`
3. Focus mode in einkMode groups words into 2–3 word phrases when phrase grouping is on
4. Phrase display timing equals combined single-word duration at current WPM
5. Adaptive refresh triggers based on cumulative word count, not just fixed interval
6. Manual refresh interval still works as override
7. Non-eink behavior in Flow and Focus modes unchanged (no regression)
8. ≥10 new tests
9. `npm test` passes
10. `npm run build` succeeds

**Tier:** Full | **Depends on:** EINK-6A

---

### Sprint GOALS-6B: Reading Goal Tracking ✅ COMPLETED 2026-05-02

**Closeout:** GOALS-6B completed on branch `sprint/goals-6b-reading-goals`. Blurby now has optional, local-first reading goals for daily pages, daily minutes, and weekly books. Users can create, edit, and delete goals in settings; the library widget surfaces progress; page/word advance, active reading minutes, and book completion drive progress; local daily/weekly resets maintain counters; and streaks are displayed for goal continuity.

**Review hardening:** The final implementation prevents adjacent progress overwrites with a latest-goals ref, gates page-mode minute accrual on idle/visibility state, uses page high-water deltas so revisited pages do not double-count, computes weekly reset boundaries with local calendar math for DST safety, and aligns the Electron API stub default with the shipped settings contract.

**Verification:** Full `npm test` passed 156 files / 2429 tests. `npm audit --audit-level=high` passed with only the existing moderate `uuid` advisories. `git diff --check` passed. `npm run build` passed with the existing circular chunk warning (`settings -> tts -> settings`). Solon final spec spot-check: APPROVED. Plato quality re-review: READY.

**Goal:** Add a lightweight reading goal system — set daily/weekly/monthly targets, track progress, and see visual feedback. Goals are optional, local-first, and non-intrusive. They surface progress without blocking reading.

**Problem:** Blurby tracks reading activity implicitly (time spent, pages turned, books in library) but gives users no way to set targets or see whether they're meeting them. Users who want to build a reading habit have no feedback loop. The reading queue (READINGS-4A) tells you what to read next; goals tell you how much to read.

**Design decisions:**
- **Three goal types.** Daily pages, daily minutes, weekly books. Each is independently configurable. Users can set zero, one, or all three. Stored in settings as a `goals` array of `ReadingGoal` objects.
- **Progress tracking via existing signals.** Pages: increment on page turn or word advance (1 page = `WORDS_PER_PAGE` words, consistent with existing pagination). Minutes: increment via `requestAnimationFrame` tick while any reading mode is active (Page, Focus, Flow, or Narration). Books: increment on book completion (existing `markComplete` action). No new data collection — we derive everything from existing events.
- **Library widget.** Compact progress bar(s) below the library header showing today's/this week's progress. Clicking opens the Goals detail view. Optionally collapsed to just an icon when goals are met.
- **Settings sub-page.** New `ReadingGoalsSettings.tsx` under Settings. Create/edit/delete goals. See current streaks. Reset daily at midnight local time; reset weekly on Monday.
- **Streak counter.** Track consecutive days meeting daily goal (or consecutive weeks meeting weekly goal). Display in settings and optionally on library widget. Stored as `currentStreak: number` and `lastStreakDate: string` in goal object.
- **No notifications in v1.** Gentle progress display only — no push notifications, no toasts, no modals. Keep it pull-based (user checks when they want to).
- **Local-first.** Goal data stored in settings JSON alongside other preferences. No cloud sync in this sprint (Phase 7 can add sync later). No IPC needed — goals are renderer-side state, computed from existing reading events.

**Baseline:**
- `src/types.ts` — settings schema (no goals fields yet)
- `src/contexts/SettingsContext.tsx` — settings propagation
- `src/components/LibraryContainer.tsx` — library header area where widget would live
- `src/components/settings/` — existing settings sub-pages (model for new GoalsSettings)
- `src/hooks/useReader.ts` — reading activity events (page turns, word advance)
- `src/components/ReaderContainer.tsx` — reading mode lifecycle

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — this section
4. `src/types.ts` — settings schema (where ReadingGoal type will live)
5. `src/contexts/SettingsContext.tsx` — settings context pattern
6. `src/components/LibraryContainer.tsx` — library header for widget placement
7. `src/components/settings/SpeedReadingSettings.tsx` — model settings sub-page structure
8. `src/hooks/useReader.ts` — reading activity events
9. `src/components/ReaderContainer.tsx` — reading mode lifecycle

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Hephaestus (renderer-scope) | **ReadingGoal type + settings schema** — Add `ReadingGoal` interface to types.ts: `{ id: string, type: 'daily-pages' | 'daily-minutes' | 'weekly-books', target: number, currentStreak: number, lastStreakDate: string }`. Add `goals: ReadingGoal[]` to settings (default empty array). Add `goalProgress: { todayPages: number, todayMinutes: number, weekBooks: number, lastResetDate: string }` to settings for tracking state. | `src/types.ts`, `src/constants.ts` |
| 2 | Hephaestus (renderer-scope) | **useReadingGoals hook** — New hook that: reads goals + progress from settings, provides `incrementPages(count)`, `incrementMinutes(delta)`, `incrementBooks()` methods, auto-resets daily counters at midnight (check `lastResetDate` on each read), auto-resets weekly counters on Monday, updates streak on daily reset (met yesterday's goal → streak+1, else reset to 0). | `src/hooks/useReadingGoals.ts` (new) |
| 3 | Hephaestus (renderer-scope) | **Wire progress tracking** — In ReaderContainer.tsx: call `incrementPages` on page turn events, call `incrementMinutes` from a 1-minute interval while any reading mode is active, call `incrementBooks` when book is marked complete. All calls go through the `useReadingGoals` hook. | `src/components/ReaderContainer.tsx` |
| 4 | Hephaestus (renderer-scope) | **GoalProgressWidget** — Compact component for library header: one progress bar per active goal (thin, accent color, percentage fill). Show "3/10 pages today" or "45/60 min today" labels. When all goals met, collapse to checkmark icon. Click navigates to goals settings. | `src/components/GoalProgressWidget.tsx` (new), `src/styles/global.css` |
| 5 | Hephaestus (renderer-scope) | **ReadingGoalsSettings** — New settings sub-page. List active goals with edit/delete. "Add Goal" button → inline form (type selector, target number). Show current streak per goal. | `src/components/settings/ReadingGoalsSettings.tsx` (new), `src/components/SettingsMenu.tsx` |
| 6 | Hephaestus (renderer-scope) | **Wire widget into library** — Add `GoalProgressWidget` to LibraryContainer header area. Only render when `settings.goals.length > 0`. | `src/components/LibraryContainer.tsx` |
| 7 | Hippocrates | **Tests** — (a) Goal creation persists to settings. (b) Daily reset clears page/minute counters at midnight. (c) Weekly reset clears book counter on Monday. (d) Streak increments when daily goal met before reset. (e) Streak resets when daily goal not met. (f) Progress widget renders correct fill percentage. (g) Widget hidden when no goals set. (h) incrementPages/incrementMinutes/incrementBooks update correctly. ≥10 new tests. | `tests/` |
| 8 | Hippocrates | **`npm test` + `npm run build`** | — |
| 9 | Solon | **Spec compliance** | — |
| 10 | Herodotus | **Documentation pass** | All 6 governing docs |
| 11 | Hermes | **Git: auto-merge on successful sprint** — stage specific files, commit on the sprint branch, merge to `main` with `--no-ff`, and push unless the sprint is explicitly marked no-merge. | — |

#### SUCCESS CRITERIA

1. Users can create daily-pages, daily-minutes, and weekly-books goals in settings
2. Goals persist in settings and survive app restart
3. Page turns during any reading mode increment today's page count
4. Active reading time (any mode) increments today's minutes count
5. Book completion increments weekly book count
6. Daily counters reset at midnight local time
7. Weekly counters reset on Monday
8. Streak tracks consecutive days meeting daily goal
9. GoalProgressWidget shows in library header when goals exist
10. Widget shows correct progress bars with labels

---

## Stage 3 — Successor Engine Track: MOSS-NANO Productization + Pocket TTS Integration (added 2026-05-02 PM, expanded 2026-05-04 PM)

> Rescoped per the two third-party audits (`docs/audit/2026-05-02-moss-nano-productization-third-party-audit/Response/`). The original AUDIT_MEMO.md sketch of MOSS-NANO-13 (capture booleans across four modes, feed to existing gate) was structurally insufficient: the live evidence schema was hand-authored, the integrated sidecar was a stub, several declared invariants weren't enforced, and the sprint wasn't registered in governance. This track decomposes MOSS-NANO-13 into five sequenced sub-sprints (13a, 13B, 13c, 13d, 13e) that address the audits' blocking changes, required scope additions, and governance hygiene. **Then per 2026-05-04 user direction, POCKET-TTS-1 is appended after 13e to add Pocket TTS as a third available engine in v2.0** — without rerunning the productization gate.
>
> **Scope lock:** MOSS-NANO-13a–13e + POCKET-TTS-1 are the only approved TTS/model work inside Desktop v2.0. MOSS-Nano's required outcome is a defensible productization decision (`PAUSE_NANO_PRODUCTIZATION`, `NANO_EXPERIMENTAL_ONLY`, or `NANO_RECOMMENDED_OPT_IN`), not mandatory Nano promotion. POCKET-TTS-1's required outcome is Pocket TTS available as a third engine option (no comparative gate; voice-cloning UX deferred to v2.1). Kokoro remains default/available; Qwen is retired for Desktop v2 and remains disabled.
>
> **Lane assignments:**
>
> - 13a: Lane D (Platform/Main Process) — `main/moss-nano-sidecar.js`, `main/moss-nano-engine.js`, `scripts/moss_nano_resident_probe.py` productization
> - 13B: Lane A (Runtime Core) + Lane C (UI/strategy) — bounded fixes + real app audio bridge for Nano
> - 13c: Lane B (Eval Harness) — `scripts/tts_eval_runner.mjs` gate refactor + new evidence producer tool
> - 13d: Lane B (Eval Harness) + Lane E (Governance) — automated Electron live-capture evidence production
> - 13e: Lane E (Governance/Product) — MOSS-Nano productization decision / opt-in recommendation write-up from 13d evidence
> - POCKET-TTS-1: Lane D (Platform/Main Process) + Lane C (UI/strategy) — Pocket TTS sidecar adapter, IPC, strategy, settings entry; **dispatched AFTER 13e**, no comparative gate work

**Closeout update 2026-05-03:** MOSS-NANO-13a established the resident child-process app sidecar path. MOSS-NANO-13B replaced the synthetic app-sidecar audio with real local MOSS-TTS-Nano ONNX synthesis through `tts-nano-*` IPC, then merged to `main` as `c7c133c` after residual Qwen-disable cleanup `45ff48c`. Decision: `PROMOTE_NANO_TO_REAL_APP_AUDIO_PROTOTYPE`. Scope remains narrow: Nano is selectable and can preview/synthesize only when readiness is truthful; Nano remains non-default, Qwen remains disabled, Kokoro remains available, and Nano narration remains `timingTruth: "segment-following"` with `wordTimestamps: null`.

**Closeout update 2026-05-03 (13d):** MOSS-NANO-13d reframed from manual observation-first to automated Electron live capture as the primary path after manual fallback was paused. It produced `artifacts/tts-eval/moss-nano-13d-live-capture/moss-nano-13d-live-evidence.json` with `schemaVersion: "moss-nano-live-evidence.v2"`, `evidenceKind/source: "real-app-selected-nano"`, real selected Nano, `runtime.syntheticAudio: false`, `timingTruth: "segment-following"`, and `wordTimestamps: null`. Trace counts were Page 42, Focus 44, Flow 43, Narrate 39. Review tightened provenance so observed trace events must include `engine-selection selectedEngine:nano` and `fallback-policy policy:explicit-only`; top-level assertions cannot substitute. Final gate command `node scripts/tts_eval_runner.mjs --matrix --tag moss-nano-12 --run-id moss-nano-13d-live-capture-gate --out artifacts/tts-eval/moss-nano-13d-live-capture/gate --nano-live-evidence artifacts/tts-eval/moss-nano-13d-live-capture/moss-nano-13d-live-evidence.json --gates` passed with hard failures 0/7, warnings 0/3, decision `NANO_RECOMMENDED_OPT_IN`, reasons none. Sprint decision: `LIVE_CAPTURE_READY_FOR_PRODUCT_DECISION`. This does not change the default engine, retire Kokoro, or reactivate Qwen.

---

### Sprint MOSS-NANO-13a: Real Sidecar Adapter

**Goal:** Replace the stub adapter at `main/moss-nano-sidecar.js` (currently returns `sidecar-adapter-not-configured` from every method) with a real Python-subprocess adapter that satisfies the contract the engine at `main/moss-nano-engine.js` already expects: `start(config)`, `status()`, `request(command, payload)`, `cancel(payload)`, `shutdown()`, `restart(config)`. The adapter spawns the Nano runtime as a long-lived Python subprocess (using a productized version of `scripts/moss_nano_resident_probe.py` or a new `scripts/moss_nano_sidecar.py` entry point), frames stdin/stdout messages with line-delimited JSON, tracks PID, handles crashes by surfacing `recoverable: true` failures the engine can use to escalate to restart, and reaps zombie processes on shutdown. After this sprint, calling `window.electronAPI.nanoSynthesize(...)` from the integrated app must drive a real ONNX synthesis and return real PCM, not `sidecar-adapter-not-configured`.

**Problem:** Per audit response §3 (Strongest Reasons Not to Proceed) and §10 item 3, the integrated sidecar does not exist. Every method in `main/moss-nano-sidecar.js:17-61` is a placeholder. The 6F bounded-soak evidence (1800s soak, 100/100 segments, p95 first-decoded 280ms) was produced by `scripts/moss_nano_resident_probe.py` running standalone — not by the integrated `main/moss-nano-engine.js` lifecycle wired to a real subprocess. MOSS-NANO-13e cannot capture live evidence in any reading mode until this chain is wired end-to-end.

**Design decisions:**

- **Spawn model:** Long-lived single subprocess (mirrors the resident-runtime model that produced 6F evidence). The adapter holds a reference to the spawned process across `start` → many `request("synthesize", ...)` → `shutdown`. On `restart`, the adapter explicitly kills the old process before spawning a new one and increments no internal counter — `lifecycleGeneration` is owned by `main/moss-nano-engine.js`.
- **IPC framing:** Line-delimited JSON over stdin/stdout. Each request includes `requestId` and `ownerToken`; each response includes the same so the engine can reject stale-output (this contract already exists in `main/moss-nano-engine.js:220-227`).
- **Crash recovery:** When stdout closes or the process exits non-zero before a request is settled, the adapter resolves the request with `structuredFailure("sidecar-process-exited", ...)`. The engine's existing `request-not-owned` and `stale-sidecar-output` paths catch the rest. Lifecycle generation is the engine's job, not the adapter's.
- **Zombie reaping:** On `shutdown`, the adapter sends a graceful exit message, waits up to `commandTimeoutMs` for the process to exit, then SIGKILLs and awaits exit. `unref()` the child handle once spawned so the adapter does not block app exit.
- **Configuration:** Adapter accepts `runtimeDir`, `modelDir`, `tokenizerDir` from the engine's `DEFAULT_CONFIG` snapshot (already exposed via `VISIBLE_CONFIG_KEYS` at `main/moss-nano-engine.js:18-26`). If any required path is missing or unreadable, `start` returns `unavailableStatus({ reason: "sidecar-runtime-missing" })` so the engine surfaces a clear unavailable state rather than crashing.
- **Productized Python entry point:** Add `scripts/moss_nano_sidecar.py` that loads the same ONNX runtime path the resident probe uses, but exposes a long-lived stdin/stdout loop instead of a one-shot run. Reuse `moss_nano_probe` import (already imported by `moss_nano_resident_probe.py:23`) for the runtime instantiation; only the I/O loop is new.

**Baseline:**

- `main/moss-nano-sidecar.js` (66 lines, all stub) — replace with real adapter
- `main/moss-nano-engine.js` (~300 lines) — engine contract; do not modify in this sprint
- `scripts/moss_nano_resident_probe.py` (~600 lines) — model loading reference
- `scripts/moss_nano_sidecar.py` — new file; long-lived stdin/stdout loop
- `tests/mossNanoSidecar.test.js` — new file; mock-process integration tests
- `tests/mossNanoEngine.test.js` — existing; should still pass with real adapter substituted via `options.sidecarAdapter`

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — this section
4. `docs/audit/2026-05-02-moss-nano-productization-third-party-audit/Response/moss-nano-13-third-party-audit-review.md` §3, §10 items 3
5. `main/moss-nano-engine.js` lines 1–90 (DEFAULT_CONFIG, VISIBLE_CONFIG_KEYS, helpers)
6. `main/moss-nano-engine.js` lines 175–245 (synthesize / request flow, owner-token contract)
7. `main/moss-nano-sidecar.js` (entire file — 66 lines, will be replaced)
8. `scripts/moss_nano_resident_probe.py` lines 1–60 (runtime imports, tokenizer/model setup)
9. `tests/mossNanoEngine.test.js` (entire file — contract tests that must continue to pass with real adapter behind a fixture seam)

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Athena (electron-scope, cross-system) | **Add `scripts/moss_nano_sidecar.py`** — long-lived stdin/stdout loop using `moss_nano_probe` for runtime instantiation. Each request: read line, parse JSON, execute synthesize, write line-delimited JSON response with `requestId` + `ownerToken` echoed. Graceful exit on `command: "shutdown"`. | `scripts/moss_nano_sidecar.py` (new) |
| 2 | Athena (electron-scope) | **Replace `main/moss-nano-sidecar.js` with real adapter** — `child_process.spawn` Python with `scripts/moss_nano_sidecar.py`. Implement `start`, `status`, `request`, `cancel`, `shutdown`, `restart`. Line-delimited JSON over stdin/stdout. PID tracking. SIGKILL fallback on shutdown timeout. | `main/moss-nano-sidecar.js` |
| 3 | Hephaestus (electron-scope) | **Crash recovery wiring** — On `child.exit` or `child.error` events, settle pending requests with `structuredFailure("sidecar-process-exited", ...)`. Map `unref()` so app exit isn't blocked. | `main/moss-nano-sidecar.js` |
| 4 | Hippocrates | **Sidecar adapter tests** — New `tests/mossNanoSidecar.test.js`: (a) start/status returns running; (b) request/synthesize round-trip with a stub Python script that echoes deterministic PCM; (c) request after shutdown returns `sidecar-not-running`; (d) crashed subprocess settles in-flight requests with `sidecar-process-exited`; (e) restart kills old PID before spawning new. ≥10 new tests. | `tests/mossNanoSidecar.test.js` (new), `tests/fixtures/moss-nano-stub-sidecar.py` (new) |
| 5 | Hippocrates | **Engine integration test with real adapter** — New test in `tests/mossNanoEngine.test.js` that constructs the real adapter (against the stub Python from #4) via `createMossNanoEngine({ sidecarAdapter: createMossNanoSidecarAdapter() })` and runs the existing in-flight settlement / lifecycle / cancel scenarios end-to-end. ≥3 new tests. | `tests/mossNanoEngine.test.js` |
| 6 | Hippocrates | **`npm test` + `npm run build`** | — |
| 7 | Solon | **Spec compliance** — every SUCCESS CRITERIA item below verified | — |
| 8 | Plato | **Quality + known-trap review** — Promise leak audit on adapter (no unresolved deferred), stdin/stdout backpressure handling, child process cleanup on app quit | — |
| 9 | Herodotus | **Documentation pass** — CLAUDE.md, TECHNICAL_REFERENCE.md (new section: "MOSS-NANO Sidecar Adapter"), LESSONS_LEARNED.md, ROADMAP.md, SPRINT_QUEUE.md, MOSS_DECISION_LOG.md | All 6 governing docs |
| 10 | Hermes | **Git: auto-merge on successful sprint** — branch `sprint/moss-nano-13a-real-adapter`, stage specific files, commit, merge to `main` with `--no-ff`, push. | — |

> **Wave split note:** This sprint has 5 implementation tasks (1, 2, 3, 4, 5) plus verification + docs + git. **Pre-split into two waves at dispatch time per Standing Rule 10:** Wave A = tasks 1–5 + Hippocrates `npm test`. Wave B = Solon + Plato + Herodotus + Hermes.

#### SUCCESS CRITERIA

1. `main/moss-nano-sidecar.js` no longer returns `sidecar-adapter-not-configured` from any method when given valid `runtimeDir` / `modelDir` / `tokenizerDir`.
2. `scripts/moss_nano_sidecar.py` exists and runs a long-lived stdin/stdout loop using the same ONNX runtime path as `scripts/moss_nano_resident_probe.py`.
3. Calling `await window.electronAPI.nanoSynthesize(text, opts)` from the integrated app drives a real subprocess synthesis and returns real PCM (verified manually against a sample EPUB chapter).
4. Engine + adapter chain passes the existing `tests/mossNanoEngine.test.js` lifecycle scenarios with the real adapter substituted (test #5).
5. Crashed subprocess settles in-flight requests with `sidecar-process-exited`; subsequent requests return `sidecar-not-running` until the engine calls `restart`.
6. `restart` kills the old subprocess (verified by PID comparison) before spawning a new one.
7. App exit is not blocked by the sidecar adapter (`unref` verified).
8. ≥10 new tests in `tests/mossNanoSidecar.test.js` + ≥3 new tests in `tests/mossNanoEngine.test.js`.
9. `npm test` passes (target: 2,410+ tests).
10. `npm run build` succeeds.

**Tier:** Full | **Depends on:** EINK-6B can run in parallel (Lane C vs Lane D, no shared-core overlap). Sequenced before MOSS-NANO-13b.

---

### Sprint MOSS-NANO-13b: Engine Hardening + Strategy Invariants

**Goal:** Three coupled fixes that turn declared-but-unenforced contracts in the MOSS-NANO engine and strategy into actual code-level invariants. (1) Enforce `synthesizeTimeoutMs` (120s) and `commandTimeoutMs` (5s) in `main/moss-nano-engine.js` via `Promise.race` against `setTimeout`-rejected sentinels. (2) Fix `setContinuityScope` in `src/hooks/narration/mossNanoStrategy.ts:412-415` to bump `generationId` (not just `prefetchGenerationId`), so an in-flight `speakChunk` whose scope changes mid-flight is not scheduled when its result eventually arrives. (3) Upgrade `hashText` (`src/hooks/narration/mossNanoStrategy.ts:87-93`) — include `text.length` in the cache key composition so 32-bit hash collisions across distinct texts at the same scope/voice/rate/startIdx cannot admit stale audio.

**Problem:** Per audit findings NANO13-M2, NANO13-M4, and NANO13-MOD1. As shipped today: a hung sidecar will hang the renderer's `await api.nanoSynthesize(...)` indefinitely because timeouts are decorative; cross-section staleness is renderer-discipline, not a strategy invariant; and 32-bit hash collisions softening the cache soundness claim. None of these will hold up under live observation, and the live evidence gate (post-13c) will require they hold.

**Design decisions:**

- **Timeout enforcement:** Wrap each `sidecarAdapter.request("synthesize", payload)` call inside `synthesize` (`main/moss-nano-engine.js:204`) with `Promise.race([ requestPromise, timeoutPromise ])` where `timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("synthesize-timeout")), config.synthesizeTimeoutMs))`. On timeout, settle the in-flight request with `structuredFailure("synthesize-timeout", ...)` and trigger `restart()` (since a hung sidecar is not safely reusable). Apply the same pattern to non-synthesize requests using `commandTimeoutMs` (e.g., `cancel` adapter calls).
- **Scope-change in-flight invalidation:** Change `setContinuityScope` from `prefetchGenerationId++` to `generationId++; prefetchGenerationId++`. This makes the existing in-flight guard at line 317 (`if (generation !== generationId || !result) return;`) catch any `speakChunk` whose scope changed between fetch start (line 276) and result delivery. The renderer-level `stop()` call at `useNarration.ts:1193-1194` becomes a defense-in-depth, not the only line.
- **Cache key hardening:** Change `makeCacheKey` (`src/hooks/narration/mossNanoStrategy.ts:149-155`) from including `hashText(text)` to including both `String(text.length)` and `hashText(text)` as separate join components. This adds a length-fingerprint check that 32-bit collisions cannot replicate without also matching exact length.
- **No new public API:** All three fixes are internal to the engine and strategy. No type changes. No IPC contract changes. Existing tests continue to compile.

**Baseline:**

- `main/moss-nano-engine.js` lines 8–16 (DEFAULT_CONFIG: timeouts declared)
- `main/moss-nano-engine.js` lines 175–245 (synthesize / request flow: where timeouts must wrap)
- `main/moss-nano-engine.js` lines 270–300 (shutdown / restart for timeout-triggered restart)
- `src/hooks/narration/mossNanoStrategy.ts:87-93` (`hashText`)
- `src/hooks/narration/mossNanoStrategy.ts:149-155` (`makeCacheKey`)
- `src/hooks/narration/mossNanoStrategy.ts:276` (`generationId = ++generationId` at speakChunk start)
- `src/hooks/narration/mossNanoStrategy.ts:317` (in-flight guard)
- `src/hooks/narration/mossNanoStrategy.ts:412-415` (`setContinuityScope` — to be fixed)
- `tests/mossNanoEngine.test.js:179-202` (current timeout-config-snapshot test — needs new timeout-behavior test alongside)
- `tests/mossNanoStrategy.test.ts:324-357` (cross-scope cache-key test — needs sibling for in-flight speakChunk invalidation)

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — this section
4. `docs/audit/2026-05-02-moss-nano-productization-third-party-audit/Response/moss-nano-13-third-party-audit-review.md` §10 items 4, 5, MOD1
5. `main/moss-nano-engine.js` (full file)
6. `src/hooks/narration/mossNanoStrategy.ts` lines 80–160 (hash + cache key)
7. `src/hooks/narration/mossNanoStrategy.ts` lines 270–330 (speakChunk + in-flight guard)
8. `src/hooks/narration/mossNanoStrategy.ts` lines 400–450 (setContinuityScope, stop)
9. `tests/mossNanoEngine.test.js` (existing patterns)
10. `tests/mossNanoStrategy.test.ts` (existing patterns)

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Hephaestus (electron-scope) | **Enforce `synthesizeTimeoutMs`** — Wrap `sidecarAdapter.request("synthesize", ...)` in `Promise.race` with `setTimeout`-rejected sentinel using `config.synthesizeTimeoutMs`. On timeout: settle in-flight request with `structuredFailure("synthesize-timeout", ...)`, trigger `restart()`. | `main/moss-nano-engine.js` |
| 2 | Hephaestus (electron-scope) | **Enforce `commandTimeoutMs`** — Apply same pattern to non-synthesize adapter calls (e.g., `cancel`). On timeout: structured failure, no restart (single command failures don't justify subprocess kill). | `main/moss-nano-engine.js` |
| 3 | Hephaestus (renderer-scope) | **Fix `setContinuityScope`** — Change line 414 from `prefetchGenerationId++` to `generationId++; prefetchGenerationId++`. | `src/hooks/narration/mossNanoStrategy.ts` |
| 4 | Hephaestus (renderer-scope) | **Harden `makeCacheKey`** — Change line 154 from `hashText(text)` to `String(text.length), hashText(text)` as two separate join components. | `src/hooks/narration/mossNanoStrategy.ts` |
| 5 | Hippocrates | **Engine timeout tests** — New test in `tests/mossNanoEngine.test.js`: (a) hung adapter → synthesize rejects with `synthesize-timeout` after configured ms; (b) synthesize-timeout triggers restart (lifecycleGeneration increments); (c) commandTimeoutMs applied to cancel; (d) timeout config remains visible in status snapshot (existing assertion preserved). ≥4 new tests. | `tests/mossNanoEngine.test.js` |
| 6 | Hippocrates | **Strategy in-flight invalidation test** — New test in `tests/mossNanoStrategy.test.ts`: speakChunk in-flight → setContinuityScope → late synthesize result → assert `scheduleSegment` NOT called for the late result. ≥3 new tests covering scope-change-during-flight, scope-change-during-prefetch (existing path), and cache-key length-fingerprint disambiguation. | `tests/mossNanoStrategy.test.ts` |
| 7 | Hippocrates | **`npm test` + `npm run build`** | — |
| 8 | Solon | **Spec compliance** | — |
| 9 | Plato | **Quality + known-trap review** — Promise.race leak check (timeout sentinel must not leak after request settles), restart-cascade check (a timeout shouldn't be able to retrigger itself in the new generation) | — |
| 10 | Herodotus | **Documentation pass** | All 6 governing docs |
| 11 | Hermes | **Git: auto-merge on successful sprint** — branch `sprint/moss-nano-13b-engine-hardening`. | — |

#### SUCCESS CRITERIA

1. A hung sidecar (mock that never responds) causes `synthesize` to reject with `synthesize-timeout` within `synthesizeTimeoutMs ± 100ms`.
2. Synthesize-timeout triggers a `restart()` (verified by `lifecycleGeneration` increment).
3. `commandTimeoutMs` enforced for non-synthesize adapter calls; structured failure, no restart.
4. `setContinuityScope` increments `generationId` so an in-flight `speakChunk` is invalidated on scope change.
5. Cache key includes `text.length` separately from `hashText(text)`; 32-bit hash collisions with different lengths cannot share a cache entry.
6. `tests/mossNanoEngine.test.js:179-202` (existing timeout-config-snapshot test) still passes.
7. ≥4 new engine tests + ≥3 new strategy tests.
8. `npm test` passes (target: 2,420+ tests).
9. `npm run build` succeeds.

**Tier:** Full | **Depends on:** MOSS-NANO-13a (timeouts must wrap a real adapter to be meaningfully testable in integration; pure-mock unit tests can land before 13a, but full integration test in #5 needs 13a's mock-process fixture).

---

### Sprint MOSS-NANO-13c: Live Evidence Schema + Producer + Gate Validation

**Status:** COMPLETE (2026-05-03). Decision label: `PROVENANCE_GATE_READY_NO_LIVE_CAPTURE`.

**Closeout:** `scripts/tts_eval_runner.mjs` now owns the v2 live-evidence artifact builder and gate. The gate requires `schemaVersion: "moss-nano-live-evidence.v2"`, `evidenceKind: "real-app-selected-nano"`, producer/app provenance, all Page/Focus/Flow/Narrate modes, linked trace artifacts, matching trace event counts, selected Nano in the trace itself, segment-following timing, `wordTimestamps: null`, quantitative Nano latency/cache/prefetch/recycle fields, and `runtime.syntheticAudio: false`. `--nano-live-evidence-out` plus repeated `--nano-live-trace mode=path` writes a provenance artifact from explicit per-mode live trace artifacts and feeds that artifact into the gate. Legacy boolean JSON, simulated evidence, missing modes, stale/mismatched artifacts, non-Nano selected traces, and synthetic audio traces cannot promote. No default-engine change, Qwen reactivation, Kokoro retirement, or fake word timestamp path was introduced.

**Product truth:** 13c proved the evidence infrastructure, not a product promotion. MOSS-NANO-13d has since supplied complete clean four-mode evidence from real selected-Nano app behavior; 13e must still record the productization decision before any recommendation posture changes.

**Goal:** Three coupled deliverables. (1) Redefine the `liveEvidence.modes[mode]` schema as machine-produced, requiring quantitative observations (`nanoSegmentLatencyMs.{p50,p95,min,max}`, `nanoCache.{hits,misses,hitRate}`, `nanoPrefetch.{ready,stale,cancelled}`, `recycleObservations`) plus provenance fields (`runArtifactPath`, `traceEventCount`, `recordedAt`, `appCommit`, `evidenceProducerVersion`, `schemaVersion`). (2) Build the evidence producer — a new tool (`scripts/moss_nano_live_capture.mjs`) that exercises the integrated app in a `--nano-live-capture` mode, records real `nano-segment` events from `mossNanoStrategy.onSegmentTrace`, and emits the sealed live-evidence JSON. (3) Update `evaluateMossNanoLiveEvidenceGate` (`scripts/tts_eval_runner.mjs:100-160`) to validate provenance: assert `runArtifactPath` exists on disk, `traceEventCount` matches the linked artifact's event count, latency and cache numbers are within the artifact's bounds, no key is `true` without a non-null quantitative basis. Update or replace the existing matrix-simulator passing-evidence test (`tests/ttsEvalMatrixRunner.test.ts:709-767`) since the gate now rejects hand-authored boolean JSON.

**Problem:** Per audit finding NANO13-C1 (CRITICAL). The gate as shipped accepts a JSON file of plain booleans — `tests/ttsEvalMatrixRunner.test.ts:709-767` demonstrates a hand-authored all-true JSON yields `NANO_RECOMMENDED_OPT_IN`. Nothing in the file format requires a hash, run ID, artifact path, latency distribution, segment count, or any quantitative observation. This is structurally less verifiable than the simulated matrix output it's supposed to replace, because at least the simulator runs code. Until this is fixed, MOSS-NANO-13e cannot meaningfully change Nano's status.

**Design decisions:**

- **Schema versioning:** New required field `schemaVersion: 2` (1 = legacy boolean schema). Gate accepts only schemaVersion ≥ 2 for productization decisions. Schema is documented in `docs/testing/MOSS_NANO_LIVE_EVIDENCE_SCHEMA.md`.
- **Producer architecture:** Standalone Node script. Spawns the integrated app via Electron (or attaches to a running instance via a debug port) with a `--nano-live-capture <output-path>` flag wired through `main/main.js`. The renderer side, already exposing `mossNanoStrategy.onSegmentTrace` (per audit annex), forwards trace events through a new IPC channel `tts-nano-live-trace` to main, which appends to `runArtifactPath`. On producer signal (e.g., end of book or N segments), the producer reads back the run artifact, computes per-mode quantitative summaries, and emits the sealed `liveEvidence` JSON.
- **Provenance validation in gate:** New helper `validateLiveEvidenceProvenance(liveEvidence)` in `scripts/tts_eval_runner.mjs`. Steps: (a) require `schemaVersion ≥ 2`; (b) for each mode entry, `existsSync(runArtifactPath)`; (c) load run artifact, count `nano-segment` events, assert `traceEventCount === actualEventCount`; (d) compute latency p50/p95/min/max from artifact, assert within ±5% tolerance of declared values; (e) assert each boolean key has supporting quantitative basis (e.g., `noStalePlayback === true` requires `nanoCache.hits + nanoCache.misses > 0`).
- **Test rewrite:** `tests/ttsEvalMatrixRunner.test.ts:709-767` (currently uses `passingModeEvidence` = all-true booleans) becomes a NEGATIVE test ("legacy hand-authored boolean schema is rejected by gate"). New positive test uses a fixture-generated run artifact + producer-output evidence JSON.
- **No live producer execution in this sprint:** 13c builds the schema + producer + gate. Actually running the producer against a live selected-Nano session is 13e. This split is deliberate: 13c is a code/test sprint; 13e is an evidence-capture sprint.

**Baseline:**

- `scripts/tts_eval_runner.mjs:11` (MOSS_NANO_PRODUCT_MODES)
- `scripts/tts_eval_runner.mjs:100-160` (`evaluateMossNanoLiveEvidenceGate`)
- `scripts/tts_eval_runner.mjs:815` (`simulateTrace` — gate path)
- `scripts/tts_eval_runner.mjs:835-840` (`readJson(args.nanoLiveEvidencePath)`)
- `tests/ttsEvalMatrixRunner.test.ts:709-767` (existing all-true-booleans test → becomes negative test)
- `tests/fixtures/narration/matrix.manifest.json:170-228` (MOSS-NANO-12 scenario slots)
- `src/hooks/narration/mossNanoStrategy.ts` `onSegmentTrace` callback wiring (already emits `MossNanoSegmentTraceEvent`)
- `main/main.js` argv parsing (where `--nano-live-capture` flag will be wired)
- `preload.js` (new IPC channel for trace events)
- `docs/testing/MOSS_NANO_LIVE_EVIDENCE_SCHEMA.md` (new file)

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — this section
4. `docs/audit/2026-05-02-moss-nano-productization-third-party-audit/Response/moss-nano-13-third-party-audit-review.md` §7, §10 items 1–2
5. `scripts/tts_eval_runner.mjs` (full file — focus on 1–160 and 800–840)
6. `tests/ttsEvalMatrixRunner.test.ts` lines 700–800
7. `tests/fixtures/narration/matrix.manifest.json` lines 90–230
8. `src/hooks/narration/mossNanoStrategy.ts` (segmentTrace types and emission sites)
9. `main/main.js` (argv parsing patterns)
10. `preload.js` (IPC channel patterns)

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Athena (cross-system) | **Schema definition + docs** — Create `docs/testing/MOSS_NANO_LIVE_EVIDENCE_SCHEMA.md` documenting v2 schema. Add TypeScript type `MossNanoLiveEvidenceV2` in a new `src/types/mossNanoLiveEvidence.ts`. | `docs/testing/MOSS_NANO_LIVE_EVIDENCE_SCHEMA.md` (new), `src/types/mossNanoLiveEvidence.ts` (new) |
| 2 | Athena (electron-scope) | **`--nano-live-capture` flag wiring** — Parse `--nano-live-capture <path>` in `main/main.js`. New IPC channel `tts-nano-live-trace` registered in `main/ipc/tts.js` that appends events to the capture path. Wire `mossNanoStrategy.onSegmentTrace` callback through `useNarration` to `window.electronAPI.nanoLiveTrace(event)` when capture is active. | `main/main.js`, `main/ipc/tts.js`, `preload.js`, `src/hooks/useNarration.ts` |
| 3 | Athena (cross-system) | **Producer tool** — `scripts/moss_nano_live_capture.mjs`. Spawns Electron with `--nano-live-capture <output-artifact-path>`. Waits for capture-complete signal (or N segments). Reads run artifact, computes per-mode quantitative summaries, emits sealed `liveEvidence` v2 JSON to stdout or `--output <path>`. | `scripts/moss_nano_live_capture.mjs` (new) |
| 4 | Athena (Lane B) | **Gate provenance validation** — Add `validateLiveEvidenceProvenance(liveEvidence)` helper. Update `evaluateMossNanoLiveEvidenceGate` to call it before existing logic. On failure, decision = `NANO_EXPERIMENTAL_ONLY` with reason naming the failed provenance check. | `scripts/tts_eval_runner.mjs` |
| 5 | Hippocrates | **Gate test rewrite** — `tests/ttsEvalMatrixRunner.test.ts:709-767` becomes a negative test asserting legacy boolean schema is rejected. New positive test uses a fixture run artifact + producer-output evidence (under `tests/fixtures/moss-nano/live-evidence-v2/`). ≥6 new tests covering: provenance fail (missing artifact), provenance fail (event count mismatch), provenance fail (latency out of tolerance), provenance fail (boolean without quantitative basis), provenance pass (all checks ok), schemaVersion=1 rejected. | `tests/ttsEvalMatrixRunner.test.ts`, `tests/fixtures/moss-nano/live-evidence-v2/` (new) |
| 6 | Hippocrates | **Producer integration test** — `tests/mossNanoLiveCapture.test.ts`: smoke test producer in --dry-run mode against a fixture trace stream. ≥3 new tests. | `tests/mossNanoLiveCapture.test.ts` (new) |
| 7 | Hippocrates | **`npm test` + `npm run build`** | — |
| 8 | Solon | **Spec compliance** | — |
| 9 | Plato | **Quality + known-trap review** — Schema-version handling, IPC channel security (no untrusted file paths from renderer), producer error handling | — |
| 10 | Herodotus | **Documentation pass** — TECHNICAL_REFERENCE.md (new section: "MOSS-NANO Live Evidence Schema v2"), CLAUDE.md, LESSONS_LEARNED.md, ROADMAP.md, SPRINT_QUEUE.md, MOSS_DECISION_LOG.md | All 6 governing docs |
| 11 | Hermes | **Git: auto-merge on successful sprint** — branch `sprint/moss-nano-13c-evidence-schema`. | — |

> **Wave split note:** This sprint has 6 implementation tasks (1–6). **Pre-split into two waves at dispatch time:** Wave A = tasks 1–4 + 5 + Hippocrates `npm test`. Wave B = task 6 + Solon + Plato + Herodotus + Hermes.

#### SUCCESS CRITERIA

1. `MossNanoLiveEvidenceV2` TypeScript type defined and documented in `docs/testing/MOSS_NANO_LIVE_EVIDENCE_SCHEMA.md`.
2. `--nano-live-capture <path>` flag wired through main → renderer → strategy; trace events captured to disk.
3. `scripts/moss_nano_live_capture.mjs` produces v2-schema evidence JSON from a captured run artifact.
4. `evaluateMossNanoLiveEvidenceGate` rejects schemaVersion=1 (legacy boolean schema) and validates provenance for schemaVersion=2.
5. Provenance failures (missing artifact, event count mismatch, latency out of tolerance, boolean-without-basis) cap decision at `NANO_EXPERIMENTAL_ONLY` with named reason.
6. `tests/ttsEvalMatrixRunner.test.ts:709-767` legacy test now asserts schemaVersion=1 rejection.
7. ≥6 new gate tests + ≥3 new producer tests.
8. `npm test` passes (target: 2,430+ tests).
9. `npm run build` succeeds.

**Tier:** Full | **Depends on:** MOSS-NANO-13a (real adapter required for the producer to actually capture real Nano events), MOSS-NANO-13b (engine + strategy invariants must hold for captured events to be meaningful).

---

### Sprint MOSS-NANO-13d: Live Four-Mode Capture Producer / Manual Observation Pass ✅ COMPLETED 2026-05-04 — durable closeout merged to `main`

> **Durability state (as of 2026-05-04 PM):** Sprint work is durably closed. The selected-Nano four-mode evidence artifact, gate output, live-capture instrumentation, renderer/strategy source changes, and regression tests were committed on `sprint/moss-nano-13d-durable-closeout`, merged to `main` with `--no-ff`, and pushed. A fresh checkout of `main` now contains the 13d evidence pipeline required by MOSS-NANO-13e.

**Decision:** `LIVE_CAPTURE_READY_FOR_PRODUCT_DECISION`.

**Goal:** Produce real app-selected Nano evidence across Page, Focus, Flow, and Narrate. The sprint began as manual observation fallback work, but the automated Electron live-capture driver became the primary capture path after the manual fallback was paused.

**Evidence:** `artifacts/tts-eval/moss-nano-13d-live-capture/moss-nano-13d-live-evidence.json` records `schemaVersion: "moss-nano-live-evidence.v2"`, `evidenceKind/source: "real-app-selected-nano"`, real selected Nano, `runtime.syntheticAudio: false`, `timingTruth: "segment-following"`, and `wordTimestamps: null`. Trace counts: Page 42, Focus 44, Flow 43, Narrate 39.

**Gate:** `node scripts/tts_eval_runner.mjs --matrix --tag moss-nano-12 --run-id moss-nano-13d-live-capture-gate --out artifacts/tts-eval/moss-nano-13d-live-capture/gate --nano-live-evidence artifacts/tts-eval/moss-nano-13d-live-capture/moss-nano-13d-live-evidence.json --gates` passed with hard failures 0/7, warnings 0/3, decision `NANO_RECOMMENDED_OPT_IN`, reasons none.

**Review tightening:** Observed provenance now requires trace-level `engine-selection selectedEngine:nano` and observed `fallback-policy policy:explicit-only`; top-level evidence assertions cannot substitute.

**Verification:** Focused tests passed 7 files / 113 tests. Full `npm test` passed 165 files / 2518 tests. `npm run build` passed with circular chunk warning `settings -> tts -> settings`. `npm audit --audit-level=high` passed with 3 moderate `uuid` findings. `git diff --check` passed. No Electron process was left running.

**Non-decisions:** No default-engine change, no Kokoro retirement, and no Qwen reactivation.

---

### Sprint POCKET-TTS-1: Pocket TTS Engine Integration ✅ COMPLETED 2026-05-04 — available opt-in third engine

**Closeout:** POCKET-TTS-1 added Pocket TTS as a third explicit opt-in engine path without reopening MOSS-Nano productization, running a comparative engine gate, changing Kokoro's default posture, reactivating Qwen, or exposing public voice-cloning UX in v2.0. The landed path includes the Pocket sidecar/engine wrapper, engine-specific IPC/preload/type surface, renderer narration strategy, settings status/preview/selector wiring, and regression coverage that preserves Kokoro default, MOSS-Nano recommended opt-in, and Qwen disabled.

**Verification:** Focused Pocket tests passed 4 files / 30 tests. Full `npm test` passed 169 files / 2548 tests. `npm run build` passed with the existing circular chunk warning `settings -> tts -> settings`. `npm run typecheck` was attempted and still fails on pre-existing repo-wide TypeScript debt outside the Pocket path.

> **Sequencing note:** Although this spec sits between MOSS-NANO-13d and MOSS-NANO-13e in document order (an artifact of an earlier draft when the sprint was numbered "13d.5"), POCKET-TTS-1 dispatches **AFTER** MOSS-NANO-13e per the 2026-05-04 user direction: "Let's see MOSS-Nano through, then also add Pocket TTS, so we'll have Kokoro, MOSS, and Pocket at the first finishline." Active conveyor sequence is: 13d → 13e → POCKET-TTS-1 → POLISH-1 → RELEASE-1. The earlier comparative-gate framing (where Pocket TTS would be evaluated alongside MOSS-Nano through a generalized productization gate) is dropped — 13e closes MOSS-Nano's product decision on its own evidence; POCKET-TTS-1 simply adds Pocket TTS as a third available engine option without putting it through the same provenance-backed gate.

**Goal:** Integrate Pocket TTS (Kyutai Labs, 100M CALM, MIT, 6 languages, 5-second voice cloning, 200ms TTFA, 1.84 WER on Librispeech, top-tier ELO) into Blurby as a third available engine option alongside Kokoro (default) and MOSS-Nano (recommended opt-in per 13e). This sprint produces the engine sidecar, IPC plumbing, renderer strategy, and settings UX entry — but does NOT run Pocket TTS through the comparative live-evidence productization gate. Pocket TTS ships as "available opt-in" in v2.0, parallel to how MOSS-Nano shipped before its 13d gate clearance. A separate v2.1 candidate-evaluation lane can later run Pocket TTS through the productization gate if a recommended-opt-in upgrade is desired.

**Problem:** Blurby ends Desktop v2.0 with three potential engines but only one of them (MOSS-Nano) actually integrated and one (Kokoro) operational — Qwen is disabled, and Pocket TTS exists only as a research-PDF candidate. The user's strategic direction (2026-05-04) is to ship all three engines available at v2.0 ship gate, with MOSS-Nano explicitly recommended. POCKET-TTS-1 makes Pocket TTS available; v2.0 ships with: Kokoro default, MOSS-Nano recommended opt-in (per 13e), Pocket TTS available opt-in. Voice cloning capability is integrated at the Python sidecar layer but not exposed as a v2.0 product feature (defer to v2.1 polish).

**Design decisions:**

- **No comparative gate work.** Drop the schema generalization, gate parameterization, and producer renaming from the earlier 13d.5 framing. The MOSS-Nano-specific evidence schema, gate evaluator, and live-capture producer remain MOSS-Nano-specific. Pocket TTS does not run through the productization gate in v2.0.
- **Pocket TTS sidecar adapter.** New `main/pocket-tts-sidecar.js` mirroring the structure of `main/moss-nano-sidecar.js`. Spawns a Python subprocess via new `scripts/pocket_tts_sidecar.py` that loads Pocket TTS through the `pocket_tts` package per the upstream README. Same line-delimited JSON protocol; same `start/status/request/cancel/shutdown/restart` 6-method shape as the MOSS-Nano adapter (so the contract is implicitly engine-agnostic, even though no formal `EngineSidecarAdapter` interface is extracted in this sprint).
- **Pocket TTS engine wrapper.** New `main/pocket-tts-engine.js` mirroring `main/moss-nano-engine.js` (`createPocketTtsEngine`). Lifecycle generation, owner tokens, in-flight settlement, and structured failure paths follow the same patterns. Bake in 13B hardening from construction: enforce `synthesizeTimeoutMs` and `commandTimeoutMs` via `Promise.race`.
- **Pocket TTS IPC channels.** New `tts-pocket-status`, `tts-pocket-synthesize`, `tts-pocket-cancel`, `tts-pocket-shutdown`, `tts-pocket-restart` registered in `main/ipc/tts.js`. Preload bridge exposes `electronAPI.pocketStatus()`, `electronAPI.pocketSynthesize()`, etc. Channels are engine-specific by design — each engine has different capabilities (Pocket TTS supports voice cloning; MOSS-Nano doesn't).
- **Pocket TTS strategy.** New `src/hooks/narration/pocketTtsStrategy.ts` mirroring `mossNanoStrategy.ts`. Bakes in the 13B hardening patterns from the start: `setContinuityScope` increments `generationId` (not just `prefetchGenerationId`); cache key includes `text.length` separately from `hashText(text)`. Voice cloning capability is *integrated at the sidecar* (scaffolding present) but **not exposed in v2.0 settings UX** — defer surface to v2.1.
- **Settings UX entry, no default change.** Settings adds Pocket TTS as a third engine option, readiness-gated, presented as "available opt-in" alongside MOSS-Nano's "recommended opt-in" framing (per 13e's product memo). Default remains Kokoro; Qwen remains disabled. Selecting Pocket TTS triggers readiness check and explicit-only fallback, identical to MOSS-Nano's contract per `useNarration.ts:923-926`.
- **No comparative productization decision.** v2.0 release notes name three engines available with their respective postures (Kokoro default, MOSS recommended opt-in per 13d/13e gate, Pocket available opt-in pending v2.1 evaluation). No live capture run, no comparative analysis, no per-engine gate decision beyond what 13e already produced for MOSS.
- **Pocket TTS sources & sizing.** Pocket TTS is MIT-licensed at `github.com/kyutai-labs/pocket-tts`. ~100M parameters across 90M causal transformer + 10M Mimi codec decoder. PyTorch 2.5+ requirement matches the existing Python policy. CPU-only operation explicitly supported per upstream documentation. No bundled weights; `qwen/config.json`-style external runtime expectations apply.

**Baseline:**

- `main/moss-nano-sidecar.js` (current MOSS-Nano-specific real adapter shipped in 13a)
- `main/moss-nano-engine.js` (engine wrapper; will continue to wrap MOSS-Nano specifically — Pocket TTS gets its own engine wrapper for symmetry)
- `scripts/tts_eval_runner.mjs` lines 79–280 (gate functions to parameterize)
- `scripts/moss_nano_live_capture.mjs` (producer to rename and parameterize)
- `scripts/moss_nano_app_sidecar.py` (Python sidecar reference; do not modify)
- `src/hooks/narration/mossNanoStrategy.ts` (strategy reference; do not modify)
- `main/ipc/tts.js` lines 112–150 (IPC registration pattern)
- `preload.js` lines 174–177 (preload bridge pattern)
- `tests/mossNanoStrategy.test.ts` (test pattern reference)
- `tests/ttsEvalMatrixRunner.test.ts` (gate test pattern reference)
- `docs/testing/MOSS_NANO_LIVE_EVIDENCE_SCHEMA.md` (schema docs to generalize)

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — this section + 13a/13B/13c/13d closeout notes
4. 2026-05-04 user direction — "Let's see MOSS-Nano through, then also add Pocket TTS, so we'll have Kokoro, MOSS, and Pocket at the first finishline."
5. `docs/audit/2026-05-02-moss-nano-productization-third-party-audit/Response/moss-nano-13-third-party-audit-review.md` §10 (audit prescriptions still apply to Pocket TTS implementation)
6. `main/moss-nano-sidecar.js` (full file — pattern to mirror)
7. `main/moss-nano-engine.js` (full file)
8. `main/ipc/tts.js` (existing IPC registration)
9. `scripts/moss_nano_app_sidecar.py` (Python sidecar pattern)
10. `scripts/tts_eval_runner.mjs` (gate code, lines 1–300)
11. `scripts/moss_nano_live_capture.mjs` (producer)
12. `src/hooks/narration/mossNanoStrategy.ts` (strategy pattern)
13. Pocket TTS upstream README at `github.com/kyutai-labs/pocket-tts`

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Athena (electron-scope) | **Pocket TTS Python sidecar.** New `scripts/pocket_tts_sidecar.py` mirroring `scripts/moss_nano_app_sidecar.py`. Loads Pocket TTS via the upstream `pocket_tts` Python package. Long-lived stdin/stdout loop. Same JSON-line protocol as MOSS-Nano (6-method shape: `start/status/request/cancel/shutdown/restart`). Returns segment-following timing by default. Voice-prompt scaffolding present at the protocol level (accepts a 5-second reference WAV) but UX-disabled in v2.0. | `scripts/pocket_tts_sidecar.py` (new) |
| 2 | Athena (electron-scope) | **Pocket TTS adapter + engine wrapper.** New `main/pocket-tts-sidecar.js` (mirrors `main/moss-nano-sidecar.js`) and `main/pocket-tts-engine.js` (mirrors `main/moss-nano-engine.js`). 6-method adapter shape; PID tracking; SIGKILL fallback on shutdown timeout; lifecycle generation per engine. Bake in 13B hardening from the start: enforce `synthesizeTimeoutMs` and `commandTimeoutMs` via `Promise.race`. | `main/pocket-tts-sidecar.js` (new), `main/pocket-tts-engine.js` (new) |
| 3 | Hephaestus (electron-scope) | **IPC + preload wiring.** New `tts-pocket-status`, `tts-pocket-synthesize`, `tts-pocket-cancel`, `tts-pocket-shutdown`, `tts-pocket-restart` IPC channels in `main/ipc/tts.js`. Preload bridge: `electronAPI.pocketStatus()`, `pocketSynthesize()`, `pocketCancel()`, `pocketShutdown()`, `pocketRestart()`. Type definitions in `src/types.ts` to mirror Nano-side types. | `main/ipc/tts.js`, `preload.js`, `src/types.ts` |
| 4 | Hephaestus (renderer-scope) | **Pocket TTS strategy.** New `src/hooks/narration/pocketTtsStrategy.ts` mirroring `mossNanoStrategy.ts`. Bake in 13B invariants from construction: `setContinuityScope` increments `generationId` AND `prefetchGenerationId`; cache key composition includes `String(text.length)` separately from `hashText(text)`. Voice-cloning extension hook present internally but not exposed as a public method in v2.0 (UX deferred to v2.1). | `src/hooks/narration/pocketTtsStrategy.ts` (new) |
| 5 | Hephaestus (renderer-scope) | **Wire strategy through useNarration + settings.** Mirror MOSS-Nano integration in `src/hooks/useNarration.ts` to support `engine: "pocket-tts"` selection. Add Pocket TTS as a third engine option in settings (`src/components/settings/TTSSettings.tsx`), readiness-gated, presented as "available opt-in" (vs MOSS-Nano's "recommended opt-in" framing per 13e). Default unchanged. Explicit-only fallback semantics identical to MOSS-Nano. | `src/hooks/useNarration.ts`, `src/components/settings/TTSSettings.tsx`, `src/components/settings/ttsPreview.ts` |
| 6 | Hippocrates | **Tests.** (a) Pocket TTS adapter contract tests (mirror `tests/mossNanoSidecar.test.js`). (b) Pocket TTS engine lifecycle tests (mirror `tests/mossNanoEngine.test.js`). (c) Pocket TTS strategy cache/prefetch/scope-change tests (mirror `tests/mossNanoStrategy.test.ts`). (d) Settings UX tests for Pocket TTS engine selection + readiness gating. (e) MOSS-Nano evidence/gate tests remain unchanged and pass — POCKET-TTS-1 does not touch the productization gate. ≥30 new tests across all files. | `tests/pocketTtsSidecar.test.js` (new), `tests/pocketTtsEngine.test.js` (new), `tests/pocketTtsStrategy.test.ts` (new), `tests/ttsSettingsPocketTts.test.tsx` (new) |
| 7 | Hippocrates | **`npm test` + `npm run build`** | — |
| 8 | Solon | **Spec compliance** | — |
| 9 | Plato | **Quality + known-trap review.** Promise leak audit on Pocket TTS adapter. Cross-engine stale-output protection (an in-flight Pocket TTS request whose engine is changed mid-flight should not be scheduled). Verify the MOSS-Nano evidence schema and gate are NOT touched by this sprint. | — |
| 10 | Herodotus | **Documentation pass.** TECHNICAL_REFERENCE.md (new section: "Pocket TTS Engine Integration"), CLAUDE.md (engine landscape: three engines available), LESSONS_LEARNED.md (any new lessons from a second-engine integration), ROADMAP.md, SPRINT_QUEUE.md, MOSS_DECISION_LOG.md (cross-reference Pocket TTS as a separate available engine, not a MOSS comparative candidate). | All 6 governing docs |
| 11 | Hermes | **Git: auto-merge on successful sprint** — branch `sprint/pocket-tts-1-engine-integration`, stage specific files, commit, merge to `main` with `--no-ff`, push. | — |

> **Wave split note:** This sprint has 5 implementation tasks (1–5). **Pre-split into TWO waves at dispatch time per Standing Rule 10:** Wave A = tasks 1, 2, 3, 4, 5 (Pocket TTS implementation across Python, main, IPC, renderer, settings) + 6 (tests) + 7 (`npm test`/`build`). Wave B = tasks 8 (Solon) + 9 (Plato) + 10 (Herodotus) + 11 (Hermes).

#### SUCCESS CRITERIA

1. Pocket TTS Python sidecar functional: `scripts/pocket_tts_sidecar.py` loads Pocket TTS, processes synthesize requests, returns valid PCM via the JSON-line protocol.
2. Pocket TTS adapter + engine functional: `main/pocket-tts-sidecar.js` + `main/pocket-tts-engine.js` mirror the MOSS-Nano structure; `electronAPI.pocketSynthesize()` from the integrated app produces real PCM.
3. Pocket TTS strategy bakes in 13B hardening: timeout enforcement, generationId-on-scope-change, length-fingerprinted cache key — all from construction, not retrofit.
4. Pocket TTS selectable in settings as third engine option (readiness-gated, "available opt-in" framing); default remains Kokoro; MOSS-Nano remains "recommended opt-in" per 13e; Qwen remains disabled.
5. Voice-cloning capability is integrated at the Python sidecar layer but not exposed in v2.0 settings UX (defer surface to v2.1).
6. MOSS-Nano evidence schema, gate evaluator, and live-capture producer are NOT modified by this sprint. The 13d gate result remains the canonical MOSS-Nano evidence.
7. ≥30 new tests; full `npm test` passes (target: 2,540+ tests).
8. `npm run build` succeeds; circular chunk warning unchanged.

**Tier:** Full | **Depends on:** MOSS-NANO-13a, 13B, 13c, 13d, **and 13e** (sequenced AFTER 13e per the 2026-05-04 user direction). MOSS-Nano product decision must close before Pocket TTS integration begins.

**Effort:** L (~6). Real systems work. Smaller than the original comparative-pivot scope (which was ~8 LOE) because schema/gate generalization and comparative live capture have been dropped. Could expand to L+ if Pocket TTS upstream integration surfaces unexpected runtime issues on Windows.

**Roster:** CLI/Zeus orchestration → Athena (Python + main-process foundations, tasks 1–2) → Hephaestus (IPC + renderer + settings, tasks 3–5) → Hippocrates + Solon + Plato + Herodotus + Hermes (verify + docs + git).

**Source:** 2026-05-04 user direction ("Let's see MOSS-Nano through, then also add Pocket TTS, so we'll have Kokoro, MOSS, and Pocket at the first finishline"). 2026 CPU-TTS landscape research (uploaded PDF). The earlier soft-pivot idea survives in spirit but with a lighter scope — Pocket TTS ships as a third available engine, not as a comparative-gate candidate.

---

### Sprint MOSS-NANO-13e: Recommended Opt-In Product Decision Closeout (COMPLETED 2026-05-04 — Stage 3 close, post-13d)

**Goal:** Record Nano as the Desktop v2.0 recommended opt-in engine, not the default engine, using the already-produced MOSS-NANO-13d canonical live-evidence artifact and gate decision `NANO_RECOMMENDED_OPT_IN`. Keep Kokoro available, keep Qwen disabled, and do not open a Kokoro retirement lane.

**Why:** 13d answered the "can it work?" question with real app-selected Nano evidence across Page, Focus, Flow, and Narrate. 13e is now product language, opt-in UX, and release-polish closeout: make the recommendation understandable and bounded without rerunning live capture or exploring other models/runtimes.

**Prerequisites:** MOSS-NANO-13a, 13B, 13c, and 13d. The canonical 13d evidence is `artifacts/tts-eval/moss-nano-13d-live-capture/moss-nano-13d-live-evidence.json`; the final gate output is under `artifacts/tts-eval/moss-nano-13d-live-capture/gate/`.

**Done when:**

1. `docs/testing/MOSS_DECISION_LOG.md` records Nano as `NANO_RECOMMENDED_OPT_IN` and explicitly states: not default, Kokoro remains available, no Kokoro retirement lane, Qwen remains disabled.
2. Settings/runtime docs and any settings copy describe Nano as a recommended opt-in local engine, including the local sidecar requirement, segment-following progress truth (`wordTimestamps: null`), and explicit-only fallback policy.
3. A final productization memo is produced from the 13d artifact and gate output. The memo names the evidence path, trace counts, gate result, recommendation, non-goals, fallback policy, and release posture.
4. No new live capture, model comparison, runtime exploration, Pocket TTS work, Qwen reactivation, default-engine change, or Kokoro retirement work is introduced.

**Effort:** M (~3). Product decision writing, settings/runtime copy alignment, and release memo only. Any code/UI copy changes must stay inside the existing Nano opt-in surface and must not alter engine defaults.

**Roster:** Cowork (decision memo + governance updates) + CLI/Zeus (settings/runtime copy if needed) + Herodotus (docs closeout) + Solon (scope compliance).

**Source:** MOSS-NANO-13d canonical evidence artifact and gate output; audit response §11 productization decision requirement.

**Closeout:** Decision recorded as `NANO_RECOMMENDED_OPT_IN` in `docs/testing/MOSS_DECISION_LOG.md` and the final memo `docs/testing/moss-nano-13e-productization-memo.md`. The decision uses only the existing 13d artifact `artifacts/tts-eval/moss-nano-13d-live-capture/moss-nano-13d-live-evidence.json` and gate output under `artifacts/tts-eval/moss-nano-13d-live-capture/gate/`. Trace counts remain Page 42, Focus 44, Flow 43, Narrate 39; final gate remains PASS with hard failures 0/7 and warnings 0/3. Product posture: Nano recommended opt-in, Kokoro default and available, Qwen disabled, no Kokoro retirement lane, no live-capture rerun, no Pocket TTS work.

---

### Sprint POLISH-1: Desktop v2 Polish Bundle ✅ COMPLETED 2026-05-04 — RELEASE-1 unblocked

**Closeout:** Desktop v2 polish is complete across the settings surfaces touched by the E-Ink, Reading Goals, MOSS-Nano, and Pocket TTS lanes. TTS settings now present the release posture consistently: Kokoro is kept as the default and operational floor, MOSS-Nano is recommended opt-in, Pocket TTS is available opt-in with upstream synthesis still scaffolded until separately approved adapter work, and Qwen is retired for Desktop v2 and remains disabled. E-Ink switches are keyboard-operable with explicit switch labels, Reading Goals empty/action states are clearer, and the engine selector exposes pressed-state metadata for keyboard/screen-reader users.

**Non-goals held:** No MOSS-Nano reopening, no real Pocket synthesis adapter, no Qwen reactivation, no Kokoro demotion/removal, no new model/runtime exploration, and no new product lanes.

**Verification:** Focused settings polish regression suite passed: `tests/qwenStatusUi.test.tsx`, `tests/ttsSettingsKokoroTruth.test.tsx`, `tests/ttsSettingsMossNano.test.tsx`, `tests/ttsSettingsPocketTts.test.tsx`, `tests/ttsSettingsQwenPrototype.test.tsx`, `tests/qwenDefaultSettings.test.ts`, `tests/ReadingGoalsSettings.test.tsx`, `tests/ThemeSettings.test.tsx`, and `tests/themeRefresh.test.ts` — 9 files / 36 tests. Full `npm test` passed 170 files / 2550 tests. `npm run build` passed with the existing `settings -> tts -> settings` circular chunk warning. `git diff --check` passed. `npm audit --audit-level=high` passed with 3 moderate `uuid` findings and no high-severity findings.

**Decision:** POLISH-1 unblocked RELEASE-1, RELEASE-1 recorded Desktop v2 release closeout, and POSTV2 audit remediation is implemented as the current post-release stabilization candidate. Next sprint is POSTV2-REVIEW-1 for review, commit, and merge; not additional TTS exploration.
