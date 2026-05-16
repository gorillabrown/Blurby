# Roadmap Review — Phase B Assessment (2026-05-02)

## % Work Remaining

### Completed Work (LOE units, t-shirt: S=1, M=3, L=8, XL=20)

| Category | Sprint Count | Avg LOE | Total LOE |
|----------|-------------|---------|-----------|
| TTS stabilization (TTS-6/7 series, 20+ sprints) | 22 | S-M (~2) | ~44 |
| Hotfixes (HOTFIX-11 through 15) | 5 | S (~1) | ~5 |
| Infrastructure (PERF-1, REFACTOR-1A/1B, TEST-COV-1) | 4 | M (~3) | ~12 |
| Narration layer (NARR-LAYER-1A/1B, NARR-CURSOR-1, NARR-TIMING) | 4 | M (~3) | ~12 |
| TTS eval harness (TTS-EVAL-1/2/3, TTS-HARDEN-1/2, TTS-RATE-1/2, TTS-CONT-1, TTS-START-1, EPUB-TOKEN-1) | 10 | M (~3) | ~30 |
| Flow Infinite Reader (FLOW-INF-A/B/C) | 3 | M (~3) | ~9 |
| Extension enrichment (EXT-ENR-A/B, EXT-5C) | 3 | M (~3) | ~9 |
| Reader four-mode (READER-4M-1/2/3) | 3 | L (~8) | ~24 |
| Qwen prototype + streaming (QWEN-PROT-1/2, QWEN-STREAM-1/2/3/4) | 6 | M-L (~5) | ~30 |
| MOSS exploration (MOSS-0 through MOSS-NANO-12, 27 sprints) | 27 | S (~1) | ~27 |
| Selection + Startup (SELECTION-1, STAB-1A) | 2 | M (~3) | ~6 |
| Earlier phases (2-5, completed pre-window) | ~15 | M (~3) | ~45 |
| **Completed total** | **~104** | | **~253** |

### Remaining Work (active + parked + future)

| Sprint/Track | LOE | Status |
|-------------|-----|--------|
| EXT-ENR-C (In-Browser Reader) | M (3) | Optional/future |
| APK-0 (Modularization) | L (8) | Blocked on investigation gate |
| APK-1 (WebView Shell) | L (8) | Blocked on APK-0 |
| APK-2 (All Reading Modes) | L (8) | Blocked on APK-1 |
| APK-3 (Bidirectional Sync) | L (8) | Blocked on APK-2 |
| APK-4 (Mobile-Native) | M (3) | Blocked on APK-3 |
| EINK-6A (E-Ink Foundation) | M (3) | Parked |
| EINK-6B (E-Ink Ergonomics) | M (3) | Parked |
| GOALS-6B (Reading Goals) | M (3) | Parked |
| MOSS-NANO-13 (rescoped — provenance gate) | M (3) | Blocked on audit rescoping |
| KOKORO-RETIRE-1/2 | M (3) each = 6 | Paused pending MOSS live proof |
| Phase 7 (Cloud Sync) | XL (20) | Not yet spec'd |
| Phase 8 (RSS/News) | L (8) | Not yet spec'd |
| **Remaining total** | | **~84** |

### Summary

- **Total LOE (completed + remaining):** ~337
- **Remaining LOE:** ~84
- **% Work Remaining:** ~25%

**Caveat:** Phase 7 and Phase 8 are rough estimates. The APK track has not cleared its investigation gate, so effort may shift significantly. The MOSS-NANO track adds conditional work that only fires if Nano proves viable in live testing.

---

## Pace (Last 4 Weeks: Apr 2 – May 2)

### Sprint Completion by Week

| Week | Dates | Sprints Landed | LOE Landed | Notes |
|------|-------|---------------|------------|-------|
| W1 | Apr 2–8 | 13 | ~32 | SELECTION-1, HOTFIX-14, NARR-CURSOR-1, HOTFIX-15, STAB-1A, PERF-1, REFACTOR-1A/1B, FLOW-INF-A/B/C, EXT-ENR-A/B, NARR-TIMING |
| W2 | Apr 9–15 | 0 | 0 | Gap — planning/design work only (NARR-CURSOR-1 spec, four-mode design) |
| W3 | Apr 16–20 | 21 | ~68 | TEST-COV-1, NARR-LAYER-1A/1B, TTS-EVAL-1/2/3, TTS-HARDEN-1/2, TTS-RATE-1/2, EPUB-TOKEN-1, TTS-CONT-1, TTS-START-1, READER-4M-1/2/3, QWEN-PROT-1/2, QWEN-STREAM-1/2/3/4 |
| W4 | Apr 21–May 2 | 27 | ~27 | MOSS-0 through MOSS-NANO-12 (exploration/evidence sprints, mostly S-tier) |
| **Total** | **4 weeks** | **~61** | **~127** |

### Pace Metrics

