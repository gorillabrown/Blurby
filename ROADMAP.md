# Blurby — Development Roadmap

**Last updated**: 2026-05-02 — Roadmap review ceremony complete. Desktop v2.0 finish line established. Queue recovery in progress.
**Current branch**: `main`
**Current state**: v1.75.0 stable. QWEN-STREAM-4 closed with ITERATE. MOSS-NANO-12 closed as NANO_EXPERIMENTAL_ONLY. Both third-party audits recommend "proceed only with scope changes" for MOSS-NANO-13. Qwen remains default engine, Kokoro available/unchanged, Nano experimental-only.
**Governing roadmap**: This file is the single source of truth. Phase overview archived from `docs/project/ROADMAP_V2_ARCHIVED.md`.
**Finish line**: Desktop v2.0 Shipping — Blurby desktop feature-complete and polished (E-Ink independence, reading goals, brand finalized, UX polish pass). Android, Cloud Sync, RSS/News, and MOSS-NANO are deferred lanes beyond this finish line. No new exploratory TTS/model or non-desktop expansion work until this conveyor is green or explicitly paused.
**Roadmap review**: 2026-05-02. Verdict: AT RISK (strong velocity, 44% sideways scope from MOSS). Queue now GREEN depth 3. Assessment: `docs/project/roadmap-reviews/2026-05-02-assessment.md`. Plan: `docs/project/roadmap-reviews/2026-05-02-plan.md`.

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
  ├── EINK-6A: E-Ink Foundation (next up)
  ├── EINK-6B: E-Ink Reading Ergonomics (queued)
  └── GOALS-6B: Reading Goal Tracking (queued, parallel-safe with 6B)
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
      ├── Qwen: default engine. Streaming lane on ITERATE (QWEN-STREAM-4).
      └── Kokoro: available as legacy fallback. Retirement sprints paused — no successor has proven continuous live playback.
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
      ├── Kokoro: available as legacy fallback. Retirement paused — no successor has proven continuous live playback.
      └── Nano: experimental-only. Deferred pending provenance-backed product gate. Qwen is default; Kokoro is legacy fallback.
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
| **K: E-Ink** | Display mode decoupling, e-ink reading ergonomics | Active (EINK-6A/6B in Desktop v2.0 conveyor) |

---

## Desktop v2.0 — Active Conveyor Belt

> **Finish line:** Desktop v2.0 Shipping. Six sprints, ~14 LOE, estimated 3-4 weeks.
> **Conveyor sequence:** ~~SK-HYG-1~~ ✅ → ~~BRAND-HYG-1~~ SHELVED / no-op in this checkout → **EINK-6A** → EINK-6B → GOALS-6B (parallel-safe with 6B) → POLISH-1 → RELEASE-1.
> **Queue rule:** No new exploratory TTS/model or non-desktop expansion work until this conveyor is green or explicitly paused.

### Standing Rules All Skeletons Inherit

1. **PR-2 / PR-3:** After any code change run `npm test`; after any UI/dependency change run `npm run build`.
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

> EINK-6A, EINK-6B, and GOALS-6B are fully spec'd and now part of the Desktop v2.0 active conveyor. Dispatch order: EINK-6A → EINK-6B → GOALS-6B (parallel-safe with EINK-6B).

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

**Current governance decision:** The completed parts of this program remain valid (`QWEN-DEFAULT-1`, `QWEN-HARDEN-1`, and `QWEN-PROVISION-1`), but the retirement half is paused. Qwen is the default engine; Kokoro is available as a legacy fallback. `QWEN-STREAM-4` closed with ITERATE rather than PROMOTE — streaming iteration deferred to post-Desktop v2.0. MOSS/Nano is experimental-only (both third-party audits: "proceed only with scope changes") and deferred pending a provenance-backed product gate. There is no active MOSS successor lane during Desktop v2.0. `KOKORO-RETIRE-1` and `KOKORO-RETIRE-2` should not be dispatched until a successor proves continuous live playback and a separate Kokoro-retirement lane is explicitly approved.

---

### Sprint EINK-6A: E-Ink Foundation & Greyscale Runtime

**Goal:** Decouple e-ink display behavior from the theme system so users can pair e-ink optimizations (no animations, large targets, refresh timing) with any color theme. Currently, e-ink is a theme — selecting it forces greyscale colors. After this sprint, e-ink is an independent display mode toggle that layers on top of any theme.

**Problem:** E-ink support exists as a `[data-theme="eink"]` CSS block (200+ lines in global.css) with dedicated settings (`einkWpmCeiling`, `einkRefreshInterval`, `einkPhraseGrouping`). But it's coupled to the theme selector in ThemeSettings.tsx — you can't use dark theme with e-ink optimizations, or light theme with e-ink refresh overlay. This forces users with e-ink devices to accept the greyscale palette even when their device supports limited color (Kaleido e-ink screens). It also means non-e-ink users can't benefit from e-ink ergonomic features (reduced animation, larger targets) without losing their preferred theme.

