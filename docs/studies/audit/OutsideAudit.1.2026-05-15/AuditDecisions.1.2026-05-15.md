# Audit Decisions — OutsideAudit.1 (2026-05-15)

**Audit:** OutsideAudit.1.2026-05-15
**Date:** 2026-05-15
**Status:** CLOSED — all decisions final

---

## Summary

The audit loop is closed. The auditor's D4 review largely validates our remediation dispositions with three substantive pushbacks, all of which are addressed below. The conveyor remains 8 sprints in the same order. Net changes: spec language tightened in 4 sprints, one Phase 0 gate elevated to hard stop with segment identity scoping, TTS-EVENT-SYNC-1 effort increased from M to M-L, and one new LL entry.

---

## Final Disposition Matrix

| Finding | D3 Disposition | Auditor D4 Pushback | Final Decision |
|---------|---------------|---------------------|----------------|
| F1 — ROADMAP.md truncation | Accept with narrowing (packaging artifact) | Auditor agrees it's packaging, still flags governance risk | **Accept with narrowing.** Packaging lesson documented. No roadmap change. |
| F2 — Current-state overstatement | Accept (reframe dormancy language) | Auditor agrees; catches that our D3 slightly mischaracterizes CLAUDE.md — CLAUDE.md already says "runtime playback behavior is unchanged" | **Accept.** Reframe ENGINE-DORMANCY-1 Why paragraph. CLAUDE.md fix narrowed — update only the "Engine posture" line, not the broader narrative which is already accurate. |
| F3 — Missing segment identity | Accept with narrowing (fold into Phase 0 gate) | Auditor prefers dedicated sprint (TTS-SEGMENT-ALIGN-1); accepts Phase 0 gate as viable but weaker option with effort increase to L | **Accept with narrowing — Phase 0 hard gate with effort increase.** TTS-EVENT-SYNC-1 effort increases from M (~3-4) to M-L (~4-5). Phase 0 gate is a hard stop: either define the type in-sprint or produce a documented deferral decision. This is the correct tradeoff — a 9th sprint disrupts a stable conveyor for work that may not be needed if the Phase 0 assessment shows chunkId suffices. |
| F4 — TTS-CACHE-HARDEN-1 scope drift | Accept with narrowing (PM2 mapping note) | Auditor agrees; adds documentLocator enrichment as specific recommendation | **Accept.** Add PM2 mapping note to criterion 3. Add documentLocator enrichment as opportunistic criterion 10. |
| F5 — "Replace RAF" wording | Accept (narrow language) | Auditor agrees fully | **Accept.** Rewrite opening What paragraph. |
| F6 — TTS-PIPELINE-1 too late | Accept with narrowing (front-load into existing gates) | Auditor agrees existing gates cover it; wants cache parity tests mandatory not advisory | **Accept with narrowing.** Existing gates are hard gates. |
| F7 — Alignment model gap | Accept with narrowing (subsumed by F3/F5) | Auditor agrees; folded into segment/alignment analysis | **Accept with narrowing.** Covered by F3 Phase 0 gate. |
| F8 — Registry not dispatch | Defer (deliberate dissolution) | No pushback | **Defer.** Registry dispatch reactivates only with a second engine. |

### Additional D4 Findings (not in original F1-F8)

| D4 Finding | Decision |
|-----------|----------|
| ENGINE-DORMANCY-1 criterion 1 uses `posture` language that doesn't match actual schema fields (`selectable`, `disabledReason`, `statusKind`) | **Accept.** Criterion 1 will reference actual fields. The current "posture: 'dormant'" language is conceptually correct but imprecise against the type model. |
| D3 slightly mischaracterizes CLAUDE.md re: dormancy language | **Accept.** Corrected in this document — CLAUDE.md's narrative is already accurate; only the "Engine posture" summary line needs updating. |
| TTS-INTEGRATE-1 branch contents not independently verifiable from audit package | **Convert to documentation-only correction.** Add note to TTS-INTEGRATE-1 that verification is branch-closeout dependent. No spec change. |
| Auditor prefers TTS-PIPELINE-1 at effort M (up from S) | **Accept.** TTS-PIPELINE-1 effort revised from S to M. |

---

## Changes Applied to Roadmap

### 1. ENGINE-DORMANCY-1 — Why paragraph reframed + criterion 1 precision

**Why paragraph** revised to explicitly state engines are currently live and selectable (not already dormant).

**Criterion 1** revised from `posture: 'dormant'` language to: "MOSS-Nano and Pocket TTS registry entries have `selectable: false`, `disabledReason` set to a dormancy explanation, and `statusKind` reflecting unavailable state — matching the Qwen disable pattern."

### 2. TTS-CACHE-HARDEN-1 — PM2 note + documentLocator + criterion 10

**Criterion 3** appended with PM2 mapping note.

**New opportunistic criterion 10:** documentLocator enrichment (populate `sectionId` in `kokoroStrategy.ts`).

### 3. TTS-EVENT-SYNC-1 — What narrowed + Phase 0 hard gate + effort increase

**What** rewritten to "Promote... demoting... RAF retained."

**Phase 0 gate item 5** added: Segment identity scoping (hard stop).

**Effort** increased from M (~3-4) to M-L (~4-5).

### 4. TTS-PIPELINE-1 — effort increase + queue pointer

**Effort** increased from S (~1) to M (~2-3).

**SPRINT_QUEUE.md pointer** updated to mention NarrationSegment domain type assessment.

### 5. CLAUDE.md — Engine posture line

**Only the "Engine posture" summary line** updated to present-tense accuracy. The broader CLAUDE.md narrative already correctly describes ENGINE-DORMANCY-1 as pending.

---

## Deferred Items

| Item | Placement | Condition for Reactivation |
|------|-----------|---------------------------|
| Registry-driven runtime dispatch | Post-TTS Architecture Complete | Second engine promoted from dormancy |
| Dedicated TTS-SEGMENT-ALIGN-1 sprint | If TTS-EVENT-SYNC-1 Phase 0 determines chunkId is insufficient | Phase 0 hard gate produces "yes, need standalone sprint" decision — would insert before NORMALIZER-ENRICH-1 |
| Full NarrationSegment domain type extraction | TTS-PIPELINE-1 criterion 9 assessment | Assessment determines consolidation is clean and doesn't cascade |

---

## New Lessons Learned Entry

**LL-NEW: Audit packaging must include complete canonical files.**

When assembling audit packages, verify that every file claimed as "full spec" in the orientation document is actually complete in the delivered zip. ROADMAP.md at 60KB exceeded the auditor's ingestion limit and was truncated mid-sprint, forcing the auditor to reconstruct later specs from secondary documents. For files >50KB: either split across batches with continuation markers, or use the GitHub repo / single-directory ingestion path. This is a governance discipline issue, not a technical one.

---

## Audit History Update

| # | Date | Scope | Auditor | Verdict | Key Outcome |
|---|------|-------|---------|---------|-------------|
| 1 | 2026-05-15 | Full TTS Architecture roadmap | 3rd-party (deep research) | Conditional approval (5/10) | Spec language tightened in 4 sprints; segment identity Phase 0 hard gate added; effort increased on 2 sprints; no new sprints added; governance framing corrected |