- **Items/week:** ~15.3
- **LOE/week:** ~31.8
- **Required pace to finish:** 84 LOE remaining ÷ 31.8 LOE/week = **~2.6 weeks** at current velocity (if pace holds and all remaining work is unblocked)

**Important pace qualifiers:**
1. Week 3 was an extraordinary burst (21 sprints in 5 days). This is not sustainable baseline velocity — it reflected a focused push on well-spec'd, sequential TTS/reader/streaming work.
2. Week 4 (MOSS exploration) consisted entirely of lightweight S-tier evidence/governance sprints, inflating the item count but not the LOE.
3. The APK track requires investigation gates that will create natural pauses in execution velocity.
4. **Realistic remaining timeline:** 6–10 weeks accounting for investigation gates, design pauses, and the Phase 7/8 unknowns.

**Verdict:** Ahead of pace on execution, but the remaining work is qualitatively different — more investigation-heavy, more design-dependent, and less sequential than the recent sprint runs.

---

## Scope Discipline

**First review — no baseline.** Scope discipline scoring requires comparison against a previous review's active skeleton set. Since this is the first roadmap review ceremony, no baseline exists.

### Qualitative Assessment

Over the last 4 weeks, work fell into these categories relative to the finish line (Android APK + Cloud Sync + RSS):

| Direction | Sprints | Assessment |
|-----------|---------|------------|
| **Forward** (directly advances finish line) | READER-4M-1/2/3, QWEN-STREAM-1/2/3/4, REFACTOR-1A/1B, PERF-1, TEST-COV-1 | Core infrastructure and reader foundation that APK depends on |
| **Forward-adjacent** (strengthens product quality) | TTS-EVAL/HARDEN/RATE/CONT/START series, NARR-LAYER-1A/1B, NARR-TIMING, SELECTION-1, HOTFIX-14/15, STAB-1A | TTS quality and narration architecture — necessary for product readiness |
| **Sideways** (exploration, not on finish-line path) | MOSS-0 through MOSS-NANO-12 (27 sprints) | Alternative TTS engine investigation. Concluded with NANO_EXPERIMENTAL_ONLY — did not advance the finish line, but provided decision evidence |
| **Backward** (re-opens completed work) | 0 | None detected |

**Observation:** The MOSS exploration lane consumed ~27 sprints (44% of the 4-week sprint count) on work that ultimately concluded "keep Kokoro default, Nano stays experimental." This is a significant investment in a sideways direction. However, the exploration was deliberate, evidence-driven, and produced a clear governance decision. The third-party audit validated that the decision to pause was correct.

**If scored:** Forward (34) / (Forward (34) + Sideways (27) + Backward (0)) = **56%** — below the 80% healthy threshold, above the 50% drifting threshold. The MOSS lane is the sole cause.

---

## Overall Verdict: **AT RISK**

### Reasoning

1. **Execution velocity is strong** — 61 sprints in 4 weeks, no regressions, clean merge history, 2,172 tests passing. The project can execute fast when work is spec'd.

2. **But the queue is RED (depth 1)** — only GOALS-6B is queued, and it's parked. The STOP SIGNAL (Rule 5a) is active. No sprint can be dispatched until ≥3 are queued with full specs.

3. **The MOSS-NANO exploration consumed 44% of recent sprint volume without advancing the finish line.** Both third-party audits confirmed: proceed only with scope changes. The investment produced a governance decision, not product progress.

4. **Remaining work is qualitatively harder** — APK track needs investigation gates (framework POC, coupling audit, mobile TTS feasibility), Phase 7/8 are un-spec'd, and the MOSS-NANO-13 rescope requires a new provenance-backed evidence gate design.

5. **5 completed sprints still have full specs in the active roadmap** (READER-4M-1, QWEN-PROT-1/2, QWEN-STREAM-2/3) — Phase A gap that should be cleaned up.

6. **Uncommitted brand theme work** — 13+ files changed, not tested or committed. Needs resolution.

### Risk Factors

- **Queue starvation:** Cannot dispatch until ≥3 sprints are spec'd. This is the immediate blocker.
- **APK investigation gates:** Unknown duration. Framework POC, coupling audit, and mobile TTS feasibility all unresolved.
- **MOSS-NANO sunk cost pressure:** 27 sprints invested in an exploration that concluded "not ready." Risk of continuing to invest in Nano when the finish line is elsewhere.

### Recommendation

1. **Immediately backfill the sprint queue to ≥3** with the most finish-line-aligned work: likely EINK-6A (parked but spec'd), plus two new sprints from the APK investigation track or a queue of small wins from IDEAS.md themes F/G/I.
2. **Archive the 5 completed-but-not-migrated sprint specs** from the active roadmap.
3. **Commit or stash the brand theme work** — it's sitting uncommitted across 13+ files.
4. **Defer MOSS-NANO-13** until the APK investigation gate is cleared. The Nano track can wait — Kokoro is stable and shipping.
5. **Establish this assessment as the scope discipline baseline** for future reviews.