**Design decisions:**
- **New `einkMode: boolean` setting.** Independent of `theme`. When true, applies e-ink behavioral CSS overrides (no transitions, larger targets, no hover) on top of the active theme. The existing `[data-theme="eink"]` color palette becomes an optional "E-Ink Greyscale" theme choice that users can select or skip.
- **Refactor CSS into two layers.** Split the current `[data-theme="eink"]` block into: (a) `[data-eink="true"]` — behavioral overrides (transition:none, no hover, larger targets), applied when einkMode is on regardless of theme, and (b) `[data-theme="eink"]` — color palette only (pure black/white/grey), optional theme choice. This is a CSS-only refactor with no JS behavior changes.
- **ThemeSettings restructure.** Move e-ink from theme grid to a separate toggle section: "E-Ink Display Mode" toggle above the theme selector. When on, show the existing e-ink sub-settings (WPM ceiling, refresh interval, phrase grouping). Theme selector remains independent below.
- **EinkRefreshOverlay remains as-is.** The existing `useEinkController` hook and `EinkRefreshOverlay` component work correctly — they just need to check `einkMode` instead of `theme === 'eink'`.

**Baseline:**
- `src/types.ts` — settings schema: `einkWpmCeiling`, `einkRefreshInterval`, `einkPhraseGrouping` (lines 136–139). No `einkMode` field yet.
- `src/components/settings/ThemeSettings.tsx` (150 lines) — e-ink as theme option (line 30), e-ink sub-settings panel (lines 100–147)
- `src/styles/global.css` — `[data-theme="eink"]` block (~200 lines, starts ~line 1543)
- `src/hooks/useEinkController.ts` (47 lines) — page-turn counter, refresh overlay trigger
- `src/components/EinkRefreshOverlay.tsx` (24 lines) — black/white flash overlay
- `src/components/ReaderContainer.tsx` — e-ink integration: WPM cap (line 144), eink controller (line 92), overlay render
- `src/constants.ts` — `DEFAULT_EINK_WPM_CEILING`, `DEFAULT_EINK_REFRESH_INTERVAL`, `EINK_REFRESH_FLASH_MS`, etc.

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — this section
4. `src/types.ts` — settings schema, eink fields
5. `src/components/settings/ThemeSettings.tsx` — current e-ink theme coupling
6. `src/styles/global.css` — `[data-theme="eink"]` block (find boundaries)
7. `src/hooks/useEinkController.ts` — refresh controller logic
8. `src/components/EinkRefreshOverlay.tsx` — overlay component
9. `src/components/ReaderContainer.tsx` — e-ink integration points
10. `src/constants.ts` — e-ink constants

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Hephaestus (renderer-scope) | **Add `einkMode` setting** — Add `einkMode: boolean` (default false) to settings schema in types.ts. Add default to constants.ts. Wire through SettingsContext. | `src/types.ts`, `src/constants.ts`, `src/contexts/SettingsContext.tsx` |
| 2 | Hephaestus (renderer-scope) | **Split CSS into behavioral and color layers** — Extract all non-color properties from `[data-theme="eink"]` into new `[data-eink="true"]` selector. Leave only color properties (`--bg`, `--fg`, `--accent`, etc.) in `[data-theme="eink"]`. Verify no visual regression when both are applied simultaneously. | `src/styles/global.css` |
| 3 | Hephaestus (renderer-scope) | **Apply `data-eink` attribute** — In the root element (App.tsx or equivalent), set `data-eink="true"` when `settings.einkMode === true`, independent of `data-theme`. | `src/App.tsx` or equivalent root |
| 4 | Hephaestus (renderer-scope) | **Restructure ThemeSettings** — Move e-ink out of theme grid. Add "E-Ink Display Mode" toggle above themes. When toggled on, show WPM ceiling / refresh interval / phrase grouping sliders. Theme grid remains below, all themes selectable regardless of einkMode. | `src/components/settings/ThemeSettings.tsx` |
| 5 | Hephaestus (renderer-scope) | **Update eink controller** — Change `useEinkController.ts` to check `settings.einkMode` instead of `theme === 'eink'`. Update ReaderContainer.tsx integration points (WPM cap, overlay render) to use `einkMode`. | `src/hooks/useEinkController.ts`, `src/components/ReaderContainer.tsx` |
| 6 | Hippocrates | **Tests** — (a) `einkMode` toggle applies `data-eink` attribute. (b) `data-eink="true"` + `data-theme="dark"` doesn't conflict. (c) E-ink behavioral CSS (transition:none) applies independently of theme. (d) WPM cap respects `einkMode`, not theme. (e) Refresh overlay fires when `einkMode` is on regardless of theme. ≥8 new tests. | `tests/` |
| 7 | Hippocrates | **`npm test` + `npm run build`** | — |
| 8 | Solon | **Spec compliance** | — |
| 9 | Herodotus | **Documentation pass** | All 6 governing docs |
| 10 | Hermes | **Git: auto-merge on successful sprint** — stage specific files, commit on the sprint branch, merge to `main` with `--no-ff`, and push unless the sprint is explicitly marked no-merge. | — |

#### SUCCESS CRITERIA

1. `einkMode` setting exists, persists, and toggles independently of theme
2. `data-eink="true"` attribute applied to root when einkMode is on
3. E-ink behavioral CSS (no transitions, larger targets, no hover) applies on any theme when einkMode is on
4. E-ink greyscale color palette applies only when `data-theme="eink"` is selected
5. WPM ceiling enforced by einkMode, not by theme
6. Refresh overlay fires based on einkMode, not theme
7. ThemeSettings shows independent einkMode toggle with sub-settings
8. ≥8 new tests
9. `npm test` passes
10. `npm run build` succeeds

**Tier:** Full | **Depends on:** TTS-7D (TTS stabilization complete)

---

### Sprint EINK-6B: E-Ink Reading Ergonomics & Mode Strategy

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

### Sprint GOALS-6B: Reading Goal Tracking

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
